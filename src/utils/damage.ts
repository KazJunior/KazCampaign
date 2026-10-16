import type { DamagePreview, DamageType, Skill, Unit } from '../types/game';

export interface CalculatedDamage {
  rawDamage: number;
  finalDamage: number;
  isKill: boolean;
  damageType: DamageType;
}

export function calculateBaseDamage(
  attacker: Unit,
  target: Unit,
  skill?: Skill
): { base: number; damageType: DamageType } {
  const isSkill = !!skill;
  const damageType: DamageType = skill ? skill.damageType : 'physical';

  if (damageType === 'healing') {
    const power = skill ? skill.power : 1.0;
    const healAmount = Math.round(attacker.mag * power);
    return { base: healAmount, damageType: 'healing' };
  }

  let attackStat = damageType === 'physical' ? attacker.atk : attacker.mag;
  let targetDef = damageType === 'physical' ? target.def : target.res;

  if (isSkill) {
    attackStat *= skill.power;

    if (skill.defenseIgnoreRatio) {
      targetDef = Math.round(targetDef * (1 - skill.defenseIgnoreRatio));
    }
  }

  const base = Math.max(1, Math.round(attackStat - targetDef));
  return { base, damageType };
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

  const minDamage = Math.max(1, Math.floor(base * 0.9));
  const maxDamage = Math.max(1, Math.ceil(base * 1.1));
  const avgDamage = Math.round((minDamage + maxDamage) / 2);

  const targetHpAfterMax = Math.max(0, target.currentHp - maxDamage);
  const targetHpAfterMin = Math.max(0, target.currentHp - minDamage);

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
    isKillLikely: target.currentHp <= avgDamage,
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

  const factor = 0.9 + Math.random() * 0.2;
  const finalDamage = Math.max(1, Math.round(base * factor));
  const isKill = target.currentHp - finalDamage <= 0;

  return {
    rawDamage: base,
    finalDamage,
    isKill,
    damageType,
  };
}
