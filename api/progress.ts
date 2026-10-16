import { getAuthUser, getSql, json, readJson } from './_lib.js';

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

    return json({
      progress: {
        gold: row.gold,
        unlockedClasses: row.unlocked_classes,
        selectedPartyClasses: row.selected_party_classes,
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
    const gold = typeof body.gold === 'number' ? body.gold : 0;
    const unlockedClasses = JSON.stringify(body.unlockedClasses || ['guerreiro', 'arqueiro', 'mago', 'curandeiro']);
    const selectedPartyClasses = JSON.stringify(body.selectedPartyClasses || ['guerreiro', 'arqueiro', 'mago', 'curandeiro']);
    const unitsState = JSON.stringify(body.unitsState || {});
    const discoveredMonsterIds = JSON.stringify(body.discoveredMonsterIds || []);
    const activeAdventure = body.activeAdventure ? JSON.stringify(body.activeAdventure) : null;
    const adventureHistory = JSON.stringify(body.adventureHistory || []);
    const combatSpeed = body.combatSpeed === 'fast' ? 'fast' : 'normal';

    await sql`
      INSERT INTO player_progress (
        user_id, gold, unlocked_classes, selected_party_classes, units_state,
        discovered_monster_ids, active_adventure, adventure_history, combat_speed, updated_at
      )
      VALUES (
        ${auth.uid}, ${gold}, ${unlockedClasses}::jsonb, ${selectedPartyClasses}::jsonb, ${unitsState}::jsonb,
        ${discoveredMonsterIds}::jsonb, ${activeAdventure}::jsonb, ${adventureHistory}::jsonb, ${combatSpeed}, NOW()
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
