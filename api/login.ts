import { createToken, getSql, json, readJson, validateCredentials, verifyPassword } from './_lib.js';

export async function POST(req: Request): Promise<Response> {
  const creds = validateCredentials(await readJson(req));
  // Mensagem genérica para não revelar se o usuário existe.
  if ('error' in creds) return json({ error: 'Usuário ou senha inválidos.' }, 401);

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, username, password_hash FROM users
      WHERE lower(username) = lower(${creds.username})
      LIMIT 1`;
    const row = rows[0] as { id: number; username: string; password_hash: string } | undefined;

    if (!row || !verifyPassword(creds.password, row.password_hash)) {
      return json({ error: 'Usuário ou senha inválidos.' }, 401);
    }
    return json({ token: createToken(row.id, row.username), user: { id: row.id, username: row.username } });
  } catch (err) {
    console.error('login error', err);
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('não configurada')) {
      return json({ error: msg }, 500);
    }
    return json({ error: 'Erro interno ao entrar.' }, 500);
  }
}
