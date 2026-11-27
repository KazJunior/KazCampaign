import React from 'react';
import type { DamagePreview } from '../types/game';
import { Swords, HeartPulse, AlertTriangle, Wand2, Skull } from 'lucide-react';
import { getAoELabel } from '../utils/pathfinding';
import { evaluateOmnimagoReaction } from '../utils/elementalReactions';
import { getAlchemistMixtureSummary } from '../utils/damage';

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
  const isSummon = !!preview.skill?.isSummonSkill;
  const isBarrelPlacement = Boolean(preview.skill?.placesBarrelVariant && preview.skill?.targetType === 'empty_tile');
  const isTargetBarrel = Boolean(preview.target?.isPowderBarrel);
  const isCanhaoHumanoAlly = Boolean(
    preview.skill?.id === 'canhao_colossal' &&
    preview.target?.faction === 'player' &&
    !isTargetBarrel &&
    preview.target?.id !== preview.attacker?.id
  );
  const isHeal = preview.damageType === 'healing';
  const isMagic = preview.damageType === 'magical';
  const isSupportOnly = (isHeal && preview.minDamage === 0) || isBarrelPlacement || isCanhaoHumanoAlly;

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
  const elementalReaction = evaluateOmnimagoReaction(preview.attacker, preview.target, preview.skill);
  const alchemistSummary = !preview.skill ? getAlchemistMixtureSummary(preview.attacker) : null;
  const hasAlchemistMix = Boolean(alchemistSummary && alchemistSummary.count > 0);
  const preparingMixture = preview.skill?.isAlchemistMixture ? preview.skill.alchemistMixture : undefined;
  const stackOverflowEffect = preview.skill
    ? preview.attacker.statusEffects?.find((e) => e.type === 'stack_overflow' && e.duration > 0)
    : undefined;

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
          className={`text-[11px] px-2 py-0.5 rounded border font-bold ${isTeleport
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
          {isBarrelPlacement
            ? preview.skill?.isFreeAction
              ? 'BARRIL (LIVRE)'
              : 'BARRIL'
            : isSummon
              ? 'INVOCAÇÃO'
              : isTeleport
                ? 'TELEPORTE'
                : preparingMixture
                  ? 'REAGENTE'
                  : isSupportOnly
                    ? 'SUPORTE'
                    : preview.damageType.toUpperCase()}
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
            className={`font-bold text-sm truncate ${preview.isGroundTarget
                ? 'text-[#F59E0B]'
                : preview.target.faction === 'player'
                  ? 'text-[#4C8DFF]'
                  : 'text-[#E65353]'
              }`}
          >
            {preview.isGroundTarget
              ? `🎯 Área (${preview.groundTargetPoint?.x ?? 0}, ${preview.groundTargetPoint?.y ?? 0})`
              : isBarrelPlacement
                ? `🛢️ ${preview.skill?.name || 'Barril de Pólvora'}`
                : isTargetBarrel
                  ? `🛢️ ${preview.target.name}`
                  : preview.target.name}
          </div>
          <div className="text-[11px] text-[#A7B0C4]">
            {preview.isGroundTarget
              ? `${preview.aoeTargetsCount || 0} ${(preview.aoeTargetsCount || 0) === 1 ? 'alvo ao redor' : 'alvos ao redor'}`
              : isBarrelPlacement
                ? 'Armadilha Explosiva (4T)'
                : isTargetBarrel
                  ? 'Detona ao ser atingido!'
                  : `Lv.${preview.target.level}`}
          </div>
        </div>
      </div>

      <div className="my-3 space-y-2">
        {stackOverflowEffect && (
          <div className="bg-[#831843]/60 p-2.5 rounded-xl border border-[#EC4899]/80 space-y-1 text-xs animate-pulse">
            <div className="flex items-center justify-between">
              <span className="font-black text-[#F9A8D4] uppercase tracking-wider text-[10px] flex items-center gap-1">
                <AlertTriangle size={13} className="text-[#EC4899]" />
                STACK OVERFLOW ATIVO
              </span>
              <span className="font-black text-[#F472B6]">
                -{stackOverflowEffect.value || 12}% HP Máx & +1T CD
              </span>
            </div>
            <p className="text-[11px] text-[#FCE7F3]/95">
              Usar qualquer habilidade vai estourar a pilha! Prefira <strong>Ataque Básico</strong> neste turno para evitar o dano e a penalidade de recarga.
            </p>
          </div>
        )}

        {isCanhaoHumanoAlly && (
          <div className="bg-[#0C4A6E]/50 p-2.5 rounded-xl border border-[#38BDF8]/60 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-[#7DD3FC] uppercase tracking-wider text-[10px]">
                🚀 Canhão Humano (Lançamento Aliado)
              </span>
              <span className="font-black text-[#38BDF8]">
                +{Math.max(1, Math.round(preview.attacker.atk * (preview.skill?.shieldPercentOfAtk || 0.45)))} Escudo
              </span>
            </div>
            <p className="text-[11px] text-[#E0F2FE]/90">
              Dispara {preview.target.name} até 3 casas à frente com Escudo (45% ATK) + 15% Ataque (2T) e deixa 1 Barril de Pólvora na casa de partida!
            </p>
          </div>
        )}

        {(preview.isFreeActionSkill || preview.skill?.isFreeAction) && (
          <div className="bg-[#7C2D12]/45 p-2.5 rounded-xl border border-[#F97316]/60 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-[#FDBA74] uppercase tracking-wider text-[10px]">
                {preview.skill?.placesBarrelVariant
                  ? '🛢️ Ação Livre — Não Consome Ataque'
                  : '🐎 Ação Livre — Não Consome Ataque'}
              </span>
              <span className="font-black text-[#FCD34D]">
                {preview.skill?.placesBarrelVariant
                  ? (preview.skill?.power ? `${Math.round(preview.skill.power * 100)}% ATK` : 'Explosivo')
                  : 'Movimento Restaurado'}
              </span>
            </div>
            <p className="text-[11px] text-[#FFEDD5]/90">
              {preview.skill?.placesBarrelVariant
                ? 'Você pode disparar neste barril no mesmo turno (Ataque Básico ou Habilidade) para detonar em área e ativar Reação em Cadeia (+10% dano por elo, máx. +30%)!'
                : 'Purifica penalidades, devolve seu movimento e permite cavalgar e atacar no mesmo turno!'}
            </p>
          </div>
        )}

        {Boolean(preview.cavalryMomentumPercent && preview.cavalryMomentumPercent > 0) && (
          <div className="flex items-center justify-between text-xs bg-[#0C4A6E]/45 p-2.5 rounded-lg border border-[#38BDF8]/50">
            <span className="text-[#BAE6FD] font-semibold">🐎 Ímpeto de Galope:</span>
            <span className="font-black text-[#38BDF8]">+{preview.cavalryMomentumPercent}% Dano da Carga</span>
          </div>
        )}

        {Boolean(preview.skill?.isTrampleCharge) && (
          <div className="flex items-center justify-between text-xs bg-[#1E3A8A]/45 p-2.5 rounded-lg border border-[#60A5FA]/50">
            <span className="text-[#BFDBFE] font-semibold">🐎 Atropelamento em Linha:</span>
            <span className="font-bold text-[#93C5FD]">
              {preview.trampleTargetsCount ?? 0} {(preview.trampleTargetsCount ?? 0) === 1 ? 'inimigo no trajeto' : 'inimigos no trajeto'}
            </span>
          </div>
        )}

        {Boolean(preview.skill?.isSkewerCarry) && (
          <div className="flex items-center justify-between text-xs bg-[#1E3A8A]/45 p-2.5 rounded-lg border border-[#60A5FA]/50">
            <span className="text-[#BFDBFE] font-semibold">🔱 Arrastão na Lança:</span>
            <span className="font-bold text-[#93C5FD]">Arrasta alvo + Cavaleiro {preview.skill?.skewerDistance || 2} casas (+Colisão)</span>
          </div>
        )}

        {(preview.isAllyMountRescueSkill || preview.skill?.isAllyMountRescue) && (
          <div className="bg-[#0C4A6E]/50 p-2.5 rounded-xl border border-[#38BDF8]/60 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-[#7DD3FC] uppercase tracking-wider text-[10px]">
                🐎 Garupa do Corcel (Resgate Aliado)
              </span>
              <span className="font-black text-[#38BDF8]">
                +{Math.max(1, Math.round(preview.attacker.maxHp * (preview.skill?.shieldPercentOfMaxHp || 0.15)))} Escudo
              </span>
            </div>
            <p className="text-[11px] text-[#E0F2FE]/90">
              Galopa até {preview.target.name}, purifica debuffs, traz o aliado para uma casa livre ao seu lado e protege ambos com Escudo!
            </p>
          </div>
        )}

        {(preview.isCantoSkill || preview.skill?.grantsCantoMove) && !preview.skill?.isFreeAction && (
          <div className="flex items-center justify-between text-xs bg-[#1E293B] p-2 rounded-lg border border-[#38BDF8]/40">
            <span className="text-[#BAE6FD] font-semibold">Canto da Cavalaria:</span>
            <span className="font-bold text-[#38BDF8]">🐎 Permite mover-se novamente após atacar</span>
          </div>
        )}

        {Boolean(preview.barrelChainCount && preview.barrelChainCount > 0) && (
          <div className="bg-[#7F1D1D]/50 p-2.5 rounded-xl border border-[#EF4444]/60 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-[#FCA5A5] uppercase tracking-wider text-[10px]">
                💥 {preview.barrelChainCount! > 1 ? `Reação em Cadeia (${preview.barrelChainCount} Barris)` : 'Detonação de Barril'}
              </span>
              <span className="font-black text-[#FDE047]">
                ~{preview.barrelEstimatedDamage ?? 0} Dano
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#FEE2E2]">
              <span>Inimigos nas explosões:</span>
              <span className="font-bold text-[#FDBA74]">
                {preview.barrelEnemiesInBlast ?? 0} {(preview.barrelEnemiesInBlast ?? 0) === 1 ? 'inimigo' : 'inimigos'}
              </span>
            </div>
          </div>
        )}

        {preview.skill?.leavesBarrelAtOrigin && (
          <div className="flex items-center justify-between text-xs bg-[#7C2D12]/35 p-2 rounded-lg border border-[#F97316]/40">
            <span className="text-[#FED7AA] font-semibold">Barril Armado:</span>
            <span className="font-bold text-[#FDBA74]">🛢️ Deixa 1 Barril de Pólvora na casa de partida</span>
          </div>
        )}

        {preview.skill?.spawnsBarrelsAfterAoE && (
          <div className="flex items-center justify-between text-xs bg-[#7C2D12]/35 p-2 rounded-lg border border-[#F97316]/40">
            <span className="text-[#FED7AA] font-semibold">Barris Remanescentes:</span>
            <span className="font-bold text-[#FDBA74]">🛢️ Posiciona até {preview.skill.spawnsBarrelsAfterAoE} Barris nas extremidades livres</span>
          </div>
        )}

        {preparingMixture && (
          <div className="bg-[#064E3B]/35 p-3 rounded-xl border border-[#10B981]/50 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-[#34D399] uppercase tracking-wider text-[10px]">
                ⚗️ Preparar Reagente (Não consome ataque)
              </span>
              <span className="font-black text-[#6EE7B7]">+{preparingMixture.damageBonusPercent}% Dano</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-[#ECFDF5]">
              {preparingMixture.aoeRadius ? (
                <span className="px-2 py-0.5 rounded bg-[#10131C]/70 border border-[#F59E0B]/40 text-[#FCD34D] font-bold">
                  💥 Área Raio {preparingMixture.aoeRadius}
                </span>
              ) : null}
              {preparingMixture.rangeBonus ? (
                <span className="px-2 py-0.5 rounded bg-[#10131C]/70 border border-[#38BDF8]/40 text-[#7DD3FC] font-bold">
                  🎯 +{preparingMixture.rangeBonus} Alcance
                </span>
              ) : null}
              {preparingMixture.lifestealPercent ? (
                <span className="px-2 py-0.5 rounded bg-[#10131C]/70 border border-[#EF4444]/40 text-[#FCA5A5] font-bold">
                  🩸 {preparingMixture.lifestealPercent}% Roubo de Vida
                </span>
              ) : null}
              {preparingMixture.ignoresShield ? (
                <span className="px-2 py-0.5 rounded bg-[#10131C]/70 border border-[#A855F7]/40 text-[#D8B4FE] font-bold">
                  🛡️⚡ Ignora Escudos
                </span>
              ) : null}
              {[preparingMixture.statusEffect, preparingMixture.secondaryStatusEffect]
                .filter(Boolean)
                .map((eff, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-[#10131C]/70 border border-[#10B981]/40 text-[#A7F3D0] font-bold">
                    {eff!.type === 'slow' && `👣 Lentidão -${eff!.value} Mov (${eff!.duration}T)`}
                    {eff!.type === 'poison' && `☠️ Veneno (${eff!.duration}T)`}
                    {eff!.type === 'burn' && `🔥 Queimadura (${eff!.duration}T)`}
                    {eff!.type === 'debuff_def' && `🛡️ Defesa -${eff!.value}% (${eff!.duration}T)`}
                    {eff!.type === 'stun' && `⚡ Atordoar (${eff!.duration}T)`}
                  </span>
                ))}
            </div>
            <p className="text-[10px] text-[#A7F3D0]/80">
              Acumula no frasco e dura pelos próximos 2 Ataques Normais.
            </p>
          </div>
        )}

        {hasAlchemistMix && alchemistSummary && (
          <div className="bg-[#064E3B]/35 p-2.5 rounded-xl border border-[#10B981]/50 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-[#34D399] uppercase tracking-wider text-[10px]">
                🧪 Reação Alquímica ({alchemistSummary.count} {alchemistSummary.count === 1 ? 'reagente' : 'reagentes'})
              </span>
              <span className="font-black text-[#6EE7B7]">+{alchemistSummary.damageBonusPercent}% Dano</span>
            </div>
            <div className="flex flex-wrap gap-1 text-[10px]">
              {alchemistSummary.mixtures.map((m) => (
                <span key={m.id} className="px-1.5 py-0.5 rounded bg-[#10B981]/15 border border-[#10B981]/40 text-[#A7F3D0] font-semibold">
                  ⚗️ {m.name} ({m.remainingAttacks ?? 1} {(m.remainingAttacks ?? 1) === 1 ? 'atq' : 'atqs'})
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 text-[10px]">
              {alchemistSummary.aoeRadius > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-[#FF9800]/20 border border-[#FF9800]/40 text-[#FDBA74] font-bold">
                  💥 Área Raio {alchemistSummary.aoeRadius} ({preview.aoeTargetsCount ?? 1} {(preview.aoeTargetsCount ?? 1) === 1 ? 'alvo' : 'alvos'})
                </span>
              )}
              {alchemistSummary.lifestealPercent > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-[#10B981]/20 border border-[#10B981]/40 text-[#6EE7B7] font-bold">
                  🩸 {alchemistSummary.lifestealPercent}% Roubo de Vida
                </span>
              )}
              {alchemistSummary.ignoresShield && (
                <span className="px-1.5 py-0.5 rounded bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#D8B4FE] font-bold">
                  🛡️⚡ Ignora Escudos
                </span>
              )}
              {alchemistSummary.statusEffects.map((eff, idx) => (
                <span key={idx} className="px-1.5 py-0.5 rounded bg-[#10131C]/80 border border-[#343B50] text-[#F3F4F8] font-bold">
                  {eff.type === 'slow' && `👣 Lentidão -${eff.value} Mov (${eff.duration}T)`}
                  {eff.type === 'poison' && `☠️ Veneno (${eff.duration}T)`}
                  {eff.type === 'burn' && `🔥 Queimadura (${eff.duration}T)`}
                  {eff.type === 'debuff_def' && `🛡️ Defesa -${eff.value}% (${eff.duration}T)`}
                  {eff.type === 'stun' && (isBossStunImmune ? '⚡ Stun (Boss Resiste)' : `⚡ Atordoar (${eff.duration}T)`)}
                </span>
              ))}
            </div>
          </div>
        )}

        {isSummon && (
          <div className="bg-[#10131C] p-3 rounded-xl border border-[#A855F7]/30 space-y-1.5 text-xs">
            <div className="font-bold text-[#C084FC] flex items-center gap-1.5">
              <Skull size={15} />
              {preview.skill?.summonType === 'corpse_skeleton'
                ? 'Reanimação Cadavérica (1 Esqueleto)'
                : 'Legião das Sombras (3 Esqueletos)'}
            </div>
            <p className="text-[#CBD5E1]">
              {preview.skill?.summonType === 'corpse_skeleton'
                ? 'Ergue o monstro abatido selecionado como um Guerreiro Esqueleto servo sob seu comando.'
                : 'Invoca 3 Guerreiros Esqueletos servos em casas livres adjacentes sob seu comando.'}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="bg-[#1B2030] p-1.5 rounded border border-[#343B50] text-[#FACC15]">
                ❤️ Vida: <strong>1 PV</strong>
              </div>
              <div className="bg-[#1B2030] p-1.5 rounded border border-[#343B50] text-[#38BDF8]">
                👣 Mov: <strong>3 casas</strong> | Alc: <strong>1</strong>
              </div>
              <div className="bg-[#1B2030] p-1.5 rounded border border-[#343B50] text-[#4ADE80]">
                ⚔️ Ataque: <strong>Golpe de Ossos</strong>
              </div>
              <div className="bg-[#1B2030] p-1.5 rounded border border-[#343B50] text-[#A78BFA]">
                ⏳ Duração: <strong>2 Turnos</strong>
              </div>
            </div>
          </div>
        )}
        {preview.skill?.statusEffect && (
          <div className="flex items-center justify-between text-xs bg-[#10131C] p-2.5 rounded-lg border border-[#343B50]">
            <span className="text-[#A7B0C4]">Efeito Concedido:</span>
            <span className="font-bold text-[#F97316]">
              {preview.skill.statusEffect.type === 'buff_atk' && `🔥 +${preview.skill.statusEffect.value}% Dano (${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'buff_mov' && `💨 +${preview.skill.statusEffect.value} Movimento (${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'shield' && (() => {
                const baseVal = preview.skill.shieldPercentOfMaxHp
                  ? Math.max(1, Math.round(preview.attacker.maxHp * preview.skill.shieldPercentOfMaxHp))
                  : preview.skill.statusEffect.value;
                const finalVal = targetHasExcessShield ? Math.max(1, Math.round(baseVal * 0.5)) : baseVal;
                return `🛡️ +${finalVal} Escudo ${preview.skill.shieldPercentOfMaxHp ? `(${Math.round(preview.skill.shieldPercentOfMaxHp * 100)}% Vida) ` : ''}${preview.skill.statusEffect.reflectRatio ? `(Espinhos ${Math.round(preview.skill.statusEffect.reflectRatio * 100)}%) ` : ''}${targetHasExcessShield ? '(-50% Excesso)' : ''} (${preview.skill.statusEffect.duration}T)`;
              })()}
              {preview.skill.statusEffect.type === 'invisible' && `👁️ Invisibilidade (${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'immune' && `🛡️ Invulnerável a Dano e Efeitos (${preview.skill.statusEffect.duration}T)`}
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
              {preview.skill.statusEffect.type === 'freezing' && `❄️ Congelando (-${preview.skill.statusEffect.value || 20}% DEF/RES, ${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'gale' && `🌪️ Ventania (-${preview.skill.statusEffect.value || 1} Mov, ${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'debuff_def' && `🛡️ Defesa -${preview.skill.statusEffect.value}% (${preview.skill.statusEffect.duration}T)`}
              {preview.skill.statusEffect.type === 'electrified' && `⚡ Eletrificado (1% Vida Máx por casa movida, ${preview.skill.statusEffect.duration}T)`}
            </span>
          </div>
        )}

        {preview.skill?.id === 'cataclisma_omnielemental' && (
          <div className="flex items-center justify-between text-xs bg-[#10131C] p-2.5 rounded-lg border border-[#D946EF]/40">
            <span className="text-[#F0ABFC]">Efeitos Elementais:</span>
            <span className="font-bold text-[#E879F9] text-right">
              🔥 Queimadura + ❄️ Congelando + ⚡ Eletrificado + 🌪️ Ventania (2T)
            </span>
          </div>
        )}

        {elementalReaction && (
          <div
            className="flex flex-col gap-0.5 text-xs p-2.5 rounded-lg border"
            style={{
              backgroundColor: `${elementalReaction.color}18`,
              borderColor: `${elementalReaction.color}70`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-black uppercase tracking-wider text-[10px]" style={{ color: elementalReaction.color }}>
                {elementalReaction.emoji} Reação Elemental Ativada
              </span>
              <span className="font-black text-xs text-white">{elementalReaction.name}</span>
            </div>
            <span className="text-[11px] text-[#F3F4F8]/90">{elementalReaction.summary}</span>
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
              {preview.skill.secondaryStatusEffect.type === 'shield' && (() => {
                const baseVal = preview.skill.shieldPercentOfMaxHp
                  ? Math.max(1, Math.round(preview.attacker.maxHp * preview.skill.shieldPercentOfMaxHp))
                  : preview.skill.secondaryStatusEffect.value;
                const finalVal = targetHasExcessShield ? Math.max(1, Math.round(baseVal * 0.5)) : baseVal;
                return `🛡️ +${finalVal} Escudo ${preview.skill.shieldPercentOfMaxHp ? `(${Math.round(preview.skill.shieldPercentOfMaxHp * 100)}% Vida) ` : ''}${targetHasExcessShield ? '(-50% Excesso)' : ''} (${preview.skill.secondaryStatusEffect.duration}T)`;
              })()}
              {preview.skill.secondaryStatusEffect.type === 'buff_atk' && `⚔️ +${preview.skill.secondaryStatusEffect.value}% Dano (${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'buff_mov' && `💨 +${preview.skill.secondaryStatusEffect.value} Movimento (${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'taunt' && `📢 Provocação / Agro (${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'slow' && `👣 Lentidão (-${preview.skill.secondaryStatusEffect.value || 1} Mov, ${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'freezing' && `❄️ Congelando (-${preview.skill.secondaryStatusEffect.value || 20}% DEF/RES, ${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'gale' && `🌪️ Ventania (-${preview.skill.secondaryStatusEffect.value || 1} Mov, ${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'debuff_def' && `🛡️ Defesa -${preview.skill.secondaryStatusEffect.value}% (${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'electrified' && `⚡ Eletrificado (1% Vida Máx por casa movida, ${preview.skill.secondaryStatusEffect.duration}T)`}
              {preview.skill.secondaryStatusEffect.type === 'stun' && (
                preview.skill.targetType === 'ally'
                  ? `⏳ Preso no Tempo / Incapaz de Agir (${preview.skill.secondaryStatusEffect.duration}T)`
                  : `⚡ Atordoamento (${preview.skill.secondaryStatusEffect.duration}T)`
              )}
            </span>
          </div>
        )}

        {preview.skill?.isTimeAnchor && (
          <div className="flex items-center justify-between text-xs bg-[#451A03]/40 p-2.5 rounded-lg border border-[#F59E0B]/40">
            <span className="text-[#FDE68A] font-semibold">Âncora do Passado:</span>
            <span className="font-bold text-[#FBBF24]">
              {preview.attacker.timeAnchor
                ? `⏪ Rebobina para (${preview.attacker.timeAnchor.x}, ${preview.attacker.timeAnchor.y}), restaura ${preview.attacker.timeAnchor.hp} HP e purifica debuffs`
                : `⚓ Marca posição/HP atuais por 2T e ganha +${Math.max(1, Math.round(preview.attacker.atk * 0.5))} Escudo`}
            </span>
          </div>
        )}

        {preview.skill?.createsClockZoneTurns && preview.skill.createsClockZoneTurns > 0 && (
          <div className="flex items-center justify-between text-xs bg-[#450A0A]/40 p-2.5 rounded-lg border border-[#F59E0B]/40">
            <span className="text-[#FDE68A] font-semibold">Zona do Relógio ({preview.skill.createsClockZoneTurns}T):</span>
            <span className="font-bold text-[#FBBF24]">
              ⏳ Aliados +2 Mov | Inimigos -2 Mov & -20% Def
            </span>
          </div>
        )}

        {preview.skill?.reducesAllCooldownsOnKill && preview.skill.reducesAllCooldownsOnKill > 0 && (
          <div className="flex items-center justify-between text-xs bg-[#1E1B4B]/50 p-2.5 rounded-lg border border-[#818CF8]/40">
            <span className="text-[#C7D2FE] font-semibold">Fluxo de Abate:</span>
            <span className="font-bold text-[#A5B4FC]">⏳ Abater reduz todos os Cooldowns em -{preview.skill.reducesAllCooldownsOnKill}T</span>
          </div>
        )}

        {preview.skill?.reducesAllCooldownsOnCast && preview.skill.reducesAllCooldownsOnCast > 0 && (
          <div className="flex items-center justify-between text-xs bg-[#1E1B4B]/50 p-2.5 rounded-lg border border-[#818CF8]/40">
            <span className="text-[#C7D2FE] font-semibold">Aceleração Temporal:</span>
            <span className="font-bold text-[#A5B4FC]">⏳ Reduz todos os Cooldowns em -{preview.skill.reducesAllCooldownsOnCast}T</span>
          </div>
        )}

        {preview.skill?.resetsAllCooldownsOnCast && (
          <div className="flex items-center justify-between text-xs bg-[#450A0A]/50 p-2.5 rounded-lg border border-[#EF4444]/40">
            <span className="text-[#FCA5A5] font-semibold">Colapso Temporal:</span>
            <span className="font-bold text-[#FBBF24]">⏳ Invoca {preview.skill.summonCloneCount || 2} Clones, Reseta Cooldowns e Escudo Global (+{Math.max(1, Math.round(preview.attacker.atk * (preview.skill.allAlliesShieldPercentOfAtk || 0.7)))} em Todos Aliados)</span>
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

        {preview.skill?.stealthOnKill && (
          <div className="flex items-center justify-between text-xs bg-[#4C1D95]/40 p-2.5 rounded-lg border border-[#8B5CF6]/40">
            <span className="text-[#DDD6FE] font-semibold">Furtividade no Abate:</span>
            <span className="font-bold text-[#A78BFA]">👤 Fica Invisível se Abater</span>
          </div>
        )}

        {preview.skill?.buffMovBonus && (
          <div className="flex items-center justify-between text-xs bg-[#10131C] p-2.5 rounded-lg border border-[#343B50]">
            <span className="text-[#A7B0C4]">Bônus de Ritmo:</span>
            <span className="font-bold text-[#38BDF8]">💨 +{preview.skill.buffMovBonus} Movimento (2T)</span>
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
            <span className="font-bold text-[#38BDF8]">
              {preview.skill.createsObstacle === 'ice_pillar'
                ? '🧊 Ergue Pilar de Gelo (Empurra Inimigo)'
                : '🧱 Bloqueia o Ladrilho com Barreira'}
            </span>
          </div>
        )}

        {preview.skill?.knockback && preview.skill.knockback > 0 && (
          <div className="flex items-center justify-between text-xs bg-[#0C4A6E]/40 p-2.5 rounded-lg border border-[#38BDF8]/40">
            <span className="text-[#BAE6FD] font-semibold">Impacto Cinético:</span>
            <span className="font-bold text-[#38BDF8]">
              {preview.target?.faction === 'player'
                ? `💨 Projeta o aliado ${preview.skill.knockback} casa(s) com segurança`
                : `💨 Empurra o alvo ${preview.skill.knockback} casa(s) (+Dano de Colisão)`}
            </span>
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
              {preview.skill.casterStatusEffect.type === 'shield' && (() => {
                const baseVal = preview.skill.shieldPercentOfMaxHp
                  ? Math.max(1, Math.round(preview.attacker.maxHp * preview.skill.shieldPercentOfMaxHp))
                  : preview.skill.shieldPercentOfMag
                    ? Math.max(1, Math.round(preview.attacker.mag * preview.skill.shieldPercentOfMag))
                    : preview.skill.shieldPercentOfAtk
                      ? Math.max(1, Math.round(preview.attacker.atk * preview.skill.shieldPercentOfAtk))
                      : preview.skill.casterStatusEffect.value;
                const scaleLabel = preview.skill.shieldPercentOfMaxHp
                  ? `(${Math.round(preview.skill.shieldPercentOfMaxHp * 100)}% Vida)`
                  : preview.skill.shieldPercentOfMag
                    ? `(${Math.round(preview.skill.shieldPercentOfMag * 100)}% Magia)`
                    : preview.skill.shieldPercentOfAtk
                      ? `(${Math.round(preview.skill.shieldPercentOfAtk * 100)}% Ataque)`
                      : '';
                return `🛡️ Ganha Escudo (+${baseVal} ${scaleLabel})`;
              })()}
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

        {Boolean(preview.skill?.shieldFromDamagePercent && preview.skill.shieldFromDamagePercent > 0) && (
          <div className="flex items-center justify-between text-xs bg-[#082F49]/50 p-2.5 rounded-lg border border-[#0284C7]/40">
            <span className="text-[#BAE6FD] font-semibold">Conversão de Dano em Escudo:</span>
            <span className="font-bold text-[#38BDF8]">🛡️ Concede {preview.skill?.shieldFromDamagePercent}% do Dano Causado como Escudo</span>
          </div>
        )}

        {!isSupportOnly && !isTargetBarrel && (
          <div className="flex items-center justify-between text-xs bg-[#10131C] p-2.5 rounded-lg border border-[#343B50]">
            <span className="text-[#A7B0C4]">
              {isHeal ? 'Cura Estimada:' : 'Dano Estimado:'}
            </span>
            <span className={`font-black text-sm ${isHeal ? 'text-[#56E59A]' : preview.damageType === 'magical' ? 'text-[#B58AFF]' : 'text-[#FF5252]'}`}>
              {isHeal ? `+${preview.minDamage}` : `${preview.minDamage} ~ ${preview.maxDamage}`}
            </span>
          </div>
        )}

        {!isSupportOnly && !isTargetBarrel && (
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
            className={`border px-3 py-1.5 rounded-lg text-xs font-black flex items-center justify-between ${preview.skill.targetType === 'ally'
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
              className={`px-2 py-0.5 rounded text-[11px] ${preview.skill.targetType === 'ally'
                  ? 'bg-[#38BDF8]/25 text-[#38BDF8]'
                  : preview.isGroundTarget
                    ? 'bg-[#F59E0B]/25 text-[#F59E0B]'
                    : 'bg-[#FF9800]/25 text-[#FF9800]'
                }`}
            >
              {preview.aoeTargetsCount ?? 1}{' '}
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

        {preview.isKillLikely && !isHeal && !isTargetBarrel && !isSupportOnly && (
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
            : preparingMixture
              ? 'Adicionar ao Frasco'
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
