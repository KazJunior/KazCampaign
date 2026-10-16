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
  description: string;
  isBoss?: boolean;
  isMiniBoss?: boolean;
}

export const MONSTER_DEFINITIONS: Record<string, MonsterDefinition> = {
  goblin: {
    typeId: 'goblin',
    name: 'Goblin Solteiro',
    maxHp: 55,
    atk: 14,
    mag: 2,
    def: 3,
    res: 2,
    mov: 3,
    range: 1,
    color: '#E65353',
    avatarKey: 'goblin',
    skillId: 'ataque_goblin',
    description: 'Pequena criatura ágil que ataca em bando.',
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
    description: 'Guerreiro brutal com alto ataque físico e armadura pesada.',
  },
  aranha: {
    typeId: 'aranha',
    name: 'Aranha Sombria',
    maxHp: 65,
    atk: 17,
    mag: 5,
    def: 4,
    res: 5,
    mov: 4,
    range: 1,
    color: '#9C27B0',
    avatarKey: 'spider',
    skillId: 'picada_venenosa',
    description: 'Predadora veloz que envenena suas vítimas com cada picada.',
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
    description: 'Conjurador maligno que ataca à distância com magia negra.',
  },

  // --- 6 NEW MONSTER ARCHETYPES ---
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
    skillId: 'ataque_goblin',
    description: 'Criatura velocíssima com rastro translúcido azulado.',
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
    description: 'Monstro gigante de pedra com fissuras incandescentes e alta defesa.',
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
    skillId: 'picada_venenosa',
    description: 'Conjuradora que aprisiona heróis com raízes e veneno.',
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
    skillId: 'golpe_esmagador',
    description: 'Guerreiro morto-vivo implacável com armadura desgastada.',
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
    skillId: 'ataque_goblin',
    description: 'Criatura traiçoeira que ataca com mandíbulas afiadas.',
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
    skillId: 'chama_sombria',
    description: 'Réptil colossal de escamas incandescentes que cospe chamas.',
  },

  // --- SPECIAL BOSSES ---
  devorador: {
    typeId: 'devorador',
    name: 'Devorador das Profundezas',
    maxHp: 320,
    atk: 32,
    mag: 15,
    def: 15,
    res: 12,
    mov: 3,
    range: 1,
    color: '#FF6F00',
    avatarKey: 'devourer_boss',
    skillId: 'investida_devoradora',
    description: 'MINI BOSS (FASE 5): Criatura abissal gigantesca com mandíbulas de ferro e carapaça incandescente.',
    isMiniBoss: true,
  },
  astaroth: {
    typeId: 'astaroth',
    name: 'Astaroth, Soberano do Abismo',
    maxHp: 550,
    atk: 40,
    mag: 38,
    def: 18,
    res: 16,
    mov: 3,
    range: 3,
    color: '#4A148C',
    avatarKey: 'astaroth_boss',
    skillId: 'lanca_do_abismo',
    description: 'BOSS FINAL (FASE 10): Soberano supremo do abismo em 3 fases de transformação devastadoras.',
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
  const maxHp = def.maxHp + levelOffset * 20;
  const atk = def.atk + levelOffset * 4;
  const unitDef = def.def + levelOffset * 2;

  const skillList: any[] = [];
  if (def.skillId && SKILLS[def.skillId]) {
    skillList.push(JSON.parse(JSON.stringify(SKILLS[def.skillId])));
  }

  // Add extra skills for Devorador
  if (typeId === 'devorador') {
    if (SKILLS.impacto_abissal) skillList.push(JSON.parse(JSON.stringify(SKILLS.impacto_abissal)));
    if (SKILLS.carapaca_de_ferro) skillList.push(JSON.parse(JSON.stringify(SKILLS.carapaca_de_ferro)));
  }
  // Add extra skills for Astaroth
  if (typeId === 'astaroth') {
    if (SKILLS.despertar_sombrio) skillList.push(JSON.parse(JSON.stringify(SKILLS.despertar_sombrio)));
    if (SKILLS.ruina_absoluta) skillList.push(JSON.parse(JSON.stringify(SKILLS.ruina_absoluta)));
  }

  return {
    id,
    name: def.name,
    className: def.name,
    faction: 'enemy',
    level,
    xp: 0,
    maxXp: 100,
    maxHp,
    currentHp: maxHp,
    atk,
    mag: def.mag + levelOffset * 4,
    def: unitDef,
    res: def.res + levelOffset * 2,
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
