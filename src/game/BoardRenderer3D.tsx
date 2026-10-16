import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import type { BattlePhase, FloatingNumber, ObstacleType, Point, Skill, TerrainType, TileData, Unit } from '../types/game';
import { AnimationEngine } from './AnimationEngine';

// --- Public API exposed via ref ---
export interface BoardRenderer3DHandle {
  playMoveAnimation: (unitId: string, fromX: number, fromY: number, toX: number, toY: number) => Promise<void>;
  playAttackAnimation: (
    attackerId: string,
    targetId: string,
    damageType: 'physical' | 'magical' | 'healing',
    skillAoeRadius?: number,
    skill?: Skill
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

      // Idle breathing for units NOT currently being animated
      if (!animEngine.isAnimating) {
        unitsGroup.children.forEach((unitObj, idx) => {
          const floatY = Math.sin(time * 2 + idx) * 0.03;
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
          } else if (child.name === 'spinningOrb') {
            child.rotation.y += 0.04;
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

    playAttackAnimation: async (attackerId, targetId, damageType, skillAoeRadius, skill) => {
      const engine = animEngineRef.current;
      const attackerObj = getUnitObj(attackerId);
      const targetObj = getUnitObj(targetId);
      if (!engine || !attackerObj) return;

      const targetUnit = units.find((u) => u.id === targetId);
      const attackerUnit = units.find((u) => u.id === attackerId);
      if (!targetUnit || !attackerUnit) return;

      const aoeRad = skillAoeRadius ?? skill?.aoeRadius ?? 0;
      const skillName = (skill?.name || '').toLowerCase();
      const skillId = (skill?.id || '').toLowerCase();
      const className = (attackerUnit.className || '').toLowerCase();

      // Check skill & attack archetype
      const isFire =
        skillId.includes('fogo') || skillId.includes('meteoro') || skillId.includes('chama') ||
        skillId.includes('ignis') || skillId.includes('drake') || skillName.includes('fogo') ||
        skillName.includes('meteoro') || skillName.includes('chama') || skillName.includes('elemental');

      const isMeteor =
        skillId.includes('meteoro') || skillName.includes('meteoro') || (isFire && aoeRad > 0);

      const isIce =
        skillId.includes('gelo') || skillId.includes('glacial') || skillId.includes('geada') ||
        skillId.includes('nevasca') || skillId.includes('congel') || skillName.includes('gelo') ||
        skillName.includes('glacial') || skillName.includes('nevasca');

      const isLightning =
        skillId.includes('raio') || skillId.includes('relampago') || skillId.includes('trovao') ||
        skillId.includes('eletric') || skillId.includes('zap') || skillId.includes('tempestade') ||
        skillName.includes('raio') || skillName.includes('relâmpago') || skillName.includes('tempestade');

      const isHoly =
        damageType === 'healing' || skill?.targetType === 'self' || skill?.targetType === 'ally' ||
        skillId.includes('cura') || skillId.includes('luz') || skillId.includes('sagrad') ||
        skillId.includes('bencao') || skillId.includes('prece') || skillId.includes('escudo') ||
        skillName.includes('cura') || skillName.includes('luz') || skillName.includes('escudo');

      const isVoid =
        skillId.includes('vazio') || skillId.includes('trevas') || skillId.includes('sombra') ||
        skillId.includes('drenar') || skillId.includes('maldicao') || skillId.includes('necro') ||
        skillName.includes('sombrio') || skillName.includes('drenar') || skillName.includes('necrót');

      const isCannon =
        skillId.includes('canhao') || skillId.includes('bomba') || skillId.includes('morteiro') ||
        skillId.includes('granada') || skillName.includes('canhão') || skillName.includes('bomba') ||
        className.includes('engineer') || className.includes('engenheiro');

      const isArrow =
        skillId.includes('flecha') || skillId.includes('tiro') || skillId.includes('disparo') ||
        skillName.includes('flecha') || skillName.includes('tiro') ||
        ((className.includes('archer') || className.includes('arqueiro')) && !skill);

      const isWhirlwind =
        skillId.includes('circular') || skillId.includes('torvelinho') || skillId.includes('girar') ||
        skillName.includes('circular') || skillName.includes('torvelinho');

      const isShadowDash =
        skillId.includes('furtivo') || skillId.includes('adaga') || skillId.includes('emboscada') ||
        skillName.includes('furtivo') || (className.includes('assassin') && !skill);

      const isHeavySlam =
        skillId.includes('demolidor') || skillId.includes('esmagar') || skillId.includes('investida') ||
        skillId.includes('pesada') || skillId.includes('terremoto') || skillId.includes('sismico') ||
        skillName.includes('demolidor') || skillName.includes('investida') ||
        (className.includes('berserker') && !skill);

      // Execute targeted animation
      if (isHoly) {
        if (targetObj) {
          await engine.playHolyLightAnimation(targetObj, targetUnit.x, targetUnit.y, aoeRad, 650);
        }
      } else if (isFire) {
        await engine.playFireballAnimation(
          attackerObj, attackerUnit.x, attackerUnit.y,
          targetUnit.x, targetUnit.y,
          isMeteor, aoeRad, 650
        );
      } else if (isIce) {
        await engine.playIceShardAnimation(
          attackerObj, attackerUnit.x, attackerUnit.y,
          targetUnit.x, targetUnit.y,
          aoeRad > 0, aoeRad, 580
        );
      } else if (isLightning) {
        await engine.playLightningAnimation(
          attackerUnit.x, attackerUnit.y,
          targetUnit.x, targetUnit.y,
          380
        );
      } else if (isVoid) {
        await engine.playVoidDrainAnimation(
          attackerObj, attackerUnit.x, attackerUnit.y,
          targetUnit.x, targetUnit.y,
          720
        );
      } else if (isCannon) {
        await engine.playCannonBombAnimation(
          attackerObj, attackerUnit.x, attackerUnit.y,
          targetUnit.x, targetUnit.y,
          aoeRad, 620
        );
      } else if (isArrow) {
        const isVolley = aoeRad > 0 || skillId.includes('triplo') || skillName.includes('triplo');
        await engine.playArrowAnimation(
          attackerObj, attackerUnit.x, attackerUnit.y,
          targetUnit.x, targetUnit.y,
          isVolley, 460
        );
      } else if (isWhirlwind) {
        await engine.playWhirlwindAnimation(
          attackerObj, attackerUnit.x, attackerUnit.y,
          aoeRad > 0 ? aoeRad : 1, 550
        );
      } else if (isShadowDash) {
        await engine.playShadowDashAnimation(
          attackerObj, attackerUnit.x, attackerUnit.y,
          targetUnit.x, targetUnit.y,
          520
        );
      } else if (isHeavySlam) {
        await engine.playHeavySlamAnimation(
          attackerObj, attackerUnit.x, attackerUnit.y,
          targetUnit.x, targetUnit.y,
          aoeRad, 520
        );
      } else if (damageType === 'magical') {
        const color = className.includes('mage') || className.includes('mago') ? 0xb58aff : 0x06b6d4;
        await engine.playMagicAttackAnimation(
          attackerObj, attackerUnit.x, attackerUnit.y,
          targetUnit.x, targetUnit.y,
          color, 650
        );
      } else {
        await engine.playPhysicalAttackAnimation(
          attackerObj, attackerUnit.x, attackerUnit.y,
          targetUnit.x, targetUnit.y,
          450
        );
      }

      // Hit reaction & flash on target
      if (targetObj && !isHoly) {
        await engine.playHitReaction(targetObj, damageType, 320);
      }

      // AoE expanding ring if applicable
      if (aoeRad > 0 && !isHoly) {
        const aoeColor = isFire ? 0xff4500 : isIce ? 0x38bdf8 : isLightning ? 0x00f0ff : 0xf59e0b;
        await engine.playAoEAnimation(targetUnit.x, targetUnit.y, aoeRad, aoeColor, 450);
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

// --- 3D Floating Health Bar (Billboard facing camera) ---
function createUnitHpBar(unit: Unit): THREE.Group {
  const hpGroup = new THREE.Group();
  hpGroup.name = 'hpBarBillboard';

  // Height above unit head
  const barY = unit.isBoss ? 1.75 : unit.isMiniBoss ? 1.45 : 1.18;
  hpGroup.position.set(0, barY, 0);

  // Background frame
  const bgGeo = new THREE.PlaneGeometry(0.72, 0.12);
  const bgMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.DoubleSide });
  const bg = new THREE.Mesh(bgGeo, bgMat);
  hpGroup.add(bg);

  // Lost HP background (dark crimson)
  const lostHpGeo = new THREE.PlaneGeometry(0.68, 0.08);
  const lostHpMat = new THREE.MeshBasicMaterial({ color: 0x450a0a, side: THREE.DoubleSide });
  const lostHp = new THREE.Mesh(lostHpGeo, lostHpMat);
  lostHp.position.z = 0.002;
  hpGroup.add(lostHp);

  // Current HP fill
  const hpPercent = Math.max(0, Math.min(1, unit.currentHp / unit.maxHp));
  const hpWidth = 0.68 * hpPercent;
  if (hpWidth > 0.01) {
    let fillColor = 0x22c55e; // Green
    if (hpPercent <= 0.25) fillColor = 0xef4444; // Red
    else if (hpPercent <= 0.5) fillColor = 0xf59e0b; // Amber

    const fillGeo = new THREE.PlaneGeometry(hpWidth, 0.08);
    const fillMat = new THREE.MeshBasicMaterial({ color: fillColor, side: THREE.DoubleSide });
    const fill = new THREE.Mesh(fillGeo, fillMat);
    fill.position.set(-0.34 + hpWidth / 2, 0, 0.004);
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
    shieldBar.position.set(-0.34 + shieldWidth / 2, -0.02, 0.006);
    hpGroup.add(shieldBar);
  }

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

  return auraGroup;
}

// --- Stylized Runic Pedestal (Base) ---
function createStylizedPedestal(unit: Unit): THREE.Group {
  const baseGroup = new THREE.Group();
  const isPlayer = unit.faction === 'player';
  const isBoss = unit.isBoss || unit.isMiniBoss;

  const radiusTop = isBoss ? 0.6 : 0.36;
  const radiusBottom = isBoss ? 0.65 : 0.4;
  const height = 0.08;

  // Base platform
  const discGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 16);
  const discColor = isBoss ? 0x2e1065 : isPlayer ? 0x1e293b : 0x27272a;
  const discMat = new THREE.MeshStandardMaterial({
    color: discColor,
    metalness: 0.5,
    roughness: 0.4,
  });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.position.y = height / 2;
  disc.receiveShadow = true;
  baseGroup.add(disc);

  // Outer glowing runic faction ring
  const ringColor = isBoss ? 0xd4ad65 : isPlayer ? 0x3b82f6 : 0xef4444;
  const ringGeo = new THREE.TorusGeometry(radiusTop, 0.025, 8, 24);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshStandardMaterial({
    color: ringColor,
    emissive: ringColor,
    emissiveIntensity: 0.85,
    roughness: 0.2,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = height;
  baseGroup.add(ring);

  return baseGroup;
}

// --- High-Quality Stylized Character Models ---
function createLowPolyCharacterModel(unit: Unit): THREE.Group {
  const group = new THREE.Group();

  // 1. Pedestal Base
  group.add(createStylizedPedestal(unit));

  // 2. Health Bar & Status Auras
  group.add(createUnitHpBar(unit));
  group.add(createStatusAuras(unit));

  const key = unit.avatarKey;

  // ==========================================
  // PLAYABLE HEROES (10 Distinct Archetypes)
  // ==========================================
  if (key === 'warrior') {
    // Heavy Knight Armor
    const torsoGeo = new THREE.BoxGeometry(0.36, 0.44, 0.26);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.7, roughness: 0.3 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.36;
    torso.castShadow = true;
    group.add(torso);

    // Gold trimmed breastplate crest
    const crestGeo = new THREE.BoxGeometry(0.12, 0.22, 0.04);
    const crestMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
    const crest = new THREE.Mesh(crestGeo, crestMat);
    crest.position.set(0, 0.38, 0.14);
    group.add(crest);

    // Helmet with glowing visor
    const helmGeo = new THREE.BoxGeometry(0.24, 0.26, 0.24);
    const helmMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });
    const helm = new THREE.Mesh(helmGeo, helmMat);
    helm.position.y = 0.7;
    helm.castShadow = true;
    group.add(helm);

    const visorGeo = new THREE.BoxGeometry(0.16, 0.05, 0.04);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x60a5fa, emissiveIntensity: 0.9 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.7, 0.12);
    group.add(visor);

    // Pauldrons
    const pGeo = new THREE.BoxGeometry(0.12, 0.12, 0.22);
    const pMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const pLeft = new THREE.Mesh(pGeo, pMat);
    pLeft.position.set(-0.24, 0.52, 0);
    const pRight = new THREE.Mesh(pGeo, pMat);
    pRight.position.set(0.24, 0.52, 0);
    group.add(pLeft, pRight);

    // Tower Shield
    const shieldGeo = new THREE.BoxGeometry(0.08, 0.55, 0.32);
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.6, roughness: 0.3 });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(-0.28, 0.42, 0.08);
    shield.castShadow = true;
    group.add(shield);

    const shieldBorderGeo = new THREE.BoxGeometry(0.09, 0.56, 0.04);
    const shieldBorderMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
    const border = new THREE.Mesh(shieldBorderGeo, shieldBorderMat);
    border.position.set(-0.28, 0.42, 0.24);
    group.add(border);

    // Broadsword
    const swordGeo = new THREE.BoxGeometry(0.04, 0.65, 0.1);
    const swordMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const sword = new THREE.Mesh(swordGeo, swordMat);
    sword.position.set(0.28, 0.46, 0.08);
    sword.castShadow = true;
    group.add(sword);

    const guardGeo = new THREE.BoxGeometry(0.06, 0.04, 0.22);
    const guardMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
    const guard = new THREE.Mesh(guardGeo, guardMat);
    guard.position.set(0.28, 0.2, 0.08);
    group.add(guard);
  } else if (key === 'archer') {
    // Forest Ranger
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.44, 8);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.36;
    torso.castShadow = true;
    group.add(torso);

    // Hood & Mask
    const hoodGeo = new THREE.ConeGeometry(0.22, 0.32, 6);
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.7 });
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.y = 0.74;
    group.add(hood);

    // Quiver on back with arrows
    const quiverGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.38, 6);
    const quiverMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const quiver = new THREE.Mesh(quiverGeo, quiverMat);
    quiver.position.set(0, 0.45, -0.16);
    quiver.rotation.z = Math.PI / 8;
    group.add(quiver);

    const arrowFletchGeo = new THREE.ConeGeometry(0.03, 0.08, 4);
    const arrowFletchMat = new THREE.MeshStandardMaterial({ color: 0xfef08a });
    const fletch = new THREE.Mesh(arrowFletchGeo, arrowFletchMat);
    fletch.position.set(0.06, 0.65, -0.16);
    group.add(fletch);

    // Recurve Longbow
    const bowGeo = new THREE.TorusGeometry(0.28, 0.025, 6, 16, Math.PI);
    const bowMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5 });
    const bow = new THREE.Mesh(bowGeo, bowMat);
    bow.position.set(0.26, 0.45, 0.05);
    bow.rotation.z = -Math.PI / 3;
    bow.castShadow = true;
    group.add(bow);
  } else if (key === 'mage') {
    // Arcane Sorcerer
    const robeGeo = new THREE.ConeGeometry(0.3, 0.58, 8);
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x7e22ce, roughness: 0.5 });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.36;
    robe.castShadow = true;
    group.add(robe);

    // Pointed Wizard Hat
    const hatBrimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.03, 12);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x581c87 });
    const hatBrim = new THREE.Mesh(hatBrimGeo, hatMat);
    hatBrim.position.y = 0.68;
    group.add(hatBrim);

    const hatConeGeo = new THREE.ConeGeometry(0.22, 0.42, 8);
    const hatCone = new THREE.Mesh(hatConeGeo, hatMat);
    hatCone.position.set(0, 0.88, -0.04);
    hatCone.rotation.x = -Math.PI / 16;
    group.add(hatCone);

    // Gnarled Staff
    const staffGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.88, 6);
    const staffMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const staff = new THREE.Mesh(staffGeo, staffMat);
    staff.position.set(0.26, 0.46, 0.05);
    group.add(staff);

    // Floating Arcane Crystal Orb
    const orbGeo = new THREE.DodecahedronGeometry(0.09, 0);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.95,
      roughness: 0.1,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.set(0.26, 0.94, 0.05);
    orb.name = 'spinningOrb';
    group.add(orb);
  } else if (key === 'cleric') {
    // Sacred Healer
    const robeGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.52, 8);
    const robeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.36;
    robe.castShadow = true;
    group.add(robe);

    // Golden Stole / Mantle
    const stoleGeo = new THREE.BoxGeometry(0.18, 0.4, 0.28);
    const stoleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5 });
    const stole = new THREE.Mesh(stoleGeo, stoleMat);
    stole.position.y = 0.42;
    group.add(stole);

    // Luminous Halo
    const haloGeo = new THREE.TorusGeometry(0.18, 0.025, 6, 20);
    haloGeo.rotateX(Math.PI / 2);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 0.9,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 0.88;
    group.add(halo);

    // Golden Scepter / Morningstar
    const maceShaft = new THREE.CylinderGeometry(0.025, 0.025, 0.65, 6);
    const maceMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.8 });
    const mace = new THREE.Mesh(maceShaft, maceMat);
    mace.position.set(0.26, 0.42, 0.05);
    group.add(mace);

    const maceHead = new THREE.DodecahedronGeometry(0.08, 0);
    const maceHeadMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.6 });
    const headMesh = new THREE.Mesh(maceHead, maceHeadMat);
    headMesh.position.set(0.26, 0.75, 0.05);
    group.add(headMesh);
  } else if (key === 'assassin') {
    // Shadow Stalker
    const torsoGeo = new THREE.BoxGeometry(0.28, 0.42, 0.2);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.36;
    torso.castShadow = true;
    group.add(torso);

    // Hood with glowing red slit eyes
    const cowlGeo = new THREE.BoxGeometry(0.2, 0.22, 0.2);
    const cowlMat = new THREE.MeshStandardMaterial({ color: 0x020617 });
    const cowl = new THREE.Mesh(cowlGeo, cowlMat);
    cowl.position.y = 0.66;
    group.add(cowl);

    const eyesGeo = new THREE.BoxGeometry(0.14, 0.03, 0.04);
    const eyesMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.95 });
    const eyes = new THREE.Mesh(eyesGeo, eyesMat);
    eyes.position.set(0, 0.66, 0.11);
    group.add(eyes);

    // Dual Crimson Serrated Daggers
    const dGeo = new THREE.BoxGeometry(0.03, 0.36, 0.06);
    const dMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.9, roughness: 0.2 });
    const d1 = new THREE.Mesh(dGeo, dMat);
    d1.position.set(-0.22, 0.38, 0.08);
    d1.rotation.x = Math.PI / 4;
    const d2 = new THREE.Mesh(dGeo, dMat);
    d2.position.set(0.22, 0.38, 0.08);
    d2.rotation.x = -Math.PI / 4;
    group.add(d1, d2);
  } else if (key === 'arcane_knight') {
    // Crystal Paladin
    const armorGeo = new THREE.BoxGeometry(0.35, 0.48, 0.26);
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x0e7490, metalness: 0.8, roughness: 0.2 });
    const armor = new THREE.Mesh(armorGeo, armorMat);
    armor.position.y = 0.36;
    armor.castShadow = true;
    group.add(armor);

    // Greathelm with crystal crest
    const helmGeo = new THREE.BoxGeometry(0.24, 0.26, 0.24);
    const helm = new THREE.Mesh(helmGeo, armorMat);
    helm.position.y = 0.7;
    group.add(helm);

    const crestGeo = new THREE.ConeGeometry(0.06, 0.22, 4);
    const crestMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 0.9 });
    const crest = new THREE.Mesh(crestGeo, crestMat);
    crest.position.set(0, 0.86, 0);
    group.add(crest);

    // Luminous Runic Claymore
    const bladeGeo = new THREE.BoxGeometry(0.05, 0.75, 0.12);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.85,
      metalness: 0.9,
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(0.26, 0.5, 0.06);
    blade.castShadow = true;
    group.add(blade);
  } else if (key === 'necromancer') {
    // Soul Harvester
    const robeGeo = new THREE.ConeGeometry(0.28, 0.55, 6);
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x2e1065, roughness: 0.7 });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.36;
    robe.castShadow = true;
    group.add(robe);

    // Bone Skull Mask with green glowing eyes
    const skullGeo = new THREE.DodecahedronGeometry(0.12, 0);
    const skullMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
    const skull = new THREE.Mesh(skullGeo, skullMat);
    skull.position.set(0, 0.68, 0.05);
    group.add(skull);

    const eyeGeo = new THREE.SphereGeometry(0.025, 4, 4);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.0 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.04, 0.7, 0.14);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.04, 0.7, 0.14);
    group.add(eyeL, eyeR);

    // Death Scythe
    const handleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.95, 6);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x18181b });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0.25, 0.48, 0.05);
    handle.rotation.z = Math.PI / 12;
    group.add(handle);

    const bladeCurve = new THREE.TorusGeometry(0.22, 0.03, 6, 12, Math.PI / 2);
    const scytheBladeMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.7 });
    const sBlade = new THREE.Mesh(bladeCurve, scytheBladeMat);
    sBlade.position.set(0.28, 0.92, 0.05);
    sBlade.rotation.y = Math.PI / 2;
    group.add(sBlade);
  } else if (key === 'engineer') {
    // Steampunk Artificer
    const torsoGeo = new THREE.BoxGeometry(0.32, 0.42, 0.24);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.36;
    torso.castShadow = true;
    group.add(torso);

    // Steam Boiler Backpack
    const boilerGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.32, 8);
    const boilerMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 });
    const boiler = new THREE.Mesh(boilerGeo, boilerMat);
    boiler.position.set(0, 0.44, -0.16);
    group.add(boiler);

    // Dual Goggles
    const goggleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.04, 8);
    goggleGeo.rotateX(Math.PI / 2);
    const goggleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.8 });
    const g1 = new THREE.Mesh(goggleGeo, goggleMat);
    g1.position.set(-0.06, 0.68, 0.14);
    const g2 = new THREE.Mesh(goggleGeo, goggleMat);
    g2.position.set(0.06, 0.68, 0.14);
    group.add(g1, g2);

    // Mechanical Wrench / Hammer
    const wrenchGeo = new THREE.BoxGeometry(0.06, 0.62, 0.06);
    const wrenchMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85 });
    const wrench = new THREE.Mesh(wrenchGeo, wrenchMat);
    wrench.position.set(0.26, 0.44, 0.08);
    wrench.rotation.z = Math.PI / 8;
    group.add(wrench);
  } else if (key === 'rune_mage') {
    // Glyphic Sage
    const robeGeo = new THREE.ConeGeometry(0.3, 0.54, 6);
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4 });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.36;
    robe.castShadow = true;
    group.add(robe);

    // Head with runic crown
    const headGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x1e40af, emissiveIntensity: 0.4 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.68;
    group.add(head);

    // Floating Ancient Grimoire (Hovering)
    const bookGeo = new THREE.BoxGeometry(0.26, 0.06, 0.18);
    const bookMat = new THREE.MeshStandardMaterial({ color: 0x854d0e });
    const book = new THREE.Mesh(bookGeo, bookMat);
    book.position.set(-0.26, 0.46, 0.12);
    book.name = 'spinningOrb';
    group.add(book);

    const runePageGeo = new THREE.PlaneGeometry(0.22, 0.15);
    const runePageMat = new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x06b6d4, emissiveIntensity: 0.8 });
    const page = new THREE.Mesh(runePageGeo, runePageMat);
    page.position.set(-0.26, 0.5, 0.12);
    page.rotation.x = -Math.PI / 2;
    group.add(page);
  } else if (key === 'berserker') {
    // Brutal Marauder
    const torsoGeo = new THREE.BoxGeometry(0.42, 0.46, 0.26);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.9 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.38;
    torso.castShadow = true;
    group.add(torso);

    // Horned Helm
    const helmGeo = new THREE.BoxGeometry(0.26, 0.26, 0.26);
    const helmMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, metalness: 0.6 });
    const helm = new THREE.Mesh(helmGeo, helmMat);
    helm.position.y = 0.74;
    group.add(helm);

    const hornGeo = new THREE.ConeGeometry(0.06, 0.24, 4);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
    const hornL = new THREE.Mesh(hornGeo, hornMat);
    hornL.position.set(-0.16, 0.86, 0.05);
    hornL.rotation.z = Math.PI / 4;
    const hornR = new THREE.Mesh(hornGeo, hornMat);
    hornR.position.set(0.16, 0.86, 0.05);
    hornR.rotation.z = -Math.PI / 4;
    group.add(hornL, hornR);

    // Double-Bitted Greataxe
    const axeShaft = new THREE.CylinderGeometry(0.035, 0.035, 0.85, 6);
    const axeMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
    const shaft = new THREE.Mesh(axeShaft, axeMat);
    shaft.position.set(0.3, 0.52, 0.12);
    shaft.rotation.x = Math.PI / 6;
    group.add(shaft);

    const bladeGeo = new THREE.BoxGeometry(0.05, 0.32, 0.28);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(0.3, 0.82, 0.24);
    blade.rotation.x = Math.PI / 6;
    group.add(blade);

  // ==========================================
  // MONSTERS (12 Custom Thematic Low-Poly Models)
  // ==========================================
  } else if (key === 'goblin') {
    // Scrawny Goblin
    const bodyGeo = new THREE.SphereGeometry(0.24, 8, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.32;
    body.scale.set(0.85, 1.1, 0.85);
    body.castShadow = true;
    group.add(body);

    // Floppy ears
    const earGeo = new THREE.ConeGeometry(0.07, 0.26, 4);
    const earMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
    const earL = new THREE.Mesh(earGeo, earMat);
    earL.position.set(-0.25, 0.44, 0);
    earL.rotation.z = Math.PI / 2.5;
    const earR = new THREE.Mesh(earGeo, earMat);
    earR.position.set(0.25, 0.44, 0);
    earR.rotation.z = -Math.PI / 2.5;
    group.add(earL, earR);

    // Beady yellow eyes
    const eyeGeo = new THREE.SphereGeometry(0.03, 4, 4);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.8 });
    const eL = new THREE.Mesh(eyeGeo, eyeMat);
    eL.position.set(-0.07, 0.42, 0.2);
    const eR = new THREE.Mesh(eyeGeo, eyeMat);
    eR.position.set(0.07, 0.42, 0.2);
    group.add(eL, eR);

    // Jagged Cleaver
    const cleaverGeo = new THREE.BoxGeometry(0.03, 0.32, 0.12);
    const cleaverMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const cleaver = new THREE.Mesh(cleaverGeo, cleaverMat);
    cleaver.position.set(0.24, 0.35, 0.1);
    group.add(cleaver);
  } else if (key === 'orc') {
    // Muscular Orc Brute
    const bodyGeo = new THREE.BoxGeometry(0.46, 0.48, 0.32);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.4;
    body.castShadow = true;
    group.add(body);

    // Head with tusks
    const headGeo = new THREE.BoxGeometry(0.28, 0.28, 0.28);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.y = 0.74;
    group.add(head);

    const tuskGeo = new THREE.ConeGeometry(0.03, 0.12, 4);
    const tuskMat = new THREE.MeshStandardMaterial({ color: 0xfef08a });
    const tL = new THREE.Mesh(tuskGeo, tuskMat);
    tL.position.set(-0.08, 0.66, 0.16);
    const tR = new THREE.Mesh(tuskGeo, tuskMat);
    tR.position.set(0.08, 0.66, 0.16);
    group.add(tL, tR);

    // Heavy Spiked War Club
    const clubGeo = new THREE.CylinderGeometry(0.08, 0.04, 0.6, 6);
    const clubMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, metalness: 0.7 });
    const club = new THREE.Mesh(clubGeo, clubMat);
    club.position.set(0.32, 0.5, 0.1);
    club.rotation.z = Math.PI / 12;
    group.add(club);
  } else if (key === 'spider') {
    // Shadow Spider
    const abdomenGeo = new THREE.SphereGeometry(0.28, 8, 8);
    const abdomenMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.6 });
    const abdomen = new THREE.Mesh(abdomenGeo, abdomenMat);
    abdomen.position.set(0, 0.28, -0.16);
    abdomen.scale.set(1, 0.8, 1.2);
    abdomen.castShadow = true;
    group.add(abdomen);

    const headGeo = new THREE.SphereGeometry(0.18, 6, 6);
    const head = new THREE.Mesh(headGeo, abdomenMat);
    head.position.set(0, 0.24, 0.14);
    group.add(head);

    // 4 Glowing Red Eyes
    const eyeGeo = new THREE.SphereGeometry(0.025, 4, 4);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.0 });
    [-0.06, -0.02, 0.02, 0.06].forEach((xOff) => {
      const e = new THREE.Mesh(eyeGeo, eyeMat);
      e.position.set(xOff, 0.28, 0.3);
      group.add(e);
    });

    // 6 Segmented Spider Legs
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 4);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    [-1, 1].forEach((side) => {
      [-0.1, 0.05, 0.2].forEach((zOff) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(side * 0.28, 0.18, zOff);
        leg.rotation.z = side * (Math.PI / 3);
        group.add(leg);
      });
    });
  } else if (key === 'dark_mage') {
    // Void Sorcerer
    const robeGeo = new THREE.ConeGeometry(0.28, 0.58, 6);
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.36;
    robe.castShadow = true;
    group.add(robe);

    // Shadow Hood with purple glowing eye sockets
    const hoodGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    const hood = new THREE.Mesh(hoodGeo, robeMat);
    hood.position.y = 0.7;
    group.add(hood);

    const eyeGeo = new THREE.BoxGeometry(0.14, 0.04, 0.03);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0xa855f7, emissiveIntensity: 1.0 });
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(0, 0.7, 0.13);
    group.add(eye);

    // Dark Staff with Hovering Skull
    const staff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.85, 4),
      new THREE.MeshStandardMaterial({ color: 0x3f3f46 })
    );
    staff.position.set(0.24, 0.46, 0.05);
    group.add(staff);

    const skull = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.08, 0),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7e22ce, emissiveIntensity: 0.6 })
    );
    skull.position.set(0.24, 0.92, 0.05);
    group.add(skull);
  } else if (key === 'spectral_wolf') {
    // Ethereal Wolf
    const bodyGeo = new THREE.BoxGeometry(0.32, 0.34, 0.62);
    const wolfMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.65,
      transparent: true,
      opacity: 0.85,
    });
    const body = new THREE.Mesh(bodyGeo, wolfMat);
    body.position.y = 0.34;
    body.castShadow = true;
    group.add(body);

    // Wolf Snout & Head
    const headGeo = new THREE.ConeGeometry(0.14, 0.32, 4);
    headGeo.rotateX(Math.PI / 2);
    const head = new THREE.Mesh(headGeo, wolfMat);
    head.position.set(0, 0.44, 0.38);
    group.add(head);

    // Pointed Ears
    const earGeo = new THREE.ConeGeometry(0.05, 0.14, 4);
    const earL = new THREE.Mesh(earGeo, wolfMat);
    earL.position.set(-0.1, 0.6, 0.28);
    const earR = new THREE.Mesh(earGeo, wolfMat);
    earR.position.set(0.1, 0.6, 0.28);
    group.add(earL, earR);

    // 4 Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.26, 4);
    [[-0.14, -0.2], [0.14, -0.2], [-0.14, 0.2], [0.14, 0.2]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, wolfMat);
      leg.position.set(lx, 0.13, lz);
      group.add(leg);
    });
  } else if (key === 'basalt_golem') {
    // Molten Rock Golem
    const bodyGeo = new THREE.DodecahedronGeometry(0.42, 0);
    const golemMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
    const body = new THREE.Mesh(bodyGeo, golemMat);
    body.position.y = 0.44;
    body.castShadow = true;
    group.add(body);

    // Glowing Magma Core / Eye
    const coreGeo = new THREE.OctahedronGeometry(0.14, 0);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xff5722, emissive: 0xff3d00, emissiveIntensity: 1.0 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 0.52, 0.24);
    group.add(core);

    // Boulder Shoulders
    const armGeo = new THREE.DodecahedronGeometry(0.18, 0);
    const armL = new THREE.Mesh(armGeo, golemMat);
    armL.position.set(-0.36, 0.42, 0);
    const armR = new THREE.Mesh(armGeo, golemMat);
    armR.position.set(0.36, 0.42, 0);
    group.add(armL, armR);
  } else if (key === 'thorn_witch') {
    // Dryad of Thorns
    const bodyGeo = new THREE.ConeGeometry(0.24, 0.56, 5);
    const witchMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, witchMat);
    body.position.y = 0.36;
    body.castShadow = true;
    group.add(body);

    // Briar Crown
    const crownGeo = new THREE.TorusGeometry(0.16, 0.03, 4, 12);
    crownGeo.rotateX(Math.PI / 2);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x15803d, emissive: 0x16a34a, emissiveIntensity: 0.6 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = 0.72;
    group.add(crown);

    // Sprouting Wand
    const wand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.025, 0.65, 4),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    wand.position.set(0.24, 0.42, 0.06);
    group.add(wand);
  } else if (key === 'fallen_knight') {
    // Corrupted Dark Knight
    const torsoGeo = new THREE.BoxGeometry(0.36, 0.44, 0.26);
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.85, roughness: 0.25 });
    const torso = new THREE.Mesh(torsoGeo, armorMat);
    torso.position.y = 0.36;
    torso.castShadow = true;
    group.add(torso);

    // Tattered Blood Cape
    const capeGeo = new THREE.PlaneGeometry(0.32, 0.52);
    const capeMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, side: THREE.DoubleSide });
    const cape = new THREE.Mesh(capeGeo, capeMat);
    cape.position.set(0, 0.36, -0.14);
    cape.rotation.x = Math.PI / 16;
    group.add(cape);

    // Horned Helm with Crimson Slit
    const helm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.24), armorMat);
    helm.position.y = 0.7;
    group.add(helm);

    const slit = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.04, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.95 })
    );
    slit.position.set(0, 0.7, 0.12);
    group.add(slit);

    // Corrupted Zweihänder
    const sword = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.78, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x7f1d1d, emissive: 0x991b1b, emissiveIntensity: 0.5, metalness: 0.9 })
    );
    sword.position.set(0.28, 0.52, 0.08);
    group.add(sword);
  } else if (key === 'mimic') {
    // Living Treasure Chest
    const chestGeo = new THREE.BoxGeometry(0.44, 0.26, 0.34);
    const chestMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
    const chest = new THREE.Mesh(chestGeo, chestMat);
    chest.position.y = 0.22;
    chest.castShadow = true;
    group.add(chest);

    // Gilded Iron Brackets
    const trimGeo = new THREE.BoxGeometry(0.46, 0.28, 0.04);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(0, 0.22, 0);
    group.add(trim);

    // Open Lid tilted
    const lidGeo = new THREE.BoxGeometry(0.44, 0.12, 0.34);
    const lid = new THREE.Mesh(lidGeo, chestMat);
    lid.position.set(0, 0.44, -0.06);
    lid.rotation.x = -Math.PI / 6;
    group.add(lid);

    // Ivory Teeth inside
    const teethGeo = new THREE.ConeGeometry(0.04, 0.1, 4);
    teethGeo.rotateX(Math.PI);
    const teethMat = new THREE.MeshStandardMaterial({ color: 0xfef08a });
    [-0.14, 0, 0.14].forEach((tx) => {
      const tooth = new THREE.Mesh(teethGeo, teethMat);
      tooth.position.set(tx, 0.42, 0.08);
      group.add(tooth);
    });

    // Flopping Crimson Tongue
    const tongueGeo = new THREE.BoxGeometry(0.12, 0.04, 0.22);
    const tongueMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const tongue = new THREE.Mesh(tongueGeo, tongueMat);
    tongue.position.set(0, 0.32, 0.18);
    tongue.rotation.x = Math.PI / 8;
    group.add(tongue);
  } else if (key === 'volcanic_drake') {
    // Volcanic Drake (Dragon)
    const bodyGeo = new THREE.ConeGeometry(0.32, 0.65, 6);
    bodyGeo.rotateX(Math.PI / 3);
    const dragonMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 });
    const body = new THREE.Mesh(bodyGeo, dragonMat);
    body.position.set(0, 0.38, 0.05);
    body.castShadow = true;
    group.add(body);

    // Draconic Snout with glowing magma throat
    const headGeo = new THREE.ConeGeometry(0.16, 0.34, 4);
    headGeo.rotateX(Math.PI / 2);
    const head = new THREE.Mesh(headGeo, dragonMat);
    head.position.set(0, 0.52, 0.36);
    group.add(head);

    const throatGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const throatMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 1.0 });
    const throat = new THREE.Mesh(throatGeo, throatMat);
    throat.position.set(0, 0.52, 0.32);
    group.add(throat);

    // Wings
    const wingGeo = new THREE.BoxGeometry(0.04, 0.44, 0.38);
    const wingL = new THREE.Mesh(wingGeo, dragonMat);
    wingL.position.set(-0.28, 0.54, -0.05);
    wingL.rotation.y = -Math.PI / 4;
    const wingR = new THREE.Mesh(wingGeo, dragonMat);
    wingR.position.set(0.28, 0.54, -0.05);
    wingR.rotation.y = Math.PI / 4;
    group.add(wingL, wingR);
  } else if (key === 'devourer_boss' || unit.isMiniBoss) {
    // MINI-BOSS: Colossal Devourer
    const bodyGeo = new THREE.DodecahedronGeometry(0.58, 0);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.62;
    body.castShadow = true;
    group.add(body);

    // Molten Glowing Maw Core
    const coreGeo = new THREE.OctahedronGeometry(0.22, 0);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.9 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 0.72, 0.28);
    group.add(core);

    // Pincers / Jaws
    const jawGeo = new THREE.ConeGeometry(0.2, 0.45, 4);
    const jawMat = new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.6 });
    const jL = new THREE.Mesh(jawGeo, jawMat);
    jL.position.set(-0.26, 0.72, 0.4);
    jL.rotation.z = -Math.PI / 4;
    const jR = new THREE.Mesh(jawGeo, jawMat);
    jR.position.set(0.26, 0.72, 0.4);
    jR.rotation.z = Math.PI / 4;
    group.add(jL, jR);
  } else if (key === 'astaroth_boss' || unit.isBoss) {
    // FINAL BOSS: Astaroth, Archdemon of the Abyss
    const bodyGeo = new THREE.CylinderGeometry(0.42, 0.56, 1.35, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3b0764, metalness: 0.8, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.78;
    body.castShadow = true;
    group.add(body);

    // Great Demon Horns
    const hornGeo = new THREE.ConeGeometry(0.08, 0.42, 6);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.7 });
    const hL = new THREE.Mesh(hornGeo, hornMat);
    hL.position.set(-0.25, 1.45, 0.1);
    hL.rotation.z = Math.PI / 5;
    const hR = new THREE.Mesh(hornGeo, hornMat);
    hR.position.set(0.25, 1.45, 0.1);
    hR.rotation.z = -Math.PI / 5;
    group.add(hL, hR);

    // Expansive Bat Wings with Glowing Runic Veins
    const wingGeo = new THREE.BoxGeometry(0.06, 0.95, 0.85);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x7e22ce,
      emissive: 0x6b21a8,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    const w1 = new THREE.Mesh(wingGeo, wingMat);
    w1.position.set(-0.48, 0.95, -0.22);
    w1.rotation.y = -Math.PI / 5;
    const w2 = new THREE.Mesh(wingGeo, wingMat);
    w2.position.set(0.48, 0.95, -0.22);
    w2.rotation.y = Math.PI / 5;
    group.add(w1, w2);

    // Abyssal Crown
    const crownGeo = new THREE.TorusGeometry(0.24, 0.03, 6, 16);
    crownGeo.rotateX(Math.PI / 2);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0xa855f7, emissiveIntensity: 1.0 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = 1.48;
    group.add(crown);
  } else {
    // Generic Dynamic Fallback Model
    const bodyGeo = new THREE.CapsuleGeometry(0.24, 0.42, 8, 12);
    const hexColor = parseInt(unit.color.replace('#', '0x'), 16) || 0xe65353;
    const bodyMat = new THREE.MeshStandardMaterial({ color: hexColor, roughness: 0.5, metalness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.42;
    body.castShadow = true;
    group.add(body);
  }

  return group;
}
