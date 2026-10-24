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
import { LEVELS } from './data/levels';
import { createPlayerUnit, CLASS_DEFINITIONS, CLASS_UNLOCK_CONDITIONS, INITIAL_CLASSES, getMaxCompletedLevel, sanitizeUnlockedClasses, sanitizePartyClasses } from './data/units';
import { SKILLS, getEvolvedSkill, MAX_SKILL_LEVEL } from './data/skills';
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
import { PetModal } from './components/PetModal';
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
  const [activePetSkill, setActivePetSkill] = useState<PetActiveSkill | null>(null);
  const [usedPetSkillIds, setUsedPetSkillIds] = useState<string[]>([]);
  const [pendingLootItems, setPendingLootItems] = useState<ItemDefinition[] | null>(null);

  const authUserRef = useRef<AuthUser | null>(null);
  authUserRef.current = authUser;

  const syncUserCloudProgress = async (user: AuthUser) => {
    setAuthUser(user);
    try {
      const cloudP = await fetchCloudProgress();
      if (cloudP) {
        const maxCompleted = getMaxCompletedLevel({
          activeAdventure: cloudP.activeAdventure,
          adventureHistory: cloudP.adventureHistory,
          leaderboardHighestLevel: cloudP.highestLevel || progress.highScore,
        });

        // Merge local unlocked classes and cloud unlocked classes so no valid unlock is lost
        const combinedUnlocked = Array.from(
          new Set([
            ...(progress.unlockedClasses || []),
            ...(cloudP.unlockedClasses || []),
          ])
        ).map((c) => (c === 'engenheiro' ? 'druida' : c));
        const safeUnlocked = sanitizeUnlockedClasses(combinedUnlocked, maxCompleted, progress.completedLevels || []);
        
        // Prefer local selectedPartyClasses if it has 4 valid classes (to prevent stale cloud overwrites)
        const rawPartyChoice =
          Array.isArray(progress.selectedPartyClasses) && progress.selectedPartyClasses.length === 4
            ? progress.selectedPartyClasses
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

        const merged: PlayerProgress = {
          ...DEFAULT_PROGRESS,
          gold: typeof cloudP.gold === 'number' ? cloudP.gold : 0,
          unlockedClasses: safeUnlocked,
          selectedPartyClasses: safeParty,
          unitsState: cloudP.unitsState || createInitialUnitsState(),
          discoveredMonsterIds: Array.isArray(cloudP.discoveredMonsterIds) && cloudP.discoveredMonsterIds.length > 0
            ? Array.from(new Set(cloudP.discoveredMonsterIds))
            : ['goblin'],
          discoveredItemIds: consolidateDiscoveredItems(
            Array.isArray(cloudP.discoveredItemIds) ? cloudP.discoveredItemIds : [],
            cloudP.activeAdventure ?? progress.activeAdventure,
            progress.discoveredItemIds || []
          ),
          activeAdventure: cloudP.activeAdventure
            ? {
                ...cloudP.activeAdventure,
                partyClasses: Array.isArray(cloudP.activeAdventure.partyClasses) && cloudP.activeAdventure.partyClasses.length === 4
                  ? sanitizePartyClasses(cloudP.activeAdventure.partyClasses, safeUnlocked)
                  : (progress.activeAdventure?.partyClasses || safeParty),
                battleState: loadLiveBattleState() || cloudP.activeAdventure.battleState || progress.activeAdventure?.battleState || null,
              }
            : progress.activeAdventure?.battleState || loadLiveBattleState()
              ? {
                  currentLevelId: (loadLiveBattleState() || progress.activeAdventure?.battleState)!.levelId,
                  partyClasses: progress.activeAdventure?.partyClasses || safeParty,
                  startedAt: new Date().toISOString(),
                  goldEarnedInRun: 0,
                  unitsState: cloudP.unitsState || createInitialUnitsState(),
                  battleState: loadLiveBattleState() || progress.activeAdventure?.battleState || null,
                }
              : null,
          adventureHistory: Array.isArray(cloudP.adventureHistory) ? cloudP.adventureHistory : [],
          combatSpeed: cloudP.combatSpeed || 'normal',
          classUpgrades: mergeLevelMaps(progress.classUpgrades, cloudP.classUpgrades),
          generalUpgrades: mergeLevelMaps(progress.generalUpgrades, cloudP.generalUpgrades),
          itemUpgrades: mergeLevelMaps(progress.itemUpgrades, cloudP.itemUpgrades),
          unlockedPetIds: Array.from(new Set([
            ...(Array.isArray(cloudP.unlockedPetIds) ? cloudP.unlockedPetIds : []),
            ...(Array.isArray(progress.unlockedPetIds) ? progress.unlockedPetIds : []),
          ])),
          equippedPetId: (typeof cloudP.equippedPetId === 'string' && cloudP.equippedPetId)
            ? cloudP.equippedPetId
            : (progress.equippedPetId || null),
          eggs: (Array.isArray(cloudP.eggs) && cloudP.eggs.length > 0)
            ? cloudP.eggs
            : (Array.isArray(progress.eggs) ? progress.eggs : []),
        };

        setProgress(merged);
        savePlayerProgress(merged);
      } else {
        // Nova conta ou modo offline: preserva progresso local existente se houver
        const existingLocal = loadPlayerProgress();
        if (existingLocal && Array.isArray(existingLocal.unlockedClasses) && existingLocal.unlockedClasses.length > 0) {
          setProgress(existingLocal);
        } else {
          const freshProgress: PlayerProgress = {
            ...DEFAULT_PROGRESS,
            unlockedClasses: [...INITIAL_CLASSES],
            selectedPartyClasses: [...INITIAL_CLASSES],
            unitsState: createInitialUnitsState(),
          };
          setProgress(freshProgress);
          savePlayerProgress(freshProgress);
          if (user.id !== 0) {
            await saveCloudProgress(freshProgress);
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
        }
      }
      setAuthChecked(true);
    });
  }, []);

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
          if (eff.type === 'slow') return { ...eff, value: Math.min(1, eff.value || 1) };
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
  const [hasPedestalBeenStruck, setHasPedestalBeenStruck] = useState(false);
  const [pendingStatChoices, setPendingStatChoices] = useState<{ unit: Unit; newLevel: number }[]>([]);
  const [pendingSkillChoices, setPendingSkillChoices] = useState<Unit[]>([]);
  const [pendingUnlockClasses, setPendingUnlockClasses] = useState<string[]>([]);
  const [activeBossBanner, setActiveBossBanner] = useState<{ name: string; subtitle: string; phase?: number } | null>(() => {
    const liveBattle = loadLiveBattleState();
    const loadedProg = loadPlayerProgress();
    if (liveBattle && loadedProg.activeAdventure) {
      return liveBattle.activeBossBanner || null;
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
        getGlobalHeroBonus(progress)
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
        spawn.levelOffset || 0
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

    saveLiveBattleState({
      levelId: lvlConfig.id,
      turnNumber: 1,
      phase: 'deployment',
      units: initialUnits,
      activeBossBanner: bannerObj,
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
          if (eff.type === 'slow') return { ...eff, value: Math.min(1, eff.value || 1) };
          if (eff.type === 'excess_heal' || eff.type === 'excess_shield') return { ...eff, duration: Math.min(1, eff.duration) };
          if (eff.type === 'taunt') return { ...eff, duration: Math.min(1, eff.duration) };
          return eff;
        }),
      }))
    );
    setTurnNumber(savedBattle.turnNumber);
    setPhase(savedBattle.phase === 'ai_turn' ? 'player_turn' : savedBattle.phase);
    setActiveBossBanner(savedBattle.activeBossBanner || null);

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
    if (
      savedBattle &&
      savedBattle.levelId === progress.activeAdventure.currentLevelId &&
      Array.isArray(savedBattle.units) &&
      savedBattle.units.length > 0
    ) {
      resumeBattle(savedBattle);
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

  const handleConfirmParty = (selectedPartyClasses: string[]) => {
    if (progress.activeAdventure) {
      setCurrentView('level_select');
      return;
    }
    const updatedProgress = { ...progress, selectedPartyClasses };
    setProgress(updatedProgress);
    savePlayerProgress(updatedProgress);
    setCurrentView('level_select');
  };

  const handleConfirmDeployment = () => {
    setPhase('player_turn');
    setSelectedUnitId(null);
    soundManager.playTurnStart(true);
  };

  // Auto-salva continuamente o estado da batalha em andamento sempre que houver qualquer alteração
  useEffect(() => {
    if (
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
    };

    saveLiveBattleState(bState);
  }, [currentView, currentLevel, turnNumber, phase, units, activeBossBanner, progress.activeAdventure]);

  // Garante persistência síncrona antes do recarregamento da página (F5) ou fechamento de aba
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (
        currentView === 'battle' &&
        currentLevel &&
        phase !== 'victory' &&
        phase !== 'defeat' &&
        units.length > 0 &&
        progress.activeAdventure
      ) {
        saveLiveBattleState({
          levelId: currentLevel.id,
          turnNumber,
          phase,
          units,
          activeBossBanner,
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentView, currentLevel, turnNumber, phase, units, activeBossBanner, progress.activeAdventure]);

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
          getGlobalHeroBonus(progress)
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
          getGlobalHeroBonus(progress)
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
          getGlobalHeroBonus(nextP)
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
            getGlobalHeroBonus(nextP)
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
          getGlobalHeroBonus(nextP)
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
    if (!selectedUnit || phase !== 'player_turn' || selectedUnit.faction !== 'player' || selectedUnit.hasMoved || isAnimatingAction) return [];
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

    const stageReached = currentLevel ? currentLevel.id : 1;
    const runGold = progress.activeAdventure?.goldEarnedInRun || 0;
    const party = progress.selectedPartyClasses;

    const record: AdventureRecord = {
      id: `adv_${Date.now()}`,
      startedAt: progress.activeAdventure?.startedAt || new Date().toISOString(),
      endedAt: new Date().toISOString(),
      farthestLevel: stageReached,
      farthestLevelName: currentLevel ? currentLevel.name : `Fase ${stageReached}`,
      result: 'defeat',
      partyClasses: party,
      goldEarned: runGold,
    };

    const updatedHistory = [record, ...(progress.adventureHistory || [])].slice(0, 10);
    const initialUnits = createInitialUnitsState();
    const preservedDiscoveredItems = consolidateDiscoveredItems(
      progress.discoveredItemIds,
      progress.activeAdventure
    );

    const updatedProgress: PlayerProgress = {
      ...progress,
      activeAdventure: null,
      unitsState: initialUnits,
      adventureHistory: updatedHistory,
      discoveredItemIds: preservedDiscoveredItems,
    };
    setProgress(updatedProgress);
    savePlayerProgress(updatedProgress);

    if (authUserRef.current) {
      submitScore(stageReached, party).catch((err) =>
        console.error('Falha ao registrar no ranking:', err)
      );
    }
  }, [currentLevel, progress]);

  // Check battle status
  const checkBattleStatusWithUnits = useCallback((currentUnits: Unit[]) => {
    const playerLiving = currentUnits.filter((u) => u.faction === 'player' && !u.isDead);
    const enemyLiving = currentUnits.filter((u) => u.faction === 'enemy' && !u.isDead);
    if (enemyLiving.length === 0) {
      handleVictory(currentUnits);
    } else if (playerLiving.length === 0) {
      handleDefeat();
    }
  }, [handleDefeat]);

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
            newHp = Math.min(u.maxHp, u.currentHp + healVal);
            const healedVal = newHp - u.currentHp;
            if (healedVal > 0) addFloatingNumber(u.x, u.y, `+${healedVal}`, 'healing', '#43C878');
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
            const currentShield = newEffects.find((e) => e.type === 'shield')?.value || 0;
            const updatedShield = currentShield + shieldVal;
            newEffects = newEffects.filter((e) => e.type !== 'shield');
            newEffects.push({ type: 'shield', duration: 2, value: updatedShield });
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
          const powerMultiplier = petSkill.power || 1.5;
          const rawDmg = Math.round(primaryStat * powerMultiplier);
          const defIgnore = Math.min(0.20, petSkill.defenseIgnoreRatio || 0);
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
            newEffects.push({ ...petSkill.statusEffect });
            if (petSkill.statusEffect.type === 'stun') addFloatingNumber(u.x, u.y, 'Atordoado!', 'status', '#FACC15');
            else if (petSkill.statusEffect.type === 'burn') addFloatingNumber(u.x, u.y, 'Queimando!', 'status', '#F97316');
            else if (petSkill.statusEffect.type === 'slow') addFloatingNumber(u.x, u.y, 'Lentidão!', 'status', '#38BDF8');
            else if (petSkill.statusEffect.type === 'debuff_def') addFloatingNumber(u.x, u.y, '-Defesa!', 'status', '#F87171');
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

      setUsedPetSkillIds((prev) => [...prev, petSkill.id]);
      setActivePetSkill(null);
      setUnits(updatedUnits);
      setIsAnimatingAction(false);
      setTimeout(() => checkBattleStatusWithUnits(updatedUnits), 200);
      return;
    }

    // Movement execution
    if (selectedAction === 'move' && selectedUnit && selectedUnit.faction === 'player' && !selectedUnit.hasMoved) {
      if (selectedUnit.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0)) {
        addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Atordoado!', 'status', '#FACC15');
        setSelectedAction('none');
        return;
      }
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

        setUnits((prev) =>
          prev.map((u) =>
            u.id === selectedUnit.id
              ? { ...u, x, y, hasMoved: true, currentHp: updatedHp, isDead: unitDead }
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
      if (selectedUnit.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0)) {
        addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Atordoado!', 'status', '#FACC15');
        setSelectedAction('none');
        setActiveSkill(null);
        return;
      }
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

      const isTargeting = selectedAction === 'attack' || !!activeSkill;
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
              u.faction === 'player' &&
              !u.isDead &&
              hitTiles.some((pt) => pt.x === u.x && pt.y === u.y)
          ).length;
        }

        setDamagePreview(preview);
        setTargetUnitId(selectedUnit.id);
        soundManager.playSelect();
        return;
      }

      // Ground-targeted AoE attack (e.g. Meteoro, Bola de Fogo, Nevasca or other AoE skills on empty ground)
      const canSkillTargetGround = Boolean(
        activeSkill &&
        (activeSkill.canTargetGround ||
          (activeSkill.aoeRadius > 0 &&
           activeSkill.rangeMax >= 2 &&
           activeSkill.targetType !== 'self' &&
           activeSkill.targetType !== 'ally'))
      );

      if (!clickedUnit && activeSkill && canSkillTargetGround) {
        const isTargetTileValid = attackableTiles.some((pt) => pt.x === x && pt.y === y);
        if (isTargetTileValid) {
          const matchFaction = activeSkill.targetType === 'ally' ? 'player' : 'enemy';
          const origin = { x: selectedUnit.x, y: selectedUnit.y };
          const hitTiles = getAoETiles(
            { x, y },
            activeSkill.aoeRadius,
            grid[0].length,
            grid.length,
            activeSkill.aoeType || 'circle',
            origin
          );
          const affectedTargets = units.filter(
            (u) =>
              u.faction === matchFaction &&
              !u.isDead &&
              hitTiles.some((pt) => pt.x === u.x && pt.y === u.y)
          );

          if (affectedTargets.length > 0) {
            setTargetTeleportPoint(null);
            setTargetAoEPoint({ x, y });
            const primaryTarget = affectedTargets[0];
            const preview = getDamagePreview(selectedUnit, primaryTarget, activeSkill);
            preview.aoeTargetsCount = affectedTargets.length;
            preview.isGroundTarget = true;
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

      // Unit targeting (Enemy, Ally or Any)
      if (clickedUnit) {
        const isTargetTileValid = attackableTiles.some((pt) => pt.x === x && pt.y === y);
        const isFactionValid =
          (targetType === 'enemy' && clickedUnit.faction === 'enemy') ||
          (targetType === 'ally' && clickedUnit.faction === 'player') ||
          targetType === 'any';

        if (isTargetTileValid && (isTargeting ? isFactionValid : clickedUnit.faction === 'enemy')) {
          setTargetTeleportPoint(null);
          setTargetAoEPoint({ x: clickedUnit.x, y: clickedUnit.y });
          const effectiveSkill = activeSkill || undefined;
          const preview = getDamagePreview(selectedUnit, clickedUnit, effectiveSkill);
          preview.isGroundTarget = false;
          preview.groundTargetPoint = undefined;

          if (effectiveSkill && effectiveSkill.aoeRadius > 0) {
            const matchFaction = effectiveSkill.targetType === 'ally' ? 'player' : 'enemy';
            const origin = { x: selectedUnit.x, y: selectedUnit.y };
            const hitTiles = getAoETiles(
              { x: clickedUnit.x, y: clickedUnit.y },
              effectiveSkill.aoeRadius,
              grid[0].length,
              grid.length,
              effectiveSkill.aoeType || 'circle',
              origin
            );
            preview.aoeTargetsCount = units.filter(
              (u) =>
                u.faction === matchFaction &&
                !u.isDead &&
                hitTiles.some((pt) => pt.x === u.x && pt.y === u.y)
            ).length;
          }

          setDamagePreview(preview);
          setTargetUnitId(clickedUnit.id);
          soundManager.playSelect();
          return;
        }
      }
    }

    // Inspecting or clicking pedestal directly (when not in attack mode)
    if (isPedestalTile && !clickedUnit) {
      if (hasPedestalBeenStruck) {
        setShowSecretRiddle(true);
        soundManager.playSelect();
      } else {
        soundManager.playSelect();
        addFloatingNumber(0, 0, 'Inscrição rúnica na pedra...', 'status', '#A7B0C4');
      }
      return;
    }

    // Select / Deselect unit
    if (clickedUnit) {
      setSelectedUnitId(clickedUnit.id);
      setSelectedAction('none');
      setActiveSkill(null);
      setDamagePreview(null);
      setTargetTeleportPoint(null);
      setTargetAoEPoint(null);
      setTargetUnitId(null);
      soundManager.playSelect();
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

    if (selectedUnit.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0)) {
      addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Atordoado!', 'status', '#FACC15');
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
    if (skill && skill.targetType === 'self') {
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
      if (skill.id === 'resistencia_suprema') {
        isHealSkill = true;
        const ratio = skill.power ? Math.min(1.0, skill.power) : 0.5;
        let healAmt = Math.max(1, Math.round(selectedUnit.maxHp * ratio));
        if (hadExcessHeal) {
          healAmt = Math.max(1, Math.round(healAmt * 0.5));
          addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Cura excessiva (-50%)!', 'status', '#FACC15');
        } else {
          addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Cura excessiva', 'status', '#F59E0B');
        }
        currentUnitHp = Math.min(selectedUnit.maxHp, currentUnitHp + healAmt);
        addFloatingNumber(selectedUnit.x, selectedUnit.y, `+${healAmt} (${Math.round(ratio * 100)}% HP)`, 'healing', '#56E59A');
      } else if (skill.damageType === 'healing' && skill.power && skill.power > 0) {
        isHealSkill = true;
        let healAmt = Math.max(1, Math.round(selectedUnit.mag * skill.power));
        if (hadExcessHeal) {
          healAmt = Math.max(1, Math.round(healAmt * 0.5));
          addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Cura excessiva (-50%)!', 'status', '#FACC15');
        } else {
          addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Cura excessiva', 'status', '#F59E0B');
        }
        currentUnitHp = Math.min(selectedUnit.maxHp, currentUnitHp + healAmt);
        addFloatingNumber(selectedUnit.x, selectedUnit.y, `+${healAmt}`, 'healing', '#56E59A');
      }

      let updatedEffects = [...(selectedUnit.statusEffects || [])];
      let givesShield = false;

      const handleSelfStatusEffect = (effToProcess?: StatusEffect) => {
        if (!effToProcess) return;
        const eff = { ...effToProcess, appliedTurn: turnNumberRef.current };
        if (eff.type === 'shield') {
          givesShield = true;
          if (hadExcessShield) {
            eff.value = Math.max(1, Math.round(eff.value * 0.5));
            addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Escudo excessivo (-50%)!', 'status', '#FACC15');
          } else {
            addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Escudo excessivo', 'status', '#F59E0B');
          }
          if (eff.reflectRatio) {
            addFloatingNumber(selectedUnit.x, selectedUnit.y, `+${eff.value} Escudo Espinhoso (${Math.round(eff.reflectRatio * 100)}% Reflexão)`, 'shield', '#F97316');
          } else {
            addFloatingNumber(selectedUnit.x, selectedUnit.y, `+${eff.value} Escudo`, 'shield', '#38BDF8');
          }
        } else if (eff.type === 'buff_atk') {
          addFloatingNumber(selectedUnit.x, selectedUnit.y, `+${eff.value}% Dano`, 'status', '#F97316');
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

      if (isHealSkill) {
        updatedEffects = [
          ...updatedEffects.filter((e) => e.type !== 'excess_heal'),
          { type: 'excess_heal', duration: 1, value: 50 },
        ];
      }

      if (givesShield) {
        updatedEffects = [
          ...updatedEffects.filter((e) => e.type !== 'excess_shield'),
          { type: 'excess_shield', duration: 1, value: 50 },
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
    let totalKills = 0;

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

        if (isHealingSpell) {
          isHealed = true;
          if (actualDmg > 0) {
            newHp = Math.min(t.maxHp, t.currentHp + actualDmg);
            addFloatingNumber(t.x, t.y, `+${actualDmg}`, 'healing', '#56E59A');
          }
          if (hadExcessHeal) {
            addFloatingNumber(t.x, t.y, 'Cura excessiva (-50%)!', 'status', '#FACC15');
          } else {
            addFloatingNumber(t.x, t.y, 'Cura excessiva', 'status', '#F59E0B');
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
            if (hadExcessShield) {
              eff.value = Math.max(1, Math.round(eff.value * 0.5));
              addFloatingNumber(t.x, t.y, 'Escudo excessivo (-50%)!', 'status', '#FACC15');
            } else {
              addFloatingNumber(t.x, t.y, 'Escudo excessivo', 'status', '#F59E0B');
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

        if (isHealed) {
          currentEffects = [
            ...currentEffects.filter((e) => e.type !== 'excess_heal'),
            { type: 'excess_heal', duration: 1, value: 50 },
          ];
        }

        if (isShielded) {
          currentEffects = [
            ...currentEffects.filter((e) => e.type !== 'excess_shield'),
            { type: 'excess_shield', duration: 1, value: 50 },
          ];
        }
      } else {
        newHp = Math.max(0, t.currentHp - actualDmg);
        if (actualDmg > 0) {
          const color = dmgResult.damageType === 'magical' ? '#B58AFF' : '#FF5252';
          addFloatingNumber(t.x, t.y, `-${actualDmg}`, dmgResult.damageType, color);
        }
        totalDmgDone += actualDmg;
      }

      let newLastStunTurn = t.lastStunTurn;
      let newHalfHpTriggerTurn = t.halfHpTriggerTurn;
      if (
        t.isBoss &&
        !t.isMiniBoss &&
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

      if (newHp === 0) {
        soundManager.playDeath();
        totalKills++;
        if (boardRef.current) {
          await boardRef.current.playDeathAnimation(t.id);
        }
      } else {
        // Primary status effect
        if (skill?.statusEffect && dmgResult.damageType !== 'healing') {
          const eff = skill.statusEffect;
          if (eff.type === 'stun' && isBossStunImmune) {
            addFloatingNumber(t.x, t.y, 'Resistiu ao Atordoamento!', 'status', '#FACC15');
          } else {
            currentEffects = [...currentEffects.filter((e) => e.type !== eff.type), { ...eff }];
            if (eff.type === 'burn') addFloatingNumber(t.x, t.y, 'Em Chamas!', 'status', '#F97316');
            else if (eff.type === 'poison') addFloatingNumber(t.x, t.y, 'Envenenado!', 'status', '#A855F7');
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
          } else {
            currentEffects = [...currentEffects.filter((e) => e.type !== eff2.type), { ...eff2 }];
            if (eff2.type === 'burn') addFloatingNumber(t.x, t.y, 'Em Chamas!', 'status', '#F97316');
            else if (eff2.type === 'poison') addFloatingNumber(t.x, t.y, 'Envenenado!', 'status', '#A855F7');
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
        const maxSteps = skill.knockback;

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
      skill?.lifestealPercent ??
      (skill?.id === 'dreno_de_vida' || skill?.id === 'dreno_de_seiva'
        ? 100
        : skill?.id === 'sedenta_de_runas'
        ? 60
        : isGolpeSagrado
        ? 30
        : 0);

    if ((lifestealPct > 0 || isGolpeSagrado) && (totalDmgDone > 0 || isGolpeSagrado)) {
      const hadExcessHeal = finalAttackerEffects.some((e) => e.type === 'excess_heal' && e.duration > 0);
      let healAmt = isGolpeSagrado
        ? Math.max(1, Math.round(selectedUnit.mag * 0.3), Math.round(totalDmgDone * 0.3))
        : Math.max(1, Math.round(totalDmgDone * (lifestealPct / 100)));

      if (hadExcessHeal) {
        healAmt = Math.max(1, Math.round(healAmt * 0.5));
        addFloatingNumber(finalAttackerX, finalAttackerY, 'Cura excessiva (-50%)!', 'status', '#FACC15');
      } else {
        addFloatingNumber(finalAttackerX, finalAttackerY, 'Cura excessiva', 'status', '#F59E0B');
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
        { type: 'excess_heal', duration: 1, value: 50 },
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
        const hadExcessShield = finalAttackerEffects.some((e) => e.type === 'excess_shield' && e.duration > 0);
        if (hadExcessShield) {
          cEff.value = Math.max(1, Math.round(cEff.value * 0.5));
          addFloatingNumber(finalAttackerX, finalAttackerY, 'Escudo excessivo (-50%)!', 'status', '#FACC15');
        } else {
          addFloatingNumber(finalAttackerX, finalAttackerY, 'Escudo excessivo', 'status', '#F59E0B');
        }
        addFloatingNumber(finalAttackerX, finalAttackerY, `+${cEff.value} Escudo`, 'shield', '#38BDF8');
      } else if (cEff.type === 'buff_atk') {
        addFloatingNumber(finalAttackerX, finalAttackerY, `+${cEff.value}% Dano`, 'status', '#F97316');
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
        skill?.id?.startsWith('decapitacao_do_vazio')) &&
      totalKills > 0;

    if (isExecutionKill) {
      soundManager.playUpgrade();
      addFloatingNumber(finalAttackerX, finalAttackerY, 'EXECUÇÃO! +1 AÇÃO!', 'status', '#C77DFF');
    }

    updatedUnits = updatedUnits.map((u) => {
      if (u.id === selectedUnit.id) {
        const updatedSkills = u.skills.map((s) =>
          skill && s.id === skill.id ? { ...s, currentCooldown: s.cooldownMax, lastUsedTurn: turnNumberRef.current } : s
        );
        return {
          ...u,
          x: finalAttackerX,
          y: finalAttackerY,
          currentHp: finalAttackerHp,
          hasMoved: isExecutionKill ? false : (canMoveAgain ? false : u.hasMoved),
          hasAttacked: isExecutionKill ? false : true,
          skills: updatedSkills,
          statusEffects: finalAttackerEffects,
          damageDealt: u.damageDealt + totalDmgDone,
          kills: u.kills + totalKills,
        };
      }
      return u;
    });

    setUnits(updatedUnits);
    setTargetTeleportPoint(null);
    setTargetAoEPoint(null);
    setTargetUnitId(null);
    setSelectedAction('none');
    setActiveSkill(null);
    setIsAnimatingAction(false);

    if (isExecutionKill) {
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
          addFloatingNumber(u.x, u.y, `-${bDmg} Queimadura (2%)`, 'status', '#F97316');
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

        if (isDead !== u.isDead || currentHp !== u.currentHp) {
          return { ...u, currentHp, isDead };
        }
      }
      return u;
    });

    if (anyMonsterDamagedByDoT) {
      setUnits([...currentUnits]);
      await new Promise((r) => setTimeout(r, 300 * delayMult));
    }

    // Registra bosses cuja vida atingiu <= 50% para ativação no turno posterior
    currentUnits = currentUnits.map((u) => {
      if (
        u.faction === 'enemy' &&
        u.isBoss &&
        !u.isMiniBoss &&
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
      const freshMonster = currentUnits.find((u) => u.id === monster.id);
      if (!freshMonster || freshMonster.isDead) continue;

      const isStunned = freshMonster.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0);
      if (isStunned) {
        addFloatingNumber(freshMonster.x, freshMonster.y, 'Atordoado!', 'status', '#FACC15');
        await new Promise((r) => setTimeout(r, 200 * delayMult));
        continue;
      }

      // Boss Threshold Skill (50% HP): Ativa no turno posterior a suas vidas chegarem a 50%, exatamente 1 vez por combate
      const isBossThresholdReady =
        freshMonster.isBoss &&
        !freshMonster.isMiniBoss &&
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
          // Fase 30: Valgar - 160% de dano físico a todos, 100% de roubo de vida e sangramento (burn) por 2 turnos
          addFloatingNumber(freshMonster.x, freshMonster.y, '🩸 BANQUETE SANGUINÁRIO (160% + Dreno)!', 'status', '#DC2626');
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

          // Cura de 100% do dano causado para Valgar
          if (totalValgarDmg > 0) {
            const healedHp = Math.min(freshMonster.maxHp, freshMonster.currentHp + totalValgarDmg);
            const actualHealed = healedHp - freshMonster.currentHp;
            if (actualHealed > 0) {
              addFloatingNumber(freshMonster.x, freshMonster.y, '+' + actualHealed + ' (Banquete de Sangue)', 'healing', '#10B981');
              soundManager.playHeal();
              currentUnits = currentUnits.map((u) =>
                u.id === freshMonster.id ? { ...u, currentHp: healedHp } : u
              );
            }
          }
        } else if (bossType === 'leviata_vazio') {
          // Fase 40: Leviatã do Vazio - 175% de dano mágico em todos, reduz defesa em 20% e lentidão por 2 turnos
          addFloatingNumber(freshMonster.x, freshMonster.y, '🌌 SINGULARIDADE DO VAZIO (175%)!', 'status', '#6366F1');
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

            // Debuff Def -20% e Slow por 2 turnos
            currentEffects = [
              ...currentEffects.filter((e) => e.type !== 'debuff_def' && e.type !== 'slow'),
              { type: 'debuff_def' as const, duration: 2, value: 20, appliedTurn: turnNumberRef.current },
              { type: 'slow' as const, duration: 2, value: 1, appliedTurn: turnNumberRef.current },
            ];
            addFloatingNumber(target.x, target.y, 'Defesa -20% & Lentidão (2T)!', 'status', '#818CF8');

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
          u.id === freshMonster.id ? { ...u, hasUsedHalfHpSkill: true } : u
        );
        setUnits([...currentUnits]);

        const playerLivingAfter = currentUnits.filter((u) => u.faction === 'player' && !u.isDead);
        if (playerLivingAfter.length === 0) {
          handleDefeat();
          return;
        }

        await new Promise((r) => setTimeout(r, 400 * delayMult));
        continue;
      }

      const choice = decideMonsterAction(freshMonster, grid, currentUnits);
      if (choice) {
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
                if (hadExcessHeal) {
                  healAmount = Math.max(1, Math.round(healAmount * 0.5));
                  addFloatingNumber(freshTarget.x, freshTarget.y, 'Cura excessiva (-50%)!', 'status', '#FACC15');
                } else {
                  addFloatingNumber(freshTarget.x, freshTarget.y, 'Cura excessiva', 'status', '#F59E0B');
                }
                newHp = Math.min(freshTarget.maxHp, freshTarget.currentHp + healAmount);
                addFloatingNumber(freshTarget.x, freshTarget.y, `+${healAmount}`, 'healing', '#56E59A');
              }

              const applyMonsterSupportEffect = (effToProcess?: StatusEffect) => {
                if (!effToProcess) return;
                const eff = { ...effToProcess };
                if (eff.type === 'shield') {
                  isShielded = true;
                  if (hadExcessShield) {
                    eff.value = Math.max(1, Math.round(eff.value * 0.5));
                    addFloatingNumber(freshTarget.x, freshTarget.y, 'Escudo excessivo (-50%)!', 'status', '#FACC15');
                  } else {
                    addFloatingNumber(freshTarget.x, freshTarget.y, 'Escudo excessivo', 'status', '#F59E0B');
                  }
                  addFloatingNumber(freshTarget.x, freshTarget.y, `+${eff.value} Escudo`, 'shield', '#38BDF8');
                } else if (eff.type === 'buff_atk') {
                  addFloatingNumber(freshTarget.x, freshTarget.y, `+${eff.value}% Dano`, 'status', '#F97316');
                }
                currentEffects = [...currentEffects.filter((e) => e.type !== eff.type), eff];
              };

              if (skill.statusEffect) {
                applyMonsterSupportEffect(skill.statusEffect);
              }
              if (skill.secondaryStatusEffect) {
                applyMonsterSupportEffect(skill.secondaryStatusEffect);
              }

              if (isHealed) {
                currentEffects = [
                  ...currentEffects.filter((e) => e.type !== 'excess_heal'),
                  { type: 'excess_heal', duration: 1, value: 50 },
                ];
              }

              if (isShielded) {
                currentEffects = [
                  ...currentEffects.filter((e) => e.type !== 'excess_shield'),
                  { type: 'excess_shield', duration: 1, value: 50 },
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
              if (aoeRad > 0) {
                const origin = { x: freshAttacker.x, y: freshAttacker.y };
                const hitTiles = getAoETiles(
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
              }

              let totalAiDmgDone = 0;

              for (const t of enemyTargets) {
                const res = rollActualDamage(freshAttacker, t, skill);
                let actualDmg = res.finalDamage;
                const damageType = res.damageType;

                let currentEffects = [...(t.statusEffects || [])];
                let absorbedDamage = 0;
                let reflectPercent = 0;
                if (actualDmg > 0) {
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

                const newHp = Math.max(0, t.currentHp - actualDmg);
                if (actualDmg > 0) {
                  const color = damageType === 'magical' ? '#B58AFF' : '#FF5252';
                  addFloatingNumber(t.x, t.y, `-${actualDmg}`, damageType, color);
                  totalAiDmgDone += actualDmg;
                }

                if (newHp === 0) {
                  soundManager.playDeath();
                  if (boardRef.current) {
                    await boardRef.current.playDeathAnimation(t.id);
                  }
                } else {
                  if (choice.skillToUse?.statusEffect) {
                    const eff = choice.skillToUse.statusEffect;
                    currentEffects = [...currentEffects.filter((e) => e.type !== eff.type), { ...eff }];
                    if (eff.type === 'burn') addFloatingNumber(t.x, t.y, 'Em Chamas!', 'status', '#F97316');
                    else if (eff.type === 'poison') addFloatingNumber(t.x, t.y, 'Envenenado!', 'status', '#A855F7');
                    else if (eff.type === 'stun') addFloatingNumber(t.x, t.y, 'Atordoado!', 'status', '#FACC15');
                    else if (eff.type === 'slow') addFloatingNumber(t.x, t.y, 'Lentidão!', 'status', '#60A5FA');
                    else if (eff.type === 'debuff_def') addFloatingNumber(t.x, t.y, `Defesa -${eff.value}%!`, 'status', '#EF4444');
                    else if (eff.type === 'electrified') addFloatingNumber(t.x, t.y, '⚡ Eletrificado!', 'status', '#FACC15');
                  }

                  if (choice.skillToUse?.secondaryStatusEffect) {
                    const eff2 = choice.skillToUse.secondaryStatusEffect;
                    currentEffects = [...currentEffects.filter((e) => e.type !== eff2.type), { ...eff2 }];
                    if (eff2.type === 'burn') addFloatingNumber(t.x, t.y, 'Em Chamas!', 'status', '#F97316');
                    else if (eff2.type === 'poison') addFloatingNumber(t.x, t.y, 'Envenenado!', 'status', '#A855F7');
                    else if (eff2.type === 'debuff_def') addFloatingNumber(t.x, t.y, `Defesa -${eff2.value}%!`, 'status', '#EF4444');
                    else if (eff2.type === 'slow') addFloatingNumber(t.x, t.y, 'Lentidão!', 'status', '#60A5FA');
                  }
                }

                currentUnits = currentUnits.map((u) =>
                  u.id === t.id ? { ...u, currentHp: newHp, isDead: newHp === 0, statusEffects: currentEffects } : u
                );
              }

              // Monster / AI Lifesteal & Golpe Sagrado
              let finalMonsterEffects = [...(freshAttacker.statusEffects || [])];
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
                  addFloatingNumber(finalMonsterX, finalMonsterY, 'Cura excessiva', 'status', '#F59E0B');
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
                  { type: 'excess_heal', duration: 1, value: 50 },
                ];
              }

              if (choice.skillToUse?.casterStatusEffect) {
                const cEff = { ...choice.skillToUse.casterStatusEffect };
                if (cEff.type === 'shield') {
                  addFloatingNumber(finalMonsterX, finalMonsterY, `+${cEff.value} Escudo`, 'shield', '#38BDF8');
                } else if (cEff.type === 'taunt') {
                  addFloatingNumber(finalMonsterX, finalMonsterY, 'Provocando!', 'status', '#EF4444');
                }
                finalMonsterEffects = [...finalMonsterEffects.filter((e) => e.type !== cEff.type), cEff];
              }

              // Update freshAttacker position, HP, status effects and isDead
              currentUnits = currentUnits.map((u) =>
                u.id === freshAttacker.id
                  ? { ...u, x: finalMonsterX, y: finalMonsterY, currentHp: finalMonsterHp, isDead: finalMonsterHp === 0, statusEffects: finalMonsterEffects }
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

            setUnits([...currentUnits]);
            await new Promise((r) => setTimeout(r, 200 * delayMult));
          }
        }
      }
    }

    const playerLiving = currentUnits.filter((u) => u.faction === 'player' && !u.isDead);
    const enemyLiving = currentUnits.filter((u) => u.faction === 'enemy' && !u.isDead);

    if (playerLiving.length === 0) {
      handleDefeat();
      return;
    }
    if (enemyLiving.length === 0) {
      handleVictory(currentUnits);
      return;
    }

    const aiTurnNumber = turnNumberRef.current;
    setTurnNumber((t) => {
      turnNumberRef.current = t + 1;
      return t + 1;
    });

    let anyPlayerDiedFromDoT = false;
    setUnits((prev) => {
      return prev.map((u) => {
        let currentHp = u.currentHp;
        let isDead = u.isDead;

        if (u.faction === 'player') {
          if (!isDead) {
            // Burn tick (Queimadura) - 2% da vida máxima
            const burn = u.statusEffects?.find((e) => e.type === 'burn');
            if (burn) {
              const bDmg = Math.max(1, Math.round(u.maxHp * ((burn.value || 2) / 100)));
              currentHp = Math.max(0, currentHp - bDmg);
              isDead = currentHp === 0;
              if (isDead) anyPlayerDiedFromDoT = true;
              addFloatingNumber(u.x, u.y, `-${bDmg} Queimadura (2%)`, 'status', '#F97316');
            }

            // Poison tick (Veneno) - 2% da vida máxima
            if (!isDead) {
              const poison = u.statusEffects?.find((e) => e.type === 'poison');
              if (poison) {
                const pDmg = Math.max(1, Math.round(u.maxHp * ((poison.value || 2) / 100)));
                currentHp = Math.max(0, currentHp - pDmg);
                isDead = currentHp === 0;
                if (isDead) anyPlayerDiedFromDoT = true;
                addFloatingNumber(u.x, u.y, `-${pDmg} Veneno (2%)`, 'status', '#A855F7');
              }
            }
          }
          // Taunt on player units decrements after the enemy turn has concluded
          const updatedEffects = (u.statusEffects || [])
            .map((e) => (e.type === 'taunt' ? { ...e, duration: e.duration - 1 } : e))
            .filter((e) => e.duration > 0);

          return {
            ...u,
            currentHp,
            isDead,
            statusEffects: updatedEffects,
            hasMoved: false,
            hasAttacked: false,
          };
        } else {
          // Enemy units: AI turn has ended, decrement status effects & cooldowns
          const updatedEffects = (u.statusEffects || [])
            .map((e) => ({ ...e, duration: e.duration - 1 }))
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
          const alive = latest.filter((u) => u.faction === 'player' && !u.isDead);
          if (alive.length === 0) handleDefeat();
          return latest;
        });
      }, 500);
    }

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
              return { ...e, duration: e.duration - 1 };
            })
            .filter((e) => e.duration > 0);

          return {
            ...u,
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
    clearLiveBattleState();
    soundManager.playVictory();
    setPhase('victory');

    const xpReward = Math.round(currentLevel.rewards.xpPerUnit);

    const equippedPet = getPetById(progress.equippedPetId);
    const petPassives = calculatePetPassives(equippedPet);
    const goldMultiplier =
      1 + getGeneralGoldMultiplier(progress.generalUpgrades?.goldBoost || 0) + (petPassives.goldBoostPercent / 100);
    const goldReward = Math.round(currentLevel.rewards.gold * goldMultiplier);

    // Todos os heróis da equipe recebem o XP e evoluem de nível, mesmo que tenham caído em combate
    const partyUnits = finalUnitsState.filter((u) => u.faction === 'player');
    const levelUps: { unitName: string; oldLevel: number; newLevel: number }[] = [];
    const statChoiceQueue: { unit: Unit; newLevel: number }[] = [];
    const updatedUnitsState = { ...progress.unitsState };

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
    const currentUnlocked = progress.unlockedClasses || ['guerreiro', 'arqueiro', 'mago', 'curandeiro'];
    const newlyUnlocked: string[] = [];
    Object.entries(CLASS_UNLOCK_CONDITIONS).forEach(([cName, cond]) => {
      if (currentLevel.id === cond.requiredLevel && !currentUnlocked.includes(cName)) {
        newlyUnlocked.push(cName);
      }
    });

    // SECRET CLASS UNLOCK: Carrasco do Vazio
    // Condição: Derrotar Astaroth (Fase 10) utilizando apenas classes corpo a corpo (range === 1)
    if (currentLevel.id === 10 && !currentUnlocked.includes('carrasco_vazio')) {
      const activeParty = progress.activeAdventure?.partyClasses || progress.selectedPartyClasses;
      const allMelee =
        activeParty.length === 4 &&
        activeParty.every((cKey) => {
          const cDef = CLASS_DEFINITIONS[cKey];
          return cDef && cDef.range === 1;
        });

      if (allMelee) {
        newlyUnlocked.push('carrasco_vazio');
      }
    }

    // RARE DROP CLASS UNLOCK: Sniper
    // Condição: 1% de chance de drop raro ao vencer qualquer fase
    if (!currentUnlocked.includes('sniper') && Math.random() < 0.01) {
      newlyUnlocked.push('sniper');
    }

    const finalUnlockedClasses = Array.from(new Set([...currentUnlocked, ...newlyUnlocked]));

    const nextUnlocked = Math.max(progress.unlockedLevel, currentLevel.id + 1);
    const completedList = Array.from(new Set([...progress.completedLevels, currentLevel.id]));
    const totalGold = progress.gold + goldReward;
    const totalRunGold = (progress.activeAdventure?.goldEarnedInRun || 0) + goldReward;

    // Drop de itens ao final da fase com base nos monstros presentes e no bônus de drop
    const dropBonusLvl = getGeneralDropBonus(progress.generalUpgrades?.dropRate || 0);
    const isBossStage = Boolean(currentLevel.hasFinalBoss || currentLevel.hasMiniBoss);
    const enemyMonsterTypeIds = currentLevel.enemySpawns.map((s) => s.monsterTypeId);
    const droppedItems = rollStageItemDrops(enemyMonsterTypeIds, 3, isBossStage, dropBonusLvl);

    const prevDiscoveredItems = progress.discoveredItemIds || [];
    const newDiscoveredItems = consolidateDiscoveredItems(
      prevDiscoveredItems,
      progress.activeAdventure,
      droppedItems.map((it) => it.id)
    );

    const isFinalCampaignLevel = currentLevel.id >= LEVELS.length;

    let updatedHistory = progress.adventureHistory || [];
    let updatedActiveAdventure: ActiveAdventure | null = null;
    let nextUnitsState = updatedUnitsState;

    const activeParty = progress.activeAdventure?.partyClasses || progress.selectedPartyClasses;

    if (isFinalCampaignLevel) {
      // Supreme victory! Archive finished run
      const record: AdventureRecord = {
        id: `adv_${Date.now()}`,
        startedAt: progress.activeAdventure?.startedAt || new Date().toISOString(),
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
        startedAt: progress.activeAdventure?.startedAt || new Date().toISOString(),
        unitsState: updatedUnitsState,
        partyClasses: activeParty,
        goldEarnedInRun: totalRunGold,
        inventory: progress.activeAdventure?.inventory || [],
        equipment: progress.activeAdventure?.equipment || {},
      };
    }

    // Drop de ovos de companheiro: 1% para monstros normais, 25% para mini-chefes, 100% para chefes reais
    let updatedEggs = [...(progress.eggs || [])];
    const newDroppedEggs: PetEgg[] = [];

    currentLevel.enemySpawns.forEach((spawn) => {
      const isBoss = Boolean(spawn.isBoss && !spawn.isMiniBoss);
      const isMiniBoss = Boolean(spawn.isMiniBoss);
      const dropChance = isBoss ? 1.0 : isMiniBoss ? 0.25 : 0.01;
      if (Math.random() < dropChance) {
        if (updatedEggs.length < MAX_EGGS_LIMIT) {
          const egg = createNewEgg();
          updatedEggs.push(egg);
          newDroppedEggs.push(egg);
        }
      }
    });

    const newProgress: PlayerProgress = {
      ...progress,
      unlockedLevel: nextUnlocked,
      completedLevels: completedList,
      gold: totalGold,
      unlockedClasses: finalUnlockedClasses,
      unitsState: nextUnitsState,
      activeAdventure: updatedActiveAdventure,
      adventureHistory: updatedHistory,
      discoveredItemIds: newDiscoveredItems,
      eggs: updatedEggs,
    };
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
      getGlobalHeroBonus(progress)
    );
  }, [pendingSkillChoices, progress.unitsState, progress.activeAdventure?.equipment, progress.itemUpgrades, progress.classUpgrades, progress.generalUpgrades]);

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
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] font-bold hover:bg-[#10B981]/20 transition-colors"
          >
            <Sparkles size={14} /> Atualizações
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
        />

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
            partyClasses={progress.activeAdventure?.partyClasses || progress.selectedPartyClasses}
            unitsState={progress.activeAdventure?.unitsState || progress.unitsState}
            equipment={progress.activeAdventure?.equipment || {}}
            inventory={progress.activeAdventure?.inventory || []}
            itemUpgrades={progress.itemUpgrades || {}}
            onEquipItem={handleEquipItem}
            onUnequipItem={handleUnequipItem}
            onClose={() => setShowEquipment(false)}
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
              setProgress(newProgress);
              savePlayerProgress(newProgress);
            }}
            onClose={() => setShowPetsModal(false)}
          />
        )}
      </>
    );
  }

  if (currentView === 'party_select') {
    return (
      <>
        <PartySelectionModal
          initialSelected={progress.selectedPartyClasses}
          unlockedClasses={progress.unlockedClasses || ['guerreiro', 'arqueiro', 'mago', 'curandeiro']}
          playerGold={progress.gold}
          onBuyClass={handleBuyClass}
          onConfirmParty={handleConfirmParty}
          onClose={() => setCurrentView('level_select')}
        />
        {pendingUnlockClasses.length > 0 && (
          <ClassUnlockModal
            unlockedClasses={pendingUnlockClasses}
            onDismiss={() => setPendingUnlockClasses((prev) => prev.slice(1))}
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
        levelNumber={currentLevel?.id || 1}
        levelName={currentLevel?.name || 'Fase'}
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
        onOpenRiddle={currentLevel?.id === 10 && hasPedestalBeenStruck ? () => setShowSecretRiddle(true) : undefined}
        onSaveAndExit={() => {
          if (currentLevel && units.length > 0) {
            saveLiveBattleState({
              levelId: currentLevel.id,
              turnNumber,
              phase,
              units,
              activeBossBanner,
            });
          }
          setCurrentView('level_select');
        }}
      />

      <div className="flex-1 flex overflow-hidden relative">
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
        <SecretRiddleModal isOpen={showSecretRiddle} onClose={() => setShowSecretRiddle(false)} />
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
            levelNumber={currentLevel.id}
            summary={
              victorySummary || {
                xpGained: currentLevel.rewards.xpPerUnit,
                goldGained: currentLevel.rewards.gold,
                survivingUnits: [],
                levelUps: [],
              }
            }
            hasNextLevel={currentLevel.id < LEVELS.length}
            playerGold={progress.gold}
            unlockedClassesCount={progress.unlockedClasses?.length || 4}
            onNextLevel={() => startLevel(currentLevel.id + 1)}
            onRetry={handleStartNewAdventure}
            onGoToMenu={() => setCurrentView('level_select')}
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
          partyClasses={progress.activeAdventure?.partyClasses || progress.selectedPartyClasses}
          unitsState={progress.activeAdventure?.unitsState || progress.unitsState}
          equipment={progress.activeAdventure?.equipment || {}}
          inventory={progress.activeAdventure?.inventory || []}
          itemUpgrades={progress.itemUpgrades || {}}
          onEquipItem={handleEquipItem}
          onUnequipItem={handleUnequipItem}
          onClose={() => setShowEquipment(false)}
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
            setProgress(newProgress);
            savePlayerProgress(newProgress);
          }}
          onClose={() => setShowPetsModal(false)}
        />
      )}
    </div>
  );
}

export default App;
