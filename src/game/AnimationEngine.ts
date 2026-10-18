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

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

// --- Animation Engine ---

export class AnimationEngine {
  private tasks: AnimationTask[] = [];
  private scene: THREE.Scene;
  private particlesGroup: THREE.Group;
  private idCounter = 0;
  private onCameraShake?: (intensity: number, duration: number) => void;

  constructor(scene: THREE.Scene, onCameraShake?: (intensity: number, duration: number) => void) {
    this.scene = scene;
    this.onCameraShake = onCameraShake;
    this.particlesGroup = new THREE.Group();
    this.particlesGroup.name = 'particles';
    this.scene.add(this.particlesGroup);
  }

  setCameraShakeHandler(handler: (intensity: number, duration: number) => void): void {
    this.onCameraShake = handler;
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

      try {
        task.onUpdate(rawProgress);

        if (rawProgress >= 1) {
          task.isComplete = true;
          task.onComplete();
          toRemove.push(task.id);
        }
      } catch (err) {
        console.error(`Error in animation task ${task.id}:`, err);
        task.isComplete = true;
        try {
          task.onComplete();
        } catch (completeErr) {
          console.error(`Error in onComplete for animation task ${task.id}:`, completeErr);
        }
        toRemove.push(task.id);
      }
    }

    if (toRemove.length > 0) {
      this.tasks = this.tasks.filter((t) => !toRemove.includes(t.id));
    }

    this.updateParticles();
  }

  // ==========================================
  // 1. MOVEMENT ANIMATION (Smooth parabolic hop)
  // ==========================================
  playMoveAnimation(
    unitObj: THREE.Object3D,
    fromX: number, fromY: number,
    toX: number, toY: number,
    duration: number = 420
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = new THREE.Vector3(fromX + 0.5, 0, fromY + 0.5);
      const endPos = new THREE.Vector3(toX + 0.5, 0, toY + 0.5);

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
          const hopHeight = Math.sin(progress * Math.PI) * 0.38;
          unitObj.position.set(x, hopHeight, z);
          // Subtle forward tilt during hop
          unitObj.rotation.x = Math.sin(progress * Math.PI) * 0.12;
        },
        onComplete: () => {
          unitObj.position.set(endPos.x, 0, endPos.z);
          unitObj.rotation.x = 0;
          this.spawnDustParticles(endPos.x, 0.05, endPos.z, 5);
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // ==========================================
  // 2. PHYSICAL MELEE LUNGE & SLASH
  // ==========================================
  playPhysicalAttackAnimation(
    attackerObj: THREE.Object3D,
    attackerX: number, attackerY: number,
    targetX: number, targetY: number,
    duration: number = 450
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = new THREE.Vector3(attackerX + 0.5, 0, attackerY + 0.5);
      const targetPos = new THREE.Vector3(targetX + 0.5, 0, targetY + 0.5);
      const direction = new THREE.Vector3().subVectors(targetPos, startPos).normalize();

      attackerObj.rotation.y = Math.atan2(direction.x, direction.z);

      const lungeDist = 0.52;
      const lungePos = new THREE.Vector3(
        startPos.x + direction.x * lungeDist,
        0,
        startPos.z + direction.z * lungeDist
      );

      // Create glowing curved slash arc
      const slashArc = this.createSlashArcMesh(0xf43f5e);
      slashArc.position.set(targetPos.x, 0.45, targetPos.z);
      slashArc.rotation.y = Math.atan2(direction.x, direction.z);
      slashArc.visible = false;
      this.particlesGroup.add(slashArc);

      const task: AnimationTask = {
        id: `phys_atk_${this.idCounter++}`,
        type: 'attack',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          if (progress < 0.42) {
            // Forward lunge + anticipation
            const t = easeOutBack(progress / 0.42);
            attackerObj.position.lerpVectors(startPos, lungePos, t);
            attackerObj.rotation.x = Math.sin((progress / 0.42) * Math.PI) * 0.28;
          } else if (progress < 0.60) {
            // Impact frame
            attackerObj.position.copy(lungePos);
            attackerObj.rotation.x = 0.1;
            if (!slashArc.visible) {
              slashArc.visible = true;
              this.spawnSlashParticles(targetPos.x, 0.5, targetPos.z, 0xff2a55);
              this.onCameraShake?.(0.06, 180);
            }
            const slashProg = (progress - 0.42) / 0.18;
            slashArc.scale.setScalar(0.7 + slashProg * 0.8);
            slashArc.rotation.z = -Math.PI / 4 + slashProg * (Math.PI / 2);
          } else {
            // Return to start position
            slashArc.visible = false;
            const returnT = easeInOutCubic((progress - 0.60) / 0.40);
            attackerObj.position.lerpVectors(lungePos, startPos, returnT);
            attackerObj.rotation.x = 0;
          }
        },
        onComplete: () => {
          attackerObj.position.copy(startPos);
          attackerObj.rotation.x = 0;
          this.particlesGroup.remove(slashArc);
          slashArc.traverse((c) => {
            if (c instanceof THREE.Mesh) {
              c.geometry.dispose();
              if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
              else c.material.dispose();
            }
          });
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // ==========================================
  // 3. ARCHERY: BALLISTIC ARROW & VOLLEY
  // ==========================================
  playArrowAnimation(
    attackerObj: THREE.Object3D,
    attackerX: number, attackerY: number,
    targetX: number, targetY: number,
    isVolley: boolean = false,
    duration: number = 460
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = new THREE.Vector3(attackerX + 0.5, 0.55, attackerY + 0.5);
      const targetPos = new THREE.Vector3(targetX + 0.5, 0.45, targetY + 0.5);
      const direction = new THREE.Vector3().subVectors(targetPos, startPos).normalize();

      attackerObj.rotation.y = Math.atan2(direction.x, direction.z);

      // Create Arrow meshes
      const arrowCount = isVolley ? 3 : 1;
      const arrows: THREE.Group[] = [];

      for (let i = 0; i < arrowCount; i++) {
        const arrow = this.createArrowMesh();
        const lateralOffset = (i - (arrowCount - 1) / 2) * 0.22;
        arrow.position.copy(startPos).add(new THREE.Vector3(-direction.z * lateralOffset, 0, direction.x * lateralOffset));
        this.particlesGroup.add(arrow);
        arrows.push(arrow);
      }

      const dist = startPos.distanceTo(targetPos);
      const peakHeight = 0.5 + dist * 0.18;

      const task: AnimationTask = {
        id: `arrow_${this.idCounter++}`,
        type: 'projectile',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          // Attacker recoil
          if (progress < 0.2) {
            attackerObj.position.y = Math.sin((progress / 0.2) * Math.PI) * 0.08;
          } else {
            attackerObj.position.y = 0;
          }

          arrows.forEach((arrow, i) => {
            const spreadOffset = isVolley ? (i - 1) * 0.15 : 0;
            const t = Math.min(1, Math.max(0, (progress - (i * 0.04)) / (1 - i * 0.04)));
            const currX = THREE.MathUtils.lerp(startPos.x, targetPos.x + spreadOffset, t);
            const currZ = THREE.MathUtils.lerp(startPos.z, targetPos.z + spreadOffset, t);
            const currY = THREE.MathUtils.lerp(startPos.y, targetPos.y, t) + Math.sin(t * Math.PI) * peakHeight;

            arrow.position.set(currX, currY, currZ);

            // Rotate along trajectory tangent
            const dt = 0.02;
            const nextT = Math.min(1, t + dt);
            const nextX = THREE.MathUtils.lerp(startPos.x, targetPos.x + spreadOffset, nextT);
            const nextZ = THREE.MathUtils.lerp(startPos.z, targetPos.z + spreadOffset, nextT);
            const nextY = THREE.MathUtils.lerp(startPos.y, targetPos.y, nextT) + Math.sin(nextT * Math.PI) * peakHeight;

            const trajDir = new THREE.Vector3(nextX - currX, nextY - currY, nextZ - currZ).normalize();
            arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), trajDir);

            // Subtle trail particles
            if (Math.random() < 0.4) {
              this.spawnParticleDot(currX, currY, currZ, 0xe2e8f0, 0.03, 0.015);
            }
          });
        },
        onComplete: () => {
          arrows.forEach((arrow) => {
            this.particlesGroup.remove(arrow);
            arrow.traverse((c) => {
              if (c instanceof THREE.Mesh) {
                c.geometry.dispose();
                if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
                else c.material.dispose();
              }
            });
          });
          this.spawnSlashParticles(targetPos.x, 0.5, targetPos.z, 0xfacc15);
          this.onCameraShake?.(0.04, 150);
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // ==========================================
  // 4. FIREBALL & METEOR STRIKE
  // ==========================================
  playFireballAnimation(
    attackerObj: THREE.Object3D,
    attackerX: number, attackerY: number,
    targetX: number, targetY: number,
    isMeteor: boolean = false,
    aoeRadius: number = 0,
    duration: number = 650
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = isMeteor
        ? new THREE.Vector3(targetX + 0.5 - 2.5, 6.5, targetY + 0.5 - 2.5)
        : new THREE.Vector3(attackerX + 0.5, 0.6, attackerY + 0.5);
      const targetPos = new THREE.Vector3(targetX + 0.5, 0.35, targetY + 0.5);

      if (!isMeteor) {
        const dir = new THREE.Vector3().subVectors(targetPos, startPos).normalize();
        attackerObj.rotation.y = Math.atan2(dir.x, dir.z);
      }

      // Fiery core sphere
      const fireSize = isMeteor ? 0.35 : 0.18;
      const coreGeo = new THREE.SphereGeometry(fireSize, 8, 8);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xff4500,
        emissive: 0xffaa00,
        emissiveIntensity: 2.0,
        roughness: 0.2,
      });
      const fireball = new THREE.Mesh(coreGeo, coreMat);
      fireball.position.copy(startPos);
      this.particlesGroup.add(fireball);

      // Outer fire halo
      const ringGeo = new THREE.RingGeometry(fireSize * 1.1, fireSize * 1.6, 12);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xff3b00, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      fireball.add(ring);

      const task: AnimationTask = {
        id: `fire_${this.idCounter++}`,
        type: 'projectile',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          const t = easeInOutCubic(progress);
          const currX = THREE.MathUtils.lerp(startPos.x, targetPos.x, t);
          const currZ = THREE.MathUtils.lerp(startPos.z, targetPos.z, t);
          const arc = isMeteor ? 0 : Math.sin(t * Math.PI) * 0.7;
          const currY = THREE.MathUtils.lerp(startPos.y, targetPos.y, t) + arc;

          fireball.position.set(currX, currY, currZ);
          fireball.rotation.x += 0.2;
          fireball.rotation.y += 0.15;
          ring.rotation.z += 0.18;

          // Trailing ember sparks
          this.spawnFireParticles(currX, currY, currZ, 2);
        },
        onComplete: () => {
          this.particlesGroup.remove(fireball);
          coreGeo.dispose();
          coreMat.dispose();
          ringGeo.dispose();
          ringMat.dispose();

          // Detonation blast & camera shake
          this.spawnFireExplosion(targetPos.x, 0.4, targetPos.z, isMeteor || aoeRadius > 0);
          this.onCameraShake?.(isMeteor ? 0.22 : 0.12, isMeteor ? 380 : 250);
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // ==========================================
  // 5. ICE SHARD & FROST NOVA
  // ==========================================
  playIceShardAnimation(
    attackerObj: THREE.Object3D,
    attackerX: number, attackerY: number,
    targetX: number, targetY: number,
    isNova: boolean = false,
    aoeRadius: number = 0,
    duration: number = 580
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = new THREE.Vector3(attackerX + 0.5, 0.55, attackerY + 0.5);
      const targetPos = new THREE.Vector3(targetX + 0.5, 0.45, targetY + 0.5);
      const direction = new THREE.Vector3().subVectors(targetPos, startPos).normalize();

      attackerObj.rotation.y = Math.atan2(direction.x, direction.z);

      // Crystalline Icicle Mesh
      const iceGeo = new THREE.ConeGeometry(0.12, 0.45, 5);
      iceGeo.rotateX(Math.PI / 2);
      const iceMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.2,
        roughness: 0.1,
        transparent: true,
        opacity: 0.9,
      });
      const icicle = new THREE.Mesh(iceGeo, iceMat);
      icicle.position.copy(startPos);
      icicle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
      this.particlesGroup.add(icicle);

      const task: AnimationTask = {
        id: `ice_${this.idCounter++}`,
        type: 'projectile',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          const t = easeOutQuad(progress);
          icicle.position.lerpVectors(startPos, targetPos, t);
          icicle.rotation.z += 0.25;

          // Frost glints trailing
          if (Math.random() < 0.6) {
            this.spawnParticleDot(icicle.position.x, icicle.position.y, icicle.position.z, 0xbae6fd, 0.04, 0.02);
          }
        },
        onComplete: () => {
          this.particlesGroup.remove(icicle);
          iceGeo.dispose();
          iceMat.dispose();

          this.spawnIceShatter(targetPos.x, 0.35, targetPos.z, isNova || aoeRadius > 0);
          this.onCameraShake?.(0.08, 200);
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // ==========================================
  // 6. LIGHTNING BOLT & ARCANE SHOCK
  // ==========================================
  playLightningAnimation(
    startX: number, startY: number,
    targetX: number, targetY: number,
    duration: number = 380
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = new THREE.Vector3(startX + 0.5, 0.6, startY + 0.5);
      const targetPos = new THREE.Vector3(targetX + 0.5, 0.3, targetY + 0.5);

      // Create multi-segment jagged lightning
      const segments = 8;
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const p = new THREE.Vector3().lerpVectors(startPos, targetPos, t);
        if (i > 0 && i < segments) {
          p.x += (Math.random() - 0.5) * 0.35;
          p.y += (Math.random() - 0.5) * 0.35;
          p.z += (Math.random() - 0.5) * 0.35;
        }
        points.push(p);
      }

      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 3 });
      const bolt = new THREE.Line(lineGeo, lineMat);
      this.particlesGroup.add(bolt);

      // Target impact flash
      const flashGeo = new THREE.SphereGeometry(0.28, 6, 6);
      const flashMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.9 });
      const flash = new THREE.Mesh(flashGeo, flashMat);
      flash.position.copy(targetPos);
      this.particlesGroup.add(flash);

      this.onCameraShake?.(0.14, 220);

      const task: AnimationTask = {
        id: `lightn_${this.idCounter++}`,
        type: 'skill',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          // Jitter bolt segments
          const posAttr = lineGeo.attributes.position as THREE.BufferAttribute;
          for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const px = THREE.MathUtils.lerp(startPos.x, targetPos.x, t) + (Math.random() - 0.5) * 0.25;
            const py = THREE.MathUtils.lerp(startPos.y, targetPos.y, t) + (Math.random() - 0.5) * 0.25;
            const pz = THREE.MathUtils.lerp(startPos.z, targetPos.z, t) + (Math.random() - 0.5) * 0.25;
            posAttr.setXYZ(i, px, py, pz);
          }
          posAttr.needsUpdate = true;

          flash.scale.setScalar(1 + (1 - progress) * 1.5);
          flashMat.opacity = Math.max(0, 1 - progress * 1.5);

          if (Math.random() < 0.6) {
            this.spawnElectricSparks(targetPos.x, 0.4, targetPos.z, 0x00f0ff);
          }
        },
        onComplete: () => {
          this.particlesGroup.remove(bolt);
          this.particlesGroup.remove(flash);
          lineGeo.dispose();
          lineMat.dispose();
          flashGeo.dispose();
          flashMat.dispose();
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // ==========================================
  // 7. HOLY LIGHT PILLAR & BLESSING
  // ==========================================
  playHolyLightAnimation(
    targetObj: THREE.Object3D,
    targetX: number, targetY: number,
    aoeRadius: number = 0,
    duration: number = 650
  ): Promise<void> {
    return new Promise((resolve) => {
      const radius = aoeRadius > 0 ? aoeRadius + 0.4 : 0.5;
      const pillarGeo = new THREE.CylinderGeometry(radius, radius, 7, 16, 1, true);
      const pillarMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(targetX + 0.5, 3.5, targetY + 0.5);
      this.particlesGroup.add(pillar);

      // Sacred golden halo ring
      const haloGeo = new THREE.RingGeometry(radius * 0.8, radius * 1.1, 16);
      haloGeo.rotateX(-Math.PI / 2);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(targetX + 0.5, 0.05, targetY + 0.5);
      this.particlesGroup.add(halo);

      this.spawnGoldenStars(targetX + 0.5, 0.2, targetY + 0.5, 12);

      const task: AnimationTask = {
        id: `holy_${this.idCounter++}`,
        type: 'heal',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          pillarMat.opacity = Math.sin(progress * Math.PI) * 0.65;
          halo.scale.setScalar(1 + progress * 0.8);
          haloMat.opacity = Math.max(0, 0.9 * (1 - progress));

          if (targetObj?.scale && typeof targetObj.scale.setScalar === 'function') {
            const pulse = 1 + Math.sin(progress * Math.PI) * 0.12;
            targetObj.scale.setScalar(pulse);
          }
        },
        onComplete: () => {
          this.particlesGroup.remove(pillar);
          this.particlesGroup.remove(halo);
          pillarGeo.dispose();
          pillarMat.dispose();
          haloGeo.dispose();
          haloMat.dispose();
          if (targetObj?.scale && typeof targetObj.scale.setScalar === 'function') {
            targetObj.scale.setScalar(1);
          }
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // ==========================================
  // 8. VOID DRAIN & DARK MIASMA
  // ==========================================
  playVoidDrainAnimation(
    attackerObj: THREE.Object3D,
    attackerX: number, attackerY: number,
    targetX: number, targetY: number,
    duration: number = 720
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = new THREE.Vector3(attackerX + 0.5, 0.5, attackerY + 0.5);
      const targetPos = new THREE.Vector3(targetX + 0.5, 0.5, targetY + 0.5);
      const dir = new THREE.Vector3().subVectors(targetPos, startPos).normalize();
      attackerObj.rotation.y = Math.atan2(dir.x, dir.z);

      // Dark Skull Orb
      const voidGeo = new THREE.SphereGeometry(0.2, 6, 6);
      const voidMat = new THREE.MeshStandardMaterial({
        color: 0x1e1b4b,
        emissive: 0x7c3aed,
        emissiveIntensity: 1.8,
        roughness: 0.2,
      });
      const voidOrb = new THREE.Mesh(voidGeo, voidMat);
      voidOrb.position.copy(targetPos);
      this.particlesGroup.add(voidOrb);

      const task: AnimationTask = {
        id: `void_${this.idCounter++}`,
        type: 'skill',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          if (progress < 0.45) {
            // Siphon phase on target
            const pulse = 1 + Math.sin((progress / 0.45) * Math.PI * 4) * 0.3;
            voidOrb.scale.setScalar(pulse);
            this.spawnShadowPuff(targetPos.x, targetPos.y, targetPos.z, 0x8b5cf6);
          } else {
            // Stream flows back to caster
            const siphonT = easeInOutCubic((progress - 0.45) / 0.55);
            voidOrb.position.lerpVectors(targetPos, startPos, siphonT);
            voidOrb.scale.setScalar(Math.max(0.05, 1 - siphonT * 0.6));
          }
        },
        onComplete: () => {
          this.particlesGroup.remove(voidOrb);
          voidGeo.dispose();
          voidMat.dispose();
          this.spawnGoldenStars(startPos.x, 0.4, startPos.z, 6);
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // ==========================================
  // 9. ARTILLERY CANNON BOMB
  // ==========================================
  playCannonBombAnimation(
    attackerObj: THREE.Object3D,
    attackerX: number, attackerY: number,
    targetX: number, targetY: number,
    aoeRadius: number = 0,
    duration: number = 620
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = new THREE.Vector3(attackerX + 0.5, 0.5, attackerY + 0.5);
      const targetPos = new THREE.Vector3(targetX + 0.5, 0.25, targetY + 0.5);
      const dir = new THREE.Vector3().subVectors(targetPos, startPos).normalize();

      attackerObj.rotation.y = Math.atan2(dir.x, dir.z);

      // Heavy Iron Cannonball Mesh
      const ballGeo = new THREE.SphereGeometry(0.16, 8, 8);
      const ballMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
      const cannonball = new THREE.Mesh(ballGeo, ballMat);
      cannonball.position.copy(startPos);
      this.particlesGroup.add(cannonball);

      const dist = startPos.distanceTo(targetPos);
      const peakY = 1.0 + dist * 0.25;

      const task: AnimationTask = {
        id: `cannon_${this.idCounter++}`,
        type: 'projectile',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          const t = easeInOutCubic(progress);
          const x = THREE.MathUtils.lerp(startPos.x, targetPos.x, t);
          const z = THREE.MathUtils.lerp(startPos.z, targetPos.z, t);
          const y = THREE.MathUtils.lerp(startPos.y, targetPos.y, t) + Math.sin(t * Math.PI) * peakY;

          cannonball.position.set(x, y, z);
          cannonball.rotation.x += 0.3;
          cannonball.rotation.z += 0.2;

          // Lit fuse sparks
          this.spawnParticleDot(x, y + 0.12, z, 0xf97316, 0.035, 0.025);
        },
        onComplete: () => {
          this.particlesGroup.remove(cannonball);
          ballGeo.dispose();
          ballMat.dispose();

          this.spawnFireExplosion(targetPos.x, 0.3, targetPos.z, aoeRadius > 0);
          this.onCameraShake?.(aoeRadius > 0 ? 0.22 : 0.16, 320);
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // ==========================================
  // 10. WHIRLWIND / CIRCULAR SPIN ATTACK
  // ==========================================
  playWhirlwindAnimation(
    attackerObj: THREE.Object3D,
    centerX: number, centerY: number,
    aoeRadius: number = 1,
    duration: number = 550
  ): Promise<void> {
    return new Promise((resolve) => {
      const radius = aoeRadius + 0.3;
      const spinRingGeo = new THREE.RingGeometry(radius * 0.4, radius, 24);
      spinRingGeo.rotateX(-Math.PI / 2);
      const spinRingMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const spinRing = new THREE.Mesh(spinRingGeo, spinRingMat);
      spinRing.position.set(centerX + 0.5, 0.2, centerY + 0.5);
      this.particlesGroup.add(spinRing);

      this.onCameraShake?.(0.14, 250);

      const task: AnimationTask = {
        id: `whirl_${this.idCounter++}`,
        type: 'attack',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          // Attacker spins 720 degrees
          attackerObj.rotation.y += 0.45;
          spinRing.rotation.y -= 0.3;
          spinRingMat.opacity = Math.max(0, 0.8 * (1 - progress));
          spinRing.scale.setScalar(1 + progress * 0.5);

          if (Math.random() < 0.6) {
            this.spawnSlashParticles(centerX + 0.5, 0.4, centerY + 0.5, 0xf43f5e);
          }
        },
        onComplete: () => {
          this.particlesGroup.remove(spinRing);
          spinRingGeo.dispose();
          spinRingMat.dispose();
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // ==========================================
  // 11. SHADOW DASH & DUAL CROSS-SLASH
  // ==========================================
  playShadowDashAnimation(
    attackerObj: THREE.Object3D,
    attackerX: number, attackerY: number,
    targetX: number, targetY: number,
    duration: number = 520
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = new THREE.Vector3(attackerX + 0.5, 0, attackerY + 0.5);
      const targetPos = new THREE.Vector3(targetX + 0.5, 0, targetY + 0.5);
      const dir = new THREE.Vector3().subVectors(targetPos, startPos).normalize();

      const strikePos = new THREE.Vector3(
        targetPos.x - dir.x * 0.45,
        0,
        targetPos.z - dir.y * 0.45
      );

      this.spawnShadowPuff(startPos.x, 0.4, startPos.z, 0x18181b);

      const task: AnimationTask = {
        id: `shadow_${this.idCounter++}`,
        type: 'attack',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          if (progress < 0.3) {
            // Shadow flash dash
            const t = progress / 0.3;
            attackerObj.position.lerpVectors(startPos, strikePos, t);
          } else if (progress < 0.65) {
            // Dual cross slash
            attackerObj.position.copy(strikePos);
            attackerObj.rotation.y = Math.atan2(dir.x, dir.z);
            if (progress > 0.35 && progress < 0.42) {
              this.spawnSlashParticles(targetPos.x, 0.45, targetPos.z, 0xef4444);
              this.onCameraShake?.(0.08, 180);
            }
          } else {
            // Backstep to origin
            const returnT = (progress - 0.65) / 0.35;
            attackerObj.position.lerpVectors(strikePos, startPos, returnT);
          }
        },
        onComplete: () => {
          attackerObj.position.copy(startPos);
          this.spawnShadowPuff(startPos.x, 0.4, startPos.z, 0x18181b);
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // ==========================================
  // 12. HEAVY LEAP SLAM & EARTH TREMOR
  // ==========================================
  playHeavySlamAnimation(
    attackerObj: THREE.Object3D,
    attackerX: number, attackerY: number,
    targetX: number, targetY: number,
    aoeRadius: number = 0,
    duration: number = 520
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = new THREE.Vector3(attackerX + 0.5, 0, attackerY + 0.5);
      const targetPos = new THREE.Vector3(targetX + 0.5, 0, targetY + 0.5);
      const dir = new THREE.Vector3().subVectors(targetPos, startPos).normalize();

      attackerObj.rotation.y = Math.atan2(dir.x, dir.z);

      const slamPos = new THREE.Vector3(
        targetPos.x - dir.x * 0.45,
        0,
        targetPos.z - dir.z * 0.45
      );

      const task: AnimationTask = {
        id: `slam_${this.idCounter++}`,
        type: 'attack',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          if (progress < 0.45) {
            // High leap
            const t = progress / 0.45;
            attackerObj.position.lerpVectors(startPos, slamPos, t);
            attackerObj.position.y = Math.sin(t * Math.PI) * 0.85;
            attackerObj.rotation.x = -Math.sin(t * Math.PI) * 0.4;
          } else if (progress < 0.65) {
            // Crushing downward impact
            attackerObj.position.copy(slamPos);
            attackerObj.rotation.x = 0.3;
          } else {
            // Recover and return
            const returnT = (progress - 0.65) / 0.35;
            attackerObj.position.lerpVectors(slamPos, startPos, returnT);
            attackerObj.rotation.x = 0;
          }
        },
        onComplete: () => {
          attackerObj.position.copy(startPos);
          attackerObj.rotation.x = 0;
          const dustCount = aoeRadius > 0 ? 24 : 14;
          this.spawnDustParticles(targetPos.x, 0.1, targetPos.z, dustCount);
          this.onCameraShake?.(aoeRadius > 0 ? 0.22 : 0.16, 300);
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // ==========================================
  // 13. GENERIC MAGIC ATTACK
  // ==========================================
  playMagicAttackAnimation(
    attackerObj: THREE.Object3D,
    attackerX: number, attackerY: number,
    targetX: number, targetY: number,
    color: number = 0xb58aff,
    duration: number = 650
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = new THREE.Vector3(attackerX + 0.5, 0.6, attackerY + 0.5);
      const targetPos = new THREE.Vector3(targetX + 0.5, 0.4, targetY + 0.5);
      const dir = new THREE.Vector3().subVectors(targetPos, startPos).normalize();

      attackerObj.rotation.y = Math.atan2(dir.x, dir.z);

      const orbGeo = new THREE.SphereGeometry(0.15, 8, 8);
      const orbMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1.6,
        roughness: 0.3,
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.copy(startPos);
      this.particlesGroup.add(orb);

      const task: AnimationTask = {
        id: `magic_${this.idCounter++}`,
        type: 'skill',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          const t = easeInOutCubic(progress);
          const x = THREE.MathUtils.lerp(startPos.x, targetPos.x, t);
          const z = THREE.MathUtils.lerp(startPos.z, targetPos.z, t);
          const y = THREE.MathUtils.lerp(startPos.y, targetPos.y, t) + Math.sin(t * Math.PI) * 0.6;

          orb.position.set(x, y, z);
          orb.rotation.y += 0.2;

          this.spawnParticleDot(x, y, z, color, 0.04, 0.02);
        },
        onComplete: () => {
          this.particlesGroup.remove(orb);
          orbGeo.dispose();
          orbMat.dispose();
          this.spawnElectricSparks(targetPos.x, 0.4, targetPos.z, color);
          this.onCameraShake?.(0.08, 180);
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // ==========================================
  // 14. HEAL ANIMATION (Legacy support)
  // ==========================================
  playHealAnimation(
    targetObj: THREE.Object3D,
    targetX: number, targetY: number,
    duration: number = 600
  ): Promise<void> {
    return this.playHolyLightAnimation(targetObj, targetX, targetY, 0, duration);
  }

  // ==========================================
  // 15. HIT REACTION & DAMAGE FLASH
  // ==========================================
  playHitReaction(
    targetObj: THREE.Object3D,
    damageType: 'physical' | 'magical' | 'healing',
    duration: number = 320
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!targetObj || !targetObj.position) {
        resolve();
        return;
      }
      const origX = targetObj.position.x;
      const origZ = targetObj.position.z;
      const intensity = damageType === 'physical' ? 0.14 : 0.09;

      const task: AnimationTask = {
        id: `hit_${this.idCounter++}`,
        type: 'hit',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          if (targetObj.position) {
            if (progress < 0.65) {
              const decay = 1 - progress / 0.65;
              targetObj.position.x = origX + Math.sin(progress * 35) * intensity * decay;
              targetObj.position.z = origZ + Math.cos(progress * 25) * intensity * decay * 0.5;
            } else {
              targetObj.position.x = origX;
              targetObj.position.z = origZ;
            }
          }

          // High-contrast emissive flash
          if (typeof targetObj.traverse === 'function') {
            if (progress < 0.35) {
              const flashVal = (1 - progress / 0.35) * 0.9;
              targetObj.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                  child.material.emissive.setHex(damageType === 'healing' ? 0x22c55e : 0xffffff);
                  child.material.emissiveIntensity = flashVal;
                }
              });
            } else {
              targetObj.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                  child.material.emissiveIntensity = 0;
                }
              });
            }
          }
        },
        onComplete: () => {
          if (targetObj.position) {
            targetObj.position.x = origX;
            targetObj.position.z = origZ;
          }
          if (typeof targetObj.traverse === 'function') {
            targetObj.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.emissiveIntensity = 0;
              }
            });
          }
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // ==========================================
  // 16. DEATH ANIMATION
  // ==========================================
  playDeathAnimation(
    unitObj: THREE.Object3D,
    duration: number = 750
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!unitObj || !unitObj.position) {
        resolve();
        return;
      }
      const startY = unitObj.position.y;

      const task: AnimationTask = {
        id: `death_${this.idCounter++}`,
        type: 'death',
        startTime: Date.now(),
        duration,
        isComplete: false,
        onUpdate: (progress) => {
          const t = easeInOutCubic(progress);
          if (unitObj.scale && typeof unitObj.scale.setScalar === 'function') {
            unitObj.scale.setScalar(Math.max(0.01, 1 - t * 0.9));
          }
          if (unitObj.position) {
            unitObj.position.y = startY - t * 0.45;
          }
          if (unitObj.rotation) {
            unitObj.rotation.z = t * 0.4;
          }

          if (typeof unitObj.traverse === 'function') {
            unitObj.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                if (child.material instanceof THREE.MeshStandardMaterial || child.material instanceof THREE.MeshBasicMaterial) {
                  child.material.transparent = true;
                  child.material.opacity = 1 - t;
                }
              }
            });
          }
        },
        onComplete: () => {
          unitObj.visible = false;
          resolve();
        },
      };

      this.tasks.push(task);
    });
  }

  // ==========================================
  // 17. AOE SHOCKWAVE / EXPANDING RING
  // ==========================================
  playAoEAnimation(
    centerX: number, centerY: number,
    radius: number,
    color: number = 0xff9800,
    duration: number = 550
  ): Promise<void> {
    return new Promise((resolve) => {
      const ringGeo = new THREE.RingGeometry(0.1, 0.25, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
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
          const maxRadius = (radius + 0.5) * 4;
          ring.scale.setScalar(1 + t * maxRadius);
          ringMat.opacity = Math.max(0, 0.85 * (1 - progress));
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

  // ==========================================
  // PARTICLE GENERATORS & HELPERS
  // ==========================================

  private createArrowMesh(): THREE.Group {
    const group = new THREE.Group();

    // Wooden shaft
    const shaftGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 5);
    shaftGeo.rotateX(Math.PI / 2);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    group.add(shaft);

    // Steel arrowhead
    const headGeo = new THREE.ConeGeometry(0.04, 0.12, 5);
    headGeo.rotateX(Math.PI / 2);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.z = 0.26;
    group.add(head);

    // Fletching feathers
    const fletchGeo = new THREE.BoxGeometry(0.06, 0.04, 0.1);
    const fletchMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const fletch = new THREE.Mesh(fletchGeo, fletchMat);
    fletch.position.z = -0.22;
    group.add(fletch);

    return group;
  }

  private createSlashArcMesh(color: number): THREE.Group {
    const group = new THREE.Group();
    const arcGeo = new THREE.RingGeometry(0.4, 0.65, 16, 1, 0, Math.PI * 0.75);
    const arcMat = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const arc = new THREE.Mesh(arcGeo, arcMat);
    arc.rotation.x = -Math.PI / 2;
    group.add(arc);
    return group;
  }

  private spawnParticleDot(x: number, y: number, z: number, color: number, size: number, decay: number): void {
    const geo = new THREE.SphereGeometry(size, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
    const p = new THREE.Mesh(geo, mat);
    p.position.set(x, y, z);
    p.userData = {
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      vz: (Math.random() - 0.5) * 0.02,
      life: 1,
      decay,
    };
    p.name = 'particle';
    this.particlesGroup.add(p);
  }

  private spawnFireParticles(x: number, y: number, z: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.035, 4, 4);
      const mat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xff4500 : 0xfacc15, transparent: true, opacity: 0.9 });
      const p = new THREE.Mesh(geo, mat);
      p.position.set(x + (Math.random() - 0.5) * 0.1, y + (Math.random() - 0.5) * 0.1, z + (Math.random() - 0.5) * 0.1);
      p.userData = {
        vx: (Math.random() - 0.5) * 0.03,
        vy: Math.random() * 0.03 + 0.01,
        vz: (Math.random() - 0.5) * 0.03,
        life: 1,
        decay: 0.04 + Math.random() * 0.03,
      };
      p.name = 'particle';
      this.particlesGroup.add(p);
    }
  }

  private spawnFireExplosion(x: number, y: number, z: number, isBig: boolean): void {
    const count = isBig ? 24 : 14;
    for (let i = 0; i < count; i++) {
      const geo = new THREE.OctahedronGeometry(0.06 + Math.random() * 0.06, 0);
      const color = Math.random() > 0.3 ? 0xff4500 : 0xfbbf24;
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const p = new THREE.Mesh(geo, mat);
      p.position.set(x, y, z);
      const speed = isBig ? 0.08 + Math.random() * 0.07 : 0.05 + Math.random() * 0.05;
      const angle = Math.random() * Math.PI * 2;
      p.userData = {
        vx: Math.cos(angle) * speed,
        vy: Math.random() * 0.08 + 0.03,
        vz: Math.sin(angle) * speed,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
      };
      p.name = 'particle';
      this.particlesGroup.add(p);
    }
  }

  private spawnIceShatter(x: number, y: number, z: number, isBig: boolean): void {
    const count = isBig ? 18 : 10;
    for (let i = 0; i < count; i++) {
      const geo = new THREE.ConeGeometry(0.04, 0.12, 4);
      const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 });
      const p = new THREE.Mesh(geo, mat);
      p.position.set(x, y, z);
      const speed = 0.06 + Math.random() * 0.05;
      const angle = Math.random() * Math.PI * 2;
      p.userData = {
        vx: Math.cos(angle) * speed,
        vy: Math.random() * 0.07 + 0.02,
        vz: Math.sin(angle) * speed,
        life: 1,
        decay: 0.025 + Math.random() * 0.02,
      };
      p.name = 'particle';
      this.particlesGroup.add(p);
    }
  }

  private spawnElectricSparks(x: number, y: number, z: number, color: number): void {
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.BoxGeometry(0.025, 0.08, 0.025);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const p = new THREE.Mesh(geo, mat);
      p.position.set(x, y, z);
      p.userData = {
        vx: (Math.random() - 0.5) * 0.08,
        vy: Math.random() * 0.06 + 0.01,
        vz: (Math.random() - 0.5) * 0.08,
        life: 1,
        decay: 0.04 + Math.random() * 0.03,
      };
      p.name = 'particle';
      this.particlesGroup.add(p);
    }
  }

  private spawnGoldenStars(x: number, y: number, z: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const geo = new THREE.OctahedronGeometry(0.045, 0);
      const mat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 1 });
      const p = new THREE.Mesh(geo, mat);
      p.position.set(x + (Math.random() - 0.5) * 0.6, y, z + (Math.random() - 0.5) * 0.6);
      p.userData = {
        vx: (Math.random() - 0.5) * 0.015,
        vy: Math.random() * 0.04 + 0.02,
        vz: (Math.random() - 0.5) * 0.015,
        life: 1,
        decay: 0.018 + Math.random() * 0.01,
      };
      p.name = 'particle';
      this.particlesGroup.add(p);
    }
  }

  private spawnShadowPuff(x: number, y: number, z: number, color: number): void {
    for (let i = 0; i < 6; i++) {
      const geo = new THREE.SphereGeometry(0.08, 5, 5);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
      const p = new THREE.Mesh(geo, mat);
      p.position.set(x + (Math.random() - 0.5) * 0.2, y + (Math.random() - 0.5) * 0.1, z + (Math.random() - 0.5) * 0.2);
      p.userData = {
        vx: (Math.random() - 0.5) * 0.02,
        vy: Math.random() * 0.02 + 0.01,
        vz: (Math.random() - 0.5) * 0.02,
        life: 1,
        decay: 0.035,
      };
      p.name = 'particle';
      this.particlesGroup.add(p);
    }
  }

  private spawnDustParticles(x: number, y: number, z: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.04, 4, 4);
      const mat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.7 });
      const p = new THREE.Mesh(geo, mat);
      p.position.set(x, y, z);
      const angle = (i / count) * Math.PI * 2;
      const speed = 0.03 + Math.random() * 0.02;
      p.userData = {
        vx: Math.cos(angle) * speed,
        vy: Math.random() * 0.02 + 0.01,
        vz: Math.sin(angle) * speed,
        life: 1,
        decay: 0.035 + Math.random() * 0.02,
      };
      p.name = 'particle';
      this.particlesGroup.add(p);
    }
  }

  private spawnSlashParticles(x: number, y: number, z: number, color: number): void {
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.BoxGeometry(0.035, 0.14, 0.035);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const particle = new THREE.Mesh(geo, mat);
      particle.position.set(x, y, z);
      particle.userData = {
        vx: (Math.random() - 0.5) * 0.09,
        vy: Math.random() * 0.07 + 0.02,
        vz: (Math.random() - 0.5) * 0.09,
        life: 1,
        decay: 0.03 + Math.random() * 0.02,
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
      ud.vy -= 0.0012; // gravity
      ud.life -= ud.decay;

      if (child instanceof THREE.Mesh) {
        const mat = child.material;
        if (mat instanceof THREE.MeshBasicMaterial || mat instanceof THREE.MeshStandardMaterial) {
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
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }
    this.scene.remove(this.particlesGroup);
  }
}
