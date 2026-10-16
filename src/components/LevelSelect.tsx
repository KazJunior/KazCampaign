import React from 'react';
import { LEVELS } from '../data/levels';
import type { PlayerProgress } from '../types/game';
import { Lock, CheckCircle2, Play, Shield, Coins, Sparkles, Award, RotateCcw, Users, Flame } from 'lucide-react';
import { CLASS_DEFINITIONS } from '../data/units';

interface LevelSelectProps {
  progress: PlayerProgress;
  onSelectLevel: (levelId: number) => void;
  onChangeParty: () => void;
  onResetProgress: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  progress,
  onSelectLevel,
  onChangeParty,
  onResetProgress,
}) => {
  return (
    <div className="min-h-screen bg-[#10131C] text-[#F3F4F8] p-4 sm:p-8 flex flex-col items-center justify-center select-none font-sans">
      <div className="max-w-5xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#D4AD65]/10 border border-[#D4AD65]/30 text-[#D4AD65] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <Award size={16} /> RPG Tático — Expansão 10 Fases
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F3F4F8] tracking-tight">
            Campanha Tática — Seleção de Fase
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B0C4] max-w-xl mx-auto">
            Vença as 10 fases da campanha, enfrente o Devorador na Fase 5 e derrote Astaroth no Trono do Abismo!
          </p>
        </div>

        {/* Player Party Overview Card */}
        <div className="bg-[#1B2030] border border-[#343B50] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#343B50] pb-2 flex-wrap gap-2">
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#D4AD65] flex items-center gap-2">
              <Shield size={16} /> Sua Equipe de 4 Heróis
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-[#F0B44D] font-semibold">
                <Coins size={14} /> Ouro: <strong>{progress.gold}</strong>
              </span>
              <button
                onClick={onChangeParty}
                className="px-3 py-1 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#4C8DFF] font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <Users size={14} /> Alterar Equipe
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {progress.selectedPartyClasses.map((cKey) => {
              const classDef = CLASS_DEFINITIONS[cKey];
              const uState = progress.unitsState[cKey];
              if (!classDef || !uState) return null;

              return (
                <div
                  key={cKey}
                  className="bg-[#10131C] p-3 rounded-xl border border-[#343B50] flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow"
                    style={{ backgroundColor: classDef.color }}
                  >
                    Nv.{uState.level}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#F3F4F8] truncate">{classDef.name}</div>
                    <div className="text-[10px] text-[#A7B0C4]">
                      {uState.learnedSkillIds.length} Habilidades
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 10 Stages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {LEVELS.map((level) => {
            const isUnlocked = level.id <= progress.unlockedLevel;
            const isCompleted = progress.completedLevels.includes(level.id);

            return (
              <div
                key={level.id}
                className={`bg-[#1B2030] border-2 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                  isUnlocked
                    ? isCompleted
                      ? 'border-[#43C878]/60 hover:border-[#43C878] shadow-lg'
                      : level.hasFinalBoss
                      ? 'border-[#9333EA] hover:border-[#9333EA] shadow-xl scale-[1.02]'
                      : level.hasMiniBoss
                      ? 'border-[#F59E0B] hover:border-[#F59E0B] shadow-xl scale-[1.02]'
                      : 'border-[#D4AD65]/60 hover:border-[#D4AD65] shadow-md'
                    : 'border-[#343B50]/40 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#10131C] text-[#D4AD65] border border-[#343B50]">
                      Fase {level.id}
                    </span>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-[#43C878] bg-[#43C878]/10 px-1.5 py-0.5 rounded-full border border-[#43C878]/30">
                        <CheckCircle2 size={10} /> Ok
                      </span>
                    ) : !isUnlocked ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-[#A7B0C4] bg-[#10131C] px-1.5 py-0.5 rounded-full">
                        <Lock size={10} /> Bloq
                      </span>
                    ) : level.hasFinalBoss || level.hasMiniBoss ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-[#E65353] bg-[#E65353]/10 px-1.5 py-0.5 rounded-full border border-[#E65353]/30 animate-pulse">
                        <Flame size={10} /> BOSS
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-[#4C8DFF] bg-[#4C8DFF]/10 px-1.5 py-0.5 rounded-full">
                        Pronto
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-xs text-[#F3F4F8] line-clamp-1">{level.name.split('—')[1] || level.name}</h3>
                  <p className="text-[10px] text-[#D4AD65] font-semibold line-clamp-1">{level.subtitle}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#343B50] space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-[#A7B0C4]">
                    <span className="flex items-center gap-0.5">
                      <Coins size={12} className="text-[#F0B44D]" /> +{level.rewards.gold}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Sparkles size={12} className="text-[#B58AFF]" /> +{level.rewards.xpPerUnit} XP
                    </span>
                  </div>

                  {isUnlocked ? (
                    <button
                      onClick={() => onSelectLevel(level.id)}
                      className={`w-full py-2 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-md active:scale-95 ${
                        isCompleted
                          ? 'bg-[#10131C] hover:bg-[#343B50] text-[#F3F4F8] border border-[#343B50]'
                          : level.hasFinalBoss
                          ? 'bg-gradient-to-r from-[#9333EA] to-[#E65353] text-white'
                          : 'bg-gradient-to-r from-[#D4AD65] to-[#B88E43] text-[#10131C]'
                      }`}
                    >
                      <Play size={12} fill="currentColor" /> {isCompleted ? 'Jogar' : 'Iniciar'}
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-xl bg-[#10131C] text-[#A7B0C4]/40 font-bold text-[11px] uppercase text-center border border-[#343B50]">
                      Bloqueada
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={() => {
              if (confirm('Deseja reiniciar todo o progresso salvo no navegador?')) {
                onResetProgress();
              }
            }}
            className="text-xs text-[#A7B0C4] hover:text-[#E65353] flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={14} /> Reiniciar Progresso Completo
          </button>
        </div>
      </div>
    </div>
  );
};
