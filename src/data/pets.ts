import type { PetDefinition, PetEgg, PetRarity } from '../types/game';

export const HATCH_DURATION_BY_RARITY_MS: Record<PetRarity, number> = {
  common: 1 * 60 * 60 * 1000,    // 1 hora
  uncommon: 2 * 60 * 60 * 1000,  // 2 horas
  rare: 3 * 60 * 60 * 1000,      // 3 horas
  epic: 5 * 60 * 60 * 1000,      // 5 horas
  legendary: 8 * 60 * 60 * 1000, // 8 horas
};

export const HATCH_DURATION_MS = HATCH_DURATION_BY_RARITY_MS.common; // Default fallback
export const INSTANT_HATCH_COST = 10000; // 10.000 Ouro para chocar imediatamente
export const MAX_EGGS_LIMIT = 20; // Limite máximo de 20 ovos por jogador

export function getHatchDuration(rarity: PetRarity): number {
  return HATCH_DURATION_BY_RARITY_MS[rarity] || HATCH_DURATION_BY_RARITY_MS.common;
}

export interface RarityConfig {
  label: string;
  color: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  badgeBg: string;
  eggColorHex: string;
  dropRatePercent: number; // 40, 30, 20, 9, 1
  duplicateGold: number;
  hatchHours: number;
  hatchDurationMs: number;
}

export const PET_RARITY_CONFIG: Record<PetRarity, RarityConfig> = {
  common: {
    label: 'Comum',
    color: '#F3F4F8',
    borderClass: 'border-slate-300',
    bgClass: 'bg-slate-700/20',
    textClass: 'text-slate-200',
    badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-400/40',
    eggColorHex: '#E2E8F0',
    dropRatePercent: 40,
    duplicateGold: 1000,
    hatchHours: 1,
    hatchDurationMs: HATCH_DURATION_BY_RARITY_MS.common,
  },
  uncommon: {
    label: 'Incomum',
    color: '#22C55E',
    borderClass: 'border-emerald-500/50',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    eggColorHex: '#22C55E',
    dropRatePercent: 30,
    duplicateGold: 2500,
    hatchHours: 2,
    hatchDurationMs: HATCH_DURATION_BY_RARITY_MS.uncommon,
  },
  rare: {
    label: 'Raro',
    color: '#3B82F6',
    borderClass: 'border-blue-500/50',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    eggColorHex: '#3B82F6',
    dropRatePercent: 20,
    duplicateGold: 6000,
    hatchHours: 3,
    hatchDurationMs: HATCH_DURATION_BY_RARITY_MS.rare,
  },
  epic: {
    label: 'Épico',
    color: '#A855F7',
    borderClass: 'border-purple-500/50',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    eggColorHex: '#A855F7',
    dropRatePercent: 9,
    duplicateGold: 15000,
    hatchHours: 5,
    hatchDurationMs: HATCH_DURATION_BY_RARITY_MS.epic,
  },
  legendary: {
    label: 'Lendário',
    color: '#EAB308',
    borderClass: 'border-amber-400/70',
    bgClass: 'bg-amber-500/15',
    textClass: 'text-amber-300',
    badgeBg: 'bg-amber-500/25 text-amber-300 border-amber-400/60 shadow-[0_0_12px_rgba(234,179,8,0.3)]',
    eggColorHex: '#FACC15',
    dropRatePercent: 1,
    duplicateGold: 35000,
    hatchHours: 8,
    hatchDurationMs: HATCH_DURATION_BY_RARITY_MS.legendary,
  },
};

export const PETS: PetDefinition[] = [
  // =========================================================================
  // COMUNS (15 pets) - 1 Efeito Passivo (Atributo de heróis ou Ouro)
  // =========================================================================
  {
    id: 'gosma_verde',
    name: 'Gosminha Saltitante',
    species: 'Invertebrado Flutuante',
    rarity: 'common',
    description: 'Uma criatura gelatinosa translúcida que salta alegremente acompanhando seus passos.',
    lore: 'Nascida nos vales úmidos, essa gosma transmite calor e vigor revigorante para quem a acolhe.',
    iconName: 'Droplet',
    color: '#84CC16',
    passives: [
      {
        id: 'p_gosma_hp',
        name: 'Vigor Gelatinoso',
        description: '+15 de Vida Máxima para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'hp',
        value: 15,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'pintinho_guerreiro',
    name: 'Pintinho Bicador',
    species: 'Aves Valentes',
    rarity: 'common',
    description: 'Pequenino e emplumado, com uma atitude marcial inabalável e olhar focado.',
    lore: 'Treinado por veteranos que perderam seus cães de caça, ele bica o chão com postura militar.',
    iconName: 'Bird',
    color: '#FBBF24',
    passives: [
      {
        id: 'p_pintinho_atk',
        name: 'Bicada Motivacional',
        description: '+2 de Ataque Físico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'atk',
        value: 2,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'filhote_lobo',
    name: 'Lobinho Cinzento',
    species: 'Canídeo Selvagem',
    rarity: 'common',
    description: 'Filhote curioso com orelhas pontudas e cauda inquieta.',
    lore: 'Seus uivos afinados ressoam com a magia ambiente, despertando a sensibilidade arcana do grupo.',
    iconName: 'Dog',
    color: '#94A3B8',
    passives: [
      {
        id: 'p_lobo_mag',
        name: 'Uivo Arcano',
        description: '+2 de Poder Mágico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'mag',
        value: 2,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'coelho_saltador',
    name: 'Coelhinho das Colinas',
    species: 'Mamífero Veloz',
    rarity: 'common',
    description: 'Pelugem macia e focinho sempre farejando tesouros no solo.',
    lore: 'Conhecido por acumular moedas brilhantes em suas tocas subterrâneas.',
    iconName: 'Rabbit',
    color: '#F59E0B',
    passives: [
      {
        id: 'p_coelho_gold',
        name: 'Faro de Tesouro',
        description: '+10% de Ouro obtido ao término das fases',
        type: 'gold_boost',
        value: 10,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'morceguinho_cavernoso',
    name: 'Morceguinho Sonar',
    species: 'Alado Noturno',
    rarity: 'common',
    description: 'Pousa suavemente nos ombros do líder e solta pequenos estalos de radar.',
    lore: 'As ondas sônicas deste companheiro dissipam ondas hostis de magia espectral.',
    iconName: 'Moon',
    color: '#64748B',
    passives: [
      {
        id: 'p_morcego_res',
        name: 'Eco Dissipador',
        description: '+2 de Resistência Mágica para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'res',
        value: 2,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'mini_tartaruga',
    name: 'Tartaruguinha Cascalho',
    species: 'Réptil Couraçado',
    rarity: 'common',
    description: 'Carrega um casco espesso formado por pequenos pedregulhos incrustados.',
    lore: 'Ensina os aventureiros a se posicionarem com paciência inquebrável diante do perigo.',
    iconName: 'Shield',
    color: '#10B981',
    passives: [
      {
        id: 'p_tartaruga_def',
        name: 'Casco Firme',
        description: '+2 de Defesa Física para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'def',
        value: 2,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'rato_sagaz',
    name: 'Ratinho das Catacumbas',
    species: 'Roedor Astuto',
    rarity: 'common',
    description: 'Rápido, silencioso e muito inteligente, sempre encontra passagens secretas.',
    lore: 'Nenhuma bolsa de monstros derrotados escapa ao saque desse roedor engenhoso.',
    iconName: 'Coins',
    color: '#D97706',
    passives: [
      {
        id: 'p_rato_gold',
        name: 'Saqueador Oportunista',
        description: '+10% de Ouro obtido ao término das fases',
        type: 'gold_boost',
        value: 10,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'lagarto_areias',
    name: 'Calango do Deserto',
    species: 'Réptil Árido',
    rarity: 'common',
    description: 'Suas escamas secas absorvem a radiação solar para fortalecer quem o toca.',
    lore: 'Capaz de sobreviver semanas sem água nas terras mais desoladas do reino.',
    iconName: 'Sun',
    color: '#F97316',
    passives: [
      {
        id: 'p_lagarto_hp',
        name: 'Resiliência das Dunas',
        description: '+15 de Vida Máxima para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'hp',
        value: 15,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'besouro_bronze',
    name: 'Besouro Casca-Dura',
    species: 'Inseto Couraçado',
    rarity: 'common',
    description: 'Um inseto grande com carapaça reluzente semelhante a bronze polido.',
    lore: 'Sua carapaça foi estudada por armeiros antigos para criar os primeiros escudos redondos.',
    iconName: 'Bug',
    color: '#B45309',
    passives: [
      {
        id: 'p_besouro_def',
        name: 'Carapaça Cobreada',
        description: '+2 de Defesa Física para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'def',
        value: 2,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'caranguejinho_blindado',
    name: 'Caranguejinho da Costa',
    species: 'Crustáceo Litorâneo',
    rarity: 'common',
    description: 'Caminha de lado com duas pinças prontas para beliscar quem ameaçar a equipe.',
    lore: 'Suas conchas resistem ao bater das ondas e das tempestades oceânicas.',
    iconName: 'Anchor',
    color: '#EF4444',
    passives: [
      {
        id: 'p_caranguejo_hp',
        name: 'Vigor Marítimo',
        description: '+15 de Vida Máxima para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'hp',
        value: 15,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'guaxinim_ladino',
    name: 'Guaxinim Mãos-Leves',
    species: 'Fera Travessa',
    rarity: 'common',
    description: 'Usa uma máscara natural de pelos escuros e olha para tudo que reluz.',
    lore: 'Consegue bater carteiras de orcs mesmo em meio ao caos das batalhas campais.',
    iconName: 'Sparkles',
    color: '#78716C',
    passives: [
      {
        id: 'p_guaxinim_gold',
        name: 'Mãos Leves',
        description: '+10% de Ouro obtido ao término das fases',
        type: 'gold_boost',
        value: 10,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'corujinha_vigia',
    name: 'Corujinha Noturna',
    species: 'Ave de Rapina',
    rarity: 'common',
    description: 'Gira a cabeça 270 graus mantendo guarda constante mesmo dormindo.',
    lore: 'Sua sabedoria intuitiva canaliza a concentração mágica dos conjuradores aliados.',
    iconName: 'Eye',
    color: '#6366F1',
    passives: [
      {
        id: 'p_coruja_mag',
        name: 'Foco da Penumbra',
        description: '+2 de Poder Mágico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'mag',
        value: 2,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'passaro_cantador',
    name: 'Canário do Bosque',
    species: 'Pássaro Canoro',
    rarity: 'common',
    description: 'Pequena ave de plumagem amarela vívida cujo chilreio aquece os corações.',
    lore: 'Inspirava os antigos guerreiros durante marchas exaustivas através das neves.',
    iconName: 'Feather',
    color: '#EAB308',
    passives: [
      {
        id: 'p_passaro_atk',
        name: 'Trinado Triunfante',
        description: '+2 de Ataque Físico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'atk',
        value: 2,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'texugo_valente',
    name: 'Texuguinho Teimoso',
    species: 'Fera Destemida',
    rarity: 'common',
    description: 'Nunca recua, mesmo diante de monstros dez vezes maiores que ele.',
    lore: 'Sua teimosia lendária concede proteção mística contra venenos e feitiços.',
    iconName: 'ShieldAlert',
    color: '#71717A',
    passives: [
      {
        id: 'p_texugo_res',
        name: 'Teimosia Primitiva',
        description: '+2 de Resistência Mágica para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'res',
        value: 2,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'cogumelo_saltarico',
    name: 'Micélio Curioso',
    species: 'Fúngico Animado',
    rarity: 'common',
    description: 'Um cogumelinho bípede que solta poeira cintilante a cada passo que dá.',
    lore: 'Esporos simpáticos que aumentam a regeneração e vitalidade celular de quem respira.',
    iconName: 'Flower2',
    color: '#EC4899',
    passives: [
      {
        id: 'p_cogumelo_hp',
        name: 'Esporos de Vitalidade',
        description: '+15 de Vida Máxima para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'hp',
        value: 15,
      },
    ],
    activeSkills: [],
  },

  // =========================================================================
  // INCOMUNS (10 pets) - 2 Efeitos Passivos
  // =========================================================================
  {
    id: 'raposa_chamas',
    name: 'Raposinha Ígnea',
    species: 'Fera Mágica',
    rarity: 'uncommon',
    description: 'Sua cauda queima como uma tocha aconchegante que nunca queima seus aliados.',
    lore: 'Criaturas míticas que farejam minérios e atiçam o fervor bélico dos heróis.',
    iconName: 'Flame',
    color: '#EA580C',
    passives: [
      {
        id: 'p_raposa_atk',
        name: 'Fervor Ígneo',
        description: '+3 de Ataque Físico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'atk',
        value: 3,
      },
      {
        id: 'p_raposa_gold',
        name: 'Faro Flamejante',
        description: '+15% de Ouro obtido ao término das fases',
        type: 'gold_boost',
        value: 15,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'golem_seixo',
    name: 'Mini Golem de Seixo',
    species: 'Construto Terrestre',
    rarity: 'uncommon',
    description: 'Pequenas pedras unidas por energia magnética terrestre.',
    lore: 'Erguido nos templos das montanhas para vigiar os altares de oferendas sagradas.',
    iconName: 'Mountain',
    color: '#65A30D',
    passives: [
      {
        id: 'p_golem_def',
        name: 'Casca Rochosa',
        description: '+3 de Defesa Física para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'def',
        value: 3,
      },
      {
        id: 'p_golem_hp',
        name: 'Núcleo Sísmico',
        description: '+20 de Vida Máxima para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'hp',
        value: 20,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'falcao_ventos',
    name: 'Falcão dos Ventos',
    species: 'Alado Celestial',
    rarity: 'uncommon',
    description: 'Corta o ar com asas afiadas e visão de longo alcance inigualável.',
    lore: 'Voa alto nas correntes termais canalizando a pureza do éter para a equipe.',
    iconName: 'Wind',
    color: '#0284C7',
    passives: [
      {
        id: 'p_falcao_mag',
        name: 'Vento Arcano',
        description: '+3 de Poder Mágico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'mag',
        value: 3,
      },
      {
        id: 'p_falcao_res',
        name: 'Brisa Protetora',
        description: '+3 de Resistência Mágica para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'res',
        value: 3,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'serpente_nevoa',
    name: 'Cobra da Névoa',
    species: 'Réptil Fantasmagórico',
    rarity: 'uncommon',
    description: 'Desliza suavemente pelo ar deixando rastros de vapor esmeralda.',
    lore: 'Habitante dos pântanos nevoentos que confunde agressores com movimentos ilusórios.',
    iconName: 'Waves',
    color: '#10B981',
    passives: [
      {
        id: 'p_serpente_atk',
        name: 'Bote Sorrateiro',
        description: '+3 de Ataque Físico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'atk',
        value: 3,
      },
      {
        id: 'p_serpente_def',
        name: 'Escamas Nebulosas',
        description: '+3 de Defesa Física para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'def',
        value: 3,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'javali_blindado',
    name: 'Javali de Presas',
    species: 'Fera Guerreira',
    rarity: 'uncommon',
    description: 'Robusto, atarracado e com duas presas afiadas que quebram troncos ao meio.',
    lore: 'Sua imponência impulsiona os combatentes a avançarem com vigor renovado.',
    iconName: 'ShieldCheck',
    color: '#B45309',
    passives: [
      {
        id: 'p_javali_hp',
        name: 'Couro Rústico',
        description: '+25 de Vida Máxima para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'hp',
        value: 25,
      },
      {
        id: 'p_javali_def',
        name: 'Presas Defensivas',
        description: '+3 de Defesa Física para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'def',
        value: 3,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'aranha_tecela',
    name: 'Aranha Tecelã de Luz',
    species: 'Aracnídeo Feérico',
    rarity: 'uncommon',
    description: 'Tece fios brilhantes que captam reflexos de ouro e poder místico.',
    lore: 'Suas teias não capturam moscas, mas sim lampejos de fortuna e essência mágica.',
    iconName: 'Sparkles',
    color: '#8B5CF6',
    passives: [
      {
        id: 'p_aranha_mag',
        name: 'Fios Arcanos',
        description: '+3 de Poder Mágico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'mag',
        value: 3,
      },
      {
        id: 'p_aranha_gold',
        name: 'Teia Dourada',
        description: '+15% de Ouro obtido ao término das fases',
        type: 'gold_boost',
        value: 15,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'fada_floresta',
    name: 'Fada dos Bosques',
    species: 'Espírito Feérico',
    rarity: 'uncommon',
    description: 'Brilha com luz tênue e emite pequenos risos harmoniosos.',
    lore: 'Bênçãos feéricas que afastam feitiços maléficos e concedem serenidade curativa.',
    iconName: 'Heart',
    color: '#14B8A6',
    passives: [
      {
        id: 'p_fada_res',
        name: 'Aura Feérica',
        description: '+3 de Resistência Mágica para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'res',
        value: 3,
      },
      {
        id: 'p_fada_hp',
        name: 'Bênção de Vitalidade',
        description: '+25 de Vida Máxima para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'hp',
        value: 25,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'salamandra_fogo',
    name: 'Salamandra de Lava',
    species: 'Elemental de Chamas',
    rarity: 'uncommon',
    description: 'Rasteja sobre brasas sem queimar e irradia calor destrutivo.',
    lore: 'Incentiva a fusão entre a força bruta das armas e o calor de magias ofensivas.',
    iconName: 'Zap',
    color: '#F43F5E',
    passives: [
      {
        id: 'p_sala_atk',
        name: 'Calor Ofensivo',
        description: '+3 de Ataque Físico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'atk',
        value: 3,
      },
      {
        id: 'p_sala_mag',
        name: 'Brasa Arcana',
        description: '+3 de Poder Mágico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'mag',
        value: 3,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'texugo_ferro',
    name: 'Texugo de Ferro',
    species: 'Fera Metalizada',
    rarity: 'uncommon',
    description: 'Possui placas ósseas nas costas que parecem ferro fundido.',
    lore: 'Dureza inabalável que resiste a lâminas pesadas e feitiços de impacto.',
    iconName: 'Shield',
    color: '#475569',
    passives: [
      {
        id: 'p_texugo_f_def',
        name: 'Armadura Natural',
        description: '+4 de Defesa Física para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'def',
        value: 4,
      },
      {
        id: 'p_texugo_f_res',
        name: 'Resistência de Aço',
        description: '+2 de Resistência Mágica para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'res',
        value: 2,
      },
    ],
    activeSkills: [],
  },
  {
    id: 'urso_polar_filhote',
    name: 'Ursinho Glacial',
    species: 'Fera das Neves',
    rarity: 'uncommon',
    description: 'Patinhas grossas e pelo denso impermeável ao frio congelante.',
    lore: 'O calor deste filhote sustenta os heróis através de combates prolongados e extenuantes.',
    iconName: 'Snowflake',
    color: '#38BDF8',
    passives: [
      {
        id: 'p_urso_hp',
        name: 'Vigor Hibernal',
        description: '+30 de Vida Máxima para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'hp',
        value: 30,
      },
      {
        id: 'p_urso_atk',
        name: 'Pataço Glacial',
        description: '+3 de Ataque Físico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'atk',
        value: 3,
      },
    ],
    activeSkills: [],
  },

  // =========================================================================
  // RAROS (8 pets) - 2 Efeitos (1 Passiva + 1 Habilidade Ativa em Batalha)
  // =========================================================================
  {
    id: 'grifo_celestial',
    name: 'Grifinho Dourado',
    species: 'Fera Mítica Alada',
    rarity: 'rare',
    description: 'Cabeça e asas de águia majestosa com o corpo dourado de um leão jovem.',
    lore: 'Despenca dos céus em rasantes impressionantes para salvar aliados cercados.',
    iconName: 'Feather',
    color: '#3B82F6',
    passives: [
      {
        id: 'p_grifo_atk',
        name: 'Garras Aristocráticas',
        description: '+4 de Ataque Físico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'atk',
        value: 4,
      },
    ],
    activeSkills: [
      {
        id: 'pet_mergulho_vendaval',
        name: 'Mergulho Vendaval',
        description: 'O Grifinho mergulha sobre uma área (alcance 4, raio 1) causando 140% do maior Ataque Físico da equipe como dano físico a todos os inimigos.',
        iconName: 'Wind',
        damageType: 'physical',
        power: 1.4,
        scalingStat: 'atk',
        rangeMin: 1,
        rangeMax: 4,
        aoeRadius: 1,
        aoeType: 'circle',
        targetType: 'enemy',
      },
    ],
  },
  {
    id: 'espirito_rio',
    name: 'Espírito das Águas',
    species: 'Elemental Primordial',
    rarity: 'rare',
    description: 'Fluido e cristalino, assume a forma de uma lontra límpida feita de água pura.',
    lore: 'As nascentes sagradas concedem pureza absoluta capaz de lavar feridas e aflições.',
    iconName: 'Droplets',
    color: '#06B6D4',
    passives: [
      {
        id: 'p_rio_hp',
        name: 'Fonte da Juventude',
        description: '+30 de Vida Máxima para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'hp',
        value: 30,
      },
    ],
    activeSkills: [
      {
        id: 'pet_onda_purificadora',
        name: 'Onda Purificadora',
        description: 'Lança uma torrente purificadora (alcance 4, raio 1) que cura 120% do maior Poder Mágico da equipe e remove debuffs de todos os aliados atingidos.',
        iconName: 'Waves',
        damageType: 'healing',
        power: 1.2,
        healMultiplier: 1.2,
        scalingStat: 'mag',
        rangeMin: 0,
        rangeMax: 4,
        aoeRadius: 1,
        aoeType: 'circle',
        targetType: 'ally',
        cleansesDebuffs: true,
      },
    ],
  },
  {
    id: 'lobo_trovao',
    name: 'Lobo da Tempestade',
    species: 'Elemental Voltaico',
    rarity: 'rare',
    description: 'Pelagem azul-elétrica que estala pequenas faíscas contínuas no ar.',
    lore: 'Canaliza trovões das nuvens de tempestade para sobrecarregar as defesas de monstros.',
    iconName: 'Zap',
    color: '#6366F1',
    passives: [
      {
        id: 'p_lobo_t_mag',
        name: 'Carga Eletrostática',
        description: '+4 de Poder Mágico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'mag',
        value: 4,
      },
    ],
    activeSkills: [
      {
        id: 'pet_raio_prateado',
        name: 'Raio Estaladiço',
        description: 'Dispara uma descarga elétrica certeira (alcance 5) que causa 150% do maior Poder Mágico da equipe como dano mágico e aplica Lentidão por 2 turnos.',
        iconName: 'Zap',
        damageType: 'magical',
        power: 1.5,
        scalingStat: 'mag',
        rangeMin: 1,
        rangeMax: 5,
        aoeRadius: 0,
        targetType: 'enemy',
        statusEffect: {
          type: 'slow',
          duration: 2,
          value: 1,
        },
      },
    ],
  },
  {
    id: 'pantera_espectral',
    name: 'Pantera da Penumbra',
    species: 'Fera Etérea',
    rarity: 'rare',
    description: 'Move-se sem emitir nenhum som e parece desaparecer nos cantos escuros.',
    lore: 'Caça nos limiares do mundo espiritual, trazendo fortunas sombrias aos seus mestres.',
    iconName: 'EyeOff',
    color: '#8B5CF6',
    passives: [
      {
        id: 'p_pantera_gold',
        name: 'Pilhagem Noturna',
        description: '+20% de Ouro obtido ao término das fases',
        type: 'gold_boost',
        value: 20,
      },
    ],
    activeSkills: [
      {
        id: 'pet_manto_sombras',
        name: 'Manto da Noite',
        description: 'Envolve um herói aliado (alcance 3) com sombras místicas, concedendo Invisibilidade por 1 turno e +30% de Dano.',
        iconName: 'Eye',
        damageType: 'healing',
        rangeMin: 0,
        rangeMax: 3,
        aoeRadius: 0,
        targetType: 'ally',
        statusEffect: {
          type: 'invisible',
          duration: 1,
          value: 0,
        },
        buffAtkAmount: 30,
        buffDuration: 1,
      },
    ],
  },
  {
    id: 'fenix_mirim',
    name: 'Filhote de Fênix',
    species: 'Pássaro Imortal',
    rarity: 'rare',
    description: 'Um pássaro carmim em chamas vivas cujas penas exalam aroma de incenso.',
    lore: 'Nascido de brasas sagradas que recusam a morte, protege seus aliados com calor imortal.',
    iconName: 'Flame',
    color: '#F97316',
    passives: [
      {
        id: 'p_fenix_res',
        name: 'Aura Solar',
        description: '+4 de Resistência Mágica para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'res',
        value: 4,
      },
    ],
    activeSkills: [
      {
        id: 'pet_cinzas_renascentes',
        name: 'Chama de Renascimento',
        description: 'Abençoa um herói aliado (alcance 4), curando 100% da maior Magia da equipe e concedendo 120% da maior Magia como Escudo protetor.',
        iconName: 'HeartPulse',
        damageType: 'healing',
        power: 1.0,
        healMultiplier: 1.0,
        shieldMultiplier: 1.2,
        scalingStat: 'mag',
        rangeMin: 0,
        rangeMax: 4,
        aoeRadius: 0,
        targetType: 'ally',
      },
    ],
  },
  {
    id: 'basilisco_jade',
    name: 'Basilisco de Jade',
    species: 'Réptil Petrificante',
    rarity: 'rare',
    description: 'Olhos de esmeralda luminosa que intimidam qualquer criatura que cruzar seu olhar.',
    lore: 'Uma raça rara de basiliscos que jurou lealdade aos campeões das ordens táticas.',
    iconName: 'ShieldAlert',
    color: '#10B981',
    passives: [
      {
        id: 'p_basilisco_def',
        name: 'Escama Mineral',
        description: '+4 de Defesa Física para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'def',
        value: 4,
      },
    ],
    activeSkills: [
      {
        id: 'pet_olhar_petrificante',
        name: 'Olhar de Jade',
        description: 'Encara um monstro inimigo (alcance 4), causando 130% do maior Poder Mágico da equipe como dano e enfraquecendo sua armadura (-4 Defesa por 2 turnos).',
        iconName: 'Eye',
        damageType: 'magical',
        power: 1.3,
        scalingStat: 'mag',
        rangeMin: 1,
        rangeMax: 4,
        aoeRadius: 0,
        targetType: 'enemy',
        statusEffect: {
          type: 'debuff_def',
          duration: 2,
          value: 4,
        },
      },
    ],
  },
  {
    id: 'gargula_quartzo',
    name: 'Gárgula de Quartzo',
    species: 'Construto Rúnico',
    rarity: 'rare',
    description: 'Asas de pedra translúcida e coração de cristal pulsante.',
    lore: 'Projetada para proteger santuários arcanos contra invasões de feras selvagens.',
    iconName: 'ShieldCheck',
    color: '#A855F7',
    passives: [
      {
        id: 'p_gargula_hp',
        name: 'Estrutura Cristalina',
        description: '+35 de Vida Máxima para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'hp',
        value: 35,
      },
    ],
    activeSkills: [
      {
        id: 'pet_barreira_quartzo',
        name: 'Fortaleza Prismática',
        description: 'Cria uma abóbada de cristal (alcance 3, raio 1) que concede 110% do maior Poder Mágico da equipe como Escudo a todos os aliados na área.',
        iconName: 'Shield',
        damageType: 'healing',
        power: 1.1,
        shieldMultiplier: 1.1,
        scalingStat: 'mag',
        rangeMin: 0,
        rangeMax: 3,
        aoeRadius: 1,
        aoeType: 'circle',
        targetType: 'ally',
      },
    ],
  },
  {
    id: 'guardiao_bosque',
    name: 'Brotinho Guardião',
    species: 'Ent Ancestral Mirim',
    rarity: 'rare',
    description: 'Um pequeno tronco vivo com brotos verdes florescendo na cabeça.',
    lore: 'Conecta-se com a terra viva para prender as pernas dos invasores com raízes fortes.',
    iconName: 'Trees',
    color: '#15803D',
    passives: [
      {
        id: 'p_guardiao_mag',
        name: 'Ressonância Florestal',
        description: '+4 de Poder Mágico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'mag',
        value: 4,
      },
    ],
    activeSkills: [
      {
        id: 'pet_raizes_estranguladoras',
        name: 'Raízes Vivas',
        description: 'Brota raízes do solo sob um monstro inimigo (alcance 4), causando 120% do maior Poder Mágico da equipe como dano e Atordoando-o por 1 turno.',
        iconName: 'Flower2',
        damageType: 'magical',
        power: 1.2,
        scalingStat: 'mag',
        rangeMin: 1,
        rangeMax: 4,
        aoeRadius: 0,
        targetType: 'enemy',
        statusEffect: {
          type: 'stun',
          duration: 1,
          value: 0,
        },
      },
    ],
  },

  // =========================================================================
  // ÉPICOS (5 pets) - 3 Efeitos (2 Passivas + 1 Habilidade Ativa em Batalha)
  // =========================================================================
  {
    id: 'draco_incandescente',
    name: 'Draco Vulcânico',
    species: 'Dragão de Magma',
    rarity: 'epic',
    description: 'Um jovem dragão que exala fumaça sulfurosa e calor avassalador.',
    lore: 'Nascido nas caldeiras dos vulcões mais profundos, seu poder aquece o espírito combativo.',
    iconName: 'Flame',
    color: '#DC2626',
    passives: [
      {
        id: 'p_draco_atk',
        name: 'Fúria Dracônica',
        description: '+5 de Ataque Físico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'atk',
        value: 5,
      },
      {
        id: 'p_draco_hp',
        name: 'Vitalidade do Magma',
        description: '+30 de Vida Máxima para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'hp',
        value: 30,
      },
    ],
    activeSkills: [
      {
        id: 'pet_sopro_magma',
        name: 'Sopro de Lava',
        description: 'Expele um cone devastador de fogo líquido (alcance 4, raio 1), causando 160% do maior Poder Mágico da equipe como dano mágico a todos os inimigos e Queimadura por 2 turnos.',
        iconName: 'Flame',
        damageType: 'magical',
        power: 1.6,
        scalingStat: 'mag',
        rangeMin: 1,
        rangeMax: 4,
        aoeRadius: 1,
        aoeType: 'circle',
        targetType: 'enemy',
        statusEffect: {
          type: 'burn',
          duration: 2,
          value: 8,
        },
      },
    ],
  },
  {
    id: 'quimera_sombras',
    name: 'Quimera Abissal',
    species: 'Criatura das Trevas',
    rarity: 'epic',
    description: 'Corpo leonino com asas de morcego e cauda de serpente com escamas arroxeadas.',
    lore: 'Sua presença enfraquece o ânimo de qualquer oponente que ouse erguer armas.',
    iconName: 'Skull',
    color: '#9333EA',
    passives: [
      {
        id: 'p_quimera_mag',
        name: 'Poder das Sombras',
        description: '+5 de Poder Mágico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'mag',
        value: 5,
      },
      {
        id: 'p_quimera_gold',
        name: 'Pilhagem do Submundo',
        description: '+25% de Ouro obtido ao término das fases',
        type: 'gold_boost',
        value: 25,
      },
    ],
    activeSkills: [
      {
        id: 'pet_uivo_pesadelo',
        name: 'Uivo do Pesadelo',
        description: 'Emite um rugido sobrenatural (alcance 4, raio 1) causando 140% do maior Poder Mágico da equipe como dano e reduzindo o Ataque dos monstros atingidos em 25% por 2 turnos.',
        iconName: 'Skull',
        damageType: 'magical',
        power: 1.4,
        scalingStat: 'mag',
        rangeMin: 1,
        rangeMax: 4,
        aoeRadius: 1,
        aoeType: 'circle',
        targetType: 'enemy',
      },
    ],
  },
  {
    id: 'tita_obsidiana',
    name: 'Colosso de Obsidiana',
    species: 'Elemental Titânico',
    rarity: 'epic',
    description: 'Formado por vidro vulcânico negro indestrutível com runas douradas cravadas.',
    lore: 'As lendas contam que este pequeno titã foi lapidado no coração do núcleo do mundo.',
    iconName: 'Shield',
    color: '#312E81',
    passives: [
      {
        id: 'p_tita_def',
        name: 'Armadura Vulcânica',
        description: '+6 de Defesa Física para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'def',
        value: 6,
      },
      {
        id: 'p_tita_hp',
        name: 'Massa Monumental',
        description: '+40 de Vida Máxima para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'hp',
        value: 40,
      },
    ],
    activeSkills: [
      {
        id: 'pet_muralha_sismica',
        name: 'Bastião Sísmico',
        description: 'Concede uma couraça esmagadora a um herói aliado (alcance 3), provendo 160% da maior Defesa Física da equipe como Escudo e Provocando inimigos próximos por 1 turno.',
        iconName: 'ShieldAlert',
        damageType: 'healing',
        power: 1.6,
        shieldMultiplier: 1.6,
        scalingStat: 'def',
        rangeMin: 0,
        rangeMax: 3,
        aoeRadius: 0,
        targetType: 'ally',
        statusEffect: {
          type: 'taunt',
          duration: 1,
          value: 0,
        },
      },
    ],
  },
  {
    id: 'serpente_vazio',
    name: 'Víbora do Vazio',
    species: 'Entidade Cósmica',
    rarity: 'epic',
    description: 'Corpo ondulante de matéria escura cintilando como um pedaço do céu estrelado.',
    lore: 'Despreza as leis da física tradicional, atravessando defesas materiais sem esforço.',
    iconName: 'Moon',
    color: '#6366F1',
    passives: [
      {
        id: 'p_serp_res',
        name: 'Éter Impenetrável',
        description: '+5 de Resistência Mágica para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'res',
        value: 5,
      },
      {
        id: 'p_serp_atk',
        name: 'Presas Cósmicas',
        description: '+5 de Ataque Físico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'atk',
        value: 5,
      },
    ],
    activeSkills: [
      {
        id: 'pet_fenda_vazio',
        name: 'Fenda do Vazio',
        description: 'Abre uma distorção singular em um inimigo (alcance 5) causando 180% do maior Poder Mágico da equipe como dano com 50% de perfuração de armadura e resistência.',
        iconName: 'Sparkles',
        damageType: 'magical',
        power: 1.8,
        scalingStat: 'mag',
        rangeMin: 1,
        rangeMax: 5,
        aoeRadius: 0,
        targetType: 'enemy',
        defenseIgnoreRatio: 0.5,
      },
    ],
  },
  {
    id: 'aguia_cristal',
    name: 'Águia de Cristal Astral',
    species: 'Celestial Prismático',
    rarity: 'epic',
    description: 'Asas facetadas em quartzo puríssimo que refratam luz solar em arcos-íris fulgurantes.',
    lore: 'Mensageira dos picos celestes, sua presença concede mobilidade e clareza divina.',
    iconName: 'Sun',
    color: '#0EA5E9',
    passives: [
      {
        id: 'p_aguia_mov',
        name: 'Voo Celestial',
        description: '+1 de Movimento para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'mov',
        value: 1,
      },
      {
        id: 'p_aguia_mag',
        name: 'Luz Estelar',
        description: '+4 de Poder Mágico para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'mag',
        value: 4,
      },
    ],
    activeSkills: [
      {
        id: 'pet_luz_prismatica',
        name: 'Raios Prismáticos',
        description: 'Dispara uma tempestade de luz purificante (alcance 5, raio 2) que cura 130% da maior Magia da equipe e concede 100% da maior Magia como Escudo a todos os heróis na área.',
        iconName: 'Sun',
        damageType: 'healing',
        power: 1.3,
        healMultiplier: 1.3,
        shieldMultiplier: 1.0,
        scalingStat: 'mag',
        rangeMin: 0,
        rangeMax: 5,
        aoeRadius: 2,
        aoeType: 'circle',
        targetType: 'ally',
      },
    ],
  },

  // =========================================================================
  // LENDÁRIOS (3 pets) - 3 Efeitos Passivos + 2 Habilidades Ativas em Batalha
  // =========================================================================
  {
    id: 'dragao_aurora',
    name: 'Dragão da Aurora Boreal',
    species: 'Divindade Dracônica',
    rarity: 'legendary',
    description: 'Um dragão imponente envolto em cortinas de luz esmeralda, anil e dourada.',
    lore: 'Soberano das altas atmosferas celestes. O bater de suas asas reorganiza o fluxo da vida e da morte no tabuleiro.',
    iconName: 'Crown',
    color: '#EAB308',
    passives: [
      {
        id: 'p_aurora_hp',
        name: 'Graça da Criação',
        description: '+50 de Vida Máxima para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'hp',
        value: 50,
      },
      {
        id: 'p_aurora_stats',
        name: 'Ressonância Boreal',
        description: '+6 de Ataque Físico e +6 de Poder Mágico para todos os heróis',
        type: 'stat_boost',
        stat: 'atk',
        value: 6,
      },
      {
        id: 'p_aurora_gold',
        name: 'Cortejo Dourado',
        description: '+35% de Ouro obtido ao término das fases',
        type: 'gold_boost',
        value: 35,
      },
    ],
    activeSkills: [
      {
        id: 'pet_chama_solar_aurora',
        name: 'Chama Solar da Criação',
        description: 'Libera a energia pura da Aurora em uma vasta área (alcance 5, raio 2): cura 150% da maior Magia da equipe aos aliados e causa 150% da maior Magia como dano radiante aos inimigos.',
        iconName: 'Sun',
        damageType: 'magical',
        power: 1.5,
        healMultiplier: 1.5,
        scalingStat: 'mag',
        rangeMin: 0,
        rangeMax: 5,
        aoeRadius: 2,
        aoeType: 'circle',
        targetType: 'any',
      },
      {
        id: 'pet_julgamento_aurora',
        name: 'Julgamento Polar',
        description: 'Invoca um feixe celestial avassalador em um inimigo (alcance 6), causando 220% do maior Poder Mágico da equipe como dano e Atordoando o alvo por 1 turno.',
        iconName: 'Zap',
        damageType: 'magical',
        power: 2.2,
        scalingStat: 'mag',
        rangeMin: 1,
        rangeMax: 6,
        aoeRadius: 0,
        targetType: 'enemy',
        statusEffect: {
          type: 'stun',
          duration: 1,
          value: 0,
        },
      },
    ],
  },
  {
    id: 'behemoth_ancestral',
    name: 'Behemoth das Eras',
    species: 'Titã da Criação Terrestre',
    rarity: 'legendary',
    description: 'Um titã quadrúpede colossal recoberto de florestas seculares e rochas sagradas.',
    lore: 'Existia antes do surgimento das primeiras montanhas. O som de seus passos acalma tremores e fortifica os corações mortais.',
    iconName: 'Shield',
    color: '#D97706',
    passives: [
      {
        id: 'p_behemoth_resist',
        name: 'Couraça Geológica',
        description: '+8 de Defesa Física e +8 de Resistência Mágica para todos os heróis',
        type: 'stat_boost',
        stat: 'def',
        value: 8,
      },
      {
        id: 'p_behemoth_hp',
        name: 'Raízes Eternas',
        description: '+60 de Vida Máxima para todos os heróis da equipe',
        type: 'stat_boost',
        stat: 'hp',
        value: 60,
      },
      {
        id: 'p_behemoth_regen',
        name: 'Seiva das Eras',
        description: '+6 de Regeneração de Vida por turno para todos os heróis em combate',
        type: 'hp_regen',
        value: 6,
      },
    ],
    activeSkills: [
      {
        id: 'pet_bastiao_inexpugnavel',
        name: 'Bastião Inexpugnável',
        description: 'Ergue uma fortaleza telúrica global (alcance 8, raio 2): concede 180% da maior Defesa Física da equipe como Escudo a todos os heróis aliados.',
        iconName: 'ShieldCheck',
        damageType: 'healing',
        power: 1.8,
        shieldMultiplier: 1.8,
        scalingStat: 'def',
        rangeMin: 0,
        rangeMax: 8,
        aoeRadius: 2,
        aoeType: 'circle',
        targetType: 'ally',
      },
      {
        id: 'pet_fissura_tectonica',
        name: 'Fissura Tectônica',
        description: 'Esmaga as placas continentais (alcance 5, raio 2), causando 190% do maior Ataque Físico da equipe como dano físico e empurrando inimigos atingidos 2 casas.',
        iconName: 'Mountain',
        damageType: 'physical',
        power: 1.9,
        scalingStat: 'atk',
        rangeMin: 1,
        rangeMax: 5,
        aoeRadius: 2,
        aoeType: 'circle',
        targetType: 'enemy',
        knockback: 2,
      },
    ],
  },
  {
    id: 'leviata_estelar',
    name: 'Leviatã das Constelações',
    species: 'Dragão Astral Cósmico',
    rarity: 'legendary',
    description: 'Navega pelo vácuo entre as galáxias, emitindo canções astrais que manipulam o espaço.',
    lore: 'Entidade primordial venerada pelos primeiros arcanistas. Permite dobrar o alcance das armas e magias dos campeões.',
    iconName: 'Sparkles',
    color: '#8B5CF6',
    passives: [
      {
        id: 'p_leviata_dmg',
        name: 'Convergência Estelar',
        description: '+7 de Ataque Físico e +7 de Poder Mágico para todos os heróis',
        type: 'stat_boost',
        stat: 'atk',
        value: 7,
      },
      {
        id: 'p_leviata_range',
        name: 'Distorção de Alcance',
        description: '+1 de Alcance para ataques básicos e habilidades de todos os heróis',
        type: 'stat_boost',
        stat: 'range',
        value: 1,
      },
      {
        id: 'p_leviata_gold',
        name: 'Nebulosa Dourada',
        description: '+50% de Ouro obtido ao término das fases',
        type: 'gold_boost',
        value: 50,
      },
    ],
    activeSkills: [
      {
        id: 'pet_chuva_meteoros_estelares',
        name: 'Chuva de Meteoros Cósmicos',
        description: 'Bombardeia o campo de batalha (alcance 6, raio 2) com cometas astrais, causando 200% do maior Poder Mágico da equipe como dano mágico devastador a todos os inimigos.',
        iconName: 'Sparkles',
        damageType: 'magical',
        power: 2.0,
        scalingStat: 'mag',
        rangeMin: 1,
        rangeMax: 6,
        aoeRadius: 2,
        aoeType: 'circle',
        targetType: 'enemy',
      },
      {
        id: 'pet_fenda_temporal',
        name: 'Distorção Espaço-Temporal',
        description: 'Dobra o tempo ao redor de um herói aliado (alcance 4), concedendo 160% do maior Poder Mágico da equipe como Escudo e limpando todos os debuffs negativos.',
        iconName: 'RotateCcw',
        damageType: 'healing',
        power: 1.6,
        shieldMultiplier: 1.6,
        scalingStat: 'mag',
        rangeMin: 0,
        rangeMax: 4,
        aoeRadius: 0,
        targetType: 'ally',
        cleansesDebuffs: true,
      },
    ],
  },
];

// Map para busca ultra rápida por ID
export const PET_MAP: Record<string, PetDefinition> = PETS.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {} as Record<string, PetDefinition>);

export function getPetById(id?: string | null): PetDefinition | null {
  if (!id) return null;
  return PET_MAP[id] || null;
}

export function getPetsByRarity(rarity: PetRarity): PetDefinition[] {
  return PETS.filter((p) => p.rarity === rarity);
}

/**
 * Rola a raridade de um ovo com base nas probabilidades oficiais:
 * 40% comum, 30% incomum, 20% raro, 9% épico, 1% lendário.
 */
export function rollEggRarity(): PetRarity {
  const roll = Math.random() * 100;
  if (roll < 40) return 'common'; // 0 .. 39.999
  if (roll < 70) return 'uncommon'; // 40 .. 69.999 (30%)
  if (roll < 90) return 'rare'; // 70 .. 89.999 (20%)
  if (roll < 99) return 'epic'; // 90 .. 98.999 (9%)
  return 'legendary'; // 99 .. 100 (1%)
}

/**
 * Cria uma nova instância de ovo
 */
export function createNewEgg(forcedRarity?: PetRarity): PetEgg {
  const rarity = forcedRarity || rollEggRarity();
  return {
    id: `egg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    rarity,
    acquiredAt: Date.now(),
    incubatingStartedAt: null,
    hatchDurationMs: getHatchDuration(rarity),
  };
}

/**
 * Sorteia um pet aleatório de uma raridade
 */
export function rollPetFromEgg(rarity: PetRarity): PetDefinition {
  const pool = getPetsByRarity(rarity);
  if (pool.length === 0) return PETS[0];
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

/**
 * Valor de ouro caso o jogador receba um pet repetido
 */
export function getDuplicateGoldReward(rarity: PetRarity): number {
  return PET_RARITY_CONFIG[rarity]?.duplicateGold || 1000;
}

/**
 * Calcula os bônus passivos consolidados do pet equipado
 */
export function calculatePetPassives(pet: PetDefinition | null | undefined) {
  const stats: {
    hp: number;
    atk: number;
    def: number;
    mag: number;
    res: number;
    mov: number;
    range: number;
  } = {
    hp: 0,
    atk: 0,
    def: 0,
    mag: 0,
    res: 0,
    mov: 0,
    range: 0,
  };

  let goldBoostPercent = 0;
  let shieldStart = 0;
  let hpRegenPerTurn = 0;

  if (!pet || !pet.passives) {
    return { stats, goldBoostPercent, shieldStart, hpRegenPerTurn };
  }

  for (const p of pet.passives) {
    if (p.type === 'stat_boost' && p.stat) {
      stats[p.stat] = (stats[p.stat] || 0) + p.value;
    } else if (p.type === 'gold_boost') {
      goldBoostPercent += p.value;
    } else if (p.type === 'shield_start') {
      shieldStart += p.value;
    } else if (p.type === 'hp_regen') {
      hpRegenPerTurn += p.value;
    }
  }

  return {
    stats,
    goldBoostPercent,
    shieldStart,
    hpRegenPerTurn,
  };
}
