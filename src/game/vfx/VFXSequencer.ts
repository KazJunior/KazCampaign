import * as THREE from 'three';
import type { VFXSequence, VFXProjectileStep } from './vfxTypes';
import {
  createMeteorMesh,
  createFirePillarMesh,
  createGroundCrater,
  createIceSpikeMesh,
  createCastingRuneMesh,
  disposeHierarchy,
} from './VFXPrimitives';

export interface VFXSequencerDependencies {
  scene: THREE.Scene;
  particlesGroup: THREE.Group;
  addTask: (task: {
    id: string;
    type: 'move' | 'attack' | 'skill' | 'heal' | 'death' | 'hit' | 'projectile';
    startTime: number;
    duration: number;
    onUpdate: (progress: number) => void;
    onComplete: () => void;
    isComplete: boolean;
  }) => void;
  onCameraShake?: (intensity: number, duration: number) => void;
  spawnFireParticles: (x: number, y: number, z: number, count: number) => void;
  spawnFireExplosion: (x: number, y: number, z: number, isBig: boolean) => void;
  spawnIceShatter: (x: number, y: number, z: number, isBig: boolean) => void;
  spawnElectricSparks: (x: number, y: number, z: number, color: number) => void;
  spawnGoldenStars: (x: number, y: number, z: number, count: number) => void;
  spawnDustParticles: (x: number, y: number, z: number, count: number) => void;
  spawnSlashParticles: (x: number, y: number, z: number, color: number) => void;
  spawnParticleDot: (x: number, y: number, z: number, color: number, size: number, decay: number) => void;
  playHitReaction: (targetObj: THREE.Object3D, damageType: 'physical' | 'magical' | 'healing', duration?: number) => Promise<void>;
  playAoEAnimation: (centerX: number, centerY: number, radius: number, color?: number, duration?: number) => Promise<void>;
}

export class VFXSequencer {
  private deps: VFXSequencerDependencies;
  private idCounter = 0;

  constructor(dependencies: VFXSequencerDependencies) {
    this.deps = dependencies;
  }

  /**
   * Executes a VFX sequence timeline
   */
  playSequence(
    sequence: VFXSequence,
    attackerObj: THREE.Object3D,
    attackerX: number,
    attackerY: number,
    targetObj: THREE.Object3D | undefined,
    targetX: number,
    targetY: number,
    aoeRadius: number = 0,
    damageType: 'physical' | 'magical' | 'healing' = 'magical'
  ): Promise<void> {
    return new Promise((resolve) => {
      const casterPos = new THREE.Vector3(attackerX + 0.5, 0.5, attackerY + 0.5);
      const targetPos = new THREE.Vector3(targetX + 0.5, 0.35, targetY + 0.5);

      // Rotate caster toward target
      const dir = new THREE.Vector3().subVectors(targetPos, casterPos).normalize();
      if (dir.x !== 0 || dir.z !== 0) {
        attackerObj.rotation.y = Math.atan2(dir.x, dir.z);
      }

      // Schedule Screen Shake
      if (sequence.screenShake) {
        const shake = sequence.screenShake;
        const delay = shake.delayMs ?? 200;
        setTimeout(() => {
          this.deps.onCameraShake?.(shake.intensity, shake.durationMs);
        }, delay);
      }

      // Schedule Hit Reaction
      if (targetObj && sequence.hitReactionDelayMs && damageType !== 'healing') {
        setTimeout(() => {
          this.deps.playHitReaction(targetObj, damageType, 300);
        }, sequence.hitReactionDelayMs);
      }

      // 1. Cast Anticipation Phase
      if (sequence.cast) {
        this.runCastPhase(sequence.cast, casterPos);
      }

      // 2. Main Effect Phase
      switch (sequence.type) {
        case 'meteor_shower':
          this.runMeteorShower(sequence, casterPos, targetPos, targetX, targetY, aoeRadius, resolve);
          break;

        case 'fire_pillar':
          this.runFirePillar(sequence, targetPos, aoeRadius, resolve);
          break;

        case 'combustion':
          this.runCombustion(sequence, targetObj, targetPos, resolve);
          break;

        case 'flamethrower':
          this.runFlamethrower(sequence, casterPos, targetPos, resolve);
          break;

        case 'ice_spikes':
          this.runIceSpikes(sequence, targetPos, aoeRadius, resolve);
          break;

        default:
          this.runDefaultSequence(sequence, casterPos, targetPos, aoeRadius, resolve);
          break;
      }
    });
  }

  // ==========================================
  // PHASE: CAST ANTICIPATION
  // ==========================================
  private runCastPhase(
    cast: NonNullable<VFXSequence['cast']>,
    casterPos: THREE.Vector3
  ): void {
    const rune = createCastingRuneMesh(cast.ringRadius ?? 0.8, cast.color);
    rune.position.set(casterPos.x, 0.04, casterPos.z);
    this.deps.particlesGroup.add(rune);

    this.deps.addTask({
      id: `vfx_cast_${this.idCounter++}`,
      type: 'skill',
      startTime: Date.now(),
      duration: cast.durationMs,
      isComplete: false,
      onUpdate: (progress) => {
        rune.rotation.y += 0.08;
        const scale = 0.5 + progress * 0.7;
        rune.scale.set(scale, 1, scale);
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(rune);
        disposeHierarchy(rune);
      },
    });
  }

  // ==========================================
  // 1. METEOR SHOWER (Multi-Impact Sky Drop)
  // ==========================================
  private runMeteorShower(
    sequence: VFXSequence,
    _casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    targetX: number,
    targetY: number,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const steps = sequence.projectiles && sequence.projectiles.length > 0
      ? sequence.projectiles
      : [{ delayMs: 0, fromSky: true, skyHeight: 6.5, skyAngleDeg: 60, size: 0.28, color: 0xff4500 }];

    let completedCount = 0;
    const totalCount = steps.length;

    steps.forEach((step, idx) => {
      setTimeout(() => {
        this.spawnSingleMeteor(step, targetPos, idx === totalCount - 1, () => {
          completedCount++;
          if (completedCount >= totalCount) {
            // Expanding fire AoE shockwave
            if (sequence.impact?.shockwave) {
              const rad = Math.max(1, aoeRadius);
              this.deps.playAoEAnimation(targetX, targetY, rad, sequence.impact.shockwaveColor ?? 0xff4500, 420);
            }
            onCompleteCallback();
          }
        });
      }, step.delayMs);
    });
  }

  private spawnSingleMeteor(
    step: VFXProjectileStep,
    targetPos: THREE.Vector3,
    isFinal: boolean,
    onLanded: () => void
  ): void {
    const offsetX = step.targetOffset?.x ?? 0;
    const offsetZ = step.targetOffset?.z ?? 0;
    const landing = new THREE.Vector3(targetPos.x + offsetX, 0.35, targetPos.z + offsetZ);

    const skyHeight = step.skyHeight ?? 6.5;
    const skyDist = skyHeight * 0.55;
    const start = new THREE.Vector3(landing.x - skyDist, skyHeight, landing.z - skyDist);

    const meteor = createMeteorMesh(step.size ?? 0.28, step.color ?? 0xff4500);
    meteor.position.copy(start);
    this.deps.particlesGroup.add(meteor);

    const duration = 400;

    this.deps.addTask({
      id: `vfx_meteor_${this.idCounter++}`,
      type: 'projectile',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        // Accelerated fall (gravity feel)
        const t = progress * progress;
        meteor.position.lerpVectors(start, landing, t);
        meteor.rotation.x += 0.25;
        meteor.rotation.y += 0.3;

        // Smoke & spark trail
        this.deps.spawnFireParticles(meteor.position.x, meteor.position.y, meteor.position.z, 2);
        if (Math.random() < 0.4) {
          this.deps.spawnDustParticles(meteor.position.x, meteor.position.y, meteor.position.z, 1);
        }
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(meteor);
        disposeHierarchy(meteor);

        // Crater Decal on Ground
        const crater = createGroundCrater(0.55 + (step.size ?? 0.28) * 1.5, 0xff4500);
        crater.position.set(landing.x, 0.03, landing.z);
        this.deps.particlesGroup.add(crater);

        // Fade crater out over 1.2s
        this.deps.addTask({
          id: `vfx_crater_${this.idCounter++}`,
          type: 'skill',
          startTime: Date.now(),
          duration: 1200,
          isComplete: false,
          onUpdate: (p) => {
            if (crater.material instanceof THREE.MeshBasicMaterial) {
              crater.material.opacity = Math.max(0, 0.9 * (1 - p));
            }
          },
          onComplete: () => {
            this.deps.particlesGroup.remove(crater);
            disposeHierarchy(crater);
          },
        });

        // Detonation explosion & camera shake
        this.deps.spawnFireExplosion(landing.x, 0.4, landing.z, isFinal);
        this.deps.spawnDustParticles(landing.x, 0.15, landing.z, 8);

        onLanded();
      },
    });
  }

  // ==========================================
  // 2. FIRE PILLAR (Rising Ground Eruption)
  // ==========================================
  private runFirePillar(
    sequence: VFXSequence,
    targetPos: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const pillarConfig = sequence.pillar ?? { height: 4.8, radius: 0.85, color: 0xff3b00, innerCoreColor: 0xfef08a };
    const rad = aoeRadius > 0 ? Math.max(pillarConfig.radius, aoeRadius * 0.75) : pillarConfig.radius;
    const pillar = createFirePillarMesh(rad, pillarConfig.height, pillarConfig.color, pillarConfig.innerCoreColor);

    pillar.position.set(targetPos.x, 0, targetPos.z);
    pillar.scale.set(1, 0.05, 1);
    this.deps.particlesGroup.add(pillar);

    const duration = sequence.durationMs || 650;

    this.deps.addTask({
      id: `vfx_pillar_${this.idCounter++}`,
      type: 'skill',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        // Eruption Phase (0 -> 0.35): rapid growth up
        if (progress < 0.35) {
          const t = progress / 0.35;
          const scaleY = Math.sin((t * Math.PI) / 2) * 1.15;
          pillar.scale.set(1 + scaleY * 0.1, scaleY, 1 + scaleY * 0.1);
        } else if (progress < 0.65) {
          // Climax Phase (0.35 -> 0.65): swirling intense flames
          pillar.scale.set(1.05, 1.0, 1.05);
        } else {
          // Dissipation Phase (0.65 -> 1.0): fades out
          const fadeT = (progress - 0.65) / 0.35;
          pillar.scale.set(1 - fadeT * 0.3, Math.max(0.01, 1 - fadeT), 1 - fadeT * 0.3);
          pillar.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
              child.material.opacity = Math.max(0, 0.8 * (1 - fadeT));
            }
          });
        }

        // Swirl rotation in opposite directions
        const outer = pillar.userData.outerMesh as THREE.Mesh;
        const inner = pillar.userData.innerMesh as THREE.Mesh;
        if (outer) outer.rotation.y += 0.08;
        if (inner) inner.rotation.y -= 0.12;

        // Rising embers
        if (Math.random() < 0.8) {
          this.deps.spawnFireParticles(targetPos.x, Math.random() * 2.5, targetPos.z, 2);
        }
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(pillar);
        disposeHierarchy(pillar);
        this.deps.spawnFireExplosion(targetPos.x, 0.4, targetPos.z, false);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 3. COMBUSTION (Direct Internal Thermal Burst)
  // ==========================================
  private runCombustion(
    sequence: VFXSequence,
    targetObj: THREE.Object3D | undefined,
    targetPos: THREE.Vector3,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 580;

    // Glowing heat aura ring around target
    const ringGeo = new THREE.RingGeometry(0.2, 0.7, 16);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(targetPos.x, 0.05, targetPos.z);
    this.deps.particlesGroup.add(ring);

    this.deps.addTask({
      id: `vfx_combust_${this.idCounter++}`,
      type: 'skill',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        if (progress < 0.45) {
          // Sizzle / thermal buildup on target
          const pulse = 1 + Math.sin(progress * 40) * 0.15;
          if (targetObj) targetObj.scale.setScalar(pulse);
          ring.scale.setScalar(1 - progress * 0.8); // Rings shrink inward (implosion tension)
          this.deps.spawnParticleDot(targetPos.x, 0.5 + Math.random() * 0.4, targetPos.z, 0xff4500, 0.035, 0.03);
        } else if (progress < 0.55) {
          // Detonation frame
          if (targetObj) targetObj.scale.setScalar(1);
          ring.scale.setScalar(1 + (progress - 0.45) * 8);
          ringMat.opacity = Math.max(0, 1 - (progress - 0.45) * 10);
        } else {
          // Smoke dispersal
          ringMat.opacity = 0;
          if (targetObj) targetObj.scale.setScalar(1);
        }
      },
      onComplete: () => {
        if (targetObj) targetObj.scale.setScalar(1);
        this.deps.particlesGroup.remove(ring);
        ringGeo.dispose();
        ringMat.dispose();
        this.deps.spawnFireExplosion(targetPos.x, 0.5, targetPos.z, true);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 4. FLAMETHROWER (Continuous Flame Stream)
  // ==========================================
  private runFlamethrower(
    sequence: VFXSequence,
    casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 720;
    const stream = sequence.stream ?? { particleCount: 36, spreadAngleDeg: 28, color: 0xff4500, flowDurationMs: 480 };

    this.deps.addTask({
      id: `vfx_flame_stream_${this.idCounter++}`,
      type: 'skill',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        // Active streaming phase
        if (progress < (stream.flowDurationMs / duration)) {
          for (let i = 0; i < 3; i++) {
            const t = Math.random();
            const px = THREE.MathUtils.lerp(casterPos.x, targetPos.x, t) + (Math.random() - 0.5) * 0.35 * t;
            const py = THREE.MathUtils.lerp(casterPos.y, targetPos.y, t) + (Math.random() - 0.5) * 0.25;
            const pz = THREE.MathUtils.lerp(casterPos.z, targetPos.z, t) + (Math.random() - 0.5) * 0.35 * t;
            this.deps.spawnFireParticles(px, py, pz, 1);
          }
        }
      },
      onComplete: () => {
        this.deps.spawnFireExplosion(targetPos.x, 0.4, targetPos.z, false);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 5. ICE SPIKES (Glacial Ground Eruption)
  // ==========================================
  private runIceSpikes(
    sequence: VFXSequence,
    targetPos: THREE.Vector3,
    _aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 620;
    const spikeGroup = new THREE.Group();

    // Spawn cluster of 4 jagged ice spikes
    const offsets = [
      { x: 0, z: 0, h: 1.25, r: 0.24 },
      { x: -0.25, z: 0.2, h: 0.95, r: 0.18 },
      { x: 0.28, z: -0.18, h: 1.05, r: 0.2 },
      { x: -0.15, z: -0.22, h: 0.8, r: 0.16 },
    ];

    offsets.forEach((o) => {
      const spike = createIceSpikeMesh(o.h, o.r, 0x38bdf8);
      spike.position.set(o.x, -o.h, o.z);
      spike.rotation.y = Math.random() * Math.PI;
      spike.rotation.z = (Math.random() - 0.5) * 0.2;
      spikeGroup.add(spike);
    });

    spikeGroup.position.set(targetPos.x, 0, targetPos.z);
    this.deps.particlesGroup.add(spikeGroup);

    this.deps.addTask({
      id: `vfx_ice_spikes_${this.idCounter++}`,
      type: 'skill',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        if (progress < 0.3) {
          // Sudden thrust upward from below ground
          const t = progress / 0.3;
          spikeGroup.position.y = (t - 1) * 0.2;
        } else if (progress < 0.75) {
          spikeGroup.position.y = 0;
        } else {
          // Shatter and sink
          const fadeT = (progress - 0.75) / 0.25;
          spikeGroup.scale.setScalar(Math.max(0.01, 1 - fadeT));
        }
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(spikeGroup);
        disposeHierarchy(spikeGroup);
        this.deps.spawnIceShatter(targetPos.x, 0.4, targetPos.z, true);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // FALLBACK SEQUENCE RUNNER
  // ==========================================
  private runDefaultSequence(
    sequence: VFXSequence,
    _casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    _aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 500;

    this.deps.addTask({
      id: `vfx_generic_${this.idCounter++}`,
      type: 'skill',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: () => {
        // Lightweight sparkles
        this.deps.spawnParticleDot(targetPos.x, targetPos.y + 0.2, targetPos.z, 0xb58aff, 0.04, 0.03);
      },
      onComplete: () => {
        onCompleteCallback();
      },
    });
  }
}
