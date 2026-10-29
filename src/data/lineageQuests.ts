import type { PlayerProgress } from '../types/game';

export type LineageQuestType =
  | 'monster_kills'
  | 'total_damage'
  | 'total_kills'
  | 'healing_done'
  | 'skill_uses'
  | 'flawless_wins'
  | 'stages_completed'
  | 'gold_accumulated'
  | 'bosses_defeated'
  | 'battles_won';

export interface LineageUnlockQuest {
  id: string;
  lineageId: string;
  questType: LineageQuestType;
  title: string;
  description: string;
  unitLabel: string;
  monsterTypeId?: string;
  monsterName?: string;
  targetCount: number;
  hintLevel: string;
  iconName: string;
}

export const INITIAL_UNLOCKED_LINEAGES: string[] = ['humano', 'elfo', 'anao'];

export const LINEAGE_UNLOCK_QUESTS: LineageUnlockQuest[] = [
  {
    id: 'quest_lineage_dragonoide',
    lineageId: 'dragonoide',
    questType: 'monster_kills',
    title: 'O Despertar do Sangue Dracônico',
    description: 'Elimine 100 Dracos Vulcânicos para absorver o fogo primordial e liberar a Linhagem Dragonoide.',
    unitLabel: 'Dracos Vulcânicos Abatidos',
    monsterTypeId: 'draco_volcanico',
    monsterName: 'Draco Vulcânico',
    targetCount: 100,
    hintLevel: 'Fases 8, 9, 10, 18, 19 e Fase Diária',
    iconName: 'Flame',
  },
  {
    id: 'quest_lineage_orc',
    lineageId: 'orc',
    questType: 'total_damage',
    title: 'Força Bruta Implacável',
    description: 'Cause um total acumulado de 30.000 de Dano com seus heróis em batalhas para liberar a Linhagem Orc.',
    unitLabel: 'Dano Total Causado',
    targetCount: 30000,
    hintLevel: 'Qualquer Batalha da Campanha ou Fase Diária',
    iconName: 'Swords',
  },
  {
    id: 'quest_lineage_vampiro',
    lineageId: 'vampiro',
    questType: 'total_kills',
    title: 'Banquete da Meia-Noite',
    description: 'Elimine um total de 150 Inimigos de qualquer espécie ao longo de suas expedições para liberar a Linhagem Vampiro.',
    unitLabel: 'Inimigos Abatidos no Total',
    targetCount: 150,
    hintLevel: 'Qualquer Fase da Campanha ou Fase Diária',
    iconName: 'Skull',
  },
  {
    id: 'quest_lineage_celestial',
    lineageId: 'celestial',
    questType: 'healing_done',
    title: 'Milagre da Luz Sagrada',
    description: 'Restaure um total acumulado de 5.000 de Vida em seus aliados usando habilidades de cura para liberar a Linhagem Celestial.',
    unitLabel: 'Vida Restaurada com Curas',
    targetCount: 5000,
    hintLevel: 'Usando habilidades de cura (Curandeiro, Druída, Paladino, etc.)',
    iconName: 'Sun',
  },
  {
    id: 'quest_lineage_feerico',
    lineageId: 'feerico',
    questType: 'skill_uses',
    title: 'Dança dos Encantamentos',
    description: 'Conjure 100 Habilidades ativas em combate com sua equipe para desvendar o véu místico e liberar a Linhagem Feérica.',
    unitLabel: 'Habilidades Conjuradas',
    targetCount: 100,
    hintLevel: 'Usando habilidades de qualquer herói durante batalhas',
    iconName: 'Sparkles',
  },
  {
    id: 'quest_lineage_minotauro',
    lineageId: 'minotauro',
    questType: 'flawless_wins',
    title: 'Inabalável no Labirinto',
    description: 'Vença 10 Batalhas mantendo todos os 4 heróis da equipe vivos até o final (Vitória Impecável) para liberar a Linhagem Minotauro.',
    unitLabel: 'Vitórias Sem Perder Heróis',
    targetCount: 10,
    hintLevel: 'Concluir fases com os 4 heróis sobreviventes',
    iconName: 'Shield',
  },
  {
    id: 'quest_lineage_anjo',
    lineageId: 'anjo',
    questType: 'stages_completed',
    title: 'Cruzada dos Planos Superiores',
    description: 'Conclua 15 Fases diferentes da Campanha Principal para receber a graça celeste e liberar a Linhagem Anjo.',
    unitLabel: 'Fases da Campanha Concluídas',
    targetCount: 15,
    hintLevel: 'Avançando pelas fases da Campanha Principal',
    iconName: 'Sun',
  },
  {
    id: 'quest_lineage_demonio',
    lineageId: 'demonio',
    questType: 'gold_accumulated',
    title: 'Tributo da Ganância Abissal',
    description: 'Acumule 50.000 de Ouro nos cofres da sua expedição para selar o pacto e liberar a Linhagem Demônio.',
    unitLabel: 'Ouro Acumulado',
    targetCount: 50000,
    hintLevel: 'Recompensas de Fases e Fase Diária (20.000 Ouro)',
    iconName: 'Skull',
  },
  {
    id: 'quest_lineage_nefalim',
    lineageId: 'nefalim',
    questType: 'bosses_defeated',
    title: 'Julgamento de Luz e Trevas',
    description: 'Derrote 8 Chefes ou Mini-Chefes ao longo de suas jornadas para dominar a dualidade cósmica e liberar a Linhagem Nefalim.',
    unitLabel: 'Chefes & Mini-Chefes Derrotados',
    targetCount: 8,
    hintLevel: 'Fases 5, 10, 15, 20, 25, 30, 35, 40, 45 e 50',
    iconName: 'Sparkles',
  },
  {
    id: 'quest_lineage_fenix',
    lineageId: 'fenix',
    questType: 'battles_won',
    title: 'Cinzas do Renascimento Solar',
    description: 'Vença um total de 25 Batalhas (na Campanha ou Fase Diária) para despertar a chama imortal e liberar a Linhagem Fênix.',
    unitLabel: 'Batalhas Vencidas',
    targetCount: 25,
    hintLevel: 'Qualquer fase da Campanha ou Fase Diária',
    iconName: 'Flame',
  },
];

export const LINEAGE_UNLOCK_QUESTS_BY_ID: Record<string, LineageUnlockQuest> = Object.fromEntries(
  LINEAGE_UNLOCK_QUESTS.map((q) => [q.lineageId, q])
);

export function getLineageUnlockQuest(lineageId: string): LineageUnlockQuest | undefined {
  return LINEAGE_UNLOCK_QUESTS_BY_ID[lineageId];
}

export function isLineageUnlocked(progress: PlayerProgress, lineageId: string): boolean {
  if (INITIAL_UNLOCKED_LINEAGES.includes(lineageId)) return true;
  const list = progress.unlockedLineages || INITIAL_UNLOCKED_LINEAGES;
  return list.includes(lineageId);
}

/**
 * Calcula o valor atual do progresso de uma missão de linhagem a partir do PlayerProgress.
 */
export function getLineageQuestCurrentValue(progress: PlayerProgress, quest: LineageUnlockQuest): number {
  const classMissions = progress.classMissionsProgress || {};
  const lStats = progress.lineageQuestStats || {};

  switch (quest.questType) {
    case 'monster_kills': {
      if (!quest.monsterTypeId) return 0;
      return (progress.monsterKills && progress.monsterKills[quest.monsterTypeId]) || 0;
    }
    case 'total_damage': {
      let sumDmg = 0;
      for (const cData of Object.values(classMissions)) {
        sumDmg += cData.stats?.damage_dealt || 0;
      }
      return Math.max(sumDmg, lStats.totalDamage || 0);
    }
    case 'total_kills': {
      let sumKills = 0;
      for (const cData of Object.values(classMissions)) {
        sumKills += cData.stats?.kills || 0;
      }
      let sumMonsterKills = 0;
      if (progress.monsterKills) {
        for (const k of Object.values(progress.monsterKills)) {
          sumMonsterKills += k || 0;
        }
      }
      return Math.max(sumKills, sumMonsterKills);
    }
    case 'healing_done': {
      return lStats.healingDone || 0;
    }
    case 'skill_uses': {
      let sumSkills = 0;
      for (const cData of Object.values(classMissions)) {
        sumSkills += cData.stats?.skill_uses || 0;
      }
      return sumSkills;
    }
    case 'flawless_wins': {
      return lStats.flawlessWins || 0;
    }
    case 'stages_completed': {
      return Array.isArray(progress.completedLevels) ? progress.completedLevels.length : 0;
    }
    case 'gold_accumulated': {
      return Math.max(progress.gold || 0, lStats.peakGold || 0);
    }
    case 'bosses_defeated': {
      // incrementPartyStats adds +1 to each of the 4 party classes on boss victory
      let sumBossesAcrossParty = 0;
      for (const cData of Object.values(classMissions)) {
        sumBossesAcrossParty += cData.stats?.bosses_defeated || 0;
      }
      const estimatedBossVictories = Math.floor(sumBossesAcrossParty / 4);
      return Math.max(lStats.bossesDefeated || 0, estimatedBossVictories);
    }
    case 'battles_won': {
      let sumBattlesAcrossParty = 0;
      for (const cData of Object.values(classMissions)) {
        sumBattlesAcrossParty += cData.stats?.battles_won || 0;
      }
      const estimatedBattlesWon = Math.floor(sumBattlesAcrossParty / 4);
      const dailyWins = progress.dailyDungeon?.totalWins || 0;
      return Math.max((lStats.battlesWon || 0) + dailyWins, estimatedBattlesWon + dailyWins);
    }
    default:
      return 0;
  }
}

export function getLineageQuestProgress(
  progress: PlayerProgress,
  quest: LineageUnlockQuest
): { current: number; target: number; percent: number; isCompleted: boolean } {
  const isAlreadyUnlocked = isLineageUnlocked(progress, quest.lineageId);
  const rawCurrent = getLineageQuestCurrentValue(progress, quest);
  const current = isAlreadyUnlocked ? Math.max(rawCurrent, quest.targetCount) : rawCurrent;
  const target = quest.targetCount;
  const percent = Math.min(100, Math.round((Math.min(current, target) / target) * 100));
  const isCompleted = isAlreadyUnlocked || current >= target;
  return { current, target, percent, isCompleted };
}

/**
 * Checa quais linhagens atingiram a meta de suas missões e ainda não foram adicionadas a `unlockedLineages`.
 */
export function checkLineageUnlockQuests(progress: PlayerProgress): string[] {
  const currentUnlocked = progress.unlockedLineages || INITIAL_UNLOCKED_LINEAGES;
  const readyToUnlock: string[] = [];

  for (const quest of LINEAGE_UNLOCK_QUESTS) {
    if (currentUnlocked.includes(quest.lineageId)) continue;
    const val = getLineageQuestCurrentValue(progress, quest);
    if (val >= quest.targetCount) {
      readyToUnlock.push(quest.lineageId);
    }
  }

  return readyToUnlock;
}
