import type { Point, TileData, Unit } from '../types/game';

export const CAVALRY_MOMENTUM_PERCENT_PER_TILE = 6;
export const MAX_CAVALRY_MOMENTUM_TILES = 4; // Máximo de +24% de dano por galope no turno

export function isCavalryKnight(unit?: Unit | null): boolean {
  if (!unit) return false;
  return unit.className === 'cavaleiro' || unit.avatarKey === 'cavaleiro';
}

export function getCavalryMomentumPercent(unit?: Unit | null, extraTiles: number = 0): number {
  if (!isCavalryKnight(unit)) return 0;
  const totalTiles = Math.min(
    MAX_CAVALRY_MOMENTUM_TILES,
    Math.max(0, (unit?.cavalryMomentumTiles || 0) + Math.max(0, extraTiles))
  );
  return totalTiles * CAVALRY_MOMENTUM_PERCENT_PER_TILE;
}

/**
 * Retorna todas as casas livres alcançáveis em linha reta cardinal (N, S, L, O) para Atropelamento Real.
 * O Cavaleiro pode atravessar inimigos e aliados pelo caminho, mas é barrado por terrenos/obstáculos intransitáveis
 * e precisa pousar em uma casa livre e caminhável.
 */
export function getTrampleLineCandidates(
  origin: Point,
  rangeMin: number,
  rangeMax: number,
  grid: TileData[][],
  units: Unit[]
): Point[] {
  const height = grid.length;
  const width = grid[0]?.length || 0;
  if (width === 0 || height === 0) return [];

  const dirs: Point[] = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  const validLandings: Point[] = [];

  for (const d of dirs) {
    for (let step = 1; step <= rangeMax; step++) {
      const nx = origin.x + d.x * step;
      const ny = origin.y + d.y * step;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) break;
      const tile = grid[ny]?.[nx];
      if (!tile || !tile.isWalkable) break; // Obstáculo sólido bloqueia a galopada

      if (step >= rangeMin) {
        const occupied = units.some((u) => !u.isDead && u.x === nx && u.y === ny);
        if (!occupied) {
          validLandings.push({ x: nx, y: ny });
        }
      }
    }
  }

  return validLandings;
}

/**
 * Retorna todas as casas percorridas em linha reta entre origin (excluso) e dest (incluso).
 */
export function getTramplePathTiles(origin: Point, dest: Point): Point[] {
  const dx = dest.x - origin.x;
  const dy = dest.y - origin.y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  if (steps === 0) return [];

  const stepX = Math.sign(dx);
  const stepY = Math.sign(dy);
  const tiles: Point[] = [];
  for (let i = 1; i <= steps; i++) {
    tiles.push({ x: origin.x + stepX * i, y: origin.y + stepY * i });
  }
  return tiles;
}

/**
 * Encontra a casa livre e caminhável adjacente mais próxima de `anchor` (priorizando cardinais),
 * usada para descer o aliado resgatado pela Garupa do Corcel ao lado do Cavaleiro.
 */
export function findNearestSafeAdjacentTile(
  anchor: Point,
  grid: TileData[][],
  units: Unit[],
  excludeIds: string[] = []
): Point | null {
  const height = grid.length;
  const width = grid[0]?.length || 0;
  const candidates: Point[] = [
    { x: anchor.x - 1, y: anchor.y },
    { x: anchor.x + 1, y: anchor.y },
    { x: anchor.x, y: anchor.y + 1 },
    { x: anchor.x, y: anchor.y - 1 },
    { x: anchor.x - 1, y: anchor.y + 1 },
    { x: anchor.x + 1, y: anchor.y + 1 },
    { x: anchor.x - 1, y: anchor.y - 1 },
    { x: anchor.x + 1, y: anchor.y - 1 },
  ];

  for (const pt of candidates) {
    if (pt.x < 0 || pt.x >= width || pt.y < 0 || pt.y >= height) continue;
    if (!grid[pt.y]?.[pt.x]?.isWalkable) continue;
    const occupied = units.some(
      (u) => !u.isDead && !excludeIds.includes(u.id) && u.x === pt.x && u.y === pt.y
    );
    if (!occupied) return pt;
  }

  return null;
}

