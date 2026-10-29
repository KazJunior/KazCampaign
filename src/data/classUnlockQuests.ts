import type { ClassUnlockQuest, PlayerProgress } from '../types/game';

// Apenas Linhagens Ancestrais possuem missões de desbloqueio (ver src/data/lineageQuests.ts).
export const CLASS_UNLOCK_QUESTS: ClassUnlockQuest[] = [];

export const CLASS_UNLOCK_QUESTS_BY_CLASS: Record<string, ClassUnlockQuest> = {};

export function getClassUnlockQuest(_className: string): ClassUnlockQuest | undefined {
  return undefined;
}

export function getMonsterKillCount(progress: PlayerProgress, monsterTypeId: string): number {
  if (!progress.monsterKills) return 0;
  return progress.monsterKills[monsterTypeId] || 0;
}

export function checkClassUnlockQuests(_progress: PlayerProgress): string[] {
  return [];
}
