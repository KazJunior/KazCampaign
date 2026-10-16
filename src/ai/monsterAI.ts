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

  const reachableTiles = getReachableTiles(monster, grid, allUnits);
  reachableTiles.push({ x: monster.x, y: monster.y });

  let bestChoice: AIActionChoice | null = null;
  let highestScore = -Infinity;

  // Boss Phase Checks
  let activeSkills = monster.skills;

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
      const attackableTiles = getAttackableTiles(
        moveTile,
        act.rangeMin,
        act.rangeMax,
        grid[0].length,
        grid.length
      );

      // Self target skills (e.g. Carapaça de Ferro shield)
      if (act.skill && act.skill.targetType === 'self') {
        let score = 120;
        if (monster.currentHp / monster.maxHp < 0.6) score += 100;
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

      for (const target of playerUnits) {
        const inRange = attackableTiles.some((t) => t.x === target.x && t.y === target.y);
        if (!inRange) continue;

        const { base: damage } = calculateBaseDamage(
          { ...monster, x: moveTile.x, y: moveTile.y },
          target,
          act.skill
        );

        const isKill = target.currentHp - damage <= 0;

        let score = damage;
        if (isKill) score += 500;

        const hpPercent = (target.currentHp / target.maxHp) * 100;
        score += (100 - hpPercent) * 2;

        if (act.skill) score += 50;

        if (target.className === 'mago' || target.className === 'curandeiro') {
          score += 30;
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

      for (const t of reachableTiles) {
        const d = manhattanDistance(t, { x: targetUnit.x, y: targetUnit.y });
        if (d < bestMoveDist) {
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
