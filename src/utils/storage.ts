import type { AudioSettings, PlayerProgress } from '../types/game';
import { INITIAL_CLASSES, CLASS_UNLOCK_CONDITIONS } from '../data/units';

const PROGRESS_KEY = 'rpg_tactics_progress_v4';
const AUDIO_KEY = 'rpg_tactics_audio_v1';

export function createInitialUnitsState(): PlayerProgress['unitsState'] {
  return {
    guerreiro: { className: 'guerreiro', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [] },
    arqueiro: { className: 'arqueiro', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [] },
    mago: { className: 'mago', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [] },
    curandeiro: { className: 'curandeiro', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [] },
    assassino: { className: 'assassino', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [] },
    cavaleiro_arcano: { className: 'cavaleiro_arcano', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [] },
    necromante: { className: 'necromante', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [] },
    engenheiro: { className: 'engenheiro', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [] },
    mago_runico: { className: 'mago_runico', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [] },
    berserker: { className: 'berserker', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, bonusMag: 0, bonusRes: 0, learnedSkillIds: [] },
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
  adventureHistory: [],
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
    
    // Ensure unlockedClasses is properly populated
    let unlockedClasses: string[] = Array.isArray(parsed.unlockedClasses) && parsed.unlockedClasses.length > 0
      ? parsed.unlockedClasses
      : [...INITIAL_CLASSES];

    // Retroactively unlock any classes earned by completed boss/mini-boss levels
    Object.entries(CLASS_UNLOCK_CONDITIONS).forEach(([cName, info]) => {
      if (completedLevels.includes(info.requiredLevel) && !unlockedClasses.includes(cName)) {
        unlockedClasses.push(cName);
      }
    });

    // Make sure initial 4 classes are always present
    INITIAL_CLASSES.forEach((c) => {
      if (!unlockedClasses.includes(c)) unlockedClasses.push(c);
    });

    // Ensure selectedPartyClasses only contains unlocked classes
    let selectedPartyClasses: string[] = Array.isArray(parsed.selectedPartyClasses) && parsed.selectedPartyClasses.length === 4
      ? parsed.selectedPartyClasses.filter((c: string) => unlockedClasses.includes(c))
      : [];
    if (selectedPartyClasses.length !== 4) {
      selectedPartyClasses = [...INITIAL_CLASSES];
    }

    // Ensure discoveredMonsterIds is an array
    let discoveredMonsterIds: string[] = Array.isArray(parsed.discoveredMonsterIds)
      ? Array.from(new Set(parsed.discoveredMonsterIds))
      : ['goblin'];
    if (!discoveredMonsterIds.includes('goblin')) discoveredMonsterIds.push('goblin');

    // Ensure adventureHistory is an array of max 10
    const adventureHistory = Array.isArray(parsed.adventureHistory)
      ? parsed.adventureHistory.slice(0, 10)
      : [];

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
      activeAdventure: parsed.activeAdventure || null,
      discoveredMonsterIds,
      adventureHistory,
    };
  } catch (err) {
    console.error('Failed to load progress from localStorage:', err);
    return DEFAULT_PROGRESS;
  }
}

export function savePlayerProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save progress to localStorage:', err);
  }
}

export function resetPlayerProgress(): PlayerProgress {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem('rpg_tactics_progress_v1');
  } catch (err) {
    console.error('Failed to reset progress in localStorage:', err);
  }
  return DEFAULT_PROGRESS;
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
