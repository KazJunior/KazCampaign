import * as THREE from 'three';

/**
 * Safely disposes all geometries and materials within an Object3D hierarchy
 */
export function disposeHierarchy(obj: THREE.Object3D): void {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });
}

/**
 * Creates a volcanic meteor rock with incandescent magma fissures
 */
export function createMeteorMesh(
  size: number = 0.28,
  magmaColor: number = 0xff4500,
  crustColor: number = 0x1f2937
): THREE.Group {
  const group = new THREE.Group();

  // Dark jagged crust
  const crustGeo = new THREE.DodecahedronGeometry(size, 0);
  const crustMat = new THREE.MeshStandardMaterial({
    color: crustColor,
    roughness: 0.8,
    metalness: 0.1,
  });
  const crustMesh = new THREE.Mesh(crustGeo, crustMat);
  group.add(crustMesh);

  // Fiery glowing core
  const coreGeo = new THREE.SphereGeometry(size * 0.75, 8, 8);
  const coreMat = new THREE.MeshBasicMaterial({
    color: magmaColor,
    wireframe: true,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  group.add(coreMesh);

  // Outer heat corona ring
  const coronaGeo = new THREE.RingGeometry(size * 0.9, size * 1.5, 12);
  const coronaMat = new THREE.MeshBasicMaterial({
    color: magmaColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
  });
  const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
  coronaMesh.rotation.x = Math.PI / 2;
  group.add(coronaMesh);

  group.userData = { crustMesh, coreMesh, coronaMesh };
  return group;
}

/**
 * Creates a dual-layer vertical fire/energy pillar
 */
export function createFirePillarMesh(
  radius: number = 0.8,
  height: number = 4.5,
  outerColor: number = 0xff3b00,
  innerColor: number = 0xfef08a
): THREE.Group {
  const group = new THREE.Group();

  // Outer cylindrical flame shroud
  const outerGeo = new THREE.CylinderGeometry(radius * 0.9, radius * 1.1, height, 16, 1, true);
  const outerMat = new THREE.MeshBasicMaterial({
    color: outerColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  outerMesh.position.y = height / 2;
  group.add(outerMesh);

  // Intense inner core flame
  const innerGeo = new THREE.CylinderGeometry(radius * 0.45, radius * 0.55, height * 0.95, 12, 1, true);
  const innerMat = new THREE.MeshBasicMaterial({
    color: innerColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  innerMesh.position.y = height / 2;
  group.add(innerMesh);

  // Expanding heat ring at base
  const ringGeo = new THREE.RingGeometry(radius * 0.3, radius * 1.4, 20);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: outerColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const baseRing = new THREE.Mesh(ringGeo, ringMat);
  baseRing.position.y = 0.05;
  group.add(baseRing);

  group.userData = { outerMesh, innerMesh, baseRing, height };
  return group;
}

/**
 * Creates an incandescent ground impact crater decal
 */
export function createGroundCrater(
  radius: number = 0.8,
  glowColor: number = 0xff4500
): THREE.Mesh {
  const geo = new THREE.RingGeometry(0.1, radius, 20);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    color: glowColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.03;
  return mesh;
}

/**
 * Creates an icy crystal / thorn / stone spike that erupts from the ground
 */
export function createIceSpikeMesh(
  height: number = 1.1,
  radius: number = 0.2,
  iceColor: number = 0x38bdf8,
  emissiveColor: number = 0x0284c7
): THREE.Mesh {
  const geo = new THREE.ConeGeometry(radius, height, 5);
  const mat = new THREE.MeshStandardMaterial({
    color: iceColor,
    emissive: emissiveColor,
    emissiveIntensity: 1.1,
    roughness: 0.15,
    transparent: true,
    opacity: 0.92,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = height / 2;
  return mesh;
}

/**
 * Creates a ground casting rune ring
 */
export function createCastingRuneMesh(
  radius: number = 0.9,
  color: number = 0xffaa00
): THREE.Group {
  const group = new THREE.Group();

  const outerGeo = new THREE.RingGeometry(radius * 0.9, radius, 24);
  outerGeo.rotateX(-Math.PI / 2);
  const outerMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
  const outer = new THREE.Mesh(outerGeo, outerMat);
  group.add(outer);

  const innerGeo = new THREE.RingGeometry(radius * 0.45, radius * 0.55, 6);
  innerGeo.rotateX(-Math.PI / 2);
  const innerMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  group.add(inner);

  group.position.y = 0.03;
  return group;
}

/**
 * Creates a dual-layered glowing crescent blade slash arc
 */
export function createSlashWaveMesh(
  radius: number = 0.7,
  thickness: number = 0.28,
  arcAngle: number = Math.PI * 0.85,
  primaryColor: number = 0x9d4edd,
  edgeColor: number = 0xffffff
): THREE.Group {
  const group = new THREE.Group();

  const outerGeo = new THREE.RingGeometry(
    Math.max(0.05, radius - thickness),
    radius,
    20,
    1,
    -arcAngle / 2,
    arcAngle
  );
  const outerMat = new THREE.MeshBasicMaterial({
    color: primaryColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  outerMesh.rotation.x = -Math.PI / 2;
  group.add(outerMesh);

  const edgeGeo = new THREE.RingGeometry(
    Math.max(0.05, radius - thickness * 0.35),
    radius * 1.03,
    20,
    1,
    -arcAngle / 2,
    arcAngle
  );
  const edgeMat = new THREE.MeshBasicMaterial({
    color: edgeColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  });
  const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
  edgeMesh.rotation.x = -Math.PI / 2;
  edgeMesh.position.y = 0.01;
  group.add(edgeMesh);

  return group;
}

/**
 * Creates a 3D arrow, bolt, javelin, or throwing dagger mesh
 */
export function createProjectileArrowMesh(
  shaftColor: number = 0x854d0e,
  tipColor: number = 0x38bdf8,
  scale: number = 1.0
): THREE.Group {
  const group = new THREE.Group();

  const shaftGeo = new THREE.CylinderGeometry(0.018 * scale, 0.018 * scale, 0.55 * scale, 6);
  shaftGeo.rotateX(Math.PI / 2);
  const shaftMat = new THREE.MeshBasicMaterial({ color: shaftColor });
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  group.add(shaft);

  const headGeo = new THREE.ConeGeometry(0.055 * scale, 0.16 * scale, 5);
  headGeo.rotateX(Math.PI / 2);
  const headMat = new THREE.MeshBasicMaterial({ color: tipColor });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.z = 0.28 * scale;
  group.add(head);

  const fletchGeo = new THREE.BoxGeometry(0.08 * scale, 0.04 * scale, 0.12 * scale);
  const fletchMat = new THREE.MeshBasicMaterial({ color: tipColor, transparent: true, opacity: 0.85 });
  const fletch = new THREE.Mesh(fletchGeo, fletchMat);
  fletch.position.z = -0.24 * scale;
  group.add(fletch);

  return group;
}

/**
 * Creates a 3D Black Hole singularity with event horizon and accretion rings
 */
export function createBlackHoleMesh(
  radius: number = 0.45,
  coreColor: number = 0x090414,
  accretionColor: number = 0x9d4edd,
  rimColor: number = 0xef4444
): THREE.Group {
  const group = new THREE.Group();

  // Dark Event Horizon Sphere
  const sphereGeo = new THREE.SphereGeometry(radius, 16, 16);
  const sphereMat = new THREE.MeshBasicMaterial({ color: coreColor });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  group.add(sphere);

  // Photon Rim Shell
  const rimGeo = new THREE.SphereGeometry(radius * 1.12, 14, 14);
  const rimMat = new THREE.MeshBasicMaterial({
    color: accretionColor,
    wireframe: true,
    transparent: true,
    opacity: 0.75,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  group.add(rim);

  // Primary Accretion Disk
  const diskGeo = new THREE.RingGeometry(radius * 1.2, radius * 2.4, 28);
  diskGeo.rotateX(-Math.PI / 2);
  const diskMat = new THREE.MeshBasicMaterial({
    color: accretionColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  const disk = new THREE.Mesh(diskGeo, diskMat);
  disk.rotation.z = 0.22;
  group.add(disk);

  // Tilted Secondary Crimson/Void Ring
  const subRingGeo = new THREE.RingGeometry(radius * 1.35, radius * 1.75, 24);
  const subRingMat = new THREE.MeshBasicMaterial({
    color: rimColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });
  const subRing = new THREE.Mesh(subRingGeo, subRingMat);
  subRing.rotation.x = Math.PI / 3;
  group.add(subRing);

  group.userData = { sphere, rim, disk, subRing };
  return group;
}

/**
 * Creates a 3D protective shield dome / Iaijutsu barrier
 */
export function createShieldDomeMesh(
  radius: number = 0.75,
  primaryColor: number = 0x38bdf8,
  secondaryColor: number = 0xfef08a
): THREE.Group {
  const group = new THREE.Group();

  // Translucent hemisphere dome
  const domeGeo = new THREE.SphereGeometry(radius, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.65);
  const domeMat = new THREE.MeshBasicMaterial({
    color: primaryColor,
    transparent: true,
    opacity: 0.32,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  group.add(dome);

  // Geodesic wireframe shell
  const wireGeo = new THREE.IcosahedronGeometry(radius * 1.02, 1);
  const wireMat = new THREE.MeshBasicMaterial({
    color: secondaryColor,
    wireframe: true,
    transparent: true,
    opacity: 0.75,
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  wire.position.y = radius * 0.35;
  group.add(wire);

  // Base rune ring
  const baseGeo = new THREE.RingGeometry(radius * 0.85, radius * 1.15, 24);
  baseGeo.rotateX(-Math.PI / 2);
  const baseMat = new THREE.MeshBasicMaterial({
    color: primaryColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.04;
  group.add(base);

  group.userData = { dome, wire, base };
  return group;
}
