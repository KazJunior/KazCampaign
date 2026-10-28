import React from 'react';
import type { Skill, Unit } from '../types/game';
import { SKILLS, getEvolvedSkill, MAX_SKILL_LEVEL, getLearnableSkillsForClass, CLASS_MISSION_REWARD_SKILLS } from '../data/skills';
import { getAoELabel } from '../utils/pathfinding';
import {
  ArrowUpRight,
  Sparkles,
  Swords,
  HeartPulse,
  Wand2,
  Target,
  Zap,
  Flame,
  Skull,
  RotateCcw,
  Footprints,
  ShieldCheck,
  Sun,
  TrendingUp,
} from 'lucide-react';

interface SkillChoiceModalProps {
  unit: Unit;
  unlockedClassSkillIds?: string[];
  onChooseSkill: (skill: Skill, isEvolution: boolean) => void;
  onSkip?: () => void;
}

export const SkillChoiceModal: React.FC<SkillChoiceModalProps> = ({ unit, unlockedClassSkillIds = [], onChooseSkill, onSkip }) => {
  const currentSkills = unit.skills || [];
  const has5Skills = currentSkills.length >= 5;

  // 1. RANDOM UNLEARNED SKILLS (< 5 skills)
  const eligibleNewSkills = React.useMemo(() => {
    if (has5Skills) return [];
    const learnedSet = new Set(currentSkills.map((s) => s.id));
    const classPoolIds = getLearnableSkillsForClass(unit.className, unlockedClassSkillIds);
    const available = classPoolIds
      .filter((id) => !learnedSet.has(id))
      .map((id) => SKILLS[id])
      .filter(Boolean);

    // Random shuffle
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [unit.id, unit.level, unit.className, has5Skills, unlockedClassSkillIds]);

  // If the unit has >= 5 skills OR if all class skills are already learned,
  // enter EVOLUTION MODE to upgrade existing skills!
  const isEvolutionMode = has5Skills || (eligibleNewSkills.length === 0 && currentSkills.length > 0);

  // If in evolution mode, render the 5 skills with their upgrades!
  if (isEvolutionMode) {
    const evolvableSkills = currentSkills.filter((s) => (s.level || 1) < MAX_SKILL_LEVEL);

    if (evolvableSkills.length === 0) {
      return (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
          <div className="bg-[#1B2030] border-2 border-[#D4AD65] rounded-3xl p-6 max-w-md w-full shadow-2xl text-[#F3F4F8] text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#D4AD65]/15 border border-[#D4AD65]/40 text-[#D4AD65] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              <Zap size={16} /> NÍVEL MÁXIMO
            </div>
            <h2 className="text-2xl font-extrabold">Todas as habilidades de {unit.name} estão no Nv. {MAX_SKILL_LEVEL}!</h2>
            <p className="text-xs text-[#A7B0C4]">Não há mais evoluções disponíveis para este herói.</p>
            <button
              id="skill-choice-skip"
              onClick={() => onSkip?.()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AD65] to-[#B88E43] text-[#10131C] font-black text-xs uppercase tracking-wider"
            >
              Continuar
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans overflow-y-auto">
        <div className="bg-[#1B2030] border-2 border-[#D4AD65] rounded-3xl p-4 sm:p-6 max-w-5xl w-full shadow-2xl text-[#F3F4F8] space-y-5 my-auto max-h-[92vh] overflow-y-auto">
          {/* Header Banner */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-[#D4AD65]/15 border border-[#D4AD65]/40 text-[#D4AD65] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
              <Zap size={16} /> EVOLUÇÃO DE HABILIDADE (5/5 SLOTS)
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F8]">
              Evolua 1 Habilidade de {unit.name}
            </h2>
            <p className="text-xs text-[#A7B0C4] max-w-xl mx-auto">
              Seu herói atingiu o limite de 5 habilidades ativas! Escolha uma das 5 habilidades abaixo para evoluir, aumentando permanentemente seu dano e efeitos.
            </p>
          </div>

          {/* 5 Skills Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-start p-1.5">
            {evolvableSkills.map((skill) => {
              const currentLvl = skill.level || 1;
              const nextLvl = currentLvl + 1;
              const evolved = getEvolvedSkill(skill, nextLvl);
              const isHeal = skill.damageType === 'healing';
              const isRestrictedCooldown =
                skill.damageType === 'healing' ||
                skill.id === 'cura' ||
                skill.id.includes('cura') ||
                skill.statusEffect?.type === 'shield' ||
                skill.statusEffect?.type === 'taunt' ||
                skill.secondaryStatusEffect?.type === 'taunt' ||
                skill.casterStatusEffect?.type === 'taunt' ||
                skill.statusEffect?.type === 'stun' ||
                skill.secondaryStatusEffect?.type === 'stun' ||
                skill.casterStatusEffect?.type === 'stun';

              const effectiveEvolvedCd = isRestrictedCooldown
                ? Math.max(skill.cooldownMax, evolved.cooldownMax)
                : evolved.cooldownMax;

              return (
                <div
                  key={skill.id}
                  className="group relative bg-[#10131C] border-2 border-[#343B50] hover:border-[#D4AD65] rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 ease-out shadow-xl space-y-3 hover:scale-[1.04] hover:shadow-2xl hover:shadow-[#D4AD65]/20 hover:z-20 min-h-[380px]"
                >
                  <div className="space-y-2.5">
                    {/* Header: Icon & Level Tag */}
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-[#1B2030] text-[#D4AD65] border border-[#343B50] shadow transition-transform duration-300 group-hover:scale-105 group-hover:border-[#D4AD65]/60">
                        {getSkillIcon(skill.iconName, 20)}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-[#D4AD65]/20 border border-[#D4AD65]/50 text-[#D4AD65]">
                        <span>Nv. {currentLvl}</span>
                        <TrendingUp size={11} className="text-[#56E59A]" />
                        <span className="text-[#56E59A]">Nv. {nextLvl}/{MAX_SKILL_LEVEL}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-[#F3F4F8] truncate group-hover:whitespace-normal group-hover:text-[#D4AD65] transition-colors duration-200" title={skill.name}>
                        {skill.name}
                      </h3>
                      <p className="text-[11px] text-[#A7B0C4] leading-relaxed line-clamp-3 group-hover:line-clamp-none group-hover:text-[#F3F4F8] transition-all duration-300 mt-1">
                        {evolved.description}
                      </p>
                    </div>
                  </div>

                  {/* Evolution Stats Diff */}
                  <div className="space-y-2.5 pt-2 border-t border-[#343B50]">
                    <div className="space-y-1.5 text-[11px]">
                      {skill.power > 0 && (
                        <div className="bg-[#1B2030] p-1.5 rounded-lg border border-[#343B50] flex items-center justify-between">
                          <span className="text-[#A7B0C4]">Poder:</span>
                          <span className={isHeal ? 'text-[#56E59A]' : 'text-[#FF5252]'}>
                            x{skill.power} <strong className="text-[#56E59A]">→ x{evolved.power}</strong>
                          </span>
                        </div>
                      )}

                      <div className="bg-[#1B2030] p-1.5 rounded-lg border border-[#343B50] flex items-center justify-between">
                        <span className="text-[#A7B0C4]">Recarga:</span>
                        <span>
                          {skill.cooldownMax}T
                          {effectiveEvolvedCd < skill.cooldownMax ? (
                            <strong className="text-[#56E59A]"> → {effectiveEvolvedCd}T (-1T)</strong>
                          ) : (
                            <span className="text-[#A7B0C4]"> (Inalterada)</span>
                          )}
                        </span>
                      </div>

                      {skill.statusEffect && (
                        <div className="bg-[#1B2030] p-1.5 rounded-lg border border-[#343B50] flex items-center justify-between">
                          <span className="text-[#A7B0C4]">Efeito:</span>
                          <strong className="text-[#38BDF8]">
                            +{skill.statusEffect.value} → +{evolved.statusEffect?.value}
                          </strong>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onChooseSkill(skill, true)}
                      className="w-full py-2 px-1.5 rounded-xl bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#B88E43] hover:to-[#96702D] text-[#10131C] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all group-hover:shadow-[0_0_15px_rgba(212,173,101,0.4)]"
                    >
                      <Zap size={14} /> Evoluir Nv. {nextLvl}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Fallback if no skills can be offered at all (edge-case)
  if (eligibleNewSkills.length === 0) {
    return null;
  }

  // 2. LEARNING NEW SKILL MODE (< 5 skills)
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans overflow-y-auto">
      <div className="bg-[#1B2030] border-2 border-[#D4AD65] rounded-3xl p-4 sm:p-6 max-w-4xl w-full shadow-2xl text-[#F3F4F8] space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header Banner */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 bg-[#D4AD65]/15 border border-[#D4AD65]/40 text-[#D4AD65] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
            <ArrowUpRight size={16} /> NOVA HABILIDADE (SLOT {currentSkills.length + 1} DE 5)
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F8]">
            Escolha 1 Nova Habilidade para {unit.name}
          </h2>
          <p className="text-xs text-[#A7B0C4]">
            Habilidades sorteadas aleatoriamente ao subir de nível! Escolha 1 das 3 opções para adicionar ao arsenal (máximo de 5 habilidades).
          </p>
        </div>

        {/* 3 Skill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start p-1.5">
          {eligibleNewSkills.map((skill) => {
            const isHeal = skill.damageType === 'healing';

            return (
              <div
                key={skill.id}
                className="group relative bg-[#10131C] border-2 border-[#343B50] hover:border-[#D4AD65] rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ease-out shadow-xl space-y-4 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#D4AD65]/20 hover:z-20 min-h-[420px]"
              >
                <div className="space-y-3">
                  {/* Skill Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-[#1B2030] text-[#D4AD65] border border-[#343B50] shadow transition-transform duration-300 group-hover:scale-105 group-hover:border-[#D4AD65]/60">
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
                    {CLASS_MISSION_REWARD_SKILLS[unit.className]?.includes(skill.id) && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm animate-pulse">
                        <Sparkles size={11} /> MISSÃO
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-[#F3F4F8] min-h-[2.5rem] flex items-center leading-snug group-hover:text-[#D4AD65] transition-colors duration-200">
                    {skill.name}
                  </h3>
                  <div className="relative">
                    <p className="text-xs text-[#A7B0C4] leading-relaxed line-clamp-3 group-hover:line-clamp-none group-hover:text-[#F3F4F8] transition-all duration-300">
                      {skill.description}
                    </p>
                  </div>
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
                        {getAoELabel(skill)}
                      </strong>
                    </div>
                  </div>

                  <button
                    onClick={() => onChooseSkill(skill, false)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#B88E43] hover:to-[#96702D] text-[#10131C] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all group-hover:shadow-[0_0_15px_rgba(212,173,101,0.4)]"
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
