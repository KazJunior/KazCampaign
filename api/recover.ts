import {
  createToken,
  ensureUsersSchema,
  generateRecoveryKey,
  getSql,
  hashPassword,
  hashRecoveryKey,
  json,
  readJson,
  USERNAME_RE,
  verifyRecoveryKey,
} from './_lib.js';

export async function POST(req: Request): Promise<Response> {
  const body = await readJson(req);
  const username = typeof body?.username === 'string' ? body.username.trim() : '';
  const recoveryKey = typeof body?.recoveryKey === 'string' ? body.recoveryKey.trim() : '';
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

  if (!USERNAME_RE.test(username)) {
    return json({ error: 'Usuário inválido.' }, 400);
  }
  if (!recoveryKey || recoveryKey.length < 8) {
    return json({ error: 'Chave de recuperação inválida.' }, 400);
  }
  if (newPassword.length < 6 || newPassword.length > 72) {
    return json({ error: 'A nova senha deve ter entre 6 e 72 caracteres.' }, 400);
  }

  try {
    const sql = getSql();
    await ensureUsersSchema(sql);

    const rows = await sql`
      SELECT id, username, recovery_key_hash FROM users
      WHERE lower(username) = lower(${username})
      LIMIT 1`;
    const row = rows[0] as { id: number; username: string; recovery_key_hash?: string } | undefined;

    if (!row || !row.recovery_key_hash || !verifyRecoveryKey(recoveryKey, row.recovery_key_hash)) {
      return json({ error: 'Chave de recuperação ou usuário incorretos.' }, 401);
    }

    const newRecoveryKey = generateRecoveryKey();
    const newRecoveryKeyHash = hashRecoveryKey(newRecoveryKey);

    await sql`
      UPDATE users
      SET password_hash = ${hashPassword(newPassword)},
          recovery_key_hash = ${newRecoveryKeyHash}
      WHERE id = ${row.id}
    `;

    return json({
      token: createToken(row.id, row.username),
      user: { id: row.id, username: row.username },
      newRecoveryKey,
      message: 'Senha redefinida com sucesso!',
    });
  } catch (err) {
    console.error('recover error', err);
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('não configurada')) {
      return json({ error: msg }, 500);
    }
    return json({ error: 'Erro interno ao redefinir senha.' }, 500);
  }
}
