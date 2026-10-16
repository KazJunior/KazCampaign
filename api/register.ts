import { createToken, getSql, hashPassword, json, readJson, validateCredentials } from './_lib.js';

export async function POST(req: Request): Promise<Response> {
  const creds = validateCredentials(await readJson(req));
  if ('error' in creds) return json({ error: creds.error }, 400);

  try {
    const sql = getSql();
    const rows = await sql`
      INSERT INTO users (username, password_hash)
      VALUES (${creds.username}, ${hashPassword(creds.password)})
      RETURNING id, username`;
    const user = rows[0] as { id: number; username: string };
    return json({ token: createToken(user.id, user.username), user }, 201);
  } catch (err) {
    if ((err as { code?: string }).code === '23505') {
      return json({ error: 'Este nome de usuário já está em uso.' }, 409);
    }
    console.error('register error', err);
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('não configurada')) {
      return json({ error: msg }, 500);
    }
    return json({ error: 'Erro interno ao criar conta.' }, 500);
  }
}
