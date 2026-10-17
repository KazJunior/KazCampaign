import type { Unit, MonsterRole } from '../types/game';
import { SKILLS } from './skills';

export interface MonsterDefinition {
  typeId: string;
  name: string;
  role: MonsterRole;
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
  // --- 10 NORMAL MONSTER ARCHETYPES (+10% em todos os status) ---
  goblin: {
    typeId: 'goblin',
    name: 'Goblin Solteiro',
    role: 'attacker',
    maxHp: 61,
    atk: 15,
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
    role: 'attacker',
    maxHp: 121,
    atk: 25,
    mag: 3,
    def: 10,
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
    role: 'attacker',
    maxHp: 72,
    atk: 19,
    mag: 7,
    def: 4,
    res: 6,
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
    role: 'attacker',
    maxHp: 77,
    atk: 9,
    mag: 26,
    def: 3,
    res: 11,
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
    role: 'attacker',
    maxHp: 88,
    atk: 22,
    mag: 11,
    def: 6,
    res: 9,
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
    role: 'tank',
    maxHp: 176,
    atk: 29,
    mag: 6,
    def: 18,
    res: 9,
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
    role: 'support',
    maxHp: 94,
    atk: 11,
    mag: 29,
    def: 6,
    res: 15,
    mov: 2,
    range: 3,
    color: '#66BB6A',
    avatarKey: 'thorn_witch',
    skillId: 'espinhos_envenenados',
    skillIds: ['espinhos_envenenados', 'raiz_espinhosa', 'bencao_dos_espinhos', 'dreno_de_seiva'],
    description: 'Feiticeira suporte que concede escudos espinhosos aos aliados, atordoa com raízes e dispara espinhos.',
  },
  cavaleiro_caido: {
    typeId: 'cavaleiro_caido',
    name: 'Cavaleiro Caído',
    role: 'tank',
    maxHp: 143,
    atk: 28,
    mag: 9,
    def: 13,
    res: 11,
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
    role: 'attacker',
    maxHp: 105,
    atk: 30,
    mag: 4,
    def: 8,
    res: 7,
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
    role: 'attacker',
    maxHp: 165,
    atk: 32,
    mag: 24,
    def: 12,
    res: 12,
    mov: 3,
    range: 2,
    color: '#FF5722',
    avatarKey: 'volcanic_drake',
    skillId: 'sopro_de_magma',
    skillIds: ['sopro_de_magma', 'mordida_incandescente', 'furia_draconica'],
    description: 'Réptil colossal de escamas incandescentes com sopro de magma em área e fúria devastadora.',
  },

  // --- SPECIAL BOSSES & MINI BOSSES (FASES 5 A 50) (+5% em todos os status) ---
  devorador: {
    typeId: 'devorador',
    name: 'Devorador das Profundezas',
    role: 'tank',
    maxHp: 499,
    atk: 36,
    mag: 19,
    def: 38,
    res: 36,
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
    role: 'attacker',
    maxHp: 854,
    atk: 44,
    mag: 42,
    def: 42,
    res: 40,
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
    role: 'support',
    maxHp: 761,
    atk: 40,
    mag: 42,
    def: 42,
    res: 44,
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
    role: 'tank',
    maxHp: 1247,
    atk: 53,
    mag: 36,
    def: 53,
    res: 46,
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
    role: 'support',
    maxHp: 1024,
    atk: 34,
    mag: 55,
    def: 44,
    res: 50,
    mov: 3,
    range: 3,
    color: '#7C4DFF',
    avatarKey: 'dark_mage',
    skillId: 'runa_de_choque',
    skillIds: ['runa_de_choque', 'glifo_incandescente', 'runa_de_protecao', 'vortice_obscuro'],
    description: 'MINI BOSS (FASE 25): Guardião ancestral de segredos e magias rúnicas proibidas.',
    isMiniBoss: true,
  },
  valgar_sanguinario: {
    typeId: 'valgar_sanguinario',
    name: 'Valgar, o Carniceiro Imortal',
    role: 'attacker',
    maxHp: 1706,
    atk: 65,
    mag: 29,
    def: 50,
    res: 44,
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
    role: 'attacker',
    maxHp: 1379,
    atk: 55,
    mag: 48,
    def: 48,
    res: 50,
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
    role: 'attacker',
    maxHp: 2363,
    atk: 69,
    mag: 69,
    def: 57,
    res: 57,
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
    role: 'tank',
    maxHp: 1838,
    atk: 65,
    mag: 53,
    def: 55,
    res: 53,
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
    role: 'attacker',
    maxHp: 3675,
    atk: 82,
    mag: 86,
    def: 61,
    res: 61,
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
    // Boss scaling (+5% em todos os status)
    maxHp = def.maxHp + Math.round(levelOffset * 118);
    atk = def.atk + Math.round(levelOffset * 5.1);
    mag = def.mag + Math.round(levelOffset * 5.1);
    unitDef = def.def + Math.round(levelOffset * 4.2);
    res = def.res + Math.round(levelOffset * 4.2);
  } else if (def.isMiniBoss) {
    // Mini-boss scaling (+5% em todos os status)
    maxHp = def.maxHp + Math.round(levelOffset * 72);
    const scaling = typeId === 'devorador' ? 6.3 : 4.2;
    atk = def.atk + Math.round(levelOffset * scaling);
    mag = def.mag + Math.round(levelOffset * scaling);
    unitDef = def.def + Math.round(levelOffset * 3.4);
    res = def.res + Math.round(levelOffset * 3.2);
  } else {
    // Normal monster progressive scaling (+10% em todos os status)
    maxHp = def.maxHp + Math.round(levelOffset * 31);
    atk = def.atk + Math.round(levelOffset * 5.0);
    mag = def.mag + Math.round(levelOffset * 5.0);
    unitDef = def.def + Math.round(levelOffset * 2.4);
    res = def.res + Math.round(levelOffset * 2.2);
  }

  // Load active skill list
  const skillIds = def.skillIds && def.skillIds.length > 0 ? def.skillIds : (def.skillId ? [def.skillId] : []);
  const skillList: any[] = skillIds
    .map((sId) => SKILLS[sId])
    .filter(Boolean)
    .map((s) => {
      const clone = JSON.parse(JSON.stringify(s));
      if (clone.damageType === 'healing' || clone.statusEffect?.type === 'shield') {
        clone.cooldownMax = Math.max(3, clone.cooldownMax);
      }
      return clone;
    });

  return {
    id,
    name: def.name,
    className: def.name,
    faction: 'enemy',
    monsterRole: def.role || 'attacker',
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
