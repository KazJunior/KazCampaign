import type { Unit } from '../types/game';
import { SKILLS, getEvolvedSkill } from './skills';
import { getItemById } from './items';
import { getItemEffectiveStats } from './baseUpgrades';

export interface StatGrowth {
  hp: number;
  atk: number;
  mag: number;
  def: number;
  res: number;
}

export interface ClassDefinition {
  className: string;
  name: string;
  role: string;
  maxHp: number;
  atk: number;
  mag: number;
  def: number;
  res: number;
  mov: number;
  range: number;
  color: string;
  avatarKey: string;
  baseSkillId: string;
  description: string;
  statGrowth: StatGrowth;
  isSecret?: boolean;
  goldCost?: number;
}

export const CLASS_DEFINITIONS: Record<string, ClassDefinition> = {
  guerreiro: {
    className: 'guerreiro',
    name: 'Guerreiro',
    role: 'Tanque & Linha de Frente',
    maxHp: 120,
    atk: 25,
    mag: 5,
    def: 12,
    res: 6,
    mov: 3,
    range: 1,
    color: '#4C8DFF',
    avatarKey: 'warrior',
    baseSkillId: 'golpe_poderoso',
    description: 'Especialista em combate corpo a corpo com alta resistência e proteção de aliados.',
    statGrowth: { hp: 16, atk: 3, mag: 1, def: 3, res: 2 },
  },
  arqueiro: {
    className: 'arqueiro',
    name: 'Arqueiro',
    role: 'Dano Físico à Distância',
    maxHp: 75,
    atk: 22,
    mag: 8,
    def: 5,
    res: 5,
    mov: 3,
    range: 3,
    color: '#43C878',
    avatarKey: 'archer',
    baseSkillId: 'flecha_perfurante',
    description: 'Especialista em disparos precisos à distância e eliminação de alvos estratégicos.',
    statGrowth: { hp: 10, atk: 4, mag: 1, def: 2, res: 2 },
  },
  mago: {
    className: 'mago',
    name: 'Mago de Fogo',
    role: 'Piromancia & Dano Explosivo',
    maxHp: 65,
    atk: 10,
    mag: 30,
    def: 4,
    res: 12,
    mov: 2,
    range: 3,
    color: '#FF5722',
    avatarKey: 'mage',
    baseSkillId: 'bola_de_fogo',
    description: 'Especialista em piromancia e feitiços devastadores de fogo em área, incinerando fileiras inimigas.',
    statGrowth: { hp: 8, atk: 1, mag: 5, def: 1, res: 3 },
  },
  curandeiro: {
    className: 'curandeiro',
    name: 'Curandeiro',
    role: 'Suporte & Restauração',
    maxHp: 85,
    atk: 12,
    mag: 24,
    def: 7,
    res: 10,
    mov: 3,
    range: 3,
    color: '#56E59A',
    avatarKey: 'cleric',
    baseSkillId: 'cura',
    description: 'Especialista em suporte divino à distância, curando aliados e purificando maldições.',
    statGrowth: { hp: 11, atk: 1, mag: 3, def: 2, res: 3 },
  },
  assassino: {
    className: 'assassino',
    name: 'Assassino',
    role: 'Dano Explosivo & Agilidade',
    maxHp: 70,
    atk: 28,
    mag: 6,
    def: 5,
    res: 4,
    mov: 4,
    range: 1,
    color: '#E65353',
    avatarKey: 'assassin',
    baseSkillId: 'golpe_sombrio',
    description: 'Mestre da mobilidade e do dano crítico brutal a alvos vulneráveis.',
    statGrowth: { hp: 9, atk: 5, mag: 1, def: 1, res: 1 },
  },
  cavaleiro_arcano: {
    className: 'cavaleiro_arcano',
    name: 'Cavaleiro Arcano',
    role: 'Combatente Híbrido Rúnico',
    maxHp: 100,
    atk: 22,
    mag: 20,
    def: 9,
    res: 8,
    mov: 3,
    range: 1,
    color: '#00BCD4',
    avatarKey: 'arcane_knight',
    baseSkillId: 'lamina_runica',
    description: 'Guerreiro místico que combina força física com encantamentos rúnicos.',
    statGrowth: { hp: 13, atk: 3, mag: 3, def: 2, res: 2 },
  },
  necromante: {
    className: 'necromante',
    name: 'Necromante',
    role: 'Magia Sombria & Debuffs',
    maxHp: 65,
    atk: 8,
    mag: 28,
    def: 6,
    res: 14,
    mov: 2,
    range: 3,
    color: '#8B008B',
    avatarKey: 'necromancer',
    baseSkillId: 'dreno_de_vida',
    description: 'Especialista em magias das trevas, drenando a vida dos inimigos e aplicando maldições.',
    statGrowth: { hp: 9, atk: 1, mag: 4, def: 1, res: 3 },
  },
  engenheiro: {
    className: 'engenheiro',
    name: 'Engenheiro',
    role: 'Engenharia & Utilidade',
    maxHp: 80,
    atk: 22,
    mag: 15,
    def: 10,
    res: 8,
    mov: 3,
    range: 3,
    color: '#F4A460',
    avatarKey: 'engineer',
    baseSkillId: 'tiro_de_cobre',
    description: 'Usa invenções explosivas e disparos à distância para controlar o campo de batalha.',
    statGrowth: { hp: 11, atk: 3, mag: 2, def: 2, res: 2 },
  },
  mago_runico: {
    className: 'mago_runico',
    name: 'Mago Rúnico',
    role: 'Magia Ancestral & Selos',
    maxHp: 75,
    atk: 12,
    mag: 26,
    def: 8,
    res: 12,
    mov: 2,
    range: 3,
    color: '#4169E1',
    avatarKey: 'rune_mage',
    baseSkillId: 'runa_de_choque',
    description: 'Especialista em evocar runas poderosas no campo que beneficiam aliados ou causam destruição.',
    statGrowth: { hp: 10, atk: 2, mag: 4, def: 2, res: 3 },
  },
  berserker: {
    className: 'berserker',
    name: 'Berserker',
    role: 'Dano Físico Extremo',
    maxHp: 130,
    atk: 32,
    mag: 2,
    def: 8,
    res: 4,
    mov: 4,
    range: 1,
    color: '#8B0000',
    avatarKey: 'berserker',
    baseSkillId: 'golpe_selvagem',
    description: 'Guerreiro implacável com altíssimos danos físicos, muitas vezes sacrificando a própria segurança.',
    statGrowth: { hp: 15, atk: 5, mag: 1, def: 2, res: 1 },
  },
  carrasco_vazio: {
    className: 'carrasco_vazio',
    name: 'Carrasco do Vazio',
    role: 'Samurai Dimensional & Carrasco',
    maxHp: 95,
    atk: 30,
    mag: 12,
    def: 7,
    res: 8,
    mov: 4,
    range: 1,
    color: '#9D4EDD',
    avatarKey: 'void_executioner',
    baseSkillId: 'corte_do_vazio',
    description: 'Samurai implacável que corta as fronteiras do espaço. Sua técnica suprema concede turnos adicionais imediatos ao ceifar alvos.',
    statGrowth: { hp: 12, atk: 5, mag: 2, def: 2, res: 2 },
    isSecret: true,
  },
  paladino: {
    className: 'paladino',
    name: 'Paladino',
    role: 'Tanque Sagrado & Suporte',
    maxHp: 115,
    atk: 22,
    mag: 18,
    def: 11,
    res: 9,
    mov: 3,
    range: 1,
    color: '#F59E0B',
    avatarKey: 'paladin',
    baseSkillId: 'golpe_sagrado',
    description: 'Guerreiro sagrado blindado pela fé, suportando castigo pesado enquanto ergue escudos de luz e cura sua equipe.',
    statGrowth: { hp: 14, atk: 3, mag: 2, def: 3, res: 2 },
    goldCost: 100000,
  },
  lanceiro: {
    className: 'lanceiro',
    name: 'Lanceiro',
    role: 'Perfuração & Longo Alcance',
    maxHp: 90,
    atk: 26,
    mag: 8,
    def: 8,
    res: 6,
    mov: 4,
    range: 2,
    color: '#0EA5E9',
    avatarKey: 'lancer',
    baseSkillId: 'estocada_perfurante',
    description: 'Combatente ágil armado com lança de longo alcance (2 casas), capaz de golpear com perfuração de armadura e saltar sobre as defesas inimigas.',
    statGrowth: { hp: 11, atk: 4, mag: 1, def: 2, res: 2 },
    goldCost: 100000,
  },
  bardo: {
    className: 'bardo',
    name: 'Bardo',
    role: 'Buffs de Equipe & Harmonia',
    maxHp: 75,
    atk: 14,
    mag: 24,
    def: 6,
    res: 9,
    mov: 3,
    range: 3,
    color: '#EC4899',
    avatarKey: 'bard',
    baseSkillId: 'cancao_da_bravura',
    description: 'Menestrel arcano que entoa canções e sinfonias de combate, inspirando aliados com bônus de dano, movimento e escudos sônicos.',
    statGrowth: { hp: 9, atk: 2, mag: 4, def: 2, res: 2 },
    goldCost: 100000,
  },
  mago_gelo: {
    className: 'mago_gelo',
    name: 'Mago de Gelo',
    role: 'Criomancia & Controle',
    maxHp: 70,
    atk: 8,
    mag: 32,
    def: 5,
    res: 14,
    mov: 2,
    range: 3,
    color: '#06B6D4',
    avatarKey: 'ice_mage',
    baseSkillId: 'raio_congelante',
    description: 'Mestre da magia glacial e das tempestades de granizo, paralisando e desacelerando adversários enquanto fragmenta suas defesas.',
    statGrowth: { hp: 8, atk: 1, mag: 5, def: 1, res: 4 },
    goldCost: 100000,
  },
};

export const INITIAL_CLASSES: string[] = ['guerreiro', 'arqueiro', 'mago', 'curandeiro'];

export interface ClassUnlockInfo {
  requiredLevel: number;
  bossName: string;
  isBoss: boolean; // true = Boss, false = Mini Boss
  description: string;
}

export const CLASS_UNLOCK_CONDITIONS: Record<string, ClassUnlockInfo> = {
  assassino: {
    requiredLevel: 5,
    bossName: 'Devorador das Profundezas (Fase 5)',
    isBoss: false,
    description: 'Derrote o Mini Boss Devorador na Fase 5 para desbloquear o Assassino.',
  },
  cavaleiro_arcano: {
    requiredLevel: 10,
    bossName: 'Astaroth, Soberano do Abismo (Fase 10)',
    isBoss: true,
    description: 'Derrote o Boss Poderoso Astaroth na Fase 10 para desbloquear o Cavaleiro Arcano.',
  },
  necromante: {
    requiredLevel: 15,
    bossName: 'Arauto dos Espectros (Fase 15)',
    isBoss: false,
    description: 'Derrote o Mini Boss Arauto dos Espectros na Fase 15 para desbloquear o Necromante.',
  },
  engenheiro: {
    requiredLevel: 20,
    bossName: 'Vulcanus, Titã das Forjas (Fase 20)',
    isBoss: true,
    description: 'Derrote o Boss Poderoso Vulcanus na Fase 20 para desbloquear o Engenheiro.',
  },
  mago_runico: {
    requiredLevel: 25,
    bossName: 'Arquimago das Runas (Fase 25)',
    isBoss: false,
    description: 'Derrote o Mini Boss Arquimago das Runas na Fase 25 para desbloquear o Mago Rúnico.',
  },
  berserker: {
    requiredLevel: 30,
    bossName: 'Valgar, o Carniceiro Imortal (Fase 30)',
    isBoss: true,
    description: 'Derrote o Boss Poderoso Valgar na Fase 30 para desbloquear o Berserker.',
  },
};

export interface SecretClassUnlockInfo {
  title: string;
  description: string;
  riddle: string;
}

export const SECRET_CLASS_UNLOCK_CONDITIONS: Record<string, SecretClassUnlockInfo> = {
  carrasco_vazio: {
    title: 'Carrasco do Vazio',
    description: 'Derrote Astaroth (Fase 10) utilizando apenas classes de combate corpo a corpo (Alcance 1).',
    riddle: `Nas sombras mais profundas do Trono, onde a luz jamais alcançou... O Carrasco do Vazio observa os tolos que ousam invadir o domínio de Astaroth.

Se desejas empunhar a lâmina proibida que rasga o espaço, abandone a covardia do refúgio gerado por métodos fúteis e inferiores de combate.

Desça ao abismo com coragem e encare Astaroth de frente. Façam o Soberano tombar sentindo o peso do aço em sua carne...`,
  },
};

export function getMaxCompletedLevel(progress: {
  activeAdventure?: { currentLevelId: number } | null;
  adventureHistory?: { farthestLevel: number; result: string }[] | null;
  completedLevels?: number[] | null;
  leaderboardHighestLevel?: number | null;
}): number {
  let max = 0;
  if (typeof progress.leaderboardHighestLevel === 'number') {
    max = Math.max(max, progress.leaderboardHighestLevel);
  }
  if (progress.activeAdventure && progress.activeAdventure.currentLevelId > 1) {
    max = Math.max(max, progress.activeAdventure.currentLevelId - 1);
  }
  if (Array.isArray(progress.adventureHistory)) {
    for (const rec of progress.adventureHistory) {
      if (rec.result === 'victory') {
        max = Math.max(max, 50);
      } else if (rec.farthestLevel && rec.farthestLevel > 1) {
        max = Math.max(max, rec.farthestLevel - 1);
      }
    }
  }
  if (Array.isArray(progress.completedLevels) && progress.completedLevels.length > 0) {
    max = Math.max(max, ...progress.completedLevels);
  }
  return max;
}

export const PURCHASABLE_CLASSES: Record<string, { goldCost: number; name: string; description: string }> = {
  paladino: {
    goldCost: 100000,
    name: 'Paladino',
    description: 'Compre o Paladino por 100.000 moedas de ouro.',
  },
  lanceiro: {
    goldCost: 100000,
    name: 'Lanceiro',
    description: 'Compre o Lanceiro por 100.000 moedas de ouro.',
  },
  bardo: {
    goldCost: 100000,
    name: 'Bardo',
    description: 'Compre o Bardo por 100.000 moedas de ouro.',
  },
  mago_gelo: {
    goldCost: 100000,
    name: 'Mago de Gelo',
    description: 'Compre o Mago de Gelo por 100.000 moedas de ouro.',
  },
};

export function sanitizeUnlockedClasses(
  rawUnlocked: string[] | undefined,
  maxLevelCompleted: number = 0,
  completedLevels: number[] = []
): string[] {
  const allowed = new Set<string>(INITIAL_CLASSES);

  // 1. Preserve any valid class the user has already unlocked (meta-progression is permanent)
  if (Array.isArray(rawUnlocked)) {
    for (const c of rawUnlocked) {
      if (typeof c === 'string' && CLASS_DEFINITIONS[c]) {
        allowed.add(c);
      }
    }
  }

  // 2. Automatically grant any boss unlocks earned by level progression or completed levels
  Object.entries(CLASS_UNLOCK_CONDITIONS).forEach(([cName, cond]) => {
    if (maxLevelCompleted >= cond.requiredLevel || completedLevels.includes(cond.requiredLevel)) {
      allowed.add(cName);
    }
  });

  return Array.from(allowed);
}

export function sanitizePartyClasses(party: string[] | undefined, unlockedClasses: string[]): string[] {
  const validUnlocked = new Set(unlockedClasses);
  const result: string[] = [];
  if (Array.isArray(party)) {
    for (const c of party) {
      if (validUnlocked.has(c) && !result.includes(c)) {
        result.push(c);
      }
    }
  }
  for (const c of INITIAL_CLASSES) {
    if (result.length >= 4) break;
    if (!result.includes(c)) {
      result.push(c);
    }
  }
  return result.slice(0, 4);
}

export function createPlayerUnit(
  className: keyof typeof CLASS_DEFINITIONS,
  id: string,
  x: number,
  y: number,
  level = 1,
  xp = 0,
  bonusHp = 0,
  bonusAtk = 0,
  bonusDef = 0,
  bonusMag = 0,
  bonusRes = 0,
  learnedSkillIds: string[] = [],
  skillLevels: Record<string, number> = {},
  equippedItemIds: string[] = [],
  itemUpgrades?: Record<string, number>,
  classUpgradeBonus?: { hp?: number; atk?: number; mag?: number; def?: number; res?: number },
  globalBonus?: { hp?: number }
): Unit {
  const def = CLASS_DEFINITIONS[className];
  const growth = def.statGrowth || { hp: 12, atk: 3, mag: 3, def: 2, res: 1 };
  const levelOffsets = Math.max(0, level - 1);

  // Somatório dos atributos concedidos pelos itens equipados (com bônus de aprimoramento se houver)
  let itemHp = 0;
  let itemAtk = 0;
  let itemMag = 0;
  let itemDef = 0;
  let itemRes = 0;
  let itemMov = 0;
  let itemRange = 0;

  for (const itemId of equippedItemIds) {
    const item = getItemById(itemId);
    if (item && item.stats) {
      const upgradeLvl = itemUpgrades?.[itemId] || 0;
      const effectiveStats = getItemEffectiveStats(item.stats, upgradeLvl);
      itemHp += effectiveStats.hp || 0;
      itemAtk += effectiveStats.atk || 0;
      itemMag += effectiveStats.mag || 0;
      itemDef += effectiveStats.def || 0;
      itemRes += effectiveStats.res || 0;
      itemMov += effectiveStats.mov || 0;
      itemRange += effectiveStats.range || 0;
    }
  }

  const cBonus = classUpgradeBonus || { hp: 0, atk: 0, mag: 0, def: 0, res: 0 };
  const gHp = globalBonus?.hp || 0;

  const hpBonus = levelOffsets * growth.hp + bonusHp + itemHp + (cBonus.hp || 0) + gHp;
  const maxHp = def.maxHp + hpBonus;
  const atk = def.atk + levelOffsets * growth.atk + bonusAtk + itemAtk + (cBonus.atk || 0);
  const mag = def.mag + levelOffsets * growth.mag + bonusMag + itemMag + (cBonus.mag || 0);
  const unitDef = def.def + levelOffsets * growth.def + bonusDef + itemDef + (cBonus.def || 0);
  const res = def.res + levelOffsets * growth.res + bonusRes + itemRes + (cBonus.res || 0);
  const mov = def.mov + itemMov;
  const range = def.range + itemRange;

  // Max 5 skills total: baseSkill + up to 4 learnedSkillIds
  const skillListIds = Array.from(new Set([def.baseSkillId, ...learnedSkillIds])).slice(0, 5);
  const skills = skillListIds
    .map((skId) => SKILLS[skId])
    .filter(Boolean)
    .map((sk) => {
      const skLevel = skillLevels[sk.id] || 1;
      const evolved = getEvolvedSkill(sk, skLevel);
      if (evolved.damageType === 'healing' || evolved.statusEffect?.type === 'shield') {
        evolved.cooldownMax = Math.max(2, evolved.cooldownMax);
      }
      if (
        (evolved.lifestealPercent && evolved.lifestealPercent > 0) ||
        evolved.id === 'dreno_de_vida' ||
        evolved.id === 'dreno_de_seiva' ||
        evolved.id === 'sedenta_de_runas'
      ) {
        evolved.cooldownMax = Math.max(3, evolved.cooldownMax);
      }
      if (
        evolved.statusEffect?.type === 'stun' ||
        evolved.secondaryStatusEffect?.type === 'stun'
      ) {
        evolved.cooldownMax = Math.max(4, evolved.cooldownMax);
      }
      return evolved;
    });

  return {
    id,
    name: def.name,
    className: def.className,
    faction: 'player',
    level,
    xp,
    maxXp: level * 100,
    maxHp,
    currentHp: maxHp,
    atk,
    mag,
    def: unitDef,
    res,
    mov,
    range,
    x,
    y,
    hasMoved: false,
    hasAttacked: false,
    isDead: false,
    color: def.color,
    avatarKey: def.avatarKey,
    skills,
    learnedSkillIds: skillListIds.filter((id) => id !== def.baseSkillId),
    skillLevels,
    equippedItemIds,
    statusEffects: [],
    damageDealt: 0,
    kills: 0,
  };
}
