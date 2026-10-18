import type { AudioSettings, PlayerProgress, ActiveBattleState } from '../types/game';
import { INITIAL_CLASSES, CLASS_UNLOCK_CONDITIONS, getMaxCompletedLevel, sanitizeUnlockedClasses, sanitizePartyClasses } from '../data/units';
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
    engenheiro: { className: 'engenheiro', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    mago_runico: { className: 'mago_runico', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    berserker: { className: 'berserker', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
    carrasco_vazio: { className: 'carrasco_vazio', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [], skillLevels: {} },
  };
}

export const DEFAULT_PROGRESS: PlayerProgress = {
  version: 4,
  unlockedLevel: 1,
  completedLevels: [],
  gold: 0,
  unlockedClasses: [...INITIAL_CLASSES],
  selectedPartyClasses: ['guerreiro', 'arqueiro', 'mago', 'curandeiro'],
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
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  muted: false,
  masterVolume: 0.8,
  sfxVolume: 0.8,
  bgmVolume: 0.5,
};

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
    });

    // Sanitize unlocked classes: user can only have classes for stages they legitimately completed
    let unlockedClasses = sanitizeUnlockedClasses(parsed.unlockedClasses, maxCompleted, completedLevels);

    // Retroactively unlock any classes earned by completed boss/mini-boss levels
    Object.entries(CLASS_UNLOCK_CONDITIONS).forEach(([cName, info]) => {
      if ((completedLevels.includes(info.requiredLevel) || maxCompleted >= info.requiredLevel) && !unlockedClasses.includes(cName)) {
        unlockedClasses.push(cName);
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
        inventory: Array.isArray(activeAdventure.inventory) ? activeAdventure.inventory : [],
        equipment: activeAdventure.equipment || {},
        battleState: liveBattle || activeAdventure.battleState || null,
      };
    }

    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      version: 4,
      gold: typeof parsed.gold === 'number' ? parsed.gold : 0,
      completedLevels,
      unlockedClasses,
      selectedPartyClasses,
      unitsState: {
        ...createInitialUnitsState(),
        ...(parsed.unitsState || {}),
      },
      activeAdventure,
      discoveredMonsterIds,
      discoveredItemIds,
      adventureHistory,
      classUpgrades: parsed.classUpgrades && typeof parsed.classUpgrades === 'object' ? parsed.classUpgrades : {},
      generalUpgrades: parsed.generalUpgrades && typeof parsed.generalUpgrades === 'object' ? parsed.generalUpgrades : {},
      itemUpgrades: parsed.itemUpgrades && typeof parsed.itemUpgrades === 'object' ? parsed.itemUpgrades : {},
    };
  } catch (err) {
    console.error('Failed to load progress from localStorage:', err);
    return DEFAULT_PROGRESS;
  }
}

export function savePlayerProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    saveCloudProgress(progress);
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

export function saveLiveBattleState(battleState: ActiveBattleState | null): void {
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
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(parsed));
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
    localStorage.removeItem(BATTLE_STATE_KEY);
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.activeAdventure) {
        parsed.activeAdventure.battleState = null;
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(parsed));
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
