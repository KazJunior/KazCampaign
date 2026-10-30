import type { PlayerProgress } from '../types/game';

export type LineageQuestType =
  | 'monster_kills'
  | 'fast_blitz_wins'
  | 'no_healer_wins'
  | 'healing_done'
  | 'status_inflicted'
  | 'low_hp_kills'
  | 'flawless_boss_wins'
  | 'massive_hits'
  | 'light_dark_wins'
  | 'comeback_wins'
  | 'basic_attack_kills'
  | 'tiles_moved'
  | 'bleed_inflicted'
  | 'enemies_pushed'
  | 'eggs_hatched'
  | 'skills_cast'
  | 'heroes_fallen'
  | 'poison_inflicted';

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
    title: 'Extinção da Ninhada Vulcânica',
    description: 'Elimine 200 Dracos Vulcânicos nas profundezas incandescentes para absorver o coração de magma e despertar a Linhagem Dragonoide.',
    unitLabel: 'Dracos Vulcânicos Abatidos',
    monsterTypeId: 'draco_volcanico',
    monsterName: 'Draco Vulcânico',
    targetCount: 200,
    hintLevel: 'Fases 6, 8, 9, 10, Ato II e Fase Diária',
    iconName: 'Flame',
  },
  {
    id: 'quest_lineage_orc',
    lineageId: 'orc',
    questType: 'fast_blitz_wins',
    title: 'Massacre Relâmpago da Horda',
    description: 'Vença 15 Batalhas acima da Fase 10 (Fase 11 em diante) em no máximo 5 Turnos para liberar a Linhagem Orc.',
    unitLabel: 'Vitórias acima da Fase 10 em até 5 Turnos',
    targetCount: 15,
    hintLevel: 'Concluir fases do Ato II ao V (Fase 11+) em até 5 turnos',
    iconName: 'Swords',
  },
  {
    id: 'quest_lineage_vampiro',
    lineageId: 'vampiro',
    questType: 'no_healer_wins',
    title: 'Pacto de Sangue Sem Suporte',
    description: 'Vença 15 Batalhas Consecutivas sem incluir nenhum Curandeiro, Paladino, Druída ou Bardo na sua equipe (derrotas ou uso de suporte reiniciam a sequência) para liberar a Linhagem Vampiro.',
    unitLabel: 'Vitórias Consecutivas Sem Suporte',
    targetCount: 15,
    hintLevel: '15 vitórias seguidas sem Curandeiro, Paladino, Druída ou Bardo',
    iconName: 'Skull',
  },
  {
    id: 'quest_lineage_celestial',
    lineageId: 'celestial',
    questType: 'healing_done',
    title: 'Milagre da Preservação Divina',
    description: 'Restaure um total acumulado de 30.000 de Vida nos seus aliados usando magias de cura em combate para liberar a Linhagem Celestial.',
    unitLabel: 'Vida Restaurada com Curas',
    targetCount: 30000,
    hintLevel: 'Usando habilidades de cura em batalhas intensas',
    iconName: 'Sun',
  },
  {
    id: 'quest_lineage_feerico',
    lineageId: 'feerico',
    questType: 'status_inflicted',
    title: 'Maldição do Véu Encantado',
    description: 'Aplique 120 Efeitos Negativos (Veneno, Queimadura, Atordoamento, Lentidão ou Quebra de DEF/ATK) em inimigos para liberar a Linhagem Feérica.',
    unitLabel: 'Efeitos de Status Aplicados em Inimigos',
    targetCount: 120,
    hintLevel: 'Usando habilidades que causam queimadura, veneno, stun ou lentidão',
    iconName: 'Sparkles',
  },
  {
    id: 'quest_lineage_minotauro',
    lineageId: 'minotauro',
    questType: 'low_hp_kills',
    title: 'Fúria Sanguinária à Beira da Morte',
    description: 'Elimine 50 Inimigos utilizando um herói que esteja com menos de 20% da Vida Máxima no momento do abate para liberar a Linhagem Minotauro.',
    unitLabel: 'Abates com Herói abaixo de 20% HP',
    targetCount: 50,
    hintLevel: 'Finalizar inimigos usando um herói gravemente ferido (< 20% HP)',
    iconName: 'Shield',
  },
  {
    id: 'quest_lineage_anjo',
    lineageId: 'anjo',
    questType: 'flawless_boss_wins',
    title: 'Cruzada Imaculada Contra Chefes',
    description: 'Derrote 15 Chefes ou Mini-Chefes mantendo todos os 4 heróis da equipe vivos até o final da batalha para liberar a Linhagem Anjo.',
    unitLabel: 'Chefes Vencidos Sem Perder Heróis',
    targetCount: 15,
    hintLevel: 'Fases de Boss/Mini-Boss (5, 10, 15, 20, 25, 30, 35, 40, 45, 50) sem baixas',
    iconName: 'Sun',
  },
  {
    id: 'quest_lineage_demonio',
    lineageId: 'demonio',
    questType: 'massive_hits',
    title: 'Devastação Abissal Absoluta',
    description: 'Desfira 100 Golpes Devastadores que causem 400 ou mais de dano em um único inimigo para liberar a Linhagem Demônio.',
    unitLabel: 'Golpes Únicos de 400+ de Dano',
    targetCount: 100,
    hintLevel: 'Atingir 400+ de dano em um único inimigo com ataques ou habilidades',
    iconName: 'Skull',
  },
  {
    id: 'quest_lineage_nefalim',
    lineageId: 'nefalim',
    questType: 'basic_attack_kills',
    title: 'Purificação pelo Golpe Puro',
    description: 'Derrote 200 inimigos usando o ataque normal (sem habilidades) para liberar a Linhagem Nefalim.',
    unitLabel: 'Inimigos Derrotados com Ataque Normal',
    targetCount: 200,
    hintLevel: 'Eliminar inimigos usando apenas o ataque básico (sem habilidades)',
    iconName: 'Swords',
  },
  {
    id: 'quest_lineage_fenix',
    lineageId: 'fenix',
    questType: 'comeback_wins',
    title: 'Última Chama Contra o Abismo',
    description: 'Vença 15 Batalhas contra Chefes (Bosses ou Mini-Bosses) restando apenas 1 personagem vivo no final do combate para liberar a Linhagem Fênix.',
    unitLabel: 'Chefes Vencidos com Apenas 1 Herói Vivo',
    targetCount: 15,
    hintLevel: 'Derrotar Boss/Mini-Boss terminando com exatamente 1 herói vivo',
    iconName: 'Flame',
  },
  {
    id: 'quest_lineage_centauro',
    lineageId: 'centauro',
    questType: 'tiles_moved',
    title: 'Caminhada das Estepes Infinitas',
    description: 'Percorra um total acumulado de 2.000 casas em combate com seus heróis para liberar a Linhagem Centauro.',
    unitLabel: 'Casas Percorridas em Combate',
    targetCount: 2000,
    hintLevel: 'Mover-se pelas casas do campo de batalha',
    iconName: 'Footprints',
  },
  {
    id: 'quest_lineage_lobisomem',
    lineageId: 'lobisomem',
    questType: 'bleed_inflicted',
    title: 'Rastro de Sangue Lunar',
    description: 'Aplique o efeito de Sangramento em inimigos 200 vezes para despertar a Linhagem Lobisomem.',
    unitLabel: 'Sangramentos Infligidos',
    targetCount: 200,
    hintLevel: 'Usar habilidades ou armas que causem sangramento',
    iconName: 'Skull',
  },
  {
    id: 'quest_lineage_zephyros',
    lineageId: 'zephyros',
    questType: 'enemies_pushed',
    title: 'Vendaval Arrebatador',
    description: 'Empurre inimigos 200 vezes através de habilidades de impacto ou vento para liberar a Linhagem Zephyros.',
    unitLabel: 'Inimigos Empurrados',
    targetCount: 200,
    hintLevel: 'Usar habilidades com efeito de empurrão (Disparo de Impacto, Vento, etc.)',
    iconName: 'Sparkles',
  },
  {
    id: 'quest_lineage_lagomorfo',
    lineageId: 'lagomorfo',
    questType: 'eggs_hatched',
    title: 'Ninho da Fertilidade Sagrada',
    description: 'Choque 20 ovos de companheiro no ninho de pets para liberar a Linhagem Lagomorfo.',
    unitLabel: 'Ovos Chocados no Ninho',
    targetCount: 20,
    hintLevel: 'Chocar ovos no menu de Companheiros (Pets)',
    iconName: 'Sparkles',
  },
  {
    id: 'quest_lineage_kitsune',
    lineageId: 'kitsune',
    questType: 'skills_cast',
    title: 'Encantamento das Nove Chamas',
    description: 'Conjure 500 habilidades em combate para liberar a Linhagem Kitsune.',
    unitLabel: 'Habilidades Conjuradas',
    targetCount: 500,
    hintLevel: 'Usar habilidades em combate com seus heróis',
    iconName: 'Sparkles',
  },
  {
    id: 'quest_lineage_espectro',
    lineageId: 'espectro',
    questType: 'heroes_fallen',
    title: 'Passagem pelo Véu do Além',
    description: 'Acumule 100 heróis caídos em combate para que suas almas façam a travessia e liberem a Linhagem Espectro.',
    unitLabel: 'Heróis Caídos em Batalha',
    targetCount: 100,
    hintLevel: 'Heróis derrotados durante combates difíceis',
    iconName: 'Skull',
  },
  {
    id: 'quest_lineage_murideo',
    lineageId: 'murideo',
    questType: 'poison_inflicted',
    title: 'Praga dos Esgotos Profundos',
    description: 'Envenene inimigos 200 vezes para liberar a Linhagem Murídeo.',
    unitLabel: 'Inimigos Envenenados',
    targetCount: 200,
    hintLevel: 'Usar habilidades que apliquem veneno (Veneno Mortal, Chuva Tóxica, etc.)',
    iconName: 'Skull',
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
  const lStats = progress.lineageQuestStats || {};

  switch (quest.questType) {
    case 'monster_kills': {
      if (!quest.monsterTypeId) return 0;
      return (progress.monsterKills && progress.monsterKills[quest.monsterTypeId]) || 0;
    }
    case 'fast_blitz_wins': {
      return lStats.fastBlitzWins || 0;
    }
    case 'no_healer_wins': {
      return lStats.noHealerWins || 0;
    }
    case 'healing_done': {
      return lStats.healingDone || 0;
    }
    case 'status_inflicted': {
      return lStats.statusInflicted || 0;
    }
    case 'low_hp_kills': {
      return lStats.lowHpKills || 0;
    }
    case 'flawless_boss_wins': {
      return lStats.flawlessBossWins || 0;
    }
    case 'massive_hits': {
      return lStats.massiveHits || 0;
    }
    case 'light_dark_wins': {
      return lStats.lightDarkWins || 0;
    }
    case 'comeback_wins': {
      return lStats.comebackWins || 0;
    }
    case 'basic_attack_kills': {
      return lStats.basicAttackKills || 0;
    }
    case 'tiles_moved': {
      return lStats.tilesMoved || 0;
    }
    case 'bleed_inflicted': {
      return lStats.bleedInflicted || 0;
    }
    case 'enemies_pushed': {
      return lStats.enemiesPushed || 0;
    }
    case 'eggs_hatched': {
      return lStats.eggsHatched || 0;
    }
    case 'skills_cast': {
      return lStats.skillsCast || 0;
    }
    case 'heroes_fallen': {
      return lStats.heroesFallen || 0;
    }
    case 'poison_inflicted': {
      return lStats.poisonInflicted || 0;
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
  const newlyReady: string[] = [];

  for (const quest of LINEAGE_UNLOCK_QUESTS) {
    if (currentUnlocked.includes(quest.lineageId)) continue;
    const val = getLineageQuestCurrentValue(progress, quest);
    if (val >= quest.targetCount) {
      newlyReady.push(quest.lineageId);
    }
  }

  return newlyReady;
}
