import type { Skill, StatusEffect, Unit } from '../types/game';

export type ElementalConditionType = 'burn' | 'freezing' | 'electrified' | 'gale';

export const ELEMENTAL_CONDITION_TYPES: readonly ElementalConditionType[] = [
  'burn',
  'freezing',
  'electrified',
  'gale',
] as const;

export interface ElementalReactionResult {
  id: string;
  name: string;
  emoji: string;
  color: string;
  summary: string;
  damageBonusPercent: number;
  ignoresShield?: boolean;
  extraKnockback?: number;
  extraPull?: number;
  bonusTargetEffects?: StatusEffect[];
  bonusCasterEffects?: StatusEffect[];
  reduceCasterCooldowns?: number;
  extendElementalEffectsBy?: number;
  spreadBurnRadius?: number;
  splashDamageRatio?: number;
}

export function getActiveElementalConditions(unit: Unit): ElementalConditionType[] {
  if (!unit.statusEffects || unit.statusEffects.length === 0) return [];
  const active = new Set<ElementalConditionType>();
  for (const eff of unit.statusEffects) {
    if (eff.duration > 0) {
      if (
        eff.type === 'burn' ||
        eff.type === 'freezing' ||
        eff.type === 'electrified' ||
        eff.type === 'gale'
      ) {
        active.add(eff.type);
      }
    }
  }
  return Array.from(active);
}

/**
 * Avalia se uma habilidade do Omnimago ativa uma Reação Elemental contra o alvo
 * com base nos efeitos elementais já ativos nele (burn, freezing, electrified, gale).
 */
export function evaluateOmnimagoReaction(
  attacker: Unit,
  target: Unit,
  skill?: Skill
): ElementalReactionResult | null {
  if (!skill || skill.damageType === 'healing') return null;
  if (attacker.className !== 'omnimago' && attacker.avatarKey !== 'omnimage') return null;

  const activeElements = getActiveElementalConditions(target);
  const hasBurn = activeElements.includes('burn');
  const hasFreezing = activeElements.includes('freezing');
  const hasElectrified = activeElements.includes('electrified');
  const hasGale = activeElements.includes('gale');

  // 1. Suprema: Apocalipse Prismático (+15% por efeito elemental distinto, até +60%)
  if (skill.id === 'cataclisma_omnielemental') {
    if (activeElements.length === 0) return null;
    const count = activeElements.length;
    const bonusPct = count * 15;
    const ignoresShield = count >= 2;
    return {
      id: 'convergencia_suprema',
      name: `Convergência Suprema (${count}x)`,
      emoji: '🌈💥',
      color: '#E879F9',
      summary: `+${bonusPct}% de dano (${count} efeito${count > 1 ? 's' : ''} elemental${count > 1 ? 'is' : ''})${ignoresShield ? ' e ignora escudos' : ''}`,
      damageBonusPercent: bonusPct,
      ignoresShield,
    };
  }

  // 2. Missão 1: Feixe de Convergência Prismática (+15% por efeito elemental e ignora escudos)
  if (skill.id === 'feixe_convergencia_prismatica') {
    if (activeElements.length === 0) return null;
    const count = activeElements.length;
    const bonusPct = count * 15;
    return {
      id: 'convergencia_perfurante',
      name: `Convergência Perfurante (${count}x)`,
      emoji: '💎⚡',
      color: '#C084FC',
      summary: `+${bonusPct}% de dano e ignora escudos`,
      damageBonusPercent: bonusPct,
      ignoresShield: true,
    };
  }

  // 3. Missão 3: Singularidade dos Quatro Elementos
  if (skill.id === 'singularidade_elemental') {
    if (activeElements.length === 0) return null;
    return {
      id: 'colapso_singularidade',
      name: 'Colapso da Singularidade',
      emoji: '🌌✨',
      color: '#E879F9',
      summary: '+25% de dano, ignora escudos e estende em +1T os efeitos elementais no alvo',
      damageBonusPercent: 25,
      ignoresShield: true,
      extendElementalEffectsBy: 1,
    };
  }

  // 4. Base: Orbe Prismático (estende efeitos elementais e causa dano bônus)
  if (skill.id === 'disparo_elemental') {
    if (activeElements.length === 0) return null;
    return {
      id: 'ressonancia_prismatica',
      name: 'Ressonância Prismática',
      emoji: '✨',
      color: '#D946EF',
      summary: '+20% de dano e estende em +1 turno todos os efeitos elementais no alvo',
      damageBonusPercent: 20,
      extendElementalEffectsBy: 1,
    };
  }

  // 5. Fusão Fogo + Raio: Supernova Termo-Elétrica -> reage com Congelando ou Ventania
  if (skill.id === 'fusao_termoeletrica') {
    if (hasFreezing || hasGale) {
      return {
        id: 'catarse_termica',
        name: 'Catarse Térmica',
        emoji: '🔥⚡❄️',
        color: '#FB923C',
        summary: '+30% de dano, ignora escudos e reduz DEF/RES em 20% por 2T',
        damageBonusPercent: 30,
        ignoresShield: true,
        bonusTargetEffects: [{ type: 'debuff_def', duration: 2, value: 20 }],
      };
    }
    return null;
  }

  // 6. Fusão Gelo + Vento: Vórtice Glacio-Ciclônico -> reage com Queimadura ou Eletrificado (sem stun)
  if (skill.id === 'nevasca_dilacerante') {
    if (hasBurn || hasElectrified) {
      return {
        id: 'colapso_criogenico',
        name: 'Colapso Criogênico',
        emoji: '❄️🌪️⚡',
        color: '#38BDF8',
        summary: '+30% de dano, reduz o dano do alvo em 25% (1T) e aplica Lentidão (-1 Mov, 2T)',
        damageBonusPercent: 30,
        bonusTargetEffects: [
          { type: 'debuff_atk', duration: 1, value: 25 },
          { type: 'slow', duration: 2, value: 1 },
        ],
      };
    }
    return null;
  }

  // 7. Fusão Gelo + Raio: Relâmpago Glacial -> reage com Queimadura ou Ventania
  if (skill.id === 'relampago_glacial') {
    if (hasBurn || hasGale) {
      return {
        id: 'fusao_criovoltaica',
        name: 'Fusão Criovoltaica',
        emoji: '❄️⚡🔥',
        color: '#60A5FA',
        summary: '+30% de dano, ignora escudos e reduz em 1T o cooldown das demais habilidades',
        damageBonusPercent: 30,
        ignoresShield: true,
        reduceCasterCooldowns: 1,
      };
    }
    return null;
  }

  // 8. Fusão Fogo + Vento: Ciclone Vulcânico -> reage com Congelando ou Eletrificado
  if (skill.id === 'ciclone_vulcanico') {
    if (hasFreezing || hasElectrified) {
      return {
        id: 'furia_piroclastica',
        name: 'Fúria Piroclástica',
        emoji: '🔥🌪️❄️',
        color: '#F97316',
        summary: '+30% de dano, empurra +1 casa adicional e espalha Queimadura para adjacentes',
        damageBonusPercent: 30,
        extraKnockback: 1,
        spreadBurnRadius: 1,
      };
    }
    return null;
  }

  // 9. Habilidade de Fogo: Ignição Cósmica
  if (skill.id === 'combustao_elemental' || skill.elementalTag === 'fire') {
    if (hasFreezing) {
      return {
        id: 'choque_termico_fogo',
        name: 'Choque Térmico',
        emoji: '🔥❄️',
        color: '#F97316',
        summary: '+30% de dano e ignora escudos',
        damageBonusPercent: 30,
        ignoresShield: true,
      };
    }
    if (hasGale) {
      return {
        id: 'tempestade_ignea',
        name: 'Tempestade Ígnea',
        emoji: '🔥🌪️',
        color: '#FB923C',
        summary: '+20% de dano, empurra 1 casa e espalha Queimadura para adjacentes',
        damageBonusPercent: 20,
        extraKnockback: 1,
        spreadBurnRadius: 1,
      };
    }
    if (hasElectrified) {
      return {
        id: 'sobrecarga_explosiva_fogo',
        name: 'Sobrecarga Explosiva',
        emoji: '🔥⚡',
        color: '#FACC15',
        summary: '+25% de dano e reduz Defesa/Resistência em 20% (2T)',
        damageBonusPercent: 25,
        bonusTargetEffects: [{ type: 'debuff_def', duration: 2, value: 20 }],
      };
    }
    return null;
  }

  // 10. Habilidade de Gelo: Lança Criogênica (sem stun)
  if (skill.id === 'sopro_glacial' || skill.elementalTag === 'ice') {
    if (hasBurn) {
      return {
        id: 'choque_termico_gelo',
        name: 'Choque Térmico',
        emoji: '❄️🔥',
        color: '#38BDF8',
        summary: '+30% de dano e ignora escudos',
        damageBonusPercent: 30,
        ignoresShield: true,
      };
    }
    if (hasElectrified) {
      return {
        id: 'supercondutor_gelo',
        name: 'Supercondutor',
        emoji: '❄️⚡',
        color: '#60A5FA',
        summary: '+25% de dano, ignora escudos e reduz Defesa/Resistência em 20% (2T)',
        damageBonusPercent: 25,
        ignoresShield: true,
        bonusTargetEffects: [{ type: 'debuff_def', duration: 2, value: 20 }],
      };
    }
    if (hasGale) {
      return {
        id: 'nevasca_paralisante',
        name: 'Nevasca Paralisante',
        emoji: '❄️🌪️',
        color: '#22D3EE',
        summary: '+20% de dano e reduz o ataque do alvo em 20% (1T)',
        damageBonusPercent: 20,
        bonusTargetEffects: [{ type: 'debuff_atk', duration: 1, value: 20 }],
      };
    }
    return null;
  }

  // 11. Habilidade de Raio: Descarga Voltaica
  if (skill.id === 'centelha_trovejante' || skill.elementalTag === 'lightning') {
    if (hasFreezing) {
      return {
        id: 'supercondutor_raio',
        name: 'Supercondutor',
        emoji: '⚡❄️',
        color: '#FACC15',
        summary: '+25% de dano e reduz em 1T o cooldown das demais habilidades do Omnimago',
        damageBonusPercent: 25,
        reduceCasterCooldowns: 1,
      };
    }
    if (hasBurn) {
      return {
        id: 'sobrecarga_explosiva_raio',
        name: 'Sobrecarga Explosiva',
        emoji: '⚡🔥',
        color: '#F59E0B',
        summary: '+25% de dano e causa 25% de dano explosivo em inimigos adjacentes',
        damageBonusPercent: 25,
        splashDamageRatio: 0.25,
      };
    }
    if (hasGale) {
      return {
        id: 'arco_ciclonico',
        name: 'Arco Ciclônico',
        emoji: '⚡🌪️',
        color: '#38BDF8',
        summary: '+20% de dano, ignora escudos e puxa o alvo 1 casa (acionando Eletrificado)',
        damageBonusPercent: 20,
        ignoresShield: true,
        extraPull: 1,
      };
    }
    return null;
  }

  // 12. Habilidade de Vento: Corte de Vácuo Ciclônico
  if (skill.id === 'vortice_aeromantico' || skill.elementalTag === 'wind') {
    if (hasBurn) {
      return {
        id: 'tempestade_ignea_vento',
        name: 'Tempestade Ígnea',
        emoji: '🌪️🔥',
        color: '#FB923C',
        summary: '+25% de dano e espalha Queimadura para inimigos adjacentes',
        damageBonusPercent: 25,
        spreadBurnRadius: 1,
      };
    }
    if (hasFreezing) {
      return {
        id: 'estilhaco_glacial',
        name: 'Estilhaço Glacial',
        emoji: '🌪️❄️',
        color: '#38BDF8',
        summary: '+25% de dano e reduz o ataque do alvo em 20% (1T)',
        damageBonusPercent: 25,
        bonusTargetEffects: [{ type: 'debuff_atk', duration: 1, value: 20 }],
      };
    }
    if (hasElectrified) {
      return {
        id: 'tempestade_estatica',
        name: 'Tempestade Estática',
        emoji: '🌪️⚡',
        color: '#2DD4BF',
        summary: '+20% de dano, empurra +1 casa adicional e concede +1 Movimento (2T) ao Omnimago',
        damageBonusPercent: 20,
        extraKnockback: 1,
        bonusCasterEffects: [{ type: 'buff_mov', duration: 2, value: 1 }],
      };
    }
    return null;
  }

  return null;
}
