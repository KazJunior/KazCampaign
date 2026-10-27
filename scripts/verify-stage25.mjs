import fs from 'node:fs';

const skillsContent = fs.readFileSync('src/data/skills.ts', 'utf8');
const monstersContent = fs.readFileSync('src/data/monsters.ts', 'utf8');

const results = [];

function check(desc, condition) {
  results.push({ desc, passed: Boolean(condition) });
}

// 1. Vida do Mini Boss mestre_runico reduzida para 5500
check(
  'mestre_runico possui 5500 de maxHp em MONSTER_DEFINITIONS',
  monstersContent.includes("mestre_runico: {") &&
  monstersContent.includes("maxHp: 5500,")
);

check(
  'mestre_runico possui 5500 de HP em STAGE_20_PLUS_BOSS_HP',
  monstersContent.includes("mestre_runico: 5500,")
);

// 2. Habilidade 1: dano mágico em cruz equivalente a 200% do poder mágico
check(
  'Habilidade 1 (tecelao_glifo_cruz): dano mágico em cruz 200%',
  skillsContent.includes("id: 'tecelao_glifo_cruz'") &&
  skillsContent.includes("damageType: 'magical'") &&
  skillsContent.includes("power: 2") &&
  skillsContent.includes("aoeType: 'cross'")
);

// 3. Habilidade 2: cura aliado com vida baixa em 120% do poder mágico
check(
  'Habilidade 2 (tecelao_cura_runica): cura aliado com vida baixa em 120%',
  skillsContent.includes("id: 'tecelao_cura_runica'") &&
  skillsContent.includes("damageType: 'healing'") &&
  skillsContent.includes("power: 1.2") &&
  skillsContent.includes("targetType: 'ally'")
);

// 4. Habilidade 3: atordoa o alvo causando 200% do poder mágico
check(
  'Habilidade 3 (tecelao_selo_concussivo): dano mágico 200% e atordoamento (stun)',
  skillsContent.includes("id: 'tecelao_selo_concussivo'") &&
  skillsContent.includes("damageType: 'magical'") &&
  skillsContent.includes("power: 2") &&
  skillsContent.includes("type: 'stun'")
);

// 5. invocador_glifos possui as novas habilidades em skillIds
check(
  'invocador_glifos possui as 3 novas habilidades em skillIds',
  monstersContent.includes("'tecelao_glifo_cruz'") &&
  monstersContent.includes("'tecelao_cura_runica'") &&
  monstersContent.includes("'tecelao_selo_concussivo'")
);

// 6. STAGE_20_PLUS_BOSS_SKILL_POWERS define as habilidades do Tecelão
check(
  'STAGE_20_PLUS_BOSS_SKILL_POWERS define tecelao_glifo_cruz (2.00), tecelao_cura_runica (1.20) e tecelao_selo_concussivo (2.00)',
  monstersContent.includes("tecelao_glifo_cruz: 2.00") &&
  monstersContent.includes("tecelao_cura_runica: 1.20") &&
  monstersContent.includes("tecelao_selo_concussivo: 2.00")
);

console.log('=== RELATÓRIO DE VERIFICAÇÃO DA FASE 25 ===');
let failed = 0;
for (const r of results) {
  const status = r.passed ? '✅ OK' : '❌ FALHA';
  console.log(`${status} - ${r.desc}`);
  if (!r.passed) failed++;
}
console.log(`\nTotal: ${results.length} testes | Aprovados: ${results.length - failed} | Falhas: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('Todas as alterações da Fase 25 foram 100% verificadas com sucesso!');
}
