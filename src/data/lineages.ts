export interface LineageStats {
  hp?: number;
  atk?: number;
  mag?: number;
  def?: number;
  res?: number;
  mov?: number;
  range?: number;
}

export interface LineageDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  bonusTitle: string;
  bonusDescription: string;
  iconName: string;
  color: string;
  stats: LineageStats;
  lifestealPercent?: number;
  hpRegenPercent?: number;
  healShieldBonusPercent?: number;
  appliesBurn?: boolean;
  startShieldPercent?: number;
  goldBonusPercent?: number;
  missingHpDamageScaling?: boolean;
  defenseIgnorePercent?: number;
  phoenixRevive?: boolean;

  equipmentStatsBonusPercent?: number;
  standStillDamageBonusPercent?: number;
  halfHpTrigger?: { shieldPercent: number; damageBonusPercent: number; duration: number };
  crowdControlImmunity?: boolean;
  healShieldAlliesDamageBuff?: number;
  severeBurn?: boolean;
  burnImmune?: boolean;
  shieldReflectRatio?: number;
  healShieldFlatScalingBonus?: number;
  ignoreDefenseExclusive?: number;
  phoenixRevive1Hp?: boolean;
  extraAttackEveryTurn?: boolean;

  centaurCharge?: boolean;
  bleedBonusDamagePercent?: number;
  extraPushDistance?: number;
  eggDropRateMultiplier?: number;
  kitsuneFreeSkillReset?: boolean;
  physicalDamageReductionPercent?: number;
  potentPoison?: boolean;
}

export const LINEAGES: LineageDefinition[] = [
  {
    id: 'humano',
    name: 'Humano',
    title: 'Versatilidade & Ambição',
    description: 'Conhecidos pela determinação inquebrável e facilidade de adaptação a qualquer cenário tático. São exploradores excepcionais que prosperam acumulando recursos.',
    bonusTitle: 'Ambição & Prosperidade',
    bonusDescription: '+15% de Ouro recebido ao final das batalhas (não acumulável). +5 de Magia e +5 de Dano Físico.',
    iconName: 'Footprints',
    color: '#4C8DFF',
    stats: {
      atk: 5,
      mag: 5,
    },
    goldBonusPercent: 15,
  },
  {
    id: 'elfo',
    name: 'Elfo',
    title: 'Afinidade Cósmica & Percepção',
    description: 'Seres antigos dotados de percepção aguçada e afinidade mágica incomparável. Atacam alvos distantes com precisão milimétrica e postura implacável.',
    bonusTitle: 'Firmeza & Mira Élfica',
    bonusDescription: 'Se finalizar o turno sem se mover, recebe +15% de dano no próximo turno. +1 de alcance de ataque normal.',
    iconName: 'Target',
    color: '#10B981',
    stats: {
      range: 1,
    },
    standStillDamageBonusPercent: 15,
  },
  {
    id: 'anao',
    name: 'Anão',
    title: 'Fortaleza da Montanha',
    description: 'Mestres forjadores de constituição rochosa e vigor lendário. Extraem o potencial máximo de cada liga metálica e artefato forjado.',
    bonusTitle: 'Mestre da Forja Titânica',
    bonusDescription: 'Recebe 20% de status a mais de todos os equipamentos. +15 de vida máxima.',
    iconName: 'Shield',
    color: '#F59E0B',
    stats: {
      hp: 15,
    },
    equipmentStatsBonusPercent: 20,
  },
  {
    id: 'orc',
    name: 'Orc',
    title: 'Brutalidade & Força Selvagem',
    description: 'Guerreiros ferozes movidos pela adrenalina do combate direto. Ao atingirem o limiar da sobrevivência, sua musculatura se enrijece em pura fúria.',
    bonusTitle: 'Fúria Berserk da Horda',
    bonusDescription: 'Na primeira vez que ficar com metade da vida (<= 50%), ganhe um escudo de 20% da vida máxima e +15% de dano por 2 turnos. +15 de vida e +10 de dano físico.',
    iconName: 'Swords',
    color: '#EF4444',
    stats: {
      hp: 15,
      atk: 10,
    },
    halfHpTrigger: { shieldPercent: 20, damageBonusPercent: 15, duration: 2 },
  },
  {
    id: 'vampiro',
    name: 'Vampiro',
    title: 'Imortalidade Noturna & Dreno',
    description: 'Aristocratas das sombras que se alimentam da força vital de suas presas. Cada ferimento infligido ao inimigo restaura sua própria essência vital.',
    bonusTitle: 'Sede Carmesim Voraz',
    bonusDescription: 'Cura-se em 20% de todo dano causado. +25 de vida.',
    iconName: 'Skull',
    color: '#A855F7',
    stats: {
      hp: 25,
    },
    lifestealPercent: 20,
  },
  {
    id: 'celestial',
    name: 'Celestial',
    title: 'Luz Sagrada & Regeneração Divina',
    description: 'Descendentes de entidades astrais dos céus. Emanam uma radiação de luz revigorante que inspira e potencializa a coragem ofensiva de seus aliados.',
    bonusTitle: 'Bênção da Luz Fortalecedora',
    bonusDescription: 'Escudos e curas também fornecem aos aliados +15% de dano por 2 turnos. +10 de vida, +5 de armadura e +5 de resistência.',
    iconName: 'Sun',
    color: '#FFD700',
    stats: {
      hp: 10,
      def: 5,
      res: 5,
    },
    healShieldAlliesDamageBuff: 15,
  },
  {
    id: 'dragonoide',
    name: 'Dragonoide',
    title: 'Fúria Dracônica & Chamas Ancestrais',
    description: 'Herdeiros diretos do sangue dos dragões vulcânicos. Suas escamas são imunes ao fogo e seus golpes incendeiam a própria essência dos alvos com calor destrutivo.',
    bonusTitle: 'Sangue de Dragão Vulcânico',
    bonusDescription: 'Imune a queimaduras. Ataques e habilidades dessa linhagem infringem queimadura severa ao invés de queimadura normal (3% da vida máxima por turno). +10 de dano mágico e +10 de vida.',
    iconName: 'Flame',
    color: '#FF6B00',
    stats: {
      hp: 10,
      mag: 10,
    },
    burnImmune: true,
    severeBurn: true,
  },
  {
    id: 'feerico',
    name: 'Feérico',
    title: 'Ilusão Astral & Véu Encantado',
    description: 'Nativos das florestas crepusculares e reinos encantados. Suas barreiras mágicas entrelaçam espinhos dimensionais que punem os agressores.',
    bonusTitle: 'Espinhos do Véu Místico',
    bonusDescription: 'Todos os escudos aplicados por essa unidade possuem espinhos (reflete 30% do dano recebido). +10 de vida, +5 de armadura e +5 de resistência.',
    iconName: 'Sparkles',
    color: '#06B6D4',
    stats: {
      hp: 10,
      def: 5,
      res: 5,
    },
    shieldReflectRatio: 0.3,
  },
  {
    id: 'minotauro',
    name: 'Minotauro',
    title: 'Fúria do Labirinto & Força Colossal',
    description: 'Guerreiros colossais de chifres maciços e firmeza absoluta. Seu peso colossal e fisiologia inabalável tornam-no impermeável a debuffs e deslocamentos forçados.',
    bonusTitle: 'Constituição Inabalável do Labirinto',
    bonusDescription: 'Imunidade a Empurrão, lentidão, puxão, veneno, sangramento e queimadura. +20 de vida máxima e +8 de dano físico.',
    iconName: 'Shield',
    color: '#D97706',
    stats: {
      hp: 20,
      atk: 8,
    },
    crowdControlImmunity: true,
    burnImmune: true,
  },
  {
    id: 'anjo',
    name: 'Anjo',
    title: 'Graça Celestial & Asas da Luz',
    description: 'Emissários alados dos planos superiores. Canalizam a pureza da luz divina para elevar a magnitude de todos os seus milagres de restauração e proteção.',
    bonusTitle: 'Graça Empírea Sagrada',
    bonusDescription: '+15% de escalonamento em escudos e curas (se for 50% vai para 65% por exemplo). +10 de vida, +5 de armadura e +5 de resistência.',
    iconName: 'Sun',
    color: '#38BDF8',
    stats: {
      hp: 10,
      def: 5,
      res: 5,
    },
    healShieldFlatScalingBonus: 0.15,
  },
  {
    id: 'demonio',
    name: 'Demônio',
    title: 'Pacto Abissal & Ruína Profana',
    description: 'Entidades vorazes nascidas nas profundezas do Abismo. Suas investidas corrompem as armaduras e barreiras mortais, rasgando defesas sólidas.',
    bonusTitle: 'Lâmina Profana do Abismo',
    bonusDescription: 'Ataques e habilidades ignoram 20% da armadura e resistência dos inimigos. Caso o ataque já ignore a armadura/resistência, esse efeito não faz nada. +10 de dano físico e +10 de dano mágico.',
    iconName: 'Skull',
    color: '#DC2626',
    stats: {
      atk: 10,
      mag: 10,
    },
    ignoreDefenseExclusive: 20,
  },
  {
    id: 'nefalim',
    name: 'Nefalim',
    title: 'Híbrido Proibido de Anjo & Demônio',
    description: 'A lendária prole nascida da união proibida entre Anjos e Demônios. Conduz uma torrente incansável de golpes duplos onde a luz e a escuridão se chocam.',
    bonusTitle: 'Frenesi da Dualidade Proibida',
    bonusDescription: 'Em todo turno, pode usar um ataque adicional a suas ações normais. +12 de dano físico e +10 de vida.',
    iconName: 'Sparkles',
    color: '#C084FC',
    stats: {
      hp: 10,
      atk: 12,
    },
    extraAttackEveryTurn: true,
  },
  {
    id: 'fenix',
    name: 'Fênix',
    title: 'Chama Imortal & Renascimento das Cinzas',
    description: 'Espíritos primordiais do fogo solar eterno. Seu núcleo primordial recusa a morte biológica, desafiando o golpe fatal para continuar em combate.',
    bonusTitle: 'Chama Imortal',
    bonusDescription: 'Na primeira vez que fosse receber um dano letal, sobrevive com 1 de vida. +5 de magia, +10 de vida e +5 de resistência.',
    iconName: 'Flame',
    color: '#F97316',
    stats: {
      hp: 10,
      mag: 5,
      res: 5,
    },
    phoenixRevive1Hp: true,
  },
  {
    id: 'centauro',
    name: 'Centauro',
    title: 'Ímpeto dos Campos Abertos',
    description: 'Nômades imponentes e velozes. Cada passada acumula energia cinética avassaladora para o próximo golpe.',
    bonusTitle: 'Carga dos Campos',
    bonusDescription: 'Cada casa que você andar concede 5% de dano no próximo ataque, seja sendo movido por magias ou andando com a movimentação padrão. (Não acumula entre rodadas, acaba no final do turno e é perdido se não utilizado.) +10 de dano físico, +1 de movimento e +5 de vida.',
    iconName: 'Footprints',
    color: '#D97706',
    stats: {
      atk: 10,
      mov: 1,
      hp: 5,
    },
    centaurCharge: true,
  },
  {
    id: 'lobisomem',
    name: 'Lobisomem',
    title: 'Fera da Lua Sangrenta',
    description: 'Predadores cruéis que sentem o pulsar de presas feridas, dilacerando alvos debilitados com fúria visceral.',
    bonusTitle: 'Sede de Sangue',
    bonusDescription: 'Ataques e habilidades contra inimigos sangrando causam 20% de dano adicional. +10 de dano físico e +5 de vida.',
    iconName: 'Skull',
    color: '#DC2626',
    stats: {
      atk: 10,
      hp: 5,
    },
    bleedBonusDamagePercent: 20,
  },
  {
    id: 'zephyros',
    name: 'Zephyros',
    title: 'Senhores das Correntes de Vento',
    description: 'Homens-pássaros graciosos cujos ataques canalizam tempestades ciclônicas para afastar ameaças.',
    bonusTitle: 'Rajada Ciclônica',
    bonusDescription: 'Efeitos de empurrão empurram 1 casa a mais. +5 de armadura, +5 de resistência e +5 de vida.',
    iconName: 'Sparkles',
    color: '#38BDF8',
    stats: {
      def: 5,
      res: 5,
      hp: 5,
    },
    extraPushDistance: 1,
  },
  {
    id: 'lagomorfo',
    name: 'Lagomorfo',
    title: 'Abençoados da Primavera',
    description: 'Homens-coelho dotados de sentidos apurados para farejar tesouros raros e ninhos de companheiros.',
    bonusTitle: 'Pata da Fortuna',
    bonusDescription: '2x mais chance de encontrar ovos de companheiro em combate (limite de 1 por equipe; ter mais de um não acumula). +20 de vida máxima.',
    iconName: 'Sparkles',
    color: '#34D399',
    stats: {
      hp: 20,
    },
    eggDropRateMultiplier: 2,
  },
  {
    id: 'kitsune',
    name: 'Kitsune',
    title: 'Espírito Ilusório das Nove Caudas',
    description: 'Espíritos raposa ancestrais que dominam truques místicos para recarregar feitiços em um piscar de olhos.',
    bonusTitle: 'Truque Místico',
    bonusDescription: 'A primeira habilidade utilizada em combate possui seu cooldown restaurado após o uso. Não afeta habilidades de atordoamento (stun).',
    iconName: 'Sparkles',
    color: '#F472B6',
    stats: {},
    kitsuneFreeSkillReset: true,
  },
  {
    id: 'espectro',
    name: 'Espectro',
    title: 'Ecos do Véu Etéreo',
    description: 'Entidades sobrenaturais que deslizam entre dimensões, fazendo com que golpes materiais atravessem parte de sua essência.',
    bonusTitle: 'Forma Incorpórea',
    bonusDescription: 'Recebem 10% a menos de dano físico de todas as fontes. +10 de resistência e +10 de dano físico.',
    iconName: 'Skull',
    color: '#A855F7',
    stats: {
      res: 10,
      atk: 10,
    },
    physicalDamageReductionPercent: 10,
  },
  {
    id: 'murideo',
    name: 'Murídeo',
    title: 'Senhores da Pestilência',
    description: 'Homens-rato dos subterrâneos profundos que banham suas lâminas e feitiços em toxinas virulentas e corrosivas.',
    bonusTitle: 'Veneno Potente',
    bonusDescription: 'Ataques e habilidades que causariam envenenamento, causam envenenamento potente (causa 2% da vida máxima por turno e diminui a defesa do alvo em 15%). +10 de dano físico e +5 de vida.',
    iconName: 'Skull',
    color: '#84CC16',
    stats: {
      atk: 10,
      hp: 5,
    },
    potentPoison: true,
  },
];

export const LINEAGES_BY_ID: Record<string, LineageDefinition> = Object.fromEntries(
  LINEAGES.map((l) => [l.id, l])
);

export function getLineageById(id?: string | null): LineageDefinition {
  if (!id) return LINEAGES[0];
  const effectiveId = id === 'draconato' ? 'dragonoide' : id;
  return LINEAGES_BY_ID[effectiveId] || LINEAGES[0];
}

// Linhagens iniciais padrão para cada classe (usando as 3 iniciais desbloqueadas)
export const DEFAULT_CLASS_LINEAGES: Record<string, string> = {
  guerreiro: 'anao',
  arqueiro: 'elfo',
  mago: 'humano',
  curandeiro: 'humano',
  assassino: 'humano',
  cavaleiro_arcano: 'humano',
  necromante: 'humano',
  druida: 'elfo',
  mago_runico: 'anao',
  berserker: 'anao',
  carrasco_vazio: 'humano',
  paladino: 'humano',
  lanceiro: 'anao',
  bardo: 'elfo',
  mago_gelo: 'elfo',
  sniper: 'elfo',
  mago_eletrico: 'humano',
  mago_vento: 'elfo',
  omnimago: 'humano',
};
