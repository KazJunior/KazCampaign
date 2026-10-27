import type { Skill, DamageType } from '../../types/game';
import type { VFXSequence } from './vfxTypes';

export const SKILL_VFX_REGISTRY: Record<string, VFXSequence> = {
  arauto_manto_espectral: {
    id: 'arauto_manto_espectral',
    type: 'void_miasma',
    durationMs: 500,
    cast: { durationMs: 150, color: 0x8b5cf6 },
    impact: {
      shockwave: true,
      shockwaveColor: 0x7c3aed,
      particleBurstCount: 16,
      particleType: 'shadow',
    },
    hitReactionDelayMs: 100,
  },
  arauto_corte_ceifador: {
    id: 'arauto_corte_ceifador',
    type: 'abyssal_blade',
    durationMs: 650,
    cast: { durationMs: 120, color: 0x06b6d4 },
    impact: {
      shockwave: true,
      shockwaveColor: 0x00e5ff,
      particleBurstCount: 20,
      particleType: 'shadow',
    },
    screenShake: { intensity: 0.12, durationMs: 180, delayMs: 200 },
    hitReactionDelayMs: 200,
  },
  arauto_giro_foice: {
    id: 'arauto_giro_foice',
    type: 'abyssal_blade',
    durationMs: 700,
    cast: { durationMs: 100, color: 0x00e5ff },
    impact: {
      shockwave: true,
      shockwaveColor: 0x06b6d4,
      particleBurstCount: 24,
      particleType: 'shadow',
    },
    screenShake: { intensity: 0.15, durationMs: 220, delayMs: 200 },
    hitReactionDelayMs: 220,
  },
  arauto_passo_sombrio: {
    id: 'arauto_passo_sombrio',
    type: 'void_miasma',
    durationMs: 600,
    cast: { durationMs: 100, color: 0x7c3aed },
    impact: {
      shockwave: true,
      shockwaveColor: 0x8b5cf6,
      particleBurstCount: 22,
      particleType: 'shadow',
    },
    screenShake: { intensity: 0.14, durationMs: 200, delayMs: 180 },
    hitReactionDelayMs: 200,
  },
  arauto_arremesso_foice: {
    id: 'arauto_arremesso_foice',
    type: 'arcane_missile',
    durationMs: 650,
    cast: { durationMs: 120, color: 0x00e5ff },
    impact: {
      shockwave: true,
      shockwaveColor: 0x06b6d4,
      particleBurstCount: 20,
      particleType: 'shadow',
    },
    screenShake: { intensity: 0.12, durationMs: 180, delayMs: 200 },
    hitReactionDelayMs: 200,
  },

  // ==========================================
  // FIRE ARCHETYPE (Distinct unique variants)
  // ==========================================

  // 1. Chuva de Meteoros: 3 meteoros caindo em cascata com crateras e forte abalo
  chuva_de_meteoros: {
    id: 'chuva_de_meteoros',
    type: 'meteor_shower',
    durationMs: 820,
    cast: { durationMs: 160, color: 0xff3b00, ringRadius: 1.4 },
    projectiles: [
      { delayMs: 0, fromSky: true, skyAngleDeg: 60, skyHeight: 6.8, targetOffset: { x: -0.28, z: 0.2 }, size: 0.26, color: 0xff4500 },
      { delayMs: 130, fromSky: true, skyAngleDeg: 55, skyHeight: 7.2, targetOffset: { x: 0.32, z: -0.22 }, size: 0.24, color: 0xff5500 },
      { delayMs: 260, fromSky: true, skyAngleDeg: 65, skyHeight: 6.6, targetOffset: { x: 0.05, z: 0.1 }, size: 0.32, color: 0xff2200 },
    ],
    impact: {
      shockwave: true,
      shockwaveColor: 0xff4500,
      craterDecal: true,
      craterColor: 0xff3300,
      particleBurstCount: 28,
      particleType: 'fire',
    },
    screenShake: { intensity: 0.24, durationMs: 400, delayMs: 380 },
    hitReactionDelayMs: 400,
  },

  // 2. Coluna de Chamas / Labareda: Erupção puramente vertical do solo
  coluna_de_chamas: {
    id: 'coluna_de_chamas',
    type: 'fire_pillar',
    durationMs: 650,
    cast: { durationMs: 150, color: 0xff7700, ringRadius: 0.9 },
    pillar: { height: 4.8, radius: 0.85, color: 0xff3b00, innerCoreColor: 0xfef08a },
    impact: {
      shockwave: true,
      shockwaveColor: 0xff7700,
      particleBurstCount: 22,
      particleType: 'fire',
    },
    screenShake: { intensity: 0.13, durationMs: 250, delayMs: 180 },
    hitReactionDelayMs: 200,
  },

  // 3. Combustão Espontânea: Sem projétil; pulso no peito do alvo e detonação de choque
  combustao_espontanea: {
    id: 'combustao_espontanea',
    type: 'combustion',
    durationMs: 580,
    cast: { durationMs: 120, color: 0xdc2626 },
    impact: {
      shockwave: true,
      shockwaveColor: 0xef4444,
      craterDecal: false,
      particleBurstCount: 24,
      particleType: 'fire',
    },
    screenShake: { intensity: 0.16, durationMs: 260, delayMs: 220 },
    hitReactionDelayMs: 240,
  },

  // 4. Lança-Chamas: Cone contínuo de fogo partindo do conjurador
  lanca_chamas: {
    id: 'lanca_chamas',
    type: 'flamethrower',
    durationMs: 720,
    cast: { durationMs: 100, color: 0xf97316 },
    stream: {
      particleCount: 36,
      spreadAngleDeg: 28,
      color: 0xff4500,
      secondaryColor: 0xfbbf24,
      flowDurationMs: 480,
    },
    impact: {
      shockwave: false,
      particleBurstCount: 16,
      particleType: 'fire',
    },
    screenShake: { intensity: 0.08, durationMs: 320, delayMs: 180 },
    hitReactionDelayMs: 280,
  },

  // 5. Bola de Fogo clássica
  bola_de_fogo: {
    id: 'bola_de_fogo',
    type: 'meteor_shower',
    durationMs: 620,
    cast: { durationMs: 120, color: 0xff5500 },
    projectiles: [
      { delayMs: 0, fromSky: false, arcHeight: 0.8, size: 0.22, color: 0xff4500 },
    ],
    impact: {
      shockwave: true,
      shockwaveColor: 0xff4500,
      particleBurstCount: 18,
      particleType: 'fire',
    },
    screenShake: { intensity: 0.12, durationMs: 220, delayMs: 350 },
    hitReactionDelayMs: 360,
  },

  // ==========================================
  // ICE ARCHETYPE
  // ==========================================
  raio_glacial: {
    id: 'raio_glacial',
    type: 'ice_spikes',
    durationMs: 620,
    cast: { durationMs: 140, color: 0x38bdf8 },
    impact: {
      shockwave: true,
      shockwaveColor: 0xbae6fd,
      particleBurstCount: 20,
      particleType: 'ice',
    },
    screenShake: { intensity: 0.12, durationMs: 220, delayMs: 240 },
    hitReactionDelayMs: 260,
  },

  nevasca: {
    id: 'nevasca',
    type: 'frost_nova',
    durationMs: 680,
    cast: { durationMs: 150, color: 0x0284c7, ringRadius: 1.5 },
    impact: {
      shockwave: true,
      shockwaveColor: 0x38bdf8,
      particleBurstCount: 26,
      particleType: 'ice',
    },
    screenShake: { intensity: 0.14, durationMs: 280, delayMs: 260 },
    hitReactionDelayMs: 280,
  },

  // ==========================================
  // LIGHTNING & HOLY ARCHETYPES
  // ==========================================
  relampago: {
    id: 'relampago',
    type: 'lightning_storm',
    durationMs: 480,
    cast: { durationMs: 80, color: 0x00f0ff },
    impact: {
      shockwave: true,
      shockwaveColor: 0x00f0ff,
      particleBurstCount: 20,
      particleType: 'sparks',
    },
    screenShake: { intensity: 0.18, durationMs: 240, delayMs: 120 },
    hitReactionDelayMs: 140,
  },

  cura: {
    id: 'cura',
    type: 'holy_pillar',
    durationMs: 650,
    cast: { durationMs: 120, color: 0xfef08a },
    pillar: { height: 4.5, radius: 0.7, color: 0xfef08a, innerCoreColor: 0xfacc15 },
    impact: {
      shockwave: true,
      shockwaveColor: 0xfacc15,
      particleBurstCount: 16,
      particleType: 'stars',
    },
    hitReactionDelayMs: 200,
  },

  bencao_sagrada: {
    id: 'bencao_sagrada',
    type: 'holy_pillar',
    durationMs: 700,
    cast: { durationMs: 150, color: 0xfef08a, ringRadius: 1.2 },
    pillar: { height: 5.2, radius: 0.9, color: 0xfde047, innerCoreColor: 0xffffff },
    impact: {
      shockwave: true,
      shockwaveColor: 0xfde047,
      particleBurstCount: 20,
      particleType: 'stars',
    },
    hitReactionDelayMs: 220,
  },

  // ==========================================
  // PHYSICAL & MARTIAL ARCHETYPES
  // ==========================================
  golpe_poderoso: {
    id: 'golpe_poderoso',
    type: 'blade_tempest',
    durationMs: 460,
    impact: {
      shockwave: false,
      particleBurstCount: 12,
      particleType: 'dust',
    },
    screenShake: { intensity: 0.08, durationMs: 180, delayMs: 180 },
    hitReactionDelayMs: 200,
  },

  golpe_demolidor: {
    id: 'golpe_demolidor',
    type: 'heavy_slam',
    durationMs: 560,
    impact: {
      shockwave: true,
      shockwaveColor: 0xf59e0b,
      craterDecal: true,
      craterColor: 0x78716c,
      particleBurstCount: 24,
      particleType: 'dust',
    },
    screenShake: { intensity: 0.22, durationMs: 320, delayMs: 250 },
    hitReactionDelayMs: 270,
  },

  tiro_preciso: {
    id: 'tiro_preciso',
    type: 'sniper_shot',
    durationMs: 440,
    projectiles: [
      { delayMs: 0, fromSky: false, size: 0.15, color: 0xf8fafc },
    ],
    impact: {
      particleBurstCount: 10,
      particleType: 'sparks',
    },
    screenShake: { intensity: 0.09, durationMs: 180, delayMs: 180 },
    hitReactionDelayMs: 200,
  },

  tiro_triplo: {
    id: 'tiro_triplo',
    type: 'arrow_volley',
    durationMs: 500,
    projectiles: [
      { delayMs: 0, fromSky: false, targetOffset: { x: -0.15, z: 0.1 } },
      { delayMs: 40, fromSky: false, targetOffset: { x: 0, z: 0 } },
      { delayMs: 80, fromSky: false, targetOffset: { x: 0.15, z: -0.1 } },
    ],
    impact: {
      particleBurstCount: 14,
      particleType: 'dust',
    },
    screenShake: { intensity: 0.11, durationMs: 200, delayMs: 220 },
    hitReactionDelayMs: 240,
  },

  dreno_de_vida: {
    id: 'dreno_de_vida',
    type: 'void_miasma',
    durationMs: 680,
    cast: { durationMs: 120, color: 0x7c3aed },
    impact: {
      shockwave: true,
      shockwaveColor: 0x8b5cf6,
      particleBurstCount: 18,
      particleType: 'shadow',
    },
    hitReactionDelayMs: 220,
  },
};

/**
 * Resolves a VFXSequence for any skill.
 * If the skill has an explicit registration, it is used.
 * Otherwise, generates an appropriate, high-quality fallback sequence.
 */
export function resolveSkillVFX(
  skill: Skill | undefined,
  damageType: DamageType,
  aoeRadius: number = 0
): VFXSequence {
  if (skill?.id && SKILL_VFX_REGISTRY[skill.id]) {
    return SKILL_VFX_REGISTRY[skill.id];
  }

  const skillName = (skill?.name || '').toLowerCase();
  const skillId = (skill?.id || '').toLowerCase();

  // 1. Holy / Healing
  if (damageType === 'healing' || skill?.targetType === 'self' || skill?.targetType === 'ally') {
    return SKILL_VFX_REGISTRY.cura;
  }

  // 2. Fire variants by naming
  if (skillId.includes('meteoro') || skillName.includes('meteoro') || skillId.includes('cataclismo')) {
    return SKILL_VFX_REGISTRY.chuva_de_meteoros;
  }
  if (skillId.includes('coluna') || skillName.includes('coluna') || skillId.includes('labareda') || skillId.includes('erupcao')) {
    return SKILL_VFX_REGISTRY.coluna_de_chamas;
  }
  if (skillId.includes('combustao') || skillName.includes('combustão') || skillId.includes('chama_interna')) {
    return SKILL_VFX_REGISTRY.combustao_espontanea;
  }
  if (skillId.includes('lanca_chamas') || skillName.includes('lança-chamas') || skillId.includes('chamas')) {
    return SKILL_VFX_REGISTRY.lanca_chamas;
  }
  if (skillId.includes('fogo') || skillName.includes('fogo')) {
    return aoeRadius > 0 ? SKILL_VFX_REGISTRY.coluna_de_chamas : SKILL_VFX_REGISTRY.bola_de_fogo;
  }

  // 3. Ice variants
  if (skillId.includes('gelo') || skillId.includes('glacial') || skillName.includes('gelo') || skillName.includes('glacial')) {
    return aoeRadius > 0 ? SKILL_VFX_REGISTRY.nevasca : SKILL_VFX_REGISTRY.raio_glacial;
  }

  // 4. Lightning
  if (skillId.includes('raio') || skillId.includes('relampago') || skillId.includes('trovao') || skillId.includes('eletric') || skillId.includes('voltaic') || skillId.includes('plasma') || skillName.includes('raio') || skillName.includes('elétric')) {
    return SKILL_VFX_REGISTRY.relampago;
  }

  // 4B. Wind / Aero
  if (skillId.includes('vento') || skillId.includes('vendaval') || skillId.includes('furacao') || skillId.includes('brisa') || skillId.includes('vortice') || skillName.includes('vento') || skillName.includes('furacão')) {
    return {
      id: 'vento',
      type: 'generic_magic',
      durationMs: 460,
      cast: { durationMs: 90, color: 0x2dd4bf },
      impact: {
        shockwave: true,
        shockwaveColor: 0x5eead4,
        particleBurstCount: 22,
        particleType: 'sparks',
      },
      screenShake: { intensity: 0.12, durationMs: 180, delayMs: 80 },
    };
  }

  // 5. Void / Shadows
  if (skillId.includes('vazio') || skillId.includes('sombra') || skillId.includes('drenar') || skillId.includes('trevas')) {
    return SKILL_VFX_REGISTRY.dreno_de_vida;
  }

  // 6. Archery / Projectiles
  if (skillId.includes('flecha') || skillId.includes('tiro') || skillId.includes('disparo')) {
    return aoeRadius > 0 ? SKILL_VFX_REGISTRY.tiro_triplo : SKILL_VFX_REGISTRY.tiro_preciso;
  }

  // 7. Heavy Physical
  if (skillId.includes('demolidor') || skillId.includes('esmagar') || skillId.includes('investida') || aoeRadius > 0) {
    return SKILL_VFX_REGISTRY.golpe_demolidor;
  }

  // 8. Generic physical melee
  if (damageType === 'physical') {
    return SKILL_VFX_REGISTRY.golpe_poderoso;
  }

  // 9. Generic Magic fallback
  return {
    id: 'generic_magic',
    type: 'generic_magic',
    durationMs: 550,
    cast: { durationMs: 100, color: 0xb58aff },
    impact: {
      shockwave: true,
      shockwaveColor: 0xb58aff,
      particleBurstCount: 16,
      particleType: 'sparks',
    },
    screenShake: { intensity: 0.1, durationMs: 200, delayMs: 220 },
    hitReactionDelayMs: 240,
  };
}
