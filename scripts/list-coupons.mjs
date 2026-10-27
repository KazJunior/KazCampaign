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

if (!dbUrl) {
  console.error('\x1b[31m[ERRO]\x1b[0m Nenhuma URL de banco de dados encontrada (.env).');
  process.exit(1);
}

const filterCode = process.argv[2]?.trim();

async function run() {
  const sql = neon(dbUrl);

  try {
    if (filterCode) {
      // Detalha resgates de um cupom específico
      const couponRows = await sql`
        SELECT id, code, description, reward, max_uses, used_count, expires_at, is_active, created_at
        FROM coupons
        WHERE UPPER(code) = ${filterCode.toUpperCase()}
        LIMIT 1
      `;

      if (couponRows.length === 0) {
        console.error(`\x1b[31m[ERRO]\x1b[0m Cupom "${filterCode}" não encontrado.`);
        process.exit(1);
      }

      const c = couponRows[0];
      const redemptions = await sql`
        SELECT cr.id, cr.redeemed_at, cr.reward_applied, u.username, u.id as user_id
        FROM coupon_redemptions cr
        JOIN users u ON u.id = cr.user_id
        WHERE cr.coupon_id = ${c.id}
        ORDER BY cr.redeemed_at DESC
      `;

      console.log(`
=======================================================
\x1b[1m\x1b[33mDETALHES DO CUPOM:\x1b[0m  \x1b[1m\x1b[32m${c.code}\x1b[0m
=======================================================
  Descrição:    ${c.description || '-'}
  Recompensa:   ${JSON.stringify(c.reward)}
  Resgates:     ${c.used_count} ${c.max_uses ? `/ ${c.max_uses}` : '(sem limite global)'}
  Status:       ${c.is_active ? '\x1b[32mAtivo\x1b[0m' : '\x1b[31mInativo\x1b[0m'}
  Criado em:    ${new Date(c.created_at).toLocaleString('pt-BR')}

\x1b[1mJOGADORES QUE RESGATARAM (${redemptions.length}):\x1b[0m
-------------------------------------------------------`);

      if (redemptions.length === 0) {
        console.log('  Nenhum jogador resgatou este cupom ainda.');
      } else {
        for (const r of redemptions) {
          console.log(`  - \x1b[1m${r.username}\x1b[0m (ID: ${r.user_id}) em ${new Date(r.redeemed_at).toLocaleString('pt-BR')}`);
        }
      }
      console.log('=======================================================\n');
      return;
    }

    // Lista geral de cupons
    const rows = await sql`
      SELECT c.id, c.code, c.description, c.reward, c.max_uses, c.used_count, c.expires_at, c.is_active, c.created_at,
             COUNT(cr.id)::int as total_redemptions
      FROM coupons c
      LEFT JOIN coupon_redemptions cr ON cr.coupon_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;

    console.log(`
\x1b[1m\x1b[36m[KazCampaign - Lista de Cupons Promocionais]\x1b[0m
Total de cupons cadastrados: \x1b[1m${rows.length}\x1b[0m
========================================================================================`);

    if (rows.length === 0) {
      console.log('  Nenhum cupom cadastrado ainda.');
      console.log('  Crie um com: \x1b[32mnpm run create-coupon <CODIGO> <RECOMPENSA>\x1b[0m\n');
      return;
    }

    for (const c of rows) {
      const isExpired = c.expires_at && new Date(c.expires_at).getTime() < Date.now();
      const isFull = c.max_uses && c.used_count >= c.max_uses;

      let statusBadge = '\x1b[32mATIVO\x1b[0m';
      if (!c.is_active) statusBadge = '\x1b[31mDESATIVADO\x1b[0m';
      else if (isExpired) statusBadge = '\x1b[33mEXPIRADO\x1b[0m';
      else if (isFull) statusBadge = '\x1b[35mESGOTADO\x1b[0m';

      let rewardText = '';
      if (c.reward?.gold) rewardText += `${c.reward.gold.toLocaleString('pt-BR')} Ouro `;
      if (c.reward?.eggRarity) rewardText += `+ ${c.reward.eggCount || 1}x Ovo (${c.reward.eggRarity}) `;
      if (c.reward?.randomGoldClass) rewardText += `+ 1x Classe Liberada com Ouro Aleatória `;

      console.log(`
  \x1b[1m\x1b[33m[${c.code}]\x1b[0m - Status: ${statusBadge}
  Recompensa:     \x1b[1m${rewardText || JSON.stringify(c.reward)}\x1b[0m
  Resgates:       ${c.used_count} ${c.max_uses ? `/ ${c.max_uses}` : '(sem limite global)'} (1x por usuário)
  Descrição:      ${c.description || '-'}
  Criado em:      ${new Date(c.created_at).toLocaleString('pt-BR')}
  Detalhes:       node scripts/list-coupons.mjs ${c.code}`);
    }

    console.log(`========================================================================================\n`);
  } catch (err) {
    console.error('\x1b[31m[ERRO INESPERADO]\x1b[0m', err);
    process.exit(1);
  }
}

run();
