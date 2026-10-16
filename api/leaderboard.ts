import { getAuthUser, getSql, json, readJson } from './_lib.js';

const MAX_LEVEL = 50;
const CLASS_KEY_RE = /^[a-z_]{1,30}$/;

// Público: qualquer pessoa pode ver o ranking (melhor aventura de cada jogador, desempate pela mais recente).
export async function GET(): Promise<Response> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT u.username, l.highest_level, l.party, l.achieved_at
      FROM leaderboard l
      JOIN users u ON u.id = l.user_id
      ORDER BY l.highest_level DESC, l.achieved_at DESC
      LIMIT 50`;
    const entries = rows.map((r) => ({
      username: r.username as string,
      highestLevel: r.highest_level as number,
      party: r.party as string[],
      achievedAt: r.achieved_at as string,
    }));
    return json({ entries });
  } catch (err) {
    console.error('leaderboard GET error', err);
    return json({ error: 'Erro ao carregar o ranking.' }, 500);
  }
}

// Autenticado: registra a melhor fase da aventura.
// Mantém apenas a melhor aventura por jogador. Caso dê empate, mantém a mais recente.
export async function POST(req: Request): Promise<Response> {
  const auth = getAuthUser(req);
  if (!auth) return json({ error: 'Faça login para registrar sua pontuação.' }, 401);

  const body = await readJson(req);
  const level = body?.level;
  const party = body?.party;

  if (typeof level !== 'number' || !Number.isInteger(level) || level < 1 || level > MAX_LEVEL) {
    return json({ error: 'Fase inválida.' }, 400);
  }
  if (
    !Array.isArray(party) || party.length < 1 || party.length > 4 ||
    !party.every((c) => typeof c === 'string' && CLASS_KEY_RE.test(c))
  ) {
    return json({ error: 'Equipe inválida.' }, 400);
  }

  try {
    const sql = getSql();
    await sql`
      INSERT INTO leaderboard (user_id, highest_level, party, achieved_at)
      VALUES (${auth.uid}, ${level}, ${party as string[]}, now())
      ON CONFLICT (user_id) DO UPDATE
        SET highest_level = EXCLUDED.highest_level,
            party = EXCLUDED.party,
            achieved_at = EXCLUDED.achieved_at
        WHERE EXCLUDED.highest_level >= leaderboard.highest_level`;
    return json({ ok: true });
  } catch (err) {
    console.error('leaderboard POST error', err);
    return json({ error: 'Erro ao registrar pontuação.' }, 500);
  }
}
