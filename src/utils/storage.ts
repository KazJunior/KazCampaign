import type { AudioSettings, PlayerProgress } from '../types/game';

const PROGRESS_KEY = 'rpg_tactics_progress_v2';
const AUDIO_KEY = 'rpg_tactics_audio_v1';

export const DEFAULT_PROGRESS: PlayerProgress = {
  version: 2,
  unlockedLevel: 1,
  completedLevels: [],
  gold: 0,
  selectedPartyClasses: ['guerreiro', 'arqueiro', 'mago', 'curandeiro'],
  unitsState: {
    guerreiro: { className: 'guerreiro', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, learnedSkillIds: [] },
    arqueiro: { className: 'arqueiro', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, learnedSkillIds: [] },
    mago: { className: 'mago', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, learnedSkillIds: [] },
    curandeiro: { className: 'curandeiro', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, learnedSkillIds: [] },
    assassino: { className: 'assassino', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, learnedSkillIds: [] },
    cavaleiro_arcano: { className: 'cavaleiro_arcano', level: 1, xp: 0, bonusAtk: 0, bonusDef: 0, bonusHp: 0, learnedSkillIds: [] },
  },
  combatSpeed: 'normal',
  highScore: 0,
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  muted: false,
  masterVolume: 0.8,
  sfxVolume: 0.8,
  bgmVolume: 0.5,
};

export function loadPlayerProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      // Check for v1 migration
      const v1Raw = localStorage.getItem('rpg_tactics_progress_v1');
      if (v1Raw) {
        const v1Data = JSON.parse(v1Raw);
        const migrated: PlayerProgress = { ...DEFAULT_PROGRESS };
        if (v1Data.unlockedLevel) migrated.unlockedLevel = v1Data.unlockedLevel;
        if (v1Data.completedLevels) migrated.completedLevels = v1Data.completedLevels;
        if (v1Data.gold) migrated.gold = v1Data.gold;
        return migrated;
      }
      return DEFAULT_PROGRESS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
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
