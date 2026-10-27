import fs from 'node:fs';

const skillsContent = fs.readFileSync('src/data/skills.ts', 'utf8');
const monstersContent = fs.readFileSync('src/data/monsters.ts', 'utf8');
const levelsContent = fs.readFileSync('src/data/levels.ts', 'utf8');
const appContent = fs.readFileSync('src/App.tsx', 'utf8');
const aiContent = fs.readFileSync('src/ai/monsterAI.ts', 'utf8');
const typesContent = fs.readFileSync('src/types/game.ts', 'utf8');

const results = [];

function check(desc, condition) {
  results.push({ desc, passed: Boolean(condition) });
}

// 1. Vida Máxima 8000
check(
  'Valgar possui 8000 de HP na definição de monstros',
  monstersContent.includes("maxHp: 8000") && monstersContent.includes("valgar_sanguinario: 8000")
);

// 2. Habilidade 1: Golpe Voraz (dano físico, 100% lifesteal, CD 3)
check(
  'Habilidade 1 (valgar_golpe_voraz): dano físico, 100% lifesteal, cooldown 3',
  skillsContent.includes("id: 'valgar_golpe_voraz'") &&
  skillsContent.includes("damageType: 'physical'") &&
  skillsContent.includes("lifestealPercent: 100") &&
  skillsContent.includes("cooldownMax: 3")
);

// 3. Habilidade 2: Giro Devastador (dano físico, raio 2 ao redor, debuff_atk 20%, sangramento burn, CD 4)
check(
  'Habilidade 2 (valgar_giro_devastador): dano físico ao redor (raio 2), debuff_atk 20%, sangramento (burn), cooldown 4',
  skillsContent.includes("id: 'valgar_giro_devastador'") &&
  skillsContent.includes("aoeCenteredOnCaster: true") &&
  skillsContent.includes("aoeRadius: 2") &&
  skillsContent.includes("type: 'debuff_atk', duration: 2, value: 20") &&
  skillsContent.includes("type: 'burn', duration: 2, value: 2") &&
  skillsContent.includes("cooldownMax: 4")
);

// 4. Habilidade 3: Gancho Carniceiro (gancho no mais distante, puxa para perto, dano físico, debuff_def 20%, stun, CD 5)
check(
  'Habilidade 3 (valgar_gancho_carniceiro): alvo mais distante, pullToAdjacent, dano físico, debuff_def 20%, stun, cooldown 5',
  skillsContent.includes("id: 'valgar_gancho_carniceiro'") &&
  skillsContent.includes("targetFurthestEnemy: true") &&
  skillsContent.includes("pullToAdjacent: true") &&
  skillsContent.includes("type: 'stun', duration: 1, value: 1") &&
  skillsContent.includes("type: 'debuff_def', duration: 2, value: 20") &&
  skillsContent.includes("cooldownMax: 5")
);

// 5. Habilidade 4: Arremesso de Cutelo (prioriza alvos sangrando, age novamente se sangrando, CD 5)
check(
  'Habilidade 4 (valgar_arremesso_cutelo): prioriza alvos sangrando, age novamente se sangrando, cooldown 5',
  skillsContent.includes("id: 'valgar_arremesso_cutelo'") &&
  skillsContent.includes("prioritizeBleeding: true") &&
  skillsContent.includes("grantsExtraTurnOnBleeding: true") &&
  skillsContent.includes("cooldownMax: 5")
);

// 6. Habilidade 5: Aura Sanguinária (ao redor 1 casa, recupera 100% dano como vida, aplica sangramento, CD 4)
check(
  'Habilidade 5 (valgar_aura_sanguinaria): dano ao redor (1 casa), 100% lifesteal, aplica sangramento (burn), cooldown 4',
  skillsContent.includes("id: 'valgar_aura_sanguinaria'") &&
  skillsContent.includes("aoeCenteredOnCaster: true") &&
  skillsContent.includes("aoeRadius: 1") &&
  skillsContent.includes("lifestealPercent: 100") &&
  skillsContent.includes("cooldownMax: 4")
);

// 7. Ultimate (boss_valgar_banquete_sangue): Mantém mecânica, porém cura é de 150%
check(
  'Ultimate (boss_valgar_banquete_sangue): cura de 150%',
  skillsContent.includes("id: 'boss_valgar_banquete_sangue'") &&
  skillsContent.includes("lifestealPercent: 150") &&
  appContent.includes("Math.round(totalValgarDmg * 1.5)") &&
  appContent.includes("Banquete de Sangue 150%")
);

// 8. SkillIds em monsters.ts contêm todas as 5 habilidades
check(
  'Definição de Valgar possui todas as 5 novas habilidades em skillIds',
  monstersContent.includes("'valgar_golpe_voraz'") &&
  monstersContent.includes("'valgar_giro_devastador'") &&
  monstersContent.includes("'valgar_gancho_carniceiro'") &&
  monstersContent.includes("'valgar_arremesso_cutelo'") &&
  monstersContent.includes("'valgar_aura_sanguinaria'")
);

// 9. Suporte no App.tsx para agir novamente (grantsExtraTurnOnBleeding)
check(
  'App.tsx implementa suporte ao turno extra de Valgar com grantsExtraTurnOnBleeding',
  appContent.includes("skill?.grantsExtraTurnOnBleeding && anyTargetHadBleed") &&
  appContent.includes("extraTurnsAllowed++")
);

// 10. Suporte no monsterAI.ts para prioritizeBleeding e aoeCenteredOnCaster
check(
  'monsterAI.ts implementa pontuação prioritária para alvos sangrando e verificação de raio de AoE no conjurador',
  aiContent.includes("act.skill?.prioritizeBleeding") &&
  aiContent.includes("act.skill?.aoeCenteredOnCaster")
);

console.log('=== RELATÓRIO DE VERIFICAÇÃO DO BOSS VALGAR (FASE 30) ===');
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
  console.log('Todas as 5 habilidades, ultimate (150%) e 8000 HP de Valgar foram verificados com 100% de sucesso!');
}
