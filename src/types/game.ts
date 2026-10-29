export interface Point {
  x: number;
  y: number;
}

export type TerrainType = 'grass' | 'stone' | 'sand' | 'dirt' | 'water' | 'swamp' | 'void';
export type ObstacleType = 'none' | 'tree' | 'rock' | 'ruins' | 'shrine' | 'wall' | 'pillar' | 'thorns' | 'tombstone' | 'note' | 'crystal_fire' | 'crystal_ice' | 'crystal_wind' | 'crystal_lightning';

export interface TileData {
  x: number;
  y: number;
  terrain: TerrainType;
  obstacle: ObstacleType;
  isWalkable: boolean;
  blocksVision: boolean;
  isTelegraphedHazard?: boolean; // Danger warning tile for boss AoE
  corruptionTurns?: number; // Duração restante da poça de corrupção
  mistTurns?: number; // Duração restante da névoa do Leviatã (dura 3 turnos, causa dano e silencia no início do turno)
  isWaterTornadoCenter?: boolean; // Centro do tornado de água do Leviatã
  antiHealPermanent?: boolean; // Área deixada pelo Corte Cruz do Cavaleiro das Trevas que impede qualquer cura até o fim da batalha
  borderFire?: boolean; // Chamas da borda do mapa invocadas pelo Cavaleiro das Trevas
}

export type UnitFaction = 'player' | 'enemy';

export type DamageType = 'physical' | 'magical' | 'healing';

export type SkillCategory = 'attack' | 'defense' | 'support' | 'passive';

export type StatusEffectType =
  | 'poison'
  | 'burn'
  | 'stun'
  | 'slow'
  | 'shield'
  | 'buff_atk'
  | 'buff_mov'
  | 'invisible'
  | 'debuff_def'
  | 'taunt'
  | 'excess_heal'
  | 'excess_shield'
  | 'electrified'
  | 'debuff_atk'
  | 'immune'
  | 'silence'
  | 'immune_physical'
  | 'immune_magical'
  | 'dark_cocoon'
  | 'immune_burn_poison'
  | 'dodge_counter'
  | 'summon_lifetime';

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
  | 't_shape'
  | 'x_shape'
  | 'rect_3x2'
  | 'square_5x5';

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
  targetType: 'enemy' | 'ally' | 'any' | 'self' | 'empty_tile' | 'corpse';
  isSummonSkill?: boolean;
  summonType?: 'corpse_skeleton' | 'skeleton_army';
  defenseIgnoreRatio?: number;
  ignoresShield?: boolean; // Ignora barreiras e escudos do alvo, causando dano direto à vida
  stealsShield?: boolean; // Se o alvo possuir escudo ativo, rouba todo o escudo para si antes de aplicar o dano
  debuffsAllPlayersAtk?: number; // % de redução de dano aplicada a todos os heróis no mapa
  debuffDuration?: number; // Duração do debuff global aplicado aos heróis
  targetFurthestEnemy?: boolean; // IA prioriza o inimigo mais distante (respeitando provocação)
  requiredLevel?: number;
  statusEffect?: StatusEffect;
  secondaryStatusEffect?: StatusEffect;
  lifestealPercent?: number; // % of damage dealt converted to healing on caster (e.g. 100% for Dreno de Vida)
  isTeleport?: boolean; // Skill teleports caster to an empty tile
  teleportToTarget?: boolean; // Moves caster to adjacent tile next to target
  cleansesDebuffs?: boolean; // Removes debuffs from target ally
  canTargetGround?: boolean; // Allows targeting empty tiles on battlefield to damage enemies around (e.g. Meteoro)
  hpCostPercent?: number; // % of current HP sacrificed by caster to activate skill (Berserker)
  resetsActionOnKill?: boolean; // Kills reset caster's attack and move action immediately (Samurai do Vazio)
  resetsCooldownOnKill?: boolean; // Reseta o próprio cooldown ao abater um inimigo (Avanço Dimensional)
  pullToCenter?: number; // Puxa alvos N casas em direção ao centro da área (Buraco Negro)
  requiredSkillUses?: number; // Requer N usos de outras habilidades para ser ativada (Lágrimas Rubras)
  grantsExtraTurn?: boolean; // Grants target ally an immediate additional turn (Bardo)
  createsObstacle?: ObstacleType; // Spawns an obstacle on targeted tile (Mago de Gelo)
  knockback?: number; // Pushes hit targets back N tiles away from caster (Disparo de Impacto)
  pull?: number; // Puxa alvos atingidos N casas em direção ao atacante
  pullToAdjacent?: boolean; // Puxa todos os heróis para casas adjacentes ao conjurador (Ultimate do Boss)
  isCardinalArms?: boolean; // Invoca braços nas 4 direções cardinais (N, S, L, O) a partir do conjurador
  aoeCenteredOnCaster?: boolean; // Área de efeito circular centrada no próprio conjurador (ao redor do boss)
  leavesCorruptionPuddle?: boolean; // Cobre as casas atingidas com poças de corrupção por 3 turnos
  leavesAntiHealPermanent?: boolean; // Deixa área permanente no chão que impede qualquer cura até o fim da batalha
  summonsBorderFire?: boolean; // Invoca chamas na borda do mapa (10% HP se iniciar o turno nela)
  prioritizeBleeding?: boolean; // IA prioriza alvos que estão sob efeito de sangramento (burn)
  grantsExtraTurnOnBleeding?: boolean; // Se o alvo estiver sangrando, o atacante age novamente
  targetLowestHpTotal?: boolean; // IA prioriza alvo com menor vida total máxima (Arauto dos Espectros)
  isLinePierce?: boolean; // Dano em linha reta perfurante a partir do conjurador
  chainCount?: number; // Number of targets lightning chains to (Mago Elétrico)
  chainRange?: number; // Max distance between chained links
  casterStatusEffect?: StatusEffect; // Applies a status effect (e.g. shield, buff) to the caster upon using this skill
  alliesStatusEffect?: StatusEffect; // Applies a status effect (e.g. shield, buff) to allies in the skill AoE
  shieldPercentOfMaxHp?: number; // Concede escudo baseado em % da vida máxima do conjurador (ex: 0.20 para 20%)
  shieldPercentOfMag?: number; // Concede escudo baseado em % da magia do conjurador (ex: 0.80 para 80%)
  shieldPercentOfAtk?: number; // Concede escudo baseado em % do ataque do conjurador (ex: 0.70 para 70%)
  buffMovBonus?: number; // Bônus de movimento concedido pela habilidade
  shieldFromDamagePercent?: number; // % do dano causado convertido em escudo para o conjurador
  stealthOnKill?: boolean; // Concede invisibilidade ao conjurador caso abata o alvo
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
  bossVersion?: 'neutral' | 'dark' | 'light'; // Fase 45: Versão escolhida pelo cristal destruído
  crystalsAlive?: boolean; // Fase 45: Imune enquanto os cristais estiverem ativos
  lightDoubleActionPending?: boolean; // Fase 45 (Luz): Se o escudo de 800 não for destruído, ganha dupla ação
  lastStunTurn?: number; // Turno da batalha em que a unidade foi atordoada por último (impede stun em turnos consecutivos em chefes)
  monsterTypeId?: string;
  halfHpTriggerTurn?: number; // Turno em que a vida do boss caiu para <= 50%
  hasUsedHalfHpSkill?: boolean; // Se a habilidade única de 50% HP já foi utilizada (ativa apenas 1 vez por combate)

  isSummoned?: boolean;
  summonTurnsLeft?: number;
  corpseConsumed?: boolean;
  damageDealt: number;
  kills: number;
  skillUsesCount?: number; // Acúmulo de habilidades usadas para liberar ultimate (Samurai do Vazio)
  equippedItemIds?: string[];
  skinId?: string;
  skinName?: string;
  skinBadge?: string;

  // Linhagens (Ancestries / Lineages):
  lineageId?: string;
  lineageName?: string;
  lineageIcon?: string;
  lineageBonusTitle?: string;
  lineageBonusDescription?: string;
  lineageColor?: string;
  lineageLifestealPercent?: number;
  lineageHpRegenPercent?: number;
  lineageHealShieldBonusPercent?: number;
  lineageAppliesBurn?: boolean;
  lineageStartShieldPercent?: number;
  lineageGoldBonusPercent?: number;
  lineageMissingHpDamageScaling?: boolean;
  lineageDefenseIgnorePercent?: number;
  lineagePhoenixRevive?: boolean;
  hasUsedPhoenixRevive?: boolean;
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
  waterTornadoActive?: boolean;
  waterTornadoCenter?: { x: number; y: number } | null;
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
  combatActive?: boolean; // Se a batalha da fase já foi iniciada
  partyLineages?: Record<string, string>; // className -> lineageId
}

export interface PlayerProgress {
  version: number; // Save schema version (v4)
  unlockedLevel: number;
  completedLevels: number[];
  gold: number; // Persistent gold kept across all runs
  unlockedClasses: string[]; // Persistent unlocked playable class names
  selectedPartyClasses: string[]; // Current 4 classes
  selectedPartyLineages?: Record<string, string>; // className -> lineageId
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

  // Class Missions & Skins system:
  classMissionsProgress?: Record<string, {
    completedMissions: string[];
    stats: Record<string, number>;
  }>;
  unlockedClassSkins?: string[];
  equippedClassSkins?: Record<string, string>; // className -> skinId
  unlockedClassSkillIds?: string[];
  dailyDungeon?: DailyDungeonState;
  monsterKills?: Record<string, number>;
  unlockedLineages?: string[]; // IDs das linhagens desbloqueadas (default: ['humano', 'elfo', 'anao'])
  lineageQuestStats?: {
    healingDone?: number;
    flawlessWins?: number;
    totalGoldEarned?: number;
    peakGold?: number;
    bossesDefeated?: number;
    battlesWon?: number;
    totalDamage?: number;
    fastBlitzWins?: number;
    noHealerWins?: number;
    statusInflicted?: number;
    lowHpKills?: number;
    flawlessBossWins?: number;
    massiveHits?: number;
    lightDarkWins?: number;
    comebackWins?: number;
  };
}

export interface ClassUnlockQuest {
  id: string;
  targetClass: string;
  title: string;
  description: string;
  monsterTypeId: string;
  monsterName: string;
  targetCount: number;
  hintLevel?: string;
  iconName?: string;
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

export interface ClassMission {
  id: string;
  className: string;
  tier: 1 | 2 | 3;
  title: string;
  description: string;
  statKey: 'damage_dealt' | 'kills' | 'skill_uses' | 'battles_won' | 'bosses_defeated';
  targetValue: number;
  rewardType: 'skill' | 'skin' | 'both';
  rewardSkillId?: string;
  rewardSkinId?: string;
  rewardGold: number;
}

export interface ClassSkin {
  id: string;
  className: string;
  name: string;
  subtitle: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  avatarKey: string;
  iconName: string;
  accentGlow: string;
  badge: string;
  unlockedByDefault?: boolean;
}

export interface DailyDungeonState {
  lastCompletedDate?: string;
  totalWins?: number;
}

export interface DailyDungeonConfig {
  dateKey: string;
  formattedDate: string;
  title: string;
  subtitle: string;
  levelConfig: LevelConfig;
  partyClasses: string[];
  heroSkills: Record<string, string[]>;
  heroLevel: number;
  rewardGold: number;
  bossMonsterTypeId?: string;
}
