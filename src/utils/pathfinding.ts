import type { Point, Skill, TileData, Unit } from '../types/game';

export type { Point };

export function manhattanDistance(p1: Point, p2: Point): number {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

export function isOutOfBounds(x: number, y: number, width: number, height: number): boolean {
  return x < 0 || y < 0 || x >= width || y >= height;
}

export function getReachableTiles(
  unit: Unit,
  grid: TileData[][],
  units: Unit[]
): Point[] {
  const width = grid[0].length;
  const height = grid.length;

  const reachable: Point[] = [];
  const visited = new Set<string>();
  const queue: { x: number; y: number; cost: number }[] = [{ x: unit.x, y: unit.y, cost: 0 }];

  visited.add(`${unit.x},${unit.y}`);

  const unitPositions = new Map<string, Unit>();
  units.forEach((u) => {
    if (!u.isDead) {
      unitPositions.set(`${u.x},${u.y}`, u);
    }
  });

  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  // Stun prevents all movement
  if (unit.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0)) {
    return [];
  }

  // Slow reduces movement points by 1 (minimum 1)
  const isSlowed = unit.statusEffects?.some((e) => e.type === 'slow' && e.duration > 0);
  const effectiveMov = isSlowed ? Math.max(1, unit.mov - 1) : unit.mov;

  while (queue.length > 0) {
    const curr = queue.shift()!;

    const occUnit = unitPositions.get(`${curr.x},${curr.y}`);
    if (!(curr.x === unit.x && curr.y === unit.y) && !occUnit) {
      reachable.push({ x: curr.x, y: curr.y });
    }

    if (curr.cost >= effectiveMov) continue;

    for (const dir of directions) {
      const nx = curr.x + dir.x;
      const ny = curr.y + dir.y;

      if (isOutOfBounds(nx, ny, width, height)) continue;

      const key = `${nx},${ny}`;
      if (visited.has(key)) continue;

      const tile = grid[ny][nx];
      if (tile.obstacle !== 'none') continue;

      const otherUnit = unitPositions.get(key);
      if (otherUnit && otherUnit.faction !== unit.faction) {
        continue;
      }

      visited.add(key);
      queue.push({ x: nx, y: ny, cost: curr.cost + 1 });
    }
  }

  return reachable;
}

export function getPathTo(
  start: Point,
  target: Point,
  grid: TileData[][],
  units: Unit[],
  unitFaction: 'player' | 'enemy'
): Point[] {
  const width = grid[0].length;
  const height = grid.length;

  const queue: Point[] = [start];
  const parent = new Map<string, string>();
  const visited = new Set<string>();

  visited.add(`${start.x},${start.y}`);

  const unitPositions = new Map<string, Unit>();
  units.forEach((u) => {
    if (!u.isDead) {
      unitPositions.set(`${u.x},${u.y}`, u);
    }
  });

  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  let found = false;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr.x === target.x && curr.y === target.y) {
      found = true;
      break;
    }

    for (const dir of directions) {
      const nx = curr.x + dir.x;
      const ny = curr.y + dir.y;

      if (isOutOfBounds(nx, ny, width, height)) continue;

      const key = `${nx},${ny}`;
      if (visited.has(key)) continue;

      const tile = grid[ny][nx];
      if (tile.obstacle !== 'none') continue;

      const occUnit = unitPositions.get(key);
      if (occUnit && occUnit.faction !== unitFaction && !(nx === target.x && ny === target.y)) {
        continue;
      }

      visited.add(key);
      parent.set(key, `${curr.x},${curr.y}`);
      queue.push({ x: nx, y: ny });
    }
  }

  if (!found) return [];

  const path: Point[] = [];
  let currKey = `${target.x},${target.y}`;
  while (currKey !== `${start.x},${start.y}`) {
    const [cx, cy] = currKey.split(',').map(Number);
    path.unshift({ x: cx, y: cy });
    currKey = parent.get(currKey)!;
  }
  return path;
}

export function getAttackableTiles(
  origin: Point,
  rangeMin: number,
  rangeMax: number,
  gridWidth: number,
  gridHeight: number
): Point[] {
  const tiles: Point[] = [];
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const dist = manhattanDistance(origin, { x, y });
      if (dist >= rangeMin && dist <= rangeMax) {
        tiles.push({ x, y });
      }
    }
  }
  return tiles;
}

export function getAoETiles(
  targetTile: Point,
  aoeRadius: number,
  gridWidth: number,
  gridHeight: number
): Point[] {
  const tiles: Point[] = [];
  for (let dy = -aoeRadius; dy <= aoeRadius; dy++) {
    for (let dx = -aoeRadius; dx <= aoeRadius; dx++) {
      const tx = targetTile.x + dx;
      const ty = targetTile.y + dy;
      if (!isOutOfBounds(tx, ty, gridWidth, gridHeight)) {
        tiles.push({ x: tx, y: ty });
      }
    }
  }
  return tiles;
}

export function getValidTargets(
  attacker: Unit,
  skill: Skill | undefined,
  allUnits: Unit[]
): Unit[] {
  const rangeMin = skill ? skill.rangeMin : 1;
  const rangeMax = skill ? skill.rangeMax : attacker.range;
  const targetType = skill ? skill.targetType : 'enemy';

  return allUnits.filter((target) => {
    if (target.isDead) return false;

    if (targetType === 'enemy' && target.faction === attacker.faction) return false;
    if (targetType === 'ally' && target.faction !== attacker.faction) return false;

    const dist = manhattanDistance({ x: attacker.x, y: attacker.y }, { x: target.x, y: target.y });
    return dist >= rangeMin && dist <= rangeMax;
  });
}
