import type { Skill, StatusEffect, Unit } from '../types/game';

export const ARTIFICE_TOWER_UPGRADE_SKILL_IDS = [
  'manutencao_de_campo',
  'calibracao_modular',
  'sobrecarga_do_nucleo',
] as const;

export type ArtificeTowerUpgradeSkillId = (typeof ARTIFICE_TOWER_UPGRADE_SKILL_IDS)[number];

export const ARTIFICE_CONSTRUCT_AVATAR_KEYS = new Set<string>([
  'torreta_balista',
  'bobina_tesla',
  'drone_medico',
]);

export function isArtificeTowerUpgradeSkill(skillId?: string | null): skillId is ArtificeTowerUpgradeSkillId {
  return Boolean(skillId && (ARTIFICE_TOWER_UPGRADE_SKILL_IDS as readonly string[]).includes(skillId));
}

export function isArtificeConstruct(unit?: Unit | null): boolean {
  return Boolean(unit && unit.isSummoned && ARTIFICE_CONSTRUCT_AVATAR_KEYS.has(unit.avatarKey));
}

export interface TowerUpgradeResult {
  updatedTower: Unit;
  summaryText: string;
  accentColor: string;
  healedAmount: number;
  newDuration: number;
}

/**
 * Aplica uma das 3 habilidades de melhoria de torre do Artífice sobre um de seus construtos
 * (Torreta Balista, Bobina Voltaica ou Drone Reparador), estendendo a duração e concedendo
 * melhorias únicas conforme o tipo da torre.
 */
export function applyArtificeTowerUpgrade(
  tower: Unit,
  skillId: ArtificeTowerUpgradeSkillId,
  currentTurn: number
): TowerUpgradeResult {
  const clonedSkills: Skill[] = (tower.skills || []).map((sk) => ({
    ...sk,
    statusEffect: sk.statusEffect ? { ...sk.statusEffect } : undefined,
    secondaryStatusEffect: sk.secondaryStatusEffect ? { ...sk.secondaryStatusEffect } : undefined,
  }));
  const primarySkill = clonedSkills[0];

  const currentLife =
    tower.statusEffects?.find((e) => e.type === 'summon_lifetime')?.duration ??
    tower.summonTurnsLeft ??
    2;

  const extraTurns = skillId === 'manutencao_de_campo' ? 2 : 1;
  const newDuration = Math.min(6, currentLife + extraTurns);

  let nextEffects: StatusEffect[] = (tower.statusEffects || []).map((e) =>
    e.type === 'summon_lifetime'
      ? { ...e, duration: newDuration, value: newDuration, appliedTurn: undefined }
      : { ...e }
  );
  if (!nextEffects.some((e) => e.type === 'summon_lifetime')) {
    nextEffects.push({ type: 'summon_lifetime', duration: newDuration, value: newDuration });
  }

  let nextHp = tower.currentHp;
  let healedAmount = 0;
  let nextAtk = tower.atk;
  let nextMag = tower.mag;
  let nextMov = tower.mov;
  let nextRange = tower.range;
  let nextHasAttacked = tower.hasAttacked;
  let nextHasMoved = tower.hasMoved;
  let summaryText = '';
  let accentColor = '#38BDF8';

  const towerType = tower.avatarKey;

  if (skillId === 'manutencao_de_campo') {
    accentColor = '#10B981';
    const heal = Math.max(1, Math.round(tower.maxHp * 0.5));
    nextHp = Math.min(tower.maxHp, tower.currentHp + heal);
    healedAmount = nextHp - tower.currentHp;

    nextEffects = [
      ...nextEffects.filter((e) => e.type !== 'shield'),
      { type: 'shield', duration: 2, value: 40, appliedTurn: currentTurn },
    ];

    if (towerType === 'torreta_balista') {
      nextRange = Math.min(6, tower.range + 1);
      if (primarySkill) {
        primarySkill.rangeMax = Math.min(6, primarySkill.rangeMax + 1);
        primarySkill.defenseIgnoreRatio = Math.min(0.45, Number(((primarySkill.defenseIgnoreRatio || 0) + 0.15).toFixed(2)));
        primarySkill.description = `Torreta aprimorada (Alcance 1-${primarySkill.rangeMax}): causa ${Math.round(primarySkill.power * 100)}% ATK e ignora ${Math.round((primarySkill.defenseIgnoreRatio || 0) * 100)}% da defesa.`;
      }
      summaryText = `🔧 Balista +${extraTurns}T | +1 Alcance & +15% Perfuração!`;
    } else if (towerType === 'bobina_tesla') {
      if (primarySkill) {
        primarySkill.chainCount = Math.min(4, (primarySkill.chainCount || 2) + 1);
        primarySkill.chainRange = Math.min(4, (primarySkill.chainRange || 2) + 1);
        primarySkill.description = `Bobina aprimorada: dispara eletricidade em cadeia para até ${primarySkill.chainCount} inimigos (salto ${primarySkill.chainRange}), causando ${Math.round(primarySkill.power * 100)}% MAG + Eletrificado.`;
      }
      summaryText = `🔧 Bobina +${extraTurns}T | +1 Alvo em Cadeia!`;
    } else if (towerType === 'drone_medico') {
      nextMov = Math.min(5, tower.mov + 1);
      if (primarySkill) {
        primarySkill.cleansesDebuffs = true;
        primarySkill.description = `Drone aprimorado: restaura ${Math.round(primarySkill.power * 100)}% MAG, concede ${primarySkill.statusEffect?.value || 25} de escudo e purifica debuffs!`;
      }
      summaryText = `🔧 Drone +${extraTurns}T | +1 Mov & Purificação!`;
    } else {
      summaryText = `🔧 Construto Reparado (+${extraTurns}T & +40 Escudo)!`;
    }
  } else if (skillId === 'calibracao_modular') {
    accentColor = '#F59E0B';
    nextAtk = Math.round(tower.atk * 1.25);
    nextMag = Math.round(tower.mag * 1.25);

    if (towerType === 'torreta_balista') {
      if (primarySkill) {
        primarySkill.power = Math.min(1.75, Number((primarySkill.power + 0.2).toFixed(2)));
        primarySkill.statusEffect = { type: 'debuff_def', duration: 2, value: 20 };
        primarySkill.description = `Balista calibrada: causa ${Math.round(primarySkill.power * 100)}% ATK, ignora ${Math.round((primarySkill.defenseIgnoreRatio || 0) * 100)}% DEF e aplica Quebra de Defesa (-20% 2T).`;
      }
      summaryText = `⚙️ Balista +${extraTurns}T | +25% ATK & Quebra de Defesa!`;
    } else if (towerType === 'bobina_tesla') {
      if (primarySkill) {
        primarySkill.ignoresShield = true;
        primarySkill.statusEffect = { type: 'electrified', duration: 2, value: 1 };
        primarySkill.description = `Bobina calibrada: dispara em cadeia ignorando escudos (${Math.round(primarySkill.power * 100)}% MAG) e aplica Eletrificado (2T).`;
      }
      summaryText = `⚙️ Bobina +${extraTurns}T | +25% MAG & Ignora Escudos!`;
    } else if (towerType === 'drone_medico') {
      if (primarySkill) {
        primarySkill.power = Math.min(1.5, Number((primarySkill.power + 0.25).toFixed(2)));
        const nextShieldVal = Math.min(90, (primarySkill.statusEffect?.value || 25) + 25);
        primarySkill.statusEffect = { type: 'shield', duration: 2, value: nextShieldVal };
        primarySkill.description = `Drone calibrado: restaura ${Math.round(primarySkill.power * 100)}% MAG e concede ${nextShieldVal} de escudo (2T).`;
      }
      summaryText = `⚙️ Drone +${extraTurns}T | +25% Cura & Escudo Dobrado!`;
    } else {
      summaryText = `⚙️ Construto Calibrado (+${extraTurns}T & +25% ATK/MAG)!`;
    }
  } else {
    // sobrecarga_do_nucleo
    accentColor = '#FACC15';
    nextHasAttacked = false;
    nextHasMoved = towerType === 'drone_medico' ? false : tower.hasMoved;
    if (primarySkill) {
      primarySkill.currentCooldown = 0;
    }

    nextEffects = [
      ...nextEffects.filter((e) => e.type !== 'buff_atk'),
      { type: 'buff_atk', duration: 2, value: 20, appliedTurn: currentTurn },
    ];

    if (towerType === 'torreta_balista') {
      if (primarySkill) {
        primarySkill.aoeRadius = 1;
        primarySkill.aoeType = 'circle';
        primarySkill.description = `Balista em Sobrecarga: dispara virotes explosivos em área circular (raio 1) causando ${Math.round(primarySkill.power * 100)}% ATK!`;
      }
      summaryText = `⚡ Balista +${extraTurns}T | Ação Extra & Tiro Explosivo!`;
    } else if (towerType === 'bobina_tesla') {
      if (primarySkill) {
        primarySkill.power = Math.min(1.65, Number((primarySkill.power + 0.2).toFixed(2)));
        primarySkill.secondaryStatusEffect = { type: 'burn', duration: 2, value: 2 };
        primarySkill.description = `Bobina em Sobrecarga: arcos voltaicos de ${Math.round(primarySkill.power * 100)}% MAG que aplicam Eletrificado e Queimadura (2T)!`;
      }
      summaryText = `⚡ Bobina +${extraTurns}T | Ação Extra & Queimadura!`;
    } else if (towerType === 'drone_medico') {
      if (primarySkill) {
        primarySkill.aoeRadius = 1;
        primarySkill.aoeType = 'circle';
        primarySkill.secondaryStatusEffect = { type: 'buff_atk', duration: 2, value: 15 };
        primarySkill.description = `Drone em Sobrecarga: Nano-Reparo em área circular (raio 1) curando ${Math.round(primarySkill.power * 100)}% MAG, escudando e concedendo +15% Dano (2T)!`;
      }
      summaryText = `⚡ Drone +${extraTurns}T | Ação Extra & Cura/Buff em Área!`;
    } else {
      summaryText = `⚡ Sobrecarga (+${extraTurns}T, Ação Extra & +20% Dano)!`;
    }
  }

  return {
    updatedTower: {
      ...tower,
      currentHp: nextHp,
      atk: nextAtk,
      mag: nextMag,
      mov: nextMov,
      range: nextRange,
      hasAttacked: nextHasAttacked,
      hasMoved: nextHasMoved,
      summonTurnsLeft: newDuration,
      skills: clonedSkills,
      statusEffects: nextEffects,
    },
    summaryText,
    accentColor,
    healedAmount,
    newDuration,
  };
}

