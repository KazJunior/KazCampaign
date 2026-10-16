import { getAuthUser, getSql, json } from './_lib.js';

export async function GET(req: Request): Promise<Response> {
  const auth = getAuthUser(req);
  if (!auth) return json({ error: 'Sessão inválida ou expirada.' }, 401);

  try {
    const sql = getSql();
    const rows = await sql`SELECT id, username FROM users WHERE id = ${auth.uid}`;
    if (!rows[0]) return json({ error: 'Usuário não encontrado.' }, 401);
    return json({ user: rows[0] });
  } catch (err) {
    console.error('me error', err);
    return json({ error: 'Erro interno.' }, 500);
  }
}
