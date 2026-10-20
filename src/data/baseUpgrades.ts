import type { ItemRarity, ItemStats } from '../types/game';

// ============================================================================
// 1. CLASS UPGRADES (5 Upgrades per class: 10k, 30k, 50k, 80k, 100k)
// ============================================================================

export const CLASS_UPGRADE_COSTS = [10000, 30000, 50000, 80000, 100000] as const;
export const MAX_CLASS_UPGRADE_LEVEL = 5;

export interface ClassUpgradeTier {
  level: number;
  cost: number;
  bonus: {
    hp?: number;
    atk?: number;
    mag?: number;
    def?: number;
    res?: number;
  };
  name: string;
  description: string;
}

export const CLASS_UPGRADES: Record<string, ClassUpgradeTier[]> = {
  guerreiro: [
    { level: 1, cost: 10000, bonus: { hp: 20, def: 1 }, name: 'Couraça de Treino', description: '+20 HP e +1 DEF permanente.' },
    { level: 2, cost: 30000, bonus: { hp: 25, atk: 2 }, name: 'Impacto Pesado', description: '+25 HP e +2 ATK permanente.' },
    { level: 3, cost: 50000, bonus: { hp: 35, def: 2 }, name: 'Muralha de Ferro', description: '+35 HP e +2 DEF permanente.' },
    { level: 4, cost: 80000, bonus: { hp: 45, atk: 3, def: 2 }, name: 'Vanguarda Inquebrável', description: '+45 HP, +3 ATK e +2 DEF permanente.' },
    { level: 5, cost: 100000, bonus: { hp: 60, atk: 4, def: 3, res: 2 }, name: 'Mestre das Armaduras', description: '+60 HP, +4 ATK, +3 DEF e +2 RES permanente.' },
  ],
  arqueiro: [
    { level: 1, cost: 10000, bonus: { hp: 15, atk: 2 }, name: 'Olhos de Falcão', description: '+15 HP e +2 ATK permanente.' },
    { level: 2, cost: 30000, bonus: { hp: 20, atk: 3 }, name: 'Corda Reforçada', description: '+20 HP e +3 ATK permanente.' },
    { level: 3, cost: 50000, bonus: { hp: 25, atk: 4, def: 1 }, name: 'Passos Leves', description: '+25 HP, +4 ATK e +1 DEF permanente.' },
    { level: 4, cost: 80000, bonus: { hp: 35, atk: 5, res: 1 }, name: 'Disparo Perfurante', description: '+35 HP, +5 ATK e +1 RES permanente.' },
    { level: 5, cost: 100000, bonus: { hp: 50, atk: 7, def: 2, res: 2 }, name: 'Franco-Atirador Lendário', description: '+50 HP, +7 ATK, +2 DEF e +2 RES permanente.' },
  ],
  mago: [
    { level: 1, cost: 10000, bonus: { hp: 12, mag: 2 }, name: 'Meditação Ígnea', description: '+12 HP e +2 MAG permanente.' },
    { level: 2, cost: 30000, bonus: { hp: 18, mag: 3, res: 1 }, name: 'Canalização das Chamas', description: '+18 HP, +3 MAG e +1 RES permanente.' },
    { level: 3, cost: 50000, bonus: { hp: 22, mag: 4, res: 1 }, name: 'Chama Interior', description: '+22 HP, +4 MAG e +1 RES permanente.' },
    { level: 4, cost: 80000, bonus: { hp: 30, mag: 5, res: 2 }, name: 'Vórtice de Magma', description: '+30 HP, +5 MAG e +2 RES permanente.' },
    { level: 5, cost: 100000, bonus: { hp: 45, mag: 8, res: 3, def: 2 }, name: 'Arquimago do Fogo', description: '+45 HP, +8 MAG, +3 RES e +2 DEF permanente.' },
  ],
  curandeiro: [
    { level: 1, cost: 10000, bonus: { hp: 20, mag: 2 }, name: 'Bênção Sagrada', description: '+20 HP e +2 MAG permanente.' },
    { level: 2, cost: 30000, bonus: { hp: 25, mag: 2, res: 1 }, name: 'Proteção Divina', description: '+25 HP, +2 MAG e +1 RES permanente.' },
    { level: 3, cost: 50000, bonus: { hp: 30, mag: 3, def: 2 }, name: 'Aura de Paz', description: '+30 HP, +3 MAG e +2 DEF permanente.' },
    { level: 4, cost: 80000, bonus: { hp: 40, mag: 4, res: 2, def: 1 }, name: 'Milagre Radiante', description: '+40 HP, +4 MAG, +2 RES e +1 DEF permanente.' },
    { level: 5, cost: 100000, bonus: { hp: 60, mag: 6, res: 3, def: 3 }, name: 'Arauto da Luz', description: '+60 HP, +6 MAG, +3 RES e +3 DEF permanente.' },
  ],
  assassino: [
    { level: 1, cost: 10000, bonus: { hp: 15, atk: 2 }, name: 'Lâmina Oculta', description: '+15 HP e +2 ATK permanente.' },
    { level: 2, cost: 30000, bonus: { hp: 20, atk: 3 }, name: 'Passos Furtivos', description: '+20 HP e +3 ATK permanente.' },
    { level: 3, cost: 50000, bonus: { hp: 25, atk: 4, def: 1 }, name: 'Veneno de Contato', description: '+25 HP, +4 ATK e +1 DEF permanente.' },
    { level: 4, cost: 80000, bonus: { hp: 30, atk: 5, res: 1 }, name: 'Dança das Sombras', description: '+30 HP, +5 ATK e +1 RES permanente.' },
    { level: 5, cost: 100000, bonus: { hp: 45, atk: 8, def: 2, res: 2 }, name: 'Mestre Assassino', description: '+45 HP, +8 ATK, +2 DEF e +2 RES permanente.' },
  ],
  cavaleiro_arcano: [
    { level: 1, cost: 10000, bonus: { hp: 20, atk: 1, mag: 1 }, name: 'Glaive Encantada', description: '+20 HP, +1 ATK e +1 MAG permanente.' },
    { level: 2, cost: 30000, bonus: { hp: 25, def: 2, res: 1 }, name: 'Égide Rúnica', description: '+25 HP, +2 DEF e +1 RES permanente.' },
    { level: 3, cost: 50000, bonus: { hp: 30, atk: 2, mag: 2 }, name: 'Lâmina Eletrizante', description: '+30 HP, +2 ATK e +2 MAG permanente.' },
    { level: 4, cost: 80000, bonus: { hp: 40, atk: 3, mag: 3, def: 2 }, name: 'Cruzado Arcano', description: '+40 HP, +3 ATK, +3 MAG e +2 DEF permanente.' },
    { level: 5, cost: 100000, bonus: { hp: 60, atk: 4, mag: 4, def: 3, res: 2 }, name: 'Guardião da Fenda', description: '+60 HP, +4 ATK, +4 MAG, +3 DEF e +2 RES permanente.' },
  ],
  necromante: [
    { level: 1, cost: 10000, bonus: { hp: 15, mag: 2 }, name: 'Comunhão com as Sombras', description: '+15 HP e +2 MAG permanente.' },
    { level: 2, cost: 30000, bonus: { hp: 20, mag: 3, res: 1 }, name: 'Dreno de Essência', description: '+20 HP, +3 MAG e +1 RES permanente.' },
    { level: 3, cost: 50000, bonus: { hp: 25, mag: 3, def: 2 }, name: 'Manto Funesto', description: '+25 HP, +3 MAG e +2 DEF permanente.' },
    { level: 4, cost: 80000, bonus: { hp: 35, mag: 5, res: 2 }, name: 'Pacto Abissal', description: '+35 HP, +5 MAG e +2 RES permanente.' },
    { level: 5, cost: 100000, bonus: { hp: 50, mag: 7, res: 3, def: 2 }, name: 'Lorde da Morte', description: '+50 HP, +7 MAG, +3 RES e +2 DEF permanente.' },
  ],
  druida: [
    { level: 1, cost: 10000, bonus: { hp: 20, mag: 2, def: 1 }, name: 'Comunhão Florestal', description: '+20 HP, +2 MAG e +1 DEF permanente.' },
    { level: 2, cost: 30000, bonus: { hp: 25, mag: 3, res: 1 }, name: 'Seiva Ancestral', description: '+25 HP, +3 MAG e +1 RES permanente.' },
    { level: 3, cost: 50000, bonus: { hp: 35, mag: 4, def: 2 }, name: 'Casca Imorredoura', description: '+35 HP, +4 MAG e +2 DEF permanente.' },
    { level: 4, cost: 80000, bonus: { hp: 45, mag: 5, def: 2, res: 2 }, name: 'Força da Alcateia', description: '+45 HP, +5 MAG, +2 DEF e +2 RES permanente.' },
    { level: 5, cost: 100000, bonus: { hp: 60, mag: 7, def: 3, res: 3 }, name: 'Guardião do Bosque Sagrado', description: '+60 HP, +7 MAG, +3 DEF e +3 RES permanente.' },
  ],
  mago_runico: [
    { level: 1, cost: 10000, bonus: { hp: 15, mag: 2 }, name: 'Glifos Antigos', description: '+15 HP e +2 MAG permanente.' },
    { level: 2, cost: 30000, bonus: { hp: 20, mag: 3, res: 1 }, name: 'Ressonância Rúnica', description: '+20 HP, +3 MAG e +1 RES permanente.' },
    { level: 3, cost: 50000, bonus: { hp: 25, mag: 4, def: 1 }, name: 'Inscrições Protetoras', description: '+25 HP, +4 MAG e +1 DEF permanente.' },
    { level: 4, cost: 80000, bonus: { hp: 35, mag: 5, res: 2 }, name: 'Sobrecarga de Mana', description: '+35 HP, +5 MAG e +2 RES permanente.' },
    { level: 5, cost: 100000, bonus: { hp: 50, mag: 8, res: 3, def: 2 }, name: 'Soberano das Runas', description: '+50 HP, +8 MAG, +3 RES e +2 DEF permanente.' },
  ],
  berserker: [
    { level: 1, cost: 10000, bonus: { hp: 25, atk: 2 }, name: 'Sede de Batalha', description: '+25 HP e +2 ATK permanente.' },
    { level: 2, cost: 30000, bonus: { hp: 35, atk: 3 }, name: 'Fúria Incontrolável', description: '+35 HP e +3 ATK permanente.' },
    { level: 3, cost: 50000, bonus: { hp: 45, atk: 4, def: 1 }, name: 'Músculos de Aço', description: '+45 HP, +4 ATK e +1 DEF permanente.' },
    { level: 4, cost: 80000, bonus: { hp: 55, atk: 5, def: 2 }, name: 'Frenesi Sangrento', description: '+55 HP, +5 ATK e +2 DEF permanente.' },
    { level: 5, cost: 100000, bonus: { hp: 75, atk: 8, def: 3, res: 1 }, name: 'Titã Enfurecido', description: '+75 HP, +8 ATK, +3 DEF e +1 RES permanente.' },
  ],
  carrasco_vazio: [
    { level: 1, cost: 10000, bonus: { hp: 18, atk: 2 }, name: 'Fio Espacial', description: '+18 HP e +2 ATK permanente.' },
    { level: 2, cost: 30000, bonus: { hp: 24, atk: 3, res: 1 }, name: 'Olhar do Abismo', description: '+24 HP, +3 ATK e +1 RES permanente.' },
    { level: 3, cost: 50000, bonus: { hp: 30, atk: 4, def: 1 }, name: 'Vontade do Vazio', description: '+30 HP, +4 ATK e +1 DEF permanente.' },
    { level: 4, cost: 80000, bonus: { hp: 42, atk: 5, res: 2 }, name: 'Lâmina do Julgamento', description: '+42 HP, +5 ATK e +2 RES permanente.' },
    { level: 5, cost: 100000, bonus: { hp: 60, atk: 8, def: 2, res: 2 }, name: 'Samurai Transcendente', description: '+60 HP, +8 ATK, +2 DEF e +2 RES permanente.' },
  ],
  paladino: [
    { level: 1, cost: 10000, bonus: { hp: 25, def: 1, res: 1 }, name: 'Juramento Sagrado', description: '+25 HP, +1 DEF e +1 RES permanente.' },
    { level: 2, cost: 30000, bonus: { hp: 35, atk: 2, def: 1 }, name: 'Placas Banhadas de Ouro', description: '+35 HP, +2 ATK e +1 DEF permanente.' },
    { level: 3, cost: 50000, bonus: { hp: 45, def: 2, res: 2 }, name: 'Baluarte dos Céus', description: '+45 HP, +2 DEF e +2 RES permanente.' },
    { level: 4, cost: 80000, bonus: { hp: 60, atk: 3, def: 2, res: 1 }, name: 'Sentinela Radiante', description: '+60 HP, +3 ATK, +2 DEF e +1 RES permanente.' },
    { level: 5, cost: 100000, bonus: { hp: 80, atk: 4, def: 3, res: 3 }, name: 'Grão-Cruzado da Justiça', description: '+80 HP, +4 ATK, +3 DEF e +3 RES permanente.' },
  ],
  lanceiro: [
    { level: 1, cost: 10000, bonus: { hp: 18, atk: 2 }, name: 'Ponta de Aço Temperado', description: '+18 HP e +2 ATK permanente.' },
    { level: 2, cost: 30000, bonus: { hp: 24, atk: 3, def: 1 }, name: 'Postura de Falange', description: '+24 HP, +3 ATK e +1 DEF permanente.' },
    { level: 3, cost: 50000, bonus: { hp: 32, atk: 4, def: 1 }, name: 'Agilidade do Dragão', description: '+32 HP, +4 ATK e +1 DEF permanente.' },
    { level: 4, cost: 80000, bonus: { hp: 45, atk: 5, res: 2 }, name: 'Pique Perfurador', description: '+45 HP, +5 ATK e +2 RES permanente.' },
    { level: 5, cost: 100000, bonus: { hp: 65, atk: 7, def: 3, res: 1 }, name: 'Mestre dos Dragões Alados', description: '+65 HP, +7 ATK, +3 DEF e +1 RES permanente.' },
  ],
  bardo: [
    { level: 1, cost: 10000, bonus: { hp: 16, mag: 2 }, name: 'Cordas de Seda Élfica', description: '+16 HP e +2 MAG permanente.' },
    { level: 2, cost: 30000, bonus: { hp: 22, mag: 3, res: 1 }, name: 'Inspiração Melódica', description: '+22 HP, +3 MAG e +1 RES permanente.' },
    { level: 3, cost: 50000, bonus: { hp: 28, mag: 3, def: 2 }, name: 'Harmonia Sônica', description: '+28 HP, +3 MAG e +2 DEF permanente.' },
    { level: 4, cost: 80000, bonus: { hp: 40, mag: 5, res: 2 }, name: 'Balada Épica', description: '+40 HP, +5 MAG e +2 RES permanente.' },
    { level: 5, cost: 100000, bonus: { hp: 55, mag: 7, res: 3, def: 2 }, name: 'Virtuoso Supremo', description: '+55 HP, +7 MAG, +3 RES e +2 DEF permanente.' },
  ],
  mago_gelo: [
    { level: 1, cost: 10000, bonus: { hp: 14, mag: 2 }, name: 'Coração de Gelo', description: '+14 HP e +2 MAG permanente.' },
    { level: 2, cost: 30000, bonus: { hp: 20, mag: 3, res: 1 }, name: 'Geada Eterna', description: '+20 HP, +3 MAG e +1 RES permanente.' },
    { level: 3, cost: 50000, bonus: { hp: 26, mag: 4, res: 2 }, name: 'Manto Glacial', description: '+26 HP, +4 MAG e +2 RES permanente.' },
    { level: 4, cost: 80000, bonus: { hp: 36, mag: 5, def: 1, res: 2 }, name: 'Zero Criogênico', description: '+36 HP, +5 MAG, +1 DEF e +2 RES permanente.' },
    { level: 5, cost: 100000, bonus: { hp: 50, mag: 8, res: 4, def: 2 }, name: 'Arquimago do Permafrost', description: '+50 HP, +8 MAG, +4 RES e +2 DEF permanente.' },
  ],
};

export function getClassCumulativeBonus(className: string, level = 0): { hp: number; atk: number; mag: number; def: number; res: number } {
  const tiers = CLASS_UPGRADES[className] || [];
  const safeLevel = Math.min(tiers.length, Math.max(0, level));
  const total = { hp: 0, atk: 0, mag: 0, def: 0, res: 0 };

  for (let i = 0; i < safeLevel; i++) {
    const b = tiers[i].bonus;
    total.hp += b.hp || 0;
    total.atk += b.atk || 0;
    total.mag += b.mag || 0;
    total.def += b.def || 0;
    total.res += b.res || 0;
  }

  return total;
}

// ============================================================================
// 2. GENERAL UPGRADES (Global meta-progression)
// ============================================================================

export interface GeneralUpgradeTier {
  level: number;
  cost: number;
  title: string;
  description: string;
}

export interface GeneralUpgradeDefinition {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  maxLevel: number;
  tiers: GeneralUpgradeTier[];
}

export const GENERAL_UPGRADES: Record<string, GeneralUpgradeDefinition> = {
  starterItem: {
    id: 'starterItem',
    name: 'Provisões de Expedição',
    icon: 'Package',
    color: '#F0B44D',
    description: 'Comece cada nova aventura com 1 equipamento bônus sorteado no inventário.',
    maxLevel: 3,
    tiers: [
      { level: 1, cost: 30000, title: 'Item Comum Inicial', description: 'Inicia a aventura com 1 item Comum aleatório.' },
      { level: 2, cost: 90000, title: 'Item Raro Inicial', description: 'Inicia a aventura com 1 item Raro aleatório.' },
      { level: 3, cost: 200000, title: 'Item Épico Inicial', description: 'Inicia a aventura com 1 item Épico aleatório (limite máximo).' },
    ],
  },
  dropRate: {
    id: 'dropRate',
    name: 'Caçador de Espólios',
    icon: 'Sparkles',
    color: '#00E5FF',
    description: 'Aumenta as chances e o peso de raridade de novos itens ao vencer fases.',
    maxLevel: 3,
    tiers: [
      { level: 1, cost: 40000, title: 'Sorte do Explorador I', description: '+15% de peso para itens Raros e Épicos nos drops.' },
      { level: 2, cost: 100000, title: 'Sorte do Explorador II', description: '+30% de peso de raridade e 3 escolhas garantidas.' },
      { level: 3, cost: 180000, title: 'Mestre Saqueador', description: '+50% de peso de raridade, ampliando drops Lendários.' },
    ],
  },
  goldBoost: {
    id: 'goldBoost',
    name: 'Pacto da Prosperidade',
    icon: 'Coins',
    color: '#FFD700',
    description: 'Amplia permanentemente todo o ouro obtido ao vencer combates.',
    maxLevel: 3,
    tiers: [
      { level: 1, cost: 40000, title: 'Tributo Próspero I', description: '+15% de ouro recebido em todas as vitórias.' },
      { level: 2, cost: 100000, title: 'Tributo Próspero II', description: '+30% de ouro recebido em todas as vitórias.' },
      { level: 3, cost: 180000, title: 'Mina do Abismo', description: '+50% de ouro recebido em todas as vitórias.' },
    ],
  },
  globalHp: {
    id: 'globalHp',
    name: 'Vigor Ancestral',
    icon: 'Heart',
    color: '#FF5252',
    description: 'Concede vida máxima adicional para todos os heróis da sua expedição.',
    maxLevel: 3,
    tiers: [
      { level: 1, cost: 30000, title: 'Vitalidade I', description: '+15 HP Máximo para todos os heróis aliados.' },
      { level: 2, cost: 80000, title: 'Vitalidade II', description: '+30 HP Máximo para todos os heróis aliados.' },
      { level: 3, cost: 160000, title: 'Coração de Titã', description: '+50 HP Máximo para todos os heróis aliados.' },
    ],
  },
};

// ============================================================================
// 3. ITEM ENHANCEMENT (Forging catalog items up to +3, +5% stat per level)
// ============================================================================

export const MAX_ITEM_ENHANCEMENT_LEVEL = 3;

export const ITEM_ENHANCEMENT_COSTS: Record<ItemRarity, number[]> = {
  common: [8000, 20000, 40000],
  rare: [18000, 45000, 80000],
  epic: [35000, 80000, 140000],
  legendary: [65000, 130000, 220000],
};

export function getItemUpgradeCost(rarity: ItemRarity, currentLevel = 0): number | null {
  if (currentLevel >= MAX_ITEM_ENHANCEMENT_LEVEL) return null;
  const costs = ITEM_ENHANCEMENT_COSTS[rarity] || ITEM_ENHANCEMENT_COSTS.common;
  return costs[currentLevel] ?? null;
}

export function getItemEffectiveStats(baseStats: ItemStats, upgradeLevel = 0): ItemStats {
  if (!upgradeLevel || upgradeLevel <= 0) return { ...baseStats };
  const level = Math.min(MAX_ITEM_ENHANCEMENT_LEVEL, Math.max(0, upgradeLevel));
  const mult = 1 + level * 0.05; // +5% per level

  const enhance = (val?: number): number | undefined => {
    if (val === undefined) return undefined;
    if (val <= 0) return val;
    // Guaranteed at least +1 per upgrade level for primary stats
    return Math.max(val + level, Math.round(val * mult));
  };

  return {
    ...baseStats,
    hp: enhance(baseStats.hp),
    atk: enhance(baseStats.atk),
    mag: enhance(baseStats.mag),
    def: enhance(baseStats.def),
    res: enhance(baseStats.res),
    mov: baseStats.mov,
    range: baseStats.range,
  };
}

export function getGeneralBonusHp(level = 0): number {
  if (level === 1) return 15;
  if (level === 2) return 30;
  if (level >= 3) return 50;
  return 0;
}

export function getGeneralGoldMultiplier(level = 0): number {
  if (level === 1) return 0.15;
  if (level === 2) return 0.30;
  if (level >= 3) return 0.50;
  return 0;
}


export function getGeneralDropBonus(level = 0): number {
  return Math.min(3, Math.max(0, level));
}

