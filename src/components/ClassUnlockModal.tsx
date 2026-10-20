import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Shield, Target, HeartPulse, Footprints, Swords, Skull, BookOpen, Flame, Check, Sun, Crosshair, Music, Snowflake, TreePine } from 'lucide-react';
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

  const isSecret = Boolean(classDef.isSecret);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans">
      <div
        className={`bg-[#1B2030] border-4 rounded-3xl p-5 sm:p-8 max-w-lg w-full text-center text-[#F3F4F8] shadow-2xl space-y-4 sm:space-y-5 animate-scale-up max-h-[92vh] overflow-y-auto ${
          isSecret ? 'border-[#9D4EDD] shadow-[#7B2CBF]/40' : 'border-[#D4AD65]'
        }`}
      >
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest animate-pulse border ${
            isSecret
              ? 'bg-[#9D4EDD]/20 border-[#9D4EDD] text-[#C084FC]'
              : 'bg-[#D4AD65]/20 border-[#D4AD65] text-[#D4AD65]'
          }`}
        >
          <Sparkles size={16} /> {isSecret ? '🌟 CLASSE SECRETA DESBLOQUEADA!' : 'NOVA CLASSE DESBLOQUEADA!'}
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
          <p
            className={`text-xs font-bold uppercase tracking-wider ${
              isSecret ? 'text-[#C084FC]' : 'text-[#D4AD65]'
            }`}
          >
            {classDef.role}
          </p>
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
          className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-[#10131C] ${
            isSecret
              ? 'bg-gradient-to-r from-[#C084FC] via-[#9D4EDD] to-[#7B2CBF] hover:from-[#E0AAFF] hover:to-[#9D4EDD] text-white'
              : 'bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#B88E43] hover:to-[#96702D]'
          }`}
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
