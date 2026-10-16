import type { Unit } from '../types/game';
import { SKILLS } from './skills';

export interface MonsterDefinition {
  typeId: string;
  name: string;
  maxHp: number;
  atk: number;
  mag: number;
  def: number;
  res: number;
  mov: number;
  range: number;
  color: string;
  avatarKey: string;
  skillId?: string;
  skillIds: string[];
  description: string;
  isBoss?: boolean;
  isMiniBoss?: boolean;
}

export const MONSTER_DEFINITIONS: Record<string, MonsterDefinition> = {
  // --- 10 NORMAL MONSTER ARCHETYPES ---
  goblin: {
    typeId: 'goblin',
    name: 'Goblin Solteiro',
    maxHp: 55,
    atk: 14,
    mag: 4,
    def: 3,
    res: 2,
    mov: 3,
    range: 1,
    color: '#E65353',
    avatarKey: 'goblin',
    skillId: 'ataque_goblin',
    skillIds: ['ataque_goblin', 'bomba_fedida', 'adaga_furtiva'],
    description: 'Pequena criatura ágil que ataca em bando e arremessa bombas fétidas.',
  },
  orc: {
    typeId: 'orc',
    name: 'Orc Guerreiro',
    maxHp: 110,
    atk: 23,
    mag: 3,
    def: 9,
    res: 4,
    mov: 2,
    range: 1,
    color: '#D93838',
    avatarKey: 'orc',
    skillId: 'golpe_esmagador',
    skillIds: ['golpe_esmagador', 'rugido_de_guerra_orc', 'machadada_violenta'],
    description: 'Guerreiro brutal com alto ataque físico, grito de guerra e golpes esmagadores.',
  },
  aranha: {
    typeId: 'aranha',
    name: 'Aranha Sombria',
    maxHp: 65,
    atk: 17,
    mag: 6,
    def: 4,
    res: 5,
    mov: 4,
    range: 1,
    color: '#9C27B0',
    avatarKey: 'spider',
    skillId: 'picada_venenosa',
    skillIds: ['picada_venenosa', 'teia_paralisante', 'bote_sombrio'],
    description: 'Predadora veloz que envenena presas e dispara teias que reduzem a mobilidade.',
  },
  mago_trevas: {
    typeId: 'mago_trevas',
    name: 'Mago das Trevas',
    maxHp: 70,
    atk: 8,
    mag: 24,
    def: 3,
    res: 10,
    mov: 2,
    range: 3,
    color: '#7E57C2',
    avatarKey: 'dark_mage',
    skillId: 'chama_sombria',
    skillIds: ['chama_sombria', 'vortice_obscuro', 'maldicao_debilitante'],
    description: 'Conjurador maligno que ataca à distância com fogo sombrio e vórtices em área.',
  },
  lobo_espectral: {
    typeId: 'lobo_espectral',
    name: 'Lobo Espectral',
    maxHp: 80,
    atk: 20,
    mag: 10,
    def: 5,
    res: 8,
    mov: 4,
    range: 1,
    color: '#29B6F6',
    avatarKey: 'spectral_wolf',
    skillId: 'mordida_fantasma',
    skillIds: ['mordida_fantasma', 'uivo_aterrador', 'salto_espectral'],
    description: 'Fera etérea veloz capaz de atordoar com uivos aterradores e saltos spectrais.',
  },
  golem_basalto: {
    typeId: 'golem_basalto',
    name: 'Golem de Basalto',
    maxHp: 160,
    atk: 26,
    mag: 5,
    def: 16,
    res: 8,
    mov: 2,
    range: 1,
    color: '#78909C',
    avatarKey: 'basalt_golem',
    skillId: 'golpe_esmagador',
    skillIds: ['golpe_esmagador', 'armadura_petrea', 'terremoto_basalto'],
    description: 'Colosso de pedra imponente com escudo rochoso e terremotos em área devastadores.',
  },
  bruxa_espinhos: {
    typeId: 'bruxa_espinhos',
    name: 'Bruxa dos Espinhos',
    maxHp: 85,
    atk: 10,
    mag: 26,
    def: 5,
    res: 14,
    mov: 2,
    range: 3,
    color: '#66BB6A',
    avatarKey: 'thorn_witch',
    skillId: 'espinhos_envenenados',
    skillIds: ['espinhos_envenenados', 'raiz_espinhosa', 'dreno_de_seiva'],
    description: 'Feiticeira das matas que atordoa com raízes, dispara espinhos tóxicos e drena vida.',
  },
  cavaleiro_caido: {
    typeId: 'cavaleiro_caido',
    name: 'Cavaleiro Caído',
    maxHp: 130,
    atk: 25,
    mag: 8,
    def: 12,
    res: 10,
    mov: 3,
    range: 1,
    color: '#8D6E63',
    avatarKey: 'fallen_knight',
    skillId: 'corte_profano',
    skillIds: ['corte_profano', 'escudo_espectral', 'investida_caida'],
    description: 'Guerreiro nobre corrompido que ignora armaduras, ergue escudos e desfere estocadas fúnebres.',
  },
  mimico: {
    typeId: 'mimico',
    name: 'Mímico Carniceiro',
    maxHp: 95,
    atk: 27,
    mag: 4,
    def: 7,
    res: 6,
    mov: 3,
    range: 1,
    color: '#FFA726',
    avatarKey: 'mimic',
    skillId: 'mordida_devoradora',
    skillIds: ['mordida_devoradora', 'acido_corrosivo', 'lingua_voraz'],
    description: 'Criatura traiçoeira com ácido dissolvente, mordidas vorazes e chicote carniceiro.',
  },
  draco_volcanico: {
    typeId: 'draco_volcanico',
    name: 'Draco Vulcânico',
    maxHp: 150,
    atk: 29,
    mag: 22,
    def: 11,
    res: 11,
    mov: 3,
    range: 2,
    color: '#FF5722',
    avatarKey: 'volcanic_drake',
    skillId: 'sopro_de_magma',
    skillIds: ['sopro_de_magma', 'mordida_incandescente', 'furia_draconica'],
    description: 'Réptil colossal de escamas incandescentes com sopro de magma em área e fúria devastadora.',
  },

  // --- SPECIAL BOSSES & MINI BOSSES (FASES 5 A 50) ---
  devorador: {
    typeId: 'devorador',
    name: 'Devorador das Profundezas',
    maxHp: 380,
    atk: 34,
    mag: 18,
    def: 16,
    res: 14,
    mov: 3,
    range: 1,
    color: '#FF6F00',
    avatarKey: 'devourer_boss',
    skillId: 'investida_devoradora',
    skillIds: ['investida_devoradora', 'impacto_abissal', 'carapaca_de_ferro', 'acido_corrosivo'],
    description: 'MINI BOSS (FASE 5): Criatura abissal gigantesca com mandíbulas de ferro e carapaça incandescente.',
    isMiniBoss: true,
  },
  astaroth: {
    typeId: 'astaroth',
    name: 'Astaroth, Soberano do Abismo',
    maxHp: 650,
    atk: 42,
    mag: 40,
    def: 20,
    res: 18,
    mov: 3,
    range: 3,
    color: '#4A148C',
    avatarKey: 'astaroth_boss',
    skillId: 'lanca_do_abismo',
    skillIds: ['lanca_do_abismo', 'despertar_sombrio', 'ruina_absoluta', 'vortice_obscuro'],
    description: 'BOSS PODEROSO (FASE 10): Soberano supremo do abismo em 3 fases de transformação devastadoras.',
    isBoss: true,
  },
  arauto_espectral: {
    typeId: 'arauto_espectral',
    name: 'Arauto dos Espectros',
    maxHp: 580,
    atk: 38,
    mag: 40,
    def: 20,
    res: 22,
    mov: 3,
    range: 2,
    color: '#00E5FF',
    avatarKey: 'spectral_wolf',
    skillId: 'dreno_de_vida',
    skillIds: ['dreno_de_vida', 'maldicao_fraqueza', 'chama_sombria', 'uivo_aterrador'],
    description: 'MINI BOSS (FASE 15): Ceifador espectral etéreo que suga a força vital dos inimigos.',
    isMiniBoss: true,
  },
  tita_forjador: {
    typeId: 'tita_forjador',
    name: 'Vulcanus, Titã das Forjas',
    maxHp: 950,
    atk: 50,
    mag: 34,
    def: 30,
    res: 24,
    mov: 2,
    range: 2,
    color: '#FF3D00',
    avatarKey: 'basalt_golem',
    skillId: 'golpe_esmagador',
    skillIds: ['golpe_esmagador', 'impacto_abissal', 'chama_sombria', 'terremoto_basalto'],
    description: 'BOSS PODEROSO (FASE 20): Colosso mecânico incandescente forjado no coração vulcânico.',
    isBoss: true,
  },
  mestre_runico: {
    typeId: 'mestre_runico',
    name: 'Arquimago das Runas',
    maxHp: 780,
    atk: 32,
    mag: 52,
    def: 22,
    res: 28,
    mov: 3,
    range: 3,
    color: '#7C4DFF',
    avatarKey: 'dark_mage',
    skillId: 'runa_de_choque',
    skillIds: ['runa_de_choque', 'glifo_incandescente', 'apocalipse_runico', 'vortice_obscuro'],
    description: 'MINI BOSS (FASE 25): Guardião ancestral de segredos e magias rúnicas proibidas.',
    isMiniBoss: true,
  },
  valgar_sanguinario: {
    typeId: 'valgar_sanguinario',
    name: 'Valgar, o Carniceiro Imortal',
    maxHp: 1300,
    atk: 62,
    mag: 28,
    def: 28,
    res: 22,
    mov: 3,
    range: 1,
    color: '#B71C1C',
    avatarKey: 'orc',
    skillId: 'golpe_selvagem',
    skillIds: ['golpe_selvagem', 'frenesi_sanguinario', 'salto_destrutivo', 'ruina_absoluta'],
    description: 'BOSS PODEROSO (FASE 30): Senhor da guerra implacável movido por pura fúria sanguinária.',
    isBoss: true,
  },
  quimera_venenosa: {
    typeId: 'quimera_venenosa',
    name: 'Quimera das Sombras Antigas',
    maxHp: 1050,
    atk: 52,
    mag: 46,
    def: 26,
    res: 28,
    mov: 3,
    range: 2,
    color: '#00C853',
    avatarKey: 'spider',
    skillId: 'picada_venenosa',
    skillIds: ['picada_venenosa', 'teia_paralisante', 'impacto_abissal', 'sopro_de_magma'],
    description: 'MINI BOSS (FASE 35): Fera mutante de veneno letal e garras peçonhentas.',
    isMiniBoss: true,
  },
  leviata_vazio: {
    typeId: 'leviata_vazio',
    name: 'Leviatã do Vazio Primordial',
    maxHp: 1800,
    atk: 66,
    mag: 66,
    def: 34,
    res: 34,
    mov: 3,
    range: 3,
    color: '#311B92',
    avatarKey: 'devourer_boss',
    skillId: 'lanca_do_abismo',
    skillIds: ['lanca_do_abismo', 'despertar_sombrio', 'ruina_absoluta', 'vortice_obscuro', 'maldicao_debilitante'],
    description: 'BOSS PODEROSO (FASE 40): Entidade colossal cósmica que distorce o tecido da realidade.',
    isBoss: true,
  },
  cavaleiro_apocalipse: {
    typeId: 'cavaleiro_apocalipse',
    name: 'Cavaleiro do Eclipse Eterno',
    maxHp: 1400,
    atk: 62,
    mag: 50,
    def: 32,
    res: 30,
    mov: 3,
    range: 2,
    color: '#FFD600',
    avatarKey: 'fallen_knight',
    skillId: 'corte_profano',
    skillIds: ['corte_profano', 'golpe_esmagador', 'escudo_espectral', 'ruina_absoluta'],
    description: 'MINI BOSS (FASE 45): O último cavaleiro sagrado corrompido pela escuridão do eclipse.',
    isMiniBoss: true,
  },
  cronos_abissal: {
    typeId: 'cronos_abissal',
    name: 'Malakor, O Fim de Todas as Eras',
    maxHp: 2800,
    atk: 78,
    mag: 82,
    def: 38,
    res: 38,
    mov: 3,
    range: 3,
    color: '#D50000',
    avatarKey: 'astaroth_boss',
    skillId: 'ruina_absoluta',
    skillIds: ['ruina_absoluta', 'lanca_do_abismo', 'despertar_sombrio', 'apocalipse_runico', 'furia_draconica'],
    description: 'BOSS SUPREMO FINAL (FASE 50): A divindade do caos definitivo. O teste final para a sua guilda.',
    isBoss: true,
  },
};

export function createMonsterUnit(
  typeId: keyof typeof MONSTER_DEFINITIONS,
  id: string,
  x: number,
  y: number,
  levelOffset = 0
): Unit {
  const def = MONSTER_DEFINITIONS[typeId];
  const level = 1 + levelOffset;

  let maxHp: number;
  let atk: number;
  let mag: number;
  let unitDef: number;
  let res: number;

  if (def.isBoss) {
    // Boss scaling: matches endgame player level 10 to 50
    maxHp = def.maxHp + levelOffset * 90;
    atk = def.atk + Math.round(levelOffset * 8.0);
    mag = def.mag + Math.round(levelOffset * 8.0);
    unitDef = def.def + Math.round(levelOffset * 4.0);
    res = def.res + Math.round(levelOffset * 4.0);
  } else if (def.isMiniBoss) {
    // Mini-boss scaling: stages 5, 15, 25, 35, 45
    maxHp = def.maxHp + levelOffset * 55;
    atk = def.atk + Math.round(levelOffset * 6.0);
    mag = def.mag + Math.round(levelOffset * 6.0);
    unitDef = def.def + Math.round(levelOffset * 3.2);
    res = def.res + Math.round(levelOffset * 3.0);
  } else {
    // Normal monster progressive scaling
    maxHp = def.maxHp + levelOffset * 28;
    atk = def.atk + Math.round(levelOffset * 4.5);
    mag = def.mag + Math.round(levelOffset * 4.5);
    unitDef = def.def + Math.round(levelOffset * 2.2);
    res = def.res + Math.round(levelOffset * 2.0);
  }

  // Load active skill list
  const skillIds = def.skillIds && def.skillIds.length > 0 ? def.skillIds : (def.skillId ? [def.skillId] : []);
  const skillList: any[] = skillIds
    .map((sId) => SKILLS[sId])
    .filter(Boolean)
    .map((s) => JSON.parse(JSON.stringify(s)));

  return {
    id,
    name: def.name,
    className: def.name,
    faction: 'enemy',
    level,
    xp: 0,
    maxXp: 100 * level,
    maxHp,
    currentHp: maxHp,
    atk,
    mag,
    def: unitDef,
    res,
    mov: def.mov,
    range: def.range,
    x,
    y,
    hasMoved: false,
    hasAttacked: false,
    isDead: false,
    color: def.color,
    avatarKey: def.avatarKey,
    skills: skillList,
    learnedSkillIds: [],
    statusEffects: [],
    isBoss: def.isBoss,
    isMiniBoss: def.isMiniBoss,
    bossPhase: def.isBoss || def.isMiniBoss ? 1 : undefined,
    damageDealt: 0,
    kills: 0,
  };
}
