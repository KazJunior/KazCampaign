import React from 'react';
import type { DamagePreview } from '../types/game';
import { Swords, HeartPulse, AlertTriangle, Wand2 } from 'lucide-react';

interface ActionPreviewModalProps {
  preview: DamagePreview;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ActionPreviewModal: React.FC<ActionPreviewModalProps> = ({
  preview,
  onConfirm,
  onCancel,
}) => {
  const isHeal = preview.damageType === 'healing';
  const isMagic = preview.damageType === 'magical';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1B2030] border-2 border-[#D4AD65] p-4 rounded-2xl shadow-2xl text-[#F3F4F8] max-w-md w-full animate-bounce-short select-none">
      <div className="flex items-center justify-between border-b border-[#343B50] pb-2 mb-3">
        <span className="text-xs font-bold text-[#D4AD65] uppercase tracking-wider flex items-center gap-1.5">
          {isHeal ? (
            <HeartPulse size={16} className="text-[#56E59A]" />
          ) : isMagic ? (
            <Wand2 size={16} className="text-[#B58AFF]" />
          ) : (
            <Swords size={16} className="text-[#FF5252]" />
          )}
          Prévia de {preview.skill ? preview.skill.name : isHeal ? 'Cura' : isMagic ? 'Ataque Mágico' : 'Ataque Físico'}
        </span>
        <span
          className={`text-[11px] px-2 py-0.5 rounded border font-bold ${
            isHeal
              ? 'bg-[#56E59A]/15 text-[#56E59A] border-[#56E59A]/30'
              : isMagic
              ? 'bg-[#B58AFF]/15 text-[#B58AFF] border-[#B58AFF]/30'
              : 'bg-[#FF5252]/15 text-[#FF5252] border-[#FF5252]/30'
          }`}
        >
          {preview.damageType.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 bg-[#10131C] p-3 rounded-xl border border-[#343B50]">
        <div className="text-center flex-1">
          <div className="text-[10px] text-[#A7B0C4] uppercase">Atacante</div>
          <div className="font-bold text-sm text-[#4C8DFF] truncate">{preview.attacker.name}</div>
          <div className="text-[11px] text-[#A7B0C4]">Lv.{preview.attacker.level}</div>
        </div>

        <div className="text-sm font-black text-[#D4AD65] uppercase">VS</div>

        <div className="text-center flex-1">
          <div className="text-[10px] text-[#A7B0C4] uppercase">Alvo</div>
          <div className={`font-bold text-sm truncate ${preview.target.faction === 'player' ? 'text-[#4C8DFF]' : 'text-[#E65353]'}`}>
            {preview.target.name}
          </div>
          <div className="text-[11px] text-[#A7B0C4]">Lv.{preview.target.level}</div>
        </div>
      </div>

      <div className="my-3 space-y-2">
        <div className="flex items-center justify-between text-xs bg-[#10131C] p-2.5 rounded-lg border border-[#343B50]">
          <span className="text-[#A7B0C4]">
            {isHeal ? 'Cura Estimada:' : 'Dano Estimado:'}
          </span>
          <span className={`font-black text-sm ${isHeal ? 'text-[#56E59A]' : preview.damageType === 'magical' ? 'text-[#B58AFF]' : 'text-[#FF5252]'}`}>
            {isHeal ? `+${preview.minDamage}` : `${preview.minDamage} ~ ${preview.maxDamage}`}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs bg-[#10131C] p-2.5 rounded-lg border border-[#343B50]">
          <span className="text-[#A7B0C4]">Vida do Alvo (Antes → Depois):</span>
          <span className="font-bold">
            <span className="text-[#F3F4F8]">{preview.targetCurrentHp}</span>
            <span className="text-[#A7B0C4] mx-1">→</span>
            <span className={isHeal ? 'text-[#56E59A] font-extrabold' : preview.targetHpAfterMax === 0 ? 'text-[#E65353] font-extrabold' : 'text-[#F0B44D]'}>
              {preview.targetHpAfterMax}
            </span>
          </span>
        </div>

        {preview.skill && preview.skill.aoeRadius > 0 && (
          <div className="bg-[#FF9800]/15 border border-[#FF9800]/50 text-[#FF9800] px-3 py-1.5 rounded-lg text-xs font-black flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>💥</span> ATAQUE EM ÁREA 3x3
            </span>
            <span className="bg-[#FF9800]/25 px-2 py-0.5 rounded text-[11px]">
              {preview.aoeTargetsCount || 1} {preview.aoeTargetsCount === 1 ? 'alvo na área' : 'alvos na área'}
            </span>
          </div>
        )}

        {preview.isKillLikely && !isHeal && (
          <div className="bg-[#E65353]/15 border border-[#E65353]/40 text-[#E65353] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 animate-pulse">
            <AlertTriangle size={14} /> ALTO RISCO DE ELIMINAR O ALVO!
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2 px-3 rounded-xl bg-[#10131C] hover:bg-[#343B50] text-[#A7B0C4] font-bold text-xs uppercase transition-colors border border-[#343B50]"
        >
          Cancelar (Esc)
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#B88E43] hover:to-[#96702D] text-[#10131C] font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
        >
          Confirmar Ataque
        </button>
      </div>
    </div>
  );
};
