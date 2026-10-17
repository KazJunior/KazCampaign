import * as THREE from 'three';
import type { ObstacleType, TerrainType, TileData } from '../types/game';

// --- Deterministic Pseudo-Random Helper based on (x, y) seed ---
function pseudoHash(x: number, y: number, seed = 1337): number {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695040888963407) ^ 0x5bf03635;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ============================================================================
// 1. TERRAIN SYSTEM — LAYERED DIORAMA TILES WITH ORGANIC BIOME DETAILS
// ============================================================================

export function getTerrainBaseColor(terrain: TerrainType, isAlt: boolean): number {
  switch (terrain) {
    case 'grass':
      return isAlt ? 0x2e693b : 0x387d46; // Vibrant forest green variations
    case 'stone':
      return isAlt ? 0x334155 : 0x242e3d; // Slate dungeon flagstones
    case 'sand':
      return isAlt ? 0xc49746 : 0xd4a556; // Warm golden dunes
    case 'dirt':
      return isAlt ? 0x422d20 : 0x4e3526; // Rich fertile earth
    case 'water':
      return isAlt ? 0x1d4ed8 : 0x2563eb; // Deep sapphire cerulean
    case 'swamp':
      return isAlt ? 0x263c2c : 0x2d4834; // Murky mossy marsh
    case 'void':
      return isAlt ? 0x0f0c1b : 0x171228; // Deep stellar obsidian
  }
}

export function createRichTile(tile: TileData, x: number, y: number): THREE.Group {
  const group = new THREE.Group();
  group.name = `tile_${x}_${y}`;

  const isAlt = (x + y) % 2 === 1;
  const hash = pseudoHash(x, y);
  const hash2 = pseudoHash(x, y, 9999);

  const isWater = tile.terrain === 'water';
  const isSwamp = tile.terrain === 'swamp';
  const isVoid = tile.terrain === 'void';
  const isGrass = tile.terrain === 'grass';
  const isStone = tile.terrain === 'stone';
  const isSand = tile.terrain === 'sand';

  // 1.1 Base Foundation Slab (Earthy / Stone bedrock underneath)
  const baseGeo = new THREE.BoxGeometry(0.98, 0.22, 0.98);
  const baseMat = new THREE.MeshStandardMaterial({
    color: isVoid ? 0x090710 : isStone ? 0x1e293b : 0x1f1914,
    roughness: 0.9,
    metalness: 0.05,
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.set(0, -0.11, 0);
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // 1.2 Top Surface Plaque (Biome Layer)
  const surfaceHeight = isWater ? 0.04 : 0.07;
  const surfaceY = isWater ? -0.06 : 0.01;
  const surfaceGeo = new THREE.BoxGeometry(0.94, surfaceHeight, 0.94);

  const surfaceMat = new THREE.MeshStandardMaterial({
    color: getTerrainBaseColor(tile.terrain, isAlt),
    roughness: isWater ? 0.15 : isStone ? 0.65 : 0.85,
    metalness: isWater ? 0.35 : isVoid ? 0.4 : 0.05,
    transparent: isWater,
    opacity: isWater ? 0.86 : 1.0,
  });

  const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
  surfaceMesh.position.set(0, surfaceY, 0);
  surfaceMesh.receiveShadow = true;
  if (isWater) {
    surfaceMesh.name = 'waterSurface';
  }
  group.add(surfaceMesh);

  // 1.3 Micro Surface Props & Details based on Biome
  if (tile.obstacle === 'none') {
    if (isGrass && hash > 0.45) {
      // 3D Stylized Grass Tufts or Tiny Flowers
      const tuftGroup = new THREE.Group();
      const bladeGeo = new THREE.ConeGeometry(0.04, 0.16, 4);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: hash > 0.75 ? 0x4ade80 : 0x38bdf8, // Mostly bright lime grass, sometimes tiny wildflower
        roughness: 0.6,
      });

      const blade1 = new THREE.Mesh(bladeGeo, bladeMat);
      blade1.position.set(-0.15 + hash * 0.3, 0.08, -0.15 + hash2 * 0.3);
      blade1.rotation.z = 0.18;
      tuftGroup.add(blade1);

      const blade2 = new THREE.Mesh(bladeGeo, bladeMat);
      blade2.position.set(blade1.position.x + 0.06, 0.07, blade1.position.z + 0.04);
      blade2.rotation.z = -0.22;
      tuftGroup.add(blade2);

      if (hash > 0.82) {
        // Tiny flower petal
        const flowerGeo = new THREE.DodecahedronGeometry(0.035, 0);
        const flowerMat = new THREE.MeshStandardMaterial({ color: hash2 > 0.5 ? 0xfef08a : 0xf472b6, roughness: 0.3 });
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        flower.position.set(blade1.position.x + 0.03, 0.15, blade1.position.z + 0.02);
        tuftGroup.add(flower);
      }
      group.add(tuftGroup);
    } else if (isStone && hash > 0.6) {
      // Carved Rune / Flagstone Inset
      const runeGeo = new THREE.BoxGeometry(0.35, 0.01, 0.35);
      const runeMat = new THREE.MeshStandardMaterial({
        color: hash > 0.85 ? 0x60a5fa : 0x475569,
        emissive: hash > 0.85 ? 0x3b82f6 : 0x000000,
        emissiveIntensity: hash > 0.85 ? 0.5 : 0,
        roughness: 0.4,
      });
      const rune = new THREE.Mesh(runeGeo, runeMat);
      rune.position.set((hash - 0.5) * 0.3, 0.045, (hash2 - 0.5) * 0.3);
      rune.rotation.y = hash * Math.PI;
      group.add(rune);
    } else if (isSand && hash > 0.65) {
      // Small desert pebble
      const pebbleGeo = new THREE.DodecahedronGeometry(0.05, 0);
      const pebbleMat = new THREE.MeshStandardMaterial({ color: 0x927042, roughness: 0.9 });
      const pebble = new THREE.Mesh(pebbleGeo, pebbleMat);
      pebble.position.set((hash - 0.5) * 0.5, 0.05, (hash2 - 0.5) * 0.5);
      group.add(pebble);
    } else if (isSwamp && hash > 0.55) {
      // Swamp Lilypad or Mud bubble
      const padGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.015, 6);
      const padMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.5 });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set((hash - 0.5) * 0.4, 0.02, (hash2 - 0.5) * 0.4);
      group.add(pad);
    } else if (isVoid) {
      // Pulsing cosmic fissure in the void
      const crackGeo = new THREE.BoxGeometry(0.5, 0.01, 0.06);
      const crackMat = new THREE.MeshStandardMaterial({
        color: 0xc084fc,
        emissive: 0x9333ea,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      const crack = new THREE.Mesh(crackGeo, crackMat);
      crack.position.set((hash - 0.5) * 0.3, 0.045, (hash2 - 0.5) * 0.3);
      crack.rotation.y = hash * Math.PI;
      crack.name = 'voidCrack';
      group.add(crack);
    }
  }

  return group;
}

// ============================================================================
// 2. OBSTACLE SYSTEM — ULTRA-DETAILED STYLIZED 3D PROPS
// ============================================================================

export function createRichObstacle(type: ObstacleType, x: number, y: number): THREE.Group {
  const group = new THREE.Group();
  group.name = `obstacle_${type}_${x}_${y}`;
  const h = pseudoHash(x, y, 777);
  const h2 = pseudoHash(x, y, 888);

  switch (type) {
    case 'tree': {
      // --- Multi-tiered Stylized Pine / Forest Tree ---
      const treeGroup = new THREE.Group();
      treeGroup.name = 'windSway';

      // Roots
      const rootMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.9 });
      for (let i = 0; i < 3; i++) {
        const rootGeo = new THREE.BoxGeometry(0.1, 0.08, 0.28);
        const root = new THREE.Mesh(rootGeo, rootMat);
        root.rotation.y = (i * Math.PI * 2) / 3 + h * 0.5;
        root.position.set(0, 0.04, 0);
        root.castShadow = true;
        treeGroup.add(root);
      }

      // Trunk
      const trunkHeight = 0.65 + h * 0.15;
      const trunkGeo = new THREE.CylinderGeometry(0.1, 0.15, trunkHeight, 7);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 0.85 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = trunkHeight / 2;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // 3 Layers of foliage cones with alternating rotation & scale
      const foliageColors = [0x1f5434, 0x286e43, 0x348553];
      const foliageRadii = [0.46, 0.38, 0.28];
      const foliageHeights = [0.42, 0.38, 0.34];

      let currentY = trunkHeight * 0.65;
      for (let i = 0; i < 3; i++) {
        const fGeo = new THREE.ConeGeometry(foliageRadii[i] * (0.9 + h * 0.2), foliageHeights[i], 7);
        const fMat = new THREE.MeshStandardMaterial({ color: foliageColors[i], roughness: 0.6 });
        const foliage = new THREE.Mesh(fGeo, fMat);
        foliage.position.y = currentY + foliageHeights[i] / 2;
        foliage.rotation.y = (i * 0.7) + h * Math.PI;
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        treeGroup.add(foliage);
        currentY += foliageHeights[i] * 0.65;
      }

      group.add(treeGroup);
      break;
    }

    case 'rock': {
      // --- Natural Faceted Boulder Cluster with Moss & Base Gravel ---
      const rockGroup = new THREE.Group();

      // Main Large Boulder
      const mainGeo = new THREE.DodecahedronGeometry(0.38, 0);
      const rockMat = new THREE.MeshStandardMaterial({
        color: 0x5a6678,
        roughness: 0.8,
        metalness: 0.15,
        flatShading: true,
      });
      const mainRock = new THREE.Mesh(mainGeo, rockMat);
      mainRock.scale.set(1.0 + h * 0.25, 0.85 + h2 * 0.2, 1.1 - h * 0.15);
      mainRock.rotation.set(h * 2, h2 * 3, 0.2);
      mainRock.position.set(0, 0.28, 0);
      mainRock.castShadow = true;
      mainRock.receiveShadow = true;
      rockGroup.add(mainRock);

      // Moss Patch on top of main rock
      const mossGeo = new THREE.DodecahedronGeometry(0.24, 0);
      const mossMat = new THREE.MeshStandardMaterial({ color: 0x3d7045, roughness: 0.75, flatShading: true });
      const moss = new THREE.Mesh(mossGeo, mossMat);
      moss.position.set(0.04, 0.44, 0.02);
      moss.scale.set(1.1, 0.4, 1.0);
      rockGroup.add(moss);

      // Secondary Companion Rock
      const subRockGeo = new THREE.DodecahedronGeometry(0.2, 0);
      const subRock = new THREE.Mesh(subRockGeo, rockMat);
      subRock.position.set(0.28, 0.14, -0.15);
      subRock.scale.set(1.1, 0.8, 0.9);
      subRock.castShadow = true;
      rockGroup.add(subRock);

      // Tiny Tertiary Pebble
      const pebbleGeo = new THREE.DodecahedronGeometry(0.12, 0);
      const pebble = new THREE.Mesh(pebbleGeo, rockMat);
      pebble.position.set(-0.24, 0.08, 0.22);
      pebble.castShadow = true;
      rockGroup.add(pebble);

      group.add(rockGroup);
      break;
    }

    case 'ruins': {
      // --- Ancient Crumbling Corinthian Column with Fallen Slab & Ivy Vines ---
      const ruinsGroup = new THREE.Group();

      // Carved Pedestal Base
      const baseGeo = new THREE.BoxGeometry(0.55, 0.18, 0.55);
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x788599, roughness: 0.65, flatShading: true });
      const base = new THREE.Mesh(baseGeo, stoneMat);
      base.position.y = 0.09;
      base.castShadow = true;
      base.receiveShadow = true;
      ruinsGroup.add(base);

      // Fractured Column Shaft (cut at an angle)
      const columnGeo = new THREE.CylinderGeometry(0.19, 0.22, 0.75, 10);
      const column = new THREE.Mesh(columnGeo, stoneMat);
      column.position.set(-0.04, 0.52, -0.04);
      column.rotation.z = -0.08;
      column.castShadow = true;
      ruinsGroup.add(column);

      // Fallen Cracked Capital on the ground
      const fallenGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 8);
      const fallen = new THREE.Mesh(fallenGeo, stoneMat);
      fallen.position.set(0.24, 0.14, 0.2);
      fallen.rotation.set(Math.PI / 2.3, 0, 0.4);
      fallen.castShadow = true;
      ruinsGroup.add(fallen);

      // Creeping Green Ivy Vine wrapping the column
      const ivyMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
      for (let i = 0; i < 4; i++) {
        const leafGeo = new THREE.BoxGeometry(0.08, 0.08, 0.02);
        const leaf = new THREE.Mesh(leafGeo, ivyMat);
        leaf.position.set(-0.16 + (i % 2) * 0.12, 0.25 + i * 0.12, -0.08 + (i % 3) * 0.08);
        leaf.rotation.set(0.2, i * 1.1, 0.4);
        ruinsGroup.add(leaf);
      }

      group.add(ruinsGroup);
      break;
    }

    case 'pillar': {
      // --- Grand Classical Temple Pillar with Capital & Pedestal ---
      const pillarGroup = new THREE.Group();
      const marbleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5, flatShading: true });

      // Plinth (Base)
      const plinthGeo = new THREE.BoxGeometry(0.56, 0.16, 0.56);
      const plinth = new THREE.Mesh(plinthGeo, marbleMat);
      plinth.position.y = 0.08;
      plinth.castShadow = true;
      pillarGroup.add(plinth);

      // Fluted Shaft
      const shaftGeo = new THREE.CylinderGeometry(0.19, 0.21, 1.1, 12);
      const shaft = new THREE.Mesh(shaftGeo, marbleMat);
      shaft.position.y = 0.7;
      shaft.castShadow = true;
      pillarGroup.add(shaft);

      // Ornate Capital (Crown)
      const capGeo = new THREE.BoxGeometry(0.5, 0.16, 0.5);
      const cap = new THREE.Mesh(capGeo, marbleMat);
      cap.position.y = 1.32;
      cap.castShadow = true;
      pillarGroup.add(cap);

      group.add(pillarGroup);
      break;
    }

    case 'shrine': {
      // --- Arcane Altar with Hovering & Spinning Amethyst Crystal & Rune Ring ---
      const shrineGroup = new THREE.Group();

      // Step 1: Lower Octagonal Stone Dais
      const step1Geo = new THREE.CylinderGeometry(0.48, 0.52, 0.14, 8);
      const daisMat = new THREE.MeshStandardMaterial({ color: 0x33264e, roughness: 0.65 });
      const step1 = new THREE.Mesh(step1Geo, daisMat);
      step1.position.y = 0.07;
      step1.castShadow = true;
      shrineGroup.add(step1);

      // Step 2: Pedestal Altar with Carved Glyphs
      const pedGeo = new THREE.BoxGeometry(0.4, 0.38, 0.4);
      const pedMat = new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.4 });
      const ped = new THREE.Mesh(pedGeo, pedMat);
      ped.position.y = 0.3;
      ped.castShadow = true;
      shrineGroup.add(ped);

      // 4 Corner Small Obelisks
      const cornerGeo = new THREE.BoxGeometry(0.08, 0.32, 0.08);
      const cornerMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.3 });
      const offsets = [
        [-0.24, -0.24],
        [0.24, -0.24],
        [-0.24, 0.24],
        [0.24, 0.24],
      ];
      offsets.forEach(([ox, oz]) => {
        const pillar = new THREE.Mesh(cornerGeo, cornerMat);
        pillar.position.set(ox, 0.28, oz);
        shrineGroup.add(pillar);
      });

      // Hovering Floating Arcane Crystal (Amethyst Gem)
      const crystalGeo = new THREE.OctahedronGeometry(0.2, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xc084fc,
        emissive: 0xa855f7,
        emissiveIntensity: 0.95,
        roughness: 0.15,
        metalness: 0.4,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 0.78;
      crystal.name = 'shrineCrystal';
      shrineGroup.add(crystal);

      // Spinning Magical Rune Ring around the crystal
      const ringGeo = new THREE.TorusGeometry(0.28, 0.015, 6, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xe9d5ff });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.78;
      ring.rotation.x = Math.PI / 2.8;
      ring.name = 'shrineRuneRing';
      shrineGroup.add(ring);

      // Subtle Point Light illuminating the shrine
      const shrineLight = new THREE.PointLight(0xa855f7, 0.9, 3.5);
      shrineLight.position.set(0, 0.85, 0);
      shrineGroup.add(shrineLight);

      group.add(shrineGroup);
      break;
    }

    case 'wall': {
      // --- Fortified Castle Battlement Wall with Crenellations & Torch ---
      const wallGroup = new THREE.Group();
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, flatShading: true });

      // Main Solid Wall Block
      const wallBlockGeo = new THREE.BoxGeometry(0.94, 0.76, 0.94);
      const wallBlock = new THREE.Mesh(wallBlockGeo, wallMat);
      wallBlock.position.y = 0.38;
      wallBlock.castShadow = true;
      wallBlock.receiveShadow = true;
      wallGroup.add(wallBlock);

      // Top Crenellations (Parapeitos dentados)
      const crenMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.75 });
      const crenGeo = new THREE.BoxGeometry(0.26, 0.18, 0.26);
      const crenPositions = [
        [-0.32, -0.32],
        [0.32, -0.32],
        [-0.32, 0.32],
        [0.32, 0.32],
      ];
      crenPositions.forEach(([cx, cz]) => {
        const cren = new THREE.Mesh(crenGeo, crenMat);
        cren.position.set(cx, 0.82, cz);
        cren.castShadow = true;
        wallGroup.add(cren);
      });

      // Wooden Beam Brace across the front
      const beamGeo = new THREE.BoxGeometry(0.96, 0.1, 0.08);
      const beamMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(0, 0.42, 0.47);
      wallGroup.add(beam);

      // Wall-mounted Iron Torch with Glowing Flame
      const torchHolderGeo = new THREE.BoxGeometry(0.04, 0.16, 0.08);
      const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
      const torchHolder = new THREE.Mesh(torchHolderGeo, ironMat);
      torchHolder.position.set(0, 0.52, 0.51);
      wallGroup.add(torchHolder);

      // Animated Torch Flame
      const flameGeo = new THREE.DodecahedronGeometry(0.06, 0);
      const flameMat = new THREE.MeshStandardMaterial({
        color: 0xffedd5,
        emissive: 0xf97316,
        emissiveIntensity: 1.2,
      });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(0, 0.62, 0.54);
      flame.name = 'torchFlame';
      wallGroup.add(flame);

      group.add(wallGroup);
      break;
    }

    case 'thorns': {
      // --- Dense Bramble Thicket with Sharp Spines & Poisonous Spores ---
      const thornGroup = new THREE.Group();
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x2e180d, roughness: 0.9 });
      const spineMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
      const berryMat = new THREE.MeshStandardMaterial({
        color: 0xd946ef,
        emissive: 0x9333ea,
        emissiveIntensity: 0.7,
      });

      // Tangled briar stems
      for (let i = 0; i < 4; i++) {
        const stemGeo = new THREE.CylinderGeometry(0.04, 0.07, 0.55, 5);
        const stem = new THREE.Mesh(stemGeo, woodMat);
        stem.position.set((i % 2 - 0.5) * 0.25, 0.24, (Math.floor(i / 2) - 0.5) * 0.25);
        stem.rotation.set((h - 0.5) * 0.5, i * 1.5, (h2 - 0.5) * 0.5);
        stem.castShadow = true;
        thornGroup.add(stem);

        // Sharp thorns projecting outward
        for (let j = 0; j < 3; j++) {
          const spineGeo = new THREE.ConeGeometry(0.03, 0.14, 4);
          const spine = new THREE.Mesh(spineGeo, spineMat);
          spine.position.set(stem.position.x + 0.06 * (j - 1), 0.15 + j * 0.12, stem.position.z + 0.05);
          spine.rotation.set(0.6 * j, j * 2.0, 0.4);
          thornGroup.add(spine);
        }

        // Toxic purple berry at tip
        const berryGeo = new THREE.SphereGeometry(0.04, 5, 5);
        const berry = new THREE.Mesh(berryGeo, berryMat);
        berry.position.set(stem.position.x, 0.48, stem.position.z);
        thornGroup.add(berry);
      }

      group.add(thornGroup);
      break;
    }

    case 'tombstone': {
      // --- Weathered Gothic Gravestone with Celtic Cross & Fresh Grave Soil ---
      const tombGroup = new THREE.Group();

      // Earth Mound
      const moundGeo = new THREE.BoxGeometry(0.5, 0.08, 0.7);
      const moundMat = new THREE.MeshStandardMaterial({ color: 0x2b1d14, roughness: 0.95 });
      const mound = new THREE.Mesh(moundGeo, moundMat);
      mound.position.set(0, 0.04, 0.05);
      tombGroup.add(mound);

      // Gothic Headstone Slab (weathered & slightly tilted)
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8, flatShading: true });
      const headstoneGeo = new THREE.BoxGeometry(0.42, 0.65, 0.14);
      const headstone = new THREE.Mesh(headstoneGeo, stoneMat);
      headstone.position.set(0, 0.38, -0.18);
      headstone.rotation.set(0.06, 0.08, -0.04);
      headstone.castShadow = true;
      tombGroup.add(headstone);

      // Arched Top of Tombstone
      const archGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.14, 8);
      const arch = new THREE.Mesh(archGeo, stoneMat);
      arch.position.set(headstone.position.x, 0.7, headstone.position.z);
      arch.rotation.z = Math.PI / 2;
      arch.rotation.x = 0.06;
      arch.castShadow = true;
      tombGroup.add(arch);

      // Carved Emblem / Cross on the front face
      const crossMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.02), crossMat);
      crossV.position.set(headstone.position.x, 0.45, headstone.position.z + 0.08);
      tombGroup.add(crossV);

      const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.02), crossMat);
      crossH.position.set(headstone.position.x, 0.49, headstone.position.z + 0.08);
      tombGroup.add(crossH);

      group.add(tombGroup);
      break;
    }

    default:
      break;
  }

  return group;
}

// ============================================================================
// 3. DIORAMA PERIMETER BASE — TABLETOP WOODEN/STONE SLAB SURROUNDING BOARD
// ============================================================================

export function createDioramaPerimeter(gridWidth: number, gridHeight: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'dioramaPerimeter';

  const margin = 0.55;
  const totalW = gridWidth + margin * 2;
  const totalH = gridHeight + margin * 2;
  const centerX = gridWidth / 2;
  const centerZ = gridHeight / 2;

  // 3.1 Deep Beveled Bedrock Island Foundation
  const foundationHeight = 1.1;
  const foundGeo = new THREE.BoxGeometry(totalW, foundationHeight, totalH);
  const foundMat = new THREE.MeshStandardMaterial({
    color: 0x111622,
    roughness: 0.9,
    metalness: 0.1,
  });
  const foundation = new THREE.Mesh(foundGeo, foundMat);
  foundation.position.set(centerX, -foundationHeight / 2 - 0.05, centerZ);
  foundation.receiveShadow = true;
  group.add(foundation);

  // 3.2 Polished Brass / Dark Walnut Rim Border Frame
  const rimThickness = 0.16;
  const rimHeight = 0.28;
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x221a14, // Dark mahogany / antique brass trim
    roughness: 0.6,
    metalness: 0.25,
  });

  // Top & Bottom Border Bars
  const hBarGeo = new THREE.BoxGeometry(totalW, rimHeight, rimThickness);
  const topBar = new THREE.Mesh(hBarGeo, rimMat);
  topBar.position.set(centerX, -0.05, -margin / 2);
  group.add(topBar);

  const bottomBar = new THREE.Mesh(hBarGeo, rimMat);
  bottomBar.position.set(centerX, -0.05, gridHeight + margin / 2);
  group.add(bottomBar);

  // Left & Right Border Bars
  const vBarGeo = new THREE.BoxGeometry(rimThickness, rimHeight, gridHeight);
  const leftBar = new THREE.Mesh(vBarGeo, rimMat);
  leftBar.position.set(-margin / 2, -0.05, centerZ);
  group.add(leftBar);

  const rightBar = new THREE.Mesh(vBarGeo, rimMat);
  rightBar.position.set(gridWidth + margin / 2, -0.05, centerZ);
  group.add(rightBar);

  // 3.3 Ornate Gilded Corner Brackets (Bronze Corner Guards)
  const cornerGeo = new THREE.BoxGeometry(0.32, 0.32, 0.32);
  const cornerMat = new THREE.MeshStandardMaterial({
    color: 0xd4ad65,
    roughness: 0.35,
    metalness: 0.75,
  });

  const corners = [
    [-margin / 2, -margin / 2],
    [gridWidth + margin / 2, -margin / 2],
    [-margin / 2, gridHeight + margin / 2],
    [gridWidth + margin / 2, gridHeight + margin / 2],
  ];

  corners.forEach(([cx, cz]) => {
    const corner = new THREE.Mesh(cornerGeo, cornerMat);
    corner.position.set(cx, -0.03, cz);
    corner.castShadow = true;
    group.add(corner);
  });

  return group;
}

// ============================================================================
// 4. AMBIENT ATMOSPHERIC MOTES — FLOATING DUST & GOLDEN EMBERS
// ============================================================================

export function createAmbientMotes(gridWidth: number, gridHeight: number, count = 48): THREE.Points {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = Math.random() * (gridWidth + 2) - 1;
    positions[i * 3 + 1] = 0.5 + Math.random() * 3.5;
    positions[i * 3 + 2] = Math.random() * (gridHeight + 2) - 1;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xfde68a,
    size: 0.08,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  points.name = 'ambientMotes';
  return points;
}

// ============================================================================
// 5. RENDER LOOP UPDATE HOOK FOR ENVIRONMENT ASSETS
// ============================================================================

export function updateEnvironmentAnimations(scene: THREE.Scene, time: number): void {
  scene.traverse((obj) => {
    if (obj.name === 'windSway') {
      // Gentle breeze swaying tree crowns
      obj.rotation.z = Math.sin(time * 1.5 + obj.position.x * 2) * 0.03;
      obj.rotation.x = Math.cos(time * 1.2 + obj.position.z * 2) * 0.02;
    } else if (obj.name === 'shrineCrystal') {
      // Hovering amethyst gemstone
      obj.rotation.y += 0.025;
      obj.rotation.x = Math.sin(time * 2) * 0.1;
      obj.position.y = 0.78 + Math.sin(time * 2.5) * 0.05;
    } else if (obj.name === 'shrineRuneRing') {
      // Counter-rotating magical rune ring
      obj.rotation.z -= 0.03;
    } else if (obj.name === 'torchFlame') {
      // Dynamic flickering torch flame
      const flicker = 1.0 + Math.sin(time * 18) * 0.15 + (Math.random() - 0.5) * 0.08;
      obj.scale.set(flicker, flicker * 1.15, flicker);
    } else if (obj.name === 'waterSurface') {
      // Gentle ocean shimmer
      const mesh = obj as THREE.Mesh;
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.opacity = 0.82 + Math.sin(time * 2.2 + obj.position.x) * 0.08;
      }
    } else if (obj.name === 'voidCrack') {
      // Pulsing cosmic fissure
      const mesh = obj as THREE.Mesh;
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.emissiveIntensity = 0.7 + Math.sin(time * 3 + obj.position.x) * 0.35;
      }
    } else if (obj.name === 'ambientMotes') {
      // Drifting atmospheric dust motes
      const points = obj as THREE.Points;
      const pos = points.geometry.attributes.position;
      const count = pos.count;
      for (let i = 0; i < count; i++) {
        let y = pos.getY(i) + Math.sin(time + i) * 0.003;
        if (y > 4.5) y = 0.5;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
      points.rotation.y = time * 0.015;
    }
  });
}
