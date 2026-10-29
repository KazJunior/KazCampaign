import { useState, useEffect } from 'react';
import type { DailyDungeonConfig, LevelConfig, TerrainType, ObstacleType } from '../types/game';
import { CLASS_DEFINITIONS } from '../data/units';
import { SKILLS, CLASS_LEARNABLE_SKILL_IDS, CLASS_MISSION_REWARD_SKILLS } from '../data/skills';
import { MONSTER_DEFINITIONS } from '../data/monsters';

// Retorna a chave do dia de hoje no formato YYYY-MM-DD baseado no horário local do jogador
export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Retorna a data formatada em português (ex: "Quinta-feira, 29 de Outubro de 2026")
export function getFormattedDailyDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day, 12, 0, 0);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

// Calcula o tempo restante até a próxima meia-noite (00:00:00 do dia seguinte)
export function getTimeUntilNextMidnight(now: Date = new Date()) {
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const diffMs = Math.max(0, nextMidnight.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
    totalMs: diffMs,
    formatted: `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`,
  };
}

// Hook React para contagem regressiva reativa em tempo real até a meia-noite
export function useMidnightCountdown() {
  const [countdown, setCountdown] = useState(() => getTimeUntilNextMidnight());
  const [currentDateKey, setCurrentDateKey] = useState(() => getTodayDateString());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const updated = getTimeUntilNextMidnight(now);
      setCountdown(updated);

      const today = getTodayDateString(now);
      if (today !== currentDateKey) {
        setCurrentDateKey(today);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentDateKey]);

  return { ...countdown, currentDateKey };
}

// Pseudo-Random Number Generator determinístico (Mulberry32) baseado na chave da data
function createDailyRNG(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (Math.imul(31, hash) + seedStr.charCodeAt(i)) | 0;
  }
  return function () {
    let t = (hash += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Shuffle determinístico
function seededShuffle<T>(array: T[], rng: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const CANDIDATE_CLASSES = [
  'guerreiro',
  'arqueiro',
  'mago',
  'curandeiro',
  'assassino',
  'cavaleiro_arcano',
  'necromante',
  'druida',
  'mago_runico',
  'berserker',
  'paladino',
  'lanceiro',
  'bardo',
  'mago_gelo',
  'sniper',
  'mago_eletrico',
  'mago_vento',
];

const CANDIDATE_BOSSES = [
  'astaroth',
  'arauto_espectral',
  'tita_forjador',
  'mestre_runico',
  'valgar_sanguinario',
  'devorador',
  'leviata_vazio',
  'cavaleiro_apocalipse',
];

const CANDIDATE_MINIONS = [
  'goblin',
  'orc',
  'aranha',
  'mago_trevas',
  'lobo_espectral',
  'golem_basalto',
  'bruxa_espinhos',
  'cavaleiro_caido',
  'mimico',
  'draco_volcanico',
  'kobold_artilheiro',
  'salamandra_magma',
  'ferreiro_amaldicoado',
  'elemental_brasa',
  'automato_vapor',
  'piromante_cultista',
  'espectro_cinzento',
  'verme_da_lava',
  'gargula_ferro',
  'cao_infernal',
  'barbaro_frenetico',
  'cacador_estepes',
  'xama_tempestade',
  'constructo_runico',
  'urso_fendendor',
  'valquiria_sombria',
  'lobo_trovao',
  'guardiao_megalito',
  'espada_ancestral',
  'cultista_vazio',
  'tentaculo_abissal',
  'espreitador_astral',
  'aberracao_miasma',
  'observador_loucura',
  'insetoide_vazio',
  'sirene_abissal',
  'massa_informe',
  'pesadelo_vivo',
  'parasita_eter',
  'templario_sol_negro',
  'arauto_do_eclipse',
  'inquisidor_do_fim',
  'serafim_caido',
  'tita_obsidiana',
  'ceifador_crepusculo',
  'algoz_celestial',
  'escriba_do_destino',
  'pretoriano_do_caos',
  'avatar_cataclismo',
];

const DAILY_ENVIRONMENTS: LevelConfig['environment'][] = [
  'citadel',
  'ruins',
  'forest',
  'fortress',
  'shrine',
  'cave',
  'abyss',
  'swamp',
];

// Gera a configuração da Fase Diária aleatória para a data indicada
export function generateDailyDungeonConfig(targetDateKey?: string): DailyDungeonConfig {
  const dateKey = targetDateKey || getTodayDateString();
  const rng = createDailyRNG(`daily_dungeon_seed_${dateKey}`);

  // 1. Sortear 4 classes de heróis distintas
  const shuffledClasses = seededShuffle(CANDIDATE_CLASSES, rng);
  const partyClasses = shuffledClasses.slice(0, 4);

  // 2. Sortear habilidades para cada um dos 4 heróis
  const heroSkills: Record<string, string[]> = {};
  partyClasses.forEach((cKey) => {
    const classDef = CLASS_DEFINITIONS[cKey] || CLASS_DEFINITIONS['guerreiro'];
    const learnable = CLASS_LEARNABLE_SKILL_IDS[cKey] || [];
    const rewards = CLASS_MISSION_REWARD_SKILLS[cKey] || [];
    const classPool = Array.from(new Set([...learnable, ...rewards])).filter(
      (id) => id !== classDef.baseSkillId && SKILLS[id]
    );

    // Se a pool tiver habilidades, embaralha e escolhe até 4 habilidades extras
    const shuffledSkills = seededShuffle(classPool, rng);
    const chosenExtras = shuffledSkills.slice(0, 4);
    heroSkills[cKey] = chosenExtras;
  });

  // 3. Sortear 1 Chefe / Líder e 4 monstros normais
  const shuffledBosses = seededShuffle(CANDIDATE_BOSSES, rng);
  const bossId = shuffledBosses[0];

  const shuffledMinions = seededShuffle(CANDIDATE_MINIONS, rng);
  const minionIds = shuffledMinions.slice(0, 4);

  // 4. Sortear Ambiente e Cenário
  const shuffledEnvs = seededShuffle(DAILY_ENVIRONMENTS, rng);
  const environment = shuffledEnvs[0];

  const width = 9;
  const height = 8;

  // Grid e Terreno
  const terrainType: TerrainType =
    environment === 'forest'
      ? 'grass'
      : environment === 'swamp'
      ? 'swamp'
      : environment === 'cave' || environment === 'abyss'
      ? 'dirt'
      : 'stone';

  const possibleObstacles: ObstacleType[] =
    environment === 'forest'
      ? ['tree', 'rock', 'thorns']
      : environment === 'ruins' || environment === 'citadel'
      ? ['ruins', 'pillar', 'wall']
      : environment === 'shrine'
      ? ['shrine', 'pillar', 'crystal_fire']
      : environment === 'swamp'
      ? ['thorns', 'rock']
      : ['rock', 'pillar'];

  // Criar grid com obstáculos esparsos
  const grid: { terrain: TerrainType; obstacle: ObstacleType }[][] = [];
  for (let y = 0; y < height; y++) {
    const row: { terrain: TerrainType; obstacle: ObstacleType }[] = [];
    for (let x = 0; x < width; x++) {
      // Manter livres as zonas de spawn do jogador (y=6..7) e dos monstros (y=1..3 x=1..7)
      const isPlayerZone = y >= 6;
      const isBossZone = (x === 4 && y === 2) || (x === 3 && y === 2) || (x === 5 && y === 2);
      const isMinionZone = (y === 1 && (x === 2 || x === 6)) || (y === 3 && (x === 1 || x === 7));

      let obstacle: ObstacleType = 'none';
      if (!isPlayerZone && !isBossZone && !isMinionZone) {
        // 18% de chance de obstáculo nas outras casas
        if (rng() < 0.18) {
          const obsIdx = Math.floor(rng() * possibleObstacles.length);
          obstacle = possibleObstacles[obsIdx];
        }
      }
      row.push({ terrain: terrainType, obstacle });
    }
    grid.push(row);
  }

  // Posições dos monstros
  const enemySpawns: LevelConfig['enemySpawns'] = [
    { monsterTypeId: bossId, x: 4, y: 2, levelOffset: 5, isBoss: true },
    { monsterTypeId: minionIds[0], x: 2, y: 1, levelOffset: 4 },
    { monsterTypeId: minionIds[1], x: 6, y: 1, levelOffset: 4 },
    { monsterTypeId: minionIds[2], x: 1, y: 3, levelOffset: 4 },
    { monsterTypeId: minionIds[3], x: 7, y: 3, levelOffset: 4 },
  ];

  // Zona de implantação da equipe de 4 heróis
  const deploymentZone = [
    { x: 2, y: 6 },
    { x: 4, y: 6 },
    { x: 5, y: 6 },
    { x: 7, y: 6 },
  ];

  const bossDef = MONSTER_DEFINITIONS[bossId];
  const bossName = bossDef?.name || 'Chefe do Dia';

  const formattedDate = getFormattedDailyDate(dateKey);

  const levelConfig: LevelConfig = {
    id: 9000,
    name: 'Desafio Diário',
    subtitle: `Batalha contra ${bossName}`,
    environment,
    width,
    height,
    description: `Fase Diária de ${formattedDate}. Enfrente ${bossName} e sua comitiva com uma equipe e habilidades sorteadas exclusivamente para o dia de hoje!`,
    objectives: [
      `Derrotar ${bossName}`,
      'Eliminar todos os inimigos da comitiva',
      'Sobreviver ao desafio do dia',
    ],
    grid,
    deploymentZone,
    enemySpawns,
    rewards: {
      gold: 20000, // Exatamente 20 mil de ouro como solicitado
      xpPerUnit: 5000,
    },
    hasFinalBoss: true,
  };

  return {
    dateKey,
    formattedDate,
    title: 'Desafio Diário',
    subtitle: `Confronte ${bossName}`,
    levelConfig,
    partyClasses,
    heroSkills,
    heroLevel: 10,
    rewardGold: 20000,
    bossMonsterTypeId: bossId,
  };
}

