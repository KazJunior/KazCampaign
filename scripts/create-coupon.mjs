#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
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

if (!dbUrl) {
  console.error('\x1b[31m[ERRO]\x1b[0m Nenhuma URL de banco de dados encontrada (.env).');
  process.exit(1);
}

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
\x1b[1m\x1b[36m[KazCampaign - Gerador de Cupons Promocionais]\x1b[0m

Uso:
  npm run create-coupon <CODIGO> <RECOMPENSA> [OPÇÕES]
  node scripts/create-coupon.mjs <CODIGO> <RECOMPENSA> [OPÇÕES]

Exemplos de Códigos:
  npm run create-coupon KAZ2026 25000
    -> Cria o cupom KAZ2026 que dá 25.000 de ouro (cada jogador pode resgatar 1 vez).

  npm run create-coupon PROMO gold=15000 egg=legendary
    -> Cria cupom com 15.000 de ouro e 1 ovo de pet lendário.

  npm run create-coupon VIP-SPECIAL 50000 --max-uses=1
    -> Cria cupom de USO ÚNICO GLOBAL (apenas o primeiro jogador que resgatar recebe).

  npm run create-coupon random 20000 --desc="Presente da live"
    -> Gera um código aleatório no formato KAZ-XXXX-XXXX com 20.000 de ouro.

Opções Disponíveis:
  --max-uses=N       Limite máximo global de resgates (padrão: ilimitado, cada jogador pega 1x)
  --desc="Texto"     Descrição ou anotação sobre a finalidade do cupom
  --expires="DATA"   Data de expiração (Ex: "2026-12-31" ou "2026-11-01T23:59:59Z")
  --egg=RARIDADE     Ovo de mascote (common, uncommon, rare, epic, legendary)
  --eggs=N           Quantidade de ovos (padrão: 1)
`);
  process.exit(0);
}

let rawCode = args[0]?.trim();
let gold = 0;
let eggRarity = null;
let eggCount = 1;
let randomGoldClass = false;
let maxUses = null;
let description = '';
let expiresAt = null;

if (!rawCode || rawCode.toLowerCase() === 'random') {
  const bytes = crypto.randomBytes(4).toString('hex').toUpperCase();
  rawCode = `KAZ-${bytes.slice(0, 4)}-${bytes.slice(4, 8)}`;
}

const code = rawCode.toUpperCase();

// Processa demais argumentos
for (let i = 1; i < args.length; i++) {
  const arg = args[i].trim();
  const lowerArg = arg.toLowerCase();

  // Verifica se é classe de ouro aleatória
  if (
    lowerArg === 'random-gold-class' ||
    lowerArg === 'classe-ouro' ||
    lowerArg === 'classe-aleatoria' ||
    lowerArg === 'gold-class' ||
    lowerArg === 'class=random_gold' ||
    lowerArg === 'class=random-gold' ||
    lowerArg === '--class=random_gold' ||
    lowerArg === '--class=random-gold' ||
    lowerArg === '--random-gold-class'
  ) {
    randomGoldClass = true;
    continue;
  }

  // Verifica se é um número puro de ouro
  if (/^\d+$/.test(arg)) {
    gold = parseInt(arg, 10);
    continue;
  }

  if (arg.startsWith('--max-uses=') || arg.startsWith('max-uses=')) {
    const val = arg.split('=')[1];
    maxUses = parseInt(val, 10);
  } else if (arg.startsWith('--desc=') || arg.startsWith('desc=')) {
    description = arg.replace(/^--?desc=/, '').replace(/^["'\\]+|["'\\]+$/g, '');
  } else if (arg.startsWith('--expires=') || arg.startsWith('expires=')) {
    const val = arg.replace(/^--?expires=/, '').replace(/^["'\\]+|["'\\]+$/g, '');
    expiresAt = new Date(val).toISOString();
  } else if (arg.startsWith('gold=')) {
    gold = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('egg=') || arg.startsWith('--egg=')) {
    eggRarity = arg.split('=')[1].toLowerCase();
  } else if (arg.startsWith('eggs=') || arg.startsWith('--eggs=')) {
    eggCount = parseInt(arg.split('=')[1], 10);
  }
}

if (gold === 0 && !eggRarity && !randomGoldClass) {
  console.error('\x1b[31m[ERRO]\x1b[0m O cupom precisa conceder ao menos uma recompensa (ex: ouro, ovo ou classe-ouro).');
  process.exit(1);
}

const reward = {};
if (gold > 0) reward.gold = gold;
if (eggRarity) {
  reward.eggRarity = eggRarity;
  reward.eggCount = eggCount;
}
if (randomGoldClass) {
  reward.randomGoldClass = true;
}

async function run() {
  const sql = neon(dbUrl);

  try {
    // Garante schema
    await sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(64) UNIQUE NOT NULL,
        description TEXT,
        reward JSONB NOT NULL,
        max_uses INTEGER DEFAULT NULL,
        used_count INTEGER NOT NULL DEFAULT 0,
        expires_at TIMESTAMPTZ DEFAULT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS coupon_redemptions (
        id SERIAL PRIMARY KEY,
        coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reward_applied JSONB NOT NULL,
        CONSTRAINT unique_coupon_user UNIQUE(coupon_id, user_id)
      );
    `;

    const existing = await sql`
      SELECT id, code FROM coupons WHERE UPPER(code) = ${code} LIMIT 1
    `;

    if (existing && existing.length > 0) {
      console.error(`\x1b[31m[ERRO]\x1b[0m Já existe um cupom cadastrado com o código "${code}". Escolha outro código.`);
      process.exit(1);
    }

    const inserted = await sql`
      INSERT INTO coupons (code, description, reward, max_uses, used_count, expires_at, is_active, created_at)
      VALUES (
        ${code},
        ${description || null},
        ${JSON.stringify(reward)}::jsonb,
        ${maxUses},
        0,
        ${expiresAt},
        true,
        NOW()
      )
      RETURNING id, code, reward, max_uses, expires_at, created_at
    `;

    const c = inserted[0];

    console.log(`
\x1b[32m✔ CUPOM CRIADO COM SUCESSO!\x1b[0m

=======================================================
\x1b[1m\x1b[33mCÓDIGO DE RESGATE:\x1b[0m  \x1b[1m\x1b[32m${c.code}\x1b[0m
=======================================================
  ID do Cupom:       ${c.id}
  Recompensa:        ${gold > 0 ? `\x1b[33m+${gold.toLocaleString('pt-BR')} de Ouro\x1b[0m ` : ''}${eggRarity ? `\x1b[35m+${eggCount}x Ovo (${eggRarity})\x1b[0m ` : ''}${randomGoldClass ? '\x1b[35m+1x Classe Liberada com Ouro Aleatória (Paladino, Lanceiro, Bardo, etc.)\x1b[0m' : ''}
  Uso por Jogador:   \x1b[36m1 ÚNICA VEZ por conta\x1b[0m (garantido pelo banco)
  Limite Global:     ${c.max_uses ? `${c.max_uses} resgates no total` : 'Ilimitado (qualquer jogador pode pegar)'}
  Expira em:         ${c.expires_at ? new Date(c.expires_at).toLocaleString('pt-BR') : 'Sem prazo de expiração'}
  Descrição:         ${description || 'Nenhuma'}
=======================================================

Compartilhe com os jogadores:
  \x1b[1m"Resgate o código \x1b[32m${c.code}\x1b[0m\x1b[1m no menu de Cupons do KazCampaign!"\x1b[0m
`);
  } catch (err) {
    console.error('\x1b[31m[ERRO INESPERADO]\x1b[0m', err);
    process.exit(1);
  }
}

run();
