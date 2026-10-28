import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Check,
  RotateCcw,
  Swords,
  ShieldCheck,
  Target,
  Wand2,
  HeartPulse,
  Flame,
  Skull,
  Footprints,
  Sun,
  Award,
} from 'lucide-react';
import { CLASS_DEFINITIONS } from '../data/units';
import {
  SKILLS,
  CLASS_LEARNABLE_SKILL_IDS,
  CLASS_MISSION_REWARD_SKILLS,
  getEvolvedSkill,
} from '../data/skills';
import type { Skill } from '../types/game';
import { soundManager } from '../utils/audio';

export interface TrainingSkillPickerModalProps {
  classNameKey: string;
  selectedSkillIds?: string[];
  initialSkillsByClass?: Record<string, string[]>;
  heroLevel: number;
  onSaveSkills: (classNameKey: string, newSkillIds: string[]) => void;
  onClose: () => void;
  allTeamClasses?: string[];
}

function getSkillIcon(iconName?: string, size = 18) {
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

export const TrainingSkillPickerModal: React.FC<TrainingSkillPickerModalProps> = ({
  classNameKey: initialClassKey,
  selectedSkillIds: initialSkillIds,
  initialSkillsByClass,
  heroLevel,
  onSaveSkills,
  onClose,
  allTeamClasses = [],
}) => {
  const [currentClass, setCurrentClass] = useState<string>(initialClassKey);
  const [skillsByClass, setSkillsByClass] = useState<Record<string, string[]>>(() => {
    const base = initialSkillsByClass ? { ...initialSkillsByClass } : {};
    if (initialSkillIds) {
      base[initialClassKey] = initialSkillIds;
    }
    return base;
  });

  const classDef = CLASS_DEFINITIONS[currentClass] || CLASS_DEFINITIONS['guerreiro'];
  const baseSkill: Skill | undefined = SKILLS[classDef.baseSkillId];

  // All learnable skills (regular learnable + mission reward skills)
  const availableSkillIds = useMemo(() => {
    const regular = CLASS_LEARNABLE_SKILL_IDS[currentClass] || [];
    const rewards = CLASS_MISSION_REWARD_SKILLS[currentClass] || [];
    return Array.from(new Set([...regular, ...rewards]));
  }, [currentClass]);

  const missionRewardSet = useMemo(() => {
    return new Set(CLASS_MISSION_REWARD_SKILLS[currentClass] || []);
  }, [currentClass]);

  const currentSelectedIds = useMemo(() => {
    if (skillsByClass[currentClass] !== undefined) {
      return skillsByClass[currentClass];
    }
    if (initialSkillsByClass?.[currentClass] !== undefined) {
      return initialSkillsByClass[currentClass];
    }
    if (currentClass === initialClassKey && initialSkillIds) {
      return initialSkillIds;
    }
    // Default fallback
    return availableSkillIds.slice(0, heroLevel >= 10 ? 4 : heroLevel >= 5 ? 2 : 0);
  }, [skillsByClass, currentClass, initialSkillsByClass, initialClassKey, initialSkillIds, availableSkillIds, heroLevel]);

  const handleToggleSkill = (skillId: string) => {
    soundManager.playSelect();
    setSkillsByClass((prev) => {
      const existing = prev[currentClass] !== undefined ? prev[currentClass] : currentSelectedIds;
      if (existing.includes(skillId)) {
        return {
          ...prev,
          [currentClass]: existing.filter((id) => id !== skillId),
        };
      }
      if (existing.length >= 4) {
        // Limit of 4 secondary skills (total 5 with base skill)
        return prev;
      }
      return {
        ...prev,
        [currentClass]: [...existing, skillId],
      };
    });
  };

  const handleSelectDefaults = () => {
    soundManager.playSelect();
    const defaults = availableSkillIds.slice(0, 4);
    setSkillsByClass((prev) => ({
      ...prev,
      [currentClass]: defaults,
    }));
  };

  const handleClearAll = () => {
    soundManager.playSelect();
    setSkillsByClass((prev) => ({
      ...prev,
      [currentClass]: [],
    }));
  };

  const handleSaveAndConfirm = () => {
    soundManager.playUpgrade();
    // Save current and any other edited classes
    const finalMap = {
      ...skillsByClass,
      [currentClass]: currentSelectedIds,
    };
    Object.entries(finalMap).forEach(([cKey, ids]) => {
      onSaveSkills(cKey, ids);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 select-none font-sans overflow-hidden">
      <div className="bg-[#121622] border-2 border-[#D4AD65] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl text-[#F3F4F8] relative overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AD65] to-transparent" />

        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#2B3245] flex items-center justify-between bg-[#171D2E]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-md shrink-0"
              style={{ backgroundColor: classDef.color }}
            >
              {classDef.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
                  Habilidades: {classDef.name}
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#D4AD65]/15 text-[#D4AD65] border border-[#D4AD65]/30">
                  {currentSelectedIds.length} / 4 Escolhidas
                </span>
              </div>
              <p className="text-xs text-[#A7B0C4]">
                Escolha até 4 habilidades ativas para testar (a habilidade básica é sempre mantida).
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playSelect();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-[#232B3E] hover:bg-[#2F3952] text-[#A7B0C4] hover:text-white flex items-center justify-center transition-colors border border-[#343F5B]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hero Selector Tabs if team has multiple heroes */}
        {allTeamClasses.length > 1 && (
          <div className="px-4 sm:px-5 py-2.5 bg-[#101420] border-b border-[#22293E] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[11px] font-bold text-[#A7B0C4] uppercase tracking-wider shrink-0 mr-1">
              Heróis:
            </span>
            {allTeamClasses.map((cKey) => {
              const def = CLASS_DEFINITIONS[cKey];
              if (!def) return null;
              const isActive = cKey === currentClass;
              const chosenCount = (skillsByClass[cKey] || []).length;

              return (
                <button
                  key={cKey}
                  onClick={() => {
                    soundManager.playSelect();
                    setCurrentClass(cKey);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 border ${
                    isActive
                      ? 'bg-[#1C2337] border-[#D4AD65] text-white shadow-md'
                      : 'bg-[#151A27] border-[#2B3245] text-[#A7B0C4] hover:border-[#3D4760]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: def.color }}
                  />
                  <span>{def.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-[#D4AD65] font-black">
                    {chosenCount}/4
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
          {/* Base Skill Inherent Card */}
          {baseSkill && (
            <div className="bg-[#171D2E] border-2 border-emerald-500/40 rounded-2xl p-3.5 space-y-2 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {getSkillIcon(baseSkill.iconName, 18)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">{baseSkill.name}</span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Habilidade Básica (Inata)
                      </span>
                    </div>
                    <div className="text-[10px] text-[#A7B0C4] flex items-center gap-3 mt-0.5">
                      <span>Alcance: {baseSkill.rangeMax} casa{baseSkill.rangeMax > 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>Recarga: {baseSkill.cooldownMax} turnos</span>
                      <span>•</span>
                      <span className="capitalize">Tipo: {baseSkill.damageType}</span>
                    </div>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  Sempre Equipada
                </div>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                {baseSkill.description}
              </p>
            </div>
          )}

          {/* Quick Toolbar */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#D4AD65] flex items-center gap-1.5">
              <Sparkles size={14} /> Habilidades da Classe ({currentSelectedIds.length} / 4)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectDefaults}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#232B3E] hover:bg-[#2F3952] text-[#A7B0C4] hover:text-white transition-colors border border-[#343F5B]"
              >
                Primeiras 4
              </button>
              <button
                onClick={handleClearAll}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors border border-red-500/30"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {availableSkillIds.map((skId) => {
              const rawSkill = SKILLS[skId];
              if (!rawSkill) return null;
              const skillLvl = heroLevel >= 20 ? 3 : 1;
              const skill = getEvolvedSkill(rawSkill, skillLvl);

              const isSelected = currentSelectedIds.includes(skId);
              const isReward = missionRewardSet.has(skId);
              const isMaxReached = !isSelected && currentSelectedIds.length >= 4;

              // Badge colors based on damageType
              let typeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
              if (skill.damageType === 'magical') {
                typeColor = 'bg-sky-500/15 text-sky-400 border-sky-500/30';
              } else if (skill.damageType === 'healing') {
                typeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
              }

              return (
                <div
                  key={skId}
                  onClick={() => !isMaxReached && handleToggleSkill(skId)}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#1E263D] to-[#141A29] border-[#D4AD65] shadow-lg shadow-[#D4AD65]/10 cursor-pointer'
                      : isMaxReached
                      ? 'bg-[#131722]/60 border-[#222938] opacity-50 cursor-not-allowed'
                      : 'bg-[#151A27]/90 border-[#2B3245] hover:border-[#3D4760] hover:bg-[#1A2030] cursor-pointer'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-xl border ${
                            isSelected
                              ? 'bg-[#D4AD65]/20 text-[#D4AD65] border-[#D4AD65]/40'
                              : 'bg-[#1B2030] text-[#A7B0C4] border-[#343B50]'
                          }`}
                        >
                          {getSkillIcon(skill.iconName, 18)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs text-white">{skill.name}</span>
                            {isReward && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-0.5">
                                <Award size={10} /> Missão
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#A7B0C4] flex items-center gap-2 mt-0.5">
                            <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${typeColor}`}>
                              {skill.damageType}
                            </span>
                            <span>Recarga: {skill.cooldownMax}T</span>
                            <span>Alcance: {skill.rangeMax}</span>
                            {skill.aoeRadius > 0 && <span>AoE: {skill.aoeRadius}</span>}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs transition-colors shrink-0 ${
                          isSelected
                            ? 'bg-[#D4AD65] border-[#D4AD65] text-[#10131C]'
                            : 'border-[#3D4760] bg-[#101420]'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>

                    <p className="text-[11px] text-[#CBD5E1] leading-relaxed line-clamp-3">
                      {skill.description}
                    </p>
                  </div>

                  <div className="text-[9px] text-[#64748B] flex items-center justify-between font-medium pt-1 border-t border-[#22293E]">
                    <span>Poder: {skill.power}</span>
                    <span>{isSelected ? 'Equipada no Treino' : isMaxReached ? 'Limite (4/4) atingido' : 'Clique para equipar'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#2B3245] bg-[#171D2E]/90 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#A7B0C4]">
            Total de Habilidades no Herói:{' '}
            <strong className="text-white">
              {currentSelectedIds.length + 1} de 5 slots
            </strong>{' '}
            (1 Básica + {currentSelectedIds.length} Secundárias)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playSelect();
                onClose();
              }}
              className="px-4 py-2 rounded-xl border border-[#343F5B] text-[#A7B0C4] hover:text-white hover:bg-[#232B3E] font-bold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAndConfirm}
              className="px-5 py-2 rounded-xl font-black text-xs bg-gradient-to-r from-[#D4AD65] via-[#E5C27E] to-[#D4AD65] text-[#10131C] hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#D4AD65]/20 cursor-pointer"
            >
              Confirmar Habilidades
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
