import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { BattlePhase, DamagePreview, FloatingNumber, LevelConfig, PlayerProgress, Point, SelectedAction, Skill, TileData, Unit } from './types/game';
import { LEVELS } from './data/levels';
import { createPlayerUnit } from './data/units';
import { createMonsterUnit } from './data/monsters';
import { loadAudioSettings, loadPlayerProgress, resetPlayerProgress, saveAudioSettings, savePlayerProgress } from './utils/storage';
import { soundManager } from './utils/audio';
import { getAttackableTiles, getAoETiles, getReachableTiles } from './utils/pathfinding';
import { getDamagePreview, rollActualDamage } from './utils/damage';
import { decideMonsterAction } from './ai/monsterAI';
import { BoardRenderer3D } from './game/BoardRenderer3D';
import type { BoardRenderer3DHandle } from './game/BoardRenderer3D';
import { TopBar } from './components/TopBar';
import { SidePanel } from './components/SidePanel';
import { ActionPreviewModal } from './components/ActionPreviewModal';
import { DeploymentBanner } from './components/DeploymentBanner';
import { ObjectivesModal } from './components/ObjectivesModal';
import { SettingsModal } from './components/SettingsModal';
import { TutorialModal } from './components/TutorialModal';
import { VictoryDefeatModal } from './components/VictoryDefeatModal';
import { LevelSelect } from './components/LevelSelect';
import { PartySelectionModal } from './components/PartySelectionModal';
import { SkillChoiceModal } from './components/SkillChoiceModal';
import { BossIntroBanner } from './components/BossIntroBanner';

export function App() {
  const boardRef = useRef<BoardRenderer3DHandle>(null);

  const [currentView, setCurrentView] = useState<'level_select' | 'party_select' | 'battle'>('level_select');
  const [progress, setProgress] = useState<PlayerProgress>(loadPlayerProgress());
  const [audioSettings, setAudioSettings] = useState(loadAudioSettings());

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
  const [pendingSkillChoices, setPendingSkillChoices] = useState<Unit[]>([]);
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

  const startLevel = (levelId: number) => {
    const lvlConfig = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    setCurrentLevel(lvlConfig);

    const tileGrid: TileData[][] = lvlConfig.grid.map((row, y) =>
      row.map((cell, x) => ({
        x, y,
        terrain: cell.terrain,
        obstacle: cell.obstacle,
        isWalkable: cell.obstacle === 'none',
        blocksVision: cell.obstacle === 'wall' || cell.obstacle === 'ruins',
      }))
    );
    setGrid(tileGrid);

    const playerUnits: Unit[] = progress.selectedPartyClasses.map((cKey, idx) => {
      const uState = progress.unitsState[cKey];
      const spawnPt = lvlConfig.deploymentZone[idx] || { x: 3 + idx, y: 6 };
      return createPlayerUnit(
        cKey as any, `player_${cKey}`, spawnPt.x, spawnPt.y,
        uState ? uState.level : 1, uState ? uState.xp : 0,
        uState ? uState.bonusHp : 0, uState ? uState.bonusAtk : 0,
        uState ? uState.bonusDef : 0, uState ? uState.learnedSkillIds : []
      );
    });

    const enemyUnits: Unit[] = lvlConfig.enemySpawns.map((spawn, idx) =>
      createMonsterUnit(spawn.monsterTypeId as any, `enemy_${spawn.monsterTypeId}_${idx}`, spawn.x, spawn.y, spawn.levelOffset || 0)
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

    if (lvlConfig.hasMiniBoss) {
      setActiveBossBanner({ name: 'Devorador das Profundezas', subtitle: 'MINI BOSS (FASE 5) — Criatura Abissal Colossal', phase: 1 });
    } else if (lvlConfig.hasFinalBoss) {
      setActiveBossBanner({ name: 'Astaroth, Soberano do Abismo', subtitle: 'BOSS FINAL (FASE 10) — Soberano do Abismo em 3 Fases', phase: 1 });
    }
    soundManager.playSelect();
  };

  const handleConfirmParty = (selectedPartyClasses: string[]) => {
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
    if (!activeSkill || !hoveredTile || activeSkill.aoeRadius === 0) return [];
    return getAoETiles(hoveredTile, activeSkill.aoeRadius, grid[0].length, grid.length);
  }, [activeSkill, hoveredTile, grid]);

  // --- ANIMATED Tile Click Handler ---
  const handleTileClick = async (x: number, y: number) => {
    if (isAnimatingAction) return;

    const clickedUnit = units.find((u) => u.x === x && u.y === y && !u.isDead);

    // Deployment phase
    if (phase === 'deployment') {
      if (selectedUnitId && selectedUnit) {
        const inZone = currentLevel?.deploymentZone.some((pt) => pt.x === x && pt.y === y);
        if (inZone) {
          const oldX = selectedUnit.x;
          const oldY = selectedUnit.y;
          setUnits((prev) =>
            prev.map((u) => {
              if (u.id === selectedUnitId) return { ...u, x, y };
              if (u.x === x && u.y === y && u.faction === 'player') return { ...u, x: oldX, y: oldY };
              return u;
            })
          );
          soundManager.playStep();
          setSelectedUnitId(null);
        } else if (clickedUnit && clickedUnit.faction === 'player') {
          setSelectedUnitId(clickedUnit.id);
          soundManager.playSelect();
        }
      } else if (clickedUnit && clickedUnit.faction === 'player') {
        setSelectedUnitId(clickedUnit.id);
        soundManager.playSelect();
      }
      return;
    }

    if (phase !== 'player_turn') return;

    // Attack / Skill targeting
    if (selectedUnit && (selectedAction === 'attack' || activeSkill)) {
      if (clickedUnit) {
        const isTargetValid = attackableTiles.some((pt) => pt.x === x && pt.y === y);
        if (isTargetValid) {
          const targetType = activeSkill ? activeSkill.targetType : 'enemy';
          if (
            (targetType === 'enemy' && clickedUnit.faction === 'enemy') ||
            (targetType === 'ally' && clickedUnit.faction === 'player') ||
            targetType === 'any'
          ) {
            const preview = getDamagePreview(selectedUnit, clickedUnit, activeSkill || undefined);
            setDamagePreview(preview);
            setTargetUnitId(clickedUnit.id);
            soundManager.playSelect();
            return;
          }
        }
      }
    }

    // Movement (ANIMATED)
    if (selectedUnit && selectedAction === 'move' && !selectedUnit.hasMoved) {
      const isReachable = reachableTiles.some((pt) => pt.x === x && pt.y === y);
      if (isReachable) {
        setIsAnimatingAction(true);
        const fromX = selectedUnit.x;
        const fromY = selectedUnit.y;

        // Play 3D hop animation FIRST
        if (boardRef.current) {
          await boardRef.current.playMoveAnimation(selectedUnit.id, fromX, fromY, x, y);
        }

        // THEN update game state
        setUnits((prev) =>
          prev.map((u) => (u.id === selectedUnit.id ? { ...u, x, y, hasMoved: true } : u))
        );
        setSelectedAction('none');
        soundManager.playStep();
        setIsAnimatingAction(false);
        return;
      }
    }

    // Select / Deselect unit
    if (clickedUnit) {
      setSelectedUnitId(clickedUnit.id);
      setSelectedAction('none');
      setActiveSkill(null);
      soundManager.playSelect();
    } else {
      setSelectedUnitId(null);
      setSelectedAction('none');
      setActiveSkill(null);
    }
  };

  const checkBattleStatusWithUnits = useCallback((currentUnits: Unit[]) => {
    const playerLiving = currentUnits.filter((u) => u.faction === 'player' && !u.isDead);
    const enemyLiving = currentUnits.filter((u) => u.faction === 'enemy' && !u.isDead);
    if (enemyLiving.length === 0) {
      handleVictory(currentUnits);
    } else if (playerLiving.length === 0) {
      setPhase('defeat');
      soundManager.playDefeat();
    }
  }, []);

  // --- ANIMATED Attack Confirm ---
  const handleConfirmAttack = async () => {
    if (!selectedUnit || !targetUnitId || !damagePreview) return;

    const target = units.find((u) => u.id === targetUnitId);
    if (!target) return;

    setIsAnimatingAction(true);
    setDamagePreview(null);

    const skill = activeSkill || undefined;
    const { finalDamage, isKill, damageType } = rollActualDamage(selectedUnit, target, skill);

    // Play sound
    if (damageType === 'healing') soundManager.playHeal();
    else if (damageType === 'magical') soundManager.playMagicSpell();
    else soundManager.playPhysicalAttack();

    // Play 3D attack/skill animation FIRST
    if (boardRef.current) {
      await boardRef.current.playAttackAnimation(
        selectedUnit.id, target.id, damageType,
        skill?.aoeRadius
      );
    }

    // Show floating damage number
    let newHp = target.currentHp;
    if (damageType === 'healing') {
      newHp = Math.min(target.maxHp, target.currentHp + finalDamage);
      addFloatingNumber(target.x, target.y, `+${finalDamage}`, 'healing', '#56E59A');
    } else {
      newHp = Math.max(0, target.currentHp - finalDamage);
      const color = damageType === 'magical' ? '#B58AFF' : '#FF5252';
      addFloatingNumber(target.x, target.y, `-${finalDamage}`, damageType, color);
    }

    // Death animation
    if (newHp === 0) {
      soundManager.playDeath();
      if (boardRef.current) {
        await boardRef.current.playDeathAnimation(target.id);
      }
    }

    // Update state
    const updatedUnits = units.map((u) => {
      if (u.id === target.id) return { ...u, currentHp: newHp, isDead: newHp === 0 };
      if (u.id === selectedUnit.id) {
        const updatedSkills = u.skills.map((s) =>
          skill && s.id === skill.id ? { ...s, currentCooldown: s.cooldownMax } : s
        );
        return {
          ...u, hasAttacked: true, skills: updatedSkills,
          damageDealt: u.damageDealt + (damageType !== 'healing' ? finalDamage : 0),
          kills: u.kills + (isKill ? 1 : 0),
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

  // --- ANIMATED AI Turn ---
  const runAiTurn = useCallback(async () => {
    let currentUnits = [...units];
    const delayMult = progress.combatSpeed === 'fast' ? 0.5 : 1.0;
    const monsters = currentUnits.filter((u) => u.faction === 'enemy' && !u.isDead);

    for (const monster of monsters) {
      const freshMonster = currentUnits.find((u) => u.id === monster.id);
      if (!freshMonster || freshMonster.isDead) continue;

      const choice = decideMonsterAction(freshMonster, grid, currentUnits);
      if (choice) {
        // ANIMATED movement
        if (choice.moveTo.x !== freshMonster.x || choice.moveTo.y !== freshMonster.y) {
          if (boardRef.current) {
            await boardRef.current.playMoveAnimation(
              freshMonster.id, freshMonster.x, freshMonster.y,
              choice.moveTo.x, choice.moveTo.y
            );
          }
          currentUnits = currentUnits.map((u) =>
            u.id === freshMonster.id ? { ...u, x: choice.moveTo.x, y: choice.moveTo.y, hasMoved: true } : u
          );
          setUnits([...currentUnits]);
          soundManager.playStep();
          await new Promise((r) => setTimeout(r, 150 * delayMult));
        }

        // ANIMATED attack
        if (choice.targetUnit) {
          const target = currentUnits.find((u) => u.id === choice.targetUnit!.id);
          if (target && !target.isDead) {
            const { finalDamage, damageType } = rollActualDamage(freshMonster, target, choice.skillToUse);

            if (damageType === 'magical') soundManager.playMagicSpell();
            else soundManager.playPhysicalAttack();

            // Play 3D attack animation
            if (boardRef.current) {
              await boardRef.current.playAttackAnimation(
                freshMonster.id, target.id, damageType,
                choice.skillToUse?.aoeRadius
              );
            }

            const newHp = Math.max(0, target.currentHp - finalDamage);
            const color = damageType === 'magical' ? '#B58AFF' : '#FF5252';
            addFloatingNumber(target.x, target.y, `-${finalDamage}`, damageType, color);

            if (newHp === 0) {
              soundManager.playDeath();
              if (boardRef.current) {
                await boardRef.current.playDeathAnimation(target.id);
              }
            }

            currentUnits = currentUnits.map((u) =>
              u.id === target.id ? { ...u, currentHp: newHp, isDead: newHp === 0 } : u
            );
            setUnits([...currentUnits]);
            await new Promise((r) => setTimeout(r, 200 * delayMult));
          }
        }
      }
    }

    const playerLiving = currentUnits.filter((u) => u.faction === 'player' && !u.isDead);
    const enemyLiving = currentUnits.filter((u) => u.faction === 'enemy' && !u.isDead);

    if (playerLiving.length === 0) {
      setPhase('defeat');
      soundManager.playDefeat();
      return;
    }
    if (enemyLiving.length === 0) {
      handleVictory(currentUnits);
      return;
    }

    setTurnNumber((t) => t + 1);
    setUnits((prev) =>
      prev.map((u) => ({
        ...u, hasMoved: false, hasAttacked: false,
        skills: u.skills.map((s) => ({ ...s, currentCooldown: Math.max(0, s.currentCooldown - 1) })),
      }))
    );
    setPhase('player_turn');
    soundManager.playTurnStart(true);
  }, [units, grid, progress.combatSpeed]);

  const handleEndPlayerTurn = useCallback(() => {
    if (isAnimatingAction) return;
    setPhase('ai_turn');
    setSelectedUnitId(null);
    setSelectedAction('none');
    setActiveSkill(null);
    soundManager.playTurnStart(false);
    setTimeout(() => runAiTurn(), 500);
  }, [runAiTurn, isAnimatingAction]);

  const handleVictory = (finalUnitsState: Unit[]) => {
    if (!currentLevel) return;
    soundManager.playVictory();
    setPhase('victory');

    const xpReward = currentLevel.rewards.xpPerUnit;
    const goldReward = currentLevel.rewards.gold;
    const surviving = finalUnitsState.filter((u) => u.faction === 'player' && !u.isDead);
    const levelUps: { unitName: string; oldLevel: number; newLevel: number }[] = [];
    const skillChoiceQueue: Unit[] = [];
    const updatedUnitsState = { ...progress.unitsState };

    surviving.forEach((match) => {
      const uState = updatedUnitsState[match.className] || {
        className: match.className, level: 1, xp: 0,
        bonusAtk: 0, bonusDef: 0, bonusHp: 0, learnedSkillIds: [],
      };
      const oldLevel = uState.level;
      const newLevel = oldLevel + 1;
      levelUps.push({ unitName: match.name, oldLevel, newLevel });
      const updatedUnitObj = { ...match, level: newLevel, maxHp: match.maxHp + 12, currentHp: match.maxHp + 12, atk: match.atk + 3, def: match.def + 2 };
      skillChoiceQueue.push(updatedUnitObj);
      updatedUnitsState[match.className] = { ...uState, level: newLevel, bonusHp: uState.bonusHp + 12, bonusAtk: uState.bonusAtk + 3, bonusDef: uState.bonusDef + 2 };
    });

    const nextUnlocked = Math.max(progress.unlockedLevel, currentLevel.id + 1);
    const completedList = Array.from(new Set([...progress.completedLevels, currentLevel.id]));
    const newProgress: PlayerProgress = { ...progress, unlockedLevel: nextUnlocked, completedLevels: completedList, gold: progress.gold + goldReward, unitsState: updatedUnitsState };
    setProgress(newProgress);
    savePlayerProgress(newProgress);
    setVictorySummary({ xpGained: xpReward, goldGained: goldReward, survivingUnits: surviving, levelUps });
    if (skillChoiceQueue.length > 0) setPendingSkillChoices(skillChoiceQueue);
  };

  const handleLearnSkillChoice = (chosenSkill: Skill) => {
    if (pendingSkillChoices.length === 0) return;
    const currentUnitToUpgrade = pendingSkillChoices[0];
    const className = currentUnitToUpgrade.className;
    const uState = progress.unitsState[className];
    const learnedList = uState ? uState.learnedSkillIds : [];
    if (!learnedList.includes(chosenSkill.id)) {
      const updatedLearned = [...learnedList, chosenSkill.id];
      const updatedProgress = { ...progress, unitsState: { ...progress.unitsState, [className]: { ...uState, learnedSkillIds: updatedLearned } } };
      setProgress(updatedProgress);
      savePlayerProgress(updatedProgress);
    }
    setPendingSkillChoices((prev) => prev.slice(1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentView !== 'battle' || isAnimatingAction) return;
      if (e.code === 'Space' && phase === 'player_turn') {
        e.preventDefault();
        handleEndPlayerTurn();
      } else if (e.code === 'Escape') {
        setSelectedUnitId(null);
        setSelectedAction('none');
        setActiveSkill(null);
        setDamagePreview(null);
      } else if (selectedUnit && selectedUnit.faction === 'player' && phase === 'player_turn') {
        if (e.code === 'KeyM' && !selectedUnit.hasMoved) setSelectedAction('move');
        else if (e.code === 'KeyA' && !selectedUnit.hasAttacked) setSelectedAction('attack');
        else if (e.code === 'KeyW') {
          setUnits((prev) => prev.map((u) => (u.id === selectedUnit.id ? { ...u, hasMoved: true, hasAttacked: true } : u)));
          setSelectedUnitId(null);
          setSelectedAction('none');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, phase, selectedUnit, handleEndPlayerTurn, isAnimatingAction]);

  // View Router
  if (currentView === 'level_select') {
    return <LevelSelect progress={progress} onSelectLevel={startLevel} onChangeParty={() => setCurrentView('party_select')} onResetProgress={handleResetProgress} />;
  }
  if (currentView === 'party_select') {
    return <PartySelectionModal initialSelected={progress.selectedPartyClasses} onConfirmParty={handleConfirmParty} />;
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
      />

      <div className="flex-1 flex overflow-hidden relative">
        {phase === 'deployment' && <DeploymentBanner onStartBattle={handleConfirmDeployment} />}

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

        <SidePanel
          selectedUnit={selectedUnit}
          selectedAction={selectedAction}
          activeSkill={activeSkill}
          onSelectAction={(act) => { setSelectedAction(act); setActiveSkill(null); }}
          onSelectSkill={(sk) => { setActiveSkill(sk); setSelectedAction('none'); }}
          onWaitUnit={() => {
            if (selectedUnit) {
              setUnits((prev) => prev.map((u) => (u.id === selectedUnit.id ? { ...u, hasMoved: true, hasAttacked: true } : u)));
              setSelectedUnitId(null);
              setSelectedAction('none');
            }
          }}
          onCancelSelection={() => { setSelectedUnitId(null); setSelectedAction('none'); setActiveSkill(null); }}
          isPlayerTurn={phase === 'player_turn'}
        />
      </div>

      {damagePreview && <ActionPreviewModal preview={damagePreview} onConfirm={handleConfirmAttack} onCancel={() => setDamagePreview(null)} />}
      {showObjectives && currentLevel && <ObjectivesModal level={currentLevel} onClose={() => setShowObjectives(false)} />}
      {showSettings && <SettingsModal settings={audioSettings} onUpdateSettings={(newSets) => setAudioSettings((prev) => ({ ...prev, ...newSets }))} onResetProgress={handleResetProgress} onClose={() => setShowSettings(false)} />}
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      {activeBossBanner && <BossIntroBanner bossName={activeBossBanner.name} subtitle={activeBossBanner.subtitle} phaseNumber={activeBossBanner.phase} onDismiss={() => setActiveBossBanner(null)} />}
      {pendingSkillChoices.length > 0 && <SkillChoiceModal unit={pendingSkillChoices[0]} onChooseSkill={handleLearnSkillChoice} />}
      {(phase === 'victory' || phase === 'defeat') && currentLevel && pendingSkillChoices.length === 0 && (
        <VictoryDefeatModal
          isVictory={phase === 'victory'}
          levelNumber={currentLevel.id}
          summary={victorySummary || { xpGained: currentLevel.rewards.xpPerUnit, goldGained: currentLevel.rewards.gold, survivingUnits: [], levelUps: [] }}
          hasNextLevel={currentLevel.id < LEVELS.length}
          onNextLevel={() => startLevel(currentLevel.id + 1)}
          onRetry={() => startLevel(currentLevel.id)}
          onGoToMenu={() => setCurrentView('level_select')}
        />
      )}
    </div>
  );
}

export default App;
