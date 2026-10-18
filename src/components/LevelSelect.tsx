import React, { useState } from 'react';
import { LEVELS } from '../data/levels';
import type { PlayerProgress } from '../types/game';
import {
  Lock,
  CheckCircle2,
  Play,
  Shield,
  Coins,
  Sparkles,
  Award,
  RotateCcw,
  Users,
  Flame,
  Skull,
  Compass,
  BookOpen,
  History,
  AlertTriangle,
  Swords,
  Package,
  Building2,
} from 'lucide-react';
import { CLASS_DEFINITIONS, CLASS_UNLOCK_CONDITIONS } from '../data/units';

interface LevelSelectProps {
  progress: PlayerProgress;
  onStartAdventure: () => void;
  onContinueAdventure: () => void;
  onAbandonAdventure: () => void;
  onChangeParty: () => void;
  onResetProgress: () => void;
  onOpenBestiary: () => void;
  onOpenHistory: () => void;
  onOpenEquipment?: () => void;
  onOpenItemBestiary?: () => void;
  onOpenItemCatalog?: () => void;
  onOpenBaseUpgrades?: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  progress,
  onStartAdventure,
  onContinueAdventure,
  onAbandonAdventure,
  onChangeParty,
  onResetProgress,
  onOpenBestiary,
  onOpenHistory,
  onOpenEquipment,
  onOpenItemBestiary,
  onOpenItemCatalog,
  onOpenBaseUpgrades,
}) => {
  const openCatalogHandler = onOpenItemCatalog || onOpenItemBestiary;
  const activeAdv = progress.activeAdventure;
  const currentStageNum = activeAdv ? activeAdv.currentLevelId : 1;

  // Default act based on active adventure or act 1
  const defaultAct = Math.min(5, Math.max(1, Math.ceil(currentStageNum / 10)));
  const [selectedAct, setSelectedAct] = useState<number | 'all'>(defaultAct);

  const adventureInventoryCount = activeAdv?.inventory?.length || 0;
  const discoveredItemsCount = progress.discoveredItemIds?.length || 0;

  const actTabs = [
    { id: 1, label: 'Ato I (1-10)', boss: 'Astaroth', range: [1, 10] },
    { id: 2, label: 'Ato II (11-20)', boss: 'Vulcanus', range: [11, 20] },
    { id: 3, label: 'Ato III (21-30)', boss: 'Valgar', range: [21, 30] },
    { id: 4, label: 'Ato IV (31-40)', boss: 'Leviatã', range: [31, 40] },
    { id: 5, label: 'Ato V (41-50)', boss: 'Malakor Supremo', range: [41, 50] },
    { id: 'all', label: 'Todas as Fases (1-50)', boss: '', range: [1, 50] },
  ] as const;

  const currentLevelInfo = LEVELS.find((l) => l.id === currentStageNum) || LEVELS[0];

  const filteredLevels = LEVELS.filter((level) => {
    if (selectedAct === 'all') return true;
    const tab = actTabs.find((t) => t.id === selectedAct);
    if (!tab) return true;
    return level.id >= tab.range[0] && level.id <= tab.range[1];
  });

  return (
    <div className="min-h-screen bg-[#10131C] text-[#F3F4F8] p-4 sm:p-8 flex flex-col items-center justify-center select-none font-sans">
      <div className="max-w-6xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#D4AD65]/10 border border-[#D4AD65]/30 text-[#D4AD65] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
            <Award size={16} /> RPG Tático — Modo Aventura Contínua (50 Fases)
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#F3F4F8] tracking-tight">
            Centro de Expedição
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B0C4] max-w-2xl mx-auto">
            Vença as 50 fases em uma única aventura! Se sua equipe cair, você reiniciará da Fase 1, mantendo para sempre todo o seu <strong className="text-[#F0B44D]">Ouro</strong>, todas as <strong className="text-[#4C8DFF]">Classes Desbloqueadas</strong>, seu <strong className="text-[#D4AD65]">Bestiário</strong> e seu <strong className="text-[#B58AFF]">Catálogo de Itens</strong>.
          </p>
        </div>

        {/* Action Hub Bar: Bestiary, History, and Gold/Party summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1B2030] border border-[#343B50] rounded-2xl p-3 sm:p-4 shadow-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenBestiary}
              className="px-3.5 py-2 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#D4AD65] text-[#D4AD65] font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Ver monstros já encontrados no jogo"
            >
              <BookOpen size={16} />
              <span>Bestiário</span>
              <span className="bg-[#D4AD65]/20 text-[#D4AD65] px-2 py-0.5 rounded-full text-[10px] font-black border border-[#D4AD65]/30">
                {progress.discoveredMonsterIds ? progress.discoveredMonsterIds.length : 0}
              </span>
            </button>

            <button
              onClick={onOpenHistory}
              className="px-3.5 py-2 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#4C8DFF] font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Ver histórico das últimas 10 aventuras"
            >
              <History size={16} />
              <span>Histórico de Aventuras</span>
              <span className="bg-[#4C8DFF]/20 text-[#4C8DFF] px-2 py-0.5 rounded-full text-[10px] font-black border border-[#4C8DFF]/30">
                {progress.adventureHistory ? progress.adventureHistory.length : 0}/10
              </span>
            </button>

            {onOpenEquipment && (
              <button
                onClick={onOpenEquipment}
                className="px-3.5 py-2 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#F0B44D] text-[#F0B44D] font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
                title="Ver e equipar itens nos heróis da aventura"
              >
                <Package size={16} />
                <span>Equipamentos</span>
                <span className="bg-[#F0B44D]/20 text-[#F0B44D] px-2 py-0.5 rounded-full text-[10px] font-black border border-[#F0B44D]/30">
                  {adventureInventoryCount}
                </span>
              </button>
            )}

            {openCatalogHandler && (
              <button
                onClick={openCatalogHandler}
                className="px-3.5 py-2 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#B58AFF] text-[#B58AFF] font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
                title="Catálogo permanente de todos os itens já descobertos"
              >
                <Sparkles size={16} />
                <span>Catálogo de Itens</span>
                <span className="bg-[#B58AFF]/20 text-[#B58AFF] px-2 py-0.5 rounded-full text-[10px] font-black border border-[#B58AFF]/30">
                  {discoveredItemsCount}/60
                </span>
              </button>
            )}

            {onOpenBaseUpgrades && (
              <button
                onClick={onOpenBaseUpgrades}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AD65]/20 to-[#F0B44D]/25 border-2 border-[#D4AD65] hover:border-[#FFF0B3] text-[#F3F4F8] hover:text-white font-black text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#D4AD65]/15"
                title="Acessar Upgrades de Classe, Melhorias Gerais e Forja do Catálogo"
              >
                <Building2 size={16} className="text-[#FFD700]" />
                <span>Base & Upgrades</span>
                <span className="bg-[#FFD700] text-[#10131C] px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider">
                  Base
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#F0B44D] font-bold bg-[#10131C] px-3 py-1.5 rounded-xl border border-[#343B50]">
              <Coins size={16} />
              <span>Ouro Acumulado:</span>
              <strong className="text-sm font-black text-white">{progress.gold}</strong>
            </div>

            <button
              onClick={onChangeParty}
              disabled={!!activeAdv}
              title={
                activeAdv
                  ? 'A equipe está travada durante a aventura. Conclua as 50 fases ou abandone a expedição para trocar de equipe.'
                  : 'Alterar composição da equipe de 4 heróis'
              }
              className={`px-3.5 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
                activeAdv
                  ? 'bg-[#10131C]/60 border-[#343B50]/40 text-[#A7B0C4]/40 cursor-not-allowed'
                  : 'bg-[#10131C] border-[#343B50] hover:border-[#43C878] text-[#43C878] hover:scale-105 active:scale-95 cursor-pointer'
              }`}
            >
              {activeAdv ? <Lock size={16} /> : <Users size={16} />}
              <span>{activeAdv ? 'Equipe Travada' : 'Alterar Equipe'}</span>
            </button>
          </div>
        </div>

        {/* Central Adventure CTA Card */}
        {activeAdv ? (
          <div className="bg-gradient-to-r from-[#1B2030] via-[#22293E] to-[#1B2030] border-2 border-[#D4AD65] rounded-3xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-48 h-48 bg-[#D4AD65]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AD65]/20 text-[#D4AD65] text-xs font-black uppercase tracking-wider border border-[#D4AD65]/40 mb-2">
                  <Swords size={14} /> {activeAdv?.battleState ? `Batalha em Andamento (Turno ${activeAdv.battleState.turnNumber})` : 'Aventura em Andamento'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                  {activeAdv?.battleState ? `Retomar Batalha: Fase ${currentStageNum} de 50` : `Próxima Batalha: Fase ${currentStageNum} de 50`}
                </h2>
                <p className="text-xs sm:text-sm text-[#A7B0C4] mt-1">
                  {currentLevelInfo.name} — <span className="text-[#D4AD65] font-semibold">{currentLevelInfo.subtitle}</span>
                </p>
                <div className="flex items-center gap-3 text-xs text-[#A7B0C4] mt-2">
                  <span>Recompensa: <strong className="text-[#F0B44D]">+{currentLevelInfo.rewards.gold} Ouro</strong></span>
                  <span>•</span>
                  <span>XP: <strong className="text-[#B58AFF]">+{currentLevelInfo.rewards.xpPerUnit} por herói</strong></span>
                  {currentLevelInfo.hasFinalBoss && (
                    <span className="text-[#FF5252] font-black uppercase flex items-center gap-1 bg-[#FF5252]/15 px-2 py-0.5 rounded-full border border-[#FF5252]/30">
                      <Flame size={12} /> Confronto com Boss!
                    </span>
                  )}
                  {currentLevelInfo.hasMiniBoss && (
                    <span className="text-[#F59E0B] font-bold uppercase flex items-center gap-1 bg-[#F59E0B]/15 px-2 py-0.5 rounded-full border border-[#F59E0B]/30">
                      <Flame size={12} /> Mini-Boss!
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={onContinueAdventure}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-[#D4AD65] via-[#E5C27E] to-[#B88E43] hover:from-[#E5C27E] hover:to-[#A77E36] text-[#10131C] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#D4AD65]/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Play size={18} fill="currentColor" /> {activeAdv?.battleState ? `Retomar Batalha (Fase ${currentStageNum})` : `Continuar Aventura (Fase ${currentStageNum})`}
                </button>

                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Deseja realmente abandonar a aventura atual na Fase ${currentStageNum}? O resultado será arquivado no Histórico e você poderá iniciar uma nova da Fase 1.`
                      )
                    ) {
                      onAbandonAdventure();
                    }
                  }}
                  className="px-4 py-4 rounded-2xl bg-[#10131C] border border-[#343B50] hover:border-[#E65353] text-[#A7B0C4] hover:text-[#E65353] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                >
                  <AlertTriangle size={14} /> Abandonar
                </button>
              </div>
            </div>

            {/* Active Heroes in this Adventure */}
            <div className="border-t border-[#343B50] pt-4">
              <div className="text-xs font-bold text-[#A7B0C4] uppercase tracking-wider mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={14} /> Heróis Desta Expedição
                </div>
                <span className="text-[10px] text-[#D4AD65] bg-[#D4AD65]/10 border border-[#D4AD65]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold normal-case">
                  <Lock size={11} /> Equipe travada na aventura em andamento
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(activeAdv.partyClasses || progress.selectedPartyClasses).map((cKey) => {
                  const classDef = CLASS_DEFINITIONS[cKey];
                  const uState = activeAdv.unitsState[cKey] || progress.unitsState[cKey];
                  if (!classDef || !uState) return null;

                  return (
                    <div
                      key={cKey}
                      className="bg-[#10131C] p-3 rounded-xl border border-[#343B50] flex items-center gap-3"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow text-xs"
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
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#1B2030] via-[#22293E] to-[#1B2030] border-2 border-[#343B50] hover:border-[#D4AD65]/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#D4AD65]/15 border border-[#D4AD65]/40 text-[#D4AD65] flex items-center justify-center mx-auto shadow-lg">
              <Compass size={32} />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Pronto para Iniciar uma Nova Aventura?
              </h2>
              <p className="text-xs sm:text-sm text-[#A7B0C4] max-w-lg mx-auto">
                Sua equipe começará na Fase 1 e subirá de nível e aprenderá habilidades ao longo do caminho até o confronto final com o Dragão Malakor Supremo na Fase 50!
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={onStartAdventure}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4AD65] via-[#E5C27E] to-[#B88E43] hover:from-[#E5C27E] hover:to-[#A77E36] text-[#10131C] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#D4AD65]/20 transition-all hover:scale-105 active:scale-95"
              >
                <Play size={18} fill="currentColor" /> Iniciar Nova Aventura (Fase 1)
              </button>
            </div>

            {/* Current Party Preview */}
            <div className="border-t border-[#343B50] pt-4 max-w-2xl mx-auto">
              <div className="text-xs font-bold text-[#A7B0C4] uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
                <Shield size={14} /> Equipe Selecionada (4 Heróis)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {progress.selectedPartyClasses.map((cKey) => {
                  const classDef = CLASS_DEFINITIONS[cKey];
                  if (!classDef) return null;

                  return (
                    <div
                      key={cKey}
                      className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] flex items-center gap-2.5"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow text-xs shrink-0"
                        style={{ backgroundColor: classDef.color }}
                      >
                        Nv.1
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="font-bold text-xs text-[#F3F4F8] truncate">{classDef.name}</div>
                        <div className="text-[10px] text-[#A7B0C4]">Iniciará Nv. 1</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Roadmap & Act Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#A7B0C4] flex items-center gap-2">
              <Compass size={16} className="text-[#D4AD65]" /> Mapa da Campanha (50 Fases)
            </h3>
            <span className="text-xs text-[#A7B0C4]">
              {activeAdv ? `Progresso Atual: Fase ${activeAdv.currentLevelId}/50` : 'Inicie para avançar'}
            </span>
          </div>

          {/* Act Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap pb-1">
            {actTabs.map((tab) => {
              const isActive = selectedAct === tab.id;
              const isTabReached = tab.id === 'all' || tab.range[0] <= currentStageNum;

              return (
                <button
                  key={String(tab.id)}
                  onClick={() => setSelectedAct(tab.id)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#D4AD65] text-[#10131C] shadow-lg shadow-[#D4AD65]/20 scale-105'
                      : isTabReached
                      ? 'bg-[#1B2030] border border-[#343B50] text-[#A7B0C4] hover:text-white hover:border-[#D4AD65]/50'
                      : 'bg-[#10131C] border border-[#343B50]/40 text-[#A7B0C4]/40 cursor-pointer'
                  }`}
                >
                  {tab.id === 5 ? <Skull size={14} /> : <Compass size={14} />}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Stages Grid Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {filteredLevels.map((level) => {
              const isPastStage = activeAdv ? level.id < activeAdv.currentLevelId : false;
              const isCurrentStage = activeAdv ? level.id === activeAdv.currentLevelId : level.id === 1;

              // Check if this level unlocks a class
              const unlockEntry = Object.entries(CLASS_UNLOCK_CONDITIONS).find(
                ([, cond]) => cond.requiredLevel === level.id
              );
              const unlockedClassName = unlockEntry
                ? CLASS_DEFINITIONS[unlockEntry[0]]?.name
                : null;

              return (
                <div
                  key={level.id}
                  className={`bg-[#1B2030] border-2 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                    isCurrentStage
                      ? 'border-[#D4AD65] shadow-xl shadow-[#D4AD65]/20 scale-[1.02] bg-[#22293E]'
                      : isPastStage
                      ? 'border-[#43C878]/60 opacity-80'
                      : level.hasFinalBoss
                      ? 'border-[#9333EA]/60'
                      : level.hasMiniBoss
                      ? 'border-[#F59E0B]/60'
                      : 'border-[#343B50]/60 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#10131C] text-[#D4AD65] border border-[#343B50]">
                        Fase {level.id}
                      </span>
                      {isPastStage ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-[#43C878] bg-[#43C878]/10 px-1.5 py-0.5 rounded-full border border-[#43C878]/30">
                          <CheckCircle2 size={10} /> Concluída
                        </span>
                      ) : isCurrentStage ? (
                        <span className="flex items-center gap-1 text-[9px] font-black text-[#D4AD65] bg-[#D4AD65]/20 px-2 py-0.5 rounded-full border border-[#D4AD65] animate-pulse">
                          Atual
                        </span>
                      ) : level.hasFinalBoss ? (
                        <span className="flex items-center gap-1 text-[9px] font-black text-[#FF5252] bg-[#FF5252]/15 px-2 py-0.5 rounded-full border border-[#FF5252]/40">
                          <Flame size={10} /> BOSS
                        </span>
                      ) : level.hasMiniBoss ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-[#F59E0B] bg-[#F59E0B]/15 px-2 py-0.5 rounded-full border border-[#F59E0B]/40">
                          <Flame size={10} /> MINI-BOSS
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-[#A7B0C4] bg-[#10131C] px-1.5 py-0.5 rounded-full">
                          <Lock size={10} /> Fase {level.id}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs text-[#F3F4F8] line-clamp-1">
                      {level.name.split('—')[1] || level.name}
                    </h4>
                    <p className="text-[10px] text-[#D4AD65] font-semibold line-clamp-1">{level.subtitle}</p>

                    {/* Class unlock reward banner */}
                    {unlockedClassName && (
                      <div className="mt-2 py-0.5 px-1.5 rounded bg-[#D4AD65]/15 border border-[#D4AD65]/30 text-[9px] font-bold text-[#D4AD65] flex items-center gap-1">
                        <Sparkles size={10} /> Libera {unlockedClassName}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#343B50] space-y-1 text-[10px] text-[#A7B0C4]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-0.5 text-[#F0B44D]">
                        <Coins size={12} /> +{level.rewards.gold}
                      </span>
                      <span className="flex items-center gap-0.5 text-[#B58AFF]">
                        <Sparkles size={12} /> +{level.rewards.xpPerUnit} XP
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Reset Option */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => {
              if (confirm('Deseja reiniciar todo o progresso salvo no navegador? (Isso resetará o ouro, classes e histórico)')) {
                onResetProgress();
              }
            }}
            className="text-xs text-[#A7B0C4] hover:text-[#E65353] flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={14} /> Reiniciar Dados Locais Completos
          </button>
        </div>
      </div>
    </div>
  );
};
