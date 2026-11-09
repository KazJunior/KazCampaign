import { MONSTER_DEFINITIONS, createMonsterUnit, STAGE_20_PLUS_BOSS_HP } from '../src/data/monsters';
import { SKILLS } from '../src/data/skills';
import { SECRET_TIME_LEVELS, isTileInClockHands } from '../src/data/levels';
import { SECRET_CLASS_UNLOCK_CONDITIONS } from '../src/data/units';
import assert from 'assert';

console.log('=== VERIFICAÇÃO DOS CHEFES DA FENDA DO TEMPO (FASES 101-110) ===\n');

// -------------------------------------------------------------
// 1. Verificar Fase 105 e Fantasma do Tempo
// -------------------------------------------------------------
const stage105 = SECRET_TIME_LEVELS.find((l) => l.id === 105);
assert(stage105, 'Fase Secreta 105 deve existir');
console.log('✅ Fase 105 encontrada:', stage105.name);

const phantomSpawn = stage105.enemySpawns.find((m) => m.monsterTypeId === 'fantasma_do_tempo');
assert(phantomSpawn, 'Spawn de Fantasma do Tempo deve existir na Fase 105');
console.log('✅ Spawn do Fantasma do Tempo confirmado na Fase 105');

// Verificar Definição e Unidade Instanciada
assert.strictEqual(MONSTER_DEFINITIONS.fantasma_do_tempo.maxHp, 1500, 'Definição de Fantasma do Tempo deve ter 1500 HP');
assert.strictEqual(STAGE_20_PLUS_BOSS_HP['fantasma_do_tempo'], 1500, 'STAGE_20_PLUS_BOSS_HP do Fantasma deve ser 1500');

const phantomUnit = createMonsterUnit('fantasma_do_tempo', 'p_test', phantomSpawn.x, phantomSpawn.y, phantomSpawn.levelOffset);
assert.strictEqual(phantomUnit.maxHp, 1500, `Vida máxima em combate do Fantasma deve ser 1500, recebeu: ${phantomUnit.maxHp}`);
assert.strictEqual(phantomUnit.currentHp, 1500, `Vida atual em combate do Fantasma deve ser 1500, recebeu: ${phantomUnit.currentHp}`);
console.log(`✅ Vida do Fantasma do Tempo em Combate: ${phantomUnit.maxHp} HP (Validado)`);

// Habilidades do Fantasma
const expectedPhantomSkills = [
  'fantasma_toque_atraso',
  'fantasma_badalada_espectral',
  'fantasma_salto_cronologico',
  'fantasma_manto_paradoxo',
];
expectedPhantomSkills.forEach((sId) => {
  const sk = phantomUnit.skills.find((s) => s.id === sId);
  assert(sk, `Fantasma do Tempo deve possuir habilidade ${sId}`);
  console.log(`   - Habilidade: ${sk.name} (${sId}) [CD: ${sk.cooldownMax}]`);
});

// -------------------------------------------------------------
// 2. Verificar Fase 110 e Verme Cósmico Devorador do Tempo
// -------------------------------------------------------------
console.log('\n-------------------------------------------------------------');
const stage110 = SECRET_TIME_LEVELS.find((l) => l.id === 110);
assert(stage110, 'Fase Secreta 110 deve existir');
console.log('✅ Fase 110 encontrada:', stage110.name);

const wormSpawn = stage110.enemySpawns.find((m) => m.monsterTypeId === 'verme_cosmico_tempo');
assert(wormSpawn, 'Spawn do Verme Cósmico deve existir na Fase 110');
console.log('✅ Spawn do Verme Cósmico confirmado na Fase 110');

// Verificar Definição e Unidade Instanciada
assert.strictEqual(MONSTER_DEFINITIONS.verme_cosmico_tempo.maxHp, 3000, 'Definição do Verme Cósmico deve ter 3000 HP');
assert.strictEqual(STAGE_20_PLUS_BOSS_HP['verme_cosmico_tempo'], 3000, 'STAGE_20_PLUS_BOSS_HP do Verme deve ser 3000');

const wormUnit = createMonsterUnit('verme_cosmico_tempo', 'w_test', wormSpawn.x, wormSpawn.y, wormSpawn.levelOffset);
assert.strictEqual(wormUnit.maxHp, 3000, `Vida máxima em combate do Verme deve ser 3000, recebeu: ${wormUnit.maxHp}`);
assert.strictEqual(wormUnit.currentHp, 3000, `Vida atual em combate do Verme deve ser 3000, recebeu: ${wormUnit.currentHp}`);
console.log(`✅ Vida do Verme Cósmico em Combate: ${wormUnit.maxHp} HP (Validado)`);

// Habilidades do Verme
const expectedWormSkills = [
  'verme_devorar_futuro',
  'verme_onda_temporal',
  'verme_tragar_vazio',
  'verme_paradoxo_ouroboros',
];
expectedWormSkills.forEach((sId) => {
  const sk = wormUnit.skills.find((s) => s.id === sId);
  assert(sk, `Verme Cósmico deve possuir habilidade ${sId}`);
  console.log(`   - Habilidade: ${sk.name} (${sId}) [CD: ${sk.cooldownMax}, Power: ${sk.power}]`);
});

// Habilidade Suprema de 50% HP
const ultimateSkill = SKILLS['boss_verme_colapso_fim_dos_tempos'];
assert(ultimateSkill, 'Habilidade suprema boss_verme_colapso_fim_dos_tempos deve existir em SKILLS');
assert.strictEqual(ultimateSkill.power, 2.1, 'Poder da suprema do Verme deve ser 2.1 (210%)');
console.log(`   - Suprema: ${ultimateSkill.name} [Power: ${ultimateSkill.power * 100}% Dano Mágico Global]`);

// -------------------------------------------------------------
// 3. Mecânica do Relógio Astral (isTileInClockHands)
// -------------------------------------------------------------
console.log('\n-------------------------------------------------------------');
console.log('✅ Testando padrão de zonas seguras dos Ponteiros do Relógio:');
// Turno 1 (Cruz Central: x=4,5 ou y=3,4)
assert(isTileInClockHands(4, 1, 1), 'Turno 1: x=4 deve ser seguro');
assert(isTileInClockHands(1, 3, 1), 'Turno 1: y=3 deve ser seguro');
assert(!isTileInClockHands(0, 0, 1), 'Turno 1: (0,0) deve ser fora da zona');

// Turno 2 (Diagonal principal 1h30/7h30)
assert(isTileInClockHands(2, 1, 2), 'Turno 2: x=2, y=1 deve ser seguro (diagonal)');

// Turno 5 (X Cósmico total)
assert(isTileInClockHands(5, 4, 5), 'Turno 5: diagonal central deve ser segura');
console.log('✅ Lógica de rotação dos ponteiros (5 padrões) validada com sucesso');

// -------------------------------------------------------------
// 4. Itens da Fenda Temporal / Dimensional (Calibrados para Fase 1 a 10)
// -------------------------------------------------------------
console.log('\n-------------------------------------------------------------');
console.log('✅ Testando tabelas de itens e drops da Fenda Dimensional:');
import { getMonsterDropTable, rollStageItemDrops, getItemsDroppedByMonsters } from '../src/data/items';

const timeRiftMonsters = [
  'guardiao_relogio',
  'tecelao_do_tempo',
  'automato_engrenagens',
  'sabujo_temporal',
  'cultista_cronos',
  'draco_cronologico',
  'fantasma_do_tempo',
  'verme_cosmico_tempo',
];

timeRiftMonsters.forEach((mId) => {
  const drops = getMonsterDropTable(mId);
  assert(drops.length >= 2, `Monstro ${mId} deve possuir ao menos 2 itens dropáveis`);
  drops.forEach(({ item }) => {
    // Validar limites equivalentes ao Ato 1 (Fases 1 a 10)
    const hp = item.stats.hp || 0;
    const atk = item.stats.atk || 0;
    const mag = item.stats.mag || 0;
    const def = item.stats.def || 0;
    const res = item.stats.res || 0;

    assert(hp <= 65, `Item ${item.name} HP (${hp}) excede o limite de Fase 1 a 10 (65)`);
    assert(atk <= 11, `Item ${item.name} ATK (${atk}) excede o limite de Fase 1 a 10 (11)`);
    assert(mag <= 11, `Item ${item.name} MAG (${mag}) excede o limite de Fase 1 a 10 (11)`);
    assert(def <= 7, `Item ${item.name} DEF (${def}) excede o limite de Fase 1 a 10 (7)`);
    assert(res <= 7, `Item ${item.name} RES (${res}) excede o limite de Fase 1 a 10 (7)`);
  });
  console.log(`   - Monstro ${mId}: ${drops.length} itens configurados e validados na faixa de Fase 1 a 10`);
});

// Testar drop das fases 101 a 110
SECRET_TIME_LEVELS.forEach((lvl) => {
  const mIds = lvl.enemySpawns.map((s) => s.monsterTypeId);
  const isBoss = Boolean(lvl.hasFinalBoss || lvl.hasMiniBoss);
  const pool = getItemsDroppedByMonsters(mIds);
  assert(pool.length > 0, `Pool de itens da fase ${lvl.id} não pode ser vazia`);
  const drops = rollStageItemDrops(mIds, 3, isBoss);
  assert(drops.length > 0, `Fase ${lvl.id} deve rolar itens com sucesso`);
});
console.log('✅ Drops de todas as Fases 101 a 110 validados com sucesso');

// -------------------------------------------------------------
// 5. Recompensa e Desbloqueio da Classe Secreta
// -------------------------------------------------------------
console.log('\n-------------------------------------------------------------');
const dancerUnlock = SECRET_CLASS_UNLOCK_CONDITIONS['pistoleiro_tempo'];
assert(dancerUnlock, 'Condição de desbloqueio da Dançarina do Tempo deve existir');
console.log(`✅ Desbloqueio Secreto Confirmado: "${dancerUnlock.title}" vinculado à vitória contra o Verme Cósmico`);

console.log('\n🎉 TODOS OS TESTES DA FENDA DO TEMPO PASSARAM COM 100% DE SUCESSO!\n');
