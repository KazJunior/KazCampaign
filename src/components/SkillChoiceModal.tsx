import React from 'react';
import type { Skill, Unit } from '../types/game';
import { SKILLS } from '../data/skills';
import { ArrowUpRight, Sparkles, Swords, HeartPulse, Wand2, Target, Zap, Flame, Skull, RotateCcw, Footprints, ShieldCheck, Sun } from 'lucide-react';

interface SkillChoiceModalProps {
  unit: Unit;
  onChooseSkill: (skill: Skill) => void;
}

export const SkillChoiceModal: React.FC<SkillChoiceModalProps> = ({ unit, onChooseSkill }) => {
  // Get 3 eligible skills from catalog for this class that have NOT been learned yet
  const eligibleSkills = React.useMemo(() => {
    const learnedSet = new Set(unit.skills.map((s) => s.id));
    const catalog = Object.values(SKILLS).filter((sk) => {
      if (learnedSet.has(sk.id)) return false;

      // Class matching heuristic based on class skill catalog
      if (unit.className === 'guerreiro' && ['golpe_demolidor', 'postura_defensiva', 'provocacao', 'escudo_inquebrantavel', 'corte_circular', 'investida_pesada', 'grito_de_guerra', 'contra_ataque_furioso', 'resistencia_suprema'].includes(sk.id)) return true;
      if (unit.className === 'arqueiro' && ['disparo_triplo', 'tiro_de_precisao', 'recuo_tatico', 'flecha_venenosa', 'chuva_de_flechas', 'tiro_paralisante', 'armadilha_de_caca', 'tiro_mortal', 'olho_de_aguia'].includes(sk.id)) return true;
      if (unit.className === 'mago' && ['projetil_elemental', 'campo_de_energia', 'tempestade_magica', 'raio_glacial', 'barreira_elemental', 'orbe_do_vazio', 'teleporte_mistico', 'cometa_arcano', 'mente_arcana'].includes(sk.id)) return true;
      if (unit.className === 'curandeiro' && ['cura_em_area', 'escudo_sagrado', 'purificacao', 'luz_restauradora', 'martelo_sagrado', 'bencao_divina', 'aura_de_protecao', 'ressurreicao_mistica', 'paz_espiritual'].includes(sk.id)) return true;
      if (unit.className === 'assassino' && ['passo_das_sombras', 'veneno_mortal', 'execucao', 'laminas_duplas', 'mortalha_das_sombras', 'corte_traicoeiro', 'danca_das_laminas', 'assassinato', 'agilidade_sombria'].includes(sk.id)) return true;
      if (unit.className === 'cavaleiro_arcano' && ['barreira_arcana', 'ruptura_mistica', 'marca_do_cacador', 'golpe_flamejante', 'estocada_eletrica', 'aura_runica', 'sedenta_de_runas', 'lamina_do_destino', 'armadura_runica'].includes(sk.id)) return true;
      if (unit.className === 'necromante' && ['maldicao_fraqueza', 'explosao_corpse', 'pacto_de_sangue', 'toque_apodrecedor', 'profanar_solo'].includes(sk.id)) return true;
      if (unit.className === 'engenheiro' && ['lanca_granada', 'barreira_tecnologica', 'choque_estatico', 'injecao_de_adrenalina', 'sobrecarga_nuclear'].includes(sk.id)) return true;
      if (unit.className === 'mago_runico' && ['runa_de_protecao', 'glifo_incandescente', 'marca_do_destino', 'campo_runico', 'apocalipse_runico'].includes(sk.id)) return true;
      if (unit.className === 'berserker' && ['frenesi_sanguinario', 'salto_destrutivo', 'rugido_intimidante', 'corte_temerario', 'ira_incontrolavel'].includes(sk.id)) return true;

      return false;
    });

    // Return up to 3 distinct options
    return catalog.slice(0, 3);
  }, [unit]);

  if (eligibleSkills.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#1B2030] border-2 border-[#D4AD65] rounded-3xl p-6 max-w-md text-center text-[#F3F4F8] space-y-4">
          <h2 className="text-xl font-bold text-[#D4AD65]">Habilidades Máximas Atingidas!</h2>
          <p className="text-xs text-[#A7B0C4]">Todas as habilidades desta classe já foram aprendidas.</p>
          <button
            onClick={() => onChooseSkill(unit.skills[0])}
            className="w-full py-2.5 rounded-xl bg-[#4C8DFF] text-white font-bold text-xs uppercase"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-[#1B2030] border-2 border-[#D4AD65] rounded-3xl p-6 max-w-4xl w-full shadow-2xl text-[#F3F4F8] space-y-5">
        {/* Header Banner */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 bg-[#D4AD65]/15 border border-[#D4AD65]/40 text-[#D4AD65] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
            <ArrowUpRight size={16} /> MARCO DE HABILIDADE (NÍVEL {unit.level})
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F8]">
            Escolha 1 Nova Habilidade para {unit.name}
          </h2>
          <p className="text-xs text-[#A7B0C4]">
            Habilidade especial ganha a cada 3 níveis! Escolha uma das 3 opções para adicionar permanentemente ao arsenal.
          </p>
        </div>

        {/* 3 Skill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {eligibleSkills.map((skill) => {
            const isHeal = skill.damageType === 'healing';

            return (
              <div
                key={skill.id}
                className="bg-[#10131C] border-2 border-[#343B50] hover:border-[#D4AD65] rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-xl space-y-4 hover:scale-[1.02]"
              >
                <div className="space-y-3">
                  {/* Skill Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-[#1B2030] text-[#D4AD65] border border-[#343B50] shadow">
                      {getSkillIcon(skill.iconName, 24)}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        skill.category === 'attack'
                          ? 'bg-[#FF5252]/20 text-[#FF5252]'
                          : skill.category === 'defense'
                          ? 'bg-[#43C878]/20 text-[#43C878]'
                          : 'bg-[#B58AFF]/20 text-[#B58AFF]'
                      }`}
                    >
                      {skill.category ? skill.category.toUpperCase() : 'HABILIDADE'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#F3F4F8]">{skill.name}</h3>
                  <p className="text-xs text-[#A7B0C4] leading-relaxed line-clamp-3">
                    {skill.description}
                  </p>
                </div>

                {/* Skill Stats Table */}
                <div className="space-y-3 pt-3 border-t border-[#343B50]">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#1B2030] p-2 rounded-lg border border-[#343B50]">
                      <span className="text-[#A7B0C4] block">Multiplicador</span>
                      <strong className={isHeal ? 'text-[#56E59A]' : 'text-[#FF5252]'}>
                        x{skill.power} Poder
                      </strong>
                    </div>

                    <div className="bg-[#1B2030] p-2 rounded-lg border border-[#343B50]">
                      <span className="text-[#A7B0C4] block">Alcance</span>
                      <strong className="text-[#D4AD65]">{skill.rangeMax} casas</strong>
                    </div>

                    <div className="bg-[#1B2030] p-2 rounded-lg border border-[#343B50]">
                      <span className="text-[#A7B0C4] block">Recarga</span>
                      <strong className="text-[#F0B44D]">{skill.cooldownMax} turnos</strong>
                    </div>

                    <div className="bg-[#1B2030] p-2 rounded-lg border border-[#343B50]">
                      <span className="text-[#A7B0C4] block">Área (AoE)</span>
                      <strong className="text-[#4C8DFF]">
                        {skill.aoeRadius > 0 ? 'Área 3x3' : 'Alvo Único'}
                      </strong>
                    </div>
                  </div>

                  <button
                    onClick={() => onChooseSkill(skill)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#B88E43] hover:to-[#96702D] text-[#10131C] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Sparkles size={16} /> Aprender Habilidade
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function getSkillIcon(iconName: string, size = 20) {
  switch (iconName) {
    case 'Sword':
    case 'Swords':
      return <Swords size={size} />;
    case 'Shield':
    case 'ShieldCheck':
      return <ShieldCheck size={size} />;
    case 'Target':
    case 'Crosshair':
      return <Target size={size} />;
    case 'Wand2':
      return <Wand2 size={size} />;
    case 'HeartPulse':
    case 'Heart':
      return <HeartPulse size={size} />;
    case 'Zap':
      return <Zap size={size} />;
    case 'Flame':
      return <Flame size={size} />;
    case 'Skull':
      return <Skull size={size} />;
    case 'RotateCcw':
      return <RotateCcw size={size} />;
    case 'Footprints':
      return <Footprints size={size} />;
    default:
      return <Sun size={size} />;
  }
}
