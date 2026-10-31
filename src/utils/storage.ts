import type { AudioSettings, PlayerProgress, ActiveBattleState } from '../types/game';
import { INITIAL_CLASSES, CLASS_UNLOCK_CONDITIONS, getMaxCompletedLevel, sanitizeUnlockedClasses, sanitizePartyClasses } from '../data/units';
import { getHatchDuration } from '../data/pets';
import { ALL_CLASS_MISSIONS } from '../data/classQuests';
import { checkLineageUnlockQuests, INITIAL_UNLOCKED_LINEAGES } from '../data/lineageQuests';
import { saveCloudProgress } from './api';

const PROGRESS_KEY = 'rpg_tactics_progress_v4';
const AUDIO_KEY = 'rpg_tactics_audio_v1';
export const BATTLE_STATE_KEY = 'rpg_tactics_battle_state_v1';

export function createInitialUnitsState(): PlayerProgress['unitsState'] {
  return {
    guerreiro: { className: 'guerreiro', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    arqueiro: { className: 'arqueiro', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    mago: { className: 'mago', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    curandeiro: { className: 'curandeiro', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    assassino: { className: 'assassino', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    cavaleiro_arcano: { className: 'cavaleiro_arcano', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    necromante: { className: 'necromante', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    druida: { className: 'druida', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    mago_runico: { className: 'mago_runico', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    berserker: { className: 'berserker', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    carrasco_vazio: { className: 'carrasco_vazio', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    paladino: { className: 'paladino', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    lanceiro: { className: 'lanceiro', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    bardo: { className: 'bardo', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    mago_gelo: { className: 'mago_gelo', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    sniper: { className: 'sniper', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    mago_eletrico: { className: 'mago_eletrico', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    mago_vento: { className: 'mago_vento', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    omnimago: { className: 'omnimago', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
  };
}

export const DEFAULT_PROGRESS: PlayerProgress = {
  version: 4,
  unlockedLevel: 1,
  completedLevels: [],
  gold: 0,
  unlockedClasses: [...INITIAL_CLASSES],
  selectedPartyClasses: ['guerreiro', 'arqueiro', 'mago', 'curandeiro'],
  selectedPartyLineages: {},
  unitsState: createInitialUnitsState(),
  combatSpeed: 'normal',
  highScore: 0,
  activeAdventure: null,
  discoveredMonsterIds: ['goblin'],
  discoveredItemIds: [],
  adventureHistory: [],
  classUpgrades: {},
  generalUpgrades: {},
  itemUpgrades: {},
  unlockedPetIds: [],
  equippedPetId: null,
  eggs: [],
  classMissionsProgress: {},
  unlockedClassSkins: [],
  equippedClassSkins: {},
  unlockedClassSkillIds: [],
  dailyDungeon: {
    lastCompletedDate: undefined,
    totalWins: 0,
  },
  monsterKills: {},
  unlockedLineages: ['humano', 'elfo', 'anao'],
  lineageQuestStats: {},
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  muted: false,
  masterVolume: 0.8,
  sfxVolume: 0.8,
  bgmVolume: 0.5,
};

export function mergeNumericRecord(
  base?: Record<string, number> | null,
  incoming?: Record<string, number> | null
): Record<string, number> {
  const result: Record<string, number> = {};
  if (base && typeof base === 'object') {
    for (const [k, v] of Object.entries(base)) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) result[k] = n;
    }
  }
  if (incoming && typeof incoming === 'object') {
    for (const [k, v] of Object.entries(incoming)) {
      const n = Number(v);
      if (Number.isFinite(n) && n >= 0) {
        result[k] = Math.max(result[k] || 0, n);
      }
    }
  }
  return result;
}

export function mergeClassMissionsProgress(
  base?: PlayerProgress['classMissionsProgress'] | null,
  incoming?: PlayerProgress['classMissionsProgress'] | null
): NonNullable<PlayerProgress['classMissionsProgress']> {
  const result: NonNullable<PlayerProgress['classMissionsProgress']> = {};

  const apply = (src?: PlayerProgress['classMissionsProgress'] | null) => {
    if (!src || typeof src !== 'object') return;
    for (const [rawClass, entry] of Object.entries(src)) {
      if (!entry || typeof entry !== 'object') continue;
      const cKey = rawClass === 'engenheiro' ? 'druida' : rawClass;
      const prev = result[cKey] || { completedMissions: [], stats: {} };
      const completedSet = new Set<string>([
        ...(Array.isArray(prev.completedMissions) ? prev.completedMissions : []),
        ...(Array.isArray(entry.completedMissions) ? entry.completedMissions : []),
      ]);
      result[cKey] = {
        completedMissions: Array.from(completedSet),
        stats: mergeNumericRecord(prev.stats, entry.stats),
      };
    }
  };

  apply(base);
  apply(incoming);
  return result;
}

export function mergeLineageQuestStats(
  base?: PlayerProgress['lineageQuestStats'] | null,
  incoming?: PlayerProgress['lineageQuestStats'] | null,
  preferMaxStreak = false
): NonNullable<PlayerProgress['lineageQuestStats']> {
  const merged = mergeNumericRecord(
    base as Record<string, number> | undefined,
    incoming as Record<string, number> | undefined
  ) as NonNullable<PlayerProgress['lineageQuestStats']>;

  const baseStreak = Number(base?.noHealerWins) || 0;
  const incomingHasStats = Boolean(incoming && typeof incoming === 'object' && Object.keys(incoming).length > 0);
  if (preferMaxStreak || baseStreak >= 15) {
    merged.noHealerWins = Math.max(baseStreak, Number(incoming?.noHealerWins) || 0);
  } else if (incomingHasStats && typeof incoming?.noHealerWins === 'number') {
    merged.noHealerWins = Math.max(0, incoming.noHealerWins);
  }
  return merged;
}

export function mergeMissionAndLineageFields(
  base?: Partial<PlayerProgress> | null,
  incoming?: Partial<PlayerProgress> | null,
  preferMaxStreak = false
) {
  const classMissionsProgress = mergeClassMissionsProgress(
    base?.classMissionsProgress,
    incoming?.classMissionsProgress
  );

  // Derive rewards from any completed class mission so unlocked skins/skills are always consistent
  const derivedSkinIds: string[] = [];
  const derivedSkillIds: string[] = [];
  for (const mission of ALL_CLASS_MISSIONS) {
    const cProg = classMissionsProgress[mission.className];
    if (cProg?.completedMissions?.includes(mission.id)) {
      if (mission.rewardSkinId) derivedSkinIds.push(mission.rewardSkinId);
      if (mission.rewardSkillId) derivedSkillIds.push(mission.rewardSkillId);
    }
  }

  const unlockedClassSkins = Array.from(
    new Set([
      ...(Array.isArray(base?.unlockedClassSkins) ? base!.unlockedClassSkins! : []),
      ...(Array.isArray(incoming?.unlockedClassSkins) ? incoming!.unlockedClassSkins! : []),
      ...derivedSkinIds,
    ])
  );

  const unlockedClassSkillIds = Array.from(
    new Set([
      ...(Array.isArray(base?.unlockedClassSkillIds) ? base!.unlockedClassSkillIds! : []),
      ...(Array.isArray(incoming?.unlockedClassSkillIds) ? incoming!.unlockedClassSkillIds! : []),
      ...derivedSkillIds,
    ])
  );

  const equippedClassSkins: Record<string, string> = {};
  if (base?.equippedClassSkins && typeof base.equippedClassSkins === 'object') {
    for (const [k, v] of Object.entries(base.equippedClassSkins)) {
      if (typeof v === 'string' && v) equippedClassSkins[k === 'engenheiro' ? 'druida' : k] = v;
    }
  }
  if (incoming?.equippedClassSkins && typeof incoming.equippedClassSkins === 'object') {
    for (const [k, v] of Object.entries(incoming.equippedClassSkins)) {
      if (typeof v === 'string' && v) equippedClassSkins[k === 'engenheiro' ? 'druida' : k] = v;
    }
  }

  const monsterKills = mergeNumericRecord(base?.monsterKills, incoming?.monsterKills);
  const lineageQuestStats = mergeLineageQuestStats(
    base?.lineageQuestStats,
    incoming?.lineageQuestStats,
    preferMaxStreak
  );

  const rawLineages = [
    ...INITIAL_UNLOCKED_LINEAGES,
    ...(Array.isArray(base?.unlockedLineages) ? base!.unlockedLineages! : []),
    ...(Array.isArray(incoming?.unlockedLineages) ? incoming!.unlockedLineages! : []),
  ].map((id) => (id === 'draconato' ? 'dragonoide' : id));

  const tempProgressForCheck = {
    ...DEFAULT_PROGRESS,
    monsterKills,
    lineageQuestStats,
    unlockedLineages: Array.from(new Set(rawLineages)),
  };
  const newlyCompletedLineages = checkLineageUnlockQuests(tempProgressForCheck);
  const unlockedLineages = Array.from(new Set([...rawLineages, ...newlyCompletedLineages]));

  const selectedPartyLineages: Record<string, string> = {};
  if (base?.selectedPartyLineages && typeof base.selectedPartyLineages === 'object') {
    for (const [k, v] of Object.entries(base.selectedPartyLineages)) {
      if (typeof v === 'string' && v) {
        selectedPartyLineages[k === 'engenheiro' ? 'druida' : k] = v === 'draconato' ? 'dragonoide' : v;
      }
    }
  }
  if (incoming?.selectedPartyLineages && typeof incoming.selectedPartyLineages === 'object') {
    for (const [k, v] of Object.entries(incoming.selectedPartyLineages)) {
      if (typeof v === 'string' && v) {
        selectedPartyLineages[k === 'engenheiro' ? 'druida' : k] = v === 'draconato' ? 'dragonoide' : v;
      }
    }
  }

  const dates = [
    base?.dailyDungeon?.lastCompletedDate,
    incoming?.dailyDungeon?.lastCompletedDate,
  ].filter((d): d is string => typeof d === 'string' && d.trim().length > 0);
  dates.sort();

  const dailyDungeon = {
    lastCompletedDate: dates.length > 0 ? dates[dates.length - 1] : undefined,
    totalWins: Math.max(
      Number(base?.dailyDungeon?.totalWins) || 0,
      Number(incoming?.dailyDungeon?.totalWins) || 0
    ),
  };

  return {
    classMissionsProgress,
    unlockedClassSkins,
    equippedClassSkins,
    unlockedClassSkillIds,
    monsterKills,
    lineageQuestStats,
    unlockedLineages,
    selectedPartyLineages,
    dailyDungeon,
  };
}

export function loadPlayerProgress(): PlayerProgress {
  try {
    let raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      // Check for v3, v2 or v1 migration
      raw = localStorage.getItem('rpg_tactics_progress_v3') ||
            localStorage.getItem('rpg_tactics_progress_v2') ||
            localStorage.getItem('rpg_tactics_progress_v1');
    }

    if (!raw) {
      return DEFAULT_PROGRESS;
    }

    const parsed = JSON.parse(raw);
    const completedLevels: number[] = Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [];
    
    // Ensure adventureHistory is an array of max 10
    const adventureHistory = Array.isArray(parsed.adventureHistory)
      ? parsed.adventureHistory.slice(0, 10)
      : [];

    const maxCompleted = getMaxCompletedLevel({
      activeAdventure: parsed.activeAdventure,
      adventureHistory,
      completedLevels,
      leaderboardHighestLevel: parsed.highScore,
    });

    // Sanitize unlocked classes: user retains all valid unlocked classes and gets boss classes
    let unlockedClasses = sanitizeUnlockedClasses(parsed.unlockedClasses, maxCompleted, completedLevels)
      .map((c) => (c === 'engenheiro' ? 'druida' : c))
      .filter((c) => c !== 'engenheiro');
    unlockedClasses = Array.from(new Set(unlockedClasses));

    // Retroactively unlock any classes earned by completed boss/mini-boss levels
    Object.entries(CLASS_UNLOCK_CONDITIONS).forEach(([cName, info]) => {
      const canonicalName = cName === 'engenheiro' ? 'druida' : cName;
      if ((completedLevels.includes(info.requiredLevel) || maxCompleted >= info.requiredLevel) && !unlockedClasses.includes(canonicalName)) {
        unlockedClasses.push(canonicalName);
      }
    });

    // Ensure initial 4 classes are always present
    INITIAL_CLASSES.forEach((c) => {
      if (!unlockedClasses.includes(c)) unlockedClasses.push(c);
    });

    // Ensure selectedPartyClasses only contains valid unlocked classes
    const selectedPartyClasses = sanitizePartyClasses(parsed.selectedPartyClasses, unlockedClasses);

    // Ensure discoveredMonsterIds is an array
    let discoveredMonsterIds: string[] = Array.isArray(parsed.discoveredMonsterIds)
      ? Array.from(new Set(parsed.discoveredMonsterIds))
      : ['goblin'];
    if (!discoveredMonsterIds.includes('goblin')) discoveredMonsterIds.push('goblin');

    // Ensure discoveredItemIds is an array and permanently retains all items
    let discoveredItemIds: string[] = Array.isArray(parsed.discoveredItemIds)
      ? Array.from(new Set(parsed.discoveredItemIds))
      : [];

    if (parsed.activeAdventure?.inventory && Array.isArray(parsed.activeAdventure.inventory)) {
      parsed.activeAdventure.inventory.forEach((id: string) => {
        if (id && !discoveredItemIds.includes(id)) discoveredItemIds.push(id);
      });
    }

    if (parsed.activeAdventure?.equipment && typeof parsed.activeAdventure.equipment === 'object') {
      Object.values(parsed.activeAdventure.equipment).forEach((heroEquip: any) => {
        if (heroEquip && typeof heroEquip === 'object') {
          Object.values(heroEquip).forEach((id: any) => {
            if (typeof id === 'string' && id && !discoveredItemIds.includes(id)) {
              discoveredItemIds.push(id);
            }
          });
        }
      });
    }

    // Ensure activeAdventure has inventory, equipment and live battleState
    let activeAdventure = parsed.activeAdventure || null;
    if (activeAdventure) {
      const liveBattle = loadLiveBattleState();
      activeAdventure = {
        ...activeAdventure,
        partyClasses: Array.isArray(activeAdventure.partyClasses)
          ? sanitizePartyClasses(activeAdventure.partyClasses.map((c: string) => (c === 'engenheiro' ? 'druida' : c)), unlockedClasses)
          : selectedPartyClasses,
        inventory: Array.isArray(activeAdventure.inventory) ? activeAdventure.inventory : [],
        equipment: activeAdventure.equipment || {},
        battleState: liveBattle || activeAdventure.battleState || null,
      };
    }

    const missionAndLineage = mergeMissionAndLineageFields(null, parsed, true);

    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      version: 4,
      gold: typeof parsed.gold === 'number' ? parsed.gold : 0,
      unlockedLevel: Math.max(1, Number(parsed.unlockedLevel) || 1, maxCompleted + 1),
      completedLevels,
      unlockedClasses,
      selectedPartyClasses,
      selectedPartyLineages: missionAndLineage.selectedPartyLineages,
      unlockedLineages: missionAndLineage.unlockedLineages,
      monsterKills: missionAndLineage.monsterKills,
      lineageQuestStats: missionAndLineage.lineageQuestStats,
      unitsState: (() => {
        const rawUnits = { ...(parsed.unitsState || {}) };
        if (rawUnits.engenheiro && !rawUnits.druida) {
          rawUnits.druida = { ...rawUnits.engenheiro, className: 'druida' };
        }
        delete rawUnits.engenheiro;
        return {
          ...createInitialUnitsState(),
          ...rawUnits,
        };
      })(),
      activeAdventure,
      discoveredMonsterIds,
      discoveredItemIds,
      adventureHistory,
      classUpgrades: parsed.classUpgrades && typeof parsed.classUpgrades === 'object' ? parsed.classUpgrades : {},
      generalUpgrades: parsed.generalUpgrades && typeof parsed.generalUpgrades === 'object' ? parsed.generalUpgrades : {},
      itemUpgrades: parsed.itemUpgrades && typeof parsed.itemUpgrades === 'object' ? parsed.itemUpgrades : {},
      unlockedPetIds: Array.isArray(parsed.unlockedPetIds) ? parsed.unlockedPetIds : [],
      dailyDungeon: missionAndLineage.dailyDungeon,
      equippedPetId: typeof parsed.equippedPetId === 'string' ? parsed.equippedPetId : null,
      eggs: Array.isArray(parsed.eggs)
        ? parsed.eggs.map((e: any) => ({
            ...e,
            hatchDurationMs: getHatchDuration(e.rarity),
          }))
        : [],
      classMissionsProgress: missionAndLineage.classMissionsProgress,
      unlockedClassSkins: missionAndLineage.unlockedClassSkins,
      equippedClassSkins: missionAndLineage.equippedClassSkins,
      unlockedClassSkillIds: missionAndLineage.unlockedClassSkillIds,
    };
  } catch (err) {
    console.error('Failed to load progress from localStorage:', err);
    return DEFAULT_PROGRESS;
  }
}

export function savePlayerProgress(progress: PlayerProgress): void {
  try {
    if (cloudSyncTimeout) {
      clearTimeout(cloudSyncTimeout);
      cloudSyncTimeout = null;
    }

    let existingLocal: Partial<PlayerProgress> | null = null;
    try {
      const rawExisting = localStorage.getItem(PROGRESS_KEY);
      if (rawExisting) existingLocal = JSON.parse(rawExisting);
    } catch {
      existingLocal = null;
    }

    const mergedMissionAndLineage = mergeMissionAndLineageFields(existingLocal, progress, false);
    const safeProgress: PlayerProgress = {
      ...progress,
      ...mergedMissionAndLineage,
    };

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(safeProgress));
    saveCloudProgress(safeProgress, true).then((res) => {
      if (res && typeof res.gold === 'number' && res.gold !== safeProgress.gold) {
        try {
          const raw = localStorage.getItem(PROGRESS_KEY);
          const current = raw ? JSON.parse(raw) : { ...safeProgress };
          current.gold = res.gold;
          localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('kazcampaign_gold_sync', { detail: { gold: res.gold } }));
          }
        } catch {
          // ignore
        }
      }
    }).catch(() => {});
  } catch (err) {
    console.error('Failed to save progress to localStorage:', err);
  }
}

export function resetPlayerProgress(): PlayerProgress {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem('rpg_tactics_progress_v1');
    localStorage.removeItem(BATTLE_STATE_KEY);
  } catch (err) {
    console.error('Failed to reset progress in localStorage:', err);
  }
  return DEFAULT_PROGRESS;
}

let cloudSyncTimeout: any = null;

export function saveLiveBattleState(battleState: ActiveBattleState | null, syncCloud = false, keepalive = false): void {
  try {
    if (!battleState) {
      clearLiveBattleState();
      return;
    }
    localStorage.setItem(BATTLE_STATE_KEY, JSON.stringify(battleState));

    // Espelha no activeAdventure dentro de PROGRESS_KEY
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.activeAdventure) {
        parsed.activeAdventure.battleState = battleState;
        parsed.activeAdventure.combatActive = true;
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(parsed));

        if (syncCloud || keepalive) {
          if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
          saveCloudProgress(parsed, keepalive).catch(() => {});
        } else {
          // Sincronização periódica suave na nuvem (debounced 800ms) lendo o estado mais recente
          if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
          cloudSyncTimeout = setTimeout(() => {
            try {
              const latestRaw = localStorage.getItem(PROGRESS_KEY);
              const latestParsed = latestRaw ? JSON.parse(latestRaw) : parsed;
              saveCloudProgress(latestParsed).catch(() => {});
            } catch {
              saveCloudProgress(parsed).catch(() => {});
            }
          }, 800);
        }
      }
    }
  } catch (err) {
    console.error('Failed to save live battle state:', err);
  }
}

export function loadLiveBattleState(): ActiveBattleState | null {
  try {
    const raw = localStorage.getItem(BATTLE_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ActiveBattleState;
      if (parsed && typeof parsed.levelId === 'number' && Array.isArray(parsed.units) && parsed.units.length > 0) {
        return parsed;
      }
    }

    const rawProgress = localStorage.getItem(PROGRESS_KEY);
    if (rawProgress) {
      const parsedProgress = JSON.parse(rawProgress);
      const bState = parsedProgress?.activeAdventure?.battleState as ActiveBattleState | undefined;
      if (bState && typeof bState.levelId === 'number' && Array.isArray(bState.units) && bState.units.length > 0) {
        return bState;
      }
    }
    return null;
  } catch (err) {
    console.error('Failed to load live battle state:', err);
    return null;
  }
}

export function clearLiveBattleState(): void {
  try {
    if (cloudSyncTimeout) {
      clearTimeout(cloudSyncTimeout);
      cloudSyncTimeout = null;
    }
    localStorage.removeItem(BATTLE_STATE_KEY);
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.activeAdventure) {
        parsed.activeAdventure.battleState = null;
        parsed.activeAdventure.combatActive = false;
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(parsed));
        saveCloudProgress(parsed, true).catch(() => {});
      }
    }
  } catch (err) {
    console.error('Failed to clear live battle state:', err);
  }
}

export function loadAudioSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(AUDIO_KEY);
    if (!raw) return DEFAULT_AUDIO_SETTINGS;
    return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load audio settings:', err);
    return DEFAULT_AUDIO_SETTINGS;
  }
}

export function saveAudioSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(AUDIO_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save audio settings:', err);
  }
}
