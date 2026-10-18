import * as THREE from 'three';
import type { Unit } from '../types/game';

/**
 * Creates the organic 3D tabletop miniature model (Option 1)
 * with rounded anatomies, limbs, articulated weapons, and glowing accents.
 */
export function createOrganicMiniatureModel(
  unit: Unit,
  createHpBar: (unit: Unit) => THREE.Group,
  createAuras: (unit: Unit) => THREE.Group
): THREE.Group {
  const group = new THREE.Group();

  // 1. Tabletop Pedestal Base
  group.add(createMiniaturePedestal(unit));

  // 2. Character / Monster Miniature Mesh
  const charMesh = buildCharacterMesh(unit);
  group.add(charMesh);

  // 3. Floating HP Bar & Status Auras
  group.add(createHpBar(unit));
  group.add(createAuras(unit));

  return group;
}

// ============================================================================
// PEDESTAL BASE (Glossy plastic token with glowing faction rim)
// ============================================================================
function createMiniaturePedestal(unit: Unit): THREE.Group {
  const baseGroup = new THREE.Group();
  const isPlayer = unit.faction === 'player';
  const isBoss = unit.isBoss || unit.isMiniBoss;

  const radiusTop = isBoss ? 0.58 : 0.38;
  const radiusBottom = isBoss ? 0.64 : 0.42;
  const height = 0.075;

  // Base platform
  const discGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 24);
  const discColor = isBoss ? 0x2e1065 : isPlayer ? 0x1e3a8a : 0x7f1d1d;
  const discMat = new THREE.MeshStandardMaterial({
    color: discColor,
    roughness: 0.35,
    metalness: 0.25,
  });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.position.y = height / 2;
  disc.receiveShadow = true;
  baseGroup.add(disc);

  // Outer glowing faction ring
  const ringColor = isBoss ? 0xd4ad65 : isPlayer ? 0x3b82f6 : 0xef4444;
  const ringGeo = new THREE.TorusGeometry(radiusTop, 0.024, 8, 24);
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

// ============================================================================
// CHARACTER MESH BUILDER
// ============================================================================
function buildCharacterMesh(unit: Unit): THREE.Group {
  const char = new THREE.Group();
  char.name = 'miniatureChar';
  const key = unit.avatarKey;

  switch (key) {
    case 'warrior':
      buildWarriorMini(char);
      break;
    case 'archer':
      buildArcherMini(char);
      break;
    case 'mage':
      buildMageMini(char);
      break;
    case 'cleric':
      buildClericMini(char);
      break;
    case 'assassin':
      buildAssassinMini(char);
      break;
    case 'arcane_knight':
      buildArcaneKnightMini(char);
      break;
    case 'necromancer':
      buildNecromancerMini(char);
      break;
    case 'engineer':
      buildEngineerMini(char);
      break;
    case 'rune_mage':
      buildRuneMageMini(char);
      break;
    case 'berserker':
      buildBerserkerMini(char);
      break;
    case 'void_executioner':
      buildVoidExecutionerMini(char);
      break;
    case 'goblin':
      buildGoblinMini(char);
      break;
    case 'orc':
      buildOrcMini(char);
      break;
    case 'spider':
      buildSpiderMini(char);
      break;
    case 'dark_mage':
      buildDarkMageMini(char);
      break;
    case 'spectral_wolf':
      buildSpectralWolfMini(char);
      break;
    case 'basalt_golem':
      buildBasaltGolemMini(char);
      break;
    case 'thorn_witch':
      buildThornWitchMini(char);
      break;
    case 'fallen_knight':
      buildFallenKnightMini(char);
      break;
    case 'mimic':
      buildMimicMini(char);
      break;
    case 'volcanic_drake':
      buildVolcanicDrakeMini(char);
      break;
    case 'devourer_boss':
      buildDevourerBossMini(char);
      break;
    case 'astaroth_boss':
      buildAstarothBossMini(char);
      break;
    default:
      buildFallbackMini(char, unit);
      break;
  }

  return char;
}

// -------------------------------------------------------------
// 1. WARRIOR (Full Plate Armor, Domed Greathelm, Sword & Shield)
// -------------------------------------------------------------
function buildWarriorMini(group: THREE.Group) {
  const armorMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.25 });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.6, roughness: 0.3 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });

  // Legs & Boots
  const legGeo = new THREE.CapsuleGeometry(0.065, 0.18, 6, 8);
  const legL = new THREE.Mesh(legGeo, armorMat);
  legL.position.set(-0.11, 0.16, 0);
  const legR = new THREE.Mesh(legGeo, armorMat);
  legR.position.set(0.11, 0.16, 0);
  legL.castShadow = true;
  legR.castShadow = true;
  group.add(legL, legR);

  // Boots
  const bootGeo = new THREE.BoxGeometry(0.09, 0.08, 0.14);
  const bootL = new THREE.Mesh(bootGeo, leatherMat);
  bootL.position.set(-0.11, 0.09, 0.02);
  const bootR = new THREE.Mesh(bootGeo, leatherMat);
  bootR.position.set(0.11, 0.09, 0.02);
  group.add(bootL, bootR);

  // Tapered Breastplate Torso
  const torsoGeo = new THREE.CylinderGeometry(0.19, 0.14, 0.32, 12);
  const torso = new THREE.Mesh(torsoGeo, blueMat);
  torso.position.y = 0.38;
  torso.castShadow = true;
  group.add(torso);

  // Gold Chest Crest
  const crestGeo = new THREE.BoxGeometry(0.1, 0.18, 0.04);
  const crest = new THREE.Mesh(crestGeo, goldMat);
  crest.position.set(0, 0.4, 0.14);
  group.add(crest);

  // Belt
  const beltGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.04, 12);
  const belt = new THREE.Mesh(beltGeo, leatherMat);
  belt.position.y = 0.24;
  group.add(belt);

  // Rounded Domed Greathelm
  const helmGeo = new THREE.SphereGeometry(0.14, 12, 12);
  helmGeo.scale(1, 1.15, 1);
  const helm = new THREE.Mesh(helmGeo, armorMat);
  helm.position.y = 0.66;
  helm.castShadow = true;
  group.add(helm);

  // Glowing Cyan Visor Slit
  const visorGeo = new THREE.BoxGeometry(0.16, 0.035, 0.04);
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.95,
  });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 0.65, 0.13);
  group.add(visor);

  // Helmet Top Fin
  const finGeo = new THREE.BoxGeometry(0.03, 0.1, 0.18);
  const fin = new THREE.Mesh(finGeo, blueMat);
  fin.position.set(0, 0.78, -0.02);
  group.add(fin);

  // Rounded Spherical Pauldrons (Shoulders)
  const pauldronGeo = new THREE.SphereGeometry(0.095, 8, 8);
  const pL = new THREE.Mesh(pauldronGeo, armorMat);
  pL.position.set(-0.24, 0.48, 0);
  const pR = new THREE.Mesh(pauldronGeo, armorMat);
  pR.position.set(0.24, 0.48, 0);
  group.add(pL, pR);

  // Curved Kite Shield (Left Arm)
  const shieldGeo = new THREE.CylinderGeometry(0.18, 0.1, 0.44, 8, 1, false, 0, Math.PI);
  shieldGeo.rotateY(Math.PI / 2);
  const shield = new THREE.Mesh(shieldGeo, blueMat);
  shield.position.set(-0.26, 0.38, 0.1);
  shield.castShadow = true;
  group.add(shield);

  // Shield Golden Boss & Rim
  const shieldBoss = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), goldMat);
  shieldBoss.position.set(-0.26, 0.38, 0.2);
  group.add(shieldBoss);

  // Steel Longsword (Right Arm)
  const swordBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, 0.58, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.95, roughness: 0.1 })
  );
  swordBlade.position.set(0.26, 0.44, 0.08);
  swordBlade.castShadow = true;
  group.add(swordBlade);

  // Sword Crossguard & Pommel
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.22), goldMat);
  guard.position.set(0.26, 0.22, 0.08);
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), goldMat);
  pommel.position.set(0.26, 0.12, 0.08);
  group.add(guard, pommel);
}

// -------------------------------------------------------------
// 2. ARCHER (Green Hood, Leather Tunic, Recurve Bow & Quiver)
// -------------------------------------------------------------
function buildArcherMini(group: THREE.Group) {
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.75 });
  const darkGreen = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.7 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.5 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6 });

  // Legs & Leather Boots
  const legGeo = new THREE.CapsuleGeometry(0.055, 0.18, 6, 8);
  const legL = new THREE.Mesh(legGeo, leatherMat);
  legL.position.set(-0.09, 0.16, 0);
  const legR = new THREE.Mesh(legGeo, leatherMat);
  legR.position.set(0.09, 0.16, 0);
  group.add(legL, legR);

  // Tunic Torso
  const torsoGeo = new THREE.CylinderGeometry(0.16, 0.13, 0.3, 10);
  const torso = new THREE.Mesh(torsoGeo, greenMat);
  torso.position.y = 0.36;
  torso.castShadow = true;
  group.add(torso);

  // Leather Chest Vest
  const vestGeo = new THREE.CylinderGeometry(0.17, 0.14, 0.18, 10);
  const vest = new THREE.Mesh(vestGeo, leatherMat);
  vest.position.y = 0.38;
  group.add(vest);

  // Head with Face
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), skinMat);
  face.position.set(0, 0.62, 0.03);
  group.add(face);

  // Green Archer Hood (Pointed Peak)
  const hoodCone = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 8), darkGreen);
  hoodCone.position.set(0, 0.74, -0.04);
  hoodCone.rotation.x = -Math.PI / 14;
  hoodCone.castShadow = true;
  group.add(hoodCone);

  // Quiver on Back with Arrows
  const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.32, 8), leatherMat);
  quiver.position.set(0.08, 0.44, -0.15);
  quiver.rotation.z = Math.PI / 8;
  group.add(quiver);

  // Golden arrow fletchings
  const fletch = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 4), new THREE.MeshStandardMaterial({ color: 0xfef08a }));
  fletch.position.set(0.13, 0.62, -0.15);
  group.add(fletch);

  // Recurve Longbow (Left Hand)
  const bowGeo = new THREE.TorusGeometry(0.26, 0.022, 6, 16, Math.PI * 0.95);
  const bow = new THREE.Mesh(bowGeo, woodMat);
  bow.position.set(-0.24, 0.4, 0.08);
  bow.rotation.z = Math.PI / 4;
  bow.castShadow = true;
  group.add(bow);

  // Drawn Bowstring
  const stringGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.48);
  const stringMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
  const bString = new THREE.Mesh(stringGeo, stringMat);
  bString.position.set(-0.24, 0.4, 0.08);
  group.add(bString);
}

// -------------------------------------------------------------
// 3. MAGE (Pointed Wizard Hat, Flowing Robe, Beard & Staff)
// -------------------------------------------------------------
function buildMageMini(group: THREE.Group) {
  const robeMat = new THREE.MeshStandardMaterial({ color: 0x6b21a8, roughness: 0.5 });
  const darkRobe = new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.45 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
  const beardMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });

  // Flowing Cone Robe Base
  const robeGeo = new THREE.ConeGeometry(0.26, 0.58, 12);
  const robe = new THREE.Mesh(robeGeo, robeMat);
  robe.position.y = 0.32;
  robe.castShadow = true;
  group.add(robe);

  // Gold Trim Bottom Hem
  const hemGeo = new THREE.TorusGeometry(0.24, 0.02, 6, 16);
  hemGeo.rotateX(Math.PI / 2);
  const hem = new THREE.Mesh(hemGeo, goldMat);
  hem.position.y = 0.06;
  group.add(hem);

  // Head & White Beard
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfed7aa }));
  head.position.y = 0.58;
  group.add(head);

  const beardGeo = new THREE.ConeGeometry(0.1, 0.22, 6);
  beardGeo.rotateX(Math.PI);
  const beard = new THREE.Mesh(beardGeo, beardMat);
  beard.position.set(0, 0.48, 0.08);
  group.add(beard);

  // Pointed Wizard Hat (Wide Brim + Tilted Cone)
  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.025, 16), darkRobe);
  hatBrim.position.y = 0.68;
  group.add(hatBrim);

  const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 10), darkRobe);
  hatCone.position.set(0.02, 0.86, -0.04);
  hatCone.rotation.x = -Math.PI / 12;
  hatCone.rotation.z = Math.PI / 16;
  hatCone.castShadow = true;
  group.add(hatCone);

  // Gold Buckle on Hat
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.02), goldMat);
  buckle.position.set(0, 0.7, 0.16);
  group.add(buckle);

  // Gnarled Wooden Staff (Right Hand)
  const staff = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.028, 0.9, 8),
    new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 })
  );
  staff.position.set(0.26, 0.48, 0.08);
  staff.castShadow = true;
  group.add(staff);

  // Floating Glowing Cyan Orb Crystal
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    })
  );
  orb.position.set(0.26, 0.96, 0.08);
  orb.name = 'spinningOrb';
  group.add(orb);
}

// -------------------------------------------------------------
// 4. CLERIC (Radiant Robes, Angel Wings, Golden Halo & Scepter)
// -------------------------------------------------------------
function buildClericMini(group: THREE.Group) {
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });

  // White Robe Torso
  const robeGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.54, 12);
  const robe = new THREE.Mesh(robeGeo, whiteMat);
  robe.position.y = 0.32;
  robe.castShadow = true;
  group.add(robe);

  // Golden Mantle / Stole
  const stoleGeo = new THREE.BoxGeometry(0.14, 0.4, 0.26);
  const stole = new THREE.Mesh(stoleGeo, goldMat);
  stole.position.set(0, 0.36, 0);
  group.add(stole);

  // Angelic Feathered Wings spread behind back
  const wingGeo = new THREE.ConeGeometry(0.12, 0.48, 4);
  const wL = new THREE.Mesh(wingGeo, whiteMat);
  wL.position.set(-0.24, 0.48, -0.1);
  wL.rotation.z = Math.PI / 3;
  wL.rotation.y = -Math.PI / 8;
  const wR = new THREE.Mesh(wingGeo, whiteMat);
  wR.position.set(0.24, 0.48, -0.1);
  wR.rotation.z = -Math.PI / 3;
  wR.rotation.y = Math.PI / 8;
  group.add(wL, wR);

  // Head with Serene Golden Circlet
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), new THREE.MeshStandardMaterial({ color: 0xfed7aa }));
  head.position.y = 0.62;
  group.add(head);

  // Floating Radiant Golden Halo
  const haloGeo = new THREE.TorusGeometry(0.16, 0.022, 8, 20);
  haloGeo.rotateX(Math.PI / 2);
  const haloMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.1,
    roughness: 0.1,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.set(0, 0.82, 0);
  group.add(halo);

  // Golden Divine Scepter (Right Hand)
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 6), goldMat);
  shaft.position.set(0.25, 0.42, 0.06);
  group.add(shaft);

  // Starburst Scepter Head
  const headGeo = new THREE.DodecahedronGeometry(0.07, 0);
  const starHead = new THREE.Mesh(headGeo, haloMat);
  starHead.position.set(0.25, 0.74, 0.06);
  group.add(starHead);
}

// -------------------------------------------------------------
// 5. GOBLIN (Rounded Green Head, Big Floppy Ears, Dagger)
// -------------------------------------------------------------
function buildGoblinMini(group: THREE.Group) {
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.7 });
  const darkGreen = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

  // Little Scrawny Legs
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.12, 4, 6), greenMat);
  legL.position.set(-0.08, 0.12, 0);
  const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.12, 4, 6), greenMat);
  legR.position.set(0.08, 0.12, 0);
  group.add(legL, legR);

  // Goblin Torso with Leather Loincloth
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), darkGreen);
  torso.scale.set(0.9, 1.1, 0.9);
  torso.position.y = 0.28;
  group.add(torso);

  const loincloth = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.1, 8), leatherMat);
  loincloth.position.y = 0.2;
  group.add(loincloth);

  // Rounded Bulbous Goblin Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), greenMat);
  head.position.set(0, 0.46, 0.03);
  head.castShadow = true;
  group.add(head);

  // Large Pointed Floppy Ears (Left & Right)
  const earGeo = new THREE.ConeGeometry(0.06, 0.24, 4);
  const earL = new THREE.Mesh(earGeo, greenMat);
  earL.position.set(-0.2, 0.48, 0);
  earL.rotation.z = Math.PI / 2.3;
  const earR = new THREE.Mesh(earGeo, greenMat);
  earR.position.set(0.2, 0.48, 0);
  earR.rotation.z = -Math.PI / 2.3;
  group.add(earL, earR);

  // Beady Glowing Yellow Eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.9 });
  const eL = new THREE.Mesh(new THREE.SphereGeometry(0.028, 4, 4), eyeMat);
  eL.position.set(-0.06, 0.47, 0.16);
  const eR = new THREE.Mesh(new THREE.SphereGeometry(0.028, 4, 4), eyeMat);
  eR.position.set(0.06, 0.47, 0.16);
  group.add(eL, eR);

  // Wicked Serrated Dagger (Right Hand)
  const daggerBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.025, 0.28, 0.07),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.3 })
  );
  daggerBlade.position.set(0.22, 0.32, 0.1);
  daggerBlade.rotation.x = Math.PI / 6;
  group.add(daggerBlade);
}

// -------------------------------------------------------------
// 6. ORC (Muscular Torso, Tusks, Spiked Iron Shoulders & Club)
// -------------------------------------------------------------
function buildOrcMini(group: THREE.Group) {
  const orcMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, metalness: 0.7, roughness: 0.4 });
  const tuskMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });

  // Heavy Legs
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.18, 6, 8), orcMat);
  legL.position.set(-0.14, 0.18, 0);
  const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.18, 6, 8), orcMat);
  legR.position.set(0.14, 0.18, 0);
  group.add(legL, legR);

  // Broad Muscular Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.36, 10), orcMat);
  torso.position.y = 0.42;
  torso.castShadow = true;
  group.add(torso);

  // Spiked Iron Pauldron (Left Shoulder)
  const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), ironMat);
  pauldron.position.set(-0.28, 0.52, 0);
  const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 4), ironMat);
  spike.position.set(-0.34, 0.62, 0);
  spike.rotation.z = Math.PI / 5;
  group.add(pauldron, spike);

  // Orc Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), orcMat);
  head.position.set(0, 0.68, 0.04);
  group.add(head);

  // Ivory Tusks (Curving Upward from Jaw)
  const tL = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 4), tuskMat);
  tL.position.set(-0.07, 0.62, 0.17);
  tL.rotation.x = -Math.PI / 4;
  const tR = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 4), tuskMat);
  tR.position.set(0.07, 0.62, 0.17);
  tR.rotation.x = -Math.PI / 4;
  group.add(tL, tR);

  // Glowing Red Eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.0 });
  const eL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), eyeMat);
  eL.position.set(-0.06, 0.7, 0.17);
  const eR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), eyeMat);
  eR.position.set(0.06, 0.7, 0.17);
  group.add(eL, eR);

  // Heavy Spiked War Club (Right Hand)
  const clubShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.035, 0.62, 8), ironMat);
  clubShaft.position.set(0.3, 0.48, 0.1);
  clubShaft.rotation.z = Math.PI / 12;
  clubShaft.castShadow = true;
  group.add(clubShaft);
}

// -------------------------------------------------------------
// 7. ASSASSIN (Dark Cowl, Red Slit Eyes, Dual Daggers)
// -------------------------------------------------------------
function buildAssassinMini(group: THREE.Group) {
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
  const hoodMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.6 });

  // Sleek Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.34, 8), darkMat);
  torso.position.y = 0.36;
  group.add(torso);

  // Assassin Cowl / Hood
  const cowl = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), hoodMat);
  cowl.position.y = 0.62;
  group.add(cowl);

  // Glowing Crimson Eye Slits in darkness
  const eyes = new THREE.Mesh(
    new THREE.BoxGeometry(0.13, 0.028, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 1.2 })
  );
  eyes.position.set(0, 0.62, 0.12);
  group.add(eyes);

  // Dual Crimson Daggers (Reverse Grip)
  const dMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.9, roughness: 0.2 });
  const dGeo = new THREE.BoxGeometry(0.03, 0.32, 0.06);
  const d1 = new THREE.Mesh(dGeo, dMat);
  d1.position.set(-0.22, 0.36, 0.08);
  d1.rotation.x = Math.PI / 4;
  const d2 = new THREE.Mesh(dGeo, dMat);
  d2.position.set(0.22, 0.36, 0.08);
  d2.rotation.x = -Math.PI / 4;
  group.add(d1, d2);
}

// -------------------------------------------------------------
// 8. ARCANE KNIGHT (Cyan Crystal Plate Armor & Claymore)
// -------------------------------------------------------------
function buildArcaneKnightMini(group: THREE.Group) {
  const plateMat = new THREE.MeshStandardMaterial({ color: 0x0e7490, metalness: 0.85, roughness: 0.2 });
  const crystalMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 0.9 });

  // Armor Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.34, 10), plateMat);
  torso.position.y = 0.38;
  group.add(torso);

  // Greathelm with Crystal Crest
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), plateMat);
  helm.position.y = 0.66;
  group.add(helm);

  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 4), crystalMat);
  crest.position.set(0, 0.82, 0);
  group.add(crest);

  // Runic Claymore
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.72, 0.12), crystalMat);
  blade.position.set(0.26, 0.48, 0.08);
  blade.castShadow = true;
  group.add(blade);
}

// -------------------------------------------------------------
// 9. NECROMANCER (Skull Mask, Shroud & Death Scythe)
// -------------------------------------------------------------
function buildNecromancerMini(group: THREE.Group) {
  const robeMat = new THREE.MeshStandardMaterial({ color: 0x2e1065, roughness: 0.7 });
  const skullMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });

  // Tattered Shroud
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.54, 8), robeMat);
  robe.position.y = 0.32;
  group.add(robe);

  // Bone Skull Head
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), skullMat);
  skull.position.set(0, 0.62, 0.03);
  group.add(skull);

  // Soul Flame Eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.2 });
  const eL = new THREE.Mesh(new THREE.SphereGeometry(0.024, 4, 4), eyeMat);
  eL.position.set(-0.04, 0.63, 0.13);
  const eR = new THREE.Mesh(new THREE.SphereGeometry(0.024, 4, 4), eyeMat);
  eR.position.set(0.04, 0.63, 0.13);
  group.add(eL, eR);

  // Death Scythe
  const scytheHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6),
    new THREE.MeshStandardMaterial({ color: 0x18181b })
  );
  scytheHandle.position.set(0.24, 0.46, 0.06);
  scytheHandle.rotation.z = Math.PI / 12;
  group.add(scytheHandle);

  // Curved Green Blade
  const scytheBlade = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.028, 6, 12, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.8 })
  );
  scytheBlade.position.set(0.26, 0.88, 0.06);
  scytheBlade.rotation.y = Math.PI / 2;
  group.add(scytheBlade);
}

// -------------------------------------------------------------
// 10. ENGINEER (Goggles, Boiler Backpack & Wrench-Hammer)
// -------------------------------------------------------------
function buildEngineerMini(group: THREE.Group) {
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.85, roughness: 0.25 });

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.32, 8), leatherMat);
  torso.position.y = 0.36;
  group.add(torso);

  // Boiler Backpack
  const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.28, 8), brassMat);
  boiler.position.set(0, 0.42, -0.15);
  group.add(boiler);

  // Head with Aviator Cap & Dual Goggles
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), leatherMat);
  head.position.y = 0.62;
  group.add(head);

  const goggleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.9 });
  const g1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), goggleMat);
  g1.rotateX(Math.PI / 2);
  g1.position.set(-0.05, 0.63, 0.13);
  const g2 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), goggleMat);
  g2.rotateX(Math.PI / 2);
  g2.position.set(0.05, 0.63, 0.13);
  group.add(g1, g2);

  // Wrench-Hammer
  const wrench = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.58, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 })
  );
  wrench.position.set(0.25, 0.42, 0.08);
  group.add(wrench);
}

// -------------------------------------------------------------
// 11. RUNE MAGE (Grimoire, Glyphic Crown)
// -------------------------------------------------------------
function buildRuneMageMini(group: THREE.Group) {
  const robeMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4 });

  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 8), robeMat);
  robe.position.y = 0.32;
  group.add(robe);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x1d4ed8, emissiveIntensity: 0.4 }));
  head.position.y = 0.62;
  group.add(head);

  // Floating Grimoire Book
  const book = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.16), new THREE.MeshStandardMaterial({ color: 0x854d0e }));
  book.position.set(-0.25, 0.44, 0.1);
  book.name = 'spinningOrb';
  group.add(book);
}

// -------------------------------------------------------------
// 12. BERSERKER (Horned Helm, War Paint & Double Greataxe)
// -------------------------------------------------------------
function buildBerserkerMini(group: THREE.Group) {
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.8 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, metalness: 0.7 });

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.36, 8), skinMat);
  torso.position.y = 0.38;
  group.add(torso);

  // Horned Helm
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), ironMat);
  helm.position.y = 0.66;
  group.add(helm);

  const hornGeo = new THREE.ConeGeometry(0.05, 0.22, 4);
  const hornMat = new THREE.MeshStandardMaterial({ color: 0xfef08a });
  const hL = new THREE.Mesh(hornGeo, hornMat);
  hL.position.set(-0.14, 0.76, 0);
  hL.rotation.z = Math.PI / 3.5;
  const hR = new THREE.Mesh(hornGeo, hornMat);
  hR.position.set(0.14, 0.76, 0);
  hR.rotation.z = -Math.PI / 3.5;
  group.add(hL, hR);

  // Greataxe
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.8, 6), new THREE.MeshStandardMaterial({ color: 0x451a03 }));
  shaft.position.set(0.28, 0.48, 0.1);
  group.add(shaft);

  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.26), ironMat);
  blade.position.set(0.28, 0.76, 0.18);
  group.add(blade);
}

// -------------------------------------------------------------
// 11. CARRASCO DO VAZIO (Void Samurai Executioner with Glowing Katana & Jingasa)
// -------------------------------------------------------------
function buildVoidExecutionerMini(group: THREE.Group) {
  const voidDarkMat = new THREE.MeshStandardMaterial({ color: 0x181024, roughness: 0.7 });
  const voidPurpleMat = new THREE.MeshStandardMaterial({ color: 0x5a189a, roughness: 0.5 });
  const voidGlowMat = new THREE.MeshStandardMaterial({
    color: 0xe9d5ff,
    emissive: 0xa855f7,
    emissiveIntensity: 1.1,
    metalness: 0.9,
    roughness: 0.1,
  });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5d0c5, roughness: 0.5 });

  // Legs in dark Hakama
  const legGeo = new THREE.BoxGeometry(0.08, 0.22, 0.1);
  const legL = new THREE.Mesh(legGeo, voidDarkMat);
  legL.position.set(-0.08, 0.11, 0);
  const legR = new THREE.Mesh(legGeo, voidDarkMat);
  legR.position.set(0.08, 0.11, 0);
  group.add(legL, legR);

  // Samurai Armored Torso (Do)
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.32, 8), voidPurpleMat);
  torso.position.y = 0.34;
  torso.castShadow = true;
  group.add(torso);

  // Golden Chest Crest
  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), goldMat);
  crest.position.set(0, 0.36, 0.14);
  group.add(crest);

  // Samurai Shoulder Guards (Sode)
  const sodeGeo = new THREE.BoxGeometry(0.06, 0.14, 0.14);
  const sodeL = new THREE.Mesh(sodeGeo, voidPurpleMat);
  sodeL.position.set(-0.21, 0.44, 0);
  sodeL.rotation.z = Math.PI / 10;
  const sodeR = new THREE.Mesh(sodeGeo, voidPurpleMat);
  sodeR.position.set(0.21, 0.44, 0);
  sodeR.rotation.z = -Math.PI / 10;
  group.add(sodeL, sodeR);

  // Head with pale face
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), skinMat);
  head.position.set(0, 0.58, 0.02);
  group.add(head);

  // Glowing Purple Void Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.018, 4, 4), eyeMat);
  eyeL.position.set(-0.04, 0.59, 0.11);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.018, 4, 4), eyeMat);
  eyeR.position.set(0.04, 0.59, 0.11);
  group.add(eyeL, eyeR);

  // Conical Straw Hat / Jingasa (Charcoal with Gold Edge)
  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.12, 12), voidDarkMat);
  hat.position.set(0, 0.68, 0);
  hat.castShadow = true;
  const hatTrim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.012, 4, 12), goldMat);
  hatTrim.position.set(0, 0.62, 0);
  hatTrim.rotation.x = Math.PI / 2;
  group.add(hat, hatTrim);

  // Katana in Right Hand (Slender, curved and glowing with purple void energy)
  const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 6), voidDarkMat);
  hilt.position.set(0.24, 0.32, 0.08);
  const tsuba = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 8), goldMat);
  tsuba.position.set(0.24, 0.41, 0.08);

  const katanaBlade = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.58, 0.045), voidGlowMat);
  katanaBlade.position.set(0.24, 0.7, 0.09);
  katanaBlade.castShadow = true;
  group.add(hilt, tsuba, katanaBlade);

  // Sheath (Saya) slung at the left hip
  const saya = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.46, 0.05), voidDarkMat);
  saya.position.set(-0.16, 0.28, -0.04);
  saya.rotation.z = Math.PI / 6;
  group.add(saya);

  // Floating Void Sparkle
  const voidLight = new THREE.PointLight(0xa855f7, 0.7, 1.5);
  voidLight.position.set(0, 0.5, -0.15);
  group.add(voidLight);
}

// -------------------------------------------------------------
// 13. SPIDER (Shadow Spider)
// -------------------------------------------------------------
function buildSpiderMini(group: THREE.Group) {
  const spiderMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.6 });

  const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), spiderMat);
  abdomen.scale.set(1, 0.85, 1.25);
  abdomen.position.set(0, 0.26, -0.12);
  group.add(abdomen);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), spiderMat);
  head.position.set(0, 0.22, 0.14);
  group.add(head);

  // 4 Red Eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.0 });
  [-0.05, -0.015, 0.015, 0.05].forEach((xOff) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.022, 4, 4), eyeMat);
    e.position.set(xOff, 0.26, 0.28);
    group.add(e);
  });

  // 6 Legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
  [-1, 1].forEach((side) => {
    [-0.08, 0.04, 0.16].forEach((zOff) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 4), legMat);
      leg.position.set(side * 0.26, 0.16, zOff);
      leg.rotation.z = side * (Math.PI / 3);
      group.add(leg);
    });
  });
}

// -------------------------------------------------------------
// 14. DARK MAGE
// -------------------------------------------------------------
function buildDarkMageMini(group: THREE.Group) {
  const robeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 6), robeMat);
  robe.position.y = 0.32;
  group.add(robe);

  const cowl = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), robeMat);
  cowl.position.y = 0.64;
  group.add(cowl);

  const eyes = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.03, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0xa855f7, emissiveIntensity: 1.2 })
  );
  eyes.position.set(0, 0.64, 0.13);
  group.add(eyes);
}

// -------------------------------------------------------------
// 15. SPECTRAL WOLF
// -------------------------------------------------------------
function buildSpectralWolfMini(group: THREE.Group) {
  const wolfMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.7,
    transparent: true,
    opacity: 0.85,
  });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.38, 6, 8), wolfMat);
  body.rotateX(Math.PI / 2);
  body.position.set(0, 0.28, 0);
  group.add(body);

  const head = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 4), wolfMat);
  head.rotateX(Math.PI / 2);
  head.position.set(0, 0.38, 0.32);
  group.add(head);

  // 4 Legs
  const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.22, 4);
  [[-0.12, -0.16], [0.12, -0.16], [-0.12, 0.16], [0.12, 0.16]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, wolfMat);
    leg.position.set(lx, 0.11, lz);
    group.add(leg);
  });
}

// -------------------------------------------------------------
// 16. BASALT GOLEM
// -------------------------------------------------------------
function buildBasaltGolemMini(group: THREE.Group) {
  const golemMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 0), golemMat);
  body.position.y = 0.42;
  group.add(body);

  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.12, 0),
    new THREE.MeshStandardMaterial({ color: 0xff5722, emissive: 0xff3d00, emissiveIntensity: 1.2 })
  );
  core.position.set(0, 0.48, 0.22);
  group.add(core);
}

// -------------------------------------------------------------
// 17. THORN WITCH
// -------------------------------------------------------------
function buildThornWitchMini(group: THREE.Group) {
  const witchMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.52, 6), witchMat);
  body.position.y = 0.32;
  group.add(body);

  const crown = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.025, 4, 12),
    new THREE.MeshStandardMaterial({ color: 0x15803d, emissive: 0x16a34a, emissiveIntensity: 0.7 })
  );
  crown.rotateX(Math.PI / 2);
  crown.position.y = 0.66;
  group.add(crown);
}

// -------------------------------------------------------------
// 18. FALLEN KNIGHT
// -------------------------------------------------------------
function buildFallenKnightMini(group: THREE.Group) {
  const armorMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9, roughness: 0.25 });
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.34, 10), armorMat);
  torso.position.y = 0.36;
  group.add(torso);

  const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.5), new THREE.MeshStandardMaterial({ color: 0x991b1b, side: THREE.DoubleSide }));
  cape.position.set(0, 0.34, -0.14);
  cape.rotation.x = Math.PI / 16;
  group.add(cape);

  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), armorMat);
  helm.position.y = 0.65;
  group.add(helm);

  const slit = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.035, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 1.2 })
  );
  slit.position.set(0, 0.65, 0.12);
  group.add(slit);
}

// -------------------------------------------------------------
// 19. MIMIC
// -------------------------------------------------------------
function buildMimicMini(group: THREE.Group) {
  const chestMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.32), chestMat);
  chest.position.y = 0.2;
  group.add(chest);

  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.32), chestMat);
  lid.position.set(0, 0.38, -0.05);
  lid.rotation.x = -Math.PI / 5;
  group.add(lid);

  const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.2), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
  tongue.position.set(0, 0.28, 0.16);
  tongue.rotation.x = Math.PI / 8;
  group.add(tongue);
}

// -------------------------------------------------------------
// 20. VOLCANIC DRAKE
// -------------------------------------------------------------
function buildVolcanicDrakeMini(group: THREE.Group) {
  const dragonMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 6), dragonMat);
  body.rotateX(Math.PI / 3);
  body.position.set(0, 0.34, 0.04);
  group.add(body);

  const head = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 4), dragonMat);
  head.rotateX(Math.PI / 2);
  head.position.set(0, 0.46, 0.32);
  group.add(head);

  // Wings
  const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.38, 0.32), dragonMat);
  wingL.position.set(-0.24, 0.48, -0.04);
  wingL.rotation.y = -Math.PI / 4;
  const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.38, 0.32), dragonMat);
  wingR.position.set(0.24, 0.48, -0.04);
  wingR.rotation.y = Math.PI / 4;
  group.add(wingL, wingR);
}

// -------------------------------------------------------------
// 21. DEVOURER BOSS (Mini-Boss)
// -------------------------------------------------------------
function buildDevourerBossMini(group: THREE.Group) {
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.3 });
  const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.52, 0), bodyMat);
  body.position.y = 0.56;
  group.add(body);

  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.18, 0),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 1.1 })
  );
  core.position.set(0, 0.65, 0.24);
  group.add(core);

  // Pincers
  const jawGeo = new THREE.ConeGeometry(0.18, 0.4, 4);
  const jawMat = new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.6 });
  const jL = new THREE.Mesh(jawGeo, jawMat);
  jL.position.set(-0.24, 0.64, 0.36);
  jL.rotation.z = -Math.PI / 4;
  const jR = new THREE.Mesh(jawGeo, jawMat);
  jR.position.set(0.24, 0.64, 0.36);
  jR.rotation.z = Math.PI / 4;
  group.add(jL, jR);
}

// -------------------------------------------------------------
// 22. ASTAROTH FINAL BOSS (Archdemon with Ribbed Bat Wings)
// -------------------------------------------------------------
function buildAstarothBossMini(group: THREE.Group) {
  const demonMat = new THREE.MeshStandardMaterial({ color: 0x3b0764, metalness: 0.8, roughness: 0.2 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.52, 1.25, 12), demonMat);
  body.position.y = 0.72;
  group.add(body);

  // Demon Horns
  const hornGeo = new THREE.ConeGeometry(0.075, 0.38, 6);
  const hornMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.7 });
  const hL = new THREE.Mesh(hornGeo, hornMat);
  hL.position.set(-0.22, 1.35, 0.08);
  hL.rotation.z = Math.PI / 5;
  const hR = new THREE.Mesh(hornGeo, hornMat);
  hR.position.set(0.22, 1.35, 0.08);
  hR.rotation.z = -Math.PI / 5;
  group.add(hL, hR);

  // Bat Wings
  const wingMat = new THREE.MeshStandardMaterial({ color: 0x7e22ce, emissive: 0x6b21a8, emissiveIntensity: 0.6, roughness: 0.3 });
  const w1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.88, 0.75), wingMat);
  w1.position.set(-0.44, 0.88, -0.2);
  w1.rotation.y = -Math.PI / 5;
  const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.88, 0.75), wingMat);
  w2.position.set(0.44, 0.88, -0.2);
  w2.rotation.y = Math.PI / 5;
  group.add(w1, w2);

  // Purple Abyssal Crown
  const crownGeo = new THREE.TorusGeometry(0.22, 0.028, 6, 16);
  crownGeo.rotateX(Math.PI / 2);
  const crownMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0xa855f7, emissiveIntensity: 1.0 });
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.position.y = 1.38;
  group.add(crown);
}

// -------------------------------------------------------------
// Fallback Mini
// -------------------------------------------------------------
function buildFallbackMini(group: THREE.Group, unit: Unit) {
  const hex = parseInt(unit.color.replace('#', '0x'), 16) || 0x3b82f6;
  const mat = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.4, metalness: 0.3 });
  const capsule = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.38, 8, 10), mat);
  capsule.position.y = 0.36;
  group.add(capsule);
}
