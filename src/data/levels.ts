import type { LevelConfig, ObstacleType, TerrainType } from '../types/game';

function createGrid(
  width: number,
  height: number,
  defaultTerrain: TerrainType,
  obstaclesMap: Record<string, { terrain?: TerrainType; obstacle: ObstacleType }> = {}
) {
  const grid: { terrain: TerrainType; obstacle: ObstacleType }[][] = [];
  for (let y = 0; y < height; y++) {
    const row: { terrain: TerrainType; obstacle: ObstacleType }[] = [];
    for (let x = 0; x < width; x++) {
      const key = `${x},${y}`;
      if (obstaclesMap[key]) {
        row.push({
          terrain: obstaclesMap[key].terrain || defaultTerrain,
          obstacle: obstaclesMap[key].obstacle,
        });
      } else {
        row.push({
          terrain: defaultTerrain,
          obstacle: 'none',
        });
      }
    }
    grid.push(row);
  }
  return grid;
}

export const LEVELS: LevelConfig[] = [
  // --- FASE 1 ---
  {
    id: 1,
    name: 'Fase 1 — Clareira dos Exilados',
    subtitle: 'O Primeiro Confronto',
    environment: 'forest',
    width: 10,
    height: 8,
    description: 'Uma clareira na floresta infestada por goblins. Aprenda os comandos e movimentos básicos.',
    objectives: ['Elimine todos os 3 Goblins na clareira.', 'Posicione suas unidades estrategicamente.'],
    grid: createGrid(10, 8, 'grass', {
      '2,2': { obstacle: 'tree' },
      '7,2': { obstacle: 'tree' },
      '4,4': { obstacle: 'rock' },
      '8,5': { obstacle: 'tree' },
    }),
    deploymentZone: [
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 3, y: 7 },
      { x: 4, y: 7 },
    ],
    enemySpawns: [
      { monsterTypeId: 'goblin', x: 2, y: 1 },
      { monsterTypeId: 'goblin', x: 5, y: 1 },
      { monsterTypeId: 'goblin', x: 7, y: 2 },
    ],
    rewards: { gold: 150, xpPerUnit: 100 },
  },

  // --- FASE 2 ---
  {
    id: 2,
    name: 'Fase 2 — Ruínas Esquecidas',
    subtitle: 'Marcha dos Orcs',
    environment: 'ruins',
    width: 10,
    height: 8,
    description: 'Ruínas antigas dominadas por orcs e cavaleiros caídos protegendo suas posições.',
    objectives: ['Elimine todas as forças inimigas nas ruínas.', 'Use cobertura contra arqueiros e projéteis.'],
    grid: createGrid(10, 8, 'stone', {
      '3,2': { obstacle: 'ruins' },
      '6,2': { obstacle: 'ruins' },
      '1,4': { obstacle: 'rock' },
      '8,4': { obstacle: 'rock' },
      '4,5': { obstacle: 'pillar' },
      '5,5': { obstacle: 'pillar' },
    }),
    deploymentZone: [
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 2, y: 7 },
      { x: 7, y: 7 },
    ],
    enemySpawns: [
      { monsterTypeId: 'goblin', x: 1, y: 1 },
      { monsterTypeId: 'orc', x: 4, y: 1 },
      { monsterTypeId: 'cavaleiro_caido', x: 5, y: 1 },
      { monsterTypeId: 'orc', x: 8, y: 1 },
    ],
    rewards: { gold: 250, xpPerUnit: 150 },
  },

  // --- FASE 3 ---
  {
    id: 3,
    name: 'Fase 3 — Ninho da Praga',
    subtitle: 'A Caverna dos Venenos',
    environment: 'cave',
    width: 10,
    height: 8,
    description: 'Uma caverna profunda infestada por aranhas peçonhentas e bruxas dos espinhos.',
    objectives: ['Elimine todas as Aranhas e Bruxas.', 'Cuidado com os efeitos de veneno mortal.'],
    grid: createGrid(10, 8, 'dirt', {
      '2,1': { obstacle: 'rock' },
      '7,1': { obstacle: 'rock' },
      '4,3': { obstacle: 'thorns' },
      '5,3': { obstacle: 'thorns' },
      '2,5': { obstacle: 'rock' },
      '7,5': { obstacle: 'rock' },
    }),
    deploymentZone: [
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 4, y: 7 },
      { x: 5, y: 7 },
    ],
    enemySpawns: [
      { monsterTypeId: 'aranha', x: 2, y: 2 },
      { monsterTypeId: 'bruxa_espinhos', x: 4, y: 1 },
      { monsterTypeId: 'aranha', x: 7, y: 2 },
      { monsterTypeId: 'lobo_espectral', x: 5, y: 1 },
    ],
    rewards: { gold: 350, xpPerUnit: 200 },
  },

  // --- FASE 4 ---
  {
    id: 4,
    name: 'Fase 4 — Fortaleza Carmesim',
    subtitle: 'Defensores de Pedra',
    environment: 'fortress',
    width: 10,
    height: 8,
    description: 'Fortaleza de pedra guardada por golems de basalto pesados e magos das trevas.',
    objectives: ['Elimine os Golems e Magos das Trevas.', 'Proteja suas unidades frágeis.'],
    grid: createGrid(10, 8, 'stone', {
      '2,3': { obstacle: 'wall' },
      '3,3': { obstacle: 'wall' },
      '6,3': { obstacle: 'wall' },
      '7,3': { obstacle: 'wall' },
      '4,2': { obstacle: 'ruins' },
      '5,2': { obstacle: 'ruins' },
    }),
    deploymentZone: [
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 2, y: 7 },
      { x: 7, y: 7 },
    ],
    enemySpawns: [
      { monsterTypeId: 'mago_trevas', x: 2, y: 1 },
      { monsterTypeId: 'golem_basalto', x: 4, y: 1, levelOffset: 1 },
      { monsterTypeId: 'orc', x: 5, y: 1, levelOffset: 1 },
      { monsterTypeId: 'mago_trevas', x: 7, y: 1 },
    ],
    rewards: { gold: 500, xpPerUnit: 300 },
  },

  // --- FASE 5 (MINI BOSS OBRIGATÓRIO) ---
  {
    id: 5,
    name: 'Fase 5 — Covil do Devorador',
    subtitle: 'CONFRONTO COM MINI BOSS',
    environment: 'cave',
    width: 10,
    height: 8,
    description: 'O terrível Devorador das Profundezas habita esta caverna! Enfrente a fera colossal.',
    objectives: ['Derrote o MINI BOSS Devorador das Profundezas!', 'Cuidado com a transformação na Segunda Fase (<50% HP).'],
    grid: createGrid(10, 8, 'dirt', {
      '1,2': { obstacle: 'rock' },
      '8,2': { obstacle: 'rock' },
      '3,4': { obstacle: 'rock' },
      '6,4': { obstacle: 'rock' },
    }),
    deploymentZone: [
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 2, y: 7 },
      { x: 7, y: 7 },
    ],
    enemySpawns: [
      { monsterTypeId: 'devorador', x: 4, y: 1, isMiniBoss: true },
      { monsterTypeId: 'lobo_espectral', x: 2, y: 1 },
      { monsterTypeId: 'golem_basalto', x: 7, y: 1 },
    ],
    rewards: { gold: 800, xpPerUnit: 450 },
    hasMiniBoss: true,
  },

  // --- FASE 6 ---
  {
    id: 6,
    name: 'Fase 6 — Pântano dos Condenados',
    subtitle: 'Névoa Tóxica',
    environment: 'swamp',
    width: 10,
    height: 8,
    description: 'Um pântano sombrio habitado por bruxas dos espinhos e répteis incandescentes.',
    objectives: ['Elimine todos os monstros do pântano.', 'Cuidado com ataques de lentidão e veneno.'],
    grid: createGrid(10, 8, 'swamp', {
      '2,2': { obstacle: 'thorns' },
      '7,2': { obstacle: 'thorns' },
      '4,4': { obstacle: 'thorns' },
      '5,4': { obstacle: 'thorns' },
    }),
    deploymentZone: [
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 2, y: 7 },
      { x: 7, y: 7 },
    ],
    enemySpawns: [
      { monsterTypeId: 'bruxa_espinhos', x: 2, y: 1, levelOffset: 1 },
      { monsterTypeId: 'lobo_espectral', x: 4, y: 1, levelOffset: 1 },
      { monsterTypeId: 'draco_volcanico', x: 5, y: 1, levelOffset: 1 },
      { monsterTypeId: 'bruxa_espinhos', x: 7, y: 1, levelOffset: 1 },
    ],
    rewards: { gold: 1000, xpPerUnit: 550 },
  },

  // --- FASE 7 ---
  {
    id: 7,
    name: 'Fase 7 — Necrópole Silenciosa',
    subtitle: 'Exército dos Mortos',
    environment: 'tomb',
    width: 10,
    height: 8,
    description: 'Uma necrópole profanada repleta de cavaleiros caídos e mímicos mortais.',
    objectives: ['Limpe as tumbas eliminando os cavaleiros mortos-vivos.', 'Mantenha formação defensiva.'],
    grid: createGrid(10, 8, 'stone', {
      '2,2': { obstacle: 'tombstone' },
      '7,2': { obstacle: 'tombstone' },
      '4,3': { obstacle: 'tombstone' },
      '5,3': { obstacle: 'tombstone' },
    }),
    deploymentZone: [
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 2, y: 7 },
      { x: 7, y: 7 },
    ],
    enemySpawns: [
      { monsterTypeId: 'cavaleiro_caido', x: 2, y: 1, levelOffset: 1 },
      { monsterTypeId: 'mimico', x: 4, y: 1, levelOffset: 1 },
      { monsterTypeId: 'cavaleiro_caido', x: 5, y: 1, levelOffset: 1 },
      { monsterTypeId: 'mimico', x: 7, y: 1, levelOffset: 1 },
    ],
    rewards: { gold: 1200, xpPerUnit: 650 },
  },

  // --- FASE 8 ---
  {
    id: 8,
    name: 'Fase 8 — Cidadela Arcana',
    subtitle: 'Barreiras de Energia',
    environment: 'citadel',
    width: 10,
    height: 8,
    description: 'Alta cidadela protegida por magos negros poderosos, dracos vulcânicos e golems.',
    objectives: ['Elimine os mestres arcanos da cidadela.', 'Derrote os dracos e evite magias de área.'],
    grid: createGrid(10, 8, 'stone', {
      '2,2': { obstacle: 'pillar' },
      '7,2': { obstacle: 'pillar' },
      '3,4': { obstacle: 'ruins' },
      '6,4': { obstacle: 'ruins' },
    }),
    deploymentZone: [
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 2, y: 7 },
      { x: 7, y: 7 },
    ],
    enemySpawns: [
      { monsterTypeId: 'mago_trevas', x: 1, y: 1, levelOffset: 2 },
      { monsterTypeId: 'draco_volcanico', x: 4, y: 1, levelOffset: 2 },
      { monsterTypeId: 'golem_basalto', x: 5, y: 1, levelOffset: 2 },
      { monsterTypeId: 'mago_trevas', x: 8, y: 1, levelOffset: 2 },
    ],
    rewards: { gold: 1500, xpPerUnit: 800 },
  },

  // --- FASE 9 ---
  {
    id: 9,
    name: 'Fase 9 — Portões do Abismo',
    subtitle: 'A Guarda de Astaroth',
    environment: 'abyss',
    width: 10,
    height: 8,
    description: 'A antecâmara do abismo, onde a elite dos monstros aguarda antes do confronto final.',
    objectives: ['Elimine toda a guarda de elite do abismo.', 'Prepare seu grupo para a batalha decisiva.'],
    grid: createGrid(10, 8, 'stone', {
      '1,2': { obstacle: 'shrine' },
      '8,2': { obstacle: 'shrine' },
      '4,3': { obstacle: 'pillar' },
      '5,3': { obstacle: 'pillar' },
    }),
    deploymentZone: [
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 2, y: 7 },
      { x: 7, y: 7 },
    ],
    enemySpawns: [
      { monsterTypeId: 'draco_volcanico', x: 2, y: 1, levelOffset: 2 },
      { monsterTypeId: 'cavaleiro_caido', x: 4, y: 1, levelOffset: 2 },
      { monsterTypeId: 'cavaleiro_caido', x: 5, y: 1, levelOffset: 2 },
      { monsterTypeId: 'draco_volcanico', x: 7, y: 1, levelOffset: 2 },
    ],
    rewards: { gold: 2000, xpPerUnit: 1000 },
  },

  // --- FASE 10 (FINAL BOSS EM 3 FASES) ---
  {
    id: 10,
    name: 'Fase 10 — Trono do Abismo',
    subtitle: 'CONFRONTO FINAL EM 3 FASES',
    environment: 'abyss',
    width: 10,
    height: 8,
    description: 'O Soberano Astaroth aguarda no Trono do Abismo! Derrote-o em suas 3 fases de combate.',
    objectives: [
      'Derrote Astaroth, Soberano do Abismo (BOSS FINAL)!',
      'Sobreviva às 3 transformações (Fase 1: Soberano, Fase 2: Despertar <=65%, Fase 3: Ruína <=30%).',
      'Saia das áreas de perigo telegrafadas antes dos ataques devastadores!',
    ],
    grid: createGrid(10, 8, 'stone', {
      '1,2': { obstacle: 'shrine' },
      '8,2': { obstacle: 'shrine' },
      '3,4': { obstacle: 'shrine' },
      '6,4': { obstacle: 'shrine' },
    }),
    deploymentZone: [
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 2, y: 7 },
      { x: 7, y: 7 },
    ],
    enemySpawns: [
      { monsterTypeId: 'astaroth', x: 4, y: 1, isBoss: true, levelOffset: 3 },
      { monsterTypeId: 'draco_volcanico', x: 1, y: 1, levelOffset: 2 },
      { monsterTypeId: 'mago_trevas', x: 8, y: 1, levelOffset: 2 },
      { monsterTypeId: 'cavaleiro_caido', x: 3, y: 2, levelOffset: 2 },
    ],
    rewards: { gold: 5000, xpPerUnit: 2500 },
    hasFinalBoss: true,
  },
];
