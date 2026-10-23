export interface Point {
  x: number;
  y: number;
}

export type TerrainType = 'grass' | 'stone' | 'sand' | 'dirt' | 'water' | 'swamp' | 'void';
export type ObstacleType = 'none' | 'tree' | 'rock' | 'ruins' | 'shrine' | 'wall' | 'pillar' | 'thorns' | 'tombstone' | 'note';

export interface TileData {
  x: number;
  y: number;
  terrain: TerrainType;
  obstacle: ObstacleType;
  isWalkable: boolean;
  blocksVision: boolean;
  isTelegraphedHazard?: boolean; // Danger warning tile for boss AoE
}

export type UnitFaction = 'player' | 'enemy';

export type DamageType = 'physical' | 'magical' | 'healing';

export type SkillCategory = 'attack' | 'defense' | 'support' | 'passive';

export type StatusEffectType = 'poison' | 'burn' | 'stun' | 'slow' | 'shield' | 'buff_atk' | 'invisible' | 'debuff_def' | 'taunt' | 'excess_heal' | 'excess_shield';

export interface StatusEffect {
  type: StatusEffectType;
  duration: number;
  value: number;
  appliedTurn?: number; // Turno em que o efeito foi aplicado
  reflectRatio?: number; // Fração do dano absorvido pelo escudo refletida ao atacante (ex: 0.5 para 50%)
}

export type AoEType =
  | 'circle'
  | 'row'
  | 'column'
  | 'line'
  | 'cone'
  | 'cross'
  | 'long_cross'
  | 'cleave'
  | 't_shape';

export interface Skill {
  id: string;
  name: string;
  description: string;
  damageType: DamageType;
  category?: SkillCategory;
  power: number;
  rangeMin: number;
  rangeMax: number;
  aoeRadius: number;
  aoeType?: AoEType;
  cooldownMax: number;
  currentCooldown: number;
  lastUsedTurn?: number; // Turno em que a habilidade foi utilizada (o cooldown só reduz a partir do turno seguinte)
  targetType: 'enemy' | 'ally' | 'any' | 'self' | 'empty_tile';
  defenseIgnoreRatio?: number;
  requiredLevel?: number;
  statusEffect?: StatusEffect;
  secondaryStatusEffect?: StatusEffect;
  lifestealPercent?: number; // % of damage dealt converted to healing on caster (e.g. 100% for Dreno de Vida)
  isTeleport?: boolean; // Skill teleports caster to an empty tile
  teleportToTarget?: boolean; // Moves caster to adjacent tile next to target
  cleansesDebuffs?: boolean; // Removes debuffs from target ally
  canTargetGround?: boolean; // Allows targeting empty tiles on battlefield to damage enemies around (e.g. Meteoro)
  hpCostPercent?: number; // % of current HP sacrificed by caster to activate skill (Berserker)
  resetsActionOnKill?: boolean; // Kills reset caster's attack and move action immediately (Carrasco do Vazio)
  grantsExtraTurn?: boolean; // Grants target ally an immediate additional turn (Bardo)
  createsObstacle?: ObstacleType; // Spawns an obstacle on targeted tile (Mago de Gelo)
  knockback?: number; // Pushes hit targets back N tiles away from caster (Disparo de Impacto)
  casterStatusEffect?: StatusEffect; // Applies a status effect (e.g. shield, buff) to the caster upon using this skill
  scalesWithDefRes?: boolean; // Causa dano com base em 0.75 da armadura (defesa) + 0.75 da resistência
  iconName: string;
  isPassive?: boolean;
  level?: number; // Skill evolution level (1, 2, 3...)
}

export type MonsterRole = 'attacker' | 'support' | 'tank';

export interface Unit {
  id: string;
  name: string;
  className: string;
  faction: UnitFaction;
  monsterRole?: MonsterRole;
  level: number;
  xp: number;
  maxXp: number;
  
  maxHp: number;
  currentHp: number;
  atk: number;
  mag: number;
  def: number;
  res: number;
  mov: number;
  range: number;
  
  x: number;
  y: number;
  hasMoved: boolean;
  hasAttacked: boolean;
  isDead: boolean;
  
  color: string;
  avatarKey: string;
  
  skills: Skill[];
  learnedSkillIds: string[]; // List of IDs learned via level up choices
  skillLevels?: Record<string, number>; // Evolution levels per skill ID (1, 2, 3...)
  
  statusEffects: StatusEffect[];

  // Boss specific
  isBoss?: boolean;
  isMiniBoss?: boolean;
  bossPhase?: number; // 1, 2, 3
  lastStunTurn?: number; // Turno da batalha em que a unidade foi atordoada por último (impede stun em turnos consecutivos em chefes)

  damageDealt: number;
  kills: number;
  equippedItemIds?: string[];
}

export type ItemCategory = 'helmet' | 'chestplate' | 'leggings' | 'boots' | 'weapon' | 'accessory';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ItemStats {
  hp?: number;
  atk?: number;
  mag?: number;
  def?: number;
  res?: number;
  mov?: number;
  range?: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  description: string;
  iconName: string;
  color: string;
  stats: ItemStats;
  droppedByMonsterTypeIds: string[];
}

export interface EquipmentSlots {
  helmet?: string | null;
  chestplate?: string | null;
  leggings?: string | null;
  boots?: string | null;
  weapon?: string | null;
  accessory?: string | null;
}

export interface DamagePreview {
  attacker: Unit;
  target: Unit;
  isGroundTarget?: boolean;
  groundTargetPoint?: Point;
  skill?: Skill;
  minDamage: number;
  maxDamage: number;
  avgDamage: number;
  targetCurrentHp: number;
  targetHpAfterMin: number;
  targetHpAfterMax: number;
  isKillLikely: boolean;
  damageType: DamageType;
  aoeTargetsCount?: number;
}

export interface FloatingNumber {
  id: string;
  x: number;
  y: number;
  value: string | number;
  type: DamageType | 'miss' | 'status' | 'shield';
  color: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  environment: 'forest' | 'ruins' | 'cave' | 'fortress' | 'swamp' | 'tomb' | 'citadel' | 'abyss' | 'shrine';
  width: number;
  height: number;
  description: string;
  objectives: string[];
  grid: { terrain: TerrainType; obstacle: ObstacleType }[][];
  deploymentZone: { x: number; y: number }[];
  enemySpawns: {
    monsterTypeId: string;
    x: number;
    y: number;
    levelOffset?: number;
    isBoss?: boolean;
    isMiniBoss?: boolean;
  }[];
  rewards: {
    gold: number;
    xpPerUnit: number;
  };
  hasMiniBoss?: boolean;
  hasFinalBoss?: boolean;
}

export type StatType = 'hp' | 'atk' | 'mag' | 'def' | 'res';

export type UnitProgression = {
  className: string;
  level: number;
  xp: number;
  bonusAtk: number;
  bonusDef: number;
  bonusHp: number;
  bonusMag?: number;
  bonusRes?: number;
  learnedSkillIds: string[];
  skillLevels?: Record<string, number>;
};

export interface AdventureRecord {
  id: string;
  startedAt: string;
  endedAt: string;
  farthestLevel: number;
  farthestLevelName: string;
  result: 'victory' | 'defeat';
  partyClasses: string[];
  goldEarned: number;
}

export interface ActiveBattleState {
  levelId: number;
  turnNumber: number;
  phase: BattlePhase;
  units: Unit[];
  activeBossBanner?: { name: string; subtitle: string; phase?: number } | null;
}

export interface ActiveAdventure {
  currentLevelId: number;
  partyClasses: string[];
  startedAt: string;
  goldEarnedInRun: number;
  unitsState: Record<string, UnitProgression>;
  inventory?: string[]; // Item IDs currently held in this run
  equipment?: Record<string, EquipmentSlots>; // ClassName -> EquipmentSlots
  battleState?: ActiveBattleState | null;
}

export interface PlayerProgress {
  version: number; // Save schema version (v4)
  unlockedLevel: number;
  completedLevels: number[];
  gold: number; // Persistent gold kept across all runs
  unlockedClasses: string[]; // Persistent unlocked playable class names
  selectedPartyClasses: string[]; // Current 4 classes
  unitsState: Record<string, {
    className: string;
    level: number;
    xp: number;
    bonusAtk: number;
    bonusDef: number;
    bonusHp: number;
    bonusMag?: number;
    bonusRes?: number;
    learnedSkillIds: string[];
    skillLevels?: Record<string, number>;
  }>;
  combatSpeed: 'normal' | 'fast';
  highScore: number;

  // Roguelike & Collection systems:
  activeAdventure: ActiveAdventure | null; // Null if no run is currently underway
  discoveredMonsterIds: string[]; // Discovered monsters for bestiary
  discoveredItemIds?: string[]; // Discovered items for item catalog
  adventureHistory: AdventureRecord[]; // Up to 10 last finished adventures

  // Base & Meta-progression systems:
  classUpgrades?: Record<string, number>; // className -> level (0..5)
  generalUpgrades?: Record<string, number>; // upgradeId -> level (0..3)
  itemUpgrades?: Record<string, number>; // itemId -> level (0..3, +5% stat per level)

  // Pets & Eggs system:
  unlockedPetIds?: string[]; // IDs of unlocked pets in the Pet Almanac
  equippedPetId?: string | null; // ID of currently equipped pet
  eggs?: PetEgg[]; // Up to 20 eggs in egg inventory/nest
}

export type PetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface PetPassiveEffect {
  id: string;
  name: string;
  description: string;
  type: 'stat_boost' | 'gold_boost' | 'shield_start' | 'hp_regen';
  stat?: 'hp' | 'atk' | 'def' | 'mag' | 'res' | 'mov' | 'range';
  value: number;
}

export interface PetActiveSkill {
  id: string;
  name: string;
  description: string;
  iconName: string;
  damageType?: DamageType;
  power?: number;
  scalingStat?: 'atk' | 'mag' | 'def' | 'res' | 'hp';
  healMultiplier?: number;
  shieldMultiplier?: number;
  rangeMin: number;
  rangeMax: number;
  aoeRadius: number;
  aoeType?: AoEType;
  targetType: 'enemy' | 'ally' | 'any' | 'empty_tile' | 'self';
  statusEffect?: StatusEffect;
  healAmount?: number;
  shieldAmount?: number;
  buffAtkAmount?: number;
  buffDuration?: number;
  defenseIgnoreRatio?: number;
  knockback?: number;
  cleansesDebuffs?: boolean;
}

export interface PetDefinition {
  id: string;
  name: string;
  species: string;
  rarity: PetRarity;
  description: string;
  lore: string;
  iconName: string;
  color: string;
  passives: PetPassiveEffect[];
  activeSkills: PetActiveSkill[];
}

export interface PetEgg {
  id: string;
  rarity: PetRarity;
  acquiredAt: number; // Date.now()
  incubatingStartedAt?: number | null; // Date.now() when incubation began
  hatchDurationMs: number; // 5 hours in ms = 18_000_000
}

export interface AudioSettings {
  muted: boolean;
  masterVolume: number;
  sfxVolume: number;
  bgmVolume: number;
}

export type BattlePhase = 'deployment' | 'player_turn' | 'ai_turn' | 'boss_transition' | 'victory' | 'defeat';

export type SelectedAction = 'none' | 'move' | 'attack' | 'skill';
