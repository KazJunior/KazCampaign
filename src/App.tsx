import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type {
  ActiveAdventure,
  ActiveBattleState,
  AdventureRecord,
  BattlePhase,
  DamagePreview,
  EquipmentSlots,
  FloatingNumber,
  ItemCategory,
  ItemDefinition,
  LevelConfig,
  PlayerProgress,
  Point,
  SelectedAction,
  Skill,
  StatType,
  StatusEffect,
  TileData,
  Unit,
  UnitProgression,
} from './types/game';
import { LEVELS, createTrainingLevel } from './data/levels';
import { DEFAULT_CLASS_LINEAGES } from './data/lineages';
import { createPlayerUnit, CLASS_DEFINITIONS, CLASS_UNLOCK_CONDITIONS, INITIAL_CLASSES, getMaxCompletedLevel, sanitizeUnlockedClasses, sanitizePartyClasses, isMeleeClassForSecretUnlock, isMageClassForSecretUnlock } from './data/units';
import { SKILLS, getEvolvedSkill, MAX_SKILL_LEVEL, CLASS_LEARNABLE_SKILL_IDS, CLASS_MISSION_REWARD_SKILLS } from './data/skills';
import { checkLineageUnlockQuests, INITIAL_UNLOCKED_LINEAGES } from './data/lineageQuests';
import { LineageUnlockCelebrationModal } from './components/LineageUnlockCelebrationModal';
import { ClassUnlockQuestsModal } from './components/ClassUnlockQuestsModal';
import { createMonsterUnit } from './data/monsters';
import { getItemById, rollStageItemDrops, getRandomItemByRarity } from './data/items';
import {
  getClassCumulativeBonus,
  getGeneralBonusHp,
  getGeneralGoldMultiplier,
  getGeneralDropBonus,
  CLASS_UPGRADE_COSTS,
  MAX_CLASS_UPGRADE_LEVEL,
  MAX_ITEM_ENHANCEMENT_LEVEL,
  GENERAL_UPGRADES,
  getItemUpgradeCost,
} from './data/baseUpgrades';
import {
  DEFAULT_PROGRESS,
  createInitialUnitsState,
  loadAudioSettings,
  loadPlayerProgress,
  resetPlayerProgress,
  saveAudioSettings,
  savePlayerProgress,
  saveLiveBattleState,
  loadLiveBattleState,
  clearLiveBattleState,
  mergeMissionAndLineageFields,
} from './utils/storage';
import { soundManager } from './utils/audio';
import { getAttackableTiles, getAoETiles, getReachableTiles, getPathTo } from './utils/pathfinding';
import { getDamagePreview, rollActualDamage } from './utils/damage';
import { decideMonsterAction } from './ai/monsterAI';
import { BoardRenderer3D } from './game/BoardRenderer3D';
import type { BoardRenderer3DHandle } from './game/BoardRenderer3D';
import { TopBar } from './components/TopBar';
import { SidePanel } from './components/SidePanel';
import { SkillsPanel } from './components/SkillsPanel';
import { MobileBattleHUD } from './components/MobileBattleHUD';
import { ActionPreviewModal } from './components/ActionPreviewModal';
import { DeploymentBanner } from './components/DeploymentBanner';
import { ObjectivesModal } from './components/ObjectivesModal';
import { SettingsModal } from './components/SettingsModal';
import { TutorialModal } from './components/TutorialModal';
import { VictoryDefeatModal, type LevelSummary } from './components/VictoryDefeatModal';
import { LevelSelect } from './components/LevelSelect';
import { PartySelectionModal } from './components/PartySelectionModal';
import { SkillChoiceModal } from './components/SkillChoiceModal';
import { StatChoiceModal } from './components/StatChoiceModal';
import { ClassUnlockModal } from './components/ClassUnlockModal';
import { BossIntroBanner } from './components/BossIntroBanner';
import { SecretRiddleModal } from './components/SecretRiddleModal';
import { AuthScreen } from './components/AuthScreen';
import { LeaderboardModal } from './components/LeaderboardModal';
import { BestiaryModal } from './components/BestiaryModal';
import { AdventureHistoryModal } from './components/AdventureHistoryModal';
import { ItemLootModal } from './components/ItemLootModal';
import { EquipmentModal } from './components/EquipmentModal';
import { ItemBestiaryModal } from './components/ItemBestiaryModal';
import { BaseUpgradeModal } from './components/BaseUpgradeModal';
import { ChangelogModal } from './components/ChangelogModal';
import { GAME_CHANGELOG } from './data/changelog';
import { PetModal } from './components/PetModal';
import { CouponModal } from './components/CouponModal';
import { ClassMissionsModal } from './components/ClassMissionsModal';
import { getEquippedSkin, incrementClassStat, incrementPartyStats } from './data/classQuests';
import { TrainingModeModal, type TrainingModeConfig } from './components/TrainingModeModal';
import { DailyDungeonModal } from './components/DailyDungeonModal';
import { DailyItemDraftModal } from './components/DailyItemDraftModal';
import { generateDailyDungeonConfig, getTodayDateString } from './utils/dailyDungeon';
import { TrainingBattleHUD } from './components/TrainingBattleHUD';
import { TrainingSkillPickerModal } from './components/TrainingSkillPickerModal';
import { getPetById, calculatePetPassives, createNewEgg, MAX_EGGS_LIMIT } from './data/pets';
import type { PetActiveSkill, PetEgg } from './types/game';
import { fetchCurrentUser, fetchCloudProgress, logout, saveCloudProgress, submitScore } from './utils/api';
import type { AuthUser } from './utils/api';
import { LogOut, Trophy, User as UserIcon, Loader2, Sparkles } from 'lucide-react';

function getGlobalHeroBonus(prog: PlayerProgress) {
  const equippedPet = getPetById(prog.equippedPetId);
  const petPassives = calculatePetPassives(equippedPet);
  return {
    hp: getGeneralBonusHp(prog.generalUpgrades?.globalHp || 0) + petPassives.stats.hp,
    atk: petPassives.stats.atk,
    mag: petPassives.stats.mag,
    def: petPassives.stats.def,
    res: petPassives.stats.res,
    mov: petPassives.stats.mov,
    range: petPassives.stats.range,
  };
}

function consolidateDiscoveredItems(
  existingDiscovered: string[] = [],
  activeAdventure?: ActiveAdventure | null,
  additionalItemIds: string[] = []
): string[] {
  const set = new Set<string>(existingDiscovered);
  additionalItemIds.forEach((id) => id && set.add(id));

  if (activeAdventure?.inventory && Array.isArray(activeAdventure.inventory)) {
    activeAdventure.inventory.forEach((id) => id && set.add(id));
  }

  if (activeAdventure?.equipment && typeof activeAdventure.equipment === 'object') {
    Object.values(activeAdventure.equipment).forEach((heroEquip) => {
      if (heroEquip && typeof heroEquip === 'object') {
        Object.values(heroEquip).forEach((id) => {
          if (typeof id === 'string' && id) set.add(id);
        });
      }
    });
  }

  return Array.from(set);
}

export function App() {
  const boardRef = useRef<BoardRenderer3DHandle>(null);
  const resumeBattleRef = useRef<((savedBattle: ActiveBattleState) => void) | null>(null);

  const [currentView, setCurrentView] = useState<'level_select' | 'party_select' | 'battle'>(() => {
    const loadedProg = loadPlayerProgress();
    const liveBattle = loadLiveBattleState();
    if (liveBattle && loadedProg.activeAdventure) {
      return 'battle';
    }
    return 'level_select';
  });
  const [progress, setProgress] = useState<PlayerProgress>(loadPlayerProgress());
  const [audioSettings, setAudioSettings] = useState(loadAudioSettings());

  // Autenticação e ranking
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showItemBestiary, setShowItemBestiary] = useState(false);
  const [showBaseUpgrades, setShowBaseUpgrades] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showPetsModal, setShowPetsModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showDailyDungeonModal, setShowDailyDungeonModal] = useState(false);
  const [isDailyMode, setIsDailyMode] = useState(false);
  const [dailyDungeonConfig, setDailyDungeonConfig] = useState<any | null>(null);
  const [showDailyItemDraft, setShowDailyItemDraft] = useState(false);
  const [dailyInventory, setDailyInventory] = useState<string[]>([]);
  const [dailyEquipment, setDailyEquipment] = useState<Record<string, EquipmentSlots>>({});
  const [showClassMissionsModal, setShowClassMissionsModal] = useState(false);
  const [showClassUnlockQuestsModal, setShowClassUnlockQuestsModal] = useState(false);
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [trainingConfig, setTrainingConfig] = useState<TrainingModeConfig | null>(null);
  const [showLiveTrainingSkillPicker, setShowLiveTrainingSkillPicker] = useState(false);
  const [trainingDamageStats, setTrainingDamageStats] = useState({
    totalDamage: 0,
    highestHit: 0,
    hitCount: 0,
  });
  const [activePetSkill, setActivePetSkill] = useState<PetActiveSkill | null>(null);
  const [usedPetSkillIds, setUsedPetSkillIds] = useState<string[]>([]);
  const [pendingLootItems, setPendingLootItems] = useState<ItemDefinition[] | null>(null);

  const authUserRef = useRef<AuthUser | null>(null);
  authUserRef.current = authUser;

  const progressRef = useRef<PlayerProgress>(progress);
  progressRef.current = progress;

  const syncUserCloudProgress = async (user: AuthUser) => {
    setAuthUser(user);
    try {
      const localP = loadPlayerProgress();
      const cloudP = await fetchCloudProgress();
      if (cloudP) {
        const mergedCompletedLevels = Array.from(
          new Set([
            ...(Array.isArray(localP.completedLevels) ? localP.completedLevels : []),
            ...(Array.isArray(cloudP.completedLevels) ? cloudP.completedLevels : []),
          ])
        ).sort((a, b) => a - b);

        const maxCompleted = getMaxCompletedLevel({
          activeAdventure: cloudP.activeAdventure ?? localP.activeAdventure,
          adventureHistory: cloudP.adventureHistory ?? localP.adventureHistory,
          completedLevels: mergedCompletedLevels,
          leaderboardHighestLevel: cloudP.highestLevel || localP.highScore || progressRef.current.highScore,
        });

        // Merge local unlocked classes and cloud unlocked classes so no valid unlock is lost
        const combinedUnlocked = Array.from(
          new Set([
            ...(localP.unlockedClasses || []),
            ...(cloudP.unlockedClasses || []),
          ])
        ).map((c) => (c === 'engenheiro' ? 'druida' : c));
        const safeUnlocked = sanitizeUnlockedClasses(combinedUnlocked, maxCompleted, mergedCompletedLevels);
        
        // Prefer local selectedPartyClasses if it has 4 valid classes (to prevent stale cloud overwrites)
        const rawPartyChoice =
          Array.isArray(localP.selectedPartyClasses) && localP.selectedPartyClasses.length === 4
            ? localP.selectedPartyClasses
            : (Array.isArray(cloudP.selectedPartyClasses) && cloudP.selectedPartyClasses.length === 4
                ? cloudP.selectedPartyClasses
                : INITIAL_CLASSES);
        const safeParty = sanitizePartyClasses(rawPartyChoice, safeUnlocked);

        const mergeLevelMaps = (
          localMap?: Record<string, number>,
          cloudMap?: Record<string, number>
        ): Record<string, number> => {
          const result: Record<string, number> = {};
          if (cloudMap && typeof cloudMap === 'object') {
            for (const [k, v] of Object.entries(cloudMap)) {
              if (typeof v === 'number') result[k] = v;
            }
          }
          if (localMap && typeof localMap === 'object') {
            for (const [k, v] of Object.entries(localMap)) {
              if (typeof v === 'number') {
                result[k] = Math.max(result[k] || 0, v);
              }
            }
          }
          return result;
        };

        const missionAndLineage = mergeMissionAndLineageFields(cloudP, localP, true);

        const merged: PlayerProgress = {
          ...DEFAULT_PROGRESS,
          gold: typeof cloudP.gold === 'number' ? cloudP.gold : (localP.gold || 0),
          unlockedLevel: Math.max(
            1,
            Number(cloudP.unlockedLevel) || 1,
            Number(localP.unlockedLevel) || 1,
            maxCompleted + 1
          ),
          completedLevels: mergedCompletedLevels,
          unlockedClasses: safeUnlocked,
          selectedPartyClasses: safeParty,
          selectedPartyLineages: missionAndLineage.selectedPartyLineages,
          unitsState: cloudP.unitsState || localP.unitsState || createInitialUnitsState(),
          discoveredMonsterIds: Array.from(
            new Set([
              'goblin',
              ...(Array.isArray(cloudP.discoveredMonsterIds) ? cloudP.discoveredMonsterIds : []),
              ...(Array.isArray(localP.discoveredMonsterIds) ? localP.discoveredMonsterIds : []),
            ])
          ),
          discoveredItemIds: consolidateDiscoveredItems(
            Array.isArray(cloudP.discoveredItemIds) ? cloudP.discoveredItemIds : [],
            cloudP.activeAdventure ?? localP.activeAdventure,
            localP.discoveredItemIds || []
          ),
          activeAdventure: cloudP.activeAdventure
            ? {
                ...cloudP.activeAdventure,
                partyClasses: Array.isArray(cloudP.activeAdventure.partyClasses) && cloudP.activeAdventure.partyClasses.length === 4
                  ? sanitizePartyClasses(cloudP.activeAdventure.partyClasses, safeUnlocked)
                  : (localP.activeAdventure?.partyClasses || safeParty),
                partyLineages: cloudP.activeAdventure.partyLineages || localP.activeAdventure?.partyLineages || missionAndLineage.selectedPartyLineages,
                battleState: loadLiveBattleState() || cloudP.activeAdventure.battleState || localP.activeAdventure?.battleState || null,
              }
            : localP.activeAdventure?.battleState || loadLiveBattleState()
              ? {
                  currentLevelId: (loadLiveBattleState() || localP.activeAdventure?.battleState)!.levelId,
                  partyClasses: localP.activeAdventure?.partyClasses || safeParty,
                  partyLineages: localP.activeAdventure?.partyLineages || missionAndLineage.selectedPartyLineages,
                  startedAt: new Date().toISOString(),
                  goldEarnedInRun: 0,
                  unitsState: cloudP.unitsState || localP.unitsState || createInitialUnitsState(),
                  battleState: loadLiveBattleState() || localP.activeAdventure?.battleState || null,
                }
              : null,
          adventureHistory: Array.isArray(cloudP.adventureHistory) && cloudP.adventureHistory.length > 0
            ? cloudP.adventureHistory
            : (Array.isArray(localP.adventureHistory) ? localP.adventureHistory : []),
          combatSpeed: cloudP.combatSpeed || localP.combatSpeed || 'normal',
          classUpgrades: mergeLevelMaps(localP.classUpgrades, cloudP.classUpgrades),
          generalUpgrades: mergeLevelMaps(localP.generalUpgrades, cloudP.generalUpgrades),
          itemUpgrades: mergeLevelMaps(localP.itemUpgrades, cloudP.itemUpgrades),
          unlockedPetIds: Array.from(new Set([
            ...(Array.isArray(cloudP.unlockedPetIds) ? cloudP.unlockedPetIds : []),
            ...(Array.isArray(localP.unlockedPetIds) ? localP.unlockedPetIds : []),
          ])),
          equippedPetId: (typeof cloudP.equippedPetId === 'string' && cloudP.equippedPetId)
            ? cloudP.equippedPetId
            : (localP.equippedPetId || null),
          eggs: (Array.isArray(cloudP.eggs) && cloudP.eggs.length > 0)
            ? cloudP.eggs
            : (Array.isArray(localP.eggs) ? localP.eggs : []),
          classMissionsProgress: missionAndLineage.classMissionsProgress,
          unlockedClassSkins: missionAndLineage.unlockedClassSkins,
          equippedClassSkins: missionAndLineage.equippedClassSkins,
          unlockedClassSkillIds: missionAndLineage.unlockedClassSkillIds,
          dailyDungeon: missionAndLineage.dailyDungeon,
          monsterKills: missionAndLineage.monsterKills,
          unlockedLineages: missionAndLineage.unlockedLineages,
          lineageQuestStats: missionAndLineage.lineageQuestStats,
        };

        const incomingBattle = merged.activeAdventure?.battleState || loadLiveBattleState();
        if (incomingBattle && merged.activeAdventure) {
          saveLiveBattleState(incomingBattle);
          setTimeout(() => {
            resumeBattleRef.current?.(incomingBattle);
          }, 0);
        } else if (merged.activeAdventure?.combatActive) {
          // Combate estava ativo na expedição mas o estado da batalha está ausente (aba fechada no meio do combate).
          // Computa Derrota em vez de permitir reiniciar a fase.
          setTimeout(() => {
            handleDefeat();
          }, 0);
        }

        progressRef.current = merged;
        setProgress(merged);
        savePlayerProgress(merged);
      } else {
        // Nova conta ou modo offline: preserva progresso local existente se houver
        const existingLocal = loadPlayerProgress();
        if (existingLocal && Array.isArray(existingLocal.unlockedClasses) && existingLocal.unlockedClasses.length > 0) {
          progressRef.current = existingLocal;
          setProgress(existingLocal);
          if (user.id !== 0) {
            await saveCloudProgress(existingLocal, true);
          }
        } else {
          const freshProgress: PlayerProgress = {
            ...DEFAULT_PROGRESS,
            unlockedClasses: [...INITIAL_CLASSES],
            selectedPartyClasses: [...INITIAL_CLASSES],
            unitsState: createInitialUnitsState(),
          };
          progressRef.current = freshProgress;
          setProgress(freshProgress);
          savePlayerProgress(freshProgress);
          if (user.id !== 0) {
            await saveCloudProgress(freshProgress, true);
          }
        }
      }
    } catch (err) {
      console.warn('Erro ao sincronizar progresso em nuvem:', err);
    }
  };

  useEffect(() => {
    fetchCurrentUser().then(async (user) => {
      if (user) {
        await syncUserCloudProgress(user);
      } else {
        const offlineSession = localStorage.getItem('kazcampaign_offline_mode');
        if (offlineSession === 'true') {
          await syncUserCloudProgress({ id: 0, username: 'Convidado' });
        } else {
          // Modo local sem login: se o combate estava ativo mas o estado da batalha se perdeu
          const localP = loadPlayerProgress();
          const liveB = loadLiveBattleState();
          if (localP.activeAdventure?.combatActive && !liveB) {
            handleDefeat();
          }
        }
      }
      setAuthChecked(true);
    });
  }, []);

  // Sincronização em tempo real de ouro e missões/linhagens vindo da nuvem
  useEffect(() => {
    const handleGoldSync = (e: Event) => {
      const custom = e as CustomEvent<{ gold: number }>;
      if (custom.detail && typeof custom.detail.gold === 'number') {
        setProgress((prev) => {
          if (prev.gold !== custom.detail.gold) {
            const next = { ...prev, gold: custom.detail.gold };
            progressRef.current = next;
            return next;
          }
          return prev;
        });
      }
    };

    const handleWindowFocus = async () => {
      if (!authUser || authUser.id === 0) return;
      try {
        const cloudP = await fetchCloudProgress();
        if (cloudP) {
          setProgress((prev) => {
            const missionAndLineage = mergeMissionAndLineageFields(prev, cloudP, true);
            const nextGold = typeof cloudP.gold === 'number' ? cloudP.gold : prev.gold;
            const updated: PlayerProgress = {
              ...prev,
              gold: nextGold,
              ...missionAndLineage,
            };
            progressRef.current = updated;
            try {
              localStorage.setItem('rpg_tactics_progress_v4', JSON.stringify(updated));
            } catch {
              // ignore
            }
            return updated;
          });
        }
      } catch {
        // ignore background fetch error
      }
    };

    window.addEventListener('kazcampaign_gold_sync', handleGoldSync);
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('kazcampaign_gold_sync', handleGoldSync);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [authUser]);

  const handleLogout = async () => {
    if (authUser && authUser.id !== 0) {
      try {
        await saveCloudProgress(progress);
      } catch (err) {
        console.warn('Erro ao sincronizar progresso em nuvem antes de sair:', err);
      }
    }
    clearLiveBattleState();
    logout();
    localStorage.removeItem('kazcampaign_offline_mode');
    setAuthUser(null);
    const cleanProgress = resetPlayerProgress();
    setProgress(cleanProgress);
    setCurrentView('level_select');
  };

  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(() => {
    const liveBattle = loadLiveBattleState();
    const loadedProg = loadPlayerProgress();
    if (liveBattle && loadedProg.activeAdventure) {
      return LEVELS.find((l) => l.id === liveBattle.levelId) || LEVELS[0];
    }
    return null;
  });
  const [grid, setGrid] = useState<TileData[][]>(() => {
    const liveBattle = loadLiveBattleState();
    const loadedProg = loadPlayerProgress();
    if (liveBattle && loadedProg.activeAdventure) {
      const lvlConfig = LEVELS.find((l) => l.id === liveBattle.levelId) || LEVELS[0];
      return lvlConfig.grid.map((row, y) =>
        row.map((cell, x) => ({
          x,
          y,
          terrain: cell.terrain,
          obstacle: cell.obstacle,
          isWalkable: cell.obstacle === 'none',
          blocksVision: cell.obstacle === 'wall' || cell.obstacle === 'ruins',
        }))
      );
    }
    return [];
  });
  const gridRef = useRef<TileData[][]>(grid);
  gridRef.current = grid;
  const [units, setUnits] = useState<Unit[]>(() => {
    const liveBattle = loadLiveBattleState();
    const loadedProg = loadPlayerProgress();
    if (liveBattle && loadedProg.activeAdventure && Array.isArray(liveBattle.units) && liveBattle.units.length > 0) {
      return liveBattle.units.map((u) => ({
        ...u,
        skills: u.skills.map((s) => {
          const base = SKILLS[s.id];
          const evolved = base ? getEvolvedSkill(base, s.level || 1) : s;
          const isHealing = evolved.damageType === 'healing' || evolved.id === 'cura' || evolved.id.includes('cura') || evolved.statusEffect?.type === 'shield';
          const isTaunt = evolved.statusEffect?.type === 'taunt' || evolved.secondaryStatusEffect?.type === 'taunt' || evolved.casterStatusEffect?.type === 'taunt';
          const isStun = evolved.statusEffect?.type === 'stun' || evolved.secondaryStatusEffect?.type === 'stun' || evolved.casterStatusEffect?.type === 'stun';
          let cd = Math.max(evolved.cooldownMax, s.cooldownMax || 0);
          if (isHealing) cd = Math.max(2, cd);
          if (isTaunt) cd = Math.max(3, cd);
          if (isStun) cd = Math.max(3, cd);
          return {
            ...evolved,
            currentCooldown: s.currentCooldown ?? 0,
            cooldownMax: cd,
          };
        }),
        statusEffects: (u.statusEffects || []).map((eff) => {
          if (eff.type === 'slow') return { ...eff, value: Math.min(3, eff.value || 1) };
          if (eff.type === 'excess_heal' || eff.type === 'excess_shield') return { ...eff, duration: Math.min(1, eff.duration) };
          if (eff.type === 'taunt') return { ...eff, duration: Math.min(1, eff.duration) };
          return eff;
        }),
      }));
    }
    return [];
  });
  const [turnNumber, setTurnNumber] = useState<number>(() => {
    const liveBattle = loadLiveBattleState();
    const loadedProg = loadPlayerProgress();
    if (liveBattle && loadedProg.activeAdventure) {
      return liveBattle.turnNumber || 1;
    }
    return 1;
  });
  const turnNumberRef = useRef<number>(turnNumber);
  turnNumberRef.current = turnNumber;
  const [phase, setPhase] = useState<BattlePhase>(() => {
    const liveBattle = loadLiveBattleState();
    const loadedProg = loadPlayerProgress();
    if (liveBattle && loadedProg.activeAdventure) {
      return liveBattle.phase === 'ai_turn' ? 'player_turn' : liveBattle.phase;
    }
    return 'deployment';
  });

  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<SelectedAction>('none');
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [targetUnitId, setTargetUnitId] = useState<string | null>(null);
  const [hoveredTile, setHoveredTile] = useState<Point | null>(null);
  const [damagePreview, setDamagePreview] = useState<DamagePreview | null>(null);
  const [targetTeleportPoint, setTargetTeleportPoint] = useState<Point | null>(null);
  const [targetAoEPoint, setTargetAoEPoint] = useState<Point | null>(null);

  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);

  const [showObjectives, setShowObjectives] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSecretRiddle, setShowSecretRiddle] = useState(false);
  const [riddleType, setRiddleType] = useState<'astaroth' | 'omnimago'>('astaroth');
  const [hasPedestalBeenStruck, setHasPedestalBeenStruck] = useState(false);
  const [activatedElementalCrystals, setActivatedElementalCrystals] = useState<string[]>([]);
  const [pendingStatChoices, setPendingStatChoices] = useState<{ unit: Unit; newLevel: number }[]>([]);
  const [pendingSkillChoices, setPendingSkillChoices] = useState<Unit[]>([]);
  const [pendingUnlockClasses, setPendingUnlockClasses] = useState<string[]>([]);
  const [pendingUnlockLineages, setPendingUnlockLineages] = useState<string[]>([]);
  const [activeBossBanner, setActiveBossBanner] = useState<{ name: string; subtitle: string; phase?: number } | null>(() => {
    const liveBattle = loadLiveBattleState();
    const loadedProg = loadPlayerProgress();
    if (liveBattle && loadedProg.activeAdventure) {
      return liveBattle.activeBossBanner || null;
    }
    return null;
  });

  const [waterTornadoActive, setWaterTornadoActive] = useState<boolean>(() => {
    const liveBattle = loadLiveBattleState();
    const loadedProg = loadPlayerProgress();
    if (liveBattle && loadedProg.activeAdventure) {
      return !!liveBattle.waterTornadoActive;
    }
    return false;
  });
  const [waterTornadoCenter, setWaterTornadoCenter] = useState<{ x: number; y: number } | null>(() => {
    const liveBattle = loadLiveBattleState();
    const loadedProg = loadPlayerProgress();
    if (liveBattle && loadedProg.activeAdventure) {
      return liveBattle.waterTornadoCenter || null;
    }
    return null;
  });

  const [victorySummary, setVictorySummary] = useState<LevelSummary | null>(null);

  // Flag to block input during animations
  const [isAnimatingAction, setIsAnimatingAction] = useState(false);

  useEffect(() => {
    soundManager.updateSettings(audioSettings);
    saveAudioSettings(audioSettings);
  }, [audioSettings]);

  const selectedUnit = units.find((u) => u.id === selectedUnitId) || null;
  const bossUnit = units.find((u) => u.isBoss || u.isMiniBoss) || null;

  // Start or resume a specific level within an adventure run
  const startLevel = (levelId: number, customUnitsState?: Record<string, UnitProgression>) => {
    const lvlConfig = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    setCurrentLevel(lvlConfig);

    // Auto-discover monsters for Bestiary
    const enemyMonsterTypeIds = lvlConfig.enemySpawns.map((s) => s.monsterTypeId);
    const prevDiscovered = progress.discoveredMonsterIds || [];
    const mergedDiscovered = Array.from(new Set([...prevDiscovered, ...enemyMonsterTypeIds]));
    if (mergedDiscovered.length !== prevDiscovered.length) {
      const updatedP = { ...progress, discoveredMonsterIds: mergedDiscovered };
      setProgress(updatedP);
      savePlayerProgress(updatedP);
    }

    const tileGrid: TileData[][] = lvlConfig.grid.map((row, y) =>
      row.map((cell, x) => ({
        x,
        y,
        terrain: cell.terrain,
        obstacle: cell.obstacle,
        isWalkable: cell.obstacle === 'none',
        blocksVision: cell.obstacle === 'wall' || cell.obstacle === 'ruins',
      }))
    );
    setGrid(tileGrid);

    const effectiveUnitsState =
      customUnitsState || progress.activeAdventure?.unitsState || progress.unitsState;

    const activeParty = progress.activeAdventure?.partyClasses || progress.selectedPartyClasses;
    const playerUnits: Unit[] = activeParty.map((cKey, idx) => {
      const uState = effectiveUnitsState[cKey];
      const spawnPt = lvlConfig.deploymentZone[idx] || { x: 3 + idx, y: 6 };
      const equippedItemIds: string[] = [];
      const charEquipment = progress.activeAdventure?.equipment?.[cKey];
      if (charEquipment) {
        Object.values(charEquipment).forEach((itemId) => {
          if (itemId) equippedItemIds.push(itemId);
        });
      }
      const heroLineageId = progress.activeAdventure?.partyLineages?.[cKey] || progress.selectedPartyLineages?.[cKey] || DEFAULT_CLASS_LINEAGES[cKey] || 'humano';
      const createdUnit = createPlayerUnit(
        cKey as any,
        `player_${cKey}`,
        spawnPt.x,
        spawnPt.y,
        uState ? uState.level : 1,
        uState ? uState.xp : 0,
        uState ? uState.bonusHp : 0,
        uState ? uState.bonusAtk : 0,
        uState ? uState.bonusDef : 0,
        uState ? uState.bonusMag || 0 : 0,
        uState ? uState.bonusRes || 0 : 0,
        uState ? uState.learnedSkillIds || [] : [],
        uState ? uState.skillLevels || {} : {},
        equippedItemIds,
        progress.itemUpgrades,
        getClassCumulativeBonus(cKey, progress.classUpgrades?.[cKey] || 0),
        getGlobalHeroBonus(progress),
        getEquippedSkin(cKey, progress.equippedClassSkins),
        heroLineageId
      );

      const equippedPet = getPetById(progress.equippedPetId);
      const petPassives = calculatePetPassives(equippedPet);
      if (petPassives.shieldStart > 0) {
        createdUnit.statusEffects.push({
          type: 'shield',
          duration: 99,
          value: petPassives.shieldStart,
        });
      }

      return createdUnit;
    });

    const enemyUnits: Unit[] = lvlConfig.enemySpawns.map((spawn, idx) =>
      createMonsterUnit(
        spawn.monsterTypeId as any,
        `enemy_${spawn.monsterTypeId}_${idx}`,
        spawn.x,
        spawn.y,
        spawn.levelOffset !== undefined ? spawn.levelOffset : Math.max(0, lvlConfig.id - 1)
      )
    );

    const initialUnits = [...playerUnits, ...enemyUnits];
    setUnits(initialUnits);
    setTurnNumber(1);
    setPhase('deployment');
    setSelectedUnitId(null);
    setSelectedAction('none');
    setActiveSkill(null);
    setActivePetSkill(null);
    setUsedPetSkillIds([]);
    setTargetUnitId(null);
    setDamagePreview(null);
    setFloatingNumbers([]);
    setIsAnimatingAction(false);
    setCurrentView('battle');

    setWaterTornadoActive(false);
    setWaterTornadoCenter(null);

    const bossFound = enemyUnits.find((u) => u.isBoss || u.isMiniBoss);
    let bannerObj: { name: string; subtitle: string; phase?: number } | null = null;
    if (bossFound) {
      bannerObj = {
        name: bossFound.name,
        subtitle: bossFound.isBoss
          ? `BOSS PODEROSO (FASE ${lvlConfig.id}) — ${lvlConfig.subtitle}`
          : `MINI BOSS (FASE ${lvlConfig.id}) — ${lvlConfig.subtitle}`,
        phase: 1,
      };
      setActiveBossBanner(bannerObj);
    } else {
      setActiveBossBanner(null);
    }

    const initialBattleState: ActiveBattleState = {
      levelId: lvlConfig.id,
      turnNumber: 1,
      phase: 'deployment',
      units: initialUnits,
      activeBossBanner: bannerObj,
    };
    saveLiveBattleState(initialBattleState, true);

    setProgress((prev) => {
      if (!prev.activeAdventure) return prev;
      const updatedAdventure = {
        ...prev.activeAdventure,
        currentLevelId: lvlConfig.id,
        combatActive: true,
        battleState: initialBattleState,
      };
      const updated = {
        ...prev,
        activeAdventure: updatedAdventure,
      };
      savePlayerProgress(updated);
      return updated;
    });

    soundManager.playSelect();
  };

  // Resume an active battle from where it was left off
  const resumeBattle = (savedBattle: ActiveBattleState) => {
    const lvlConfig = LEVELS.find((l) => l.id === savedBattle.levelId) || LEVELS[0];
    setCurrentLevel(lvlConfig);

    const tileGrid: TileData[][] = lvlConfig.grid.map((row, y) =>
      row.map((cell, x) => ({
        x,
        y,
        terrain: cell.terrain,
        obstacle: cell.obstacle,
        isWalkable: cell.obstacle === 'none',
        blocksVision: cell.obstacle === 'wall' || cell.obstacle === 'ruins',
      }))
    );
    setGrid(tileGrid);
    setUnits(
      savedBattle.units.map((u) => ({
        ...u,
        skills: u.skills.map((s) => {
          const base = SKILLS[s.id];
          const evolved = base ? getEvolvedSkill(base, s.level || 1) : s;
          const isHealing = evolved.damageType === 'healing' || evolved.id === 'cura' || evolved.id.includes('cura') || evolved.statusEffect?.type === 'shield';
          const isTaunt = evolved.statusEffect?.type === 'taunt' || evolved.secondaryStatusEffect?.type === 'taunt' || evolved.casterStatusEffect?.type === 'taunt';
          const isStun = evolved.statusEffect?.type === 'stun' || evolved.secondaryStatusEffect?.type === 'stun' || evolved.casterStatusEffect?.type === 'stun';
          let cd = Math.max(evolved.cooldownMax, s.cooldownMax || 0);
          if (isHealing) cd = Math.max(2, cd);
          if (isTaunt) cd = Math.max(3, cd);
          if (isStun) cd = Math.max(3, cd);
          return {
            ...evolved,
            currentCooldown: s.currentCooldown ?? 0,
            cooldownMax: cd,
          };
        }),
        statusEffects: (u.statusEffects || []).map((eff) => {
          if (eff.type === 'slow') return { ...eff, value: Math.min(3, eff.value || 1) };
          if (eff.type === 'excess_heal' || eff.type === 'excess_shield') return { ...eff, duration: Math.min(1, eff.duration) };
          if (eff.type === 'taunt') return { ...eff, duration: Math.min(1, eff.duration) };
          return eff;
        }),
      }))
    );
    setTurnNumber(savedBattle.turnNumber);
    setPhase(savedBattle.phase === 'ai_turn' ? 'player_turn' : savedBattle.phase);
    setActiveBossBanner(savedBattle.activeBossBanner || null);
    setWaterTornadoActive(!!savedBattle.waterTornadoActive);
    setWaterTornadoCenter(savedBattle.waterTornadoCenter || null);

    setSelectedUnitId(null);
    setSelectedAction('none');
    setActiveSkill(null);
    setTargetUnitId(null);
    setDamagePreview(null);
    setFloatingNumbers([]);
    setIsAnimatingAction(false);
    setCurrentView('battle');
    soundManager.playSelect();
  };
  resumeBattleRef.current = resumeBattle;

  // Start a fresh Adventure Run from Level 1
  const handleStartNewAdventure = () => {
    clearLiveBattleState();
    const initialUnits = createInitialUnitsState();
    const preservedDiscoveredItems = consolidateDiscoveredItems(
      progress.discoveredItemIds,
      progress.activeAdventure
    );
    // Starter Item meta-upgrade (Provisões de Expedição)
    const starterLvl = progress.generalUpgrades?.starterItem || 0;
    const initialInventory: string[] = [];
    if (starterLvl > 0) {
      const targetRarity = starterLvl === 1 ? 'common' : starterLvl === 2 ? 'rare' : 'epic';
      const bonusItem = getRandomItemByRarity(targetRarity);
      if (bonusItem) {
        initialInventory.push(bonusItem.id);
        if (!preservedDiscoveredItems.includes(bonusItem.id)) {
          preservedDiscoveredItems.push(bonusItem.id);
        }
      }
    }

    const newActiveAdv: ActiveAdventure = {
      currentLevelId: 1,
      startedAt: new Date().toISOString(),
      unitsState: initialUnits,
      partyClasses: progress.selectedPartyClasses,
      goldEarnedInRun: 0,
      inventory: initialInventory,
      equipment: {},
    };
    const updated: PlayerProgress = {
      ...progress,
      activeAdventure: newActiveAdv,
      unitsState: initialUnits,
      discoveredItemIds: preservedDiscoveredItems,
    };
    setProgress(updated);
    savePlayerProgress(updated);
    startLevel(1, initialUnits);
  };

  // Continue existing active adventure
  const handleContinueAdventure = () => {
    if (!progress.activeAdventure) {
      handleStartNewAdventure();
      return;
    }

    const savedBattle = loadLiveBattleState() || progress.activeAdventure.battleState;
    const isCombatActive = Boolean(progress.activeAdventure.combatActive);

    if (
      savedBattle &&
      savedBattle.levelId === progress.activeAdventure.currentLevelId &&
      Array.isArray(savedBattle.units) &&
      savedBattle.units.length > 0
    ) {
      resumeBattle(savedBattle);
    } else if (isCombatActive) {
      // O combate já havia sido iniciado nesta fase, mas o estado não está disponível
      // (ex: aba fechada ou tentativa de resetar). Computa Derrota em vez de reiniciar a fase do zero.
      handleDefeat();
    } else {
      startLevel(progress.activeAdventure.currentLevelId, progress.activeAdventure.unitsState);
    }
  };

  // Forfeit/Abandon current adventure
  const handleAbandonAdventure = () => {
    if (!progress.activeAdventure) return;
    clearLiveBattleState();
    const currentAdv = progress.activeAdventure;
    const record: AdventureRecord = {
      id: `adv_${Date.now()}`,
      startedAt: currentAdv.startedAt,
      endedAt: new Date().toISOString(),
      farthestLevel: currentAdv.currentLevelId,
      farthestLevelName:
        LEVELS.find((l) => l.id === currentAdv.currentLevelId)?.name ||
        `Fase ${currentAdv.currentLevelId}`,
      result: 'defeat',
      partyClasses: currentAdv.partyClasses,
      goldEarned: currentAdv.goldEarnedInRun,
    };
    const updatedHistory = [record, ...(progress.adventureHistory || [])].slice(0, 10);
    const initialUnits = createInitialUnitsState();
    const preservedDiscoveredItems = consolidateDiscoveredItems(
      progress.discoveredItemIds,
      currentAdv
    );
    const updated: PlayerProgress = {
      ...progress,
      activeAdventure: null,
      unitsState: initialUnits,
      adventureHistory: updatedHistory,
      discoveredItemIds: preservedDiscoveredItems,
    };
    setProgress(updated);
    savePlayerProgress(updated);
    if (authUserRef.current) {
      submitScore(currentAdv.currentLevelId, currentAdv.partyClasses).catch((err) =>
        console.error('Falha ao registrar no ranking:', err)
      );
    }
  };

  const handleBuyClass = (className: string, cost: number) => {
    if (progress.gold < cost) return;
    const currentUnlocked = progress.unlockedClasses || ['guerreiro', 'arqueiro', 'mago', 'curandeiro'];
    if (currentUnlocked.includes(className)) return;

    soundManager.playUpgrade();
    const updatedUnlocked = [...currentUnlocked, className];
    const newGold = progress.gold - cost;
    const updatedProgress: PlayerProgress = {
      ...progress,
      gold: newGold,
      unlockedClasses: updatedUnlocked,
    };
    setProgress(updatedProgress);
    savePlayerProgress(updatedProgress);
    setPendingUnlockClasses([className]);
  };

  const handleConfirmParty = (selectedPartyClasses: string[], partyLineages?: Record<string, string>) => {
    if (progress.activeAdventure) {
      // Bloqueia qualquer alteração de linhagens e classes no meio de uma aventura ativa
      setCurrentView('level_select');
      return;
    }
    const lineages = partyLineages || progress.selectedPartyLineages || {};
    const updatedProgress = {
      ...progress,
      selectedPartyClasses,
      selectedPartyLineages: lineages,
    };
    setProgress(updatedProgress);
    savePlayerProgress(updatedProgress);
    setCurrentView('level_select');
  };

  const handleConfirmDeployment = () => {
    setPhase('player_turn');
    setSelectedUnitId(null);
    soundManager.playTurnStart(true);
  };

  const handleStartDailyDungeon = () => {
    setShowDailyDungeonModal(false);
    const config = dailyDungeonConfig || generateDailyDungeonConfig();
    setDailyDungeonConfig(config);
    setDailyInventory([]);
    setDailyEquipment({});
    setShowDailyItemDraft(true);
  };

  const handleConfirmDailyItemDraft = (chosenItemIds: string[]) => {
    setShowDailyItemDraft(false);
    setIsDailyMode(true);
    setIsTrainingMode(false);
    setDailyInventory(chosenItemIds);
    setDailyEquipment({});

    const config = dailyDungeonConfig || generateDailyDungeonConfig();
    setDailyDungeonConfig(config);

    const lvlConfig = config.levelConfig;
    setCurrentLevel(lvlConfig);

    const tileGrid: TileData[][] = lvlConfig.grid.map((row: any, y: number) =>
      row.map((cell: any, x: number) => ({
        x,
        y,
        terrain: cell.terrain,
        obstacle: cell.obstacle,
        isWalkable: cell.obstacle === 'none',
        blocksVision: cell.obstacle === 'wall' || cell.obstacle === 'ruins' || cell.obstacle === 'pillar',
      }))
    );
    setGrid(tileGrid);

    const playerUnits: Unit[] = config.partyClasses.map((className: string, idx: number) => {
      const spawnPt = lvlConfig.deploymentZone[idx] || { x: 2 + idx * 2, y: 6 };
      const skillIds = config.heroSkills[className] || [];

      return createPlayerUnit(
        className as any,
        `daily_player_${className}_${idx}`,
        spawnPt.x,
        spawnPt.y,
        10, // Todos os heróis padronizados no Nível 10 na Fase Diária
        0, // xp
        0, 0, 0, 0, 0, // bonus stats
        skillIds,
        {},
        [], // Equipamentos inicialmente vazios; jogador equipa os 6 itens na implantação
        progress.itemUpgrades,
        getClassCumulativeBonus(className, progress.classUpgrades?.[className] || 0),
        getGlobalHeroBonus(progress),
        getEquippedSkin(className, progress.equippedClassSkins),
        progress.selectedPartyLineages?.[className] || DEFAULT_CLASS_LINEAGES[className] || 'humano'
      );
    });

    const enemyUnits: Unit[] = lvlConfig.enemySpawns.map((spawn: any, idx: number) => {
      const u = createMonsterUnit(
        spawn.monsterTypeId as any,
        `daily_enemy_${spawn.monsterTypeId}_${idx}`,
        spawn.x,
        spawn.y,
        spawn.levelOffset || 9,
        true // isDailyDungeon: padroniza status e habilidades para Nível 10
      );
      if (spawn.isBoss) {
        u.isBoss = true;
      }
      return u;
    });

    const initialUnits = [...playerUnits, ...enemyUnits];
    setUnits(initialUnits);
    setTurnNumber(1);
    setPhase('deployment');
    setSelectedUnitId(null);
    setSelectedAction('none');
    setActiveSkill(null);
    setActivePetSkill(null);
    setUsedPetSkillIds([]);
    setTargetUnitId(null);
    setDamagePreview(null);
    setFloatingNumbers([]);
    setIsAnimatingAction(false);
    setActiveBossBanner(null);
    setCurrentView('battle');
    setShowEquipment(true); // Abre o modal de equipamentos para o jogador distribuir os 6 itens nos heróis
    soundManager.playTurnStart(true);
  };

  const handleExitDailyDungeon = () => {
    soundManager.playSelect();
    setIsDailyMode(false);
    setShowDailyItemDraft(false);
    setDailyInventory([]);
    setDailyEquipment({});
    setCurrentView('level_select');
  };

  const handleStartTraining = (config: TrainingModeConfig) => {
    setShowTrainingModal(false);
    setIsTrainingMode(true);
    setTrainingConfig(config);
    setTrainingDamageStats({ totalDamage: 0, highestHit: 0, hitCount: 0 });

    const lvlConfig = createTrainingLevel(config.dummySetup);
    setCurrentLevel(lvlConfig);

    const tileGrid: TileData[][] = lvlConfig.grid.map((row, y) =>
      row.map((cell, x) => ({
        x,
        y,
        terrain: cell.terrain,
        obstacle: cell.obstacle,
        isWalkable: cell.obstacle === 'none',
        blocksVision: cell.obstacle === 'wall' || cell.obstacle === 'ruins' || cell.obstacle === 'pillar',
      }))
    );
    setGrid(tileGrid);

    // Build player units with chosen class and level
    const playerUnits: Unit[] = config.partyClasses.map((className, idx) => {
      const def = CLASS_DEFINITIONS[className] || CLASS_DEFINITIONS['guerreiro'];
      const spawnPt = lvlConfig.deploymentZone[idx] || { x: 3 + idx, y: 6 };

      const learnable = [
        ...(CLASS_LEARNABLE_SKILL_IDS[className] || []),
        ...(CLASS_MISSION_REWARD_SKILLS[className] || []),
      ];
      let learnedIds: string[] = [];
      let skillLevels: Record<string, number> = {};

      if (config.customSkills && config.customSkills[className]) {
        learnedIds = config.customSkills[className];
      } else if (config.heroLevel >= 20) {
        learnedIds = learnable.slice(0, 4);
      } else if (config.heroLevel >= 10) {
        learnedIds = learnable.slice(0, 4);
      } else if (config.heroLevel >= 5) {
        learnedIds = learnable.slice(0, 2);
      }

      if (config.heroLevel >= 20) {
        skillLevels = { [def.baseSkillId]: 3 };
        learnedIds.forEach((id) => {
          skillLevels[id] = 3;
        });
      }

      return createPlayerUnit(
        className as any,
        `training_player_${className}_${idx}`,
        spawnPt.x,
        spawnPt.y,
        config.heroLevel,
        0, // xp
        0, 0, 0, 0, 0, // bonus stats
        learnedIds,
        skillLevels
      );
    });

    const enemyUnits: Unit[] = lvlConfig.enemySpawns.map((spawn, idx) =>
      createMonsterUnit(
        spawn.monsterTypeId as any,
        `enemy_${spawn.monsterTypeId}_${idx}`,
        spawn.x,
        spawn.y,
        0
      )
    );

    const initialUnits = [...playerUnits, ...enemyUnits];
    setUnits(initialUnits);
    setTurnNumber(1);
    setPhase('deployment');
    setSelectedUnitId(null);
    setSelectedAction('none');
    setActiveSkill(null);
    setActivePetSkill(null);
    setUsedPetSkillIds([]);
    setTargetUnitId(null);
    setDamagePreview(null);
    setFloatingNumbers([]);
    setIsAnimatingAction(false);
    setActiveBossBanner(null);
    setCurrentView('battle');
    soundManager.playSelect();
  };

  const handleResetTrainingCooldowns = () => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.faction === 'player') {
          return {
            ...u,
            skills: u.skills.map((s) => ({ ...s, currentCooldown: 0 })),
          };
        }
        return u;
      })
    );
    soundManager.playUpgrade();
    addFloatingNumber(4, 6, '⚡ Recargas Zeradas!', 'status', '#FACC15');
  };

  const handleSaveLiveTrainingSkills = (className: string, newSkillIds: string[]) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.faction === 'player' && u.className === className) {
          const def = CLASS_DEFINITIONS[u.className] || CLASS_DEFINITIONS['guerreiro'];
          const skillListIds = Array.from(new Set([def.baseSkillId, ...newSkillIds])).slice(0, 5);
          const skLvl = u.level >= 20 ? 3 : 1;
          const updatedSkills = skillListIds
            .map((id) => SKILLS[id])
            .filter(Boolean)
            .map((sk) => {
              const evolved = getEvolvedSkill(sk, skLvl);
              return { ...evolved, currentCooldown: 0 };
            });
          return {
            ...u,
            skills: updatedSkills,
          };
        }
        return u;
      })
    );
    if (trainingConfig) {
      setTrainingConfig((prev) =>
        prev
          ? {
              ...prev,
              customSkills: {
                ...(prev.customSkills || {}),
                [className]: newSkillIds,
              },
            }
          : prev
      );
    }
    soundManager.playUpgrade();
    addFloatingNumber(4, 2, '✨ Habilidades Atualizadas!', 'status', '#10B981');
  };

  const handleHealTrainingTeam = () => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.faction === 'player') {
          return {
            ...u,
            currentHp: u.maxHp,
            isDead: false,
            statusEffects: [],
          };
        }
        return u;
      })
    );
    soundManager.playHeal();
    addFloatingNumber(4, 6, '💚 Equipe Curada!', 'healing', '#10B981');
  };

  const handleResetTrainingDummies = () => {
    if (!trainingConfig) return;
    const lvlConfig = createTrainingLevel(trainingConfig.dummySetup);
    const freshDummies: Unit[] = lvlConfig.enemySpawns.map((spawn, idx) =>
      createMonsterUnit(
        spawn.monsterTypeId as any,
        `enemy_${spawn.monsterTypeId}_${idx}_${Date.now()}`,
        spawn.x,
        spawn.y,
        0
      )
    );
    setUnits((prev) => [...prev.filter((u) => u.faction === 'player'), ...freshDummies]);
    soundManager.playShield();
    addFloatingNumber(4, 2, '🔄 Bonecos Reiniciados!', 'status', '#38BDF8');
  };

  const handleExitTraining = () => {
    soundManager.playSelect();
    setIsTrainingMode(false);
    setTrainingConfig(null);
    setCurrentView('level_select');
  };

  // Auto-salva continuamente o estado da batalha em andamento sempre que houver qualquer alteração
  useEffect(() => {
    if (
      isTrainingMode ||
      isDailyMode ||
      currentView !== 'battle' ||
      !currentLevel ||
      phase === 'victory' ||
      phase === 'defeat' ||
      units.length === 0 ||
      !progress.activeAdventure
    ) {
      return;
    }

    const bState: ActiveBattleState = {
      levelId: currentLevel.id,
      turnNumber,
      phase,
      units,
      activeBossBanner,
      waterTornadoActive,
      waterTornadoCenter,
    };

    saveLiveBattleState(bState);
  }, [currentView, currentLevel, turnNumber, phase, units, activeBossBanner, progress.activeAdventure, isTrainingMode, waterTornadoActive, waterTornadoCenter]);

  // Garante persistência síncrona antes do recarregamento da página (F5) ou fechamento de aba
  useEffect(() => {
    const handleUnloadOrHide = () => {
      if (
        !isTrainingMode &&
        !isDailyMode &&
        currentView === 'battle' &&
        currentLevel &&
        phase !== 'victory' &&
        phase !== 'defeat' &&
        units.length > 0 &&
        progress.activeAdventure
      ) {
        saveLiveBattleState(
          {
            levelId: currentLevel.id,
            turnNumber,
            phase,
            units,
            activeBossBanner,
            waterTornadoActive,
            waterTornadoCenter,
          },
          true,
          true
        );
      }
    };
    window.addEventListener('beforeunload', handleUnloadOrHide);
    window.addEventListener('pagehide', handleUnloadOrHide);
    return () => {
      window.removeEventListener('beforeunload', handleUnloadOrHide);
      window.removeEventListener('pagehide', handleUnloadOrHide);
    };
  }, [currentView, currentLevel, turnNumber, phase, units, activeBossBanner, progress.activeAdventure, isTrainingMode, waterTornadoActive, waterTornadoCenter]);

  const handleResetProgress = () => {
    clearLiveBattleState();
    const fresh = resetPlayerProgress();
    setProgress(fresh);
    setCurrentView('level_select');
  };

  const handleSelectLootItem = (item: ItemDefinition | null) => {
    if (item) {
      setProgress((prev) => {
        const prevDiscovered = prev.discoveredItemIds || [];
        const nextDiscovered = prevDiscovered.includes(item.id)
          ? prevDiscovered
          : [...prevDiscovered, item.id];

        if (!prev.activeAdventure) {
          const next: PlayerProgress = { ...prev, discoveredItemIds: nextDiscovered };
          savePlayerProgress(next);
          return next;
        }

        const currentInv = prev.activeAdventure.inventory || [];
        const updatedAdv: ActiveAdventure = {
          ...prev.activeAdventure,
          inventory: [...currentInv, item.id],
        };
        const next: PlayerProgress = {
          ...prev,
          activeAdventure: updatedAdv,
          discoveredItemIds: nextDiscovered,
        };
        savePlayerProgress(next);
        return next;
      });
    }
    setPendingLootItems(null);
  };

  const handleEquipItem = (heroClass: string, itemId: string, inventoryIndex?: number) => {
    const item = getItemById(itemId);
    if (!item) return;
    const category = item.category;
    let nextHeroEquip: EquipmentSlots = {};
    setProgress((prev) => {
      const prevDiscovered = prev.discoveredItemIds || [];
      const nextDiscovered = prevDiscovered.includes(itemId)
        ? prevDiscovered
        : [...prevDiscovered, itemId];

      if (!prev.activeAdventure) {
        const nextP: PlayerProgress = { ...prev, discoveredItemIds: nextDiscovered };
        savePlayerProgress(nextP);
        return nextP;
      }
      const currentAdv = prev.activeAdventure;
      const currentEquipment = { ...(currentAdv.equipment || {}) };
      const heroEquip = { ...(currentEquipment[heroClass] || {}) };
      const currentInventory = [...(currentAdv.inventory || [])];

      const oldItemId = heroEquip[category];
      if (oldItemId) {
        currentInventory.push(oldItemId);
      }

      const itemIdx =
        inventoryIndex !== undefined &&
        inventoryIndex >= 0 &&
        inventoryIndex < currentInventory.length &&
        currentInventory[inventoryIndex] === itemId
          ? inventoryIndex
          : currentInventory.indexOf(itemId);

      if (itemIdx >= 0) {
        currentInventory.splice(itemIdx, 1);
      }

      heroEquip[category] = itemId;
      nextHeroEquip = heroEquip;
      currentEquipment[heroClass] = heroEquip;

      const updatedAdv: ActiveAdventure = {
        ...currentAdv,
        inventory: currentInventory,
        equipment: currentEquipment,
      };
      const nextP: PlayerProgress = {
        ...prev,
        activeAdventure: updatedAdv,
        discoveredItemIds: nextDiscovered,
      };
      savePlayerProgress(nextP);
      return nextP;
    });

    setUnits((prevUnits) =>
      prevUnits.map((u) => {
        if (u.className !== heroClass || u.faction !== 'player') return u;
        const uState = progress.activeAdventure?.unitsState[heroClass] || progress.unitsState[heroClass];
        const equippedIds: string[] = Object.values(nextHeroEquip).filter((id): id is string => Boolean(id));
        const recomputed = createPlayerUnit(
          heroClass as any,
          u.id,
          u.x,
          u.y,
          uState ? uState.level : 1,
          uState ? uState.xp : 0,
          uState ? uState.bonusHp : 0,
          uState ? uState.bonusAtk : 0,
          uState ? uState.bonusDef : 0,
          uState ? uState.bonusMag || 0 : 0,
          uState ? uState.bonusRes || 0 : 0,
          uState ? uState.learnedSkillIds || [] : [],
          uState ? uState.skillLevels || {} : {},
          equippedIds,
          progress.itemUpgrades,
          getClassCumulativeBonus(heroClass, progress.classUpgrades?.[heroClass] || 0),
          getGlobalHeroBonus(progress),
          getEquippedSkin(heroClass, progress.equippedClassSkins),
          progress.activeAdventure?.partyLineages?.[heroClass] || progress.selectedPartyLineages?.[heroClass] || DEFAULT_CLASS_LINEAGES[heroClass] || 'humano'
        );
        const hpDiff = recomputed.maxHp - u.maxHp;
        return {
          ...recomputed,
          currentHp: Math.min(recomputed.maxHp, Math.max(1, u.currentHp + hpDiff)),
          hasMoved: u.hasMoved,
          hasAttacked: u.hasAttacked,
        };
      })
    );
  };

  const handleUnequipItem = (heroClass: string, category: ItemCategory) => {
    let nextHeroEquip: EquipmentSlots = {};
    setProgress((prev) => {
      if (!prev.activeAdventure) return prev;
      const currentAdv = prev.activeAdventure;
      const currentEquipment = { ...(currentAdv.equipment || {}) };
      const heroEquip = { ...(currentEquipment[heroClass] || {}) };
      const oldItemId = heroEquip[category];
      if (!oldItemId) return prev;

      delete heroEquip[category];
      nextHeroEquip = heroEquip;
      currentEquipment[heroClass] = heroEquip;

      const currentInventory = [...(currentAdv.inventory || []), oldItemId];

      const updatedAdv: ActiveAdventure = {
        ...currentAdv,
        inventory: currentInventory,
        equipment: currentEquipment,
      };
      const nextP: PlayerProgress = {
        ...prev,
        activeAdventure: updatedAdv,
      };
      savePlayerProgress(nextP);
      return nextP;
    });

    setUnits((prevUnits) =>
      prevUnits.map((u) => {
        if (u.className !== heroClass || u.faction !== 'player') return u;
        const uState = progress.activeAdventure?.unitsState[heroClass] || progress.unitsState[heroClass];
        const equippedIds: string[] = Object.values(nextHeroEquip).filter((id): id is string => Boolean(id));
        const recomputed = createPlayerUnit(
          heroClass as any,
          u.id,
          u.x,
          u.y,
          uState ? uState.level : 1,
          uState ? uState.xp : 0,
          uState ? uState.bonusHp : 0,
          uState ? uState.bonusAtk : 0,
          uState ? uState.bonusDef : 0,
          uState ? uState.bonusMag || 0 : 0,
          uState ? uState.bonusRes || 0 : 0,
          uState ? uState.learnedSkillIds || [] : [],
          uState ? uState.skillLevels || {} : {},
          equippedIds,
          progress.itemUpgrades,
          getClassCumulativeBonus(heroClass, progress.classUpgrades?.[heroClass] || 0),
          getGlobalHeroBonus(progress),
          getEquippedSkin(heroClass, progress.equippedClassSkins)
        );
        return {
          ...recomputed,
          currentHp: Math.min(recomputed.maxHp, u.currentHp),
          hasMoved: u.hasMoved,
          hasAttacked: u.hasAttacked,
        };
      })
    );
  };

  // Gerenciamento de Equipamentos exclusivo da Fase Diária (isolado da Aventura)
  const handleEquipDailyItem = (heroClass: string, itemId: string, inventoryIndex?: number) => {
    const item = getItemById(itemId);
    if (!item) return;
    const category = item.category;

    const currentInventory = [...dailyInventory];
    const currentEquipment = { ...dailyEquipment };
    const heroEquip = { ...(currentEquipment[heroClass] || {}) };

    const oldItemId = heroEquip[category];
    if (oldItemId) {
      currentInventory.push(oldItemId);
    }

    const itemIdx =
      inventoryIndex !== undefined &&
      inventoryIndex >= 0 &&
      inventoryIndex < currentInventory.length &&
      currentInventory[inventoryIndex] === itemId
        ? inventoryIndex
        : currentInventory.indexOf(itemId);

    if (itemIdx >= 0) {
      currentInventory.splice(itemIdx, 1);
    }

    heroEquip[category] = itemId;
    currentEquipment[heroClass] = heroEquip;

    setDailyInventory(currentInventory);
    setDailyEquipment(currentEquipment);

    // Atualiza imediatamente a unidade no tabuleiro
    setUnits((prevUnits) =>
      prevUnits.map((u) => {
        if (u.className !== heroClass || u.faction !== 'player') return u;
        const skillIds = dailyDungeonConfig?.heroSkills[heroClass] || u.skills.map((s) => s.id);
        const equippedIds = Object.values(heroEquip).filter((id): id is string => Boolean(id));
        const recomputed = createPlayerUnit(
          heroClass as any,
          u.id,
          u.x,
          u.y,
          10,
          0,
          0, 0, 0, 0, 0,
          skillIds,
          {},
          equippedIds,
          progress.itemUpgrades,
          getClassCumulativeBonus(heroClass, progress.classUpgrades?.[heroClass] || 0),
          getGlobalHeroBonus(progress),
          getEquippedSkin(heroClass, progress.equippedClassSkins),
          progress.selectedPartyLineages?.[heroClass] || DEFAULT_CLASS_LINEAGES[heroClass] || 'humano'
        );
        const hpDiff = recomputed.maxHp - u.maxHp;
        return {
          ...recomputed,
          currentHp: Math.min(recomputed.maxHp, Math.max(1, u.currentHp + hpDiff)),
          hasMoved: u.hasMoved,
          hasAttacked: u.hasAttacked,
        };
      })
    );
  };

  const handleUnequipDailyItem = (heroClass: string, category: ItemCategory) => {
    const currentEquipment = { ...dailyEquipment };
    const heroEquip = { ...(currentEquipment[heroClass] || {}) };

    const oldItemId = heroEquip[category];
    if (!oldItemId) return;

    delete heroEquip[category];
    currentEquipment[heroClass] = heroEquip;

    const currentInventory = [...dailyInventory, oldItemId];
    setDailyInventory(currentInventory);
    setDailyEquipment(currentEquipment);

    setUnits((prevUnits) =>
      prevUnits.map((u) => {
        if (u.className !== heroClass || u.faction !== 'player') return u;
        const skillIds = dailyDungeonConfig?.heroSkills[heroClass] || u.skills.map((s) => s.id);
        const equippedIds = Object.values(heroEquip).filter((id): id is string => Boolean(id));
        const recomputed = createPlayerUnit(
          heroClass as any,
          u.id,
          u.x,
          u.y,
          10,
          0,
          0, 0, 0, 0, 0,
          skillIds,
          {},
          equippedIds,
          progress.itemUpgrades,
          getClassCumulativeBonus(heroClass, progress.classUpgrades?.[heroClass] || 0),
          getGlobalHeroBonus(progress),
          getEquippedSkin(heroClass, progress.equippedClassSkins),
          progress.selectedPartyLineages?.[heroClass] || DEFAULT_CLASS_LINEAGES[heroClass] || 'humano'
        );
        const hpDiff = recomputed.maxHp - u.maxHp;
        return {
          ...recomputed,
          currentHp: Math.min(recomputed.maxHp, Math.max(1, u.currentHp + hpDiff)),
          hasMoved: u.hasMoved,
          hasAttacked: u.hasAttacked,
        };
      })
    );
  };

  const dailyUnitsState = useMemo<Record<string, UnitProgression>>(() => {
    if (!dailyDungeonConfig) return {};
    const map: Record<string, UnitProgression> = {};
    for (const c of dailyDungeonConfig.partyClasses || []) {
      map[c] = {
        className: c,
        level: 10,
        xp: 0,
        bonusHp: 0,
        bonusAtk: 0,
        bonusDef: 0,
        bonusMag: 0,
        bonusRes: 0,
        learnedSkillIds: dailyDungeonConfig.heroSkills?.[c] || [],
      };
    }
    return map;
  }, [dailyDungeonConfig]);

  const handleToggleSpeed = () => {
    const nextSpeed: 'normal' | 'fast' = progress.combatSpeed === 'normal' ? 'fast' : 'normal';
    const updated: PlayerProgress = { ...progress, combatSpeed: nextSpeed };
    setProgress(updated);
    savePlayerProgress(updated);
  };

  const handleUpgradeClass = (className: string) => {
    const currentLvl = progress.classUpgrades?.[className] || 0;
    if (currentLvl >= MAX_CLASS_UPGRADE_LEVEL) return;
    const cost = CLASS_UPGRADE_COSTS[currentLvl];
    if (progress.gold < cost) return;

    const nextLvl = currentLvl + 1;
    const updatedClassUpgrades = {
      ...(progress.classUpgrades || {}),
      [className]: nextLvl,
    };
    const nextP: PlayerProgress = {
      ...progress,
      gold: progress.gold - cost,
      classUpgrades: updatedClassUpgrades,
    };
    setProgress(nextP);
    savePlayerProgress(nextP);

    // Update in-battle player units for this class if any
    setUnits((prevUnits) =>
      prevUnits.map((u) => {
        if (u.className !== className || u.faction !== 'player') return u;
        const uState = progress.activeAdventure?.unitsState[className] || progress.unitsState[className];
        const charEquipment = progress.activeAdventure?.equipment?.[className];
        const equippedIds: string[] = charEquipment
          ? Object.values(charEquipment).filter((id): id is string => Boolean(id))
          : [];
        const recomputed = createPlayerUnit(
          className as any,
          u.id,
          u.x,
          u.y,
          uState ? uState.level : 1,
          uState ? uState.xp : 0,
          uState ? uState.bonusHp : 0,
          uState ? uState.bonusAtk : 0,
          uState ? uState.bonusDef : 0,
          uState ? uState.bonusMag || 0 : 0,
          uState ? uState.bonusRes || 0 : 0,
          uState ? uState.learnedSkillIds || [] : [],
          uState ? uState.skillLevels || {} : {},
          equippedIds,
          nextP.itemUpgrades,
          getClassCumulativeBonus(className, nextLvl),
          getGlobalHeroBonus(nextP),
          getEquippedSkin(className, nextP.equippedClassSkins)
        );
        const hpDiff = recomputed.maxHp - u.maxHp;
        return {
          ...recomputed,
          currentHp: Math.min(recomputed.maxHp, Math.max(1, u.currentHp + hpDiff)),
          hasMoved: u.hasMoved,
          hasAttacked: u.hasAttacked,
        };
      })
    );
  };

  const handleUpgradeGeneral = (upgradeId: string) => {
    const upgradeDef = GENERAL_UPGRADES[upgradeId];
    if (!upgradeDef) return;
    const currentLvl = progress.generalUpgrades?.[upgradeId] || 0;
    if (currentLvl >= upgradeDef.maxLevel) return;
    const nextTier = upgradeDef.tiers[currentLvl];
    if (!nextTier || progress.gold < nextTier.cost) return;

    const nextLvl = currentLvl + 1;
    const updatedGeneralUpgrades = {
      ...(progress.generalUpgrades || {}),
      [upgradeId]: nextLvl,
    };
    const nextP: PlayerProgress = {
      ...progress,
      gold: progress.gold - nextTier.cost,
      generalUpgrades: updatedGeneralUpgrades,
    };
    setProgress(nextP);
    savePlayerProgress(nextP);

    if (upgradeId === 'globalHp') {
      setUnits((prevUnits) =>
        prevUnits.map((u) => {
          if (u.faction !== 'player') return u;
          const uState = progress.activeAdventure?.unitsState[u.className] || progress.unitsState[u.className];
          const charEquipment = progress.activeAdventure?.equipment?.[u.className];
          const equippedIds: string[] = charEquipment
            ? Object.values(charEquipment).filter((id): id is string => Boolean(id))
            : [];
          const recomputed = createPlayerUnit(
            u.className as any,
            u.id,
            u.x,
            u.y,
            uState ? uState.level : 1,
            uState ? uState.xp : 0,
            uState ? uState.bonusHp : 0,
            uState ? uState.bonusAtk : 0,
            uState ? uState.bonusDef : 0,
            uState ? uState.bonusMag || 0 : 0,
            uState ? uState.bonusRes || 0 : 0,
            uState ? uState.learnedSkillIds || [] : [],
            uState ? uState.skillLevels || {} : {},
            equippedIds,
            nextP.itemUpgrades,
            getClassCumulativeBonus(u.className, nextP.classUpgrades?.[u.className] || 0),
            getGlobalHeroBonus(nextP),
            getEquippedSkin(u.className, nextP.equippedClassSkins)
          );
          const hpDiff = recomputed.maxHp - u.maxHp;
          return {
            ...recomputed,
            currentHp: Math.min(recomputed.maxHp, Math.max(1, u.currentHp + hpDiff)),
            hasMoved: u.hasMoved,
            hasAttacked: u.hasAttacked,
          };
        })
      );
    }
  };

  const handleUpgradeItem = (itemId: string) => {
    const item = getItemById(itemId);
    if (!item) return;
    const currentLvl = progress.itemUpgrades?.[itemId] || 0;
    if (currentLvl >= MAX_ITEM_ENHANCEMENT_LEVEL) return;
    const cost = getItemUpgradeCost(item.rarity, currentLvl);
    if (cost === null || progress.gold < cost) return;

    const nextLvl = currentLvl + 1;
    const updatedItemUpgrades = {
      ...(progress.itemUpgrades || {}),
      [itemId]: nextLvl,
    };
    const nextP: PlayerProgress = {
      ...progress,
      gold: progress.gold - cost,
      itemUpgrades: updatedItemUpgrades,
    };
    setProgress(nextP);
    savePlayerProgress(nextP);

    setUnits((prevUnits) =>
      prevUnits.map((u) => {
        if (u.faction !== 'player') return u;
        const charEquipment = progress.activeAdventure?.equipment?.[u.className];
        const equippedIds: string[] = charEquipment
          ? Object.values(charEquipment).filter((id): id is string => Boolean(id))
          : [];
        if (!equippedIds.includes(itemId)) return u;

        const uState = progress.activeAdventure?.unitsState[u.className] || progress.unitsState[u.className];
        const recomputed = createPlayerUnit(
          u.className as any,
          u.id,
          u.x,
          u.y,
          uState ? uState.level : 1,
          uState ? uState.xp : 0,
          uState ? uState.bonusHp : 0,
          uState ? uState.bonusAtk : 0,
          uState ? uState.bonusDef : 0,
          uState ? uState.bonusMag || 0 : 0,
          uState ? uState.bonusRes || 0 : 0,
          uState ? uState.learnedSkillIds || [] : [],
          uState ? uState.skillLevels || {} : {},
          equippedIds,
          updatedItemUpgrades,
          getClassCumulativeBonus(u.className, nextP.classUpgrades?.[u.className] || 0),
          getGlobalHeroBonus(nextP),
          getEquippedSkin(u.className, nextP.equippedClassSkins)
        );
        const hpDiff = recomputed.maxHp - u.maxHp;
        return {
          ...recomputed,
          currentHp: Math.min(recomputed.maxHp, Math.max(1, u.currentHp + hpDiff)),
          hasMoved: u.hasMoved,
          hasAttacked: u.hasAttacked,
        };
      })
    );
  };

  const addFloatingNumber = (x: number, y: number, value: string | number, type: FloatingNumber['type'], color: string) => {
    const newFn: FloatingNumber = { id: `fn_${Date.now()}_${Math.random()}`, x, y, value, type, color };
    setFloatingNumbers((prev) => [...prev, newFn]);
    setTimeout(() => setFloatingNumbers((prev) => prev.filter((item) => item.id !== newFn.id)), 1200);
  };

  const reachableTiles: Point[] = React.useMemo(() => {
    if (
      !selectedUnit ||
      phase !== 'player_turn' ||
      selectedUnit.faction !== 'player' ||
      selectedUnit.hasMoved ||
      isAnimatingAction ||
      selectedUnit.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0)
    )
      return [];
    if (selectedAction === 'move') return getReachableTiles(selectedUnit, grid, units);
    return [];
  }, [selectedUnit, phase, selectedAction, grid, units, isAnimatingAction]);

  const attackableTiles: Point[] = React.useMemo(() => {
    if (activePetSkill) {
      if (phase !== 'player_turn' || isAnimatingAction) return [];
      const livingAllies = units.filter((u) => u.faction === 'player' && !u.isDead);
      const targetSet = new Set<string>();
      const result: Point[] = [];
      livingAllies.forEach((ally) => {
        const tiles = getAttackableTiles(
          { x: ally.x, y: ally.y },
          activePetSkill.rangeMin,
          activePetSkill.rangeMax,
          grid[0]?.length || 0,
          grid.length
        );
        tiles.forEach((pt) => {
          const key = `${pt.x},${pt.y}`;
          if (!targetSet.has(key)) {
            targetSet.add(key);
            result.push(pt);
          }
        });
      });
      return result;
    }
    if (
      !selectedUnit ||
      phase !== 'player_turn' ||
      selectedUnit.faction !== 'player' ||
      selectedUnit.hasAttacked ||
      isAnimatingAction ||
      selectedUnit.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0)
    )
      return [];
    if (activeSkill && (activeSkill.isTeleport || activeSkill.targetType === 'empty_tile')) {
      const rangeMin = activeSkill.rangeMin;
      const rangeMax = activeSkill.rangeMax;
      const candidates = getAttackableTiles({ x: selectedUnit.x, y: selectedUnit.y }, rangeMin, rangeMax, grid[0]?.length || 0, grid.length);
      return candidates.filter((pt) => {
        const isWalkable = grid[pt.y]?.[pt.x]?.isWalkable;
        const isOccupied = units.some((u) => !u.isDead && u.x === pt.x && u.y === pt.y);
        return isWalkable && !isOccupied;
      });
    }
    if (activeSkill && (activeSkill.targetType === 'corpse' || activeSkill.summonType === 'corpse_skeleton')) {
      const rangeMin = activeSkill.rangeMin;
      const rangeMax = activeSkill.rangeMax;
      const candidates = getAttackableTiles({ x: selectedUnit.x, y: selectedUnit.y }, rangeMin, rangeMax, grid[0]?.length || 0, grid.length);
      return candidates.filter((pt) => {
        const isWalkable = grid[pt.y]?.[pt.x]?.isWalkable;
        const hasCorpse = units.some((u) => u.faction === 'enemy' && u.isDead && !u.corpseConsumed && u.x === pt.x && u.y === pt.y);
        const isOccupiedByLiving = units.some((u) => !u.isDead && u.x === pt.x && u.y === pt.y);
        return isWalkable && hasCorpse && !isOccupiedByLiving;
      });
    }
    if (selectedAction === 'attack' || activeSkill) {
      const rangeMin = activeSkill ? activeSkill.rangeMin : 1;
      const rangeMax = activeSkill ? activeSkill.rangeMax : selectedUnit.range;
      return getAttackableTiles({ x: selectedUnit.x, y: selectedUnit.y }, rangeMin, rangeMax, grid[0].length, grid.length);
    }
    return [];
  }, [selectedUnit, phase, selectedAction, activeSkill, activePetSkill, grid, units, isAnimatingAction]);

  const aoeTiles: Point[] = React.useMemo(() => {
    if (activePetSkill && activePetSkill.aoeRadius > 0) {
      const aoeType = activePetSkill.aoeType || 'circle';
      if (hoveredTile && attackableTiles.some((pt) => pt.x === hoveredTile.x && pt.y === hoveredTile.y)) {
        return getAoETiles(hoveredTile, activePetSkill.aoeRadius, grid[0].length, grid.length, aoeType, null);
      }
      return [];
    }
    if (!activeSkill || activeSkill.aoeRadius === 0) return [];
    const aoeType = activeSkill.aoeType || 'circle';
    const origin = selectedUnit ? { x: selectedUnit.x, y: selectedUnit.y } : null;

    if (targetAoEPoint) {
      return getAoETiles(targetAoEPoint, activeSkill.aoeRadius, grid[0].length, grid.length, aoeType, origin);
    }
    const targetUnit = targetUnitId ? units.find((u) => u.id === targetUnitId) : null;
    if (targetUnit) {
      return getAoETiles({ x: targetUnit.x, y: targetUnit.y }, activeSkill.aoeRadius, grid[0].length, grid.length, aoeType, origin);
    }
    if (hoveredTile && attackableTiles.some((pt) => pt.x === hoveredTile.x && pt.y === hoveredTile.y)) {
      return getAoETiles(hoveredTile, activeSkill.aoeRadius, grid[0].length, grid.length, aoeType, origin);
    }
    return [];
  }, [activeSkill, activePetSkill, hoveredTile, targetUnitId, targetAoEPoint, units, grid, attackableTiles, selectedUnit]);

  // Handle Defeat: resets adventure progress to 0, archives run to history, keeps gold & unlocked classes
  const handleDefeat = useCallback(() => {
    clearLiveBattleState();
    setPhase('defeat');
    soundManager.playDefeat();

    if (isDailyMode) {
      setProgress((prev) => {
        const prevStats = prev.lineageQuestStats || {};
        if ((prevStats.noHealerWins || 0) > 0 && (prevStats.noHealerWins || 0) < 15) {
          const next = {
            ...prev,
            lineageQuestStats: { ...prevStats, noHealerWins: 0 },
          };
          progressRef.current = next;
          savePlayerProgress(next);
          return next;
        }
        return prev;
      });
      return;
    }

    const latestProg = progressRef.current;
    const stageReached = currentLevel ? currentLevel.id : 1;
    const runGold = latestProg.activeAdventure?.goldEarnedInRun || 0;
    const party = latestProg.selectedPartyClasses;

    const record: AdventureRecord = {
      id: `adv_${Date.now()}`,
      startedAt: latestProg.activeAdventure?.startedAt || new Date().toISOString(),
      endedAt: new Date().toISOString(),
      farthestLevel: stageReached,
      farthestLevelName: currentLevel ? currentLevel.name : `Fase ${stageReached}`,
      result: 'defeat',
      partyClasses: party,
      goldEarned: runGold,
    };

    const updatedHistory = [record, ...(latestProg.adventureHistory || [])].slice(0, 10);
    const initialUnits = createInitialUnitsState();
    const preservedDiscoveredItems = consolidateDiscoveredItems(
      latestProg.discoveredItemIds,
      latestProg.activeAdventure
    );

    const prevDefeatStats = latestProg.lineageQuestStats || {};
    const nextNoHealerWinsOnDefeat =
      (prevDefeatStats.noHealerWins || 0) >= 15 ? prevDefeatStats.noHealerWins : 0;

    const updatedProgress: PlayerProgress = {
      ...latestProg,
      activeAdventure: null,
      unitsState: initialUnits,
      adventureHistory: updatedHistory,
      discoveredItemIds: preservedDiscoveredItems,
      lineageQuestStats: {
        ...prevDefeatStats,
        noHealerWins: nextNoHealerWinsOnDefeat,
      },
    };
    progressRef.current = updatedProgress;
    setProgress(updatedProgress);
    savePlayerProgress(updatedProgress);

    if (authUserRef.current) {
      submitScore(stageReached, party).catch((err) =>
        console.error('Falha ao registrar no ranking:', err)
      );
    }
  }, [currentLevel, isDailyMode]);

  // Divisão Quimérica (Fase 2 da Quimera na Fase 30 quando <= 30% HP)
  const checkAndTriggerChimeraSplit = useCallback(
    async (candidateUnits: Unit[], currentGrid: TileData[][] = grid): Promise<{ didSplit: boolean; updatedUnits: Unit[] }> => {
      const chimera = candidateUnits.find(
        (u) =>
          u.faction === 'enemy' &&
          u.monsterTypeId === 'quimera_venenosa' &&
          (!u.bossPhase || u.bossPhase === 1) &&
          (u.currentHp <= u.maxHp * 0.3 || u.isDead)
      );

      if (!chimera) {
        return { didSplit: false, updatedUnits: candidateUnits };
      }

      soundManager.playMagicSpell();
      soundManager.playUpgrade();
      addFloatingNumber(chimera.x, chimera.y, '🌀 DIVISÃO QUIMÉRICA: 3 FERAS DESPERTAM!', 'status', '#10B981');

      if (boardRef.current) {
        await boardRef.current.playDeathAnimation(chimera.id);
      }

      // Conjunto de posições ocupadas por unidades vivas
      const occupied = new Set<string>();
      candidateUnits.forEach((u) => {
        if (!u.isDead && u.id !== chimera.id) {
          occupied.add(`${u.x},${u.y}`);
        }
      });

      const gWidth = currentGrid[0]?.length || 10;
      const gHeight = currentGrid.length || 8;
      const findFreeTile = (prefX: number, prefY: number): { x: number; y: number } => {
        if (
          prefX >= 0 && prefX < gWidth &&
          prefY >= 0 && prefY < gHeight &&
          currentGrid[prefY][prefX].isWalkable &&
          !occupied.has(`${prefX},${prefY}`)
        ) {
          occupied.add(`${prefX},${prefY}`);
          return { x: prefX, y: prefY };
        }
        for (let dist = 1; dist < Math.max(gWidth, gHeight); dist++) {
          for (let dy = -dist; dy <= dist; dy++) {
            for (let dx = -dist; dx <= dist; dx++) {
              const nx = prefX + dx;
              const ny = prefY + dy;
              if (
                nx >= 0 && nx < gWidth &&
                ny >= 0 && ny < gHeight &&
                currentGrid[ny][nx].isWalkable &&
                !occupied.has(`${nx},${ny}`)
              ) {
                occupied.add(`${nx},${ny}`);
                return { x: nx, y: ny };
              }
            }
          }
        }
        return { x: prefX, y: prefY };
      };

      // Surgem no meio do tabuleiro, separados por 3 casas:
      // Meio esquerda: x = 1, Meio centro: x = 4, Meio direita: x = 7, linha central: y = 4
      const midY = Math.floor(gHeight / 2);
      const lionPos = findFreeTile(1, midY);
      const snakePos = findFreeTile(4, midY);
      const goatPos = findFreeTile(7, midY);

      const now = Date.now();
      const lionUnit: Unit = {
        id: `quimera_leao_${now}_1`,
        name: 'Leão Quimérico',
        className: 'Leão Quimérico',
        faction: 'enemy',
        monsterTypeId: 'quimera_leao',
        monsterRole: 'attacker',
        level: chimera.level,
        xp: 0,
        maxXp: chimera.maxXp,
        maxHp: 2500,
        currentHp: 2500,
        atk: chimera.atk,
        mag: chimera.mag,
        def: chimera.def,
        res: chimera.res,
        mov: chimera.mov,
        range: 1,
        x: lionPos.x,
        y: lionPos.y,
        hasMoved: false,
        hasAttacked: false,
        isDead: false,
        color: '#F59E0B',
        avatarKey: 'quimera_leao',
        skills: [
          JSON.parse(JSON.stringify(SKILLS.quimera_rugido_amedrontador)),
          JSON.parse(JSON.stringify(SKILLS.quimera_garras_leao)),
        ],
        learnedSkillIds: [],
        statusEffects: [],
        isBoss: true,
        bossPhase: 2,
        damageDealt: 0,
        kills: 0,
      };

      const snakeUnit: Unit = {
        id: `quimera_serpente_${now}_2`,
        name: 'Serpente Quimérica',
        className: 'Serpente Quimérica',
        faction: 'enemy',
        monsterTypeId: 'quimera_serpente',
        monsterRole: 'attacker',
        level: chimera.level,
        xp: 0,
        maxXp: chimera.maxXp,
        maxHp: 2500,
        currentHp: 2500,
        atk: chimera.atk,
        mag: chimera.mag,
        def: chimera.def,
        res: chimera.res,
        mov: chimera.mov,
        range: 2,
        x: snakePos.x,
        y: snakePos.y,
        hasMoved: false,
        hasAttacked: false,
        isDead: false,
        color: '#10B981',
        avatarKey: 'quimera_serpente',
        skills: [
          JSON.parse(JSON.stringify(SKILLS.quimera_mordida_serpente)),
          JSON.parse(JSON.stringify(SKILLS.quimera_cuspe_veneno)),
        ],
        learnedSkillIds: [],
        statusEffects: [],
        isBoss: true,
        bossPhase: 2,
        damageDealt: 0,
        kills: 0,
      };

      const goatUnit: Unit = {
        id: `quimera_cabra_${now}_3`,
        name: 'Cabra Quimérica',
        className: 'Cabra Quimérica',
        faction: 'enemy',
        monsterTypeId: 'quimera_cabra',
        monsterRole: 'tank',
        level: chimera.level,
        xp: 0,
        maxXp: chimera.maxXp,
        maxHp: 2500,
        currentHp: 2500,
        atk: chimera.atk,
        mag: chimera.mag,
        def: chimera.def,
        res: chimera.res,
        mov: chimera.mov,
        range: 1,
        x: goatPos.x,
        y: goatPos.y,
        hasMoved: false,
        hasAttacked: false,
        isDead: false,
        color: '#8B5CF6',
        avatarKey: 'quimera_cabra',
        skills: [
          JSON.parse(JSON.stringify(SKILLS.quimera_escudo_cabra)),
          JSON.parse(JSON.stringify(SKILLS.quimera_pisoteio_cabra)),
        ],
        learnedSkillIds: [],
        statusEffects: [],
        isBoss: true,
        bossPhase: 2,
        damageDealt: 0,
        kills: 0,
      };

      addFloatingNumber(lionPos.x, lionPos.y, '🦁 Leão Desperta! (2500 HP)', 'status', '#F59E0B');
      addFloatingNumber(snakePos.x, snakePos.y, '🐍 Serpente Desperta! (2500 HP)', 'status', '#10B981');
      addFloatingNumber(goatPos.x, goatPos.y, '🐐 Cabra Desperta! (2500 HP)', 'status', '#8B5CF6');

      setActiveBossBanner({
        name: 'A Tríade Quimérica',
        subtitle: 'FASE 2 — Leão, Serpente e Cabra',
        phase: 2,
      });

      const nextUnits = candidateUnits
        .map((u) => (u.id === chimera.id ? { ...u, isDead: true, currentHp: 0, bossPhase: 2 } : u))
        .concat([lionUnit, snakeUnit, goatUnit]);

      setUnits(nextUnits);
      return { didSplit: true, updatedUnits: nextUnits };
    },
    [grid, addFloatingNumber]
  );

  // Mecânica da Fase 45: Destruição de Cristal e Despertar do Cavaleiro do Eclipse
  const checkAndTriggerCrystalDestruction = useCallback(
    async (candidateUnits: Unit[]): Promise<{ didTrigger: boolean; updatedUnits: Unit[] }> => {
      if (currentLevel?.id !== 45) {
        return { didTrigger: false, updatedUnits: candidateUnits };
      }

      const boss = candidateUnits.find(
        (u) => !u.isDead && (u.monsterTypeId === 'cavaleiro_apocalipse' || u.id.includes('cavaleiro_apocalipse'))
      );
      if (!boss || boss.bossVersion !== 'neutral') {
        return { didTrigger: false, updatedUnits: candidateUnits };
      }

      const darkCrystalDead = candidateUnits.find(
        (u) => u.monsterTypeId === 'cristal_das_trevas' && (u.isDead || u.currentHp <= 0)
      );
      const lightCrystalDead = candidateUnits.find(
        (u) => u.monsterTypeId === 'cristal_da_luz' && (u.isDead || u.currentHp <= 0)
      );

      if (!darkCrystalDead && !lightCrystalDead) {
        return { didTrigger: false, updatedUnits: candidateUnits };
      }

      // Um dos cristais foi destruído!
      const isDarkVersion = Boolean(darkCrystalDead);
      const otherCrystalTypeId = isDarkVersion ? 'cristal_da_luz' : 'cristal_das_trevas';

      soundManager.playMagicSpell();
      soundManager.playUpgrade();

      // O outro cristal se dissipa imediatamente para que apenas um cristal seja destruído na batalha
      const otherCrystal = candidateUnits.find((u) => u.monsterTypeId === otherCrystalTypeId && !u.isDead);
      if (otherCrystal) {
        addFloatingNumber(otherCrystal.x, otherCrystal.y, '✨ O outro cristal dissipou-se!', 'status', '#A855F7');
        if (boardRef.current) {
          await boardRef.current.playDeathAnimation(otherCrystal.id);
        }
      }

      let nextUnits = candidateUnits.map((u) => {
        if (u.monsterTypeId === otherCrystalTypeId) {
          return { ...u, isDead: true, currentHp: 0 };
        }
        return u;
      });

      if (isDarkVersion) {
        // VERSÃO 1: CAVALEIRO DAS TREVAS
        addFloatingNumber(boss.x, boss.y, '🌑 DESPERTAR DAS TREVAS: IMUNIDADE QUEBRADA!', 'status', '#A855F7');
        setActiveBossBanner({
          name: 'Cavaleiro das Trevas',
          subtitle: 'DESPERTAR DO ECLIPSE SOMBRIO',
          phase: 2,
        });

        const darkSkills = [
          SKILLS.trevas_corte_cruz,
          SKILLS.trevas_casulo_escuridao,
          SKILLS.trevas_corte_chamas_borda,
          SKILLS.trevas_corte_x_repulsao,
          SKILLS.trevas_corte_luz_dreno,
        ].filter(Boolean);

        nextUnits = nextUnits.map((u) => {
          if (u.id === boss.id) {
            const nextEffects = (u.statusEffects || []).filter((e) => e.type !== 'immune');
            return {
              ...u,
              name: 'Cavaleiro das Trevas',
              color: '#9333EA',
              avatarKey: 'eclipse_knight_dark',
              bossVersion: 'dark',
              crystalsAlive: false,
              statusEffects: nextEffects,
              skills: darkSkills,
            };
          }
          return u;
        });
      } else {
        // VERSÃO 2: CAVALEIRO DA LUZ
        addFloatingNumber(boss.x, boss.y, '☀️ DESPERTAR DA LUZ: IMUNIDADE QUEBRADA!', 'status', '#FACC15');
        setActiveBossBanner({
          name: 'Cavaleiro da Luz',
          subtitle: 'DESPERTAR DO ECLIPSE RADIANTE',
          phase: 2,
        });

        const lightSkills = [
          SKILLS.luz_escudo_dupla_acao,
          SKILLS.luz_corte_cruz_atordoante,
          SKILLS.luz_corte_x_enfraquecedor,
          SKILLS.luz_corte_linha_silenciador,
          SKILLS.luz_corte_pesado_lentidao,
        ].filter(Boolean);

        nextUnits = nextUnits.map((u) => {
          if (u.id === boss.id) {
            // Remove imunidade e purifica qualquer queimadura, sangramento ou veneno
            const nextEffects = (u.statusEffects || []).filter(
              (e) => e.type !== 'immune' && e.type !== 'burn' && e.type !== 'poison'
            );
            nextEffects.push({ type: 'immune_burn_poison', duration: 999, value: 1 });
            return {
              ...u,
              name: 'Cavaleiro da Luz',
              color: '#FACC15',
              avatarKey: 'eclipse_knight_light',
              bossVersion: 'light',
              crystalsAlive: false,
              statusEffects: nextEffects,
              skills: lightSkills,
            };
          }
          return u;
        });
      }

      setUnits(nextUnits);
      return { didTrigger: true, updatedUnits: nextUnits };
    },
    [currentLevel, addFloatingNumber]
  );

  // Check battle status
  const checkBattleStatusWithUnits = useCallback(async (currentUnits: Unit[]) => {
    const chimeraNeedingSplit = currentUnits.find(
      (u) =>
        u.faction === 'enemy' &&
        u.monsterTypeId === 'quimera_venenosa' &&
        (!u.bossPhase || u.bossPhase === 1) &&
        (u.currentHp <= u.maxHp * 0.3 || u.isDead)
    );
    if (chimeraNeedingSplit) {
      await checkAndTriggerChimeraSplit(currentUnits);
      return;
    }

    const crystalNeedingTrigger = currentUnits.find(
      (u) =>
        u.faction === 'enemy' &&
        (u.monsterTypeId === 'cristal_da_luz' || u.monsterTypeId === 'cristal_das_trevas') &&
        (u.isDead || u.currentHp <= 0)
    );
    if (crystalNeedingTrigger) {
      const crystalRes = await checkAndTriggerCrystalDestruction(currentUnits);
      if (crystalRes.didTrigger) return;
    }

    const playerLiving = currentUnits.filter((u) => u.faction === 'player' && !u.isDead && !u.isSummoned);
    const enemyLiving = currentUnits.filter((u) => u.faction === 'enemy' && !u.isDead);

    if (isTrainingMode) {
      if (playerLiving.length === 0) {
        addFloatingNumber(4, 6, '💚 Heróis Revividos no Treino!', 'healing', '#10B981');
        soundManager.playHeal();
        setUnits((prev) => prev.map((u) => (u.faction === 'player' ? { ...u, isDead: false, currentHp: u.maxHp } : u)));
      } else if (enemyLiving.length === 0) {
        addFloatingNumber(4, 2, '🎯 BONECOS DESTRUÍDOS! REINICIANDO...', 'status', '#10B981');
        soundManager.playVictory();
        if (trainingConfig) {
          const lvlConfig = createTrainingLevel(trainingConfig.dummySetup);
          const freshDummies: Unit[] = lvlConfig.enemySpawns.map((spawn, idx) =>
            createMonsterUnit(
              spawn.monsterTypeId as any,
              `enemy_${spawn.monsterTypeId}_${idx}_${Date.now()}`,
              spawn.x,
              spawn.y,
              0
            )
          );
          setUnits((prev) => [...prev.filter((u) => u.faction === 'player' && !u.isDead), ...freshDummies]);
        }
      }
      return;
    }

    if (enemyLiving.length === 0) {
      handleVictory(currentUnits);
    } else if (playerLiving.length === 0) {
      handleDefeat();
    }
  }, [handleDefeat, checkAndTriggerChimeraSplit, checkAndTriggerCrystalDestruction]);

  // ANIMATED Tile Click Handler
  const handleTileClick = async (x: number, y: number) => {
    if (isAnimatingAction) return;

    const clickedUnit = units.find((u) => u.x === x && u.y === y && !u.isDead);
    const isPedestalTile = (currentLevel?.id === 10 && x === 0 && y === 0) || grid[y]?.[x]?.obstacle === 'note';

    // Deployment swap
    if (phase === 'deployment') {
      if (isPedestalTile && !clickedUnit) {
        soundManager.playSelect();
        addFloatingNumber(0, 0, 'Inscrição rúnica na pedra...', 'status', '#A7B0C4');
        return;
      }
      if (selectedUnit && selectedUnit.faction === 'player') {
        const isDepTile =
          currentLevel?.deploymentZone.some((z) => z.x === x && z.y === y) &&
          (!grid[y] || grid[y][x]?.obstacle === 'none');
        if (isDepTile) {
          if (clickedUnit && clickedUnit.faction === 'player') {
            setUnits((prev) =>
              prev.map((u) => {
                if (u.id === selectedUnit.id) return { ...u, x, y };
                if (u.id === clickedUnit.id) return { ...u, x: selectedUnit.x, y: selectedUnit.y };
                return u;
              })
            );
            soundManager.playStep();
          } else if (!clickedUnit) {
            setUnits((prev) => prev.map((u) => (u.id === selectedUnit.id ? { ...u, x, y } : u)));
            soundManager.playStep();
          }
          setSelectedUnitId(null);
          return;
        }
      }
      if (clickedUnit && clickedUnit.faction === 'player') {
        setSelectedUnitId(clickedUnit.id);
        soundManager.playSelect();
      }
      return;
    }

    if (phase !== 'player_turn') return;

    // =========================================================================
    // EXECUTE ACTIVE PET SKILL
    // =========================================================================
    if (activePetSkill) {
      const isTargetable = attackableTiles.some((t) => t.x === x && t.y === y);
      if (!isTargetable) return;

      setIsAnimatingAction(true);
      const petSkill = activePetSkill;
      const aoeType = petSkill.aoeType || 'circle';
      const affectedPoints =
        petSkill.aoeRadius > 0
          ? getAoETiles({ x, y }, petSkill.aoeRadius, grid[0].length, grid.length, aoeType, null)
          : [{ x, y }];

      let updatedUnits = [...units];
      const isHealingOrSupport = petSkill.damageType === 'healing' || (petSkill.healAmount || 0) > 0 || (petSkill.shieldAmount || 0) > 0 || (petSkill.healMultiplier || 0) > 0 || (petSkill.shieldMultiplier || 0) > 0;
      const isOffensive = petSkill.damageType === 'physical' || petSkill.damageType === 'magical' || (petSkill.power || 0) > 0;

      // Calculate the highest party stats among living heroes
      const livingPlayers = units.filter((u) => u.faction === 'player' && !u.isDead);
      const partyCandidates = livingPlayers.length > 0 ? livingPlayers : units.filter((u) => u.faction === 'player');

      const getEffectiveStat = (u: Unit, stat: 'atk' | 'mag' | 'def' | 'res') => {
        let val = u[stat] || 0;
        if (stat === 'atk') {
          const atkBuff = u.statusEffects?.find((e) => e.type === 'buff_atk' && e.duration > 0);
          if (atkBuff) val = Math.round(val * (1 + atkBuff.value / 100));
        }
        return val;
      };

      const highestPartyAtk = Math.max(1, ...partyCandidates.map((u) => getEffectiveStat(u, 'atk')));
      const highestPartyMag = Math.max(1, ...partyCandidates.map((u) => getEffectiveStat(u, 'mag')));
      const highestPartyDef = Math.max(1, ...partyCandidates.map((u) => getEffectiveStat(u, 'def')));
      const highestPartyRes = Math.max(1, ...partyCandidates.map((u) => getEffectiveStat(u, 'res')));

      // Primary stat based on scalingStat or damageType
      let primaryStat = highestPartyMag;
      if (petSkill.scalingStat === 'atk' || petSkill.damageType === 'physical') {
        primaryStat = highestPartyAtk;
      } else if (petSkill.scalingStat === 'def') {
        primaryStat = highestPartyDef;
      } else if (petSkill.scalingStat === 'res') {
        primaryStat = highestPartyRes;
      } else if (petSkill.scalingStat === 'mag' || petSkill.damageType === 'magical') {
        primaryStat = highestPartyMag;
      }

      if (isHealingOrSupport) {
        soundManager.playHeal();
      } else {
        soundManager.playMagicSpell();
      }

      updatedUnits = updatedUnits.map((u) => {
        if (u.isDead) return u;
        const isHit = affectedPoints.some((pt) => pt.x === u.x && pt.y === u.y);
        if (!isHit) return u;

        // Healing / Shield / Buff for allies
        if (u.faction === 'player' && (isHealingOrSupport || petSkill.targetType === 'any' || petSkill.targetType === 'ally')) {
          let newHp = u.currentHp;
          let newEffects = [...u.statusEffects];

          if (petSkill.cleansesDebuffs) {
            newEffects = newEffects.filter((e) => e.type !== 'poison' && e.type !== 'burn' && e.type !== 'stun' && e.type !== 'slow' && e.type !== 'debuff_def');
            addFloatingNumber(u.x, u.y, 'Purificado!', 'status', '#56E59A');
          }

          // Calculate heal scaling with highest party magic
          let healVal = 0;
          if (petSkill.healMultiplier) {
            healVal = Math.round(highestPartyMag * petSkill.healMultiplier);
          } else if (petSkill.healAmount) {
            healVal = petSkill.healAmount;
          } else if (petSkill.damageType === 'healing' && petSkill.power) {
            healVal = Math.round(highestPartyMag * petSkill.power);
          }

          if (healVal > 0) {
            const hadExcessHeal = newEffects.some((e) => e.type === 'excess_heal' && e.duration > 0);
            if (hadExcessHeal) {
              healVal = Math.max(1, Math.round(healVal * 0.5));
              addFloatingNumber(u.x, u.y, 'Cura excessiva (-50%)!', 'status', '#FACC15');
            } else {
              addFloatingNumber(u.x, u.y, 'Cura excessiva aplicada!', 'status', '#F59E0B');
            }
            newHp = Math.min(u.maxHp, u.currentHp + healVal);
            const healedVal = newHp - u.currentHp;
            if (healedVal > 0) addFloatingNumber(u.x, u.y, `+${healedVal}`, 'healing', '#43C878');
            newEffects = [
              ...newEffects.filter((e) => e.type !== 'excess_heal'),
              { type: 'excess_heal', duration: 1, value: 50, appliedTurn: turnNumberRef.current },
            ];
          }

          // Calculate shield scaling with highest party stat
          let shieldVal = 0;
          if (petSkill.shieldMultiplier) {
            const statForShield = petSkill.scalingStat === 'def' ? highestPartyDef : highestPartyMag;
            shieldVal = Math.round(statForShield * petSkill.shieldMultiplier);
          } else if (petSkill.shieldAmount) {
            shieldVal = petSkill.shieldAmount;
          } else if (petSkill.damageType === 'healing' && !petSkill.healMultiplier && !petSkill.healAmount && petSkill.power) {
            shieldVal = Math.round(highestPartyMag * petSkill.power);
          }

          if (shieldVal > 0) {
            const hadExcessShield = newEffects.some((e) => e.type === 'excess_shield' && e.duration > 0);
            if (hadExcessShield) {
              shieldVal = Math.max(1, Math.round(shieldVal * 0.5));
              addFloatingNumber(u.x, u.y, 'Escudo excessivo (-50%)!', 'status', '#FACC15');
            }
            const currentShield = newEffects.find((e) => e.type === 'shield')?.value || 0;
            const updatedShield = currentShield + shieldVal;
            newEffects = newEffects.filter((e) => e.type !== 'shield');
            newEffects.push({ type: 'shield', duration: 2, value: updatedShield });
            newEffects = [
              ...newEffects.filter((e) => e.type !== 'excess_shield'),
              { type: 'excess_shield', duration: 1, value: 50, appliedTurn: turnNumberRef.current },
            ];
            addFloatingNumber(u.x, u.y, `+${shieldVal} Escudo`, 'shield', '#60A5FA');
          }

          if (petSkill.statusEffect) {
            newEffects.push({ ...petSkill.statusEffect, appliedTurn: turnNumberRef.current });
            if (petSkill.statusEffect.type === 'invisible') {
              addFloatingNumber(u.x, u.y, 'Invisível!', 'status', '#A855F7');
            }
          }

          if (petSkill.buffAtkAmount) {
            newEffects.push({ type: 'buff_atk', duration: petSkill.buffDuration || 1, value: petSkill.buffAtkAmount });
            addFloatingNumber(u.x, u.y, `+${petSkill.buffAtkAmount}% Dano`, 'status', '#F97316');
          }

          return {
            ...u,
            currentHp: newHp,
            statusEffects: newEffects,
          };
        }

        // Damage / Debuffs for enemies
        if (u.faction === 'enemy' && (isOffensive || petSkill.targetType === 'any' || petSkill.targetType === 'enemy')) {
          if (u.crystalsAlive) {
            addFloatingNumber(u.x, u.y, '🛡️ Imune pelos Cristais!', 'status', '#A855F7');
            return u;
          }

          const powerMultiplier = petSkill.power || 1.5;
          const rawDmg = Math.round(primaryStat * powerMultiplier);
          const defIgnore = Math.min(0.35, petSkill.defenseIgnoreRatio || 0);
          const effectiveDef = petSkill.damageType === 'magical' ? u.res : u.def;
          const defDebuff = u.statusEffects?.find((e) => e.type === 'debuff_def' && e.duration > 0);
          const mitigatedDef = defDebuff ? Math.round(effectiveDef * (1 - defDebuff.value / 100)) : effectiveDef;
          const finalDef = Math.round(mitigatedDef * (1 - defIgnore));
          const dmg = Math.max(5, Math.round(rawDmg - (finalDef * 0.4)));

          let remainingDmg = dmg;
          let newEffects = [...u.statusEffects];

          // Shield absorption
          const shieldIdx = newEffects.findIndex((e) => e.type === 'shield' && e.value > 0);
          if (shieldIdx >= 0) {
            const sVal = newEffects[shieldIdx].value;
            if (sVal >= remainingDmg) {
              newEffects[shieldIdx] = { ...newEffects[shieldIdx], value: sVal - remainingDmg };
              addFloatingNumber(u.x, u.y, `-${remainingDmg}`, 'shield', '#60A5FA');
              remainingDmg = 0;
            } else {
              remainingDmg -= sVal;
              newEffects.splice(shieldIdx, 1);
              addFloatingNumber(u.x, u.y, `-${sVal} (Quebrou!)`, 'shield', '#60A5FA');
            }
          }

          const finalHp = Math.max(0, u.currentHp - remainingDmg);
          if (remainingDmg > 0) {
            addFloatingNumber(u.x, u.y, `-${remainingDmg}`, petSkill.damageType || 'magical', '#EF4444');
          }

          if (petSkill.statusEffect && finalHp > 0) {
            const isBurnPoison = petSkill.statusEffect.type === 'burn' || petSkill.statusEffect.type === 'poison';
            const isBurnPoisonImmune = u.bossVersion === 'light' || newEffects.some((e) => e.type === 'immune_burn_poison');
            if (isBurnPoison && isBurnPoisonImmune) {
              addFloatingNumber(u.x, u.y, '🛡️ Imune a Queimadura/Veneno!', 'status', '#FACC15');
            } else {
              newEffects.push({ ...petSkill.statusEffect });
              if (petSkill.statusEffect.type === 'stun') addFloatingNumber(u.x, u.y, 'Atordoado!', 'status', '#FACC15');
              else if (petSkill.statusEffect.type === 'burn') addFloatingNumber(u.x, u.y, 'Queimando!', 'status', '#F97316');
              else if (petSkill.statusEffect.type === 'slow') addFloatingNumber(u.x, u.y, 'Lentidão!', 'status', '#38BDF8');
              else if (petSkill.statusEffect.type === 'debuff_def') addFloatingNumber(u.x, u.y, '-Defesa!', 'status', '#F87171');
              else if (petSkill.statusEffect.type === 'poison') addFloatingNumber(u.x, u.y, 'Envenenado!', 'status', '#A855F7');
            }
          }

          return {
            ...u,
            currentHp: finalHp,
            isDead: finalHp <= 0,
            statusEffects: newEffects,
          };
        }

        return u;
      });

      const crystalCheck = await checkAndTriggerCrystalDestruction(updatedUnits);
      if (crystalCheck.didTrigger) {
        updatedUnits = crystalCheck.updatedUnits;
      }

      setUsedPetSkillIds((prev) => [...prev, petSkill.id]);
      setActivePetSkill(null);
      setUnits(updatedUnits);
      setIsAnimatingAction(false);
      setTimeout(() => checkBattleStatusWithUnits(updatedUnits), 200);
      return;
    }

    // =========================================================================
    // STUNNED / COCOONED UNIT HANDLING
    // If the currently selected unit is stunned or cocooned, it cannot move, attack, or target skills.
    // Clicking another unit selects that unit; clicking an empty tile deselects.
    // =========================================================================
    const isSelectedUnitStunned = Boolean(
      selectedUnit &&
      selectedUnit.statusEffects?.some((e) => (e.type === 'stun' || e.type === 'dark_cocoon') && e.duration > 0)
    );

    if (isSelectedUnitStunned && selectedUnit) {
      if (clickedUnit) {
        if (clickedUnit.id === selectedUnit.id) {
          // Re-clicked the stunned/cocooned unit itself: show feedback and keep selected
          soundManager.playSelect();
          const isCocoon = selectedUnit.statusEffects?.some((e) => e.type === 'dark_cocoon' && e.duration > 0);
          addFloatingNumber(selectedUnit.x, selectedUnit.y, isCocoon ? '🕸️ Preso no Casulo!' : 'Atordoado!', 'status', isCocoon ? '#581C87' : '#FACC15');
          return;
        }
        // Clicked another unit: seamlessly select that unit
        setSelectedUnitId(clickedUnit.id);
        setSelectedAction('none');
        setActiveSkill(null);
        setDamagePreview(null);
        setTargetTeleportPoint(null);
        setTargetAoEPoint(null);
        setTargetUnitId(null);
        soundManager.playSelect();
        if (clickedUnit.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0)) {
          addFloatingNumber(clickedUnit.x, clickedUnit.y, 'Atordoado!', 'status', '#FACC15');
        }
        return;
      } else {
        // Clicked any empty tile or ground: deselect the stunned unit
        setSelectedUnitId(null);
        setSelectedAction('none');
        setActiveSkill(null);
        setDamagePreview(null);
        setTargetTeleportPoint(null);
        setTargetAoEPoint(null);
        setTargetUnitId(null);
        return;
      }
    }

    // Movement execution
    if (selectedAction === 'move' && selectedUnit && selectedUnit.faction === 'player' && !selectedUnit.hasMoved) {
      const isReachable = reachableTiles.some((t) => t.x === x && t.y === y);
      if (isReachable && !clickedUnit) {
        setIsAnimatingAction(true);
        const fromX = selectedUnit.x;
        const fromY = selectedUnit.y;
        if (boardRef.current) {
          await boardRef.current.playMoveAnimation(selectedUnit.id, fromX, fromY, x, y);
        }

        const elecEffect = selectedUnit.statusEffects?.find((e) => e.type === 'electrified' && e.duration > 0);
        let updatedHp = selectedUnit.currentHp;
        let unitDead = false;

        if (elecEffect) {
          const path = getPathTo({ x: fromX, y: fromY }, { x, y }, grid, units, selectedUnit.faction);
          const steps = path.length > 0 ? path.length : Math.max(1, Math.abs(x - fromX) + Math.abs(y - fromY));
          const dmgPerTile = Math.max(1, Math.round(selectedUnit.maxHp * ((elecEffect.value || 1) / 100)));
          const totalDmg = dmgPerTile * steps;
          updatedHp = Math.max(0, selectedUnit.currentHp - totalDmg);
          unitDead = updatedHp === 0;

          soundManager.playMagicSpell();
          addFloatingNumber(x, y, `-${totalDmg} Choque (${steps}x)`, 'status', '#FACC15');

          if (unitDead) {
            soundManager.playDeath();
            if (boardRef.current) {
              await boardRef.current.playDeathAnimation(selectedUnit.id);
            }
          }
        }

        // Névoa Asfixiante do Leviatã: causa dano a quem encostar nela
        const targetTile = grid[y]?.[x];
        if (targetTile?.mistTurns && targetTile.mistTurns > 0 && !unitDead) {
          const freshLeviathan = units.find((u) => u.monsterTypeId === 'leviata_vazio' && !u.isDead);
          const mistDmg = Math.max(1, Math.round((freshLeviathan?.mag || 69) * 0.5));
          updatedHp = Math.max(0, updatedHp - mistDmg);
          unitDead = updatedHp === 0;
          addFloatingNumber(x, y, `-${mistDmg} Névoa Asfixiante!`, 'status', '#38BDF8');
          if (unitDead) {
            soundManager.playDeath();
            if (boardRef.current) {
              await boardRef.current.playDeathAnimation(selectedUnit.id);
            }
          }
        }

        // Centro do Tornado de Água: se pisar no centro, recebe 220% de dano mágico
        if (waterTornadoActive && waterTornadoCenter && x === waterTornadoCenter.x && y === waterTornadoCenter.y && !unitDead) {
          const freshLeviathan = units.find((u) => u.monsterTypeId === 'leviata_vazio' && !u.isDead);
          const centerDmg = Math.max(1, Math.round((freshLeviathan?.mag || 69) * 2.20));
          updatedHp = Math.max(0, updatedHp - centerDmg);
          unitDead = updatedHp === 0;
          addFloatingNumber(x, y, `-${centerDmg} Centro do Tornado (220%)!`, 'magical', '#0284C7');
          soundManager.playMagicSpell();
          if (unitDead) {
            soundManager.playDeath();
            if (boardRef.current) {
              await boardRef.current.playDeathAnimation(selectedUnit.id);
            }
          }
        }

        const movedDistance = Math.abs(x - fromX) + Math.abs(y - fromY);
        let centaurBonus = 0;
        if (selectedUnit.lineageCentaurCharge) {
          centaurBonus = (selectedUnit.centaurMovedTilesThisTurn || 0) + movedDistance;
          addFloatingNumber(x, y, `+${centaurBonus * 5}% Dano (Carga Centauro)`, 'status', '#D97706');
        }

        if (!isTrainingMode && movedDistance > 0) {
          setProgress((prev) => {
            const prevStats = prev.lineageQuestStats || {};
            let p = {
              ...prev,
              lineageQuestStats: {
                ...prevStats,
                tilesMoved: (prevStats.tilesMoved || 0) + movedDistance,
              },
            };
            const newLineages = checkLineageUnlockQuests(p);
            if (newLineages.length > 0) {
              p = {
                ...p,
                unlockedLineages: Array.from(new Set([...(p.unlockedLineages || INITIAL_UNLOCKED_LINEAGES), ...newLineages])),
              };
              setPendingUnlockLineages((prevPending) => Array.from(new Set([...prevPending, ...newLineages])));
            }
            progressRef.current = p;
            savePlayerProgress(p);
            return p;
          });
        }

        setUnits((prev) =>
          prev.map((u) =>
            u.id === selectedUnit.id
              ? {
                  ...u,
                  x,
                  y,
                  hasMoved: true,
                  currentHp: updatedHp,
                  isDead: unitDead,
                  centaurMovedTilesThisTurn: selectedUnit.lineageCentaurCharge ? centaurBonus : u.centaurMovedTilesThisTurn,
                }
              : u
          )
        );
        setSelectedAction('none');
        soundManager.playStep();
        setIsAnimatingAction(false);
        return;
      }
    }

    // ATTACKING THE PEDESTAL TO REVEAL THE PROPHECY
    if (
      isPedestalTile &&
      selectedUnit &&
      selectedUnit.faction === 'player' &&
      !selectedUnit.hasAttacked &&
      !selectedUnit.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0) &&
      (selectedAction === 'attack' || !!activeSkill)
    ) {
      const isTargetTileValid = attackableTiles.some((pt) => pt.x === x && pt.y === y);
      if (isTargetTileValid) {
        setIsAnimatingAction(true);
        const skill = activeSkill || undefined;
        setSelectedAction('none');
        setActiveSkill(null);
        setTargetUnitId(null);
        setDamagePreview(null);
        setTargetTeleportPoint(null);
        setTargetAoEPoint(null);

        if (skill && skill.damageType === 'magical') {
          soundManager.playMagicSpell();
        } else {
          soundManager.playPhysicalAttack();
        }

        if (boardRef.current) {
          await boardRef.current.playAttackAnimation(selectedUnit.id, 'pedestal', skill?.damageType || 'physical', 0, skill);
        }

        soundManager.playUpgrade();
        addFloatingNumber(0, 0, 'Ressonância do Vazio!', 'status', '#C77DFF');

        setUnits((prev) =>
          prev.map((u) => {
            if (u.id === selectedUnit.id) {
              const updatedSkills = u.skills.map((s) =>
                skill && s.id === skill.id ? { ...s, currentCooldown: s.cooldownMax, lastUsedTurn: turnNumberRef.current } : s
              );
              return {
                ...u,
                hasAttacked: true,
                skills: updatedSkills,
              };
            }
            return u;
          })
        );

        setHasPedestalBeenStruck(true);
        setShowSecretRiddle(true);
        setIsAnimatingAction(false);
        return;
      }
    }

    // Attack / Skill targeting execution
    if (selectedUnit && selectedUnit.faction === 'player' && !selectedUnit.hasAttacked) {
      // Empty-tile targeting (e.g. Teleporte Místico)
      if (activeSkill && (activeSkill.isTeleport || activeSkill.targetType === 'empty_tile')) {
        const isTargetTileValid = attackableTiles.some((pt) => pt.x === x && pt.y === y);
        if (isTargetTileValid && !clickedUnit) {
          setTargetTeleportPoint({ x, y });
          setTargetAoEPoint(null);
          const preview: DamagePreview = {
            attacker: selectedUnit,
            target: selectedUnit,
            skill: activeSkill,
            minDamage: 0,
            maxDamage: 0,
            avgDamage: 0,
            targetCurrentHp: selectedUnit.currentHp,
            targetHpAfterMin: selectedUnit.currentHp,
            targetHpAfterMax: selectedUnit.currentHp,
            isKillLikely: false,
            damageType: 'healing',
          };
          setDamagePreview(preview);
          setTargetUnitId(selectedUnit.id);
          soundManager.playSelect();
          return;
        }
      }

      // Corpse targeting (e.g. Ressurreição Cadavérica)
      if (activeSkill && (activeSkill.targetType === 'corpse' || activeSkill.summonType === 'corpse_skeleton')) {
        const isTargetTileValid = attackableTiles.some((pt) => pt.x === x && pt.y === y);
        if (isTargetTileValid) {
          const deadMonster = units.find((u) => u.faction === 'enemy' && u.isDead && !u.corpseConsumed && u.x === x && u.y === y);
          if (deadMonster) {
            setTargetTeleportPoint({ x, y });
            setTargetAoEPoint(null);
            const preview: DamagePreview = {
              attacker: selectedUnit,
              target: deadMonster,
              skill: activeSkill,
              minDamage: 0,
              maxDamage: 0,
              avgDamage: 0,
              targetCurrentHp: 0,
              targetHpAfterMin: 1,
              targetHpAfterMax: 1,
              isKillLikely: false,
              damageType: 'healing',
            };
            setDamagePreview(preview);
            setTargetUnitId(deadMonster.id);
            soundManager.playSelect();
            return;
          }
        }
      }

      // isTargeting determined by action or activeSkill
      const targetType = activeSkill ? activeSkill.targetType : 'enemy';

      // Self-targeting skill or Ally-targeting skill clicked directly on self
      if (
        activeSkill &&
        (targetType === 'self' || (targetType === 'ally' && activeSkill.rangeMin <= 0)) &&
        x === selectedUnit.x &&
        y === selectedUnit.y
      ) {
        setTargetTeleportPoint(null);
        setTargetAoEPoint({ x: selectedUnit.x, y: selectedUnit.y });
        const preview = getDamagePreview(selectedUnit, selectedUnit, activeSkill);
        preview.isGroundTarget = false;
        preview.groundTargetPoint = undefined;

        if (activeSkill.aoeRadius > 0) {
          const origin = { x: selectedUnit.x, y: selectedUnit.y };
          const hitTiles = getAoETiles(
            origin,
            activeSkill.aoeRadius,
            grid[0].length,
            grid.length,
            activeSkill.aoeType || 'circle',
            origin
          );
          preview.aoeTargetsCount = units.filter(
            (u) =>
              u.faction === (activeSkill.damageType === 'healing' ? 'player' : 'enemy') &&
              !u.isDead &&
              hitTiles.some((pt) => pt.x === u.x && pt.y === u.y)
          ).length;
        }

        setDamagePreview(preview);
        setTargetUnitId(selectedUnit.id);
        soundManager.playSelect();
        return;
      }

      // AoE Skill Targeting (any slot in attackableTiles: empty ground, occupied by an ally, or occupied by an enemy)
      const isAoESkill = Boolean(
        activeSkill &&
        activeSkill.targetType !== 'self' &&
        (activeSkill.aoeRadius > 0 || activeSkill.canTargetGround)
      );

      if (isAoESkill && activeSkill) {
        const isTargetTileValid = attackableTiles.some((pt) => pt.x === x && pt.y === y);
        if (isTargetTileValid) {
          const matchFaction = activeSkill.targetType === 'ally' ? 'player' : 'enemy';
          const aoeType = activeSkill.aoeType || 'circle';
          const origin = { x: selectedUnit.x, y: selectedUnit.y };
          const hitTiles = activeSkill.aoeRadius > 0
            ? getAoETiles({ x, y }, activeSkill.aoeRadius, grid[0].length, grid.length, aoeType, origin)
            : [{ x, y }];

          const affectedTargets = units.filter(
            (u) =>
              (activeSkill.targetType === 'any' || u.faction === matchFaction) &&
              !u.isDead &&
              hitTiles.some((pt) => pt.x === u.x && pt.y === u.y)
          );

          if (affectedTargets.length > 0 || (activeSkill.createsObstacle && !clickedUnit)) {
            setTargetTeleportPoint(null);
            setTargetAoEPoint({ x, y });

            // Determine primary target for preview and resolution
            let primaryTarget: Unit;
            if (clickedUnit && affectedTargets.some((u) => u.id === clickedUnit.id)) {
              primaryTarget = clickedUnit;
            } else if (affectedTargets.length > 0) {
              primaryTarget = affectedTargets[0];
            } else {
              primaryTarget = selectedUnit;
            }

            const preview = getDamagePreview(selectedUnit, primaryTarget, activeSkill);
            preview.aoeTargetsCount = affectedTargets.length;
            preview.isGroundTarget = !clickedUnit || primaryTarget.id !== clickedUnit.id;
            preview.groundTargetPoint = { x, y };

            setDamagePreview(preview);
            setTargetUnitId(primaryTarget.id);
            soundManager.playSelect();
            return;
          } else {
            addFloatingNumber(x, y, 'Nenhum alvo ao redor!', 'status', '#A7B0C4');
            soundManager.playSelect();
            return;
          }
        }
      }

      // Single-target Unit targeting (Enemy, Ally or Any)
      if (clickedUnit) {
        const isEnemyInvisible = clickedUnit.faction === 'enemy' && clickedUnit.statusEffects?.some((e) => e.type === 'invisible' && e.duration > 0);
        const isFactionValid =
          (targetType === 'enemy' && clickedUnit.faction === 'enemy') ||
          (targetType === 'ally' && clickedUnit.faction === 'player') ||
          targetType === 'any';

        let isTargetTileValid = attackableTiles.some((pt) => pt.x === x && pt.y === y);

        // AUTO-ATTACK ASSIST: If player has a hero selected (none or move mode) and directly clicks an enemy in basic attack range:
        if (!isTargetTileValid && !activeSkill && clickedUnit.faction === 'enemy') {
          const defaultRangeMin = 1;
          const defaultRangeMax = selectedUnit.range || 1;
          const validAttackTiles = getAttackableTiles(
            { x: selectedUnit.x, y: selectedUnit.y },
            defaultRangeMin,
            defaultRangeMax,
            grid[0]?.length || 0,
            grid.length
          );
          if (validAttackTiles.some((pt) => pt.x === x && pt.y === y)) {
            setSelectedAction('attack');
            isTargetTileValid = true;
          }
        }

        if (!isEnemyInvisible && isTargetTileValid && isFactionValid) {
          setTargetTeleportPoint(null);
          setTargetAoEPoint({ x: clickedUnit.x, y: clickedUnit.y });
          const effectiveSkill = activeSkill || undefined;
          const preview = getDamagePreview(selectedUnit, clickedUnit, effectiveSkill);
          preview.isGroundTarget = false;
          preview.groundTargetPoint = undefined;

          setDamagePreview(preview);
          setTargetUnitId(clickedUnit.id);
          soundManager.playSelect();
          return;
        }

        // If player clicked an enemy while actively aiming an attack or skill, but target is out of range:
        if (clickedUnit.faction === 'enemy' && (selectedAction === 'attack' || !!activeSkill)) {
          soundManager.playSelect();
          if (isEnemyInvisible) {
            addFloatingNumber(clickedUnit.x, clickedUnit.y, 'Inimigo Invisível!', 'status', '#8B5CF6');
          } else if (activeSkill) {
            addFloatingNumber(clickedUnit.x, clickedUnit.y, 'Fora do alcance da habilidade!', 'status', '#F87171');
          } else if (!selectedUnit.hasMoved) {
            addFloatingNumber(clickedUnit.x, clickedUnit.y, 'Aproxime-se para atacar!', 'status', '#FACC15');
          } else {
            addFloatingNumber(clickedUnit.x, clickedUnit.y, 'Alvo fora de alcance!', 'status', '#F87171');
          }
          // PREVENT accidental hero deselection!
          return;
        }
      }
    }

    // Inspecting or clicking pedestal directly (Level 10)
    if (isPedestalTile && !clickedUnit) {
      if (hasPedestalBeenStruck) {
        setRiddleType('astaroth');
        setShowSecretRiddle(true);
        soundManager.playSelect();
      } else {
        soundManager.playSelect();
        addFloatingNumber(0, 0, 'Inscrição rúnica na pedra...', 'status', '#A7B0C4');
      }
      return;
    }

    // Inspecting or clicking elemental crystals (Level 25 - Omnimago Riddle)
    const currentObstacle = grid[y]?.[x]?.obstacle;
    const isElementalCrystal =
      currentLevel?.id === 25 &&
      (currentObstacle === 'crystal_fire' ||
       currentObstacle === 'crystal_ice' ||
       currentObstacle === 'crystal_wind' ||
       currentObstacle === 'crystal_lightning');

    if (isElementalCrystal && !clickedUnit) {
      const crystalType = currentObstacle as string;
      const crystalMeta: Record<string, { name: string; color: string }> = {
        crystal_fire: { name: 'Fogo Primordial', color: '#EF4444' },
        crystal_ice: { name: 'Gelo Ancestral', color: '#38BDF8' },
        crystal_wind: { name: 'Vento Ciclônico', color: '#10B981' },
        crystal_lightning: { name: 'Raio Fulminante', color: '#FACC15' },
      };
      const info = crystalMeta[crystalType] || { name: 'Magia Elemental', color: '#D946EF' };

      soundManager.playMagicSpell();

      setActivatedElementalCrystals((prev) => {
        const next = Array.from(new Set([...prev, crystalType]));
        if (next.length === 4) {
          soundManager.playUpgrade();
          addFloatingNumber(x, y, 'Você sente um fio de magia elemental fluir até você... (4/4)!', 'status', info.color);
          setTimeout(() => {
            setRiddleType('omnimago');
            setShowSecretRiddle(true);
          }, 600);
        } else {
          soundManager.playSelect();
          const count = next.length;
          addFloatingNumber(x, y, `Você sente um fio de magia elemental fluir até você... (${count}/4)`, 'status', info.color);
        }
        return next;
      });
      return;
    }

    // Select / Deselect unit
    if (clickedUnit && !(clickedUnit.faction === 'enemy' && clickedUnit.statusEffects?.some((e) => e.type === 'invisible' && e.duration > 0))) {
      setSelectedUnitId(clickedUnit.id);
      setSelectedAction('none');
      setActiveSkill(null);
      setDamagePreview(null);
      setTargetTeleportPoint(null);
      setTargetAoEPoint(null);
      setTargetUnitId(null);
      soundManager.playSelect();
      if (clickedUnit.statusEffects?.some((e) => (e.type === 'stun' || e.type === 'dark_cocoon') && e.duration > 0)) {
        const isCocoon = clickedUnit.statusEffects?.some((e) => e.type === 'dark_cocoon' && e.duration > 0);
        addFloatingNumber(clickedUnit.x, clickedUnit.y, isCocoon ? '🕸️ Preso no Casulo!' : 'Atordoado!', 'status', isCocoon ? '#581C87' : '#FACC15');
      }
    } else {
      setSelectedUnitId(null);
      setSelectedAction('none');
      setActiveSkill(null);
      setDamagePreview(null);
      setTargetTeleportPoint(null);
      setTargetAoEPoint(null);
      setTargetUnitId(null);
    }
  };

  // ANIMATED Attack / Skill Confirm
  const handleConfirmAttack = async () => {
    if (!selectedUnit || !damagePreview) return;

    if (selectedUnit.statusEffects?.some((e) => (e.type === 'stun' || e.type === 'dark_cocoon') && e.duration > 0)) {
      const isCocoon = selectedUnit.statusEffects?.some((e) => e.type === 'dark_cocoon' && e.duration > 0);
      addFloatingNumber(selectedUnit.x, selectedUnit.y, isCocoon ? '🕸️ Preso no Casulo!' : 'Atordoado!', 'status', isCocoon ? '#581C87' : '#FACC15');
      return;
    }

    setIsAnimatingAction(true);
    setDamagePreview(null);

    const skill = activeSkill || undefined;

    // 1. Teleport skill to empty tile (e.g. Teleporte Místico)
    if (skill && (skill.isTeleport || skill.targetType === 'empty_tile') && targetTeleportPoint) {
      soundManager.playMagicSpell();
      const destX = targetTeleportPoint.x;
      const destY = targetTeleportPoint.y;

      if (boardRef.current) {
        await boardRef.current.playMoveAnimation(selectedUnit.id, selectedUnit.x, selectedUnit.y, destX, destY);
        await boardRef.current.playAttackAnimation(selectedUnit.id, selectedUnit.id, 'healing', 0, skill, { x: destX, y: destY });
      }

      addFloatingNumber(destX, destY, 'Teleporte Místico!', 'status', '#8B5CF6');

      let updatedEffects = [...(selectedUnit.statusEffects || [])];
      if (skill.statusEffect) {
        const eff = { ...skill.statusEffect, appliedTurn: turnNumberRef.current };
        if (eff.type === 'buff_atk') {
          addFloatingNumber(destX, destY, `+${eff.value}% Poder Mágico`, 'status', '#F97316');
        }
        updatedEffects = [...updatedEffects.filter((e) => e.type !== eff.type), eff];
      }

      const updatedSkills = selectedUnit.skills.map((s) =>
        s.id === skill.id ? { ...s, currentCooldown: s.cooldownMax, lastUsedTurn: turnNumberRef.current } : s
      );

      const updatedUnits = units.map((u) =>
        u.id === selectedUnit.id
          ? { ...u, x: destX, y: destY, hasAttacked: true, skills: updatedSkills, statusEffects: updatedEffects }
          : u
      );

      setUnits(updatedUnits);
      if (selectedUnit.faction === 'player' && !isTrainingMode) {
        setProgress((prev) => {
          let updated = incrementClassStat(prev, selectedUnit.className, 'skill_uses', 1);
          const prevStats = updated.lineageQuestStats || {};
          updated = {
            ...updated,
            lineageQuestStats: {
              ...prevStats,
              skillsCast: (prevStats.skillsCast || 0) + 1,
            },
          };
          const newLineages = checkLineageUnlockQuests(updated);
          if (newLineages.length > 0) {
            updated = {
              ...updated,
              unlockedLineages: Array.from(new Set([...(updated.unlockedLineages || INITIAL_UNLOCKED_LINEAGES), ...newLineages])),
            };
            setPendingUnlockLineages((prevPending) => Array.from(new Set([...prevPending, ...newLineages])));
          }
          progressRef.current = updated;
          savePlayerProgress(updated);
          return updated;
        });
      }
      setTargetTeleportPoint(null);
      setTargetUnitId(null);
      setSelectedAction('none');
      setActiveSkill(null);
      setIsAnimatingAction(false);
      return;
    }

    // 1.5. Necromancer Corpse Resurrection Skill
    if (skill && (skill.targetType === 'corpse' || skill.summonType === 'corpse_skeleton')) {
      const deadMonster = targetUnitId ? units.find((u) => u.id === targetUnitId) : null;
      const spawnX = deadMonster ? deadMonster.x : (targetTeleportPoint?.x ?? selectedUnit.x);
      const spawnY = deadMonster ? deadMonster.y : (targetTeleportPoint?.y ?? selectedUnit.y);

      soundManager.playMagicSpell();
      if (boardRef.current) {
        await boardRef.current.playAttackAnimation(selectedUnit.id, selectedUnit.id, 'magical', 0, skill, { x: spawnX, y: spawnY });
      }

      addFloatingNumber(spawnX, spawnY, '💀 Esqueleto Reanimado!', 'status', '#94A3B8');

      const newSkeleton: Unit = {
        id: `skeleton_resurrected_${Date.now()}`,
        name: 'Esqueleto Reanimado',
        className: 'Esqueleto',
        faction: 'player',
        isSummoned: true,
        summonTurnsLeft: 2,
        level: selectedUnit.level,
        xp: 0,
        maxXp: 100,
        maxHp: 1,
        currentHp: 1,
        atk: Math.max(10, Math.round(selectedUnit.mag * 0.75)),
        mag: Math.max(5, Math.round(selectedUnit.mag * 0.5)),
        def: 0,
        res: 0,
        mov: 3,
        range: 1,
        x: spawnX,
        y: spawnY,
        hasMoved: false,
        hasAttacked: false,
        isDead: false,
        color: '#E2E8F0',
        avatarKey: 'skeleton',
        skills: [JSON.parse(JSON.stringify(SKILLS.golpe_esqueleto))],
        learnedSkillIds: ['golpe_esqueleto'],
        statusEffects: [{ type: 'summon_lifetime', duration: 2, value: 2, appliedTurn: turnNumberRef.current }],
        damageDealt: 0,
        kills: 0,
              };

      const updatedSkills = selectedUnit.skills.map((s) =>
        s.id === skill.id ? { ...s, currentCooldown: s.cooldownMax, lastUsedTurn: turnNumberRef.current } : s
      );

      const updatedUnits = units.map((u) => {
        if (u.id === selectedUnit.id) {
          return { ...u, hasAttacked: true, skills: updatedSkills };
        }
        if (deadMonster && u.id === deadMonster.id) {
          return { ...u, corpseConsumed: true };
        }
        return u;
      });

      updatedUnits.push(newSkeleton);
      setUnits(updatedUnits);
      if (selectedUnit.faction === 'player' && !isTrainingMode) {
        setProgress((prev) => {
          let updated = incrementClassStat(prev, selectedUnit.className, 'skill_uses', 1);
          const prevStats = updated.lineageQuestStats || {};
          updated = {
            ...updated,
            lineageQuestStats: {
              ...prevStats,
              skillsCast: (prevStats.skillsCast || 0) + 1,
            },
          };
          const newLineages = checkLineageUnlockQuests(updated);
          if (newLineages.length > 0) {
            updated = {
              ...updated,
              unlockedLineages: Array.from(new Set([...(updated.unlockedLineages || INITIAL_UNLOCKED_LINEAGES), ...newLineages])),
            };
            setPendingUnlockLineages((prevPending) => Array.from(new Set([...prevPending, ...newLineages])));
          }
          progressRef.current = updated;
          savePlayerProgress(updated);
          return updated;
        });
      }
      setTargetTeleportPoint(null);
      setTargetUnitId(null);
      setSelectedAction('none');
      setActiveSkill(null);
      setIsAnimatingAction(false);
      return;
    }

    // 1.6. Necromancer Skeleton Army Skill
    if (skill && skill.summonType === 'skeleton_army') {
      soundManager.playMagicSpell();
      if (boardRef.current) {
        await boardRef.current.playAttackAnimation(selectedUnit.id, selectedUnit.id, 'magical', 1, skill);
      }

      const occupied = new Set(units.filter((u) => !u.isDead).map((u) => `${u.x},${u.y}`));
      const freeTiles: Point[] = [];
      const gWidth = grid[0]?.length || 10;
      const gHeight = grid.length || 8;

      for (let r = 1; r <= 3 && freeTiles.length < 3; r++) {
        for (let dx = -r; dx <= r && freeTiles.length < 3; dx++) {
          for (let dy = -r; dy <= r && freeTiles.length < 3; dy++) {
            if (Math.abs(dx) + Math.abs(dy) === 0) continue;
            const nx = selectedUnit.x + dx;
            const ny = selectedUnit.y + dy;
            if (
              nx >= 0 && nx < gWidth &&
              ny >= 0 && ny < gHeight &&
              grid[ny]?.[nx]?.isWalkable &&
              !occupied.has(`${nx},${ny}`) &&
              !freeTiles.some((t) => t.x === nx && t.y === ny)
            ) {
              freeTiles.push({ x: nx, y: ny });
              occupied.add(`${nx},${ny}`);
            }
          }
        }
      }

      const now = Date.now();
      const spawnedSkeletons: Unit[] = freeTiles.map((tile, i) => ({
        id: `skeleton_army_${now}_${i}`,
        name: `Esqueleto Servo ${i + 1}`,
        className: 'Esqueleto',
        faction: 'player',
        isSummoned: true,
        summonTurnsLeft: 2,
        level: selectedUnit.level,
        xp: 0,
        maxXp: 100,
        maxHp: 1,
        currentHp: 1,
        atk: Math.max(10, Math.round(selectedUnit.mag * 0.70)),
        mag: Math.max(5, Math.round(selectedUnit.mag * 0.5)),
        def: 0,
        res: 0,
        mov: 3,
        range: 1,
        x: tile.x,
        y: tile.y,
        hasMoved: false,
        hasAttacked: false,
        isDead: false,
        color: '#E2E8F0',
        avatarKey: 'skeleton',
        skills: [JSON.parse(JSON.stringify(SKILLS.golpe_esqueleto))],
        learnedSkillIds: ['golpe_esqueleto'],
        statusEffects: [{ type: 'summon_lifetime', duration: 2, value: 2, appliedTurn: turnNumberRef.current }],
        damageDealt: 0,
        kills: 0,
              }));

      spawnedSkeletons.forEach((skel) => {
        addFloatingNumber(skel.x, skel.y, '💀 Esqueleto Erguido!', 'status', '#94A3B8');
      });

      const updatedSkills = selectedUnit.skills.map((s) =>
        s.id === skill.id ? { ...s, currentCooldown: s.cooldownMax, lastUsedTurn: turnNumberRef.current } : s
      );

      const updatedUnits = units.map((u) =>
        u.id === selectedUnit.id ? { ...u, hasAttacked: true, skills: updatedSkills } : u
      );

      setUnits([...updatedUnits, ...spawnedSkeletons]);
      if (selectedUnit.faction === 'player' && !isTrainingMode) {
        setProgress((prev) => {
          let updated = incrementClassStat(prev, selectedUnit.className, 'skill_uses', 1);
          const prevStats = updated.lineageQuestStats || {};
          updated = {
            ...updated,
            lineageQuestStats: {
              ...prevStats,
              skillsCast: (prevStats.skillsCast || 0) + 1,
            },
          };
          const newLineages = checkLineageUnlockQuests(updated);
          if (newLineages.length > 0) {
            updated = {
              ...updated,
              unlockedLineages: Array.from(new Set([...(updated.unlockedLineages || INITIAL_UNLOCKED_LINEAGES), ...newLineages])),
            };
            setPendingUnlockLineages((prevPending) => Array.from(new Set([...prevPending, ...newLineages])));
          }
          progressRef.current = updated;
          savePlayerProgress(updated);
          return updated;
        });
      }
      setTargetTeleportPoint(null);
      setTargetUnitId(null);
      setSelectedAction('none');
      setActiveSkill(null);
      setIsAnimatingAction(false);
      return;
    }

    const target = (skill && skill.targetType === 'self')
      ? selectedUnit
      : units.find((u) => u.id === targetUnitId);
    if (!target) {
      setIsAnimatingAction(false);
      return;
    }

    // 2. Self-targeting skill (e.g. Buffs, Escudos, Pacto de Sangue, Resistência Suprema)
    if (skill && skill.targetType === 'self' && skill.damageType === 'healing') {
      soundManager.playHeal();
      if (boardRef.current) {
        await boardRef.current.playAttackAnimation(selectedUnit.id, selectedUnit.id, 'healing', skill.aoeRadius || 0, skill);
      }

      let currentUnitHp = selectedUnit.currentHp;

      // Special: Pacto de Sangue / hpCostPercent sacrifices HP (down to at least 1 HP)
      const hpCostPct = skill.hpCostPercent ?? (skill.id === 'pacto_de_sangue' ? 20 : 0);
      if (hpCostPct > 0) {
        const hpCost = Math.max(1, Math.round(selectedUnit.currentHp * (hpCostPct / 100)));
        currentUnitHp = Math.max(1, currentUnitHp - hpCost);
        addFloatingNumber(selectedUnit.x, selectedUnit.y, `-${hpCost} (Sacrifício)`, 'status', '#E65353');
      }

      // Special: Resistência Suprema recovers 50% max HP (or scaled if evolved)
      const hadExcessHeal = selectedUnit.statusEffects?.some(
        (e) => e.type === 'excess_heal' && e.duration > 0
      );
      const hadExcessShield = selectedUnit.statusEffects?.some(
        (e) => e.type === 'excess_shield' && e.duration > 0
      );

      let isHealSkill = false;
      const isSelfAntiHealed = gridRef.current?.[selectedUnit.y]?.[selectedUnit.x]?.antiHealPermanent;

      if (skill.id === 'resistencia_suprema') {
        if (isSelfAntiHealed) {
          addFloatingNumber(selectedUnit.x, selectedUnit.y, '🚫 Cura Bloqueada (Solo Amaldiçoado)!', 'status', '#A855F7');
        } else {
          isHealSkill = true;
          const ratio = skill.power ? Math.min(1.0, skill.power) : 0.5;
          let healAmt = Math.max(1, Math.round(selectedUnit.maxHp * ratio));
          if (hadExcessHeal) {
            healAmt = Math.max(1, Math.round(healAmt * 0.5));
            addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Cura excessiva (-50%)!', 'status', '#FACC15');
          } else {
            addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Cura excessiva aplicada!', 'status', '#F59E0B');
          }
          currentUnitHp = Math.min(selectedUnit.maxHp, currentUnitHp + healAmt);
          addFloatingNumber(selectedUnit.x, selectedUnit.y, `+${healAmt} (${Math.round(ratio * 100)}% HP)`, 'healing', '#56E59A');
        }
      } else if (skill.damageType === 'healing' && skill.power && skill.power > 0) {
        if (isSelfAntiHealed) {
          addFloatingNumber(selectedUnit.x, selectedUnit.y, '🚫 Cura Bloqueada (Solo Amaldiçoado)!', 'status', '#A855F7');
        } else {
          isHealSkill = true;
          let healAmt = Math.max(1, Math.round(selectedUnit.mag * skill.power));
          const isCurandeiro =
            (selectedUnit.className || '').toLowerCase().includes('curandeiro') ||
            (selectedUnit.avatarKey || '').toLowerCase().includes('cleric');
          if (isCurandeiro) {
            const lostHp = Math.max(0, selectedUnit.maxHp - currentUnitHp);
            healAmt += Math.round(lostHp * 0.10);
          }
          if (hadExcessHeal) {
            healAmt = Math.max(1, Math.round(healAmt * 0.5));
            addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Cura excessiva (-50%)!', 'status', '#FACC15');
          } else {
            addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Cura excessiva aplicada!', 'status', '#F59E0B');
          }
          currentUnitHp = Math.min(selectedUnit.maxHp, currentUnitHp + healAmt);
          addFloatingNumber(selectedUnit.x, selectedUnit.y, `+${healAmt}`, 'healing', '#56E59A');
        }
      }

      let updatedEffects = [...(selectedUnit.statusEffects || [])];
      let givesShield = false;

      const handleSelfStatusEffect = (effToProcess?: StatusEffect) => {
        if (!effToProcess) return;
        const eff = { ...effToProcess, appliedTurn: turnNumberRef.current };
        if (eff.type === 'shield') {
          givesShield = true;
          const scalingBonus = selectedUnit.lineageHealShieldFlatScalingBonus || 0;
          if (skill.shieldPercentOfMaxHp) {
            eff.value = Math.max(1, Math.round(selectedUnit.maxHp * (skill.shieldPercentOfMaxHp + scalingBonus)));
          } else if (skill.shieldPercentOfMag) {
            eff.value = Math.max(1, Math.round(selectedUnit.mag * (skill.shieldPercentOfMag + scalingBonus)));
          } else if (skill.shieldPercentOfAtk) {
            eff.value = Math.max(1, Math.round(selectedUnit.atk * (skill.shieldPercentOfAtk + scalingBonus)));
          }
          if (selectedUnit.lineageShieldReflectRatio) {
            eff.reflectRatio = Math.max(eff.reflectRatio || 0, selectedUnit.lineageShieldReflectRatio);
          }
          if (hadExcessShield) {
            eff.value = Math.max(1, Math.round(eff.value * 0.5));
            addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Escudo excessivo (-50%)!', 'status', '#FACC15');
          }
          if (eff.reflectRatio) {
            addFloatingNumber(selectedUnit.x, selectedUnit.y, `+${eff.value} Escudo Espinhoso (${Math.round(eff.reflectRatio * 100)}% Reflexão)`, 'shield', '#F97316');
          } else {
            addFloatingNumber(selectedUnit.x, selectedUnit.y, `+${eff.value} Escudo`, 'shield', '#38BDF8');
          }
        } else if (eff.type === 'buff_atk') {
          addFloatingNumber(selectedUnit.x, selectedUnit.y, `+${eff.value}% Dano`, 'status', '#F97316');
        } else if (eff.type === 'buff_mov') {
          addFloatingNumber(selectedUnit.x, selectedUnit.y, `+${eff.value} Movimento!`, 'status', '#38BDF8');
        } else if (eff.type === 'invisible') {
          addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Invisível!', 'status', '#8B5CF6');
        } else if (eff.type === 'taunt') {
          addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Provocando Inimigos!', 'status', '#EF4444');
          // Mostra feedback visual nos inimigos dentro do alcance de até 3 casas
          const affectedMonsters = units.filter(
            (u) =>
              u.faction === 'enemy' &&
              !u.isDead &&
              Math.max(Math.abs(u.x - selectedUnit.x), Math.abs(u.y - selectedUnit.y)) <= 3
          );
          affectedMonsters.forEach((m) => {
            addFloatingNumber(m.x, m.y, 'Provocado!', 'status', '#EF4444');
          });
        }
        updatedEffects = [...updatedEffects.filter((e) => e.type !== eff.type), eff];
      };

      handleSelfStatusEffect(skill.statusEffect);
      handleSelfStatusEffect(skill.secondaryStatusEffect);
      if (skill.casterStatusEffect) {
        handleSelfStatusEffect(skill.casterStatusEffect);
      }

      if (isHealSkill) {
        updatedEffects = [
          ...updatedEffects.filter((e) => e.type !== 'excess_heal'),
          { type: 'excess_heal', duration: 1, value: 50, appliedTurn: turnNumberRef.current },
        ];
      }

      if (givesShield) {
        updatedEffects = [
          ...updatedEffects.filter((e) => e.type !== 'excess_shield'),
          { type: 'excess_shield', duration: 1, value: 50, appliedTurn: turnNumberRef.current },
        ];
      }

      const updatedSkills = selectedUnit.skills.map((s) =>
        s.id === skill.id ? { ...s, currentCooldown: s.cooldownMax, lastUsedTurn: turnNumberRef.current } : s
      );

      const updatedUnits = units.map((u) =>
        u.id === selectedUnit.id
          ? { ...u, currentHp: currentUnitHp, hasAttacked: true, skills: updatedSkills, statusEffects: updatedEffects }
          : u
      );

      setUnits(updatedUnits);

      if (selectedUnit.faction === 'player' && !isTrainingMode) {
        const selfHealDone = Math.max(0, currentUnitHp - selectedUnit.currentHp);
        setProgress((prev) => {
          let updated = incrementClassStat(prev, selectedUnit.className, 'skill_uses', 1);
          const prevStats = updated.lineageQuestStats || {};
          updated = {
            ...updated,
            lineageQuestStats: {
              ...prevStats,
              skillsCast: (prevStats.skillsCast || 0) + 1,
              healingDone: (prevStats.healingDone || 0) + selfHealDone,
            },
          };
          const newLineages = checkLineageUnlockQuests(updated);
          if (newLineages.length > 0) {
            updated = {
              ...updated,
              unlockedLineages: Array.from(new Set([...(updated.unlockedLineages || INITIAL_UNLOCKED_LINEAGES), ...newLineages])),
            };
            setPendingUnlockLineages((prevPending) => Array.from(new Set([...prevPending, ...newLineages])));
          }
          progressRef.current = updated;
          savePlayerProgress(updated);
          return updated;
        });
      }

      setTargetUnitId(null);
      setSelectedAction('none');
      setActiveSkill(null);
      setIsAnimatingAction(false);
      return;
    }

    // 3. Offensive / Targeted Combat Actions
    let attackerEffects = [...(selectedUnit.statusEffects || [])];
    let currentAttackerHp = selectedUnit.currentHp;

    // Offensive sacrifice skills (e.g. Berserker attacks)
    if (skill?.hpCostPercent && skill.hpCostPercent > 0) {
      const hpCost = Math.max(1, Math.round(currentAttackerHp * (skill.hpCostPercent / 100)));
      currentAttackerHp = Math.max(1, currentAttackerHp - hpCost);
      addFloatingNumber(selectedUnit.x, selectedUnit.y, `-${hpCost} (Sacrifício)`, 'status', '#E65353');
    }

    // Attacking breaks invisibility (surprise sneak attack!)
    const wasInvisible = attackerEffects.some((e) => e.type === 'invisible' && e.duration > 0);
    if (wasInvisible) {
      attackerEffects = attackerEffects.filter((e) => e.type !== 'invisible');
      addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Emboscada!', 'status', '#F59E0B');
    }

    // Teleport / Blink to target (e.g. Passo das Sombras, Investida Pesada)
    let finalAttackerX = selectedUnit.x;
    let finalAttackerY = selectedUnit.y;

    if (skill?.teleportToTarget || skill?.id === 'passo_das_sombras' || skill?.id === 'investida_pesada') {
      const candidateAdjacent = [
        { x: target.x + 1, y: target.y },
        { x: target.x - 1, y: target.y },
        { x: target.x, y: target.y + 1 },
        { x: target.x, y: target.y - 1 },
        { x: target.x + 1, y: target.y + 1 },
        { x: target.x + 1, y: target.y - 1 },
        { x: target.x - 1, y: target.y + 1 },
        { x: target.x - 1, y: target.y - 1 },
      ].filter(
        (pt) =>
          pt.x >= 0 &&
          pt.x < grid[0].length &&
          pt.y >= 0 &&
          pt.y < grid.length &&
          grid[pt.y][pt.x].isWalkable &&
          !units.some((u) => !u.isDead && u.id !== selectedUnit.id && u.x === pt.x && u.y === pt.y)
      );

      if (candidateAdjacent.length > 0) {
        candidateAdjacent.sort(
          (a, b) =>
            Math.abs(a.x - selectedUnit.x) + Math.abs(a.y - selectedUnit.y) -
            (Math.abs(b.x - selectedUnit.x) + Math.abs(b.y - selectedUnit.y))
        );
        const dest = candidateAdjacent[0];
        if (dest.x !== selectedUnit.x || dest.y !== selectedUnit.y) {
          if (boardRef.current) {
            await boardRef.current.playMoveAnimation(selectedUnit.id, selectedUnit.x, selectedUnit.y, dest.x, dest.y);
          }
          finalAttackerX = dest.x;
          finalAttackerY = dest.y;
          addFloatingNumber(
            dest.x,
            dest.y,
            skill.id === 'passo_das_sombras' ? 'Passo Sombrio!' : 'Avanço!',
            'status',
            '#A855F7'
          );
        }
      }
    }

    const { finalDamage, isKill, damageType } = rollActualDamage(selectedUnit, target, skill);

    if (damageType === 'healing') soundManager.playHeal();
    else if (damageType === 'magical') soundManager.playMagicSpell();
    else soundManager.playPhysicalAttack();

    const aoeCenter = targetAoEPoint || { x: target.x, y: target.y };

    if (boardRef.current) {
      await boardRef.current.playAttackAnimation(selectedUnit.id, target.id, damageType, skill?.aoeRadius, skill, targetAoEPoint || undefined);
    }

    // Ice / Obstacle Creation (Mago de Gelo)
    if (skill?.createsObstacle) {
      const obsType = skill.createsObstacle;
      setGrid((prevGrid) =>
        prevGrid.map((row, rY) =>
          row.map((cell, cX) => {
            if (cX === aoeCenter.x && rY === aoeCenter.y) {
              return {
                ...cell,
                obstacle: obsType,
                isWalkable: false,
                blocksVision: obsType === 'wall' || obsType === 'ruins' || obsType === 'pillar',
              };
            }
            return cell;
          })
        )
      );
      addFloatingNumber(aoeCenter.x, aoeCenter.y, 'Barreira Sólida!', 'status', '#38BDF8');
    }

    const aoeRadius = skill?.aoeRadius || 0;
    let targetsToHit: Unit[] = [];
    if (skill?.chainCount && skill.chainCount > 1) {
      const chainTargets: Unit[] = [target];
      let currentLink = target;
      const maxChains = skill.chainCount;
      const maxDist = skill.chainRange || 3;
      const matchFaction = target.faction;

      for (let c = 1; c < maxChains; c++) {
        const available = units.filter(
          (u) =>
            u.faction === matchFaction &&
            !u.isDead &&
            !chainTargets.some((ct) => ct.id === u.id) &&
            Math.abs(u.x - currentLink.x) + Math.abs(u.y - currentLink.y) <= maxDist
        );
        if (available.length === 0) break;
        available.sort(
          (a, b) =>
            (Math.abs(a.x - currentLink.x) + Math.abs(a.y - currentLink.y)) -
            (Math.abs(b.x - currentLink.x) + Math.abs(b.y - currentLink.y))
        );
        const nextTarget = available[0];
        chainTargets.push(nextTarget);
        currentLink = nextTarget;
      }
      targetsToHit = chainTargets;
    } else if (aoeRadius > 0) {
      const matchFaction = skill?.targetType === 'ally' ? 'player' : 'enemy';
      const origin = { x: selectedUnit.x, y: selectedUnit.y };
      const hitTiles = getAoETiles(
        aoeCenter,
        aoeRadius,
        grid[0].length,
        grid.length,
        skill?.aoeType || 'circle',
        origin
      );
      targetsToHit = units.filter(
        (u) =>
          u.faction === matchFaction &&
          !u.isDead &&
          hitTiles.some((pt) => pt.x === u.x && pt.y === u.y)
      );
    } else {
      targetsToHit = [target];
    }

    let updatedUnits = [...units];
    let totalDmgDone = 0;
    let totalHealDone = 0;
    let totalKills = 0;
    let massiveHitsCount = 0;
    let statusInflictedCount = 0;
    let poisonInflictedCount = 0;
    let bleedInflictedCount = 0;
    let enemiesPushedCount = 0;
    const killedMonsterTypeIds: string[] = [];

    for (const t of targetsToHit) {
      const isMain = t.id === target.id;
      const dmgResult = isMain ? { finalDamage, isKill, damageType } : rollActualDamage(selectedUnit, t, skill);
      let actualDmg = dmgResult.finalDamage;

      let currentEffects = [...(t.statusEffects || [])];

      // Cleansing of debuffs (e.g. Purificação Sagrada)
      if (skill?.cleansesDebuffs) {
        const beforeCount = currentEffects.length;
        currentEffects = currentEffects.filter(
          (e) => e.type !== 'poison' && e.type !== 'burn' && e.type !== 'stun' && e.type !== 'slow' && e.type !== 'debuff_def'
        );
        if (currentEffects.length < beforeCount) {
          addFloatingNumber(t.x, t.y, 'Purificado!', 'status', '#38BDF8');
        }
      }

      if (t.crystalsAlive) {
        addFloatingNumber(t.x, t.y, '🛡️ Imune pelos Cristais!', 'status', '#A855F7');
        actualDmg = 0;
      }

      if (dmgResult.damageType !== 'healing' && actualDmg > 0) {
        if (skill?.ignoresShield) {
          addFloatingNumber(t.x, t.y, 'Ignorou Escudo!', 'status', '#A855F7');
        } else {
          let absorbedDamage = 0;
          let reflectPercent = 0;
          for (let i = 0; i < currentEffects.length; i++) {
            if (currentEffects[i].type === 'shield' && currentEffects[i].value > 0) {
              const sh = currentEffects[i];
              const dmgAbsorbed = Math.min(sh.value, actualDmg);
              if (sh.reflectRatio) {
                reflectPercent = Math.max(reflectPercent, sh.reflectRatio);
              }
              absorbedDamage += dmgAbsorbed;
              sh.value -= dmgAbsorbed;
              actualDmg -= dmgAbsorbed;
              addFloatingNumber(t.x, t.y, `-${dmgAbsorbed} (Escudo)`, 'shield', '#38BDF8');
              if (actualDmg === 0) break;
            }
          }
          currentEffects = currentEffects.filter((e) => e.type !== 'shield' || e.value > 0);

          if (absorbedDamage > 0 && reflectPercent > 0) {
            const reflectedDmg = Math.max(1, Math.round(absorbedDamage * reflectPercent));
            currentAttackerHp = Math.max(1, currentAttackerHp - reflectedDmg);
            addFloatingNumber(selectedUnit.x, selectedUnit.y, `-${reflectedDmg} (Espinhos)`, 'physical', '#F97316');
            soundManager.playPhysicalAttack();
          }
        }
      }

      let newHp = t.currentHp;
      let allyHasMoved = t.hasMoved;
      let allyHasAttacked = t.hasAttacked;

      if (dmgResult.damageType === 'healing') {
        const hadExcessHeal = currentEffects.some((e) => e.type === 'excess_heal' && e.duration > 0);
        const hadExcessShield = currentEffects.some((e) => e.type === 'excess_shield' && e.duration > 0);
        let isHealed = false;
        let isShielded = false;

        const isHealingSpell = (skill && (skill.power > 0 || skill.id === 'resistencia_suprema' || skill.id === 'ressurreicao_mistica')) || actualDmg > 0;
        const isTargetAntiHealed = gridRef.current?.[t.y]?.[t.x]?.antiHealPermanent;

        if (isHealingSpell) {
          if (isTargetAntiHealed) {
            addFloatingNumber(t.x, t.y, '🚫 Cura Bloqueada (Solo Amaldiçoado)!', 'status', '#A855F7');
          } else {
            isHealed = true;
            if (actualDmg > 0) {
              newHp = Math.min(t.maxHp, t.currentHp + actualDmg);
              totalHealDone += actualDmg;
              addFloatingNumber(t.x, t.y, `+${actualDmg}`, 'healing', '#56E59A');
            }
            if (hadExcessHeal) {
              addFloatingNumber(t.x, t.y, 'Cura excessiva (-50%)!', 'status', '#FACC15');
            } else {
              addFloatingNumber(t.x, t.y, 'Cura excessiva aplicada!', 'status', '#F59E0B');
            }
          }
        }

        // Extra Turn mechanic granted to an ally (Bardo)
        if (skill?.grantsExtraTurn && t.faction === 'player' && t.id !== selectedUnit.id) {
          allyHasMoved = false;
          allyHasAttacked = false;
          addFloatingNumber(t.x, t.y, '+1 Turno / Ação!', 'status', '#F59E0B');
          soundManager.playUpgrade();
        }

        // Support status effects for allies in healing/support skills (Shield, Buff Atk, Invisible, Taunt, etc.)
        const applyTargetSupportEffect = (effToProcess?: StatusEffect) => {
          if (!effToProcess) return;
          const eff = { ...effToProcess, appliedTurn: turnNumberRef.current };
          if (eff.type === 'shield') {
            isShielded = true;
            const scalingBonus = selectedUnit.lineageHealShieldFlatScalingBonus || 0;
            if (skill?.shieldPercentOfMaxHp) {
              eff.value = Math.max(1, Math.round(selectedUnit.maxHp * (skill.shieldPercentOfMaxHp + scalingBonus)));
            } else if (skill?.shieldPercentOfMag) {
              eff.value = Math.max(1, Math.round(selectedUnit.mag * (skill.shieldPercentOfMag + scalingBonus)));
            } else if (skill?.shieldPercentOfAtk) {
              eff.value = Math.max(1, Math.round(selectedUnit.atk * (skill.shieldPercentOfAtk + scalingBonus)));
            }
            if (selectedUnit.lineageShieldReflectRatio) {
              eff.reflectRatio = Math.max(eff.reflectRatio || 0, selectedUnit.lineageShieldReflectRatio);
            }
            if (selectedUnit.lineageHealShieldBonusPercent) {
              eff.value = Math.max(1, Math.round(eff.value * (1 + selectedUnit.lineageHealShieldBonusPercent / 100)));
            }
            if (hadExcessShield) {
              eff.value = Math.max(1, Math.round(eff.value * 0.5));
              addFloatingNumber(t.x, t.y, 'Escudo excessivo (-50%)!', 'status', '#FACC15');
            }
            if (eff.reflectRatio) {
              addFloatingNumber(t.x, t.y, `+${eff.value} Escudo Espinhoso (${Math.round(eff.reflectRatio * 100)}% Reflexão)`, 'shield', '#F97316');
            } else {
              addFloatingNumber(t.x, t.y, `+${eff.value} Escudo`, 'shield', '#38BDF8');
            }
          } else if (eff.type === 'buff_atk') {
            addFloatingNumber(t.x, t.y, `+${eff.value}% Dano`, 'status', '#F97316');
          } else if (eff.type === 'buff_mov') {
            addFloatingNumber(t.x, t.y, `+${eff.value} Movimento!`, 'status', '#38BDF8');
          } else if (eff.type === 'invisible') {
            addFloatingNumber(t.x, t.y, 'Invisível!', 'status', '#8B5CF6');
          } else if (eff.type === 'taunt') {
            addFloatingNumber(t.x, t.y, 'Provocação!', 'status', '#EF4444');
          }
          currentEffects = [...currentEffects.filter((e) => e.type !== eff.type), eff];
        };

        if (skill?.statusEffect) {
          applyTargetSupportEffect(skill.statusEffect);
        }

        if (skill?.secondaryStatusEffect) {
          applyTargetSupportEffect(skill.secondaryStatusEffect);
        }

        // Linhagem Celestial: Escudos e curas também fornecem aos aliados +15% de dano por 2 turnos
        if ((isHealed || isShielded) && selectedUnit.lineageHealShieldAlliesDamageBuff && t.faction === 'player' && t.id !== selectedUnit.id) {
          applyTargetSupportEffect({ type: 'buff_atk', duration: 2, value: selectedUnit.lineageHealShieldAlliesDamageBuff });
          addFloatingNumber(t.x, t.y, '+15% Dano (Graça Celestial)', 'status', '#F97316');
        }

        if (isHealed) {
          currentEffects = [
            ...currentEffects.filter((e) => e.type !== 'excess_heal'),
            { type: 'excess_heal', duration: 1, value: 50, appliedTurn: turnNumberRef.current },
          ];
        }

        if (isShielded) {
          currentEffects = [
            ...currentEffects.filter((e) => e.type !== 'excess_shield'),
            { type: 'excess_shield', duration: 1, value: 50, appliedTurn: turnNumberRef.current },
          ];
        }
      } else {
        newHp = Math.max(0, t.currentHp - actualDmg);
        if (actualDmg > 0) {
          const color = dmgResult.damageType === 'magical' ? '#B58AFF' : '#FF5252';
          addFloatingNumber(t.x, t.y, `-${actualDmg}`, dmgResult.damageType, color);
          if (t.faction !== 'player' && actualDmg >= 400) {
            massiveHitsCount++;
          }
        }
        totalDmgDone += actualDmg;
      }

      let newLastStunTurn = t.lastStunTurn;
      let newHalfHpTriggerTurn = t.halfHpTriggerTurn;
      if (
        t.isBoss &&
        !t.isMiniBoss &&
        !t.monsterTypeId?.startsWith('quimera') &&
        !t.hasUsedHalfHpSkill &&
        t.halfHpTriggerTurn === undefined &&
        newHp > 0 &&
        newHp <= t.maxHp * 0.5
      ) {
        newHalfHpTriggerTurn = turnNumberRef.current;
        addFloatingNumber(t.x, t.y, '⚠️ 50% HP: Fúria Despertando!', 'status', '#EF4444');
      }
      const isBossMonster = Boolean(t.isBoss || t.isMiniBoss);
      const isBossStunImmune =
        isBossMonster &&
        t.lastStunTurn !== undefined &&
        turnNumber - t.lastStunTurn <= 1;

      const isChimeraPhase1 = t.monsterTypeId === 'quimera_venenosa' && (!t.bossPhase || t.bossPhase === 1);
      const isChimeraTriggeringSplit = isChimeraPhase1 && (newHp <= t.maxHp * 0.3);

      const isTargetStatusImmune = currentEffects.some((e) => e.type === 'immune' && e.duration > 0);

      if (isChimeraTriggeringSplit) {
        // Chimera Phase 1 reached 30% HP or less - will split into 3 beasts
        newHp = 0;
      } else if (newHp === 0) {
        soundManager.playDeath();
        totalKills++;
        if (t.faction !== 'player' && t.monsterTypeId) {
          killedMonsterTypeIds.push(t.monsterTypeId);
        }
        if (boardRef.current) {
          await boardRef.current.playDeathAnimation(t.id);
        }
      } else {
        if (!isTargetStatusImmune) {
          const isTargetBurnPoisonImmune = t.bossVersion === 'light' || currentEffects.some((e) => e.type === 'immune_burn_poison');

          // Primary status effect
          if (skill?.statusEffect && dmgResult.damageType !== 'healing') {
            const eff = skill.statusEffect;
            if (eff.type === 'stun' && isBossStunImmune) {
              addFloatingNumber(t.x, t.y, 'Resistiu ao Atordoamento!', 'status', '#FACC15');
            } else if ((eff.type === 'burn' || eff.type === 'poison') && isTargetBurnPoisonImmune) {
              addFloatingNumber(t.x, t.y, '🛡️ Imune a Queimadura/Veneno!', 'status', '#FACC15');
            } else {
              let appliedEff = { ...eff };
              if (eff.type === 'poison' && selectedUnit.lineagePotentPoison) {
                appliedEff.value = 2;
                currentEffects = [
                  ...currentEffects.filter((e) => e.type !== 'debuff_def'),
                  { type: 'debuff_def', duration: eff.duration || 2, value: 15, appliedTurn: turnNumberRef.current },
                ];
                addFloatingNumber(t.x, t.y, '☠️ Veneno Potente (-15% DEF)!', 'status', '#84CC16');
              }
              currentEffects = [...currentEffects.filter((e) => e.type !== appliedEff.type), appliedEff];
              if (t.faction !== 'player') {
                statusInflictedCount++;
                if (eff.type === 'poison') poisonInflictedCount++;
                if (eff.type === 'burn' || eff.type === 'bleed') bleedInflictedCount++;
              }
              if (eff.type === 'burn') addFloatingNumber(t.x, t.y, 'Em Chamas!', 'status', '#F97316');
              else if (eff.type === 'poison' && !selectedUnit.lineagePotentPoison) addFloatingNumber(t.x, t.y, 'Envenenado!', 'status', '#A855F7');
              else if (eff.type === 'stun') {
                addFloatingNumber(t.x, t.y, 'Atordoado!', 'status', '#FACC15');
                if (isBossMonster) {
                  newLastStunTurn = turnNumber;
                }
              }
              else if (eff.type === 'slow') addFloatingNumber(t.x, t.y, 'Lentidão!', 'status', '#60A5FA');
              else if (eff.type === 'debuff_def') addFloatingNumber(t.x, t.y, `Defesa -${eff.value}%!`, 'status', '#EF4444');
              else if (eff.type === 'taunt') addFloatingNumber(t.x, t.y, 'Provocado!', 'status', '#EF4444');
              else if (eff.type === 'electrified') addFloatingNumber(t.x, t.y, '⚡ Eletrificado!', 'status', '#FACC15');
            }
          }

          // Secondary status effect
          if (skill?.secondaryStatusEffect && dmgResult.damageType !== 'healing') {
            const eff2 = skill.secondaryStatusEffect;
            if (eff2.type === 'stun' && isBossStunImmune) {
              addFloatingNumber(t.x, t.y, 'Resistiu ao Atordoamento!', 'status', '#FACC15');
            } else if ((eff2.type === 'burn' || eff2.type === 'poison') && isTargetBurnPoisonImmune) {
              addFloatingNumber(t.x, t.y, '🛡️ Imune a Queimadura/Veneno!', 'status', '#FACC15');
            } else {
              let appliedEff2 = { ...eff2 };
              if (eff2.type === 'poison' && selectedUnit.lineagePotentPoison) {
                appliedEff2.value = 2;
                currentEffects = [
                  ...currentEffects.filter((e) => e.type !== 'debuff_def'),
                  { type: 'debuff_def', duration: eff2.duration || 2, value: 15, appliedTurn: turnNumberRef.current },
                ];
                addFloatingNumber(t.x, t.y, '☠️ Veneno Potente (-15% DEF)!', 'status', '#84CC16');
              }
              currentEffects = [...currentEffects.filter((e) => e.type !== appliedEff2.type), appliedEff2];
              if (t.faction !== 'player') {
                statusInflictedCount++;
                if (eff2.type === 'poison') poisonInflictedCount++;
                if (eff2.type === 'burn' || eff2.type === 'bleed') bleedInflictedCount++;
              }
              if (eff2.type === 'burn') addFloatingNumber(t.x, t.y, 'Em Chamas!', 'status', '#F97316');
              else if (eff2.type === 'poison' && !selectedUnit.lineagePotentPoison) addFloatingNumber(t.x, t.y, 'Envenenado!', 'status', '#A855F7');
              else if (eff2.type === 'stun') {
                addFloatingNumber(t.x, t.y, 'Atordoado!', 'status', '#FACC15');
                if (isBossMonster) {
                  newLastStunTurn = turnNumber;
                }
              }
              else if (eff2.type === 'debuff_def') addFloatingNumber(t.x, t.y, `Defesa -${eff2.value}%!`, 'status', '#EF4444');
              else if (eff2.type === 'slow') addFloatingNumber(t.x, t.y, 'Lentidão!', 'status', '#60A5FA');
              else if (eff2.type === 'taunt') addFloatingNumber(t.x, t.y, 'Provocado!', 'status', '#EF4444');
              else if (eff2.type === 'electrified') addFloatingNumber(t.x, t.y, '⚡ Eletrificado!', 'status', '#FACC15');
            }
          }
        } else if ((skill?.statusEffect || skill?.secondaryStatusEffect) && dmgResult.damageType !== 'healing') {
          addFloatingNumber(t.x, t.y, '🛡️ Imune a Efeitos!', 'status', '#A855F7');
        }
      }

      // Lineage: Dragonoide applies Severe Burn (3% max HP per turn)
      if (selectedUnit.lineageSevereBurn && t.faction !== 'player' && dmgResult.damageType !== 'healing' && newHp > 0) {
        const cannotBurn = currentEffects.some((e) => e.type === 'immune' || e.type === 'immune_burn_poison') || t.bossVersion === 'light';
        if (!cannotBurn) {
          currentEffects = [
            ...currentEffects.filter((e) => e.type !== 'burn'),
            { type: 'burn', duration: 2, value: 3, appliedTurn: turnNumberRef.current },
          ];
          statusInflictedCount++;
          addFloatingNumber(t.x, t.y, '🔥 Queimadura Severa (3%)!', 'status', '#FF6B00');
        }
      }

      // Knockback displacement (Disparo de Impacto, Habilidades de Vento)
      let finalTargetX = t.x;
      let finalTargetY = t.y;
      if (skill?.knockback && skill.knockback > 0 && newHp > 0) {
        // Determine push origin: for ground AoE skills, push outward from the impact center
        const originX =
          skill.canTargetGround && aoeCenter && (t.x !== aoeCenter.x || t.y !== aoeCenter.y)
            ? aoeCenter.x
            : finalAttackerX;
        const originY =
          skill.canTargetGround && aoeCenter && (t.x !== aoeCenter.x || t.y !== aoeCenter.y)
            ? aoeCenter.y
            : finalAttackerY;
        const dx = t.x - originX;
        const dy = t.y - originY;
        let pushX = 0;
        let pushY = 0;
        if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
          pushX = Math.sign(dx);
        } else if (dy !== 0) {
          pushY = Math.sign(dy);
        }

        let currX = t.x;
        let currY = t.y;
        let stepsPushed = 0;
        const extraPush = selectedUnit.lineageExtraPushDistance || 0;
        const maxSteps = skill.knockback + extraPush;

        for (let s = 0; s < maxSteps; s++) {
          const nextX = currX + pushX;
          const nextY = currY + pushY;
          const inBounds = nextX >= 0 && nextX < grid[0].length && nextY >= 0 && nextY < grid.length;
          const isWalkable = inBounds && grid[nextY][nextX].isWalkable;
          const isOccupied = inBounds && updatedUnits.some((u) => !u.isDead && u.id !== t.id && u.x === nextX && u.y === nextY);

          if (inBounds && isWalkable && !isOccupied) {
            currX = nextX;
            currY = nextY;
            stepsPushed++;
          } else {
            if (t.faction !== 'player') {
              // Caster's primary stat for scaling collision damage
              const statPower = skill.damageType === 'magical'
                ? (selectedUnit.mag || selectedUnit.atk)
                : (selectedUnit.atk || selectedUnit.mag);
              // Substantial collision damage: 40% of caster's primary stat + baseline
              const colDmg = Math.max(6, Math.round(statPower * 0.40));
              newHp = Math.max(0, newHp - colDmg);
              totalDmgDone += colDmg;
              soundManager.playPhysicalAttack();
              addFloatingNumber(currX, currY, `💥 Colisão! -${colDmg}`, 'physical', '#F97316');

              // If collided into another enemy unit, that obstacle unit also takes impact shock!
              if (inBounds && isOccupied) {
                const collidedWith = updatedUnits.find((u) => !u.isDead && u.id !== t.id && u.x === nextX && u.y === nextY);
                if (collidedWith && collidedWith.faction !== 'player') {
                  const secondaryColDmg = Math.max(4, Math.round(colDmg * 0.75));
                  const nextColHp = Math.max(0, collidedWith.currentHp - secondaryColDmg);
                  const colDead = nextColHp === 0;
                  totalDmgDone += secondaryColDmg;
                  addFloatingNumber(nextX, nextY, `💥 Impacto! -${secondaryColDmg}`, 'physical', '#F97316');
                  
                  updatedUnits = updatedUnits.map((u) =>
                    u.id === collidedWith.id ? { ...u, currentHp: nextColHp, isDead: colDead } : u
                  );

                  if (colDead) {
                    soundManager.playDeath();
                    totalKills++;
                    if (boardRef.current) {
                      boardRef.current.playDeathAnimation(collidedWith.id);
                    }
                  }
                }
              }

              if (newHp === 0) {
                soundManager.playDeath();
                totalKills++;
                if (boardRef.current) {
                  await boardRef.current.playDeathAnimation(t.id);
                }
              }
            }
            break;
          }
        }

        if (stepsPushed > 0) {
          finalTargetX = currX;
          finalTargetY = currY;
          if (t.faction !== 'player') enemiesPushedCount++;
          if (boardRef.current) {
            await boardRef.current.playMoveAnimation(t.id, t.x, t.y, currX, currY);
          }
          addFloatingNumber(currX, currY, t.faction === 'player' ? 'Impulso de Vento!' : 'Recuo Forçado!', 'status', '#38BDF8');

          const elecEff = currentEffects.find((e) => e.type === 'electrified' && e.duration > 0);
          if (elecEff && newHp > 0) {
            const elecDmg = Math.max(1, Math.round(t.maxHp * ((elecEff.value || 1) / 100))) * stepsPushed;
            newHp = Math.max(0, newHp - elecDmg);
            addFloatingNumber(currX, currY, `-${elecDmg} Choque (${stepsPushed}x)`, 'status', '#FACC15');
            if (newHp === 0) {
              soundManager.playDeath();
              totalKills++;
              if (boardRef.current) {
                await boardRef.current.playDeathAnimation(t.id);
              }
            }
          }
        }
      }

      // PULL TO CENTER (Buraco Negro: puxa todos os inimigos 1 casa em direção ao centro)
      if (skill?.pullToCenter && skill.pullToCenter > 0 && newHp > 0 && t.faction !== 'player') {
        const centerPt = target;
        if (t.x !== centerPt.x || t.y !== centerPt.y) {
          const dx = centerPt.x - t.x;
          const dy = centerPt.y - t.y;
          let pX = 0;
          let pY = 0;
          if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
            pX = Math.sign(dx);
          } else if (dy !== 0) {
            pY = Math.sign(dy);
          }

          const nextX = t.x + pX;
          const nextY = t.y + pY;
          const inBounds = nextX >= 0 && nextX < grid[0].length && nextY >= 0 && nextY < grid.length;
          const isWalkable = inBounds && grid[nextY][nextX].isWalkable;
          const isOccupied = inBounds && updatedUnits.some((u) => !u.isDead && u.id !== t.id && u.x === nextX && u.y === nextY);

          if (inBounds && isWalkable && !isOccupied) {
            finalTargetX = nextX;
            finalTargetY = nextY;
            if (boardRef.current) {
              await boardRef.current.playMoveAnimation(t.id, t.x, t.y, nextX, nextY);
            }
            addFloatingNumber(nextX, nextY, '🕳️ Puxado pelo Vácuo!', 'status', '#9D4EDD');
          }
        }
      }

      // DIRECT PULL (Fenda Singular: puxa em direção ao conjurador)
      if (skill?.pull && skill.pull > 0 && newHp > 0 && t.faction !== 'player') {
        const dx = finalAttackerX - t.x;
        const dy = finalAttackerY - t.y;
        let pX = 0;
        let pY = 0;
        if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
          pX = Math.sign(dx);
        } else if (dy !== 0) {
          pY = Math.sign(dy);
        }

        let currX = t.x;
        let currY = t.y;
        let pulledSteps = 0;
        for (let s = 0; s < skill.pull; s++) {
          const nextX = currX + pX;
          const nextY = currY + pY;
          if (nextX === finalAttackerX && nextY === finalAttackerY) break;
          const inBounds = nextX >= 0 && nextX < grid[0].length && nextY >= 0 && nextY < grid.length;
          const isWalkable = inBounds && grid[nextY][nextX].isWalkable;
          const isOccupied = inBounds && updatedUnits.some((u) => !u.isDead && u.id !== t.id && u.x === nextX && u.y === nextY);
          if (inBounds && isWalkable && !isOccupied) {
            currX = nextX;
            currY = nextY;
            pulledSteps++;
          } else break;
        }

        if (pulledSteps > 0) {
          finalTargetX = currX;
          finalTargetY = currY;
          if (boardRef.current) {
            await boardRef.current.playMoveAnimation(t.id, t.x, t.y, currX, currY);
          }
          addFloatingNumber(currX, currY, '🌀 Puxado!', 'status', '#9D4EDD');
        }
      }

      updatedUnits = updatedUnits.map((u) =>
        u.id === t.id
          ? {
              ...u,
              x: finalTargetX,
              y: finalTargetY,
              currentHp: newHp,
              isDead: newHp === 0,
              statusEffects: currentEffects,
              lastStunTurn: newLastStunTurn,
              halfHpTriggerTurn: newHalfHpTriggerTurn,
              hasMoved: allyHasMoved,
              hasAttacked: allyHasAttacked,
            }
          : u
      );
    }

    // Ally status effects in AoE (e.g. Solo Consagrado / Consagração)
    if (skill?.alliesStatusEffect) {
      const origin = { x: selectedUnit.x, y: selectedUnit.y };
      const hitTiles = aoeRadius > 0
        ? getAoETiles(aoeCenter, aoeRadius, grid[0].length, grid.length, skill?.aoeType || 'circle', origin)
        : [{ x: target.x, y: target.y }];

      const allyFaction = selectedUnit.faction;
      const alliesInArea = updatedUnits.filter(
        (u) =>
          u.faction === allyFaction &&
          !u.isDead &&
          hitTiles.some((pt) => pt.x === u.x && pt.y === u.y)
      );

      if (alliesInArea.length > 0) {
        soundManager.playShield();
      }

      for (const ally of alliesInArea) {
        const allyEff = { ...skill.alliesStatusEffect, appliedTurn: turnNumberRef.current };
        let allyEffects = [...(ally.statusEffects || [])];

        if (allyEff.type === 'shield') {
          const hadExcessShield = allyEffects.some((e) => e.type === 'excess_shield' && e.duration > 0);
          if (hadExcessShield) {
            allyEff.value = Math.max(1, Math.round(allyEff.value * 0.5));
            addFloatingNumber(ally.x, ally.y, 'Escudo excessivo (-50%)!', 'status', '#FACC15');
          }
          addFloatingNumber(ally.x, ally.y, `+${allyEff.value} Escudo`, 'shield', '#38BDF8');
          allyEffects = [
            ...allyEffects.filter((e) => e.type !== 'excess_shield'),
            { type: 'excess_shield', duration: 1, value: 50, appliedTurn: turnNumberRef.current },
          ];
        } else if (allyEff.type === 'buff_atk') {
          addFloatingNumber(ally.x, ally.y, `+${allyEff.value}% Dano`, 'status', '#F97316');
        } else if (allyEff.type === 'buff_mov') {
          addFloatingNumber(ally.x, ally.y, `+${allyEff.value} Movimento!`, 'status', '#38BDF8');
        }

        allyEffects = [...allyEffects.filter((e) => e.type !== allyEff.type), allyEff];

        updatedUnits = updatedUnits.map((u) => (u.id === ally.id ? { ...u, statusEffects: allyEffects } : u));
      }
    }

    // Retrieve attacker's updated state from the loop (in case attacker healed or shielded themselves)
    const attackerAfterLoop = updatedUnits.find((u) => u.id === selectedUnit.id);
    let finalAttackerHp = attackerAfterLoop ? attackerAfterLoop.currentHp : currentAttackerHp;
    let finalAttackerEffects = attackerAfterLoop ? attackerAfterLoop.statusEffects : attackerEffects;
    if (wasInvisible) {
      finalAttackerEffects = finalAttackerEffects.filter((e) => e.type !== 'invisible');
    }

    // LIFESTEAL & AUTO-CURA DA HABILIDADE (Golpe Sagrado: 30%, Dreno de Vida, etc.)
    const isGolpeSagrado = skill?.id === 'golpe_sagrado' || skill?.id?.startsWith('golpe_sagrado');
    const lifestealPct =
      (selectedUnit.lineageLifestealPercent || 0) +
      (skill?.lifestealPercent ??
        (skill?.id === 'dreno_de_vida' || skill?.id === 'dreno_de_seiva'
          ? 100
          : isGolpeSagrado
          ? 30
          : 0));

    if ((lifestealPct > 0 || isGolpeSagrado) && (totalDmgDone > 0 || isGolpeSagrado)) {
      const isAttackerAntiHealed = gridRef.current?.[finalAttackerY]?.[finalAttackerX]?.antiHealPermanent;
      if (isAttackerAntiHealed) {
        addFloatingNumber(finalAttackerX, finalAttackerY, '🚫 Dreno Bloqueado (Solo Amaldiçoado)!', 'status', '#A855F7');
      } else {
        const hadExcessHeal = finalAttackerEffects.some((e) => e.type === 'excess_heal' && e.duration > 0);
        let healAmt = isGolpeSagrado
          ? Math.max(1, Math.round(selectedUnit.mag * 0.3), Math.round(totalDmgDone * 0.3))
          : Math.max(1, Math.round(totalDmgDone * (lifestealPct / 100)));

        if (hadExcessHeal) {
          healAmt = Math.max(1, Math.round(healAmt * 0.5));
          addFloatingNumber(finalAttackerX, finalAttackerY, 'Cura excessiva (-50%)!', 'status', '#FACC15');
        } else {
          addFloatingNumber(finalAttackerX, finalAttackerY, 'Cura excessiva aplicada!', 'status', '#F59E0B');
        }

        const newHp = Math.min(selectedUnit.maxHp, finalAttackerHp + healAmt);
        const actualHealed = newHp - finalAttackerHp;
        if (actualHealed > 0) {
          finalAttackerHp = newHp;
          const tag = isGolpeSagrado ? 'Cura Sagrada' : 'Dreno';
          addFloatingNumber(finalAttackerX, finalAttackerY, `+${actualHealed} (${tag})`, 'healing', '#56E59A');
          soundManager.playHeal();
        } else {
          // Feedback visual imediato mesmo com vida cheia para confirmar a ativação da cura
          addFloatingNumber(finalAttackerX, finalAttackerY, '+0 (Vida Máxima)', 'healing', '#56E59A');
          soundManager.playHeal();
        }

        finalAttackerEffects = [
          ...finalAttackerEffects.filter((e) => e.type !== 'excess_heal'),
          { type: 'excess_heal', duration: 1, value: 50, appliedTurn: turnNumberRef.current },
        ];
      }
    }

    // Shield from damage dealt (e.g. Golpe de Luz Condensada do Cavaleiro Mágico)
    if (skill?.shieldFromDamagePercent && totalDmgDone > 0) {
      let shieldVal = Math.max(1, Math.round(totalDmgDone * (skill.shieldFromDamagePercent / 100)));
      const hadExcessShield = finalAttackerEffects.some((e) => e.type === 'excess_shield' && e.duration > 0);
      if (hadExcessShield) {
        shieldVal = Math.max(1, Math.round(shieldVal * 0.5));
        addFloatingNumber(finalAttackerX, finalAttackerY, 'Escudo excessivo (-50%)!', 'status', '#FACC15');
      }
      soundManager.playShield();
      addFloatingNumber(finalAttackerX, finalAttackerY, `+${shieldVal} Escudo (Luz Condensada)`, 'shield', '#38BDF8');

      const currentShield = finalAttackerEffects.find((e) => e.type === 'shield')?.value || 0;
      finalAttackerEffects = [
        ...finalAttackerEffects.filter((e) => e.type !== 'shield'),
        { type: 'shield', duration: 2, value: currentShield + shieldVal, appliedTurn: turnNumberRef.current },
      ];
      finalAttackerEffects = [
        ...finalAttackerEffects.filter((e) => e.type !== 'excess_shield'),
        { type: 'excess_shield', duration: 1, value: 50, appliedTurn: turnNumberRef.current },
      ];
    }

    // Repositioning / movement after skill (Recuo Tático / Recuo da Lança)
    const canMoveAgain =
      skill?.id === 'recuo_tatico' ||
      skill?.id?.startsWith('recuo_tatico') ||
      skill?.id === 'recuo_da_lanca' ||
      skill?.id?.startsWith('recuo_da_lanca');
    if (canMoveAgain) {
      addFloatingNumber(finalAttackerX, finalAttackerY, 'Recuo Disponível!', 'status', '#60A5FA');
    }

    // Caster Status Effect (e.g. self-shield, stealth, or buff on attack)
    if (skill?.casterStatusEffect) {
      const cEff = { ...skill.casterStatusEffect, appliedTurn: turnNumberRef.current };
      if (cEff.type === 'shield') {
        const scalingBonus = selectedUnit.lineageHealShieldFlatScalingBonus || 0;
        if (skill.shieldPercentOfMaxHp) {
          cEff.value = Math.max(1, Math.round(selectedUnit.maxHp * (skill.shieldPercentOfMaxHp + scalingBonus)));
        } else if (skill.shieldPercentOfMag) {
          cEff.value = Math.max(1, Math.round(selectedUnit.mag * (skill.shieldPercentOfMag + scalingBonus)));
        } else if (skill.shieldPercentOfAtk) {
          cEff.value = Math.max(1, Math.round(selectedUnit.atk * (skill.shieldPercentOfAtk + scalingBonus)));
        }
        if (selectedUnit.lineageShieldReflectRatio) {
          cEff.reflectRatio = Math.max(cEff.reflectRatio || 0, selectedUnit.lineageShieldReflectRatio);
        }
        const hadExcessShield = finalAttackerEffects.some((e) => e.type === 'excess_shield' && e.duration > 0);
        if (hadExcessShield) {
          cEff.value = Math.max(1, Math.round(cEff.value * 0.5));
          addFloatingNumber(finalAttackerX, finalAttackerY, 'Escudo excessivo (-50%)!', 'status', '#FACC15');
        }
        soundManager.playShield();
        if (cEff.reflectRatio) {
          addFloatingNumber(finalAttackerX, finalAttackerY, `+${cEff.value} Escudo Espinhoso (${Math.round(cEff.reflectRatio * 100)}% Reflexão)`, 'shield', '#F97316');
        } else {
          addFloatingNumber(finalAttackerX, finalAttackerY, `+${cEff.value} Escudo`, 'shield', '#38BDF8');
        }
        finalAttackerEffects = [
          ...finalAttackerEffects.filter((e) => e.type !== 'excess_shield'),
          { type: 'excess_shield', duration: 1, value: 50, appliedTurn: turnNumberRef.current },
        ];
      } else if (cEff.type === 'buff_atk') {
        addFloatingNumber(finalAttackerX, finalAttackerY, `+${cEff.value}% Dano`, 'status', '#F97316');
      } else if (cEff.type === 'buff_mov') {
        addFloatingNumber(finalAttackerX, finalAttackerY, `+${cEff.value} Movimento!`, 'status', '#38BDF8');
      } else if (cEff.type === 'invisible') {
        addFloatingNumber(finalAttackerX, finalAttackerY, 'Invisível!', 'status', '#8B5CF6');
      } else if (cEff.type === 'taunt') {
        addFloatingNumber(finalAttackerX, finalAttackerY, 'Provocando Inimigos!', 'status', '#EF4444');
      }
      finalAttackerEffects = [...finalAttackerEffects.filter((e) => e.type !== cEff.type), cEff];
    }

    // ACTION RESET MECHANIC ON KILL: Carrasco do Vazio or any skill with resetsActionOnKill
    const isExecutionKill =
      (skill?.resetsActionOnKill ||
        skill?.id === 'decapitacao_do_vazio' ||
        skill?.id?.startsWith('decapitacao_do_vazio') ||
        skill?.id === 'avanco_dimensional' ||
        skill?.id?.startsWith('avanco_dimensional')) &&
      totalKills > 0;

    if (isExecutionKill) {
      soundManager.playUpgrade();
      addFloatingNumber(finalAttackerX, finalAttackerY, 'EXECUÇÃO! +1 AÇÃO!', 'status', '#C77DFF');
    }

    // STEALTH ON KILL MECHANIC: e.g. Golpe de Execução do Assassino
    const isStealthOnKill =
      (skill?.stealthOnKill || skill?.id === 'execucao' || skill?.id?.startsWith('execucao')) &&
      totalKills > 0;

    if (isStealthOnKill) {
      soundManager.playUpgrade();
      addFloatingNumber(finalAttackerX, finalAttackerY, 'Invisível (Execução)!', 'status', '#8B5CF6');
      finalAttackerEffects = [
        ...finalAttackerEffects.filter((e) => e.type !== 'invisible'),
        { type: 'invisible', duration: 1, value: 1, appliedTurn: turnNumberRef.current },
      ];
    }

    if (skill?.id === 'lagrimas_rubras') {
      soundManager.playVictory();
      addFloatingNumber(finalAttackerX, finalAttackerY, '🌌 O MUNDO PERDE AS CORES...', 'status', '#EF4444');
    }

    updatedUnits = updatedUnits.map((u) => {
      if (u.id === selectedUnit.id) {
        const isKitsuneEligible =
          skill &&
          Boolean(u.lineageKitsuneFreeSkillReset) &&
          !u.hasUsedKitsuneReset &&
          skill.statusEffect?.type !== 'stun' &&
          skill.secondaryStatusEffect?.type !== 'stun' &&
          skill.id !== 'golpe_atordoante';

        if (isKitsuneEligible) {
          addFloatingNumber(finalAttackerX, finalAttackerY, '🦊 Astúcia da Kitsune (Cooldown Restaurado)!', 'status', '#F472B6');
        }

        const updatedSkills = u.skills.map((s) => {
          if (skill && s.id === skill.id) {
            if (isExecutionKill && (skill.resetsCooldownOnKill || skill.id === 'avanco_dimensional')) {
              return { ...s, currentCooldown: 0 };
            }
            if (isKitsuneEligible) {
              return { ...s, currentCooldown: 0, lastUsedTurn: turnNumberRef.current };
            }
            return { ...s, currentCooldown: s.cooldownMax, lastUsedTurn: turnNumberRef.current };
          }
          return s;
        });

        const isLayingRubras = skill?.id === 'lagrimas_rubras';
        const nextSkillUsesCount = isLayingRubras
          ? 0
          : (u.skillUsesCount || 0) + (skill ? 1 : 0);

        const isNefalimExtra =
          !isExecutionKill &&
          Boolean(u.lineageExtraAttackEveryTurn) &&
          !u.nefalimExtraAttackUsed;

        if (isNefalimExtra) {
          addFloatingNumber(finalAttackerX, finalAttackerY, '⚔️ Ataque Adicional (Nefalim)!', 'status', '#F59E0B');
        }

        return {
          ...u,
          x: finalAttackerX,
          y: finalAttackerY,
          currentHp: finalAttackerHp,
          hasMoved: isExecutionKill ? false : (canMoveAgain ? false : u.hasMoved),
          hasAttacked: isExecutionKill ? false : (isNefalimExtra ? false : true),
          nefalimExtraAttackUsed: isNefalimExtra ? true : u.nefalimExtraAttackUsed,
          centaurMovedTilesThisTurn: 0,
          hasUsedKitsuneReset: isKitsuneEligible ? true : u.hasUsedKitsuneReset,
          skills: updatedSkills,
          statusEffects: finalAttackerEffects,
          damageDealt: u.damageDealt + totalDmgDone,
          kills: u.kills + totalKills,
          skillUsesCount: nextSkillUsesCount,
        };
      }
      return u;
    });

    if (selectedUnit.faction === 'player' && !isTrainingMode) {
      setProgress((prev) => {
        let p = prev;
        if (totalDmgDone > 0) {
          p = incrementClassStat(p, selectedUnit.className, 'damage_dealt', totalDmgDone);
        }
        if (totalKills > 0) {
          p = incrementClassStat(p, selectedUnit.className, 'kills', totalKills);
        }
        const attackerWasLowHp = selectedUnit.currentHp < selectedUnit.maxHp * 0.2;
        const lowHpKillsEarned = attackerWasLowHp ? totalKills : 0;
        const basicKillsEarned = !skill ? totalKills : 0;
        const skillsCastEarned = skill ? 1 : 0;
        if (
          totalHealDone > 0 ||
          massiveHitsCount > 0 ||
          statusInflictedCount > 0 ||
          lowHpKillsEarned > 0 ||
          basicKillsEarned > 0 ||
          poisonInflictedCount > 0 ||
          bleedInflictedCount > 0 ||
          enemiesPushedCount > 0 ||
          skillsCastEarned > 0
        ) {
          const prevStats = p.lineageQuestStats || {};
          p = {
            ...p,
            lineageQuestStats: {
              ...prevStats,
              healingDone: (prevStats.healingDone || 0) + totalHealDone,
              massiveHits: (prevStats.massiveHits || 0) + massiveHitsCount,
              statusInflicted: (prevStats.statusInflicted || 0) + statusInflictedCount,
              lowHpKills: (prevStats.lowHpKills || 0) + lowHpKillsEarned,
              basicAttackKills: (prevStats.basicAttackKills || 0) + basicKillsEarned,
              poisonInflicted: (prevStats.poisonInflicted || 0) + poisonInflictedCount,
              bleedInflicted: (prevStats.bleedInflicted || 0) + bleedInflictedCount,
              enemiesPushed: (prevStats.enemiesPushed || 0) + enemiesPushedCount,
              skillsCast: (prevStats.skillsCast || 0) + skillsCastEarned,
            },
          };
        }
        if (killedMonsterTypeIds.length > 0) {
          const currentKills = { ...(p.monsterKills || {}) };
          for (const mId of killedMonsterTypeIds) {
            currentKills[mId] = (currentKills[mId] || 0) + 1;
          }
          p = { ...p, monsterKills: currentKills };
        }
        if (skill) {
          p = incrementClassStat(p, selectedUnit.className, 'skill_uses', 1);
        }
        const newLineages = checkLineageUnlockQuests(p);
        if (newLineages.length > 0) {
          p = {
            ...p,
            unlockedLineages: Array.from(new Set([...(p.unlockedLineages || INITIAL_UNLOCKED_LINEAGES), ...newLineages])),
          };
          setPendingUnlockLineages((prevPending) => Array.from(new Set([...prevPending, ...newLineages])));
        }
        progressRef.current = p;
        savePlayerProgress(p);
        return p;
      });
    }

    if (isTrainingMode && totalDmgDone > 0) {
      setTrainingDamageStats((prev) => ({
        totalDamage: prev.totalDamage + totalDmgDone,
        highestHit: Math.max(prev.highestHit, totalDmgDone),
        hitCount: prev.hitCount + 1,
      }));
    }

    const splitCheck = await checkAndTriggerChimeraSplit(updatedUnits);
    if (splitCheck.didSplit) {
      updatedUnits = splitCheck.updatedUnits;
    }

    const crystalCheck = await checkAndTriggerCrystalDestruction(updatedUnits);
    if (crystalCheck.didTrigger) {
      updatedUnits = crystalCheck.updatedUnits;
    }

    setUnits(updatedUnits);
    setTargetTeleportPoint(null);
    setTargetAoEPoint(null);
    setTargetUnitId(null);
    setSelectedAction('none');
    setActiveSkill(null);
    setIsAnimatingAction(false);

    if (isExecutionKill) {
      setSelectedUnitId(selectedUnit.id);
    } else if (canMoveAgain) {
      setSelectedUnitId(selectedUnit.id);
      setSelectedAction('move');
    } else if (selectedUnit.lineageExtraAttackEveryTurn && !selectedUnit.nefalimExtraAttackUsed) {
      setSelectedUnitId(selectedUnit.id);
    }

    setTimeout(() => checkBattleStatusWithUnits(updatedUnits), 200);
  };

  // ANIMATED AI Turn
  const runAiTurn = useCallback(async (initialUnitsOverride?: Unit[]) => {
    let currentUnits = initialUnitsOverride ? [...initialUnitsOverride] : [...units];
    const delayMult = progress.combatSpeed === 'fast' ? 0.5 : 1.0;

    // DoT damage tick (Burn & Poison) for monsters at start of AI turn
    let anyMonsterDamagedByDoT = false;
    const dotKilledMonsterTypes: string[] = [];
    currentUnits = currentUnits.map((u) => {
      if (u.faction === 'enemy' && !u.isDead) {
        let currentHp = u.currentHp;
        let isDead: boolean = Boolean(u.isDead);

        // Burn tick (Queimadura) - 2% da vida máxima
        const burn = u.statusEffects?.find((e) => e.type === 'burn');
        if (burn && !isDead) {
          anyMonsterDamagedByDoT = true;
          const bDmg = Math.max(1, Math.round(u.maxHp * ((burn.value || 2) / 100)));
          currentHp = Math.max(0, currentHp - bDmg);
          isDead = currentHp === 0;
          addFloatingNumber(u.x, u.y, `-${bDmg} Queimadura (${burn.value || 2}%)`, 'status', '#F97316');
        }

        // Poison tick (Veneno) - 2% da vida máxima
        const poison = u.statusEffects?.find((e) => e.type === 'poison');
        if (poison && !isDead) {
          anyMonsterDamagedByDoT = true;
          const pDmg = Math.max(1, Math.round(u.maxHp * ((poison.value || 2) / 100)));
          currentHp = Math.max(0, currentHp - pDmg);
          isDead = currentHp === 0;
          addFloatingNumber(u.x, u.y, `-${pDmg} Veneno (2%)`, 'status', '#A855F7');
        }

        if (isDead && !u.isDead && u.monsterTypeId) {
          dotKilledMonsterTypes.push(u.monsterTypeId);
        }

        if (isDead !== u.isDead || currentHp !== u.currentHp) {
          return { ...u, currentHp, isDead };
        }
      }
      return u;
    });

    if (!isTrainingMode && dotKilledMonsterTypes.length > 0) {
      setProgress((prev) => {
        const currentKills = { ...(prev.monsterKills || {}) };
        for (const mId of dotKilledMonsterTypes) {
          currentKills[mId] = (currentKills[mId] || 0) + 1;
        }
        let p: PlayerProgress = { ...prev, monsterKills: currentKills };
        const newLineages = checkLineageUnlockQuests(p);
        if (newLineages.length > 0) {
          p = {
            ...p,
            unlockedLineages: Array.from(new Set([...(p.unlockedLineages || INITIAL_UNLOCKED_LINEAGES), ...newLineages])),
          };
          setPendingUnlockLineages((prevPending) => Array.from(new Set([...prevPending, ...newLineages])));
        }
        progressRef.current = p;
        savePlayerProgress(p);
        return p;
      });
    }

    if (anyMonsterDamagedByDoT) {
      setUnits([...currentUnits]);
      await new Promise((r) => setTimeout(r, 300 * delayMult));
    }

    const dotSplit = await checkAndTriggerChimeraSplit(currentUnits);
    if (dotSplit.didSplit) {
      currentUnits = dotSplit.updatedUnits;
    }

    const dotCrystal = await checkAndTriggerCrystalDestruction(currentUnits);
    if (dotCrystal.didTrigger) {
      currentUnits = dotCrystal.updatedUnits;
    }

    // Registra bosses cuja vida atingiu <= 50% para ativação no turno posterior
    currentUnits = currentUnits.map((u) => {
      if (
        u.faction === 'enemy' &&
        u.isBoss &&
        !u.isMiniBoss &&
        !u.monsterTypeId?.startsWith('quimera') &&
        !u.isDead &&
        u.currentHp > 0 &&
        u.currentHp <= u.maxHp * 0.5 &&
        u.halfHpTriggerTurn === undefined &&
        !u.hasUsedHalfHpSkill
      ) {
        addFloatingNumber(u.x, u.y, '⚠️ 50% HP: Fúria Despertando!', 'status', '#EF4444');
        return { ...u, halfHpTriggerTurn: turnNumberRef.current };
      }
      return u;
    });

    const aliveEnemiesAtStart = currentUnits.filter((u) => u.faction === 'enemy' && !u.isDead);
    if (aliveEnemiesAtStart.length === 0) {
      handleVictory(currentUnits);
      return;
    }

    const monsters = currentUnits.filter((u) => u.faction === 'enemy' && !u.isDead);

    for (const monster of monsters) {
      const initialMonsterCheck = currentUnits.find((u) => u.id === monster.id);
      if (!initialMonsterCheck || initialMonsterCheck.isDead) continue;

      let extraTurnsAllowed = 1;
      const hasIntactShield = (initialMonsterCheck.statusEffects || []).some((e) => e.type === 'shield' && e.value > 0);
      if (initialMonsterCheck.bossVersion === 'light' && initialMonsterCheck.lightDoubleActionPending) {
        if (hasIntactShield) {
          extraTurnsAllowed = 2;
          addFloatingNumber(initialMonsterCheck.x, initialMonsterCheck.y, '⚡ Bastião Intacto: DUPLA AÇÃO!', 'status', '#FACC15');
        } else {
          addFloatingNumber(initialMonsterCheck.x, initialMonsterCheck.y, 'Escudo quebrado: Ação normal', 'status', '#94A3B8');
        }
        currentUnits = currentUnits.map((u) =>
          u.id === initialMonsterCheck.id ? { ...u, lightDoubleActionPending: false } : u
        );
      }

      while (extraTurnsAllowed > 0) {
        extraTurnsAllowed--;
        const monsterUnit = currentUnits.find((u) => u.id === monster.id);
        if (!monsterUnit || monsterUnit.isDead) break;
        let freshMonster: Unit = monsterUnit;

        const isStunned = freshMonster.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0);
        if (isStunned) {
          addFloatingNumber(freshMonster.x, freshMonster.y, 'Atordoado!', 'status', '#FACC15');
          await new Promise((r) => setTimeout(r, 200 * delayMult));
          break;
        }

      // Boss Threshold Skill (50% HP): Ativa no turno posterior a suas vidas chegarem a 50%, exatamente 1 vez por combate
      const isBossThresholdReady =
        freshMonster.isBoss &&
        !freshMonster.isMiniBoss &&
        !freshMonster.monsterTypeId?.startsWith('quimera') &&
        !freshMonster.hasUsedHalfHpSkill &&
        freshMonster.halfHpTriggerTurn !== undefined &&
        turnNumberRef.current > freshMonster.halfHpTriggerTurn;

      if (isBossThresholdReady) {
        const bossType = freshMonster.monsterTypeId ||
          (freshMonster.name.toLowerCase().includes('astaroth') ? 'astaroth' :
           freshMonster.name.toLowerCase().includes('vulcanus') ? 'tita_forjador' :
           freshMonster.name.toLowerCase().includes('valgar') ? 'valgar_sanguinario' :
           freshMonster.name.toLowerCase().includes('leviat') ? 'leviata_vazio' :
           freshMonster.name.toLowerCase().includes('malakor') ? 'cronos_abissal' : 'astaroth');

        let bossSkill: Skill;
        if (bossType === 'astaroth') {
          bossSkill = SKILLS.boss_astaroth_cataclismo;
        } else if (bossType === 'tita_forjador') {
          bossSkill = SKILLS.boss_vulcanus_terremoto;
        } else if (bossType === 'valgar_sanguinario') {
          bossSkill = SKILLS.boss_valgar_banquete_sangue;
        } else if (bossType === 'leviata_vazio') {
          bossSkill = SKILLS.boss_leviata_singularidade;
        } else {
          bossSkill = SKILLS.boss_malakor_colapso_temporal;
        }

        const livingPlayers = currentUnits.filter((u) => u.faction === 'player' && !u.isDead);

        if (bossType === 'astaroth') {
          // Fase 10: 200% de dano mágico em todos os inimigos no mapa
          addFloatingNumber(freshMonster.x, freshMonster.y, '💥 CATACLISMO DO ABISMO (200%)!', 'status', '#9333EA');
          soundManager.playMagicSpell();

          for (const target of livingPlayers) {
            if (boardRef.current) {
              await boardRef.current.playAttackAnimation(freshMonster.id, target.id, 'magical', 0, bossSkill);
            }
            const res = rollActualDamage(freshMonster, target, bossSkill);
            let actualDmg = res.finalDamage;
            let currentEffects = [...(target.statusEffects || [])];

            for (let i = 0; i < currentEffects.length; i++) {
              if (currentEffects[i].type === 'shield' && currentEffects[i].value > 0) {
                const sh = currentEffects[i];
                const dmgAbsorbed = Math.min(sh.value, actualDmg);
                sh.value -= dmgAbsorbed;
                actualDmg -= dmgAbsorbed;
                addFloatingNumber(target.x, target.y, '-' + dmgAbsorbed + ' (Escudo)', 'shield', '#38BDF8');
                if (actualDmg === 0) break;
              }
            }
            currentEffects = currentEffects.filter((e) => e.type !== 'shield' || e.value > 0);

            const newHp = Math.max(0, target.currentHp - actualDmg);
            if (actualDmg > 0) {
              addFloatingNumber(target.x, target.y, '-' + actualDmg, 'magical', '#B58AFF');
            }
            if (newHp === 0) {
              soundManager.playDeath();
              if (boardRef.current) {
                await boardRef.current.playDeathAnimation(target.id);
              }
            }
            currentUnits = currentUnits.map((u) =>
              u.id === target.id ? { ...u, currentHp: newHp, isDead: newHp === 0, statusEffects: currentEffects } : u
            );
          }

          // Espalha poças de corrupção ao redor de Astaroth (área 3x3 ao seu redor, 3 turnos)
          const puddleTiles: { x: number; y: number }[] = [];
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const px = freshMonster.x + dx;
              const py = freshMonster.y + dy;
              if (px >= 0 && px < grid[0].length && py >= 0 && py < grid.length && grid[py][px].isWalkable) {
                puddleTiles.push({ x: px, y: py });
              }
            }
          }
          if (puddleTiles.length > 0) {
            setGrid((prevGrid) => {
              const nextGrid = prevGrid.map((row, rY) =>
                row.map((cell, cX) => {
                  if (puddleTiles.some((pt) => pt.x === cX && pt.y === rY)) {
                    return { ...cell, corruptionTurns: 3 };
                  }
                  return cell;
                })
              );
              gridRef.current = nextGrid;
              return nextGrid;
            });
          }

          // Puxa todos os heróis sobreviventes para casas adjacentes a Astaroth
          const survivingHeroes = currentUnits.filter((u) => u.faction === 'player' && !u.isDead);
          if (survivingHeroes.length > 0) {
            const adjacentOffsets = [
              { dx: 0, dy: -1 },
              { dx: 1, dy: 0 },
              { dx: 0, dy: 1 },
              { dx: -1, dy: 0 },
              { dx: 1, dy: -1 },
              { dx: 1, dy: 1 },
              { dx: -1, dy: 1 },
              { dx: -1, dy: -1 },
            ];

            const assignedPositions: { id: string; x: number; y: number }[] = [];

            for (const hero of survivingHeroes) {
              const freeAdjacent = adjacentOffsets
                .map((off) => ({ x: freshMonster.x + off.dx, y: freshMonster.y + off.dy }))
                .filter(
                  (pt) =>
                    pt.x >= 0 &&
                    pt.x < grid[0].length &&
                    pt.y >= 0 &&
                    pt.y < grid.length &&
                    grid[pt.y][pt.x].isWalkable &&
                    !currentUnits.some((u) => !u.isDead && u.id !== hero.id && u.x === pt.x && u.y === pt.y) &&
                    !assignedPositions.some((ap) => ap.x === pt.x && ap.y === pt.y)
                );

              if (freeAdjacent.length > 0) {
                freeAdjacent.sort(
                  (a, b) =>
                    Math.hypot(a.x - hero.x, a.y - hero.y) -
                    Math.hypot(b.x - hero.x, b.y - hero.y)
                );
                const bestTile = freeAdjacent[0];
                assignedPositions.push({ id: hero.id, x: bestTile.x, y: bestTile.y });

                if (boardRef.current && (hero.x !== bestTile.x || hero.y !== bestTile.y)) {
                  await boardRef.current.playMoveAnimation(hero.id, hero.x, hero.y, bestTile.x, bestTile.y);
                }

                currentUnits = currentUnits.map((u) =>
                  u.id === hero.id ? { ...u, x: bestTile.x, y: bestTile.y } : u
                );
                addFloatingNumber(bestTile.x, bestTile.y, '🌀 Vórtice: Puxado ao Boss!', 'status', '#9333EA');
              }
            }
          }
        } else if (bossType === 'tita_forjador') {
          // Fase 20: Stunar todos os inimigos por 2 turnos e causar dano a um alvo único
          addFloatingNumber(freshMonster.x, freshMonster.y, '🔨 TERREMOTO DA FORJA TITÂNICA!', 'status', '#EA580C');
          soundManager.playPhysicalAttack();

          // 1. Stun em todos os inimigos por 2 turnos
          for (const target of livingPlayers) {
            const currentEffects = [
              ...(target.statusEffects || []).filter((e) => e.type !== 'stun'),
              { type: 'stun' as const, duration: 2, value: 1, appliedTurn: turnNumberRef.current },
            ];
            addFloatingNumber(target.x, target.y, 'Atordoado (2 turnos)!', 'status', '#FACC15');
            currentUnits = currentUnits.map((u) =>
              u.id === target.id ? { ...u, statusEffects: currentEffects } : u
            );
          }

          // 2. Dano a um alvo único (o jogador mais próximo do titã)
          const singleTarget = livingPlayers.slice().sort((a, b) =>
            (Math.abs(a.x - freshMonster.x) + Math.abs(a.y - freshMonster.y)) -
            (Math.abs(b.x - freshMonster.x) + Math.abs(b.y - freshMonster.y))
          )[0];

          if (singleTarget) {
            if (boardRef.current) {
              await boardRef.current.playAttackAnimation(freshMonster.id, singleTarget.id, 'physical', 0, bossSkill);
            }
            const res = rollActualDamage(freshMonster, singleTarget, bossSkill);
            let actualDmg = res.finalDamage;
            const updatedTarget = currentUnits.find((u) => u.id === singleTarget.id) || singleTarget;
            let currentEffects = [...(updatedTarget.statusEffects || [])];

            const bossDodgeIdx = currentEffects.findIndex((e) => e.type === 'dodge_counter' && e.duration > 0);
            if (bossDodgeIdx >= 0) {
              currentEffects.splice(bossDodgeIdx, 1);
              actualDmg = 0;
              addFloatingNumber(updatedTarget.x, updatedTarget.y, '⚡ ESQUIVA DO VAZIO!', 'status', '#C77DFF');
              soundManager.playShield();
              const counterDmg = Math.max(1, Math.round(updatedTarget.atk * 1.5 - (freshMonster.def || 0) * 0.3));
              currentUnits = currentUnits.map((u) =>
                u.id === freshMonster.id
                  ? { ...u, currentHp: Math.max(0, u.currentHp - counterDmg), isDead: Math.max(0, u.currentHp - counterDmg) === 0 }
                  : u
              );
              addFloatingNumber(freshMonster.x, freshMonster.y, `💥 Contra-Ataque! -${counterDmg}`, 'physical', '#9D4EDD');
              soundManager.playPhysicalAttack();
            }

            for (let i = 0; i < currentEffects.length; i++) {
              if (currentEffects[i].type === 'shield' && currentEffects[i].value > 0) {
                const sh = currentEffects[i];
                const dmgAbsorbed = Math.min(sh.value, actualDmg);
                sh.value -= dmgAbsorbed;
                actualDmg -= dmgAbsorbed;
                addFloatingNumber(updatedTarget.x, updatedTarget.y, '-' + dmgAbsorbed + ' (Escudo)', 'shield', '#38BDF8');
                if (actualDmg === 0) break;
              }
            }
            currentEffects = currentEffects.filter((e) => e.type !== 'shield' || e.value > 0);

            const newHp = Math.max(0, updatedTarget.currentHp - actualDmg);
            if (actualDmg > 0) {
              addFloatingNumber(updatedTarget.x, updatedTarget.y, '-' + actualDmg, 'physical', '#FF5252');
            }
            if (newHp === 0) {
              soundManager.playDeath();
              if (boardRef.current) {
                await boardRef.current.playDeathAnimation(updatedTarget.id);
              }
            }
            currentUnits = currentUnits.map((u) =>
              u.id === updatedTarget.id ? { ...u, currentHp: newHp, isDead: newHp === 0, statusEffects: currentEffects } : u
            );
          }
        } else if (bossType === 'valgar_sanguinario') {
          // Fase 35: Valgar - 192% de dano físico a todos, 150% de roubo de vida e sangramento (burn) por 2 turnos
          addFloatingNumber(freshMonster.x, freshMonster.y, '🩸 BANQUETE SANGUINÁRIO (192% + Dreno 150%)!', 'status', '#DC2626');
          soundManager.playPhysicalAttack();

          let totalValgarDmg = 0;
          for (const target of livingPlayers) {
            if (boardRef.current) {
              await boardRef.current.playAttackAnimation(freshMonster.id, target.id, 'physical', 0, bossSkill);
            }
            const res = rollActualDamage(freshMonster, target, bossSkill);
            let actualDmg = res.finalDamage;
            let currentEffects = [...(target.statusEffects || [])];

            for (let i = 0; i < currentEffects.length; i++) {
              if (currentEffects[i].type === 'shield' && currentEffects[i].value > 0) {
                const sh = currentEffects[i];
                const dmgAbsorbed = Math.min(sh.value, actualDmg);
                sh.value -= dmgAbsorbed;
                actualDmg -= dmgAbsorbed;
                addFloatingNumber(target.x, target.y, '-' + dmgAbsorbed + ' (Escudo)', 'shield', '#38BDF8');
                if (actualDmg === 0) break;
              }
            }
            currentEffects = currentEffects.filter((e) => e.type !== 'shield' || e.value > 0);

            const newHp = Math.max(0, target.currentHp - actualDmg);
            if (actualDmg > 0) {
              totalValgarDmg += actualDmg;
              addFloatingNumber(target.x, target.y, '-' + actualDmg, 'physical', '#FF5252');
            }

            // Sangramento / Queimadura por 2 turnos
            currentEffects = [
              ...currentEffects.filter((e) => e.type !== 'burn'),
              { type: 'burn' as const, duration: 2, value: 2, appliedTurn: turnNumberRef.current },
            ];
            addFloatingNumber(target.x, target.y, '🩸 Sangramento (2T)!', 'status', '#DC2626');

            if (newHp === 0) {
              soundManager.playDeath();
              if (boardRef.current) {
                await boardRef.current.playDeathAnimation(target.id);
              }
            }
            currentUnits = currentUnits.map((u) =>
              u.id === target.id ? { ...u, currentHp: newHp, isDead: newHp === 0, statusEffects: currentEffects } : u
            );
          }

          // Cura de 150% do dano causado para Valgar
          if (totalValgarDmg > 0) {
            const healAmount = Math.round(totalValgarDmg * 1.5);
            const healedHp = Math.min(freshMonster.maxHp, freshMonster.currentHp + healAmount);
            const actualHealed = healedHp - freshMonster.currentHp;
            if (actualHealed > 0) {
              addFloatingNumber(freshMonster.x, freshMonster.y, '+' + actualHealed + ' (Banquete de Sangue 150%)', 'healing', '#10B981');
              soundManager.playHeal();
              currentUnits = currentUnits.map((u) =>
                u.id === freshMonster.id ? { ...u, currentHp: healedHp } : u
              );
            }
          }
        } else if (bossType === 'leviata_vazio') {
          // Fase 40: Leviatã do Vazio - 50% HP Ultimate: Invoca um tornado de água no meio do tabuleiro que causa 200% de dano mágico a todos os inimigos.
          addFloatingNumber(freshMonster.x, freshMonster.y, '🌪️ TORNADO DE ÁGUA PRIMORDIAL (200%)!', 'status', '#0284C7');
          soundManager.playMagicSpell();

          for (const target of livingPlayers) {
            if (boardRef.current) {
              await boardRef.current.playAttackAnimation(freshMonster.id, target.id, 'magical', 0, bossSkill);
            }
            const res = rollActualDamage(freshMonster, target, bossSkill);
            let actualDmg = res.finalDamage;
            let currentEffects = [...(target.statusEffects || [])];

            for (let i = 0; i < currentEffects.length; i++) {
              if (currentEffects[i].type === 'shield' && currentEffects[i].value > 0) {
                const sh = currentEffects[i];
                const dmgAbsorbed = Math.min(sh.value, actualDmg);
                sh.value -= dmgAbsorbed;
                actualDmg -= dmgAbsorbed;
                addFloatingNumber(target.x, target.y, '-' + dmgAbsorbed + ' (Escudo)', 'shield', '#38BDF8');
                if (actualDmg === 0) break;
              }
            }
            currentEffects = currentEffects.filter((e) => e.type !== 'shield' || e.value > 0);

            const newHp = Math.max(0, target.currentHp - actualDmg);
            if (actualDmg > 0) {
              addFloatingNumber(target.x, target.y, '-' + actualDmg, 'magical', '#0284C7');
            }

            if (newHp === 0) {
              soundManager.playDeath();
              if (boardRef.current) {
                await boardRef.current.playDeathAnimation(target.id);
              }
            }
            currentUnits = currentUnits.map((u) =>
              u.id === target.id ? { ...u, currentHp: newHp, isDead: newHp === 0, statusEffects: currentEffects } : u
            );
          }

          // Ativação do Tornado de Água no meio do tabuleiro
          const centerX = Math.floor(grid[0].length / 2);
          const centerY = Math.floor(grid.length / 2);
          const tornadoPt = { x: centerX, y: centerY };
          setWaterTornadoActive(true);
          setWaterTornadoCenter(tornadoPt);
          setGrid((prevGrid) => {
            const nextGrid = prevGrid.map((row, rY) =>
              row.map((cell, cX) =>
                cX === centerX && rY === centerY
                  ? { ...cell, isWaterTornadoCenter: true }
                  : { ...cell, isWaterTornadoCenter: false }
              )
            );
            gridRef.current = nextGrid;
            return nextGrid;
          });
          addFloatingNumber(centerX, centerY, '🌪️ VÓRTICE PRIMORDIAL ATIVO!', 'status', '#0284C7');
        } else {
          // Fase 50: Malakor (cronos_abissal) - 220% de dano mágico em todos ignorando escudos + Stun de 2 turnos no alvo de maior ataque
          addFloatingNumber(freshMonster.x, freshMonster.y, '⌛ COLAPSO TEMPORAL ETERNO (220% Direto)!', 'status', '#B91C1C');
          soundManager.playMagicSpell();

          for (const target of livingPlayers) {
            if (boardRef.current) {
              await boardRef.current.playAttackAnimation(freshMonster.id, target.id, 'magical', 0, bossSkill);
            }
            const res = rollActualDamage(freshMonster, target, bossSkill);
            const actualDmg = res.finalDamage;
            addFloatingNumber(target.x, target.y, 'Perfurou Escudos!', 'status', '#EF4444');

            const newHp = Math.max(0, target.currentHp - actualDmg);
            if (actualDmg > 0) {
              addFloatingNumber(target.x, target.y, '-' + actualDmg, 'magical', '#F43F5E');
            }
            if (newHp === 0) {
              soundManager.playDeath();
              if (boardRef.current) {
                await boardRef.current.playDeathAnimation(target.id);
              }
            }
            currentUnits = currentUnits.map((u) =>
              u.id === target.id ? { ...u, currentHp: newHp, isDead: newHp === 0 } : u
            );
          }

          // Stun por 2 turnos no jogador com maior ataque/poder mágico
          const highestDpsPlayer = livingPlayers.slice().sort((a, b) =>
            Math.max(b.atk, b.mag) - Math.max(a.atk, a.mag)
          )[0];

          if (highestDpsPlayer) {
            const updatedDps = currentUnits.find((u) => u.id === highestDpsPlayer.id);
            if (updatedDps && !updatedDps.isDead) {
              const currentEffects = [
                ...(updatedDps.statusEffects || []).filter((e) => e.type !== 'stun'),
                { type: 'stun' as const, duration: 2, value: 1, appliedTurn: turnNumberRef.current },
              ];
              addFloatingNumber(updatedDps.x, updatedDps.y, '⏳ Estase Temporal (Atordoado 2T)!', 'status', '#FACC15');
              currentUnits = currentUnits.map((u) =>
                u.id === updatedDps.id ? { ...u, statusEffects: currentEffects } : u
              );
            }
          }
        }

        // Marca que o boss utilizou sua habilidade única de 50% HP (ativa 1 única vez por combate)
        currentUnits = currentUnits.map((u) =>
          u.id === freshMonster.id
            ? {
                ...u,
                hasUsedHalfHpSkill: true,
                skills: u.skills.map((s) =>
                  s.id === bossSkill.id ? { ...s, currentCooldown: s.cooldownMax, lastUsedTurn: turnNumberRef.current } : s
                ),
              }
            : u
        );
        setUnits([...currentUnits]);

        const playerLivingAfter = currentUnits.filter((u) => u.faction === 'player' && !u.isDead && !u.isSummoned);
        if (playerLivingAfter.length === 0) {
          handleDefeat();
          return;
        }

        await new Promise((r) => setTimeout(r, 400 * delayMult));
        break;
      }

      // Pre-movement Boss Skills (e.g. Arauto dos Espectros - Manto Espectral: ativa antes de mover)
      const preMoveInvisSkill = freshMonster.skills.find(
        (s) => s.id === 'arauto_manto_espectral' && s.currentCooldown === 0
      );
      const isAlreadyInvis = freshMonster.statusEffects?.some(
        (e) => e.type === 'invisible' && e.duration > 0
      );
      if (preMoveInvisSkill && !isAlreadyInvis) {
        soundManager.playMagicSpell();
        addFloatingNumber(freshMonster.x, freshMonster.y, 'Manto Espectral (Invisível +30% Dano)!', 'status', '#C77DFF');
        const updatedSkills = freshMonster.skills.map((s) =>
          s.id === preMoveInvisSkill.id
            ? { ...s, currentCooldown: preMoveInvisSkill.cooldownMax, lastUsedTurn: turnNumberRef.current }
            : s
        );
        const updatedEffects = [
          ...(freshMonster.statusEffects || []).filter((e) => e.type !== 'invisible'),
          { type: 'invisible' as const, duration: 99, value: 30, appliedTurn: turnNumberRef.current },
        ];
        freshMonster = {
          ...freshMonster,
          skills: updatedSkills,
          statusEffects: updatedEffects,
        };
        currentUnits = currentUnits.map((u) => (u.id === freshMonster.id ? freshMonster : u));
        setUnits([...currentUnits]);
        await new Promise((r) => setTimeout(r, 400 * delayMult));
      }

      const choice = decideMonsterAction(freshMonster, grid, currentUnits);
      if (!choice) {
        break;
      }
        if (choice.moveTo && (choice.moveTo.x !== freshMonster.x || choice.moveTo.y !== freshMonster.y)) {
          const fromX = freshMonster.x;
          const fromY = freshMonster.y;
          const toX = choice.moveTo.x;
          const toY = choice.moveTo.y;

          if (boardRef.current) {
            await boardRef.current.playMoveAnimation(freshMonster.id, fromX, fromY, toX, toY);
          }

          let updatedHp = freshMonster.currentHp;
          let monsterDiedFromShock = false;

          const elecEffect = freshMonster.statusEffects?.find((e) => e.type === 'electrified' && e.duration > 0);
          if (elecEffect) {
            const path = getPathTo({ x: fromX, y: fromY }, { x: toX, y: toY }, grid, currentUnits, freshMonster.faction);
            const steps = path.length > 0 ? path.length : Math.max(1, Math.abs(toX - fromX) + Math.abs(toY - fromY));
            const dmgPerTile = Math.max(1, Math.round(freshMonster.maxHp * ((elecEffect.value || 1) / 100)));
            const totalDmg = dmgPerTile * steps;
            updatedHp = Math.max(0, freshMonster.currentHp - totalDmg);
            monsterDiedFromShock = updatedHp === 0;

            soundManager.playMagicSpell();
            addFloatingNumber(toX, toY, `-${totalDmg} Choque (${steps}x)`, 'status', '#FACC15');

            if (monsterDiedFromShock) {
              soundManager.playDeath();
              if (boardRef.current) {
                await boardRef.current.playDeathAnimation(freshMonster.id);
              }
            }
          }

          currentUnits = currentUnits.map((u) =>
            u.id === freshMonster.id ? { ...u, x: toX, y: toY, currentHp: updatedHp, isDead: monsterDiedFromShock } : u
          );
          setUnits([...currentUnits]);
          soundManager.playStep();

          if (monsterDiedFromShock) {
            await new Promise((r) => setTimeout(r, 300 * delayMult));
            continue;
          }

          await new Promise((r) => setTimeout(r, 200 * delayMult));
        }

        if (choice.targetUnit) {
          const freshAttacker = currentUnits.find((u) => u.id === freshMonster.id);
          const freshTarget = currentUnits.find((u) => u.id === choice.targetUnit!.id);

          if (freshAttacker && freshTarget && !freshTarget.isDead) {
            const skill = choice.skillToUse;
            const isSupportAction =
              skill &&
              (skill.targetType === 'self' ||
                skill.targetType === 'ally' ||
                freshTarget.faction === 'enemy');

            if (isSupportAction) {
              // --- MONSTER SUPPORT ACTION (HEAL / SHIELD / BUFF ON SELF OR ALLY) ---
              if (skill.damageType === 'healing' && skill.power > 0) {
                soundManager.playHeal();
              } else {
                soundManager.playMagicSpell();
              }

              if (boardRef.current) {
                await boardRef.current.playAttackAnimation(
                  freshAttacker.id,
                  freshTarget.id,
                  'healing',
                  0,
                  skill
                );
              }

              let currentEffects = [...(freshTarget.statusEffects || [])];
              let newHp = freshTarget.currentHp;
              const hadExcessHeal = currentEffects.some((e) => e.type === 'excess_heal' && e.duration > 0);
              const hadExcessShield = currentEffects.some((e) => e.type === 'excess_shield' && e.duration > 0);
              let isHealed = false;
              let isShielded = false;

              if (skill.damageType === 'healing' && skill.power > 0) {
                isHealed = true;
                let healAmount = Math.max(1, Math.round(freshAttacker.mag * skill.power));
                const isCurandeiro =
                  (freshAttacker.className || '').toLowerCase().includes('curandeiro') ||
                  (freshAttacker.avatarKey || '').toLowerCase().includes('cleric');
                if (isCurandeiro) {
                  const lostHp = Math.max(0, freshTarget.maxHp - freshTarget.currentHp);
                  healAmount += Math.round(lostHp * 0.10);
                }
                if (hadExcessHeal) {
                  healAmount = Math.max(1, Math.round(healAmount * 0.5));
                  addFloatingNumber(freshTarget.x, freshTarget.y, 'Cura excessiva (-50%)!', 'status', '#FACC15');
                } else {
                  addFloatingNumber(freshTarget.x, freshTarget.y, 'Cura excessiva aplicada!', 'status', '#F59E0B');
                }
                newHp = Math.min(freshTarget.maxHp, freshTarget.currentHp + healAmount);
                addFloatingNumber(freshTarget.x, freshTarget.y, `+${healAmount}`, 'healing', '#56E59A');
              }

              const applyMonsterSupportEffect = (effToProcess?: StatusEffect) => {
                if (!effToProcess) return;
                const eff = { ...effToProcess, appliedTurn: turnNumberRef.current };
                if (eff.type === 'shield') {
                  isShielded = true;
                  if (hadExcessShield) {
                    eff.value = Math.max(1, Math.round(eff.value * 0.5));
                    addFloatingNumber(freshTarget.x, freshTarget.y, 'Escudo excessivo (-50%)!', 'status', '#FACC15');
                  } else {
                    addFloatingNumber(freshTarget.x, freshTarget.y, 'Escudo excessivo aplicado!', 'status', '#F59E0B');
                  }
                  if (effToProcess.reflectRatio) {
                    eff.reflectRatio = effToProcess.reflectRatio;
                    addFloatingNumber(freshTarget.x, freshTarget.y, `+${eff.value} Escudo Espinhoso (${Math.round(eff.reflectRatio * 100)}% Reflexão)`, 'shield', '#F97316');
                  } else {
                    addFloatingNumber(freshTarget.x, freshTarget.y, `+${eff.value} Escudo`, 'shield', '#38BDF8');
                  }
                } else if (eff.type === 'buff_atk') {
                  addFloatingNumber(freshTarget.x, freshTarget.y, `+${eff.value}% Dano`, 'status', '#F97316');
                } else if (eff.type === 'immune') {
                  addFloatingNumber(freshTarget.x, freshTarget.y, `🛡️ Imunidade a Efeitos (${eff.duration}T)!`, 'status', '#A855F7');
                  currentEffects = currentEffects.filter((e) =>
                    !['burn', 'poison', 'stun', 'slow', 'debuff_def', 'debuff_atk', 'taunt', 'electrified'].includes(e.type)
                  );
                }
                currentEffects = [...currentEffects.filter((e) => e.type !== eff.type), eff];
              };

              if (skill.statusEffect) {
                applyMonsterSupportEffect(skill.statusEffect);
              }
              if (skill.secondaryStatusEffect) {
                applyMonsterSupportEffect(skill.secondaryStatusEffect);
              }
              if (skill.casterStatusEffect) {
                applyMonsterSupportEffect(skill.casterStatusEffect);
              }

              if (skill.debuffsAllPlayersAtk) {
                const debuffVal = skill.debuffsAllPlayersAtk;
                const debuffDur = skill.debuffDuration || 2;
                currentUnits = currentUnits.map((u) => {
                  if (u.faction === 'player' && !u.isDead) {
                    const uEffects = [
                      ...(u.statusEffects || []).filter((e) => e.type !== 'debuff_atk'),
                      { type: 'debuff_atk' as const, duration: debuffDur, value: debuffVal, appliedTurn: turnNumberRef.current },
                    ];
                    addFloatingNumber(u.x, u.y, `🔨 Dano -${debuffVal}% (2 turnos)!`, 'status', '#EF4444');
                    return { ...u, statusEffects: uEffects };
                  }
                  return u;
                });
                soundManager.playPhysicalAttack();
              }

              if (isHealed) {
                currentEffects = [
                  ...currentEffects.filter((e) => e.type !== 'excess_heal'),
                  { type: 'excess_heal', duration: 1, value: 50, appliedTurn: turnNumberRef.current },
                ];
              }

              if (isShielded) {
                currentEffects = [
                  ...currentEffects.filter((e) => e.type !== 'excess_shield'),
                  { type: 'excess_shield', duration: 1, value: 50, appliedTurn: turnNumberRef.current },
                ];
              }

              currentUnits = currentUnits.map((u) =>
                u.id === freshTarget.id ? { ...u, currentHp: newHp, statusEffects: currentEffects } : u
              );
            } else {
              // --- MONSTER ATTACK / OFFENSIVE ACTION ON PLAYER UNITS ---
              let finalMonsterX = freshAttacker.x;
              let finalMonsterY = freshAttacker.y;

              // Monster Teleport / Dash to target (e.g. Passo das Sombras, Investida Pesada)
              if (skill?.teleportToTarget || skill?.id === 'passo_das_sombras' || skill?.id === 'investida_pesada') {
                const candidateAdjacent = [
                  { x: freshTarget.x + 1, y: freshTarget.y },
                  { x: freshTarget.x - 1, y: freshTarget.y },
                  { x: freshTarget.x, y: freshTarget.y + 1 },
                  { x: freshTarget.x, y: freshTarget.y - 1 },
                  { x: freshTarget.x + 1, y: freshTarget.y + 1 },
                  { x: freshTarget.x + 1, y: freshTarget.y - 1 },
                  { x: freshTarget.x - 1, y: freshTarget.y + 1 },
                  { x: freshTarget.x - 1, y: freshTarget.y - 1 },
                ].filter(
                  (pt) =>
                    pt.x >= 0 &&
                    pt.x < grid[0].length &&
                    pt.y >= 0 &&
                    pt.y < grid.length &&
                    grid[pt.y][pt.x].isWalkable &&
                    !currentUnits.some((u) => !u.isDead && u.id !== freshAttacker.id && u.x === pt.x && u.y === pt.y)
                );

                if (candidateAdjacent.length > 0) {
                  candidateAdjacent.sort(
                    (a, b) =>
                      Math.abs(a.x - freshAttacker.x) + Math.abs(a.y - freshAttacker.y) -
                      (Math.abs(b.x - freshAttacker.x) + Math.abs(b.y - freshAttacker.y))
                  );
                  const dest = candidateAdjacent[0];
                  if (dest.x !== freshAttacker.x || dest.y !== freshAttacker.y) {
                    if (boardRef.current) {
                      await boardRef.current.playMoveAnimation(freshAttacker.id, freshAttacker.x, freshAttacker.y, dest.x, dest.y);
                    }
                    finalMonsterX = dest.x;
                    finalMonsterY = dest.y;
                    addFloatingNumber(dest.x, dest.y, 'Bote/Teleporte!', 'status', '#A855F7');
                  }
                }
              }

              const dmgType = skill?.damageType || (freshAttacker.mag > freshAttacker.atk ? 'magical' : 'physical');

              if (dmgType === 'magical') soundManager.playMagicSpell();
              else soundManager.playPhysicalAttack();

              if (boardRef.current) {
                await boardRef.current.playAttackAnimation(freshAttacker.id, freshTarget.id, dmgType, skill?.aoeRadius, skill);
              }

              let finalMonsterHp = freshAttacker.currentHp;
              const aoeRad = skill?.aoeRadius || 0;
              let enemyTargets: Unit[] = [];
              let hitTiles: { x: number; y: number }[] = [];

              if (skill?.isCardinalArms) {
                const origin = { x: finalMonsterX, y: finalMonsterY };
                const reach = skill.rangeMax || 3;
                const dirs = [
                  { dx: 0, dy: -1 }, // Norte
                  { dx: 0, dy: 1 },  // Sul
                  { dx: 1, dy: 0 },  // Leste
                  { dx: -1, dy: 0 }, // Oeste
                ];
                for (const d of dirs) {
                  for (let r = 1; r <= reach; r++) {
                    const nx = origin.x + d.dx * r;
                    const ny = origin.y + d.dy * r;
                    if (nx >= 0 && nx < grid[0].length && ny >= 0 && ny < grid.length) {
                      hitTiles.push({ x: nx, y: ny });
                    }
                  }
                }
                enemyTargets = currentUnits.filter(
                  (u) =>
                    u.faction === 'player' &&
                    !u.isDead &&
                    hitTiles.some((pt) => pt.x === u.x && pt.y === u.y)
                );
              } else if (skill?.aoeCenteredOnCaster) {
                const origin = { x: finalMonsterX, y: finalMonsterY };
                const rad = skill.aoeRadius || 1;
                for (let dy = -rad; dy <= rad; dy++) {
                  for (let dx = -rad; dx <= rad; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = origin.x + dx;
                    const ny = origin.y + dy;
                    if (nx >= 0 && nx < grid[0].length && ny >= 0 && ny < grid.length) {
                      hitTiles.push({ x: nx, y: ny });
                    }
                  }
                }
                enemyTargets = currentUnits.filter(
                  (u) =>
                    u.faction === 'player' &&
                    !u.isDead &&
                    hitTiles.some((pt) => pt.x === u.x && pt.y === u.y)
                );
              } else if (aoeRad >= 90) {
                enemyTargets = currentUnits.filter((u) => u.faction === 'player' && !u.isDead);
                hitTiles = [];
              } else if (skill?.isLinePierce) {
                const origin = { x: finalMonsterX, y: finalMonsterY };
                let dx = Math.sign(freshTarget.x - finalMonsterX);
                let dy = Math.sign(freshTarget.y - finalMonsterY);
                if (dx === 0 && dy === 0) dy = 1;
                const lineReach = skill.rangeMax || 4;
                for (let s = 1; s <= lineReach; s++) {
                  const lx = origin.x + dx * s;
                  const ly = origin.y + dy * s;
                  if (lx >= 0 && lx < grid[0].length && ly >= 0 && ly < grid.length) {
                    hitTiles.push({ x: lx, y: ly });
                  }
                }
                enemyTargets = currentUnits.filter(
                  (u) =>
                    u.faction === 'player' &&
                    !u.isDead &&
                    hitTiles.some((pt) => pt.x === u.x && pt.y === u.y)
                );
              } else if (aoeRad > 0) {
                const origin = { x: finalMonsterX, y: finalMonsterY };
                hitTiles = getAoETiles(
                  { x: freshTarget.x, y: freshTarget.y },
                  aoeRad,
                  grid[0].length,
                  grid.length,
                  skill?.aoeType || 'circle',
                  origin
                );
                enemyTargets = currentUnits.filter(
                  (u) =>
                    u.faction === 'player' &&
                    !u.isDead &&
                    hitTiles.some((pt) => pt.x === u.x && pt.y === u.y)
                );
              } else {
                enemyTargets = [freshTarget];
                hitTiles = [{ x: freshTarget.x, y: freshTarget.y }];
              }

              // Deixar poças de corrupção se a habilidade configurar leavesCorruptionPuddle (Fase 10 - Astaroth)
              if (skill?.leavesCorruptionPuddle && hitTiles.length > 0) {
                setGrid((prevGrid) => {
                  const nextGrid = prevGrid.map((row, rY) =>
                    row.map((cell, cX) => {
                      if (hitTiles.some((pt) => pt.x === cX && pt.y === rY)) {
                        return {
                          ...cell,
                          corruptionTurns: 3,
                        };
                      }
                      return cell;
                    })
                  );
                  gridRef.current = nextGrid;
                  return nextGrid;
                });
                soundManager.playMagicSpell();
              }

              // Névoa Asfixiante do Leviatã: área de 4 blocos para cada lado, dura 3 turnos
              if (skill?.id === 'leviata_nevoa_asfixiante') {
                setGrid((prevGrid) => {
                  const nextGrid = prevGrid.map((row, rY) =>
                    row.map((cell, cX) => {
                      if (Math.abs(cX - finalMonsterX) <= 4 && Math.abs(rY - finalMonsterY) <= 4) {
                        return {
                          ...cell,
                          mistTurns: 3,
                        };
                      }
                      return cell;
                    })
                  );
                  gridRef.current = nextGrid;
                  return nextGrid;
                });
                soundManager.playMagicSpell();
                addFloatingNumber(finalMonsterX, finalMonsterY, '🌫️ Névoa Asfixiante (3 Turnos)!', 'status', '#0284C7');
              }

              // Cavaleiro das Trevas: Deixa no chão uma área permanente que anula cura
              if ((skill?.leavesAntiHealPermanent || skill?.id === 'trevas_corte_cruz') && hitTiles.length > 0) {
                setGrid((prevGrid) => {
                  const nextGrid = prevGrid.map((row, rY) =>
                    row.map((cell, cX) => {
                      if (hitTiles.some((pt) => pt.x === cX && pt.y === rY)) {
                        return {
                          ...cell,
                          antiHealPermanent: true,
                        };
                      }
                      return cell;
                    })
                  );
                  gridRef.current = nextGrid;
                  return nextGrid;
                });
                soundManager.playMagicSpell();
                addFloatingNumber(finalMonsterX, finalMonsterY, '☠️ Solo Amaldiçoado: Anti-Cura!', 'status', '#7E22CE');
              }

              // Cavaleiro das Trevas: Invoca em todas as casas da borda do mapa chamas abissais
              if (skill?.summonsBorderFire || skill?.id === 'trevas_corte_chamas_borda') {
                setGrid((prevGrid) => {
                  const gH = prevGrid.length;
                  const gW = prevGrid[0]?.length || 0;
                  const nextGrid = prevGrid.map((row, rY) =>
                    row.map((cell, cX) => {
                      if (cX === 0 || cX === gW - 1 || rY === 0 || rY === gH - 1) {
                        return {
                          ...cell,
                          borderFire: true,
                        };
                      }
                      return cell;
                    })
                  );
                  gridRef.current = nextGrid;
                  return nextGrid;
                });
                soundManager.playMagicSpell();
                addFloatingNumber(finalMonsterX, finalMonsterY, '🔥 Chamas de Trevas na Borda!', 'status', '#EA580C');
              }

              let totalAiDmgDone = 0;
              let finalMonsterEffects = [...(freshAttacker.statusEffects || [])];
              const wasMonsterInvisible = finalMonsterEffects.some((e) => e.type === 'invisible' && e.duration > 0);
              if (wasMonsterInvisible) {
                finalMonsterEffects = finalMonsterEffects.filter((e) => e.type !== 'invisible');
              }
              let anyTargetHadBleed = false;

              for (const t of enemyTargets) {
                const targetHadBleed = Boolean(t.statusEffects?.some((e) => e.type === 'burn' && e.duration > 0));
                if (targetHadBleed) anyTargetHadBleed = true;
                const res = rollActualDamage(freshAttacker, t, skill);
                let actualDmg = res.finalDamage;
                const damageType = res.damageType;

                let currentEffects = [...(t.statusEffects || [])];

                // --- AMEAÇA DO VAZIO (100% Esquiva + Contra-ataque de 150%) ---
                const dodgeCounterIdx = currentEffects.findIndex((e) => e.type === 'dodge_counter' && e.duration > 0);
                if (dodgeCounterIdx >= 0) {
                  currentEffects.splice(dodgeCounterIdx, 1);
                  actualDmg = 0;
                  addFloatingNumber(t.x, t.y, '⚡ ESQUIVA DO VAZIO!', 'status', '#C77DFF');
                  soundManager.playShield();

                  const counterDmg = Math.max(1, Math.round(t.atk * 1.5 - (freshAttacker.def || 0) * 0.3));
                  finalMonsterHp = Math.max(0, finalMonsterHp - counterDmg);
                  addFloatingNumber(freshAttacker.x, freshAttacker.y, `💥 Contra-Ataque! -${counterDmg}`, 'physical', '#9D4EDD');
                  soundManager.playPhysicalAttack();
                  if (finalMonsterHp === 0) {
                    soundManager.playDeath();
                    if (boardRef.current) {
                      await boardRef.current.playDeathAnimation(freshAttacker.id);
                    }
                  }
                }

                // Shield Steal (e.g. Vulcanus Golpe Esmaga-Escudo)
                if (skill?.stealsShield) {
                  const shIndex = currentEffects.findIndex((e) => e.type === 'shield' && e.value > 0);
                  if (shIndex >= 0) {
                    const stolenShieldVal = currentEffects[shIndex].value;
                    currentEffects.splice(shIndex, 1);
                    addFloatingNumber(t.x, t.y, `🛡️ Escudo Roubado (${stolenShieldVal})!`, 'status', '#38BDF8');
                    soundManager.playShield();
                    finalMonsterEffects = [
                      ...finalMonsterEffects.filter((e) => e.type !== 'shield'),
                      { type: 'shield', duration: 3, value: stolenShieldVal, appliedTurn: turnNumberRef.current },
                    ];
                    addFloatingNumber(finalMonsterX, finalMonsterY, `+${stolenShieldVal} Escudo Roubado!`, 'shield', '#38BDF8');
                  }
                }

                let absorbedDamage = 0;
                let reflectPercent = 0;
                if (actualDmg > 0) {
                  if (skill?.ignoresShield) {
                    addFloatingNumber(t.x, t.y, 'Ignorou Escudo!', 'status', '#A855F7');
                  } else {
                    for (let i = 0; i < currentEffects.length; i++) {
                      if (currentEffects[i].type === 'shield' && currentEffects[i].value > 0) {
                        const sh = currentEffects[i];
                        const dmgAbsorbed = Math.min(sh.value, actualDmg);
                        if (sh.reflectRatio) {
                          reflectPercent = Math.max(reflectPercent, sh.reflectRatio);
                        }
                        absorbedDamage += dmgAbsorbed;
                        sh.value -= dmgAbsorbed;
                        actualDmg -= dmgAbsorbed;
                        addFloatingNumber(t.x, t.y, `-${dmgAbsorbed} (Escudo)`, 'shield', '#38BDF8');
                        if (actualDmg === 0) break;
                      }
                    }
                    currentEffects = currentEffects.filter((e) => e.type !== 'shield' || e.value > 0);

                    if (absorbedDamage > 0 && reflectPercent > 0) {
                      const reflectedDmg = Math.max(1, Math.round(absorbedDamage * reflectPercent));
                      finalMonsterHp = Math.max(0, finalMonsterHp - reflectedDmg);
                      addFloatingNumber(freshAttacker.x, freshAttacker.y, `-${reflectedDmg} (Espinhos)`, 'physical', '#F97316');
                      soundManager.playPhysicalAttack();
                      if (finalMonsterHp === 0) {
                        soundManager.playDeath();
                        if (boardRef.current) {
                          await boardRef.current.playDeathAnimation(freshAttacker.id);
                        }
                      }
                    }
                  }
                }

                let newHp = Math.max(0, t.currentHp - actualDmg);
                if (actualDmg > 0) {
                  const color = damageType === 'magical' ? '#B58AFF' : '#FF5252';
                  addFloatingNumber(t.x, t.y, `-${actualDmg}`, damageType, color);
                  totalAiDmgDone += actualDmg;
                }

                // Monster Knockback (e.g. Vulcanus Fissura Tectônica)
                let finalTargetX = t.x;
                let finalTargetY = t.y;
                if (skill?.knockback && skill.knockback > 0 && newHp > 0) {
                  if (t.lineageCrowdControlImmunity) {
                    addFloatingNumber(t.x, t.y, '🛡️ Imune a Empurrão!', 'status', '#60A5FA');
                  } else {
                  const originX = finalMonsterX;
                  const originY = finalMonsterY;
                  const dx = t.x - originX;
                  const dy = t.y - originY;
                  let pushX = 0;
                  let pushY = 0;
                  if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
                    pushX = Math.sign(dx);
                  } else if (dy !== 0) {
                    pushY = Math.sign(dy);
                  } else {
                    pushY = 1;
                  }

                  let currX = t.x;
                  let currY = t.y;
                  let stepsPushed = 0;
                  const maxSteps = skill.knockback;

                  for (let s = 0; s < maxSteps; s++) {
                    const nextX = currX + pushX;
                    const nextY = currY + pushY;
                    const inBounds = nextX >= 0 && nextX < grid[0].length && nextY >= 0 && nextY < grid.length;
                    const isWalkable = inBounds && grid[nextY][nextX].isWalkable;
                    const isOccupied = inBounds && currentUnits.some((u) => !u.isDead && u.id !== t.id && u.x === nextX && u.y === nextY);

                    if (inBounds && isWalkable && !isOccupied) {
                      currX = nextX;
                      currY = nextY;
                      stepsPushed++;
                    } else {
                      break;
                    }
                  }

                  if (stepsPushed > 0 && (currX !== t.x || currY !== t.y)) {
                    if (boardRef.current) {
                      await boardRef.current.playMoveAnimation(t.id, t.x, t.y, currX, currY);
                    }
                    finalTargetX = currX;
                    finalTargetY = currY;
                    addFloatingNumber(currX, currY, `Empurrado (${stepsPushed})!`, 'status', '#60A5FA');
                  }
                  }
                }

                // Jato Pressurizado do Leviatã: empurra até o fim da linha de 5. Se atingir obstáculo ou outro inimigo, atordoa e causa dano adicional
                if (skill?.id === 'leviata_jato_pressurizado' && newHp > 0 && !t.lineageCrowdControlImmunity) {
                  const originX = finalMonsterX;
                  const originY = finalMonsterY;
                  let pushDirX = Math.sign(freshTarget.x - originX);
                  let pushDirY = Math.sign(freshTarget.y - originY);
                  if (pushDirX === 0 && pushDirY === 0) pushDirY = 1;

                  const distFromMonster = Math.max(Math.abs(t.x - originX), Math.abs(t.y - originY));
                  const maxPushSteps = Math.max(1, 5 - distFromMonster);

                  let currX = t.x;
                  let currY = t.y;
                  let collided = false;
                  let stepsPushed = 0;

                  for (let s = 0; s < maxPushSteps; s++) {
                    const nextX = currX + pushDirX;
                    const nextY = currY + pushDirY;
                    const inBounds = nextX >= 0 && nextX < grid[0].length && nextY >= 0 && nextY < grid.length;
                    const isWalkable = inBounds && grid[nextY][nextX].isWalkable;
                    const isOccupied = inBounds && currentUnits.some((u) => !u.isDead && u.id !== t.id && u.x === nextX && u.y === nextY);

                    if (!inBounds || !isWalkable || isOccupied) {
                      collided = true;
                      break;
                    } else {
                      currX = nextX;
                      currY = nextY;
                      stepsPushed++;
                    }
                  }

                  if (stepsPushed > 0 && (currX !== t.x || currY !== t.y)) {
                    if (boardRef.current) {
                      await boardRef.current.playMoveAnimation(t.id, t.x, t.y, currX, currY);
                    }
                    finalTargetX = currX;
                    finalTargetY = currY;
                    addFloatingNumber(currX, currY, `🌊 Jato Pressurizado (${stepsPushed})!`, 'status', '#38BDF8');
                  }

                  if (collided) {
                    const colDmg = Math.max(1, Math.round(freshAttacker.mag * 0.8));
                    newHp = Math.max(0, newHp - colDmg);
                    currentEffects = [
                      ...currentEffects.filter((e) => e.type !== 'stun'),
                      { type: 'stun', duration: 1, value: 1, appliedTurn: turnNumberRef.current },
                    ];
                    addFloatingNumber(currX, currY, `💥 Colisão! -${colDmg}`, 'magical', '#38BDF8');
                    addFloatingNumber(currX, currY, '💫 Atordoado (1T)!', 'status', '#FACC15');
                    soundManager.playPhysicalAttack();
                    if (newHp === 0) {
                      soundManager.playDeath();
                      if (boardRef.current) {
                        await boardRef.current.playDeathAnimation(t.id);
                      }
                    }
                  }
                }

                // Monster Pull (e.g. Astaroth Garras do Vazio - puxa 2 casas em direção ao boss)
                if (skill?.pull && skill.pull > 0 && newHp > 0) {
                  if (t.lineageCrowdControlImmunity) {
                    addFloatingNumber(finalTargetX, finalTargetY, '🛡️ Imune a Puxão!', 'status', '#60A5FA');
                  } else {
                  const originX = finalMonsterX;
                  const originY = finalMonsterY;
                  const dx = originX - finalTargetX;
                  const dy = originY - finalTargetY;
                  let pullDirX = 0;
                  let pullDirY = 0;
                  if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
                    pullDirX = Math.sign(dx);
                  } else if (dy !== 0) {
                    pullDirY = Math.sign(dy);
                  }

                  let currX = finalTargetX;
                  let currY = finalTargetY;
                  let stepsPulled = 0;
                  const maxPullSteps = skill.pull;

                  for (let s = 0; s < maxPullSteps; s++) {
                    const nextX = currX + pullDirX;
                    const nextY = currY + pullDirY;
                    if (nextX === originX && nextY === originY) break;

                    const inBounds = nextX >= 0 && nextX < grid[0].length && nextY >= 0 && nextY < grid.length;
                    const isWalkable = inBounds && grid[nextY][nextX].isWalkable;
                    const isOccupied = inBounds && currentUnits.some((u) => !u.isDead && u.id !== t.id && u.x === nextX && u.y === nextY);

                    if (inBounds && isWalkable && !isOccupied) {
                      currX = nextX;
                      currY = nextY;
                      stepsPulled++;
                    } else {
                      break;
                    }
                  }

                  if (stepsPulled > 0 && (currX !== finalTargetX || currY !== finalTargetY)) {
                    if (boardRef.current) {
                      await boardRef.current.playMoveAnimation(t.id, finalTargetX, finalTargetY, currX, currY);
                    }
                    finalTargetX = currX;
                    finalTargetY = currY;
                    addFloatingNumber(currX, currY, `Puxado (${stepsPulled})!`, 'status', '#A855F7');
                    soundManager.playStep();
                  }
                  }
                }

                // Monster Pull to Adjacent (e.g. Astaroth Cataclismo do Abismo)
                if (skill?.pullToAdjacent && newHp > 0 && !t.lineageCrowdControlImmunity) {
                  const originX = finalMonsterX;
                  const originY = finalMonsterY;
                  const isAlreadyAdj = Math.abs(finalTargetX - originX) <= 1 && Math.abs(finalTargetY - originY) <= 1;
                  if (!isAlreadyAdj) {
                    const adjCandidates = [
                      { x: originX, y: originY - 1 },
                      { x: originX + 1, y: originY },
                      { x: originX, y: originY + 1 },
                      { x: originX - 1, y: originY },
                      { x: originX + 1, y: originY - 1 },
                      { x: originX + 1, y: originY + 1 },
                      { x: originX - 1, y: originY + 1 },
                      { x: originX - 1, y: originY - 1 },
                    ].filter((p) => {
                      const inB = p.x >= 0 && p.x < grid[0].length && p.y >= 0 && p.y < grid.length;
                      if (!inB) return false;
                      if (!grid[p.y][p.x].isWalkable) return false;
                      const occ = currentUnits.some((u) => !u.isDead && u.id !== t.id && u.x === p.x && u.y === p.y);
                      return !occ;
                    });

                    if (adjCandidates.length > 0) {
                      adjCandidates.sort((a, b) => {
                        const distA = Math.hypot(a.x - finalTargetX, a.y - finalTargetY);
                        const distB = Math.hypot(b.x - finalTargetX, b.y - finalTargetY);
                        return distA - distB;
                      });
                      const bestAdj = adjCandidates[0];
                      if (boardRef.current) {
                        await boardRef.current.playMoveAnimation(t.id, finalTargetX, finalTargetY, bestAdj.x, bestAdj.y);
                      }
                      finalTargetX = bestAdj.x;
                      finalTargetY = bestAdj.y;
                      const pullText = skill?.id === 'valgar_gancho_carniceiro' ? '⛓️ Gancho Carniceiro: Puxado!' : 'Arrastado para o Abismo!';
                      const pullColor = skill?.id === 'valgar_gancho_carniceiro' ? '#DC2626' : '#9333EA';
                      addFloatingNumber(bestAdj.x, bestAdj.y, pullText, 'status', pullColor);
                      soundManager.playStep();
                    }
                  }
                }

                let usedPhoenixNow = false;
                if (newHp === 0 && t.faction === 'player' && (t.lineagePhoenixRevive || t.lineagePhoenixRevive1Hp) && !t.hasUsedPhoenixRevive) {
                  newHp = 1;
                  usedPhoenixNow = true;
                  soundManager.playHeal();
                  addFloatingNumber(finalTargetX, finalTargetY, '🔥 Sobreviveu com 1 HP (Fênix)!', 'healing', '#F97316');
                }
                if (newHp === 0) {
                  soundManager.playDeath();
                  if (t.faction === 'player' && !t.isSummoned) {
                    setProgress((prev) => {
                      const prevStats = prev.lineageQuestStats || {};
                      let p = {
                        ...prev,
                        lineageQuestStats: {
                          ...prevStats,
                          heroesFallen: (prevStats.heroesFallen || 0) + 1,
                        },
                      };
                      const newLineages = checkLineageUnlockQuests(p);
                      if (newLineages.length > 0) {
                        p = {
                          ...p,
                          unlockedLineages: Array.from(new Set([...(p.unlockedLineages || INITIAL_UNLOCKED_LINEAGES), ...newLineages])),
                        };
                        setPendingUnlockLineages((prevPending) => Array.from(new Set([...prevPending, ...newLineages])));
                      }
                      progressRef.current = p;
                      savePlayerProgress(p);
                      return p;
                    });
                  }
                  if (boardRef.current) {
                    await boardRef.current.playDeathAnimation(t.id);
                  }
                } else {
                  const isValgarSkill = choice.skillToUse?.id?.startsWith('valgar') || choice.skillToUse?.id === 'boss_valgar_banquete_sangue';
                  const isBleedSkill = isValgarSkill || choice.skillToUse?.id === 'quimera_garras_leao';
                  const isMinotaurImmune = (type: string) =>
                    Boolean(t.lineageCrowdControlImmunity) && (type === 'burn' || type === 'poison' || type === 'slow');
                  const isDragonImmune = (type: string) =>
                    Boolean(t.lineageBurnImmune) && type === 'burn';

                  if (choice.skillToUse?.statusEffect) {
                    const eff = choice.skillToUse.statusEffect;
                    if (isMinotaurImmune(eff.type)) {
                      addFloatingNumber(finalTargetX, finalTargetY, '🛡️ Imunidade (Minotauro)!', 'status', '#60A5FA');
                    } else if (isDragonImmune(eff.type)) {
                      addFloatingNumber(finalTargetX, finalTargetY, '🛡️ Imune a Queimadura!', 'status', '#F97316');
                    } else {
                      currentEffects = [...currentEffects.filter((e) => e.type !== eff.type), { ...eff }];
                      if (eff.type === 'burn') addFloatingNumber(finalTargetX, finalTargetY, isBleedSkill ? '🩸 Sangramento (2T)!' : 'Em Chamas!', 'status', isBleedSkill ? '#DC2626' : '#F97316');
                      else if (eff.type === 'poison') addFloatingNumber(finalTargetX, finalTargetY, 'Envenenado!', 'status', '#A855F7');
                      else if (eff.type === 'stun') addFloatingNumber(finalTargetX, finalTargetY, 'Atordoado!', 'status', '#FACC15');
                      else if (eff.type === 'slow') addFloatingNumber(finalTargetX, finalTargetY, `Lentidão (-${eff.value || 1} Mov)!`, 'status', '#60A5FA');
                      else if (eff.type === 'debuff_def') addFloatingNumber(finalTargetX, finalTargetY, `Defesa -${eff.value}%!`, 'status', '#EF4444');
                      else if (eff.type === 'debuff_atk') addFloatingNumber(finalTargetX, finalTargetY, `Dano -${eff.value}%!`, 'status', '#EF4444');
                      else if (eff.type === 'electrified') addFloatingNumber(finalTargetX, finalTargetY, '⚡ Eletrificado!', 'status', '#FACC15');
                      else if (eff.type === 'silence') addFloatingNumber(finalTargetX, finalTargetY, '🔇 Silenciado (1T)!', 'status', '#A855F7');
                      else if (eff.type === 'dark_cocoon') addFloatingNumber(finalTargetX, finalTargetY, '🕸️ Casulo de Escuridão (2T)!', 'status', '#581C87');
                    }
                  }

                  if (choice.skillToUse?.secondaryStatusEffect) {
                    const eff2 = choice.skillToUse.secondaryStatusEffect;
                    if (isMinotaurImmune(eff2.type)) {
                      addFloatingNumber(finalTargetX, finalTargetY, '🛡️ Imunidade (Minotauro)!', 'status', '#60A5FA');
                    } else if (isDragonImmune(eff2.type)) {
                      addFloatingNumber(finalTargetX, finalTargetY, '🛡️ Imune a Queimadura!', 'status', '#F97316');
                    } else {
                      currentEffects = [...currentEffects.filter((e) => e.type !== eff2.type), { ...eff2 }];
                      if (eff2.type === 'burn') addFloatingNumber(finalTargetX, finalTargetY, isBleedSkill ? '🩸 Sangramento (2T)!' : 'Em Chamas!', 'status', isBleedSkill ? '#DC2626' : '#F97316');
                      else if (eff2.type === 'poison') addFloatingNumber(finalTargetX, finalTargetY, 'Envenenado!', 'status', '#A855F7');
                      else if (eff2.type === 'debuff_def') addFloatingNumber(finalTargetX, finalTargetY, `Defesa -${eff2.value}%!`, 'status', '#EF4444');
                      else if (eff2.type === 'debuff_atk') addFloatingNumber(finalTargetX, finalTargetY, `Dano -${eff2.value}%!`, 'status', '#EF4444');
                      else if (eff2.type === 'slow') addFloatingNumber(finalTargetX, finalTargetY, `Lentidão (-${eff2.value || 1} Mov)!`, 'status', '#60A5FA');
                      else if (eff2.type === 'silence') addFloatingNumber(finalTargetX, finalTargetY, '🔇 Silenciado (1T)!', 'status', '#A855F7');
                      else if (eff2.type === 'dark_cocoon') addFloatingNumber(finalTargetX, finalTargetY, '🕸️ Casulo de Escuridão (2T)!', 'status', '#581C87');
                    }
                  }
                }

                // Linhagem Orc: na primeira vez que ficar com <= 50% de vida, ganha escudo de 20% maxHp e +15% dano por 2 turnos
                let orcTriggered = false;
                if (
                  t.faction === 'player' &&
                  !t.hasUsedOrcHalfHpTrigger &&
                  t.lineageOrcHalfHpTrigger &&
                  newHp > 0 &&
                  newHp <= Math.floor(t.maxHp * 0.5)
                ) {
                  orcTriggered = true;
                  const orcShieldVal = Math.max(1, Math.round(t.maxHp * 0.20));
                  currentEffects = [
                    ...currentEffects,
                    { type: 'shield', duration: 2, value: orcShieldVal, appliedTurn: turnNumberRef.current },
                    { type: 'buff_atk', duration: 2, value: 15, appliedTurn: turnNumberRef.current },
                  ];
                  addFloatingNumber(finalTargetX, finalTargetY, `+${orcShieldVal} Escudo (Fúria Orc)`, 'shield', '#38BDF8');
                  addFloatingNumber(finalTargetX, finalTargetY, '+15% Dano (Fúria Orc)', 'status', '#F97316');
                }

                currentUnits = currentUnits.map((u) =>
                  u.id === t.id
                    ? {
                        ...u,
                        x: finalTargetX,
                        y: finalTargetY,
                        currentHp: newHp,
                        isDead: newHp === 0,
                        statusEffects: currentEffects,
                        hasUsedPhoenixRevive: usedPhoenixNow ? true : u.hasUsedPhoenixRevive,
                        hasUsedOrcHalfHpTrigger: orcTriggered ? true : u.hasUsedOrcHalfHpTrigger,
                      }
                    : u
                );
              }

              // Monster / AI Lifesteal & Golpe Sagrado
              const aiIsGolpeSagrado = skill?.id === 'golpe_sagrado' || skill?.id?.startsWith('golpe_sagrado');
              const aiLifestealPct =
                skill?.lifestealPercent ??
                (skill?.id === 'dreno_de_seiva' || skill?.id === 'dreno_de_vida'
                  ? 100
                  : aiIsGolpeSagrado
                  ? 30
                  : 0);

              if ((aiLifestealPct > 0 || aiIsGolpeSagrado) && (totalAiDmgDone > 0 || aiIsGolpeSagrado)) {
                const hadExcessHeal = finalMonsterEffects.some((e) => e.type === 'excess_heal' && e.duration > 0);
                let healAmt = aiIsGolpeSagrado
                  ? Math.max(1, Math.round(freshAttacker.mag * 0.3), Math.round(totalAiDmgDone * 0.3))
                  : Math.max(1, Math.round(totalAiDmgDone * (aiLifestealPct / 100)));

                if (hadExcessHeal) {
                  healAmt = Math.max(1, Math.round(healAmt * 0.5));
                  addFloatingNumber(finalMonsterX, finalMonsterY, 'Cura excessiva (-50%)!', 'status', '#FACC15');
                } else {
                  addFloatingNumber(finalMonsterX, finalMonsterY, 'Cura excessiva aplicada!', 'status', '#F59E0B');
                }
                const newHp = Math.min(freshAttacker.maxHp, finalMonsterHp + healAmt);
                const actualHealed = newHp - finalMonsterHp;
                if (actualHealed > 0) {
                  finalMonsterHp = newHp;
                  const tag = aiIsGolpeSagrado ? 'Cura Sagrada' : 'Dreno';
                  addFloatingNumber(finalMonsterX, finalMonsterY, `+${actualHealed} (${tag})`, 'healing', '#56E59A');
                  soundManager.playHeal();
                } else {
                  addFloatingNumber(finalMonsterX, finalMonsterY, '+0 (Vida Máxima)', 'healing', '#56E59A');
                  soundManager.playHeal();
                }
                finalMonsterEffects = [
                  ...finalMonsterEffects.filter((e) => e.type !== 'excess_heal'),
                  { type: 'excess_heal', duration: 1, value: 50, appliedTurn: turnNumberRef.current },
                ];
              }

              if (choice.skillToUse?.casterStatusEffect) {
                const cEff = { ...choice.skillToUse.casterStatusEffect, appliedTurn: turnNumberRef.current };
                if (cEff.type === 'shield') {
                  const hadExcessShield = finalMonsterEffects.some((e) => e.type === 'excess_shield' && e.duration > 0);
                  if (hadExcessShield) {
                    cEff.value = Math.max(1, Math.round(cEff.value * 0.5));
                    addFloatingNumber(finalMonsterX, finalMonsterY, 'Escudo excessivo (-50%)!', 'status', '#FACC15');
                  }
                  if (choice.skillToUse.casterStatusEffect.reflectRatio) {
                    cEff.reflectRatio = choice.skillToUse.casterStatusEffect.reflectRatio;
                    addFloatingNumber(finalMonsterX, finalMonsterY, `+${cEff.value} Escudo Espinhoso (${Math.round(cEff.reflectRatio * 100)}% Reflexão)`, 'shield', '#F97316');
                  } else {
                    addFloatingNumber(finalMonsterX, finalMonsterY, `+${cEff.value} Escudo`, 'shield', '#38BDF8');
                  }
                  finalMonsterEffects = [
                    ...finalMonsterEffects.filter((e) => e.type !== 'excess_shield'),
                    { type: 'excess_shield', duration: 1, value: 50, appliedTurn: turnNumberRef.current },
                  ];
                } else if (cEff.type === 'taunt') {
                  addFloatingNumber(finalMonsterX, finalMonsterY, 'Provocando!', 'status', '#EF4444');
                } else if (cEff.type === 'invisible') {
                  addFloatingNumber(finalMonsterX, finalMonsterY, 'Ficou Invisível!', 'status', '#C77DFF');
                } else if (cEff.type === 'immune') {
                  addFloatingNumber(finalMonsterX, finalMonsterY, `🛡️ Imunidade a Efeitos (${cEff.duration}T)!`, 'status', '#A855F7');
                  finalMonsterEffects = finalMonsterEffects.filter((e) =>
                    !['burn', 'poison', 'stun', 'slow', 'debuff_def', 'debuff_atk', 'taunt', 'electrified'].includes(e.type)
                  );
                } else if (cEff.type === 'immune_physical') {
                  addFloatingNumber(finalMonsterX, finalMonsterY, `🛡️ Imune a Dano Físico (${cEff.duration}T)!`, 'status', '#60A5FA');
                } else if (cEff.type === 'immune_magical') {
                  addFloatingNumber(finalMonsterX, finalMonsterY, `🔮 Imune a Dano Mágico (${cEff.duration}T)!`, 'status', '#A855F7');
                }
                finalMonsterEffects = [...finalMonsterEffects.filter((e) => e.type !== cEff.type), cEff];
              }

              // Se a habilidade conceder turno extra ao atingir alvos sangrando (Valgar Arremesso de Cutelo)
              if (skill?.grantsExtraTurnOnBleeding && anyTargetHadBleed && finalMonsterHp > 0) {
                extraTurnsAllowed++;
                addFloatingNumber(finalMonsterX, finalMonsterY, '🩸 Sede de Sangue: Age Novamente!', 'status', '#DC2626');
                soundManager.playPhysicalAttack();
                await new Promise((r) => setTimeout(r, 350 * delayMult));
              }

              // Update freshAttacker position, HP, status effects and isDead
              currentUnits = currentUnits.map((u) =>
                u.id === freshAttacker.id
                  ? {
                      ...u,
                      x: finalMonsterX,
                      y: finalMonsterY,
                      currentHp: finalMonsterHp,
                      isDead: finalMonsterHp === 0,
                      statusEffects: finalMonsterEffects,
                      ...(skill?.id === 'luz_escudo_dupla_acao' ? { lightDoubleActionPending: true } : {}),
                    }
                  : u
              );
            }

            // Put used skill on cooldown on the monster!
            if (skill) {
              currentUnits = currentUnits.map((u) => {
                if (u.id === freshAttacker.id) {
                  return {
                    ...u,
                    skills: u.skills.map((s) =>
                      s.id === skill.id ? { ...s, currentCooldown: s.cooldownMax, lastUsedTurn: turnNumberRef.current } : s
                    ),
                  };
                }
                return u;
              });
            }

            const actionSplit = await checkAndTriggerChimeraSplit(currentUnits);
            if (actionSplit.didSplit) {
              currentUnits = actionSplit.updatedUnits;
            }

            const actionCrystal = await checkAndTriggerCrystalDestruction(currentUnits);
            if (actionCrystal.didTrigger) {
              currentUnits = actionCrystal.updatedUnits;
            }

            setUnits([...currentUnits]);
            await new Promise((r) => setTimeout(r, 200 * delayMult));
          }
        }
      }
    }

    const playerLiving = currentUnits.filter((u) => u.faction === 'player' && !u.isDead);
    const enemyLiving = currentUnits.filter((u) => u.faction === 'enemy' && !u.isDead);

    if (isTrainingMode) {
      if (playerLiving.length === 0) {
        addFloatingNumber(4, 6, '💚 Heróis Revividos no Treino!', 'healing', '#10B981');
        soundManager.playHeal();
        currentUnits = currentUnits.map((u) => (u.faction === 'player' ? { ...u, isDead: false, currentHp: u.maxHp } : u));
        setUnits([...currentUnits]);
      }
      if (enemyLiving.length === 0) {
        addFloatingNumber(4, 2, '🎯 BONECOS DESTRUÍDOS! REINICIANDO...', 'status', '#10B981');
        soundManager.playVictory();
        if (trainingConfig) {
          const lvlConfig = createTrainingLevel(trainingConfig.dummySetup);
          const freshDummies: Unit[] = lvlConfig.enemySpawns.map((spawn, idx) =>
            createMonsterUnit(
              spawn.monsterTypeId as any,
              `enemy_${spawn.monsterTypeId}_${idx}_${Date.now()}`,
              spawn.x,
              spawn.y,
              0
            )
          );
          currentUnits = [...currentUnits.filter((u) => u.faction === 'player' && !u.isDead), ...freshDummies];
          setUnits(currentUnits);
        }
      }
    } else {
      if (playerLiving.length === 0) {
        handleDefeat();
        return;
      }
      if (enemyLiving.length === 0) {
        handleVictory(currentUnits);
        return;
      }
    }

    const aiTurnNumber = turnNumberRef.current;
    setTurnNumber((t) => {
      turnNumberRef.current = t + 1;
      return t + 1;
    });

    // Decrement corruption puddles and mist on the grid at turn start
    setGrid((prevGrid) => {
      let changed = false;
      const nextGrid = prevGrid.map((row) =>
        row.map((cell) => {
          let updatedCell = { ...cell };
          if (cell.corruptionTurns && cell.corruptionTurns > 0) {
            changed = true;
            const newTurns = cell.corruptionTurns - 1;
            updatedCell = { ...updatedCell, corruptionTurns: newTurns > 0 ? newTurns : undefined };
          }
          if (cell.mistTurns && cell.mistTurns > 0) {
            changed = true;
            const newTurns = cell.mistTurns - 1;
            updatedCell.mistTurns = newTurns > 0 ? newTurns : undefined;
          }
          return updatedCell;
        })
      );
      if (changed) {
        gridRef.current = nextGrid;
        return nextGrid;
      }
      return prevGrid;
    });

    let anyPlayerDiedFromDoT = false;
    setUnits((prev) => {
      return prev.map((u) => {
        let currentHp = u.currentHp;
        let isDead = u.isDead;
        let unitX = u.x;
        let unitY = u.y;

        if (u.faction === 'player') {
          const updatedEffects = (u.statusEffects || [])
            .map((e) => (e.type === 'taunt' ? { ...e, duration: e.duration - 1 } : e))
            .filter((e) => e.duration > 0);

          if (!isDead) {
            // Burn tick (Queimadura)
            const burn = u.statusEffects?.find((e) => e.type === 'burn');
            if (burn && !u.lineageBurnImmune && !u.lineageCrowdControlImmunity) {
              const bDmg = Math.max(1, Math.round(u.maxHp * ((burn.value || 2) / 100)));
              currentHp = Math.max(0, currentHp - bDmg);
              isDead = currentHp === 0;
              if (isDead) anyPlayerDiedFromDoT = true;
              addFloatingNumber(unitX, unitY, `-${bDmg} Queimadura (${burn.value || 2}%)`, 'status', '#F97316');
            }

            // Poison tick (Veneno)
            if (!isDead) {
              const poison = u.statusEffects?.find((e) => e.type === 'poison');
              if (poison && !u.lineageCrowdControlImmunity) {
                const pDmg = Math.max(1, Math.round(u.maxHp * ((poison.value || 2) / 100)));
                currentHp = Math.max(0, currentHp - pDmg);
                isDead = currentHp === 0;
                if (isDead) anyPlayerDiedFromDoT = true;
                addFloatingNumber(unitX, unitY, `-${pDmg} Veneno (2%)`, 'status', '#A855F7');
              }
            }

            // Corruption Puddle tick (Poça de Corrupção): Se um herói no início de seu turno estiver em cima de uma poça, sofre 10% da vida máxima como dano verdadeiro.
            if (!isDead) {
              const standingTile = gridRef.current?.[unitY]?.[unitX];
              if (standingTile && standingTile.corruptionTurns && standingTile.corruptionTurns > 0) {
                const corrDmg = Math.max(1, Math.round(u.maxHp * 0.10));
                currentHp = Math.max(0, currentHp - corrDmg);
                isDead = currentHp === 0;
                if (isDead) anyPlayerDiedFromDoT = true;
                addFloatingNumber(unitX, unitY, `-${corrDmg} Corrupção (10% Dano Verdadeiro)`, 'status', '#C084FC');
                soundManager.playMagicSpell();
              }
            }

            // Névoa Asfixiante: Inimigos que começarem o turno na névoa ficam silenciados (1 turno)
            if (!isDead) {
              const standingTile = gridRef.current?.[unitY]?.[unitX];
              if (standingTile && standingTile.mistTurns && standingTile.mistTurns > 0) {
                if (!updatedEffects.some((e) => e.type === 'silence' && e.duration > 0)) {
                  updatedEffects.push({
                    type: 'silence',
                    duration: 1,
                    value: 1,
                    appliedTurn: turnNumberRef.current,
                  });
                  addFloatingNumber(unitX, unitY, '🔇 Silenciado (Névoa)!', 'status', '#A855F7');
                }
              }
            }

            // Chamas da Borda (Cavaleiro das Trevas): Se um personagem começar o turno em cima de uma casa da borda em chamas, sofre 10% da vida máxima
            if (!isDead) {
              const standingTile = gridRef.current?.[unitY]?.[unitX];
              if (standingTile && standingTile.borderFire) {
                const fireDmg = Math.max(1, Math.round(u.maxHp * 0.10));
                currentHp = Math.max(0, currentHp - fireDmg);
                isDead = currentHp === 0;
                if (isDead) anyPlayerDiedFromDoT = true;
                addFloatingNumber(unitX, unitY, `-${fireDmg} Chamas da Borda (10%)!`, 'status', '#EA580C');
                soundManager.playMagicSpell();
              }
            }

            // Tornado de Água Primordial: puxa todos os inimigos 1 casa em direção ao centro e causa 5% da vida máxima deles. Se pisarem no centro do tornado, recebem 220% de dano mágico.
            if (!isDead && waterTornadoActive && waterTornadoCenter) {
              const tornDmg = Math.max(1, Math.round(u.maxHp * 0.05));
              currentHp = Math.max(0, currentHp - tornDmg);
              isDead = currentHp === 0;
              if (isDead) anyPlayerDiedFromDoT = true;
              addFloatingNumber(unitX, unitY, `-${tornDmg} Vórtice (5%)`, 'magical', '#0284C7');

              if (!isDead) {
                const dx = Math.sign(waterTornadoCenter.x - unitX);
                const dy = Math.sign(waterTornadoCenter.y - unitY);
                let pullX = 0;
                let pullY = 0;
                if (Math.abs(waterTornadoCenter.x - unitX) >= Math.abs(waterTornadoCenter.y - unitY) && dx !== 0) {
                  pullX = dx;
                } else if (dy !== 0) {
                  pullY = dy;
                }

                const targetX = unitX + pullX;
                const targetY = unitY + pullY;
                const inB =
                  targetX >= 0 &&
                  targetX < (gridRef.current?.[0]?.length || 10) &&
                  targetY >= 0 &&
                  targetY < (gridRef.current?.length || 8);
                const isWalkable = inB && gridRef.current?.[targetY]?.[targetX]?.isWalkable;
                const isOccupied = inB && prev.some((o) => !o.isDead && o.id !== u.id && o.x === targetX && o.y === targetY);

                if (inB && isWalkable && !isOccupied && (pullX !== 0 || pullY !== 0)) {
                  unitX = targetX;
                  unitY = targetY;
                  addFloatingNumber(unitX, unitY, '🌪️ Sugado pelo Vórtice!', 'status', '#0284C7');
                }

                if (unitX === waterTornadoCenter.x && unitY === waterTornadoCenter.y) {
                  const leviathanBoss = prev.find((m) => m.monsterTypeId === 'leviata_vazio' && !m.isDead);
                  const centerDmg = Math.max(1, Math.round((leviathanBoss?.mag || 69) * 2.20));
                  currentHp = Math.max(0, currentHp - centerDmg);
                  isDead = currentHp === 0;
                  if (isDead) anyPlayerDiedFromDoT = true;
                  addFloatingNumber(unitX, unitY, `-${centerDmg} Centro do Vórtice (220%)!`, 'magical', '#0284C7');
                  soundManager.playMagicSpell();
                }
              }
            }
          }

          const isCocooned = updatedEffects.some((e) => e.type === 'dark_cocoon' && e.duration > 0);
          if (isCocooned && !isDead) {
            addFloatingNumber(unitX, unitY, '🕸️ Preso no Casulo de Escuridão!', 'status', '#581C87');
          }

          return {
            ...u,
            x: unitX,
            y: unitY,
            currentHp,
            isDead,
            statusEffects: updatedEffects,
            hasMoved: isCocooned ? true : false,
            hasAttacked: isCocooned ? true : false,
            nefalimExtraAttackUsed: false,
          };
        } else {
          // Enemy units: AI turn has ended, decrement status effects & cooldowns
          const updatedEffects = (u.statusEffects || [])
            .map((e) => {
              if (
                e.type === 'excess_heal' ||
                e.type === 'excess_shield' ||
                e.type === 'immune_physical' ||
                e.type === 'immune_magical' ||
                e.type === 'shield'
              ) {
                if (e.appliedTurn === undefined || e.appliedTurn === aiTurnNumber) {
                  return { ...e, appliedTurn: aiTurnNumber };
                }
                return { ...e, duration: e.duration - 1 };
              }
              return { ...e, duration: e.duration - 1 };
            })
            .filter((e) => e.duration > 0);

          return {
            ...u,
            statusEffects: updatedEffects,
            skills: u.skills.map((s) => {
              if (s.lastUsedTurn === aiTurnNumber) return s;
              return {
                ...s,
                currentCooldown: Math.max(0, s.currentCooldown - 1),
              };
            }),
          };
        }
      });
    });

    if (anyPlayerDiedFromDoT) {
      setTimeout(() => {
        setUnits((latest) => {
          const alive = latest.filter((u) => u.faction === 'player' && !u.isDead && !u.isSummoned);
          if (alive.length === 0) handleDefeat();
          return latest;
        });
      }, 500);
    }

    // Lineage: Celestial HP Regeneration at turn start
    setUnits((latest) =>
      latest.map((u) => {
        if (u.faction === 'player' && !u.isDead && u.lineageHpRegenPercent && u.lineageHpRegenPercent > 0) {
          if (u.currentHp < u.maxHp) {
            const regenAmt = Math.max(1, Math.round(u.maxHp * (u.lineageHpRegenPercent / 100)));
            const nextHp = Math.min(u.maxHp, u.currentHp + regenAmt);
            const diff = nextHp - u.currentHp;
            if (diff > 0) {
              addFloatingNumber(u.x, u.y, `+${diff} (Celestial)`, 'healing', '#FFD700');
              return { ...u, currentHp: nextHp };
            }
          }
        }
        return u;
      })
    );

    setPhase('player_turn');
    soundManager.playTurnStart(true);
  }, [units, grid, progress.combatSpeed, handleDefeat]);

  const handleEndPlayerTurn = useCallback(() => {
    if (isAnimatingAction) return;

    setSelectedUnitId(null);
    setSelectedAction('none');
    setActiveSkill(null);
    soundManager.playTurnStart(false);

    const currentTurn = turnNumberRef.current;

    // 1. Decrement player units' status effect durations and skill cooldowns as player turn ends
    let nextUnitsState: Unit[] = [];
    setUnits((prev) => {
      nextUnitsState = prev.map((u) => {
        if (u.faction === 'player' && !u.isDead) {
          if (u.isSummoned) {
            const lifeEffect = u.statusEffects?.find((e) => e.type === 'summon_lifetime');
            if (lifeEffect) {
              if (lifeEffect.appliedTurn === currentTurn) {
                return {
                  ...u,
                  statusEffects: u.statusEffects.map((e) =>
                    e.type === 'summon_lifetime' ? { ...e, appliedTurn: undefined } : e
                  ),
                };
              } else {
                addFloatingNumber(u.x, u.y, '💀 Esqueleto desfez-se!', 'status', '#94A3B8');
                if (boardRef.current) {
                  boardRef.current.playDeathAnimation(u.id);
                }
                return {
                  ...u,
                  currentHp: 0,
                  isDead: true,
                  statusEffects: [],
                };
              }
            }
          }
          // Taunt is active against the upcoming enemy phase, so it decrements after the enemy turn ends
          // Invisibility protects against the upcoming enemy phase AND persists until their next turn!
          // Therefore, if it was applied on the current turn, do NOT decrement it at the end of the current turn.
          const updatedEffects = (u.statusEffects || [])
            .map((e) => {
              if (e.type === 'taunt') return e;
              if (e.type === 'invisible') {
                if (e.appliedTurn === undefined || e.appliedTurn === currentTurn) {
                  return { ...e, appliedTurn: currentTurn };
                }
                return { ...e, duration: e.duration - 1 };
              }
              if (e.type === 'excess_heal' || e.type === 'excess_shield') {
                if (e.appliedTurn === undefined || e.appliedTurn === currentTurn) {
                  return { ...e, appliedTurn: currentTurn };
                }
                return { ...e, duration: e.duration - 1 };
              }
              if (e.type === 'shield') {
                if (e.appliedTurn === undefined || e.appliedTurn === currentTurn) {
                  return { ...e, appliedTurn: currentTurn };
                }
                return { ...e, duration: e.duration - 1 };
              }
              return { ...e, duration: e.duration - 1 };
            })
            .filter((e) => e.duration > 0);

          // Linhagem Elfo: Se finalizar o turno sem se mover, recebe +15% de dano no próximo turno
          if (!u.hasMoved && u.lineageStandStillDamageBonusPercent) {
            updatedEffects.push({
              type: 'buff_atk',
              duration: 2,
              value: u.lineageStandStillDamageBonusPercent,
              appliedTurn: currentTurn,
            });
            addFloatingNumber(u.x, u.y, `+${u.lineageStandStillDamageBonusPercent}% Dano (Foco Élfico)`, 'status', '#10B981');
          }

          return {
            ...u,
            centaurMovedTilesThisTurn: 0,
            statusEffects: updatedEffects,
            skills: u.skills.map((s) => {
              if (s.lastUsedTurn === currentTurn) return s;
              return {
                ...s,
                currentCooldown: Math.max(0, s.currentCooldown - 1),
              };
            }),
          };
        }
        return u;
      });
      return nextUnitsState;
    });

    setPhase('ai_turn');
    setTimeout(() => runAiTurn(nextUnitsState), 500);
  }, [runAiTurn, isAnimatingAction]);

  // Handle Victory in current stage
  const handleVictory = (finalUnitsState: Unit[]) => {
    if (!currentLevel) return;

    const latestProg = progressRef.current;

    if (isDailyMode) {
      clearLiveBattleState();
      soundManager.playVictory();
      setPhase('victory');

      const todayStr = getTodayDateString();
      const alreadyCompletedToday = latestProg.dailyDungeon?.lastCompletedDate === todayStr;

      // Recompensa de 20 mil de ouro ao passar a fase diária
      const rewardGold = alreadyCompletedToday ? 0 : 20000;
      const updatedGold = latestProg.gold + rewardGold;
      const dailyPartyUnits = finalUnitsState.filter((u) => u.faction === 'player' && !u.isSummoned);
      const aliveDailyCount = dailyPartyUnits.filter((u) => !u.isDead && u.currentHp > 0).length;
      const isFlawlessDaily = dailyPartyUnits.length >= 4 && aliveDailyCount === dailyPartyUnits.length;
      const hasBossDaily = Boolean(
        currentLevel.hasFinalBoss ||
        currentLevel.hasMiniBoss ||
        currentLevel.enemySpawns.some((s) => s.isBoss || s.isMiniBoss)
      );
      const isComebackDaily = hasBossDaily && aliveDailyCount === 1;
      const dailyClasses = dailyPartyUnits.map((u) => u.className);
      const isNoHealerDaily = !dailyClasses.some((c) => ['curandeiro', 'paladino', 'druida', 'bardo'].includes(c));
      const hasLightDaily = dailyClasses.some((c) => ['curandeiro', 'paladino'].includes(c));
      const hasDarkDaily = dailyClasses.some((c) => ['necromante', 'assassino', 'carrasco_vazio'].includes(c));
      const isLightDarkDaily = hasLightDaily && hasDarkDaily;

      let dailyProgWithMissions = incrementPartyStats(latestProg, dailyClasses, 'battles_won', 1);
      if (hasBossDaily) {
        dailyProgWithMissions = incrementPartyStats(dailyProgWithMissions, dailyClasses, 'bosses_defeated', 1);
      }

      const prevDailyStats = dailyProgWithMissions.lineageQuestStats || {};
      const prevStreakDaily = prevDailyStats.noHealerWins || 0;
      const nextNoHealerDaily = prevStreakDaily >= 15 ? prevStreakDaily : (isNoHealerDaily ? prevStreakDaily + 1 : 0);

      let updatedProgress: PlayerProgress = {
        ...dailyProgWithMissions,
        gold: updatedGold,
        dailyDungeon: {
          lastCompletedDate: todayStr,
          totalWins: (latestProg.dailyDungeon?.totalWins || 0) + 1,
        },
        lineageQuestStats: {
          ...prevDailyStats,
          flawlessWins: (prevDailyStats.flawlessWins || 0) + (isFlawlessDaily ? 1 : 0),
          totalGoldEarned: (prevDailyStats.totalGoldEarned || 0) + rewardGold,
          peakGold: Math.max(prevDailyStats.peakGold || 0, updatedGold),
          battlesWon: (prevDailyStats.battlesWon || 0) + 1,
          noHealerWins: nextNoHealerDaily,
          lightDarkWins: (prevDailyStats.lightDarkWins || 0) + (isLightDarkDaily ? 1 : 0),
          comebackWins: (prevDailyStats.comebackWins || 0) + (isComebackDaily ? 1 : 0),
        },
      };

      const dailyUnlockedLineages = checkLineageUnlockQuests(updatedProgress);
      if (dailyUnlockedLineages.length > 0) {
        updatedProgress = {
          ...updatedProgress,
          unlockedLineages: Array.from(
            new Set([...(updatedProgress.unlockedLineages || INITIAL_UNLOCKED_LINEAGES), ...dailyUnlockedLineages])
          ),
        };
        setPendingUnlockLineages((prev) => Array.from(new Set([...prev, ...dailyUnlockedLineages])));
      }

      progressRef.current = updatedProgress;
      setProgress(updatedProgress);
      savePlayerProgress(updatedProgress);

      const partyUnits = finalUnitsState.filter((u) => u.faction === 'player' && !u.isSummoned);
      setVictorySummary({
        xpGained: 5000,
        goldGained: rewardGold,
        survivingUnits: partyUnits,
        levelUps: [],
        droppedEggs: [],
      });
      return;
    }

    clearLiveBattleState();
    soundManager.playVictory();
    setPhase('victory');

    const xpReward = Math.round(currentLevel.rewards.xpPerUnit);

    // Todos os heróis da equipe recebem o XP e evoluem de nível, mesmo que tenham caído em combate
    const partyUnits = finalUnitsState.filter((u) => u.faction === 'player' && !u.isSummoned);

    const equippedPet = getPetById(latestProg.equippedPetId);
    const petPassives = calculatePetPassives(equippedPet);
    let lineageGoldBonusRatio = 0;
    partyUnits.forEach((u) => {
      if (u.lineageGoldBonusPercent) {
        lineageGoldBonusRatio = Math.max(lineageGoldBonusRatio, u.lineageGoldBonusPercent / 100);
      }
    });

    const goldMultiplier =
      1 + getGeneralGoldMultiplier(latestProg.generalUpgrades?.goldBoost || 0) + (petPassives.goldBoostPercent / 100) + lineageGoldBonusRatio;
    const goldReward = Math.round(currentLevel.rewards.gold * goldMultiplier);
    const levelUps: { unitName: string; oldLevel: number; newLevel: number }[] = [];
    const statChoiceQueue: { unit: Unit; newLevel: number }[] = [];
    const updatedUnitsState = { ...latestProg.unitsState };

    partyUnits.forEach((match) => {
      const uState = updatedUnitsState[match.className] || {
        className: match.className,
        level: 1,
        xp: 0,
        bonusAtk: 0,
        bonusDef: 0,
        bonusHp: 0,
        bonusMag: 0,
        bonusRes: 0,
        learnedSkillIds: [],
      };
      const oldLevel = uState.level;
      const newLevel = oldLevel + 1;
      levelUps.push({ unitName: match.name, oldLevel, newLevel });
      const updatedUnitObj = {
        ...match,
        level: newLevel,
        isDead: false,
        currentHp: match.maxHp,
      };
      statChoiceQueue.push({ unit: updatedUnitObj, newLevel });
      updatedUnitsState[match.className] = {
        ...uState,
        level: newLevel,
      };
    });

    // Check for newly unlocked classes
    const currentUnlocked = latestProg.unlockedClasses || ['guerreiro', 'arqueiro', 'mago', 'curandeiro'];
    const newlyUnlocked: string[] = [];
    Object.entries(CLASS_UNLOCK_CONDITIONS).forEach(([cName, cond]) => {
      if (currentLevel.id === cond.requiredLevel && !currentUnlocked.includes(cName)) {
        newlyUnlocked.push(cName);
      }
    });

    // SECRET CLASS UNLOCK: Carrasco do Vazio
    // Condição: Derrotar Astaroth (Fase 10) utilizando apenas classes corpo a corpo (Alcance 1, Cavaleiro Arcano ou Lanceiro)
    if (currentLevel.id === 10 && !currentUnlocked.includes('carrasco_vazio')) {
      const activeParty = latestProg.activeAdventure?.partyClasses || latestProg.selectedPartyClasses;
      const allMelee =
        activeParty.length === 4 &&
        activeParty.every((cKey) => isMeleeClassForSecretUnlock(cKey));

      if (allMelee) {
        newlyUnlocked.push('carrasco_vazio');
      }
    }

    // SECRET CLASS UNLOCK: Omnimago (Mestre dos Quatro Elementos)
    // Condição: Derrotar o Arquimago das Runas (Fase 25) utilizando uma equipe de apenas Magos
    if (currentLevel.id === 25 && !currentUnlocked.includes('omnimago')) {
      const activeParty = latestProg.activeAdventure?.partyClasses || latestProg.selectedPartyClasses;
      const allMages =
        activeParty.length === 4 &&
        activeParty.every((cKey) => isMageClassForSecretUnlock(cKey));

      if (allMages) {
        newlyUnlocked.push('omnimago');
      }
    }

    // RARE DROP CLASS UNLOCK: Sniper
    // Condição: 1% de chance de drop raro ao vencer qualquer fase
    if (!currentUnlocked.includes('sniper') && Math.random() < 0.01) {
      newlyUnlocked.push('sniper');
    }

    const updatedMonsterKills: Record<string, number> = { ...(latestProg.monsterKills || {}) };

    const questsProgressCheck = {
      ...latestProg,
      monsterKills: updatedMonsterKills,
      unlockedClasses: currentUnlocked,
    };
    const readyLineages = checkLineageUnlockQuests(questsProgressCheck);
    if (readyLineages.length > 0) {
      setPendingUnlockLineages((prev) => Array.from(new Set([...prev, ...readyLineages])));
    }

    const finalUnlockedClasses = Array.from(new Set([...currentUnlocked, ...newlyUnlocked]));

    const nextUnlocked = Math.max(latestProg.unlockedLevel, currentLevel.id + 1);
    const completedList = Array.from(new Set([...latestProg.completedLevels, currentLevel.id]));
    const totalGold = latestProg.gold + goldReward;
    const totalRunGold = (latestProg.activeAdventure?.goldEarnedInRun || 0) + goldReward;

    // Drop de itens ao final da fase com base nos monstros presentes e no bônus de drop
    const dropBonusLvl = getGeneralDropBonus(latestProg.generalUpgrades?.dropRate || 0);
    const isBossStage = Boolean(currentLevel.hasFinalBoss || currentLevel.hasMiniBoss);
    const enemyMonsterTypeIds = currentLevel.enemySpawns.map((s) => s.monsterTypeId);
    const droppedItems = rollStageItemDrops(enemyMonsterTypeIds, 3, isBossStage, dropBonusLvl);

    const prevDiscoveredItems = latestProg.discoveredItemIds || [];
    const newDiscoveredItems = consolidateDiscoveredItems(
      prevDiscoveredItems,
      latestProg.activeAdventure,
      droppedItems.map((it) => it.id)
    );

    const isFinalCampaignLevel = currentLevel.id >= LEVELS.length;

    let updatedHistory = latestProg.adventureHistory || [];
    let updatedActiveAdventure: ActiveAdventure | null = null;
    let nextUnitsState = updatedUnitsState;

    const activeParty = latestProg.activeAdventure?.partyClasses || latestProg.selectedPartyClasses;

    if (isFinalCampaignLevel) {
      // Supreme victory! Archive finished run
      const record: AdventureRecord = {
        id: `adv_${Date.now()}`,
        startedAt: latestProg.activeAdventure?.startedAt || new Date().toISOString(),
        endedAt: new Date().toISOString(),
        farthestLevel: 50,
        farthestLevelName: currentLevel.name,
        result: 'victory',
        partyClasses: activeParty,
        goldEarned: totalRunGold,
      };
      updatedHistory = [record, ...updatedHistory].slice(0, 10);
      updatedActiveAdventure = null;
      nextUnitsState = createInitialUnitsState();
    } else {
      // Advance active adventure to next stage
      updatedActiveAdventure = {
        currentLevelId: currentLevel.id + 1,
        startedAt: latestProg.activeAdventure?.startedAt || new Date().toISOString(),
        unitsState: updatedUnitsState,
        partyClasses: activeParty,
        partyLineages: latestProg.activeAdventure?.partyLineages || latestProg.selectedPartyLineages,
        goldEarnedInRun: totalRunGold,
        inventory: latestProg.activeAdventure?.inventory || [],
        equipment: latestProg.activeAdventure?.equipment || {},
      };
    }

    // Drop de ovos de companheiro: 1% para monstros normais, 25% para mini-chefes, 100% para chefes reais
    let updatedEggs = [...(latestProg.eggs || [])];
    const newDroppedEggs: PetEgg[] = [];

    // Linhagem Lagomorfo: 2x mais chance de encontrar ovos (limite de 1 por equipe; colocar mais de um não acumula adicional)
    const hasLagomorfo = partyUnits.some((u) => u.lineageEggDropRateMultiplier || u.lineageId === 'lagomorfo');
    const eggChanceMultiplier = hasLagomorfo ? 2 : 1;

    currentLevel.enemySpawns.forEach((spawn) => {
      const isBoss = Boolean(spawn.isBoss && !spawn.isMiniBoss);
      const isMiniBoss = Boolean(spawn.isMiniBoss);
      const baseDropChance = isBoss ? 1.0 : isMiniBoss ? 0.25 : 0.01;
      const dropChance = Math.min(1.0, baseDropChance * eggChanceMultiplier);
      if (Math.random() < dropChance) {
        if (updatedEggs.length < MAX_EGGS_LIMIT) {
          const egg = createNewEgg();
          updatedEggs.push(egg);
          newDroppedEggs.push(egg);
        }
      }
    });

    const hasBossSpawned = Boolean(
      currentLevel.hasFinalBoss ||
      currentLevel.hasMiniBoss ||
      currentLevel.enemySpawns.some((s) => s.isBoss || s.isMiniBoss)
    );

    let progressWithMissions = incrementPartyStats(latestProg, activeParty, 'battles_won', 1);
    if (hasBossSpawned) {
      progressWithMissions = incrementPartyStats(progressWithMissions, activeParty, 'bosses_defeated', 1);
    }

    const aliveHeroesCount = partyUnits.filter((u) => !u.isDead && u.currentHp > 0).length;
    const isFlawlessVictory = partyUnits.length >= 4 && aliveHeroesCount === partyUnits.length;
    const isComebackVictory = hasBossSpawned && aliveHeroesCount === 1;
    const isFastBlitzVictory = currentLevel.id > 10 && turnNumberRef.current <= 5;
    const partyClassKeys = partyUnits.map((u) => u.className);
    const isNoHealerVictory = !partyClassKeys.some((c) => ['curandeiro', 'paladino', 'druida', 'bardo'].includes(c));
    const hasLightHero = partyClassKeys.some((c) => ['curandeiro', 'paladino'].includes(c));
    const hasDarkHero = partyClassKeys.some((c) => ['necromante', 'assassino', 'carrasco_vazio'].includes(c));
    const isLightDarkVictory = hasLightHero && hasDarkHero;
    const isFlawlessBossVictory = hasBossSpawned && isFlawlessVictory;
    const prevStats = progressWithMissions.lineageQuestStats || {};
    const prevNoHealerStreak = prevStats.noHealerWins || 0;
    const nextNoHealerStreak =
      prevNoHealerStreak >= 15 ? prevNoHealerStreak : (isNoHealerVictory ? prevNoHealerStreak + 1 : 0);

    let newProgress: PlayerProgress = {
      ...progressWithMissions,
      unlockedLevel: nextUnlocked,
      completedLevels: completedList,
      gold: totalGold,
      unlockedClasses: finalUnlockedClasses,
      unitsState: nextUnitsState,
      activeAdventure: updatedActiveAdventure,
      adventureHistory: updatedHistory,
      discoveredItemIds: newDiscoveredItems,
      eggs: updatedEggs,
      monsterKills: updatedMonsterKills,
      lineageQuestStats: {
        ...prevStats,
        flawlessWins: (prevStats.flawlessWins || 0) + (isFlawlessVictory ? 1 : 0),
        totalGoldEarned: (prevStats.totalGoldEarned || 0) + goldReward,
        peakGold: Math.max(prevStats.peakGold || 0, totalGold),
        bossesDefeated: (prevStats.bossesDefeated || 0) + (hasBossSpawned ? 1 : 0),
        battlesWon: (prevStats.battlesWon || 0) + 1,
        fastBlitzWins: (prevStats.fastBlitzWins || 0) + (isFastBlitzVictory ? 1 : 0),
        noHealerWins: nextNoHealerStreak,
        flawlessBossWins: (prevStats.flawlessBossWins || 0) + (isFlawlessBossVictory ? 1 : 0),
        lightDarkWins: (prevStats.lightDarkWins || 0) + (isLightDarkVictory ? 1 : 0),
        comebackWins: (prevStats.comebackWins || 0) + (isComebackVictory ? 1 : 0),
      },
    };

    const newlyUnlockedLineagesOnWin = checkLineageUnlockQuests(newProgress);
    if (newlyUnlockedLineagesOnWin.length > 0) {
      newProgress = {
        ...newProgress,
        unlockedLineages: Array.from(
          new Set([...(newProgress.unlockedLineages || INITIAL_UNLOCKED_LINEAGES), ...newlyUnlockedLineagesOnWin])
        ),
      };
      setPendingUnlockLineages((prev) => Array.from(new Set([...prev, ...newlyUnlockedLineagesOnWin])));
    }

    progressRef.current = newProgress;
    setProgress(newProgress);
    savePlayerProgress(newProgress);

    if (authUserRef.current) {
      submitScore(currentLevel.id, activeParty).catch((err) =>
        console.error('Falha ao registrar no ranking:', err)
      );
    }

    setVictorySummary({
      xpGained: xpReward,
      goldGained: goldReward,
      survivingUnits: partyUnits,
      levelUps,
      droppedEggs: newDroppedEggs,
    });
    if (statChoiceQueue.length > 0) setPendingStatChoices(statChoiceQueue);
    if (newlyUnlocked.length > 0) setPendingUnlockClasses(newlyUnlocked);
    if (droppedItems.length > 0) setPendingLootItems(droppedItems);
  };

  const handleChooseStat = (chosenStat: StatType) => {
    if (pendingStatChoices.length === 0) return;
    const currentUpgrade = pendingStatChoices[0];
    const { unit, newLevel } = currentUpgrade;
    const className = unit.className;
    const uState = progress.unitsState[className] || {
      className,
      level: newLevel,
      xp: 0,
      bonusAtk: 0,
      bonusDef: 0,
      bonusHp: 0,
      bonusMag: 0,
      bonusRes: 0,
      learnedSkillIds: [],
    };

    let bonusHp = uState.bonusHp || 0;
    let bonusAtk = uState.bonusAtk || 0;
    let bonusMag = uState.bonusMag || 0;
    let bonusDef = uState.bonusDef || 0;
    let bonusRes = uState.bonusRes || 0;

    if (chosenStat === 'hp') bonusHp += 15;
    else if (chosenStat === 'atk') bonusAtk += 3;
    else if (chosenStat === 'mag') bonusMag += 3;
    else if (chosenStat === 'def') bonusDef += 3;
    else if (chosenStat === 'res') bonusRes += 3;

    const updatedUnitsState = {
      ...progress.unitsState,
      [className]: {
        ...uState,
        bonusHp,
        bonusAtk,
        bonusMag,
        bonusDef,
        bonusRes,
      },
    };

    const updatedActiveAdv = progress.activeAdventure
      ? { ...progress.activeAdventure, unitsState: updatedUnitsState }
      : null;

    const updatedProgress = { ...progress, unitsState: updatedUnitsState, activeAdventure: updatedActiveAdv };
    setProgress(updatedProgress);
    savePlayerProgress(updatedProgress);

    // 1 nova habilidade a cada 3 níveis!
    if (newLevel % 3 === 0) {
      setPendingSkillChoices((prev) => [...prev, unit]);
    }

    setPendingStatChoices((prev) => prev.slice(1));
  };

  const currentSkillChoiceUnit = useMemo(() => {
    if (pendingSkillChoices.length === 0) return null;
    const pendingUnit = pendingSkillChoices[0];
    const uState = progress.unitsState[pendingUnit.className];
    if (!uState) return pendingUnit;
    const equippedItemIds: string[] = [];
    const charEquipment = progress.activeAdventure?.equipment?.[pendingUnit.className];
    if (charEquipment) {
      Object.values(charEquipment).forEach((itemId) => {
        if (itemId) equippedItemIds.push(itemId);
      });
    }
    return createPlayerUnit(
      pendingUnit.className as any,
      pendingUnit.id,
      pendingUnit.x,
      pendingUnit.y,
      uState.level,
      uState.xp,
      uState.bonusHp,
      uState.bonusAtk,
      uState.bonusDef,
      uState.bonusMag || 0,
      uState.bonusRes || 0,
      uState.learnedSkillIds || [],
      uState.skillLevels || {},
      equippedItemIds,
      progress.itemUpgrades,
      getClassCumulativeBonus(pendingUnit.className, progress.classUpgrades?.[pendingUnit.className] || 0),
      getGlobalHeroBonus(progress),
      getEquippedSkin(pendingUnit.className, progress.equippedClassSkins)
    );
  }, [pendingSkillChoices, progress.unitsState, progress.activeAdventure?.equipment, progress.itemUpgrades, progress.classUpgrades, progress.generalUpgrades, progress.equippedClassSkins]);

  const handleLearnOrEvolveSkill = (chosenSkill: Skill, isEvolution: boolean) => {
    if (pendingSkillChoices.length === 0) return;
    const currentUnitToUpgrade = pendingSkillChoices[0];
    const className = currentUnitToUpgrade.className;
    const uState = progress.unitsState[className];
    const learnedList = uState ? [...(uState.learnedSkillIds || [])] : [];
    const skillLevels = uState?.skillLevels ? { ...uState.skillLevels } : {};

    if (isEvolution) {
      const currentLvl = skillLevels[chosenSkill.id] || 1;
      // Nível máximo de evolução por habilidade: 5
      skillLevels[chosenSkill.id] = Math.min(MAX_SKILL_LEVEL, currentLvl + 1);
    } else {
      if (!learnedList.includes(chosenSkill.id) && learnedList.length < 4) {
        learnedList.push(chosenSkill.id);
      }
      if (!skillLevels[chosenSkill.id]) {
        skillLevels[chosenSkill.id] = 1;
      }
    }

    const updatedUnitsState = {
      ...progress.unitsState,
      [className]: {
        ...uState,
        learnedSkillIds: learnedList,
        skillLevels,
      },
    };
    const updatedActiveAdv = progress.activeAdventure
      ? { ...progress.activeAdventure, unitsState: updatedUnitsState }
      : null;
    const updatedProgress = {
      ...progress,
      unitsState: updatedUnitsState,
      activeAdventure: updatedActiveAdv,
    };
    setProgress(updatedProgress);
    savePlayerProgress(updatedProgress);

    // Atualiza imediatamente o array de unidades ativas da batalha e a unidade selecionada
    setUnits((prevUnits) =>
      prevUnits.map((u) => {
        if (u.className !== className || u.faction !== 'player') return u;
        const targetLvl = skillLevels[chosenSkill.id] || 1;
        let unitSkills = [...u.skills];
        if (!isEvolution) {
          if (!unitSkills.some((s) => s.id === chosenSkill.id)) {
            const base = SKILLS[chosenSkill.id] || chosenSkill;
            unitSkills.push(getEvolvedSkill(base, 1));
          }
        }
        unitSkills = unitSkills.map((s) => {
          if (s.id === chosenSkill.id) {
            const base = SKILLS[s.id] || s;
            const evolved = getEvolvedSkill(base, targetLvl);
            return {
              ...evolved,
              currentCooldown: s.currentCooldown ?? 0,
            };
          }
          return s;
        });
        return {
          ...u,
          skills: unitSkills,
        };
      })
    );

    setPendingSkillChoices((prev) => prev.slice(1));
  };

  // Select skill action handler
  const handleSelectSkill = useCallback(
    (sk: Skill) => {
      if (!selectedUnit || selectedUnit.faction !== 'player' || selectedUnit.hasAttacked || phase !== 'player_turn') {
        return;
      }
      if (selectedUnit.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0)) {
        addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Atordoado!', 'status', '#FACC15');
        return;
      }
      if (selectedUnit.statusEffects?.some((e) => e.type === 'silence' && e.duration > 0)) {
        addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Silenciado!', 'status', '#A855F7');
        return;
      }
      if (sk.currentCooldown > 0) return;

      if (activeSkill?.id === sk.id) {
        // Toggle off
        setActiveSkill(null);
        setDamagePreview(null);
        setTargetUnitId(null);
        setTargetAoEPoint(null);
        return;
      }

      setActiveSkill(sk);
      setSelectedAction('none');
      setTargetAoEPoint(null);
      if (sk.targetType === 'self') {
        const preview = getDamagePreview(selectedUnit, selectedUnit, sk);
        setDamagePreview(preview);
        setTargetUnitId(selectedUnit.id);
      } else if (sk.targetType === 'ally' && sk.rangeMax === 0 && sk.aoeRadius > 0) {
        const preview = getDamagePreview(selectedUnit, selectedUnit, sk);
        const origin = { x: selectedUnit.x, y: selectedUnit.y };
        const hitTiles = getAoETiles(
          origin,
          sk.aoeRadius,
          grid[0].length,
          grid.length,
          sk.aoeType || 'circle',
          origin
        );
        preview.aoeTargetsCount = units.filter(
          (u) =>
            u.faction === 'player' &&
            !u.isDead &&
            hitTiles.some((pt) => pt.x === u.x && pt.y === u.y)
        ).length;
        setDamagePreview(preview);
        setTargetUnitId(selectedUnit.id);
      } else {
        setDamagePreview(null);
        setTargetUnitId(null);
      }
    },
    [selectedUnit, phase, activeSkill, units]
  );

  // Wait / Pass unit turn handler
  const handleWaitUnit = useCallback(() => {
    if (!selectedUnit || selectedUnit.faction !== 'player' || phase !== 'player_turn') return;
    setUnits((prev) =>
      prev.map((u) => (u.id === selectedUnit.id ? { ...u, hasMoved: true, hasAttacked: true } : u))
    );
    setSelectedUnitId(null);
    setSelectedAction('none');
    setActiveSkill(null);
    setDamagePreview(null);
    setTargetUnitId(null);
  }, [selectedUnit, phase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (currentView !== 'battle' || isAnimatingAction) return;

      if (e.code === 'Enter' && damagePreview) {
        e.preventDefault();
        handleConfirmAttack();
        return;
      }

      if (e.code === 'Space' && phase === 'player_turn') {
        e.preventDefault();
        if (damagePreview) return;
        handleEndPlayerTurn();
        return;
      }

      if (e.code === 'Escape') {
        e.preventDefault();
        setSelectedUnitId(null);
        setSelectedAction('none');
        setActiveSkill(null);
        setDamagePreview(null);
        setTargetUnitId(null);
        return;
      }

      if (selectedUnit && selectedUnit.faction === 'player' && phase === 'player_turn') {
        const isStunned = selectedUnit.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0);
        const code = e.code;
        const key = e.key ? e.key.toLowerCase() : '';

        // 1 2 3 4 5 6 7 8 9 - Atalhos para habilidades
        const digitMatch = code.match(/^(?:Digit|Numpad)([1-9])$/) || (key >= '1' && key <= '9' ? [, key] : null);
        if (digitMatch && !selectedUnit.hasAttacked && !isStunned) {
          const index = parseInt(digitMatch[1], 10) - 1;
          const skill = selectedUnit.skills?.[index];
          if (skill && skill.currentCooldown === 0) {
            e.preventDefault();
            handleSelectSkill(skill);
            return;
          }
        }

        // A - Atacar
        if ((code === 'KeyA' || key === 'a') && !selectedUnit.hasAttacked && !isStunned) {
          e.preventDefault();
          setSelectedAction('attack');
          setActiveSkill(null);
          setDamagePreview(null);
          setTargetUnitId(null);
          return;
        }

        // W - Mover
        if ((code === 'KeyW' || key === 'w') && !selectedUnit.hasMoved && !isStunned) {
          e.preventDefault();
          setSelectedAction('move');
          setActiveSkill(null);
          setDamagePreview(null);
          setTargetUnitId(null);
          return;
        }

        // T - Esperar
        if (code === 'KeyT' || key === 't') {
          e.preventDefault();
          handleWaitUnit();
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentView,
    phase,
    selectedUnit,
    handleEndPlayerTurn,
    isAnimatingAction,
    damagePreview,
    handleConfirmAttack,
    handleSelectSkill,
    handleWaitUnit,
  ]);

  // Auth gate
  if (!authChecked) {
    return (
      <div className="h-screen w-screen bg-[#10131C] flex items-center justify-center text-[#D4AD65]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }
  if (!authUser) {
    return (
      <>
        <AuthScreen
          onAuthenticated={syncUserCloudProgress}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenChangelog={() => setShowChangelog(true)}
        />
        {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
        {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
      </>
    );
  }

  // View Router
  if (currentView === 'level_select') {
    return (
      <>
        <div className="fixed top-2 right-2 sm:top-3 sm:right-3 z-40 flex items-center gap-1 sm:gap-2 bg-[#1B2030]/90 backdrop-blur border border-[#343B50] rounded-xl p-1 sm:p-1.5 shadow-lg text-xs font-sans max-w-[calc(100vw-1rem)]">
          <span className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 text-[#F3F4F8] font-semibold truncate max-w-[120px] sm:max-w-none">
            <UserIcon size={14} className="text-[#4C8DFF] shrink-0" /> <span className="truncate">{authUser.username}</span>
            {authUser.id === 0 && (
              <span className="text-[9px] sm:text-[10px] bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 px-1 py-0.2 rounded font-normal shrink-0">
                Offline
              </span>
            )}
          </span>
          <button
            id="open-changelog"
            onClick={() => setShowChangelog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] font-bold hover:bg-[#10B981]/20 transition-colors"
          >
            <Sparkles size={14} /> Atualizações
            <span className="bg-[#10B981]/20 text-[#10B981] px-1.5 py-0.2 rounded-full text-[10px] font-black border border-[#10B981]/30">
              {GAME_CHANGELOG[0]?.version || 'v1.7'}
            </span>
          </button>
          <button
            id="open-leaderboard"
            onClick={() => setShowLeaderboard(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#D4AD65]/10 text-[#D4AD65] font-bold hover:bg-[#D4AD65]/20 transition-colors"
          >
            <Trophy size={14} /> Ranking
          </button>
          <button
            id="logout"
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[#A7B0C4] hover:text-[#FF7A7A] hover:bg-[#FF5252]/10 transition-colors"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>

        <LevelSelect
          progress={progress}
          onStartAdventure={handleStartNewAdventure}
          onContinueAdventure={handleContinueAdventure}
          onAbandonAdventure={handleAbandonAdventure}
          onChangeParty={() => {
            setCurrentView('party_select');
          }}
          onResetProgress={handleResetProgress}
          onOpenBestiary={() => setShowBestiary(true)}
          onOpenHistory={() => setShowHistory(true)}
          onOpenEquipment={() => setShowEquipment(true)}
          onOpenItemBestiary={() => setShowItemBestiary(true)}
          onOpenBaseUpgrades={() => setShowBaseUpgrades(true)}
          onOpenChangelog={() => setShowChangelog(true)}
          onOpenPets={() => setShowPetsModal(true)}
          onOpenCoupons={() => setShowCouponModal(true)}
          onOpenTrainingMode={() => setShowTrainingModal(true)}
          onOpenClassMissions={() => setShowClassMissionsModal(true)}
          onOpenDailyDungeon={() => setShowDailyDungeonModal(true)}
            onOpenClassUnlockQuests={() => setShowClassUnlockQuestsModal(true)}
        />

        {showDailyDungeonModal && (
          <DailyDungeonModal
            config={dailyDungeonConfig || generateDailyDungeonConfig()}
            dailyState={progress.dailyDungeon}
            onStartDailyDungeon={handleStartDailyDungeon}
            onClose={() => setShowDailyDungeonModal(false)}
          />
        )}

        {showDailyItemDraft && dailyDungeonConfig && (
          <DailyItemDraftModal
            draftRounds={dailyDungeonConfig.itemDraftRounds || []}
            onConfirmDraft={handleConfirmDailyItemDraft}
            onClose={() => setShowDailyItemDraft(false)}
          />
        )}

        {showTrainingModal && (
          <TrainingModeModal
            onStartTraining={handleStartTraining}
            onClose={() => setShowTrainingModal(false)}
          />
        )}

        {showChangelog && (
          <ChangelogModal onClose={() => setShowChangelog(false)} />
        )}
        {showLeaderboard && (
          <LeaderboardModal currentUsername={authUser.username} onClose={() => setShowLeaderboard(false)} />
        )}
        {showBestiary && (
          <BestiaryModal
            discoveredMonsterIds={progress.discoveredMonsterIds || []}
            discoveredItemIds={progress.discoveredItemIds || []}
            onClose={() => setShowBestiary(false)}
          />
        )}
        {showHistory && (
          <AdventureHistoryModal
            history={progress.adventureHistory || []}
            onClose={() => setShowHistory(false)}
          />
        )}
        {showEquipment && (
          <EquipmentModal
            partyClasses={isDailyMode ? (dailyDungeonConfig?.partyClasses || []) : (progress.activeAdventure?.partyClasses || progress.selectedPartyClasses)}
            unitsState={isDailyMode ? dailyUnitsState : (progress.activeAdventure?.unitsState || progress.unitsState)}
            equipment={isDailyMode ? dailyEquipment : (progress.activeAdventure?.equipment || {})}
            inventory={isDailyMode ? dailyInventory : (progress.activeAdventure?.inventory || [])}
            itemUpgrades={progress.itemUpgrades || {}}
            onEquipItem={isDailyMode ? handleEquipDailyItem : handleEquipItem}
            onUnequipItem={isDailyMode ? handleUnequipDailyItem : handleUnequipItem}
            onClose={() => setShowEquipment(false)}
            isDailyDungeon={isDailyMode}
          />
        )}
        {showItemBestiary && (
          <ItemBestiaryModal
            discoveredItemIds={progress.discoveredItemIds || []}
            itemUpgrades={progress.itemUpgrades || {}}
            gold={progress.gold}
            onUpgradeItem={handleUpgradeItem}
            onClose={() => setShowItemBestiary(false)}
          />
        )}
        {showBaseUpgrades && (
          <BaseUpgradeModal
            gold={progress.gold}
            classUpgrades={progress.classUpgrades || {}}
            generalUpgrades={progress.generalUpgrades || {}}
            itemUpgrades={progress.itemUpgrades || {}}
            discoveredItemIds={progress.discoveredItemIds || []}
            unlockedClasses={progress.unlockedClasses || []}
            onUpgradeClass={handleUpgradeClass}
            onUpgradeGeneral={handleUpgradeGeneral}
            onUpgradeItem={handleUpgradeItem}
            onClose={() => setShowBaseUpgrades(false)}
          />
        )}
        {showPetsModal && (
          <PetModal
            progress={progress}
            onUpdateProgress={(newProgress) => {
              progressRef.current = newProgress;
              setProgress(newProgress);
              savePlayerProgress(newProgress);
            }}
            onClose={() => setShowPetsModal(false)}
          />
        )}
        {showCouponModal && (
          <CouponModal
            isOpen={showCouponModal}
            onClose={() => setShowCouponModal(false)}
            authUser={authUser}
            onRedeemed={(_reward, newGold, newEggs, newClasses) => {
              setProgress((prev) => {
                const next = { ...prev };
                if (typeof newGold === 'number') next.gold = newGold;
                if (Array.isArray(newEggs)) next.eggs = newEggs;
                if (Array.isArray(newClasses)) next.unlockedClasses = newClasses;
                progressRef.current = next;
                savePlayerProgress(next);
                return next;
              });
            }}
          />
        )}
        {showClassUnlockQuestsModal && (
        <ClassUnlockQuestsModal
          progress={progress}
          onClose={() => setShowClassUnlockQuestsModal(false)}
        />
      )}
      {showClassMissionsModal && (
          <ClassMissionsModal
            progress={progress}
            onUpdateProgress={(newProgress) => {
              progressRef.current = newProgress;
              setProgress(newProgress);
              savePlayerProgress(newProgress);
            }}
            onClose={() => setShowClassMissionsModal(false)}
          />
        )}
      </>
    );
  }

  if (currentView === 'party_select') {
    return (
      <>
        <PartySelectionModal
          progress={progress}
          isAdventureActive={Boolean(progress.activeAdventure)}
          initialSelected={progress.activeAdventure?.partyClasses || progress.selectedPartyClasses}
          initialLineages={progress.activeAdventure?.partyLineages || progress.selectedPartyLineages || {}}
          unlockedClasses={progress.unlockedClasses || ['guerreiro', 'arqueiro', 'mago', 'curandeiro']}
          playerGold={progress.gold}
          equippedClassSkins={progress.equippedClassSkins}
          onBuyClass={handleBuyClass}
          onConfirmParty={handleConfirmParty}
          onOpenClassMissions={() => setShowClassMissionsModal(true)}
          onClose={() => setCurrentView('level_select')}
        />
        {pendingUnlockLineages.length > 0 && (
          <LineageUnlockCelebrationModal
            lineageIds={pendingUnlockLineages}
            onDismiss={() => setPendingUnlockLineages((prev) => prev.slice(1))}
          />
        )}
        {pendingUnlockClasses.length > 0 && (
          <ClassUnlockModal
            unlockedClasses={pendingUnlockClasses}
            onDismiss={() => setPendingUnlockClasses((prev) => prev.slice(1))}
          />
        )}
        {showClassMissionsModal && (
          <ClassMissionsModal
            progress={progress}
            onUpdateProgress={(newProgress) => {
              progressRef.current = newProgress;
              setProgress(newProgress);
              savePlayerProgress(newProgress);
            }}
            onClose={() => setShowClassMissionsModal(false)}
          />
        )}
      </>
    );
  }

  const alliesCount = units.filter((u) => u.faction === 'player' && !u.isDead).length;
  const enemiesCount = units.filter((u) => u.faction === 'enemy' && !u.isDead).length;

  return (
    <div className="h-screen w-screen bg-[#10131C] text-[#F3F4F8] flex flex-col overflow-hidden font-sans select-none">
      <TopBar
        levelNumber={isTrainingMode ? 9999 : isDailyMode ? 9000 : currentLevel?.id || 1}
        levelName={isTrainingMode ? 'Campo de Treinamento' : isDailyMode ? 'Fase Diária' : currentLevel?.name || 'Fase'}
        turnNumber={turnNumber}
        alliesCount={alliesCount}
        enemiesCount={enemiesCount}
        phase={phase}
        combatSpeed={progress.combatSpeed}
        bossUnit={bossUnit}
        onToggleSpeed={handleToggleSpeed}
        onOpenObjectives={() => setShowObjectives(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenTutorial={() => setShowTutorial(true)}
        onEndTurn={handleEndPlayerTurn}
        onOpenBestiary={() => setShowBestiary(true)}
        onOpenHistory={() => setShowHistory(true)}
        onOpenEquipment={() => setShowEquipment(true)}
        onOpenItemCatalog={() => setShowItemBestiary(true)}
        onOpenBaseUpgrades={() => setShowBaseUpgrades(true)}
        onOpenPets={() => setShowPetsModal(true)}
        onOpenClassMissions={() => setShowClassMissionsModal(true)}
        onOpenRiddle={
          currentLevel?.id === 10 && hasPedestalBeenStruck
            ? () => { setRiddleType('astaroth'); setShowSecretRiddle(true); }
            : currentLevel?.id === 25 && activatedElementalCrystals.length >= 4
            ? () => { setRiddleType('omnimago'); setShowSecretRiddle(true); }
            : undefined
        }
        onSaveAndExit={() => {
          if (isDailyMode) {
            handleExitDailyDungeon();
            return;
          }
          if (isTrainingMode) {
            handleExitTraining();
            return;
          }
          if (currentLevel && units.length > 0) {
            saveLiveBattleState(
              {
                levelId: currentLevel.id,
                turnNumber,
                phase,
                units,
                activeBossBanner,
                waterTornadoActive,
                waterTornadoCenter,
              },
              true
            );
          }
          setCurrentView('level_select');
        }}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {isTrainingMode && (
          <TrainingBattleHUD
            totalDamage={trainingDamageStats.totalDamage}
            highestHit={trainingDamageStats.highestHit}
            hitCount={trainingDamageStats.hitCount}
            onResetCooldowns={handleResetTrainingCooldowns}
            onHealTeam={handleHealTrainingTeam}
            onResetDummies={handleResetTrainingDummies}
            onExitTraining={handleExitTraining}
            onOpenSkillSelector={() => setShowLiveTrainingSkillPicker(true)}
          />
        )}

        {phase === 'deployment' && (
          <DeploymentBanner
            onStartBattle={handleConfirmDeployment}
            onOpenEquipment={() => setShowEquipment(true)}
          />
        )}

        {/* LEFT: Skills List Panel */}
        <SkillsPanel
          selectedUnit={selectedUnit}
          activeSkill={activeSkill}
          onSelectSkill={handleSelectSkill}
          onClearSkill={() => {
            setActiveSkill(null);
            setDamagePreview(null);
            setTargetUnitId(null);
            setTargetAoEPoint(null);
          }}
          isPlayerTurn={phase === 'player_turn'}
          equippedPet={getPetById(progress.equippedPetId)}
          activePetSkill={activePetSkill}
          onSelectPetSkill={(sk) => {
            setSelectedUnitId(null);
            setSelectedAction('none');
            setActiveSkill(null);
            setActivePetSkill(sk);
          }}
          onClearPetSkill={() => setActivePetSkill(null)}
          turnNumber={turnNumber}
          usedPetSkillIds={usedPetSkillIds}
        />

        {/* CENTER: 3D Tactical Battlefield */}
        <main className="flex-1 flex items-center justify-center p-0 md:p-2 overflow-hidden relative w-full h-full">
          {hoveredTile && grid[hoveredTile.y]?.[hoveredTile.x]?.corruptionTurns ? (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/90 border border-purple-500/60 backdrop-blur-md shadow-lg shadow-purple-900/50 text-purple-200 text-xs font-semibold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              Poça de Corrupção ({grid[hoveredTile.y][hoveredTile.x].corruptionTurns} turnos restantes) - 10% Vida Máxima de Dano Verdadeiro
            </div>
          ) : null}
          {hoveredTile && grid[hoveredTile.y]?.[hoveredTile.x]?.antiHealPermanent ? (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/95 border border-purple-500/80 backdrop-blur-md shadow-lg shadow-purple-950/80 text-purple-200 text-xs font-semibold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              ☠️ Solo Maldito: Personagens sobre esta casa NÃO PODEM SER CURADOS!
            </div>
          ) : null}
          {hoveredTile && grid[hoveredTile.y]?.[hoveredTile.x]?.borderFire ? (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-950/95 border border-orange-500/80 backdrop-blur-md shadow-lg shadow-orange-950/80 text-orange-200 text-xs font-semibold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
              🔥 Chamas da Borda: 10% da Vida Máxima ao iniciar o turno aqui!
            </div>
          ) : null}
          <BoardRenderer3D
            ref={boardRef}
            grid={grid}
            units={units}
            selectedUnit={selectedUnit}
            reachableTiles={reachableTiles}
            attackableTiles={attackableTiles}
            aoeTiles={aoeTiles}
            deploymentZone={
              currentLevel?.deploymentZone
                ? currentLevel.deploymentZone.filter(
                    (pt) => !grid[pt.y] || grid[pt.y][pt.x]?.obstacle === 'none'
                  )
                : []
            }
            phase={phase}
            floatingNumbers={floatingNumbers}
            onTileClick={handleTileClick}
            onTileHover={(x, y) => setHoveredTile(y === null ? null : { x, y })}
            hoveredTile={hoveredTile}
            activeSkill={activeSkill || undefined}
          />
        </main>

        {/* RIGHT: Unit Status & Movement / Actions Panel (Desktop lg+) */}
        <SidePanel
          selectedUnit={selectedUnit}
          selectedAction={selectedAction}
          activeSkill={activeSkill}
          units={units}
          attackableTiles={attackableTiles}
          onTargetTile={(tx, ty) => handleTileClick(tx, ty)}
          onSelectAction={(act) => {
            setSelectedAction(act);
            setActiveSkill(null);
            setDamagePreview(null);
            setTargetUnitId(null);
          }}
          onWaitUnit={handleWaitUnit}
          onCancelSelection={() => {
            setSelectedUnitId(null);
            setSelectedAction('none');
            setActiveSkill(null);
            setDamagePreview(null);
            setTargetUnitId(null);
          }}
          isPlayerTurn={phase === 'player_turn'}
          turnNumber={turnNumber}
        />

        {/* MOBILE HUD (< lg screen controls) */}
        <MobileBattleHUD
          selectedUnit={selectedUnit}
          selectedAction={selectedAction}
          activeSkill={activeSkill}
          units={units}
          attackableTiles={attackableTiles}
          onTargetTile={(tx, ty) => handleTileClick(tx, ty)}
          phase={phase}
          turnNumber={turnNumber}
          onSelectAction={(act) => {
            setSelectedAction(act);
            setActiveSkill(null);
            setDamagePreview(null);
            setTargetUnitId(null);
          }}
          onSelectSkill={handleSelectSkill}
          onClearSkill={() => {
            setActiveSkill(null);
            setDamagePreview(null);
            setTargetUnitId(null);
            setTargetAoEPoint(null);
          }}
          onWaitUnit={handleWaitUnit}
          onCancelSelection={() => {
            setSelectedUnitId(null);
            setSelectedAction('none');
            setActiveSkill(null);
            setDamagePreview(null);
            setTargetUnitId(null);
          }}
          onEndTurn={handleEndPlayerTurn}
          equippedPet={getPetById(progress.equippedPetId)}
          activePetSkill={activePetSkill}
          onSelectPetSkill={(sk) => {
            setSelectedUnitId(null);
            setSelectedAction('none');
            setActiveSkill(null);
            setActivePetSkill(sk);
          }}
          onClearPetSkill={() => setActivePetSkill(null)}
          usedPetSkillIds={usedPetSkillIds}
        />
      </div>

      {damagePreview && (
        <ActionPreviewModal
          preview={damagePreview}
          turnNumber={turnNumber}
          onConfirm={handleConfirmAttack}
          onCancel={() => {
            setDamagePreview(null);
            setTargetUnitId(null);
            setTargetAoEPoint(null);
          }}
        />
      )}
      {showObjectives && currentLevel && <ObjectivesModal level={currentLevel} onClose={() => setShowObjectives(false)} />}
      {showSettings && (
        <SettingsModal
          settings={audioSettings}
          onUpdateSettings={(newSets) => setAudioSettings((prev) => ({ ...prev, ...newSets }))}
          onResetProgress={handleResetProgress}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      {showSecretRiddle && (
        <SecretRiddleModal
          isOpen={showSecretRiddle}
          onClose={() => setShowSecretRiddle(false)}
          riddleType={riddleType}
        />
      )}
      {activeBossBanner && (
        <BossIntroBanner
          bossName={activeBossBanner.name}
          subtitle={activeBossBanner.subtitle}
          phaseNumber={activeBossBanner.phase}
          onDismiss={() => setActiveBossBanner(null)}
        />
      )}

      {pendingStatChoices.length > 0 && (
        <StatChoiceModal
          unit={pendingStatChoices[0].unit}
          newLevel={pendingStatChoices[0].newLevel}
          onChooseStat={handleChooseStat}
        />
      )}

      {pendingStatChoices.length === 0 && currentSkillChoiceUnit && (
        <SkillChoiceModal
          unit={currentSkillChoiceUnit}
          unlockedClassSkillIds={progress.unlockedClassSkillIds || []}
          onChooseSkill={handleLearnOrEvolveSkill}
          onSkip={() => setPendingSkillChoices((prev) => prev.slice(1))}
        />
      )}

      {pendingStatChoices.length === 0 && pendingSkillChoices.length === 0 && pendingUnlockClasses.length > 0 && (
        <ClassUnlockModal
          unlockedClasses={pendingUnlockClasses}
          onDismiss={() => setPendingUnlockClasses((prev) => prev.slice(1))}
        />
      )}

      {pendingStatChoices.length === 0 &&
        pendingSkillChoices.length === 0 &&
        pendingUnlockClasses.length === 0 &&
        pendingLootItems &&
        pendingLootItems.length > 0 && (
          <ItemLootModal
            items={pendingLootItems}
            levelNumber={currentLevel?.id || 1}
            onSelectItem={handleSelectLootItem}
            onOpenInventory={() => setShowEquipment(true)}
          />
        )}

      {(phase === 'victory' || phase === 'defeat') &&
        currentLevel &&
        pendingStatChoices.length === 0 &&
        pendingSkillChoices.length === 0 &&
        pendingUnlockClasses.length === 0 &&
        !pendingLootItems && (
          <VictoryDefeatModal
            isVictory={phase === 'victory'}
            levelNumber={isDailyMode ? 9000 : currentLevel.id}
            isDailyDungeon={isDailyMode}
            summary={
              victorySummary || {
                xpGained: currentLevel.rewards.xpPerUnit,
                goldGained: currentLevel.rewards.gold,
                survivingUnits: [],
                levelUps: [],
              }
            }
            hasNextLevel={!isDailyMode && currentLevel.id < LEVELS.length}
            playerGold={progress.gold}
            unlockedClassesCount={progress.unlockedClasses?.length || 4}
            onNextLevel={() => startLevel(currentLevel.id + 1)}
            onRetry={isDailyMode ? handleStartDailyDungeon : handleStartNewAdventure}
            onGoToMenu={() => { if (isDailyMode) { handleExitDailyDungeon(); } else { setCurrentView('level_select'); } }}
          />
        )}

      {/* Global Modals accessible anytime */}
      {showBestiary && (
        <BestiaryModal
          discoveredMonsterIds={progress.discoveredMonsterIds || []}
          discoveredItemIds={progress.discoveredItemIds || []}
          onClose={() => setShowBestiary(false)}
        />
      )}
      {showHistory && (
        <AdventureHistoryModal
          history={progress.adventureHistory || []}
          onClose={() => setShowHistory(false)}
        />
      )}
      {showEquipment && (
        <EquipmentModal
          partyClasses={isDailyMode ? (dailyDungeonConfig?.partyClasses || []) : (progress.activeAdventure?.partyClasses || progress.selectedPartyClasses)}
          unitsState={isDailyMode ? dailyUnitsState : (progress.activeAdventure?.unitsState || progress.unitsState)}
          equipment={isDailyMode ? dailyEquipment : (progress.activeAdventure?.equipment || {})}
          inventory={isDailyMode ? dailyInventory : (progress.activeAdventure?.inventory || [])}
          itemUpgrades={progress.itemUpgrades || {}}
          onEquipItem={isDailyMode ? handleEquipDailyItem : handleEquipItem}
          onUnequipItem={isDailyMode ? handleUnequipDailyItem : handleUnequipItem}
          onClose={() => setShowEquipment(false)}
          isDailyDungeon={isDailyMode}
        />
      )}
      {showItemBestiary && (
        <ItemBestiaryModal
          discoveredItemIds={progress.discoveredItemIds || []}
          itemUpgrades={progress.itemUpgrades || {}}
          gold={progress.gold}
          onUpgradeItem={handleUpgradeItem}
          onClose={() => setShowItemBestiary(false)}
        />
      )}
      {showBaseUpgrades && (
        <BaseUpgradeModal
          gold={progress.gold}
          classUpgrades={progress.classUpgrades || {}}
          generalUpgrades={progress.generalUpgrades || {}}
          itemUpgrades={progress.itemUpgrades || {}}
          discoveredItemIds={progress.discoveredItemIds || []}
          unlockedClasses={progress.unlockedClasses || []}
          onUpgradeClass={handleUpgradeClass}
          onUpgradeGeneral={handleUpgradeGeneral}
          onUpgradeItem={handleUpgradeItem}
          onClose={() => setShowBaseUpgrades(false)}
        />
      )}
      {showPetsModal && (
        <PetModal
          progress={progress}
          onUpdateProgress={(newProgress) => {
            progressRef.current = newProgress;
            setProgress(newProgress);
            savePlayerProgress(newProgress);
          }}
          onClose={() => setShowPetsModal(false)}
        />
      )}
      {showClassMissionsModal && (
        <ClassMissionsModal
          progress={progress}
          onUpdateProgress={(newProgress) => {
            progressRef.current = newProgress;
            setProgress(newProgress);
            savePlayerProgress(newProgress);
          }}
          onClose={() => setShowClassMissionsModal(false)}
        />
      )}
      {isTrainingMode && showLiveTrainingSkillPicker && (
        <TrainingSkillPickerModal
          classNameKey={
            selectedUnit?.faction === 'player'
              ? selectedUnit.className
              : units.find((u) => u.faction === 'player')?.className || 'guerreiro'
          }
          initialSkillsByClass={
            units
              .filter((u) => u.faction === 'player')
              .reduce((acc, u) => {
                const def = CLASS_DEFINITIONS[u.className];
                acc[u.className] = u.skills
                  .filter((s) => s.id !== def?.baseSkillId)
                  .map((s) => s.id);
                return acc;
              }, {} as Record<string, string[]>)
          }
          heroLevel={trainingConfig?.heroLevel || 10}
          allTeamClasses={units.filter((u) => u.faction === 'player').map((u) => u.className)}
          onSaveSkills={handleSaveLiveTrainingSkills}
          onClose={() => setShowLiveTrainingSkillPicker(false)}
        />
      )}
    </div>
  );
}

export default App;
