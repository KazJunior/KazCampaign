import * as THREE from 'three';

/**
 * Safely disposes all geometries and materials within an Object3D hierarchy
 */
export function disposeHierarchy(obj: THREE.Object3D): void {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
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
    color: 0xffaa00,
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
 * Creates a dual-layer vertical fire pillar
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
 * Creates an icy crystal spike that erupts from the ground
 */
export function createIceSpikeMesh(
  height: number = 1.1,
  radius: number = 0.2,
  iceColor: number = 0x38bdf8
): THREE.Mesh {
  const geo = new THREE.ConeGeometry(radius, height, 5);
  const mat = new THREE.MeshStandardMaterial({
    color: iceColor,
    emissive: 0x0284c7,
    emissiveIntensity: 1.1,
    roughness: 0.1,
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

  const outerGeo = new THREE.RingGeometry(radius * 0.92, radius, 24);
  outerGeo.rotateX(-Math.PI / 2);
  const outerMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
  const outer = new THREE.Mesh(outerGeo, outerMat);
  group.add(outer);

  const innerGeo = new THREE.RingGeometry(radius * 0.45, radius * 0.52, 16);
  innerGeo.rotateX(-Math.PI / 2);
  const innerMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  group.add(inner);

  group.position.y = 0.03;
  return group;
}
