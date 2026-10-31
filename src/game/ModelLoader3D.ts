import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Unit } from '../types/game';

// Singleton loader instance
const gltfLoader = new GLTFLoader();

// In-memory cache for parsed GLTF root groups
const modelCache = new Map<string, THREE.Group>();
const pendingLoads = new Map<string, Promise<THREE.Group | null>>();
const missingModels = new Set<string>();

/**
 * Whitelist of unit models currently present in /public/models.
 * Checking this upfront prevents spurious 404 network requests in the browser console.
 */
export const AVAILABLE_GLB_MODELS = new Set<string>([
  'archer',
  'cleric',
  'goblin',
  'mage',
  'warrior',
]);

/**
 * Deep clones a model hierarchy and duplicates its materials so
 * transparency / status effect shaders do not bleed across different units.
 */
function deepCloneModel(source: THREE.Group): THREE.Group {
  const cloned = source.clone(true);
  cloned.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (Array.isArray(child.material)) {
        child.material = child.material.map((m) => m.clone());
      } else if (child.material) {
        child.material = child.material.clone();
      }
    }
  });
  return cloned;
}

/**
 * Normalizes model bounds to fit properly on the miniature pedestal.
 */
function normalizeModel(modelGroup: THREE.Group, targetHeight = 0.72): THREE.Group {
  // Ensure matrices are up to date
  modelGroup.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(modelGroup);
  const size = new THREE.Vector3();
  box.getSize(size);

  const center = new THREE.Vector3();
  box.getCenter(center);

  // Scale model so height matches target tabletop miniature scale
  const currentHeight = size.y > 0.001 ? size.y : 1;
  const scale = targetHeight / currentHeight;
  modelGroup.scale.setScalar(scale);

  // Re-compute bounding box after scale to anchor feet right on top of pedestal (y = 0.075)
  modelGroup.updateMatrixWorld(true);
  const scaledBox = new THREE.Box3().setFromObject(modelGroup);

  modelGroup.position.x = -center.x * scale;
  modelGroup.position.z = -center.z * scale;
  modelGroup.position.y = 0.075 - scaledBox.min.y;

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return modelGroup;
}

/**
 * Asynchronously loads a .glb model for a given avatar key from /models/{avatarKey}.glb.
 * Returns null if the file does not exist, enabling seamless procedural fallback.
 */
export async function loadUnitModel(avatarKey: string, isBoss = false): Promise<THREE.Group | null> {
  if (!AVAILABLE_GLB_MODELS.has(avatarKey) || missingModels.has(avatarKey)) {
    return null;
  }

  const cached = modelCache.get(avatarKey);
  if (cached) {
    return deepCloneModel(cached);
  }

  if (pendingLoads.has(avatarKey)) {
    const loaded = await pendingLoads.get(avatarKey)!;
    return loaded ? deepCloneModel(loaded) : null;
  }

  const targetHeight = isBoss ? 1.55 : avatarKey === 'goblin' ? 0.85 : 1.05;
  const modelUrl = `/models/${avatarKey}.glb?v=6`;

  const loadPromise = new Promise<THREE.Group | null>((resolve) => {
    gltfLoader.load(
      modelUrl,
      (gltf) => {
        const root = gltf.scene || gltf.scenes[0];
        if (!root) {
          missingModels.add(avatarKey);
          resolve(null);
          return;
        }

        const normalized = normalizeModel(root, targetHeight);
        modelCache.set(avatarKey, normalized);
        resolve(normalized);
      },
      undefined,
      () => {
        // Silently mark as missing so procedural fallback is used
        missingModels.add(avatarKey);
        resolve(null);
      }
    );
  });

  pendingLoads.set(avatarKey, loadPromise);
  const result = await loadPromise;
  pendingLoads.delete(avatarKey);

  return result ? deepCloneModel(result) : null;
}

/**
 * Synchronously checks if a model is already in memory cache.
 */
export function getCachedUnitModel(avatarKey: string): THREE.Group | null {
  const cached = modelCache.get(avatarKey);
  return cached ? deepCloneModel(cached) : null;
}

/**
 * Pre-fetches .glb models for a list of units to avoid pop-in on battle start.
 */
export async function preloadUnitModels(units: Unit[]): Promise<void> {
  const keys = Array.from(new Set(units.map((u) => u.avatarKey))).filter((k) => AVAILABLE_GLB_MODELS.has(k));
  await Promise.all(
    keys.map((key) => {
      const isBoss = units.some((u) => u.avatarKey === key && (u.isBoss || u.isMiniBoss));
      return loadUnitModel(key, isBoss);
    })
  );
}

/**
 * Attaches or upgrades a unit figure with its dedicated 3D .glb model.
 * If the model exists, it smoothly replaces the procedural 'miniatureChar' mesh.
 */
export function apply3DModelToMiniature(
  unitFigure: THREE.Group,
  unit: Unit,
  onModelApplied?: () => void
): void {
  // Se o jogador equipou uma skin customizada (épica ou lendária),
  // preservamos a miniatura procedural que exibe as cores, armaduras e adornos 3D da skin!
  if (unit.faction === 'player' && unit.skinId && !unit.skinId.endsWith('_default')) {
    return;
  }

  const isBoss = Boolean(unit.isBoss || unit.isMiniBoss);

  // 1. Try immediate synchronous cache
  const cachedModel = getCachedUnitModel(unit.avatarKey);
  if (cachedModel) {
    swapMiniatureChar(unitFigure, cachedModel, unit);
    onModelApplied?.();
    return;
  }

  // 2. Otherwise load asynchronously with procedural fallback in place
  loadUnitModel(unit.avatarKey, isBoss).then((loadedModel) => {
    if (!loadedModel) return; // Fallback remains active
    swapMiniatureChar(unitFigure, loadedModel, unit);
    onModelApplied?.();
  });
}

/**
 * Swaps the 'miniatureChar' child in the unit figure group with the new 3D model.
 */
function swapMiniatureChar(unitFigure: THREE.Group, newModel: THREE.Group, unit: Unit): void {
  const existingChar = unitFigure.getObjectByName('miniatureChar');
  if (existingChar) {
    unitFigure.remove(existingChar);
    existingChar.traverse((c) => {
      if (c instanceof THREE.Mesh) {
        c.geometry.dispose();
        if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
        else c.material?.dispose();
      }
    });
  }

  newModel.name = 'miniatureChar';

  // Apply lineage physical proportions (Dwarf, Orc, Minotaur, Elf, Centaur, Werewolf, etc.)
  if (unit.faction === 'player' && unit.lineageId) {
    const lin = unit.lineageId;
    if (lin === 'anao') {
      newModel.scale.multiply(new THREE.Vector3(1.16, 0.85, 1.16));
    } else if (lin === 'orc') {
      newModel.scale.multiply(new THREE.Vector3(1.12, 1.06, 1.12));
    } else if (lin === 'minotauro') {
      newModel.scale.multiply(new THREE.Vector3(1.16, 1.09, 1.16));
    } else if (lin === 'elfo') {
      newModel.scale.multiply(new THREE.Vector3(0.95, 1.05, 0.95));
    } else if (lin === 'feerico') {
      newModel.scale.multiply(new THREE.Vector3(0.92, 0.96, 0.92));
    } else if (lin === 'centauro') {
      newModel.scale.multiply(new THREE.Vector3(1.10, 1.05, 1.14));
    } else if (lin === 'lobisomem') {
      newModel.scale.multiply(new THREE.Vector3(1.12, 1.07, 1.12));
    } else if (lin === 'zephyros') {
      newModel.scale.multiply(new THREE.Vector3(0.95, 1.06, 0.95));
    } else if (lin === 'lagomorfo') {
      newModel.scale.multiply(new THREE.Vector3(0.96, 1.03, 0.96));
    } else if (lin === 'kitsune') {
      newModel.scale.multiply(new THREE.Vector3(0.96, 1.03, 0.96));
    } else if (lin === 'espectro') {
      newModel.scale.multiply(new THREE.Vector3(0.96, 1.06, 0.96));
    } else if (lin === 'murideo') {
      newModel.scale.multiply(new THREE.Vector3(0.94, 0.94, 0.98));
    }
  }

  // Apply stealth / invisibility transparency if unit is currently invisible
  const isInvisible = unit.statusEffects?.some((e) => e.type === 'invisible' && e.duration > 0);
  if (isInvisible) {
    newModel.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => {
            m.transparent = true;
            m.opacity = 0.35;
          });
        } else {
          child.material.transparent = true;
          child.material.opacity = 0.35;
        }
      }
    });
  }

  unitFigure.add(newModel);
}
