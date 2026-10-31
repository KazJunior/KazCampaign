import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import type { BattlePhase, FloatingNumber, Point, Skill, TileData, Unit } from '../types/game';
import { AnimationEngine } from './AnimationEngine';
import { resolveSkillVFX } from './vfx/skillVFXRegistry';
import {
  createRichTile,
  createRichObstacle,
  createDioramaPerimeter,
  createAmbientMotes,
  updateEnvironmentAnimations,
} from './EnvironmentBuilder3D';
import {
  createOrganicMiniatureModel,
} from './MiniatureBuilder3D';
import {
  apply3DModelToMiniature,
  preloadUnitModels,
} from './ModelLoader3D';
import { ZoomIn, ZoomOut, RotateCcw, Box, Layers } from 'lucide-react';
import { getAoETiles } from '../utils/pathfinding';

// --- Public API exposed via ref ---
export interface BoardRenderer3DHandle {
  playMoveAnimation: (unitId: string, fromX: number, fromY: number, toX: number, toY: number) => Promise<void>;
  playAttackAnimation: (
    attackerId: string,
    targetId: string,
    damageType: 'physical' | 'magical' | 'healing',
    skillAoeRadius?: number,
    skill?: Skill,
    targetPointOverride?: Point
  ) => Promise<void>;
  playDeathAnimation: (unitId: string) => Promise<void>;
  isAnimating: () => boolean;
}

interface BoardRenderer3DProps {
  grid: TileData[][];
  units: Unit[];
  selectedUnit: Unit | null;
  reachableTiles: Point[];
  attackableTiles: Point[];
  aoeTiles: Point[];
  deploymentZone: Point[];
  phase: BattlePhase;
  floatingNumbers: FloatingNumber[];
  onTileClick: (x: number, y: number) => void;
  onTileHover: (x: number, y: number | null) => void;
  hoveredTile: Point | null;
  activeSkill?: Skill;
}

export const BoardRenderer3D = forwardRef<BoardRenderer3DHandle, BoardRenderer3DProps>(({
  grid,
  units,
  selectedUnit,
  reachableTiles,
  attackableTiles,
  aoeTiles,
  deploymentZone,
  phase,
  floatingNumbers,
  onTileClick,
  onTileHover,
  hoveredTile,
}, ref) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [cameraMode, setCameraMode] = useState<'isometric' | 'topdown'>('isometric');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; z: number }>({ x: 0, z: 0 });

  const cameraModeRef = useRef<'isometric' | 'topdown'>('isometric');
  const zoomLevelRef = useRef<number>(1.0);
  const panOffsetRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  // Touch and Drag State Refs (Direct manipulation without 60fps re-renders)
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartPanRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const initialPinchDistRef = useRef<number | null>(null);
  const initialPinchZoomRef = useRef<number>(1.0);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const gridGroupRef = useRef<THREE.Group | null>(null);
  const unitsGroupRef = useRef<THREE.Group | null>(null);
  const highlightsGroupRef = useRef<THREE.Group | null>(null);
  const animEngineRef = useRef<AnimationEngine | null>(null);
  const cameraShakeRef = useRef<{
    intensity: number;
    duration: number;
    startTime: number;
    basePos: THREE.Vector3;
  } | null>(null);

  const triggerCameraShake = useCallback((intensity = 0.12, duration = 250) => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    const basePos = cameraShakeRef.current ? cameraShakeRef.current.basePos : camera.position.clone();
    cameraShakeRef.current = {
      intensity,
      duration,
      startTime: Date.now(),
      basePos,
    };
  }, []);

  // Map unitId -> THREE.Group for animation targeting
  const unitMeshMapRef = useRef<Map<string, THREE.Group>>(new Map());

  const gridWidth = grid[0].length;
  const gridHeight = grid.length;

  const applyCameraTransform = useCallback((panX = panOffsetRef.current.x, panZ = panOffsetRef.current.z) => {
    const camera = cameraRef.current;
    const container = mountRef.current;
    if (!camera || !container) return;

    const w = container.clientWidth || 800;
    const h = container.clientHeight || 600;
    const aspect = w / h;
    const isPortrait = aspect < 1;
    const portraitMult = isPortrait ? Math.min(1.25, Math.max(0.85, 0.60 / aspect)) : 1.0;
    const effectiveZoom = zoomLevelRef.current * portraitMult;

    const centerX = gridWidth / 2 + panX;
    const centerZ = gridHeight / 2 + panZ;
    const targetZ = isPortrait ? centerZ + 0.8 : centerZ;

    if (cameraModeRef.current === 'isometric') {
      camera.position.set(centerX, 8.2 * effectiveZoom, targetZ + 8.2 * effectiveZoom);
      camera.lookAt(centerX, 0.1, targetZ);
    } else {
      camera.position.set(centerX, 11 * effectiveZoom, targetZ + 0.05);
      camera.lookAt(centerX, 0, targetZ);
    }
  }, [gridWidth, gridHeight]);

  // --- Initialize Three.js Scene ---
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x10131c);
    scene.fog = new THREE.FogExp2(0x10131c, 0.03);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    applyCameraTransform(panOffsetRef.current.x, panOffsetRef.current.z);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const initialCenterX = gridWidth / 2;
    const initialCenterZ = gridHeight / 2;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.55);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.35);
    dirLight.position.set(initialCenterX + 10, 18, initialCenterZ + 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    const d = 16;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(0xd4ad65, 0.65, 25);
    accentLight.position.set(initialCenterX, 7, initialCenterZ);
    scene.add(accentLight);

    // Ambient floating atmospheric particles
    const ambientMotes = createAmbientMotes(gridWidth, gridHeight, 50);
    scene.add(ambientMotes);

    // Groups
    const gridGroup = new THREE.Group();
    const unitsGroup = new THREE.Group();
    const highlightsGroup = new THREE.Group();
    scene.add(gridGroup);
    scene.add(unitsGroup);
    scene.add(highlightsGroup);

    gridGroupRef.current = gridGroup;
    unitsGroupRef.current = unitsGroup;
    highlightsGroupRef.current = highlightsGroup;

    // Animation Engine with Camera Shake Hook
    const animEngine = new AnimationEngine(scene, triggerCameraShake);
    animEngineRef.current = animEngine;

    // Render Loop
    let animFrameId: number;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.003;

      // Update animation engine (tweens + particles)
      animEngine.update();

      // Animate environment assets (wind sway, shrine crystals, torches, water, motes)
      updateEnvironmentAnimations(scene, time);

      // Idle breathing for units NOT currently being animated
      if (!animEngine.isAnimating) {
        unitsGroup.children.forEach((unitObj, idx) => {
          const floatY = Math.sin(time * 2 + idx) * 0.02;
          unitObj.position.y = floatY;
        });
      }


      // Billboard alignment for 3D HP bars & rotation for status auras
      if (cameraRef.current) {
        const camQuat = cameraRef.current.quaternion;
        unitsGroup.traverse((child) => {
          if (child.name === 'hpBarBillboard') {
            child.quaternion.copy(camQuat);
          } else if (child.name === 'auraRing') {
            child.rotation.y += 0.025;
          } else if (child.name === 'spinningOrb' || child.name === 'lineageOrbit' || child.name === 'skinOrbit') {
            child.rotation.y += 0.04;
          } else if (child.name === 'lineageHalo' || child.name === 'skinHalo') {
            child.rotation.z += 0.025;
          } else if (child.name === 'lineageWingL') {
            child.rotation.y = 0.22 + Math.sin(time * 3.2) * 0.16;
          } else if (child.name === 'lineageWingR') {
            child.rotation.y = -0.22 - Math.sin(time * 3.2) * 0.16;
          }
        });
      }

      // Pulse highlights
      highlightsGroup.children.forEach((child) => {
        if (child.name === 'pulseRing') {
          const s = 1.0 + Math.sin(time * 3) * 0.04;
          child.scale.set(s, 1, s);
        }
      });

      // Dynamic Camera Shake
      if (cameraShakeRef.current && cameraRef.current) {
        const { intensity, duration, startTime, basePos } = cameraShakeRef.current;
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
          const decay = 1 - elapsed / duration;
          const shakeAmount = intensity * decay;
          const ox = (Math.random() - 0.5) * 2 * shakeAmount;
          const oy = (Math.random() - 0.5) * 2 * shakeAmount;
          const oz = (Math.random() - 0.5) * 2 * shakeAmount;
          cameraRef.current.position.set(basePos.x + ox, basePos.y + oy, basePos.z + oz);
        } else {
          cameraRef.current.position.copy(basePos);
          cameraShakeRef.current = null;
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const aspect = w / h;
      cameraRef.current.aspect = aspect;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      applyCameraTransform();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      animEngine.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [gridWidth, gridHeight, applyCameraTransform]);

  // Camera Presets & Dynamic Zoom
  useEffect(() => {
    applyCameraTransform();
  }, [cameraMode, zoomLevel, applyCameraTransform]);

  // Reset Pan on stage / grid change
  useEffect(() => {
    panOffsetRef.current = { x: 0, z: 0 };
    setPanOffset({ x: 0, z: 0 });
    applyCameraTransform(0, 0);
  }, [gridWidth, gridHeight, applyCameraTransform]);

  // Rebuild Grid, Diorama Base & High-Detail 3D Obstacles
  useEffect(() => {
    const group = gridGroupRef.current;
    if (!group) return;
    while (group.children.length > 0) {
      const child = group.children.pop()!;
      if (child instanceof THREE.Mesh) child.geometry.dispose();
    }

    // Add Tabletop Floating Diorama Perimeter Base
    const diorama = createDioramaPerimeter(gridWidth, gridHeight);
    group.add(diorama);

    // Build each rich tile & 3D obstacle
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const tile = grid[y][x];

        // 1. Layered Biome Tile with Micro-Props
        const tileMesh = createRichTile(tile, x, y);
        tileMesh.position.set(x + 0.5, 0, y + 0.5);
        group.add(tileMesh);

        // 2. High-Detail Low-Poly Stylized Obstacle
        if (tile.obstacle !== 'none') {
          const obsMesh = createRichObstacle(tile.obstacle, x, y);
          obsMesh.position.set(x + 0.5, 0, y + 0.5);
          group.add(obsMesh);
        }
      }
    }
  }, [grid, gridWidth, gridHeight]);

  // Rebuild Highlights
  // Rebuild Highlights (Movement Range, Attack Range, AoE, Deployment & Selection)
  useEffect(() => {
    const group = highlightsGroupRef.current;
    if (!group) return;
    while (group.children.length > 0) {
      const child = group.children.pop()!;
      if (child instanceof THREE.Mesh) child.geometry.dispose();
    }

    // Helper to generate a visible, beautiful tactical tile highlight with border
    const addTileHighlight = (
      x: number,
      y: number,
      fillColor: number,
      fillOpacity: number,
      borderColor?: number,
      isPulse = false,
      yPos = 0.055
    ) => {
      // 1. Fill Plane
      const planeGeo = new THREE.PlaneGeometry(0.92, 0.92);
      planeGeo.rotateX(-Math.PI / 2);
      const fillMat = new THREE.MeshBasicMaterial({
        color: fillColor,
        transparent: true,
        opacity: fillOpacity,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });
      const fillMesh = new THREE.Mesh(planeGeo, fillMat);
      fillMesh.position.set(x + 0.5, yPos, y + 0.5);
      if (isPulse) fillMesh.name = 'pulseRing';
      group.add(fillMesh);

      // 2. Crisp Glowing Border (Square Frame)
      if (borderColor !== undefined) {
        const borderGeo = new THREE.RingGeometry(0.42, 0.46, 4);
        borderGeo.rotateX(-Math.PI / 2);
        borderGeo.rotateY(Math.PI / 4); // Rotates 4-point ring into a square
        const borderMat = new THREE.MeshBasicMaterial({
          color: borderColor,
          transparent: true,
          opacity: 0.95,
          side: THREE.DoubleSide,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -3,
          polygonOffsetUnits: -3,
        });
        const borderMesh = new THREE.Mesh(borderGeo, borderMat);
        borderMesh.position.set(x + 0.5, yPos + 0.002, y + 0.5);
        if (isPulse) borderMesh.name = 'pulseRing';
        group.add(borderMesh);
      }
    };

    // 1. Danger Hazards
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const tile = grid[y][x];
        if (tile.isTelegraphedHazard) {
          addTileHighlight(x, y, 0xe65353, 0.55, 0xff2222, true, 0.053);
        }
        // Poças de Corrupção Abissal (Fase 10 - Astaroth)
        if (tile.corruptionTurns && tile.corruptionTurns > 0) {
          addTileHighlight(x, y, 0x3b0764, 0.75, 0xc084fc, true, 0.052);
          const puddleGeo = new THREE.CircleGeometry(0.30, 16);
          puddleGeo.rotateX(-Math.PI / 2);
          const puddleMat = new THREE.MeshBasicMaterial({
            color: 0x581c87,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -3,
            polygonOffsetUnits: -3,
          });
          const puddleMesh = new THREE.Mesh(puddleGeo, puddleMat);
          puddleMesh.position.set(x + 0.5, 0.054, y + 0.5);
          puddleMesh.name = 'pulseRing';
          group.add(puddleMesh);
        }
        // Névoa Asfixiante do Leviatã (Fase 40)
        if (tile.mistTurns && tile.mistTurns > 0) {
          addTileHighlight(x, y, 0x0284c7, 0.45, 0x38bdf8, true, 0.052);
          const mistGeo = new THREE.CircleGeometry(0.35, 16);
          mistGeo.rotateX(-Math.PI / 2);
          const mistMat = new THREE.MeshBasicMaterial({
            color: 0x0ea5e9,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const mistMesh = new THREE.Mesh(mistGeo, mistMat);
          mistMesh.position.set(x + 0.5, 0.054, y + 0.5);
          mistMesh.name = 'pulseRing';
          group.add(mistMesh);
        }
        // Centro do Tornado de Água Primordial (Fase 40 - Leviatã)
        if (tile.isWaterTornadoCenter) {
          addTileHighlight(x, y, 0x0369a1, 0.85, 0x38bdf8, true, 0.055);
          const vortexGeo = new THREE.RingGeometry(0.15, 0.45, 24);
          vortexGeo.rotateX(-Math.PI / 2);
          const vortexMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const vortexMesh = new THREE.Mesh(vortexGeo, vortexMat);
          vortexMesh.position.set(x + 0.5, 0.056, y + 0.5);
          vortexMesh.name = 'pulseRing';
          group.add(vortexMesh);
        }
        // Solo Amaldiçoado de Anti-Cura (Fase 45 - Cavaleiro das Trevas)
        if (tile.antiHealPermanent) {
          addTileHighlight(x, y, 0x581c87, 0.75, 0xa855f7, true, 0.052);
          const cursedGeo = new THREE.RingGeometry(0.12, 0.42, 16);
          cursedGeo.rotateX(-Math.PI / 2);
          const cursedMat = new THREE.MeshBasicMaterial({
            color: 0x9333ea,
            transparent: true,
            opacity: 0.75,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const cursedMesh = new THREE.Mesh(cursedGeo, cursedMat);
          cursedMesh.position.set(x + 0.5, 0.054, y + 0.5);
          cursedMesh.name = 'pulseRing';
          group.add(cursedMesh);
        }
        // Chamas da Borda do Mapa (Fase 45 - Cavaleiro das Trevas)
        if (tile.borderFire) {
          addTileHighlight(x, y, 0x991b1b, 0.65, 0xf97316, true, 0.052);
          const fireGeo = new THREE.CircleGeometry(0.28, 16);
          fireGeo.rotateX(-Math.PI / 2);
          const fireMat = new THREE.MeshBasicMaterial({
            color: 0xf97316,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const fireMesh = new THREE.Mesh(fireGeo, fireMat);
          fireMesh.position.set(x + 0.5, 0.055, y + 0.5);
          fireMesh.name = 'pulseRing';
          group.add(fireMesh);
        }
      }
    }

    // 2. Deployment Zone
    if (phase === 'deployment') {
      deploymentZone.forEach((pt) => {
        if (!grid[pt.y] || grid[pt.y][pt.x]?.obstacle === 'none') {
          addTileHighlight(pt.x, pt.y, 0xd4ad65, 0.35, 0xfbbf24, false, 0.053);
        }
      });
    }

    // 3. Reachable Movement Range (Cyan / Blue)
    reachableTiles.forEach((pt) => {
      addTileHighlight(pt.x, pt.y, 0x2563eb, 0.42, 0x38bdf8, false, 0.055);
    });

    // 4. Attackable Range (Vibrant Crimson Red with intense pulse on enemies)
    attackableTiles.forEach((pt) => {
      const hasEnemy = units.some((u) => u.faction === 'enemy' && !u.isDead && u.x === pt.x && u.y === pt.y);
      if (hasEnemy) {
        addTileHighlight(pt.x, pt.y, 0xef4444, 0.70, 0xff2222, true, 0.062);
      } else {
        addTileHighlight(pt.x, pt.y, 0xdc2626, 0.48, 0xef4444, false, 0.055);
      }
    });

    // 5. AoE Skill Area (Radiant Orange / Gold)
    aoeTiles.forEach((pt) => {
      addTileHighlight(pt.x, pt.y, 0xf59e0b, 0.58, 0xfbbf24, true, 0.058);
    });

    // 6. Selected Unit Runic Glow Ring
    if (selectedUnit && !selectedUnit.isDead) {
      const isBoss = selectedUnit.isBoss || selectedUnit.isMiniBoss;
      const ringGeo = new THREE.RingGeometry(isBoss ? 0.58 : 0.36, isBoss ? 0.68 : 0.46, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(selectedUnit.x + 0.5, 0.065, selectedUnit.y + 0.5);
      ringMesh.name = 'pulseRing';
      group.add(ringMesh);
    }

    // 7. Hovered Tile Cursor Frame
    if (hoveredTile) {
      const hGeo = new THREE.RingGeometry(0.42, 0.47, 4);
      hGeo.rotateX(-Math.PI / 2);
      hGeo.rotateY(Math.PI / 4);
      const hMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -5,
        polygonOffsetUnits: -5,
      });
      const hMesh = new THREE.Mesh(hGeo, hMat);
      hMesh.position.set(hoveredTile.x + 0.5, 0.07, hoveredTile.y + 0.5);
      group.add(hMesh);
    }
  }, [reachableTiles, attackableTiles, aoeTiles, deploymentZone, phase, selectedUnit, hoveredTile, grid, gridWidth, gridHeight]);

  // Rebuild 3D Unit Models & maintain mesh map
  useEffect(() => {
    const group = unitsGroupRef.current;
    if (!group) return;
    while (group.children.length > 0) {
      group.children.pop();
    }
    const newMap = new Map<string, THREE.Group>();

    // Preload 3D GLB models for all active units
    preloadUnitModels(units);

    units.forEach((unit) => {
      if (unit.isDead) return;
      const figure = createOrganicMiniatureModel(unit, createUnitHpBar, createStatusAuras);
      figure.position.set(unit.x + 0.5, 0, unit.y + 0.5);
      figure.name = `unit_${unit.id}`;
      figure.userData = { unitId: unit.id, unitX: unit.x, unitY: unit.y };

      // Invisible Hit Collider for accurate 3D click & hover picking (compact body footprint)
      const isBoss = unit.isBoss || unit.isMiniBoss;
      const colliderRadius = isBoss ? 0.30 : 0.22;
      const colliderHeight = isBoss ? 0.65 : 0.48;
      const hitColliderGeo = new THREE.CylinderGeometry(colliderRadius, colliderRadius, colliderHeight, 12);
      const hitColliderMat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const hitCollider = new THREE.Mesh(hitColliderGeo, hitColliderMat);
      hitCollider.position.set(0, colliderHeight / 2, 0);
      hitCollider.name = `hitCollider_${unit.id}`;
      hitCollider.userData = { isHitCollider: true, unitId: unit.id, unitX: unit.x, unitY: unit.y };
      figure.add(hitCollider);

      // Upgrade to 3D GLB Model (Path 1) with procedural fallback
      apply3DModelToMiniature(figure, unit);

      // Tag character children with unit userData for recursive raycast lookup,
      // explicitly SKIPPING HP bars and status auras so they never intercept clicks or block the tile above
      figure.traverse((child) => {
        if (
          child.name === 'hpBarBillboard' ||
          child.name.startsWith('hpBar') ||
          child.name === 'auraRing' ||
          child.name === 'auraGroup' ||
          child.name === 'spinningOrb' ||
          child.userData?.isHpBar ||
          child.userData?.isAura
        ) {
          child.raycast = () => {};
          return;
        }
        child.userData = { ...child.userData, unitId: unit.id, unitX: unit.x, unitY: unit.y };
      });

      // Stealth / Invisibility Visual: enemies are completely hidden; player heroes are ghostly translucent
      const isInvisible = unit.statusEffects?.some((e) => e.type === 'invisible' && e.duration > 0);
      if (isInvisible) {
        if (unit.faction === 'enemy') {
          figure.visible = false;
        } else {
          figure.traverse((child) => {
            if (child instanceof THREE.Mesh && child.name !== 'auraRing' && !child.name.includes('hpBarBillboard')) {
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material = child.material.map((m) => {
                    const cloned = m.clone();
                    cloned.transparent = true;
                    cloned.opacity = 0.35;
                    return cloned;
                  });
                } else {
                  const cloned = child.material.clone();
                  cloned.transparent = true;
                  cloned.opacity = 0.35;
                  child.material = cloned;
                }
              }
            }
          });
        }
      }

      group.add(figure);
      newMap.set(unit.id, figure);
    });

    unitMeshMapRef.current = newMap;
  }, [units]);

  // --- Imperative Animation API ---
  const getUnitObj = useCallback((unitId: string): THREE.Group | undefined => {
    return unitMeshMapRef.current.get(unitId);
  }, []);

  useImperativeHandle(ref, () => ({
    playMoveAnimation: async (unitId, fromX, fromY, toX, toY) => {
      const engine = animEngineRef.current;
      const unitObj = getUnitObj(unitId);
      if (!engine || !unitObj) return;
      await engine.playMoveAnimation(unitObj, fromX, fromY, toX, toY, 400);
    },

    playAttackAnimation: async (attackerId, targetId, damageType, skillAoeRadius, skill, targetPointOverride) => {
      const engine = animEngineRef.current;
      const attackerObj = getUnitObj(attackerId);
      const isPedestal = targetId === 'pedestal';

      // 1. Resolve Target Unit (prioritize existing unit from battle units)
      let targetUnit = units.find((u) => u.id === targetId);
      if (isPedestal) {
        targetUnit = { id: 'pedestal', name: 'Pedestal Ancestral', x: 0, y: 0, faction: 'enemy' as const } as Unit;
      } else if (!targetUnit && targetPointOverride) {
        targetUnit = { id: targetId || 'ground', name: 'Área Alvo', x: targetPointOverride.x, y: targetPointOverride.y, faction: 'enemy' as const } as Unit;
      }

      const attackerUnit = units.find((u) => u.id === attackerId);
      if (!engine || !attackerObj || !targetUnit || !attackerUnit) return;

      // 2. Resolve Target 3D Object (prioritize actual unit miniature mesh)
      let targetObj: THREE.Object3D | undefined = isPedestal
        ? (sceneRef.current?.getObjectByName('secretPedestalProp') || undefined)
        : getUnitObj(targetId);

      if (!targetObj) {
        const fallbackGroup = new THREE.Group();
        const fx = targetPointOverride ? targetPointOverride.x : targetUnit.x;
        const fy = targetPointOverride ? targetPointOverride.y : targetUnit.y;
        fallbackGroup.position.set(fx + 0.5, 0.35, fy + 0.5);
        targetObj = fallbackGroup;
      }

      const aoeRad = skillAoeRadius ?? skill?.aoeRadius ?? 0;
      const targetAnimX = aoeRad > 0 && targetPointOverride ? targetPointOverride.x : targetUnit.x;
      const targetAnimY = aoeRad > 0 && targetPointOverride ? targetPointOverride.y : targetUnit.y;
      const className = (attackerUnit.className || '').toLowerCase();

      // Execute animation via VFX Sequencer (or basic attack fallback)
      if (skill) {
        const sequence = resolveSkillVFX(skill, damageType, aoeRad);
        await engine.playVFXSequence(
          sequence,
          attackerObj,
          attackerUnit.x,
          attackerUnit.y,
          targetObj,
          targetAnimX,
          targetAnimY,
          aoeRad,
          damageType
        );

        // When an AoE attack strikes, trigger flinch / hit reaction on all units caught in the blast area
        if (aoeRad > 0 && damageType !== 'healing') {
          const hitTiles = getAoETiles(
            { x: targetAnimX, y: targetAnimY },
            aoeRad,
            gridWidth,
            gridHeight,
            skill?.aoeType || 'circle',
            { x: attackerUnit.x, y: attackerUnit.y }
          );
          units.forEach((u) => {
            if (!u.isDead && hitTiles.some((pt) => pt.x === u.x && pt.y === u.y)) {
              const uObj = getUnitObj(u.id);
              if (uObj) engine.playHitReaction(uObj, damageType, 260);
            }
          });
        }
      } else if (className.includes('archer') || className.includes('arqueiro')) {
        // Basic Ranged Physical Attack
        await engine.playArrowAnimation(
          attackerObj,
          attackerUnit.x,
          attackerUnit.y,
          targetAnimX,
          targetAnimY,
          false,
          460
        );
        if (targetObj) await engine.playHitReaction(targetObj, damageType, 320);
      } else if (damageType === 'magical') {
        // Basic Magic Attack
        const color =
          className.includes('curandeiro') || className.includes('cleric')
            ? 0x56e59a
            : className.includes('mage') || className.includes('mago')
            ? 0xb58aff
            : 0x06b6d4;
        await engine.playMagicAttackAnimation(
          attackerObj,
          attackerUnit.x,
          attackerUnit.y,
          targetAnimX,
          targetAnimY,
          color,
          650
        );
        if (targetObj) await engine.playHitReaction(targetObj, damageType, 320);
      } else {
        // Basic Melee Physical Attack
        await engine.playPhysicalAttackAnimation(
          attackerObj,
          attackerUnit.x,
          attackerUnit.y,
          targetAnimX,
          targetAnimY,
          450
        );
        if (targetObj) await engine.playHitReaction(targetObj, damageType, 320);
      }
    },

    playDeathAnimation: async (unitId) => {
      const engine = animEngineRef.current;
      const unitObj = getUnitObj(unitId);
      if (!engine || !unitObj) return;
      await engine.playDeathAnimation(unitObj, 700);
    },

    isAnimating: () => {
      return animEngineRef.current?.isAnimating ?? false;
    },
  }), [getUnitObj, units]);

  // --- Pointer & Touch Pan / Pinch / Click Handlers ---
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    } catch {
      // Ignore pointer capture errors
    }

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1) {
      dragStartPosRef.current = { x: e.clientX, y: e.clientY };
      dragStartPanRef.current = { ...panOffsetRef.current };
      isDraggingRef.current = false;
    } else if (activePointersRef.current.size === 2) {
      // Multi-touch pinch-to-zoom initial distance
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      initialPinchDistRef.current = dist;
      initialPinchZoomRef.current = zoomLevelRef.current;
      isDraggingRef.current = true;
    }
  };


  // Accurate 3D Tile & Unit Picker: raycasts against unit colliders first, then ground plane
  const getTargetTileFromPointer = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const container = mountRef.current;
      const camera = cameraRef.current;
      if (!container || !camera) return null;

      const rect = container.getBoundingClientRect();
      const mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      // 1. Raycast against ground plane y = 0
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const targetPoint = new THREE.Vector3();
      const groundHit = raycaster.ray.intersectPlane(plane, targetPoint);
      

      let groundTile: { x: number; y: number } | null = null;
      if (groundHit) {
        const gx = Math.floor(targetPoint.x);
        const gy = Math.floor(targetPoint.z);
        if (gx >= 0 && gx < gridWidth && gy >= 0 && gy < gridHeight) {
          groundTile = { x: gx, y: gy };
        }
      }

      // 2. Raycast strictly against compact unit hitColliders (ignoring decorative wings, hats, weapons, HP bars & auras)
      let hitUnitPos: { x: number; y: number } | null = null;
      let hitPointY = 0;
      if (unitsGroupRef.current && unitsGroupRef.current.children.length > 0) {
        const hitColliders: THREE.Object3D[] = [];
        unitsGroupRef.current.children.forEach((unitFigure) => {
          if (!unitFigure.visible) return;
          unitFigure.children.forEach((child) => {
            if (child.name.startsWith('hitCollider_')) {
              hitColliders.push(child);
            }
          });
        });

        const unitIntersects = raycaster.intersectObjects(hitColliders, false);
        if (unitIntersects.length > 0) {
          const closest = unitIntersects[0];
          hitPointY = closest.point.y;
          const { unitX, unitY } = closest.object.userData || {};
          if (typeof unitX === 'number' && typeof unitY === 'number') {
            hitUnitPos = { x: unitX, y: unitY };
          }
        }
      }

      // 3. Smart Disambiguation when a unit's upper collider overlaps a different tile behind/in front of it
      if (hitUnitPos && groundTile && (hitUnitPos.x !== groundTile.x || hitUnitPos.y !== groundTile.y)) {
        const hu = hitUnitPos;
        const gt = groundTile;
        const unitOnGroundTile = units.find(
          (u) =>
            !u.isDead &&
            u.x === gt.x &&
            u.y === gt.y &&
            !(u.faction === 'enemy' && u.statusEffects?.some((e) => e.type === 'invisible' && e.duration > 0))
        );
        const isHitUnitSelected = Boolean(
          selectedUnit && !selectedUnit.isDead && selectedUnit.x === hu.x && selectedUnit.y === hu.y
        );
        const isGroundReachable = reachableTiles.some((pt) => pt.x === gt.x && pt.y === gt.y);
        const isGroundAoE = aoeTiles.some((pt) => pt.x === gt.x && pt.y === gt.y);
        const isGroundDeploy =
          phase === 'deployment' && deploymentZone.some((pt) => pt.x === gt.x && pt.y === gt.y);
        const isGroundAttackable = attackableTiles.some((pt) => pt.x === gt.x && pt.y === gt.y);
        const isHitUnitAttackable = attackableTiles.some((pt) => pt.x === hu.x && pt.y === hu.y);

        if (
          unitOnGroundTile ||
          isHitUnitSelected ||
          isGroundReachable ||
          isGroundAoE ||
          isGroundDeploy ||
          (isGroundAttackable && !isHitUnitAttackable) ||
          hitPointY > 0.38
        ) {
          hitUnitPos = null;
        }
      }

      if (hitUnitPos) {
        if (hitUnitPos.x >= 0 && hitUnitPos.x < gridWidth && hitUnitPos.y >= 0 && hitUnitPos.y < gridHeight) {
          return hitUnitPos;
        }
      }

      if (groundTile) {
        return groundTile;
      }

      return null;
    },
    [gridWidth, gridHeight, units, selectedUnit, reachableTiles, attackableTiles, aoeTiles, deploymentZone, phase]
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    const container = mountRef.current;
    if (!container || !cameraRef.current) return;

    // Multi-touch Pinch to Zoom
    if (activePointersRef.current.size === 2 && initialPinchDistRef.current !== null && initialPinchDistRef.current > 0) {
      isDraggingRef.current = true;
      const pts = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ratio = currentDist / initialPinchDistRef.current;
      const newZoom = Math.max(0.45, Math.min(1.50, initialPinchZoomRef.current / ratio));
      setZoomLevel(Number(newZoom.toFixed(2)));
      return;
    }

    // 1-finger touch or mouse drag to Pan
    if (dragStartPosRef.current && activePointersRef.current.size === 1) {
      const dx = e.clientX - dragStartPosRef.current.x;
      const dy = e.clientY - dragStartPosRef.current.y;
      const distSq = dx * dx + dy * dy;

      // Threshold of 6px to separate deliberate drag from static tap
      if (!isDraggingRef.current && distSq > 36) {
        isDraggingRef.current = true;
      }

      if (isDraggingRef.current) {
        const rect = container.getBoundingClientRect();
        const aspect = rect.width / (rect.height || 1);
        const isPortrait = aspect < 1;
        const portraitMult = isPortrait ? Math.min(1.25, Math.max(0.85, 0.60 / aspect)) : 1.0;
        const effectiveZoom = zoomLevelRef.current * portraitMult;

        // Factor maps screen pixels to 3D board world units
        const factorX = (11.5 * effectiveZoom) / rect.width;
        const factorZ = (14.5 * effectiveZoom) / rect.height;

        const deltaX = -dx * factorX;
        const deltaZ = -dy * factorZ;

        const maxPanX = Math.max(4, gridWidth * 0.75);
        const maxPanZ = Math.max(4, gridHeight * 0.75);

        const targetPanX = Math.max(-maxPanX, Math.min(maxPanX, dragStartPanRef.current.x + deltaX));
        const targetPanZ = Math.max(-maxPanZ, Math.min(maxPanZ, dragStartPanRef.current.z + deltaZ));

        panOffsetRef.current = { x: targetPanX, z: targetPanZ };
        applyCameraTransform(targetPanX, targetPanZ);
        return; // Suppress hover while dragging
      }
    }

    // Hover raycasting when not dragging (for desktop mouse hover)
    if (!isDraggingRef.current && activePointersRef.current.size <= 1) {
      const target = getTargetTileFromPointer(e.clientX, e.clientY);
      if (target) {
        onTileHover(target.x, target.y);
        const hasUnit = units.some((u) => !u.isDead && u.x === target.x && u.y === target.y);
        const isAttackable = attackableTiles.some((pt) => pt.x === target.x && pt.y === target.y);
        if (isAttackable) {
          container.style.cursor = 'crosshair';
        } else if (hasUnit) {
          container.style.cursor = 'pointer';
        } else {
          container.style.cursor = 'grab';
        }
      } else {
        onTileHover(-1, null);
        container.style.cursor = 'grab';
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if ((e.target as HTMLElement)?.hasPointerCapture?.(e.pointerId)) {
        (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      }
    } catch {
      // Ignore pointer capture errors
    }

    activePointersRef.current.delete(e.pointerId);

    // If dragging was in progress, commit state and do not click tile
    if (isDraggingRef.current) {
      setPanOffset({ ...panOffsetRef.current });
      if (activePointersRef.current.size === 0) {
        isDraggingRef.current = false;
        dragStartPosRef.current = null;
        initialPinchDistRef.current = null;
      }
      return;
    }

    // Clean tap/click (finger released without moving)
    dragStartPosRef.current = null;
    initialPinchDistRef.current = null;

    // Block clicks during animations
    if (animEngineRef.current?.isAnimating) return;

    const target = getTargetTileFromPointer(e.clientX, e.clientY);
    if (target) {
      onTileClick(target.x, target.y);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if ((e.target as HTMLElement)?.hasPointerCapture?.(e.pointerId)) {
        (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      }
    } catch {
      // Ignore
    }
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size === 0) {
      if (isDraggingRef.current) {
        setPanOffset({ ...panOffsetRef.current });
      }
      isDraggingRef.current = false;
      dragStartPosRef.current = null;
      initialPinchDistRef.current = null;
    }
  };

  const handlePointerLeave = () => {
    onTileHover(-1, null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((z) => Math.max(0.45, Number((z - 0.1).toFixed(2))));
    } else if (e.deltaY > 0) {
      setZoomLevel((z) => Math.min(1.50, Number((z + 0.1).toFixed(2))));
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#10131C] select-none overflow-hidden">
      {/* Camera & Zoom Controls */}
      <div className="absolute top-12 left-2 sm:top-2.5 sm:left-2.5 z-20 flex items-center gap-1.5 sm:gap-2 bg-[#1B2030]/90 border border-[#343B50] p-1 sm:p-1.5 rounded-xl shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={() => setCameraMode('isometric')}
          className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
            cameraMode === 'isometric' ? 'bg-[#4C8DFF] text-white shadow' : 'text-[#A7B0C4] hover:text-white'
          }`}
          title="Visão 3D Tática (45°)"
        >
          <Box size={14} />
          <span className="sm:inline hidden">Visão 3D (45°)</span>
          <span className="sm:hidden inline">3D</span>
        </button>
        <button
          type="button"
          onClick={() => setCameraMode('topdown')}
          className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
            cameraMode === 'topdown' ? 'bg-[#4C8DFF] text-white shadow' : 'text-[#A7B0C4] hover:text-white'
          }`}
          title="Visão Superior (90°)"
        >
          <Layers size={14} />
          <span className="sm:inline hidden">Superior (90°)</span>
          <span className="sm:hidden inline">2D</span>
        </button>

        <div className="w-[1px] h-4 bg-[#343B50] mx-0.5" />

        {/* Zoom Controls */}
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.max(0.45, Number((z - 0.15).toFixed(2))))}
          className="p-1 rounded-lg text-[#A7B0C4] hover:text-white hover:bg-[#10131C] active:scale-90 transition-all"
          title="Aproximar Zoom (+)"
        >
          <ZoomIn size={15} />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.min(1.50, Number((z + 0.15).toFixed(2))))}
          className="p-1 rounded-lg text-[#A7B0C4] hover:text-white hover:bg-[#10131C] active:scale-90 transition-all"
          title="Afastar Zoom (-)"
        >
          <ZoomOut size={15} />
        </button>
        {(zoomLevel !== 1.0 || panOffset.x !== 0 || panOffset.z !== 0) && (
          <button
            type="button"
            onClick={() => {
              setZoomLevel(1.0);
              setPanOffset({ x: 0, z: 0 });
              panOffsetRef.current = { x: 0, z: 0 };
              applyCameraTransform(0, 0);
            }}
            className="px-2 py-1 rounded-lg text-[#D4AD65] hover:text-white hover:bg-[#10131C] active:scale-90 transition-all flex items-center gap-1 text-xs font-bold border border-[#D4AD65]/30 bg-[#D4AD65]/10"
            title="Recentralizar Tabuleiro"
          >
            <RotateCcw size={13} />
            <span className="sm:inline hidden">Centralizar</span>
          </button>
        )}
      </div>

      {/* Mobile Quick Recenter Button */}
      {(panOffset.x !== 0 || panOffset.z !== 0) && (
        <button
          type="button"
          onClick={() => {
            setPanOffset({ x: 0, z: 0 });
            panOffsetRef.current = { x: 0, z: 0 };
            applyCameraTransform(0, 0);
          }}
          className="sm:hidden absolute top-12 right-2 z-20 flex items-center gap-1 px-2.5 py-1 bg-[#1B2030]/95 border border-[#D4AD65]/40 text-[#D4AD65] text-xs font-bold rounded-xl shadow-xl backdrop-blur active:scale-95 transition-all"
          title="Centralizar tabuleiro"
        >
          <RotateCcw size={12} />
          <span>Centralizar</span>
        </button>
      )}

      {/* WebGL Canvas */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing rounded-xl border border-[#343B50] shadow-2xl overflow-hidden touch-none"
        style={{ touchAction: 'none' }}
      />

      {/* Floating Damage Numbers */}
      {floatingNumbers.map((fn) => (
        <div
          key={fn.id}
          className="absolute font-black text-xl pointer-events-none drop-shadow-lg animate-bounce-short"
          style={{ color: fn.color, top: '40%', left: '50%' }}
        >
          {fn.value}
        </div>
      ))}
    </div>
  );
});

BoardRenderer3D.displayName = 'BoardRenderer3D';

// --- 3D Floating Health Bar (Billboard facing camera) ---
function createUnitHpBar(unit: Unit): THREE.Group {
  const hpGroup = new THREE.Group();
  hpGroup.name = 'hpBarBillboard';
  hpGroup.userData = { isHpBar: true, unitId: unit.id, unitX: unit.x, unitY: unit.y };

  // Height above unit head
  const barY = unit.isBoss ? 2.15 : unit.isMiniBoss ? 1.85 : 1.48;
  hpGroup.position.set(0, barY, 0);

  // Background frame (clickable for unit targeting)
  const bgGeo = new THREE.PlaneGeometry(0.90, 0.20);
  const bgMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.DoubleSide });
  const bg = new THREE.Mesh(bgGeo, bgMat);
  bg.name = 'hpBarBg';
  bg.userData = { isHpBar: true, unitId: unit.id, unitX: unit.x, unitY: unit.y };
  hpGroup.add(bg);

  // Lost HP background (dark crimson)
  const lostHpGeo = new THREE.PlaneGeometry(0.78, 0.09);
  const lostHpMat = new THREE.MeshBasicMaterial({ color: 0x450a0a, side: THREE.DoubleSide });
  const lostHp = new THREE.Mesh(lostHpGeo, lostHpMat);
  lostHp.name = 'hpBarLost';
  lostHp.userData = { isHpBar: true, unitId: unit.id, unitX: unit.x, unitY: unit.y };
  lostHp.position.z = 0.002;
  hpGroup.add(lostHp);

  // Current HP fill
  const hpPercent = Math.max(0, Math.min(1, unit.currentHp / unit.maxHp));
  const hpWidth = 0.78 * hpPercent;
  if (hpWidth > 0.01) {
    let fillColor = 0x22c55e; // Green
    if (hpPercent <= 0.25) fillColor = 0xef4444; // Red
    else if (hpPercent <= 0.5) fillColor = 0xf59e0b; // Amber

    const fillGeo = new THREE.PlaneGeometry(hpWidth, 0.09);
    const fillMat = new THREE.MeshBasicMaterial({ color: fillColor, side: THREE.DoubleSide });
    const fill = new THREE.Mesh(fillGeo, fillMat);
    fill.name = 'hpBarFill';
    fill.userData = { isHpBar: true };
    fill.raycast = () => {};
    fill.position.set(-0.39 + hpWidth / 2, 0, 0.004);
    hpGroup.add(fill);
  }

  // Active Shield Overlay (Cyan)
  const activeShield = unit.statusEffects?.find((e) => e.type === 'shield' && e.value > 0);
  if (activeShield && activeShield.value > 0) {
    const shieldPercent = Math.min(1, activeShield.value / unit.maxHp);
    const shieldWidth = 0.68 * shieldPercent;
    const shieldGeo = new THREE.PlaneGeometry(shieldWidth, 0.035);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });
    const shieldBar = new THREE.Mesh(shieldGeo, shieldMat);
    shieldBar.name = 'hpBarShield';
    shieldBar.userData = { isHpBar: true };
    shieldBar.raycast = () => {};
    shieldBar.position.set(-0.34 + shieldWidth / 2, -0.02, 0.006);
    hpGroup.add(shieldBar);
  }

  // Ensure all descendants never intercept raycasting or click detection
  hpGroup.traverse((child) => {
    child.raycast = () => {};
    child.userData = { ...child.userData, isHpBar: true };
  });

  return hpGroup;
}

// --- 3D Status Auras ---
function createStatusAuras(unit: Unit): THREE.Group {
  const auraGroup = new THREE.Group();

  // 1. Shield Dome
  const hasShield = unit.statusEffects?.some((e) => e.type === 'shield' && e.value > 0);
  if (hasShield) {
    const shieldGeo = new THREE.SphereGeometry(0.52, 12, 10);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.position.y = 0.45;
    shieldMesh.name = 'auraRing';
    auraGroup.add(shieldMesh);
  }

  // 2. Buff Atk (Flame aura ring at base)
  const hasBuffAtk = unit.statusEffects?.some((e) => e.type === 'buff_atk' && e.value > 0);
  if (hasBuffAtk) {
    const flameGeo = new THREE.RingGeometry(0.38, 0.48, 16);
    flameGeo.rotateX(-Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.y = 0.05;
    flameMesh.name = 'auraRing';
    auraGroup.add(flameMesh);
  }

  // 3. Stun (Yellow orbiting halo)
  const hasStun = unit.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0);
  if (hasStun) {
    const stunGeo = new THREE.TorusGeometry(0.22, 0.025, 6, 12);
    stunGeo.rotateX(Math.PI / 3);
    const stunMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const stunMesh = new THREE.Mesh(stunGeo, stunMat);
    stunMesh.position.y = unit.isBoss ? 1.5 : 0.95;
    stunMesh.name = 'auraRing';
    auraGroup.add(stunMesh);
  }

  // 4. Poison (Purple ring bubbling at base)
  const hasPoison = unit.statusEffects?.some((e) => e.type === 'poison' && e.duration > 0);
  if (hasPoison) {
    const poisonGeo = new THREE.RingGeometry(0.35, 0.45, 12);
    poisonGeo.rotateX(-Math.PI / 2);
    const poisonMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    const poisonMesh = new THREE.Mesh(poisonGeo, poisonMat);
    poisonMesh.position.y = 0.06;
    poisonMesh.name = 'auraRing';
    auraGroup.add(poisonMesh);
  }

  // 4b. Burn (Fiery orange ring burning at base)
  const hasBurn = unit.statusEffects?.some((e) => e.type === 'burn' && e.duration > 0);
  if (hasBurn) {
    const burnGeo = new THREE.RingGeometry(0.36, 0.47, 12);
    burnGeo.rotateX(-Math.PI / 2);
    const burnMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const burnMesh = new THREE.Mesh(burnGeo, burnMat);
    burnMesh.position.y = 0.065;
    burnMesh.name = 'auraRing';
    auraGroup.add(burnMesh);
  }

  // 5. Invisibility / Stealth (Ghostly dark violet ring & shadow particles)
  const hasInvis = unit.statusEffects?.some((e) => e.type === 'invisible' && e.duration > 0);
  if (hasInvis) {
    const invisGeo = new THREE.RingGeometry(0.32, 0.46, 16);
    invisGeo.rotateX(-Math.PI / 2);
    const invisMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const invisMesh = new THREE.Mesh(invisGeo, invisMat);
    invisMesh.position.y = 0.07;
    invisMesh.name = 'auraRing';
    auraGroup.add(invisMesh);
  }

  // 6. Def Debuff (Cracked crimson ring at base)
  const hasDefDebuff = unit.statusEffects?.some((e) => e.type === 'debuff_def' && e.duration > 0);
  if (hasDefDebuff) {
    const debuffGeo = new THREE.RingGeometry(0.36, 0.44, 8);
    debuffGeo.rotateX(-Math.PI / 2);
    const debuffMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const debuffMesh = new THREE.Mesh(debuffGeo, debuffMat);
    debuffMesh.position.y = 0.04;
    debuffMesh.name = 'auraRing';
    auraGroup.add(debuffMesh);
  }

  // 7. Slow (Frosty cyan/azure ice ring at base)
  const hasSlow = unit.statusEffects?.some((e) => e.type === 'slow' && e.duration > 0);
  if (hasSlow) {
    const slowGeo = new THREE.RingGeometry(0.34, 0.44, 12);
    slowGeo.rotateX(-Math.PI / 2);
    const slowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const slowMesh = new THREE.Mesh(slowGeo, slowMat);
    slowMesh.position.y = 0.055;
    slowMesh.name = 'auraRing';
    auraGroup.add(slowMesh);
  }

  // 8. Excess Heal (Subtle crimson ring at base)
  const hasExcessHeal = unit.statusEffects?.some((e) => e.type === 'excess_heal' && e.duration > 0);
  if (hasExcessHeal) {
    const healDebuffGeo = new THREE.RingGeometry(0.31, 0.38, 12);
    healDebuffGeo.rotateX(-Math.PI / 2);
    const healDebuffMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const healDebuffMesh = new THREE.Mesh(healDebuffGeo, healDebuffMat);
    healDebuffMesh.position.y = 0.045;
    healDebuffMesh.name = 'auraRing';
    auraGroup.add(healDebuffMesh);
  }

  // 9. Excess Shield (Subtle amber ring at base)
  const hasExcessShield = unit.statusEffects?.some((e) => e.type === 'excess_shield' && e.duration > 0);
  if (hasExcessShield) {
    const shieldDebuffGeo = new THREE.RingGeometry(0.33, 0.41, 12);
    shieldDebuffGeo.rotateX(-Math.PI / 2);
    const shieldDebuffMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const shieldDebuffMesh = new THREE.Mesh(shieldDebuffGeo, shieldDebuffMat);
    shieldDebuffMesh.position.y = 0.048;
    shieldDebuffMesh.name = 'auraRing';
    auraGroup.add(shieldDebuffMesh);
  }

  // 10. Electrified (Crackling bright yellow/amber ring at base)
  const hasElectrified = unit.statusEffects?.some((e) => e.type === 'electrified' && e.duration > 0);
  if (hasElectrified) {
    const elecGeo = new THREE.RingGeometry(0.33, 0.44, 12);
    elecGeo.rotateX(-Math.PI / 2);
    const elecMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const elecMesh = new THREE.Mesh(elecGeo, elecMat);
    elecMesh.position.y = 0.058;
    elecMesh.name = 'auraRing';
    auraGroup.add(elecMesh);
  }

  auraGroup.traverse((child) => {
    child.raycast = () => {};
    child.userData = { ...child.userData, isAura: true };
  });

  return auraGroup;
}

