import React, { useState } from 'react';
import { CLASS_DEFINITIONS } from '../data/units';
import { Shield, Swords, Wand2, HeartPulse, Footprints, Target, Check, Play, Sparkles, Skull, Wrench, BookOpen, Flame } from 'lucide-react';

interface PartySelectionModalProps {
  initialSelected: string[];
  onConfirmParty: (selectedClasses: string[]) => void;
}

export const PartySelectionModal: React.FC<PartySelectionModalProps> = ({
  initialSelected,
  onConfirmParty,
}) => {
  const [selected, setSelected] = useState<string[]>(
    initialSelected.length === 4 ? initialSelected : ['guerreiro', 'arqueiro', 'mago', 'curandeiro']
  );

  const allClasses = Object.keys(CLASS_DEFINITIONS);

  const toggleClass = (className: string) => {
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-[#1B2030] border-2 border-[#D4AD65] rounded-3xl p-6 max-w-4xl w-full shadow-2xl text-[#F3F4F8] space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 bg-[#D4AD65]/10 border border-[#D4AD65]/30 text-[#D4AD65] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} /> Seleção da Equipe de Heróis
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F8]">
            Escolha 4 Heróis para a Campanha
          </h2>
          <p className="text-xs text-[#A7B0C4]">
            Monte seu grupo tático de 4 classes entre as 6 opções disponíveis.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex justify-center">
          <span
            className={`px-4 py-1.5 rounded-full font-bold text-sm border flex items-center gap-2 ${
              isComplete
                ? 'bg-[#43C878]/20 border-[#43C878] text-[#43C878]'
                : 'bg-[#F0B44D]/20 border-[#F0B44D] text-[#F0B44D]'
            }`}
          >
            <Shield size={16} /> Equipe: {selected.length} / 4 Selecionados
          </span>
        </div>

        {/* Class Cards Grid (10 Options) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {allClasses.map((cKey) => {
            const classDef = CLASS_DEFINITIONS[cKey];
            const isSelected = selected.includes(cKey);

            return (
              <div
                key={cKey}
                onClick={() => toggleClass(cKey)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                  isSelected
                    ? 'bg-[#10131C] border-[#4C8DFF] shadow-lg shadow-[#4C8DFF]/20 scale-[1.02]'
                    : 'bg-[#10131C]/60 border-[#343B50] hover:border-[#D4AD65]/60 opacity-80'
                }`}
              >
                {/* Selected indicator checkmark */}
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-[#4C8DFF] text-white p-1 rounded-full shadow">
                    <Check size={14} />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow border border-white/20"
                      style={{ backgroundColor: classDef.color }}
                    >
                      {getClassIcon(classDef.avatarKey, 24)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#F3F4F8]">{classDef.name}</h3>
                      <span className="text-[10px] font-bold text-[#D4AD65]">{classDef.role}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#A7B0C4] leading-relaxed line-clamp-2">
                    {classDef.description}
                  </p>
                </div>

                {/* Base Stats Pills */}
                <div className="mt-4 pt-3 border-t border-[#343B50] grid grid-cols-3 gap-1 text-[11px]">
                  <div className="bg-[#1B2030] p-1 rounded text-center">
                    <span className="text-[#A7B0C4] block text-[9px]">HP</span>
                    <strong className="text-[#E94F5F]">{classDef.maxHp}</strong>
                  </div>
                  <div className="bg-[#1B2030] p-1 rounded text-center">
                    <span className="text-[#A7B0C4] block text-[9px]">ATK/MAG</span>
                    <strong className="text-[#FF5252]">{Math.max(classDef.atk, classDef.mag)}</strong>
                  </div>
                  <div className="bg-[#1B2030] p-1 rounded text-center">
                    <span className="text-[#A7B0C4] block text-[9px]">MOV</span>
                    <strong className="text-[#4C8DFF]">{classDef.mov}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-center">
          <button
            disabled={!isComplete}
            onClick={() => onConfirmParty(selected)}
            className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all ${
              isComplete
                ? 'bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#B88E43] hover:to-[#96702D] text-[#10131C] active:scale-95'
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
      return <Wand2 size={size} />;
    case 'cleric':
      return <HeartPulse size={size} />;
    case 'assassin':
      return <Footprints size={size} />;
    case 'arcane_knight':
      return <Swords size={size} />;
    case 'necromancer':
      return <Skull size={size} />;
    case 'engineer':
      return <Wrench size={size} />;
    case 'rune_mage':
      return <BookOpen size={size} />;
    case 'berserker':
      return <Flame size={size} />;
    default:
      return <Sparkles size={size} />;
  }
}
