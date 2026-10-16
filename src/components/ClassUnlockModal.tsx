import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Shield, Target, Wand2, HeartPulse, Footprints, Swords, Skull, Wrench, BookOpen, Flame, Check } from 'lucide-react';
import { CLASS_DEFINITIONS } from '../data/units';
import { soundManager } from '../utils/audio';

interface ClassUnlockModalProps {
  unlockedClasses: string[];
  onDismiss: () => void;
}

export const ClassUnlockModal: React.FC<ClassUnlockModalProps> = ({
  unlockedClasses,
  onDismiss,
}) => {
  useEffect(() => {
    soundManager.playVictory();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
    });
  }, []);

  if (unlockedClasses.length === 0) return null;

  const currentClassKey = unlockedClasses[0];
  const classDef = CLASS_DEFINITIONS[currentClassKey];

  if (!classDef) {
    onDismiss();
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-[#1B2030] border-4 border-[#D4AD65] rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center text-[#F3F4F8] shadow-2xl space-y-5 animate-scale-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#D4AD65]/20 border border-[#D4AD65] text-[#D4AD65] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
          <Sparkles size={16} /> NOVA CLASSE DESBLOQUEADA!
        </div>

        {/* Avatar Emblem */}
        <div className="flex justify-center">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-white shadow-2xl border-2 border-white/20 transform hover:scale-105 transition-transform"
            style={{ backgroundColor: classDef.color }}
          >
            {getClassIcon(classDef.avatarKey, 48)}
          </div>
        </div>

        {/* Title & Role */}
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-[#F3F4F8]">{classDef.name}</h2>
          <p className="text-xs font-bold text-[#D4AD65] uppercase tracking-wider">{classDef.role}</p>
          <p className="text-xs text-[#A7B0C4] max-w-sm mx-auto pt-2 leading-relaxed">
            {classDef.description}
          </p>
        </div>

        {/* Stats Preview */}
        <div className="bg-[#10131C] p-3 rounded-2xl border border-[#343B50] grid grid-cols-4 gap-2 text-xs">
          <div className="bg-[#1B2030] p-1.5 rounded-lg border border-[#343B50]">
            <span className="text-[#A7B0C4] block text-[10px]">HP Base</span>
            <strong className="text-[#FF5252]">{classDef.maxHp}</strong>
          </div>
          <div className="bg-[#1B2030] p-1.5 rounded-lg border border-[#343B50]">
            <span className="text-[#A7B0C4] block text-[10px]">ATK/MAG</span>
            <strong className="text-[#FF8A00]">{Math.max(classDef.atk, classDef.mag)}</strong>
          </div>
          <div className="bg-[#1B2030] p-1.5 rounded-lg border border-[#343B50]">
            <span className="text-[#A7B0C4] block text-[10px]">DEF/RES</span>
            <strong className="text-[#4C8DFF]">{classDef.def}/{classDef.res}</strong>
          </div>
          <div className="bg-[#1B2030] p-1.5 rounded-lg border border-[#343B50]">
            <span className="text-[#A7B0C4] block text-[10px]">MOV</span>
            <strong className="text-[#56E59A]">{classDef.mov}</strong>
          </div>
        </div>

        {/* Unlock Notice */}
        <p className="text-[11px] text-[#43C878] font-bold">
          ✓ Esta classe agora está liberada permanentemente para a sua equipe na Seleção de Heróis!
        </p>

        {/* Button */}
        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#B88E43] hover:to-[#96702D] text-[#10131C] font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Check size={16} /> Entendido & Continuar
        </button>
      </div>
    </div>
  );
};

function getClassIcon(avatarKey: string, size = 24) {
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
