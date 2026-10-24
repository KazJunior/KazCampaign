#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

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

const HATCH_DURATIONS = {
  common: 1 * 60 * 60 * 1000,
  uncommon: 2 * 60 * 60 * 1000,
  rare: 3 * 60 * 60 * 1000,
  epic: 5 * 60 * 60 * 1000,
  legendary: 8 * 60 * 60 * 1000,
};

const RARITY_LABELS = {
  common: 'Comum (Branco)',
  uncommon: 'Incomum (Verde)',
  rare: 'Raro (Azul)',
  epic: 'Épico (Roxo)',
  legendary: 'Lendário (Dourado)',
};

function rollRarity() {
  const roll = Math.random() * 100;
  if (roll < 40) return 'common';
  if (roll < 70) return 'uncommon';
  if (roll < 90) return 'rare';
  if (roll < 99) return 'epic';
  return 'legendary';
}

const username = process.argv[2]?.trim();
const forcedRarity = process.argv[3]?.trim()?.toLowerCase();

if (!username) {
  console.log(`
\x1b[1m\x1b[33m[KazCampaign - Adicionar Ovo de Pet]\x1b[0m
Uso:
  node scripts/give-egg.mjs <username> [raridade]

Raridades opcionais:
  common, uncommon, rare, epic, legendary (ou deixe vazio para sorteio aleatório padrão)

Exemplos:
  node scripts/give-egg.mjs Flamengo
  node scripts/give-egg.mjs Flamengo legendary
`);
  process.exit(1);
}

if (!dbUrl) {
  console.error('\x1b[31m[ERRO]\x1b[0m Nenhuma URL de banco de dados encontrada (.env ou .env.local).');
  process.exit(1);
}

async function run() {
  const sql = neon(dbUrl);

  try {
    // 1. Localiza usuário
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

    // 2. Garante colunas de pets/ovos na tabela
    await sql`
      ALTER TABLE player_progress 
      ADD COLUMN IF NOT EXISTS pet_eggs JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS unlocked_pet_ids JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS equipped_pet_id TEXT DEFAULT NULL;
    `;

    // 3. Busca progresso do jogador
    const progressRows = await sql`
      SELECT pet_eggs FROM player_progress
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    let currentEggs = [];
    if (progressRows.length > 0 && Array.isArray(progressRows[0].pet_eggs)) {
      currentEggs = progressRows[0].pet_eggs;
    }

    if (currentEggs.length >= 20) {
      console.error(`\x1b[31m[ERRO]\x1b[0m O inventário de ovos do jogador "${user.username}" já atingiu o limite máximo de 20 ovos.`);
      process.exit(1);
    }

    const finalRarity = forcedRarity && HATCH_DURATIONS[forcedRarity] ? forcedRarity : rollRarity();
    const newEgg = {
      id: `egg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      rarity: finalRarity,
      acquiredAt: Date.now(),
      incubatingStartedAt: null,
      hatchDurationMs: HATCH_DURATIONS[finalRarity],
    };

    const updatedEggs = [...currentEggs, newEgg];
    const eggsJson = JSON.stringify(updatedEggs);

    if (progressRows.length === 0) {
      await sql`
        INSERT INTO player_progress (user_id, pet_eggs, updated_at)
        VALUES (${user.id}, ${eggsJson}::jsonb, NOW())
      `;
    } else {
      await sql`
        UPDATE player_progress
        SET pet_eggs = ${eggsJson}::jsonb, updated_at = NOW()
        WHERE user_id = ${user.id}
      `;
    }

    console.log(`
\x1b[32m✔ Sucesso!\x1b[0m Ovo adicionado ao inventário do jogador \x1b[1m${user.username}\x1b[0m (ID: ${user.id}):

=======================================================
\x1b[1m\x1b[36mDETALHES DO OVO GERADO:\x1b[0m
  ID do Ovo:       \x1b[1m${newEgg.id}\x1b[0m
  Raridade:        \x1b[1m\x1b[35m${RARITY_LABELS[finalRarity] || finalRarity}\x1b[0m
  Tempo de Choco:  \x1b[33m${HATCH_DURATIONS[finalRarity] / (60 * 60 * 1000)} hora(s)\x1b[0m
  Total de Ovos:   \x1b[32m${updatedEggs.length} / 20\x1b[0m
=======================================================
`);
  } catch (err) {
    console.error('\x1b[31m[ERRO INESPERADO]\x1b[0m', err);
    process.exit(1);
  }
}

run();
