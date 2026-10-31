import * as THREE from 'three';
import type { Unit } from '../types/game';
import { getSkinById } from '../data/classQuests';

/**
 * Aplica a paleta de cores e o brilho característicos da Skin equipada
 * aos componentes procedurais da miniatura 3D (roupas, armaduras, mantos e lâminas).
 */
export function applySkinThemeToMiniature(charMesh: THREE.Group, unit: Unit): void {
  if (unit.faction !== 'player' || !unit.skinId) return;
  const skin = getSkinById(unit.skinId);
  if (!skin) return;

  const isDefault = unit.skinId.endsWith('_default');
  if (isDefault) return; // Skins padrão usam as cores nativas originais de classe

  const skinColor = new THREE.Color(skin.color);
  const glowColor = new THREE.Color(skin.accentGlow);

  charMesh.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      const updatedMats = mats.map((mat) => {
        if (!(mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial)) {
          return mat;
        }

        const cloned = mat.clone();
        const hex = cloned.color.getHex();

        // Preservar cor de pele / olhos / boca para não descaracterizar a face
        const isFleshOrFace =
          hex === 0xfde68a ||
          hex === 0xfcd34d ||
          hex === 0xd4a373 ||
          hex === 0xfbb6ce ||
          hex === 0xfecdd3 ||
          (hex === 0x000000 && child.geometry instanceof THREE.SphereGeometry && child.scale.x < 0.1) ||
          (hex === 0xffffff && child.geometry instanceof THREE.SphereGeometry && child.scale.x < 0.1);

        if (isFleshOrFace) return cloned;

        if (cloned instanceof THREE.MeshStandardMaterial) {
          const isMetal = cloned.metalness >= 0.45;
          const isClothOrArmor = cloned.roughness >= 0.2;

          // Customização especializada por tema de skin
          if (skin.id === 'guerreiro_obsidiana') {
            if (isMetal) {
              cloned.color.setHex(0x1a162b);
              cloned.metalness = 0.85;
              cloned.roughness = 0.25;
            } else {
              cloned.color.copy(skinColor);
            }
          } else if (skin.id === 'guerreiro_imperial') {
            if (isMetal) {
              cloned.color.setHex(0xf59e0b); // Dourado imperial
              cloned.metalness = 0.9;
            } else {
              cloned.color.copy(skinColor); // Carmesim imperial
            }
          } else if (skin.id === 'carrasco_samurai') {
            if (isMetal) {
              cloned.color.setHex(0x18181b); // Aço laqueado negro
              cloned.metalness = 0.75;
            } else {
              cloned.color.copy(skinColor);
            }
          } else if (skin.id === 'assassino_fantasma') {
            cloned.color.copy(skinColor);
            cloned.transparent = true;
            cloned.opacity = 0.88;
          } else {
            // Theming padrão para as demais skins épicas e lendárias
            if (isClothOrArmor) {
              cloned.color.copy(skinColor);
            } else if (isMetal) {
              cloned.color.lerp(glowColor, 0.45);
            }
          }

          // Se o material tem brilho emissivo, sintoniza com o accentGlow da skin
          if (cloned.emissive && cloned.emissive.getHex() > 0) {
            cloned.emissive.copy(glowColor);
            cloned.emissiveIntensity = 0.85;
          }
        } else if (cloned instanceof THREE.MeshBasicMaterial) {
          cloned.color.copy(skinColor);
        }

        return cloned;
      });

      child.material = Array.isArray(child.material) ? updatedMats : updatedMats[0];
    }
  });
}

/**
 * Cria adornos luminosos no pedestal para heróis usando skins épicas ou lendárias.
 */
export function createSkinPedestalAccent(unit: Unit): THREE.Group | null {
  if (unit.faction !== 'player' || !unit.skinId || unit.skinId.endsWith('_default')) {
    return null;
  }
  const skin = getSkinById(unit.skinId);
  if (!skin) return null;

  const group = new THREE.Group();
  group.name = 'skinPedestalAccent';

  const glowColor = new THREE.Color(skin.accentGlow).getHex();
  const isLegendary = skin.rarity === 'legendary';
  const radius = 0.38;
  const height = 0.075;

  // Anel rúnico emissivo interno
  const ringGeo = new THREE.TorusGeometry(radius * 0.88, 0.012, 6, 24);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshStandardMaterial({
    color: glowColor,
    emissive: glowColor,
    emissiveIntensity: isLegendary ? 1.0 : 0.75,
    roughness: 0.15,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.y = height + 0.003;
  group.add(ringMesh);

  // Marcadores de prestígio nos 4 pontos cardeais para skins lendárias
  if (isLegendary) {
    const pipGeo = new THREE.BoxGeometry(0.045, 0.015, 0.045);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const pip = new THREE.Mesh(pipGeo, ringMat);
      pip.position.set(Math.cos(angle) * (radius * 0.94), height + 0.004, Math.sin(angle) * (radius * 0.94));
      pip.rotation.y = angle;
      group.add(pip);
    }
  }

  return group;
}

/**
 * Cria itens visuais 3D dedicados (asas, halos, ombreiras pontiagudas, orbes orbitantes,
 * coroas, mantos e auras místicas) específicos para cada Skin de herói.
 */
export function createSkinVisualFeatures3D(unit: Unit): THREE.Group | null {
  if (unit.faction !== 'player' || !unit.skinId || unit.skinId.endsWith('_default')) {
    return null;
  }
  const skin = getSkinById(unit.skinId);
  if (!skin) return null;

  const skinGroup = new THREE.Group();
  skinGroup.name = 'skinVisualGroup';

  const skinColorHex = new THREE.Color(skin.color).getHex();
  const glowColorHex = new THREE.Color(skin.accentGlow).getHex();

  const glowMat = new THREE.MeshStandardMaterial({
    color: glowColorHex,
    emissive: glowColorHex,
    emissiveIntensity: 0.95,
    roughness: 0.2,
  });

  const skinThemeMat = new THREE.MeshStandardMaterial({
    color: skinColorHex,
    metalness: 0.5,
    roughness: 0.35,
  });

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.6,
    metalness: 0.85,
    roughness: 0.2,
  });

  const sId = skin.id;

  // =========================================================================
  // 1. GUERREIRO
  // =========================================================================
  if (sId === 'guerreiro_obsidiana') {
    // Ombreiras de obsidiana pontiagudas com runas violetas
    const obsidianMat = new THREE.MeshStandardMaterial({ color: 0x181824, metalness: 0.8, roughness: 0.2 });
    for (const side of [-1, 1]) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.16, 5), obsidianMat);
      spike.position.set(side * 0.25, 0.54, 0);
      spike.rotation.z = -side * 0.5;
      const runeR = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), glowMat);
      runeR.position.set(side * 0.23, 0.58, 0);
      skinGroup.add(spike, runeR);
    }
    // Shards de obsidiana orbitando o escudo
    const orbit = new THREE.Group();
    orbit.name = 'skinOrbit';
    orbit.position.set(-0.25, 0.42, 0.1);
    for (let i = 0; i < 2; i++) {
      const angle = (i / 2) * Math.PI * 2;
      const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.032), glowMat);
      shard.position.set(Math.cos(angle) * 0.16, 0, Math.sin(angle) * 0.16);
      orbit.add(shard);
    }
    skinGroup.add(orbit);
  } else if (sId === 'guerreiro_imperial') {
    // Capa carmesim imperial com detalhes em ouro nas costas
    const capeGeo = new THREE.BoxGeometry(0.26, 0.38, 0.018);
    const capeMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.5 });
    const cape = new THREE.Mesh(capeGeo, capeMat);
    cape.position.set(0, 0.34, -0.13);
    cape.rotation.x = 0.16;
    skinGroup.add(cape);

    // Crista / pluma vermelha-dourada imperial no topo do elmo
    const plume = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.14, 0.18), goldTrimMat);
    plume.position.set(0, 0.78, 0.02);
    skinGroup.add(plume);

    // Coroa de louros dourada flutuando
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.014, 6, 18), goldTrimMat);
    halo.name = 'skinHalo';
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, 0.85, 0);
    skinGroup.add(halo);
  }

  // =========================================================================
  // 2. ARQUEIRO
  // =========================================================================
  else if (sId === 'arqueiro_silvestre') {
    // Manto de folhagens esmeralda nas costas
    const leafMantle = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.02), skinThemeMat);
    leafMantle.position.set(0, 0.36, -0.12);
    leafMantle.rotation.x = 0.14;
    skinGroup.add(leafMantle);

    // Motes verdes florestais orbitando o arco
    const orbit = new THREE.Group();
    orbit.name = 'skinOrbit';
    orbit.position.set(-0.25, 0.44, 0.15);
    for (let i = 0; i < 2; i++) {
      const angle = (i / 2) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.TetrahedronGeometry(0.028), glowMat);
      leaf.position.set(Math.cos(angle) * 0.15, 0, Math.sin(angle) * 0.15);
      orbit.add(leaf);
    }
    skinGroup.add(orbit);
  } else if (sId === 'arqueiro_estelar') {
    // Asas etéreas celestes estelares nas costas
    const starWingMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.85,
    });
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.015), starWingMat);
      wing.position.set(side * 0.16, 0.48, -0.12);
      wing.rotation.set(0.1, side * 0.25, -side * 0.35);
      skinGroup.add(wing);
    }
    // Esferas estelares celestes orbitando
    const orbit = new THREE.Group();
    orbit.name = 'skinOrbit';
    orbit.position.set(0, 0.52, 0);
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), glowMat);
      star.position.set(Math.cos(angle) * 0.28, 0, Math.sin(angle) * 0.28);
      orbit.add(star);
    }
    skinGroup.add(orbit);
  }

  // =========================================================================
  // 3. MAGO
  // =========================================================================
  else if (sId === 'mago_cinzas') {
    // Brasas e espinhos de basalto incandescente nos ombros
    const basaltMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.6 });
    for (const side of [-1, 1]) {
      const rock = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 5), basaltMat);
      rock.position.set(side * 0.24, 0.52, 0);
      rock.rotation.z = -side * 0.45;
      const ember = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), glowMat);
      ember.position.set(side * 0.24, 0.56, 0);
      skinGroup.add(rock, ember);
    }
    // Orbe de magma orbitando o cajado
    const orbit = new THREE.Group();
    orbit.name = 'skinOrbit';
    orbit.position.set(0.26, 0.72, 0.12);
    const magmaOrb = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 8), glowMat);
    magmaOrb.position.set(0.12, 0, 0);
    orbit.add(magmaOrb);
    skinGroup.add(orbit);
  } else if (sId === 'mago_primordial') {
    // Disco solar radiante com raios flamejantes atrás da cabeça
    const sunHalo = new THREE.Group();
    sunHalo.name = 'skinHalo';
    sunHalo.position.set(0, 0.68, -0.1);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.018, 8, 24), glowMat);
    sunHalo.add(ring);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const ray = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.08, 4), glowMat);
      ray.position.set(Math.cos(angle) * 0.18, Math.sin(angle) * 0.18, 0);
      ray.rotation.z = angle - Math.PI / 2;
      sunHalo.add(ray);
    }
    skinGroup.add(sunHalo);

    // Orbe solar flamejante no topo do cajado
    const miniSun = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), glowMat);
    miniSun.position.set(0.26, 0.78, 0.12);
    skinGroup.add(miniSun);
  }

  // =========================================================================
  // 4. CURANDEIRO
  // =========================================================================
  else if (sId === 'curandeiro_aurora') {
    // Auréola da aurora matinal dourada flutuando sobre a cabeça
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.018, 8, 24), glowMat);
    halo.name = 'skinHalo';
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, 0.82, 0);
    skinGroup.add(halo);

    // Gema da alvorada flutuando sobre o báculo
    const dawnGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.038), glowMat);
    dawnGem.position.set(0.25, 0.74, 0.12);
    skinGroup.add(dawnGem);
  } else if (sId === 'curandeiro_celeste') {
    // Asas de anjo celestes translúcidas
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.82,
    });
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.015), wingMat);
      wing.position.set(side * 0.18, 0.48, -0.14);
      wing.rotation.set(0.12, side * 0.28, -side * 0.4);
      skinGroup.add(wing);
    }
    // Auréola celestial
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.016, 8, 24), glowMat);
    halo.name = 'skinHalo';
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, 0.84, 0);
    skinGroup.add(halo);

    // Orbes de cura orbitando
    const orbit = new THREE.Group();
    orbit.name = 'skinOrbit';
    orbit.position.set(0, 0.5, 0);
    for (let i = 0; i < 2; i++) {
      const angle = (i / 2) * Math.PI * 2;
      const healOrb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), glowMat);
      healOrb.position.set(Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3);
      orbit.add(healOrb);
    }
    skinGroup.add(orbit);
  }

  // =========================================================================
  // 5. ASSASSINO
  // =========================================================================
  else if (sId === 'assassino_fantasma') {
    // Cauda de fumaça / névoa espectral ciano translúcida
    const mistMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.7,
    });
    const mistTail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.36, 6), mistMat);
    mistTail.position.set(0, 0.26, -0.12);
    mistTail.rotation.x = -0.35;
    skinGroup.add(mistTail);

    // Wisps de almas fantasmagóricas orbitando
    const orbit = new THREE.Group();
    orbit.name = 'skinOrbit';
    orbit.position.set(0, 0.46, 0);
    for (let i = 0; i < 2; i++) {
      const angle = (i / 2) * Math.PI * 2;
      const wisp = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), glowMat);
      wisp.position.set(Math.cos(angle) * 0.26, 0, Math.sin(angle) * 0.26);
      orbit.add(wisp);
    }
    skinGroup.add(orbit);
  } else if (sId === 'assassino_eclipse') {
    // Anel do eclipse sombrio flutuando nas costas com corona violeta
    const eclipseHalo = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.022, 8, 24), glowMat);
    eclipseHalo.name = 'skinHalo';
    eclipseHalo.position.set(0, 0.52, -0.14);
    skinGroup.add(eclipseHalo);

    // Fitas de sombra nas costas
    for (const side of [-1, 1]) {
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 0.012), skinThemeMat);
      ribbon.position.set(side * 0.12, 0.32, -0.13);
      ribbon.rotation.set(0.15, 0, side * 0.2);
      skinGroup.add(ribbon);
    }
  }

  // =========================================================================
  // 6. CAVALEIRO ARCANO
  // =========================================================================
  else if (sId === 'cavaleiro_arcano_astral') {
    // Disco rúnico astral azul cobalto nas costas
    const astralDisc = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.016, 8, 24), glowMat);
    astralDisc.name = 'skinHalo';
    astralDisc.position.set(0, 0.5, -0.14);
    skinGroup.add(astralDisc);

    // Ombreiras com espinhos de tempestade azul
    for (const side of [-1, 1]) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15, 5), glowMat);
      spike.position.set(side * 0.25, 0.54, 0);
      spike.rotation.z = -side * 0.5;
      skinGroup.add(spike);
    }
  } else if (sId === 'cavaleiro_arcano_vazio') {
    // Cristal de fenda abissal violeta flutuando entre os ombros
    const riftCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.048), glowMat);
    riftCrystal.position.set(0, 0.58, -0.12);
    skinGroup.add(riftCrystal);

    // Chifres de fenda dimensional no elmo
    for (const side of [-1, 1]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 5), glowMat);
      horn.position.set(side * 0.1, 0.76, 0);
      horn.rotation.z = -side * 0.45;
      horn.rotation.x = -0.2;
      skinGroup.add(horn);
    }
  }

  // =========================================================================
  // 7. NECROMANTE
  // =========================================================================
  else if (sId === 'necromante_lamentos') {
    // Crânios / almas espectrais verdes orbitando
    const orbit = new THREE.Group();
    orbit.name = 'skinOrbit';
    orbit.position.set(0, 0.54, 0);
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const soul = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), glowMat);
      soul.position.set(Math.cos(angle) * 0.28, Math.sin(angle * 2) * 0.04, Math.sin(angle) * 0.28);
      orbit.add(soul);
    }
    skinGroup.add(orbit);

    // Manto de espinhos de osso
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.5 });
    for (const side of [-1, 1]) {
      const bone = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 5), boneMat);
      bone.position.set(side * 0.22, 0.52, -0.06);
      bone.rotation.z = -side * 0.4;
      skinGroup.add(bone);
    }
  } else if (sId === 'necromante_crepusculo') {
    // Coroa de ametista e ossos necróticos
    const crown = new THREE.Group();
    crown.position.set(0, 0.78, 0);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 6, 18), glowMat);
    band.rotation.x = Math.PI / 2;
    crown.add(band);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.08, 4), glowMat);
      spike.position.set(Math.cos(angle) * 0.115, 0.04, Math.sin(angle) * 0.115);
      crown.add(spike);
    }
    skinGroup.add(crown);

    // Silhueta de foice etérea flutuando nas costas
    const scytheBlade = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 6, 16, Math.PI * 0.8), glowMat);
    scytheBlade.position.set(0.08, 0.5, -0.15);
    scytheBlade.rotation.set(0, 0, -0.6);
    skinGroup.add(scytheBlade);
  }

  // =========================================================================
  // 8. DRUIDA
  // =========================================================================
  else if (sId === 'druida_primavera') {
    // Galhos floridos de cerejeira como chifres na cabeça
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0xec4899, emissiveIntensity: 0.6 });
    for (const side of [-1, 1]) {
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.025, 0.18), woodMat);
      branch.position.set(side * 0.11, 0.76, 0);
      branch.rotation.z = -side * 0.4;
      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 6), flowerMat);
      flower.position.set(side * 0.16, 0.84, 0);
      skinGroup.add(branch, flower);
    }
    // Pétalas rosadas mágicas orbitando
    const orbit = new THREE.Group();
    orbit.name = 'skinOrbit';
    orbit.position.set(0, 0.46, 0);
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.015, 0.035), flowerMat);
      petal.position.set(Math.cos(angle) * 0.28, 0, Math.sin(angle) * 0.28);
      orbit.add(petal);
    }
    skinGroup.add(orbit);
  } else if (sId === 'druida_lobo') {
    // Capuz de pele do Lobo Ancestral com orelhas pontiagudas
    const furMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.12, 4), furMat);
      ear.position.set(side * 0.09, 0.78, -0.02);
      ear.rotation.z = -side * 0.25;
      skinGroup.add(ear);
    }
    // Olhos e presas brilhantes de predador ancestral
    for (const side of [-1, 1]) {
      const fang = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.08, 4), glowMat);
      fang.position.set(side * 0.07, 0.58, 0.13);
      fang.rotation.x = Math.PI;
      skinGroup.add(fang);
    }
  }

  // =========================================================================
  // 9. MAGO RÚNICO
  // =========================================================================
  else if (sId === 'mago_runico_astral') {
    // Disco de anéis rúnicos concêntricos flutuando nas costas
    const runeRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.018, 8, 28), glowMat);
    runeRing.name = 'skinHalo';
    runeRing.position.set(0, 0.52, -0.15);
    skinGroup.add(runeRing);

    // 3 Runas arcanas azuis orbitando
    const orbit = new THREE.Group();
    orbit.name = 'skinOrbit';
    orbit.position.set(0, 0.52, 0);
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const runeStone = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.02), glowMat);
      runeStone.position.set(Math.cos(angle) * 0.32, 0, Math.sin(angle) * 0.32);
      orbit.add(runeStone);
    }
    skinGroup.add(orbit);
  } else if (sId === 'mago_runico_prateado') {
    // Prisma prateado espelhado flutuando
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      emissive: 0xcbd5e1,
      emissiveIntensity: 0.6,
      metalness: 0.95,
      roughness: 0.1,
    });
    const silverRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.016, 6, 24), silverMat);
    silverRing.name = 'skinHalo';
    silverRing.position.set(0, 0.52, -0.14);
    skinGroup.add(silverRing);

    // Orbes prateados orbitando
    const orbit = new THREE.Group();
    orbit.name = 'skinOrbit';
    orbit.position.set(0, 0.5, 0);
    for (let i = 0; i < 2; i++) {
      const angle = (i / 2) * Math.PI * 2;
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), silverMat);
      orb.position.set(Math.cos(angle) * 0.28, 0, Math.sin(angle) * 0.28);
      orbit.add(orb);
    }
    skinGroup.add(orbit);
  }

  // =========================================================================
  // 10. BERSERKER
  // =========================================================================
  else if (sId === 'berserker_vulcao') {
    // Espinhos de rocha vulcânica incandescente nos ombros
    const magmaMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.7 });
    for (const side of [-1, 1]) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 5), magmaMat);
      spike.position.set(side * 0.26, 0.54, 0);
      spike.rotation.z = -side * 0.5;
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), glowMat);
      core.position.set(side * 0.26, 0.58, 0);
      skinGroup.add(spike, core);
    }
    // Crista de magma no elmo
    const magmaCrest = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 5), glowMat);
    magmaCrest.position.set(0, 0.8, 0);
    skinGroup.add(magmaCrest);
  } else if (sId === 'berserker_gladiador') {
    // Colossal crista espartana/gladiador no elmo
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.24), glowMat);
    crest.position.set(0, 0.8, 0.02);
    skinGroup.add(crest);

    // Ombreiras pesadas com fitas de batalha carmesins
    for (const side of [-1, 1]) {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.12), skinThemeMat);
      pad.position.set(side * 0.26, 0.52, 0);
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 4), glowMat);
      spike.position.set(side * 0.26, 0.6, 0);
      skinGroup.add(pad, spike);
    }
  }

  // =========================================================================
  // 11. CARRASCO DO VAZIO
  // =========================================================================
  else if (sId === 'carrasco_samurai') {
    // Chifres em crescente de ouro/ametista estilo Samurai Kabuto (Maedate)
    const crescentGeo = new THREE.TorusGeometry(0.12, 0.016, 6, 16, Math.PI * 0.8);
    const crescent = new THREE.Mesh(crescentGeo, glowMat);
    crescent.position.set(0, 0.8, 0.08);
    crescent.rotation.set(-0.2, 0, 0);
    skinGroup.add(crescent);

    // Meia-máscara Menpo oni com presas violetas
    for (const side of [-1, 1]) {
      const fang = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.06, 4), glowMat);
      fang.position.set(side * 0.045, 0.62, 0.14);
      fang.rotation.x = Math.PI;
      skinGroup.add(fang);
    }
  } else if (sId === 'carrasco_prateado') {
    // Faixa cerimonial prateada nas costas
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.36, 0.015), glowMat);
    sash.position.set(0, 0.34, -0.13);
    sash.rotation.x = 0.18;
    skinGroup.add(sash);

    // Crista samurai prateada reluzente
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 4), glowMat);
    crest.position.set(0, 0.8, 0.04);
    skinGroup.add(crest);
  }

  // =========================================================================
  // 12. PALADINO
  // =========================================================================
  else if (sId === 'paladino_solar') {
    // Asas solares radiantes de pura luz
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.018), glowMat);
      wing.position.set(side * 0.2, 0.5, -0.14);
      wing.rotation.set(0.15, side * 0.3, -side * 0.45);
      skinGroup.add(wing);
    }
    // Auréola solar com raios sobre o elmo
    const sunCorona = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 8, 24), glowMat);
    sunCorona.name = 'skinHalo';
    sunCorona.rotation.x = Math.PI / 2;
    sunCorona.position.set(0, 0.85, 0);
    skinGroup.add(sunCorona);
  } else if (sId === 'paladino_platina') {
    // Asas de querubim de platina celeste
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.016), glowMat);
      wing.position.set(side * 0.18, 0.5, -0.14);
      wing.rotation.set(0.12, side * 0.25, -side * 0.4);
      skinGroup.add(wing);
    }
    // Coroa celeste sobre a cabeça
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.016, 8, 20), glowMat);
    crown.name = 'skinHalo';
    crown.rotation.x = Math.PI / 2;
    crown.position.set(0, 0.84, 0);
    skinGroup.add(crown);
  }

  // =========================================================================
  // 13. LANCEIRO
  // =========================================================================
  else if (sId === 'lanceiro_dragao') {
    // Asas dracônicas carmesins nas costas
    for (const side of [-1, 1]) {
      const dWing = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.018), glowMat);
      dWing.position.set(side * 0.19, 0.48, -0.13);
      dWing.rotation.set(0.15, side * 0.28, -side * 0.42);
      skinGroup.add(dWing);
    }
    // Chifres dracônicos no elmo
    for (const side of [-1, 1]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.15, 5), glowMat);
      horn.position.set(side * 0.11, 0.78, 0);
      horn.rotation.z = -side * 0.45;
      horn.rotation.x = -0.2;
      skinGroup.add(horn);
    }
  } else if (sId === 'lanceiro_relampago') {
    // Asas elétricas de relâmpago nas costas
    for (const side of [-1, 1]) {
      const boltWing = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.015), glowMat);
      boltWing.position.set(side * 0.18, 0.48, -0.13);
      boltWing.rotation.set(0.1, side * 0.3, -side * 0.5);
      skinGroup.add(boltWing);
    }
    // Anel de faíscas ao redor da lança
    const sparkRing = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 6, 16), glowMat);
    sparkRing.position.set(0.24, 0.65, 0.1);
    sparkRing.rotation.x = Math.PI / 2;
    skinGroup.add(sparkRing);
  }

  // =========================================================================
  // 14. BARDO
  // =========================================================================
  else if (sId === 'bardo_lua') {
    // Crescente lunar prateado flutuando no alaúde
    const moon = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.018, 6, 18, Math.PI * 0.75), glowMat);
    moon.position.set(-0.16, 0.55, 0.12);
    moon.rotation.z = 0.4;
    skinGroup.add(moon);

    // Notas musicais prateadas flutuando em órbita
    const orbit = new THREE.Group();
    orbit.name = 'skinOrbit';
    orbit.position.set(0, 0.5, 0);
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const note = new THREE.Mesh(new THREE.SphereGeometry(0.026, 6, 6), glowMat);
      note.position.set(Math.cos(angle) * 0.28, Math.sin(angle * 2) * 0.05, Math.sin(angle) * 0.28);
      orbit.add(note);
    }
    skinGroup.add(orbit);
  } else if (sId === 'bardo_maestro') {
    // Clave celestial e auréola de harmonia no topo
    const clefHalo = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.018, 8, 24), glowMat);
    clefHalo.name = 'skinHalo';
    clefHalo.position.set(0, 0.84, 0);
    clefHalo.rotation.x = Math.PI / 2;
    skinGroup.add(clefHalo);

    // Caudas do fraque de maestro elegante
    for (const side of [-1, 1]) {
      const coatTail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.015), skinThemeMat);
      coatTail.position.set(side * 0.08, 0.26, -0.12);
      coatTail.rotation.set(0.18, 0, side * 0.15);
      skinGroup.add(coatTail);
    }
  }

  // =========================================================================
  // 15. MAGO DE GELO
  // =========================================================================
  else if (sId === 'mago_gelo_principe') {
    // Coroa de cristais de gelo pontiagudos
    const crown = new THREE.Group();
    crown.position.set(0, 0.78, 0);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const icicle = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.12, 5), glowMat);
      icicle.position.set(Math.cos(angle) * 0.11, 0.05, Math.sin(angle) * 0.11);
      crown.add(icicle);
    }
    skinGroup.add(crown);

    // Ombreiras com estalactites de gelo perpétuo
    for (const side of [-1, 1]) {
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 5), glowMat);
      spire.position.set(side * 0.25, 0.54, 0);
      spire.rotation.z = -side * 0.45;
      skinGroup.add(spire);
    }
  } else if (sId === 'mago_gelo_cosmico') {
    // Auréola de cometa congelado com rastro estelar
    const cometHalo = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 8, 24), glowMat);
    cometHalo.name = 'skinHalo';
    cometHalo.position.set(0, 0.6, -0.14);
    skinGroup.add(cometHalo);

    // Orbe de geada cósmica orbitando
    const orbit = new THREE.Group();
    orbit.name = 'skinOrbit';
    orbit.position.set(0, 0.52, 0);
    for (let i = 0; i < 2; i++) {
      const angle = (i / 2) * Math.PI * 2;
      const iceOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.038), glowMat);
      iceOrb.position.set(Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3);
      orbit.add(iceOrb);
    }
    skinGroup.add(orbit);
  }

  // =========================================================================
  // 16. SNIPER
  // =========================================================================
  else if (sId === 'sniper_tatico') {
    // Visor tático cibernético com feixe de mira holográfico verde
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.06), glowMat);
    visor.position.set(0, 0.66, 0.12);
    skinGroup.add(visor);

    // Mochila de comunicação e equipamento de campo nas costas
    const packMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.1), packMat);
    backpack.position.set(0, 0.44, -0.14);
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2), glowMat);
    antenna.position.set(0.06, 0.58, -0.14);
    skinGroup.add(backpack, antenna);
  } else if (sId === 'sniper_cosmico') {
    // Mira holográfica giratória flutuando em frente ao rifle
    const reticle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.008, 6, 16), glowMat);
    reticle.name = 'skinHalo';
    reticle.position.set(0.16, 0.46, 0.32);
    skinGroup.add(reticle);

    // Bateria quântica de plasma nas costas com aletas aerodinâmicas
    for (const side of [-1, 1]) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.1), glowMat);
      fin.position.set(side * 0.14, 0.46, -0.13);
      fin.rotation.y = side * 0.35;
      skinGroup.add(fin);
    }
  }

  // =========================================================================
  // 17. MAGO ELÉTRICO
  // =========================================================================
  else if (sId === 'mago_eletrico_plasma') {
    // Hastes condutoras tesla nos ombros com arcos de plasma
    for (const side of [-1, 1]) {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.18), glowMat);
      rod.position.set(side * 0.24, 0.56, 0);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), glowMat);
      cap.position.set(side * 0.24, 0.65, 0);
      skinGroup.add(rod, cap);
    }
    // Esferas de plasma em órbita rápida
    const orbit = new THREE.Group();
    orbit.name = 'skinOrbit';
    orbit.position.set(0, 0.52, 0);
    for (let i = 0; i < 2; i++) {
      const angle = (i / 2) * Math.PI * 2;
      const plasmaOrb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), glowMat);
      plasmaOrb.position.set(Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3);
      orbit.add(plasmaOrb);
    }
    skinGroup.add(orbit);
  } else if (sId === 'mago_eletrico_dourado') {
    // Tambores do Trovão Raijin flutuando em arco nas costas
    const drumMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
    const raijinRing = new THREE.Group();
    raijinRing.name = 'skinHalo';
    raijinRing.position.set(0, 0.54, -0.15);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 1.5 - Math.PI * 0.75;
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 12), drumMat);
      drum.position.set(Math.cos(angle) * 0.22, Math.sin(angle) * 0.22, 0);
      drum.rotation.x = Math.PI / 2;
      const emblem = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), glowMat);
      emblem.position.set(Math.cos(angle) * 0.22, Math.sin(angle) * 0.22, 0.025);
      raijinRing.add(drum, emblem);
    }
    skinGroup.add(raijinRing);
  }

  // =========================================================================
  // 18. OMNIMAGO
  // =========================================================================
  else if (sId === 'omnimago_celestial') {
    // Anéis giroscópicos astrais orbitando ao redor do herói
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.014, 8, 32), glowMat);
    ring1.name = 'skinHalo';
    ring1.rotation.set(0.4, 0.2, 0);
    ring1.position.set(0, 0.46, 0);
    skinGroup.add(ring1);

    // Prisma cósmico acima da cabeça
    const prism = new THREE.Mesh(new THREE.OctahedronGeometry(0.045), glowMat);
    prism.position.set(0, 0.86, 0);
    skinGroup.add(prism);
  } else if (sId === 'omnimago_avatar') {
    // 4 Orbes dos Elementos Cósmicos em órbita contínua
    const orbit = new THREE.Group();
    orbit.name = 'skinOrbit';
    orbit.position.set(0, 0.52, 0);

    const elementalColors = [
      0xef4444, // Fogo Carmesim
      0x38bdf8, // Gelo Cristalino
      0xfacc15, // Raio Dourado
      0x22c55e, // Vento Esmeralda
    ];

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const elemMat = new THREE.MeshStandardMaterial({
        color: elementalColors[i],
        emissive: elementalColors[i],
        emissiveIntensity: 1.0,
      });
      const elemOrb = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), elemMat);
      elemOrb.position.set(Math.cos(angle) * 0.34, 0, Math.sin(angle) * 0.34);
      orbit.add(elemOrb);
    }
    skinGroup.add(orbit);

    // Auréola dos quatro quadrantes nas costas
    const quadHalo = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 8, 24), glowMat);
    quadHalo.name = 'skinHalo';
    quadHalo.position.set(0, 0.54, -0.15);
    skinGroup.add(quadHalo);
  }

  // =========================================================================
  // 19. MAGO DE VENTO
  // =========================================================================
  else if (sId === 'mago_vento_tufoes') {
    // Espiral de tufão tropical verde-esmeralda ao redor da cintura
    const cyclone = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.018, 6, 24), glowMat);
    cyclone.name = 'skinOrbit';
    cyclone.rotation.x = Math.PI / 2;
    cyclone.position.set(0, 0.32, 0);
    skinGroup.add(cyclone);

    // Fitas de vento saindo dos ombros
    for (const side of [-1, 1]) {
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.012), glowMat);
      ribbon.position.set(side * 0.16, 0.38, -0.12);
      ribbon.rotation.set(0.18, 0, side * 0.28);
      skinGroup.add(ribbon);
    }
  } else if (sId === 'mago_vento_celestial') {
    // Asas etéreas celestes de brisa comprimida
    const windWingMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.8,
    });
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.015), windWingMat);
      wing.position.set(side * 0.18, 0.5, -0.14);
      wing.rotation.set(0.12, side * 0.28, -side * 0.42);
      skinGroup.add(wing);
    }
    // Coroa celeste dos ventos flutuando sobre a cabeça
    const windCrown = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 8, 24), glowMat);
    windCrown.name = 'skinHalo';
    windCrown.rotation.x = Math.PI / 2;
    windCrown.position.set(0, 0.84, 0);
    skinGroup.add(windCrown);
  }

  return skinGroup;
}
