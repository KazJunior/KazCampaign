import { neon } from '@neondatabase/serverless';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Arquivos iniciados com "_" dentro de /api não viram rotas na Vercel.

export function getSql() {
  const url =
    process.env.KAZCAMPAIGN_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!url) throw new Error('KAZCAMPAIGN_DATABASE_URL ou DATABASE_URL não configurada no painel da Vercel.');
  return neon(url);
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw new Error('AUTH_SECRET não configurada no painel da Vercel.');
    }
    return 'kazcampaign_local_dev_only_secret';
  }
  return secret;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// ---------- Senhas (scrypt com salt aleatório) ----------

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [algo, saltHex, hashHex] = stored.split('$');
  if (algo !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(expected, actual);
}

// ---------- Tokens de sessão (HMAC-SHA256, formato payload.assinatura) ----------

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 dias

export interface TokenPayload {
  uid: number;
  name: string;
  exp: number;
}

function sign(data: string): string {
  return createHmac('sha256', getSecret()).update(data).digest('base64url');
}

export function createToken(uid: number, name: string): string {
  const payload: TokenPayload = { uid, name, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function getAuthUser(req: Request): TokenPayload | null {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  const expected = Buffer.from(sign(encoded));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as TokenPayload;
    if (typeof payload.uid !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---------- Validações ----------

export const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

export function validateCredentials(body: Record<string, unknown> | null):
  | { username: string; password: string }
  | { error: string } {
  const username = typeof body?.username === 'string' ? body.username.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!USERNAME_RE.test(username)) {
    return { error: 'Usuário deve ter 3 a 20 caracteres (letras, números ou _).' };
  }
  if (password.length < 6 || password.length > 72) {
    return { error: 'Senha deve ter entre 6 e 72 caracteres.' };
  }
  return { username, password };
}

// ---------- Chaves de Recuperação (Recovery Key) ----------

const RECOVERY_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateRecoveryKey(): string {
  const bytes = randomBytes(12);
  let raw = '';
  for (let i = 0; i < 12; i++) {
    raw += RECOVERY_CHARS[bytes[i] % RECOVERY_CHARS.length];
  }
  return `KAZ-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

export function normalizeRecoveryKey(key: string): string {
  return key.trim().toUpperCase().replace(/[^2-9A-Z]/g, '');
}

export function hashRecoveryKey(key: string): string {
  const normalized = normalizeRecoveryKey(key);
  const salt = randomBytes(16);
  const hash = scryptSync(normalized, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyRecoveryKey(key: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const normalized = normalizeRecoveryKey(key);
  const [algo, saltHex, hashHex] = stored.split('$');
  if (algo !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(normalized, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(expected, actual);
}

let schemaEnsured = false;
export async function ensureUsersSchema(sql: ReturnType<typeof getSql>): Promise<void> {
  if (schemaEnsured) return;
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_key_hash TEXT;`;
    schemaEnsured = true;
  } catch (e) {
    console.warn('ensureUsersSchema warning:', e);
  }
}

