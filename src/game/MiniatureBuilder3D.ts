import * as THREE from 'three';
import type { Unit } from '../types/game';
import { getCachedUnitModel } from './ModelLoader3D';
import { NORMAL_MONSTER_BUILDERS } from './NormalMonsterBuilders';

/**
 * Creates the organic 3D tabletop miniature model (Option 1)
 * with rounded anatomies, limbs, articulated weapons, and glowing accents.
 * Checks for a loaded 3D GLB model first, falling back to procedural mesh.
 */
export function createOrganicMiniatureModel(
  unit: Unit,
  createHpBar: (unit: Unit) => THREE.Group,
  createAuras: (unit: Unit) => THREE.Group
): THREE.Group {
  const group = new THREE.Group();

  // 1. Tabletop Pedestal Base
  group.add(createMiniaturePedestal(unit));

  // 2. Character / Monster Miniature Mesh (3D GLB Model with procedural fallback)
  const cachedModel = getCachedUnitModel(unit.avatarKey);
  const charMesh = cachedModel || buildCharacterMesh(unit);
  charMesh.name = 'miniatureChar';
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
  const playerRingColor = unit.color ? new THREE.Color(unit.color).getHex() : 0x3b82f6;
  const ringColor = isBoss ? 0xd4ad65 : isPlayer ? playerRingColor : 0xef4444;
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

  // 1. Monstro normal dedicado dos Atos II a V (Fases 11 a 50)
  const normalMonsterBuilder = NORMAL_MONSTER_BUILDERS[key];
  if (normalMonsterBuilder) {
    normalMonsterBuilder(char);
    return char;
  }

  // 2. Classes de jogadores, monstros do Ato I e chefes
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
    case 'druid':
    case 'engineer':
      buildDruidMini(char);
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
    case 'paladin':
      buildPaladinMini(char);
      break;
    case 'lancer':
      buildLancerMini(char);
      break;
    case 'bard':
      buildBardMini(char);
      break;
    case 'ice_mage':
      buildIceMageMini(char);
      break;
    case 'sniper':
      buildSniperMini(char);
      break;
    case 'electric_mage':
      buildElectricMageMini(char);
      break;
    case 'wind_mage':
      buildWindMageMini(char);
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
    case 'spectral_harbinger_boss':
      buildSpectralHarbingerBossMini(char);
      break;
    case 'forge_titan_boss':
      buildForgeTitanBossMini(char);
      break;
    case 'rune_master_boss':
      buildRuneMasterBossMini(char);
      break;
    case 'valgar_butcher_boss':
      buildValgarButcherBossMini(char);
      break;
    case 'venom_chimera_boss':
      buildVenomChimeraBossMini(char);
      break;
    case 'quimera_leao':
      buildChimeraLionMini(char);
      break;
    case 'quimera_serpente':
      buildChimeraSnakeMini(char);
      break;
    case 'quimera_cabra':
      buildChimeraGoatMini(char);
      break;
    case 'void_leviathan_boss':
      buildVoidLeviathanBossMini(char);
      break;
    case 'eclipse_knight_boss':
      buildEclipseKnightBossMini(char, 'neutral');
      break;
    case 'eclipse_knight_dark':
      buildEclipseKnightBossMini(char, 'dark');
      break;
    case 'eclipse_knight_light':
      buildEclipseKnightBossMini(char, 'light');
      break;
    case 'cristal_luz':
      buildCrystalMini(char, 'light');
      break;
    case 'cristal_trevas':
      buildCrystalMini(char, 'dark');
      break;
    case 'malakor_final_boss':
      buildMalakorFinalBossMini(char);
      break;
    case 'training_dummy':
      buildTrainingDummyMini(char, 'standard');
      break;
    case 'training_dummy_armored':
      buildTrainingDummyMini(char, 'armored');
      break;
    case 'training_dummy_mystic':
      buildTrainingDummyMini(char, 'mystic');
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
// 3. MAGO DE FOGO (Pointed Fiery Hat, Crimson Robe, Fire Staff & Blazing Orb)
// -------------------------------------------------------------
function buildMageMini(group: THREE.Group) {
  const robeMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.5 });
  const darkRobe = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.45 });
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

  // Floating Glowing Blazing Fire Crystal Orb
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xef4444,
      emissiveIntensity: 1.5,
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
// 10. DRUID (Emerald Nature Robes, Horns/Floral Antlers & Wooden Staff)
// -------------------------------------------------------------
function buildDruidMini(group: THREE.Group) {
  const robeMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.6 });
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.5 });

  // Robe
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 8), robeMat);
  robe.position.y = 0.32;
  group.add(robe);

  // Torso / Mantle
  const mantle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.22, 8), barkMat);
  mantle.position.y = 0.44;
  group.add(mantle);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfde047 }));
  head.position.y = 0.62;
  group.add(head);

  // Nature Horns / Antlers
  const horn1 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 6), barkMat);
  horn1.position.set(-0.08, 0.73, 0);
  horn1.rotateZ(0.4);
  const horn2 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 6), barkMat);
  horn2.position.set(0.08, 0.73, 0);
  horn2.rotateZ(-0.4);
  group.add(horn1, horn2);

  // Wooden Staff with glowing nature crystal
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.75, 8), barkMat);
  staff.position.set(0.22, 0.4, 0.08);
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), leafMat);
  crystal.position.set(0.22, 0.76, 0.08);
  group.add(staff, crystal);
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
// PALADIN (Golden-White Plate Armor, Sun Greathelm, Tower Shield & Radiant Warhammer)
// -------------------------------------------------------------
function buildPaladinMini(group: THREE.Group) {
  const goldPlateMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
  const whiteTrimMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.5, roughness: 0.3 });
  const radiantMat = new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xf59e0b, emissiveIntensity: 0.9 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });

  // Armored Greaves (Legs)
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.16, 6, 8), goldPlateMat);
  legL.position.set(-0.11, 0.14, 0);
  const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.16, 6, 8), goldPlateMat);
  legR.position.set(0.11, 0.14, 0);
  group.add(legL, legR);

  // Heavy Cuirass (Torso)
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.15, 0.36, 10), goldPlateMat);
  torso.position.y = 0.36;
  torso.castShadow = true;
  group.add(torso);

  // White Cape on back
  const cape = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.44, 0.03), new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.6 }));
  cape.position.set(0, 0.34, -0.13);
  cape.rotation.x = Math.PI / 16;
  group.add(cape);

  // Radiant Chest Sun Emblem
  const sunEmblem = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.02, 8), radiantMat);
  sunEmblem.rotateX(Math.PI / 2);
  sunEmblem.position.set(0, 0.4, 0.15);
  group.add(sunEmblem);

  // Domed Greathelm
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), goldPlateMat);
  helm.position.y = 0.64;
  group.add(helm);

  // Visor Slit
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.04), radiantMat);
  visor.position.set(0, 0.64, 0.12);
  group.add(visor);

  // Golden Sun Halo atop helm
  const haloGeo = new THREE.TorusGeometry(0.12, 0.016, 6, 16);
  const halo = new THREE.Mesh(haloGeo, radiantMat);
  halo.position.set(0, 0.8, -0.02);
  halo.rotation.x = Math.PI / 5;
  group.add(halo);

  // Pauldrons (Left & Right)
  const pL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), whiteTrimMat);
  pL.position.set(-0.24, 0.46, 0);
  const pR = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), whiteTrimMat);
  pR.position.set(0.24, 0.46, 0);
  group.add(pL, pR);

  // Towering Kite Shield (Left Arm)
  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.52, 0.26), goldPlateMat);
  shield.position.set(-0.26, 0.38, 0.1);
  const shieldCross = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.38, 0.08), radiantMat);
  shieldCross.position.set(-0.27, 0.38, 0.1);
  group.add(shield, shieldCross);

  // Righteous Warhammer (Right Hand)
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 6), steelMat);
  shaft.position.set(0.26, 0.42, 0.08);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.18), goldPlateMat);
  head.position.set(0.26, 0.68, 0.08);
  group.add(shaft, head);
}

// -------------------------------------------------------------
// LANCER (Dragoon Plate, Horned Plume Helm & Long Penetrating Lance)
// -------------------------------------------------------------
function buildLancerMini(group: THREE.Group) {
  const dragoonMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.25 });
  const cyanGlowMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.9 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.95, roughness: 0.15 });

  // Sleek Legs
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.18, 6, 8), dragoonMat);
  legL.position.set(-0.09, 0.15, 0);
  const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.18, 6, 8), dragoonMat);
  legR.position.set(0.09, 0.15, 0);
  group.add(legL, legR);

  // Dragoon Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.34, 8), dragoonMat);
  torso.position.y = 0.36;
  torso.castShadow = true;
  group.add(torso);

  // Winged Helmet
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), dragoonMat);
  helm.position.y = 0.62;
  group.add(helm);

  // Dragoon Dorsal Plume / Crest
  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.26, 4), cyanGlowMat);
  crest.position.set(0, 0.78, -0.04);
  crest.rotation.x = -Math.PI / 8;
  group.add(crest);

  // Dragoon Visor
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.028, 0.04), cyanGlowMat);
  visor.position.set(0, 0.62, 0.11);
  group.add(visor);

  // Sharp Pauldrons
  const pL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 4), dragoonMat);
  pL.position.set(-0.22, 0.48, 0);
  pL.rotation.z = Math.PI / 4;
  const pR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 4), dragoonMat);
  pR.position.set(0.22, 0.48, 0);
  pR.rotation.z = -Math.PI / 4;
  group.add(pL, pR);

  // Long Dragoon Lance (Right Hand, reaching forward)
  const lanceShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.25, 8), steelMat);
  lanceShaft.position.set(0.26, 0.45, 0.2);
  lanceShaft.rotation.x = Math.PI / 6;
  lanceShaft.castShadow = true;

  // Lance Cone Guard & Tip
  const lanceGuard = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 8), dragoonMat);
  lanceGuard.position.set(0.26, 0.35, 0.06);
  lanceGuard.rotation.x = -Math.PI + Math.PI / 6;

  const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.32, 4), cyanGlowMat);
  spearTip.position.set(0.26, 0.98, 0.55);
  spearTip.rotation.x = Math.PI / 6;

  group.add(lanceShaft, lanceGuard, spearTip);
}

// -------------------------------------------------------------
// BARD (Magenta Flamboyant Doublet, Feathered Cap & Acoustic Lute)
// -------------------------------------------------------------
function buildBardMini(group: THREE.Group) {
  const tunicMat = new THREE.MeshStandardMaterial({ color: 0xdb2777, roughness: 0.5 });
  const darkMagenta = new THREE.MeshStandardMaterial({ color: 0x831843, roughness: 0.6 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa });

  // Legs in dark magenta tights
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.18, 6, 8), darkMagenta);
  legL.position.set(-0.08, 0.15, 0);
  const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.18, 6, 8), darkMagenta);
  legR.position.set(0.08, 0.15, 0);
  group.add(legL, legR);

  // Doublet / Tunic
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.32, 8), tunicMat);
  torso.position.y = 0.35;
  group.add(torso);

  // Capelet over shoulder
  const capelet = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.04), darkMagenta);
  capelet.position.set(-0.04, 0.36, -0.12);
  capelet.rotation.y = Math.PI / 12;
  group.add(capelet);

  // Head with charming face
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), skinMat);
  head.position.set(0, 0.58, 0.02);
  group.add(head);

  // Feathered Beret Cap
  const beret = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.06, 10), tunicMat);
  beret.position.set(0.02, 0.68, 0);
  beret.rotation.z = -Math.PI / 10;
  group.add(beret);

  // Long Golden Peacock Feather
  const feather = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.22, 4), goldMat);
  feather.position.set(-0.12, 0.76, 0.04);
  feather.rotation.z = Math.PI / 4;
  group.add(feather);

  // Classical Lute (Held across the chest)
  const luteBody = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), woodMat);
  luteBody.scale.set(1, 1.25, 0.65);
  luteBody.position.set(0.08, 0.38, 0.14);
  luteBody.rotation.z = -Math.PI / 5;

  const luteNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.34, 6), woodMat);
  luteNeck.position.set(-0.08, 0.48, 0.16);
  luteNeck.rotation.z = -Math.PI / 3;

  const soundHole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), goldMat);
  soundHole.rotateX(Math.PI / 2);
  soundHole.position.set(0.08, 0.38, 0.2);

  group.add(luteBody, luteNeck, soundHole);
}

// -------------------------------------------------------------
// ICE MAGE (Glacial Robe, Frosted Cowl, Icicles & Diamond Ice Crystal)
// -------------------------------------------------------------
function buildIceMageMini(group: THREE.Group) {
  const frostRobeMat = new THREE.MeshStandardMaterial({ color: 0x0891b2, roughness: 0.4 });
  const darkIceMat = new THREE.MeshStandardMaterial({ color: 0x164e63, roughness: 0.35 });
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xa5f3fc,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.2,
    roughness: 0.1,
    metalness: 0.8,
  });
  const iceStaffMat = new THREE.MeshStandardMaterial({ color: 0x0e7490, metalness: 0.7, roughness: 0.2 });

  // Flowing Frost Robe
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.58, 12), frostRobeMat);
  robe.position.y = 0.32;
  robe.castShadow = true;
  group.add(robe);

  // Cyan Hem
  const hemGeo = new THREE.TorusGeometry(0.24, 0.02, 6, 16);
  hemGeo.rotateX(Math.PI / 2);
  const hem = new THREE.Mesh(hemGeo, crystalMat);
  hem.position.y = 0.06;
  group.add(hem);

  // Head in Frosted Cowl
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0xcffafe }));
  head.position.y = 0.58;
  group.add(head);

  // Glacial Cowl / Hood
  const cowl = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 8), darkIceMat);
  cowl.position.set(0, 0.72, -0.04);
  cowl.rotation.x = -Math.PI / 12;
  group.add(cowl);

  // Icicle Spikes on Shoulders
  const spikeL = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 4), crystalMat);
  spikeL.position.set(-0.22, 0.5, 0);
  spikeL.rotation.z = Math.PI / 4;
  const spikeR = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 4), crystalMat);
  spikeR.position.set(0.22, 0.5, 0);
  spikeR.rotation.z = -Math.PI / 4;
  group.add(spikeL, spikeR);

  // Glacial Ice Staff (Right Hand)
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.9, 8), iceStaffMat);
  staff.position.set(0.26, 0.48, 0.08);
  staff.castShadow = true;
  group.add(staff);

  // Floating Spinning Diamond Ice Crystal
  const iceOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), crystalMat);
  iceOrb.position.set(0.26, 0.98, 0.08);
  iceOrb.name = 'spinningOrb';
  group.add(iceOrb);
}

// -------------------------------------------------------------
// 12B. SNIPER (Franco-Atirador de Elite)
// -------------------------------------------------------------
function buildSniperMini(group: THREE.Group) {
  const camoMat = new THREE.MeshStandardMaterial({ color: 0x1e3a29, roughness: 0.8 }); // Camo green
  const darkCamoMat = new THREE.MeshStandardMaterial({ color: 0x14281d, roughness: 0.9 });
  const tacticalArmor = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.5, metalness: 0.4 });
  const rifleMetal = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2, metalness: 0.85 });
  const scopeLens = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.8 });

  // Legs in tactical combat gear
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.26, 6), tacticalArmor);
  legL.position.set(-0.09, 0.13, 0);
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.26, 6), tacticalArmor);
  legR.position.set(0.09, 0.13, 0);
  group.add(legL, legR);

  // Torso with tactical vest & ghillie harness
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.18), tacticalArmor);
  torso.position.y = 0.38;
  torso.castShadow = true;
  group.add(torso);

  // Ghillie / Camo Cloak behind
  const cloak = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.46, 8), camoMat);
  cloak.position.set(0, 0.35, -0.07);
  cloak.scale.set(1.1, 1, 0.5);
  group.add(cloak);

  // Head in Camo Hood
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), darkCamoMat);
  head.position.set(0, 0.62, 0);
  group.add(head);

  // Camo Hood Peak
  const hood = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.28, 8), camoMat);
  hood.position.set(0, 0.72, -0.03);
  hood.rotation.x = -Math.PI / 10;
  group.add(hood);

  // Glowing Green Tactical Night-Vision / Eye Scope
  const eyeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), scopeLens);
  eyeLens.rotation.x = Math.PI / 2;
  eyeLens.position.set(0.04, 0.62, 0.12);
  group.add(eyeLens);

  // Long Heavy Anti-Material Sniper Rifle (Held in Two Hands)
  const rifleBody = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.44), rifleMetal);
  rifleBody.position.set(0.16, 0.42, 0.16);
  group.add(rifleBody);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.65, 8), rifleMetal);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0.16, 0.44, 0.52);
  group.add(barrel);

  // Muzzle Break / Silencer
  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.1, 8), tacticalArmor);
  muzzle.rotation.x = Math.PI / 2;
  muzzle.position.set(0.16, 0.44, 0.86);
  group.add(muzzle);

  // Telescopic Scope on Top of Rifle
  const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.18, 8), tacticalArmor);
  scope.rotation.x = Math.PI / 2;
  scope.position.set(0.16, 0.49, 0.16);
  group.add(scope);
}

// -------------------------------------------------------------
// 12C. MAGO ELÉTRICO (Eletromante)
// -------------------------------------------------------------
function buildElectricMageMini(group: THREE.Group) {
  const electricRobes = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.5 }); // Midnight indigo
  const goldTrim = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });
  const plasmaCore = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.9,
    roughness: 0.1,
  });

  // Flowing Electro Robe
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.58, 12), electricRobes);
  robe.position.y = 0.32;
  robe.castShadow = true;
  group.add(robe);

  // Golden Electric Hem
  const hemGeo = new THREE.TorusGeometry(0.24, 0.02, 6, 16);
  hemGeo.rotateX(Math.PI / 2);
  const hem = new THREE.Mesh(hemGeo, goldTrim);
  hem.position.y = 0.06;
  group.add(hem);

  // Head with Cowl
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0xbae6fd }));
  head.position.y = 0.58;
  group.add(head);

  // Electric Cowl / Hood
  const cowl = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 8), electricRobes);
  cowl.position.set(0, 0.72, -0.04);
  cowl.rotation.x = -Math.PI / 12;
  group.add(cowl);

  // Floating Rotating Lightning Spark Rings (Orbiting Shoulders)
  const sparkRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.018, 4, 16), plasmaCore);
  sparkRing.rotation.set(Math.PI / 3, Math.PI / 6, 0);
  sparkRing.position.set(0, 0.52, 0);
  sparkRing.name = 'spinningOrb';
  group.add(sparkRing);

  // Tesla Lightning Rod (Staff)
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.92, 8), goldTrim);
  staff.position.set(0.24, 0.48, 0.08);
  staff.castShadow = true;
  group.add(staff);

  // Crackling Electric Plasma Crystal atop staff
  const lightningOrb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08), plasmaCore);
  lightningOrb.position.set(0.24, 0.98, 0.08);
  group.add(lightningOrb);
}

// -------------------------------------------------------------
// 12D. MAGO DE VENTO (Aeromante)
// -------------------------------------------------------------
function buildWindMageMini(group: THREE.Group) {
  const windRobes = new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.6 }); // Teal / Aero green
  const whiteTrim = new THREE.MeshStandardMaterial({ color: 0xccfbf1, roughness: 0.3 });
  const windGlow = new THREE.MeshStandardMaterial({
    color: 0x2dd4bf,
    emissive: 0x2dd4bf,
    emissiveIntensity: 0.7,
    transparent: true,
    opacity: 0.85,
  });

  // Flowing Aeromancer Robe
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.6, 12), windRobes);
  robe.position.y = 0.33;
  robe.castShadow = true;
  group.add(robe);

  // Swirling Wind Vortex Ring at base
  const vortexGeo = new THREE.TorusGeometry(0.25, 0.025, 6, 16);
  vortexGeo.rotateX(Math.PI / 2);
  const vortex = new THREE.Mesh(vortexGeo, windGlow);
  vortex.position.y = 0.08;
  group.add(vortex);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0xf0fdfa }));
  head.position.y = 0.58;
  group.add(head);

  // Feathered Circlet
  const circlet = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.02, 6, 16), whiteTrim);
  circlet.position.set(0, 0.62, 0);
  circlet.rotation.x = Math.PI / 2;
  group.add(circlet);

  // Feather wings / plumes on shoulders
  [-1, 1].forEach((side) => {
    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.22, 4), whiteTrim);
    plume.position.set(side * 0.2, 0.52, 0);
    plume.rotation.z = side * (Math.PI / 3);
    group.add(plume);
  });

  // Zephyr Wind Scepter / Staff
  const scepter = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.88, 8), whiteTrim);
  scepter.position.set(0.25, 0.48, 0.08);
  group.add(scepter);

  // Floating Spinning Aero Orb
  const aeroOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.085), windGlow);
  aeroOrb.position.set(0.25, 0.96, 0.08);
  aeroOrb.name = 'spinningOrb';
  group.add(aeroOrb);
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
// 21. DEVOURER BOSS (Mini-Boss Fase 5 - Chitinous Apex Predator)
// -------------------------------------------------------------
function buildDevourerBossMini(group: THREE.Group) {
  const carapaceMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.5, roughness: 0.35 });
  const darkChitin = new THREE.MeshStandardMaterial({ color: 0x1c1917, metalness: 0.7, roughness: 0.4 });
  const tuskMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });
  const acidMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.5,
    roughness: 0.2,
  });

  // Segmented Armored Abdomen (3 interlocking segments with spiky dorsal plates)
  const seg1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 0), carapaceMat);
  seg1.position.set(0, 0.42, -0.15);
  seg1.scale.set(1.1, 0.9, 1.2);
  seg1.castShadow = true;
  group.add(seg1);

  const seg2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.34, 0), darkChitin);
  seg2.position.set(0, 0.48, 0.12);
  seg2.scale.set(1.2, 0.95, 1.1);
  seg2.castShadow = true;
  group.add(seg2);

  const headCarapace = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), carapaceMat);
  headCarapace.position.set(0, 0.56, 0.38);
  headCarapace.scale.set(1.15, 0.9, 1.0);
  headCarapace.castShadow = true;
  group.add(headCarapace);

  // Dorsal Fumarole Vents (volcanic acid chimneys on carapace)
  const ventGeo = new THREE.CylinderGeometry(0.045, 0.07, 0.18, 6);
  const ventL = new THREE.Mesh(ventGeo, darkChitin);
  ventL.position.set(-0.16, 0.74, -0.08);
  ventL.rotation.z = Math.PI / 8;
  const ventR = new THREE.Mesh(ventGeo, darkChitin);
  ventR.position.set(0.16, 0.74, -0.08);
  ventR.rotation.z = -Math.PI / 8;
  const ventM = new THREE.Mesh(ventGeo, darkChitin);
  ventM.position.set(0, 0.78, -0.22);
  ventM.rotation.x = -Math.PI / 8;
  group.add(ventL, ventR, ventM);

  // Glowing Acid Vent Cores
  const ventCoreGeo = new THREE.SphereGeometry(0.035, 6, 6);
  const vcL = new THREE.Mesh(ventCoreGeo, acidMat);
  vcL.position.set(-0.18, 0.82, -0.08);
  const vcR = new THREE.Mesh(ventCoreGeo, acidMat);
  vcR.position.set(0.18, 0.82, -0.08);
  group.add(vcL, vcR);

  // Gaping Maw with Glowing Acid Bile Core
  const mawCore = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), acidMat);
  mawCore.position.set(0, 0.54, 0.48);
  mawCore.name = 'spinningOrb';
  group.add(mawCore);

  // Quadruple Serrated Mandibles (2 large lateral + 2 lower)
  const mandibleGeo = new THREE.ConeGeometry(0.07, 0.42, 4);
  const mLeft = new THREE.Mesh(mandibleGeo, darkChitin);
  mLeft.position.set(-0.28, 0.56, 0.54);
  mLeft.rotation.set(Math.PI / 6, 0, -Math.PI / 3);
  const mRight = new THREE.Mesh(mandibleGeo, darkChitin);
  mRight.position.set(0.28, 0.56, 0.54);
  mRight.rotation.set(Math.PI / 6, 0, Math.PI / 3);
  const mBottomL = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.28, 4), tuskMat);
  mBottomL.position.set(-0.12, 0.42, 0.56);
  mBottomL.rotation.set(-Math.PI / 8, 0, -Math.PI / 6);
  const mBottomR = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.28, 4), tuskMat);
  mBottomR.position.set(0.12, 0.42, 0.56);
  mBottomR.rotation.set(-Math.PI / 8, 0, Math.PI / 6);
  group.add(mLeft, mRight, mBottomL, mBottomR);

  // 6 Glowing Amber Eyes
  for (let i = 0; i < 3; i++) {
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), acidMat);
    eyeL.position.set(-0.14 + i * 0.03, 0.68 + i * 0.02, 0.44 - i * 0.04);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), acidMat);
    eyeR.position.set(0.14 - i * 0.03, 0.68 + i * 0.02, 0.44 - i * 0.04);
    group.add(eyeL, eyeR);
  }

  // Front Heavy Scythe-Arms
  const scytheArmGeo = new THREE.BoxGeometry(0.06, 0.45, 0.1);
  const sArmL = new THREE.Mesh(scytheArmGeo, darkChitin);
  sArmL.position.set(-0.42, 0.46, 0.28);
  sArmL.rotation.set(Math.PI / 5, Math.PI / 6, -Math.PI / 4);
  const sArmR = new THREE.Mesh(scytheArmGeo, darkChitin);
  sArmR.position.set(0.42, 0.46, 0.28);
  sArmR.rotation.set(Math.PI / 5, -Math.PI / 6, Math.PI / 4);
  group.add(sArmL, sArmR);

  // Scythe Blades
  const bladeGeo = new THREE.ConeGeometry(0.06, 0.36, 4);
  const bL = new THREE.Mesh(bladeGeo, carapaceMat);
  bL.position.set(-0.52, 0.32, 0.44);
  bL.rotation.set(Math.PI / 2, 0, -Math.PI / 6);
  const bR = new THREE.Mesh(bladeGeo, carapaceMat);
  bR.position.set(0.52, 0.32, 0.44);
  bR.rotation.set(Math.PI / 2, 0, Math.PI / 6);
  group.add(bL, bR);

  // 4 Crawler Legs (Anchored to Pedestal)
  const legGeo = new THREE.CapsuleGeometry(0.05, 0.24, 4, 6);
  const legPositions = [
    [-0.32, 0.16, -0.15],
    [0.32, 0.16, -0.15],
    [-0.35, 0.18, 0.12],
    [0.35, 0.18, 0.12],
  ];
  legPositions.forEach(([lx, ly, lz], idx) => {
    const l = new THREE.Mesh(legGeo, darkChitin);
    l.position.set(lx, ly, lz);
    l.rotation.z = idx % 2 === 0 ? Math.PI / 3 : -Math.PI / 3;
    group.add(l);
  });
}

// -------------------------------------------------------------
// 22. ASTAROTH FINAL BOSS (Ato 1 Boss Poderoso - Archdemon of the Void)
// -------------------------------------------------------------
function buildAstarothBossMini(group: THREE.Group) {
  const armorMat = new THREE.MeshStandardMaterial({ color: 0x1e1035, metalness: 0.85, roughness: 0.25 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0x3b0764, roughness: 0.5 });
  const voidMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 1.4,
    roughness: 0.2,
  });

  // Armored Demon Legs & Greaves
  const legGeo = new THREE.CapsuleGeometry(0.09, 0.32, 6, 8);
  const legL = new THREE.Mesh(legGeo, armorMat);
  legL.position.set(-0.16, 0.24, 0);
  const legR = new THREE.Mesh(legGeo, armorMat);
  legR.position.set(0.16, 0.24, 0);
  group.add(legL, legR);

  // Muscular Armored Torso with Gold filigree
  const torsoGeo = new THREE.CylinderGeometry(0.3, 0.22, 0.52, 10);
  const torso = new THREE.Mesh(torsoGeo, skinMat);
  torso.position.y = 0.58;
  torso.castShadow = true;
  group.add(torso);

  const breastplate = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.14), armorMat);
  breastplate.position.set(0, 0.62, 0.12);
  group.add(breastplate);

  const crest = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), voidMat);
  crest.position.set(0, 0.64, 0.2);
  group.add(crest);

  // Royal Violet Waist Kilt / Mantle
  const kilt = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 0.36, 10), new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.6 }));
  kilt.position.y = 0.38;
  group.add(kilt);

  // Demon Head & Visor
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), armorMat);
  head.position.y = 0.98;
  group.add(head);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.045, 0.06), voidMat);
  visor.position.set(0, 0.98, 0.16);
  group.add(visor);

  // 4 Grand Curved Demon Horns
  const hornPrimaryGeo = new THREE.ConeGeometry(0.07, 0.56, 6);
  const hL = new THREE.Mesh(hornPrimaryGeo, armorMat);
  hL.position.set(-0.24, 1.28, 0.02);
  hL.rotation.set(-Math.PI / 8, 0, Math.PI / 4);
  const hR = new THREE.Mesh(hornPrimaryGeo, armorMat);
  hR.position.set(0.24, 1.28, 0.02);
  hR.rotation.set(-Math.PI / 8, 0, -Math.PI / 4);
  const hBrowL = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.24, 4), goldMat);
  hBrowL.position.set(-0.12, 1.1, 0.18);
  hBrowL.rotation.set(Math.PI / 4, 0, Math.PI / 6);
  const hBrowR = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.24, 4), goldMat);
  hBrowR.position.set(0.12, 1.1, 0.18);
  hBrowR.rotation.set(Math.PI / 4, 0, -Math.PI / 6);
  group.add(hL, hR, hBrowL, hBrowR);

  // Floating Crown of the Void (Orbiting above horns)
  const crownGeo = new THREE.TorusGeometry(0.28, 0.026, 6, 16);
  crownGeo.rotateX(Math.PI / 2);
  const crown = new THREE.Mesh(crownGeo, voidMat);
  crown.position.y = 1.48;
  crown.name = 'auraRing';
  group.add(crown);

  // Colossal Ribbed Bat Wings
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x581c87,
    emissive: 0x3b0764,
    emissiveIntensity: 0.6,
    roughness: 0.35,
    side: THREE.DoubleSide,
  });
  const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.05, 0.95), wingMat);
  wingL.position.set(-0.55, 1.0, -0.22);
  wingL.rotation.set(Math.PI / 12, -Math.PI / 4, Math.PI / 12);
  const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.05, 0.95), wingMat);
  wingR.position.set(0.55, 1.0, -0.22);
  wingR.rotation.set(Math.PI / 12, Math.PI / 4, -Math.PI / 12);
  group.add(wingL, wingR);

  // Demon Skull Pauldrons with Gold Horn Studs
  const pL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), armorMat);
  pL.position.set(-0.36, 0.72, 0.04);
  const pR = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), armorMat);
  pR.position.set(0.36, 0.72, 0.04);
  group.add(pL, pR);

  // Left Weapon: Colossal Abyssal Void Glaive
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.4, 8), goldMat);
  staff.position.set(-0.46, 0.75, 0.22);
  staff.rotation.x = Math.PI / 10;
  const bladeTop = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.48, 0.16), voidMat);
  bladeTop.position.set(-0.46, 1.35, 0.32);
  bladeTop.rotation.x = Math.PI / 10;
  group.add(staff, bladeTop);

  // Right Hand Claw Gauntlet
  const clawHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.14), armorMat);
  clawHand.position.set(0.42, 0.46, 0.2);
  group.add(clawHand);
}

// -------------------------------------------------------------
// 23. SPECTRAL HARBINGER BOSS (Ato 2 Mini-Boss Fase 15 - Soul Reaper)
// -------------------------------------------------------------
function buildSpectralHarbingerBossMini(group: THREE.Group) {
  const ghostMat = new THREE.MeshStandardMaterial({
    color: 0x083344,
    emissive: 0x0e7490,
    emissiveIntensity: 0.5,
    roughness: 0.4,
    transparent: true,
    opacity: 0.92,
  });
  const soulCyan = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    emissive: 0x00e5ff,
    emissiveIntensity: 1.8,
    roughness: 0.2,
  });
  const boneMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
  const chainMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });

  // Floating Levitating Swirling Shroud (Tapers into spectral wisps)
  const shroudBottom = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.65, 8), ghostMat);
  shroudBottom.position.y = 0.42;
  shroudBottom.rotation.z = Math.PI / 16;
  group.add(shroudBottom);

  const shroudMid = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.44, 8), ghostMat);
  shroudMid.position.y = 0.72;
  group.add(shroudMid);

  // Floating Broken Spectral Chains Orbiting Body
  const chainRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.02, 6, 16), chainMat);
  chainRing.position.y = 0.68;
  chainRing.rotation.set(Math.PI / 3, Math.PI / 6, 0);
  chainRing.name = 'spinningOrb';
  group.add(chainRing);

  // Deep Phantom Cowl & Floating Bone Skull
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.8 }));
  hood.position.set(0, 1.05, 0.02);
  group.add(hood);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), boneMat);
  skull.position.set(0, 1.03, 0.06);
  group.add(skull);

  // Twin Burning Soul-Flame Eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), soulCyan);
  eyeL.position.set(-0.045, 1.05, 0.17);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), soulCyan);
  eyeR.position.set(0.045, 1.05, 0.17);
  group.add(eyeL, eyeR);

  // Titanic Soul Scythe (Right Hand)
  const scytheStaff = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 1.45, 6), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 }));
  scytheStaff.position.set(0.38, 0.75, 0.15);
  scytheStaff.rotation.z = -Math.PI / 12;
  group.add(scytheStaff);

  const scytheBlade = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.04, 6, 12, Math.PI * 0.75), soulCyan);
  scytheBlade.position.set(0.56, 1.35, 0.18);
  scytheBlade.rotation.set(0, 0, -Math.PI / 3);
  group.add(scytheBlade);

  // Soul Cage Lantern (Left Hand, Floating)
  const lanternFrame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.14), chainMat);
  lanternFrame.position.set(-0.38, 0.65, 0.22);
  const lanternSoul = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), soulCyan);
  lanternSoul.position.set(-0.38, 0.65, 0.22);
  lanternSoul.name = 'spinningOrb';
  group.add(lanternFrame, lanternSoul);
}

// -------------------------------------------------------------
// 24. FORGE TITAN BOSS (Ato 2 Boss Poderoso - Vulcanus, Living Forge)
// -------------------------------------------------------------
function buildForgeTitanBossMini(group: THREE.Group) {
  const basaltMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85, metalness: 0.3 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, metalness: 0.85, roughness: 0.3 });
  const lavaMat = new THREE.MeshStandardMaterial({
    color: 0xff3b00,
    emissive: 0xff4500,
    emissiveIntensity: 1.8,
    roughness: 0.2,
  });

  // Massive Basalt Column Legs
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.44, 0.26), basaltMat);
  legL.position.set(-0.24, 0.22, 0);
  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.44, 0.26), basaltMat);
  legR.position.set(0.24, 0.22, 0);
  group.add(legL, legR);

  // Heavy Basalt Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.6, 0.42), basaltMat);
  torso.position.y = 0.68;
  torso.castShadow = true;
  group.add(torso);

  // Open Furnace Grate in Chest (Intense Molten Fire Core)
  const fireCore = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.12), lavaMat);
  fireCore.position.set(0, 0.68, 0.2);
  group.add(fireCore);

  // Iron Furnace Grate Bars
  for (let i = -1; i <= 1; i++) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.34, 6), ironMat);
    bar.position.set(i * 0.1, 0.68, 0.26);
    group.add(bar);
  }

  // Industrial Exhaust Chimneys on Back
  const chimL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.38, 8), ironMat);
  chimL.position.set(-0.22, 1.08, -0.16);
  chimL.rotation.x = -Math.PI / 8;
  const chimR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.38, 8), ironMat);
  chimR.position.set(0.22, 1.08, -0.16);
  chimR.rotation.x = -Math.PI / 8;
  group.add(chimL, chimR);

  // Chimney Molten Cores
  const ccL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), lavaMat);
  ccL.position.set(-0.22, 1.25, -0.2);
  const ccR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), lavaMat);
  ccR.position.set(0.22, 1.25, -0.2);
  group.add(ccL, ccR);

  // Furnace Block Helm
  const helm = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.3, 0.3), basaltMat);
  helm.position.set(0, 1.1, 0.04);
  group.add(helm);

  // Horizontal Magma Visor Slit
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.045, 0.08), lavaMat);
  visor.position.set(0, 1.1, 0.18);
  group.add(visor);

  // Giant Square Basalt Pauldrons
  const pL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.28), basaltMat);
  pL.position.set(-0.46, 0.88, 0);
  const pR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.28), basaltMat);
  pR.position.set(0.46, 0.88, 0);
  group.add(pL, pR);

  // Right Hand: Titanic Forge Anvil-Hammer
  const hShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.25, 8), ironMat);
  hShaft.position.set(0.56, 0.65, 0.2);
  hShaft.rotation.x = Math.PI / 12;
  const hHead = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.36, 0.52), basaltMat);
  hHead.position.set(0.56, 1.2, 0.28);
  const hRunes = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.36), lavaMat);
  hRunes.position.set(0.56, 1.2, 0.28);
  group.add(hShaft, hHead, hRunes);

  // Left Hand: Hydraulic Crusher Fist
  const fist = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), ironMat);
  fist.position.set(-0.48, 0.44, 0.16);
  group.add(fist);
}

// -------------------------------------------------------------
// 25. RUNE MASTER BOSS (Ato 3 Mini-Boss Fase 25 - Arch-Hierophant)
// -------------------------------------------------------------
function buildRuneMasterBossMini(group: THREE.Group) {
  const robeMat = new THREE.MeshStandardMaterial({ color: 0x3b0764, roughness: 0.5 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
  const runeMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0xa855f7,
    emissiveIntensity: 1.6,
    roughness: 0.2,
  });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });

  // Floating Robe Silhouette
  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 0.72, 10), robeMat);
  robe.position.y = 0.45;
  group.add(robe);

  // Gold Trim Border
  const trim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.025, 6, 16), goldMat);
  trim.position.y = 0.1;
  trim.rotation.x = Math.PI / 2;
  group.add(trim);

  // Head & Long Sage Beard
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfed7aa }));
  head.position.set(0, 0.88, 0.02);
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.38, 6), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 }));
  beard.position.set(0, 0.72, 0.12);
  beard.rotation.x = Math.PI;
  group.add(head, beard);

  // High Runic Mitre Crown
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.48, 6), robeMat);
  crown.position.set(0, 1.18, -0.02);
  const eyeOfWisdom = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), runeMat);
  eyeOfWisdom.position.set(0, 1.1, 0.15);
  group.add(crown, eyeOfWisdom);

  // 4 Orbiting Runic Monoliths
  const monolithGroup = new THREE.Group();
  monolithGroup.name = 'spinningOrb';
  monolithGroup.position.y = 0.65;
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const mMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.05), stoneMat);
    mMesh.position.set(Math.cos(angle) * 0.48, 0, Math.sin(angle) * 0.48);
    const mRune = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.06), runeMat);
    mRune.position.copy(mMesh.position);
    monolithGroup.add(mMesh, mRune);
  }
  group.add(monolithGroup);

  // Floating Eldritch Grimoire (Chest Height)
  const bookCover = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.18), new THREE.MeshStandardMaterial({ color: 0x1e1b4b }));
  bookCover.position.set(0, 0.72, 0.3);
  bookCover.rotation.x = Math.PI / 6;
  const bookPages = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.16), runeMat);
  bookPages.position.set(0, 0.74, 0.3);
  bookPages.rotation.x = Math.PI / 6;
  group.add(bookCover, bookPages);

  // Runic Scepter (Right Hand)
  const scepter = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 1.15, 8), goldMat);
  scepter.position.set(0.38, 0.65, 0.12);
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), runeMat);
  crystal.position.set(0.38, 1.25, 0.12);
  crystal.name = 'spinningOrb';
  group.add(scepter, crystal);
}

// -------------------------------------------------------------
// 26. VALGAR BUTCHER BOSS (Ato 3 Boss Poderoso - Immortal Warlord)
// -------------------------------------------------------------
function buildValgarButcherBossMini(group: THREE.Group) {
  const muscleMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.65 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.85, roughness: 0.3 });
  const boneMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
  const bloodMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, metalness: 0.6, roughness: 0.3 });

  // Bulging Muscle Legs & Spiked Greaves
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.28, 6, 8), muscleMat);
  legL.position.set(-0.2, 0.24, 0);
  const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.28, 6, 8), muscleMat);
  legR.position.set(0.2, 0.24, 0);
  group.add(legL, legR);

  // Massive Scarred Torso with Bone Ribcage Harness
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.28, 0.54, 10), muscleMat);
  torso.position.y = 0.62;
  torso.castShadow = true;
  group.add(torso);

  const ribcage = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.34, 0.18), boneMat);
  ribcage.position.set(0, 0.64, 0.14);
  group.add(ribcage);

  // Horned Savage War Helm
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), ironMat);
  helm.position.set(0, 0.98, 0.04);
  group.add(helm);

  // Curved Ram War Horns
  const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.48, 6), ironMat);
  hornL.position.set(-0.28, 1.18, 0.04);
  hornL.rotation.set(-Math.PI / 6, 0, Math.PI / 3);
  const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.48, 6), ironMat);
  hornR.position.set(0.28, 1.18, 0.04);
  hornR.rotation.set(-Math.PI / 6, 0, -Math.PI / 3);
  group.add(hornL, hornR);

  // Ivory War Tusks & Spiked Iron Jaw
  const tuskL = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.24, 4), boneMat);
  tuskL.position.set(-0.11, 0.88, 0.24);
  tuskL.rotation.set(-Math.PI / 3, 0, -Math.PI / 8);
  const tuskR = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.24, 4), boneMat);
  tuskR.position.set(0.11, 0.88, 0.24);
  tuskR.rotation.set(-Math.PI / 3, 0, Math.PI / 8);
  group.add(tuskL, tuskR);

  // Burning Crimson Feral Eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.8 });
  const eL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 4, 4), eyeMat);
  eL.position.set(-0.08, 1.0, 0.2);
  const eR = new THREE.Mesh(new THREE.SphereGeometry(0.035, 4, 4), eyeMat);
  eR.position.set(0.08, 1.0, 0.2);
  group.add(eL, eR);

  // Left Shoulder: Beast Skull Trophy Pauldron
  const skullPauldron = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), boneMat);
  skullPauldron.position.set(-0.46, 0.82, 0.02);
  group.add(skullPauldron);

  // Right Shoulder: Spiked Iron Pauldron
  const pR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.26), ironMat);
  pR.position.set(0.46, 0.82, 0.02);
  const spikeR = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.24, 4), ironMat);
  spikeR.position.set(0.56, 0.98, 0.02);
  spikeR.rotation.z = -Math.PI / 4;
  group.add(pR, spikeR);

  // Dual Colossal Executioner Battleaxes
  const makeAxe = (posX: number, rotZ: number) => {
    const axeGroup = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6), ironMat);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.32), bloodMat);
    blade.position.set(0, 0.38, 0.14);
    axeGroup.add(handle, blade);
    axeGroup.position.set(posX, 0.6, 0.25);
    axeGroup.rotation.set(Math.PI / 8, 0, rotZ);
    return axeGroup;
  };
  group.add(makeAxe(-0.54, Math.PI / 10));
  group.add(makeAxe(0.54, -Math.PI / 10));
}

// -------------------------------------------------------------
// 27. VENOM CHIMERA BOSS (Ato 4 Mini-Boss Fase 35 - Shadow Beast)
// -------------------------------------------------------------
function buildVenomChimeraBossMini(group: THREE.Group) {
  const beastMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, metalness: 0.4, roughness: 0.35 });
  const darkScales = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.3 });
  const venomMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 1.8,
    roughness: 0.2,
  });

  // Quadruped Beast Body
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.65, 8, 10), beastMat);
  body.position.set(0, 0.42, 0);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  group.add(body);

  // 4 Muscular Paws
  const pawPositions = [
    [-0.26, 0.18, -0.32],
    [0.26, 0.18, -0.32],
    [-0.28, 0.18, 0.28],
    [0.28, 0.18, 0.28],
  ];
  pawPositions.forEach(([px, py, pz]) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.26, 6, 8), darkScales);
    leg.position.set(px, py, pz);
    group.add(leg);
  });

  // Predatory Leonine Head & Saber Fangs
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), beastMat);
  head.position.set(0, 0.64, 0.46);
  group.add(head);

  // Ram Horns on Brow
  const hL = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 6, 12, Math.PI), darkScales);
  hL.position.set(-0.22, 0.82, 0.42);
  hL.rotation.y = -Math.PI / 3;
  const hR = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 6, 12, Math.PI), darkScales);
  hR.position.set(0.22, 0.82, 0.42);
  hR.rotation.y = Math.PI / 3;
  group.add(hL, hR);

  // Toxic Emerald Eyes
  const eL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 4, 4), venomMat);
  eL.position.set(-0.09, 0.7, 0.62);
  const eR = new THREE.Mesh(new THREE.SphereGeometry(0.035, 4, 4), venomMat);
  eR.position.set(0.09, 0.7, 0.62);
  group.add(eL, eR);

  // Bat/Dragon Wings Arched on Back
  const wingGeo = new THREE.BoxGeometry(0.04, 0.65, 0.55);
  const wL = new THREE.Mesh(wingGeo, darkScales);
  wL.position.set(-0.36, 0.82, -0.05);
  wL.rotation.set(-Math.PI / 8, -Math.PI / 4, Math.PI / 6);
  const wR = new THREE.Mesh(wingGeo, darkScales);
  wR.position.set(0.36, 0.82, -0.05);
  wR.rotation.set(-Math.PI / 8, Math.PI / 4, -Math.PI / 6);
  group.add(wL, wR);

  // Arched Segmented Scorpion Tail with Glowing Venom Barb
  const tailGroup = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const tSeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.06 - i * 0.008, 0.16, 4, 6), darkScales);
    tSeg.position.set(0, 0.5 + i * 0.14, -0.38 + i * 0.12);
    tSeg.rotation.x = -Math.PI / 4 + i * 0.22;
    tailGroup.add(tSeg);
  }
  const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.24, 6), venomMat);
  stinger.position.set(0, 1.25, 0.08);
  stinger.rotation.x = Math.PI * 0.75;
  tailGroup.add(stinger);
  group.add(tailGroup);
}

// -------------------------------------------------------------
// 27B. CHIMERA LION (Fase 2 da Quimera - Fera Leonina)
// -------------------------------------------------------------
function buildChimeraLionMini(group: THREE.Group) {
  const lionCoat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5, metalness: 0.2 });
  const maneMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 1.5 });
  const clawMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8 });

  // Muscular Feline Body
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.52, 8, 10), lionCoat);
  body.position.set(0, 0.38, 0);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  group.add(body);

  // 4 Muscular Paws
  const pawPositions = [
    [-0.22, 0.16, -0.26],
    [0.22, 0.16, -0.26],
    [-0.24, 0.16, 0.24],
    [0.24, 0.16, 0.24],
  ];
  pawPositions.forEach(([px, py, pz]) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.22, 6, 8), lionCoat);
    leg.position.set(px, py, pz);
    group.add(leg);
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 4), clawMat);
    claw.position.set(px, 0.04, pz + 0.08);
    claw.rotation.x = Math.PI / 3;
    group.add(claw);
  });

  // Majestic Lion Mane
  const mane = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.10, 8, 16), maneMat);
  mane.position.set(0, 0.58, 0.32);
  mane.rotation.x = Math.PI / 4;
  group.add(mane);

  // Feline Head & Muzzle
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), lionCoat);
  head.position.set(0, 0.58, 0.40);
  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.14), lionCoat);
  muzzle.position.set(0, 0.53, 0.52);
  group.add(head, muzzle);

  // Glowing Amber Predator Eyes
  const eL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), eyeMat);
  eL.position.set(-0.07, 0.62, 0.52);
  const eR = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), eyeMat);
  eR.position.set(0.07, 0.62, 0.52);
  group.add(eL, eR);

  // Tail with tuft
  const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.40, 4, 6), lionCoat);
  tail.position.set(0, 0.45, -0.42);
  tail.rotation.x = -Math.PI / 3;
  const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), maneMat);
  tuft.position.set(0, 0.60, -0.56);
  group.add(tail, tuft);
}

// -------------------------------------------------------------
// 27C. CHIMERA SNAKE (Fase 2 da Quimera - Víbora Tóxica)
// -------------------------------------------------------------
function buildChimeraSnakeMini(group: THREE.Group) {
  const scaleMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, metalness: 0.5, roughness: 0.3 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.4 });
  const venomMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 2.0,
    roughness: 0.2,
  });
  const fangMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });

  // Coiled Serpentine Body Segments
  const coils = 6;
  for (let i = 0; i < coils; i++) {
    const radius = 0.32 - i * 0.035;
    const height = 0.10 + i * 0.09;
    const torus = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.07 - i * 0.006, 6, 16), scaleMat);
    torus.position.set(0, height, 0);
    torus.rotation.x = Math.PI / 2 + (i % 2 === 0 ? 0.1 : -0.1);
    torus.castShadow = true;
    group.add(torus);
  }

  // Rising Snake Neck & Hood
  const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.35, 6, 8), scaleMat);
  neck.position.set(0, 0.65, 0.12);
  neck.rotation.x = Math.PI / 8;
  group.add(neck);

  // Flared Cobra Hood
  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.30, 0.04), bellyMat);
  hood.position.set(0, 0.68, 0.10);
  hood.rotation.x = Math.PI / 8;
  group.add(hood);

  // Viper Head
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 5), scaleMat);
  head.position.set(0, 0.84, 0.22);
  head.rotation.x = Math.PI / 2;
  group.add(head);

  // Glowing Emerald Toxic Eyes
  const eL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 4, 4), venomMat);
  eL.position.set(-0.07, 0.86, 0.26);
  const eR = new THREE.Mesh(new THREE.SphereGeometry(0.035, 4, 4), venomMat);
  eR.position.set(0.07, 0.86, 0.26);
  group.add(eL, eR);

  // Sharp Venomous Fangs
  const fL = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.09, 4), fangMat);
  fL.position.set(-0.04, 0.78, 0.32);
  fL.rotation.x = -Math.PI / 4;
  const fR = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.09, 4), fangMat);
  fR.position.set(0.04, 0.78, 0.32);
  fR.rotation.x = -Math.PI / 4;
  group.add(fL, fR);
}

// -------------------------------------------------------------
// 27D. CHIMERA GOAT (Fase 2 da Quimera - Bastião Caprino)
// -------------------------------------------------------------
function buildChimeraGoatMini(group: THREE.Group) {
  const coatMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65 });
  const hornMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.25 });
  const shieldGlow = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0x7c3aed,
    emissiveIntensity: 1.8,
    roughness: 0.2,
  });

  // Quadruped Goat Body
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.50, 8, 10), coatMat);
  body.position.set(0, 0.40, 0);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  group.add(body);

  // 4 Slender Hoofed Legs
  const legPositions = [
    [-0.18, 0.18, -0.22],
    [0.18, 0.18, -0.22],
    [-0.18, 0.18, 0.22],
    [0.18, 0.18, 0.22],
  ];
  legPositions.forEach(([px, py, pz]) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.26, 6, 8), coatMat);
    leg.position.set(px, py, pz);
    group.add(leg);
    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.06, 6), hornMat);
    hoof.position.set(px, 0.03, pz);
    group.add(hoof);
  });

  // Horned Goat Head & Muzzle
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.28, 6), coatMat);
  head.position.set(0, 0.64, 0.38);
  head.rotation.x = -Math.PI / 3;
  group.add(head);

  // Beard
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 4), hornMat);
  beard.position.set(0, 0.48, 0.48);
  beard.rotation.x = Math.PI / 6;
  group.add(beard);

  // Large Curved Demonic Ram Horns
  const hL = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 6, 16, Math.PI * 1.1), hornMat);
  hL.position.set(-0.16, 0.78, 0.28);
  hL.rotation.set(-Math.PI / 4, -Math.PI / 4, 0);
  const hR = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 6, 16, Math.PI * 1.1), hornMat);
  hR.position.set(0.16, 0.78, 0.28);
  hR.rotation.set(-Math.PI / 4, Math.PI / 4, 0);
  group.add(hL, hR);

  // Glowing Amethyst Eyes
  const eL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), shieldGlow);
  eL.position.set(-0.08, 0.68, 0.42);
  const eR = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), shieldGlow);
  eR.position.set(0.08, 0.68, 0.42);
  group.add(eL, eR);

  // Reflective Spiked Shield Sigil on Chest
  const sigil = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), shieldGlow);
  sigil.position.set(0, 0.46, 0.32);
  sigil.scale.set(1, 1.4, 0.4);
  group.add(sigil);
}

// -------------------------------------------------------------
// 28. VOID LEVIATHAN BOSS (Ato 4 Boss Poderoso - Cosmic Serpent)
// -------------------------------------------------------------
function buildVoidLeviathanBossMini(group: THREE.Group) {
  const cosmicMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.35, metalness: 0.6 });
  const finMat = new THREE.MeshStandardMaterial({
    color: 0x4338ca,
    emissive: 0x312e81,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  const voidEye = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.8,
    roughness: 0.1,
  });
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x7c3aed,
    emissiveIntensity: 2.0,
  });

  // Coiled Undulating Serpentine Segments
  for (let i = 0; i < 5; i++) {
    const seg = new THREE.Mesh(new THREE.SphereGeometry(0.32 - i * 0.035, 10, 10), cosmicMat);
    const angle = i * 0.6;
    seg.position.set(Math.sin(angle) * 0.22, 0.35 + i * 0.18, -0.3 + i * 0.18);
    seg.scale.set(1.2, 0.9, 1.1);
    seg.castShadow = true;
    group.add(seg);

    // Ethereal Dorsal Fins
    const finL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.35, 0.24), finMat);
    finL.position.set(seg.position.x - 0.26, seg.position.y + 0.18, seg.position.z);
    finL.rotation.z = Math.PI / 4;
    const finR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.35, 0.24), finMat);
    finR.position.set(seg.position.x + 0.26, seg.position.y + 0.18, seg.position.z);
    finR.rotation.z = -Math.PI / 4;
    group.add(finL, finR);
  }

  // Gaping Maw Singularity Head
  const head = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.08, 8, 16), cosmicMat);
  head.position.set(0, 1.15, 0.38);
  head.rotation.x = Math.PI / 4;
  group.add(head);

  // Black Hole Singularity Core in Mouth
  const blackHole = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), coreMat);
  blackHole.position.set(0, 1.15, 0.38);
  blackHole.name = 'spinningOrb';
  group.add(blackHole);

  // 8 Cosmic Cyan Eyes
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.026, 4, 4), voidEye);
    e.position.set(Math.cos(a) * 0.22, 1.15 + Math.sin(a) * 0.15, 0.44);
    group.add(e);
  }

  // Floating Concentric Orbital Void Rings
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.022, 6, 24), coreMat);
  ring1.position.y = 0.75;
  ring1.rotation.set(Math.PI / 3, Math.PI / 6, 0);
  ring1.name = 'spinningOrb';
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.018, 6, 24), voidEye);
  ring2.position.y = 0.75;
  ring2.rotation.set(-Math.PI / 4, 0, Math.PI / 3);
  ring2.name = 'spinningOrb';
  group.add(ring1, ring2);
}

// -------------------------------------------------------------
// 29. ECLIPSE KNIGHT BOSS (Ato 5 Mini-Boss Fase 45 - Dark Sun Champion)
// -------------------------------------------------------------
function buildEclipseKnightBossMini(group: THREE.Group, variant: 'neutral' | 'dark' | 'light' = 'neutral') {
  const isDark = variant === 'dark';
  const isLight = variant === 'light';

  const armorColor = isDark ? 0x180d2b : (isLight ? 0xe2e8f0 : 0x09090b);
  const trimColor = isDark ? 0x9333ea : (isLight ? 0xfacc15 : 0xf59e0b);
  const radiantColor = isDark ? 0xa855f7 : (isLight ? 0xfef08a : 0xfacc15);
  const emissiveCol = isDark ? 0x581c87 : (isLight ? 0xeab308 : 0xd97706);

  const obsidianMat = new THREE.MeshStandardMaterial({ color: armorColor, metalness: 0.9, roughness: 0.18 });
  const goldMat = new THREE.MeshStandardMaterial({ color: trimColor, metalness: 0.88, roughness: 0.2 });
  const solarMat = new THREE.MeshStandardMaterial({
    color: radiantColor,
    emissive: emissiveCol,
    emissiveIntensity: 1.5,
    roughness: 0.2,
  });

  // Armored Legs & Sabatons
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.28, 6, 8), obsidianMat);
  legL.position.set(-0.14, 0.22, 0);
  const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.28, 6, 8), obsidianMat);
  legR.position.set(0.14, 0.22, 0);
  group.add(legL, legR);

  // Gothic Plate Torso with Gold/Runic Sun Embellishment
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.45, 10), obsidianMat);
  torso.position.y = 0.54;
  torso.castShadow = true;
  group.add(torso);

  const solarCrest = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 16), goldMat);
  solarCrest.position.set(0, 0.58, 0.14);
  group.add(solarCrest);

  // Winged Greathelm
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), obsidianMat);
  helm.position.y = 0.9;
  group.add(helm);

  // Gold/Dark Wing Crests on Helmet
  const wL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.24, 0.12), goldMat);
  wL.position.set(-0.16, 1.02, 0);
  wL.rotation.z = Math.PI / 6;
  const wR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.24, 0.12), goldMat);
  wR.position.set(0.16, 1.02, 0);
  wR.rotation.z = -Math.PI / 6;
  group.add(wL, wR);

  // Eclipse Halo: Solar/Dark Disc behind head with Pitch Black or Bright Core
  const haloDisc = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.028, 6, 24), solarMat);
  haloDisc.position.set(0, 0.95, -0.1);
  haloDisc.name = 'auraRing';
  group.add(haloDisc);

  // Left Hand: Colossal Tower Shield
  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, 0.38), obsidianMat);
  shield.position.set(-0.38, 0.52, 0.18);
  shield.rotation.y = Math.PI / 12;
  const shieldSun = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 6, 16), solarMat);
  shieldSun.position.set(-0.42, 0.52, 0.2);
  group.add(shield, shieldSun);

  // Right Hand: Massive Greatsword
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.95, 0.14), obsidianMat);
  blade.position.set(0.38, 0.65, 0.16);
  blade.rotation.x = Math.PI / 10;
  const bladeEdge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.96, 0.03), solarMat);
  bladeEdge.position.copy(blade.position);
  bladeEdge.rotation.copy(blade.rotation);
  group.add(blade, bladeEdge);

  // Cloak
  const capeColor = isDark ? 0x2e1065 : (isLight ? 0xfffbeb : 0x020617);
  const cape = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.65, 0.03), new THREE.MeshStandardMaterial({ color: capeColor, roughness: 0.6 }));
  cape.position.set(0, 0.48, -0.16);
  cape.rotation.x = -Math.PI / 16;
  group.add(cape);
}

// -------------------------------------------------------------
// 29B. CRISTAL ELEMENTAL (Fase 45 - Cristal da Luz & Cristal das Trevas)
// -------------------------------------------------------------
function buildCrystalMini(group: THREE.Group, variant: 'light' | 'dark') {
  const isLight = variant === 'light';
  const crystalColor = isLight ? 0xfacc15 : 0x9333ea;
  const emissiveColor = isLight ? 0xfef08a : 0x581c87;
  const ringColor = isLight ? 0xfffbeb : 0xc084fc;

  // Floating crystal base pedestal
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
  const baseGeo = new THREE.CylinderGeometry(0.26, 0.34, 0.12, 8);
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = 0.06;
  group.add(baseMesh);

  // Pillar prongs holding the crystal
  for (let i = 0; i < 4; i++) {
    const prong = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.04), baseMat);
    const angle = (i * Math.PI) / 2;
    prong.position.set(Math.cos(angle) * 0.20, 0.16, Math.sin(angle) * 0.20);
    group.add(prong);
  }

  // Floating Octahedral Core Crystal
  const crystalMat = new THREE.MeshStandardMaterial({
    color: crystalColor,
    emissive: emissiveColor,
    emissiveIntensity: 1.8,
    metalness: 0.2,
    roughness: 0.1,
    transparent: true,
    opacity: 0.92,
  });
  const crystalGeo = new THREE.OctahedronGeometry(0.24, 0);
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.y = 0.54;
  crystal.scale.set(0.85, 1.45, 0.85);
  crystal.name = 'hoveringRune';
  group.add(crystal);

  // Rotating Runic Orbit Rings
  const ringMat = new THREE.MeshStandardMaterial({
    color: ringColor,
    emissive: ringColor,
    emissiveIntensity: 1.2,
    roughness: 0.2,
  });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.02, 6, 24), ringMat);
  ring1.position.y = 0.54;
  ring1.rotation.x = Math.PI / 4;
  ring1.name = 'auraRing';
  group.add(ring1);
}

// -------------------------------------------------------------
// 30. MALAKOR FINAL BOSS (Ato 5 Boss Supremo Final - Cosmic Chaos Deity)
// -------------------------------------------------------------
function buildMalakorFinalBossMini(group: THREE.Group) {
  const obsidianMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.18 });
  const crimsonArmor = new THREE.MeshStandardMaterial({ color: 0x881337, metalness: 0.8, roughness: 0.25 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
  const doomRed = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 1.8,
    roughness: 0.2,
  });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x4c0519,
    emissive: 0x881337,
    emissiveIntensity: 0.6,
    roughness: 0.35,
    side: THREE.DoubleSide,
  });

  // Towering Armored Stance & Legs
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.36, 6, 8), obsidianMat);
  legL.position.set(-0.18, 0.28, 0);
  const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.36, 6, 8), obsidianMat);
  legR.position.set(0.18, 0.28, 0);
  group.add(legL, legR);

  // Imposing Regal Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.62, 10), obsidianMat);
  torso.position.y = 0.72;
  torso.castShadow = true;
  group.add(torso);

  // Central Singularity Core (Exposed on chest plate)
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), doomRed);
  core.position.set(0, 0.78, 0.2);
  core.name = 'spinningOrb';
  group.add(core);

  // Royal Imperial Kilt & Gold Trim
  const kilt = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 0.42, 10), crimsonArmor);
  kilt.position.y = 0.48;
  group.add(kilt);

  // Horned Celestial Helm
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), obsidianMat);
  helm.position.y = 1.15;
  group.add(helm);

  // Menacing Red Visor Eye
  const eyeVisor = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.06), doomRed);
  eyeVisor.position.set(0, 1.15, 0.18);
  group.add(eyeVisor);

  // 4 Grand Horns
  const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.58, 6), obsidianMat);
  hornL.position.set(-0.26, 1.48, 0.02);
  hornL.rotation.set(-Math.PI / 8, 0, Math.PI / 3);
  const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.58, 6), obsidianMat);
  hornR.position.set(0.26, 1.48, 0.02);
  hornR.rotation.set(-Math.PI / 8, 0, -Math.PI / 3);
  group.add(hornL, hornR);

  // Floating Crown of Astral Shards (5 Shards hovering in a ring)
  const shardGroup = new THREE.Group();
  shardGroup.name = 'spinningOrb';
  shardGroup.position.y = 1.62;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const shard = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 4), goldMat);
    shard.position.set(Math.cos(a) * 0.26, 0, Math.sin(a) * 0.26);
    shardGroup.add(shard);
  }
  group.add(shardGroup);

  // 6 Grand Wings (Archangel of Apocalypse)
  const makeWingPair = (posY: number, spanX: number, angleZ: number, scaleY: number) => {
    const wPair = new THREE.Group();
    const wL = new THREE.Mesh(new THREE.BoxGeometry(0.04, scaleY, 0.85), wingMat);
    wL.position.set(-spanX, posY, -0.22);
    wL.rotation.set(Math.PI / 12, -Math.PI / 5, angleZ);
    const wR = new THREE.Mesh(new THREE.BoxGeometry(0.04, scaleY, 0.85), wingMat);
    wR.position.set(spanX, posY, -0.22);
    wR.rotation.set(Math.PI / 12, Math.PI / 5, -angleZ);
    wPair.add(wL, wR);
    return wPair;
  };
  group.add(makeWingPair(1.35, 0.62, Math.PI / 8, 1.1)); // Upper wings
  group.add(makeWingPair(1.05, 0.72, 0, 0.95)); // Middle wings
  group.add(makeWingPair(0.75, 0.58, -Math.PI / 8, 0.85)); // Lower wings

  // Floating Grand Ring of Fate (Behind Back)
  const ringOfFate = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.035, 8, 32), goldMat);
  ringOfFate.position.set(0, 1.05, -0.28);
  ringOfFate.name = 'auraRing';
  group.add(ringOfFate);

  // 4 Armored Arms & Weapons:
  // Arm 1 (Upper Right): Blade of Ruin
  const bladeOfRuin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.25, 0.22), obsidianMat);
  bladeOfRuin.position.set(0.56, 0.92, 0.28);
  bladeOfRuin.rotation.set(Math.PI / 8, 0, -Math.PI / 12);
  const bladeGlow = new THREE.Mesh(new THREE.BoxGeometry(0.065, 1.26, 0.04), doomRed);
  bladeGlow.position.copy(bladeOfRuin.position);
  bladeGlow.rotation.copy(bladeOfRuin.rotation);
  group.add(bladeOfRuin, bladeGlow);

  // Arm 2 (Upper Left): Scythe-Staff of Oblivion
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8), goldMat);
  staff.position.set(-0.56, 0.95, 0.22);
  staff.rotation.set(Math.PI / 8, 0, Math.PI / 12);
  const blackOrb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), obsidianMat);
  blackOrb.position.set(-0.68, 1.65, 0.32);
  const orbRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 6, 16), doomRed);
  orbRing.position.copy(blackOrb.position);
  orbRing.name = 'spinningOrb';
  group.add(staff, blackOrb, orbRing);

  // Arm 3 (Lower Right): Channeling a Singularity Fireball
  const fireOrb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), doomRed);
  fireOrb.position.set(0.42, 0.52, 0.35);
  fireOrb.name = 'spinningOrb';
  group.add(fireOrb);

  // Arm 4 (Lower Left): Clawed Void Gauntlet
  const claw = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.2), obsidianMat);
  claw.position.set(-0.42, 0.52, 0.35);
  group.add(claw);
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

// -------------------------------------------------------------
// Training Dummies (Modo Treino)
// -------------------------------------------------------------
function buildTrainingDummyMini(group: THREE.Group, variant: 'standard' | 'armored' | 'mystic' = 'standard') {
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.85, metalness: 0.1 });
  const strawMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.9, metalness: 0.05 });
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.35, metalness: 0.8 });
  const mysticMat = new THREE.MeshStandardMaterial({
    color: 0x818cf8,
    emissive: 0x4f46e5,
    emissiveIntensity: 0.6,
    roughness: 0.3,
  });

  // 1. Central Wood Post anchored to pedestal
  const postGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.75, 10);
  const post = new THREE.Mesh(postGeo, woodMat);
  post.position.y = 0.38;
  post.castShadow = true;
  group.add(post);

  // 2. Horizontal Crossbar (Arms)
  const crossGeo = new THREE.BoxGeometry(0.65, 0.08, 0.08);
  const cross = new THREE.Mesh(crossGeo, woodMat);
  cross.position.set(0, 0.48, 0);
  cross.castShadow = true;
  group.add(cross);

  // 3. Straw Torso Sack around post
  const torsoGeo = new THREE.CylinderGeometry(0.20, 0.16, 0.38, 12);
  const torso = new THREE.Mesh(torsoGeo, strawMat);
  torso.position.y = 0.40;
  torso.castShadow = true;
  group.add(torso);

  // 4. Rope Ties
  const ropeGeo = new THREE.TorusGeometry(0.18, 0.02, 6, 16);
  const ropeTop = new THREE.Mesh(ropeGeo, ropeMat);
  ropeTop.rotation.x = Math.PI / 2;
  ropeTop.position.y = 0.52;
  const ropeBottom = new THREE.Mesh(ropeGeo, ropeMat);
  ropeBottom.rotation.x = Math.PI / 2;
  ropeBottom.position.y = 0.26;
  group.add(ropeTop, ropeBottom);

  // 5. Head (Burlap / Straw sack)
  const headGeo = new THREE.SphereGeometry(0.13, 12, 10);
  const head = new THREE.Mesh(headGeo, strawMat);
  head.position.y = 0.68;
  head.castShadow = true;
  group.add(head);

  // Stitched Eyes (Dark X's)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1c1917 });
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.01), eyeMat);
  eyeL.position.set(-0.05, 0.68, 0.125);
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.01), eyeMat);
  eyeR.position.set(0.05, 0.68, 0.125);
  group.add(eyeL, eyeR);

  if (variant === 'standard') {
    // Red and White Target Bullseye on Torso
    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });

    const targetOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 20), redMat);
    targetOuter.rotation.x = Math.PI / 2;
    targetOuter.position.set(0, 0.40, 0.18);

    const targetWhite = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.025, 18), whiteMat);
    targetWhite.rotation.x = Math.PI / 2;
    targetWhite.position.set(0, 0.40, 0.185);

    const targetCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16), redMat);
    targetCenter.rotation.x = Math.PI / 2;
    targetCenter.position.set(0, 0.40, 0.19);

    group.add(targetOuter, targetWhite, targetCenter);
  } else if (variant === 'armored') {
    // Heavy Steel Plate and Pot Helm
    const chestPlateGeo = new THREE.CylinderGeometry(0.21, 0.17, 0.32, 10, 1, false, 0, Math.PI);
    const plate = new THREE.Mesh(chestPlateGeo, ironMat);
    plate.position.set(0, 0.41, 0.02);
    plate.rotation.y = Math.PI / 2;
    group.add(plate);

    const helmGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.16, 12);
    const helm = new THREE.Mesh(helmGeo, ironMat);
    helm.position.y = 0.72;
    group.add(helm);

    const slitGeo = new THREE.BoxGeometry(0.16, 0.02, 0.04);
    const slit = new THREE.Mesh(slitGeo, new THREE.MeshBasicMaterial({ color: 0x0f172a }));
    slit.position.set(0, 0.71, 0.13);
    group.add(slit);
  } else if (variant === 'mystic') {
    // Glowing Runic Rings & Core
    const ringGeo = new THREE.TorusGeometry(0.28, 0.025, 8, 24);
    const ring = new THREE.Mesh(ringGeo, mysticMat);
    ring.rotation.x = Math.PI / 4;
    ring.position.set(0, 0.45, 0);
    group.add(ring);

    const ring2 = new THREE.Mesh(ringGeo, mysticMat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.position.set(0, 0.45, 0);
    group.add(ring2);

    const runeCoreGeo = new THREE.OctahedronGeometry(0.08, 0);
    const runeCore = new THREE.Mesh(runeCoreGeo, mysticMat);
    runeCore.position.set(0, 0.42, 0.20);
    group.add(runeCore);
  }
}

