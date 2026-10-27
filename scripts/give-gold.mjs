#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
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
const amountRaw = process.argv[3]?.trim();

if (!username || !amountRaw) {
  console.log(`
\x1b[1m\x1b[33m[KazCampaign - Compensação / Ajuste de Ouro]\x1b[0m
Uso:
  npm run give-gold <username> <quantidade>
  node scripts/give-gold.mjs <username> <quantidade>

Exemplos:
  npm run give-gold Tornarsuk 30000        (Adiciona 30.000 ao ouro atual)
  npm run give-gold Tornarsuk +5000        (Adiciona 5.000 ao ouro atual)
  npm run give-gold Tornarsuk =50000       (Define o ouro exatamente como 50.000)
`);
  process.exit(1);
}

const isExactSet = amountRaw.startsWith('=');
const numericStr = isExactSet ? amountRaw.slice(1) : amountRaw.replace(/^\+/, '');
const amount = parseInt(numericStr, 10);

if (Number.isNaN(amount)) {
  console.error('\x1b[31m[ERRO]\x1b[0m A quantidade de ouro informada não é um número válido.');
  process.exit(1);
}

if (!dbUrl) {
  console.error('\x1b[31m[ERRO]\x1b[0m Nenhuma URL de banco de dados encontrada.');
  console.error('Configure a variável DATABASE_URL ou KAZCAMPAIGN_DATABASE_URL no seu arquivo .env ou no terminal.');
  process.exit(1);
}

async function run() {
  const sql = neon(dbUrl);

  try {
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

    await sql`ALTER TABLE player_progress ADD COLUMN IF NOT EXISTS pending_gold INTEGER DEFAULT 0;`;

    const progressRows = await sql`
      SELECT gold, COALESCE(pending_gold, 0) as pending_gold FROM player_progress
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    const currentGold = progressRows.length > 0 ? (progressRows[0].gold ?? 0) : 0;
    const currentPending = progressRows.length > 0 ? (progressRows[0].pending_gold ?? 0) : 0;

    if (progressRows.length === 0) {
      const initialGold = isExactSet ? amount : Math.max(0, amount);
      await sql`
        INSERT INTO player_progress (user_id, gold, pending_gold, updated_at)
        VALUES (${user.id}, ${initialGold}, 0, NOW())
      `;
      console.log(`\x1b[32m✔ Sucesso!\x1b[0m Registro de progresso criado para \x1b[1m${user.username}\x1b[0m com \x1b[1m${initialGold.toLocaleString('pt-BR')} ouro\x1b[0m.`);
    } else if (isExactSet) {
      await sql`
        UPDATE player_progress
        SET gold = ${amount}, pending_gold = 0, updated_at = NOW()
        WHERE user_id = ${user.id}
      `;
      console.log(`
\x1b[32m✔ Sucesso!\x1b[0m Ouro fixado para o jogador \x1b[1m${user.username}\x1b[0m (ID: ${user.id}):
  Ouro Anterior: \x1b[33m${currentGold.toLocaleString('pt-BR')}\x1b[0m
  Novo Saldo:    \x1b[1m\x1b[32m${amount.toLocaleString('pt-BR')} de ouro\x1b[0m
`);
    } else {
      // Incremental: usa pending_gold para garantir que sessões abertas recebam o ouro sem risco de sobrescrita
      const newPending = currentPending + amount;
      const expectedTotal = currentGold + newPending;

      await sql`
        UPDATE player_progress
        SET pending_gold = COALESCE(pending_gold, 0) + ${amount}, updated_at = NOW()
        WHERE user_id = ${user.id}
      `;

      console.log(`
\x1b[32m✔ Sucesso!\x1b[0m Ouro concedido para o jogador \x1b[1m${user.username}\x1b[0m (ID: ${user.id}):

=======================================================
\x1b[1m\x1b[36mDETALHES DA OPERAÇÃO:\x1b[0m
  Jogador:         \x1b[1m${user.username}\x1b[0m
  Ouro no Banco:   \x1b[33m${currentGold.toLocaleString('pt-BR')}\x1b[0m
  Ouro Concedido:  \x1b[35m+${amount.toLocaleString('pt-BR')}\x1b[0m (via pending_gold)
  Total Pendente:  \x1b[33m${newPending.toLocaleString('pt-BR')}\x1b[0m
  Total Garantido: \x1b[1m\x1b[32m${expectedTotal.toLocaleString('pt-BR')} de ouro\x1b[0m
  Status:          \x1b[36mEntregue na próxima ação, salvamento automático ou recarga de página (F5).\x1b[0m
=======================================================
`);
    }
  } catch (err) {
    console.error('\x1b[31m[ERRO INESPERADO]\x1b[0m', err);
    process.exit(1);
  }
}

run();
