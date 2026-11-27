import type { Point, PowderBarrelVariant, Skill, StatusEffect, Unit } from '../types/game';
import { getAoETiles } from './pathfinding';

export const MAX_POWDER_BARRELS_PER_OWNER = 3;
export const DEFAULT_BARREL_CHAIN_RANGE = 2;
export const BARREL_BLAST_RADIUS = 1;
export const BARREL_LIFETIME_TURNS = 4;
export const BARREL_CHAIN_ESCALATION_PERCENT = 10;
export const MAX_BARREL_CHAIN_ESCALATION_PERCENT = 30;
export const BARREL_OVERLAP_DAMAGE_MULTIPLIER = 0.45;

export interface BarrelVariantMeta {
  variant: PowderBarrelVariant;
  name: string;
  avatarKey: string;
  color: string;
  emoji: string;
  defaultPower: number;
  blastRadius: number;
  ignoresShield?: boolean;
  defenseIgnoreRatio: number;
  pullRadius?: number;
  statusEffect?: StatusEffect;
  shortTag: string;
}

export const BARREL_VARIANT_META: Record<PowderBarrelVariant, BarrelVariantMeta> = {
  standard: {
    variant: 'standard',
    name: 'Barril de Pólvora',
    avatarKey: 'barril_polvora',
    color: '#EA580C',
    emoji: '🛢️',
    defaultPower: 1.25,
    blastRadius: 1,
    defenseIgnoreRatio: 0.15,
    shortTag: 'Explosão 3×3 (Ignora 15% Armadura)',
  },
  shrapnel: {
    variant: 'shrapnel',
    name: 'Barril de Estilhaços',
    avatarKey: 'barril_polvora_shrapnel',
    color: '#F59E0B',
    emoji: '💣',
    defaultPower: 1.35,
    blastRadius: 1,
    ignoresShield: true,
    defenseIgnoreRatio: 0.2,
    statusEffect: { type: 'debuff_def', duration: 2, value: 20 },
    shortTag: 'Ignora Escudos + Quebra Defesa (-20% 2T)',
  },
  gravity: {
    variant: 'gravity',
    name: 'Barril Gravitacional',
    avatarKey: 'barril_polvora_gravity',
    color: '#A855F7',
    emoji: '🌀',
    defaultPower: 1.3,
    blastRadius: 1,
    defenseIgnoreRatio: 0.15,
    pullRadius: 2,
    statusEffect: { type: 'silence', duration: 1, value: 1 },
    shortTag: 'Puxa Inimigos (Raio 2) + Silêncio (1T)',
  },
};

export function isPowderBarrelUnit(unit?: Unit | null): boolean {
  if (!unit) return false;
  return Boolean(unit.isPowderBarrel || unit.avatarKey?.startsWith('barril_polvora'));
}

export function getBarrelVariantMeta(variant?: PowderBarrelVariant): BarrelVariantMeta {
  return BARREL_VARIANT_META[variant || 'standard'] || BARREL_VARIANT_META.standard;
}

export function createPowderBarrelUnit(
  owner: Unit,
  x: number,
  y: number,
  variant: PowderBarrelVariant,
  power: number | undefined,
  turnNumber: number,
  suffix: number = 0
): Unit {
  const meta = getBarrelVariantMeta(variant);
  const effectivePower = power && power > 0 ? power : meta.defaultPower;

  return {
    id: `barrel_${variant}_${owner.id}_${Date.now()}_${suffix}_${Math.floor(Math.random() * 1000)}`,
    name: meta.name,
    className: 'Barril de Pólvora',
    faction: 'player',
    isSummoned: true,
    isUntargetable: true,
    isPowderBarrel: true,
    barrelVariant: variant,
    barrelPower: effectivePower,
    summonTurnsLeft: BARREL_LIFETIME_TURNS,
    summonedByUnitId: owner.id,
    // Não define summonedBySkillId para não travar o cooldown da habilidade enquanto o barril existir
    level: owner.level,
    xp: 0,
    maxXp: 100,
    maxHp: 1,
    currentHp: 1,
    atk: owner.atk,
    mag: 0,
    def: 0,
    res: 0,
    mov: 0,
    range: 0,
    x,
    y,
    hasMoved: true,
    hasAttacked: true,
    isDead: false,
    color: meta.color,
    avatarKey: meta.avatarKey,
    skills: [],
    learnedSkillIds: [],
    statusEffects: [
      {
        type: 'summon_lifetime',
        duration: BARREL_LIFETIME_TURNS,
        value: BARREL_LIFETIME_TURNS,
        appliedTurn: turnNumber,
      },
    ],
    damageDealt: 0,
    kills: 0,
  };
}

/**
 * Garante o limite máximo de barris simultâneos por Canhoneiro,
 * removendo os barris mais antigos caso o novo posicionamento exceda o teto.
 */
export function enforceBarrelLimit(
  units: Unit[],
  ownerId: string,
  incomingCount: number = 1,
  maxBarrels: number = MAX_POWDER_BARRELS_PER_OWNER
): { units: Unit[]; removedBarrels: Unit[] } {
  const ownerBarrels = units.filter(
    (u) => !u.isDead && isPowderBarrelUnit(u) && u.summonedByUnitId === ownerId
  );
  const overflow = ownerBarrels.length + incomingCount - maxBarrels;
  if (overflow <= 0) {
    return { units, removedBarrels: [] };
  }

  const toRemove = ownerBarrels.slice(0, overflow);
  const removeIds = new Set(toRemove.map((b) => b.id));

  const nextUnits = units.map((u) =>
    removeIds.has(u.id)
      ? { ...u, currentHp: 0, isDead: true, summonTurnsLeft: 0, statusEffects: [] }
      : u
  );

  return { units: nextUnits, removedBarrels: toRemove };
}

export interface BarrelChainPreview {
  chainBarrels: Unit[];
  blastTiles: Point[];
  enemiesHitIds: string[];
  estimatedDamage: number;
}

/**
 * Simula em BFS toda a reação em cadeia a partir de um conjunto inicial de barris,
 * retornando os barris detonados, todos os ladrilhos da explosão e os inimigos atingidos.
 */
export function previewBarrelChain(
  units: Unit[],
  initialBarrelIds: string[],
  caster: Unit,
  gridWidth: number,
  gridHeight: number,
  chainRange: number = DEFAULT_BARREL_CHAIN_RANGE,
  bonusDamagePercent: number = 0
): BarrelChainPreview {
  if (initialBarrelIds.length === 0 || gridWidth <= 0 || gridHeight <= 0) {
    return { chainBarrels: [], blastTiles: [], enemiesHitIds: [], estimatedDamage: 0 };
  }

  const livingBarrels = units.filter((u) => !u.isDead && isPowderBarrelUnit(u));
  const visited = new Set<string>();
  const queue: Unit[] = [];

  for (const id of initialBarrelIds) {
    const found = livingBarrels.find((b) => b.id === id);
    if (found && !visited.has(found.id)) {
      visited.add(found.id);
      queue.push(found);
    }
  }

  const chainBarrels: Unit[] = [];
  const blastTileMap = new Map<string, Point>();

  while (queue.length > 0) {
    const barrel = queue.shift()!;
    chainBarrels.push(barrel);
    const meta = getBarrelVariantMeta(barrel.barrelVariant);
    const tiles = getAoETiles({ x: barrel.x, y: barrel.y }, meta.blastRadius, gridWidth, gridHeight, 'circle', null);
    for (const pt of tiles) {
      blastTileMap.set(`${pt.x},${pt.y}`, pt);
    }

    // Enfileira outros barris dentro do alcance de reação em cadeia (distância de Chebyshev)
    for (const other of livingBarrels) {
      if (visited.has(other.id)) continue;
      const chebyshevDist = Math.max(Math.abs(other.x - barrel.x), Math.abs(other.y - barrel.y));
      if (chebyshevDist <= chainRange) {
        visited.add(other.id);
        queue.push(other);
      }
    }
  }

  const blastTiles = Array.from(blastTileMap.values());
  const enemiesHit = units.filter(
    (u) =>
      u.faction === 'enemy' &&
      !u.isDead &&
      blastTiles.some((pt) => pt.x === u.x && pt.y === u.y)
  );

  // Dano estimado médio de um barril (levando em conta ATK + buff_atk + bônus)
  let effectiveAtk = caster.atk || 25;
  const atkBuff = caster.statusEffects?.find((e) => e.type === 'buff_atk' && e.duration > 0);
  if (atkBuff) {
    effectiveAtk = Math.round(effectiveAtk * (1 + atkBuff.value / 100));
  }
  const firstBarrel = chainBarrels[0];
  const basePower = firstBarrel?.barrelPower || getBarrelVariantMeta(firstBarrel?.barrelVariant).defaultPower;
  const chainEscalation = Math.min(
    MAX_BARREL_CHAIN_ESCALATION_PERCENT,
    Math.max(0, chainBarrels.length - 1) * BARREL_CHAIN_ESCALATION_PERCENT
  );
  const chainPeakBonus = chainEscalation + bonusDamagePercent;
  const estimatedDamage = Math.max(1, Math.round(effectiveAtk * basePower * (1 + chainPeakBonus / 100)));

  return {
    chainBarrels,
    blastTiles,
    enemiesHitIds: enemiesHit.map((e) => e.id),
    estimatedDamage,
  };
}

/**
 * Cria um objeto Skill sintético para disparar o VFX explosivo de um barril no BoardRenderer3D.
 */
export function buildBarrelExplosionVfxSkill(barrel: Unit, chainIndex: number): Skill {
  const variant = barrel.barrelVariant || 'standard';
  const id =
    variant === 'gravity'
      ? 'morteiro_incendiario'
      : variant === 'shrapnel'
        ? 'tiro_perfura_blindagem'
        : chainIndex > 0
          ? 'barragem_de_artilharia'
          : 'bala_explosiva';
  const meta = getBarrelVariantMeta(variant);

  return {
    id,
    name: meta.name,
    description: meta.shortTag,
    damageType: 'physical',
    category: 'attack',
    power: barrel.barrelPower || meta.defaultPower,
    rangeMin: 0,
    rangeMax: 5,
    aoeRadius: meta.blastRadius,
    aoeType: 'circle',
    canTargetGround: true,
    cooldownMax: 0,
    currentCooldown: 0,
    targetType: 'enemy',
    iconName: 'Flame',
  };
}

