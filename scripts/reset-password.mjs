#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, scryptSync } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

// Carrega variáveis de ambiente de .env ou .env.local se existirem
function loadEnv() {
  const cwd = process.cwd();
  for (const envFile of ['.env', '.env.local', '.env.development']) {
    const fullPath = path.resolve(cwd, envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const dbUrl =
  process.env.KAZCAMPAIGN_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING;

const username = process.argv[2]?.trim();
let newPassword = process.argv[3];

if (!username) {
  console.log(`
\x1b[1m\x1b[33m[KazCampaign - Redefinição Administrativa de Senha]\x1b[0m
Uso:
  npm run reset-password <username> [novaSenha]
  node scripts/reset-password.mjs <username> [novaSenha]

Exemplos:
  npm run reset-password sergião
  npm run reset-password sergião SenhaForte123!
`);
  process.exit(1);
}

if (!dbUrl) {
  console.error('\x1b[31m[ERRO]\x1b[0m Nenhuma URL de banco de dados encontrada.');
  console.error('Configure a variável DATABASE_URL ou KAZCAMPAIGN_DATABASE_URL no seu arquivo .env ou no terminal.');
  process.exit(1);
}

// Algoritmos idênticos a api/_lib.ts
function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

const RECOVERY_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateRecoveryKey() {
  const bytes = randomBytes(12);
  let raw = '';
  for (let i = 0; i < 12; i++) {
    raw += RECOVERY_CHARS[bytes[i] % RECOVERY_CHARS.length];
  }
  return `KAZ-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

function normalizeRecoveryKey(key) {
  return key.trim().toUpperCase().replace(/[^2-9A-Z]/g, '');
}

function hashRecoveryKey(key) {
  const normalized = normalizeRecoveryKey(key);
  const salt = randomBytes(16);
  const hash = scryptSync(normalized, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function generateRandomPassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
  const bytes = randomBytes(10);
  let pass = 'Kaz#';
  for (let i = 0; i < 6; i++) {
    pass += chars[bytes[i] % chars.length];
  }
  return pass;
}

if (!newPassword) {
  newPassword = generateRandomPassword();
} else if (newPassword.length < 6 || newPassword.length > 72) {
  console.error('\x1b[31m[ERRO]\x1b[0m A senha deve ter entre 6 e 72 caracteres.');
  process.exit(1);
}

async function run() {
  const sql = neon(dbUrl);

  try {
    // Garante que a coluna de recovery_key_hash existe
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_key_hash TEXT;`;

    // Busca o usuário
    const searchRows = await sql`
      SELECT id, username FROM users
      WHERE lower(username) = lower(${username})
      LIMIT 1
    `;

    if (!searchRows || searchRows.length === 0) {
      console.error(`\x1b[31m[ERRO]\x1b[0m Usuário "${username}" não foi encontrado no banco de dados.`);
      process.exit(1);
    }

    const user = searchRows[0];
    const passwordHash = hashPassword(newPassword);
    const newRecoveryKey = generateRecoveryKey();
    const recoveryKeyHash = hashRecoveryKey(newRecoveryKey);

    await sql`
      UPDATE users
      SET password_hash = ${passwordHash},
          recovery_key_hash = ${recoveryKeyHash}
      WHERE id = ${user.id}
    `;

    console.log(`
\x1b[32m✔ Sucesso!\x1b[0m Senha e Chave de Recuperação atualizadas para o usuário \x1b[1m${user.username}\x1b[0m (ID: ${user.id}):

=======================================================
\x1b[1m\x1b[36mDADOS DE ACESSO DO USUÁRIO:\x1b[0m
  Usuário:               \x1b[1m${user.username}\x1b[0m
  Nova Senha Provisória: \x1b[1m\x1b[33m${newPassword}\x1b[0m
  Chave de Recuperação:  \x1b[1m\x1b[32m${newRecoveryKey}\x1b[0m
=======================================================

\x1b[90mCopie e envie a mensagem abaixo para o jogador:\x1b[0m
-------------------------------------------------------
Olá ${user.username}! Sua senha temporária no KazCampaign foi redefinida:
* Usuário: ${user.username}
* Senha Temporária: ${newPassword}
* Chave de Recuperação: ${newRecoveryKey}

(Guarde a Chave de Recuperação para redefinir sua senha caso a perca novamente!)
-------------------------------------------------------
`);
  } catch (err) {
    console.error('\x1b[31m[ERRO INESPERADO]\x1b[0m', err);
    process.exit(1);
  }
}

run();
