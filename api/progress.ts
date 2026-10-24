import { getAuthUser, getSql, json, readJson } from './_lib.js';

const INITIAL_CLASSES = ['guerreiro', 'arqueiro', 'mago', 'curandeiro'];

function normalizeClass(c: unknown): string {
  if (typeof c !== 'string') return '';
  return c === 'engenheiro' ? 'druida' : c;
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
]);

function calculateMaxCompleted(
  leaderboardHighest: number,
  activeAdv: any,
  advHistory: any[]
): number {
  let max = leaderboardHighest || 0;
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
      ADD COLUMN IF NOT EXISTS pet_eggs JSONB DEFAULT '[]'::jsonb;
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
             unlocked_pet_ids, equipped_pet_id, pet_eggs
      FROM player_progress
      WHERE user_id = ${auth.uid}
      LIMIT 1`;

    if (rows.length === 0) {
      return json({ progress: null });
    }

    const row = rows[0] as {
      gold: number;
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
    };

    const lbRows = await sql`SELECT highest_level, party FROM leaderboard WHERE user_id = ${auth.uid} LIMIT 1`;
    const lbHighest = (lbRows[0]?.highest_level as number) || 0;
    const lbParty = lbRows[0]?.party;

    const maxCompleted = calculateMaxCompleted(lbHighest, row.active_adventure, row.adventure_history);
    const safeUnlocked = resolveUnlockedClasses(row.unlocked_classes, null, maxCompleted, lbParty);
    const safeParty = sanitizeParty(row.selected_party_classes, safeUnlocked);

    // If unlocked classes changed or invalid/unearned classes were removed, persist to DB
    const prevClasses = Array.isArray(row.unlocked_classes) ? row.unlocked_classes : [];
    const isDifferent = safeUnlocked.length !== prevClasses.length || safeUnlocked.some((c, i) => c !== prevClasses[i]);
    if (isDifferent) {
      const unlockedJson = JSON.stringify(safeUnlocked);
      const partyJson = JSON.stringify(safeParty);
      await sql`
        UPDATE player_progress 
        SET unlocked_classes = ${unlockedJson}::jsonb,
            selected_party_classes = ${partyJson}::jsonb,
            updated_at = NOW() 
        WHERE user_id = ${auth.uid}
      `;
    }

    return json({
      progress: {
        gold: row.gold,
        unlockedClasses: safeUnlocked,
        selectedPartyClasses: safeParty,
        unitsState: row.units_state,
        discoveredMonsterIds: row.discovered_monster_ids,
        discoveredItemIds: Array.isArray(row.discovered_item_ids) ? row.discovered_item_ids : [],
        activeAdventure: row.active_adventure,
        adventureHistory: row.adventure_history,
        combatSpeed: row.combat_speed || 'normal',
        highestLevel: lbHighest,
        classUpgrades: row.class_upgrades && typeof row.class_upgrades === 'object' ? row.class_upgrades : {},
        generalUpgrades: row.general_upgrades && typeof row.general_upgrades === 'object' ? row.general_upgrades : {},
        itemUpgrades: row.item_upgrades && typeof row.item_upgrades === 'object' ? row.item_upgrades : {},
        unlockedPetIds: Array.isArray(row.unlocked_pet_ids) ? row.unlocked_pet_ids : [],
        equippedPetId: typeof row.equipped_pet_id === 'string' ? row.equipped_pet_id : null,
        eggs: Array.isArray(row.pet_eggs) ? row.pet_eggs : [],
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
      SELECT unlocked_classes FROM player_progress WHERE user_id = ${auth.uid} LIMIT 1
    `;
    const existingDbUnlocked = existingRows[0]?.unlocked_classes;

    const lbRows = await sql`SELECT highest_level, party FROM leaderboard WHERE user_id = ${auth.uid} LIMIT 1`;
    const lbHighest = (lbRows[0]?.highest_level as number) || 0;
    const lbParty = lbRows[0]?.party;

    const gold = typeof body.gold === 'number' ? body.gold : 0;
    const activeAdventure = body.activeAdventure && typeof body.activeAdventure === 'object' ? body.activeAdventure : null;
    const adventureHistory = Array.isArray(body.adventureHistory) ? body.adventureHistory : [];

    const maxCompleted = calculateMaxCompleted(lbHighest, activeAdventure, adventureHistory);
    const safeUnlocked = resolveUnlockedClasses(existingDbUnlocked, body.unlockedClasses, maxCompleted, lbParty);
    const safeParty = sanitizeParty(body.selectedPartyClasses, safeUnlocked);

    if (activeAdventure && Array.isArray(activeAdventure.partyClasses)) {
      activeAdventure.partyClasses = sanitizeParty(activeAdventure.partyClasses, safeUnlocked);
    }

    const unlockedClassesJson = JSON.stringify(safeUnlocked);
    const selectedPartyClassesJson = JSON.stringify(safeParty);
    const unitsStateJson = JSON.stringify(body.unitsState || {});
    const discoveredMonsterIdsJson = JSON.stringify(body.discoveredMonsterIds || ['goblin']);
    const discoveredItemIdsJson = JSON.stringify(Array.isArray(body.discoveredItemIds) ? body.discoveredItemIds : []);
    const activeAdventureJson = activeAdventure ? JSON.stringify(activeAdventure) : null;
    const adventureHistoryJson = JSON.stringify(adventureHistory);
    const combatSpeed = body.combatSpeed === 'fast' ? 'fast' : 'normal';
    const classUpgradesJson = JSON.stringify(body.classUpgrades && typeof body.classUpgrades === 'object' ? body.classUpgrades : {});
    const generalUpgradesJson = JSON.stringify(body.generalUpgrades && typeof body.generalUpgrades === 'object' ? body.generalUpgrades : {});
    const itemUpgradesJson = JSON.stringify(body.itemUpgrades && typeof body.itemUpgrades === 'object' ? body.itemUpgrades : {});
    const unlockedPetIdsJson = JSON.stringify(Array.isArray(body.unlockedPetIds) ? body.unlockedPetIds : []);
    const equippedPetId = typeof body.equippedPetId === 'string' && body.equippedPetId.trim() ? body.equippedPetId.trim() : null;
    const petEggsJson = JSON.stringify(Array.isArray(body.eggs) ? body.eggs : []);

    await sql`
      INSERT INTO player_progress (
        user_id, gold, unlocked_classes, selected_party_classes, units_state,
        discovered_monster_ids, discovered_item_ids, active_adventure, adventure_history, combat_speed,
        class_upgrades, general_upgrades, item_upgrades,
        unlocked_pet_ids, equipped_pet_id, pet_eggs, updated_at
      )
      VALUES (
        ${auth.uid}, ${gold}, ${unlockedClassesJson}::jsonb, ${selectedPartyClassesJson}::jsonb, ${unitsStateJson}::jsonb,
        ${discoveredMonsterIdsJson}::jsonb, ${discoveredItemIdsJson}::jsonb, ${activeAdventureJson}::jsonb, ${adventureHistoryJson}::jsonb, ${combatSpeed},
        ${classUpgradesJson}::jsonb, ${generalUpgradesJson}::jsonb, ${itemUpgradesJson}::jsonb,
        ${unlockedPetIdsJson}::jsonb, ${equippedPetId}, ${petEggsJson}::jsonb, NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        gold = EXCLUDED.gold,
        unlocked_classes = EXCLUDED.unlocked_classes,
        selected_party_classes = EXCLUDED.selected_party_classes,
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
        updated_at = NOW()`;

    return json({ ok: true });
  } catch (err) {
    console.error('POST /api/progress error', err);
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('não configurada')) {
      return json({ error: msg }, 500);
    }
    return json({ error: 'Erro ao salvar progresso' }, 500);
  }
}


