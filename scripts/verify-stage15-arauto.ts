import { MONSTER_DEFINITIONS, createMonsterUnit } from '../src/data/monsters';
import { SKILLS } from '../src/data/skills';
import { LEVELS } from '../src/data/levels';
import { calculateBaseDamage } from '../src/utils/damage';
import assert from 'assert';

console.log('--- TESTANDO ARAUTO DOS ESPECTROS (FASE 15) ---');

// 1. Verificar Fase 15
const stage15 = LEVELS.find((l) => l.id === 15);
assert(stage15, 'Fase 15 encontrada');
console.log('✅ Fase 15 encontrada:', stage15.name);

// 2. Verificar spawn do Arauto dos Espectros na Fase 15
const bossSpawn = stage15.enemySpawns.find((m) => m.monsterTypeId === 'arauto_espectral');
assert(bossSpawn, 'Spawn de Arauto dos Espectros encontrado na Fase 15');
console.log('✅ Spawn do Boss:', bossSpawn);

// 3. Criar a unidade do boss com o levelOffset da fase (14)
const bossUnit = createMonsterUnit('arauto_espectral', 'test_arauto_1', bossSpawn.x, bossSpawn.y, bossSpawn.levelOffset);
assert.strictEqual(bossUnit.maxHp, 3000, `Vida do Boss deve ser 3000, recebeu: ${bossUnit.maxHp}`);
assert.strictEqual(bossUnit.currentHp, 3000, `Vida atual deve ser 3000, recebeu: ${bossUnit.currentHp}`);
console.log(`✅ Vida Máxima do Boss na Fase 15: ${bossUnit.maxHp} HP`);

// 4. Verificar as 5 habilidades
const expectedSkillIds = [
  'arauto_manto_espectral',
  'arauto_corte_ceifador',
  'arauto_giro_foice',
  'arauto_passo_sombrio',
  'arauto_arremesso_foice',
];

assert.strictEqual(bossUnit.skills.length, 5, 'Deve ter exatamente 5 habilidades');
expectedSkillIds.forEach((sId, idx) => {
  const sk = bossUnit.skills.find((s) => s.id === sId);
  assert(sk, `Habilidade ${sId} deve estar presente no boss`);
  console.log(`✅ Habilidade ${idx + 1} (${sk.name}): Cooldown ${sk.cooldownMax}, Power ${sk.power}`);
});

// 5. Verificar Habilidade 1: Manto Espectral
const h1 = SKILLS['arauto_manto_espectral'];
assert.strictEqual(h1.cooldownMax, 4, 'Habilidade 1 cooldown deve ser 4');
assert.strictEqual(h1.targetType, 'self', 'Habilidade 1 alvo deve ser self');
assert.strictEqual(h1.statusEffect?.type, 'invisible', 'Habilidade 1 deve conceder status invisível');
assert.strictEqual(h1.statusEffect?.value, 30, 'Habilidade 1 deve conceder 30% bônus dano');
console.log('✅ Habilidade 1: Manto Espectral validada com sucesso');

// 6. Verificar Habilidade 2: Corte do Ceifador
const h2 = SKILLS['arauto_corte_ceifador'];
assert.strictEqual(h2.cooldownMax, 3, 'Habilidade 2 cooldown deve ser 3');
assert.strictEqual(h2.damageType, 'magical', 'Habilidade 2 tipo de dano mágico');
assert.strictEqual(h2.lifestealPercent, 100, 'Habilidade 2 cura 100% do dano');
console.log('✅ Habilidade 2: Corte do Ceifador validada com sucesso');

// 7. Verificar Habilidade 3: Giro da Foice Espectral
const h3 = SKILLS['arauto_giro_foice'];
assert.strictEqual(h3.cooldownMax, 3, 'Habilidade 3 cooldown deve ser 3');
assert.strictEqual(h3.damageType, 'magical', 'Habilidade 3 tipo de dano mágico');
assert.strictEqual(h3.aoeRadius, 2, 'Habilidade 3 raio de até 2 casas');
assert.strictEqual(h3.aoeCenteredOnCaster, true, 'Habilidade 3 centrada no conjurador');
console.log('✅ Habilidade 3: Giro da Foice Espectral validada com sucesso');

// 8. Verificar Habilidade 4: Passo do Ceifador
const h4 = SKILLS['arauto_passo_sombrio'];
assert.strictEqual(h4.cooldownMax, 5, 'Habilidade 4 cooldown deve ser 5');
assert.strictEqual(h4.teleportToTarget, true, 'Habilidade 4 teleporta para o alvo');
assert.strictEqual(h4.targetLowestHpTotal, true, 'Habilidade 4 prioriza alvo com menor vida total');
assert.strictEqual(h4.casterStatusEffect?.type, 'invisible', 'Habilidade 4 fica invisível depois de atacar');
console.log('✅ Habilidade 4: Passo do Ceifador validada com sucesso');

// 9. Verificar Habilidade 5: Arremesso de Foice Giratória
const h5 = SKILLS['arauto_arremesso_foice'];
assert.strictEqual(h5.cooldownMax, 3, 'Habilidade 5 cooldown deve ser 3');
assert.strictEqual(h5.damageType, 'magical', 'Habilidade 5 tipo de dano mágico');
assert.strictEqual(h5.rangeMax, 4, 'Habilidade 5 alcance de 4');
assert.strictEqual(h5.isLinePierce, true, 'Habilidade 5 dano em linha');
console.log('✅ Habilidade 5: Arremesso de Foice Giratória validada com sucesso');

// 10. Testar cálculo de dano com e sem invisibilidade (+30% bonus)
const dummyTarget: any = {
  id: 'hero_1',
  name: 'Guerreiro',
  className: 'guerreiro',
  currentHp: 1000,
  maxHp: 1000,
  atk: 30,
  mag: 10,
  def: 20,
  res: 20,
  mov: 3,
  range: 1,
  skills: [],
  isDead: false,
  faction: 'player',
  x: 4,
  y: 2,
};

const baseDmgResult = calculateBaseDamage(bossUnit, dummyTarget, h2);
const bossWithInvis = {
  ...bossUnit,
  statusEffects: [{ type: 'invisible' as const, duration: 99, value: 30, appliedTurn: 1 }],
};
const stealthDmgResult = calculateBaseDamage(bossWithInvis, dummyTarget, h2);
console.log(`Dano normal (Corte): ${baseDmgResult.base} | Dano com Manto Espectral (+30%): ${stealthDmgResult.base}`);
assert(stealthDmgResult.base > baseDmgResult.base, 'Dano com manto espectral deve ser maior que dano normal');
const ratio = stealthDmgResult.base / baseDmgResult.base;
console.log(`Multiplicador efetivo: ${(ratio * 100).toFixed(1)}%`);
assert(ratio >= 1.25, 'Bônus de dano deve refletir os ~30% configurados');

console.log('\n🎉 TODOS OS 10 TESTES PASSARAM COM SUCESSO!');
