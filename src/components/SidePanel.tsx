import React from 'react';
import type { Unit, SelectedAction } from '../types/game';
import {
  Footprints,
  Swords,
  Shield,
  Wand2,
  HeartPulse,
  Sparkles,
  X,
  Check,
  Flame,
  Target,
  Zap,
  Hammer,
  Skull,
  Crown,
  Sun,
  Crosshair,
  Music,
  Snowflake,
  Wrench,
  BookOpen,
  TreePine,
} from 'lucide-react';

interface SidePanelProps {
  selectedUnit: Unit | null;
  selectedAction: SelectedAction;
  onSelectAction: (action: SelectedAction) => void;
  onWaitUnit: () => void;
  onCancelSelection: () => void;
  isPlayerTurn: boolean;
  turnNumber?: number;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  selectedUnit,
  selectedAction,
  onSelectAction,
  onWaitUnit,
  onCancelSelection,
  isPlayerTurn,
  turnNumber,
}) => {
  if (!selectedUnit) {
    return (
      <aside className="hidden lg:flex w-80 bg-[#1B2030] border-l border-[#343B50] p-4 flex-col items-center justify-center text-center text-[#A7B0C4] shadow-xl select-none">
        <div className="w-16 h-16 rounded-2xl bg-[#10131C] border border-[#343B50] flex items-center justify-center mb-3 shadow-inner">
          <Footprints className="text-[#343B50]" size={32} />
        </div>
        <p className="font-bold text-sm text-[#F3F4F8]">Status & Movimentação</p>
        <p className="text-xs text-[#A7B0C4]/70 mt-1 max-w-[220px] leading-relaxed">
          Selecione qualquer unidade no tabuleiro para ver seus atributos, movimentação e comandos.
        </p>
      </aside>
    );
  }

  const isAlly = selectedUnit.faction === 'player';
  const canAct = isAlly && isPlayerTurn && (!selectedUnit.hasMoved || !selectedUnit.hasAttacked);

  const hpPercent = Math.max(0, Math.min(100, (selectedUnit.currentHp / selectedUnit.maxHp) * 100));

  let hpBarColor = 'bg-[#43C878]';
  if (hpPercent <= 25) {
    hpBarColor = 'bg-[#E94F5F]';
  } else if (hpPercent <= 50) {
    hpBarColor = 'bg-[#F0B44D]';
  }

  const activeShield = selectedUnit.statusEffects?.find((e) => e.type === 'shield' && e.value > 0);
  const activeBuffAtk = selectedUnit.statusEffects?.find((e) => e.type === 'buff_atk' && e.value > 0);
  const isStunned = selectedUnit.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0);
  const slowEffect = selectedUnit.statusEffects?.find((e) => e.type === 'slow' && e.duration > 0);
  const isSlowed = !!slowEffect;
  const slowPenalty = slowEffect ? Math.min(1, slowEffect.value ?? 1) : 0;
  const buffMovEffect = selectedUnit.statusEffects?.find((e) => e.type === 'buff_mov' && e.duration > 0);
  const movBonus = buffMovEffect ? (buffMovEffect.value ?? 1) : 0;
  const effectiveMov = isStunned ? 0 : Math.min(5, Math.max(1, (selectedUnit.mov + movBonus) - slowPenalty));
  const burnEffect = selectedUnit.statusEffects?.find((e) => e.type === 'burn' && e.duration > 0);
  const isBurned = !!burnEffect;
  const poisonEffect = selectedUnit.statusEffects?.find((e) => e.type === 'poison' && e.duration > 0);
  const isPoisoned = !!poisonEffect;
  const isStealthed = selectedUnit.statusEffects?.some((e) => e.type === 'invisible' && e.duration > 0);
  const isDefDebuffed = selectedUnit.statusEffects?.find((e) => e.type === 'debuff_def' && e.duration > 0);
  const excessHealEffect = selectedUnit.statusEffects?.find((e) => e.type === 'excess_heal' && e.duration > 0);
  const excessShieldEffect = selectedUnit.statusEffects?.find((e) => e.type === 'excess_shield' && e.duration > 0);
  const isBossMonster = Boolean(selectedUnit.isBoss || selectedUnit.isMiniBoss);
  const isStunImmuneConsecutive =
    isBossMonster &&
    selectedUnit.lastStunTurn !== undefined &&
    ((turnNumber ?? 1) - selectedUnit.lastStunTurn <= 1) &&
    !isStunned;

  return (
    <aside className="hidden lg:flex w-80 bg-[#1B2030] border-l border-[#343B50] p-4 flex-col justify-between shadow-2xl text-[#F3F4F8] select-none h-full z-10 overflow-y-auto">
      <div className="space-y-4">
        {/* Unit Identity Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#10131C] border border-[#343B50]">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md border-2 border-white/20 relative shrink-0"
            style={{ backgroundColor: selectedUnit.color }}
          >
            {getUnitAvatar(selectedUnit.avatarKey, 28)}
            <span className="absolute -bottom-1 -right-1 bg-[#10131C] border border-[#D4AD65] text-[#D4AD65] font-black text-[10px] px-1.5 py-0.2 rounded-full">
              Lv.{selectedUnit.level}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h2 className="font-bold text-sm text-[#F3F4F8] truncate">{selectedUnit.name}</h2>
              {selectedUnit.isBoss ? (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center gap-1 shrink-0">
                  <Crown size={10} /> BOSS
                </span>
              ) : selectedUnit.isMiniBoss ? (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                  MINI BOSS
                </span>
              ) : (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                    isAlly ? 'bg-[#4C8DFF]/20 text-[#4C8DFF] border border-[#4C8DFF]/40' : 'bg-[#E65353]/20 text-[#E65353] border border-[#E65353]/40'
                  }`}
                >
                  {isAlly ? 'Aliado' : 'Inimigo'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-[#A7B0C4] truncate">{selectedUnit.className}</p>
              {!isAlly && selectedUnit.monsterRole && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                    selectedUnit.monsterRole === 'support'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : selectedUnit.monsterRole === 'tank'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {selectedUnit.monsterRole === 'support'
                    ? '🌿 Suporte'
                    : selectedUnit.monsterRole === 'tank'
                    ? '🛡️ Tanque'
                    : '⚔️ Atacante'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* HP Bar & Shield */}
        <div className="bg-[#10131C] p-3 rounded-xl border border-[#343B50] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#A7B0C4] flex items-center gap-1.5">
              <HeartPulse size={14} className="text-[#E94F5F]" /> Pontos de Vida
            </span>
            <div className="flex items-center gap-1.5">
              {activeShield && (
                <span className="text-[10px] font-bold text-[#38BDF8] bg-[#38BDF8]/15 px-1.5 py-0.5 rounded border border-[#38BDF8]/30">
                  +{activeShield.value} Escudo
                </span>
              )}
              <span className="text-[#F3F4F8] font-bold">
                {selectedUnit.currentHp} / {selectedUnit.maxHp}
              </span>
            </div>
          </div>
          <div className="w-full bg-[#1B2030] h-2.5 rounded-full overflow-hidden border border-[#343B50]">
            <div
              className={`h-full ${hpBarColor} transition-all duration-300 rounded-full`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Status Effects List */}
        {(isPoisoned || isStunned || isSlowed || activeShield || activeBuffAtk || isStealthed || isDefDebuffed || isStunImmuneConsecutive) && (
          <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] space-y-1.5">
            <div className="text-[10px] font-bold text-[#D4AD65] uppercase tracking-wider">
              Efeitos de Status Ativos
            </div>
            <div className="flex flex-wrap gap-1.5">
              {isStunImmuneConsecutive && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#64748B]/20 border border-[#64748B]/40 text-[#CBD5E1] flex items-center gap-1"
                  title="Chefes não podem ser atordoados em turnos consecutivos"
                >
                  🛡️ Resiste a Atordoamento
                </span>
              )}
              {isStealthed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#A78BFA] flex items-center gap-1">
                  👁️‍🗨️ Invisível ({selectedUnit.statusEffects?.find((e) => e.type === 'invisible')?.duration}T)
                </span>
              )}
              {isDefDebuffed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#F87171] flex items-center gap-1">
                  🛡️ Defesa -{isDefDebuffed.value}%
                </span>
              )}
              {isBurned && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F97316]/20 border border-[#F97316]/40 text-[#F97316] flex items-center gap-1">
                  🔥 Queimadura (-{burnEffect?.value}% Vida Máx, {burnEffect?.duration}T)
                </span>
              )}
              {isPoisoned && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#A855F7] flex items-center gap-1">
                  ☠️ Veneno (-{poisonEffect?.value}% Vida Máx, {poisonEffect?.duration}T)
                </span>
              )}
              {isStunned && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FACC15]/20 border border-[#FACC15]/40 text-[#FACC15] flex items-center gap-1">
                  ⚡ Atordoado
                </span>
              )}
              {isSlowed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#60A5FA]/20 border border-[#60A5FA]/40 text-[#60A5FA] flex items-center gap-1">
                  👣 Lentidão (-{slowPenalty} Mov, {slowEffect?.duration}T)
                </span>
              )}
              {activeShield && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8] flex items-center gap-1">
                  🛡️ Escudo ({activeShield.value} HP{activeShield.reflectRatio ? ` - Espinhos ${Math.round(activeShield.reflectRatio * 100)}%` : ''})
                </span>
              )}
              {activeBuffAtk && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F97316]/20 border border-[#F97316]/40 text-[#F97316] flex items-center gap-1">
                  🔥 Fúria (+{activeBuffAtk.value}% Dano)
                </span>
              )}
              {buffMovEffect && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0D9488]/20 border border-[#0D9488]/40 text-[#2DD4BF] flex items-center gap-1">
                  💨 Aceleração (+{buffMovEffect.value} Mov, {buffMovEffect.duration}T)
                </span>
              )}
              {excessHealEffect && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] flex items-center gap-1">
                  💔 Cura excessiva (-50% cura, {excessHealEffect.duration}T)
                </span>
              )}
              {excessShieldEffect && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] flex items-center gap-1">
                  🛡️ Escudo excessivo (-50% escudo, {excessShieldEffect.duration}T)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#1B2030] text-[#FF5252]">
              <Swords size={16} />
            </div>
            <div>
              <div className="text-[10px] text-[#A7B0C4]">Ataque Físico</div>
              <div className="font-black text-[#F3F4F8] text-sm">{selectedUnit.atk}</div>
            </div>
          </div>

          <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#1B2030] text-[#B58AFF]">
              <Wand2 size={16} />
            </div>
            <div>
              <div className="text-[10px] text-[#A7B0C4]">Poder Mágico</div>
              <div className="font-black text-[#F3F4F8] text-sm">{selectedUnit.mag}</div>
            </div>
          </div>

          <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#1B2030] text-[#43C878]">
              <Shield size={16} />
            </div>
            <div>
              <div className="text-[10px] text-[#A7B0C4]">Defesa Física</div>
              <div className="font-black text-[#F3F4F8] text-sm">{selectedUnit.def}</div>
            </div>
          </div>

          <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#1B2030] text-[#F0B44D]">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-[10px] text-[#A7B0C4]">Resistência Mag.</div>
              <div className="font-black text-[#F3F4F8] text-sm">{selectedUnit.res}</div>
            </div>
          </div>

          <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#1B2030] text-[#4C8DFF]">
              <Footprints size={16} />
            </div>
            <div>
              <div className="text-[10px] text-[#A7B0C4]">Movimento</div>
              {isStunned ? (
                <div className="font-black text-[#FACC15] text-sm flex items-center gap-1">
                  0 casas <span className="text-[10px] font-normal text-[#FACC15]/80">(Atordoado)</span>
                </div>
              ) : isSlowed ? (
                <div className="font-black text-[#60A5FA] text-sm flex items-center gap-1">
                  {effectiveMov} casas <span className="text-[10px] font-normal text-[#60A5FA]/80">(-{slowPenalty})</span>
                </div>
              ) : (
                <div className="font-black text-[#F3F4F8] text-sm">{effectiveMov} casas</div>
              )}
            </div>
          </div>

          <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#1B2030] text-[#D4AD65]">
              <Target size={16} />
            </div>
            <div>
              <div className="text-[10px] text-[#A7B0C4]">Alcance Base</div>
              <div className="font-black text-[#F3F4F8] text-sm">{selectedUnit.range} casas</div>
            </div>
          </div>
        </div>

        {/* Turn Action Status Badges */}
        {isAlly && (
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`flex-1 py-1.5 px-2 rounded-lg text-center border flex items-center justify-center gap-1 font-bold ${
                selectedUnit.hasMoved
                  ? 'bg-[#10131C] border-[#343B50] text-[#A7B0C4]/40'
                  : 'bg-[#4C8DFF]/15 border-[#4C8DFF]/40 text-[#4C8DFF]'
              }`}
            >
              {selectedUnit.hasMoved ? <Check size={13} /> : null} Movimento
            </span>
            <span
              className={`flex-1 py-1.5 px-2 rounded-lg text-center border flex items-center justify-center gap-1 font-bold ${
                selectedUnit.hasAttacked
                  ? 'bg-[#10131C] border-[#343B50] text-[#A7B0C4]/40'
                  : 'bg-[#FF5252]/15 border-[#FF5252]/40 text-[#FF5252]'
              }`}
            >
              {selectedUnit.hasAttacked ? <Check size={13} /> : null} Ataque
            </span>
          </div>
        )}

        {/* Left Panel Guidance Tip */}
        <div className="p-2.5 rounded-xl bg-[#10131C] border border-[#343B50] text-[11px] text-[#A7B0C4] flex items-center gap-2">
          <Sparkles size={16} className="text-[#D4AD65] shrink-0" />
          <span>
            Habilidades especiais estão listadas no <strong className="text-[#D4AD65]">menu à esquerda</strong>.
          </span>
        </div>
      </div>

      {/* Movement & Action Commands */}
      <div className="mt-4 pt-3 border-t border-[#343B50] space-y-2">
        {isAlly && canAct ? (
          <div className="space-y-2">
            {isStunned && (
              <div className="p-2 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 text-[11px] text-[#FACC15] flex items-center gap-2">
                <Zap size={14} className="shrink-0 text-[#FACC15]" />
                <span>Unidade atordoada! Pressione Esperar (T) ou passe o turno.</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={selectedUnit.hasMoved || isStunned}
                onClick={() => onSelectAction('move')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                  selectedAction === 'move'
                    ? 'bg-gradient-to-r from-[#4C8DFF] to-[#2563EB] text-white ring-2 ring-[#4C8DFF]/50'
                    : selectedUnit.hasMoved || isStunned
                    ? 'bg-[#10131C] text-[#A7B0C4]/30 border border-[#343B50] cursor-not-allowed'
                    : 'bg-[#10131C] hover:bg-[#4C8DFF]/20 text-[#4C8DFF] border border-[#4C8DFF]/40 hover:border-[#4C8DFF]'
                }`}
              >
                <Footprints size={15} /> Mover (W)
              </button>

              <button
                disabled={selectedUnit.hasAttacked || isStunned}
                onClick={() => onSelectAction('attack')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                  selectedAction === 'attack'
                    ? 'bg-gradient-to-r from-[#FF5252] to-[#DC2626] text-white ring-2 ring-[#FF5252]/50'
                    : selectedUnit.hasAttacked || isStunned
                    ? 'bg-[#10131C] text-[#A7B0C4]/30 border border-[#343B50] cursor-not-allowed'
                    : 'bg-[#10131C] hover:bg-[#FF5252]/20 text-[#FF5252] border border-[#FF5252]/40 hover:border-[#FF5252]'
                }`}
              >
                <Swords size={15} /> Atacar (A)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onWaitUnit}
                className="py-2.5 px-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 bg-[#10131C] hover:bg-[#F0B44D]/20 text-[#F0B44D] border border-[#F0B44D]/40 hover:border-[#F0B44D] transition-all shadow-sm active:scale-95"
              >
                <Check size={15} /> Esperar (T)
              </button>

              <button
                onClick={onCancelSelection}
                className="py-2.5 px-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 bg-[#10131C] hover:bg-[#343B50] text-[#A7B0C4] border border-[#343B50] transition-all shadow-sm active:scale-95"
              >
                <X size={15} /> Cancelar (Esc)
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onCancelSelection}
            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 bg-[#10131C] hover:bg-[#343B50] text-[#A7B0C4] border border-[#343B50] transition-all"
          >
            <X size={15} /> Fechar Painel (Esc)
          </button>
        )}
      </div>
    </aside>
  );
};

export function getUnitAvatar(key: string, size = 16) {
  switch (key) {
    case 'warrior':
    case 'arcane_knight':
    case 'void_executioner':
    case 'fallen_knight':
    case 'black_sun_templar':
    case 'celestial_slayer':
    case 'twilight_reaper':
    case 'rune_blade':
    case 'astral_stalker':
      return <Swords size={size} />;
    case 'archer':
    case 'steppe_hunter':
    case 'kobold_gunner':
      return <Target size={size} />;
    case 'mage':
    case 'dark_mage':
    case 'pyromancer':
    case 'ember_elemental':
    case 'cataclysm_avatar':
    case 'volcanic_drake':
      return <Flame size={size} />;
    case 'cleric':
    case 'thorn_witch':
    case 'storm_shaman':
    case 'cosmic_parasite':
      return <HeartPulse size={size} />;
    case 'assassin':
    case 'spectral_wolf':
    case 'hell_hound':
    case 'thunder_wolf':
    case 'magma_lizard':
    case 'void_crawler':
      return <Footprints size={size} />;
    case 'necromancer':
    case 'spider':
    case 'mimic':
    case 'ash_specter':
    case 'miasma_aberration':
    case 'living_nightmare':
    case 'devourer_boss':
    case 'lava_worm':
      return <Skull size={size} />;
    case 'druid':
      return <TreePine size={size} />;
    case 'engineer':
    case 'steam_golem':
      return <Wrench size={size} />;
    case 'rune_mage':
    case 'glyph_weaver':
    case 'fate_scribe':
      return <BookOpen size={size} />;
    case 'berserker':
    case 'orc':
    case 'cursed_blacksmith':
    case 'berserker_warrior':
    case 'war_bear':
      return <Hammer size={size} />;
    case 'paladin':
    case 'sun':
    case 'eclipse_herald':
    case 'madness_eye':
      return <Sun size={size} />;
    case 'lancer':
    case 'dark_valkyrie':
    case 'fallen_seraph':
      return <Crosshair size={size} />;
    case 'bard':
    case 'abyssal_siren':
      return <Music size={size} />;
    case 'ice_mage':
      return <Snowflake size={size} />;
    case 'goblin':
    case 'abyssal_tentacle':
      return <Zap size={size} />;
    case 'astaroth_boss':
    case 'malakor_final_boss':
      return <Crown size={size} />;
    case 'spectral_harbinger_boss':
    case 'void_leviathan_boss':
      return <Skull size={size} />;
    case 'forge_titan_boss':
      return <Flame size={size} />;
    case 'rune_master_boss':
      return <BookOpen size={size} />;
    case 'valgar_butcher_boss':
      return <Hammer size={size} />;
    case 'venom_chimera_boss':
      return <Zap size={size} />;
    case 'eclipse_knight_boss':
      return <Sun size={size} />;
    case 'basalt_golem':
    case 'rune_construct':
    case 'iron_gargoyle':
    case 'megalith_guardian':
    case 'void_blob':
    case 'obsidian_colossus':
    case 'chaos_praetorian':
      return <Shield size={size} />;
    default:
      return <Sparkles size={size} />;
  }
}
