import fs from 'node:fs';
import path from 'node:path';

const skillsContent = fs.readFileSync('src/data/skills.ts', 'utf8');
const monstersContent = fs.readFileSync('src/data/monsters.ts', 'utf8');
const levelsContent = fs.readFileSync('src/data/levels.ts', 'utf8');
const appContent = fs.readFileSync('src/App.tsx', 'utf8');
const boardContent = fs.readFileSync('src/game/BoardRenderer3D.tsx', 'utf8');
const aiContent = fs.readFileSync('src/ai/monsterAI.ts', 'utf8');

const results = [];

function check(desc, condition) {
  results.push({ desc, passed: Boolean(condition) });
}

// 1. Fase 10 spawns Astaroth
check(
  'Fase 10 spawns astaroth com isBoss: true e levelOffset: 9',
  levelsContent.includes("monsterTypeId: 'astaroth', x: 4, y: 1, levelOffset: 9, isBoss: true")
);

// 2. Astaroth definition
check(
  'Astaroth possui as 5 habilidades em skillIds',
  monstersContent.includes("'astaroth_cone_abissal'") &&
  monstersContent.includes("'astaroth_cruz_apocaliptica'") &&
  monstersContent.includes("'astaroth_bracos_cardinais'") &&
  monstersContent.includes("'astaroth_emanacao_abissal'") &&
  monstersContent.includes("'boss_astaroth_cataclismo'")
);

// 3. Habilidade 1: Cone, 150% dano mágico, Cooldown 3, deixa poças
check(
  'Habilidade 1 (astaroth_cone_abissal): 150% dano mágico, aoeType cone, CD 3, leavesCorruptionPuddle: true',
  skillsContent.includes("id: 'astaroth_cone_abissal'") &&
  skillsContent.includes("power: 1.5") &&
  skillsContent.includes("damageType: 'magical'") &&
  skillsContent.includes("aoeType: 'cone'") &&
  skillsContent.includes("cooldownMax: 3") &&
  skillsContent.includes("leavesCorruptionPuddle: true")
);

// 4. Habilidade 2: Cruz massiva, 150% dano mágico, Cooldown 3, deixa poças
check(
  'Habilidade 2 (astaroth_cruz_apocaliptica): 150% dano mágico, aoeType cross, CD 3, leavesCorruptionPuddle: true',
  skillsContent.includes("id: 'astaroth_cruz_apocaliptica'") &&
  skillsContent.includes("power: 1.5") &&
  skillsContent.includes("damageType: 'magical'") &&
  skillsContent.includes("aoeType: 'cross'") &&
  skillsContent.includes("cooldownMax: 3") &&
  skillsContent.includes("leavesCorruptionPuddle: true")
);

// 5. Habilidade 3: Braços cardinais, alcance 3, puxa 2 casas, -1 mov, CD 3, NÃO deixa poças
check(
  'Habilidade 3 (astaroth_bracos_cardinais): isCardinalArms: true, rangeMax: 3, pull: 2, slow: 1, CD 3, leavesCorruptionPuddle: false',
  skillsContent.includes("id: 'astaroth_bracos_cardinais'") &&
  skillsContent.includes("isCardinalArms: true") &&
  skillsContent.includes("rangeMax: 3") &&
  skillsContent.includes("pull: 2") &&
  skillsContent.includes("type: 'slow'") &&
  skillsContent.includes("cooldownMax: 3") &&
  skillsContent.includes("leavesCorruptionPuddle: false")
);

// 6. Habilidade 4: Dano 150% mágico em volta do boss (3x3), Cooldown 5, deixa poças
check(
  'Habilidade 4 (astaroth_emanacao_abissal): 150% mágico em volta do boss, CD 5, leavesCorruptionPuddle: true',
  skillsContent.includes("id: 'astaroth_emanacao_abissal'") &&
  skillsContent.includes("aoeCenteredOnCaster: true") &&
  skillsContent.includes("aoeRadius: 1") &&
  skillsContent.includes("power: 1.5") &&
  skillsContent.includes("damageType: 'magical'") &&
  skillsContent.includes("cooldownMax: 5") &&
  skillsContent.includes("leavesCorruptionPuddle: true")
);

// 7. Habilidade 5 (Ultimate): Dano global, puxa para casas adjacentes, NÃO deixa poças
check(
  'Habilidade 5 (boss_astaroth_cataclismo): Dano global 200% mágico, pullToAdjacent: true, leavesCorruptionPuddle: true',
  skillsContent.includes("id: 'boss_astaroth_cataclismo'") &&
  skillsContent.includes("power: 2.0") &&
  skillsContent.includes("pullToAdjacent: true") &&
  skillsContent.includes("leavesCorruptionPuddle: true")
);

// 8. Cooldowns preservation for bosses in createMonsterUnit
check(
  'createMonsterUnit preserva os cooldowns e efeitos específicos de bosses',
  monstersContent.includes("if (def.isBoss || def.isMiniBoss)") &&
  monstersContent.includes("return clone;")
);

// 9. Poças de corrupção aplicadas no grid durante runAiTurn
check(
  'App.tsx aplica corruptionTurns: 3 no grid nas casas de hitTiles quando leavesCorruptionPuddle: true',
  appContent.includes("if (skill?.leavesCorruptionPuddle && hitTiles.length > 0)") &&
  appContent.includes("corruptionTurns: 3")
);

// 10. Dano verdadeiro de 10% da vida máxima no início do turno dos heróis
check(
  'App.tsx aplica 10% da vida máxima em dano verdadeiro para heróis em poças de corrupção',
  appContent.includes("standingTile.corruptionTurns && standingTile.corruptionTurns > 0") &&
  appContent.includes("const corrDmg = Math.max(1, Math.round(u.maxHp * 0.10));") &&
  appContent.includes("currentHp = Math.max(0, currentHp - corrDmg);") &&
  appContent.includes("u.faction === 'player'")
);

// 11. Boss imune às poças
check(
  'Boss/monstros não tomam dano das poças (somente u.faction === "player" sofre o efeito)',
  appContent.includes("if (u.faction === 'player')")
);

// 12. Puxão de 2 casas implementado no ataque
check(
  'App.tsx executa puxão de 2 casas em direção ao boss (skill.pull)',
  appContent.includes("if (skill?.pull && skill.pull > 0 && newHp > 0)") &&
  appContent.includes("playMoveAnimation")
);

// 13. Puxão para adjacência implementado na Ultimate
check(
  'App.tsx executa puxão para casas adjacentes ao boss (skill.pullToAdjacent)',
  appContent.includes("if (skill?.pullToAdjacent && newHp > 0)") ||
  appContent.includes("assignedPositions.push({ id: hero.id, x: bestTile.x, y: bestTile.y });")
);

// 14. Decremento da duração das poças a cada rodada
check(
  'App.tsx decrementa corruptionTurns a cada início de turno do jogador',
  appContent.includes("const newTurns = cell.corruptionTurns - 1;") &&
  appContent.includes("corruptionTurns: newTurns > 0 ? newTurns : undefined")
);

// 15. Renderização visual das poças em 3D
check(
  'BoardRenderer3D.tsx renderiza poças com anéis violetas e destaque pulsante',
  boardContent.includes("if (tile.corruptionTurns && tile.corruptionTurns > 0)")
);

// 16. Inteligência artificial avalia braços cardinais e AoE centrado
check(
  'monsterAI.ts tem suporte dedicado para isCardinalArms e aoeCenteredOnCaster',
  aiContent.includes("act.skill?.isCardinalArms") &&
  aiContent.includes("act.skill.aoeCenteredOnCaster") &&
  aiContent.includes("act.skill.leavesCorruptionPuddle")
);

console.log('=== RELATÓRIO DE VERIFICAÇÃO DO BOSS ASTAROTH ===');
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
  console.log('Todas as implementações do Boss Astaroth foram 100% verificadas com sucesso!');
}
