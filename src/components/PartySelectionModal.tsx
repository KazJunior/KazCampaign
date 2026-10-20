import React, { useState } from 'react';
import { CLASS_DEFINITIONS, CLASS_UNLOCK_CONDITIONS } from '../data/units';
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
  X,
} from 'lucide-react';

interface PartySelectionModalProps {
  initialSelected: string[];
  unlockedClasses: string[];
  playerGold?: number;
  onBuyClass?: (className: string, cost: number) => void;
  onConfirmParty: (selectedClasses: string[]) => void;
  onClose?: () => void;
}

export const PartySelectionModal: React.FC<PartySelectionModalProps> = ({
  initialSelected,
  unlockedClasses,
  playerGold = 0,
  onBuyClass,
  onConfirmParty,
  onClose,
}) => {
  const [selected, setSelected] = useState<string[]>(
    initialSelected.length === 4
      ? initialSelected.filter((c) => unlockedClasses.includes(c))
      : ['guerreiro', 'arqueiro', 'mago', 'curandeiro']
  );

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

            return (
              <div
                key={cKey}
                onClick={() => toggleClass(cKey)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between relative ${
                  !isUnlocked
                    ? isSecret
                      ? 'bg-[#120D1D]/90 border-[#7B2CBF]/40 opacity-75 cursor-not-allowed shadow-inner shadow-[#7B2CBF]/10'
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
                        ) : isPurchasable ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#F0B44D]/20 border border-[#F0B44D]/60 text-[#F0B44D]">
                            100.000 🪙
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
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow border border-white/20 shrink-0 ${
                        !isUnlocked
                          ? isSecret
                            ? 'bg-[#3C096C]/80 text-[#C77DFF]'
                            : isPurchasable
                            ? 'brightness-90'
                            : 'grayscale brightness-75'
                          : ''
                      }`}
                      style={{ backgroundColor: !isUnlocked && isSecret ? undefined : classDef.color }}
                    >
                      {!isUnlocked && isSecret ? <HelpCircle size={22} /> : getClassIcon(classDef.avatarKey, 22)}
                    </div>
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
                        {canAfford ? 'Comprar (100k 🪙)' : '100.000 Ouro'}
                      </button>
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
            onClick={() => onConfirmParty(selected)}
            className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all ${
              isComplete
                ? 'bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#B88E43] hover:to-[#96702D] text-[#10131C] active:scale-95 cursor-pointer'
                : 'bg-[#10131C] text-[#A7B0C4]/40 border border-[#343B50] cursor-not-allowed'
            }`}
          >
            <Play size={16} fill="currentColor" /> CONFIRMAR EQUIPE & JOGAR
          </button>
        </div>
      </div>
    </div>
  );
};

function getClassIcon(avatarKey: string, size = 20) {
  switch (avatarKey) {
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
    default:
      return <Sparkles size={size} />;
  }
}
