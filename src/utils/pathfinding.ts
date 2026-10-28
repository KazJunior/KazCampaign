import type { Point, Skill, TileData, Unit, AoEType } from '../types/game';

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

  // Slow reduces movement points by slow penalty value (minimum 1 tile remaining)
  const slowEffect = unit.statusEffects?.find((e) => e.type === 'slow' && e.duration > 0);
  const slowPenalty = slowEffect ? (slowEffect.value ?? 1) : 0;
  const buffMovEffect = unit.statusEffects?.find((e) => e.type === 'buff_mov' && e.duration > 0);
  const movBonus = buffMovEffect ? (buffMovEffect.value ?? 1) : 0;
  const effectiveMov = Math.min(4, Math.max(1, (unit.mov + movBonus) - slowPenalty));

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

/**
 * Calculates a map of shortest walkable path distances (BFS) from a target tile
 * to all reachable tiles on the grid, correctly navigating around terrain obstacles.
 */
export function getGridDistanceMap(
  target: Point,
  grid: TileData[][]
): Map<string, number> {
  const width = grid[0].length;
  const height = grid.length;
  const distMap = new Map<string, number>();

  if (isOutOfBounds(target.x, target.y, width, height)) {
    return distMap;
  }

  const queue: { x: number; y: number; dist: number }[] = [{ x: target.x, y: target.y, dist: 0 }];
  distMap.set(`${target.x},${target.y}`, 0);

  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const dir of directions) {
      const nx = curr.x + dir.x;
      const ny = curr.y + dir.y;

      if (isOutOfBounds(nx, ny, width, height)) continue;

      const key = `${nx},${ny}`;
      if (distMap.has(key)) continue;

      const tile = grid[ny][nx];
      if (tile.obstacle !== 'none') continue;

      distMap.set(key, curr.dist + 1);
      queue.push({ x: nx, y: ny, dist: curr.dist + 1 });
    }
  }

  return distMap;
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
      const dx = Math.abs(origin.x - x);
      const dy = Math.abs(origin.y - y);
      const dist = dx + dy;
      const isDiagonalAdjacent = dx === 1 && dy === 1;

      // Unidades corpo a corpo e habilidades de alcance 1 podem atacar na diagonal adjacente
      const inRange =
        (dist >= rangeMin && dist <= rangeMax) ||
        (rangeMin <= 1 && rangeMax >= 1 && isDiagonalAdjacent);

      if (inRange) {
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
  gridHeight: number,
  aoeType: AoEType = 'circle',
  originTile?: Point | null
): Point[] {
  if (aoeRadius <= 0) {
    if (!isOutOfBounds(targetTile.x, targetTile.y, gridWidth, gridHeight)) {
      return [{ x: targetTile.x, y: targetTile.y }];
    }
    return [];
  }

  const tileMap = new Map<string, Point>();
  const addTile = (x: number, y: number) => {
    if (!isOutOfBounds(x, y, gridWidth, gridHeight)) {
      tileMap.set(`${x},${y}`, { x, y });
    }
  };

  // Determine attack direction from origin to target
  let dirX = 0;
  let dirY = 0;
  if (originTile) {
    const diffX = targetTile.x - originTile.x;
    const diffY = targetTile.y - originTile.y;
    if (Math.abs(diffX) >= Math.abs(diffY)) {
      dirX = diffX >= 0 ? 1 : -1;
      dirY = 0;
    } else {
      dirX = 0;
      dirY = diffY >= 0 ? 1 : -1;
    }
  } else {
    // Default facing downwards if origin is unknown
    dirX = 0;
    dirY = 1;
  }
  const perpX = -dirY;
  const perpY = dirX;

  switch (aoeType) {
    case 'row': {
      // Horizontal line of tiles centered on target: e.g. for aoeRadius=1, 3 tiles horizontal
      for (let dx = -aoeRadius; dx <= aoeRadius; dx++) {
        addTile(targetTile.x + dx, targetTile.y);
      }
      break;
    }

    case 'column': {
      // Vertical line of tiles centered on target: e.g. for aoeRadius=1, 3 tiles vertical
      for (let dy = -aoeRadius; dy <= aoeRadius; dy++) {
        addTile(targetTile.x, targetTile.y + dy);
      }
      break;
    }

    case 'cross': {
      // Cross (+) shape centered on target
      addTile(targetTile.x, targetTile.y);
      for (let r = 1; r <= aoeRadius; r++) {
        addTile(targetTile.x + r, targetTile.y);
        addTile(targetTile.x - r, targetTile.y);
        addTile(targetTile.x, targetTile.y + r);
        addTile(targetTile.x, targetTile.y - r);
      }
      break;
    }

    case 'x_shape': {
      // X shape centered on target: all diagonals up to aoeRadius
      addTile(targetTile.x, targetTile.y);
      for (let r = 1; r <= aoeRadius; r++) {
        addTile(targetTile.x + r, targetTile.y + r);
        addTile(targetTile.x - r, targetTile.y + r);
        addTile(targetTile.x + r, targetTile.y - r);
        addTile(targetTile.x - r, targetTile.y - r);
      }
      break;
    }

    case 'long_cross': {
      // Cruz com cabo: 3 braços de raio padrão (laterais e retaguarda) e 1 braço estendido em +2 na direção do disparo
      addTile(targetTile.x, targetTile.y);
      // Braços perpendiculares (laterais)
      for (let p = 1; p <= aoeRadius; p++) {
        addTile(targetTile.x + p * perpX, targetTile.y + p * perpY);
        addTile(targetTile.x - p * perpX, targetTile.y - p * perpY);
      }
      // Braço traseiro (em direção à origem/retaguarda)
      for (let b = 1; b <= aoeRadius; b++) {
        addTile(targetTile.x - b * dirX, targetTile.y - b * dirY);
      }
      // Braço frontal estendido em +2 (penetração formando a cruz com cabo)
      for (let f = 1; f <= aoeRadius + 2; f++) {
        addTile(targetTile.x + f * dirX, targetTile.y + f * dirY);
      }
      break;
    }

    case 'line': {
      // Directional line penetrating along the attack axis
      if (originTile) {
        const diffProj = (targetTile.x - originTile.x) * dirX + (targetTile.y - originTile.y) * dirY;
        const kMin = Math.max(-aoeRadius, 1 - diffProj);
        const totalTiles = aoeRadius * 2 + 1;
        for (let i = 0; i < totalTiles; i++) {
          const k = kMin + i;
          addTile(targetTile.x + k * dirX, targetTile.y + k * dirY);
        }
      } else {
        for (let k = -aoeRadius; k <= aoeRadius; k++) {
          addTile(targetTile.x + k * dirX, targetTile.y + k * dirY);
        }
      }
      break;
    }

    case 'cone': {
      // Cone fanning outward in attack direction from origin towards target:
      const startX = originTile ? originTile.x : targetTile.x - dirX;
      const startY = originTile ? originTile.y : targetTile.y - dirY;

      // Fileira 1 (distância 1): 1 casa na frente do conjurador
      addTile(startX + dirX, startY + dirY);

      // Fileira 2 (distância 2): 3 casas (centro, +perp, -perp)
      const d2X = startX + 2 * dirX;
      const d2Y = startY + 2 * dirY;
      addTile(d2X, d2Y);
      addTile(d2X + perpX, d2Y + perpY);
      addTile(d2X - perpX, d2Y - perpY);

      // Fileira 3 (distância 3): 5 casas (centro, +-1 perp, +-2 perp)
      const d3X = startX + 3 * dirX;
      const d3Y = startY + 3 * dirY;
      for (let p = -2; p <= 2; p++) {
        addTile(d3X + p * perpX, d3Y + p * perpY);
      }

      // Se aoeRadius > 1, expande fileiras adicionais além da terceira
      if (aoeRadius > 1) {
        for (let dist = 4; dist <= 2 + aoeRadius; dist++) {
          const dX = startX + dist * dirX;
          const dY = startY + dist * dirY;
          const maxP = dist - 1;
          for (let p = -maxP; p <= maxP; p++) {
            addTile(dX + p * perpX, dY + p * perpY);
          }
        }
      }
      break;
    }

    case 'cleave': {
      // Frontal sweep / cleave: 3 tiles perpendicular to attack direction at target
      addTile(targetTile.x, targetTile.y);
      for (let p = 1; p <= aoeRadius; p++) {
        addTile(targetTile.x + p * perpX, targetTile.y + p * perpY);
        addTile(targetTile.x - p * perpX, targetTile.y - p * perpY);
      }
      break;
    }

    case 't_shape': {
      // T-shape: stem leading to target + perpendicular cap at target
      addTile(targetTile.x, targetTile.y);
      addTile(targetTile.x - dirX, targetTile.y - dirY);
      for (let p = 1; p <= aoeRadius; p++) {
        addTile(targetTile.x + p * perpX, targetTile.y + p * perpY);
        addTile(targetTile.x - p * perpX, targetTile.y - p * perpY);
      }
      break;
    }
    case 'rect_3x2': {
      // 3 casas de largura perpendicular por 2 casas de profundidade na direção do golpe (Horizonte Vazio)
      for (let d = 0; d < 2; d++) {
        for (let p = -1; p <= 1; p++) {
          addTile(targetTile.x + d * dirX + p * perpX, targetTile.y + d * dirY + p * perpY);
        }
      }
      break;
    }
    case 'square_5x5': {
      // Quadrado 5x5 ao redor do alvo / conjurador (Lágrimas Rubras)
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          addTile(targetTile.x + dx, targetTile.y + dy);
        }
      }
      break;
    }

    case 'circle':
    default: {
      for (let dy = -aoeRadius; dy <= aoeRadius; dy++) {
        for (let dx = -aoeRadius; dx <= aoeRadius; dx++) {
          addTile(targetTile.x + dx, targetTile.y + dy);
        }
      }
      break;
    }
  }

  return Array.from(tileMap.values());
}

export function getAoELabel(skill?: Skill | null): string {
  if (!skill || !skill.aoeRadius || skill.aoeRadius === 0) return 'Alvo Único';
  switch (skill.aoeType) {
    case 'row':
      return `Linha Horizontal de ${skill.aoeRadius * 2 + 1}`;
    case 'column':
      return `Coluna Vertical de ${skill.aoeRadius * 2 + 1}`;
    case 'line':
      return `Linha Reta (${skill.aoeRadius * 2 + 1} casas)`;
    case 'cone':
      return 'Cone Frontal (3 Fileiras)';
    case 'rect_3x2':
      return 'Corte Amplo (3 Linhas x 2 Colunas)';
    case 'square_5x5':
      return 'Área Massiva 5x5';
    case 'cross':
      return skill.aoeRadius > 1 ? `Cruz Grande (+${skill.aoeRadius * 2 + 1})` : 'Cruz (+)';
    case 'long_cross':
      return 'Cruz com Cabo';
    case 'cleave':
      return 'Varredura (3 casas)';
    case 't_shape':
      return 'Formato em T';
    case 'circle':
    default: {
      const dim = skill.aoeRadius * 2 + 1;
      return skill.canTargetGround ? `Área ${dim}x${dim} (Solo)` : `Área ${dim}x${dim}`;
    }
  }
}

export function getValidTargets(
  attacker: Unit,
  skill: Skill | undefined,
  allUnits: Unit[]
): Unit[] {
  if (attacker.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0)) {
    return [];
  }

  const rangeMin = skill ? skill.rangeMin : 1;
  const rangeMax = skill ? skill.rangeMax : attacker.range;
  const targetType = skill ? skill.targetType : 'enemy';

  return allUnits.filter((target) => {
    if (target.isDead) return false;

    if (targetType === 'enemy' && target.faction === attacker.faction) return false;
    if (targetType === 'ally' && target.faction !== attacker.faction) return false;

    const dx = Math.abs(attacker.x - target.x);
    const dy = Math.abs(attacker.y - target.y);
    const dist = dx + dy;
    const isDiagonalAdjacent = dx === 1 && dy === 1;

    const isSelfHealOrBuff =
      target.id === attacker.id &&
      (targetType === 'self' || (targetType === 'ally' && rangeMin <= 0));

    const inRange =
      isSelfHealOrBuff ||
      (dist >= rangeMin && dist <= rangeMax) ||
      (rangeMin <= 1 && rangeMax >= 1 && isDiagonalAdjacent);

    return inRange;
  });
}

