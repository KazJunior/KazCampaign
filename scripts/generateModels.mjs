import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// Polyfills for Node.js environment
if (!globalThis.FileReader) {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        if (this.onloadend) this.onloadend({ target: this });
      });
    }
    readAsDataURL(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result =
          'data:' + (blob.type || 'application/octet-stream') + ';base64,' + Buffer.from(buf).toString('base64');
        if (this.onloadend) this.onloadend({ target: this });
      });
    }
  };
}

const outDir = path.resolve('public', 'models');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function exportToGLB(scene, filename) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (gltf) => {
        const filePath = path.join(outDir, filename);
        fs.writeFileSync(filePath, Buffer.from(gltf));
        console.log(`Exported ${filename} (${gltf.byteLength} bytes)`);
        resolve(filePath);
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}

// ============================================================================
// 1. WARRIOR MODEL (High-Detail Low-Poly Knight)
// ============================================================================
function createWarriorScene() {
  const root = new THREE.Group();
  root.name = 'warrior';

  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.45 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x573418, roughness: 0.8 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
  const glowEyeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.4 });

  // Legs & Plated Sabatons
  [-0.11, 0.11].forEach((x) => {
    const greave = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.26, 8), steelMat);
    greave.position.set(x, 0.15, 0);
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), goldMat);
    knee.position.set(x, 0.26, 0.035);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.16), darkMat);
    boot.position.set(x, 0.045, 0.03);
    const toe = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.09, 6), steelMat);
    toe.rotation.x = Math.PI / 2;
    toe.position.set(x, 0.045, 0.12);
    root.add(greave, knee, boot, toe);
  });

  // Torso / Cuirass
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.14, 0.34, 8), steelMat);
  torso.position.y = 0.44;
  const tabard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.36, 0.24), blueMat);
  tabard.position.y = 0.44;
  // Golden Crest Cross on Tabard
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.2, 0.02), goldMat);
  crossV.position.set(0, 0.44, 0.13);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.035, 0.02), goldMat);
  crossH.position.set(0, 0.47, 0.13);
  // Belt
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.055, 10), leatherMat);
  belt.position.y = 0.3;
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.065, 0.02), goldMat);
  buckle.position.set(0, 0.3, 0.15);
  root.add(torso, tabard, crossV, crossH, belt, buckle);

  // Cape (Flowing behind)
  const cape = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.52, 0.03), redMat);
  cape.position.set(0, 0.36, -0.15);
  cape.rotation.x = 0.18;
  root.add(cape);

  // Shoulders (Tiered Pauldrons)
  [-0.24, 0.24].forEach((x) => {
    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), steelMat);
    pauldron.scale.set(1.2, 0.7, 1);
    pauldron.position.set(x, 0.56, 0);
    const trim = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.016, 6, 12), goldMat);
    trim.rotation.x = Math.PI / 2;
    trim.position.set(x, 0.56, 0);
    root.add(pauldron, trim);
  });

  // Arms & Gauntlets
  [-0.22, 0.22].forEach((x) => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.24, 8), steelMat);
    arm.position.set(x, 0.42, 0);
    root.add(arm);
  });

  // Head: Knight Greathelm
  const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.24, 10), steelMat);
  helm.position.y = 0.72;
  const helmDome = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), steelMat);
  helmDome.position.y = 0.84;
  const crown = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.022, 6, 16), goldMat);
  crown.rotation.x = Math.PI / 2;
  crown.position.y = 0.8;
  const visorH = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.04), darkMat);
  visorH.position.set(0, 0.73, 0.13);
  const visorV = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, 0.04), darkMat);
  visorV.position.set(0, 0.69, 0.13);
  const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.018, 0.01), glowEyeMat);
  eyes.position.set(0, 0.73, 0.14);
  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.14, 0.26), redMat);
  crest.position.set(0, 0.94, -0.02);
  crest.rotation.x = -0.15;
  root.add(helm, helmDome, crown, visorH, visorV, eyes, crest);

  // Left Hand: Heater Shield
  const shieldGroup = new THREE.Group();
  shieldGroup.position.set(-0.28, 0.45, 0.13);
  shieldGroup.rotation.y = 0.4;
  const shieldPlate = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.4, 0.03), blueMat);
  const shieldRim = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.02), goldMat);
  shieldRim.position.z = -0.01;
  const shieldBoss = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), steelMat);
  shieldBoss.position.z = 0.025;
  shieldGroup.add(shieldRim, shieldPlate, shieldBoss);
  root.add(shieldGroup);

  // Right Hand: Bastard Sword
  const swordGroup = new THREE.Group();
  swordGroup.position.set(0.28, 0.4, 0.1);
  swordGroup.rotation.x = -0.2;
  swordGroup.rotation.z = -0.1;
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.56, 0.018), steelMat);
  blade.position.y = 0.3;
  const bladeTip = new THREE.Mesh(new THREE.ConeGeometry(0.033, 0.09, 4), steelMat);
  bladeTip.position.y = 0.62;
  const fuller = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.45, 0.02), darkMat);
  fuller.position.y = 0.27;
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.035, 0.045), goldMat);
  guard.position.y = 0.02;
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.13, 8), leatherMat);
  grip.position.y = -0.055;
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), goldMat);
  pommel.position.y = -0.13;
  const gem = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), redMat);
  gem.position.y = -0.13;
  gem.position.z = 0.02;
  swordGroup.add(blade, bladeTip, fuller, guard, grip, pommel, gem);
  root.add(swordGroup);

  return root;
}

// ============================================================================
// 2. ARCHER MODEL (Slender Ranger with Bow Turned to the Left)
// ============================================================================
function createArcherScene() {
  const root = new THREE.Group();
  root.name = 'archer';

  const tunicGreen = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
  const hoodGreen = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 });
  const leatherBrown = new THREE.MeshStandardMaterial({ color: 0x573418, roughness: 0.75 });
  const darkTrousers = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const goldBrass = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.25 });
  const woodBowMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 });
  const stringMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, emissive: 0xffffff, emissiveIntensity: 0.6 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.7 });
  const featherWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const arrowHead = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
  const arrowFletch = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });

  // 1. Ranger Boots & Charcoal Leggings
  [-0.095, 0.095].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.04, 0.25, 8), darkTrousers);
    leg.position.set(x, 0.15, 0);

    const bootCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.08, 8), leatherBrown);
    bootCuff.position.set(x, 0.13, 0);

    const bootFoot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.15), leatherBrown);
    bootFoot.position.set(x, 0.04, 0.03);

    root.add(leg, bootCuff, bootFoot);
  });

  // 2. Forest Emerald Tunic
  const tunic = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.30, 10), tunicGreen);
  tunic.position.y = 0.42;

  // Belt with golden buckle & side pouch
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.05, 10), leatherBrown);
  belt.position.y = 0.29;
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.02), goldBrass);
  buckle.position.set(0, 0.29, 0.145);
  const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.065, 0.035), leatherBrown);
  pouch.position.set(0.13, 0.28, 0.04);
  root.add(tunic, belt, buckle, pouch);

  // 3. Head & Iconic Feathered Hat (Chapéu de Caçador com Pluma)
  const hairBrown = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
  const featherScarlet = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
  const hatGreen = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.55 });

  // Face & Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.092, 12, 10), skinMat);
  head.position.y = 0.65;

  // Hair peeking from beneath the hat
  const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.096, 10, 8), hairBrown);
  hairBack.position.set(0, 0.64, -0.015);
  const hairBangs = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.035, 0.045), hairBrown);
  hairBangs.position.set(0, 0.67, 0.075);

  // The Feathered Hat (Crown + Wide Upturned Hunter's Brim)
  const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.092, 0.085, 12), hatGreen);
  hatCrown.position.set(0, 0.72, 0.005);
  hatCrown.rotation.x = 0.12;

  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.018, 16), hatGreen);
  hatBrim.position.set(0, 0.68, 0.01);
  hatBrim.rotation.x = 0.12;

  // Leather Hatband & Gold Brooch Clasp
  const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.102, 0.102, 0.024, 12), leatherBrown);
  hatBand.position.set(0, 0.70, 0.008);
  hatBand.rotation.x = 0.12;

  const brooch = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), goldBrass);
  brooch.position.set(0.095, 0.70, 0.035);

  // Grand Scarlet Feather Plume (Curving gracefully upward and back)
  const feather = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.26, 0.065), featherScarlet);
  feather.position.set(0.12, 0.84, 0.01);
  feather.rotation.z = -0.38;
  feather.rotation.x = -0.22;

  const featherTip = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.09, 0.055), featherWhite);
  featherTip.position.set(0.14, 0.95, -0.025);
  featherTip.rotation.z = -0.42;
  featherTip.rotation.x = -0.28;

  // Focused Archer Eyes
  const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.018, 0.02), darkTrousers);
  eyes.position.set(0, 0.64, 0.092);

  root.add(head, hairBack, hairBangs, hatCrown, hatBrim, hatBand, brooch, feather, featherTip, eyes);

  // 4. Back Quiver (Clean diagonal position with 3 distinct arrows)
  const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.32, 8), leatherBrown);
  quiver.position.set(0.10, 0.44, -0.14);
  quiver.rotation.z = -0.3;
  quiver.rotation.x = -0.2;
  root.add(quiver);

  // 3 Distinct Arrows in Quiver
  [[-0.014, 0], [0.014, 0], [0, 0.014]].forEach(([ox, oz], i) => {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.24, 4), woodBowMat);
    shaft.position.set(0.10 + ox, 0.58, -0.14 + oz);
    shaft.rotation.z = -0.3;
    shaft.rotation.x = -0.2;

    const fletch = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 4), i === 0 ? arrowFletch : goldBrass);
    fletch.position.set(0.10 + ox, 0.66, -0.14 + oz);
    fletch.rotation.z = -0.3;
    fletch.rotation.x = -0.2;

    root.add(shaft, fletch);
  });

  // 5. Left Arm: Extended to the left (-X) holding the bow
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.22, 8), tunicGreen);
  armL.position.set(-0.22, 0.46, 0);
  armL.rotation.z = Math.PI / 2;
  root.add(armL);

  // 6. The Bow (TURNED TO THE LEFT, FACING LEFT!)
  const bowGroup = new THREE.Group();
  bowGroup.position.set(-0.32, 0.46, 0); // Out on the left flank!
  bowGroup.rotation.y = -Math.PI / 2;   // Bow turned 90 degrees to the left!

  // Single continuous curved stave via TubeGeometry
  const bowCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.36, -0.045),
    new THREE.Vector3(0, -0.18, 0.04),
    new THREE.Vector3(0, 0, 0.06),      // Grip
    new THREE.Vector3(0, 0.18, 0.04),
    new THREE.Vector3(0, 0.36, -0.045),
  ]);
  const bowStave = new THREE.Mesh(new THREE.TubeGeometry(bowCurve, 16, 0.018, 8, false), woodBowMat);

  // Gold tips at ends of bow
  const tipTop = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), goldBrass);
  tipTop.position.set(0, 0.36, -0.045);
  const tipBottom = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), goldBrass);
  tipBottom.position.set(0, -0.36, -0.045);

  // Bowstring (Straight cylinder connecting both tips)
  const bowString = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.72, 4), stringMat);
  bowString.position.set(0, 0, -0.045);

  // Leather Grip at Center
  const bowGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.09, 8), leatherBrown);
  bowGrip.position.set(0, 0, 0.06);

  // Ready Arrow Resting on Bow (Pointing out to the left!)
  const nockedArrow = new THREE.Group();
  const arrowShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.38, 4), woodBowMat);
  arrowShaft.rotation.x = Math.PI / 2;
  arrowShaft.position.set(0, 0, 0.15);

  const nockedHead = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.055, 4), arrowHead);
  nockedHead.rotation.x = Math.PI / 2;
  nockedHead.position.set(0, 0, 0.35);

  const nockedFletching = new THREE.Mesh(new THREE.ConeGeometry(0.017, 0.045, 4), arrowFletch);
  nockedFletching.rotation.x = -Math.PI / 2;
  nockedFletching.position.set(0, 0, -0.035);

  nockedArrow.add(arrowShaft, nockedHead, nockedFletching);
  nockedArrow.position.x = 0.018;

  bowGroup.add(bowStave, tipTop, tipBottom, bowString, bowGrip, nockedArrow);
  root.add(bowGroup);

  // 7. Right Arm: Resting naturally at the belt / hip
  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.034, 0.22, 8), tunicGreen);
  armR.position.set(0.16, 0.42, 0);
  armR.rotation.x = 0.1;
  armR.rotation.z = -0.15;
  const bracerR = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.08, 8), leatherBrown);
  bracerR.position.set(0.18, 0.36, 0.01);
  root.add(armR, bracerR);

  return root;
}

// ============================================================================
// 3. MAGE MODEL (Arcane Wizard with Pointed Hat, Crystal Staff, and Grimoire)
// ============================================================================
function createMageScene() {
  const root = new THREE.Group();
  root.name = 'mage';

  const robeMat = new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.5 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
  const staffWood = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.5,
    roughness: 0.1,
  });
  const bookMat = new THREE.MeshStandardMaterial({ color: 0x831843, roughness: 0.6 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });

  // Flared Wizard Robe (Cone base)
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.56, 10), robeMat);
  robe.position.y = 0.28;
  const hem = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.02, 6, 16), trimMat);
  hem.rotation.x = Math.PI / 2;
  hem.position.y = 0.035;
  root.add(robe, hem);

  // Upper Torso & Arcane Mantle
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.24, 8), robeMat);
  torso.position.y = 0.52;
  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.17), trimMat);
  sash.position.set(0, 0.48, 0.02);
  root.add(torso, sash);

  // Classic Wizard Hat (Wide Brim + Conical Top)
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.025, 16), robeMat);
  brim.position.y = 0.74;
  const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.42, 12), robeMat);
  hatCone.position.set(0, 0.94, -0.04);
  hatCone.rotation.x = -0.22;
  const hatRibbon = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 6, 16), trimMat);
  hatRibbon.rotation.x = Math.PI / 2;
  hatRibbon.position.y = 0.76;
  const hatStar = new THREE.Mesh(new THREE.OctahedronGeometry(0.04), trimMat);
  hatStar.position.set(0, 0.77, 0.15);
  root.add(brim, hatCone, hatRibbon, hatStar);

  // Long Wizard Beard & Face
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 6), whiteMat);
  beard.position.set(0, 0.56, 0.1);
  beard.rotation.x = 0.15;
  root.add(beard);

  // Left Hand: Floating Arcane Grimoire (Spellbook)
  const bookGroup = new THREE.Group();
  bookGroup.position.set(-0.26, 0.44, 0.12);
  bookGroup.rotation.y = 0.5;
  bookGroup.rotation.z = -0.2;
  const bookCover = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.045), bookMat);
  const bookPages = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.035), crystalMat);
  bookGroup.add(bookCover, bookPages);
  root.add(bookGroup);

  // Right Hand: Arcane Crystal Staff
  const staffGroup = new THREE.Group();
  staffGroup.position.set(0.26, 0.42, 0.06);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.027, 0.95, 8), staffWood);
  shaft.position.y = 0.18;
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.016, 6, 12), trimMat);
  ring1.position.y = 0.6;
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.014, 6, 12), trimMat);
  ring2.position.y = 0.72;
  ring2.rotation.x = Math.PI / 3;
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), crystalMat);
  crystal.position.y = 0.73;
  const mote1 = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), crystalMat);
  mote1.position.set(0.09, 0.75, 0);
  const mote2 = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), crystalMat);
  mote2.position.set(-0.07, 0.7, 0.07);
  staffGroup.add(shaft, ring1, ring2, crystal, mote1, mote2);
  root.add(staffGroup);

  return root;
}

// ============================================================================
// 4. CLERIC / HEALER MODEL (NEW DESIGN: Radiant Priestess with Sun Scepter & Holy Chalice)
// ============================================================================
function createClericScene() {
  const root = new THREE.Group();
  root.name = 'cleric';

  const holyWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }); // Pristine pearl white
  const radiantGold = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 }); // Gleaming gold
  const sapphireBlue = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 }); // Sacred sapphire trim
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.7 });
  const goldenHair = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.6 });
  const healingGlow = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.6,
    roughness: 0.1,
  }); // Celestial cyan healing radiance
  const holyChaliceGlow = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xfacc15,
    emissiveIntensity: 1.5,
  });

  // 1. Flowing Holy Vestments Robe
  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.52, 12), holyWhite);
  robe.position.y = 0.26;

  // Front Sapphire & Gold Liturgical Stole
  const stole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.48, 0.02), sapphireBlue);
  stole.position.set(0, 0.28, 0.21);
  const stoleTrim = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.025), radiantGold);
  stoleTrim.position.set(0, 0.06, 0.21);
  root.add(robe, stole, stoleTrim);

  // 2. Upper Torso & Sacred Shoulder Cowl
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.26, 8), holyWhite);
  torso.position.y = 0.55;

  // Graceful shoulder capelet with gold rim
  const cowl = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.12, 10), holyWhite);
  cowl.position.y = 0.62;
  const cowlRim = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.016, 6, 16), radiantGold);
  cowlRim.rotation.x = Math.PI / 2;
  cowlRim.position.y = 0.57;

  // Sun Pendant on Chest
  const sunPendant = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), radiantGold);
  sunPendant.position.set(0, 0.58, 0.18);
  const sunGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.025), healingGlow);
  sunGem.position.set(0, 0.58, 0.21);

  root.add(torso, cowl, cowlRim, sunPendant, sunGem);

  // 3. Head: Gentle Golden Hair crowned with a Divine Radiant Tiara / Halo Circlet
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), skinMat);
  head.position.y = 0.72;

  // Flowing Hair
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.115, 8, 8), goldenHair);
  hair.position.set(0, 0.74, -0.02);
  const hairBraidL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.015, 0.22, 6), goldenHair);
  hairBraidL.position.set(-0.11, 0.62, 0.03);
  const hairBraidR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.015, 0.22, 6), goldenHair);
  hairBraidR.position.set(0.11, 0.62, 0.03);

  // Golden Sun Tiara (Crown with 3 radiant points)
  const tiara = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.018, 6, 16), radiantGold);
  tiara.rotation.x = Math.PI / 2;
  tiara.position.set(0, 0.76, 0.02);
  const crownPoint = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 4), radiantGold);
  crownPoint.position.set(0, 0.83, 0.11);

  // Soft Divine Halo Ring behind the head
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.018, 6, 20), radiantGold);
  halo.position.set(0, 0.8, -0.08);

  root.add(head, hair, hairBraidL, hairBraidR, tiara, crownPoint, halo);

  // 4. Right Hand: The Caduceus Sun Scepter (Staff of Pure Healing)
  const staffGroup = new THREE.Group();
  staffGroup.position.set(0.28, 0.44, 0.08);

  // Golden Staff Shaft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.95, 8), radiantGold);
  shaft.position.y = 0.16;

  // Winged Sun Monstrance at Top
  const sunDisc = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 6, 16), radiantGold);
  sunDisc.position.y = 0.68;

  // 4 Radiant Sunburst Rays
  for (let i = 0; i < 4; i++) {
    const ray = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 4), radiantGold);
    ray.rotation.z = (i * Math.PI) / 2;
    const dist = 0.14;
    ray.position.set(Math.cos((i * Math.PI) / 2) * dist, 0.68 + Math.sin((i * Math.PI) / 2) * dist, 0);
    staffGroup.add(ray);
  }

  // Floating Healing Crystal of Life inside the Sun Disc
  const lifeGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), healingGlow);
  lifeGem.position.set(0, 0.68, 0);

  staffGroup.add(shaft, sunDisc, lifeGem);
  root.add(staffGroup);

  // 5. Left Hand: Golden Holy Chalice / Relic of Renewal (Extended Forward)
  const chaliceGroup = new THREE.Group();
  chaliceGroup.position.set(-0.25, 0.46, 0.15);
  chaliceGroup.rotation.y = 0.3;

  const cupBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.03, 8), radiantGold);
  const cupStem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 6), radiantGold);
  cupStem.position.y = 0.04;
  const cupBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.03, 0.08, 10), radiantGold);
  cupBowl.position.y = 0.1;

  // Radiant Liquid of Renewal inside the cup
  const holyLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.02, 8), holyChaliceGlow);
  holyLiquid.position.y = 0.13;

  chaliceGroup.add(cupBase, cupStem, cupBowl, holyLiquid);
  root.add(chaliceGroup);

  return root;
}

// ============================================================================
// 5. GOBLIN MODEL (Hunched Scavenger with Cleaver and Stink Bomb)
// ============================================================================
function createGoblinScene() {
  const root = new THREE.Group();
  root.name = 'goblin';

  const skinMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.55 });
  const darkSkin = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
  const rustMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, metalness: 0.6, roughness: 0.6 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
  const eyeGlow = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xfacc15,
    emissiveIntensity: 1.6,
    roughness: 0.2,
  });
  const fuseGlow = new THREE.MeshStandardMaterial({
    color: 0xff3b30,
    emissive: 0xff3b30,
    emissiveIntensity: 1.8,
  });

  // Short bent legs (Predator Crouch)
  [-0.1, 0.1].forEach((x) => {
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.18, 6), skinMat);
    thigh.position.set(x, 0.18, 0.035);
    thigh.rotation.x = -0.4;
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.18, 6), skinMat);
    shin.position.set(x, 0.09, -0.025);
    shin.rotation.x = 0.4;
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.045, 0.14), darkSkin);
    foot.position.set(x, 0.025, 0.025);
    root.add(thigh, shin, foot);
  });

  // Hunched Torso
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), skinMat);
  torso.scale.set(1, 1.25, 0.95);
  torso.position.set(0, 0.32, -0.02);
  torso.rotation.x = 0.35;
  const loincloth = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.18), leatherMat);
  loincloth.position.set(0, 0.24, 0);
  root.add(torso, loincloth);

  // Large Goblin Head with Crooked Nose and Long Pointed Ears
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), skinMat);
  head.position.set(0, 0.5, 0.09);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.11, 5), darkSkin);
  nose.rotation.x = 1.3;
  nose.position.set(0, 0.48, 0.22);
  [-0.055, 0.055].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), eyeGlow);
    eye.position.set(x, 0.53, 0.19);
    root.add(eye);
  });
  [-0.15, 0.15].forEach((x, i) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.2, 5), skinMat);
    ear.rotation.z = i === 0 ? 1.2 : -1.2;
    ear.rotation.x = -0.3;
    ear.position.set(x, 0.5, 0.05);
    root.add(ear);
  });
  const scrapCap = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.14, 6), rustMat);
  scrapCap.position.set(0, 0.6, 0.07);
  root.add(head, nose, scrapCap);

  // Stink Bomb on Back (Spherical bomb with burning fuse)
  const bomb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), leatherMat);
  bomb.position.set(0, 0.36, -0.17);
  const fuseCap = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.055, 6), rustMat);
  fuseCap.position.set(0, 0.48, -0.17);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), fuseGlow);
  spark.position.set(0, 0.52, -0.17);
  root.add(bomb, fuseCap, spark);

  // Right Hand: Serrated Rusty Cleaver
  const weapon = new THREE.Group();
  weapon.position.set(0.22, 0.32, 0.15);
  weapon.rotation.x = -0.4;
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.32, 0.016), rustMat);
  blade.position.y = 0.16;
  const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.045, 0.025), rustMat);
  tooth.position.set(0.035, 0.25, 0);
  const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.11, 6), leatherMat);
  weapon.add(blade, tooth, hilt);
  root.add(weapon);

  return root;
}

// ============================================================================
// MAIN GENERATOR EXECUTION
// ============================================================================
async function main() {
  console.log('Generating GLTF / GLB models with improved designs and proportions...');
  await exportToGLB(createWarriorScene(), 'warrior.glb');
  await exportToGLB(createArcherScene(), 'archer.glb');
  await exportToGLB(createMageScene(), 'mage.glb');
  await exportToGLB(createClericScene(), 'cleric.glb');
  await exportToGLB(createGoblinScene(), 'goblin.glb');
  console.log('All 5 models generated and updated successfully in public/models/ !');
}

main().catch((err) => {
  console.error('Generation failed:', err);
  process.exit(1);
});
