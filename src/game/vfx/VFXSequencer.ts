import * as THREE from 'three';
import type { VFXSequence, VFXProjectileStep, VFXCasterMotion } from './vfxTypes';
import {
  createMeteorMesh,
  createFirePillarMesh,
  createGroundCrater,
  createIceSpikeMesh,
  createCastingRuneMesh,
  createSlashWaveMesh,
  createProjectileArrowMesh,
  createBlackHoleMesh,
  createShieldDomeMesh,
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

      // Rotate caster toward target if not self-targeting
      const dir = new THREE.Vector3().subVectors(targetPos, casterPos);
      dir.y = 0;
      if (dir.lengthSq() > 0.001) {
        dir.normalize();
        attackerObj.rotation.y = Math.atan2(dir.x, dir.z);
      } else {
        dir.set(0, 0, 1);
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

      // 2. Caster Miniature 3D Choreography
      const motion = sequence.casterMotion ?? this.inferDefaultMotion(sequence);
      if (motion && motion !== 'none') {
        this.runCasterChoreography(
          motion,
          attackerObj,
          attackerX,
          attackerY,
          targetX,
          targetY,
          sequence.durationMs || 550,
          sequence.primaryColor ?? 0x9d4edd
        );
      }

      const finish = () => {
        this.triggerImpactEffects(sequence, targetPos, targetX, targetY, aoeRadius);
        resolve();
      };

      // 3. Main Effect Phase
      switch (sequence.type) {
        case 'meteor_shower':
          this.runMeteorShower(sequence, casterPos, targetPos, targetX, targetY, aoeRadius, resolve);
          break;

        case 'fire_pillar':
          this.runFirePillar(sequence, targetPos, aoeRadius, finish);
          break;

        case 'combustion':
          this.runCombustion(sequence, targetObj, targetPos, finish);
          break;

        case 'flamethrower':
          this.runFlamethrower(sequence, casterPos, targetPos, finish);
          break;

        case 'ice_spikes':
          this.runIceSpikes(sequence, targetPos, aoeRadius, finish);
          break;

        case 'frost_nova':
          this.runFrostNova(sequence, targetPos, aoeRadius, finish);
          break;

        case 'lightning_storm':
          this.runLightningStorm(sequence, casterPos, targetPos, aoeRadius, finish);
          break;

        case 'holy_pillar':
          this.runHolyPillar(sequence, targetObj, targetPos, aoeRadius, finish);
          break;

        case 'void_miasma':
          this.runVoidMiasma(sequence, casterPos, targetPos, aoeRadius, finish);
          break;

        case 'heavy_slam':
          this.runHeavySlam(sequence, casterPos, targetPos, aoeRadius, finish);
          break;

        case 'blade_tempest':
          this.runBladeTempest(sequence, casterPos, targetPos, dir, aoeRadius, finish);
          break;

        case 'sniper_shot':
          this.runSniperShot(sequence, casterPos, targetPos, dir, finish);
          break;

        case 'arrow_volley':
          this.runArrowVolley(sequence, casterPos, targetPos, aoeRadius, finish);
          break;

        case 'cannon_barrage':
          this.runCannonBarrage(sequence, casterPos, targetPos, aoeRadius, finish);
          break;

        case 'black_hole':
          this.runBlackHole(sequence, targetPos, aoeRadius, finish);
          break;

        case 'crimson_horizon':
          this.runCrimsonHorizon(sequence, casterPos, targetPos, aoeRadius, finish);
          break;

        case 'dimensional_wave':
          this.runDimensionalWave(sequence, casterPos, targetPos, dir, aoeRadius, finish);
          break;

        case 'chain_hook':
          this.runChainHook(sequence, casterPos, targetPos, finish);
          break;

        case 'sonic_symphony':
          this.runSonicSymphony(sequence, casterPos, targetPos, aoeRadius, finish);
          break;

        case 'shield_bastion':
          this.runShieldBastion(sequence, targetPos, aoeRadius, finish);
          break;

        case 'generic_melee':
          this.runBladeTempest(sequence, casterPos, targetPos, dir, aoeRadius, finish);
          break;

        case 'generic_magic':
        default:
          this.runGenericMagic(sequence, casterPos, targetPos, aoeRadius, finish);
          break;
      }
    });
  }

  private inferDefaultMotion(sequence: VFXSequence): VFXCasterMotion {
    switch (sequence.type) {
      case 'heavy_slam':
        return 'leap_slam';
      case 'blade_tempest':
      case 'generic_melee':
        return sequence.slashStyle === 'spin' ? 'whirlwind' : 'lunge';
      case 'sniper_shot':
      case 'cannon_barrage':
        return 'recoil_shot';
      case 'shield_bastion':
        return 'stance_guard';
      case 'crimson_horizon':
      case 'black_hole':
      case 'lightning_storm':
      case 'frost_nova':
        return 'levitate_cast';
      default:
        return 'none';
    }
  }

  // ==========================================
  // CASTER 3D MINIATURE CHOREOGRAPHY
  // ==========================================
  private runCasterChoreography(
    motion: VFXCasterMotion,
    attackerObj: THREE.Object3D,
    attackerX: number,
    attackerY: number,
    targetX: number,
    targetY: number,
    durationMs: number,
    color: number
  ): void {
    const startPos = new THREE.Vector3(attackerX + 0.5, 0, attackerY + 0.5);
    const targetGround = new THREE.Vector3(targetX + 0.5, 0, targetY + 0.5);
    const diff = new THREE.Vector3().subVectors(targetGround, startPos);
    const dist = diff.length();
    const dir = dist > 0.01 ? diff.clone().normalize() : new THREE.Vector3(0, 0, 1);
    const origRotY = attackerObj.rotation.y;

    const strikeStop = dist > 0.5
      ? new THREE.Vector3(
          targetGround.x - dir.x * 0.48,
          0,
          targetGround.z - dir.z * 0.48
        )
      : startPos.clone().addScaledVector(dir, 0.35);

    const passThroughPos = new THREE.Vector3(
      targetGround.x + dir.x * 0.55,
      0,
      targetGround.z + dir.z * 0.55
    );

    this.deps.addTask({
      id: `vfx_caster_motion_${this.idCounter++}`,
      type: 'attack',
      startTime: Date.now(),
      duration: durationMs,
      isComplete: false,
      onUpdate: (progress) => {
        switch (motion) {
          case 'lunge': {
            const lungePos = startPos.clone().addScaledVector(dir, Math.min(0.65, dist * 0.65 || 0.45));
            if (progress < 0.4) {
              const t = progress / 0.4;
              attackerObj.position.lerpVectors(startPos, lungePos, t);
              attackerObj.rotation.x = Math.sin(t * Math.PI) * 0.25;
            } else if (progress < 0.65) {
              attackerObj.position.copy(lungePos);
              attackerObj.rotation.x = 0.12;
            } else {
              const t = (progress - 0.65) / 0.35;
              attackerObj.position.lerpVectors(lungePos, startPos, t);
              attackerObj.rotation.x = 0;
            }
            break;
          }

          case 'dash_through': {
            if (progress < 0.28) {
              // Fast Iaijutsu dash through the enemy
              const t = progress / 0.28;
              attackerObj.position.lerpVectors(startPos, passThroughPos, t);
              attackerObj.rotation.x = 0.32;
              this.deps.spawnParticleDot(attackerObj.position.x, 0.35, attackerObj.position.z, color, 0.045, 0.04);
            } else if (progress < 0.72) {
              // Pose behind target while slashes detonate
              attackerObj.position.copy(passThroughPos);
              attackerObj.rotation.x = 0.08;
            } else {
              // Return to origin
              const t = (progress - 0.72) / 0.28;
              attackerObj.position.lerpVectors(passThroughPos, startPos, t);
              attackerObj.rotation.x = 0;
            }
            break;
          }

          case 'leap_slam': {
            if (progress < 0.48) {
              const t = progress / 0.48;
              attackerObj.position.lerpVectors(startPos, strikeStop, t);
              attackerObj.position.y = Math.sin(t * Math.PI) * 1.15;
              attackerObj.rotation.x = -Math.sin(t * Math.PI) * 0.45;
            } else if (progress < 0.7) {
              attackerObj.position.copy(strikeStop);
              attackerObj.position.y = 0;
              attackerObj.rotation.x = 0.25;
            } else {
              const t = (progress - 0.7) / 0.3;
              attackerObj.position.lerpVectors(strikeStop, startPos, t);
              attackerObj.position.y = Math.sin(t * Math.PI) * 0.3;
              attackerObj.rotation.x = 0;
            }
            break;
          }

          case 'sky_dragoon': {
            if (progress < 0.32) {
              // Launch high into the sky
              const t = progress / 0.32;
              attackerObj.position.set(startPos.x, t * t * 5.2, startPos.z);
              attackerObj.rotation.x = -0.5;
              this.deps.spawnParticleDot(startPos.x, attackerObj.position.y, startPos.z, color, 0.05, 0.04);
            } else if (progress < 0.58) {
              // Meteoric dive onto target
              const t = (progress - 0.32) / 0.26;
              attackerObj.position.lerpVectors(
                new THREE.Vector3(strikeStop.x, 5.2, strikeStop.z),
                strikeStop,
                t * t
              );
              attackerObj.rotation.x = 0.55;
              this.deps.spawnParticleDot(attackerObj.position.x, attackerObj.position.y + 0.3, attackerObj.position.z, color, 0.05, 0.04);
            } else if (progress < 0.75) {
              attackerObj.position.copy(strikeStop);
              attackerObj.rotation.x = 0.2;
            } else {
              const t = (progress - 0.75) / 0.25;
              attackerObj.position.lerpVectors(strikeStop, startPos, t);
              attackerObj.position.y = Math.sin(t * Math.PI) * 0.45;
              attackerObj.rotation.x = 0;
            }
            break;
          }

          case 'whirlwind': {
            attackerObj.rotation.y = origRotY + progress * Math.PI * 6;
            if (dist > 0.5 && progress < 0.65) {
              const t = Math.sin((progress / 0.65) * Math.PI);
              attackerObj.position.lerpVectors(startPos, strikeStop, t * 0.65);
            } else {
              attackerObj.position.copy(startPos);
            }
            break;
          }

          case 'blink_strike': {
            if (progress < 0.2) {
              // Shrink into dimensional rift
              const s = Math.max(0.05, 1 - (progress / 0.2));
              attackerObj.scale.setScalar(s);
            } else if (progress < 0.75) {
              // Reappear at target & strike
              attackerObj.scale.setScalar(1);
              attackerObj.position.copy(strikeStop);
              attackerObj.rotation.x = Math.sin(((progress - 0.2) / 0.55) * Math.PI) * 0.28;
            } else {
              // Blink back
              attackerObj.position.copy(startPos);
              attackerObj.rotation.x = 0;
              attackerObj.scale.setScalar(1);
            }
            break;
          }

          case 'recoil_shot': {
            if (progress > 0.15 && progress < 0.55) {
              const t = Math.sin(((progress - 0.15) / 0.4) * Math.PI);
              attackerObj.position.set(
                startPos.x - dir.x * 0.22 * t,
                t * 0.08,
                startPos.z - dir.z * 0.22 * t
              );
              attackerObj.rotation.x = -0.22 * t;
            } else {
              attackerObj.position.copy(startPos);
              attackerObj.rotation.x = 0;
            }
            break;
          }

          case 'levitate_cast': {
            const floatT = Math.sin(progress * Math.PI);
            attackerObj.position.set(startPos.x, floatT * 0.55, startPos.z);
            break;
          }

          case 'stance_guard': {
            const crouchT = Math.sin(progress * Math.PI);
            attackerObj.scale.set(1 + crouchT * 0.08, 1 - crouchT * 0.08, 1 + crouchT * 0.08);
            attackerObj.rotation.y = origRotY - crouchT * 0.35;
            break;
          }
        }
      },
      onComplete: () => {
        attackerObj.position.copy(startPos);
        attackerObj.rotation.x = 0;
        attackerObj.rotation.z = 0;
        attackerObj.rotation.y = origRotY;
        attackerObj.scale.setScalar(1);
      },
    });
  }

  // ==========================================
  // IMPACT EFFECTS HELPER
  // ==========================================
  private triggerImpactEffects(
    sequence: VFXSequence,
    targetPos: THREE.Vector3,
    targetX: number,
    targetY: number,
    aoeRadius: number
  ): void {
    const imp = sequence.impact;
    if (!imp) return;

    if (imp.shockwave) {
      const rad = Math.max(0.8, aoeRadius > 0 ? aoeRadius : 0.9);
      this.deps.playAoEAnimation(
        targetX,
        targetY,
        rad,
        imp.shockwaveColor ?? sequence.primaryColor ?? 0xff4500,
        420
      );
    }

    if (imp.craterDecal) {
      const crater = createGroundCrater(0.75 + aoeRadius * 0.4, imp.craterColor ?? sequence.primaryColor ?? 0xff4500);
      crater.position.set(targetPos.x, 0.03, targetPos.z);
      this.deps.particlesGroup.add(crater);

      this.deps.addTask({
        id: `vfx_imp_crater_${this.idCounter++}`,
        type: 'skill',
        startTime: Date.now(),
        duration: 950,
        isComplete: false,
        onUpdate: (p) => {
          if (crater.material instanceof THREE.MeshBasicMaterial) {
            crater.material.opacity = Math.max(0, 0.85 * (1 - p));
          }
        },
        onComplete: () => {
          this.deps.particlesGroup.remove(crater);
          disposeHierarchy(crater);
        },
      });
    }

    const burstColor = imp.shockwaveColor ?? sequence.primaryColor ?? 0xffffff;
    switch (imp.particleType) {
      case 'fire':
        this.deps.spawnFireExplosion(targetPos.x, 0.4, targetPos.z, (imp.particleBurstCount ?? 16) > 20);
        break;
      case 'ice':
        this.deps.spawnIceShatter(targetPos.x, 0.4, targetPos.z, (imp.particleBurstCount ?? 16) > 20);
        break;
      case 'sparks':
        this.deps.spawnElectricSparks(targetPos.x, 0.45, targetPos.z, burstColor);
        break;
      case 'stars':
        this.deps.spawnGoldenStars(targetPos.x, 0.25, targetPos.z, imp.particleBurstCount ?? 12);
        break;
      case 'dust':
        this.deps.spawnDustParticles(targetPos.x, 0.12, targetPos.z, imp.particleBurstCount ?? 14);
        break;
      case 'shadow':
        this.deps.spawnSlashParticles(targetPos.x, 0.45, targetPos.z, burstColor);
        break;
    }
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
  // 1. METEOR SHOWER (Multi-Impact Sky Drop or Ballistic Orb)
  // ==========================================
  private runMeteorShower(
    sequence: VFXSequence,
    casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    targetX: number,
    targetY: number,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const defaultColor = sequence.primaryColor ?? 0xff4500;
    const steps = sequence.projectiles && sequence.projectiles.length > 0
      ? sequence.projectiles
      : [{ delayMs: 0, fromSky: true, skyHeight: 6.5, skyAngleDeg: 60, size: 0.28, color: defaultColor }];

    let completedCount = 0;
    const totalCount = steps.length;

    steps.forEach((step, idx) => {
      setTimeout(() => {
        this.spawnSingleMeteor(step, casterPos, targetPos, idx === totalCount - 1, () => {
          completedCount++;
          if (completedCount >= totalCount) {
            this.triggerImpactEffects(sequence, targetPos, targetX, targetY, aoeRadius);
            onCompleteCallback();
          }
        });
      }, step.delayMs);
    });
  }

  private spawnSingleMeteor(
    step: VFXProjectileStep,
    casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    isFinal: boolean,
    onLanded: () => void
  ): void {
    const offsetX = step.targetOffset?.x ?? 0;
    const offsetZ = step.targetOffset?.z ?? 0;
    const landing = new THREE.Vector3(targetPos.x + offsetX, 0.35, targetPos.z + offsetZ);

    const isSky = step.fromSky !== false;
    const skyHeight = step.skyHeight ?? 6.5;
    const skyDist = skyHeight * 0.5;
    const start = isSky
      ? new THREE.Vector3(landing.x - skyDist, skyHeight, landing.z - skyDist)
      : casterPos.clone();

    const color = step.color ?? 0xff4500;
    const meteor = createMeteorMesh(step.size ?? 0.26, color, step.innerColor ?? 0x1f2937);
    meteor.position.copy(start);
    this.deps.particlesGroup.add(meteor);

    const duration = isSky ? 400 : 440;
    const arcH = step.arcHeight ?? (isSky ? 0 : 0.9);

    this.deps.addTask({
      id: `vfx_meteor_${this.idCounter++}`,
      type: 'projectile',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        const t = isSky ? progress * progress : progress;
        meteor.position.lerpVectors(start, landing, t);
        if (!isSky && arcH > 0) {
          meteor.position.y += Math.sin(progress * Math.PI) * arcH;
        }
        meteor.rotation.x += 0.25;
        meteor.rotation.y += 0.3;

        this.deps.spawnParticleDot(meteor.position.x, meteor.position.y, meteor.position.z, color, 0.045, 0.035);
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(meteor);
        disposeHierarchy(meteor);

        const crater = createGroundCrater(0.55 + (step.size ?? 0.28) * 1.5, color);
        crater.position.set(landing.x, 0.03, landing.z);
        this.deps.particlesGroup.add(crater);

        this.deps.addTask({
          id: `vfx_crater_${this.idCounter++}`,
          type: 'skill',
          startTime: Date.now(),
          duration: 1000,
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

        this.deps.spawnFireExplosion(landing.x, 0.4, landing.z, isFinal);
        this.deps.spawnDustParticles(landing.x, 0.15, landing.z, 8);
        onLanded();
      },
    });
  }

  // ==========================================
  // 2. FIRE / ENERGY PILLAR (Rising Ground Eruption)
  // ==========================================
  private runFirePillar(
    sequence: VFXSequence,
    targetPos: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const outerColor = sequence.pillar?.color ?? sequence.primaryColor ?? 0xff3b00;
    const innerColor = sequence.pillar?.innerCoreColor ?? sequence.secondaryColor ?? 0xfef08a;
    const pillarConfig = sequence.pillar ?? { height: 4.8, radius: 0.85, color: outerColor, innerCoreColor: innerColor };
    const rad = aoeRadius > 0 ? Math.max(pillarConfig.radius, aoeRadius * 0.75) : pillarConfig.radius;
    const pillar = createFirePillarMesh(rad, pillarConfig.height, outerColor, innerColor);

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
        if (progress < 0.35) {
          const t = progress / 0.35;
          const scaleY = Math.sin((t * Math.PI) / 2) * 1.15;
          pillar.scale.set(1 + scaleY * 0.1, scaleY, 1 + scaleY * 0.1);
        } else if (progress < 0.65) {
          pillar.scale.set(1.05, 1.0, 1.05);
        } else {
          const fadeT = (progress - 0.65) / 0.35;
          pillar.scale.set(1 - fadeT * 0.3, Math.max(0.01, 1 - fadeT), 1 - fadeT * 0.3);
          pillar.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
              child.material.opacity = Math.max(0, 0.8 * (1 - fadeT));
            }
          });
        }

        const outer = pillar.userData.outerMesh as THREE.Mesh;
        const inner = pillar.userData.innerMesh as THREE.Mesh;
        if (outer) outer.rotation.y += 0.09;
        if (inner) inner.rotation.y -= 0.14;

        if (Math.random() < 0.8) {
          this.deps.spawnParticleDot(
            targetPos.x + (Math.random() - 0.5) * rad,
            Math.random() * 2.6,
            targetPos.z + (Math.random() - 0.5) * rad,
            outerColor,
            0.04,
            0.035
          );
        }
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(pillar);
        disposeHierarchy(pillar);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 3. COMBUSTION (Direct Internal Burst)
  // ==========================================
  private runCombustion(
    sequence: VFXSequence,
    targetObj: THREE.Object3D | undefined,
    targetPos: THREE.Vector3,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 580;
    const color = sequence.primaryColor ?? 0xef4444;
    const secondColor = sequence.secondaryColor ?? 0xfbbf24;

    const ringGeo = new THREE.RingGeometry(0.2, 0.75, 20);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(targetPos.x, 0.05, targetPos.z);
    this.deps.particlesGroup.add(ring);

    const sphereGeo = new THREE.SphereGeometry(0.28, 12, 12);
    const sphereMat = new THREE.MeshBasicMaterial({ color: secondColor, wireframe: true, transparent: true, opacity: 0.8 });
    const core = new THREE.Mesh(sphereGeo, sphereMat);
    core.position.set(targetPos.x, 0.45, targetPos.z);
    this.deps.particlesGroup.add(core);

    this.deps.addTask({
      id: `vfx_combust_${this.idCounter++}`,
      type: 'skill',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        core.rotation.y += 0.15;
        core.rotation.x += 0.12;
        if (progress < 0.45) {
          const pulse = 1 + Math.sin(progress * 40) * 0.15;
          if (targetObj) targetObj.scale.setScalar(pulse);
          ring.scale.setScalar(1.2 - progress * 1.1);
          core.scale.setScalar(1.4 - progress * 1.5);
          this.deps.spawnParticleDot(targetPos.x, 0.5 + Math.random() * 0.4, targetPos.z, color, 0.04, 0.03);
        } else if (progress < 0.65) {
          if (targetObj) targetObj.scale.setScalar(1);
          const expand = 1 + (progress - 0.45) * 9;
          ring.scale.setScalar(expand);
          core.scale.setScalar(expand * 0.7);
          ringMat.opacity = Math.max(0, 1 - (progress - 0.45) * 5);
          sphereMat.opacity = Math.max(0, 1 - (progress - 0.45) * 5);
        } else {
          ringMat.opacity = 0;
          sphereMat.opacity = 0;
          if (targetObj) targetObj.scale.setScalar(1);
        }
      },
      onComplete: () => {
        if (targetObj) targetObj.scale.setScalar(1);
        this.deps.particlesGroup.remove(ring);
        this.deps.particlesGroup.remove(core);
        ringGeo.dispose();
        ringMat.dispose();
        sphereGeo.dispose();
        sphereMat.dispose();
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 4. FLAMETHROWER / CONE BREATH STREAM
  // ==========================================
  private runFlamethrower(
    sequence: VFXSequence,
    casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 680;
    const primary = sequence.stream?.color ?? sequence.primaryColor ?? 0xff4500;
    const secondary = sequence.stream?.secondaryColor ?? sequence.secondaryColor ?? 0xfbbf24;

    const diff = new THREE.Vector3().subVectors(targetPos, casterPos);
    const dist = Math.max(1.2, diff.length());
    const dir = diff.clone().normalize();

    // 3D Swirling Cone Beam
    const coneGeo = new THREE.ConeGeometry(0.65, dist, 14, 1, true);
    coneGeo.translate(0, -dist / 2, 0);
    coneGeo.rotateX(-Math.PI / 2);
    const coneMat = new THREE.MeshBasicMaterial({
      color: primary,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.position.copy(casterPos);
    coneMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    this.deps.particlesGroup.add(coneMesh);

    this.deps.addTask({
      id: `vfx_flame_stream_${this.idCounter++}`,
      type: 'skill',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        coneMesh.rotation.z += 0.22;
        coneMat.opacity = Math.sin(progress * Math.PI) * 0.6;

        if (progress < 0.8) {
          for (let i = 0; i < 4; i++) {
            const t = Math.random();
            const px = THREE.MathUtils.lerp(casterPos.x, targetPos.x, t) + (Math.random() - 0.5) * 0.7 * t;
            const py = THREE.MathUtils.lerp(casterPos.y, targetPos.y, t) + (Math.random() - 0.5) * 0.35;
            const pz = THREE.MathUtils.lerp(casterPos.z, targetPos.z, t) + (Math.random() - 0.5) * 0.7 * t;
            this.deps.spawnParticleDot(px, py, pz, Math.random() > 0.4 ? primary : secondary, 0.05, 0.04);
          }
        }
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(coneMesh);
        coneGeo.dispose();
        coneMat.dispose();
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 5. ICE SPIKES / THORNS / STONE STALAGMITES
  // ==========================================
  private runIceSpikes(
    sequence: VFXSequence,
    targetPos: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 620;
    const primary = sequence.primaryColor ?? 0x38bdf8;
    const secondary = sequence.secondaryColor ?? 0x0284c7;
    const spikeGroup = new THREE.Group();

    const spread = Math.max(0.32, aoeRadius * 0.55);
    const offsets = [
      { x: 0, z: 0, h: 1.35, r: 0.25 },
      { x: -spread, z: spread * 0.7, h: 1.0, r: 0.19 },
      { x: spread, z: -spread * 0.6, h: 1.1, r: 0.21 },
      { x: -spread * 0.6, z: -spread, h: 0.9, r: 0.17 },
      { x: spread * 0.7, z: spread * 0.8, h: 0.95, r: 0.18 },
    ];

    offsets.forEach((o) => {
      const spike = createIceSpikeMesh(o.h, o.r, primary, secondary);
      spike.position.set(o.x, -o.h, o.z);
      spike.rotation.y = Math.random() * Math.PI;
      spike.rotation.z = (Math.random() - 0.5) * 0.28;
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
          const t = progress / 0.3;
          spikeGroup.position.y = (t - 1) * 0.3;
        } else if (progress < 0.75) {
          spikeGroup.position.y = 0;
        } else {
          const fadeT = (progress - 0.75) / 0.25;
          spikeGroup.scale.setScalar(Math.max(0.01, 1 - fadeT));
        }
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(spikeGroup);
        disposeHierarchy(spikeGroup);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 6. FROST NOVA / RADIAL CRYSTAL BURST
  // ==========================================
  private runFrostNova(
    sequence: VFXSequence,
    targetPos: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 660;
    const primary = sequence.primaryColor ?? 0x38bdf8;
    const secondary = sequence.secondaryColor ?? 0xbae6fd;
    const maxRad = Math.max(1.2, (aoeRadius + 0.8) * 1.1);

    const group = new THREE.Group();
    group.position.set(targetPos.x, 0.05, targetPos.z);

    // Expanding Frost Ring
    const ringGeo = new THREE.RingGeometry(0.2, 0.55, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: primary, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    // 8 Radial Crystal Shards
    const shards: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const shard = createIceSpikeMesh(0.75, 0.14, secondary, primary);
      shard.rotation.z = -Math.PI / 3;
      const holder = new THREE.Group();
      holder.rotation.y = angle;
      holder.add(shard);
      group.add(holder);
      shards.push(shard);
    }

    this.deps.particlesGroup.add(group);

    this.deps.addTask({
      id: `vfx_frost_nova_${this.idCounter++}`,
      type: 'skill',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        const s = 1 + progress * maxRad * 2.5;
        ring.scale.setScalar(s);
        ringMat.opacity = Math.max(0, 0.95 * (1 - progress));

        shards.forEach((sh) => {
          sh.position.x = progress * maxRad * 0.9;
          sh.scale.setScalar(Math.sin(progress * Math.PI) * 1.2);
        });

        if (Math.random() < 0.7) {
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * maxRad;
          this.deps.spawnParticleDot(
            targetPos.x + Math.cos(a) * r,
            0.3 + Math.random() * 0.6,
            targetPos.z + Math.sin(a) * r,
            secondary,
            0.045,
            0.03
          );
        }
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(group);
        disposeHierarchy(group);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 7. LIGHTNING STORM / CHAIN VOLT
  // ==========================================
  private runLightningStorm(
    sequence: VFXSequence,
    casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 520;
    const primary = sequence.primaryColor ?? 0x00f0ff;
    const secondary = sequence.secondaryColor ?? 0xfef08a;

    const boltGroup = new THREE.Group();
    this.deps.particlesGroup.add(boltGroup);

    const boltCount = aoeRadius > 0 ? 4 : 2;
    const bolts: { line: THREE.Line; start: THREE.Vector3; end: THREE.Vector3 }[] = [];

    for (let b = 0; b < boltCount; b++) {
      const offsetX = b === 0 ? 0 : (Math.random() - 0.5) * Math.max(0.8, aoeRadius * 1.4);
      const offsetZ = b === 0 ? 0 : (Math.random() - 0.5) * Math.max(0.8, aoeRadius * 1.4);
      const end = new THREE.Vector3(targetPos.x + offsetX, 0.25, targetPos.z + offsetZ);
      const start = b === 1 && aoeRadius === 0
        ? casterPos.clone()
        : new THREE.Vector3(end.x + (Math.random() - 0.5) * 0.8, 6.5, end.z + (Math.random() - 0.5) * 0.8);

      const pts: THREE.Vector3[] = [];
      const segs = 10;
      for (let i = 0; i <= segs; i++) {
        pts.push(new THREE.Vector3().lerpVectors(start, end, i / segs));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: b % 2 === 0 ? primary : secondary });
      const line = new THREE.Line(geo, mat);
      boltGroup.add(line);
      bolts.push({ line, start, end });
    }

    // Impact electric sphere
    const flashGeo = new THREE.SphereGeometry(0.35 + aoeRadius * 0.2, 10, 10);
    const flashMat = new THREE.MeshBasicMaterial({ color: primary, wireframe: true, transparent: true, opacity: 0.9 });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.position.copy(targetPos);
    boltGroup.add(flash);

    this.deps.addTask({
      id: `vfx_lightning_${this.idCounter++}`,
      type: 'skill',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        bolts.forEach(({ line, start, end }) => {
          const posAttr = line.geometry.attributes.position as THREE.BufferAttribute;
          const segs = posAttr.count - 1;
          for (let i = 1; i < segs; i++) {
            const t = i / segs;
            posAttr.setXYZ(
              i,
              THREE.MathUtils.lerp(start.x, end.x, t) + (Math.random() - 0.5) * 0.45,
              THREE.MathUtils.lerp(start.y, end.y, t) + (Math.random() - 0.5) * 0.25,
              THREE.MathUtils.lerp(start.z, end.z, t) + (Math.random() - 0.5) * 0.45
            );
          }
          posAttr.needsUpdate = true;
        });

        flash.rotation.y += 0.3;
        flash.scale.setScalar(0.8 + Math.sin(progress * Math.PI * 3) * 0.4);
        flashMat.opacity = Math.max(0, 1 - progress);

        if (Math.random() < 0.7) {
          this.deps.spawnElectricSparks(targetPos.x, 0.45, targetPos.z, primary);
        }
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(boltGroup);
        disposeHierarchy(boltGroup);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 8. HOLY PILLAR / CELESTIAL BLESSING
  // ==========================================
  private runHolyPillar(
    sequence: VFXSequence,
    targetObj: THREE.Object3D | undefined,
    targetPos: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 650;
    const primary = sequence.pillar?.color ?? sequence.primaryColor ?? 0xfef08a;
    const secondary = sequence.pillar?.innerCoreColor ?? sequence.secondaryColor ?? 0xfacc15;
    const radius = aoeRadius > 0 ? Math.max(0.75, aoeRadius * 0.65) : (sequence.pillar?.radius ?? 0.65);

    const group = new THREE.Group();
    group.position.set(targetPos.x, 0, targetPos.z);

    const pillarGeo = new THREE.CylinderGeometry(radius * 0.85, radius, 6.5, 18, 1, true);
    const pillarMat = new THREE.MeshBasicMaterial({
      color: primary,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 3.25;
    group.add(pillar);

    // Ascending Halo Rings
    const halos: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const hGeo = new THREE.RingGeometry(radius * 0.75, radius * 1.05, 24);
      hGeo.rotateX(-Math.PI / 2);
      const hMat = new THREE.MeshBasicMaterial({ color: secondary, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
      const hMesh = new THREE.Mesh(hGeo, hMat);
      hMesh.position.y = 0.1 + i * 0.5;
      group.add(hMesh);
      halos.push(hMesh);
    }

    this.deps.particlesGroup.add(group);
    this.deps.spawnGoldenStars(targetPos.x, 0.25, targetPos.z, 14);

    this.deps.addTask({
      id: `vfx_holy_${this.idCounter++}`,
      type: 'heal',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        pillarMat.opacity = Math.sin(progress * Math.PI) * 0.65;
        pillar.rotation.y += 0.06;

        halos.forEach((h, idx) => {
          const offsetP = (progress + idx * 0.25) % 1;
          h.position.y = offsetP * 2.4;
          h.scale.setScalar(0.8 + Math.sin(offsetP * Math.PI) * 0.4);
        });

        if (targetObj?.scale && typeof targetObj.scale.setScalar === 'function') {
          targetObj.scale.setScalar(1 + Math.sin(progress * Math.PI) * 0.12);
        }
      },
      onComplete: () => {
        if (targetObj?.scale && typeof targetObj.scale.setScalar === 'function') {
          targetObj.scale.setScalar(1);
        }
        this.deps.particlesGroup.remove(group);
        disposeHierarchy(group);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 9. VOID MIASMA & NECROMANTIC LIFE DRAIN
  // ==========================================
  private runVoidMiasma(
    sequence: VFXSequence,
    casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 650;
    const primary = sequence.primaryColor ?? 0x8b5cf6;
    const secondary = sequence.secondaryColor ?? 0x10b981;

    const group = new THREE.Group();
    this.deps.particlesGroup.add(group);

    // Swirling Miasma Ring at Target
    const rad = Math.max(0.65, aoeRadius * 0.7);
    const vortexGeo = new THREE.RingGeometry(0.15, rad, 20);
    vortexGeo.rotateX(-Math.PI / 2);
    const vortexMat = new THREE.MeshBasicMaterial({ color: primary, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const vortex = new THREE.Mesh(vortexGeo, vortexMat);
    vortex.position.set(targetPos.x, 0.06, targetPos.z);
    group.add(vortex);

    // Siphon Orbs traveling from target back to caster
    const orbs: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const oGeo = new THREE.OctahedronGeometry(0.11, 0);
      const oMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? primary : secondary });
      const orb = new THREE.Mesh(oGeo, oMat);
      orb.position.copy(targetPos);
      group.add(orb);
      orbs.push(orb);
    }

    this.deps.addTask({
      id: `vfx_miasma_${this.idCounter++}`,
      type: 'skill',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        vortex.rotation.z += 0.18;
        vortex.scale.setScalar(0.8 + Math.sin(progress * Math.PI) * 0.5);
        vortexMat.opacity = Math.max(0, 0.85 * (1 - progress * 0.8));

        orbs.forEach((orb, idx) => {
          const localP = Math.max(0, Math.min(1, (progress - idx * 0.1) / 0.7));
          orb.position.lerpVectors(targetPos, casterPos, localP);
          orb.position.y += Math.sin(localP * Math.PI) * (0.45 + idx * 0.1);
          orb.rotation.x += 0.2;
          orb.rotation.y += 0.2;
        });

        if (Math.random() < 0.7) {
          this.deps.spawnParticleDot(
            targetPos.x + (Math.random() - 0.5) * 0.5,
            0.3 + Math.random() * 0.5,
            targetPos.z + (Math.random() - 0.5) * 0.5,
            primary,
            0.045,
            0.035
          );
        }
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(group);
        disposeHierarchy(group);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 10. HEAVY SLAM & SEISMIC ROCK ERUPTION
  // ==========================================
  private runHeavySlam(
    sequence: VFXSequence,
    _casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 560;
    const primary = sequence.primaryColor ?? 0xf59e0b;
    const secondary = sequence.secondaryColor ?? 0x78716c;

    const slamGroup = new THREE.Group();
    slamGroup.position.set(targetPos.x, 0, targetPos.z);
    this.deps.particlesGroup.add(slamGroup);

    // Radial erupting boulders
    const rocks: { mesh: THREE.Mesh; angle: number; dist: number }[] = [];
    const rockCount = aoeRadius > 0 ? 10 : 6;
    const baseDist = Math.max(0.45, aoeRadius * 0.65);

    for (let i = 0; i < rockCount; i++) {
      const angle = (i / rockCount) * Math.PI * 2;
      const rGeo = new THREE.DodecahedronGeometry(0.14 + Math.random() * 0.08, 0);
      const rMat = new THREE.MeshStandardMaterial({
        color: secondary,
        emissive: primary,
        emissiveIntensity: 0.45,
        roughness: 0.85,
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.scale.setScalar(0.01);
      slamGroup.add(rMesh);
      rocks.push({ mesh: rMesh, angle, dist: baseDist * (0.7 + Math.random() * 0.5) });
    }

    this.deps.addTask({
      id: `vfx_slam_${this.idCounter++}`,
      type: 'attack',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        if (progress > 0.38) {
          const p = (progress - 0.38) / 0.62;
          rocks.forEach(({ mesh, angle, dist }) => {
            const curD = dist * Math.min(1, p * 1.8);
            mesh.position.set(
              Math.cos(angle) * curD,
              Math.sin(p * Math.PI) * 0.45,
              Math.sin(angle) * curD
            );
            mesh.scale.setScalar(Math.sin(p * Math.PI) * 1.2);
            mesh.rotation.x += 0.15;
            mesh.rotation.z += 0.15;
          });
        }
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(slamGroup);
        disposeHierarchy(slamGroup);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 11. BLADE TEMPEST (Multi-Slash / X-Slash / Cone / Spin / Guillotine)
  // ==========================================
  private runBladeTempest(
    sequence: VFXSequence,
    casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    dir: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 520;
    const primary = sequence.primaryColor ?? 0x9d4edd;
    const secondary = sequence.secondaryColor ?? 0xffffff;
    const style = sequence.slashStyle ?? 'single';
    const slashCount = sequence.slashCount ?? (style === 'cross_x' ? 2 : style === 'flurry' ? 5 : style === 'cone_slashes' ? 4 : 1);

    const slashGroup = new THREE.Group();
    const center = style === 'cone_slashes'
      ? casterPos.clone().addScaledVector(dir, 1.1)
      : targetPos.clone();
    slashGroup.position.set(center.x, 0.45, center.z);
    this.deps.particlesGroup.add(slashGroup);

    const baseAngleY = Math.atan2(dir.x, dir.z);
    const radius = style === 'spin'
      ? Math.max(0.95, aoeRadius + 0.4)
      : style === 'cone_slashes'
      ? 1.15
      : Math.max(0.68, aoeRadius * 0.55 + 0.65);

    const slashes: { mesh: THREE.Group; startP: number; endP: number; rotZ: number; rotY: number; rotX: number }[] = [];

    for (let i = 0; i < slashCount; i++) {
      const arcAngle = style === 'spin' ? Math.PI * 1.65 : style === 'cone_slashes' ? Math.PI * 0.75 : Math.PI * 0.9;
      const slashMesh = createSlashWaveMesh(radius, 0.26, arcAngle, i % 2 === 0 ? primary : secondary, secondary);
      slashMesh.visible = false;
      slashGroup.add(slashMesh);

      let rotZ = 0;
      let rotY = baseAngleY;
      let rotX = 0;

      if (style === 'cross_x') {
        rotZ = i === 0 ? Math.PI / 4 : -Math.PI / 4;
      } else if (style === 'guillotine') {
        rotZ = Math.PI / 2;
      } else if (style === 'flurry') {
        rotZ = (i * 1.15) - 1.2;
        rotY = baseAngleY + (i - slashCount / 2) * 0.35;
      } else if (style === 'cone_slashes') {
        rotZ = (i % 2 === 0 ? 0.2 : -0.2);
        rotY = baseAngleY + (i - (slashCount - 1) / 2) * 0.28;
      }

      const span = Math.min(0.45, 0.85 / slashCount);
      const startP = (i / slashCount) * (1 - span);
      slashes.push({ mesh: slashMesh, startP, endP: startP + span, rotZ, rotY, rotX });
    }

    this.deps.addTask({
      id: `vfx_blade_${this.idCounter++}`,
      type: 'attack',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        slashes.forEach((s) => {
          if (progress >= s.startP && progress <= s.endP) {
            if (!s.mesh.visible) {
              s.mesh.visible = true;
              this.deps.spawnSlashParticles(center.x, 0.45, center.z, primary);
            }
            const localP = (progress - s.startP) / (s.endP - s.startP);
            s.mesh.rotation.set(s.rotX, s.rotY, s.rotZ);
            if (style === 'spin') {
              s.mesh.rotation.y = s.rotY + localP * Math.PI * 3;
            } else {
              s.mesh.rotation.y = s.rotY + (localP - 0.5) * 1.2;
            }
            s.mesh.scale.setScalar(0.65 + Math.sin(localP * Math.PI) * 0.65);
          } else {
            s.mesh.visible = false;
          }
        });
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(slashGroup);
        disposeHierarchy(slashGroup);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 12. SNIPER SHOT (Laser Lock-On + Sonic Rings)
  // ==========================================
  private runSniperShot(
    sequence: VFXSequence,
    casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    dir: THREE.Vector3,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 480;
    const primary = sequence.primaryColor ?? 0xfacc15;
    const secondary = sequence.secondaryColor ?? 0xef4444;

    const group = new THREE.Group();
    this.deps.particlesGroup.add(group);

    // Laser Sight Line
    const laserGeo = new THREE.BufferGeometry().setFromPoints([casterPos, targetPos]);
    const laserMat = new THREE.LineBasicMaterial({ color: secondary, transparent: true, opacity: 0.9 });
    const laserLine = new THREE.Line(laserGeo, laserMat);
    group.add(laserLine);

    // Target Crosshair Ring
    const crossGeo = new THREE.RingGeometry(0.22, 0.32, 16);
    crossGeo.rotateX(-Math.PI / 2);
    const crossMat = new THREE.MeshBasicMaterial({ color: secondary, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    const crosshair = new THREE.Mesh(crossGeo, crossMat);
    crosshair.position.set(targetPos.x, 0.45, targetPos.z);
    crosshair.lookAt(casterPos);
    group.add(crosshair);

    // High-Velocity Bullet Mesh
    const bullet = createProjectileArrowMesh(primary, 0xffffff, 1.2);
    bullet.position.copy(casterPos);
    bullet.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    bullet.visible = false;
    group.add(bullet);

    // Sonic Boom Rings along path
    const sonicRings: THREE.Mesh[] = [];
    for (let i = 1; i <= 3; i++) {
      const rGeo = new THREE.RingGeometry(0.08, 0.16, 16);
      const rMat = new THREE.MeshBasicMaterial({ color: primary, side: THREE.DoubleSide, transparent: true, opacity: 0 });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.position.lerpVectors(casterPos, targetPos, i / 4);
      rMesh.lookAt(targetPos);
      group.add(rMesh);
      sonicRings.push(rMesh);
    }

    this.deps.addTask({
      id: `vfx_sniper_${this.idCounter++}`,
      type: 'projectile',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        if (progress < 0.38) {
          // Lock-on phase
          const lockP = progress / 0.38;
          crosshair.scale.setScalar(1.8 - lockP * 0.9);
          crosshair.rotation.z += 0.2;
        } else {
          // Supersonic shot phase
          laserLine.visible = false;
          bullet.visible = true;
          const shotP = Math.min(1, (progress - 0.38) / 0.35);
          bullet.position.lerpVectors(casterPos, targetPos, shotP);

          sonicRings.forEach((ring, idx) => {
            const triggerT = (idx + 1) / 4;
            if (shotP >= triggerT) {
              const rp = Math.min(1, (shotP - triggerT) * 2.5);
              ring.scale.setScalar(1 + rp * 3.2);
              (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.9 * (1 - rp));
            }
          });
        }
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(group);
        disposeHierarchy(group);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 13. ARROW VOLLEY / RAIN OF ARROWS
  // ==========================================
  private runArrowVolley(
    sequence: VFXSequence,
    casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 560;
    const primary = sequence.primaryColor ?? 0x43c878;
    const secondary = sequence.secondaryColor ?? 0xfacc15;
    const isRain = aoeRadius > 0 || (sequence.projectiles?.some((p) => p.fromSky) ?? false);

    const group = new THREE.Group();
    this.deps.particlesGroup.add(group);

    const count = isRain ? Math.max(9, aoeRadius * 6) : (sequence.projectiles?.length || 3);
    const arrows: { mesh: THREE.Group; start: THREE.Vector3; end: THREE.Vector3; delay: number }[] = [];

    for (let i = 0; i < count; i++) {
      const arrow = createProjectileArrowMesh(0x854d0e, i % 2 === 0 ? primary : secondary, 1.0);
      group.add(arrow);

      const spreadR = isRain ? Math.max(0.65, aoeRadius * 0.85) : 0.25;
      const angle = (i / count) * Math.PI * 2;
      const rad = isRain ? Math.random() * spreadR : (i - (count - 1) / 2) * 0.22;
      const end = new THREE.Vector3(
        targetPos.x + (isRain ? Math.cos(angle) * rad : rad),
        0.15,
        targetPos.z + (isRain ? Math.sin(angle) * rad : rad)
      );
      const start = isRain
        ? new THREE.Vector3(end.x - 1.2, 5.2 + Math.random() * 1.5, end.z - 1.2)
        : casterPos.clone();

      arrows.push({ mesh: arrow, start, end, delay: (i / count) * 0.35 });
    }

    this.deps.addTask({
      id: `vfx_volley_${this.idCounter++}`,
      type: 'projectile',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        arrows.forEach(({ mesh, start, end, delay }) => {
          const localP = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
          const arcY = isRain ? 0 : Math.sin(localP * Math.PI) * 0.85;
          const cur = new THREE.Vector3().lerpVectors(start, end, localP);
          cur.y += arcY;
          mesh.position.copy(cur);

          const dir = new THREE.Vector3().subVectors(end, start).normalize();
          mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
        });
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(group);
        disposeHierarchy(group);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 14. CANNON BARRAGE / ALCHEMICAL BOMB
  // ==========================================
  private runCannonBarrage(
    sequence: VFXSequence,
    casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 580;
    const primary = sequence.primaryColor ?? 0xf97316;
    const secondary = sequence.secondaryColor ?? 0x334155;

    const bombGeo = new THREE.SphereGeometry(0.18, 10, 10);
    const bombMat = new THREE.MeshStandardMaterial({
      color: secondary,
      emissive: primary,
      emissiveIntensity: 0.7,
      roughness: 0.3,
      metalness: 0.7,
    });
    const bomb = new THREE.Mesh(bombGeo, bombMat);
    bomb.position.copy(casterPos);
    this.deps.particlesGroup.add(bomb);

    this.deps.addTask({
      id: `vfx_cannon_${this.idCounter++}`,
      type: 'projectile',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        bomb.position.lerpVectors(casterPos, targetPos, progress);
        bomb.position.y += Math.sin(progress * Math.PI) * 1.45;
        bomb.rotation.x += 0.25;
        this.deps.spawnParticleDot(bomb.position.x, bomb.position.y + 0.1, bomb.position.z, primary, 0.04, 0.03);
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(bomb);
        bombGeo.dispose();
        bombMat.dispose();
        this.deps.spawnFireExplosion(targetPos.x, 0.35, targetPos.z, aoeRadius > 0);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 15. BLACK HOLE (Samurai do Vazio / Singularity Cross Pull)
  // ==========================================
  private runBlackHole(
    sequence: VFXSequence,
    targetPos: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 780;
    const primary = sequence.primaryColor ?? 0x9d4edd;
    const secondary = sequence.secondaryColor ?? 0xef4444;

    const group = new THREE.Group();
    group.position.set(targetPos.x, 0.55, targetPos.z);
    this.deps.particlesGroup.add(group);

    const bh = createBlackHoleMesh(0.42, 0x05020a, primary, secondary);
    group.add(bh);

    // 4 Cardinal Cross Pull Beams on Ground (2 tiles each direction)
    const crossLen = Math.max(2.2, aoeRadius + 0.4) * 2;
    const beamMat = new THREE.MeshBasicMaterial({
      color: primary,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beamXGeo = new THREE.PlaneGeometry(crossLen, 0.55);
    beamXGeo.rotateX(-Math.PI / 2);
    const beamX = new THREE.Mesh(beamXGeo, beamMat);
    beamX.position.y = -0.49;
    group.add(beamX);

    const beamZGeo = new THREE.PlaneGeometry(0.55, crossLen);
    beamZGeo.rotateX(-Math.PI / 2);
    const beamZ = new THREE.Mesh(beamZGeo, beamMat);
    beamZ.position.y = -0.49;
    group.add(beamZ);

    // Inward Implosion Rings
    const pullRingGeo = new THREE.RingGeometry(1.6, 1.85, 28);
    pullRingGeo.rotateX(-Math.PI / 2);
    const pullRingMat = new THREE.MeshBasicMaterial({ color: secondary, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const pullRing = new THREE.Mesh(pullRingGeo, pullRingMat);
    pullRing.position.y = -0.48;
    group.add(pullRing);

    this.deps.addTask({
      id: `vfx_blackhole_${this.idCounter++}`,
      type: 'skill',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        const { rim, disk, subRing } = bh.userData;
        if (rim) rim.rotation.y -= 0.18;
        if (disk) disk.rotation.z += 0.22;
        if (subRing) {
          subRing.rotation.y += 0.25;
          subRing.rotation.x += 0.12;
        }

        // Pull ring shrinks INWARD toward center (gravitational suction)
        const suctionP = (progress * 2.5) % 1;
        pullRing.scale.setScalar(Math.max(0.1, 1.3 - suctionP * 1.2));

        if (progress < 0.25) {
          bh.scale.setScalar(progress / 0.25);
        } else if (progress < 0.78) {
          bh.scale.setScalar(1 + Math.sin(progress * 30) * 0.12);
        } else {
          // Violent implosion then burst
          const endT = (progress - 0.78) / 0.22;
          bh.scale.setScalar(Math.max(0.02, 1 - endT));
          beamMat.opacity = Math.max(0, 0.65 * (1 - endT));
        }

        // Spawn particles being pulled from cross arms to center
        if (Math.random() < 0.85) {
          const arm = Math.floor(Math.random() * 4);
          const dist = (1 - progress * 0.8) * 2.0;
          const px = targetPos.x + (arm === 0 ? dist : arm === 1 ? -dist : 0);
          const pz = targetPos.z + (arm === 2 ? dist : arm === 3 ? -dist : 0);
          this.deps.spawnParticleDot(px, 0.35, pz, Math.random() > 0.4 ? primary : secondary, 0.05, 0.045);
        }
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(group);
        disposeHierarchy(group);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 16. CRIMSON HORIZON (Ultimate: Lágrimas Rubras do Horizonte Falso 5x5)
  // ==========================================
  private runCrimsonHorizon(
    sequence: VFXSequence,
    casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 1050;
    const primary = sequence.primaryColor ?? 0xdc2626;     // Crimson red
    const secondary = sequence.secondaryColor ?? 0x9d4edd; // Abyssal violet/white
    const center = aoeRadius >= 2 ? casterPos : targetPos;

    const group = new THREE.Group();
    group.position.set(center.x, 0, center.z);
    this.deps.particlesGroup.add(group);

    // 1. Monochrome / Abyssal 5x5 World-Darkening Dome
    const domeRad = Math.max(2.6, aoeRadius + 0.8);
    const domeGeo = new THREE.SphereGeometry(domeRad, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshBasicMaterial({
      color: 0x07030d,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    group.add(dome);

    // 2. False Crimson Horizon Ring
    const horizonGeo = new THREE.RingGeometry(domeRad * 0.88, domeRad * 1.04, 32);
    horizonGeo.rotateX(-Math.PI / 2);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: primary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const horizon = new THREE.Mesh(horizonGeo, horizonMat);
    horizon.position.y = 0.06;
    group.add(horizon);

    // 3. 18 Criss-Crossing Dimensional Crimson Slash Threads across the 5x5 space
    const slashLines: THREE.Line[] = [];
    for (let i = 0; i < 18; i++) {
      const a1 = Math.random() * Math.PI * 2;
      const a2 = a1 + Math.PI + (Math.random() - 0.5) * 1.1;
      const p1 = new THREE.Vector3(Math.cos(a1) * domeRad, 0.15 + Math.random() * 1.8, Math.sin(a1) * domeRad);
      const p2 = new THREE.Vector3(Math.cos(a2) * domeRad, 0.15 + Math.random() * 1.8, Math.sin(a2) * domeRad);
      const lGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const lMat = new THREE.LineBasicMaterial({
        color: i % 3 === 0 ? 0xffffff : primary,
        transparent: true,
        opacity: 0,
      });
      const line = new THREE.Line(lGeo, lMat);
      group.add(line);
      slashLines.push(line);
    }

    // 4. Giant Final Horizon Crescent Wave
    const giantSlash = createSlashWaveMesh(domeRad * 0.95, 0.45, Math.PI * 1.5, primary, 0xffffff);
    giantSlash.position.y = 0.65;
    giantSlash.visible = false;
    group.add(giantSlash);

    this.deps.addTask({
      id: `vfx_crimson_horizon_${this.idCounter++}`,
      type: 'skill',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        if (progress < 0.25) {
          // Phase 1: World loses color (dome expands rapidly)
          const t = progress / 0.25;
          dome.scale.setScalar(t);
          horizon.scale.setScalar(t);
        } else if (progress < 0.78) {
          // Phase 2: Flurry of crimson horizon threads & falling crimson tears
          const flurryP = (progress - 0.25) / 0.53;
          slashLines.forEach((line, idx) => {
            const appearT = idx / slashLines.length;
            const mat = line.material as THREE.LineBasicMaterial;
            if (flurryP >= appearT) {
              mat.opacity = Math.sin(Math.min(1, (flurryP - appearT) * 3) * Math.PI);
            }
          });

          // Crimson tears raining in 5x5
          for (let k = 0; k < 2; k++) {
            const rx = center.x + (Math.random() - 0.5) * domeRad * 1.6;
            const rz = center.z + (Math.random() - 0.5) * domeRad * 1.6;
            this.deps.spawnParticleDot(rx, 0.3 + Math.random() * 1.5, rz, Math.random() > 0.3 ? primary : secondary, 0.055, 0.04);
          }
        } else {
          // Phase 3: Final Horizon Cleave shatters the dome
          const endT = (progress - 0.78) / 0.22;
          giantSlash.visible = true;
          giantSlash.rotation.y += 0.35;
          giantSlash.scale.setScalar(0.8 + endT * 0.5);
          domeMat.opacity = Math.max(0, 0.72 * (1 - endT));
          horizonMat.opacity = Math.max(0, 0.95 * (1 - endT));
        }
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(group);
        disposeHierarchy(group);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 17. DIMENSIONAL WAVE (Horizonte Vazio 3x2 / Fissura da Katana / Line Waves)
  // ==========================================
  private runDimensionalWave(
    sequence: VFXSequence,
    casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    dir: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 560;
    const primary = sequence.primaryColor ?? 0x9d4edd;
    const secondary = sequence.secondaryColor ?? 0xef4444;

    const waveWidth = sequence.aoeShape === 'rect_3x2' ? 1.45 : Math.max(0.85, aoeRadius * 0.65);
    const wave = createSlashWaveMesh(waveWidth, 0.35, Math.PI * 0.95, primary, secondary);
    wave.position.copy(casterPos);
    const angleY = Math.atan2(dir.x, dir.z);
    wave.rotation.y = angleY;
    this.deps.particlesGroup.add(wave);

    const endPos = targetPos.clone().addScaledVector(dir, Math.max(0.8, aoeRadius * 0.6));

    this.deps.addTask({
      id: `vfx_dim_wave_${this.idCounter++}`,
      type: 'projectile',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        wave.position.lerpVectors(casterPos, endPos, progress);
        wave.position.y = 0.4;
        wave.scale.set(1 + progress * 0.35, 1, 1 + progress * 0.2);

        // Leave glowing shadow/bleed trail particles
        this.deps.spawnParticleDot(
          wave.position.x + (Math.random() - 0.5) * waveWidth,
          0.25 + Math.random() * 0.3,
          wave.position.z + (Math.random() - 0.5) * waveWidth,
          Math.random() > 0.4 ? primary : secondary,
          0.05,
          0.035
        );
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(wave);
        disposeHierarchy(wave);
        this.deps.spawnSlashParticles(targetPos.x, 0.45, targetPos.z, secondary);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 18. CHAIN HOOK / ROOTS / TENTACLES / SHACKLES
  // ==========================================
  private runChainHook(
    sequence: VFXSequence,
    casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 600;
    const primary = sequence.primaryColor ?? 0x10b981;
    const secondary = sequence.secondaryColor ?? 0x047857;

    const group = new THREE.Group();
    this.deps.particlesGroup.add(group);

    // 2 Spiraling/Curved Tendrils from caster to target + constriction rings at target
    const curve1 = new THREE.QuadraticBezierCurve3(
      casterPos,
      new THREE.Vector3(
        (casterPos.x + targetPos.x) / 2 + 0.4,
        1.1,
        (casterPos.z + targetPos.z) / 2 - 0.4
      ),
      targetPos
    );
    const curve2 = new THREE.QuadraticBezierCurve3(
      casterPos,
      new THREE.Vector3(
        (casterPos.x + targetPos.x) / 2 - 0.4,
        0.9,
        (casterPos.z + targetPos.z) / 2 + 0.4
      ),
      targetPos
    );

    const tube1Geo = new THREE.TubeGeometry(curve1, 16, 0.045, 6, false);
    const tube2Geo = new THREE.TubeGeometry(curve2, 16, 0.045, 6, false);
    const mat1 = new THREE.MeshBasicMaterial({ color: primary, transparent: true, opacity: 0.9 });
    const mat2 = new THREE.MeshBasicMaterial({ color: secondary, transparent: true, opacity: 0.85 });
    const mesh1 = new THREE.Mesh(tube1Geo, mat1);
    const mesh2 = new THREE.Mesh(tube2Geo, mat2);
    group.add(mesh1, mesh2);

    // Constriction rings around target
    const bindRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const rGeo = new THREE.TorusGeometry(0.38, 0.035, 8, 18);
      rGeo.rotateX(Math.PI / 2);
      const rMesh = new THREE.Mesh(rGeo, mat1);
      rMesh.position.set(targetPos.x, 0.2 + i * 0.22, targetPos.z);
      group.add(rMesh);
      bindRings.push(rMesh);
    }

    this.deps.addTask({
      id: `vfx_chain_${this.idCounter++}`,
      type: 'skill',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        const squeeze = 1 - Math.sin(progress * Math.PI) * 0.35;
        bindRings.forEach((r, idx) => {
          r.scale.setScalar(squeeze);
          r.rotation.y += (idx % 2 === 0 ? 0.15 : -0.15);
        });
        mat1.opacity = Math.sin(progress * Math.PI) * 0.95;
        mat2.opacity = Math.sin(progress * Math.PI) * 0.85;
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(group);
        disposeHierarchy(group);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 19. SONIC SYMPHONY (Bard / War Cry / Roar / Howl)
  // ==========================================
  private runSonicSymphony(
    sequence: VFXSequence,
    casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 620;
    const primary = sequence.primaryColor ?? 0xec4899;
    const secondary = sequence.secondaryColor ?? 0xfacc15;

    const group = new THREE.Group();
    this.deps.particlesGroup.add(group);

    const waves: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const wGeo = new THREE.RingGeometry(0.25, 0.38, 24);
      wGeo.rotateX(-Math.PI / 2);
      const wMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? primary : secondary,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      const wMesh = new THREE.Mesh(wGeo, wMat);
      wMesh.position.set(targetPos.x, 0.35, targetPos.z);
      group.add(wMesh);
      waves.push(wMesh);
    }

    const maxScale = Math.max(2.2, (aoeRadius + 1) * 1.8);

    this.deps.addTask({
      id: `vfx_sonic_${this.idCounter++}`,
      type: 'skill',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        waves.forEach((w, idx) => {
          const localP = Math.max(0, Math.min(1, (progress - idx * 0.15) / 0.7));
          w.scale.setScalar(1 + localP * maxScale);
          (w.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.9 * (1 - localP));
        });

        if (Math.random() < 0.7) {
          const t = Math.random();
          this.deps.spawnParticleDot(
            THREE.MathUtils.lerp(casterPos.x, targetPos.x, t) + (Math.random() - 0.5) * 0.5,
            0.45 + Math.random() * 0.5,
            THREE.MathUtils.lerp(casterPos.z, targetPos.z, t) + (Math.random() - 0.5) * 0.5,
            Math.random() > 0.5 ? primary : secondary,
            0.05,
            0.03
          );
        }
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(group);
        disposeHierarchy(group);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 20. SHIELD BASTION / IAIJUTSU STANCE (Ameaça do Vazio / Shields / Guard)
  // ==========================================
  private runShieldBastion(
    sequence: VFXSequence,
    targetPos: THREE.Vector3,
    aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 620;
    const primary = sequence.primaryColor ?? 0x38bdf8;
    const secondary = sequence.secondaryColor ?? 0xfef08a;

    const rad = Math.max(0.68, aoeRadius * 0.55 + 0.65);
    const shield = createShieldDomeMesh(rad, primary, secondary);
    shield.position.set(targetPos.x, 0, targetPos.z);
    this.deps.particlesGroup.add(shield);

    this.deps.addTask({
      id: `vfx_shield_${this.idCounter++}`,
      type: 'heal',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        const { wire, base } = shield.userData;
        if (wire) {
          wire.rotation.y += 0.08;
          wire.rotation.x += 0.04;
        }
        if (base) {
          base.rotation.z -= 0.1;
        }
        const scale = progress < 0.25 ? progress / 0.25 : 1 + Math.sin(progress * Math.PI) * 0.08;
        shield.scale.setScalar(scale);

        if (progress > 0.7) {
          const fade = 1 - (progress - 0.7) / 0.3;
          shield.traverse((c) => {
            if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshBasicMaterial) {
              c.material.opacity = Math.max(0, c.material.opacity * fade);
            }
          });
        }
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(shield);
        disposeHierarchy(shield);
        onCompleteCallback();
      },
    });
  }

  // ==========================================
  // 21. GENERIC MAGIC ORB & ARCANE BURST
  // ==========================================
  private runGenericMagic(
    sequence: VFXSequence,
    casterPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    _aoeRadius: number,
    onCompleteCallback: () => void
  ): void {
    const duration = sequence.durationMs || 520;
    const primary = sequence.primaryColor ?? sequence.cast?.color ?? 0xb58aff;
    const secondary = sequence.secondaryColor ?? 0xffffff;

    const group = new THREE.Group();
    const orbGeo = new THREE.SphereGeometry(0.17, 10, 10);
    const orbMat = new THREE.MeshBasicMaterial({ color: primary });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    group.add(orb);

    const ringGeo = new THREE.RingGeometry(0.2, 0.3, 14);
    const ringMat = new THREE.MeshBasicMaterial({ color: secondary, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    group.position.copy(casterPos);
    this.deps.particlesGroup.add(group);

    this.deps.addTask({
      id: `vfx_magic_orb_${this.idCounter++}`,
      type: 'projectile',
      startTime: Date.now(),
      duration,
      isComplete: false,
      onUpdate: (progress) => {
        group.position.lerpVectors(casterPos, targetPos, progress);
        group.position.y += Math.sin(progress * Math.PI) * 0.65;
        ring.rotation.x += 0.25;
        ring.rotation.y += 0.25;

        this.deps.spawnParticleDot(
          group.position.x,
          group.position.y,
          group.position.z,
          Math.random() > 0.4 ? primary : secondary,
          0.045,
          0.035
        );
      },
      onComplete: () => {
        this.deps.particlesGroup.remove(group);
        disposeHierarchy(group);
        onCompleteCallback();
      },
    });
  }
}
