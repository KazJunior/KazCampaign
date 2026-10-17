import { getAuthUser, getSql, json, readJson } from './_lib.js';

const INITIAL_CLASSES = ['guerreiro', 'arqueiro', 'mago', 'curandeiro'];

const CLASS_UNLOCK_LEVELS: Record<string, number> = {
  assassino: 5,
  cavaleiro_arcano: 10,
  necromante: 15,
  engenheiro: 20,
  mago_runico: 25,
  berserker: 30,
};

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
      } else if (typeof rec.farthestLevel === 'number' && rec.farthestLevel > 1) {
        max = Math.max(max, rec.farthestLevel - 1);
      }
    }
  }
  return max;
}

function sanitizeUnlocked(rawList: unknown, maxCompleted: number): string[] {
  const allowed = new Set<string>(INITIAL_CLASSES);
  if (Array.isArray(rawList)) {
    for (const [cName, reqLvl] of Object.entries(CLASS_UNLOCK_LEVELS)) {
      if (maxCompleted >= reqLvl && rawList.includes(cName)) {
        allowed.add(cName);
      }
    }
  }
  return Array.from(allowed);
}

function sanitizeParty(rawParty: unknown, unlocked: string[]): string[] {
  const unlockedSet = new Set(unlocked);
  const result: string[] = [];
  if (Array.isArray(rawParty)) {
    for (const c of rawParty) {
      if (typeof c === 'string' && unlockedSet.has(c) && !result.includes(c)) {
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

export async function GET(req: Request): Promise<Response> {
  const auth = getAuthUser(req);
  if (!auth) return json({ error: 'Não autorizado' }, 401);

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT gold, unlocked_classes, selected_party_classes, units_state, 
             discovered_monster_ids, active_adventure, adventure_history, combat_speed
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
      active_adventure: any;
      adventure_history: any[];
      combat_speed: string;
    };

    const lbRows = await sql`SELECT highest_level FROM leaderboard WHERE user_id = ${auth.uid} LIMIT 1`;
    const lbHighest = (lbRows[0]?.highest_level as number) || 0;
    const maxCompleted = calculateMaxCompleted(lbHighest, row.active_adventure, row.adventure_history);
    const safeUnlocked = sanitizeUnlocked(row.unlocked_classes, maxCompleted);
    const safeParty = sanitizeParty(row.selected_party_classes, safeUnlocked);

    return json({
      progress: {
        gold: row.gold,
        unlockedClasses: safeUnlocked,
        selectedPartyClasses: safeParty,
        unitsState: row.units_state,
        discoveredMonsterIds: row.discovered_monster_ids,
        activeAdventure: row.active_adventure,
        adventureHistory: row.adventure_history,
        combatSpeed: row.combat_speed || 'normal',
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
    const lbRows = await sql`SELECT highest_level FROM leaderboard WHERE user_id = ${auth.uid} LIMIT 1`;
    const lbHighest = (lbRows[0]?.highest_level as number) || 0;

    const gold = typeof body.gold === 'number' ? body.gold : 0;
    const activeAdventure = body.activeAdventure && typeof body.activeAdventure === 'object' ? body.activeAdventure : null;
    const adventureHistory = Array.isArray(body.adventureHistory) ? body.adventureHistory : [];

    const maxCompleted = calculateMaxCompleted(lbHighest, activeAdventure, adventureHistory);
    const safeUnlocked = sanitizeUnlocked(body.unlockedClasses, maxCompleted);
    const safeParty = sanitizeParty(body.selectedPartyClasses, safeUnlocked);

    if (activeAdventure && Array.isArray(activeAdventure.partyClasses)) {
      activeAdventure.partyClasses = sanitizeParty(activeAdventure.partyClasses, safeUnlocked);
    }

    const unlockedClassesJson = JSON.stringify(safeUnlocked);
    const selectedPartyClassesJson = JSON.stringify(safeParty);
    const unitsStateJson = JSON.stringify(body.unitsState || {});
    const discoveredMonsterIdsJson = JSON.stringify(body.discoveredMonsterIds || ['goblin']);
    const activeAdventureJson = activeAdventure ? JSON.stringify(activeAdventure) : null;
    const adventureHistoryJson = JSON.stringify(adventureHistory);
    const combatSpeed = body.combatSpeed === 'fast' ? 'fast' : 'normal';

    await sql`
      INSERT INTO player_progress (
        user_id, gold, unlocked_classes, selected_party_classes, units_state,
        discovered_monster_ids, active_adventure, adventure_history, combat_speed, updated_at
      )
      VALUES (
        ${auth.uid}, ${gold}, ${unlockedClassesJson}::jsonb, ${selectedPartyClassesJson}::jsonb, ${unitsStateJson}::jsonb,
        ${discoveredMonsterIdsJson}::jsonb, ${activeAdventureJson}::jsonb, ${adventureHistoryJson}::jsonb, ${combatSpeed}, NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        gold = EXCLUDED.gold,
        unlocked_classes = EXCLUDED.unlocked_classes,
        selected_party_classes = EXCLUDED.selected_party_classes,
        units_state = EXCLUDED.units_state,
        discovered_monster_ids = EXCLUDED.discovered_monster_ids,
        active_adventure = EXCLUDED.active_adventure,
        adventure_history = EXCLUDED.adventure_history,
        combat_speed = EXCLUDED.combat_speed,
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
