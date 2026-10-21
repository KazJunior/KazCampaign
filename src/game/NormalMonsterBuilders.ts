import * as THREE from 'three';

// ============================================================================
// NORMAL MONSTER 3D MINIATURE BUILDERS (ACTS II - V, Fases 11 a 50)
// High-detail, expressive tabletop miniatures for all 40 regular monster types.
// ============================================================================

// ----------------------------------------------------------------------------
// ATO II: A FORJA INCANDESCENTE (Fases 11 a 20)
// ----------------------------------------------------------------------------

/** 1. Kobold Artilheiro: Pequeno réptil com óculos de engenheiro e bacamarte */
export function buildKoboldGunnerMini(group: THREE.Group): void {
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe65100, roughness: 0.7 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 });
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.8 });

  // Pernas
  const legGeo = new THREE.CapsuleGeometry(0.045, 0.12, 4, 6);
  const legL = new THREE.Mesh(legGeo, skinMat);
  legL.position.set(-0.08, 0.12, 0);
  const legR = new THREE.Mesh(legGeo, skinMat);
  legR.position.set(0.08, 0.12, 0);
  group.add(legL, legR);

  // Tronco com colete de couro
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.22, 8), leatherMat);
  torso.position.y = 0.26;
  torso.castShadow = true;
  group.add(torso);

  // Cabeça reptiliana com focinho comprido
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), skinMat);
  head.position.set(0, 0.42, 0.02);
  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 6), skinMat);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, 0.4, 0.12);
  group.add(head, snout);

  // Chifres pequenos
  const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 4), leatherMat);
  hornL.position.set(-0.06, 0.5, -0.04);
  hornL.rotation.x = -Math.PI / 6;
  const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 4), leatherMat);
  hornR.position.set(0.06, 0.5, -0.04);
  hornR.rotation.x = -Math.PI / 6;
  group.add(hornL, hornR);

  // Óculos de artilheiro (Goggles)
  const goggleL = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 6, 12), brassMat);
  goggleL.position.set(-0.04, 0.45, 0.08);
  const lensL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), lensMat);
  lensL.position.set(-0.04, 0.45, 0.08);
  const goggleR = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 6, 12), brassMat);
  goggleR.position.set(0.04, 0.45, 0.08);
  const lensR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), lensMat);
  lensR.position.set(0.04, 0.45, 0.08);
  group.add(goggleL, lensL, goggleR, lensR);

  // Bacamarte / Canhão de mão (Blunderbuss)
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.28), leatherMat);
  stock.position.set(0.16, 0.26, 0.1);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.025, 0.2, 8), brassMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0.16, 0.28, 0.22);
  group.add(stock, barrel);
}

/** 2. Salamandra de Magma: Réptil quadrúpede vulcânico com crista de fogo */
export function buildMagmaLizardMini(group: THREE.Group): void {
  const obsidianMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.6 });
  const magmaMat = new THREE.MeshStandardMaterial({ color: 0xff3d00, emissive: 0xff3d00, emissiveIntensity: 1.0 });

  // Corpo achatado rastejante
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.44), obsidianMat);
  body.position.set(0, 0.16, 0);
  body.castShadow = true;
  group.add(body);

  // 4 Patas splayed
  const legPositions = [
    [-0.16, 0.1, 0.14],
    [0.16, 0.1, 0.14],
    [-0.16, 0.1, -0.14],
    [0.16, 0.1, -0.14],
  ];
  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.1, 4, 6), obsidianMat);
    leg.position.set(x, y, z);
    leg.rotation.z = x > 0 ? -Math.PI / 5 : Math.PI / 5;
    group.add(leg);
  });

  // Cabeça larga com olhos incandescentes
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.18), obsidianMat);
  head.position.set(0, 0.2, 0.28);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), magmaMat);
  eyeL.position.set(-0.07, 0.24, 0.32);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), magmaMat);
  eyeR.position.set(0.07, 0.24, 0.32);
  group.add(head, eyeL, eyeR);

  // Crista espinhosa de magma dorsal
  for (let i = 0; i < 4; i++) {
    const spine = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 4), magmaMat);
    spine.position.set(0, 0.26, -0.14 + i * 0.1);
    spine.rotation.x = -Math.PI / 12;
    group.add(spine);
  }

  // Cauda sinuosa
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.28, 6), obsidianMat);
  tail.rotation.x = -Math.PI / 2.3;
  tail.position.set(0, 0.15, -0.32);
  group.add(tail);
}

/** 3. Ferreiro das Sombras: Robusto, máscara de forja e martelo incandescente */
export function buildCursedBlacksmithMini(group: THREE.Group): void {
  const skinMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
  const apronMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.85, roughness: 0.3 });
  const glowMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 1.1 });

  // Pernas pesadas
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.16, 6, 6), apronMat);
  legL.position.set(-0.11, 0.15, 0);
  const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.16, 6, 6), apronMat);
  legR.position.set(0.11, 0.15, 0);
  group.add(legL, legR);

  // Tronco corpulento com avental chamuscado
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.34, 10), apronMat);
  torso.position.y = 0.38;
  torso.castShadow = true;
  group.add(torso);

  // Cabeça com máscara de forja fechada
  const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 8), ironMat);
  helm.position.set(0, 0.62, 0);
  const visorSlit = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.04), glowMat);
  visorSlit.position.set(0, 0.62, 0.11);
  group.add(helm, visorSlit);

  // Braços musculosos
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.22, 6, 6), skinMat);
  armL.position.set(-0.25, 0.42, 0.05);
  armL.rotation.x = Math.PI / 8;
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.22, 6, 6), skinMat);
  armR.position.set(0.25, 0.42, 0.12);
  armR.rotation.x = -Math.PI / 6;
  group.add(armL, armR);

  // Martelo de forja pesado com núcleo incandescente
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.48, 6), ironMat);
  handle.position.set(0.28, 0.38, 0.22);
  handle.rotation.x = Math.PI / 4;
  const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.2), ironMat);
  hammerHead.position.set(0.28, 0.52, 0.36);
  const runeGlow = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.04, 0.12), glowMat);
  runeGlow.position.set(0.28, 0.52, 0.36);
  group.add(handle, hammerHead, runeGlow);
}

/** 4. Elemental de Brasas: Núcleo de plasma ígneo com rochas em órbita */
export function buildEmberElementalMini(group: THREE.Group): void {
  const coreMat = new THREE.MeshStandardMaterial({ color: 0xff5722, emissive: 0xff3d00, emissiveIntensity: 1.5 });
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x1f1f23, roughness: 0.9 });
  const sparkMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 1.8 });

  // Núcleo flutuante de fogo
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), coreMat);
  core.position.y = 0.45;
  group.add(core);

  // 6 Rochas vulcânicas orbitantes
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const r = 0.32;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.065), rockMat);
    rock.position.set(Math.cos(angle) * r, 0.45 + Math.sin(angle * 2) * 0.08, Math.sin(angle) * r);
    rock.rotation.set(angle, angle * 1.5, 0);
    group.add(rock);
  }

  // Brasas e faíscas menores
  for (let j = 0; j < 4; j++) {
    const spark = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), sparkMat);
    spark.position.set((Math.random() - 0.5) * 0.3, 0.2 + j * 0.14, (Math.random() - 0.5) * 0.3);
    group.add(spark);
  }
}

/** 5. Autômato a Vapor: Golem mecânico com chaminés e pistões de latão */
export function buildSteamGolemMini(group: THREE.Group): void {
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.85, roughness: 0.3 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.75, roughness: 0.35 });
  const glowMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 1.0 });

  // Pernas de pistão
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.2, 8), ironMat);
  legL.position.set(-0.14, 0.14, 0);
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.2, 8), ironMat);
  legR.position.set(0.14, 0.14, 0);
  group.add(legL, legR);

  // Caldeira Torso
  const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.34, 12), brassMat);
  boiler.position.y = 0.38;
  boiler.castShadow = true;
  group.add(boiler);

  // Manômetro frontal brilhante
  const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 12), ironMat);
  gauge.rotation.x = Math.PI / 2;
  gauge.position.set(0, 0.42, 0.21);
  const gaugeGlass = new THREE.Mesh(new THREE.CircleGeometry(0.05, 12), glowMat);
  gaugeGlass.position.set(0, 0.42, 0.23);
  group.add(gauge, gaugeGlass);

  // Cabeça cúbica com visor
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), ironMat);
  head.position.set(0, 0.62, 0);
  const eye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.04), glowMat);
  eye.position.set(0, 0.62, 0.09);
  group.add(head, eye);

  // Chaminés duplas de vapor nas costas
  const pipeL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.26, 8), ironMat);
  pipeL.position.set(-0.12, 0.56, -0.14);
  pipeL.rotation.x = -Math.PI / 10;
  const pipeR = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.26, 8), ironMat);
  pipeR.position.set(0.12, 0.56, -0.14);
  pipeR.rotation.x = -Math.PI / 10;
  group.add(pipeL, pipeR);
}

/** 6. Piromante da Caldeira: Mago mascarado com manto chamuscado e báculo de fogo */
export function buildPyromancerMini(group: THREE.Group): void {
  const robeMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
  const fireMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 1.4 });

  // Manto cônico
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.54, 10), robeMat);
  robe.position.y = 0.32;
  robe.castShadow = true;
  group.add(robe);

  // Capuz pontiagudo escuro
  const hood = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.28, 8), trimMat);
  hood.position.set(0, 0.68, -0.04);
  hood.rotation.x = -Math.PI / 10;
  group.add(hood);

  // Máscara com olhos em brasa
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), fireMat);
  eyeL.position.set(-0.04, 0.6, 0.1);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), fireMat);
  eyeR.position.set(0.04, 0.6, 0.1);
  group.add(eyeL, eyeR);

  // Cajado de braseiro
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.72, 6), trimMat);
  staff.position.set(0.22, 0.42, 0.1);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.03, 0.06, 8), trimMat);
  bowl.position.set(0.22, 0.76, 0.1);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), fireMat);
  flame.position.set(0.22, 0.82, 0.1);
  group.add(staff, bowl, flame);
}

/** 7. Espectro das Cinzas: Fantasma flutuante feito de poeira e brasas */
export function buildAshSpecterMini(group: THREE.Group): void {
  const ashMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9, transparent: true, opacity: 0.85 });
  const emberMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.3 });

  // Cauda espectral flutuante invertida
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.48, 8), ashMat);
  tail.rotation.x = Math.PI;
  tail.position.y = 0.34;
  group.add(tail);

  // Manto esfarrapado
  const shroud = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), ashMat);
  shroud.position.y = 0.54;
  group.add(shroud);

  // Crânio cinzento com órbitas vermelhas
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), ashMat);
  skull.position.set(0, 0.62, 0.05);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), emberMat);
  eyeL.position.set(-0.04, 0.63, 0.14);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), emberMat);
  eyeR.position.set(0.04, 0.63, 0.14);
  group.add(skull, eyeL, eyeR);

  // Garras fantasmagóricas
  const clawL = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.14, 4), ashMat);
  clawL.position.set(-0.24, 0.42, 0.15);
  clawL.rotation.x = Math.PI / 3;
  const clawR = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.14, 4), ashMat);
  clawR.position.set(0.24, 0.42, 0.15);
  clawR.rotation.x = Math.PI / 3;
  group.add(clawL, clawR);
}

/** 8. Verme da Lava: Serpente segmentada de rocha vulcânica com goela flamejante */
export function buildLavaWormMini(group: THREE.Group): void {
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });
  const magmaMat = new THREE.MeshStandardMaterial({ color: 0xff3d00, emissive: 0xff3d00, emissiveIntensity: 1.2 });
  const toothMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });

  // 4 Segmentos cilíndricos empilhados em curva
  const segs = [
    { y: 0.12, z: -0.08, r: 0.22, rot: 0.1 },
    { y: 0.28, z: -0.04, r: 0.2, rot: 0.2 },
    { y: 0.46, z: 0.04, r: 0.18, rot: 0.35 },
    { y: 0.64, z: 0.14, r: 0.16, rot: 0.5 },
  ];

  segs.forEach((s) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(s.r, s.r * 1.1, 0.15, 10), rockMat);
    ring.position.set(0, s.y, s.z);
    ring.rotation.x = s.rot;
    ring.castShadow = true;

    // Anel de magma entre segmentos
    const lavaRing = new THREE.Mesh(new THREE.TorusGeometry(s.r * 1.05, 0.018, 6, 12), magmaMat);
    lavaRing.position.set(0, s.y - 0.06, s.z);
    lavaRing.rotation.x = Math.PI / 2 + s.rot;
    group.add(ring, lavaRing);
  });

  // Cabeça com anel de dentes e centro de fogo
  const headPos = segs[segs.length - 1];
  const mawGlow = new THREE.Mesh(new THREE.CircleGeometry(0.12, 10), magmaMat);
  mawGlow.position.set(0, headPos.y + 0.08, headPos.z + 0.05);
  mawGlow.rotation.x = -Math.PI / 4;
  group.add(mawGlow);

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 4), toothMat);
    tooth.position.set(
      Math.cos(angle) * 0.12,
      headPos.y + 0.08 + Math.sin(angle) * 0.06,
      headPos.z + 0.05 + Math.sin(angle) * 0.06
    );
    group.add(tooth);
  }
}

/** 9. Gárgula de Ferro Fundido: Estátua alada de metal com chifres */
export function buildIronGargoyleMini(group: THREE.Group): void {
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.35 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.1 });

  // Corpo agachado
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.22), ironMat);
  torso.position.y = 0.32;
  torso.castShadow = true;
  group.add(torso);

  // Garras inferiores
  const footL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.16), ironMat);
  footL.position.set(-0.11, 0.08, 0.06);
  const footR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.16), ironMat);
  footR.position.set(0.11, 0.08, 0.06);
  group.add(footL, footR);

  // Cabeça demoníaca com chifres
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), ironMat);
  head.position.set(0, 0.54, 0.04);
  const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 4), ironMat);
  hornL.position.set(-0.1, 0.66, 0);
  hornL.rotation.z = Math.PI / 4;
  const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 4), ironMat);
  hornR.position.set(0.1, 0.66, 0);
  hornR.rotation.z = -Math.PI / 4;
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), eyeMat);
  eyeL.position.set(-0.05, 0.54, 0.12);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), eyeMat);
  eyeR.position.set(0.05, 0.54, 0.12);
  group.add(head, hornL, hornR, eyeL, eyeR);

  // Asas de gárgula abertas
  const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.03), ironMat);
  wingL.position.set(-0.24, 0.46, -0.12);
  wingL.rotation.y = Math.PI / 6;
  wingL.rotation.z = Math.PI / 12;
  const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.03), ironMat);
  wingR.position.set(0.24, 0.46, -0.12);
  wingR.rotation.y = -Math.PI / 6;
  wingR.rotation.z = -Math.PI / 12;
  group.add(wingL, wingR);
}

/** 10. Cão Infernal: Fera canina com coleira espinhosa e crista de fogo */
export function buildHellHoundMini(group: THREE.Group): void {
  const furMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.75 });
  const fireMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 1.2 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.85, roughness: 0.3 });

  // Tronco canino inclinado
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.32, 6, 8), furMat);
  body.rotation.x = Math.PI / 2.5;
  body.position.set(0, 0.28, 0);
  body.castShadow = true;
  group.add(body);

  // 4 Patas musculosas
  const legPositions = [
    [-0.12, 0.14, 0.14],
    [0.12, 0.14, 0.14],
    [-0.12, 0.14, -0.14],
    [0.12, 0.14, -0.14],
  ];
  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.16, 4, 6), furMat);
    leg.position.set(x, y, z);
    group.add(leg);
  });

  // Cabeça feroz com mandíbula aberta
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.2), furMat);
  head.position.set(0, 0.44, 0.22);
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.16), fireMat);
  jaw.position.set(0, 0.36, 0.24);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), fireMat);
  eyeL.position.set(-0.06, 0.48, 0.28);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), fireMat);
  eyeR.position.set(0.06, 0.48, 0.28);
  group.add(head, jaw, eyeL, eyeR);

  // Coleira de ferro cravada
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 6, 12), ironMat);
  collar.position.set(0, 0.38, 0.12);
  collar.rotation.x = Math.PI / 3;
  group.add(collar);

  // Espinhos de fogo no dorso
  for (let i = 0; i < 3; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 4), fireMat);
    spike.position.set(0, 0.4 - i * 0.04, 0.08 - i * 0.1);
    spike.rotation.x = -Math.PI / 8;
    group.add(spike);
  }
}

// ----------------------------------------------------------------------------
// ATO III: AS ESTEPES RÚNICAS (Fases 21 a 30)
// ----------------------------------------------------------------------------

/** 11. Bárbaro da Fúria: Guerreiro com pintura de guerra e machados duplos */
export function buildBerserkerWarriorMini(group: THREE.Group): void {
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.6 });
  const furMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.8 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.3 });
  const runeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.9 });

  // Pernas com botas de pele
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.16, 6, 6), furMat);
  legL.position.set(-0.11, 0.15, 0);
  const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.16, 6, 6), furMat);
  legR.position.set(0.11, 0.15, 0);
  group.add(legL, legR);

  // Peitoral musculoso com pintura de guerra azul
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.3, 10), skinMat);
  torso.position.y = 0.36;
  torso.castShadow = true;
  const warpaint = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.04), runeMat);
  warpaint.position.set(0, 0.38, 0.15);
  group.add(torso, warpaint);

  // Manto de pele nos ombros
  const mantle = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.06, 6, 12), furMat);
  mantle.rotation.x = Math.PI / 2;
  mantle.position.y = 0.52;
  group.add(mantle);

  // Cabeça e cabelo selvagem
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), skinMat);
  head.position.set(0, 0.62, 0);
  const hair = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 6), hairMat);
  hair.position.set(0, 0.72, -0.04);
  hair.rotation.x = -Math.PI / 8;
  group.add(head, hair);

  // Dois Machados Bárbaros (Mão Esquerda e Direita)
  [-0.26, 0.26].forEach((x, idx) => {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.38, 6), furMat);
    handle.position.set(x, 0.38, 0.1);
    handle.rotation.x = Math.PI / 6;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.16, 0.14), steelMat);
    blade.position.set(x, 0.5, 0.16);
    blade.rotation.y = idx === 0 ? Math.PI / 4 : -Math.PI / 4;
    group.add(handle, blade);
  });
}

/** 12. Caçador das Estepes: Arqueiro nômade com capuz de lobo e arco recurvo */
export function buildSteppeHunterMini(group: THREE.Group): void {
  const coatMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });

  // Corpo com túnica verde
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.32, 8), coatMat);
  torso.position.y = 0.32;
  torso.castShadow = true;
  group.add(torso);

  // Capuz de pele de lobo com orelhas
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), leatherMat);
  hood.position.set(0, 0.56, 0);
  const earL = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 4), leatherMat);
  earL.position.set(-0.08, 0.68, 0);
  const earR = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 4), leatherMat);
  earR.position.set(0.08, 0.68, 0);
  group.add(hood, earL, earR);

  // Aljava nas costas
  const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.28, 6), leatherMat);
  quiver.position.set(-0.1, 0.42, -0.12);
  quiver.rotation.z = Math.PI / 8;
  group.add(quiver);

  // Arco recurvo na mão
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.016, 6, 12, Math.PI), woodMat);
  bow.position.set(0.24, 0.38, 0.1);
  bow.rotation.y = Math.PI / 2;
  group.add(bow);
}

/** 13. Xamã da Tempestade: Manto cerimonial, chifres de cervo e báculo com raio */
export function buildStormShamanMini(group: THREE.Group): void {
  const robeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });
  const antlerMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.5 });
  const lightningMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.5 });

  // Manto azul tempestade
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.56, 10), robeMat);
  robe.position.y = 0.34;
  robe.castShadow = true;
  group.add(robe);

  // Cabeça xamânica
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), robeMat);
  head.position.set(0, 0.64, 0);
  group.add(head);

  // Galhadas de cervo / chifres rúnicos
  [-0.12, 0.12].forEach((x, idx) => {
    const mainBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 4), antlerMat);
    mainBeam.position.set(x, 0.78, 0);
    mainBeam.rotation.z = idx === 0 ? -Math.PI / 5 : Math.PI / 5;
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 4), antlerMat);
    branch.position.set(x * 1.4, 0.82, 0.04);
    branch.rotation.z = idx === 0 ? Math.PI / 6 : -Math.PI / 6;
    group.add(mainBeam, branch);
  });

  // Báculo da tempestade com esfera de raio
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6), antlerMat);
  staff.position.set(0.24, 0.46, 0.1);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), lightningMat);
  orb.position.set(0.24, 0.88, 0.1);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.015, 6, 12), lightningMat);
  ring.position.copy(orb.position);
  ring.rotation.x = Math.PI / 3;
  group.add(staff, orb, ring);
}

/** 14. Constructo Rúnico: Bloco de pedra ancestral flutuante com glifos roxos */
export function buildRuneConstructMini(group: THREE.Group): void {
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const runeMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 1.4 });

  // Corpo central de monolito
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.36, 0.24), stoneMat);
  torso.position.y = 0.38;
  torso.castShadow = true;
  group.add(torso);

  // Glifos rúnicos gravados
  const runeVertical = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, 0.02), runeMat);
  runeVertical.position.set(0, 0.38, 0.13);
  const runeHorizontal = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.02), runeMat);
  runeHorizontal.position.set(0, 0.42, 0.13);
  group.add(runeVertical, runeHorizontal);

  // Ombros flutuantes desacoplados
  [-0.24, 0.24].forEach((x) => {
    const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.14), stoneMat);
    shoulder.position.set(x, 0.46, 0);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), runeMat);
    glow.position.set(x * 0.7, 0.46, 0);
    group.add(shoulder, glow);
  });

  // Cabeça de monólito achatado
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.18), stoneMat);
  head.position.set(0, 0.64, 0);
  const eye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.04), runeMat);
  eye.position.set(0, 0.64, 0.1);
  group.add(head, eye);
}

/** 15. Urso de Guerra Glacial: Urso polar blindado com placa de ferro espinhosa */
export function buildWarBearMini(group: THREE.Group): void {
  const furMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.85 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.1 });

  // Corpo maciço de urso
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.38, 8, 8), furMat);
  body.rotation.x = Math.PI / 2.2;
  body.position.set(0, 0.28, 0);
  body.castShadow = true;
  group.add(body);

  // 4 Patas robustas
  [
    [-0.16, 0.14, 0.16],
    [0.16, 0.14, 0.16],
    [-0.16, 0.14, -0.16],
    [0.16, 0.14, -0.16],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.16, 4, 6), furMat);
    leg.position.set(x, y, z);
    group.add(leg);
  });

  // Cabeça com placa de ferro espinhosa
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.24), furMat);
  head.position.set(0, 0.44, 0.24);
  const armorPlate = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.22), ironMat);
  armorPlate.position.set(0, 0.52, 0.24);
  const spike = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 4), ironMat);
  spike.position.set(0, 0.6, 0.26);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), eyeMat);
  eyeL.position.set(-0.07, 0.46, 0.32);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), eyeMat);
  eyeR.position.set(0.07, 0.46, 0.32);
  group.add(head, armorPlate, spike, eyeL, eyeR);
}

/** 16. Valquíria Decaída: Asas negras emplumadas, elmo alado e lança rúnica */
export function buildDarkValkyrieMini(group: THREE.Group): void {
  const armorMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.25 });
  const wingMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.7 });
  const purpleMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, emissive: 0x9333ea, emissiveIntensity: 0.9 });

  // Corpo blindado com peitoral de aço
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.32, 8), armorMat);
  torso.position.y = 0.34;
  torso.castShadow = true;
  group.add(torso);

  // Elmo alado
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), armorMat);
  helm.position.set(0, 0.58, 0);
  const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.08), armorMat);
  wingL.position.set(-0.12, 0.62, 0);
  wingL.rotation.z = -Math.PI / 6;
  const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.08), armorMat);
  wingR.position.set(0.12, 0.62, 0);
  wingR.rotation.z = Math.PI / 6;
  group.add(helm, wingL, wingR);

  // Asas negras emplumadas abertas
  const featherWingL = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.03), wingMat);
  featherWingL.position.set(-0.24, 0.52, -0.12);
  featherWingL.rotation.y = Math.PI / 6;
  const featherWingR = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.03), wingMat);
  featherWingR.position.set(0.24, 0.52, -0.12);
  featherWingR.rotation.y = -Math.PI / 6;
  group.add(featherWingL, featherWingR);

  // Lança rúnica afiada
  const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.88, 6), armorMat);
  spear.position.set(0.22, 0.46, 0.12);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 4), purpleMat);
  tip.position.set(0.22, 0.92, 0.12);
  group.add(spear, tip);
}

/** 17. Tecelão de Glifos: Estudioso com anéis rúnicos e livro mágico em órbita */
export function buildGlyphWeaverMini(group: THREE.Group): void {
  const robeMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
  const cyanGlow = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 1.5 });

  // Manto azul escuro com orla dourada
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.56, 10), robeMat);
  robe.position.y = 0.32;
  robe.castShadow = true;
  group.add(robe);

  // Cabeça com tiara de ouro
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), robeMat);
  head.position.set(0, 0.62, 0);
  const circlet = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.015, 6, 12), goldMat);
  circlet.position.set(0, 0.65, 0);
  circlet.rotation.x = Math.PI / 2;
  group.add(head, circlet);

  // Livro mágico flutuante aberto
  const bookCover = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.12), goldMat);
  bookCover.position.set(0, 0.46, 0.22);
  const bookPages = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.1), cyanGlow);
  bookPages.position.set(0, 0.48, 0.22);
  group.add(bookCover, bookPages);

  // 2 Anéis de glifos orbitando as mãos
  const ringL = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 6, 16), cyanGlow);
  ringL.position.set(-0.24, 0.46, 0.08);
  const ringR = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 6, 16), cyanGlow);
  ringR.position.set(0.24, 0.46, 0.08);
  group.add(ringL, ringR);
}

/** 18. Lobo do Trovão: Lobo elétrico com crina de raio */
export function buildThunderWolfMini(group: THREE.Group): void {
  const furMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });
  const electricMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.5 });

  // Corpo ágil
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.34, 6, 8), furMat);
  body.rotation.x = Math.PI / 2.3;
  body.position.set(0, 0.26, 0);
  body.castShadow = true;
  group.add(body);

  // 4 Patas
  [
    [-0.1, 0.14, 0.12],
    [0.1, 0.14, 0.12],
    [-0.1, 0.14, -0.12],
    [0.1, 0.14, -0.12],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.16, 4, 6), furMat);
    leg.position.set(x, y, z);
    group.add(leg);
  });

  // Cabeça e focinho afiado
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.18), furMat);
  head.position.set(0, 0.42, 0.2);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), electricMat);
  eyeL.position.set(-0.05, 0.46, 0.26);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), electricMat);
  eyeR.position.set(0.05, 0.46, 0.26);
  group.add(head, eyeL, eyeR);

  // Crina de espinhos elétricos
  for (let i = 0; i < 4; i++) {
    const quill = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 4), electricMat);
    quill.position.set(0, 0.42 - i * 0.05, 0.1 - i * 0.1);
    quill.rotation.x = -Math.PI / 6;
    group.add(quill);
  }
}

/** 19. Guardião do Megalito: Monólito ancestral maciço com escudo de pedra */
export function buildMegalithGuardianMini(group: THREE.Group): void {
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
  const mossMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.95 });
  const runeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.1 });

  // Corpo de pedra colossal
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.46, 0.26), stoneMat);
  torso.position.y = 0.38;
  torso.castShadow = true;
  group.add(torso);

  // Manchas de musgo
  const moss = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.28), mossMat);
  moss.position.y = 0.54;
  group.add(moss);

  // Runa celta no peito
  const runeCircle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.016, 6, 16), runeMat);
  runeCircle.position.set(0, 0.38, 0.14);
  group.add(runeCircle);

  // Escudo de laje de pedra
  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.52, 0.28), stoneMat);
  shield.position.set(-0.26, 0.36, 0.12);
  const shieldRune = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.24, 0.06), runeMat);
  shieldRune.position.set(-0.26, 0.36, 0.12);
  group.add(shield, shieldRune);
}

/** 20. Espada Espectral Rúnica: Lâmina mágica autônoma flutuante */
export function buildRuneBladeMini(group: THREE.Group): void {
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 1.6 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.2 });
  const purpleMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 1.2 });

  // Lâmina de plasma celeste (vertical flutuante)
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.68, 0.14), bladeMat);
  blade.position.y = 0.56;
  blade.castShadow = true;

  // Ponta da lâmina
  const bladeTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 4), bladeMat);
  bladeTip.rotation.y = Math.PI / 4;
  bladeTip.position.y = 0.98;

  // Guarda alada dourada
  const crossguard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.32), goldMat);
  crossguard.position.y = 0.22;

  // Empunhadura e pomo
  const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 6), goldMat);
  hilt.position.y = 0.12;
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), purpleMat);
  pommel.position.y = 0.04;

  // Anéis de energia em órbita vertical
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.015, 6, 16), purpleMat);
  ring1.position.y = 0.56;
  ring1.rotation.x = Math.PI / 3;
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.015, 6, 16), purpleMat);
  ring2.position.y = 0.56;
  ring2.rotation.x = -Math.PI / 3;

  group.add(blade, bladeTip, crossguard, hilt, pommel, ring1, ring2);
}

// ----------------------------------------------------------------------------
// ATO IV: O PÂNTANO DO VAZIO (Fases 31 a 40)
// ----------------------------------------------------------------------------

/** 21. Fanático da Fenda: Cultista do vazio com orbe de antimatéria */
export function buildVoidCultistMini(group: THREE.Group): void {
  const robeMat = new THREE.MeshStandardMaterial({ color: 0x3b0764, roughness: 0.85 });
  const voidMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3 });
  const purpleGlow = new THREE.MeshStandardMaterial({ color: 0xd946ef, emissive: 0xd946ef, emissiveIntensity: 1.5 });

  // Manto do vazio
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.56, 10), robeMat);
  robe.position.y = 0.32;
  robe.castShadow = true;
  group.add(robe);

  // Capuz pontudo escuro com fenda roxa
  const hood = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.26, 8), voidMat);
  hood.position.set(0, 0.66, -0.02);
  hood.rotation.x = -Math.PI / 12;
  const eyeSlit = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.02), purpleGlow);
  eyeSlit.position.set(0, 0.58, 0.1);
  group.add(hood, eyeSlit);

  // Orbe de antimatéria flutuante entre as mãos
  const voidOrb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), voidMat);
  voidOrb.position.set(0, 0.44, 0.26);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 6, 16), purpleGlow);
  halo.position.copy(voidOrb.position);
  halo.rotation.x = Math.PI / 3;
  group.add(voidOrb, halo);
}

/** 22. Tentáculo das Profundezas: Tentáculo colossal ondulante com ventosas */
export function buildAbyssalTentacleMini(group: THREE.Group): void {
  const tentacleMat = new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.6 });
  const suckerMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7c3aed, emissiveIntensity: 0.8 });
  const barbMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.2 });

  // 4 Segmentos curvos ascendentes
  const segs = [
    { x: 0, y: 0.14, z: 0, r: 0.18, rotZ: 0.1 },
    { x: 0.04, y: 0.32, z: 0.04, r: 0.15, rotZ: 0.25 },
    { x: 0.1, y: 0.52, z: 0.06, r: 0.12, rotZ: -0.2 },
    { x: 0.06, y: 0.72, z: 0.02, r: 0.08, rotZ: -0.45 },
  ];

  segs.forEach((s) => {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(s.r * 0.85, s.r, 0.2, 8), tentacleMat);
    seg.position.set(s.x, s.y, s.z);
    seg.rotation.z = s.rotZ;
    seg.castShadow = true;
    group.add(seg);

    // Ventosas bioluminescentes ao longo do tentáculo
    const sucker = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), suckerMat);
    sucker.position.set(s.x + 0.06, s.y, s.z + 0.08);
    group.add(sucker);
  });

  // Ponta afiada venenosa
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 6), barbMat);
  tip.position.set(0.02, 0.86, 0);
  tip.rotation.z = -Math.PI / 4;
  group.add(tip);
}

/** 23. Espreitador Astral: Assassino dimensional com foices no lugar dos braços */
export function buildAstralStalkerMini(group: THREE.Group): void {
  const shadowMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
  const voidGlow = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 1.4 });

  // Tronco esguio
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.36, 8), shadowMat);
  torso.position.y = 0.36;
  torso.castShadow = true;
  group.add(torso);

  // Cabeça alienígena sem rosto com 3 olhos estelares
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 6), shadowMat);
  head.position.set(0, 0.62, 0);
  head.rotation.x = Math.PI;

  const eyeCenter = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), voidGlow);
  eyeCenter.position.set(0, 0.64, 0.1);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), voidGlow);
  eyeL.position.set(-0.05, 0.66, 0.08);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), voidGlow);
  eyeR.position.set(0.05, 0.66, 0.08);
  group.add(head, eyeCenter, eyeL, eyeR);

  // Foices astrais curvadas (Braços-Lâmina)
  [-0.22, 0.22].forEach((x, idx) => {
    const scytheArm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.38, 0.08), voidGlow);
    scytheArm.position.set(x, 0.42, 0.16);
    scytheArm.rotation.x = Math.PI / 4;
    scytheArm.rotation.z = idx === 0 ? Math.PI / 8 : -Math.PI / 8;
    group.add(scytheArm);
  });
}

/** 24. Aberração Miasmática: Lesma mutante com pústulas venenosas e chaminés de gás */
export function buildMiasmaAberrationMini(group: THREE.Group): void {
  const slimeMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.6 });
  const boilMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, emissive: 0x84cc16, emissiveIntensity: 1.2 });
  const ventMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 });

  // Corpo de lesma bulboso
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), slimeMat);
  body.scale.set(1.1, 0.8, 1.3);
  body.position.y = 0.22;
  body.castShadow = true;
  group.add(body);

  // Pústulas venenosas espalhadas
  const boils = [
    [-0.14, 0.32, 0.1],
    [0.12, 0.36, -0.05],
    [0, 0.38, 0.16],
    [-0.08, 0.34, -0.14],
  ];
  boils.forEach(([x, y, z]) => {
    const boil = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), boilMat);
    boil.position.set(x, y, z);
    group.add(boil);
  });

  // Chaminés de ventilação de gás no dorso
  const vent1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.18, 6), ventMat);
  vent1.position.set(-0.08, 0.42, 0.02);
  const vent2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.16, 6), ventMat);
  vent2.position.set(0.08, 0.44, -0.06);
  group.add(vent1, vent2);
}

/** 25. Olho da Perdição: Grande olho flutuante com tentáculos oculares menores */
export function buildMadnessEyeMini(group: THREE.Group): void {
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0xd946ef, emissive: 0xd946ef, emissiveIntensity: 1.6 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2 });
  const stalkMat = new THREE.MeshStandardMaterial({ color: 0x701a75, roughness: 0.7 });

  // Globo ocular central flutuante
  const eyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), eyeWhiteMat);
  eyeBall.position.y = 0.46;
  eyeBall.castShadow = true;

  // Íris e Pupila verticais
  const iris = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), irisMat);
  iris.position.set(0, 0.46, 0.242);
  const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.01), pupilMat);
  pupil.position.set(0, 0.46, 0.245);
  group.add(eyeBall, iris, pupil);

  // 4 Olhinhos menores em tentáculos
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 6), stalkMat);
    stalk.position.set(Math.cos(angle) * 0.24, 0.62 + Math.sin(angle) * 0.08, Math.sin(angle) * 0.18);
    stalk.rotation.z = Math.cos(angle) * 0.5;

    const miniEye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), irisMat);
    miniEye.position.set(Math.cos(angle) * 0.32, 0.72 + Math.sin(angle) * 0.08, Math.sin(angle) * 0.24);
    group.add(stalk, miniEye);
  }
}

/** 26. Devorador Quitináceo: Insetoide do vazio com carapaça índigo e mandíbulas */
export function buildVoidCrawlerMini(group: THREE.Group): void {
  const shellMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.3, metalness: 0.6 });
  const glowMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 1.2 });

  // Carapaça segmentada
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.32, 6, 8), shellMat);
  body.rotation.x = Math.PI / 2.2;
  body.position.set(0, 0.22, 0);
  body.castShadow = true;
  group.add(body);

  // 6 Pernas insetoides angulares
  for (let i = 0; i < 6; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const row = Math.floor(i / 2) - 1;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 4), shellMat);
    leg.position.set(side * 0.2, 0.14, row * 0.14);
    leg.rotation.z = side * (Math.PI / 3);
    group.add(leg);
  }

  // Pinças frontais
  const pincerL = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.16, 4), glowMat);
  pincerL.position.set(-0.08, 0.26, 0.28);
  pincerL.rotation.y = -Math.PI / 4;
  pincerL.rotation.x = Math.PI / 2;
  const pincerR = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.16, 4), glowMat);
  pincerR.position.set(0.08, 0.26, 0.28);
  pincerR.rotation.y = Math.PI / 4;
  pincerR.rotation.x = Math.PI / 2;
  group.add(pincerL, pincerR);
}

/** 27. Sirene do Lodo Negro: Humanoide marinha com barbatana e lanterna bioluminescente */
export function buildAbyssalSirenMini(group: THREE.Group): void {
  const aquaMat = new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.5 });
  const finMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.4, transparent: true, opacity: 0.85 });
  const lureMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.8 });

  // Corpo com cauda serpentina
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.32, 8), aquaMat);
  torso.position.y = 0.36;
  torso.castShadow = true;
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.36, 8), aquaMat);
  tail.position.set(0, 0.12, -0.08);
  tail.rotation.x = -Math.PI / 3;
  group.add(torso, tail);

  // Cabeça com barbatana dorsal
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), aquaMat);
  head.position.set(0, 0.58, 0);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.16), finMat);
  fin.position.set(0, 0.64, -0.06);
  group.add(head, fin);

  // Antena de peixe-pescador com lanterna brilhante (Lure)
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 4), finMat);
  stalk.position.set(0, 0.72, 0.08);
  stalk.rotation.x = Math.PI / 4;
  const light = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), lureMat);
  light.position.set(0, 0.8, 0.18);
  group.add(stalk, light);
}

/** 28. Geleia do Vazio: Domo gelatinoso translúcido com ossos suspensos */
export function buildVoidBlobMini(group: THREE.Group): void {
  const jellyMat = new THREE.MeshStandardMaterial({
    color: 0x6b21a8,
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.72,
  });
  const boneMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });
  const coreMat = new THREE.MeshStandardMaterial({ color: 0xd946ef, emissive: 0xd946ef, emissiveIntensity: 1.2 });

  // Domo gelatinoso translúcido
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), jellyMat);
  dome.position.y = 0.075;
  dome.castShadow = true;
  group.add(dome);

  // Crânio e ossos suspensos dentro da geleia
  const trappedSkull = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), boneMat);
  trappedSkull.position.set(0, 0.22, 0);
  const bone1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 4), boneMat);
  bone1.position.set(-0.08, 0.16, 0.06);
  bone1.rotation.z = Math.PI / 4;
  const coreGlow = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), coreMat);
  coreGlow.position.set(0.06, 0.24, -0.04);
  group.add(trappedSkull, bone1, coreGlow);
}

/** 29. Pesadelo Encarnado: Espectro de pesadelo com máscaras em agonia */
export function buildLivingNightmareMini(group: THREE.Group): void {
  const smokeMat = new THREE.MeshStandardMaterial({ color: 0x4c0519, roughness: 0.7, transparent: true, opacity: 0.85 });
  const maskMat = new THREE.MeshStandardMaterial({ color: 0xfecdd3, roughness: 0.4 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, emissive: 0xe11d48, emissiveIntensity: 1.4 });

  // Corpo esfumaçado
  const torso = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 8), smokeMat);
  torso.rotation.x = Math.PI;
  torso.position.y = 0.42;
  group.add(torso);

  // 3 Máscaras gritando fundidas ao corpo
  const maskPositions = [
    [0, 0.62, 0.08, 0],
    [-0.12, 0.44, 0.12, -0.3],
    [0.12, 0.48, 0.12, 0.3],
  ];
  maskPositions.forEach(([x, y, z, rotY]) => {
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), maskMat);
    face.position.set(x, y, z);
    face.rotation.y = rotY;
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.02), eyeMat);
    mouth.position.set(x, y - 0.03, z + 0.07);
    group.add(face, mouth);
  });
}

/** 30. Parasita Cósmico: Criatura carrapato do éter com bolsa de vida pulsante */
export function buildCosmicParasiteMini(group: THREE.Group): void {
  const chitinMat = new THREE.MeshStandardMaterial({ color: 0x0e7490, metalness: 0.6, roughness: 0.4 });
  const sacMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 1.4 });

  // Carapaça oval baixa
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), chitinMat);
  shell.scale.set(1.2, 0.6, 1.4);
  shell.position.y = 0.14;
  shell.castShadow = true;
  group.add(shell);

  // Saco de éter bioluminescente na parte traseira
  const sac = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), sacMat);
  sac.position.set(0, 0.18, -0.18);
  group.add(sac);

  // 6 Pernas garras
  for (let i = 0; i < 6; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const row = Math.floor(i / 2) - 1;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.16, 0.02), chitinMat);
    leg.position.set(side * 0.22, 0.09, row * 0.12);
    leg.rotation.z = side * (Math.PI / 4);
    group.add(leg);
  }
}

// ----------------------------------------------------------------------------
// ATO V: O ECLIPSE FINAL (Fases 41 a 50)
// ----------------------------------------------------------------------------

/** 31. Templário do Sol Negro: Cavaleiro com elmo de halo solar e espada de eclipse */
export function buildBlackSunTemplarMini(group: THREE.Group): void {
  const blackSteel = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9, roughness: 0.2 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.25 });
  const solarGlow = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.2 });

  // Armadura gótica completa
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.36, 10), blackSteel);
  torso.position.y = 0.38;
  torso.castShadow = true;
  group.add(torso);

  // Brasão do sol negro dourado no peito
  const chestEmblem = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 16), goldMat);
  chestEmblem.position.set(0, 0.42, 0.16);
  group.add(chestEmblem);

  // Elmo com coroa de raios solares (Halo)
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), blackSteel);
  helm.position.set(0, 0.64, 0);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 6, 16), solarGlow);
  halo.position.set(0, 0.66, -0.04);
  group.add(helm, halo);

  // Espada do eclipse e escudo retangular
  const sword = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.52, 0.08), blackSteel);
  sword.position.set(0.26, 0.38, 0.12);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.48, 0.02), solarGlow);
  edge.position.set(0.26, 0.38, 0.16);
  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.44, 0.22), blackSteel);
  shield.position.set(-0.24, 0.36, 0.1);
  group.add(sword, edge, shield);
}

/** 32. Arauto do Eclipse: Sacerdote imperial com estandarte do sol negro */
export function buildEclipseHeraldMini(group: THREE.Group): void {
  const robeMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.8 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
  const eclipseMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3 });
  const fireGlow = new THREE.MeshStandardMaterial({ color: 0xea580c, emissive: 0xea580c, emissiveIntensity: 1.4 });

  // Manto sacerdotal
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.58, 10), robeMat);
  robe.position.y = 0.32;
  robe.castShadow = true;
  group.add(robe);

  // Cabeça com mitra cerimonial
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), robeMat);
  head.position.set(0, 0.64, 0);
  const miter = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 4), goldMat);
  miter.position.set(0, 0.76, 0);
  group.add(head, miter);

  // Estandarte do Eclipse (Mastro com disco negro e chamas solares)
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.92, 6), goldMat);
  pole.position.set(0.24, 0.52, 0.08);
  const sunDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), eclipseMat);
  sunDisc.rotation.x = Math.PI / 2;
  sunDisc.position.set(0.24, 0.98, 0.08);
  const coronaRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.018, 6, 16), fireGlow);
  coronaRing.position.copy(sunDisc.position);
  group.add(pole, sunDisc, coronaRing);
}

/** 33. Grande Inquisidor do Fim: Carrasco com capuz espinhoso e mangual de ferro */
export function buildDoomInquisitorMini(group: THREE.Group): void {
  const cowlMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
  const chainMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.85, roughness: 0.3 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xdc2626, emissiveIntensity: 1.1 });

  // Túnica de carrasco
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.38, 8), cowlMat);
  torso.position.y = 0.36;
  torso.castShadow = true;
  group.add(torso);

  // Capuz pontudo de inquisidor
  const cowl = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 6), cowlMat);
  cowl.position.set(0, 0.68, 0);
  const slit = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.04), redMat);
  slit.position.set(0, 0.58, 0.1);
  group.add(cowl, slit);

  // Correntes nos ombros
  const chains = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 6, 12), chainMat);
  chains.rotation.x = Math.PI / 2;
  chains.position.y = 0.48;
  group.add(chains);

  // Mangual gigante (Flail)
  const haft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.48, 6), chainMat);
  haft.position.set(0.25, 0.38, 0.1);
  haft.rotation.x = Math.PI / 4;
  const spikedBall = new THREE.Mesh(new THREE.DodecahedronGeometry(0.09), chainMat);
  spikedBall.position.set(0.32, 0.58, 0.28);
  group.add(haft, spikedBall);
}

/** 34. Serafim das Asas de Navalha: Anjo caído com 4 asas metálicas em X */
export function buildFallenSeraphMini(group: THREE.Group): void {
  const seraphMat = new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.5 });
  const bladeWingMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
  const haloMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 1.5 });

  // Corpo esguio em levitação
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.08, 0.38, 8), seraphMat);
  torso.position.y = 0.42;
  torso.castShadow = true;
  group.add(torso);

  // Cabeça com máscara dourada vendada
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), seraphMat);
  head.position.set(0, 0.66, 0);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.016, 6, 16), haloMat);
  halo.position.set(0, 0.82, -0.02);
  halo.rotation.x = Math.PI / 6;
  group.add(head, halo);

  // 4 Asas em lâmina afiada dispostas em X
  const wingConfigs = [
    [-0.24, 0.62, -0.1, Math.PI / 6, Math.PI / 6],
    [0.24, 0.62, -0.1, -Math.PI / 6, -Math.PI / 6],
    [-0.26, 0.36, -0.1, Math.PI / 6, -Math.PI / 4],
    [0.26, 0.36, -0.1, -Math.PI / 6, Math.PI / 4],
  ];
  wingConfigs.forEach(([x, y, z, rotY, rotZ]) => {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.02), bladeWingMat);
    wing.position.set(x, y, z);
    wing.rotation.y = rotY;
    wing.rotation.z = rotZ;
    group.add(wing);
  });
}

/** 35. Colosso de Obsidiana: Monstro de vidro vulcânico negro com fissuras de magma */
export function buildObsidianColossusMini(group: THREE.Group): void {
  const obsidianMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9, roughness: 0.1 });
  const magmaMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.4 });

  // Tronco chanfrado gigante
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.42, 0.28), obsidianMat);
  torso.position.y = 0.4;
  torso.castShadow = true;
  group.add(torso);

  // Fissuras de magma no peito
  const crack1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.02), magmaMat);
  crack1.position.set(-0.06, 0.4, 0.15);
  crack1.rotation.z = Math.PI / 8;
  const crack2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.02), magmaMat);
  crack2.position.set(0.06, 0.4, 0.15);
  crack2.rotation.z = -Math.PI / 8;
  group.add(crack1, crack2);

  // Cabeça angular com olhos de fogo
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.18), obsidianMat);
  head.position.set(0, 0.66, 0.02);
  const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.04), magmaMat);
  eyes.position.set(0, 0.66, 0.11);
  group.add(head, eyes);

  // Braços pesados com punhos de rocha
  [-0.28, 0.28].forEach((x) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.32, 0.16), obsidianMat);
    arm.position.set(x, 0.36, 0.08);
    group.add(arm);
  });
}

/** 36. Ceifador do Crepúsculo: Morte de manto rubro com foice monumental */
export function buildTwilightReaperMini(group: THREE.Group): void {
  const shroudMat = new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.85 });
  const boneMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });

  // Manto esfarrapado carmesim
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.6, 10), shroudMat);
  robe.position.y = 0.34;
  robe.castShadow = true;
  group.add(robe);

  // Capuz de carrasco
  const hood = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.26, 8), shroudMat);
  hood.position.set(0, 0.68, -0.04);
  hood.rotation.x = -Math.PI / 10;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), boneMat);
  skull.position.set(0, 0.62, 0.05);
  group.add(hood, skull);

  // Foice colossal curvada
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6), shroudMat);
  shaft.position.set(0.26, 0.5, 0.08);
  shaft.rotation.z = -Math.PI / 12;
  const scytheBlade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.44), steelMat);
  scytheBlade.position.set(0.26, 0.94, 0.22);
  scytheBlade.rotation.y = Math.PI / 6;
  group.add(shaft, scytheBlade);
}

/** 37. Algoz do Trono Eterno: Assassino dourado com lâminas crescentes */
export function buildCelestialSlayerMini(group: THREE.Group): void {
  const goldArmor = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.2 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
  const radiantGlow = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 1.4 });

  // Armadura elegante dourada
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.32, 8), goldArmor);
  torso.position.y = 0.36;
  torso.castShadow = true;
  group.add(torso);

  // Elmo dourado com visor radiante
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), goldArmor);
  helm.position.set(0, 0.6, 0);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.04), radiantGlow);
  visor.position.set(0, 0.6, 0.09);
  group.add(helm, visor);

  // Cachecol / capa branca celestial
  const cape = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 0.02), whiteMat);
  cape.position.set(0, 0.36, -0.12);
  cape.rotation.x = Math.PI / 12;
  group.add(cape);

  // Duas adagas crescentes douradas
  [-0.22, 0.22].forEach((x, idx) => {
    const dagger = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.016, 6, 12, Math.PI), radiantGlow);
    dagger.position.set(x, 0.38, 0.12);
    dagger.rotation.y = idx === 0 ? Math.PI / 4 : -Math.PI / 4;
    group.add(dagger);
  });
}

/** 38. Escriba do Destino: Erudito com pergaminho mágico em espiral */
export function buildFateScribeMini(group: THREE.Group): void {
  const robeMat = new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.7 });
  const scrollMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
  const starGlow = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0xc084fc, emissiveIntensity: 1.4 });

  // Túnica violeta com estrelas
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.58, 10), robeMat);
  robe.position.y = 0.32;
  robe.castShadow = true;
  group.add(robe);

  // Cabeça com tiara estelar
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), robeMat);
  head.position.set(0, 0.64, 0);
  const starTiara = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 4), starGlow);
  starTiara.position.set(0, 0.76, 0.04);
  group.add(head, starTiara);

  // Pergaminho antigo desenrolando em espiral
  const scrollSpiral = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.024, 6, 20), scrollMat);
  scrollSpiral.position.set(0, 0.42, 0.08);
  scrollSpiral.rotation.x = Math.PI / 3;
  const quill = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.005, 0.22, 4), starGlow);
  quill.position.set(0.18, 0.52, 0.2);
  quill.rotation.z = Math.PI / 4;
  group.add(scrollSpiral, quill);
}

/** 39. Pretoriano do Apocalipse: Legionário com crista alta, escudo e pilo farpado */
export function buildChaosPraetorianMini(group: THREE.Group): void {
  const redArmor = new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.85, roughness: 0.25 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.25 });
  const crestMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.8 });

  // Peitoral blindado
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.34, 10), redArmor);
  torso.position.y = 0.36;
  torso.castShadow = true;
  group.add(torso);

  // Elmo pretoriano com crista transversal vermelha
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), goldMat);
  helm.position.set(0, 0.62, 0);
  const plume = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.1, 0.04), crestMat);
  plume.position.set(0, 0.74, 0);
  group.add(helm, plume);

  // Escudo retangular de legião (Scutum)
  const scutum = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.48, 0.26), redArmor);
  scutum.position.set(-0.24, 0.36, 0.1);
  const boss = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), goldMat);
  boss.position.set(-0.24, 0.36, 0.1);
  group.add(scutum, boss);

  // Pilo farpado (Lança)
  const pilum = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.86, 6), goldMat);
  pilum.position.set(0.22, 0.46, 0.1);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.18, 4), goldMat);
  tip.position.set(0.22, 0.92, 0.1);
  group.add(pilum, tip);
}

/** 40. Avatar do Cataclismo: Deidade cósmica com meteoros e chamas estelares */
export function buildCataclysmAvatarMini(group: THREE.Group): void {
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0xd50000, emissiveIntensity: 1.2 });
  const hornMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.4 });
  const meteorMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
  const fireGlow = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 1.8 });

  // Tronco de fogo cósmico
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.36, 8), bodyMat);
  torso.position.y = 0.38;
  torso.castShadow = true;
  group.add(torso);

  // Cabeça com coroa de chifres estelares
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), bodyMat);
  head.position.set(0, 0.64, 0);
  const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.22, 4), hornMat);
  hornL.position.set(-0.12, 0.78, 0);
  hornL.rotation.z = Math.PI / 4;
  const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.22, 4), hornMat);
  hornR.position.set(0.12, 0.78, 0);
  hornR.rotation.z = -Math.PI / 4;
  group.add(head, hornL, hornR);

  // 2 Meteoritos em órbita das mãos
  [-0.26, 0.26].forEach((x) => {
    const meteor = new THREE.Mesh(new THREE.DodecahedronGeometry(0.07), meteorMat);
    meteor.position.set(x, 0.44, 0.16);
    const flare = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), fireGlow);
    flare.position.set(x, 0.44, 0.16);
    group.add(meteor, flare);
  });
}

// ============================================================================
// MAP OF ALL NORMAL MONSTER MINI BUILDERS (ACTS II - V)
// ============================================================================
export const NORMAL_MONSTER_BUILDERS: Record<string, (group: THREE.Group) => void> = {
  // ATO II (Fases 11-20)
  kobold_gunner: buildKoboldGunnerMini,
  magma_lizard: buildMagmaLizardMini,
  cursed_blacksmith: buildCursedBlacksmithMini,
  ember_elemental: buildEmberElementalMini,
  steam_golem: buildSteamGolemMini,
  pyromancer: buildPyromancerMini,
  ash_specter: buildAshSpecterMini,
  lava_worm: buildLavaWormMini,
  iron_gargoyle: buildIronGargoyleMini,
  hell_hound: buildHellHoundMini,

  // ATO III (Fases 21-30)
  berserker_warrior: buildBerserkerWarriorMini,
  steppe_hunter: buildSteppeHunterMini,
  storm_shaman: buildStormShamanMini,
  rune_construct: buildRuneConstructMini,
  war_bear: buildWarBearMini,
  dark_valkyrie: buildDarkValkyrieMini,
  glyph_weaver: buildGlyphWeaverMini,
  thunder_wolf: buildThunderWolfMini,
  megalith_guardian: buildMegalithGuardianMini,
  rune_blade: buildRuneBladeMini,

  // ATO IV (Fases 31-40)
  void_cultist: buildVoidCultistMini,
  abyssal_tentacle: buildAbyssalTentacleMini,
  astral_stalker: buildAstralStalkerMini,
  miasma_aberration: buildMiasmaAberrationMini,
  madness_eye: buildMadnessEyeMini,
  void_crawler: buildVoidCrawlerMini,
  abyssal_siren: buildAbyssalSirenMini,
  void_blob: buildVoidBlobMini,
  living_nightmare: buildLivingNightmareMini,
  cosmic_parasite: buildCosmicParasiteMini,

  // ATO V (Fases 41-50)
  black_sun_templar: buildBlackSunTemplarMini,
  eclipse_herald: buildEclipseHeraldMini,
  doom_inquisitor: buildDoomInquisitorMini,
  fallen_seraph: buildFallenSeraphMini,
  obsidian_colossus: buildObsidianColossusMini,
  twilight_reaper: buildTwilightReaperMini,
  celestial_slayer: buildCelestialSlayerMini,
  fate_scribe: buildFateScribeMini,
  chaos_praetorian: buildChaosPraetorianMini,
  cataclysm_avatar: buildCataclysmAvatarMini,
};
