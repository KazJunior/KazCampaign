import { getAuthUser, getSql, json, readJson } from './_lib.js';

const INITIAL_CLASSES = ['guerreiro', 'arqueiro', 'mago', 'curandeiro'];
const INITIAL_LINEAGES = ['humano', 'elfo', 'anao'];

function normalizeClass(c: unknown): string {
  if (typeof c !== 'string') return '';
  return c === 'engenheiro' ? 'druida' : c;
}

function normalizeLineage(l: unknown): string {
  if (typeof l !== 'string') return '';
  const trimmed = l.trim();
  return trimmed === 'draconato' ? 'dragonoide' : trimmed;
}

const CLASS_UNLOCK_LEVELS: Record<string, number> = {
  assassino: 5,
  cavaleiro_arcano: 10,
  necromante: 15,
  druida: 20,
  engenheiro: 20,
  mago_runico: 25,
  berserker: 30,
};

const ALL_VALID_CLASSES = new Set<string>([
  'guerreiro',
  'arqueiro',
  'mago',
  'curandeiro',
  'assassino',
  'cavaleiro_arcano',
  'necromante',
  'druida',
  'engenheiro',
  'mago_runico',
  'berserker',
  'carrasco_vazio',
  'paladino',
  'lanceiro',
  'bardo',
  'mago_gelo',
  'sniper',
  'mago_eletrico',
  'mago_vento',
  'omnimago',
]);

const LINEAGE_QUEST_THRESHOLDS: Array<{
  lineageId: string;
  statKey?: string;
  monsterTypeId?: string;
  target: number;
}> = [
  { lineageId: 'dragonoide', monsterTypeId: 'draco_volcanico', target: 200 },
  { lineageId: 'orc', statKey: 'fastBlitzWins', target: 15 },
  { lineageId: 'vampiro', statKey: 'noHealerWins', target: 15 },
  { lineageId: 'celestial', statKey: 'healingDone', target: 30000 },
  { lineageId: 'feerico', statKey: 'statusInflicted', target: 120 },
  { lineageId: 'minotauro', statKey: 'lowHpKills', target: 50 },
  { lineageId: 'anjo', statKey: 'flawlessBossWins', target: 15 },
  { lineageId: 'demonio', statKey: 'massiveHits', target: 100 },
  { lineageId: 'nefalim', statKey: 'basicAttackKills', target: 200 },
  { lineageId: 'fenix', statKey: 'comebackWins', target: 15 },
  { lineageId: 'centauro', statKey: 'tilesMoved', target: 2000 },
  { lineageId: 'lobisomem', statKey: 'bleedInflicted', target: 200 },
  { lineageId: 'zephyros', statKey: 'enemiesPushed', target: 200 },
  { lineageId: 'lagomorfo', statKey: 'eggsHatched', target: 20 },
  { lineageId: 'kitsune', statKey: 'skillsCast', target: 500 },
  { lineageId: 'espectro', statKey: 'heroesFallen', target: 100 },
  { lineageId: 'murideo', statKey: 'poisonInflicted', target: 200 },
];

function mergeStringArrays(a: unknown, b: unknown): string[] {
  const set = new Set<string>();
  if (Array.isArray(a)) {
    for (const item of a) {
      if (typeof item === 'string' && item.trim()) set.add(item.trim());
    }
  }
  if (Array.isArray(b)) {
    for (const item of b) {
      if (typeof item === 'string' && item.trim()) set.add(item.trim());
    }
  }
  return Array.from(set);
}

function mergeNumberArrays(a: unknown, b: unknown): number[] {
  const set = new Set<number>();
  if (Array.isArray(a)) {
    for (const item of a) {
      if (typeof item === 'number' && Number.isFinite(item)) set.add(item);
    }
  }
  if (Array.isArray(b)) {
    for (const item of b) {
      if (typeof item === 'number' && Number.isFinite(item)) set.add(item);
    }
  }
  return Array.from(set).sort((x, y) => x - y);
}

function mergeNumericMap(existing: unknown, incoming: unknown): Record<string, number> {
  const result: Record<string, number> = {};
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    for (const [k, v] of Object.entries(existing as Record<string, unknown>)) {
      const num = Number(v);
      if (Number.isFinite(num) && num > 0) result[k] = num;
    }
  }
  if (incoming && typeof incoming === 'object' && !Array.isArray(incoming)) {
    for (const [k, v] of Object.entries(incoming as Record<string, unknown>)) {
      const num = Number(v);
      if (Number.isFinite(num) && num >= 0) {
        result[k] = Math.max(result[k] || 0, num);
      }
    }
  }
  return result;
}

function mergeClassMissionsProgress(
  existing: unknown,
  incoming: unknown
): Record<string, { completedMissions: string[]; stats: Record<string, number> }> {
  const result: Record<string, { completedMissions: string[]; stats: Record<string, number> }> = {};

  const applySource = (src: unknown) => {
    if (!src || typeof src !== 'object' || Array.isArray(src)) return;
    for (const [rawClass, rawEntry] of Object.entries(src as Record<string, any>)) {
      const cKey = normalizeClass(rawClass);
      if (!cKey || !rawEntry || typeof rawEntry !== 'object') continue;
      const current = result[cKey] || { completedMissions: [], stats: {} };
      const mergedCompleted = mergeStringArrays(current.completedMissions, rawEntry.completedMissions);
      const mergedStats = mergeNumericMap(current.stats, rawEntry.stats);
      result[cKey] = {
        completedMissions: mergedCompleted,
        stats: mergedStats,
      };
    }
  };

  applySource(existing);
  applySource(incoming);
  return result;
}

function mergeLineageQuestStats(existing: unknown, incoming: unknown): Record<string, number> {
  const merged = mergeNumericMap(existing, incoming);
  const existingStreak =
    existing && typeof existing === 'object' ? Number((existing as any).noHealerWins) || 0 : 0;
  const incomingHasStats =
    incoming && typeof incoming === 'object' && Object.keys(incoming as object).length > 0;
  if (existingStreak >= 15) {
    merged.noHealerWins = Math.max(existingStreak, merged.noHealerWins || 0);
  } else if (incomingHasStats && typeof (incoming as any).noHealerWins === 'number') {
    merged.noHealerWins = Math.max(0, (incoming as any).noHealerWins);
  }
  return merged;
}

function resolveUnlockedLineages(
  existing: unknown,
  incoming: unknown,
  lineageQuestStats: Record<string, number>,
  monsterKills: Record<string, number>
): string[] {
  const set = new Set<string>(INITIAL_LINEAGES);
  if (Array.isArray(existing)) {
    for (const raw of existing) {
      const l = normalizeLineage(raw);
      if (l) set.add(l);
    }
  }
  if (Array.isArray(incoming)) {
    for (const raw of incoming) {
      const l = normalizeLineage(raw);
      if (l) set.add(l);
    }
  }
  for (const q of LINEAGE_QUEST_THRESHOLDS) {
    if (q.monsterTypeId) {
      if ((monsterKills[q.monsterTypeId] || 0) >= q.target) {
        set.add(q.lineageId);
      }
    } else if (q.statKey) {
      if ((lineageQuestStats[q.statKey] || 0) >= q.target) {
        set.add(q.lineageId);
      }
    }
  }
  return Array.from(set);
}

function sanitizeLineageMap(existing: unknown, incoming: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  const apply = (src: unknown) => {
    if (!src || typeof src !== 'object' || Array.isArray(src)) return;
    for (const [k, v] of Object.entries(src as Record<string, unknown>)) {
      const cKey = normalizeClass(k);
      const lVal = normalizeLineage(v);
      if (cKey && lVal) result[cKey] = lVal;
    }
  };
  apply(existing);
  apply(incoming);
  return result;
}

function sanitizeSkinMap(existing: unknown, incoming: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  const apply = (src: unknown) => {
    if (!src || typeof src !== 'object' || Array.isArray(src)) return;
    for (const [k, v] of Object.entries(src as Record<string, unknown>)) {
      const cKey = normalizeClass(k);
      if (cKey && typeof v === 'string' && v.trim()) {
        result[cKey] = v.trim();
      }
    }
  };
  apply(existing);
  apply(incoming);
  return result;
}

function mergeDailyDungeon(
  existing: unknown,
  incoming: unknown
): { lastCompletedDate?: string; totalWins: number } {
  const ex = existing && typeof existing === 'object' ? (existing as any) : {};
  const inc = incoming && typeof incoming === 'object' ? (incoming as any) : {};
  const dates = [ex.lastCompletedDate, inc.lastCompletedDate].filter(
    (d): d is string => typeof d === 'string' && d.trim().length > 0
  );
  dates.sort();
  return {
    lastCompletedDate: dates.length > 0 ? dates[dates.length - 1] : undefined,
    totalWins: Math.max(Number(ex.totalWins) || 0, Number(inc.totalWins) || 0),
  };
}

function calculateMaxCompleted(
  leaderboardHighest: number,
  activeAdv: any,
  advHistory: any[],
  completedLevels?: number[]
): number {
  let max = leaderboardHighest || 0;
  if (Array.isArray(completedLevels)) {
    for (const lvl of completedLevels) {
      if (typeof lvl === 'number' && lvl > max) max = lvl;
    }
  }
  if (activeAdv && typeof activeAdv.currentLevelId === 'number' && activeAdv.currentLevelId > 1) {
    max = Math.max(max, activeAdv.currentLevelId - 1);
  }
  if (Array.isArray(advHistory)) {
    for (const rec of advHistory) {
      if (rec.result === 'victory') {
        max = Math.max(max, 50);
      } else if (typeof rec.farthestLevel === 'number' && rec.farthestLevel > 0) {
        max = Math.max(max, rec.farthestLevel);
      }
    }
  }
  return max;
}

function resolveUnlockedClasses(
  existingDbClasses: unknown,
  incomingClasses: unknown,
  maxCompleted: number,
  leaderboardParty?: unknown
): string[] {
  const allowed = new Set<string>(INITIAL_CLASSES);

  const checkAndAdd = (raw: unknown) => {
    const c = normalizeClass(raw);
    if (!c || !ALL_VALID_CLASSES.has(c)) return;
    const reqLvl = CLASS_UNLOCK_LEVELS[c];
    if (typeof reqLvl === 'number') {
      if (maxCompleted >= reqLvl) {
        allowed.add(c);
      }
    } else {
      // Purchasable or secret class
      allowed.add(c);
    }
  };

  // 1. Check classes in database
  if (Array.isArray(existingDbClasses)) {
    for (const raw of existingDbClasses) {
      checkAndAdd(raw);
    }
  }

  // 2. Check classes sent by client (purchases, secret unlocks)
  if (Array.isArray(incomingClasses)) {
    for (const raw of incomingClasses) {
      checkAndAdd(raw);
    }
  }

  // 3. Automatically grant any boss unlocks earned by ranking or max level completed
  for (const [cName, reqLvl] of Object.entries(CLASS_UNLOCK_LEVELS)) {
    if (maxCompleted >= reqLvl) {
      allowed.add(normalizeClass(cName));
    }
  }

  // 4. Preserve valid classes found in leaderboard party (if level requirement met)
  if (Array.isArray(leaderboardParty)) {
    for (const raw of leaderboardParty) {
      checkAndAdd(raw);
    }
  }

  return Array.from(allowed);
}

function sanitizeParty(rawParty: unknown, unlocked: string[]): string[] {
  const unlockedSet = new Set(unlocked.map(normalizeClass));
  const result: string[] = [];
  if (Array.isArray(rawParty)) {
    for (const raw of rawParty) {
      const c = normalizeClass(raw);
      if (c && unlockedSet.has(c) && !result.includes(c)) {
        result.push(c);
      }
    }
  }
  for (const c of INITIAL_CLASSES) {
    if (result.length >= 4) break;
    if (!result.includes(c)) result.push(c);
  }
  return result.slice(0, 4);
}

let progressSchemaEnsured = false;
async function ensureProgressSchema(sql: ReturnType<typeof getSql>): Promise<void> {
  if (progressSchemaEnsured) return;
  try {
    await sql`
      ALTER TABLE player_progress 
      ADD COLUMN IF NOT EXISTS class_upgrades JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS general_upgrades JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS item_upgrades JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS discovered_item_ids JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS unlocked_pet_ids JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS equipped_pet_id TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS pet_eggs JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS pending_gold INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS class_missions_progress JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS unlocked_class_skins JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS equipped_class_skins JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS unlocked_class_skill_ids JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS daily_dungeon JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS monster_kills JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS unlocked_lineages JSONB DEFAULT '["humano","elfo","anao"]'::jsonb,
      ADD COLUMN IF NOT EXISTS lineage_quest_stats JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS selected_party_lineages JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS completed_levels JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS unlocked_level INTEGER DEFAULT 1;
    `;
    progressSchemaEnsured = true;
  } catch (e) {
    console.warn('ensureProgressSchema warning:', e);
  }
}

export async function GET(req: Request): Promise<Response> {
  const auth = getAuthUser(req);
  if (!auth) return json({ error: 'Não autorizado' }, 401);

  try {
    const sql = getSql();
    await ensureProgressSchema(sql);

    const rows = await sql`
      SELECT gold, unlocked_classes, selected_party_classes, units_state, 
             discovered_monster_ids, discovered_item_ids, active_adventure, adventure_history, combat_speed,
             class_upgrades, general_upgrades, item_upgrades,
             unlocked_pet_ids, equipped_pet_id, pet_eggs,
             class_missions_progress, unlocked_class_skins, equipped_class_skins, unlocked_class_skill_ids,
             daily_dungeon, monster_kills, unlocked_lineages, lineage_quest_stats, selected_party_lineages,
             completed_levels, unlocked_level,
             COALESCE(pending_gold, 0) as pending_gold
      FROM player_progress
      WHERE user_id = ${auth.uid}
      LIMIT 1`;

    if (rows.length === 0) {
      return json({ progress: null });
    }

    const row = rows[0] as {
      gold: number;
      pending_gold?: number;
      unlocked_classes: string[];
      selected_party_classes: string[];
      units_state: Record<string, any>;
      discovered_monster_ids: string[];
      discovered_item_ids?: string[];
      active_adventure: any;
      adventure_history: any[];
      combat_speed: string;
      class_upgrades?: Record<string, number>;
      general_upgrades?: Record<string, number>;
      item_upgrades?: Record<string, number>;
      unlocked_pet_ids?: string[];
      equipped_pet_id?: string | null;
      pet_eggs?: any[];
      class_missions_progress?: Record<string, { completedMissions: string[]; stats: Record<string, number> }>;
      unlocked_class_skins?: string[];
      equipped_class_skins?: Record<string, string>;
      unlocked_class_skill_ids?: string[];
      daily_dungeon?: { lastCompletedDate?: string; totalWins?: number };
      monster_kills?: Record<string, number>;
      unlocked_lineages?: string[];
      lineage_quest_stats?: Record<string, number>;
      selected_party_lineages?: Record<string, string>;
      completed_levels?: number[];
      unlocked_level?: number;
    };

    let deliveredGold = row.gold;
    const pendingGold = Number(row.pending_gold) || 0;
    if (pendingGold > 0) {
      deliveredGold += pendingGold;
      await sql`
        UPDATE player_progress 
        SET gold = gold + ${pendingGold},
            pending_gold = 0,
            updated_at = NOW() 
        WHERE user_id = ${auth.uid}
      `;
    }

    const lbRows = await sql`SELECT highest_level, party FROM leaderboard WHERE user_id = ${auth.uid} LIMIT 1`;
    const lbHighest = (lbRows[0]?.highest_level as number) || 0;
    const lbParty = lbRows[0]?.party;

    const completedLevels = mergeNumberArrays(row.completed_levels, null);
    const maxCompleted = calculateMaxCompleted(lbHighest, row.active_adventure, row.adventure_history, completedLevels);
    const safeUnlocked = resolveUnlockedClasses(row.unlocked_classes, null, maxCompleted, lbParty);
    const safeParty = sanitizeParty(row.selected_party_classes, safeUnlocked);

    const monsterKills = mergeNumericMap(row.monster_kills, null);
    const lineageQuestStats = mergeLineageQuestStats(row.lineage_quest_stats, null);
    const safeLineages = resolveUnlockedLineages(row.unlocked_lineages, null, lineageQuestStats, monsterKills);
    const safePartyLineages = sanitizeLineageMap(row.selected_party_lineages, null);
    const classMissionsProgress = mergeClassMissionsProgress(row.class_missions_progress, null);
    const unlockedClassSkins = mergeStringArrays(row.unlocked_class_skins, null);
    const equippedClassSkins = sanitizeSkinMap(row.equipped_class_skins, null);
    const unlockedClassSkillIds = mergeStringArrays(row.unlocked_class_skill_ids, null);
    const dailyDungeon = mergeDailyDungeon(row.daily_dungeon, null);
    const unlockedLevel = Math.max(1, Number(row.unlocked_level) || 1, maxCompleted + 1);

    // If unlocked classes or lineages changed, persist to DB
    const prevClasses = Array.isArray(row.unlocked_classes) ? row.unlocked_classes : [];
    const prevLineages = Array.isArray(row.unlocked_lineages) ? row.unlocked_lineages : [];
    const classesDifferent =
      safeUnlocked.length !== prevClasses.length || safeUnlocked.some((c, i) => c !== prevClasses[i]);
    const lineagesDifferent =
      safeLineages.length !== prevLineages.length || safeLineages.some((l, i) => l !== prevLineages[i]);

    if (classesDifferent || lineagesDifferent) {
      const unlockedJson = JSON.stringify(safeUnlocked);
      const partyJson = JSON.stringify(safeParty);
      const lineagesJson = JSON.stringify(safeLineages);
      await sql`
        UPDATE player_progress 
        SET unlocked_classes = ${unlockedJson}::jsonb,
            selected_party_classes = ${partyJson}::jsonb,
            unlocked_lineages = ${lineagesJson}::jsonb,
            updated_at = NOW() 
        WHERE user_id = ${auth.uid}
      `;
    }

    return json({
      progress: {
        gold: deliveredGold,
        unlockedClasses: safeUnlocked,
        selectedPartyClasses: safeParty,
        selectedPartyLineages: safePartyLineages,
        unitsState: row.units_state,
        discoveredMonsterIds: row.discovered_monster_ids,
        discoveredItemIds: Array.isArray(row.discovered_item_ids) ? row.discovered_item_ids : [],
        activeAdventure: row.active_adventure,
        adventureHistory: row.adventure_history,
        combatSpeed: row.combat_speed || 'normal',
        highestLevel: lbHighest,
        completedLevels,
        unlockedLevel,
        classUpgrades: row.class_upgrades && typeof row.class_upgrades === 'object' ? row.class_upgrades : {},
        generalUpgrades: row.general_upgrades && typeof row.general_upgrades === 'object' ? row.general_upgrades : {},
        itemUpgrades: row.item_upgrades && typeof row.item_upgrades === 'object' ? row.item_upgrades : {},
        unlockedPetIds: Array.isArray(row.unlocked_pet_ids) ? row.unlocked_pet_ids : [],
        equippedPetId: typeof row.equipped_pet_id === 'string' ? row.equipped_pet_id : null,
        eggs: Array.isArray(row.pet_eggs) ? row.pet_eggs : [],
        classMissionsProgress,
        unlockedClassSkins,
        equippedClassSkins,
        unlockedClassSkillIds,
        dailyDungeon,
        monsterKills,
        unlockedLineages: safeLineages,
        lineageQuestStats,
      },
    });
  } catch (err) {
    console.error('GET /api/progress error', err);
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('não configurada')) {
      return json({ error: msg }, 500);
    }
    return json({ error: 'Erro ao buscar progresso' }, 500);
  }
}

export async function POST(req: Request): Promise<Response> {
  const auth = getAuthUser(req);
  if (!auth) return json({ error: 'Não autorizado' }, 401);

  const body = (await readJson(req)) as Record<string, any> | null;
  if (!body) return json({ error: 'Corpo inválido' }, 400);

  try {
    const sql = getSql();
    await ensureProgressSchema(sql);

    const existingRows = await sql`
      SELECT unlocked_classes, COALESCE(pending_gold, 0) as pending_gold,
             class_upgrades, general_upgrades, item_upgrades,
             discovered_monster_ids, discovered_item_ids, unlocked_pet_ids,
             class_missions_progress, unlocked_class_skins, equipped_class_skins, unlocked_class_skill_ids,
             daily_dungeon, monster_kills, unlocked_lineages, lineage_quest_stats, selected_party_lineages,
             completed_levels, unlocked_level
      FROM player_progress
      WHERE user_id = ${auth.uid}
      LIMIT 1
    `;
    const ex = existingRows[0] || {};
    const existingDbUnlocked = ex.unlocked_classes;
    const pendingGold = Number(ex.pending_gold) || 0;

    const lbRows = await sql`SELECT highest_level, party FROM leaderboard WHERE user_id = ${auth.uid} LIMIT 1`;
    const lbHighest = (lbRows[0]?.highest_level as number) || 0;
    const lbParty = lbRows[0]?.party;

    const baseGold = typeof body.gold === 'number' ? body.gold : 0;
    const finalGold = baseGold + pendingGold;
    const activeAdventure = body.activeAdventure && typeof body.activeAdventure === 'object' ? body.activeAdventure : null;
    const adventureHistory = Array.isArray(body.adventureHistory) ? body.adventureHistory : [];
    const completedLevels = mergeNumberArrays(ex.completed_levels, body.completedLevels);

    const maxCompleted = calculateMaxCompleted(lbHighest, activeAdventure, adventureHistory, completedLevels);
    const safeUnlocked = resolveUnlockedClasses(existingDbUnlocked, body.unlockedClasses, maxCompleted, lbParty);
    const safeParty = sanitizeParty(body.selectedPartyClasses, safeUnlocked);
    const unlockedLevel = Math.max(
      1,
      Number(ex.unlocked_level) || 1,
      Number(body.unlockedLevel) || 1,
      maxCompleted + 1
    );

    const mergedMonsterKills = mergeNumericMap(ex.monster_kills, body.monsterKills);
    const mergedLineageQuestStats = mergeLineageQuestStats(ex.lineage_quest_stats, body.lineageQuestStats);
    const safeUnlockedLineages = resolveUnlockedLineages(
      ex.unlocked_lineages,
      body.unlockedLineages,
      mergedLineageQuestStats,
      mergedMonsterKills
    );
    const safePartyLineages = sanitizeLineageMap(ex.selected_party_lineages, body.selectedPartyLineages);

    if (activeAdventure && Array.isArray(activeAdventure.partyClasses)) {
      activeAdventure.partyClasses = sanitizeParty(activeAdventure.partyClasses, safeUnlocked);
    }
    if (activeAdventure && activeAdventure.partyLineages && typeof activeAdventure.partyLineages === 'object') {
      activeAdventure.partyLineages = sanitizeLineageMap(null, activeAdventure.partyLineages);
    }

    const mergedClassMissionsProgress = mergeClassMissionsProgress(
      ex.class_missions_progress,
      body.classMissionsProgress
    );
    const mergedUnlockedClassSkins = mergeStringArrays(ex.unlocked_class_skins, body.unlockedClassSkins);
    const mergedEquippedClassSkins = sanitizeSkinMap(ex.equipped_class_skins, body.equippedClassSkins);
    const mergedUnlockedClassSkillIds = mergeStringArrays(ex.unlocked_class_skill_ids, body.unlockedClassSkillIds);
    const mergedDailyDungeon = mergeDailyDungeon(ex.daily_dungeon, body.dailyDungeon);

    const mergedClassUpgrades = mergeNumericMap(ex.class_upgrades, body.classUpgrades);
    const mergedGeneralUpgrades = mergeNumericMap(ex.general_upgrades, body.generalUpgrades);
    const mergedItemUpgrades = mergeNumericMap(ex.item_upgrades, body.itemUpgrades);
    const mergedDiscoveredMonsters = mergeStringArrays(
      ex.discovered_monster_ids || ['goblin'],
      body.discoveredMonsterIds || ['goblin']
    );
    const mergedDiscoveredItems = mergeStringArrays(ex.discovered_item_ids, body.discoveredItemIds);
    const mergedUnlockedPets = mergeStringArrays(ex.unlocked_pet_ids, body.unlockedPetIds);

    const unlockedClassesJson = JSON.stringify(safeUnlocked);
    const selectedPartyClassesJson = JSON.stringify(safeParty);
    const selectedPartyLineagesJson = JSON.stringify(safePartyLineages);
    const unitsStateJson = JSON.stringify(body.unitsState || {});
    const discoveredMonsterIdsJson = JSON.stringify(mergedDiscoveredMonsters);
    const discoveredItemIdsJson = JSON.stringify(mergedDiscoveredItems);
    const activeAdventureJson = activeAdventure ? JSON.stringify(activeAdventure) : null;
    const adventureHistoryJson = JSON.stringify(adventureHistory);
    const combatSpeed = body.combatSpeed === 'fast' ? 'fast' : 'normal';
    const classUpgradesJson = JSON.stringify(mergedClassUpgrades);
    const generalUpgradesJson = JSON.stringify(mergedGeneralUpgrades);
    const itemUpgradesJson = JSON.stringify(mergedItemUpgrades);
    const unlockedPetIdsJson = JSON.stringify(mergedUnlockedPets);
    const equippedPetId = typeof body.equippedPetId === 'string' && body.equippedPetId.trim() ? body.equippedPetId.trim() : null;
    const petEggsJson = JSON.stringify(Array.isArray(body.eggs) ? body.eggs : []);
    const classMissionsProgressJson = JSON.stringify(mergedClassMissionsProgress);
    const unlockedClassSkinsJson = JSON.stringify(mergedUnlockedClassSkins);
    const equippedClassSkinsJson = JSON.stringify(mergedEquippedClassSkins);
    const unlockedClassSkillIdsJson = JSON.stringify(mergedUnlockedClassSkillIds);
    const dailyDungeonJson = JSON.stringify(mergedDailyDungeon);
    const monsterKillsJson = JSON.stringify(mergedMonsterKills);
    const unlockedLineagesJson = JSON.stringify(safeUnlockedLineages);
    const lineageQuestStatsJson = JSON.stringify(mergedLineageQuestStats);
    const completedLevelsJson = JSON.stringify(completedLevels);

    await sql`
      INSERT INTO player_progress (
        user_id, gold, pending_gold, unlocked_classes, selected_party_classes, selected_party_lineages, units_state,
        discovered_monster_ids, discovered_item_ids, active_adventure, adventure_history, combat_speed,
        class_upgrades, general_upgrades, item_upgrades,
        unlocked_pet_ids, equipped_pet_id, pet_eggs,
        class_missions_progress, unlocked_class_skins, equipped_class_skins, unlocked_class_skill_ids,
        daily_dungeon, monster_kills, unlocked_lineages, lineage_quest_stats,
        completed_levels, unlocked_level, updated_at
      )
      VALUES (
        ${auth.uid}, ${finalGold}, 0, ${unlockedClassesJson}::jsonb, ${selectedPartyClassesJson}::jsonb, ${selectedPartyLineagesJson}::jsonb, ${unitsStateJson}::jsonb,
        ${discoveredMonsterIdsJson}::jsonb, ${discoveredItemIdsJson}::jsonb, ${activeAdventureJson}::jsonb, ${adventureHistoryJson}::jsonb, ${combatSpeed},
        ${classUpgradesJson}::jsonb, ${generalUpgradesJson}::jsonb, ${itemUpgradesJson}::jsonb,
        ${unlockedPetIdsJson}::jsonb, ${equippedPetId}, ${petEggsJson}::jsonb,
        ${classMissionsProgressJson}::jsonb, ${unlockedClassSkinsJson}::jsonb, ${equippedClassSkinsJson}::jsonb, ${unlockedClassSkillIdsJson}::jsonb,
        ${dailyDungeonJson}::jsonb, ${monsterKillsJson}::jsonb, ${unlockedLineagesJson}::jsonb, ${lineageQuestStatsJson}::jsonb,
        ${completedLevelsJson}::jsonb, ${unlockedLevel}, NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        gold = ${finalGold},
        pending_gold = 0,
        unlocked_classes = EXCLUDED.unlocked_classes,
        selected_party_classes = EXCLUDED.selected_party_classes,
        selected_party_lineages = EXCLUDED.selected_party_lineages,
        units_state = EXCLUDED.units_state,
        discovered_monster_ids = EXCLUDED.discovered_monster_ids,
        discovered_item_ids = EXCLUDED.discovered_item_ids,
        active_adventure = EXCLUDED.active_adventure,
        adventure_history = EXCLUDED.adventure_history,
        combat_speed = EXCLUDED.combat_speed,
        class_upgrades = EXCLUDED.class_upgrades,
        general_upgrades = EXCLUDED.general_upgrades,
        item_upgrades = EXCLUDED.item_upgrades,
        unlocked_pet_ids = EXCLUDED.unlocked_pet_ids,
        equipped_pet_id = EXCLUDED.equipped_pet_id,
        pet_eggs = EXCLUDED.pet_eggs,
        class_missions_progress = EXCLUDED.class_missions_progress,
        unlocked_class_skins = EXCLUDED.unlocked_class_skins,
        equipped_class_skins = EXCLUDED.equipped_class_skins,
        unlocked_class_skill_ids = EXCLUDED.unlocked_class_skill_ids,
        daily_dungeon = EXCLUDED.daily_dungeon,
        monster_kills = EXCLUDED.monster_kills,
        unlocked_lineages = EXCLUDED.unlocked_lineages,
        lineage_quest_stats = EXCLUDED.lineage_quest_stats,
        completed_levels = EXCLUDED.completed_levels,
        unlocked_level = EXCLUDED.unlocked_level,
        updated_at = NOW()`;

    return json({ ok: true, gold: finalGold });
  } catch (err) {
    console.error('POST /api/progress error', err);
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('não configurada')) {
      return json({ error: msg }, 500);
    }
    return json({ error: 'Erro ao salvar progresso' }, 500);
  }
}
