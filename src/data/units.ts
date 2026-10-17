import type { Unit } from '../types/game';
import { SKILLS } from './skills';

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
  },
  mago: {
    className: 'mago',
    name: 'Mago',
    role: 'Dano Mágico em Área',
    maxHp: 65,
    atk: 10,
    mag: 30,
    def: 4,
    res: 12,
    mov: 2,
    range: 3,
    color: '#B58AFF',
    avatarKey: 'mage',
    baseSkillId: 'explosao_arcana',
    description: 'Especialista em feitiços devastadores em área e manipulação elemental.',
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
    range: 1,
    color: '#56E59A',
    avatarKey: 'cleric',
    baseSkillId: 'cura',
    description: 'Especialista em suporte divino, curando aliados e purificando maldições.',
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

export function sanitizeUnlockedClasses(
  rawUnlocked: string[] | undefined,
  maxLevelCompleted: number,
  completedLevels: number[] = []
): string[] {
  const allowed = new Set<string>(INITIAL_CLASSES);
  if (Array.isArray(rawUnlocked)) {
    Object.entries(CLASS_UNLOCK_CONDITIONS).forEach(([cName, cond]) => {
      if (maxLevelCompleted >= cond.requiredLevel || completedLevels.includes(cond.requiredLevel)) {
        if (rawUnlocked.includes(cName)) {
          allowed.add(cName);
        }
      }
    });
  }
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
  learnedSkillIds: string[] = []
): Unit {
  const def = CLASS_DEFINITIONS[className];
  const hpBonus = (level - 1) * 12 + bonusHp;
  const maxHp = def.maxHp + hpBonus;
  const atk = def.atk + (level - 1) * 3 + bonusAtk;
  const mag = def.mag + (level - 1) * 3 + bonusMag;
  const unitDef = def.def + (level - 1) * 2 + bonusDef;
  const res = def.res + (level - 1) * 1 + bonusRes;

  // Build active skill list from baseSkill + learnedSkillIds
  const skillListIds = Array.from(new Set([def.baseSkillId, ...learnedSkillIds]));
  const skills = skillListIds
    .map((skId) => SKILLS[skId])
    .filter(Boolean)
    .map((sk) => {
      const clone = JSON.parse(JSON.stringify(sk));
      if (clone.damageType === 'healing' || clone.statusEffect?.type === 'shield') {
        clone.cooldownMax = Math.max(3, clone.cooldownMax);
      }
      return clone;
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
    mov: def.mov,
    range: def.range,
    x,
    y,
    hasMoved: false,
    hasAttacked: false,
    isDead: false,
    color: def.color,
    avatarKey: def.avatarKey,
    skills,
    learnedSkillIds,
    statusEffects: [],
    damageDealt: 0,
    kills: 0,
  };
}
