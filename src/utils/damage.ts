import type { DamagePreview, DamageType, Skill, Unit } from '../types/game';

export interface CalculatedDamage {
  rawDamage: number;
  finalDamage: number;
  isKill: boolean;
  damageType: DamageType;
}

/**
 * Retorna se a unidade pertence a uma classe mágica ou tem afinidade mágica dominante.
 */
export function isMagicalClass(unit: Unit): boolean {
  const magicalArchetypes = [
    'mago',
    'mage',
    'curandeiro',
    'cleric',
    'necromante',
    'necromancer',
    'mago_runico',
    'rune_mage',
    'dark_mage',
    'thorn_witch',
  ];
  const className = (unit.className || '').toLowerCase();
  const avatarKey = (unit.avatarKey || '').toLowerCase();

  return (
    magicalArchetypes.some((k) => className.includes(k) || avatarKey.includes(k)) ||
    unit.mag > unit.atk * 1.15
  );
}

export function calculateBaseDamage(
  attacker: Unit,
  target: Unit,
  skill?: Skill
): { base: number; damageType: DamageType } {
  const isSkill = !!skill;

  if (isSkill) {
    const damageType: DamageType = skill.damageType;

    if (damageType === 'healing') {
      let healAmount = 0;
      if (skill.id === 'resistencia_suprema') {
        const ratio = skill.power ? Math.min(1.0, skill.power) : 0.5;
        healAmount = Math.max(1, Math.round(attacker.maxHp * ratio));
      } else if (skill.id === 'ressurreicao_mistica') {
        healAmount = Math.max(1, target.maxHp - target.currentHp);
      } else {
        const power = skill.power ?? 0;
        healAmount = Math.round(attacker.mag * power);
      }

      // Excess Heal Debuff: heals only half (50%) if healed within duration
      const hasExcessHeal = target.statusEffects?.some(
        (e) => e.type === 'excess_heal' && e.duration > 0
      );
      if (hasExcessHeal) {
        healAmount = Math.max(1, Math.round(healAmount * 0.5));
      }

      return { base: healAmount, damageType: 'healing' };
    }

    let attackStat = damageType === 'physical' ? attacker.atk : attacker.mag;
    if (skill.scalesWithDefRes || skill.id === 'impacto_blindado' || skill.id === 'provocacao') {
      attackStat = Math.round(attacker.def * 0.75 + attacker.res * 0.75);
    }
    const atkBuff = attacker.statusEffects?.find((e) => e.type === 'buff_atk' && e.duration > 0);
    if (atkBuff) {
      attackStat = Math.round(attackStat * (1 + atkBuff.value / 100));
    }
    const invisBuff = attacker.statusEffects?.find((e) => e.type === 'invisible' && e.duration > 0);
    if (invisBuff) {
      attackStat = Math.round(attackStat * (1 + invisBuff.value / 100));
    }

    // Special scaling for Contra-Ataque Furioso (deals more damage the lower the warrior's HP)
    if (skill.id === 'contra_ataque_furioso') {
      const lostHpRatio = Math.max(0, 1 - attacker.currentHp / attacker.maxHp);
      attackStat = Math.round(attackStat * (1 + lostHpRatio * 1.0));
    }

    attackStat *= skill.power;

    let targetDef = damageType === 'physical' ? target.def : target.res;
    const defDebuff = target.statusEffects?.find((e) => e.type === 'debuff_def' && e.duration > 0);
    if (defDebuff) {
      targetDef = Math.round(targetDef * (1 - defDebuff.value / 100));
    }

    if (skill.defenseIgnoreRatio) {
      const effectiveRatio = Math.min(0.30, skill.defenseIgnoreRatio);
      targetDef = Math.round(targetDef * (1 - effectiveRatio));
    }

    const base = Math.max(1, Math.round(attackStat - targetDef));
    return { base, damageType };
  }

  // --- Ataque Básico Normal (Sem Habilidade) ---
  const isMagical = isMagicalClass(attacker);
  const damageType: DamageType = isMagical ? 'magical' : 'physical';

  let attackStat = isMagical
    ? Math.max(attacker.atk, Math.round(attacker.mag * 0.7))
    : attacker.atk;

  const atkBuff = attacker.statusEffects?.find((e) => e.type === 'buff_atk' && e.duration > 0);
  if (atkBuff) {
    attackStat = Math.round(attackStat * (1 + atkBuff.value / 100));
  }
  const invisBuff = attacker.statusEffects?.find((e) => e.type === 'invisible' && e.duration > 0);
  if (invisBuff) {
    attackStat = Math.round(attackStat * (1 + invisBuff.value / 100));
  }

  let targetDef = damageType === 'physical' ? target.def : target.res;
  const defDebuff = target.statusEffects?.find((e) => e.type === 'debuff_def' && e.duration > 0);
  if (defDebuff) {
    targetDef = Math.round(targetDef * (1 - defDebuff.value / 100));
  }

  let base = Math.max(1, Math.round(attackStat - targetDef));

  // Contra bosses e mini bosses, ataques normais (sem habilidade) causam dano mínimo:
  // 2% contra os 2 primeiros bosses (até a fase 10) e 1% para os bosses seguintes
  const minBossDmg = getBossMinimumDamage(target);
  if (minBossDmg > 0) {
    base = Math.max(base, minBossDmg);
  }

  return { base, damageType };
}

/**
 * Retorna o piso de dano mínimo para ataques normais contra chefes e mini-chefes:
 * - 2% da vida máxima contra os 2 primeiros bosses (até a fase 10: Devorador e Astaroth)
 * - 1% da vida máxima para todos os chefes subsequentes (fase 15 em diante)
 */
export function getBossMinimumDamage(target: Unit): number {
  if (!target.isBoss && !target.isMiniBoss) return 0;
  const isEarlyBoss = (target.level <= 10) || target.avatarKey === 'devorador' || target.avatarKey === 'astaroth';
  const minRatio = isEarlyBoss ? 0.02 : 0.01;
  return Math.max(1, Math.round(target.maxHp * minRatio));
}

export function getDamagePreview(
  attacker: Unit,
  target: Unit,
  skill?: Skill
): DamagePreview {
  const { base, damageType } = calculateBaseDamage(attacker, target, skill);

  if (damageType === 'healing') {
    return {
      attacker,
      target,
      skill,
      minDamage: base,
      maxDamage: base,
      avgDamage: base,
      targetCurrentHp: target.currentHp,
      targetHpAfterMin: Math.min(target.maxHp, target.currentHp + base),
      targetHpAfterMax: Math.min(target.maxHp, target.currentHp + base),
      isKillLikely: false,
      damageType: 'healing',
    };
  }

  const minBossDmg = !skill ? getBossMinimumDamage(target) : 0;
  const minFloor = minBossDmg > 0 ? minBossDmg : 1;

  const minDamage = Math.max(minFloor, Math.floor(base * 0.9));
  const maxDamage = Math.max(minDamage, Math.ceil(base * 1.1));
  const avgDamage = Math.round((minDamage + maxDamage) / 2);

  // Consider active shields when previewing target HP after hit
  const targetShield = target.statusEffects
    ?.filter((e) => e.type === 'shield' && e.value > 0)
    .reduce((sum, e) => sum + e.value, 0) || 0;

  const effectiveMaxDamage = Math.max(0, maxDamage - targetShield);
  const effectiveMinDamage = Math.max(0, minDamage - targetShield);
  const effectiveAvgDamage = Math.max(0, avgDamage - targetShield);

  const targetHpAfterMax = Math.max(0, target.currentHp - effectiveMaxDamage);
  const targetHpAfterMin = Math.max(0, target.currentHp - effectiveMinDamage);

  return {
    attacker,
    target,
    skill,
    minDamage,
    maxDamage,
    avgDamage,
    targetCurrentHp: target.currentHp,
    targetHpAfterMin,
    targetHpAfterMax,
    isKillLikely: target.currentHp <= effectiveAvgDamage,
    damageType,
  };
}

export function rollActualDamage(
  attacker: Unit,
  target: Unit,
  skill?: Skill
): CalculatedDamage {
  const { base, damageType } = calculateBaseDamage(attacker, target, skill);

  if (damageType === 'healing') {
    return {
      rawDamage: base,
      finalDamage: base,
      isKill: false,
      damageType: 'healing',
    };
  }

  const minBossDmg = !skill ? getBossMinimumDamage(target) : 0;
  const minFloor = minBossDmg > 0 ? minBossDmg : 1;

  const factor = 0.9 + Math.random() * 0.2;
  const finalDamage = Math.max(minFloor, Math.round(base * factor));
  const isKill = target.currentHp - finalDamage <= 0;

  return {
    rawDamage: base,
    finalDamage,
    isKill,
    damageType,
  };
}
