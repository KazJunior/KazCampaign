import type { ItemCategory, ItemDefinition, ItemRarity } from '../types/game';

export const RARITY_INFO: Record<ItemRarity, { label: string; color: string; bg: string; border: string; weight: number }> = {
  common: {
    label: 'Comum',
    color: '#A7B0C4',
    bg: 'bg-[#A7B0C4]/10',
    border: 'border-[#A7B0C4]/40',
    weight: 60,
  },
  rare: {
    label: 'Raro',
    color: '#4C8DFF',
    bg: 'bg-[#4C8DFF]/15',
    border: 'border-[#4C8DFF]/50',
    weight: 26,
  },
  epic: {
    label: 'Épico',
    color: '#B58AFF',
    bg: 'bg-[#B58AFF]/15',
    border: 'border-[#B58AFF]/50',
    weight: 11,
  },
  legendary: {
    label: 'Lendário',
    color: '#F0B44D',
    bg: 'bg-[#F0B44D]/20',
    border: 'border-[#F0B44D]/60',
    weight: 3,
  },
};

export const CATEGORY_INFO: Record<ItemCategory, { label: string; icon: string }> = {
  helmet: { label: 'Capacete', icon: 'HardHat' },
  chestplate: { label: 'Peitoral', icon: 'Shield' },
  leggings: { label: 'Calça', icon: 'Layers' },
  boots: { label: 'Bota', icon: 'Footprints' },
  weapon: { label: 'Arma', icon: 'Swords' },
  accessory: { label: 'Acessório', icon: 'Gem' },
};

export const ITEMS: Record<string, ItemDefinition> = {
  // =========================================================================
  // 1. GOBLIN (3 Items)
  // =========================================================================
  adaga_enferrujada: {
    id: 'adaga_enferrujada',
    name: 'Adaga de Sucata Goblin',
    category: 'weapon',
    rarity: 'common',
    description: 'Lâmina serrilhada e enferrujada que corta com agilidade desajeitada.',
    iconName: 'PocketKnife',
    color: '#E65353',
    stats: { atk: 4, hp: 10 },
    droppedByMonsterTypeIds: ['goblin'],
  },
  gorro_do_batedor: {
    id: 'gorro_do_batedor',
    name: 'Gorro do Batedor Goblin',
    category: 'helmet',
    rarity: 'common',
    description: 'Capuz de couro puído com penas que concedem camuflagem na vegetação.',
    iconName: 'Feather',
    color: '#4CAF50',
    stats: { hp: 15, def: 1, res: 1 },
    droppedByMonsterTypeIds: ['goblin'],
  },
  amuleto_dente_de_lobo: {
    id: 'amuleto_dente_de_lobo',
    name: 'Amuleto Dente de Fera',
    category: 'accessory',
    rarity: 'rare',
    description: 'Colar de presas amarradas em corda rústica que desperta instintos predatórios.',
    iconName: 'Bone',
    color: '#FF9800',
    stats: { atk: 3, mov: 1 },
    droppedByMonsterTypeIds: ['goblin'],
  },

  // =========================================================================
  // 2. ORC GUERREIRO (3 Items)
  // =========================================================================
  machado_de_guerra_orc: {
    id: 'machado_de_guerra_orc',
    name: 'Machado da Horda Orc',
    category: 'weapon',
    rarity: 'common',
    description: 'Lâmina dupla pesada forjada para partir armaduras ao meio.',
    iconName: 'Axe',
    color: '#D93838',
    stats: { atk: 6, hp: 15 },
    droppedByMonsterTypeIds: ['orc'],
  },
  peitoral_de_ferro_bruto: {
    id: 'peitoral_de_ferro_bruto',
    name: 'Peitoral de Ferro Bruto',
    category: 'chestplate',
    rarity: 'common',
    description: 'Placas grossas de ferro rebitadas sem polimento, puro vigor de proteção.',
    iconName: 'Shield',
    color: '#78909C',
    stats: { hp: 30, def: 3 },
    droppedByMonsterTypeIds: ['orc'],
  },
  perneiras_de_couro_batido: {
    id: 'perneiras_de_couro_batido',
    name: 'Perneiras de Fúria Orc',
    category: 'leggings',
    rarity: 'rare',
    description: 'Calças reforçadas com placas metálicas que sustentam pisadas sísmicas.',
    iconName: 'Layers',
    color: '#8D6E63',
    stats: { hp: 25, def: 2, atk: 2 },
    droppedByMonsterTypeIds: ['orc'],
  },

  // =========================================================================
  // 3. ARANHA SOMBRIA (3 Items)
  // =========================================================================
  botas_do_rastejante: {
    id: 'botas_do_rastejante',
    name: 'Botas do Tecelão Sombrio',
    category: 'boots',
    rarity: 'common',
    description: 'Botas leves confeccionadas com seda aracnídea que deslizam sem ruído.',
    iconName: 'Footprints',
    color: '#9C27B0',
    stats: { hp: 15, mov: 1 },
    droppedByMonsterTypeIds: ['aranha'],
  },
  elmo_olhos_venenosos: {
    id: 'elmo_olhos_venenosos',
    name: 'Máscara dos Oito Olhos',
    category: 'helmet',
    rarity: 'rare',
    description: 'Visor macabro que amplia a percepção sensorial mágica no escuro.',
    iconName: 'Eye',
    color: '#BA68C8',
    stats: { hp: 20, mag: 3, res: 2 },
    droppedByMonsterTypeIds: ['aranha'],
  },
  anel_peconhento: {
    id: 'anel_peconhento',
    name: 'Anel da Glândula Tóxica',
    category: 'accessory',
    rarity: 'rare',
    description: 'Jóia esverdeada gotejando veneno que banha os ataques com toxina.',
    iconName: 'CircleDot',
    color: '#00E676',
    stats: { atk: 3, mag: 3, hp: 15 },
    droppedByMonsterTypeIds: ['aranha'],
  },

  // =========================================================================
  // 4. MAGO DAS TREVAS (3 Items)
  // =========================================================================
  cajado_do_ocultista: {
    id: 'cajado_do_ocultista',
    name: 'Cajado de Obsidiana Oculta',
    category: 'weapon',
    rarity: 'rare',
    description: 'Haste de madeira negra entrelaçada que canaliza feitiços sombrios.',
    iconName: 'Wand2',
    color: '#7E57C2',
    stats: { mag: 6, res: 2 },
    droppedByMonsterTypeIds: ['mago_trevas'],
  },
  manto_das_sombras: {
    id: 'manto_das_sombras',
    name: 'Túnica do Crepúsculo Vazio',
    category: 'chestplate',
    rarity: 'rare',
    description: 'Tecido etéreo que absorve feitiços e dissipa o impacto mágico.',
    iconName: 'Shirt',
    color: '#5E35B1',
    stats: { hp: 25, mag: 3, res: 4 },
    droppedByMonsterTypeIds: ['mago_trevas'],
  },
  capuz_do_vazio: {
    id: 'capuz_do_vazio',
    name: 'Capuz do Eclipse Arcano',
    category: 'helmet',
    rarity: 'epic',
    description: 'Capuz envolto em névoa negra pulsante que amplifica magias em área.',
    iconName: 'Moon',
    color: '#9575CD',
    stats: { hp: 30, mag: 6, res: 3 },
    droppedByMonsterTypeIds: ['mago_trevas'],
  },

  // =========================================================================
  // 5. LOBO ESPECTRAL (3 Items)
  // =========================================================================
  garras_fantasmagoricas: {
    id: 'garras_fantasmagoricas',
    name: 'Garras da Matilha Espectral',
    category: 'weapon',
    rarity: 'rare',
    description: 'Manoplas com pontas azuladas que rasgam matéria física e espectral.',
    iconName: 'Swords',
    color: '#29B6F6',
    stats: { atk: 5, mag: 3 },
    droppedByMonsterTypeIds: ['lobo_espectral'],
  },
  sapatos_etereos: {
    id: 'sapatos_etereos',
    name: 'Passos da Bruma Noturna',
    category: 'boots',
    rarity: 'rare',
    description: 'Sapatos que quase não tocam o chão, permitindo passadas fantasmagóricas.',
    iconName: 'Compass',
    color: '#00E5FF',
    stats: { hp: 20, res: 2, mov: 1 },
    droppedByMonsterTypeIds: ['lobo_espectral'],
  },
  manto_pele_de_lobo: {
    id: 'manto_pele_de_lobo',
    name: 'Pelejão do Lobo Noturno',
    category: 'chestplate',
    rarity: 'common',
    description: 'Pele grossa e gélida que resguarda o guerreiro contra ataques surpresa.',
    iconName: 'ShieldHalf',
    color: '#4FC3F7',
    stats: { hp: 30, def: 2, res: 2 },
    droppedByMonsterTypeIds: ['lobo_espectral'],
  },

  // =========================================================================
  // 6. GOLEM DE BASALTO (3 Items)
  // =========================================================================
  martelo_de_basalto: {
    id: 'martelo_de_basalto',
    name: 'Martelo Quebra-Montanhas',
    category: 'weapon',
    rarity: 'rare',
    description: 'Bloco de basalto incrustado em haste reforçada, esmaga sem piedade.',
    iconName: 'Hammer',
    color: '#78909C',
    stats: { atk: 7, def: 3 },
    droppedByMonsterTypeIds: ['golem_basalto'],
  },
  placas_de_pedra_viva: {
    id: 'placas_de_pedra_viva',
    name: 'Placas de Basalto Ancestral',
    category: 'chestplate',
    rarity: 'epic',
    description: 'Armadura pesada esculpida em rocha viva que torna o portador uma fortaleza.',
    iconName: 'ShieldCheck',
    color: '#546E7A',
    stats: { hp: 60, def: 6 },
    droppedByMonsterTypeIds: ['golem_basalto'],
  },
  grevas_monoliticas: {
    id: 'grevas_monoliticas',
    name: 'Grevas do Monólito Inabalável',
    category: 'leggings',
    rarity: 'rare',
    description: 'Perneiras rochosas pesadas que fixam as pernas com firmeza imutável.',
    iconName: 'Layers',
    color: '#607D8B',
    stats: { hp: 40, def: 4 },
    droppedByMonsterTypeIds: ['golem_basalto'],
  },

  // =========================================================================
  // 7. BRUXA DOS ESPINHOS (3 Items)
  // =========================================================================
  tiara_de_roseira_brava: {
    id: 'tiara_de_roseira_brava',
    name: 'Coroa de Espinhos da Bruxa',
    category: 'helmet',
    rarity: 'rare',
    description: 'Círculo de vinhas espinhosas que canaliza a vitalidade da natureza profana.',
    iconName: 'Crown',
    color: '#66BB6A',
    stats: { hp: 25, mag: 4, res: 3 },
    droppedByMonsterTypeIds: ['bruxa_espinhos'],
  },
  calca_de_vinhas_ancestrais: {
    id: 'calca_de_vinhas_ancestrais',
    name: 'Perneiras de Raiz Petrificada',
    category: 'leggings',
    rarity: 'rare',
    description: 'Fibras vegetais entrelaçadas resistentes a cortes e magias elementais.',
    iconName: 'Layers',
    color: '#4CAF50',
    stats: { hp: 35, def: 3, res: 2 },
    droppedByMonsterTypeIds: ['bruxa_espinhos'],
  },
  talisma_seiva_vital: {
    id: 'talisma_seiva_vital',
    name: 'Talismã da Flor Venenosa',
    category: 'accessory',
    rarity: 'epic',
    description: 'Broche que pulsa seiva mística, restaurando forças e fortalecendo magias.',
    iconName: 'Heart',
    color: '#81C784',
    stats: { hp: 45, mag: 5, res: 3 },
    droppedByMonsterTypeIds: ['bruxa_espinhos'],
  },

  // =========================================================================
  // 8. CAVALEIRO CAÍDO (3 Items)
  // =========================================================================
  espada_da_ordem_corrompida: {
    id: 'espada_da_ordem_corrompida',
    name: 'Lâmina do Juramento Rompido',
    category: 'weapon',
    rarity: 'rare',
    description: 'Espada outrora sagrada, agora manchada por sangue e sombras abissais.',
    iconName: 'Sword',
    color: '#8D6E63',
    stats: { atk: 7, def: 2, hp: 20 },
    droppedByMonsterTypeIds: ['cavaleiro_caido'],
  },
  elmo_do_juramento_quebrado: {
    id: 'elmo_do_juramento_quebrado',
    name: 'Elmo de Aço Corrompido',
    category: 'helmet',
    rarity: 'rare',
    description: 'Elmo com viseira em cruz que protege a cabeça contra ataques cruciais.',
    iconName: 'HardHat',
    color: '#795548',
    stats: { hp: 35, def: 4, res: 2 },
    droppedByMonsterTypeIds: ['cavaleiro_caido'],
  },
  sabatores_de_aco_negro: {
    id: 'sabatores_de_aco_negro',
    name: 'Sabatões do Cruzado Caído',
    category: 'boots',
    rarity: 'epic',
    description: 'Botas de placas negras forjadas na escuridão, firmes e velozes.',
    iconName: 'Footprints',
    color: '#4E342E',
    stats: { hp: 30, def: 4, mov: 1 },
    droppedByMonsterTypeIds: ['cavaleiro_caido'],
  },

  // =========================================================================
  // 9. MÍMICO CARNICEIRO (3 Items)
  // =========================================================================
  lingueta_carniceira: {
    id: 'lingueta_carniceira',
    name: 'Chicote Carniceiro Dentado',
    category: 'weapon',
    rarity: 'rare',
    description: 'Arma orgânica flexível recoberta de dentes afiados que sangram os inimigos.',
    iconName: 'Crosshair',
    color: '#FFA726',
    stats: { atk: 6, mag: 3, hp: 20 },
    droppedByMonsterTypeIds: ['mimico'],
  },
  calcas_recheadas_de_ouro: {
    id: 'calcas_recheadas_de_ouro',
    name: 'Calças do Baú Maldito',
    category: 'leggings',
    rarity: 'epic',
    description: 'Tecido encantado que cintila como moedas de ouro e amortece impactos.',
    iconName: 'Coins',
    color: '#FFB74D',
    stats: { hp: 40, def: 3, res: 3 },
    droppedByMonsterTypeIds: ['mimico'],
  },
  medalhao_do_tesouro_falso: {
    id: 'medalhao_do_tesouro_falso',
    name: 'Relíquia da Ganância Abissal',
    category: 'accessory',
    rarity: 'epic',
    description: 'Jóia dourada hipnótica que concede poder destrutivo e tenacidade.',
    iconName: 'Trophy',
    color: '#FF9800',
    stats: { hp: 25, atk: 4, mag: 4 },
    droppedByMonsterTypeIds: ['mimico'],
  },

  // =========================================================================
  // 10. DRACO VULCÂNICO (3 Items)
  // =========================================================================
  lanca_de_magma: {
    id: 'lanca_de_magma',
    name: 'Lança das Chamas Primordiais',
    category: 'weapon',
    rarity: 'epic',
    description: 'Lança incandescente com ponta de dente de dragão vulcânico em chamas.',
    iconName: 'Flame',
    color: '#FF5722',
    stats: { atk: 9, mag: 5, hp: 25 },
    droppedByMonsterTypeIds: ['draco_volcanico'],
  },
  escama_draconica_peitoral: {
    id: 'escama_draconica_peitoral',
    name: 'Couraça de Escamas de Dragão',
    category: 'chestplate',
    rarity: 'epic',
    description: 'Armadura tecida com escamas impenetráveis endurecidas em lava.',
    iconName: 'ShieldAlert',
    color: '#E64A19',
    stats: { hp: 55, def: 5, res: 5 },
    droppedByMonsterTypeIds: ['draco_volcanico'],
  },
  coroa_das_brasas: {
    id: 'coroa_das_brasas',
    name: 'Coroa do Fogo Supremo',
    category: 'helmet',
    rarity: 'legendary',
    description: 'Diadema ardente que brilha com a intensidade de um vulcão em erupção.',
    iconName: 'Crown',
    color: '#FF3D00',
    stats: { hp: 50, mag: 7, res: 5, def: 3 },
    droppedByMonsterTypeIds: ['draco_volcanico'],
  },

  // =========================================================================
  // 11. DEVORADOR DAS PROFUNDEZAS (Mini Boss Fase 5 - 3 Items)
  // =========================================================================
  mandibula_abissal: {
    id: 'mandibula_abissal',
    name: 'Presas do Devorador Abissal',
    category: 'weapon',
    rarity: 'epic',
    description: 'Dentes colossais do monstro das profundezas forjados como lâminas duplas.',
    iconName: 'Skull',
    color: '#FF6F00',
    stats: { atk: 8, hp: 35, def: 2 },
    droppedByMonsterTypeIds: ['devorador'],
  },
  carapaca_do_abismo: {
    id: 'carapaca_do_abismo',
    name: 'Carapaça de Ferro do Devorador',
    category: 'chestplate',
    rarity: 'epic',
    description: 'Placas quitinosas grossas que repeliram incontáveis aventureiros nas cavernas.',
    iconName: 'Shield',
    color: '#E65100',
    stats: { hp: 55, def: 6, res: 3 },
    droppedByMonsterTypeIds: ['devorador'],
  },
  olho_do_profundo: {
    id: 'olho_do_profundo',
    name: 'Olho Cego das Profundezas',
    category: 'accessory',
    rarity: 'rare',
    description: 'Globo ocular mineralizado que revela pontos fracos na armadura do alvo.',
    iconName: 'ScanEye',
    color: '#FF8F00',
    stats: { hp: 30, atk: 3, mag: 3 },
    droppedByMonsterTypeIds: ['devorador'],
  },

  // =========================================================================
  // 12. ASTAROTH, SOBERANO DO ABISMO (Boss Fase 10 - 3 Items)
  // =========================================================================
  foice_soberana_do_abismo: {
    id: 'foice_soberana_do_abismo',
    name: 'Foice Soberana de Astaroth',
    category: 'weapon',
    rarity: 'legendary',
    description: 'A foice cósmica que rege as legiões das profundezas. Distorce o espaço ao golpear.',
    iconName: 'Sparkles',
    color: '#4A148C',
    stats: { mag: 11, atk: 6, hp: 40, range: 1 },
    droppedByMonsterTypeIds: ['astaroth'],
  },
  diadema_do_senhor_abissal: {
    id: 'diadema_do_senhor_abissal',
    name: 'Diadema da Realeza Sombria',
    category: 'helmet',
    rarity: 'epic',
    description: 'Coroa de chifres obsidiana pertencente ao soberano das trevas.',
    iconName: 'Crown',
    color: '#7B1FA2',
    stats: { hp: 45, mag: 7, res: 4 },
    droppedByMonsterTypeIds: ['astaroth'],
  },
  manto_da_ruina: {
    id: 'manto_da_ruina',
    name: 'Manto da Ruína Absoluta',
    category: 'chestplate',
    rarity: 'legendary',
    description: 'Vestimenta forjada com a própria essência do abismo, conferindo proteção suprema.',
    iconName: 'Shirt',
    color: '#311B92',
    stats: { hp: 65, def: 6, res: 7 },
    droppedByMonsterTypeIds: ['astaroth'],
  },

  // =========================================================================
  // 13. ARAUTO DOS ESPECTROS (Mini Boss Fase 15 - 3 Items)
  // =========================================================================
  orbe_dos_espectros: {
    id: 'orbe_dos_espectros',
    name: 'Orbe das Almas Aprisionadas',
    category: 'accessory',
    rarity: 'epic',
    description: 'Esfera translúcida habitada por espectros que drenam a energia dos inimigos.',
    iconName: 'Orbit',
    color: '#00E5FF',
    stats: { hp: 35, mag: 7, res: 3 },
    droppedByMonsterTypeIds: ['arauto_espectral'],
  },
  perneiras_fantasma: {
    id: 'perneiras_fantasma',
    name: 'Perneiras do Ceifador Etéreo',
    category: 'leggings',
    rarity: 'rare',
    description: 'Tecido espiritual que ignora o atrito e protege contra magias sombrias.',
    iconName: 'Layers',
    color: '#18FFFF',
    stats: { hp: 35, def: 3, res: 4 },
    droppedByMonsterTypeIds: ['arauto_espectral'],
  },
  passo_do_ceifador: {
    id: 'passo_do_ceifador',
    name: 'Passo Espectral do Ceifador',
    category: 'boots',
    rarity: 'epic',
    description: 'Botas etéreas que aumentam a velocidade no tabuleiro e reduzem dano mágico.',
    iconName: 'Footprints',
    color: '#00B0FF',
    stats: { hp: 30, res: 4, mov: 1 },
    droppedByMonsterTypeIds: ['arauto_espectral'],
  },

  // =========================================================================
  // 14. VULCANUS, TITÃ DAS FORJAS (Boss Fase 20 - 3 Items)
  // =========================================================================
  marreta_da_forja_eterna: {
    id: 'marreta_da_forja_eterna',
    name: 'Marreta Titânica da Forja',
    category: 'weapon',
    rarity: 'legendary',
    description: 'Martelo forjado no magma puro do núcleo vulcânico com poder devastador.',
    iconName: 'Anvil',
    color: '#FF3D00',
    stats: { atk: 13, hp: 50, def: 4 },
    droppedByMonsterTypeIds: ['tita_forjador'],
  },
  couraça_do_colosso: {
    id: 'couraça_do_colosso',
    name: 'Couraça de Aço Magmático',
    category: 'chestplate',
    rarity: 'legendary',
    description: 'Blindagem pesada que converte impactos em calor inextinguível.',
    iconName: 'ShieldCheck',
    color: '#DD2C00',
    stats: { hp: 85, def: 9, res: 4 },
    droppedByMonsterTypeIds: ['tita_forjador'],
  },
  grevas_incandescentes: {
    id: 'grevas_incandescentes',
    name: 'Grevas Incandescentes do Titã',
    category: 'leggings',
    rarity: 'epic',
    description: 'Placas vulcânicas fundidas que tornam o guerreiro inamovível.',
    iconName: 'Flame',
    color: '#FF6E40',
    stats: { hp: 50, def: 6, res: 3 },
    droppedByMonsterTypeIds: ['tita_forjador'],
  },

  // =========================================================================
  // 15. ARQUIMAGO DAS RUNAS (Mini Boss Fase 25 - 3 Items)
  // =========================================================================
  tomo_das_runas_proibidas: {
    id: 'tomo_das_runas_proibidas',
    name: 'Grimório Rúnico do Arquimago',
    category: 'weapon',
    rarity: 'epic',
    description: 'Tomo ancestral com fórmulas arcanas capazes de quebrar barreiras mágicas.',
    iconName: 'BookOpen',
    color: '#7C4DFF',
    stats: { mag: 10, res: 4, hp: 35 },
    droppedByMonsterTypeIds: ['mestre_runico'],
  },
  capuz_do_arquimago: {
    id: 'capuz_do_arquimago',
    name: 'Mitra do Guardião Rúnico',
    category: 'helmet',
    rarity: 'epic',
    description: 'Capuz bordado com fios de mana pura que potencializam conjurações.',
    iconName: 'GraduationCap',
    color: '#651FFF',
    stats: { hp: 40, mag: 8, res: 4 },
    droppedByMonsterTypeIds: ['mestre_runico'],
  },
  anel_do_selo_arcano: {
    id: 'anel_do_selo_arcano',
    name: 'Anel do Selo Primordial',
    category: 'accessory',
    rarity: 'rare',
    description: 'Aliança com glifo esculpido que estabiliza o fluxo de mana e protege aliados.',
    iconName: 'Sparkle',
    color: '#B388FF',
    stats: { mag: 6, res: 4, hp: 20 },
    droppedByMonsterTypeIds: ['mestre_runico'],
  },

  // =========================================================================
  // 16. VALGAR, O CARNICEIRO IMORTAL (Boss Fase 30 - 3 Items)
  // =========================================================================
  machado_sanguinario_de_valgar: {
    id: 'machado_sanguinario_de_valgar',
    name: 'Cutelo da Fúria Imortal',
    category: 'weapon',
    rarity: 'legendary',
    description: 'Arma brutal que bebe o sangue dos caídos para aumentar o impacto físico.',
    iconName: 'Axe',
    color: '#B71C1C',
    stats: { atk: 15, hp: 45, def: 2 },
    droppedByMonsterTypeIds: ['valgar_sanguinario'],
  },
  armadura_do_carniceiro: {
    id: 'armadura_do_carniceiro',
    name: 'Couraça de Ossos e Aço de Valgar',
    category: 'chestplate',
    rarity: 'legendary',
    description: 'Peitoral decorado com crânios de campeões vencidos. Intimida qualquer oponente.',
    iconName: 'Bone',
    color: '#880E4F',
    stats: { hp: 80, def: 8, atk: 4 },
    droppedByMonsterTypeIds: ['valgar_sanguinario'],
  },
  botas_do_frenesi: {
    id: 'botas_do_frenesi',
    name: 'Botas do Frenesi Selvagem',
    category: 'boots',
    rarity: 'epic',
    description: 'Calçado endurecido que empurra o herói para o combate a passos largos.',
    iconName: 'Footprints',
    color: '#C2185B',
    stats: { hp: 45, atk: 4, mov: 1 },
    droppedByMonsterTypeIds: ['valgar_sanguinario'],
  },

  // =========================================================================
  // 17. QUIMERA DAS SOMBRAS ANTIGAS (Mini Boss Fase 35 - 3 Items)
  // =========================================================================
  ferrao_quimerico: {
    id: 'ferrao_quimerico',
    name: 'Ferrão Peçonhento Quimérico',
    category: 'weapon',
    rarity: 'epic',
    description: 'Ferrão curvado de quitina negra e peçonha pura com alto dano híbrido.',
    iconName: 'PocketKnife',
    color: '#00C853',
    stats: { atk: 9, mag: 6, hp: 30 },
    droppedByMonsterTypeIds: ['quimera_venenosa'],
  },
  mascara_da_besta: {
    id: 'mascara_da_besta',
    name: 'Elmo de Quimera Abissal',
    category: 'helmet',
    rarity: 'rare',
    description: 'Crânio bestial esculpido com dentes curvados que protege cabeça e pescoço.',
    iconName: 'VenetianMask',
    color: '#00E676',
    stats: { hp: 40, def: 4, res: 4 },
    droppedByMonsterTypeIds: ['quimera_venenosa'],
  },
  glandula_peconhenta: {
    id: 'glandula_peconhenta',
    name: 'Coração Mutante da Quimera',
    category: 'accessory',
    rarity: 'epic',
    description: 'Órgão preservado em líquido corrosivo que aumenta tanto dano físico quanto mágico.',
    iconName: 'HeartPulse',
    color: '#69F0AE',
    stats: { hp: 35, atk: 6, mag: 5 },
    droppedByMonsterTypeIds: ['quimera_venenosa'],
  },

  // =========================================================================
  // 18. LEVIATÃ DO VAZIO PRIMORDIAL (Boss Fase 40 - 3 Items)
  // =========================================================================
  lamina_da_singularidade: {
    id: 'lamina_da_singularidade',
    name: 'Lâmina do Vórtice Cósmico',
    category: 'weapon',
    rarity: 'legendary',
    description: 'Arma forjada com fragmentos de uma estrela colapsada no coração do vazio.',
    iconName: 'Zap',
    color: '#311B92',
    stats: { atk: 12, mag: 12, hp: 50 },
    droppedByMonsterTypeIds: ['leviata_vazio'],
  },
  veste_cosmica_do_vazio: {
    id: 'veste_cosmica_do_vazio',
    name: 'Veste Dimensional do Leviatã',
    category: 'chestplate',
    rarity: 'legendary',
    description: 'Tecido que reflete as constelações do cosmos, absorvendo magias e golpes.',
    iconName: 'Shirt',
    color: '#1A237E',
    stats: { hp: 90, def: 7, res: 9 },
    droppedByMonsterTypeIds: ['leviata_vazio'],
  },
  coroa_primordial: {
    id: 'coroa_primordial',
    name: 'Coroa da Dimensão Proibida',
    category: 'helmet',
    rarity: 'legendary',
    description: 'Diadema que conecta a mente do portador à força primordial das trevas.',
    iconName: 'Crown',
    color: '#4A148C',
    stats: { hp: 60, mag: 9, res: 6 },
    droppedByMonsterTypeIds: ['leviata_vazio'],
  },

  // =========================================================================
  // 19. CAVALEIRO DO ECLIPSE ETERNO (Mini Boss Fase 45 - 3 Items)
  // =========================================================================
  espada_do_eclipse: {
    id: 'espada_do_eclipse',
    name: 'Espada do Eclipse Infinito',
    category: 'weapon',
    rarity: 'legendary',
    description: 'Lâmina sagrada mergulhada no eclipse eterno. Seu corte divide a luz da escuridão.',
    iconName: 'Sun',
    color: '#FFD600',
    stats: { atk: 13, mag: 7, def: 5, hp: 45 },
    droppedByMonsterTypeIds: ['cavaleiro_apocalipse'],
  },
  grevas_do_fim_dos_dias: {
    id: 'grevas_do_fim_dos_dias',
    name: 'Grevas do Juízo Final',
    category: 'leggings',
    rarity: 'epic',
    description: 'Perneiras de ouro corrompido que protegem os pontos vitais com perfeição.',
    iconName: 'Layers',
    color: '#FFC400',
    stats: { hp: 60, def: 7, res: 5 },
    droppedByMonsterTypeIds: ['cavaleiro_apocalipse'],
  },
  elmo_do_cavaleiro_sombrio: {
    id: 'elmo_do_cavaleiro_sombrio',
    name: 'Elmo do Sol Negro',
    category: 'helmet',
    rarity: 'epic',
    description: 'Armadura facial fechada que oculta os olhos sob um halo escuro.',
    iconName: 'HardHat',
    color: '#FFAB00',
    stats: { hp: 55, def: 6, res: 6 },
    droppedByMonsterTypeIds: ['cavaleiro_apocalipse'],
  },

  // =========================================================================
  // 20. MALAKOR, O FIM DE TODAS AS ERAS (Boss Final Fase 50 - 3 Items)
  // =========================================================================
  cetro_do_fim_das_eras: {
    id: 'cetro_do_fim_das_eras',
    name: 'Cetro do Fim de Todas as Eras',
    category: 'weapon',
    rarity: 'legendary',
    description: 'O cetro que selou o destino de deuses e civilizações inteiras.',
    iconName: 'WandSparkles',
    color: '#D50000',
    stats: { atk: 16, mag: 16, hp: 60, range: 1 },
    droppedByMonsterTypeIds: ['cronos_abissal'],
  },
  manto_da_eternidade: {
    id: 'manto_da_eternidade',
    name: 'Manto da Entropia Absoluta',
    category: 'chestplate',
    rarity: 'legendary',
    description: 'A vestimenta definitiva tecida pelo próprio criador do caos abissal.',
    iconName: 'ShieldAlert',
    color: '#B71C1C',
    stats: { hp: 120, def: 10, res: 10 },
    droppedByMonsterTypeIds: ['cronos_abissal'],
  },
  ampulheta_do_caos_absoluto: {
    id: 'ampulheta_do_caos_absoluto',
    name: 'Ampulheta do Tempo Colapsado',
    category: 'accessory',
    rarity: 'legendary',
    description: 'Artefato que aprisiona a areia de todas as eras, dobrando tempo e espaço.',
    iconName: 'Hourglass',
    color: '#FF1744',
    stats: { hp: 70, atk: 8, mag: 8, mov: 1 },
    droppedByMonsterTypeIds: ['cronos_abissal'],
  },

  // =========================================================================
  // ATO II — AS FORJAS VULCÂNICAS (20 Novos Itens)
  // =========================================================================
  // 1. Kobold Artilheiro
  trabuco_kobold: {
    id: 'trabuco_kobold',
    name: 'Trabuco de Estilhaço Kobold',
    category: 'weapon',
    rarity: 'rare',
    description: 'Arma improvisada que dispara estilhaços incandescentes a longa distância.',
    iconName: 'Crosshair',
    color: '#FF7043',
    stats: { atk: 8, hp: 20, range: 1 },
    droppedByMonsterTypeIds: ['kobold_artilheiro'],
  },
  cantil_polvora: {
    id: 'cantil_polvora',
    name: 'Cantil de Pólvora Vulcânica',
    category: 'accessory',
    rarity: 'common',
    description: 'Recipiente selado com fuligem explosiva que intensifica ataques e magias de fogo.',
    iconName: 'Flame',
    color: '#FF5722',
    stats: { atk: 5, mag: 4 },
    droppedByMonsterTypeIds: ['kobold_artilheiro'],
  },

  // 2. Salamandra de Magma
  escama_termica_salamandra: {
    id: 'escama_termica_salamandra',
    name: 'Couraça de Magma da Salamandra',
    category: 'chestplate',
    rarity: 'rare',
    description: 'Placas térmicas flexíveis imunes ao calor que desviam feitiços ardentes.',
    iconName: 'ShieldHalf',
    color: '#E64A19',
    stats: { def: 4, res: 5, hp: 35 },
    droppedByMonsterTypeIds: ['salamandra_magma'],
  },
  botas_calor_vulcanico: {
    id: 'botas_calor_vulcanico',
    name: 'Passo Ígneo da Salamandra',
    category: 'boots',
    rarity: 'common',
    description: 'Botas reforçadas para cruzar solos de escória fervente sem hesitar.',
    iconName: 'Footprints',
    color: '#D84315',
    stats: { def: 2, mov: 1, hp: 25 },
    droppedByMonsterTypeIds: ['salamandra_magma'],
  },

  // 3. Ferreiro Amaldiçoado
  malho_pesado_ferreiro: {
    id: 'malho_pesado_ferreiro',
    name: 'Malho de Aço Fumegante',
    category: 'weapon',
    rarity: 'rare',
    description: 'Martelo forjado em cinzas que esmaga armaduras pesadas com facilidade.',
    iconName: 'Hammer',
    color: '#D32F2F',
    stats: { atk: 9, def: 3, hp: 30 },
    droppedByMonsterTypeIds: ['ferreiro_amaldicoado'],
  },
  avental_forja_eterna: {
    id: 'avental_forja_eterna',
    name: 'Avental do Forjador Caído',
    category: 'chestplate',
    rarity: 'rare',
    description: 'Vestimenta de couro curtido resistente a fagulhas e golpes contundentes.',
    iconName: 'Shirt',
    color: '#BF360C',
    stats: { hp: 45, def: 5, res: 3 },
    droppedByMonsterTypeIds: ['ferreiro_amaldicoado'],
  },

  // 4. Elemental de Brasa
  coracao_de_brasa_viva: {
    id: 'coracao_de_brasa_viva',
    name: 'Núcleo de Brasa Eterna',
    category: 'accessory',
    rarity: 'rare',
    description: 'Fragmento de fogo primordial que pulsa calor constante no peito.',
    iconName: 'Flame',
    color: '#FF6D00',
    stats: { mag: 9, res: 4, hp: 30 },
    droppedByMonsterTypeIds: ['elemental_brasa'],
  },
  manto_incandescente: {
    id: 'manto_incandescente',
    name: 'Véu de Fagulho Elemental',
    category: 'chestplate',
    rarity: 'common',
    description: 'Manto translúcido feito de calor residual que aquece o espírito do portador.',
    iconName: 'Shield',
    color: '#FF9100',
    stats: { mag: 6, res: 5, hp: 25 },
    droppedByMonsterTypeIds: ['elemental_brasa'],
  },

  // 5. Autômato a Vapor
  valvula_hiperpressao: {
    id: 'valvula_hiperpressao',
    name: 'Regulador de Vapor Sobrecargado',
    category: 'accessory',
    rarity: 'rare',
    description: 'Mecanismo de escape a vapor que impulsiona o movimento tático do usuário.',
    iconName: 'Anvil',
    color: '#B0BEC5',
    stats: { def: 5, res: 4, mov: 1 },
    droppedByMonsterTypeIds: ['automato_vapor'],
  },
  grevas_mecanicas_vapor: {
    id: 'grevas_mecanicas_vapor',
    name: 'Grevas Hidráulicas de Bronze',
    category: 'leggings',
    rarity: 'rare',
    description: 'Pistões de metal polido que conferem sustentação incomparável.',
    iconName: 'Layers',
    color: '#90A4AE',
    stats: { hp: 40, def: 6, res: 3 },
    droppedByMonsterTypeIds: ['automato_vapor'],
  },

  // 6. Piromante Cultista
  cajado_escoria_ardente: {
    id: 'cajado_escoria_ardente',
    name: 'Báculo da Escória Fundida',
    category: 'weapon',
    rarity: 'rare',
    description: 'Cajado com ponta incandescente que canaliza meteoros devastadores.',
    iconName: 'Wand',
    color: '#FF3D00',
    stats: { mag: 10, atk: 4, range: 1 },
    droppedByMonsterTypeIds: ['piromante_cultista'],
  },
  capuz_do_culto_flamejante: {
    id: 'capuz_do_culto_flamejante',
    name: 'Capuz do Piromante Sombrio',
    category: 'helmet',
    rarity: 'common',
    description: 'Tecido encerado com carvão que amplia a afinidade com magias de fogo.',
    iconName: 'HardHat',
    color: '#DD2C00',
    stats: { mag: 7, res: 4, hp: 20 },
    droppedByMonsterTypeIds: ['piromante_cultista'],
  },

  // 7. Espectro Cinzento
  veu_cinzas_sufocantes: {
    id: 'veu_cinzas_sufocantes',
    name: 'Mortalha de Cinzas Fátuas',
    category: 'helmet',
    rarity: 'rare',
    description: 'Véu etéreo que envolve a visão do usuário em uma névoa de proteção.',
    iconName: 'VenetianMask',
    color: '#78909C',
    stats: { res: 6, mag: 6, hp: 35 },
    droppedByMonsterTypeIds: ['espectro_cinzento'],
  },
  pingente_alma_fuligem: {
    id: 'pingente_alma_fuligem',
    name: 'Lacre Espectral de Fuligem',
    category: 'accessory',
    rarity: 'common',
    description: 'Amuleto fosco que atenua danos mágicos e concede passos silenciosos.',
    iconName: 'Gem',
    color: '#546E7A',
    stats: { mag: 5, res: 4, mov: 1 },
    droppedByMonsterTypeIds: ['espectro_cinzento'],
  },

  // 8. Verme da Lava
  mandibula_verme_lava: {
    id: 'mandibula_verme_lava',
    name: 'Presa Perfurante de Magma',
    category: 'weapon',
    rarity: 'rare',
    description: 'Broca natural do verme das profundezas que rasga couraças de pedra.',
    iconName: 'Bone',
    color: '#FF5722',
    stats: { atk: 9, def: 2, hp: 30 },
    droppedByMonsterTypeIds: ['verme_da_lava'],
  },
  perneiras_quitina_vulcanica: {
    id: 'perneiras_quitina_vulcanica',
    name: 'Placas Subterrâneas de Lava',
    category: 'leggings',
    rarity: 'common',
    description: 'Segmentos quitinosos resistentes ao atrito com rochas vulcânicas.',
    iconName: 'Layers',
    color: '#E64A19',
    stats: { hp: 35, def: 5 },
    droppedByMonsterTypeIds: ['verme_da_lava'],
  },

  // 9. Gárgula de Ferro
  elmo_gargula_ferro: {
    id: 'elmo_gargula_ferro',
    name: 'Elmo Gárgula Imóvel',
    category: 'helmet',
    rarity: 'rare',
    description: 'Elmo de ferro maciço que petrifica os pontos vitais contra golpes críticos.',
    iconName: 'Crown',
    color: '#757575',
    stats: { def: 6, res: 4, hp: 40 },
    droppedByMonsterTypeIds: ['gargula_ferro'],
  },
  garras_bronze_aerias: {
    id: 'garras_bronze_aerias',
    name: 'Garras de Ferro Reforçado',
    category: 'weapon',
    rarity: 'rare',
    description: 'Lâminas curvas afiadas em pedra de amolar capazes de retalhar blindagens.',
    iconName: 'PocketKnife',
    color: '#616161',
    stats: { atk: 8, def: 4, hp: 25 },
    droppedByMonsterTypeIds: ['gargula_ferro'],
  },

  // 10. Cão Infernal
  coleira_grilhao_infernal: {
    id: 'coleira_grilhao_infernal',
    name: 'Grilhão dos Portões de Enxofre',
    category: 'accessory',
    rarity: 'rare',
    description: 'Corrente pesada incandescente que instiga sede de sangue e perseguição.',
    iconName: 'CircleDot',
    color: '#C62828',
    stats: { atk: 7, mov: 1, hp: 25 },
    droppedByMonsterTypeIds: ['cao_infernal'],
  },
  botas_cacada_infernal: {
    id: 'botas_cacada_infernal',
    name: 'Garras de Perseguição Ardente',
    category: 'boots',
    rarity: 'common',
    description: 'Solas cravadas em pontas de ferro para arranques rápidos em combate.',
    iconName: 'Footprints',
    color: '#B71C1C',
    stats: { atk: 5, def: 2, mov: 1 },
    droppedByMonsterTypeIds: ['cao_infernal'],
  },

  // =========================================================================
  // ATO III — OS ECOS RÚNICOS E O BERSERKER (20 Novos Itens)
  // =========================================================================
  // 1. Bárbaro Frenético
  machado_duplo_frenesi: {
    id: 'machado_duplo_frenesi',
    name: 'Machado da Fúria Implacável',
    category: 'weapon',
    rarity: 'rare',
    description: 'Dois machados de batalha pesados que desferem cortes brutais sem trégua.',
    iconName: 'Axe',
    color: '#E53935',
    stats: { atk: 12, hp: 45 },
    droppedByMonsterTypeIds: ['barbaro_frenetico'],
  },
  cinto_vigor_sangrento: {
    id: 'cinto_vigor_sangrento',
    name: 'Cinto de Guerra dos Bárbaros',
    category: 'accessory',
    rarity: 'epic',
    description: 'Cinturão de couro cru cravado com troféus de batalha que nutre o vigor.',
    iconName: 'Layers',
    color: '#C62828',
    stats: { atk: 8, def: 5, hp: 60 },
    droppedByMonsterTypeIds: ['barbaro_frenetico'],
  },

  // 2. Caçador das Estepes
  arco_runico_longo: {
    id: 'arco_runico_longo',
    name: 'Arco Rúnico das Estepes Gélidas',
    category: 'weapon',
    rarity: 'epic',
    description: 'Arco composto esculpido em carvalho antigo com glifos de longo alcance.',
    iconName: 'BowArrow',
    color: '#0288D1',
    stats: { atk: 13, range: 1, hp: 35 },
    droppedByMonsterTypeIds: ['cacador_estepes'],
  },
  aljava_flechas_trovao: {
    id: 'aljava_flechas_trovao',
    name: 'Aljava do Caçador Ancestral',
    category: 'accessory',
    rarity: 'rare',
    description: 'Aljava encantada que energiza projéteis com descargas elétricas.',
    iconName: 'Target',
    color: '#039BE5',
    stats: { atk: 9, mov: 1 },
    droppedByMonsterTypeIds: ['cacador_estepes'],
  },

  // 3. Xamã da Tempestade
  totem_tempestade_portatil: {
    id: 'totem_tempestade_portatil',
    name: 'Totem Condutor de Tempestades',
    category: 'accessory',
    rarity: 'epic',
    description: 'Pequena estátua entalhada que atrai relâmpagos para energizar feitiços.',
    iconName: 'Zap',
    color: '#FBC02D',
    stats: { mag: 13, res: 7, hp: 50 },
    droppedByMonsterTypeIds: ['xama_tempestade'],
  },
  manto_dos_trovoes: {
    id: 'manto_dos_trovoes',
    name: 'Túnica do Conjurador de Raios',
    category: 'chestplate',
    rarity: 'rare',
    description: 'Manto tecido com pelos de feras tempestuosas que dissipa descargas mágicas.',
    iconName: 'ShieldAlert',
    color: '#F57F17',
    stats: { mag: 10, res: 6, hp: 45 },
    droppedByMonsterTypeIds: ['xama_tempestade'],
  },

  // 4. Constructo Rúnico
  nucleo_runico_estatico: {
    id: 'nucleo_runico_estatico',
    name: 'Gerador Rúnico de Barreira',
    category: 'accessory',
    rarity: 'epic',
    description: 'Orbe condensado com inscrições protetoras que gera escudos de energia.',
    iconName: 'Orbit',
    color: '#7B1FA2',
    stats: { def: 7, res: 7, hp: 65 },
    droppedByMonsterTypeIds: ['constructo_runico'],
  },
  placas_runicas_colossais: {
    id: 'placas_runicas_colossais',
    name: 'Peitoral Gravado em Glifos',
    category: 'chestplate',
    rarity: 'rare',
    description: 'Armadura pesada de pedra rúnica que neutraliza impactos físicos e arcanos.',
    iconName: 'ShieldCheck',
    color: '#8E24AA',
    stats: { def: 8, res: 5, hp: 55 },
    droppedByMonsterTypeIds: ['constructo_runico'],
  },

  // 5. Urso Fendedor
  garra_urso_glacial: {
    id: 'garra_urso_glacial',
    name: 'Garra Fendedora dos Picos',
    category: 'weapon',
    rarity: 'rare',
    description: 'Lâminas curvas de presas de urso polidas no gelo eterno.',
    iconName: 'PocketKnife',
    color: '#00ACC1',
    stats: { atk: 11, def: 4, hp: 50 },
    droppedByMonsterTypeIds: ['urso_fendendor'],
  },
  gibao_pele_urso_ancestral: {
    id: 'gibao_pele_urso_ancestral',
    name: 'Pele do Urso Titânico',
    category: 'chestplate',
    rarity: 'epic',
    description: 'Gibão colossal forrado com pele espessa capaz de amortecer patadas de montanha.',
    iconName: 'Shirt',
    color: '#0097A7',
    stats: { hp: 85, def: 7, res: 5 },
    droppedByMonsterTypeIds: ['urso_fendendor'],
  },

  // 6. Valquíria Sombria
  lanca_valquiria_caida: {
    id: 'lanca_valquiria_caida',
    name: 'Lança do Voo Sombrio',
    category: 'weapon',
    rarity: 'epic',
    description: 'Haste rúnica sagrada manchada por energias crepusculares.',
    iconName: 'Sword',
    color: '#5E35B1',
    stats: { atk: 12, mag: 10, mov: 1 },
    droppedByMonsterTypeIds: ['valquiria_sombria'],
  },
  diadema_plumas_negras: {
    id: 'diadema_plumas_negras',
    name: 'Diadema da Valquíria Rejeitada',
    category: 'helmet',
    rarity: 'rare',
    description: 'Coroa de penas de corvo imbricadas que aguça os sentidos de combate.',
    iconName: 'Crown',
    color: '#673AB7',
    stats: { mag: 8, res: 6, hp: 45 },
    droppedByMonsterTypeIds: ['valquiria_sombria'],
  },

  // 7. Invocador de Glifos
  tomo_glifos_antigos: {
    id: 'tomo_glifos_antigos',
    name: 'Grimório da Sobrecarga Rúnica',
    category: 'weapon',
    rarity: 'epic',
    description: 'Livro místico de encadernação de pedra contendo fórmulas de aniquilação mágica.',
    iconName: 'BookOpen',
    color: '#3949AB',
    stats: { mag: 14, range: 1, hp: 40 },
    droppedByMonsterTypeIds: ['invocador_glifos'],
  },
  anel_circulo_runico: {
    id: 'anel_circulo_runico',
    name: 'Selo Menor do Conjurador',
    category: 'accessory',
    rarity: 'rare',
    description: 'Anel de prata estelar com inscrições que aceleram o fluxo de mana.',
    iconName: 'CircleDot',
    color: '#3F51B5',
    stats: { mag: 9, res: 5, mov: 1 },
    droppedByMonsterTypeIds: ['invocador_glifos'],
  },

  // 8. Lobo do Trovão
  botas_investida_eletrica: {
    id: 'botas_investida_eletrica',
    name: 'Passadas do Relâmpago Rúnico',
    category: 'boots',
    rarity: 'rare',
    description: 'Botas leves que soltam faíscas ao solo a cada passada acelerada.',
    iconName: 'Footprints',
    color: '#FDD835',
    stats: { atk: 6, mov: 1, hp: 40 },
    droppedByMonsterTypeIds: ['lobo_trovao'],
  },
  presa_eletrificada: {
    id: 'presa_eletrificada',
    name: 'Presa do Alfa Trovejante',
    category: 'weapon',
    rarity: 'rare',
    description: 'Canino cristalizado envolto em arco voltaico que estremece os inimigos.',
    iconName: 'Bone',
    color: '#FFEE58',
    stats: { atk: 11, mov: 1, hp: 30 },
    droppedByMonsterTypeIds: ['lobo_trovao'],
  },

  // 9. Guardião Megálito
  escudo_muralha_megalito: {
    id: 'escudo_muralha_megalito',
    name: 'Baluarte dos Megálitos Vivos',
    category: 'accessory',
    rarity: 'epic',
    description: 'Laje sagrada intransponível que repele investidas de hordas inteiras.',
    iconName: 'Shield',
    color: '#5D4037',
    stats: { def: 9, res: 8, hp: 70 },
    droppedByMonsterTypeIds: ['guardiao_megalito'],
  },
  grevas_rocha_ancestral: {
    id: 'grevas_rocha_ancestral',
    name: 'Pilares de Pedra Entalhada',
    category: 'leggings',
    rarity: 'rare',
    description: 'Proteções maciças para as pernas esculpidas em rocha monolítica.',
    iconName: 'Layers',
    color: '#4E342E',
    stats: { hp: 60, def: 8, res: 4 },
    droppedByMonsterTypeIds: ['guardiao_megalito'],
  },

  // 10. Espada Ancestral
  lamina_espirito_ancestral: {
    id: 'lamina_espirito_ancestral',
    name: 'Espada Viva do Clã Esquecido',
    category: 'weapon',
    rarity: 'epic',
    description: 'Lâmina espectral que flutua e corta com a sabedoria de mestres falecidos.',
    iconName: 'Swords',
    color: '#00897B',
    stats: { atk: 14, mag: 8, hp: 45 },
    droppedByMonsterTypeIds: ['espada_ancestral'],
  },
  elmo_espectral_ancestral: {
    id: 'elmo_espectral_ancestral',
    name: 'Visor do Guerreiro Espectral',
    category: 'helmet',
    rarity: 'rare',
    description: 'Elmo translúcido que permite enxergar os pontos fracos das armaduras inimigas.',
    iconName: 'HardHat',
    color: '#00796B',
    stats: { atk: 6, def: 5, res: 5, hp: 45 },
    droppedByMonsterTypeIds: ['espada_ancestral'],
  },

  // =========================================================================
  // ATO IV — O PÂNTANO DA PEÇONHA E O VAZIO (20 Novos Itens)
  // =========================================================================
  // 1. Cultista do Vazio
  baculo_entropia_vazio: {
    id: 'baculo_entropia_vazio',
    name: 'Cetro do Culto Entrópico',
    category: 'weapon',
    rarity: 'epic',
    description: 'Báculo feito de matéria escura colapsada que dispara feixes de dissolução.',
    iconName: 'Wand2',
    color: '#6A1B9A',
    stats: { mag: 16, atk: 6, range: 1, hp: 50 },
    droppedByMonsterTypeIds: ['cultista_vazio'],
  },
  manto_rito_proibido: {
    id: 'manto_rito_proibido',
    name: 'Veste da Liturgia Negra',
    category: 'chestplate',
    rarity: 'epic',
    description: 'Túnica que absorve fótons ao redor e dissipa encantamentos de cura ou ataque.',
    iconName: 'ShieldAlert',
    color: '#4A148C',
    stats: { mag: 12, res: 9, hp: 80 },
    droppedByMonsterTypeIds: ['cultista_vazio'],
  },

  // 2. Tentáculo Abissal
  chicote_ventosa_abissal: {
    id: 'chicote_ventosa_abissal',
    name: 'Flagelo das Fendas Submersas',
    category: 'weapon',
    rarity: 'epic',
    description: 'Chicote coberto por ventosas predatórias que puxa e asfixia os alvos.',
    iconName: 'Zap',
    color: '#311B92',
    stats: { atk: 15, range: 1, hp: 60 },
    droppedByMonsterTypeIds: ['tentaculo_abissal'],
  },
  bracelete_constricao: {
    id: 'bracelete_constricao',
    name: 'Bracelete do Aperto Abissal',
    category: 'accessory',
    rarity: 'epic',
    description: 'Joia forjada nas profundezas cósmicas que potencializa a força de contenção.',
    iconName: 'CircleDot',
    color: '#1A237E',
    stats: { def: 8, hp: 90, atk: 7 },
    droppedByMonsterTypeIds: ['tentaculo_abissal'],
  },

  // 3. Espreitador Astral
  adaga_fenda_astral: {
    id: 'adaga_fenda_astral',
    name: 'Lâmina do Salto Cósmico',
    category: 'weapon',
    rarity: 'epic',
    description: 'Adaga de gume dimensional que rasga o tecido da realidade ao desferir golpes.',
    iconName: 'PocketKnife',
    color: '#0D47A1',
    stats: { atk: 16, mov: 1, hp: 50 },
    droppedByMonsterTypeIds: ['espreitador_astral'],
  },
  botas_passo_dimensional: {
    id: 'botas_passo_dimensional',
    name: 'Passos do Não-Espaço',
    category: 'boots',
    rarity: 'epic',
    description: 'Calçados que vibram em frequências desconhecidas facilitando transições rápidas.',
    iconName: 'Footprints',
    color: '#01579B',
    stats: { atk: 8, def: 6, mov: 1, hp: 65 },
    droppedByMonsterTypeIds: ['espreitador_astral'],
  },

  // 4. Aberração Miasmática
  mascara_pestilencia_miasma: {
    id: 'mascara_pestilencia_miasma',
    name: 'Filtro da Putrefação Cósmica',
    category: 'helmet',
    rarity: 'epic',
    description: 'Máscara alquímica que neutraliza vapores pútridos e venenos mortais.',
    iconName: 'VenetianMask',
    color: '#33691E',
    stats: { res: 10, def: 6, hp: 85 },
    droppedByMonsterTypeIds: ['aberracao_miasma'],
  },
  calcas_gosma_toxica: {
    id: 'calcas_gosma_toxica',
    name: 'Perneiras da Decomposição',
    category: 'leggings',
    rarity: 'rare',
    description: 'Calças reforçadas com secreções corrosivas que repelem investidas de perto.',
    iconName: 'Layers',
    color: '#1B5E20',
    stats: { hp: 75, def: 7, res: 7 },
    droppedByMonsterTypeIds: ['aberracao_miasma'],
  },

  // 5. Observador da Loucura
  olho_da_insanidade_pura: {
    id: 'olho_da_insanidade_pura',
    name: 'Globo Ocular do Vazio Eterno',
    category: 'accessory',
    rarity: 'epic',
    description: 'Olho fossilizado de uma criatura estelar que desestabiliza a mente dos oponentes.',
    iconName: 'Eye',
    color: '#880E4F',
    stats: { mag: 17, hp: 70, res: 8 },
    droppedByMonsterTypeIds: ['observador_loucura'],
  },
  coroa_pensamentos_fraturados: {
    id: 'coroa_pensamentos_fraturados',
    name: 'Tiara do Delírio Estelar',
    category: 'helmet',
    rarity: 'epic',
    description: 'Aro flutuante que emite frequências psíquicas ampliando o alcance mágico.',
    iconName: 'Crown',
    color: '#AD1457',
    stats: { mag: 14, res: 9, range: 1 },
    droppedByMonsterTypeIds: ['observador_loucura'],
  },

  // 6. Insetóide do Vazio
  ferrao_perfurante_vazio: {
    id: 'ferrao_perfurante_vazio',
    name: 'Ferrão Quitinoso do Eclipse',
    category: 'weapon',
    rarity: 'epic',
    description: 'Lança afiada como diamante extraída do tórax de predadores do vazio.',
    iconName: 'Crosshair',
    color: '#4A148C',
    stats: { atk: 17, mov: 1, hp: 55 },
    droppedByMonsterTypeIds: ['insetoide_vazio'],
  },
  carapaca_quitina_negra: {
    id: 'carapaca_quitina_negra',
    name: 'Carapaça Quitinosa Cósmica',
    category: 'chestplate',
    rarity: 'epic',
    description: 'Armadura exoesqueletal ultra-resistente que absorve impactos com facilidade.',
    iconName: 'ShieldCheck',
    color: '#311B92',
    stats: { def: 10, res: 7, hp: 95 },
    droppedByMonsterTypeIds: ['insetoide_vazio'],
  },

  // 7. Sirene Abissal
  harpa_canto_dissonante: {
    id: 'harpa_canto_dissonante',
    name: 'Harpa das Frequências Negras',
    category: 'weapon',
    rarity: 'epic',
    description: 'Instrumento cujas cordas emitem acordes que corroem a energia vital inimiga.',
    iconName: 'Sparkles',
    color: '#006064',
    stats: { mag: 16, res: 9, hp: 60 },
    droppedByMonsterTypeIds: ['sirene_abissal'],
  },
  amuleto_seducao_sombria: {
    id: 'amuleto_seducao_sombria',
    name: 'Coração da Sirene Abissal',
    category: 'accessory',
    rarity: 'epic',
    description: 'Gema cristalizada que irradia magnetismo sombrio acelerando manobras.',
    iconName: 'Heart',
    color: '#00838F',
    stats: { mag: 13, hp: 80, mov: 1 },
    droppedByMonsterTypeIds: ['sirene_abissal'],
  },

  // 8. Massa Informe
  nucleo_reconstituicao: {
    id: 'nucleo_reconstituicao',
    name: 'Matriz de Regeneração Celular',
    category: 'accessory',
    rarity: 'epic',
    description: 'Massa bio-estelar sempre ativa que regenera continuamente os tecidos do herói.',
    iconName: 'HeartPulse',
    color: '#1B5E20',
    stats: { hp: 120, def: 6, res: 6 },
    droppedByMonsterTypeIds: ['massa_informe'],
  },
  armadura_gelatinosa: {
    id: 'armadura_gelatinosa',
    name: 'Armadura Amorfa Imune a Choque',
    category: 'chestplate',
    rarity: 'epic',
    description: 'Camada de gel viscoso denso que deforma e anula pancadas esmagadoras.',
    iconName: 'Shield',
    color: '#2E7D32',
    stats: { hp: 110, def: 9, res: 8 },
    droppedByMonsterTypeIds: ['massa_informe'],
  },

  // 9. Pesadelo Vivo
  espada_pesadelo_desperto: {
    id: 'espada_pesadelo_desperto',
    name: 'Gládio dos Terrores Noturnos',
    category: 'weapon',
    rarity: 'epic',
    description: 'Espada sombria envolvida por uma fumaça etérea que causa pânico ao cortar.',
    iconName: 'Sword',
    color: '#4A148C',
    stats: { atk: 17, mag: 10, hp: 60 },
    droppedByMonsterTypeIds: ['pesadelo_vivo'],
  },
  elmo_visao_aterrorizante: {
    id: 'elmo_visao_aterrorizante',
    name: 'Elmo das Alucinações Vivas',
    category: 'helmet',
    rarity: 'epic',
    description: 'Elmo escuro com chifres retorcidos que aterroriza quem ousa encarar o portador.',
    iconName: 'Skull',
    color: '#6A1B9A',
    stats: { atk: 8, mag: 9, res: 8, hp: 70 },
    droppedByMonsterTypeIds: ['pesadelo_vivo'],
  },

  // 10. Parasita do Éter
  dardo_succao_eter: {
    id: 'dardo_succao_eter',
    name: 'Ferrão Parasitário de Mana',
    category: 'weapon',
    rarity: 'rare',
    description: 'Dardo perfurador que drena a reserva mágica dos oponentes em cada estocada.',
    iconName: 'Crosshair',
    color: '#00838F',
    stats: { atk: 12, mag: 12, hp: 50 },
    droppedByMonsterTypeIds: ['parasita_eter'],
  },
  pingente_parasita_bioastral: {
    id: 'pingente_parasita_bioastral',
    name: 'Gema Simbiótica do Éter',
    category: 'accessory',
    rarity: 'epic',
    description: 'Organismo simbiótico que vive na pele e nutre o poder de combate do hospedeiro.',
    iconName: 'Gem',
    color: '#0097A7',
    stats: { mag: 11, atk: 9, mov: 1, hp: 75 },
    droppedByMonsterTypeIds: ['parasita_eter'],
  },

  // =========================================================================
  // ATO V — O ECLIPSE FINAL E O APOCALIPSE (20 Novos Itens)
  // =========================================================================
  // 1. Templário do Sol Negro
  espada_do_sol_negro: {
    id: 'espada_do_sol_negro',
    name: 'Lâmina do Eclipse Devastador',
    category: 'weapon',
    rarity: 'epic',
    description: 'Espada pesada de aço estelar que queima com chamas negras implacáveis.',
    iconName: 'Sword',
    color: '#D50000',
    stats: { atk: 20, def: 6, hp: 80 },
    droppedByMonsterTypeIds: ['templario_sol_negro'],
  },
  escudo_solar_eclipsado: {
    id: 'escudo_solar_eclipsado',
    name: 'Grande Couraça do Sol Negro',
    category: 'chestplate',
    rarity: 'legendary',
    description: 'Armadura monumental forjada no coração do eclipse, praticamente impenetrável.',
    iconName: 'ShieldAlert',
    color: '#C51162',
    stats: { hp: 130, def: 12, res: 10 },
    droppedByMonsterTypeIds: ['templario_sol_negro'],
  },

  // 2. Arauto do Eclipse
  cetro_bencao_eclipse: {
    id: 'cetro_bencao_eclipse',
    name: 'Báculo do Eclipse Absoluto',
    category: 'weapon',
    rarity: 'legendary',
    description: 'Cetro que canaliza a escuridão primordial dos astros para desintegrar exércitos.',
    iconName: 'WandSparkles',
    color: '#AA00FF',
    stats: { mag: 22, range: 1, res: 8, hp: 80 },
    droppedByMonsterTypeIds: ['arauto_do_eclipse'],
  },
  manto_da_escuridao_total: {
    id: 'manto_da_escuridao_total',
    name: 'Manto da Noite Cósmica',
    category: 'chestplate',
    rarity: 'epic',
    description: 'Manto que oculta a presença do herói no campo de batalha sob uma noite sem fim.',
    iconName: 'Moon',
    color: '#720D5D',
    stats: { mag: 16, res: 12, hp: 110 },
    droppedByMonsterTypeIds: ['arauto_do_eclipse'],
  },

  // 3. Inquisidor do Fim
  grilhoes_do_juizo_final: {
    id: 'grilhoes_do_juizo_final',
    name: 'Correntes da Condenação Cósmica',
    category: 'accessory',
    rarity: 'legendary',
    description: 'Relíquia de julgamento que prende a alma dos transgressores da ordem cósmica.',
    iconName: 'CircleDot',
    color: '#D500F9',
    stats: { atk: 14, mag: 14, def: 8, hp: 90 },
    droppedByMonsterTypeIds: ['inquisidor_do_fim'],
  },
  elmo_inquisicao_eterna: {
    id: 'elmo_inquisicao_eterna',
    name: 'Visor do Julgamento Sem Fim',
    category: 'helmet',
    rarity: 'epic',
    description: 'Capacete que concede visão impassível, imune a ilusões e medos mundanos.',
    iconName: 'HardHat',
    color: '#C51162',
    stats: { hp: 95, def: 9, res: 11 },
    droppedByMonsterTypeIds: ['inquisidor_do_fim'],
  },

  // 4. Serafim Caído
  asas_profanadas_serafim: {
    id: 'asas_profanadas_serafim',
    name: 'Plumagem Corrompida do Arcanjo',
    category: 'chestplate',
    rarity: 'legendary',
    description: 'Asas vestíveis de metal etéreo que concedem mobilidade divina e resistência suprema.',
    iconName: 'ShieldCheck',
    color: '#F50057',
    stats: { mag: 18, def: 10, res: 12, mov: 1, hp: 120 },
    droppedByMonsterTypeIds: ['serafim_caido'],
  },
  gladio_luz_corrompida: {
    id: 'gladio_luz_corrompida',
    name: 'Espada da Fé Fraturada',
    category: 'weapon',
    rarity: 'epic',
    description: 'Lâmina outrora abençoada que agora queima com a fúria dos anjos caídos.',
    iconName: 'Swords',
    color: '#FF4081',
    stats: { atk: 18, mag: 15, hp: 75 },
    droppedByMonsterTypeIds: ['serafim_caido'],
  },

  // 5. Titã de Obsidiana
  martelo_terremoto_obsidiana: {
    id: 'martelo_terremoto_obsidiana',
    name: 'Esmagador das Falhas Tectônicas',
    category: 'weapon',
    rarity: 'legendary',
    description: 'Martelo gigantesco talhado em bloco puro de obsidiana que racha o continente.',
    iconName: 'Hammer',
    color: '#212121',
    stats: { atk: 24, def: 8, hp: 100 },
    droppedByMonsterTypeIds: ['tita_obsidiana'],
  },
  placas_colossais_obsidiana: {
    id: 'placas_colossais_obsidiana',
    name: 'Couraça de Obsidiana Inabalável',
    category: 'chestplate',
    rarity: 'legendary',
    description: 'Placas maciças de vidro vulcânico estelar impermeáveis a qualquer ataque.',
    iconName: 'Shield',
    color: '#424242',
    stats: { hp: 160, def: 15, res: 8 },
    droppedByMonsterTypeIds: ['tita_obsidiana'],
  },

  // 6. Ceifador do Crepúsculo
  foice_colheita_almas: {
    id: 'foice_colheita_almas',
    name: 'Ceifadeira das Últimas Luzes',
    category: 'weapon',
    rarity: 'legendary',
    description: 'Lâmina curva titânica que ceifa a centelha vital de qualquer criatura ao toque.',
    iconName: 'PocketKnife',
    color: '#311B92',
    stats: { atk: 22, mag: 12, range: 1, hp: 80 },
    droppedByMonsterTypeIds: ['ceifador_crepusculo'],
  },
  botas_caminho_crepuscular: {
    id: 'botas_caminho_crepuscular',
    name: 'Passos da Meia-Noite Final',
    category: 'boots',
    rarity: 'epic',
    description: 'Botas forjadas no crepúsculo que dobram as distâncias no campo de batalha.',
    iconName: 'Footprints',
    color: '#4A148C',
    stats: { atk: 10, def: 7, mov: 1, hp: 85 },
    droppedByMonsterTypeIds: ['ceifador_crepusculo'],
  },

  // 7. Algoz Celestial
  espada_execucao_pura: {
    id: 'espada_execucao_pura',
    name: 'Lâmina da Sentença Divina',
    category: 'weapon',
    rarity: 'epic',
    description: 'Espada do algoz forjada em ouro celeste para execuções precisas e impiedosas.',
    iconName: 'Sword',
    color: '#FFD600',
    stats: { atk: 21, mag: 12, hp: 70 },
    droppedByMonsterTypeIds: ['algoz_celestial'],
  },
  manoplas_do_algoz: {
    id: 'manoplas_do_algoz',
    name: 'Manoplas da Punição Imediata',
    category: 'accessory',
    rarity: 'epic',
    description: 'Luvas de ferro dourado que transmitem força bruta implacável aos punhos.',
    iconName: 'Medal',
    color: '#FFAB00',
    stats: { atk: 14, def: 8, hp: 80 },
    droppedByMonsterTypeIds: ['algoz_celestial'],
  },

  // 8. Escriba do Destino
  pena_anulacao_destino: {
    id: 'pena_anulacao_destino',
    name: 'Estilete de Reescrever a Realidade',
    category: 'weapon',
    rarity: 'epic',
    description: 'Pena cristalina afiada que inscreve a derrota iminente no destino dos rivais.',
    iconName: 'Scroll',
    color: '#00B0FF',
    stats: { mag: 21, range: 1, hp: 70 },
    droppedByMonsterTypeIds: ['escriba_do_destino'],
  },
  tomo_das_eras_finais: {
    id: 'tomo_das_eras_finais',
    name: 'Registro do Último Segundo',
    category: 'accessory',
    rarity: 'legendary',
    description: 'Manuscrito ancestral contendo os registros do encerramento das eras do tempo.',
    iconName: 'BookOpen',
    color: '#0091EA',
    stats: { mag: 16, res: 12, mov: 1, hp: 95 },
    droppedByMonsterTypeIds: ['escriba_do_destino'],
  },

  // 9. Pretoriano do Caos
  lanca_marcha_implacavel: {
    id: 'lanca_marcha_implacavel',
    name: 'Lança da Conquista Caótica',
    category: 'weapon',
    rarity: 'epic',
    description: 'Arma de perfuração dos generais do caos que abre frentes em qualquer formação.',
    iconName: 'Crosshair',
    color: '#DD2C00',
    stats: { atk: 20, def: 7, hp: 85 },
    droppedByMonsterTypeIds: ['pretoriano_do_caos'],
  },
  grevas_pretorianas_caos: {
    id: 'grevas_pretorianas_caos',
    name: 'Perneiras da Vanguarda Apocalíptica',
    category: 'leggings',
    rarity: 'legendary',
    description: 'Proteção blindada para pernas que garante firmeza absoluta sob fogo cruzado.',
    iconName: 'Layers',
    color: '#BF360C',
    stats: { hp: 130, def: 12, res: 9 },
    droppedByMonsterTypeIds: ['pretoriano_do_caos'],
  },

  // 10. Avatar do Cataclismo
  nucleo_diluvio_estelar: {
    id: 'nucleo_diluvio_estelar',
    name: 'Coração da Ruína Elemental',
    category: 'accessory',
    rarity: 'legendary',
    description: 'Núcleo concentrado de fúria cósmica capaz de dobrar todos os quatro elementos.',
    iconName: 'Sparkle',
    color: '#FF3D00',
    stats: { atk: 15, mag: 20, res: 10, hp: 100 },
    droppedByMonsterTypeIds: ['avatar_cataclismo'],
  },
  coroa_do_cataclismo: {
    id: 'coroa_do_cataclismo',
    name: 'Diadema do Fim dos Elementos',
    category: 'helmet',
    rarity: 'legendary',
    description: 'Coroa que simboliza o domínio sobre a catástrofe final de mundos consumidos.',
    iconName: 'Crown',
    color: '#FF6D00',
    stats: { mag: 18, def: 10, res: 12, range: 1, hp: 110 },
    droppedByMonsterTypeIds: ['avatar_cataclismo'],
  },
};

/**
 * Retorna todos os itens disponíveis dropados por uma lista de monstros.
 */
export function getItemsDroppedByMonsters(monsterTypeIds: string[]): ItemDefinition[] {
  const set = new Set(monsterTypeIds);
  return Object.values(ITEMS).filter((item) =>
    item.droppedByMonsterTypeIds.some((id) => set.has(id))
  );
}

/**
 * Rola de 1 a 3 itens para recompensa ao final de uma fase, com base nos monstros presentes.
 */
export function rollStageItemDrops(
  monsterTypeIds: string[],
  maxChoices = 3,
  isBossStage = false,
  dropBonusLevel = 0
): ItemDefinition[] {
  let pool = getItemsDroppedByMonsters(monsterTypeIds);

  // Fallback para todos os itens caso a lista esteja vazia
  if (pool.length === 0) {
    pool = Object.values(ITEMS);
  }

  // Pesos de raridade (bosses têm mais chance de raros/épicos/lendários)
  const weights: Record<ItemRarity, number> = isBossStage
    ? { common: 20, rare: 45, epic: 25, legendary: 10 }
    : { common: 60, rare: 26, epic: 11, legendary: 3 };

  // Bônus do Upgrade Geral "Caçador de Espólios"
  if (dropBonusLevel === 1) {
    weights.common = Math.max(10, weights.common - 15);
    weights.rare += 8;
    weights.epic += 5;
    weights.legendary += 2;
  } else if (dropBonusLevel === 2) {
    weights.common = Math.max(5, weights.common - 25);
    weights.rare += 12;
    weights.epic += 9;
    weights.legendary += 4;
  } else if (dropBonusLevel >= 3) {
    weights.common = Math.max(0, weights.common - 35);
    weights.rare += 14;
    weights.epic += 14;
    weights.legendary += 7;
  }

  const selected: ItemDefinition[] = [];
  const available = [...pool];

  // Determina número de escolhas (garante 3 se dropBonusLevel >= 2)
  const effectiveMaxChoices = dropBonusLevel >= 2 ? Math.max(3, maxChoices) : maxChoices;
  const targetCount = Math.min(effectiveMaxChoices, Math.max(1, available.length));

  for (let i = 0; i < targetCount; i++) {
    if (available.length === 0) break;

    // Roleta ponderada por raridade
    const totalWeight = available.reduce((acc, it) => acc + (weights[it.rarity] || 10), 0);
    let rand = Math.random() * totalWeight;
    let chosenIndex = 0;

    for (let j = 0; j < available.length; j++) {
      const w = weights[available[j].rarity] || 10;
      if (rand <= w) {
        chosenIndex = j;
        break;
      }
      rand -= w;
    }

    selected.push(available[chosenIndex]);
    available.splice(chosenIndex, 1);
  }

  return selected;
}

export function getRandomItemByRarity(rarity: ItemRarity): ItemDefinition | null {
  const items = Object.values(ITEMS).filter((it) => it.rarity === rarity);
  if (items.length === 0) return null;
  const idx = Math.floor(Math.random() * items.length);
  return items[idx];
}

export function getItemById(id: string): ItemDefinition | undefined {
  return ITEMS[id];
}

export interface MonsterDropChance {
  item: ItemDefinition;
  chancePercent: number;
}

/**
 * Retorna os itens dropados por um monstro específico e a respectiva chance em porcentagem (%).
 */
export function getMonsterDropTable(monsterTypeId: string, isBoss = false): MonsterDropChance[] {
  const monsterItems = Object.values(ITEMS).filter((item) =>
    item.droppedByMonsterTypeIds.includes(monsterTypeId)
  );

  if (monsterItems.length === 0) return [];

  const weights: Record<ItemRarity, number> = isBoss
    ? { common: 20, rare: 45, epic: 25, legendary: 10 }
    : { common: 60, rare: 26, epic: 11, legendary: 3 };

  const totalWeight = monsterItems.reduce((acc, it) => acc + (weights[it.rarity] || 10), 0);

  return monsterItems
    .map((item) => {
      const w = weights[item.rarity] || 10;
      const chancePercent = Math.round((w / totalWeight) * 1000) / 10;
      return { item, chancePercent };
    })
    .sort((a, b) => b.chancePercent - a.chancePercent);
}
