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
    iconName: 'Sword',
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
    iconName: 'HardHat',
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
    iconName: 'Gem',
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
    iconName: 'HardHat',
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
    iconName: 'Gem',
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
    iconName: 'Shield',
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
    iconName: 'HardHat',
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
    iconName: 'Footprints',
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
    iconName: 'Shield',
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
    iconName: 'Shield',
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
    iconName: 'HardHat',
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
    iconName: 'Gem',
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
    iconName: 'Swords',
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
    iconName: 'Layers',
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
    iconName: 'Gem',
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
    iconName: 'Shield',
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
    iconName: 'HardHat',
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
    iconName: 'Swords',
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
    iconName: 'Gem',
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
    iconName: 'Wand2',
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
    iconName: 'HardHat',
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
    iconName: 'Shield',
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
    iconName: 'Gem',
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
    iconName: 'Hammer',
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
    iconName: 'Shield',
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
    iconName: 'Layers',
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
    iconName: 'Wand2',
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
    iconName: 'HardHat',
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
    iconName: 'Gem',
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
    iconName: 'Shield',
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
    iconName: 'Swords',
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
    iconName: 'HardHat',
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
    iconName: 'Gem',
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
    iconName: 'Wand2',
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
    iconName: 'Shield',
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
    iconName: 'HardHat',
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
    iconName: 'Sword',
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
    iconName: 'Wand2',
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
    iconName: 'Shield',
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
    iconName: 'Gem',
    color: '#FF1744',
    stats: { hp: 70, atk: 8, mag: 8, mov: 1 },
    droppedByMonsterTypeIds: ['cronos_abissal'],
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
  isBossStage = false
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

  const selected: ItemDefinition[] = [];
  const available = [...pool];

  // Determina número de escolhas (entre 1 e maxChoices, dependendo do tamanho da fase)
  const targetCount = Math.min(maxChoices, Math.max(1, available.length));

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
