import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ActiveAdventure,
  AdventureRecord,
  BattlePhase,
  DamagePreview,
  FloatingNumber,
  LevelConfig,
  PlayerProgress,
  Point,
  SelectedAction,
  Skill,
  StatType,
  TileData,
  Unit,
  UnitProgression,
} from './types/game';
import { LEVELS } from './data/levels';
import { createPlayerUnit, CLASS_UNLOCK_CONDITIONS, INITIAL_CLASSES, getMaxCompletedLevel, sanitizeUnlockedClasses, sanitizePartyClasses } from './data/units';
import { createMonsterUnit } from './data/monsters';
import {
  DEFAULT_PROGRESS,
  createInitialUnitsState,
  loadAudioSettings,
  loadPlayerProgress,
  resetPlayerProgress,
  saveAudioSettings,
  savePlayerProgress,
} from './utils/storage';
import { soundManager } from './utils/audio';
import { getAttackableTiles, getAoETiles, getReachableTiles } from './utils/pathfinding';
import { getDamagePreview, rollActualDamage } from './utils/damage';
import { decideMonsterAction } from './ai/monsterAI';
import { BoardRenderer3D } from './game/BoardRenderer3D';
import type { BoardRenderer3DHandle } from './game/BoardRenderer3D';
import { TopBar } from './components/TopBar';
import { SidePanel } from './components/SidePanel';
import { SkillsPanel } from './components/SkillsPanel';
import { ActionPreviewModal } from './components/ActionPreviewModal';
import { DeploymentBanner } from './components/DeploymentBanner';
import { ObjectivesModal } from './components/ObjectivesModal';
import { SettingsModal } from './components/SettingsModal';
import { TutorialModal } from './components/TutorialModal';
import { VictoryDefeatModal } from './components/VictoryDefeatModal';
import { LevelSelect } from './components/LevelSelect';
import { PartySelectionModal } from './components/PartySelectionModal';
import { SkillChoiceModal } from './components/SkillChoiceModal';
import { StatChoiceModal } from './components/StatChoiceModal';
import { ClassUnlockModal } from './components/ClassUnlockModal';
import { BossIntroBanner } from './components/BossIntroBanner';
import { AuthScreen } from './components/AuthScreen';
import { LeaderboardModal } from './components/LeaderboardModal';
import { BestiaryModal } from './components/BestiaryModal';
import { AdventureHistoryModal } from './components/AdventureHistoryModal';
import { fetchCurrentUser, fetchCloudProgress, logout, saveCloudProgress, submitScore } from './utils/api';
import type { AuthUser } from './utils/api';
import { LogOut, Trophy, User as UserIcon, Loader2 } from 'lucide-react';

export function App() {
  const boardRef = useRef<BoardRenderer3DHandle>(null);

  const [currentView, setCurrentView] = useState<'level_select' | 'party_select' | 'battle'>('level_select');
  const [progress, setProgress] = useState<PlayerProgress>(loadPlayerProgress());
  const [audioSettings, setAudioSettings] = useState(loadAudioSettings());

  // Autenticação e ranking
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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
        });

        const safeUnlocked = sanitizeUnlockedClasses(cloudP.unlockedClasses, maxCompleted);
        const safeParty = sanitizePartyClasses(cloudP.selectedPartyClasses, safeUnlocked);

        const merged: PlayerProgress = {
          ...DEFAULT_PROGRESS,
          gold: typeof cloudP.gold === 'number' ? cloudP.gold : 0,
          unlockedClasses: safeUnlocked,
          selectedPartyClasses: safeParty,
          unitsState: cloudP.unitsState || createInitialUnitsState(),
          discoveredMonsterIds: Array.isArray(cloudP.discoveredMonsterIds) && cloudP.discoveredMonsterIds.length > 0
            ? Array.from(new Set(cloudP.discoveredMonsterIds))
            : ['goblin'],
          activeAdventure: cloudP.activeAdventure ?? null,
          adventureHistory: Array.isArray(cloudP.adventureHistory) ? cloudP.adventureHistory : [],
          combatSpeed: cloudP.combatSpeed || 'normal',
        };

        setProgress(merged);
        savePlayerProgress(merged);
      } else {
        // Nova conta: inicia limpa sem herdar classes indevidas de sessões anteriores
        const freshProgress: PlayerProgress = {
          ...DEFAULT_PROGRESS,
          unlockedClasses: [...INITIAL_CLASSES],
          selectedPartyClasses: [...INITIAL_CLASSES],
          unitsState: createInitialUnitsState(),
        };
        setProgress(freshProgress);
        savePlayerProgress(freshProgress);
        await saveCloudProgress(freshProgress);
      }
    } catch (err) {
      console.warn('Erro ao sincronizar progresso em nuvem:', err);
    }
  };

  useEffect(() => {
    fetchCurrentUser().then(async (user) => {
      if (user) {
        await syncUserCloudProgress(user);
      }
      setAuthChecked(true);
    });
  }, []);

  const handleLogout = () => {
    logout();
    setAuthUser(null);
    const cleanProgress = resetPlayerProgress();
    setProgress(cleanProgress);
    setCurrentView('level_select');
  };

  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
  const [grid, setGrid] = useState<TileData[][]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [turnNumber, setTurnNumber] = useState(1);
  const [phase, setPhase] = useState<BattlePhase>('deployment');

  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<SelectedAction>('none');
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [targetUnitId, setTargetUnitId] = useState<string | null>(null);
  const [hoveredTile, setHoveredTile] = useState<Point | null>(null);
  const [damagePreview, setDamagePreview] = useState<DamagePreview | null>(null);

  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);

  const [showObjectives, setShowObjectives] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [pendingStatChoices, setPendingStatChoices] = useState<{ unit: Unit; newLevel: number }[]>([]);
  const [pendingSkillChoices, setPendingSkillChoices] = useState<Unit[]>([]);
  const [pendingUnlockClasses, setPendingUnlockClasses] = useState<string[]>([]);
  const [activeBossBanner, setActiveBossBanner] = useState<{ name: string; subtitle: string; phase?: number } | null>(null);

  const [victorySummary, setVictorySummary] = useState<{
    xpGained: number;
    goldGained: number;
    survivingUnits: Unit[];
    levelUps: { unitName: string; oldLevel: number; newLevel: number }[];
  } | null>(null);

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
      return createPlayerUnit(
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
        uState ? uState.learnedSkillIds : []
      );
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

    setUnits([...playerUnits, ...enemyUnits]);
    setTurnNumber(1);
    setPhase('deployment');
    setSelectedUnitId(null);
    setSelectedAction('none');
    setActiveSkill(null);
    setTargetUnitId(null);
    setDamagePreview(null);
    setFloatingNumbers([]);
    setIsAnimatingAction(false);
    setCurrentView('battle');

    const bossFound = enemyUnits.find((u) => u.isBoss || u.isMiniBoss);
    if (bossFound) {
      setActiveBossBanner({
        name: bossFound.name,
        subtitle: bossFound.isBoss
          ? `BOSS PODEROSO (FASE ${lvlConfig.id}) — ${lvlConfig.subtitle}`
          : `MINI BOSS (FASE ${lvlConfig.id}) — ${lvlConfig.subtitle}`,
        phase: 1,
      });
    }
    soundManager.playSelect();
  };

  // Start a fresh Adventure Run from Level 1
  const handleStartNewAdventure = () => {
    const initialUnits = createInitialUnitsState();
    const newActiveAdv: ActiveAdventure = {
      currentLevelId: 1,
      startedAt: new Date().toISOString(),
      unitsState: initialUnits,
      partyClasses: progress.selectedPartyClasses,
      goldEarnedInRun: 0,
    };
    const updated: PlayerProgress = {
      ...progress,
      activeAdventure: newActiveAdv,
      unitsState: initialUnits,
    };
    setProgress(updated);
    savePlayerProgress(updated);
    startLevel(1, initialUnits);
  };

  // Continue existing active adventure
  const handleContinueAdventure = () => {
    if (progress.activeAdventure) {
      startLevel(progress.activeAdventure.currentLevelId, progress.activeAdventure.unitsState);
    } else {
      handleStartNewAdventure();
    }
  };

  // Forfeit/Abandon current adventure
  const handleAbandonAdventure = () => {
    if (!progress.activeAdventure) return;
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
    const updated: PlayerProgress = {
      ...progress,
      activeAdventure: null,
      unitsState: initialUnits,
      adventureHistory: updatedHistory,
    };
    setProgress(updated);
    savePlayerProgress(updated);
    if (authUserRef.current) {
      submitScore(currentAdv.currentLevelId, currentAdv.partyClasses).catch((err) =>
        console.error('Falha ao registrar no ranking:', err)
      );
    }
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

  const handleResetProgress = () => {
    const fresh = resetPlayerProgress();
    setProgress(fresh);
    setCurrentView('level_select');
  };

  const handleToggleSpeed = () => {
    const nextSpeed: 'normal' | 'fast' = progress.combatSpeed === 'normal' ? 'fast' : 'normal';
    const updated: PlayerProgress = { ...progress, combatSpeed: nextSpeed };
    setProgress(updated);
    savePlayerProgress(updated);
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
    if (!selectedUnit || phase !== 'player_turn' || selectedUnit.faction !== 'player' || selectedUnit.hasAttacked || isAnimatingAction) return [];
    if (selectedAction === 'attack' || activeSkill) {
      const rangeMin = activeSkill ? activeSkill.rangeMin : 1;
      const rangeMax = activeSkill ? activeSkill.rangeMax : selectedUnit.range;
      return getAttackableTiles({ x: selectedUnit.x, y: selectedUnit.y }, rangeMin, rangeMax, grid[0].length, grid.length);
    }
    return [];
  }, [selectedUnit, phase, selectedAction, activeSkill, grid, isAnimatingAction]);

  const aoeTiles: Point[] = React.useMemo(() => {
    if (!activeSkill || activeSkill.aoeRadius === 0) return [];
    const targetUnit = targetUnitId ? units.find((u) => u.id === targetUnitId) : null;
    const center = targetUnit ? { x: targetUnit.x, y: targetUnit.y } : hoveredTile;
    if (!center) return [];
    return getAoETiles(center, activeSkill.aoeRadius, grid[0].length, grid.length);
  }, [activeSkill, hoveredTile, targetUnitId, units, grid]);

  // Handle Defeat: resets adventure progress to 0, archives run to history, keeps gold & unlocked classes
  const handleDefeat = useCallback(() => {
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

    const updatedProgress: PlayerProgress = {
      ...progress,
      activeAdventure: null,
      unitsState: initialUnits,
      adventureHistory: updatedHistory,
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

    // Deployment swap
    if (phase === 'deployment') {
      if (selectedUnit && selectedUnit.faction === 'player') {
        const isDepTile = currentLevel?.deploymentZone.some((z) => z.x === x && z.y === y);
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

    // Movement execution
    if (selectedAction === 'move' && selectedUnit && selectedUnit.faction === 'player' && !selectedUnit.hasMoved) {
      const isReachable = reachableTiles.some((t) => t.x === x && t.y === y);
      if (isReachable && !clickedUnit) {
        setIsAnimatingAction(true);
        if (boardRef.current) {
          await boardRef.current.playMoveAnimation(selectedUnit.id, selectedUnit.x, selectedUnit.y, x, y);
        }
        setUnits((prev) => prev.map((u) => (u.id === selectedUnit.id ? { ...u, x, y, hasMoved: true } : u)));
        setSelectedAction('none');
        soundManager.playStep();
        setIsAnimatingAction(false);
        return;
      }
    }

    // Attack / Skill targeting execution
    if (selectedUnit && selectedUnit.faction === 'player' && !selectedUnit.hasAttacked) {
      const isTargeting = selectedAction === 'attack' || !!activeSkill;
      const targetType = activeSkill ? activeSkill.targetType : 'enemy';

      // Self-targeting skill
      if (activeSkill && targetType === 'self' && x === selectedUnit.x && y === selectedUnit.y) {
        const preview = getDamagePreview(selectedUnit, selectedUnit, activeSkill);
        setDamagePreview(preview);
        setTargetUnitId(selectedUnit.id);
        soundManager.playSelect();
        return;
      }

      // Unit targeting (Enemy, Ally or Any)
      if (clickedUnit) {
        const isTargetTileValid = attackableTiles.some((pt) => pt.x === x && pt.y === y);
        const isFactionValid =
          (targetType === 'enemy' && clickedUnit.faction === 'enemy') ||
          (targetType === 'ally' && clickedUnit.faction === 'player') ||
          targetType === 'any';

        if (isTargetTileValid && (isTargeting ? isFactionValid : clickedUnit.faction === 'enemy')) {
          const effectiveSkill = activeSkill || undefined;
          const preview = getDamagePreview(selectedUnit, clickedUnit, effectiveSkill);

          if (effectiveSkill && effectiveSkill.aoeRadius > 0) {
            const matchFaction = effectiveSkill.targetType === 'ally' ? 'player' : 'enemy';
            preview.aoeTargetsCount = units.filter(
              (u) =>
                u.faction === matchFaction &&
                !u.isDead &&
                Math.abs(u.x - clickedUnit.x) <= effectiveSkill.aoeRadius &&
                Math.abs(u.y - clickedUnit.y) <= effectiveSkill.aoeRadius
            ).length;
          }

          setDamagePreview(preview);
          setTargetUnitId(clickedUnit.id);
          soundManager.playSelect();
          return;
        }
      }
    }

    // Select / Deselect unit
    if (clickedUnit) {
      setSelectedUnitId(clickedUnit.id);
      setSelectedAction('none');
      setActiveSkill(null);
      setDamagePreview(null);
      setTargetUnitId(null);
      soundManager.playSelect();
    } else {
      setSelectedUnitId(null);
      setSelectedAction('none');
      setActiveSkill(null);
      setDamagePreview(null);
      setTargetUnitId(null);
    }
  };

  // ANIMATED Attack Confirm
  const handleConfirmAttack = async () => {
    if (!selectedUnit || !targetUnitId || !damagePreview) return;

    const target = units.find((u) => u.id === targetUnitId);
    if (!target) return;

    if (selectedUnit.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0)) {
      addFloatingNumber(selectedUnit.x, selectedUnit.y, 'Atordoado!', 'status', '#FACC15');
      return;
    }

    setIsAnimatingAction(true);
    setDamagePreview(null);

    const skill = activeSkill || undefined;

    // Self-targeting skill
    if (skill && skill.targetType === 'self') {
      soundManager.playHeal();
      if (boardRef.current) {
        await boardRef.current.playAttackAnimation(selectedUnit.id, selectedUnit.id, 'healing', 0, skill);
      }
      const effect = skill.statusEffect;
      let updatedEffects = [...(selectedUnit.statusEffects || [])];
      if (effect) {
        if (effect.type === 'shield') {
          addFloatingNumber(selectedUnit.x, selectedUnit.y, `+${effect.value} Escudo`, 'shield', '#38BDF8');
        } else if (effect.type === 'buff_atk') {
          addFloatingNumber(selectedUnit.x, selectedUnit.y, `+${effect.value}% Dano`, 'status', '#F97316');
        }
        updatedEffects = [...updatedEffects.filter((e) => e.type !== effect.type), { ...effect }];
      }
      const updatedSkills = selectedUnit.skills.map((s) =>
        s.id === skill.id ? { ...s, currentCooldown: s.cooldownMax } : s
      );
      const updatedUnits = units.map((u) =>
        u.id === selectedUnit.id
          ? { ...u, hasAttacked: true, skills: updatedSkills, statusEffects: updatedEffects }
          : u
      );
      setUnits(updatedUnits);
      setTargetUnitId(null);
      setSelectedAction('none');
      setActiveSkill(null);
      setIsAnimatingAction(false);
      return;
    }

    const { finalDamage, isKill, damageType } = rollActualDamage(selectedUnit, target, skill);

    if (damageType === 'healing') soundManager.playHeal();
    else if (damageType === 'magical') soundManager.playMagicSpell();
    else soundManager.playPhysicalAttack();

    if (boardRef.current) {
      await boardRef.current.playAttackAnimation(selectedUnit.id, target.id, damageType, skill?.aoeRadius, skill);
    }

    const aoeRadius = skill?.aoeRadius || 0;
    let targetsToHit: Unit[] = [];
    if (aoeRadius > 0) {
      const matchFaction = skill?.targetType === 'ally' ? 'player' : 'enemy';
      targetsToHit = units.filter(
        (u) =>
          u.faction === matchFaction &&
          !u.isDead &&
          Math.abs(u.x - target.x) <= aoeRadius &&
          Math.abs(u.y - target.y) <= aoeRadius
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
      if (dmgResult.damageType !== 'healing') {
        const sIdx = currentEffects.findIndex((e) => e.type === 'shield' && e.value > 0);
        if (sIdx !== -1) {
          const sh = currentEffects[sIdx];
          if (sh.value >= actualDmg) {
            addFloatingNumber(t.x, t.y, `-${actualDmg} (Escudo)`, 'shield', '#38BDF8');
            sh.value -= actualDmg;
            actualDmg = 0;
          } else {
            addFloatingNumber(t.x, t.y, `-${sh.value} (Escudo)`, 'shield', '#38BDF8');
            actualDmg -= sh.value;
            sh.value = 0;
          }
          if (sh.value <= 0) {
            currentEffects = currentEffects.filter((_, idx) => idx !== sIdx);
          }
        }
      }

      let newHp = t.currentHp;
      if (dmgResult.damageType === 'healing') {
        newHp = Math.min(t.maxHp, t.currentHp + actualDmg);
        addFloatingNumber(t.x, t.y, `+${actualDmg}`, 'healing', '#56E59A');
      } else {
        newHp = Math.max(0, t.currentHp - actualDmg);
        if (actualDmg > 0) {
          const color = dmgResult.damageType === 'magical' ? '#B58AFF' : '#FF5252';
          addFloatingNumber(t.x, t.y, `-${actualDmg}`, dmgResult.damageType, color);
        }
        totalDmgDone += actualDmg;
      }

      if (newHp === 0) {
        soundManager.playDeath();
        totalKills++;
        if (boardRef.current) {
          await boardRef.current.playDeathAnimation(t.id);
        }
      } else if (skill?.statusEffect) {
        const eff = skill.statusEffect;
        currentEffects = [...currentEffects.filter((e) => e.type !== eff.type), { ...eff }];
        if (eff.type === 'poison') addFloatingNumber(t.x, t.y, 'Envenenado!', 'status', '#A855F7');
        else if (eff.type === 'stun') addFloatingNumber(t.x, t.y, 'Atordoado!', 'status', '#FACC15');
        else if (eff.type === 'slow') addFloatingNumber(t.x, t.y, 'Lentidão!', 'status', '#60A5FA');
      }

      updatedUnits = updatedUnits.map((u) =>
        u.id === t.id ? { ...u, currentHp: newHp, isDead: newHp === 0, statusEffects: currentEffects } : u
      );
    }

    updatedUnits = updatedUnits.map((u) => {
      if (u.id === selectedUnit.id) {
        const updatedSkills = u.skills.map((s) =>
          skill && s.id === skill.id ? { ...s, currentCooldown: s.cooldownMax } : s
        );
        return {
          ...u,
          hasAttacked: true,
          skills: updatedSkills,
          damageDealt: u.damageDealt + totalDmgDone,
          kills: u.kills + totalKills,
        };
      }
      return u;
    });

    setUnits(updatedUnits);
    setTargetUnitId(null);
    setSelectedAction('none');
    setActiveSkill(null);
    setIsAnimatingAction(false);

    setTimeout(() => checkBattleStatusWithUnits(updatedUnits), 200);
  };

  // ANIMATED AI Turn
  const runAiTurn = useCallback(async () => {
    let currentUnits = [...units];
    const delayMult = progress.combatSpeed === 'fast' ? 0.5 : 1.0;
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

      const choice = decideMonsterAction(freshMonster, grid, currentUnits);
      if (choice) {
        if (choice.moveTo && (choice.moveTo.x !== freshMonster.x || choice.moveTo.y !== freshMonster.y)) {
          if (boardRef.current) {
            await boardRef.current.playMoveAnimation(freshMonster.id, freshMonster.x, freshMonster.y, choice.moveTo.x, choice.moveTo.y);
          }
          currentUnits = currentUnits.map((u) =>
            u.id === freshMonster.id ? { ...u, x: choice.moveTo.x, y: choice.moveTo.y } : u
          );
          setUnits([...currentUnits]);
          soundManager.playStep();
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

              if (skill.damageType === 'healing' && skill.power > 0) {
                const healAmount = Math.max(1, Math.round(freshAttacker.mag * skill.power));
                newHp = Math.min(freshTarget.maxHp, freshTarget.currentHp + healAmount);
                addFloatingNumber(freshTarget.x, freshTarget.y, `+${healAmount}`, 'healing', '#56E59A');
              }

              if (skill.statusEffect) {
                const eff = skill.statusEffect;
                currentEffects = [...currentEffects.filter((e) => e.type !== eff.type), { ...eff }];
                if (eff.type === 'shield') {
                  addFloatingNumber(freshTarget.x, freshTarget.y, `+${eff.value} Escudo`, 'shield', '#38BDF8');
                } else if (eff.type === 'buff_atk') {
                  addFloatingNumber(freshTarget.x, freshTarget.y, `+${eff.value}% Dano`, 'status', '#F97316');
                }
              }

              currentUnits = currentUnits.map((u) =>
                u.id === freshTarget.id ? { ...u, currentHp: newHp, statusEffects: currentEffects } : u
              );
            } else {
              // --- MONSTER ATTACK / OFFENSIVE ACTION ON PLAYER UNITS ---
              const dmgType = skill?.damageType || (freshAttacker.mag > freshAttacker.atk ? 'magical' : 'physical');

              if (dmgType === 'magical') soundManager.playMagicSpell();
              else soundManager.playPhysicalAttack();

              if (boardRef.current) {
                await boardRef.current.playAttackAnimation(freshAttacker.id, freshTarget.id, dmgType, skill?.aoeRadius, skill);
              }

              const aoeRad = skill?.aoeRadius || 0;
              let enemyTargets: Unit[] = [];
              if (aoeRad > 0) {
                enemyTargets = currentUnits.filter(
                  (u) =>
                    u.faction === 'player' &&
                    !u.isDead &&
                    Math.abs(u.x - freshTarget.x) <= aoeRad &&
                    Math.abs(u.y - freshTarget.y) <= aoeRad
                );
              } else {
                enemyTargets = [freshTarget];
              }

              for (const t of enemyTargets) {
                const res = rollActualDamage(freshAttacker, t, skill);
                let actualDmg = res.finalDamage;
                const damageType = res.damageType;

                let currentEffects = [...(t.statusEffects || [])];
                const sIdx = currentEffects.findIndex((e) => e.type === 'shield' && e.value > 0);
                if (sIdx !== -1) {
                  const sh = currentEffects[sIdx];
                  if (sh.value >= actualDmg) {
                    addFloatingNumber(t.x, t.y, `-${actualDmg} (Escudo)`, 'shield', '#38BDF8');
                    sh.value -= actualDmg;
                    actualDmg = 0;
                  } else {
                    addFloatingNumber(t.x, t.y, `-${sh.value} (Escudo)`, 'shield', '#38BDF8');
                    actualDmg -= sh.value;
                    sh.value = 0;
                  }
                  if (sh.value <= 0) {
                    currentEffects = currentEffects.filter((_, idx) => idx !== sIdx);
                  }
                }

                const newHp = Math.max(0, t.currentHp - actualDmg);
                if (actualDmg > 0) {
                  const color = damageType === 'magical' ? '#B58AFF' : '#FF5252';
                  addFloatingNumber(t.x, t.y, `-${actualDmg}`, damageType, color);
                }

                if (newHp === 0) {
                  soundManager.playDeath();
                  if (boardRef.current) {
                    await boardRef.current.playDeathAnimation(t.id);
                  }
                } else if (choice.skillToUse?.statusEffect) {
                  const eff = choice.skillToUse.statusEffect;
                  currentEffects = [...currentEffects.filter((e) => e.type !== eff.type), { ...eff }];
                  if (eff.type === 'poison') addFloatingNumber(t.x, t.y, 'Envenenado!', 'status', '#A855F7');
                  else if (eff.type === 'stun') addFloatingNumber(t.x, t.y, 'Atordoado!', 'status', '#FACC15');
                  else if (eff.type === 'slow') addFloatingNumber(t.x, t.y, 'Lentidão!', 'status', '#60A5FA');
                }

                currentUnits = currentUnits.map((u) =>
                  u.id === t.id ? { ...u, currentHp: newHp, isDead: newHp === 0, statusEffects: currentEffects } : u
                );
              }
            }

            // Put used skill on cooldown on the monster!
            if (skill) {
              currentUnits = currentUnits.map((u) => {
                if (u.id === freshAttacker.id) {
                  return {
                    ...u,
                    skills: u.skills.map((s) =>
                      s.id === skill.id ? { ...s, currentCooldown: s.cooldownMax } : s
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

    setTurnNumber((t) => t + 1);
    setUnits((prev) =>
      prev.map((u) => {
        let currentHp = u.currentHp;
        let isDead = u.isDead;
        if (!isDead) {
          const poison = u.statusEffects?.find((e) => e.type === 'poison');
          if (poison) {
            const pDmg = poison.value || 15;
            currentHp = Math.max(0, currentHp - pDmg);
            isDead = currentHp === 0;
            addFloatingNumber(u.x, u.y, `-${pDmg} Veneno`, 'status', '#A855F7');
          }
        }
        const updatedEffects = (u.statusEffects || [])
          .map((e) => ({ ...e, duration: e.duration - 1 }))
          .filter((e) => e.duration > 0);

        return {
          ...u,
          currentHp,
          isDead,
          hasMoved: false,
          hasAttacked: false,
          statusEffects: updatedEffects,
          skills: u.skills.map((s) => ({ ...s, currentCooldown: Math.max(0, s.currentCooldown - 1) })),
        };
      })
    );
    setPhase('player_turn');
    soundManager.playTurnStart(true);
  }, [units, grid, progress.combatSpeed, handleDefeat]);

  const handleEndPlayerTurn = useCallback(() => {
    if (isAnimatingAction) return;
    setPhase('ai_turn');
    setSelectedUnitId(null);
    setSelectedAction('none');
    setActiveSkill(null);
    soundManager.playTurnStart(false);
    setTimeout(() => runAiTurn(), 500);
  }, [runAiTurn, isAnimatingAction]);

  // Handle Victory in current stage
  const handleVictory = (finalUnitsState: Unit[]) => {
    if (!currentLevel) return;
    soundManager.playVictory();
    setPhase('victory');

    const xpReward = currentLevel.rewards.xpPerUnit;
    const goldReward = currentLevel.rewards.gold;
    const surviving = finalUnitsState.filter((u) => u.faction === 'player' && !u.isDead);
    const levelUps: { unitName: string; oldLevel: number; newLevel: number }[] = [];
    const statChoiceQueue: { unit: Unit; newLevel: number }[] = [];
    const updatedUnitsState = { ...progress.unitsState };

    surviving.forEach((match) => {
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
    const finalUnlockedClasses = Array.from(new Set([...currentUnlocked, ...newlyUnlocked]));

    const nextUnlocked = Math.max(progress.unlockedLevel, currentLevel.id + 1);
    const completedList = Array.from(new Set([...progress.completedLevels, currentLevel.id]));
    const totalGold = progress.gold + goldReward;
    const totalRunGold = (progress.activeAdventure?.goldEarnedInRun || 0) + goldReward;

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
      };
    }

    const newProgress: PlayerProgress = {
      ...progress,
      unlockedLevel: nextUnlocked,
      completedLevels: completedList,
      gold: totalGold,
      unlockedClasses: finalUnlockedClasses,
      unitsState: nextUnitsState,
      activeAdventure: updatedActiveAdventure,
      adventureHistory: updatedHistory,
    };
    setProgress(newProgress);
    savePlayerProgress(newProgress);

    if (authUserRef.current) {
      submitScore(currentLevel.id, activeParty).catch((err) =>
        console.error('Falha ao registrar no ranking:', err)
      );
    }

    setVictorySummary({ xpGained: xpReward, goldGained: goldReward, survivingUnits: surviving, levelUps });
    if (statChoiceQueue.length > 0) setPendingStatChoices(statChoiceQueue);
    if (newlyUnlocked.length > 0) setPendingUnlockClasses(newlyUnlocked);
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

    if (chosenStat === 'hp') bonusHp += 25;
    else if (chosenStat === 'atk') bonusAtk += 5;
    else if (chosenStat === 'mag') bonusMag += 5;
    else if (chosenStat === 'def') bonusDef += 4;
    else if (chosenStat === 'res') bonusRes += 4;

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

  const handleLearnSkillChoice = (chosenSkill: Skill) => {
    if (pendingSkillChoices.length === 0) return;
    const currentUnitToUpgrade = pendingSkillChoices[0];
    const className = currentUnitToUpgrade.className;
    const uState = progress.unitsState[className];
    const learnedList = uState ? uState.learnedSkillIds : [];
    if (!learnedList.includes(chosenSkill.id)) {
      const updatedLearned = [...learnedList, chosenSkill.id];
      const updatedUnitsState = {
        ...progress.unitsState,
        [className]: { ...uState, learnedSkillIds: updatedLearned },
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
    }
    setPendingSkillChoices((prev) => prev.slice(1));
  };

  // Select skill action handler
  const handleSelectSkill = useCallback(
    (sk: Skill) => {
      if (!selectedUnit || selectedUnit.faction !== 'player' || selectedUnit.hasAttacked || phase !== 'player_turn') {
        return;
      }
      if (sk.currentCooldown > 0) return;

      if (activeSkill?.id === sk.id) {
        // Toggle off
        setActiveSkill(null);
        setDamagePreview(null);
        setTargetUnitId(null);
        return;
      }

      setActiveSkill(sk);
      setSelectedAction('none');
      if (sk.targetType === 'self') {
        const preview = getDamagePreview(selectedUnit, selectedUnit, sk);
        setDamagePreview(preview);
        setTargetUnitId(selectedUnit.id);
      } else {
        setDamagePreview(null);
        setTargetUnitId(null);
      }
    },
    [selectedUnit, phase, activeSkill]
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
        const code = e.code;
        const key = e.key ? e.key.toLowerCase() : '';

        // 1 2 3 4 5 6 7 8 9 - Atalhos para habilidades
        const digitMatch = code.match(/^(?:Digit|Numpad)([1-9])$/) || (key >= '1' && key <= '9' ? [, key] : null);
        if (digitMatch && !selectedUnit.hasAttacked) {
          const index = parseInt(digitMatch[1], 10) - 1;
          const skill = selectedUnit.skills?.[index];
          if (skill && skill.currentCooldown === 0) {
            e.preventDefault();
            handleSelectSkill(skill);
            return;
          }
        }

        // A - Atacar
        if ((code === 'KeyA' || key === 'a') && !selectedUnit.hasAttacked) {
          e.preventDefault();
          setSelectedAction('attack');
          setActiveSkill(null);
          setDamagePreview(null);
          setTargetUnitId(null);
          return;
        }

        // W - Mover
        if ((code === 'KeyW' || key === 'w') && !selectedUnit.hasMoved) {
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
        <AuthScreen onAuthenticated={syncUserCloudProgress} onOpenLeaderboard={() => setShowLeaderboard(true)} />
        {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      </>
    );
  }

  // View Router
  if (currentView === 'level_select') {
    return (
      <>
        <div className="fixed top-3 right-3 z-40 flex items-center gap-2 bg-[#1B2030]/90 backdrop-blur border border-[#343B50] rounded-xl p-1.5 shadow-lg text-xs font-sans">
          <span className="flex items-center gap-1.5 px-2 text-[#F3F4F8] font-semibold">
            <UserIcon size={14} className="text-[#4C8DFF]" /> {authUser.username}
          </span>
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
            if (progress.activeAdventure) return;
            setCurrentView('party_select');
          }}
          onResetProgress={handleResetProgress}
          onOpenBestiary={() => setShowBestiary(true)}
          onOpenHistory={() => setShowHistory(true)}
        />

        {showLeaderboard && (
          <LeaderboardModal currentUsername={authUser.username} onClose={() => setShowLeaderboard(false)} />
        )}
        {showBestiary && (
          <BestiaryModal
            discoveredMonsterIds={progress.discoveredMonsterIds || []}
            onClose={() => setShowBestiary(false)}
          />
        )}
        {showHistory && (
          <AdventureHistoryModal
            history={progress.adventureHistory || []}
            onClose={() => setShowHistory(false)}
          />
        )}
      </>
    );
  }

  if (currentView === 'party_select') {
    if (progress.activeAdventure) {
      setCurrentView('level_select');
      return null;
    }
    return (
      <PartySelectionModal
        initialSelected={progress.selectedPartyClasses}
        unlockedClasses={progress.unlockedClasses || ['guerreiro', 'arqueiro', 'mago', 'curandeiro']}
        onConfirmParty={handleConfirmParty}
      />
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
        onRestartLevel={() => currentLevel && startLevel(currentLevel.id)}
        onEndTurn={handleEndPlayerTurn}
        onOpenBestiary={() => setShowBestiary(true)}
        onOpenHistory={() => setShowHistory(true)}
        onSaveAndExit={() => setCurrentView('level_select')}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {phase === 'deployment' && <DeploymentBanner onStartBattle={handleConfirmDeployment} />}

        {/* LEFT: Skills List Panel */}
        <SkillsPanel
          selectedUnit={selectedUnit}
          activeSkill={activeSkill}
          onSelectSkill={handleSelectSkill}
          onClearSkill={() => {
            setActiveSkill(null);
            setDamagePreview(null);
            setTargetUnitId(null);
          }}
          isPlayerTurn={phase === 'player_turn'}
        />

        {/* CENTER: 3D Tactical Battlefield */}
        <main className="flex-1 flex items-center justify-center p-2 overflow-hidden relative">
          <BoardRenderer3D
            ref={boardRef}
            grid={grid}
            units={units}
            selectedUnit={selectedUnit}
            reachableTiles={reachableTiles}
            attackableTiles={attackableTiles}
            aoeTiles={aoeTiles}
            deploymentZone={currentLevel?.deploymentZone || []}
            phase={phase}
            floatingNumbers={floatingNumbers}
            onTileClick={handleTileClick}
            onTileHover={(x, y) => setHoveredTile(y === null ? null : { x, y })}
            hoveredTile={hoveredTile}
            activeSkill={activeSkill || undefined}
          />
        </main>

        {/* RIGHT: Unit Status & Movement / Actions Panel */}
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
        />
      </div>

      {damagePreview && (
        <ActionPreviewModal
          preview={damagePreview}
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

      {pendingStatChoices.length === 0 && pendingSkillChoices.length > 0 && (
        <SkillChoiceModal
          unit={pendingSkillChoices[0]}
          onChooseSkill={handleLearnSkillChoice}
        />
      )}

      {pendingStatChoices.length === 0 && pendingSkillChoices.length === 0 && pendingUnlockClasses.length > 0 && (
        <ClassUnlockModal
          unlockedClasses={pendingUnlockClasses}
          onDismiss={() => setPendingUnlockClasses((prev) => prev.slice(1))}
        />
      )}

      {(phase === 'victory' || phase === 'defeat') &&
        currentLevel &&
        pendingStatChoices.length === 0 &&
        pendingSkillChoices.length === 0 &&
        pendingUnlockClasses.length === 0 && (
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
          onClose={() => setShowBestiary(false)}
        />
      )}
      {showHistory && (
        <AdventureHistoryModal
          history={progress.adventureHistory || []}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

export default App;
