import React from 'react';
import type { DamagePreview } from '../types/game';
import { Swords, HeartPulse, AlertTriangle, Wand2 } from 'lucide-react';
import { getAoELabel } from '../utils/pathfinding';

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

  const targetHasExcessHeal = preview.target.statusEffects?.some(
    (e) => e.type === 'excess_heal' && e.duration > 0
  );
  const targetHasExcessShield = preview.target.statusEffects?.some(
    (e) => e.type === 'excess_shield' && e.duration > 0
  );
  const givesShieldEffect =
    preview.skill?.statusEffect?.type === 'shield' ||
    preview.skill?.secondaryStatusEffect?.type === 'shield';

  const isBossMonster = Boolean(preview.target?.isBoss || preview.target?.isMiniBoss);
  const isBossStunImmune =
    isBossMonster &&
    preview.target?.lastStunTurn !== undefined &&
    ((turnNumber ?? 1) - preview.target.lastStunTurn <= 1);

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1B2030] border-2 border-[#D4AD65] p-3 sm:p-4 rounded-2xl shadow-2xl text-[#F3F4F8] max-w-md w-[calc(100%-1rem)] sm:w-full select-none max-h-[85vh] overflow-y-auto">
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
          <div className="text-[10px] text-[#A7B0C4] uppercase">
            {preview.isGroundTarget ? 'Local da Mira' : 'Alvo'}
          </div>
          <div
            className={`font-bold text-sm truncate ${
              preview.isGroundTarget
                ? 'text-[#F59E0B]'
                : preview.target.faction === 'player'
                ? 'text-[#4C8DFF]'
                : 'text-[#E65353]'
            }`}
          >
            {preview.isGroundTarget
              ? `🎯 Solo (${preview.groundTargetPoint?.x ?? 0}, ${preview.groundTargetPoint?.y ?? 0})`
              : preview.target.name}
          </div>
          <div className="text-[11px] text-[#A7B0C4]">
            {preview.isGroundTarget
              ? `${preview.aoeTargetsCount || 1} ${(preview.aoeTargetsCount || 1) === 1 ? 'alvo ao redor' : 'alvos ao redor'}`
              : `Lv.${preview.target.level}`}
          </div>
        </div>
      </div>

      <div className="my-3 space-y-2">
        {preview.skill?.statusEffect && (
          <div className="flex items-center justify-between text-xs bg-[#10131C] p-2.5 rounded-lg border border-[#343B50]">
            <span className="text-[#A7B0C4]">Efeito Concedido:</span>
            <span className="font-bold text-[#F97316]">
              {preview.skill.statusEffect.type === 'buff_atk' && `🔥 +${preview.skill.statusEffect.value}% Dano (${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'buff_mov' && `💨 +${preview.skill.statusEffect.value} Movimento (${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'shield' &&
                `🛡️ +${targetHasExcessShield ? Math.max(1, Math.round(preview.skill.statusEffect.value * 0.5)) : preview.skill.statusEffect.value} Escudo ${preview.skill.statusEffect.reflectRatio ? `(Espinhos ${Math.round(preview.skill.statusEffect.reflectRatio * 100)}%) ` : ''}${targetHasExcessShield ? '(-50% Excesso)' : ''} (${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'invisible' && `👁️ Invisibilidade (${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'taunt' && `📢 Provocação / Agro (${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'stun' && (
                isBossStunImmune ? (
                  <span className="text-[#94A3B8] line-through font-semibold" title="Chefes não podem ser atordoados em turnos consecutivos">
                    ⚡ Atordoamento (Boss Resiste)
                  </span>
                ) : (
                  `⚡ Atordoamento (${preview.skill.statusEffect.duration}T)`
                )
              )}
              {preview.skill.statusEffect.type === 'burn' && `🔥 Queimadura (-${preview.skill.statusEffect.value}% Vida Máx, ${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'poison' && `☠️ Veneno (-${preview.skill.statusEffect.value}% Vida Máx, ${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'slow' && `👣 Lentidão (-${preview.skill.statusEffect.value || 1} Mov, ${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'debuff_def' && `🛡️ Defesa -${preview.skill.statusEffect.value}% (${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'electrified' && `⚡ Eletrificado (1% Vida Máx por casa movida, ${preview.skill.statusEffect.duration}T)`}
            </span>
          </div>
        )}

        {isBossStunImmune && (preview.skill?.statusEffect?.type === 'stun' || preview.skill?.secondaryStatusEffect?.type === 'stun') && (
          <div className="flex items-center gap-2 text-xs bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] p-2.5 rounded-lg">
            <AlertTriangle size={15} className="shrink-0 text-[#FACC15]" />
            <span>Monstros boss não podem ser atordoados em turnos consecutivos. O efeito de atordoamento será resistido!</span>
          </div>
        )}

        {isHeal && targetHasExcessHeal && (
          <div className="flex items-center gap-2 text-xs bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] p-2.5 rounded-lg">
            <AlertTriangle size={15} className="shrink-0 text-[#EF4444]" />
            <span>
              <strong>Cura excessiva:</strong> O alvo foi curado recentemente. A cura deste turno é reduzida pela metade (-50%)!
            </span>
          </div>
        )}

        {givesShieldEffect && targetHasExcessShield && (
          <div className="flex items-center gap-2 text-xs bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] p-2.5 rounded-lg">
            <AlertTriangle size={15} className="shrink-0 text-[#F59E0B]" />
            <span>
              <strong>Escudo excessivo:</strong> O alvo recebeu escudo recentemente. O escudo deste turno é reduzido pela metade (-50%)!
            </span>
          </div>
        )}

        {preview.skill?.secondaryStatusEffect && (
          <div className="flex items-center justify-between text-xs bg-[#10131C] p-2.5 rounded-lg border border-[#343B50]">
            <span className="text-[#A7B0C4]">Efeito Secundário:</span>
            <span className="font-bold text-[#38BDF8]">
              {preview.skill.secondaryStatusEffect.type === 'burn' && `🔥 Queimadura (-${preview.skill.secondaryStatusEffect.value}% Vida Máx, ${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'poison' && `☠️ Veneno (-${preview.skill.secondaryStatusEffect.value}% Vida Máx, ${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'shield' &&
                `🛡️ +${targetHasExcessShield ? Math.max(1, Math.round(preview.skill.secondaryStatusEffect.value * 0.5)) : preview.skill.secondaryStatusEffect.value} Escudo ${targetHasExcessShield ? '(-50% Excesso)' : ''} (${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'buff_atk' && `⚔️ +${preview.skill.secondaryStatusEffect.value}% Dano (${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'buff_mov' && `💨 +${preview.skill.secondaryStatusEffect.value} Movimento (${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'taunt' && `📢 Provocação / Agro (${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'slow' && `👣 Lentidão (-${preview.skill.secondaryStatusEffect.value || 1} Mov, ${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'debuff_def' && `🛡️ Defesa -${preview.skill.secondaryStatusEffect.value}% (${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'electrified' && `⚡ Eletrificado (1% Vida Máx por casa movida, ${preview.skill.secondaryStatusEffect.duration}T)`}
            </span>
          </div>
        )}

        {preview.skill?.hpCostPercent && preview.skill.hpCostPercent > 0 && (
          <div className="flex items-center justify-between text-xs bg-[#450A0A]/40 p-2.5 rounded-lg border border-[#EF4444]/40">
            <span className="text-[#FCA5A5] font-semibold">Custo de Sangue:</span>
            <span className="font-bold text-[#EF4444]">🩸 Sacrifica {preview.skill.hpCostPercent}% da Vida Atual</span>
          </div>
        )}

        {preview.skill?.resetsActionOnKill && (
          <div className="flex items-center justify-between text-xs bg-[#581C87]/40 p-2.5 rounded-lg border border-[#A855F7]/40">
            <span className="text-[#E9D5FF] font-semibold">Ímpeto de Abate:</span>
            <span className="font-bold text-[#C084FC]">⚡ Reseta Movimento e Ação ao Eliminar</span>
          </div>
        )}

        {preview.skill?.grantsExtraTurn && (
          <div className="flex items-center justify-between text-xs bg-[#78350F]/40 p-2.5 rounded-lg border border-[#F59E0B]/40">
            <span className="text-[#FDE68A] font-semibold">Ritmo / Aceleração:</span>
            <span className="font-bold text-[#FBBF24]">⏩ Concede +1 Turno/Ação Imediata</span>
          </div>
        )}

        {preview.skill?.createsObstacle && (
          <div className="flex items-center justify-between text-xs bg-[#0C4A6E]/40 p-2.5 rounded-lg border border-[#38BDF8]/40">
            <span className="text-[#BAE6FD] font-semibold">Criação de Barreira:</span>
            <span className="font-bold text-[#38BDF8]">🧊 Bloqueia o Ladrilho com Pilar Sólido</span>
          </div>
        )}

        {preview.skill?.knockback && preview.skill.knockback > 0 && (
          <div className="flex items-center justify-between text-xs bg-[#0C4A6E]/40 p-2.5 rounded-lg border border-[#38BDF8]/40">
            <span className="text-[#BAE6FD] font-semibold">Impacto Cinético:</span>
            <span className="font-bold text-[#38BDF8]">💨 Empurra o alvo {preview.skill.knockback} casa(s)</span>
          </div>
        )}

        {preview.skill?.chainCount && preview.skill.chainCount > 1 && (
          <div className="flex items-center justify-between text-xs bg-[#422006]/40 p-2.5 rounded-lg border border-[#EAB308]/40">
            <span className="text-[#FDE047] font-semibold">Dano em Cadeia:</span>
            <span className="font-bold text-[#FACC15]">⚡ Salta em até {preview.skill.chainCount} alvos</span>
          </div>
        )}

        {preview.skill?.resetsActionOnKill && (
          <div className="flex items-center justify-between text-xs bg-[#581C87]/40 p-2.5 rounded-lg border border-[#A855F7]/40">
            <span className="text-[#E9D5FF] font-semibold">Execução em Cadeia:</span>
            <span className="font-bold text-[#C084FC]">⚡ Abater o alvo restaura Ação Imediata</span>
          </div>
        )}

        {preview.skill?.casterStatusEffect && (
          <div className="flex items-center justify-between text-xs bg-[#1E293B] p-2.5 rounded-lg border border-[#64748B]">
            <span className="text-[#94A3B8]">Auto-Efeito:</span>
            <span className="font-bold text-[#38BDF8]">
              {preview.skill.casterStatusEffect.type === 'shield' && `🛡️ Ganha Escudo (+${preview.skill.casterStatusEffect.value})`}
              {preview.skill.casterStatusEffect.type === 'invisible' && `👤 Fica Invisível (${preview.skill.casterStatusEffect.duration}T)`}
              {preview.skill.casterStatusEffect.type === 'buff_atk' && `⚔️ +${preview.skill.casterStatusEffect.value}% Dano (${preview.skill.casterStatusEffect.duration}T)`}
              {preview.skill.casterStatusEffect.type === 'buff_mov' && `💨 +${preview.skill.casterStatusEffect.value} Movimento (${preview.skill.casterStatusEffect.duration}T)`}
              {preview.skill.casterStatusEffect.type === 'taunt' && `📢 Provocação / Agro (${preview.skill.casterStatusEffect.duration}T)`}
            </span>
          </div>
        )}

        {preview.skill?.defenseIgnoreRatio && preview.skill.defenseIgnoreRatio > 0 && (
          <div className="flex items-center justify-between text-xs bg-[#1E293B] p-2.5 rounded-lg border border-[#64748B]">
            <span className="text-[#94A3B8]">Dano Perfurante:</span>
            <span className="font-bold text-[#F1F5F9]">🎯 Ignora {Math.round(Math.min(0.20, preview.skill.defenseIgnoreRatio) * 100)}% da Defesa</span>
          </div>
        )}

        {preview.skill?.ignoresShield && (
          <div className="flex items-center justify-between text-xs bg-[#4C1D95]/40 p-2.5 rounded-lg border border-[#A855F7]/40">
            <span className="text-[#E9D5FF]">Penetração Direta:</span>
            <span className="font-bold text-[#C084FC]">🛡️⚡ Ignora Escudos (Dano Direto na Vida)</span>
          </div>
        )}

        {preview.skill?.cleansesDebuffs && (
          <div className="flex items-center justify-between text-xs bg-[#10131C] p-2.5 rounded-lg border border-[#343B50]">
            <span className="text-[#A7B0C4]">Efeito Especial:</span>
            <span className="font-bold text-[#38BDF8]">✨ Remove todos os Debuffs</span>
          </div>
        )}

        {(Boolean(preview.skill?.lifestealPercent && preview.skill.lifestealPercent > 0) || preview.skill?.id === 'golpe_sagrado') && (
          <div className="flex items-center justify-between text-xs bg-[#064E3B]/40 p-2.5 rounded-lg border border-[#10B981]/40">
            <span className="text-[#A7F3D0] font-semibold">Cura Sagrada ao Atacar:</span>
            <span className="font-bold text-[#34D399]">💚 Restaura {preview.skill?.lifestealPercent || 30}% como vida</span>
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
                : preview.isGroundTarget
                ? 'bg-[#F59E0B]/15 border-[#F59E0B]/50 text-[#F59E0B]'
                : 'bg-[#FF9800]/15 border-[#FF9800]/50 text-[#FF9800]'
            }`}
          >
            <span className="flex items-center gap-1.5 uppercase">
              <span>{preview.skill.targetType === 'ally' ? '✨' : preview.isGroundTarget ? '🎯' : '💥'}</span>
              {preview.skill.targetType === 'ally'
                ? `Área (${getAoELabel(preview.skill)})`
                : preview.isGroundTarget
                ? `Área no Solo (${getAoELabel(preview.skill)})`
                : `Ataque em Área (${getAoELabel(preview.skill)})`}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] ${
                preview.skill.targetType === 'ally'
                  ? 'bg-[#38BDF8]/25 text-[#38BDF8]'
                  : preview.isGroundTarget
                  ? 'bg-[#F59E0B]/25 text-[#F59E0B]'
                  : 'bg-[#FF9800]/25 text-[#FF9800]'
              }`}
            >
              {preview.aoeTargetsCount || 1}{' '}
              {preview.aoeTargetsCount === 1
                ? preview.skill.targetType === 'ally'
                  ? 'aliado na área'
                  : 'alvo ao redor'
                : preview.skill.targetType === 'ally'
                ? 'aliados na área'
                : 'alvos ao redor'}
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
          {isTeleport
            ? 'Confirmar Teleporte'
            : isHeal
            ? 'Confirmar Ação'
            : preview.isGroundTarget
            ? 'Confirmar Ataque em Área'
            : 'Confirmar Ataque'}
        </button>
      </div>
    </div>
  );
};
