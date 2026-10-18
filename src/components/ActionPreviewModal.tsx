import React from 'react';
import type { DamagePreview } from '../types/game';
import { Swords, HeartPulse, AlertTriangle, Wand2 } from 'lucide-react';

interface ActionPreviewModalProps {
  preview: DamagePreview;
  onConfirm: () => void;
  onCancel: () => void;
  turnNumber?: number;
}

export const ActionPreviewModal: React.FC<ActionPreviewModalProps> = ({
  preview,
  onConfirm,
  onCancel,
  turnNumber,
}) => {
  const isTeleport = !!preview.skill?.isTeleport;
  const isHeal = preview.damageType === 'healing';
  const isMagic = preview.damageType === 'magical';
  const isSupportOnly = isHeal && preview.minDamage === 0;

  const isBossMonster = Boolean(preview.target?.isBoss || preview.target?.isMiniBoss);
  const isBossStunImmune =
    isBossMonster &&
    preview.target?.lastStunTurn !== undefined &&
    ((turnNumber ?? 1) - preview.target.lastStunTurn <= 1);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1B2030] border-2 border-[#D4AD65] p-4 rounded-2xl shadow-2xl text-[#F3F4F8] max-w-md w-full animate-bounce-short select-none">
      <div className="flex items-center justify-between border-b border-[#343B50] pb-2 mb-3">
        <span className="text-xs font-bold text-[#D4AD65] uppercase tracking-wider flex items-center gap-1.5">
          {isTeleport ? (
            <Wand2 size={16} className="text-[#8B5CF6]" />
          ) : isSupportOnly ? (
            <HeartPulse size={16} className="text-[#38BDF8]" />
          ) : isHeal ? (
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
            isTeleport
              ? 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30'
              : isSupportOnly
              ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30'
              : isHeal
              ? 'bg-[#56E59A]/15 text-[#56E59A] border-[#56E59A]/30'
              : isMagic
              ? 'bg-[#B58AFF]/15 text-[#B58AFF] border-[#B58AFF]/30'
              : 'bg-[#FF5252]/15 text-[#FF5252] border-[#FF5252]/30'
          }`}
        >
          {isTeleport ? 'TELEPORTE' : isSupportOnly ? 'SUPORTE' : preview.damageType.toUpperCase()}
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
        {preview.skill?.statusEffect && (
          <div className="flex items-center justify-between text-xs bg-[#10131C] p-2.5 rounded-lg border border-[#343B50]">
            <span className="text-[#A7B0C4]">Efeito Concedido:</span>
            <span className="font-bold text-[#F97316]">
              {preview.skill.statusEffect.type === 'buff_atk' && `🔥 +${preview.skill.statusEffect.value}% Dano (${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'shield' && `🛡️ +${preview.skill.statusEffect.value} Escudo (${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'invisible' && `👁️ Invisibilidade (${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'stun' && (
                isBossStunImmune ? (
                  <span className="text-[#94A3B8] line-through font-semibold" title="Chefes não podem ser atordoados em turnos consecutivos">
                    ⚡ Atordoamento (Boss Resiste)
                  </span>
                ) : (
                  `⚡ Atordoamento (${preview.skill.statusEffect.duration}T)`
                )
              )}
              {preview.skill.statusEffect.type === 'poison' && `☠️ Veneno (${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'slow' && `👣 Lentidão (-${preview.skill.statusEffect.value || 1} Mov, ${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'debuff_def' && `🛡️ Defesa -${preview.skill.statusEffect.value}% (${preview.skill.statusEffect.duration}T)`}
            </span>
          </div>
        )}

        {isBossStunImmune && (preview.skill?.statusEffect?.type === 'stun' || preview.skill?.secondaryStatusEffect?.type === 'stun') && (
          <div className="flex items-center gap-2 text-xs bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] p-2.5 rounded-lg">
            <AlertTriangle size={15} className="shrink-0 text-[#FACC15]" />
            <span>Monstros boss não podem ser atordoados em turnos consecutivos. O efeito de atordoamento será resistido!</span>
          </div>
        )}

        {preview.skill?.secondaryStatusEffect && (
          <div className="flex items-center justify-between text-xs bg-[#10131C] p-2.5 rounded-lg border border-[#343B50]">
            <span className="text-[#A7B0C4]">Efeito Secundário:</span>
            <span className="font-bold text-[#38BDF8]">
              {preview.skill.secondaryStatusEffect.type === 'shield' && `🛡️ +${preview.skill.secondaryStatusEffect.value} Escudo (${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'buff_atk' && `🔥 +${preview.skill.secondaryStatusEffect.value}% Dano (${preview.skill.secondaryStatusEffect.duration}T)`}
            </span>
          </div>
        )}

        {preview.skill?.cleansesDebuffs && (
          <div className="flex items-center justify-between text-xs bg-[#10131C] p-2.5 rounded-lg border border-[#343B50]">
            <span className="text-[#A7B0C4]">Efeito Especial:</span>
            <span className="font-bold text-[#38BDF8]">✨ Remove todos os Debuffs</span>
          </div>
        )}

        {!isSupportOnly && (
          <div className="flex items-center justify-between text-xs bg-[#10131C] p-2.5 rounded-lg border border-[#343B50]">
            <span className="text-[#A7B0C4]">
              {isHeal ? 'Cura Estimada:' : 'Dano Estimado:'}
            </span>
            <span className={`font-black text-sm ${isHeal ? 'text-[#56E59A]' : preview.damageType === 'magical' ? 'text-[#B58AFF]' : 'text-[#FF5252]'}`}>
              {isHeal ? `+${preview.minDamage}` : `${preview.minDamage} ~ ${preview.maxDamage}`}
            </span>
          </div>
        )}

        {!isSupportOnly && (
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
        )}

        {preview.skill && preview.skill.aoeRadius > 0 && (
          <div
            className={`border px-3 py-1.5 rounded-lg text-xs font-black flex items-center justify-between ${
              preview.skill.targetType === 'ally'
                ? 'bg-[#38BDF8]/15 border-[#38BDF8]/50 text-[#38BDF8]'
                : 'bg-[#FF9800]/15 border-[#FF9800]/50 text-[#FF9800]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>{preview.skill.targetType === 'ally' ? '✨' : '💥'}</span>
              {preview.skill.targetType === 'ally' ? 'ÁREA DE EFEITO (ALIADOS) 3x3' : 'ATAQUE EM ÁREA 3x3'}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] ${
                preview.skill.targetType === 'ally' ? 'bg-[#38BDF8]/25 text-[#38BDF8]' : 'bg-[#FF9800]/25 text-[#FF9800]'
              }`}
            >
              {preview.aoeTargetsCount || 1}{' '}
              {preview.aoeTargetsCount === 1
                ? preview.skill.targetType === 'ally'
                  ? 'aliado na área'
                  : 'alvo na área'
                : preview.skill.targetType === 'ally'
                ? 'aliados na área'
                : 'alvos na área'}
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
          {isTeleport ? 'Confirmar Teleporte' : isHeal ? 'Confirmar Ação' : 'Confirmar Ataque'}
        </button>
      </div>
    </div>
  );
};
