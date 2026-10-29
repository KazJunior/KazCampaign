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
}

export const LINEAGES: LineageDefinition[] = [
  {
    id: 'humano',
    name: 'Humano',
    title: 'Versatilidade & Ambição',
    description: 'Conhecidos pela determinação inquebrável e facilidade de adaptação a qualquer cenário tático. São exploradores excepcionais que prosperam acumulando recursos.',
    bonusTitle: 'Espírito Pioneiro',
    bonusDescription: '+1 de Movimento, +15 de Vida Máxima e +15% de Ouro obtido ao final das batalhas.',
    iconName: 'Footprints',
    color: '#4C8DFF',
    stats: {
      hp: 15,
      mov: 1,
    },
    goldBonusPercent: 15,
  },
  {
    id: 'elfo',
    name: 'Elfo',
    title: 'Afinidade Cósmica & Percepção',
    description: 'Seres antigos dotados de percepção aguçada e afinidade mágica incomparável. Atacam alvos distantes com precisão milimétrica e poder arcano superior.',
    bonusTitle: 'Mira & Maestria Arcana',
    bonusDescription: '+1 de Alcance de Ataque Básico, +8 de Magia e +3 de Resistência Mágica.',
    iconName: 'Target',
    color: '#10B981',
    stats: {
      mag: 8,
      res: 3,
      range: 1,
    },
  },
  {
    id: 'anao',
    name: 'Anão',
    title: 'Fortaleza da Montanha',
    description: 'Mestres forjadores de constituição rochosa e vigor lendário. Suportam golpes devastadores na linha de frente como verdadeiras muralhas vivas.',
    bonusTitle: 'Sangue de Rocha & Aço',
    bonusDescription: '+35 de Vida Máxima, +5 de Defesa Física e +4 de Resistência Mágica.',
    iconName: 'Shield',
    color: '#F59E0B',
    stats: {
      hp: 35,
      def: 5,
      res: 4,
    },
  },
  {
    id: 'orc',
    name: 'Orc',
    title: 'Brutalidade & Força Selvagem',
    description: 'Guerreiros ferozes movidos pela adrenalina do combate direto. Seus golpes carregam um impacto esmagador capaz de quebrar qualquer guarda.',
    bonusTitle: 'Fúria de Sangue',
    bonusDescription: '+8 de Ataque Físico, +20 de Vida Máxima e +2 de Defesa.',
    iconName: 'Swords',
    color: '#EF4444',
    stats: {
      hp: 20,
      atk: 8,
      def: 2,
    },
  },
  {
    id: 'vampiro',
    name: 'Vampiro',
    title: 'Imortalidade Noturna & Dreno',
    description: 'Aristocratas das sombras que se alimentam da força vital de suas presas. Cada ferimento infligido ao inimigo restaura sua própria essência.',
    bonusTitle: 'Sede Carmesim',
    bonusDescription: 'Converte 15% de todo o dano causado em Cura para si mesmo (Roubo de Vida), +4 de Ataque e +4 de Magia.',
    iconName: 'Skull',
    color: '#A855F7',
    stats: {
      atk: 4,
      mag: 4,
    },
    lifestealPercent: 15,
  },
  {
    id: 'celestial',
    name: 'Celestial',
    title: 'Luz Sagrada & Regeneração Divina',
    description: 'Descendentes de entidades astrais dos céus. Uma aura reconfortante purifica seu corpo a cada instante e potencializa milagres de suporte e proteção.',
    bonusTitle: 'Bênção Cósmica',
    bonusDescription: 'Regenera 6% de Vida Máxima no início de cada rodada, +20% de eficácia em Curas/Escudos e +5 de Resistência.',
    iconName: 'Sun',
    color: '#FFD700',
    stats: {
      res: 5,
      hp: 15,
    },
    hpRegenPercent: 6,
    healShieldBonusPercent: 20,
  },
  {
    id: 'dragonoide',
    name: 'Dragonoide',
    title: 'Fúria Dracônica & Chamas Ancestrais',
    description: 'Herdeiros diretos do sangue dos dragões vulcânicos. Protegidos por escamas ardentes que incendeiam qualquer oponente atingido por seus ataques ou magias com chamas vorazes.',
    bonusTitle: 'Hálito de Fogo & Escamas',
    bonusDescription: '+4 de Defesa, +4 de Resistência, +15 de Vida e todos os ataques aplicam Queimadura (Burn) por 2 turnos.',
    iconName: 'Flame',
    color: '#FF6B00',
    stats: {
      def: 4,
      res: 4,
      hp: 15,
    },
    appliesBurn: true,
  },
  {
    id: 'feerico',
    name: 'Feérico',
    title: 'Ilusão Astral & Véu Encantado',
    description: 'Nativos das florestas crepusculares e reinos encantados. Entram na contenda protegidos por uma barreira ilusória que desvia a primeira investida letal.',
    bonusTitle: 'Véu Ilusório',
    bonusDescription: 'Inicia cada batalha com Escudo equivalente a 25% da Vida Máxima, +1 de Movimento e +3 de Resistência.',
    iconName: 'Sparkles',
    color: '#06B6D4',
    stats: {
      mov: 1,
      res: 3,
    },
    startShieldPercent: 25,
  },
  {
    id: 'minotauro',
    name: 'Minotauro',
    title: 'Fúria do Labirinto & Força Colossal',
    description: 'Guerreiros colossais de chifres maciços e musculatura titânica. Quanto mais feridos ficam em batalha, mais devastadores se tornam seus golpes.',
    bonusTitle: 'Sangue Furioso do Labirinto',
    bonusDescription: '+30 de Vida Máxima, +6 de Ataque, +4 de Defesa e causa até +35% de dano adicional proporcional à Vida perdida.',
    iconName: 'Shield',
    color: '#D97706',
    stats: {
      hp: 30,
      atk: 6,
      def: 4,
    },
    missingHpDamageScaling: true,
  },
  {
    id: 'anjo',
    name: 'Anjo',
    title: 'Graça Celestial & Asas da Luz',
    description: 'Emissários alados dos planos superiores. Suas asas sagradas permitem deslocamento elevado e emanam uma luz que amplifica curas, escudos e regeneração.',
    bonusTitle: 'Asas da Graça Divina',
    bonusDescription: '+1 de Movimento, +25% de eficácia em Curas e Escudos, regenera 5% de Vida por turno, +15 HP, +6 de Magia e +5 de Resistência.',
    iconName: 'Sun',
    color: '#38BDF8',
    stats: {
      hp: 15,
      mag: 6,
      res: 5,
      mov: 1,
    },
    hpRegenPercent: 5,
    healShieldBonusPercent: 25,
  },
  {
    id: 'demonio',
    name: 'Demônio',
    title: 'Pacto Abissal & Ruína Profana',
    description: 'Entidades vorazes nascidas nas profundezas do Abismo. Seus ataques perfuram as defesas mortais e drenam a vitalidade das vítimas sem piedade.',
    bonusTitle: 'Lâmina do Submundo',
    bonusDescription: 'Ignora 20% da Defesa e Resistência dos inimigos, +10% de Roubo de Vida, +7 de Ataque e +7 de Magia.',
    iconName: 'Skull',
    color: '#DC2626',
    stats: {
      atk: 7,
      mag: 7,
    },
    lifestealPercent: 10,
    defenseIgnorePercent: 20,
  },
  {
    id: 'nefalim',
    name: 'Nefalim',
    title: 'Híbrido Proibido de Anjo & Demônio',
    description: 'A lendária prole nascida da união proibida entre Anjos e Demônios. Domina simultaneamente a luz regeneradora celestial e o poder destrutivo que ignora defesas do Abismo.',
    bonusTitle: 'Dualidade Luz & Trevas',
    bonusDescription: 'Ignora 15% da Defesa/Resistência inimiga, 10% de Roubo de Vida, regenera 4% de Vida por turno, +15 HP, +5 ATK, +5 MAG, +3 DEF e +3 RES.',
    iconName: 'Sparkles',
    color: '#C084FC',
    stats: {
      hp: 15,
      atk: 5,
      mag: 5,
      def: 3,
      res: 3,
    },
    defenseIgnorePercent: 15,
    lifestealPercent: 10,
    hpRegenPercent: 4,
  },
  {
    id: 'fenix',
    name: 'Fênix',
    title: 'Chama Imortal & Renascimento das Cinzas',
    description: 'Espíritos primordiais do fogo solar eterno. Caso recebam um golpe fatal, renascem das próprias cinzas uma vez por batalha em uma explosão de vida e chamas.',
    bonusTitle: 'Renascimento das Cinzas',
    bonusDescription: 'Ao sofrer dano fatal, renasce imediatamente com 50% da Vida Máxima (1x por batalha), todos os ataques aplicam Queimadura, +20 HP e +6 MAG.',
    iconName: 'Flame',
    color: '#F97316',
    stats: {
      hp: 20,
      mag: 6,
    },
    appliesBurn: true,
    phoenixRevive: true,
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
