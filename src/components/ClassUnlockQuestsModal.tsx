import React, { useState } from 'react';
import type { PlayerProgress } from '../types/game';
import { CLASS_UNLOCK_QUESTS, getMonsterKillCount } from '../data/classUnlockQuests';
import {
  LINEAGE_UNLOCK_QUESTS,
  INITIAL_UNLOCKED_LINEAGES,
  getLineageQuestProgress,
} from '../data/lineageQuests';
import { LINEAGES_BY_ID } from '../data/lineages';
import { CLASS_DEFINITIONS } from '../data/units';
import {
  Flame,
  Crosshair,
  Shield,
  Swords,
  Music,
  Snowflake,
  Zap,
  CheckCircle2,
  X,
  Target,
  Sparkles,
  MapPin,
  Lock,
  Skull,
  Sun,
  Dna,
} from 'lucide-react';

interface ClassUnlockQuestsModalProps {
  progress: PlayerProgress;
  initialTab?: 'lineages' | 'classes';
  onClose: () => void;
}

export const ClassUnlockQuestsModal: React.FC<ClassUnlockQuestsModalProps> = ({
  progress,
  initialTab = 'lineages',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'lineages' | 'classes'>(initialTab);
  const unlockedClasses = progress.unlockedClasses || [];

  const getQuestIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame size={18} className="text-[#FF5722]" />;
      case 'Crosshair':
        return <Crosshair size={18} className="text-[#10B981]" />;
      case 'Shield':
        return <Shield size={18} className="text-[#F59E0B]" />;
      case 'Swords':
        return <Swords size={18} className="text-[#0EA5E9]" />;
      case 'Music':
        return <Music size={18} className="text-[#EC4899]" />;
      case 'Snowflake':
        return <Snowflake size={18} className="text-[#06B6D4]" />;
      case 'Zap':
        return <Zap size={18} className="text-[#EAB308]" />;
      case 'Skull':
        return <Skull size={18} className="text-[#A855F7]" />;
      case 'Sun':
        return <Sun size={18} className="text-[#FFD700]" />;
      case 'Sparkles':
      default:
        return <Sparkles size={18} className="text-[#06B6D4]" />;
    }
  };

  const totalCompletedClasses = CLASS_UNLOCK_QUESTS.filter(
    (q) => unlockedClasses.includes(q.targetClass) || getMonsterKillCount(progress, q.monsterTypeId) >= q.targetCount
  ).length;

  const totalCompletedLineages = LINEAGE_UNLOCK_QUESTS.filter(
    (q) => getLineageQuestProgress(progress, q).isCompleted
  ).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans">
      <div className="bg-[#1B2030] border-2 border-[#D4AD65] rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-4xl w-full shadow-2xl text-[#F3F4F8] space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto relative animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 sm:top-5 right-3.5 sm:right-5 p-1.5 sm:p-2 rounded-xl bg-[#10131C] border border-[#343B50] text-[#A7B0C4] hover:text-white hover:border-[#D4AD65] transition-all cursor-pointer"
          title="Fechar"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-[#D4AD65]/10 border border-[#D4AD65]/30 text-[#D4AD65] px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} /> Missões de Desbloqueio & Conquistas
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center justify-center gap-2">
            🏆 Jornada de Conquistas da Campanha
          </h2>
          <p className="text-xs sm:text-sm text-[#A7B0C4] max-w-2xl mx-auto leading-relaxed">
            Cumpra diferentes desafios táticos (dano causado, curas, vitórias impecáveis, chefes derrotados, ouro e abates) para despertar linhagens ancestrais e recrutar novas classes.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 border-b border-[#343B50] pb-2">
          <button
            onClick={() => setActiveTab('lineages')}
            className={`px-4 sm:px-6 py-2 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'lineages'
                ? 'bg-gradient-to-r from-[#FF6B00]/20 to-[#FFD700]/20 border-2 border-[#FF6B00] text-[#FFB088] shadow-md shadow-[#FF6B00]/20 scale-105'
                : 'bg-[#10131C] border border-[#343B50] text-[#A7B0C4] hover:text-white hover:border-[#D4AD65]/50'
            }`}
          >
            <Dna size={16} />
            <span>Linhagens Ancestrais ({totalCompletedLineages}/{LINEAGE_UNLOCK_QUESTS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 sm:px-6 py-2 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'classes'
                ? 'bg-gradient-to-r from-[#4C8DFF]/20 to-[#00BCD4]/20 border-2 border-[#4C8DFF] text-[#93C5FD] shadow-md shadow-[#4C8DFF]/20 scale-105'
                : 'bg-[#10131C] border border-[#343B50] text-[#A7B0C4] hover:text-white hover:border-[#D4AD65]/50'
            }`}
          >
            <Swords size={16} />
            <span>Classes ({totalCompletedClasses}/{CLASS_UNLOCK_QUESTS.length})</span>
          </button>
        </div>

        {/* Content: Lineages Tab */}
        {activeTab === 'lineages' && (
          <div className="space-y-3.5">
            <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] flex flex-wrap items-center justify-between gap-2 text-xs text-[#A7B0C4]">
              <span className="flex items-center gap-1.5 font-bold text-white">
                🧬 Linhagens Iniciais:
                <span className="text-[#34D399] ml-1">
                  {INITIAL_UNLOCKED_LINEAGES.map((id) => LINEAGES_BY_ID[id]?.name || id).join(', ')}
                </span>
                (Desbloqueadas por padrão)
              </span>
              <span className="text-[11px] text-[#FFD700]">
                As 10 linhagens abaixo possuem missões variadas de desbloqueio.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {LINEAGE_UNLOCK_QUESTS.map((quest) => {
                const lineage = LINEAGES_BY_ID[quest.lineageId];
                const { current, target, percent, isCompleted } = getLineageQuestProgress(progress, quest);

                return (
                  <div
                    key={quest.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                      isCompleted
                        ? 'bg-[#101923]/90 border-[#10B981]/50 shadow-md shadow-[#10B981]/10'
                        : 'bg-[#10131C]/90 border-[#343B50] hover:border-[#D4AD65]/50'
                    }`}
                  >
                    {isCompleted && (
                      <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#10B981]/10 rounded-full blur-2xl pointer-events-none" />
                    )}

                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="p-1 rounded-lg bg-black/40 border border-white/10">
                            {getQuestIcon(quest.iconName)}
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#F3F4F8]">
                            {quest.title}
                          </span>
                        </div>

                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#10B981]/20 border border-[#10B981]/60 text-[#34D399]">
                            <CheckCircle2 size={12} /> Desbloqueada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#FBBF24]">
                            <Lock size={11} /> {percent}%
                          </span>
                        )}
                      </div>

                      {/* Target Lineage Identity & Bonus */}
                      <div className="flex items-center gap-3 bg-[#1B2030]/80 p-2.5 rounded-xl border border-white/5">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow border border-white/20 shrink-0"
                          style={{ backgroundColor: lineage?.color || '#FF6B00' }}
                        >
                          {getQuestIcon(quest.iconName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-sm text-white truncate" style={{ color: lineage?.color }}>
                              Linhagem {lineage?.name || quest.lineageId}
                            </h3>
                          </div>
                          <p className="text-[11px] text-[#A7B0C4] mt-0.5 truncate">
                            Objetivo: <strong className="text-[#FFB088]">{quest.unitLabel}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Description & Bonus */}
                      <div className="space-y-1">
                        <p className="text-xs text-[#CBD5E1] leading-relaxed">
                          {quest.description}
                        </p>
                        {lineage?.bonusDescription && (
                          <div className="text-[11px] p-2 rounded-lg bg-black/40 border border-white/5 text-[#FFD700] font-medium">
                            ✨ Bônus: {lineage.bonusDescription}
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-[#94A3B8] flex items-center gap-1">
                            <Target size={12} /> {quest.unitLabel}:
                          </span>
                          <span className={isCompleted ? 'text-[#34D399]' : 'text-white'}>
                            {isCompleted
                              ? `${Math.max(current, target).toLocaleString('pt-BR')} / ${target.toLocaleString('pt-BR')} (Meta Concluída!)`
                              : `${current.toLocaleString('pt-BR')} / ${target.toLocaleString('pt-BR')}`}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#0B0D13] overflow-hidden p-0.5 border border-[#343B50]">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted
                                ? 'bg-gradient-to-r from-[#10B981] to-[#34D399]'
                                : 'bg-gradient-to-r from-[#EA580C] via-[#F59E0B] to-[#FACC15]'
                            }`}
                            style={{ width: `${isCompleted ? 100 : percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Hint */}
                      <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8] pt-1">
                        <MapPin size={12} className="text-[#D4AD65] shrink-0" />
                        <span className="truncate">Como cumprir: <strong className="text-[#E2E8F0]">{quest.hintLevel}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content: Classes Tab */}
        {activeTab === 'classes' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {CLASS_UNLOCK_QUESTS.map((quest) => {
                const classDef = CLASS_DEFINITIONS[quest.targetClass];
                const isClassUnlocked = unlockedClasses.includes(quest.targetClass);
                const currentKills = getMonsterKillCount(progress, quest.monsterTypeId);
                const isCompleted = isClassUnlocked || currentKills >= quest.targetCount;
                const progressRatio = Math.min(1, currentKills / quest.targetCount);
                const progressPercent = Math.round(progressRatio * 100);

                return (
                  <div
                    key={quest.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                      isCompleted
                        ? 'bg-[#101923]/90 border-[#10B981]/50 shadow-md shadow-[#10B981]/10'
                        : 'bg-[#10131C]/90 border-[#343B50] hover:border-[#D4AD65]/50'
                    }`}
                  >
                    {isCompleted && (
                      <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#10B981]/10 rounded-full blur-2xl pointer-events-none" />
                    )}

                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="p-1 rounded-lg bg-black/40 border border-white/10">
                            {getQuestIcon(quest.iconName)}
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#F3F4F8]">
                            {quest.title}
                          </span>
                        </div>

                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#10B981]/20 border border-[#10B981]/60 text-[#34D399]">
                            <CheckCircle2 size={12} /> Desbloqueada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#FBBF24]">
                            <Lock size={11} /> {progressPercent}%
                          </span>
                        )}
                      </div>

                      {/* Target Class Identity & Monster */}
                      <div className="flex items-center gap-3 bg-[#1B2030]/80 p-2.5 rounded-xl border border-white/5">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow border border-white/20 shrink-0"
                          style={{ backgroundColor: classDef?.color || '#D4AD65' }}
                        >
                          {getQuestIcon(quest.iconName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-sm text-white truncate">
                              {classDef?.name || quest.targetClass}
                            </h3>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-[#A7B0C4] font-bold">
                              {classDef?.role?.split('&')[0].trim()}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A7B0C4] mt-0.5 truncate">
                            Alvo: <strong className="text-[#FFB088]">{quest.targetCount} {quest.monsterName}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#CBD5E1] leading-relaxed">
                        {quest.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-[#94A3B8] flex items-center gap-1">
                            <Target size={12} /> Abates:
                          </span>
                          <span className={isCompleted ? 'text-[#34D399]' : 'text-white'}>
                            {isCompleted
                              ? `${Math.max(currentKills, quest.targetCount)} / ${quest.targetCount} (Meta Concluída!)`
                              : `${currentKills} / ${quest.targetCount}`}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#0B0D13] overflow-hidden p-0.5 border border-[#343B50]">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted
                                ? 'bg-gradient-to-r from-[#10B981] to-[#34D399]'
                                : 'bg-gradient-to-r from-[#EA580C] via-[#F59E0B] to-[#FACC15]'
                            }`}
                            style={{ width: `${isCompleted ? 100 : progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Hint */}
                      {quest.hintLevel && (
                        <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8] pt-1">
                          <MapPin size={12} className="text-[#D4AD65] shrink-0" />
                          <span className="truncate">Onde encontrar: <strong className="text-[#E2E8F0]">{quest.hintLevel}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="bg-[#10131C] p-3 rounded-2xl border border-[#343B50] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#A7B0C4]">
          <span className="flex items-center gap-2">
            💡 <em>Dica: A Fase Diária concede 20.000 de Ouro e traz hordas variadas todos os dias para acelerar suas missões!</em>
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#D4AD65] hover:bg-[#F0C375] text-[#10131C] font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
