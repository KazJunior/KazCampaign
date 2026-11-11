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

const VALID_CLASSES = [
  'guerreiro',
  'arqueiro',
  'mago',
  'curandeiro',
  'assassino',
  'cavaleiro_arcano',
  'necromante',
  'druida',
  'mago_runico',
  'berserker',
  'carrasco_vazio',
  'paladino',
  'lanceiro',
  'bardo',
  'mago_gelo',
  'sniper',
  'mago_eletrico',
  'mago_vento',
  'omnimago',
  'cartomante',
  'ceifador',
  'invocador',
  'alquimista',
  'pistoleiro_tempo',
];

const username = process.argv[2]?.trim();
const rawClassName = process.argv[3]?.trim()?.toLowerCase();
const className = rawClassName === 'engenheiro' ? 'druida' : rawClassName;

if (!username || !className) {
  console.log(`
\x1b[1m\x1b[33m[KazCampaign - Conceder / Restaurar Classe de Herói]\x1b[0m
Uso:
  npm run give-class <username> <nome_da_classe>
  node scripts/give-class.mjs <username> <nome_da_classe>

Exemplos:
  npm run give-class lui invocador
  npm run give-class Tornarsuk ceifador
  npm run give-class Flamengo alquimista

Classes disponíveis:
  ${VALID_CLASSES.join(', ')}
`);
  process.exit(1);
}

if (!VALID_CLASSES.includes(className)) {
  console.error(`\x1b[31m[ERRO]\x1b[0m A classe "${className}" não é reconhecida.`);
  console.error(`Classes válidas: ${VALID_CLASSES.join(', ')}`);
  process.exit(1);
}

if (!dbUrl) {
  console.error('\x1b[31m[ERRO]\x1b[0m Nenhuma URL de banco de dados encontrada.');
  console.error('Configure a variável DATABASE_URL ou KAZCAMPAIGN_DATABASE_URL no seu arquivo .env.local ou no terminal.');
  process.exit(1);
}

function parseClasses(raw) {
  if (Array.isArray(raw)) return raw.filter((c) => typeof c === 'string');
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((c) => typeof c === 'string');
    } catch {}
  }
  return ['guerreiro', 'arqueiro', 'mago', 'curandeiro'];
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

    const progressRows = await sql`
      SELECT unlocked_classes, gold FROM player_progress
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    let currentClasses = ['guerreiro', 'arqueiro', 'mago', 'curandeiro'];
    let currentGold = 0;

    if (progressRows.length > 0) {
      currentGold = Number(progressRows[0].gold) || 0;
      currentClasses = parseClasses(progressRows[0].unlocked_classes);
    }

    const alreadyHasClass = currentClasses.includes(className);
    const updatedClasses = Array.from(new Set([...currentClasses, className]));
    const updatedJson = JSON.stringify(updatedClasses);

    if (progressRows.length === 0) {
      await sql`
        INSERT INTO player_progress (user_id, gold, pending_gold, unlocked_classes, updated_at)
        VALUES (${user.id}, 0, 0, ${updatedJson}::jsonb, NOW())
      `;
    } else {
      await sql`
        UPDATE player_progress
        SET unlocked_classes = ${updatedJson}::jsonb,
            updated_at = NOW()
        WHERE user_id = ${user.id}
      `;
    }

    console.log(`
\x1b[32m✔ Sucesso!\x1b[0m Classe "${className}" vinculada ao jogador \x1b[1m${user.username}\x1b[0m (ID: ${user.id}):

=======================================================
\x1b[1m\x1b[36mDETALHES DA OPERAÇÃO:\x1b[0m
  Jogador:           \x1b[1m${user.username}\x1b[0m
  Classe Adicionada: \x1b[33m${className}\x1b[0m ${alreadyHasClass ? '(já constava na lista)' : '(restaurada com sucesso)'}
  Ouro do Jogador:   \x1b[33m${currentGold.toLocaleString('pt-BR')}\x1b[0m
  Total de Classes:  \x1b[32m${updatedClasses.length}\x1b[0m (${updatedClasses.join(', ')})
  Status:            \x1b[36mPronta! A classe estará desbloqueada no próximo carregamento de jogo.\x1b[0m
=======================================================
`);
  } catch (err) {
    console.error('\x1b[31m[ERRO INESPERADO]\x1b[0m', err);
    process.exit(1);
  }
}

run();

