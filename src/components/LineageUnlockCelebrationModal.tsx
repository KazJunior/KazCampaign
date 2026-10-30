import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Check, Flame, Swords, Skull, Sun, Dna, Footprints, Shield, Target } from 'lucide-react';
import { getLineageById } from '../data/lineages';
import { soundManager } from '../utils/audio';
import { ClassLineageAvatar } from './ClassLineageAvatar';

interface LineageUnlockCelebrationModalProps {
  lineageIds: string[];
  onDismiss: () => void;
}

export const LineageUnlockCelebrationModal: React.FC<LineageUnlockCelebrationModalProps> = ({
  lineageIds,
  onDismiss,
}) => {
  useEffect(() => {
    soundManager.playVictory();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    });
  }, []);

  if (lineageIds.length === 0) return null;

  const currentLineageId = lineageIds[0];
  const lineage = getLineageById(currentLineageId);

  const getLineageIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame size={30} className="text-[#FF6B00]" />;
      case 'Swords':
        return <Swords size={30} className="text-[#EF4444]" />;
      case 'Skull':
        return <Skull size={30} className="text-[#A855F7]" />;
      case 'Sun':
        return <Sun size={30} className="text-[#FFD700]" />;
      case 'Footprints':
        return <Footprints size={30} className="text-[#F59E0B]" />;
      case 'Shield':
        return <Shield size={30} className="text-[#F59E0B]" />;
      case 'Target':
        return <Target size={30} className="text-[#10B981]" />;
      case 'Sparkles':
        return <Sparkles size={30} style={{ color: lineage.color }} />;
      default:
        return <Dna size={30} style={{ color: lineage.color }} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans animate-fade-in">
      <div
        className="bg-[#1B2030] border-4 rounded-3xl p-5 sm:p-8 max-w-lg w-full text-center text-[#F3F4F8] shadow-2xl space-y-4 sm:space-y-5 animate-scale-up"
        style={{ borderColor: lineage.color }}
      >
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest animate-pulse border"
          style={{
            backgroundColor: `${lineage.color}20`,
            borderColor: lineage.color,
            color: lineage.color,
          }}
        >
          <Sparkles size={16} /> NOVA LINHAGEM DESBLOQUEADA!
        </div>

        {/* Emblem with Lineage Visuals */}
        <div className="flex justify-center py-2">
          <div className="transform scale-125 hover:scale-135 transition-transform">
            <ClassLineageAvatar
              lineageId={lineage.id}
              classColor={lineage.color}
              size="xl"
            >
              {getLineageIcon(lineage.iconName)}
            </ClassLineageAvatar>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-[#F3F4F8]" style={{ color: lineage.color }}>
            Linhagem {lineage.name}
          </h2>
          <p className="text-xs font-bold uppercase tracking-wider text-[#A7B0C4]">
            {lineage.title}
          </p>
          <p className="text-xs text-[#CBD5E1] max-w-sm mx-auto pt-2 leading-relaxed">
            {lineage.description}
          </p>
        </div>

        {/* Bonus Box */}
        <div
          className="p-3 rounded-2xl border text-xs text-left space-y-1"
          style={{
            backgroundColor: `${lineage.color}15`,
            borderColor: `${lineage.color}50`,
          }}
        >
          <span className="font-black uppercase tracking-wider text-[11px] block" style={{ color: lineage.color }}>
            ✨ {lineage.bonusTitle}
          </span>
          <p className="text-white text-xs leading-relaxed font-medium">
            {lineage.bonusDescription}
          </p>
        </div>

        {/* Notice */}
        <p className="text-[11px] text-[#A7B0C4] italic">
          Esta linhagem agora pode ser escolhida para qualquer herói da sua equipe antes de entrar em batalhas!
        </p>

        {/* Button */}
        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-2xl text-[#10131C] font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
          style={{
            backgroundColor: lineage.color,
          }}
        >
          <Check size={18} strokeWidth={3} />
          <span>Equipar na Seleção de Heróis</span>
        </button>
      </div>
    </div>
  );
};

