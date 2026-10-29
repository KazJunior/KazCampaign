import React, { useState } from 'react';
import type { PlayerProgress } from '../types/game';
import {
  CLASS_MISSIONS,
  CLASS_SKINS,
  getEquippedSkin,
  isSkinUnlocked,
  getMissionProgress,
} from '../data/classQuests';
import { CLASS_DEFINITIONS, SECRET_CLASS_UNLOCK_CONDITIONS } from '../data/units';
import { SKILLS } from '../data/skills';
import { soundManager } from '../utils/audio';
import {
  Award,
  Sparkles,
  Shield,
  Target,
  Flame,
  HeartPulse,
  Zap,
  Swords,
  Skull,
  TreePine,
  Wand2,
  Navigation,
  Music,
  Snowflake,
  Crosshair,
  RotateCw,
  Sun,
  CheckCircle2,
  Lock,
  Coins,
  Palette,
  X,
  Check,
} from 'lucide-react';

interface ClassMissionsModalProps {
  progress: PlayerProgress;
  onUpdateProgress: (updated: PlayerProgress) => void;
  onClose: () => void;
}

export const ClassMissionsModal: React.FC<ClassMissionsModalProps> = ({
  progress,
  onUpdateProgress,
  onClose,
}) => {
  const allClasses = Object.keys(CLASS_DEFINITIONS).filter((cKey) => {
    const def = CLASS_DEFINITIONS[cKey];
    const isSecret = Boolean(def?.isSecret || SECRET_CLASS_UNLOCK_CONDITIONS[cKey]);
    if (isSecret) {
      return Boolean(progress.unlockedClasses?.includes(cKey));
    }
    return true;
  });
  const [selectedClass, setSelectedClass] = useState<string>(() => allClasses[0] || 'guerreiro');
  const currentClassKey = allClasses.includes(selectedClass) ? selectedClass : (allClasses[0] || 'guerreiro');
  const [activeTab, setActiveTab] = useState<'missions' | 'skins'>('missions');
  const [claimCelebration, setClaimCelebration] = useState<string | null>(null);

  const classDef = CLASS_DEFINITIONS[currentClassKey] || CLASS_DEFINITIONS['guerreiro'];
  const missions = CLASS_MISSIONS[currentClassKey] || [];
  const skins = CLASS_SKINS[currentClassKey] || [];

  const classStats = progress.classMissionsProgress?.[currentClassKey]?.stats || {};
  const completedMissionIds = progress.classMissionsProgress?.[currentClassKey]?.completedMissions || [];
  const unlockedSkins = progress.unlockedClassSkins || [];
  const equippedSkin = getEquippedSkin(currentClassKey, progress.equippedClassSkins);

  // Claim Mission Reward
  const handleClaimReward = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    soundManager.playUpgrade();

    // 1. Mark mission completed
    const currentCompleted = progress.classMissionsProgress?.[currentClassKey]?.completedMissions || [];
    const newCompleted = Array.from(new Set([...currentCompleted, missionId]));

    const updatedMissionsProgress = {
      ...(progress.classMissionsProgress || {}),
      [currentClassKey]: {
        stats: classStats,
        completedMissions: newCompleted,
      },
    };

    // 2. Unlock Skill if applicable
    let updatedSkillIds = [...(progress.unlockedClassSkillIds || [])];
    if (mission.rewardSkillId && !updatedSkillIds.includes(mission.rewardSkillId)) {
      updatedSkillIds.push(mission.rewardSkillId);
    }

    // 3. Unlock Skin if applicable
    let updatedSkins = [...(progress.unlockedClassSkins || [])];
    if (mission.rewardSkinId && !updatedSkins.includes(mission.rewardSkinId)) {
      updatedSkins.push(mission.rewardSkinId);
    }

    // 4. Award gold bonus
    const updatedGold = progress.gold + (mission.rewardGold || 0);

    const updatedProgress: PlayerProgress = {
      ...progress,
      gold: updatedGold,
      classMissionsProgress: updatedMissionsProgress,
      unlockedClassSkillIds: updatedSkillIds,
      unlockedClassSkins: updatedSkins,
    };

    onUpdateProgress(updatedProgress);
    soundManager.playVictory();

    // Show celebration toast
    setClaimCelebration(`Missão Concluída! Recompensas de ${classDef.name} desbloqueadas!`);
    setTimeout(() => setClaimCelebration(null), 3500);
  };

  // Equip Skin
  const handleEquipSkin = (skinId: string) => {
    soundManager.playSelect();
    const updatedEquipped = {
      ...(progress.equippedClassSkins || {}),
      [currentClassKey]: skinId,
    };

    const updatedProgress: PlayerProgress = {
      ...progress,
      equippedClassSkins: updatedEquipped,
    };

    onUpdateProgress(updatedProgress);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans">
      <div className="bg-[#1B2030] border-2 border-[#D4AD65] rounded-3xl p-4 sm:p-6 max-w-6xl w-full shadow-2xl text-[#F3F4F8] space-y-4 max-h-[94vh] overflow-y-auto relative flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#10131C] border border-[#343B50] text-[#A7B0C4] hover:text-white hover:border-[#D4AD65] transition-all cursor-pointer z-10"
          title="Fechar"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pr-8">
          <div className="inline-flex items-center gap-2 bg-[#D4AD65]/10 border border-[#D4AD65]/30 text-[#D4AD65] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
            <Award size={15} /> Maestria de Classes, Habilidades & Customização
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#F3F4F8] tracking-tight">
            Missões de Classe & Guarda-Roupa
          </h2>
          <p className="text-xs text-[#A7B0C4] max-w-2xl mx-auto">
            Cumpra os objetivos de cada herói para expandir seu leque de habilidades no subir de nível e desbloquear skins exclusivas para personalizar sua equipe!
          </p>
        </div>

        {/* Celebration Toast */}
        {claimCelebration && (
          <div className="bg-gradient-to-r from-amber-500/25 via-emerald-500/25 to-amber-500/25 border-2 border-[#D4AD65] text-amber-300 px-4 py-2 rounded-2xl text-center text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 animate-bounce flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-amber-300" />
            <span>{claimCelebration}</span>
          </div>
        )}

        {/* Horizontal Class Selector Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#343B50] scrollbar-track-transparent">
          {allClasses.map((cKey) => {
            const def = CLASS_DEFINITIONS[cKey];
            const isSelected = currentClassKey === cKey;
            const isUnlocked = progress.unlockedClasses?.includes(cKey);
            const cMissions = CLASS_MISSIONS[cKey] || [];
            const cCompleted = progress.classMissionsProgress?.[cKey]?.completedMissions?.length || 0;
            const cEquipped = getEquippedSkin(cKey, progress.equippedClassSkins);

            return (
              <button
                key={cKey}
                onClick={() => setSelectedClass(cKey)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition-all shrink-0 cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#10131C] border-[#D4AD65] shadow-lg shadow-[#D4AD65]/15 scale-105'
                    : 'bg-[#141824] border-[#343B50] hover:border-[#A7B0C4]/50 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Class Avatar Icon with Active Skin Glow */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-inner"
                  style={{
                    backgroundColor: `${cEquipped.color}25`,
                    border: `1.5px solid ${cEquipped.color}`,
                    color: cEquipped.color,
                  }}
                >
                  {getClassGlyph(def?.avatarKey || cKey)}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#F3F4F8] leading-tight">
                      {def?.name || cKey}
                    </span>
                    {!isUnlocked && (
                      <span title="Classe ainda bloqueada">
                        <Lock size={11} className="text-[#A7B0C4]" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#A7B0C4] mt-0.5">
                    <span
                      className={`font-bold ${
                        cCompleted === cMissions.length ? 'text-[#43C878]' : 'text-[#D4AD65]'
                      }`}
                    >
                      {cCompleted}/{cMissions.length} Missões
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Body: Class Overview & Tabs */}
        <div className="bg-[#10131C] border border-[#343B50] rounded-2xl p-4 space-y-4">
          {/* Active Class Header & Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#343B50] pb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-md"
                style={{
                  backgroundColor: `${equippedSkin.color}25`,
                  border: `2px solid ${equippedSkin.color}`,
                  color: equippedSkin.color,
                }}
              >
                {getClassGlyph(classDef.avatarKey)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-[#F3F4F8]">{classDef.name}</h3>
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{
                      backgroundColor: `${equippedSkin.color}20`,
                      color: equippedSkin.color,
                      border: `1px solid ${equippedSkin.color}40`,
                    }}
                  >
                    Skin: {equippedSkin.name}
                  </span>
                </div>
                <p className="text-xs text-[#A7B0C4]">{classDef.role}</p>
              </div>
            </div>

            {/* Tab Buttons */}
            <div className="flex items-center gap-1 bg-[#1B2030] p-1 rounded-xl border border-[#343B50] self-stretch sm:self-auto">
              <button
                onClick={() => setActiveTab('missions')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'missions'
                    ? 'bg-gradient-to-r from-[#D4AD65] to-[#B88E43] text-[#10131C] shadow-sm'
                    : 'text-[#A7B0C4] hover:text-[#F3F4F8]'
                }`}
              >
                <Award size={14} /> Missões ({completedMissionIds.length}/3)
              </button>
              <button
                onClick={() => setActiveTab('skins')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'skins'
                    ? 'bg-gradient-to-r from-[#D4AD65] to-[#B88E43] text-[#10131C] shadow-sm'
                    : 'text-[#A7B0C4] hover:text-[#F3F4F8]'
                }`}
              >
                <Palette size={14} /> Guarda-Roupa ({skins.length} Skins)
              </button>
            </div>
          </div>

          {/* TAB 1: MISSÕES DE CLASSE */}
          {activeTab === 'missions' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {missions.map((mission) => {
                  const isDone = completedMissionIds.includes(mission.id);
                  const progressInfo = getMissionProgress(mission, classStats);
                  const rewardSkill = mission.rewardSkillId ? SKILLS[mission.rewardSkillId] : null;
                  const rewardSkin = mission.rewardSkinId
                    ? skins.find((s) => s.id === mission.rewardSkinId)
                    : null;

                  return (
                    <div
                      key={mission.id}
                      className={`relative bg-[#1B2030] border-2 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all ${
                        isDone
                          ? 'border-[#43C878]/60 shadow-lg shadow-[#43C878]/10'
                          : progressInfo.isReadyToClaim
                          ? 'border-amber-400 shadow-xl shadow-amber-500/20 animate-pulse'
                          : 'border-[#343B50]'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#10131C] border border-[#343B50] text-[#D4AD65]">
                          TIER {mission.tier} • {getTierLabel(mission.tier)}
                        </span>
                        {isDone ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#43C878]/20 text-[#43C878] border border-[#43C878]/40 flex items-center gap-1">
                            <CheckCircle2 size={12} /> CONCLUÍDA
                          </span>
                        ) : progressInfo.isReadyToClaim ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50 flex items-center gap-1">
                            <Sparkles size={12} /> PRONTO!
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#A7B0C4]">
                            {progressInfo.percent}%
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-[#F3F4F8] leading-snug">
                          {mission.title}
                        </h4>
                        <p className="text-xs text-[#A7B0C4] leading-relaxed">
                          {mission.description}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-[#A7B0C4]">Progresso</span>
                          <span className={isDone ? 'text-[#43C878]' : 'text-[#F3F4F8]'}>
                            {progressInfo.current.toLocaleString('pt-BR')} / {progressInfo.target.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="w-full bg-[#10131C] h-2 rounded-full overflow-hidden border border-[#343B50]">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isDone
                                ? 'bg-[#43C878]'
                                : progressInfo.isReadyToClaim
                                ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                                : 'bg-[#D4AD65]'
                            }`}
                            style={{ width: `${progressInfo.percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Rewards Preview Box */}
                      <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] space-y-1.5 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7B0C4] block">
                          Recompensas da Missão:
                        </span>

                        {rewardSkill && (
                          <div className="flex items-center gap-2 text-amber-300 font-bold bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                            <Zap size={13} className="text-amber-400 shrink-0" />
                            <div className="truncate">
                              <span className="text-[10px] text-amber-400 block font-normal leading-none">
                                Nova Habilidade Desbloqueável:
                              </span>
                              <span className="text-xs">{rewardSkill.name}</span>
                            </div>
                          </div>
                        )}

                        {rewardSkin && (
                          <div
                            className="flex items-center gap-2 font-bold px-2 py-1 rounded-lg border"
                            style={{
                              backgroundColor: `${rewardSkin.color}15`,
                              borderColor: `${rewardSkin.color}35`,
                              color: rewardSkin.color,
                            }}
                          >
                            <Palette size={13} className="shrink-0" />
                            <div className="truncate">
                              <span className="text-[10px] opacity-80 block font-normal leading-none">
                                Skin Exclusiva:
                              </span>
                              <span className="text-xs">{rewardSkin.name}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-[#F0B44D] font-black text-[11px] pt-0.5">
                          <Coins size={13} />
                          <span>+{mission.rewardGold.toLocaleString('pt-BR')} Ouro</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {isDone ? (
                          <button
                            disabled
                            className="w-full py-2 rounded-xl bg-[#43C878]/15 border border-[#43C878]/30 text-[#43C878] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 cursor-default"
                          >
                            <Check size={14} /> Recompensa Coletada
                          </button>
                        ) : progressInfo.isReadyToClaim ? (
                          <button
                            onClick={() => handleClaimReward(mission.id)}
                            className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-500 text-[#10131C] font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-400/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                          >
                            <Sparkles size={14} /> Reivindicar Recompensa
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2 rounded-xl bg-[#10131C] border border-[#343B50] text-[#A7B0C4] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 cursor-not-allowed opacity-75"
                          >
                            <Lock size={13} /> Em Andamento ({progressInfo.percent}%)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: GUARDA-ROUPA DE SKINS */}
          {activeTab === 'skins' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {skins.map((skin) => {
                  const isUnlocked = isSkinUnlocked(skin.id, unlockedSkins);
                  const isEquipped = equippedSkin.id === skin.id;

                  return (
                    <div
                      key={skin.id}
                      className={`relative bg-[#1B2030] border-2 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all ${
                        isEquipped
                          ? 'border-[#43C878] shadow-xl shadow-[#43C878]/15'
                          : isUnlocked
                          ? 'border-[#343B50] hover:border-[#A7B0C4]'
                          : 'border-[#343B50]/60 opacity-70'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                          style={{
                            backgroundColor: `${skin.color}25`,
                            color: skin.color,
                            border: `1px solid ${skin.color}50`,
                          }}
                        >
                          {skin.badge}
                        </span>

                        {isEquipped ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#43C878]/20 text-[#43C878] border border-[#43C878]/40 flex items-center gap-1">
                            <Check size={12} /> EM USO
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-[10px] font-bold text-[#A7B0C4] bg-[#10131C] px-2 py-0.5 rounded-full border border-[#343B50]">
                            DESBLOQUEADA
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#A7B0C4] bg-[#10131C] px-2 py-0.5 rounded-full border border-[#343B50] flex items-center gap-1">
                            <Lock size={11} /> BLOQUEADA
                          </span>
                        )}
                      </div>

                      {/* Miniature Pedestal Mockup / Skin Visual Embellishment */}
                      <div className="flex flex-col items-center justify-center py-4 bg-[#10131C] rounded-2xl border border-[#343B50] space-y-2 relative overflow-hidden">
                        {/* Glow halo */}
                        <div
                          className="absolute w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
                          style={{ backgroundColor: skin.color }}
                        />

                        {/* Pedestal Disc with Glowing Ring Mockup */}
                        <div className="relative flex flex-col items-center">
                          {/* Unit Avatar Glyph */}
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg relative z-10"
                            style={{
                              backgroundColor: `${skin.color}25`,
                              border: `2.5px solid ${skin.color}`,
                              color: skin.color,
                            }}
                          >
                            {getClassGlyph(skin.avatarKey)}
                          </div>

                          {/* 3D Miniature Tabletop Pedestal Base Representation */}
                          <div
                            className="w-20 h-4 rounded-full mt-1 border shadow-inner"
                            style={{
                              backgroundColor: '#1E293B',
                              borderColor: skin.color,
                              boxShadow: `0 0 12px ${skin.color}80`,
                            }}
                          />
                        </div>

                        <span className="text-[10px] font-bold text-[#A7B0C4] tracking-wide">
                          Aura do Pedestal 3D: <strong style={{ color: skin.color }}>Ativa</strong>
                        </span>
                      </div>

                      {/* Name, Subtitle and Lore */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-[#F3F4F8] leading-tight">
                          {skin.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-[#D4AD65] block">
                          {skin.subtitle}
                        </span>
                        <p className="text-xs text-[#A7B0C4] leading-relaxed pt-1">
                          {skin.description}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div>
                        {isEquipped ? (
                          <button
                            disabled
                            className="w-full py-2 rounded-xl bg-[#43C878]/15 border border-[#43C878]/40 text-[#43C878] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 cursor-default"
                          >
                            <Check size={14} /> Skin Ativa na Equipe
                          </button>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => handleEquipSkin(skin.id)}
                            className="w-full py-2 rounded-xl bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#B88E43] hover:to-[#96702D] text-[#10131C] font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                          >
                            <Palette size={14} /> Equipar Skin
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2 rounded-xl bg-[#10131C] border border-[#343B50] text-[#A7B0C4] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed opacity-60"
                          >
                            <Lock size={13} /> Desbloqueie na Missão Tier {skin.id.endsWith('imperial') || skin.id.endsWith('estelar') || skin.id.endsWith('primordial') || skin.id.endsWith('celeste') || skin.id.endsWith('eclipse') || skin.id.endsWith('vazio') || skin.id.endsWith('crepusculo') || skin.id.endsWith('lobo') || skin.id.endsWith('prateado') || skin.id.endsWith('gladiador') || skin.id.endsWith('platina') || skin.id.endsWith('relampago') || skin.id.endsWith('maestro') || skin.id.endsWith('cosmico') || skin.id.endsWith('dourado') || skin.id.endsWith('celestial') ? '3' : '2'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function getTierLabel(tier: number): string {
  if (tier === 1) return 'INICIAÇÃO';
  if (tier === 2) return 'VETERANO';
  return 'SUPREMO';
}

function getClassGlyph(avatarKey?: string): React.ReactNode {
  switch (avatarKey) {
    case 'warrior':
      return <Shield size={20} />;
    case 'archer':
      return <Target size={20} />;
    case 'mage':
      return <Flame size={20} />;
    case 'cleric':
      return <HeartPulse size={20} />;
    case 'assassin':
      return <Zap size={20} />;
    case 'arcane_knight':
      return <Swords size={20} />;
    case 'necromancer':
      return <Skull size={20} />;
    case 'druid':
      return <TreePine size={20} />;
    case 'rune_mage':
      return <Wand2 size={20} />;
    case 'berserker':
      return <Flame size={20} />;
    case 'void_executioner':
      return <Zap size={20} />;
    case 'paladin':
      return <Sun size={20} />;
    case 'lancer':
      return <Navigation size={20} />;
    case 'bard':
      return <Music size={20} />;
    case 'ice_mage':
      return <Snowflake size={20} />;
    case 'sniper':
      return <Crosshair size={20} />;
    case 'electric_mage':
      return <Zap size={20} />;
    case 'wind_mage':
      return <RotateCw size={20} />;
    default:
      return <Shield size={20} />;
  }
}
