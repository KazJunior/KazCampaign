import { getAuthUser, getSql, json, readJson } from './_lib.js';

interface PetEgg {
  id: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  acquiredAt: number;
  incubatingStartedAt: number | null;
  hatchDurationMs: number;
}

const HATCH_DURATIONS: Record<string, number> = {
  common: 1 * 60 * 60 * 1000,
  uncommon: 2 * 60 * 60 * 1000,
  rare: 3 * 60 * 60 * 1000,
  epic: 5 * 60 * 60 * 1000,
  legendary: 8 * 60 * 60 * 1000,
};

function createEgg(rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'): PetEgg {
  return {
    id: `egg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    rarity,
    acquiredAt: Date.now(),
    incubatingStartedAt: null,
    hatchDurationMs: HATCH_DURATIONS[rarity] || HATCH_DURATIONS.common,
  };
}

let couponsSchemaEnsured = false;
async function ensureCouponsSchema(sql: ReturnType<typeof getSql>): Promise<void> {
  if (couponsSchemaEnsured) return;
  try {
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
    couponsSchemaEnsured = true;
  } catch (e) {
    console.warn('ensureCouponsSchema warning:', e);
  }
}

export async function POST(req: Request): Promise<Response> {
  const auth = getAuthUser(req);
  if (!auth) {
    return json({ error: 'Você precisa estar conectado à sua conta para resgatar cupons.' }, 401);
  }

  const body = await readJson(req);
  const rawCode = typeof body?.code === 'string' ? body.code.trim() : '';

  if (!rawCode) {
    return json({ error: 'Por favor, informe o código do cupom.' }, 400);
  }

  const normalizedCode = rawCode.toUpperCase();

  try {
    const sql = getSql();
    await ensureCouponsSchema(sql);

    // 1. Busca o cupom pelo código
    const couponRows = await sql`
      SELECT id, code, description, reward, max_uses, used_count, expires_at, is_active
      FROM coupons
      WHERE UPPER(code) = ${normalizedCode}
      LIMIT 1
    `;

    if (!couponRows || couponRows.length === 0) {
      return json({ error: 'Cupom inválido ou inexistente.' }, 404);
    }

    const coupon = couponRows[0];

    // 2. Validações de ativação e expiração
    if (!coupon.is_active) {
      return json({ error: 'Este cupom foi desativado.' }, 400);
    }

    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
      return json({ error: 'Este cupom já expirou.' }, 400);
    }

    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return json({ error: 'Este cupom atingiu o limite máximo de resgates globais.' }, 400);
    }

    // 3. Validação de uso único por usuário
    const previousRedemptions = await sql`
      SELECT id, redeemed_at
      FROM coupon_redemptions
      WHERE coupon_id = ${coupon.id} AND user_id = ${auth.uid}
      LIMIT 1
    `;

    if (previousRedemptions && previousRedemptions.length > 0) {
      return json(
        { error: 'Você já resgatou este cupom anteriormente! Cada jogador só pode resgatá-lo uma única vez.' },
        400
      );
    }

    // 4. Determina e calcula as recompensas
    const rewardConfig = (typeof coupon.reward === 'object' && coupon.reward !== null ? coupon.reward : {}) as {
      gold?: number;
      eggs?: ('common' | 'uncommon' | 'rare' | 'epic' | 'legendary')[];
      eggCount?: number;
      eggRarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    };

    const goldBonus = typeof rewardConfig.gold === 'number' && rewardConfig.gold > 0 ? Math.floor(rewardConfig.gold) : 0;
    const eggsToGrant: PetEgg[] = [];

    if (Array.isArray(rewardConfig.eggs)) {
      for (const r of rewardConfig.eggs) {
        if (['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(r)) {
          eggsToGrant.push(createEgg(r));
        }
      }
    } else if (rewardConfig.eggRarity && ['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(rewardConfig.eggRarity)) {
      const count = Math.min(20, Math.max(1, rewardConfig.eggCount || 1));
      for (let i = 0; i < count; i++) {
        eggsToGrant.push(createEgg(rewardConfig.eggRarity));
      }
    }

    // 5. Atualiza o progresso do jogador
    const progressRows = await sql`
      SELECT gold, pet_eggs, COALESCE(pending_gold, 0) as pending_gold
      FROM player_progress
      WHERE user_id = ${auth.uid}
      LIMIT 1
    `;

    let currentGold = 0;
    let existingEggs: PetEgg[] = [];

    if (progressRows.length > 0) {
      currentGold = Number(progressRows[0].gold) || 0;
      if (Array.isArray(progressRows[0].pet_eggs)) {
        existingEggs = progressRows[0].pet_eggs;
      }
    }

    const newGold = currentGold + goldBonus;
    const newEggs = [...existingEggs, ...eggsToGrant];
    const newEggsJson = JSON.stringify(newEggs);

    if (progressRows.length === 0) {
      await sql`
        INSERT INTO player_progress (user_id, gold, pending_gold, pet_eggs, updated_at)
        VALUES (${auth.uid}, ${newGold}, 0, ${newEggsJson}::jsonb, NOW())
      `;
    } else {
      await sql`
        UPDATE player_progress
        SET gold = ${newGold},
            pet_eggs = ${newEggsJson}::jsonb,
            updated_at = NOW()
        WHERE user_id = ${auth.uid}
      `;
    }

    // 6. Registra o resgate na tabela de auditoria (impede novo resgate do mesmo usuário)
    const appliedReward = {
      gold: goldBonus,
      eggs: eggsToGrant.map((e) => ({ id: e.id, rarity: e.rarity })),
    };

    await sql`
      INSERT INTO coupon_redemptions (coupon_id, user_id, reward_applied, redeemed_at)
      VALUES (${coupon.id}, ${auth.uid}, ${JSON.stringify(appliedReward)}::jsonb, NOW())
    `;

    // 7. Incrementa o contador de utilizações do cupom
    await sql`
      UPDATE coupons
      SET used_count = used_count + 1
      WHERE id = ${coupon.id}
    `;

    return json({
      ok: true,
      message: `Cupom "${coupon.code}" resgatado com sucesso!`,
      coupon: {
        code: coupon.code,
        description: coupon.description,
      },
      reward: appliedReward,
      newGold,
      newEggs,
    });
  } catch (err) {
    console.error('POST /api/redeem-coupon error:', err);
    return json({ error: 'Erro ao processar o resgate do cupom. Tente novamente mais tarde.' }, 500);
  }
}
