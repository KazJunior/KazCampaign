import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import type { BattlePhase, FloatingNumber, ObstacleType, Point, Skill, TerrainType, TileData, Unit } from '../types/game';
import { AnimationEngine } from './AnimationEngine';

// --- Public API exposed via ref ---
export interface BoardRenderer3DHandle {
  playMoveAnimation: (unitId: string, fromX: number, fromY: number, toX: number, toY: number) => Promise<void>;
  playAttackAnimation: (attackerId: string, targetId: string, damageType: 'physical' | 'magical' | 'healing', skillAoeRadius?: number) => Promise<void>;
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

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const gridGroupRef = useRef<THREE.Group | null>(null);
  const unitsGroupRef = useRef<THREE.Group | null>(null);
  const highlightsGroupRef = useRef<THREE.Group | null>(null);
  const animEngineRef = useRef<AnimationEngine | null>(null);

  // Map unitId -> THREE.Group for animation targeting
  const unitMeshMapRef = useRef<Map<string, THREE.Group>>(new Map());

  const gridWidth = grid[0].length;
  const gridHeight = grid.length;

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
    const centerX = gridWidth / 2;
    const centerZ = gridHeight / 2;
    camera.position.set(centerX, 11, centerZ + 11);
    camera.lookAt(centerX, 0, centerZ);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.3);
    dirLight.position.set(centerX + 10, 18, centerZ + 12);
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

    const accentLight = new THREE.PointLight(0xd4ad65, 0.6, 25);
    accentLight.position.set(centerX, 7, centerZ);
    scene.add(accentLight);

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

    // Animation Engine
    const animEngine = new AnimationEngine(scene);
    animEngineRef.current = animEngine;

    // Render Loop
    let animFrameId: number;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.003;

      // Update animation engine (tweens + particles)
      animEngine.update();

      // Idle breathing for units NOT currently being animated
      if (!animEngine.isAnimating) {
        unitsGroup.children.forEach((unitObj, idx) => {
          const floatY = Math.sin(time * 2 + idx) * 0.03;
          unitObj.position.y = floatY;
        });
      }

      // Pulse highlights
      highlightsGroup.children.forEach((child) => {
        if (child.name === 'pulseRing') {
          const s = 1.0 + Math.sin(time * 3) * 0.04;
          child.scale.set(s, 1, s);
        }
      });

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
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
  }, [gridWidth, gridHeight]);

  // Camera Presets
  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    const centerX = gridWidth / 2;
    const centerZ = gridHeight / 2;
    if (cameraMode === 'isometric') {
      camera.position.set(centerX, 11, centerZ + 10.5);
      camera.lookAt(centerX, 0, centerZ);
    } else if (cameraMode === 'topdown') {
      camera.position.set(centerX, 15, centerZ + 0.05);
      camera.lookAt(centerX, 0, centerZ);
    }
  }, [cameraMode, gridWidth, gridHeight]);

  // Rebuild Grid & Obstacles
  useEffect(() => {
    const group = gridGroupRef.current;
    if (!group) return;
    while (group.children.length > 0) {
      const child = group.children.pop()!;
      if (child instanceof THREE.Mesh) child.geometry.dispose();
    }
    const tileGeo = new THREE.BoxGeometry(0.96, 0.22, 0.96);
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const tile = grid[y][x];
        const mat = new THREE.MeshStandardMaterial({
          color: getTerrain3DColor(tile.terrain),
          roughness: 0.75,
          metalness: 0.1,
        });
        const mesh = new THREE.Mesh(tileGeo, mat);
        mesh.position.set(x + 0.5, -0.11, y + 0.5);
        mesh.receiveShadow = true;
        group.add(mesh);
        if (tile.obstacle !== 'none') {
          const obsMesh = createLowPolyObstacle(tile.obstacle);
          obsMesh.position.set(x + 0.5, 0, y + 0.5);
          group.add(obsMesh);
        }
      }
    }
  }, [grid, gridWidth, gridHeight]);

  // Rebuild Highlights
  useEffect(() => {
    const group = highlightsGroupRef.current;
    if (!group) return;
    while (group.children.length > 0) {
      const child = group.children.pop()!;
      if (child instanceof THREE.Mesh) child.geometry.dispose();
    }
    const planeGeo = new THREE.PlaneGeometry(0.94, 0.94);
    planeGeo.rotateX(-Math.PI / 2);

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const tile = grid[y][x];
        if (tile.isTelegraphedHazard) {
          const mat = new THREE.MeshBasicMaterial({ color: 0xe65353, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
          const mesh = new THREE.Mesh(planeGeo, mat);
          mesh.position.set(x + 0.5, 0.02, y + 0.5);
          mesh.name = 'pulseRing';
          group.add(mesh);
        }
      }
    }
    if (phase === 'deployment') {
      const mat = new THREE.MeshBasicMaterial({ color: 0xd4ad65, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
      deploymentZone.forEach((pt) => {
        const mesh = new THREE.Mesh(planeGeo, mat);
        mesh.position.set(pt.x + 0.5, 0.02, pt.y + 0.5);
        group.add(mesh);
      });
    }
    const moveMat = new THREE.MeshBasicMaterial({ color: 0x4c8dff, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    reachableTiles.forEach((pt) => {
      const mesh = new THREE.Mesh(planeGeo, moveMat);
      mesh.position.set(pt.x + 0.5, 0.02, pt.y + 0.5);
      group.add(mesh);
    });
    const attackMat = new THREE.MeshBasicMaterial({ color: 0xe65353, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
    attackableTiles.forEach((pt) => {
      const mesh = new THREE.Mesh(planeGeo, attackMat);
      mesh.position.set(pt.x + 0.5, 0.02, pt.y + 0.5);
      group.add(mesh);
    });
    const aoeMat = new THREE.MeshBasicMaterial({ color: 0xff9800, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
    aoeTiles.forEach((pt) => {
      const mesh = new THREE.Mesh(planeGeo, aoeMat);
      mesh.position.set(pt.x + 0.5, 0.03, pt.y + 0.5);
      group.add(mesh);
    });
    if (selectedUnit && !selectedUnit.isDead) {
      const ringGeo = new THREE.RingGeometry(0.35, 0.45, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xd4ad65, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(selectedUnit.x + 0.5, 0.04, selectedUnit.y + 0.5);
      ringMesh.name = 'pulseRing';
      group.add(ringMesh);
    }
    if (hoveredTile) {
      const hGeo = new THREE.RingGeometry(0.4, 0.46, 4);
      hGeo.rotateX(-Math.PI / 2);
      const hMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const hMesh = new THREE.Mesh(hGeo, hMat);
      hMesh.position.set(hoveredTile.x + 0.5, 0.04, hoveredTile.y + 0.5);
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

    units.forEach((unit) => {
      if (unit.isDead) return;
      const figure = createLowPolyCharacterModel(unit);
      figure.position.set(unit.x + 0.5, 0, unit.y + 0.5);
      figure.name = `unit_${unit.id}`;
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

    playAttackAnimation: async (attackerId, targetId, damageType, skillAoeRadius) => {
      const engine = animEngineRef.current;
      const attackerObj = getUnitObj(attackerId);
      const targetObj = getUnitObj(targetId);
      if (!engine || !attackerObj) return;

      // Find target unit for coordinates
      const targetUnit = units.find((u) => u.id === targetId);
      const attackerUnit = units.find((u) => u.id === attackerId);
      if (!targetUnit || !attackerUnit) return;

      if (damageType === 'healing') {
        // Heal animation
        if (targetObj) {
          await engine.playHealAnimation(targetObj, targetUnit.x, targetUnit.y, 600);
        }
      } else if (damageType === 'magical') {
        // Magic projectile + impact
        const color = 0xb58aff;
        await engine.playMagicAttackAnimation(
          attackerObj, attackerUnit.x, attackerUnit.y,
          targetUnit.x, targetUnit.y,
          color, 650
        );
        // Hit reaction
        if (targetObj) {
          await engine.playHitReaction(targetObj, 'magical', 300);
        }
        // AoE ring if applicable
        if (skillAoeRadius && skillAoeRadius > 0) {
          await engine.playAoEAnimation(targetUnit.x, targetUnit.y, skillAoeRadius, 0xff9800, 500);
        }
      } else {
        // Physical melee lunge
        await engine.playPhysicalAttackAnimation(
          attackerObj, attackerUnit.x, attackerUnit.y,
          targetUnit.x, targetUnit.y,
          450
        );
        // Hit reaction
        if (targetObj) {
          await engine.playHitReaction(targetObj, 'physical', 300);
        }
        // AoE shockwave for physical AoE attacks (e.g. Chuva de Flechas, Tremor Sísmico)
        if (skillAoeRadius && skillAoeRadius > 0) {
          await engine.playAoEAnimation(targetUnit.x, targetUnit.y, skillAoeRadius, 0xef4444, 500);
        }
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

  // Raycasting Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Block clicks during animations
    if (animEngineRef.current?.isAnimating) return;

    const container = mountRef.current;
    if (!container || !cameraRef.current) return;
    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const targetPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, targetPoint);
    if (targetPoint) {
      const x = Math.floor(targetPoint.x);
      const y = Math.floor(targetPoint.z);
      if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        onTileClick(x, y);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current) return;
    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const targetPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, targetPoint);
    if (targetPoint) {
      const x = Math.floor(targetPoint.x);
      const y = Math.floor(targetPoint.z);
      if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        onTileHover(x, y);
      } else {
        onTileHover(-1, null);
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#10131C] select-none overflow-hidden">
      {/* Camera Controls */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-[#1B2030]/90 border border-[#343B50] p-1.5 rounded-xl shadow-lg backdrop-blur">
        <button
          onClick={() => setCameraMode('isometric')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            cameraMode === 'isometric' ? 'bg-[#4C8DFF] text-white shadow' : 'text-[#A7B0C4] hover:text-white'
          }`}
        >
          Visão 3D Tática (45°)
        </button>
        <button
          onClick={() => setCameraMode('topdown')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            cameraMode === 'topdown' ? 'bg-[#4C8DFF] text-white shadow' : 'text-[#A7B0C4] hover:text-white'
          }`}
        >
          Visão Superior (90°)
        </button>
      </div>

      {/* WebGL Canvas */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => onTileHover(-1, null)}
        className="w-full h-full cursor-pointer rounded-xl border border-[#343B50] shadow-2xl overflow-hidden"
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

// --- Terrain Colors ---
function getTerrain3DColor(terrain: TerrainType): number {
  switch (terrain) {
    case 'grass': return 0x223a27;
    case 'stone': return 0x293142;
    case 'sand': return 0x3d3424;
    case 'dirt': return 0x30241e;
    case 'water': return 0x1d3a54;
    case 'swamp': return 0x22382e;
    case 'void': return 0x171326;
  }
}

// --- Obstacles ---
function createLowPolyObstacle(type: ObstacleType): THREE.Group {
  const group = new THREE.Group();
  if (type === 'tree') {
    const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.6, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x422818, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.3;
    trunk.castShadow = true;
    group.add(trunk);
    const leavesGeo = new THREE.ConeGeometry(0.42, 0.95, 6);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.6 });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 0.85;
    leaves.castShadow = true;
    group.add(leaves);
  } else if (type === 'rock') {
    const rockGeo = new THREE.DodecahedronGeometry(0.35, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x5a6578, roughness: 0.8 });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.y = 0.25;
    rock.castShadow = true;
    group.add(rock);
  } else if (type === 'ruins' || type === 'pillar') {
    const pillarGeo = new THREE.CylinderGeometry(0.2, 0.22, 1.2, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x718096, roughness: 0.5 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 0.6;
    pillar.castShadow = true;
    group.add(pillar);
  } else if (type === 'shrine') {
    const baseGeo = new THREE.BoxGeometry(0.6, 0.35, 0.6);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.18;
    base.castShadow = true;
    group.add(base);
    const orbGeo = new THREE.OctahedronGeometry(0.18, 0);
    const orbMat = new THREE.MeshStandardMaterial({ color: 0xa78bfa, emissive: 0xa78bfa, emissiveIntensity: 0.8 });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = 0.65;
    group.add(orb);
  } else if (type === 'wall') {
    const wallGeo = new THREE.BoxGeometry(0.92, 0.9, 0.92);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = 0.45;
    wall.castShadow = true;
    group.add(wall);
  } else if (type === 'thorns') {
    const thornGeo = new THREE.ConeGeometry(0.25, 0.5, 5);
    const thornMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
    const thorn = new THREE.Mesh(thornGeo, thornMat);
    thorn.position.y = 0.25;
    thorn.castShadow = true;
    group.add(thorn);
  } else if (type === 'tombstone') {
    const tombGeo = new THREE.BoxGeometry(0.35, 0.7, 0.15);
    const tombMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const tomb = new THREE.Mesh(tombGeo, tombMat);
    tomb.position.y = 0.35;
    tomb.castShadow = true;
    group.add(tomb);
  }
  return group;
}

// --- Character Models ---
function createLowPolyCharacterModel(unit: Unit): THREE.Group {
  const group = new THREE.Group();

  const baseGeo = new THREE.CylinderGeometry(0.36, 0.38, 0.08, 16);
  const baseMat = new THREE.MeshStandardMaterial({
    color: unit.faction === 'player' ? 0x4c8dff : 0xe65353,
    metalness: 0.4,
    roughness: 0.3,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.04;
  base.castShadow = true;
  group.add(base);

  const key = unit.avatarKey;

  if (key === 'warrior') {
    const torsoGeo = new THREE.BoxGeometry(0.35, 0.45, 0.25);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.6, roughness: 0.3 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.35;
    torso.castShadow = true;
    group.add(torso);
    const headGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.7;
    group.add(head);
    const shieldGeo = new THREE.BoxGeometry(0.1, 0.5, 0.3);
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(-0.25, 0.4, 0.1);
    group.add(shield);
    const swordGeo = new THREE.BoxGeometry(0.05, 0.6, 0.1);
    const swordMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });
    const sword = new THREE.Mesh(swordGeo, swordMat);
    sword.position.set(0.25, 0.45, 0.1);
    group.add(sword);
  } else if (key === 'archer') {
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.45, 8);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.35;
    group.add(torso);
    const hoodGeo = new THREE.ConeGeometry(0.2, 0.3, 6);
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.y = 0.75;
    group.add(hood);
    const bowGeo = new THREE.TorusGeometry(0.25, 0.03, 6, 12, Math.PI);
    const bowMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const bow = new THREE.Mesh(bowGeo, bowMat);
    bow.position.set(0.22, 0.45, 0);
    bow.rotation.z = -Math.PI / 4;
    group.add(bow);
  } else if (key === 'mage') {
    const robeGeo = new THREE.ConeGeometry(0.28, 0.55, 8);
    const robeMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.5 });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.35;
    group.add(robe);
    const hatGeo = new THREE.ConeGeometry(0.25, 0.45, 8);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x6b21a8 });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.y = 0.85;
    group.add(hat);
    const staffGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6);
    const staffMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
    const staff = new THREE.Mesh(staffGeo, staffMat);
    staff.position.set(0.22, 0.45, 0);
    group.add(staff);
    const gemGeo = new THREE.OctahedronGeometry(0.09, 0);
    const gemMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.9 });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(0.22, 0.88, 0);
    group.add(gem);
  } else if (key === 'cleric') {
    const robeGeo = new THREE.CylinderGeometry(0.2, 0.26, 0.5, 8);
    const robeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.35;
    group.add(robe);
    const haloGeo = new THREE.TorusGeometry(0.16, 0.02, 6, 16);
    const haloMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.6 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 0.85;
    halo.rotation.x = Math.PI / 2;
    group.add(halo);
  } else if (key === 'assassin') {
    const torsoGeo = new THREE.BoxGeometry(0.28, 0.42, 0.2);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.6 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.35;
    group.add(torso);
    const d1Geo = new THREE.BoxGeometry(0.04, 0.35, 0.06);
    const dMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 });
    const d1 = new THREE.Mesh(d1Geo, dMat);
    d1.position.set(-0.2, 0.35, 0.1);
    group.add(d1);
    const d2 = new THREE.Mesh(d1Geo, dMat);
    d2.position.set(0.2, 0.35, 0.1);
    group.add(d2);
  } else if (key === 'arcane_knight') {
    const armorGeo = new THREE.BoxGeometry(0.32, 0.48, 0.24);
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.7, roughness: 0.2 });
    const armor = new THREE.Mesh(armorGeo, armorMat);
    armor.position.y = 0.35;
    group.add(armor);
    const swordGeo = new THREE.BoxGeometry(0.06, 0.7, 0.08);
    const swordMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 0.5 });
    const sword = new THREE.Mesh(swordGeo, swordMat);
    sword.position.set(0.24, 0.45, 0);
    group.add(sword);
  } else if (key === 'necromancer') {
    const robeGeo = new THREE.ConeGeometry(0.25, 0.5, 6);
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x4a044e, roughness: 0.6 });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.35;
    group.add(robe);
    const hoodGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.25, 6);
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x2e1065 });
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.y = 0.7;
    group.add(hood);
    const staffGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 4);
    const staffMat = new THREE.MeshStandardMaterial({ color: 0x27272a });
    const staff = new THREE.Mesh(staffGeo, staffMat);
    staff.position.set(0.2, 0.45, 0.1);
    staff.rotation.x = Math.PI / 8;
    group.add(staff);
    const skullGeo = new THREE.DodecahedronGeometry(0.08, 0);
    const skullMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8 });
    const skull = new THREE.Mesh(skullGeo, skullMat);
    skull.position.set(0.2, 0.95, 0.15);
    group.add(skull);
  } else if (key === 'engineer') {
    const torsoGeo = new THREE.BoxGeometry(0.3, 0.4, 0.2);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.35;
    group.add(torso);
    const headGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfcb900 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.65;
    group.add(head);
    const wrenchGeo = new THREE.BoxGeometry(0.06, 0.6, 0.04);
    const wrenchMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const wrench = new THREE.Mesh(wrenchGeo, wrenchMat);
    wrench.position.set(0.25, 0.4, 0.1);
    wrench.rotation.z = Math.PI / 6;
    group.add(wrench);
  } else if (key === 'rune_mage') {
    const robeGeo = new THREE.ConeGeometry(0.3, 0.5, 4);
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4 });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.35;
    group.add(robe);
    const headGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x1e3a8a, emissiveIntensity: 0.4 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.7;
    group.add(head);
    const bookGeo = new THREE.BoxGeometry(0.25, 0.05, 0.18);
    const bookMat = new THREE.MeshStandardMaterial({ color: 0x3f6212 });
    const book = new THREE.Mesh(bookGeo, bookMat);
    book.position.set(-0.25, 0.45, 0.15);
    book.rotation.z = Math.PI / 8;
    book.rotation.x = Math.PI / 4;
    group.add(book);
  } else if (key === 'berserker') {
    const torsoGeo = new THREE.BoxGeometry(0.4, 0.45, 0.25);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.9 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.4;
    group.add(torso);
    const headGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x450a0a });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.75;
    group.add(head);
    const axeHandleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6);
    const axeHandleMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
    const axeHandle = new THREE.Mesh(axeHandleGeo, axeHandleMat);
    axeHandle.position.set(0.3, 0.5, 0.15);
    axeHandle.rotation.x = Math.PI / 6;
    group.add(axeHandle);
    const axeBladeGeo = new THREE.BoxGeometry(0.04, 0.3, 0.25);
    const axeBladeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 });
    const axeBlade = new THREE.Mesh(axeBladeGeo, axeBladeMat);
    axeBlade.position.set(0.3, 0.8, 0.25);
    axeBlade.rotation.x = Math.PI / 6;
    group.add(axeBlade);
  } else if (key === 'devourer_boss' || unit.isMiniBoss) {
    const bodyGeo = new THREE.DodecahedronGeometry(0.55, 0);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);
    const jawGeo = new THREE.ConeGeometry(0.35, 0.4, 4);
    const jawMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const jaw = new THREE.Mesh(jawGeo, jawMat);
    jaw.position.set(0, 0.9, 0.2);
    jaw.rotation.x = Math.PI / 3;
    group.add(jaw);
  } else if (key === 'astaroth_boss' || unit.isBoss) {
    const bodyGeo = new THREE.CylinderGeometry(0.4, 0.55, 1.3, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x581c87, metalness: 0.8, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.75;
    body.castShadow = true;
    group.add(body);
    const wingGeo = new THREE.BoxGeometry(0.05, 0.9, 0.8);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7e22ce, emissiveIntensity: 0.5 });
    const w1 = new THREE.Mesh(wingGeo, wingMat);
    w1.position.set(-0.45, 0.9, -0.2);
    w1.rotation.y = -Math.PI / 6;
    group.add(w1);
    const w2 = new THREE.Mesh(wingGeo, wingMat);
    w2.position.set(0.45, 0.9, -0.2);
    w2.rotation.y = Math.PI / 6;
    group.add(w2);
  } else {
    const bodyGeo = new THREE.CapsuleGeometry(0.24, 0.4, 6, 12);
    const hexColor = parseInt(unit.color.replace('#', '0x'), 16) || 0xe65353;
    const bodyMat = new THREE.MeshStandardMaterial({ color: hexColor, roughness: 0.5 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.4;
    body.castShadow = true;
    group.add(body);
  }

  return group;
}
