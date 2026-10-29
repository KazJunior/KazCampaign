import React, { useState } from 'react';
import { CLASS_DEFINITIONS, CLASS_UNLOCK_CONDITIONS } from '../data/units';
import type { PlayerProgress } from '../types/game';
import { ClassUnlockQuestsModal } from './ClassUnlockQuestsModal';
import { getEquippedSkin } from '../data/classQuests';
import { LineageSelectionModal } from './LineageSelectionModal';
import { getLineageById, DEFAULT_CLASS_LINEAGES } from '../data/lineages';
import { ClassLineageAvatar } from './ClassLineageAvatar';
import {
  Shield,
  Swords,
  HeartPulse,
  Footprints,
  Target,
  Check,
  Play,
  Sparkles,
  Skull,
  BookOpen,
  Flame,
  HelpCircle,
  Coins,
  Music,
  Snowflake,
  Sun,
  Crosshair,
  TreePine,
  Wind,
  Zap,
  X,
  Palette,
} from 'lucide-react';

interface PartySelectionModalProps {
  progress?: PlayerProgress;
  initialSelected: string[];
  unlockedClasses: string[];
  playerGold?: number;
  equippedClassSkins?: Record<string, string>;
  initialLineages?: Record<string, string>;
  onBuyClass?: (className: string, cost: number) => void;
  onConfirmParty: (selectedClasses: string[], partyLineages: Record<string, string>) => void;
  onOpenClassMissions?: () => void;
  onClose?: () => void;
}

export const PartySelectionModal: React.FC<PartySelectionModalProps> = ({
  initialSelected,
  unlockedClasses,
  playerGold = 0,
  equippedClassSkins,
  initialLineages,
  progress,
  onBuyClass,
  onConfirmParty,
  onOpenClassMissions,
  onClose,
}) => {
  const [selected, setSelected] = useState<string[]>(
    initialSelected.length === 4
      ? initialSelected.filter((c) => unlockedClasses.includes(c))
      : ['guerreiro', 'arqueiro', 'mago', 'curandeiro']
  );

  const [partyLineages, setPartyLineages] = useState<Record<string, string>>(() => {
    const init = { ...DEFAULT_CLASS_LINEAGES, ...(initialLineages || {}) };
    return init;
  });
  const [lineageModalClass, setLineageModalClass] = useState<string | null>(null);
  const [showUnlockQuestsModal, setShowUnlockQuestsModal] = useState<boolean>(false);

  const allClasses = Object.keys(CLASS_DEFINITIONS);

  const toggleClass = (className: string) => {
    // Cannot select locked classes
    if (!unlockedClasses.includes(className)) return;

    if (selected.includes(className)) {
      setSelected(selected.filter((c) => c !== className));
    } else {
      if (selected.length < 4) {
        setSelected([...selected, className]);
      }
    }
  };

  const isComplete = selected.length === 4;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans">
      <div className="bg-[#1B2030] border-2 border-[#D4AD65] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 max-w-5xl w-full shadow-2xl text-[#F3F4F8] space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3.5 sm:top-5 right-3.5 sm:right-5 p-1.5 sm:p-2 rounded-xl bg-[#10131C] border border-[#343B50] text-[#A7B0C4] hover:text-white hover:border-[#D4AD65] transition-all cursor-pointer"
            title="Fechar Seleção"
          >
            <X size={18} />
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 bg-[#D4AD65]/10 border border-[#D4AD65]/30 text-[#D4AD65] px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} /> Seleção da Equipe de Heróis & Recrutamento
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-[#F3F4F8]">
            Escolha 4 Heróis para a Campanha
          </h2>
          <p className="text-[11px] sm:text-xs text-[#A7B0C4]">
            Monte seu grupo tático ou recrute novos heróis lendários por 100.000 de Ouro cada!
          </p>
        </div>

        {/* Counter & Gold Badges */}
        <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10131C] border border-[#F0B44D]/50 text-[#F0B44D] font-black text-xs sm:text-sm shadow-inner">
            <Coins size={14} />
            <span>Ouro: {playerGold.toLocaleString('pt-BR')}</span>
          </div>

          <span
            className={`px-3 py-1 rounded-full font-bold text-xs sm:text-sm border flex items-center gap-1.5 ${
              isComplete
                ? 'bg-[#43C878]/20 border-[#43C878] text-[#43C878]'
                : 'bg-[#F0B44D]/20 border-[#F0B44D] text-[#F0B44D]'
            }`}
          >
            <Shield size={14} /> {selected.length} / 4 Heróis
          </span>

          <span className="px-2.5 py-1 rounded-full font-bold text-[11px] sm:text-xs bg-[#10131C] border border-[#343B50] text-[#D4AD65]">
            {unlockedClasses.length} de {allClasses.length} Desbloqueadas
          </span>

          <button
            onClick={() => setShowUnlockQuestsModal(true)}
            className="px-3 py-1 rounded-full font-bold text-[11px] sm:text-xs bg-amber-500/20 border border-amber-400 text-amber-300 hover:bg-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Abrir Missões de Desbloqueio de Linhagens Ancestrais"
          >
            <Flame size={13} className="text-[#FF5722]" />
            <span>Missões de Linhagens</span>
          </button>

          {onOpenClassMissions && (
            <button
              onClick={onOpenClassMissions}
              className="px-3 py-1 rounded-full font-bold text-[11px] sm:text-xs bg-purple-500/20 border border-purple-400 text-purple-300 hover:bg-purple-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Abrir Missões de Classe & Guarda-Roupa"
            >
              <Palette size={13} />
              <span>Missões & Skins</span>
            </button>
          )}
        </div>

        {/* Selected Party & Lineages Bar */}
        <div className="bg-[#10131C] border border-[#343B50] rounded-2xl p-3 sm:p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#FFD700]" />
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                Equipe Escolhida & Linhagens Ancestrais ({selected.length}/4)
              </h3>
            </div>
            <span className="text-[11px] text-[#A7B0C4] hidden sm:inline">
              Clique na Linhagem para alterá-la antes de iniciar a aventura
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[0, 1, 2, 3].map((slotIdx) => {
              const cKey = selected[slotIdx];
              if (!cKey) {
                return (
                  <div
                    key={slotIdx}
                    className="p-3 rounded-xl border border-dashed border-[#343B50] bg-[#161B26]/50 flex items-center justify-center text-xs text-[#A7B0C4]/60 font-bold"
                  >
                    + Vaga #{slotIdx + 1} Livre
                  </div>
                );
              }

              const cDef = CLASS_DEFINITIONS[cKey];
              const linId = partyLineages[cKey] || DEFAULT_CLASS_LINEAGES[cKey] || 'humano';
              const lineage = getLineageById(linId);

              return (
                <div
                  key={cKey}
                  className="bg-[#1B2030] border-2 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-sm transition-all"
                  style={{ borderColor: `${cDef.color}60` }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ClassLineageAvatar lineageId={linId} classColor={cDef.color} size="sm">
                      {getClassIcon(cDef.avatarKey, 16)}
                    </ClassLineageAvatar>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white truncate">{cDef.name}</div>
                      <div className="text-[10px] text-[#A7B0C4] truncate">{cDef.role.split('&')[0]}</div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLineageModalClass(cKey);
                    }}
                    className="px-2 py-1 rounded-lg border text-left flex flex-col shrink-0 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    style={{
                      backgroundColor: `${lineage.color}15`,
                      borderColor: `${lineage.color}50`,
                    }}
                    title={`Linhagem ${lineage.name}: ${lineage.bonusDescription} (Clique para trocar)`}
                  >
                    <span className="text-[9px] uppercase font-bold" style={{ color: lineage.color }}>
                      Linhagem
                    </span>
                    <span className="text-[10px] font-black text-white flex items-center gap-1">
                      🧬 {lineage.name}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Class Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {allClasses.map((cKey) => {
            const classDef = CLASS_DEFINITIONS[cKey];
            const isUnlocked = unlockedClasses.includes(cKey);
            const isSelected = selected.includes(cKey);
            const unlockCondition = CLASS_UNLOCK_CONDITIONS[cKey];
            const isSecret = !!classDef.isSecret;
            const goldCost = classDef.goldCost;
            const isPurchasable = typeof goldCost === 'number';
            const canAfford = isPurchasable && playerGold >= goldCost;
            const isDropOnly = !!(classDef as any).isDropOnly || cKey === 'sniper';
            const equippedSkin = getEquippedSkin(cKey, equippedClassSkins);
            const cardLineageId = partyLineages[cKey] || DEFAULT_CLASS_LINEAGES[cKey] || 'humano';
            const cardLineage = getLineageById(cardLineageId);

            return (
              <div
                key={cKey}
                onClick={() => toggleClass(cKey)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between relative ${
                  !isUnlocked
                    ? isSecret
                      ? 'bg-[#120D1D]/90 border-[#7B2CBF]/40 opacity-75 cursor-not-allowed shadow-inner shadow-[#7B2CBF]/10'
                      : isDropOnly
                      ? 'bg-[#081b24]/90 border-[#06B6D4]/40 shadow-sm shadow-[#06B6D4]/10'
                      : isPurchasable
                      ? 'bg-[#161B26]/95 border-[#F0B44D]/40 hover:border-[#F0B44D] shadow-sm shadow-[#F0B44D]/10'
                      : 'bg-[#0B0D13]/90 border-[#343B50]/50 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? isSecret
                      ? 'bg-[#181126] border-[#9D4EDD] shadow-lg shadow-[#9D4EDD]/30 scale-[1.02] cursor-pointer'
                      : 'bg-[#10131C] border-[#4C8DFF] shadow-lg shadow-[#4C8DFF]/20 scale-[1.02] cursor-pointer'
                    : isSecret
                    ? 'bg-[#140E20]/80 border-[#7B2CBF]/60 hover:border-[#9D4EDD] opacity-95 cursor-pointer shadow-sm shadow-[#7B2CBF]/20'
                    : 'bg-[#10131C]/60 border-[#343B50] hover:border-[#D4AD65]/60 opacity-90 cursor-pointer'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Top Status & Badge Header */}
                  <div className="flex items-center justify-between min-h-[22px] gap-1">
                    <div>
                      {!isUnlocked ? (
                        isSecret ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#7B2CBF]/30 border border-[#9D4EDD]/60 text-[#C77DFF]">
                            Oculta
                          </span>
                        ) : isDropOnly ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#06B6D4]/20 border border-[#06B6D4]/60 text-[#38BDF8]">
                            Drop Raro (1%)
                          </span>
                        ) : isPurchasable ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#F0B44D]/20 border border-[#F0B44D]/60 text-[#F0B44D]">
                            {goldCost.toLocaleString('pt-BR')} 🪙
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#E65353]/20 border border-[#E65353]/50 text-[#E65353]">
                            Bloqueada
                          </span>
                        )
                      ) : isSecret ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#9D4EDD]/20 border border-[#9D4EDD]/60 text-[#C77DFF]">
                          Secreta
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#A7B0C4]/70">
                          {classDef.role.split('&')[0].trim()}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <div
                        className={`text-white p-1 rounded-full shadow flex items-center justify-center ${
                          isSecret ? 'bg-[#9D4EDD]' : 'bg-[#4C8DFF]'
                        }`}
                        title="Herói Selecionado"
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Class Identity: Avatar + Name & Subtitle */}
                  <div className="flex items-center gap-3">
                    {!isUnlocked ? (
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow border border-white/20 shrink-0 ${
                          isSecret
                            ? 'bg-[#3C096C]/80 text-[#C77DFF]'
                            : isPurchasable
                            ? 'brightness-90'
                            : 'grayscale brightness-75'
                        }`}
                        style={{
                          backgroundColor: isSecret ? undefined : classDef.color,
                        }}
                      >
                        {isSecret ? <HelpCircle size={22} /> : getClassIcon(classDef.avatarKey, 22)}
                      </div>
                    ) : (
                      <ClassLineageAvatar
                        lineageId={cardLineageId}
                        classColor={equippedSkin ? equippedSkin.color : classDef.color}
                        size="lg"
                      >
                        {getClassIcon(classDef.avatarKey, 22)}
                      </ClassLineageAvatar>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-[#F3F4F8] leading-tight" title={classDef.name}>
                        {!isUnlocked && isSecret ? '??? — Oculta' : classDef.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold block leading-tight mt-0.5 truncate ${
                          isSecret ? 'text-[#C77DFF]' : isPurchasable ? 'text-[#F0B44D]' : 'text-[#D4AD65]'
                        }`}
                      >
                        {!isUnlocked && isSecret ? 'Classe Secreta' : classDef.role}
                      </span>
                    </div>
                  </div>

                  {isUnlocked && (
                    <div className="flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLineageModalClass(cKey);
                        }}
                        className="flex-1 flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all hover:scale-[1.02] cursor-pointer"
                        style={{
                          backgroundColor: `${cardLineage.color}18`,
                          borderColor: `${cardLineage.color}55`,
                          color: cardLineage.color,
                        }}
                        title={`Visual e Bônus da Linhagem ${cardLineage.name}: ${cardLineage.bonusDescription} (Clique para alterar)`}
                      >
                        <span className="truncate">🧬 Linhagem: <strong className="text-white">{cardLineage.name}</strong></span>
                        <span className="text-[9px] underline opacity-85 shrink-0">Trocar</span>
                      </button>
                    </div>
                  )}

                  {isUnlocked && equippedSkin && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 border border-white/5 text-[9px]">
                      <span
                        className="font-black tracking-wider uppercase px-1 rounded text-[8px]"
                        style={{
                          backgroundColor: `${equippedSkin.color}25`,
                          color: equippedSkin.color,
                          border: `1px solid ${equippedSkin.color}50`,
                        }}
                      >
                        {equippedSkin.badge}
                      </span>
                      <span className="text-[#F3F4F8] truncate font-medium">
                        {equippedSkin.name}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-[#A7B0C4] leading-relaxed line-clamp-2">
                    {!isUnlocked && isSecret
                      ? 'Uma entidade envolta em mistério. Há rumores de um enigma nas profundezas do Abismo...'
                      : classDef.description}
                  </p>
                </div>

                {/* Unlock condition hint or purchase button */}
                {!isUnlocked && (
                  <div className="mt-3">
                    {isPurchasable ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canAfford && onBuyClass) {
                            onBuyClass(cKey, goldCost);
                          }
                        }}
                        disabled={!canAfford}
                        className={`w-full py-2 px-2.5 rounded-xl font-black text-[11px] uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-md transition-all ${
                          canAfford
                            ? 'bg-gradient-to-r from-[#F0B44D] to-[#D4AD65] hover:from-[#FFF0B3] hover:to-[#F0B44D] text-[#10131C] active:scale-95 cursor-pointer ring-2 ring-[#F0B44D]/50'
                            : 'bg-[#10131C] border border-[#343B50] text-[#A7B0C4]/40 cursor-not-allowed'
                        }`}
                      >
                        <Coins size={14} />
                        {canAfford ? `Comprar (${goldCost >= 1000 ? `${goldCost / 1000}k` : goldCost} 🪙)` : `${goldCost.toLocaleString('pt-BR')} Ouro`}
                      </button>
                    ) : isDropOnly ? (
                      <div className="p-2 rounded-xl text-[10px] leading-tight bg-[#042f2e]/50 border border-[#0d9488]/60 text-[#5eead4]">
                        🎯 Drop Raro: 1% de chance de obtenção ao vencer qualquer fase!
                      </div>
                    ) : (
                      <div
                        className={`p-2 rounded-xl text-[10px] leading-tight ${
                          isSecret
                            ? 'bg-[#240046]/40 border border-[#7B2CBF]/40 text-[#E0AAFF]'
                            : 'bg-[#10131C] border border-[#E65353]/30 text-[#F87171]'
                        }`}
                      >
                        {isSecret
                          ? '🔮 Condição de desbloqueio secreta!'
                          : unlockCondition
                          ? `🔒 ${unlockCondition.description}`
                          : '🔒 Desbloqueio especial'}
                      </div>
                    )}
                  </div>
                )}

                {/* Base Stats Pills */}
                <div className="mt-4 pt-3 border-t border-[#343B50] grid grid-cols-3 gap-1 text-[11px]">
                  <div className="bg-[#1B2030] p-1 rounded text-center">
                    <span className="text-[#A7B0C4] block text-[9px]">HP</span>
                    <strong className="text-[#E94F5F]">{!isUnlocked && isSecret ? '???' : classDef.maxHp}</strong>
                  </div>
                  <div className="bg-[#1B2030] p-1 rounded text-center">
                    <span className="text-[#A7B0C4] block text-[9px]">ATK/MAG</span>
                    <strong className="text-[#FF5252]">
                      {!isUnlocked && isSecret ? '???' : Math.max(classDef.atk, classDef.mag)}
                    </strong>
                  </div>
                  <div className="bg-[#1B2030] p-1 rounded text-center">
                    <span className="text-[#A7B0C4] block text-[9px]">MOV</span>
                    <strong className="text-[#4C8DFF]">{!isUnlocked && isSecret ? '???' : classDef.mov}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider bg-[#10131C] hover:bg-[#343B50] text-[#A7B0C4] border border-[#343B50] transition-all"
            >
              Voltar ao Menu
            </button>
          )}

          <button
            disabled={!isComplete}
            onClick={() => onConfirmParty(selected, partyLineages)}
            className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all ${
              isComplete
                ? 'bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#B88E43] hover:to-[#96702D] text-[#10131C] active:scale-95 cursor-pointer'
                : 'bg-[#10131C] text-[#A7B0C4]/40 border border-[#343B50] cursor-not-allowed'
            }`}
          >
            <Play size={16} fill="currentColor" /> CONFIRMAR EQUIPE & JOGAR
          </button>
        </div>
{showUnlockQuestsModal && (
          <ClassUnlockQuestsModal
            progress={progress || { unlockedClasses } as any}
            onClose={() => setShowUnlockQuestsModal(false)}
          />
        )}

        {lineageModalClass && (
          <LineageSelectionModal
            progress={progress}
            unlockedLineages={progress?.unlockedLineages}
            classNameKey={lineageModalClass}
            heroName={CLASS_DEFINITIONS[lineageModalClass]?.name}
            currentLineageId={partyLineages[lineageModalClass] || DEFAULT_CLASS_LINEAGES[lineageModalClass] || 'humano'}
            onSelectLineage={(cKey, linId) => {
              setPartyLineages((prev) => ({
                ...prev,
                [cKey]: linId,
              }));
            }}
            onClose={() => setLineageModalClass(null)}
          />
        )}
      </div>
    </div>
  );
};

function getClassIcon(avatarKey: string, size = 20) {
  switch (avatarKey) {
    case 'dragonoid':
    case 'warrior':
      return <Shield size={size} />;
    case 'archer':
      return <Target size={size} />;
    case 'mage':
      return <Flame size={size} />;
    case 'cleric':
      return <HeartPulse size={size} />;
    case 'assassin':
      return <Footprints size={size} />;
    case 'arcane_knight':
      return <Swords size={size} />;
    case 'necromancer':
      return <Skull size={size} />;
    case 'druid':
      return <TreePine size={size} />;
    case 'engineer':
      return <TreePine size={size} />;
    case 'rune_mage':
      return <BookOpen size={size} />;
    case 'berserker':
      return <Flame size={size} />;
    case 'void_executioner':
      return <Swords size={size} />;
    case 'paladin':
      return <Sun size={size} />;
    case 'lancer':
      return <Crosshair size={size} />;
    case 'bard':
      return <Music size={size} />;
    case 'ice_mage':
      return <Snowflake size={size} />;
    case 'sniper':
      return <Crosshair size={size} />;
    case 'electric_mage':
      return <Zap size={size} />;
    case 'wind_mage':
      return <Wind size={size} />;
    default:
      return <Sparkles size={size} />;
  }
}
