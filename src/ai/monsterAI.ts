import type { Skill, TileData, Unit, Point } from '../types/game';
import { calculateBaseDamage } from '../utils/damage';
import { getAttackableTiles, getReachableTiles, manhattanDistance } from '../utils/pathfinding';

export interface AIActionChoice {
  monster: Unit;
  moveTo: Point;
  targetUnit?: Unit;
  skillToUse?: Skill;
  estimatedDamage: number;
  isKill: boolean;
  telegraphHazardTiles?: Point[]; // Danger tiles for next turn telegraphing
}

export function decideMonsterAction(
  monster: Unit,
  grid: TileData[][],
  allUnits: Unit[]
): AIActionChoice | null {
  if (monster.isDead) return null;

  const playerUnits = allUnits.filter((u) => u.faction === 'player' && !u.isDead);
  if (playerUnits.length === 0) return null;

  const allyMonsters = allUnits.filter((u) => u.faction === 'enemy' && !u.isDead);
  const role = monster.monsterRole || 'attacker';

  const reachableTiles = getReachableTiles(monster, grid, allUnits);
  reachableTiles.push({ x: monster.x, y: monster.y });

  let bestChoice: AIActionChoice | null = null;
  let highestScore = -Infinity;

  // Boss Phase Checks
  const activeSkills = monster.skills;

  // Devorador Phase 2 (<50% HP)
  if (monster.isMiniBoss && monster.currentHp / monster.maxHp <= 0.5) {
    monster.bossPhase = 2;
  }
  // Astaroth Boss Phases
  if (monster.isBoss) {
    const hpRatio = monster.currentHp / monster.maxHp;
    if (hpRatio <= 0.3) {
      monster.bossPhase = 3;
    } else if (hpRatio <= 0.65) {
      monster.bossPhase = 2;
    } else {
      monster.bossPhase = 1;
    }
  }

  for (const moveTile of reachableTiles) {
    const availableActions: { skill?: Skill; rangeMin: number; rangeMax: number }[] = [
      { skill: undefined, rangeMin: 1, rangeMax: monster.range },
    ];

    activeSkills.forEach((sk) => {
      if (sk.currentCooldown === 0) {
        availableActions.push({ skill: sk, rangeMin: sk.rangeMin, rangeMax: sk.rangeMax });
      }
    });

    for (const act of availableActions) {
      // 1. SELF-TARGET ACTIONS (Buffs, Self-Shield, Self-Heal)
      if (act.skill && act.skill.targetType === 'self') {
        let score = -100;
        const effect = act.skill.statusEffect;
        const hasActiveShield = monster.statusEffects?.some((e) => e.type === 'shield' && e.value > 0);
        const hasActiveBuff = monster.statusEffects?.some((e) => e.type === 'buff_atk' && e.duration > 0);
        const hpRatio = monster.currentHp / monster.maxHp;

        if (effect?.type === 'shield') {
          // Never recast shield if unit already has active shield
          if (!hasActiveShield) {
            if (role === 'tank') {
              score = 220; // Tanks prioritize establishing their shield
            } else if (role === 'support') {
              score = hpRatio < 0.6 ? 180 : 70;
            } else {
              // Attacker only shields if hurt
              score = hpRatio < 0.5 ? 130 : 40;
            }
          }
        } else if (effect?.type === 'buff_atk') {
          // Never recast attack buff if already active
          if (!hasActiveBuff) {
            if (role === 'attacker') {
              score = 110; // Decent priority, but attacking an enemy directly scores 250+
            } else if (role === 'support') {
              score = 80;
            } else {
              score = 60;
            }
          }
        } else if (act.skill.damageType === 'healing') {
          if (hpRatio < 0.8) {
            const missingRatio = 1 - hpRatio;
            score = 120 + missingRatio * 200;
          }
        }

        const moveDist = manhattanDistance({ x: monster.x, y: monster.y }, moveTile);
        score -= moveDist * 2;

        if (score > highestScore) {
          highestScore = score;
          bestChoice = {
            monster,
            moveTo: moveTile,
            targetUnit: monster,
            skillToUse: act.skill,
            estimatedDamage: 0,
            isKill: false,
          };
        }
        continue;
      }

      const attackableTiles = getAttackableTiles(
        moveTile,
        act.rangeMin,
        act.rangeMax,
        grid[0].length,
        grid.length
      );

      // 2. ALLY-TARGET ACTIONS (Heals, Shields, Buffs to allies)
      if (act.skill && act.skill.targetType === 'ally') {
        for (const ally of allyMonsters) {
          const inRange = attackableTiles.some((t) => t.x === ally.x && t.y === ally.y);
          if (!inRange) continue;

          let allyScore = -100;
          const allyHpRatio = ally.currentHp / ally.maxHp;
          const allyHasShield = ally.statusEffects?.some((e) => e.type === 'shield' && e.value > 0);
          const allyHasBuff = ally.statusEffects?.some((e) => e.type === 'buff_atk' && e.duration > 0);
          const effect = act.skill.statusEffect;

          if (act.skill.damageType === 'healing') {
            if (allyHpRatio < 0.85) {
              const missingRatio = 1 - allyHpRatio;
              allyScore = (role === 'support' ? 320 : 180) * missingRatio + 120;
              if (ally.isBoss || ally.isMiniBoss) allyScore += 80;
            }
          } else if (effect?.type === 'shield') {
            if (!allyHasShield) {
              allyScore = role === 'support' ? 240 : 100;
              if (allyHpRatio < 0.7) allyScore += 60;
            }
          } else if (effect?.type === 'buff_atk') {
            if (!allyHasBuff) {
              allyScore = role === 'support' ? 210 : 90;
              if (ally.monsterRole === 'attacker') allyScore += 40;
            }
          }

          const moveDist = manhattanDistance({ x: monster.x, y: monster.y }, moveTile);
          allyScore -= moveDist * 2;

          if (allyScore > highestScore) {
            highestScore = allyScore;
            bestChoice = {
              monster,
              moveTo: moveTile,
              targetUnit: ally,
              skillToUse: act.skill,
              estimatedDamage: 0,
              isKill: false,
            };
          }
        }
        continue;
      }

      // 3. ENEMY-TARGET ACTIONS (Attacks, offensive skills, debuffs on player units)
      for (const target of playerUnits) {
        const inRange = attackableTiles.some((t) => t.x === target.x && t.y === target.y);
        if (!inRange) continue;

        const { base: damage } = calculateBaseDamage(
          { ...monster, x: moveTile.x, y: moveTile.y },
          target,
          act.skill
        );

        const isKill = target.currentHp - damage <= 0;

        let score = damage * 2;
        if (isKill) score += 600;

        const hpPercent = (target.currentHp / target.maxHp) * 100;
        score += (100 - hpPercent) * 2;

        if (act.skill) {
          score += 60;
          if (act.skill.statusEffect) score += 70;
          if (act.skill.aoeRadius && act.skill.aoeRadius > 0) {
            for (const other of playerUnits) {
              if (other.id === target.id) continue;
              if (
                Math.abs(other.x - target.x) <= act.skill.aoeRadius &&
                Math.abs(other.y - target.y) <= act.skill.aoeRadius
              ) {
                const { base: splashDmg } = calculateBaseDamage(
                  { ...monster, x: moveTile.x, y: moveTile.y },
                  other,
                  act.skill
                );
                score += splashDmg * 1.5 + 90;
              }
            }
          }
        }

        // Target squishies
        if (target.className === 'mago' || target.className === 'curandeiro') {
          score += 45;
        }

        // Role based attack modifiers
        if (role === 'attacker') {
          score += 180; // Attackers have strong urge to attack player
        } else if (role === 'tank') {
          score += 60;
        }

        const moveDist = manhattanDistance({ x: monster.x, y: monster.y }, moveTile);
        score -= moveDist * 2;

        if (score > highestScore) {
          highestScore = score;
          bestChoice = {
            monster,
            moveTo: moveTile,
            targetUnit: target,
            skillToUse: act.skill,
            estimatedDamage: damage,
            isKill,
          };
        }
      }
    }
  }

  // If no target can be reached, move closer to nearest player unit
  if (!bestChoice) {
    let closestTarget: Unit | null = null;
    let minDist = Infinity;

    playerUnits.forEach((p) => {
      const d = manhattanDistance({ x: monster.x, y: monster.y }, { x: p.x, y: p.y });
      if (d < minDist) {
        minDist = d;
        closestTarget = p;
      }
    });

    if (closestTarget) {
      const targetUnit: Unit = closestTarget;
      let bestMoveTile = { x: monster.x, y: monster.y };
      let bestMoveDist = manhattanDistance(bestMoveTile, { x: targetUnit.x, y: targetUnit.y });

      // Support monsters prefer to maintain casting distance (2-3 tiles away),
      // while attackers and tanks aggressively close the gap
      const desiredDist = role === 'support' ? 2 : 1;
      let bestDiff = Math.abs(bestMoveDist - desiredDist);

      for (const t of reachableTiles) {
        const d = manhattanDistance(t, { x: targetUnit.x, y: targetUnit.y });
        const diff = Math.abs(d - desiredDist);
        if (diff < bestDiff || (diff === bestDiff && d < bestMoveDist)) {
          bestDiff = diff;
          bestMoveDist = d;
          bestMoveTile = t;
        }
      }

      bestChoice = {
        monster,
        moveTo: bestMoveTile,
        estimatedDamage: 0,
        isKill: false,
      };
    }
  }

  return bestChoice;
}
