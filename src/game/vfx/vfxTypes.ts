export type VFXAnimationType =
  | 'meteor_shower'      // Multi-rock sky drop or ballistic comet with craters & blast
  | 'fire_pillar'        // Rising vertical cylindrical column with swirling dual layers
  | 'flamethrower'       // Continuous cone/stream of particles (fire, poison, wind, void)
  | 'combustion'         // Internal build-up and body-centered implosion/explosion
  | 'ice_spikes'         // Glacial spikes / thorns / stone stalagmites erupting from ground
  | 'frost_nova'         // Expanding ring with radial crystal shards
  | 'lightning_storm'    // Multi-segment chaotic lightning bolts from sky or chain arc
  | 'holy_pillar'        // Radiant descending beam with halo and ascending stars
  | 'void_miasma'        // Swirling dark vortex with life-siphon stream back to caster
  | 'heavy_slam'         // Crushing impact with ground fissures, rocks and shockwave
  | 'blade_tempest'      // 3D curved katana/sword/scythe/claw slash arcs
  | 'sniper_shot'        // Laser lock-on + piercing high-velocity shot with sonic rings
  | 'arrow_volley'       // Salvo or rain of 3D arrows/spears/daggers/feathers
  | 'cannon_barrage'     // Heavy arcing bomb/grenade/flask with area blast
  | 'black_hole'         // Gravitational singularity with accretion disk & cross pull
  | 'crimson_horizon'    // 5x5 world-darkening dome + criss-crossing crimson horizon slashes
  | 'dimensional_wave'   // Traveling wide crescent wave / ground fissure (rect_3x2, line, cleave)
  | 'chain_hook'         // 3D roots, chains, tentacles or webs binding the target
  | 'sonic_symphony'     // Expanding 3D soundwave rings & musical/roar resonance
  | 'shield_bastion'     // 3D energy dome, orbiting shields, or Iaijutsu stance aura
  | 'generic_melee'      // Physical lunge + custom slash arc
  | 'generic_magic';     // Magical orb projectile + burst

export type VFXCasterMotion =
  | 'none'
  | 'lunge'              // Quick forward dash toward target and return
  | 'dash_through'       // High-speed Iaijutsu dash passing through target and returning
  | 'leap_slam'          // High parabolic jump onto target and return
  | 'sky_dragoon'        // Jumps high into the sky and dives onto target like a meteor
  | 'whirlwind'          // Spins 720 degrees on axis
  | 'blink_strike'       // Teleports via shadow/void portal beside target, strikes, returns
  | 'recoil_shot'        // Backward recoil kick when firing heavy shot
  | 'levitate_cast'      // Floats upward while channeling spell
  | 'stance_guard';      // Enters defensive/iaijutsu guard posture with subtle pulse

export type VFXSlashStyle =
  | 'single'
  | 'cross_x'
  | 'flurry'
  | 'spin'
  | 'guillotine'
  | 'cone_slashes';

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
  casterMotion?: VFXCasterMotion;
  primaryColor?: number;
  secondaryColor?: number;
  slashCount?: number;
  slashStyle?: VFXSlashStyle;
  aoeShape?: string;
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
