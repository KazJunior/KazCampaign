import type { ClassUnlockQuest, PlayerProgress } from '../types/game';

export const CLASS_UNLOCK_QUESTS: ClassUnlockQuest[] = [
    {
    id: 'quest_unlock_sniper',
    targetClass: 'sniper',
    title: 'Mestria em Balística',
    description: 'Elimine 50 Kobolds Artilheiros para aprender os segredos dos disparos a distâncias colossais e liberar o Sniper.',
    monsterTypeId: 'kobold_artilheiro',
    monsterName: 'Kobold Artilheiro',
    targetCount: 50,
    hintLevel: 'Ato II (Fases 11 a 20) e Fase Diária',
    iconName: 'Crosshair',
  },
  {
    id: 'quest_unlock_paladino',
    targetClass: 'paladino',
    title: 'Purificação dos Bravos',
    description: 'Derrote 40 Cavaleiros Caídos para resgatar sua honra corrompida e recrutar o Paladino Sagrado.',
    monsterTypeId: 'cavaleiro_caido',
    monsterName: 'Cavaleiro Caído',
    targetCount: 40,
    hintLevel: 'Ato I (Fases 6 a 10) e Fase Diária',
    iconName: 'Shield',
  },
  {
    id: 'quest_unlock_lanceiro',
    targetClass: 'lanceiro',
    title: 'Ruptura da Horda',
    description: 'Derrube 50 Orcs Guerreiros para dominar o alcance tático das armas de haste e recrutar o Lanceiro.',
    monsterTypeId: 'orc',
    monsterName: 'Orc Guerreiro',
    targetCount: 50,
    hintLevel: 'Ato I (Fases 2 a 10) e Fase Diária',
    iconName: 'Swords',
  },
  {
    id: 'quest_unlock_bardo',
    targetClass: 'bardo',
    title: 'A Balada da Clareira',
    description: 'Elimine 60 Goblins para limpar os arredores e inspirar a melodia épica que recruta o Bardo.',
    monsterTypeId: 'goblin',
    monsterName: 'Goblin Solteiro',
    targetCount: 60,
    hintLevel: 'Ato I (Fases 1 a 5) e Fase Diária',
    iconName: 'Music',
  },
  {
    id: 'quest_unlock_mago_gelo',
    targetClass: 'mago_gelo',
    title: 'Preservação Criomântica',
    description: 'Elimine 45 Aranhas Sombrias para sintetizar a teia congelante primordial e recrutar o Mago de Gelo.',
    monsterTypeId: 'aranha',
    monsterName: 'Aranha Sombria',
    targetCount: 45,
    hintLevel: 'Ato I (Fases 3 a 10) e Fase Diária',
    iconName: 'Snowflake',
  },
  {
    id: 'quest_unlock_mago_eletrico',
    targetClass: 'mago_eletrico',
    title: 'Condutor da Tempestade',
    description: 'Derrote 40 Lobos Espectrais velozes para concentrar a energia dos relâmpagos e recrutar o Mago Elétrico.',
    monsterTypeId: 'lobo_espectral',
    monsterName: 'Lobo Espectral',
    targetCount: 40,
    hintLevel: 'Ato I (Fases 5 a 10) e Fase Diária',
    iconName: 'Zap',
  },
];

export const CLASS_UNLOCK_QUESTS_BY_CLASS: Record<string, ClassUnlockQuest> = Object.fromEntries(
  CLASS_UNLOCK_QUESTS.map((q) => [q.targetClass, q])
);

export function getClassUnlockQuest(className: string): ClassUnlockQuest | undefined {
  return CLASS_UNLOCK_QUESTS_BY_CLASS[className];
}

export function getMonsterKillCount(progress: PlayerProgress, monsterTypeId: string): number {
  if (!progress.monsterKills) return 0;
  return progress.monsterKills[monsterTypeId] || 0;
}

/**
 * Verifica todas as missões de desbloqueio de classes que já atingiram a meta
 * e cujas classes ainda não constam em `unlockedClasses`.
 * Retorna as chaves das novas classes prontas para desbloqueio.
 */
export function checkClassUnlockQuests(progress: PlayerProgress): string[] {
  const currentUnlocked = progress.unlockedClasses || [];
  const readyToUnlock: string[] = [];

  for (const quest of CLASS_UNLOCK_QUESTS) {
    if (currentUnlocked.includes(quest.targetClass)) continue;
    const kills = getMonsterKillCount(progress, quest.monsterTypeId);
    if (kills >= quest.targetCount) {
      readyToUnlock.push(quest.targetClass);
    }
  }

  return readyToUnlock;
}

