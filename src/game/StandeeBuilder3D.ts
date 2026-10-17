import * as THREE from 'three';
import type { Unit } from '../types/game';

// Texture cache to prevent redundant canvas drawing
const standeeTextureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates a high-resolution 2D CanvasTexture with a die-cut white border
 * matching the tabletop / HD-2D Standee aesthetic.
 */
export function getStandeeTexture(avatarKey: string, faction: 'player' | 'enemy', isBoss?: boolean): THREE.CanvasTexture {
  const cacheKey = `${avatarKey}_${faction}_${isBoss ? 'boss' : 'norm'}`;
  if (standeeTextureCache.has(cacheKey)) {
    return standeeTextureCache.get(cacheKey)!;
  }

  // 1. Draw character illustration on offscreen canvas
  const size = 512;
  const charCanvas = document.createElement('canvas');
  charCanvas.width = size;
  charCanvas.height = size;
  const cctx = charCanvas.getContext('2d')!;
  cctx.imageSmoothingEnabled = true;
  cctx.imageSmoothingQuality = 'high';

  // Draw the specific character illustration
  drawCharacterIllustration(cctx, avatarKey, faction, isBoss);

  // 2. Generate pure white silhouette for the die-cut border
  const silCanvas = document.createElement('canvas');
  silCanvas.width = size;
  silCanvas.height = size;
  const sctx = silCanvas.getContext('2d')!;
  sctx.drawImage(charCanvas, 0, 0);
  sctx.globalCompositeOperation = 'source-in';
  sctx.fillStyle = '#FFFFFF';
  sctx.fillRect(0, 0, size, size);

  // 3. Composite final standee card with white border and drop shadow
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = size;
  finalCanvas.height = size;
  const fctx = finalCanvas.getContext('2d')!;
  fctx.imageSmoothingEnabled = true;
  fctx.imageSmoothingQuality = 'high';

  // Soft drop shadow behind sticker
  fctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  fctx.shadowBlur = 12;
  fctx.shadowOffsetY = 6;

  // Dilated white border around character silhouette (radius 12px)
  const borderWidth = 12;
  const steps = 24;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const ox = Math.cos(angle) * borderWidth;
    const oy = Math.sin(angle) * borderWidth;
    fctx.drawImage(silCanvas, ox, oy);
  }
  // Fill central body
  fctx.drawImage(silCanvas, 0, 0);

  // Reset shadow before painting character art
  fctx.shadowColor = 'transparent';
  fctx.shadowBlur = 0;
  fctx.shadowOffsetY = 0;

  // Stamp detailed character illustration inside the border
  fctx.drawImage(charCanvas, 0, 0);

  // Create Three.js Texture
  const texture = new THREE.CanvasTexture(finalCanvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  standeeTextureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Builds the complete 3D Standee Unit model:
 * - Plastic colored token base with slot
 * - Die-cut cardboard/acrylic standee card facing the player
 */
export function createStandeeModel(
  unit: Unit,
  createHpBar: (unit: Unit) => THREE.Group,
  createAuras: (unit: Unit) => THREE.Group
): THREE.Group {
  const group = new THREE.Group();
  const isPlayer = unit.faction === 'player';
  const isBoss = unit.isBoss || unit.isMiniBoss;

  // 1. Token Base (Round Plastic Miniature Disc)
  const baseRadius = isBoss ? 0.58 : 0.38;
  const baseHeight = isBoss ? 0.09 : 0.07;
  const baseGeo = new THREE.CylinderGeometry(baseRadius * 0.92, baseRadius, baseHeight, 24);

  // Base plastic color
  const baseColor = isBoss
    ? 0x7e22ce // Royal Purple
    : isPlayer
    ? 0x2563eb // Vibrant Azure Blue
    : 0xdc2626; // Bold Crimson Red

  const baseMat = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.35,
    metalness: 0.2,
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = baseHeight / 2;
  baseMesh.receiveShadow = true;
  baseMesh.castShadow = true;
  group.add(baseMesh);

  // Gilded / Glossy Rim Ring
  const rimGeo = new THREE.TorusGeometry(baseRadius * 0.92, 0.02, 8, 24);
  rimGeo.rotateX(Math.PI / 2);
  const rimColor = isBoss ? 0xf59e0b : isPlayer ? 0x60a5fa : 0xf87171;
  const rimMat = new THREE.MeshStandardMaterial({
    color: rimColor,
    emissive: rimColor,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.5,
  });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.position.y = baseHeight;
  group.add(rimMesh);

  // Standee Insertion Slot (Dark Clip on top of the base)
  const slotWidth = isBoss ? 0.55 : 0.36;
  const slotGeo = new THREE.BoxGeometry(slotWidth, 0.02, 0.05);
  const slotMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
  const slotMesh = new THREE.Mesh(slotGeo, slotMat);
  slotMesh.position.set(0, baseHeight + 0.005, 0);
  group.add(slotMesh);

  // 2. Die-Cut Standee Card (Cardboard / Acrylic cutout)
  const cardWidth = isBoss ? 1.15 : 0.78;
  const cardHeight = isBoss ? 1.35 : 0.92;
  const cardGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);

  const texture = getStandeeTexture(unit.avatarKey, unit.faction, unit.isBoss || unit.isMiniBoss);
  const cardMat = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.05,
    roughness: 0.45,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const cardMesh = new THREE.Mesh(cardGeo, cardMat);
  // Bottom of card sits directly inside slot
  cardMesh.position.set(0, baseHeight + cardHeight / 2, 0);
  cardMesh.castShadow = true;
  cardMesh.name = 'standeeCard';
  group.add(cardMesh);

  // 3. Attach HP Bar and Status Auras
  group.add(createHpBar(unit));
  group.add(createAuras(unit));

  return group;
}

/**
 * Adjusts standee card tilt and facing in the render loop so it is always
 * perfectly readable from isometric (45°) and top-down (90°) views.
 */
export function updateStandeeOrientations(
  unitsGroup: THREE.Group,
  cameraMode: 'isometric' | 'topdown'
) {
  const tiltAngle = cameraMode === 'topdown' ? -Math.PI / 3.2 : -Math.PI / 8; // ~56° topdown, ~22° isometric

  unitsGroup.traverse((child) => {
    if (child.name === 'standeeCard') {
      child.rotation.x = tiltAngle;
    }
  });
}

// ============================================================================
// CHARACTER ARTWORK DRAWING ROUTINES (512x512 High-Res Stylized 2D Art)
// ============================================================================

function drawCharacterIllustration(
  ctx: CanvasRenderingContext2D,
  avatarKey: string,
  faction: 'player' | 'enemy',
  isBoss?: boolean
) {
  const cx = 256;
  const cy = 290;

  switch (avatarKey) {
    case 'warrior':
      drawWarrior(ctx, cx, cy);
      break;
    case 'archer':
      drawArcher(ctx, cx, cy);
      break;
    case 'mage':
      drawMage(ctx, cx, cy);
      break;
    case 'cleric':
      drawCleric(ctx, cx, cy);
      break;
    case 'assassin':
      drawAssassin(ctx, cx, cy);
      break;
    case 'arcane_knight':
      drawArcaneKnight(ctx, cx, cy);
      break;
    case 'necromancer':
      drawNecromancer(ctx, cx, cy);
      break;
    case 'engineer':
      drawEngineer(ctx, cx, cy);
      break;
    case 'rune_mage':
      drawRuneMage(ctx, cx, cy);
      break;
    case 'berserker':
      drawBerserker(ctx, cx, cy);
      break;
    case 'goblin':
      drawGoblin(ctx, cx, cy);
      break;
    case 'orc':
      drawOrc(ctx, cx, cy);
      break;
    case 'spider':
      drawSpider(ctx, cx, cy);
      break;
    case 'dark_mage':
      drawDarkMage(ctx, cx, cy);
      break;
    case 'spectral_wolf':
      drawSpectralWolf(ctx, cx, cy);
      break;
    case 'basalt_golem':
      drawBasaltGolem(ctx, cx, cy);
      break;
    case 'thorn_witch':
      drawThornWitch(ctx, cx, cy);
      break;
    case 'fallen_knight':
      drawFallenKnight(ctx, cx, cy);
      break;
    case 'mimic':
      drawMimic(ctx, cx, cy);
      break;
    case 'volcanic_drake':
      drawVolcanicDrake(ctx, cx, cy);
      break;
    case 'devourer_boss':
      drawDevourerBoss(ctx, cx, cy);
      break;
    case 'astaroth_boss':
      drawAstarothBoss(ctx, cx, cy);
      break;
    default:
      drawFallbackHero(ctx, cx, cy, faction, isBoss);
      break;
  }
}

// -------------------------------------------------------------
// 1. WARRIOR (Knight with Full Plate, Visor, Shield & Sword)
// -------------------------------------------------------------
function drawWarrior(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Legs & Boots
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 5;
  roundRect(ctx, cx - 48, cy + 85, 36, 65, 8, true, true);
  roundRect(ctx, cx + 12, cy + 85, 36, 65, 8, true, true);
  // Boots
  ctx.fillStyle = '#334155';
  roundRect(ctx, cx - 56, cy + 125, 46, 26, 6, true, true);
  roundRect(ctx, cx + 10, cy + 125, 46, 26, 6, true, true);

  // Breastplate Torso
  ctx.fillStyle = '#64748b';
  roundRect(ctx, cx - 55, cy - 20, 110, 110, 16, true, true);
  // Chest Emblem (Royal Blue Plate)
  ctx.fillStyle = '#2563eb';
  roundRect(ctx, cx - 42, cy - 10, 84, 55, 10, true, true);
  // Gold Trim
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.strokeRect(cx - 36, cy - 5, 72, 45);

  // Belt & Buckle
  ctx.fillStyle = '#78350f';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  roundRect(ctx, cx - 50, cy + 68, 100, 18, 4, true, true);
  ctx.fillStyle = '#f59e0b';
  roundRect(ctx, cx - 14, cy + 65, 28, 24, 4, true, true);

  // Helmet
  ctx.fillStyle = '#94a3b8';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 5;
  roundRect(ctx, cx - 46, cy - 110, 92, 92, 24, true, true);
  // Helmet Top Crest
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.moveTo(cx - 16, cy - 110);
  ctx.lineTo(cx, cy - 138);
  ctx.lineTo(cx + 16, cy - 110);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Visor Slit with Cyan Glow
  ctx.fillStyle = '#0f172a';
  roundRect(ctx, cx - 34, cy - 75, 68, 16, 4, true, true);
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 8;
  roundRect(ctx, cx - 28, cy - 72, 56, 10, 2, true, false);
  ctx.shadowBlur = 0;

  // Tower / Kite Shield (Left Arm)
  ctx.save();
  ctx.translate(cx + 70, cy + 25);
  ctx.rotate(0.08);
  ctx.fillStyle = '#1e3a8a';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-35, -55);
  ctx.lineTo(35, -55);
  ctx.lineTo(32, 25);
  ctx.lineTo(0, 68);
  ctx.lineTo(-32, 25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Shield Golden Cross/Border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-6, -40, 12, 70);
  ctx.fillRect(-24, -20, 48, 12);
  ctx.restore();

  // Gleaming Longsword (Right Arm)
  ctx.save();
  ctx.translate(cx - 85, cy + 20);
  ctx.rotate(-0.15);
  // Blade
  ctx.fillStyle = '#e2e8f0';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-8, 10);
  ctx.lineTo(-8, -125);
  ctx.lineTo(0, -145);
  ctx.lineTo(8, -125);
  ctx.lineTo(8, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Central fuller
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.lineTo(0, -120);
  ctx.stroke();
  // Crossguard & Pommel
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;
  roundRect(ctx, -26, 10, 52, 12, 3, true, true);
  // Grip
  ctx.fillStyle = '#78350f';
  roundRect(ctx, -5, 22, 10, 24, 2, true, true);
  // Pommel
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(0, 50, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Pauldrons (Shoulders)
  ctx.fillStyle = '#64748b';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  roundRect(ctx, cx - 82, cy - 25, 34, 34, 10, true, true);
  roundRect(ctx, cx + 48, cy - 25, 34, 34, 10, true, true);
}

// -------------------------------------------------------------
// 2. ARCHER (Forest Ranger with Hood, Bow & Quiver)
// -------------------------------------------------------------
function drawArcher(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Legs & Leather Boots
  ctx.fillStyle = '#78350f';
  ctx.strokeStyle = '#271206';
  ctx.lineWidth = 4;
  roundRect(ctx, cx - 38, cy + 85, 28, 65, 6, true, true);
  roundRect(ctx, cx + 10, cy + 85, 28, 65, 6, true, true);
  ctx.fillStyle = '#451a03';
  roundRect(ctx, cx - 44, cy + 125, 38, 26, 6, true, true);
  roundRect(ctx, cx + 6, cy + 125, 38, 26, 6, true, true);

  // Quiver on Back (visible above shoulder)
  ctx.fillStyle = '#78350f';
  ctx.strokeStyle = '#271206';
  ctx.lineWidth = 4;
  roundRect(ctx, cx + 42, cy - 90, 24, 80, 6, true, true);
  // Arrow fletchings
  ctx.fillStyle = '#fef08a';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + 46 + i * 6, cy - 90);
    ctx.lineTo(cx + 50 + i * 6, cy - 110);
    ctx.lineTo(cx + 54 + i * 6, cy - 90);
    ctx.fill();
    ctx.stroke();
  }

  // Green Tunic Torso
  ctx.fillStyle = '#166534';
  ctx.strokeStyle = '#052e16';
  ctx.lineWidth = 4;
  roundRect(ctx, cx - 45, cy - 15, 90, 105, 14, true, true);

  // Brown Leather Vest & Belt
  ctx.fillStyle = '#92400e';
  roundRect(ctx, cx - 32, cy + 5, 64, 55, 8, true, false);
  ctx.fillStyle = '#451a03';
  roundRect(ctx, cx - 42, cy + 65, 84, 16, 4, true, true);

  // Face
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(cx, cy - 55, 32, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(cx - 12, cy - 55, 5, 0, Math.PI * 2);
  ctx.arc(cx + 12, cy - 55, 5, 0, Math.PI * 2);
  ctx.fill();

  // Green Archer Hood
  ctx.fillStyle = '#14532d';
  ctx.strokeStyle = '#052e16';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx - 48, cy - 40);
  ctx.lineTo(cx - 40, cy - 95);
  ctx.lineTo(cx, cy - 130); // Pointed peak
  ctx.lineTo(cx + 40, cy - 95);
  ctx.lineTo(cx + 48, cy - 40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Recurve Longbow (Left Hand)
  ctx.save();
  ctx.translate(cx - 65, cy + 10);
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(0, 0, 75, -Math.PI / 2.2, Math.PI / 2.2);
  ctx.stroke();
  // Bowstring
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(25, -70);
  ctx.lineTo(25, 70);
  ctx.stroke();
  // Nocked Arrow
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(25, 0);
  ctx.lineTo(-65, 0);
  ctx.stroke();
  // Arrowhead
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(-65, -8);
  ctx.lineTo(-82, 0);
  ctx.lineTo(-65, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// -------------------------------------------------------------
// 3. MAGE (Arcane Sorcerer with Pointed Hat, Robes & Crystal Staff)
// -------------------------------------------------------------
function drawMage(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Flowing Violet Robes
  ctx.fillStyle = '#581c87';
  ctx.strokeStyle = '#2e1065';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx - 45, cy - 15);
  ctx.lineTo(cx + 45, cy - 15);
  ctx.lineTo(cx + 65, cy + 145);
  ctx.lineTo(cx - 65, cy + 145);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gold Embroidery Hem
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(cx - 63, cy + 130, 126, 15);

  // Long White Beard
  ctx.fillStyle = '#f1f5f9';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 28, cy - 42);
  ctx.quadraticCurveTo(cx - 20, cy + 45, cx, cy + 65);
  ctx.quadraticCurveTo(cx + 20, cy + 45, cx + 28, cy - 42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wizard Face & Eyebrows
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(cx, cy - 60, 26, 0, Math.PI * 2);
  ctx.fill();
  // Sparkling Eyes
  ctx.fillStyle = '#06b6d4';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(cx - 10, cy - 62, 4, 0, Math.PI * 2);
  ctx.arc(cx + 10, cy - 62, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Wizard Hat Brim
  ctx.fillStyle = '#7e22ce';
  ctx.strokeStyle = '#2e1065';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 82, 68, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Wizard Hat Cone (Pointed Tip)
  ctx.beginPath();
  ctx.moveTo(cx - 45, cy - 85);
  ctx.quadraticCurveTo(cx - 20, cy - 150, cx + 15, cy - 175);
  ctx.lineTo(cx + 35, cy - 85);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gold Hat Band
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(cx - 42, cy - 95, 78, 10);

  // Arcane Crystal Staff (Right Hand)
  ctx.save();
  ctx.translate(cx + 78, cy + 20);
  // Gnarled Wooden Pole
  ctx.fillStyle = '#451a03';
  ctx.strokeStyle = '#1e0a02';
  ctx.lineWidth = 4;
  roundRect(ctx, -7, -130, 14, 250, 4, true, true);
  // Top Staff Crown Prongs
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.moveTo(-16, -125);
  ctx.lineTo(-24, -155);
  ctx.lineTo(-10, -145);
  ctx.lineTo(0, -135);
  ctx.lineTo(10, -145);
  ctx.lineTo(24, -155);
  ctx.lineTo(16, -125);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Floating Arcane Cyan Crystal Orb
  ctx.fillStyle = '#22d3ee';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(0, -165, 22, 0, Math.PI * 2);
  ctx.fill();
  // Inner Core
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -165, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

// -------------------------------------------------------------
// 4. CLERIC (Radiant Priest with Halo, Wings, Robes & Scepter)
// -------------------------------------------------------------
function drawCleric(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Luminous Angel Wings behind shoulders
  ctx.save();
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 4;
  // Left Wing
  ctx.beginPath();
  ctx.moveTo(cx - 40, cy);
  ctx.quadraticCurveTo(cx - 130, cy - 70, cx - 110, cy - 120);
  ctx.quadraticCurveTo(cx - 75, cy - 80, cx - 65, cy - 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Right Wing
  ctx.beginPath();
  ctx.moveTo(cx + 40, cy);
  ctx.quadraticCurveTo(cx + 130, cy - 70, cx + 110, cy - 120);
  ctx.quadraticCurveTo(cx + 75, cy - 80, cx + 65, cy - 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // White & Gold Cleric Robes
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 5;
  roundRect(ctx, cx - 52, cy - 20, 104, 160, 16, true, true);

  // Golden Stole / Tabard
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 3;
  roundRect(ctx, cx - 22, cy - 15, 44, 150, 6, true, true);
  // Holy Sun / Cross Motif
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy + 30, 12, 0, Math.PI * 2);
  ctx.fill();

  // Cleric Head & Circlet
  ctx.fillStyle = '#fed7aa';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy - 65, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Calm Holy Eyes
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(cx - 12, cy - 65, 4, 0, Math.PI * 2);
  ctx.arc(cx + 12, cy - 65, 4, 0, Math.PI * 2);
  ctx.fill();

  // Floating Golden Halo
  ctx.save();
  ctx.strokeStyle = '#facc15';
  ctx.shadowColor = '#eab308';
  ctx.shadowBlur = 18;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 120, 48, 14, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Divine Golden Scepter / Morningstar (Right Hand)
  ctx.save();
  ctx.translate(cx + 70, cy + 20);
  ctx.fillStyle = '#e2e8f0';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 4;
  roundRect(ctx, -5, -100, 10, 200, 3, true, true);
  // Golden Starburst Head
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#b45309';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(0, -115, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();
}

// -------------------------------------------------------------
// 5. GOBLIN (Green Skin, Big Ears, Red Eyes & Dagger)
// -------------------------------------------------------------
function drawGoblin(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Little legs & rags
  ctx.fillStyle = '#22c55e';
  ctx.strokeStyle = '#14532d';
  ctx.lineWidth = 4;
  roundRect(ctx, cx - 42, cy + 80, 26, 45, 6, true, true);
  roundRect(ctx, cx + 16, cy + 80, 26, 45, 6, true, true);

  // Scrawny Torso with Leather Vest
  ctx.fillStyle = '#78350f';
  roundRect(ctx, cx - 38, cy + 15, 76, 75, 12, true, true);

  // Floppy Pointed Goblin Ears
  ctx.fillStyle = '#4ade80';
  ctx.strokeStyle = '#14532d';
  ctx.lineWidth = 5;
  // Left Ear
  ctx.beginPath();
  ctx.moveTo(cx - 35, cy - 20);
  ctx.lineTo(cx - 105, cy - 45);
  ctx.lineTo(cx - 40, cy + 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Right Ear
  ctx.beginPath();
  ctx.moveTo(cx + 35, cy - 20);
  ctx.lineTo(cx + 105, cy - 45);
  ctx.lineTo(cx + 40, cy + 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Goblin Head
  ctx.beginPath();
  ctx.arc(cx, cy - 25, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Wicked Yellow Glowing Eyes with Slit Pupils
  ctx.fillStyle = '#facc15';
  ctx.shadowColor = '#eab308';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(cx - 16, cy - 30, 9, 0, Math.PI * 2);
  ctx.arc(cx + 16, cy - 30, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Black Slits
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cx - 18, cy - 37, 4, 14);
  ctx.fillRect(cx + 14, cy - 37, 4, 14);

  // Tooth grin with sharp fangs
  ctx.fillStyle = '#450a0a';
  ctx.beginPath();
  ctx.arc(cx, cy - 8, 22, 0, Math.PI);
  ctx.fill();
  // White sharp fangs
  ctx.fillStyle = '#fef08a';
  for (let xOff of [-12, -4, 4, 12]) {
    ctx.beginPath();
    ctx.moveTo(cx + xOff - 3, cy - 8);
    ctx.lineTo(cx + xOff, cy - 1);
    ctx.lineTo(cx + xOff + 3, cy - 8);
    ctx.fill();
  }

  // Serrated Rusted Dagger (Right Hand)
  ctx.save();
  ctx.translate(cx + 65, cy + 30);
  ctx.rotate(0.25);
  ctx.fillStyle = '#64748b';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-6, 20);
  ctx.lineTo(-6, -70);
  ctx.lineTo(-16, -60);
  ctx.lineTo(-6, -45);
  ctx.lineTo(0, -95); // Dagger tip
  ctx.lineTo(6, -70);
  ctx.lineTo(6, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Crossguard
  ctx.fillStyle = '#78350f';
  roundRect(ctx, -18, 15, 36, 10, 2, true, true);
  ctx.restore();
}

// -------------------------------------------------------------
// 6. ORC (Muscular Red/Green Brute, Spiked Club & Tusks)
// -------------------------------------------------------------
function drawOrc(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Heavy Muscular Torso
  ctx.fillStyle = '#991b1b';
  ctx.strokeStyle = '#450a0a';
  ctx.lineWidth = 6;
  roundRect(ctx, cx - 65, cy - 15, 130, 140, 20, true, true);

  // Spiked Iron Shoulder Armor
  ctx.fillStyle = '#3f3f46';
  roundRect(ctx, cx - 88, cy - 25, 42, 42, 10, true, true);
  // Spike on shoulder
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(cx - 78, cy - 25);
  ctx.lineTo(cx - 68, cy - 55);
  ctx.lineTo(cx - 58, cy - 25);
  ctx.fill();

  // Orc Head
  ctx.fillStyle = '#991b1b';
  roundRect(ctx, cx - 48, cy - 90, 96, 85, 20, true, true);

  // Piercing Red Eyes
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(cx - 18, cy - 65, 8, 0, Math.PI * 2);
  ctx.arc(cx + 18, cy - 65, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Giant Ivory Tusks rising from lower jaw
  ctx.fillStyle = '#fef08a';
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 3;
  // Left Tusk
  ctx.beginPath();
  ctx.moveTo(cx - 28, cy - 25);
  ctx.quadraticCurveTo(cx - 38, cy - 55, cx - 32, cy - 70);
  ctx.lineTo(cx - 20, cy - 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Right Tusk
  ctx.beginPath();
  ctx.moveTo(cx + 28, cy - 25);
  ctx.quadraticCurveTo(cx + 38, cy - 55, cx + 32, cy - 70);
  ctx.lineTo(cx + 20, cy - 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Spiked Heavy War Club (Left Hand)
  ctx.save();
  ctx.translate(cx + 85, cy + 10);
  ctx.rotate(0.2);
  ctx.fillStyle = '#3f3f46';
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 5;
  roundRect(ctx, -14, -130, 28, 220, 8, true, true);
  // Spikes protruding from club
  ctx.fillStyle = '#e2e8f0';
  for (let sy of [-110, -85, -60]) {
    ctx.fillRect(-26, sy, 14, 8);
    ctx.fillRect(12, sy, 14, 8);
  }
  ctx.restore();
}

// -------------------------------------------------------------
// 7. ASSASSIN (Shadow Cowl, Red Slit Eyes & Crimson Daggers)
// -------------------------------------------------------------
function drawAssassin(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Midnight Cloak
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 5;
  roundRect(ctx, cx - 48, cy - 10, 96, 145, 16, true, true);

  // Assassin Cowl / Hood
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.arc(cx, cy - 65, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Glowing Red Slit Visor Eyes in pitch darkness
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 14;
  roundRect(ctx, cx - 26, cy - 70, 52, 8, 3, true, false);
  ctx.shadowBlur = 0;

  // Dual Crimson Poison Daggers
  for (let side of [-1, 1]) {
    ctx.save();
    ctx.translate(cx + side * 68, cy + 35);
    ctx.rotate(side * -0.3);
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 25);
    ctx.lineTo(0, -75);
    ctx.lineTo(side * 14, -60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

// -------------------------------------------------------------
// 8. ARCANE KNIGHT (Crystal Paladin with Glowing Greatsword)
// -------------------------------------------------------------
function drawArcaneKnight(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Azure Plate Armor
  ctx.fillStyle = '#0e7490';
  ctx.strokeStyle = '#155e75';
  ctx.lineWidth = 5;
  roundRect(ctx, cx - 55, cy - 20, 110, 150, 16, true, true);

  // Helmet with Cyan Crystal Crest
  ctx.fillStyle = '#164e63';
  roundRect(ctx, cx - 42, cy - 95, 84, 85, 20, true, true);
  ctx.fillStyle = '#22d3ee';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 12;
  roundRect(ctx, cx - 28, cy - 65, 56, 12, 3, true, false);
  ctx.shadowBlur = 0;

  // Huge Runic Greatsword
  ctx.save();
  ctx.translate(cx + 80, cy + 15);
  ctx.fillStyle = '#22d3ee';
  ctx.strokeStyle = '#0891b2';
  ctx.lineWidth = 4;
  roundRect(ctx, -10, -145, 20, 230, 4, true, true);
  // Runic glow
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-3, -120, 6, 160);
  ctx.restore();
}

// -------------------------------------------------------------
// 9. NECROMANCER (Skull Mask, Green Flames & Scythe)
// -------------------------------------------------------------
function drawNecromancer(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Tattered Dark Shroud
  ctx.fillStyle = '#2e1065';
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 5;
  roundRect(ctx, cx - 50, cy - 15, 100, 155, 16, true, true);

  // Ivory Skull Mask
  ctx.fillStyle = '#e2e8f0';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy - 65, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Emerald Flame Eyes
  ctx.fillStyle = '#22c55e';
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(cx - 14, cy - 65, 7, 0, Math.PI * 2);
  ctx.arc(cx + 14, cy - 65, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Death Scythe
  ctx.save();
  ctx.translate(cx + 75, cy + 10);
  ctx.fillStyle = '#18181b';
  roundRect(ctx, -5, -135, 10, 260, 3, true, true);
  // Curved Emerald Blade
  ctx.fillStyle = '#10b981';
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -135);
  ctx.quadraticCurveTo(-90, -165, -80, -90);
  ctx.quadraticCurveTo(-45, -125, 0, -115);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// -------------------------------------------------------------
// 10. ENGINEER (Goggles, Boiler Backpack & Wrench-Hammer)
// -------------------------------------------------------------
function drawEngineer(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Steampunk Leather Apron
  ctx.fillStyle = '#854d0e';
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 5;
  roundRect(ctx, cx - 48, cy - 15, 96, 145, 14, true, true);

  // Leather Cap & Brass Dual Goggles
  ctx.fillStyle = '#78350f';
  roundRect(ctx, cx - 40, cy - 85, 80, 75, 16, true, true);
  // Glowing Teal Goggles
  ctx.fillStyle = '#38bdf8';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx - 16, cy - 60, 15, 0, Math.PI * 2);
  ctx.arc(cx + 16, cy - 60, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Heavy Mechanical Wrench (Right Hand)
  ctx.save();
  ctx.translate(cx + 70, cy + 20);
  ctx.fillStyle = '#64748b';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  roundRect(ctx, -7, -100, 14, 180, 4, true, true);
  // Wrench head
  ctx.beginPath();
  ctx.arc(0, -100, 24, -Math.PI / 3, Math.PI * 1.33);
  ctx.stroke();
  ctx.restore();
}

// -------------------------------------------------------------
// 11. RUNE MAGE (Grimoire, Glyphic Robes)
// -------------------------------------------------------------
function drawRuneMage(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Sapphire Robes
  ctx.fillStyle = '#1e3a8a';
  ctx.strokeStyle = '#172554';
  ctx.lineWidth = 5;
  roundRect(ctx, cx - 52, cy - 15, 104, 155, 16, true, true);

  // Head with Golden Runic Crown
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(cx, cy - 60, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  roundRect(ctx, cx - 36, cy - 85, 72, 14, 4, true, true);

  // Floating Ancient Grimoire (Hovering)
  ctx.save();
  ctx.translate(cx - 65, cy + 20);
  ctx.rotate(-0.15);
  ctx.fillStyle = '#78350f';
  roundRect(ctx, -30, -22, 60, 44, 4, true, true);
  // Glowing Cyan Rune Pages
  ctx.fillStyle = '#67e8f9';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 10;
  roundRect(ctx, -26, -18, 52, 36, 2, true, false);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// -------------------------------------------------------------
// 12. BERSERKER (Horned Helm, War Paint & Greataxe)
// -------------------------------------------------------------
function drawBerserker(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Muscular Torso with War Paint
  ctx.fillStyle = '#fed7aa';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 5;
  roundRect(ctx, cx - 55, cy - 15, 110, 140, 16, true, true);
  // Red War Paint
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(cx - 35, cy + 15, 14, 60);
  ctx.fillRect(cx + 20, cy + 15, 14, 60);

  // Horned Iron Helm
  ctx.fillStyle = '#3f3f46';
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 5;
  roundRect(ctx, cx - 44, cy - 90, 88, 85, 18, true, true);
  // Horns
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(cx - 40, cy - 70);
  ctx.quadraticCurveTo(cx - 85, cy - 110, cx - 75, cy - 130);
  ctx.lineTo(cx - 30, cy - 85);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 40, cy - 70);
  ctx.quadraticCurveTo(cx + 85, cy - 110, cx + 75, cy - 130);
  ctx.lineTo(cx + 30, cy - 85);
  ctx.fill();
  ctx.stroke();

  // Double-Bitted Greataxe (Right Hand)
  ctx.save();
  ctx.translate(cx + 85, cy + 15);
  ctx.fillStyle = '#451a03';
  roundRect(ctx, -7, -130, 14, 230, 4, true, true);
  // Blades
  ctx.fillStyle = '#94a3b8';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-40, -90, 45, -Math.PI / 2, Math.PI / 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(40, -90, 45, Math.PI / 2, -Math.PI / 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// -------------------------------------------------------------
// 13. SPIDER (Shadow Spider, 4 Red Eyes, Jointed Legs)
// -------------------------------------------------------------
function drawSpider(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Abdomen
  ctx.fillStyle = '#1e1b4b';
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 20, 65, 55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(cx, cy - 40, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4 Glowing Red Eyes
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 8;
  for (let ox of [-20, -7, 7, 20]) {
    ctx.beginPath();
    ctx.arc(cx + ox, cy - 40, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // 6 Angled Spidery Legs
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 6;
  for (let side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + side * 35, cy - 10 + i * 25);
      ctx.lineTo(cx + side * 90, cy - 40 + i * 25);
      ctx.lineTo(cx + side * 115, cy + 30 + i * 25);
      ctx.stroke();
    }
  }
}

// -------------------------------------------------------------
// 14. DARK MAGE (Void Sorcerer, Dark Skull Wand)
// -------------------------------------------------------------
function drawDarkMage(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Void Robes
  ctx.fillStyle = '#18181b';
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 5;
  roundRect(ctx, cx - 48, cy - 15, 96, 150, 16, true, true);

  // Shadow Hood with Purple Slit Eyes
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.arc(cx, cy - 65, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#c084fc';
  ctx.shadowColor = '#a855f7';
  ctx.shadowBlur = 12;
  roundRect(ctx, cx - 24, cy - 68, 48, 8, 3, true, false);
  ctx.shadowBlur = 0;

  // Skull Wand
  ctx.save();
  ctx.translate(cx + 75, cy + 20);
  ctx.fillStyle = '#3f3f46';
  roundRect(ctx, -5, -110, 10, 200, 3, true, true);
  // Purple Skull
  ctx.fillStyle = '#a855f7';
  ctx.beginPath();
  ctx.arc(0, -125, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// -------------------------------------------------------------
// 15. SPECTRAL WOLF (Ethereal Cyan Wolf)
// -------------------------------------------------------------
function drawSpectralWolf(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = '#06b6d4';
  ctx.strokeStyle = '#0891b2';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 15;

  // Wolf Body
  ctx.beginPath();
  ctx.ellipse(cx, cy + 25, 75, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head & Snout
  ctx.beginPath();
  ctx.arc(cx + 45, cy - 25, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pointed Ears
  ctx.beginPath();
  ctx.moveTo(cx + 35, cy - 55);
  ctx.lineTo(cx + 45, cy - 95);
  ctx.lineTo(cx + 60, cy - 55);
  ctx.fill();
  ctx.stroke();

  // Glowing White Eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx + 52, cy - 30, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// -------------------------------------------------------------
// 16. BASALT GOLEM (Cracked Magma Rock)
// -------------------------------------------------------------
function drawBasaltGolem(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Heavy Stone Torso
  ctx.fillStyle = '#27272a';
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 6;
  roundRect(ctx, cx - 70, cy - 30, 140, 150, 24, true, true);

  // Molten Magma Core (Eye)
  ctx.fillStyle = '#ff5722';
  ctx.shadowColor = '#ff3d00';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(cx, cy + 25, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Heavy Rock Boulder Fists
  ctx.fillStyle = '#3f3f46';
  roundRect(ctx, cx - 105, cy + 20, 42, 60, 12, true, true);
  roundRect(ctx, cx + 63, cy + 20, 42, 60, 12, true, true);
}

// -------------------------------------------------------------
// 17. THORN WITCH (Dryad with Briar Crown & Thorn Staff)
// -------------------------------------------------------------
function drawThornWitch(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Bramble Dress
  ctx.fillStyle = '#14532d';
  ctx.strokeStyle = '#052e16';
  ctx.lineWidth = 5;
  roundRect(ctx, cx - 48, cy - 15, 96, 150, 16, true, true);

  // Briar Crown
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(cx, cy - 65, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Crown of thorns
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 6;
  ctx.strokeRect(cx - 34, cy - 95, 68, 12);
}

// -------------------------------------------------------------
// 18. FALLEN KNIGHT (Corrupted Plate, Red Visor, Blood Cape)
// -------------------------------------------------------------
function drawFallenKnight(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Blood Cape
  ctx.fillStyle = '#991b1b';
  roundRect(ctx, cx - 65, cy - 25, 130, 160, 16, true, false);

  // Black Plate
  ctx.fillStyle = '#18181b';
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 5;
  roundRect(ctx, cx - 52, cy - 15, 104, 140, 16, true, true);

  // Horned Helm with Crimson Slit
  roundRect(ctx, cx - 40, cy - 90, 80, 80, 16, true, true);
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#dc2626';
  ctx.shadowBlur = 12;
  roundRect(ctx, cx - 26, cy - 60, 52, 10, 3, true, false);
  ctx.shadowBlur = 0;
}

// -------------------------------------------------------------
// 19. MIMIC (Living Treasure Chest with Fangs & Tongue)
// -------------------------------------------------------------
function drawMimic(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Chest Body
  ctx.fillStyle = '#78350f';
  ctx.strokeStyle = '#271206';
  ctx.lineWidth = 6;
  roundRect(ctx, cx - 75, cy + 10, 150, 95, 12, true, true);
  // Gold Trim
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 8;
  ctx.strokeRect(cx - 68, cy + 20, 136, 75);

  // Open Lid tilted
  ctx.fillStyle = '#92400e';
  ctx.strokeStyle = '#271206';
  ctx.lineWidth = 6;
  roundRect(ctx, cx - 75, cy - 65, 150, 60, 12, true, true);

  // Rows of Sharp Fangs
  ctx.fillStyle = '#fef08a';
  for (let i = -55; i <= 55; i += 22) {
    ctx.beginPath();
    ctx.moveTo(cx + i - 8, cy - 5);
    ctx.lineTo(cx + i, cy + 15);
    ctx.lineTo(cx + i + 8, cy - 5);
    ctx.fill();
  }

  // Flopping Crimson Tongue
  ctx.fillStyle = '#ef4444';
  roundRect(ctx, cx - 18, cy + 10, 36, 60, 12, true, true);
}

// -------------------------------------------------------------
// 20. VOLCANIC DRAKE (Dragon Head & Wings)
// -------------------------------------------------------------
function drawVolcanicDrake(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Dragon Wings
  ctx.fillStyle = '#991b1b';
  ctx.strokeStyle = '#450a0a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - 120, cy - 80);
  ctx.lineTo(cx - 60, cy + 40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + 120, cy - 80);
  ctx.lineTo(cx + 60, cy + 40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Dragon Head
  ctx.fillStyle = '#b91c1c';
  roundRect(ctx, cx - 45, cy - 45, 90, 110, 16, true, true);

  // Blazing Fire Maw
  ctx.fillStyle = '#f59e0b';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(cx, cy + 25, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// -------------------------------------------------------------
// 21. DEVOURER BOSS (Mini-Boss: Giant Carapace & Pincers)
// -------------------------------------------------------------
function drawDevourerBoss(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Colossal Chitin Body
  ctx.fillStyle = '#d97706';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 6;
  roundRect(ctx, cx - 85, cy - 40, 170, 170, 28, true, true);

  // Fiery Maw Core
  ctx.fillStyle = '#f59e0b';
  ctx.shadowColor = '#d97706';
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(cx, cy + 30, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Massive Pincer Jaws
  ctx.fillStyle = '#78350f';
  roundRect(ctx, cx - 110, cy - 80, 45, 100, 14, true, true);
  roundRect(ctx, cx + 65, cy - 80, 45, 100, 14, true, true);
}

// -------------------------------------------------------------
// 22. ASTAROTH FINAL BOSS (Archdemon, Bat Wings, Crown & Horns)
// -------------------------------------------------------------
function drawAstarothBoss(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Expansive Bat Wings
  ctx.fillStyle = '#581c87';
  ctx.strokeStyle = '#2e1065';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - 150, cy - 110);
  ctx.lineTo(cx - 90, cy + 60);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + 150, cy - 110);
  ctx.lineTo(cx + 90, cy + 60);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Archdemon Obsidian Body
  ctx.fillStyle = '#1e1b4b';
  ctx.strokeStyle = '#020617';
  roundRect(ctx, cx - 65, cy - 40, 130, 160, 20, true, true);

  // Demon Horns
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(cx - 35, cy - 70);
  ctx.quadraticCurveTo(cx - 90, cy - 130, cx - 60, cy - 165);
  ctx.lineTo(cx - 20, cy - 85);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + 35, cy - 70);
  ctx.quadraticCurveTo(cx + 90, cy - 130, cx + 60, cy - 165);
  ctx.lineTo(cx + 20, cy - 85);
  ctx.fill();
  ctx.stroke();

  // Floating Purple Crown
  ctx.strokeStyle = '#c084fc';
  ctx.shadowColor = '#a855f7';
  ctx.shadowBlur = 18;
  ctx.lineWidth = 8;
  ctx.strokeRect(cx - 40, cy - 135, 80, 18);
  ctx.shadowBlur = 0;
}

// -------------------------------------------------------------
// Fallback Hero / Monster
// -------------------------------------------------------------
function drawFallbackHero(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  faction: 'player' | 'enemy',
  isBoss?: boolean
) {
  ctx.fillStyle = isBoss ? '#9333ea' : faction === 'player' ? '#3b82f6' : '#ef4444';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 5;
  roundRect(ctx, cx - 50, cy - 20, 100, 140, 16, true, true);
  roundRect(ctx, cx - 36, cy - 90, 72, 70, 16, true, true);
}

// Utility: Draw rounded rectangle
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill = true,
  stroke = true
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
