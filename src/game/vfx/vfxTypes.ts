export type VFXAnimationType =
  | 'meteor_shower'      // Multi-rock sky drop with craters & heavy blast
  | 'fire_pillar'        // Rising vertical cylindrical fire column with ascending rings
  | 'flamethrower'       // Continuous cone/stream of flame particles
  | 'combustion'         // Internal thermal build-up and body-centered explosion
  | 'ice_spikes'         // Glacial spikes erupting from ground
  | 'frost_nova'         // Ground-freezing expanding ring with ice crystals
  | 'lightning_storm'    // Multiple chaotic bolts from sky
  | 'holy_pillar'        // Radiant beam descending with halo and ascending golden stars
  | 'void_miasma'        // Swirling dark vortex with siphon stream
  | 'heavy_slam'         // High leap with ground crack and dust shockwave
  | 'blade_tempest'      // Multi-angle slash arcs
  | 'sniper_shot'        // Piercing vacuum trail arrow
  | 'arrow_volley'       // Cascading rain of arrows
  | 'cannon_barrage'     // Heavy arcing bomb
  | 'generic_melee'      // Fallback physical slash
  | 'generic_magic';     // Fallback magical orb

export interface VFXProjectileStep {
  delayMs: number;
  fromSky?: boolean;
  skyAngleDeg?: number;      // e.g. 60°
  skyHeight?: number;        // e.g. 7.0
  arcHeight?: number;        // for ballistic arc
  targetOffset?: { x: number; z: number };
  size?: number;
  color?: number;
  innerColor?: number;
}

export interface VFXPillarConfig {
  height: number;
  radius: number;
  color: number;
  innerCoreColor?: number;
}

export interface VFXStreamConfig {
  particleCount: number;
  spreadAngleDeg: number;
  color: number;
  secondaryColor?: number;
  flowDurationMs: number;
}

export interface VFXCastConfig {
  durationMs: number;
  color: number;
  ringRadius?: number;
  pulseCaster?: boolean;
}

export interface VFXImpactConfig {
  shockwave?: boolean;
  shockwaveColor?: number;
  craterDecal?: boolean;
  craterColor?: number;
  particleBurstCount?: number;
  particleType?: 'fire' | 'ice' | 'sparks' | 'dust' | 'stars' | 'shadow';
}

export interface VFXSequence {
  id: string;
  type: VFXAnimationType;
  durationMs: number;
  cast?: VFXCastConfig;
  projectiles?: VFXProjectileStep[];
  pillar?: VFXPillarConfig;
  stream?: VFXStreamConfig;
  impact?: VFXImpactConfig;
  screenShake?: {
    intensity: number;
    durationMs: number;
    delayMs?: number;
  };
  hitReactionDelayMs?: number;
}
