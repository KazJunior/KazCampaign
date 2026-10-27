import fs from 'node:fs';

const monstersSrc = fs.readFileSync('src/data/monsters.ts', 'utf8');
const skillsSrc = fs.readFileSync('src/data/skills.ts', 'utf8');

const normalMonsterIds = [
  // ATO II (Fases 11-20)
  'kobold_artilheiro', 'salamandra_magma', 'elemental_brasa', 'cao_infernal',
  'espectro_cinzento', 'ferreiro_amaldicoado', 'automato_vapor', 'verme_da_lava',
  'gargula_ferro', 'piromante_cultista',
  
  // ATO III (Fases 21-30)
  'xama_tempestade', 'cacador_estepes', 'lobo_trovao', 'constructo_runico',
  'barbaro_frenetico', 'espada_ancestral', 'guardiao_megalito', 'valquiria_sombria',
  'urso_fendendor', 'invocador_glifos',
  
  // ATO IV (Fases 31-40)
  'aberracao_miasma', 'cultista_vazio', 'insetoide_vazio', 'parasita_eter',
  'tentaculo_abissal', 'observador_loucura', 'espreitador_astral', 'massa_informe',
  'sirene_abissal', 'pesadelo_vivo',
  
  // ATO V (Fases 41-50)
  'arauto_do_eclipse', 'algoz_celestial', 'templario_sol_negro', 'pretoriano_do_caos',
  'escriba_do_destino', 'inquisidor_do_fim', 'serafim_caido', 'ceifador_crepusculo',
  'avatar_cataclismo', 'tita_obsidiana'
];

let failed = 0;
for (const id of normalMonsterIds) {
  const m = monstersSrc.match(new RegExp(id + ':\\s*\\{[\\s\\S]*?skillIds:\\s*\\[([^\\]]+)\\]'));
  if (!m) {
    console.error(`❌ ${id}: sem skillIds`);
    failed++;
    continue;
  }
  const skills = m[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
  if (skills.length < 3) {
    console.error(`❌ ${id}: possui apenas ${skills.length} habilidades: ${skills.join(', ')}`);
    failed++;
    continue;
  }
  // Check that all skills exist in skillsSrc
  for (const s of skills) {
    if (!skillsSrc.includes(`${s}: {`)) {
      console.error(`❌ ${id}: habilidade ${s} não existe em skills.ts`);
      failed++;
    }
  }
  console.log(`✅ ${id}: ${skills.length} habilidades -> [${skills.join(', ')}]`);
}

console.log(`\nVerificação final: ${normalMonsterIds.length} monstros testados | Falhas: ${failed}`);
if (failed > 0) process.exit(1);
