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
    role: 'Tanque de Controle & Linha de Frente',
    maxHp: 125,
    atk: 25,
    mag: 5,
    def: 13,
    res: 7,
    mov: 3,
    range: 1,
    color: '#4C8DFF',
    avatarKey: 'warrior',
    baseSkillId: 'golpe_poderoso',
    description: 'Tanque de controle de linha de frente com foco em retenção de ameaças (provocação), absorção direta de dano com escudos maciços e quebra de postura corpo a corpo.',
    statGrowth: { hp: 16, atk: 3, mag: 1, def: 3, res: 2 },
  },
  arqueiro: {
    className: 'arqueiro',
    name: 'Arqueiro',
    role: 'Atirador de Precisão a Longa Distância',
    maxHp: 75,
    atk: 24,
    mag: 8,
    def: 5,
    res: 5,
    mov: 3,
    range: 4,
    color: '#43C878',
    avatarKey: 'archer',
    baseSkillId: 'flecha_perfurante',
    description: 'Atirador de precisão a longa distância com foco em dano físico perfurante, destruição de armaduras e eliminação segura sem retaliação.',
    statGrowth: { hp: 10, atk: 4, mag: 1, def: 2, res: 2 },
  },
  mago: {
    className: 'mago',
    name: 'Mago de Fogo',
    role: 'Dano Mágico em Área & Queimadura',
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
    description: 'Causador de dano mágico devastador com foco em bombardeios de área no solo e aplicação contínua de queimaduras persistentes.',
    statGrowth: { hp: 8, atk: 1, mag: 5, def: 1, res: 3 },
  },
  curandeiro: {
    className: 'curandeiro',
    name: 'Curandeiro',
    role: 'Suporte de Sustentação Vital',
    maxHp: 85,
    atk: 12,
    mag: 25,
    def: 7,
    res: 11,
    mov: 3,
    range: 3,
    color: '#56E59A',
    avatarKey: 'cleric',
    baseSkillId: 'cura',
    description: 'Suporte de sustentação vital com foco em regeneração direta de vida (individual e área), remoção completa de penalidades e concessão de escudos protetores.',
    statGrowth: { hp: 11, atk: 1, mag: 3, def: 2, res: 3 },
  },
  assassino: {
    className: 'assassino',
    name: 'Assassino',
    role: 'Finalizador de Alta Mobilidade',
    maxHp: 70,
    atk: 29,
    mag: 6,
    def: 5,
    res: 4,
    mov: 4,
    range: 1,
    color: '#E65353',
    avatarKey: 'assassin',
    baseSkillId: 'golpe_sombrio',
    description: 'Finalizador de altíssima mobilidade com foco em reposicionamento rápido (teleporte nas sombras), furtividade e aniquilação letal em alvo único.',
    statGrowth: { hp: 9, atk: 5, mag: 1, def: 1, res: 1 },
  },
  cavaleiro_arcano: {
    className: 'cavaleiro_arcano',
    name: 'Cavaleiro Arcano',
    role: 'Combatente Híbrido de Espada de Aura',
    maxHp: 105,
    atk: 22,
    mag: 22,
    def: 9,
    res: 8,
    mov: 3,
    range: 2,
    color: '#00BCD4',
    avatarKey: 'arcane_knight',
    baseSkillId: 'lamina_runica',
    description: 'Combatente híbrido versátil com foco em ataques de média distância com sua espada de aura (alcance 1-2), alternando entre marcialidade física e feitiços mágicos.',
    statGrowth: { hp: 13, atk: 3, mag: 3, def: 2, res: 2 },
  },
  necromante: {
    className: 'necromante',
    name: 'Necromante',
    role: 'Conjurador de Desgaste & Drenagem',
    maxHp: 70,
    atk: 8,
    mag: 28,
    def: 6,
    res: 14,
    mov: 2,
    range: 3,
    color: '#8B008B',
    avatarKey: 'necromancer',
    baseSkillId: 'dreno_de_vida',
    description: 'Conjurador de desgaste com foco em drenagem contínua de vida para si mesmo e aplicação de debuffs debilitantes de veneno, redução de defesa e lentidão.',
    statGrowth: { hp: 9, atk: 1, mag: 4, def: 1, res: 3 },
  },
  druida: {
    className: 'druida',
    name: 'Druída',
    role: 'Controle de Área & Suporte Vital',
    maxHp: 85,
    atk: 14,
    mag: 24,
    def: 9,
    res: 10,
    mov: 3,
    range: 3,
    color: '#10B981',
    avatarKey: 'druid',
    baseSkillId: 'raizes_vinculantes',
    description: 'Especialista em controle de área com raízes e vinhas de espinhos, misturado com habilidades de suporte geral como curas revitalizantes, bênçãos de matilha e escudos de casca de ferro.',
    statGrowth: { hp: 12, atk: 2, mag: 4, def: 2, res: 2 },
  },
  mago_runico: {
    className: 'mago_runico',
    name: 'Mago Rúnico',
    role: 'Atacante Mágico de Alvo Único',
    maxHp: 75,
    atk: 12,
    mag: 28,
    def: 8,
    res: 12,
    mov: 2,
    range: 4,
    color: '#4169E1',
    avatarKey: 'rune_mage',
    baseSkillId: 'runa_de_choque',
    description: 'Atacante mágico de precisão com foco em dano concentrado em alvo único, disparando lanças de éter com penetração e selos de vulnerabilidade.',
    statGrowth: { hp: 10, atk: 2, mag: 4, def: 2, res: 3 },
  },
  berserker: {
    className: 'berserker',
    name: 'Berserker',
    role: 'Combatente Corpo a Corpo de Alto Risco',
    maxHp: 135,
    atk: 34,
    mag: 2,
    def: 8,
    res: 4,
    mov: 4,
    range: 1,
    color: '#8B0000',
    avatarKey: 'berserker',
    baseSkillId: 'golpe_selvagem',
    description: 'Combatente corpo a corpo de alto risco que sacrifica vida própria para desferir golpes devastadores, enquanto sobrevive através de roubo de vida maciço.',
    statGrowth: { hp: 15, atk: 5, mag: 1, def: 2, res: 1 },
  },
  carrasco_vazio: {
    className: 'carrasco_vazio',
    name: 'Carrasco do Vazio',
    role: 'Samurai Dimensional & Carrasco',
    maxHp: 95,
    atk: 31,
    mag: 12,
    def: 7,
    res: 8,
    mov: 4,
    range: 1,
    color: '#9D4EDD',
    avatarKey: 'void_executioner',
    baseSkillId: 'corte_do_vazio',
    description: 'Samurai dimensional com foco em ataques ultrarrápidos, resetar ação e movimento com abates, alta mobilidade através de fendas e golpes que rasgam o vazio.',
    statGrowth: { hp: 12, atk: 5, mag: 2, def: 2, res: 2 },
    isSecret: true,
  },
  paladino: {
    className: 'paladino',
    name: 'Paladino',
    role: 'Tanque Sagrado & Auras',
    maxHp: 120,
    atk: 22,
    mag: 18,
    def: 12,
    res: 10,
    mov: 3,
    range: 1,
    color: '#F59E0B',
    avatarKey: 'paladin',
    baseSkillId: 'golpe_sagrado',
    description: 'Tanque sagrado com foco em auras de mitigação de dano, atração de ameaças (provocação), curas emergenciais e proteção inquebrantável para a equipe.',
    statGrowth: { hp: 14, atk: 3, mag: 2, def: 3, res: 2 },
    goldCost: 100000,
  },
  lanceiro: {
    className: 'lanceiro',
    name: 'Lanceiro',
    role: 'Duelista de Alcance Intermediário',
    maxHp: 95,
    atk: 27,
    mag: 8,
    def: 8,
    res: 6,
    mov: 4,
    range: 2,
    color: '#0EA5E9',
    avatarKey: 'lancer',
    baseSkillId: 'estocada_perfurante',
    description: 'Duelista de alcance intermediário (2 casas) com foco em ataques perfurantes em linha reta, controle de recuo tático e penalização severa da movimentação inimiga.',
    statGrowth: { hp: 11, atk: 4, mag: 1, def: 2, res: 2 },
    goldCost: 100000,
  },
  bardo: {
    className: 'bardo',
    name: 'Bardo',
    role: 'Suporte Utilitário de Ritmo & Aceleração',
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
    description: 'Suporte utilitário de ritmo com foco em manipulação da ordem de turnos, concessão de pontos de ação e turnos adicionais a aliados e amplificação global do grupo.',
    statGrowth: { hp: 9, atk: 2, mag: 4, def: 2, res: 2 },
    goldCost: 100000,
  },
  mago_gelo: {
    className: 'mago_gelo',
    name: 'Mago de Gelo',
    role: 'Criomancia & Controle de Tabuleiro',
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
    description: 'Conjurador de controle de grupo com foco em congelamento de ladrilhos, desaceleração severa de inimigos e criação de barreiras sólidas intransponíveis no tabuleiro.',
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
  druida: {
    requiredLevel: 20,
    bossName: 'Vulcanus, Titã das Forjas (Fase 20)',
    isBoss: true,
    description: 'Derrote o Boss Poderoso Vulcanus na Fase 20 para desbloquear o Druída.',
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

  // 1. Preserve valid classes unlocked via shop (purchasable) or secret conditions.
  // Boss unlock classes (CLASS_UNLOCK_CONDITIONS, such as 'druida') strictly require completing their required stage!
  if (Array.isArray(rawUnlocked)) {
    for (const rawC of rawUnlocked) {
      const c = rawC === 'engenheiro' ? 'druida' : rawC;
      if (typeof c === 'string' && CLASS_DEFINITIONS[c]) {
        const unlockCond = CLASS_UNLOCK_CONDITIONS[c];
        if (unlockCond) {
          if (maxLevelCompleted >= unlockCond.requiredLevel || completedLevels.includes(unlockCond.requiredLevel)) {
            allowed.add(c);
          }
        } else {
          allowed.add(c);
        }
      }
    }
  }

  // 2. Automatically grant any boss unlocks earned by level progression or completed levels
  Object.entries(CLASS_UNLOCK_CONDITIONS).forEach(([cName, cond]) => {
    if (maxLevelCompleted >= cond.requiredLevel || completedLevels.includes(cond.requiredLevel)) {
      const canonicalName = cName === 'engenheiro' ? 'druida' : cName;
      allowed.add(canonicalName);
    }
  });

  return Array.from(allowed);
}

export function sanitizePartyClasses(party: string[] | undefined, unlockedClasses: string[]): string[] {
  const validUnlocked = new Set(unlockedClasses.map((c) => (c === 'engenheiro' ? 'druida' : c)));
  const result: string[] = [];
  if (Array.isArray(party)) {
    for (const rawC of party) {
      const c = rawC === 'engenheiro' ? 'druida' : rawC;
      if (typeof c === 'string' && validUnlocked.has(c) && !result.includes(c)) {
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
  globalBonus?: { hp?: number; atk?: number; mag?: number; def?: number; res?: number; mov?: number; range?: number }
): Unit {
  const targetClassKey = className === 'engenheiro' ? 'druida' : className;
  const def = CLASS_DEFINITIONS[targetClassKey] || CLASS_DEFINITIONS[className] || CLASS_DEFINITIONS['guerreiro'];
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
  const gAtk = globalBonus?.atk || 0;
  const gMag = globalBonus?.mag || 0;
  const gDef = globalBonus?.def || 0;
  const gRes = globalBonus?.res || 0;
  const gMov = globalBonus?.mov || 0;
  const gRange = globalBonus?.range || 0;

  const hpBonus = levelOffsets * growth.hp + bonusHp + itemHp + (cBonus.hp || 0) + gHp;
  const maxHp = def.maxHp + hpBonus;
  const atk = def.atk + levelOffsets * growth.atk + bonusAtk + itemAtk + (cBonus.atk || 0) + gAtk;
  const mag = def.mag + levelOffsets * growth.mag + bonusMag + itemMag + (cBonus.mag || 0) + gMag;
  const unitDef = def.def + levelOffsets * growth.def + bonusDef + itemDef + (cBonus.def || 0) + gDef;
  const res = def.res + levelOffsets * growth.res + bonusRes + itemRes + (cBonus.res || 0) + gRes;
  const mov = def.mov + itemMov + gMov;
  const range = def.range + itemRange + gRange;

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
        evolved.cooldownMax = Math.max(2, evolved.cooldownMax);
      }
      if (
        evolved.statusEffect?.type === 'stun' ||
        evolved.secondaryStatusEffect?.type === 'stun'
      ) {
        evolved.cooldownMax = Math.max(3, evolved.cooldownMax);
      }
      if (
        evolved.statusEffect?.type === 'slow' ||
        evolved.secondaryStatusEffect?.type === 'slow' ||
        evolved.statusEffect?.type === 'buff_atk' ||
        evolved.secondaryStatusEffect?.type === 'buff_atk' ||
        evolved.statusEffect?.type === 'debuff_def' ||
        evolved.secondaryStatusEffect?.type === 'debuff_def' ||
        evolved.statusEffect?.type === 'burn' ||
        evolved.secondaryStatusEffect?.type === 'burn' ||
        evolved.statusEffect?.type === 'poison' ||
        evolved.secondaryStatusEffect?.type === 'poison'
      ) {
        evolved.cooldownMax = Math.max(4, evolved.cooldownMax);
      }
      if (evolved.statusEffect?.type === 'burn' || evolved.statusEffect?.type === 'poison') {
        evolved.statusEffect = { ...evolved.statusEffect, duration: Math.min(2, evolved.statusEffect.duration), value: 2 };
      }
      if (evolved.secondaryStatusEffect?.type === 'burn' || evolved.secondaryStatusEffect?.type === 'poison') {
        evolved.secondaryStatusEffect = { ...evolved.secondaryStatusEffect, duration: Math.min(2, evolved.secondaryStatusEffect.duration), value: 2 };
      }
      if (evolved.statusEffect?.type === 'slow') {
        evolved.statusEffect = { ...evolved.statusEffect, duration: Math.min(2, evolved.statusEffect.duration), value: 1 };
      }
      if (evolved.secondaryStatusEffect?.type === 'slow') {
        evolved.secondaryStatusEffect = { ...evolved.secondaryStatusEffect, duration: Math.min(2, evolved.secondaryStatusEffect.duration), value: 1 };
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
