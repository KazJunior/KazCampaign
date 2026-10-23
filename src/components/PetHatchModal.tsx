import React, { useState, useEffect } from 'react';
import type { PetDefinition } from '../types/game';
import { PET_RARITY_CONFIG } from '../data/pets';
import { PetIcon, EggDisplay } from './PetIcon';
import { Sparkles, Check, Coins, Shield, Zap } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PetHatchModalProps {
  pet: PetDefinition;
  isDuplicate: boolean;
  duplicateGold: number;
  onEquip?: (petId: string) => void;
  onClose: () => void;
}

export const PetHatchModal: React.FC<PetHatchModalProps> = ({
  pet,
  isDuplicate,
  duplicateGold,
  onEquip,
  onClose,
}) => {
  const [stage, setStage] = useState<'cracking' | 'revealed'>('cracking');
  const rarityConfig = PET_RARITY_CONFIG[pet.rarity];

  useEffect(() => {
    soundManager.playSelect();
    const timer = setTimeout(() => {
      setStage('revealed');
      soundManager.playUpgrade();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div
        className="relative max-w-lg w-full bg-[#161A26] border-2 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden transition-all duration-500"
        style={{ borderColor: rarityConfig.color }}
      >
        {/* Glow ambient background */}
        <div
          className="absolute -top-24 inset-x-0 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: rarityConfig.color }}
        />

        {stage === 'cracking' ? (
          <div className="py-12 flex flex-col items-center gap-6 animate-pulse">
            <h2 className="text-xl sm:text-2xl font-black text-[#F3F4F8] tracking-wide">
              O OVO ESTÁ CHOCANDO...
            </h2>
            <div className="animate-bounce">
              <EggDisplay rarity={pet.rarity} size="xl" isIncubating />
            </div>
            <p className="text-sm text-[#A7B0C4] flex items-center gap-2">
              <Sparkles className="text-amber-400 animate-spin" size={16} /> A casca está se rompendo!
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center space-y-5 animate-scaleUp">
            {/* Header Badge */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${rarityConfig.badgeBg}`}
              >
                {rarityConfig.label} • {pet.species}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#F3F4F8] tracking-tight">
                {pet.name}
              </h2>
            </div>

            {/* Pet Avatar with radiant aura */}
            <div className="relative">
              <div
                className="absolute inset-0 rounded-3xl blur-xl opacity-60 animate-pulse"
                style={{ backgroundColor: rarityConfig.color }}
              />
              <div
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-2 flex items-center justify-center shadow-2xl"
                style={{
                  borderColor: rarityConfig.color,
                  backgroundColor: '#10131C',
                  color: pet.color,
                }}
              >
                <PetIcon iconName={pet.iconName} size={48} />
              </div>
            </div>

            {/* Duplicate Notice or Unlocked Banner */}
            {isDuplicate ? (
              <div className="w-full bg-amber-500/15 border border-amber-500/50 rounded-2xl p-3 flex items-center justify-center gap-3 text-amber-300">
                <Coins size={22} className="shrink-0 text-amber-400 animate-bounce" />
                <div className="text-left text-xs sm:text-sm">
                  <p className="font-bold">Você já possui este companheiro!</p>
                  <p className="text-amber-200/80 text-xs">
                    Compensação por duplicata: <strong className="text-amber-400 font-black">+{duplicateGold.toLocaleString()} Ouro</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full bg-emerald-500/15 border border-emerald-500/50 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-emerald-300 text-xs sm:text-sm font-bold">
                <Sparkles size={18} className="text-emerald-400" />
                Novo Companheiro adicionado ao seu Almanaque!
              </div>
            )}

            {/* Lore */}
            <p className="text-xs text-[#A7B0C4] italic max-w-md px-2 leading-relaxed">
              "{pet.lore}"
            </p>

            {/* Passives & Actives summary */}
            <div className="w-full bg-[#10131C] border border-[#343B50] rounded-2xl p-3.5 space-y-2.5 text-left text-xs">
              <div className="font-bold text-[#F3F4F8] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Shield size={14} className="text-[#D4AD65]" /> Efeitos Passivos ({pet.passives.length})
              </div>
              <div className="space-y-1.5">
                {pet.passives.map((p) => (
                  <div key={p.id} className="flex items-start gap-2 bg-[#1B2030] p-2 rounded-xl border border-[#343B50]/60">
                    <span className="text-emerald-400 font-bold">•</span>
                    <div>
                      <span className="font-bold text-[#F3F4F8]">{p.name}: </span>
                      <span className="text-[#A7B0C4]">{p.description}</span>
                    </div>
                  </div>
                ))}
              </div>

              {pet.activeSkills.length > 0 && (
                <>
                  <div className="font-bold text-[#F3F4F8] flex items-center gap-1.5 text-xs uppercase tracking-wider pt-1 border-t border-[#343B50]/50">
                    <Zap size={14} className="text-amber-400" /> Habilidades Ativas ({pet.activeSkills.length})
                  </div>
                  <div className="space-y-1.5">
                    {pet.activeSkills.map((sk) => (
                      <div key={sk.id} className="bg-[#1B2030] p-2 rounded-xl border border-amber-500/30">
                        <div className="flex items-center justify-between text-[#F3F4F8] font-bold">
                          <span>{sk.name}</span>
                          <span className="text-[10px] text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                            Disponível a partir do Turno 3
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A7B0C4] mt-0.5">{sk.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full pt-1">
              {!isDuplicate && onEquip && (
                <button
                  onClick={() => {
                    onEquip(pet.id);
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs sm:text-sm tracking-wide shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Check size={16} /> Equipar Agora
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-[#1B2030] hover:bg-[#252C42] border border-[#343B50] hover:border-[#F3F4F8]/40 text-[#F3F4F8] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                Continuar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
