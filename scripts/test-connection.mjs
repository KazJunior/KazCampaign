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
  process.env.POSTGRES_URL;

if (!dbUrl) {
  console.error('[ERRO] Nenhuma URL do Neon encontrada no ambiente ou .env.local');
  process.exit(1);
}

const parsedUrl = new URL(dbUrl);
console.log('--- Teste de Conexão Neon PostgreSQL ---');
console.log(`Host: ${parsedUrl.host}`);
console.log(`Database: ${parsedUrl.pathname.replace('/', '')}`);
console.log(`Usuário: ${parsedUrl.username}`);

try {
  const sql = neon(dbUrl);
  const [dbInfo] = await sql`
    SELECT 
      current_database() AS database_name,
      NOW() AS current_time,
      version() AS pg_version
  `;
  
  console.log('\nStatus: CONECTADO COM SUCESSO!');
  console.log(`Banco Atual: ${dbInfo.database_name}`);
  console.log(`Timestamp do Servidor: ${dbInfo.current_time}`);
  console.log(`Versão PostgreSQL: ${dbInfo.pg_version}`);

  await sql`
    ALTER TABLE player_progress 
    ADD COLUMN IF NOT EXISTS class_upgrades JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS general_upgrades JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS item_upgrades JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS discovered_item_ids JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS unlocked_pet_ids JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS equipped_pet_id TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS pet_eggs JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS pending_gold INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS class_missions_progress JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS unlocked_class_skins JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS equipped_class_skins JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS unlocked_class_skill_ids JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS daily_dungeon JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS monster_kills JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS unlocked_lineages JSONB DEFAULT '["humano","elfo","anao"]'::jsonb,
    ADD COLUMN IF NOT EXISTS lineage_quest_stats JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS selected_party_lineages JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS completed_levels JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS unlocked_level INTEGER DEFAULT 1;
  `;

  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;

  console.log('\nTabelas encontradas no esquema public:');
  for (const t of tables) {
    console.log(`  - ${t.table_name}`);
  }

  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'player_progress' 
    ORDER BY ordinal_position;
  `;
  console.log('\nColunas da tabela player_progress:');
  for (const c of cols) {
    console.log(`  - ${c.column_name} (${c.data_type})`);
  }
} catch (err) {
  console.error('\n[ERRO NA CONEXÃO]', err);
  process.exit(1);
}
