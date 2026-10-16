import * as THREE from 'three';

// --- Animation Types ---

export interface AnimationTask {
  id: string;
  type: 'move' | 'attack' | 'skill' | 'heal' | 'death' | 'hit' | 'projectile';
  startTime: number;
  duration: number;
  onUpdate: (progress: number) => void;
  onComplete: () => void;
  isComplete: boolean;
}

export type AnimationRequest =
  | { type: 'move'; unitId: string; fromX: number; fromY: number; toX: number; toY: number }
  | { type: 'attack'; attackerId: string; targetX: number; targetY: number; damageType: 'physical' | 'magical' | 'healing' }
  | { type: 'skill'; attackerId: string; targetX: number; targetY: number; skillName: string; damageType: 'physical' | 'magical' | 'healing'; aoeRadius: number }
  | { type: 'death'; unitId: string }
  | { type: 'hit'; unitId: string; damageType: 'physical' | 'magical' | 'healing' };

// --- Easing Functions ---

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  const p = 0.3;
  return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
}

// --- Animation Engine ---

export class AnimationEngine {
  private tasks: AnimationTask[] = [];
  private scene: THREE.Scene;
  private particlesGroup: THREE.Group;
  private idCounter = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.particlesGroup = new THREE.Group();
    this.particlesGroup.name = 'particles';
    this.scene.add(this.particlesGroup);
  }

  get isAnimating(): boolean {
    return this.tasks.length > 0;
  }

  update(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const task of this.tasks) {
      if (task.isComplete) {
        toRemove.push(task.id);
        continue;
      }

      const elapsed = now - task.startTime;
      const rawProgress = Math.min(1, elapsed / task.duration);

      task.onUpdate(rawProgress);

      if (rawProgress >= 1) {
        task.isComplete = true;
        task.onComplete();
        toRemove.push(task.id);
      }
    }

    if (toRemove.length > 0) {
      this.tasks = this.tasks.filter((t) => !toRemove.includes(t.id));
    }

    // Update particle lifecycle
    this.updateParticles();
  }

  // --- Movement Animation: Smooth hop from tile A to tile B ---
  playMoveAnimation(
    unitObj: THREE.Object3D,
    fromX: number, fromY: number,
    toX: number, toY: number,
    duration: number = 450
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = new THREE.Vector3(fromX + 0.5, 0, fromY + 0.5);
      const endPos = new THREE.Vector3(toX + 0.5, 0, toY + 0.5);

      // Face towards movement direction
      const dx = toX - fromX;
      const dz = toY - fromY;
      if (dx !== 0 || dz !== 0) {
        unitObj.rotation.y = Math.atan2(dx, dz);
      }

      const task: AnimationTask = {
        id: `move_${this.idCounter++}`,
        type: 'move',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          const t = easeInOutCubic(progress);
          const x = startPos.x + (endPos.x - startPos.x) * t;
          const z = startPos.z + (endPos.z - startPos.z) * t;
          // Hop arc (parabola) peaking at 0.35 units high
          const hopHeight = Math.sin(progress * Math.PI) * 0.35;
          unitObj.position.set(x, hopHeight, z);
        },
        onComplete: () => {
          unitObj.position.set(endPos.x, 0, endPos.z);
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // --- Physical Attack Animation: Lunge forward + swing ---
  playPhysicalAttackAnimation(
    attackerObj: THREE.Object3D,
    attackerX: number, attackerY: number,
    targetX: number, targetY: number,
    duration: number = 500
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = new THREE.Vector3(attackerX + 0.5, 0, attackerY + 0.5);
      const targetPos = new THREE.Vector3(targetX + 0.5, 0, targetY + 0.5);
      const direction = new THREE.Vector3().subVectors(targetPos, startPos).normalize();

      // Face target
      attackerObj.rotation.y = Math.atan2(direction.x, direction.z);

      const lungeDistance = 0.45;
      const lungeTarget = new THREE.Vector3(
        startPos.x + direction.x * lungeDistance,
        startPos.y,
        startPos.z + direction.z * lungeDistance
      );

      const task: AnimationTask = {
        id: `phys_atk_${this.idCounter++}`,
        type: 'attack',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          if (progress < 0.4) {
            // Lunge forward (first 40%)
            const t = easeOutBack(progress / 0.4);
            const x = startPos.x + (lungeTarget.x - startPos.x) * t;
            const z = startPos.z + (lungeTarget.z - startPos.z) * t;
            attackerObj.position.set(x, 0, z);
            // Tilt forward for swing
            attackerObj.rotation.x = Math.sin(progress / 0.4 * Math.PI) * 0.2;
          } else if (progress < 0.55) {
            // Hold at impact (15%)
            attackerObj.position.set(lungeTarget.x, 0, lungeTarget.z);
            attackerObj.rotation.x = 0;
          } else {
            // Return to start (remaining 45%)
            const returnT = easeInOutCubic((progress - 0.55) / 0.45);
            const x = lungeTarget.x + (startPos.x - lungeTarget.x) * returnT;
            const z = lungeTarget.z + (startPos.z - lungeTarget.z) * returnT;
            attackerObj.position.set(x, 0, z);
          }
        },
        onComplete: () => {
          attackerObj.position.set(startPos.x, 0, startPos.z);
          attackerObj.rotation.x = 0;
          resolve();
        },
      };

      this.tasks.push(task);

      // Spawn impact slash particles at target after lunge connects
      setTimeout(() => {
        this.spawnSlashParticles(targetX + 0.5, 0.5, targetY + 0.5, 0xff5252);
      }, duration * 0.4);
    });
  }

  // --- Magical Attack Animation: Channel + Projectile ---
  playMagicAttackAnimation(
    attackerObj: THREE.Object3D,
    attackerX: number, attackerY: number,
    targetX: number, targetY: number,
    color: number = 0xb58aff,
    duration: number = 700
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = new THREE.Vector3(attackerX + 0.5, 0, attackerY + 0.5);
      const targetPos = new THREE.Vector3(targetX + 0.5, 0, targetY + 0.5);
      const direction = new THREE.Vector3().subVectors(targetPos, startPos).normalize();

      // Face target
      attackerObj.rotation.y = Math.atan2(direction.x, direction.z);

      // Create projectile orb
      const orbGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const orbMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set(attackerX + 0.5, 0.6, attackerY + 0.5);
      orb.name = 'projectile';
      this.particlesGroup.add(orb);

      // Glow ring around orb
      const glowGeo = new THREE.RingGeometry(0.15, 0.22, 12);
      const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      orb.add(glow);

      const task: AnimationTask = {
        id: `magic_atk_${this.idCounter++}`,
        type: 'skill',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          if (progress < 0.25) {
            // Channel phase — attacker rises slightly, orb grows
            const t = progress / 0.25;
            attackerObj.position.y = Math.sin(t * Math.PI) * 0.15;
            orb.scale.setScalar(0.5 + t * 0.5);
            orb.position.y = 0.6 + t * 0.2;
          } else {
            // Flight phase — orb travels to target
            const flightT = easeInOutCubic((progress - 0.25) / 0.75);
            const orbX = (attackerX + 0.5) + (targetPos.x - (attackerX + 0.5)) * flightT;
            const orbZ = (attackerY + 0.5) + (targetPos.z - (attackerY + 0.5)) * flightT;
            const arcHeight = Math.sin(flightT * Math.PI) * 0.8;
            orb.position.set(orbX, 0.5 + arcHeight, orbZ);
            orb.rotation.y += 0.15;
            glow.rotation.z += 0.1;

            attackerObj.position.y = 0;
          }
        },
        onComplete: () => {
          attackerObj.position.y = 0;
          this.particlesGroup.remove(orb);
          orbGeo.dispose();
          orbMat.dispose();
          glowGeo.dispose();
          glowMat.dispose();

          // Spawn impact burst at target
          this.spawnMagicBurstParticles(targetX + 0.5, 0.4, targetY + 0.5, color);
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // --- Heal Animation: Glow + Rising Particles ---
  playHealAnimation(
    targetObj: THREE.Object3D,
    targetX: number, targetY: number,
    duration: number = 600
  ): Promise<void> {
    return new Promise((resolve) => {
      const color = 0x56e59a;

      // Create heal column
      const columnGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.01, 16);
      const columnMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
      const column = new THREE.Mesh(columnGeo, columnMat);
      column.position.set(targetX + 0.5, 0.02, targetY + 0.5);
      this.particlesGroup.add(column);

      this.spawnRisingParticles(targetX + 0.5, 0.1, targetY + 0.5, color, 8);

      const task: AnimationTask = {
        id: `heal_${this.idCounter++}`,
        type: 'heal',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          // Column grows upward
          column.scale.y = 1 + progress * 80;
          column.position.y = progress * 0.8;
          columnMat.opacity = 0.5 * (1 - progress);

          // Target pulses with glow
          if (targetObj) {
            const pulse = 1 + Math.sin(progress * Math.PI * 4) * 0.06;
            targetObj.scale.setScalar(pulse);
          }
        },
        onComplete: () => {
          this.particlesGroup.remove(column);
          columnGeo.dispose();
          columnMat.dispose();
          if (targetObj) targetObj.scale.setScalar(1);
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // --- Hit Reaction Animation: Shake + Flash ---
  playHitReaction(
    targetObj: THREE.Object3D,
    damageType: 'physical' | 'magical' | 'healing',
    duration: number = 350
  ): Promise<void> {
    return new Promise((resolve) => {
      const originalX = targetObj.position.x;
      const originalZ = targetObj.position.z;
      const shakeIntensity = damageType === 'physical' ? 0.12 : 0.08;

      const task: AnimationTask = {
        id: `hit_${this.idCounter++}`,
        type: 'hit',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          if (progress < 0.7) {
            // Shake phase
            const shakeT = progress / 0.7;
            const decay = 1 - shakeT;
            const shakeX = Math.sin(shakeT * Math.PI * 8) * shakeIntensity * decay;
            const shakeZ = Math.cos(shakeT * Math.PI * 6) * shakeIntensity * decay * 0.5;
            targetObj.position.x = originalX + shakeX;
            targetObj.position.z = originalZ + shakeZ;
          } else {
            // Settle
            const settleT = (progress - 0.7) / 0.3;
            targetObj.position.x = originalX + (targetObj.position.x - originalX) * (1 - settleT);
            targetObj.position.z = originalZ + (targetObj.position.z - originalZ) * (1 - settleT);
          }

          // Flash white on meshes
          if (progress < 0.3) {
            targetObj.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.emissive.setHex(0xffffff);
                child.material.emissiveIntensity = (1 - progress / 0.3) * 0.8;
              }
            });
          } else {
            targetObj.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.emissiveIntensity = 0;
              }
            });
          }
        },
        onComplete: () => {
          targetObj.position.x = originalX;
          targetObj.position.z = originalZ;
          targetObj.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissiveIntensity = 0;
            }
          });
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // --- Death Animation: Shrink + Sink + Fade ---
  playDeathAnimation(
    unitObj: THREE.Object3D,
    duration: number = 800
  ): Promise<void> {
    return new Promise((resolve) => {
      const startY = unitObj.position.y;

      const task: AnimationTask = {
        id: `death_${this.idCounter++}`,
        type: 'death',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          const t = easeInOutCubic(progress);

          // Shrink
          const scale = 1 - t * 0.8;
          unitObj.scale.setScalar(Math.max(0.05, scale));

          // Sink into ground
          unitObj.position.y = startY - t * 0.5;

          // Rotate slightly (topple)
          unitObj.rotation.z = t * Math.PI * 0.15;

          // Fade opacity on all meshes
          unitObj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (child.material instanceof THREE.MeshStandardMaterial || child.material instanceof THREE.MeshBasicMaterial) {
                child.material.transparent = true;
                child.material.opacity = 1 - t;
              }
            }
          });
        },
        onComplete: () => {
          unitObj.visible = false;
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // --- Skill AoE Animation: Expanding Ring + Ground Blast ---
  playAoEAnimation(
    centerX: number, centerY: number,
    radius: number,
    color: number = 0xff9800,
    duration: number = 600
  ): Promise<void> {
    return new Promise((resolve) => {
      const ringGeo = new THREE.RingGeometry(0.1, 0.2, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(centerX + 0.5, 0.05, centerY + 0.5);
      this.particlesGroup.add(ring);

      const task: AnimationTask = {
        id: `aoe_${this.idCounter++}`,
        type: 'skill',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          const t = easeOutElastic(Math.min(1, progress * 1.2));
          const maxRadius = radius + 0.5;
          ring.scale.setScalar(1 + t * maxRadius * 4);
          ringMat.opacity = 0.8 * (1 - progress);
        },
        onComplete: () => {
          this.particlesGroup.remove(ring);
          ringGeo.dispose();
          ringMat.dispose();
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // --- Particle Spawners ---

  private spawnSlashParticles(x: number, y: number, z: number, color: number): void {
    for (let i = 0; i < 6; i++) {
      const geo = new THREE.BoxGeometry(0.04, 0.15, 0.04);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const particle = new THREE.Mesh(geo, mat);
      particle.position.set(x, y, z);
      particle.userData = {
        vx: (Math.random() - 0.5) * 0.08,
        vy: Math.random() * 0.06 + 0.02,
        vz: (Math.random() - 0.5) * 0.08,
        life: 1,
        decay: 0.025 + Math.random() * 0.015,
      };
      particle.name = 'particle';
      this.particlesGroup.add(particle);
    }
  }

  private spawnMagicBurstParticles(x: number, y: number, z: number, color: number): void {
    for (let i = 0; i < 12; i++) {
      const geo = new THREE.OctahedronGeometry(0.05 + Math.random() * 0.04, 0);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const particle = new THREE.Mesh(geo, mat);
      particle.position.set(x, y, z);
      const angle = (i / 12) * Math.PI * 2;
      const speed = 0.04 + Math.random() * 0.04;
      particle.userData = {
        vx: Math.cos(angle) * speed,
        vy: Math.random() * 0.05 + 0.02,
        vz: Math.sin(angle) * speed,
        life: 1,
        decay: 0.02 + Math.random() * 0.01,
      };
      particle.name = 'particle';
      this.particlesGroup.add(particle);
    }
  }

  private spawnRisingParticles(x: number, y: number, z: number, color: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.04, 4, 4);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const particle = new THREE.Mesh(geo, mat);
      const offsetX = (Math.random() - 0.5) * 0.6;
      const offsetZ = (Math.random() - 0.5) * 0.6;
      particle.position.set(x + offsetX, y, z + offsetZ);
      particle.userData = {
        vx: (Math.random() - 0.5) * 0.01,
        vy: 0.02 + Math.random() * 0.02,
        vz: (Math.random() - 0.5) * 0.01,
        life: 1,
        decay: 0.012 + Math.random() * 0.008,
      };
      particle.name = 'particle';
      this.particlesGroup.add(particle);
    }
  }

  private updateParticles(): void {
    const toRemove: THREE.Object3D[] = [];

    this.particlesGroup.children.forEach((child) => {
      if (child.name !== 'particle') return;

      const ud = child.userData;
      if (!ud || ud.life === undefined) return;

      child.position.x += ud.vx;
      child.position.y += ud.vy;
      child.position.z += ud.vz;
      ud.vy -= 0.001; // gravity
      ud.life -= ud.decay;

      if (child instanceof THREE.Mesh) {
        const mat = child.material;
        if (mat instanceof THREE.MeshBasicMaterial) {
          mat.opacity = Math.max(0, ud.life);
        }
      }

      child.rotation.x += 0.05;
      child.rotation.z += 0.03;

      if (ud.life <= 0) {
        toRemove.push(child);
      }
    });

    toRemove.forEach((obj) => {
      this.particlesGroup.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
      }
    });
  }

  dispose(): void {
    this.tasks = [];
    while (this.particlesGroup.children.length > 0) {
      const child = this.particlesGroup.children.pop()!;
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    }
    this.scene.remove(this.particlesGroup);
  }
}
