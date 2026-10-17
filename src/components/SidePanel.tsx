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
} from 'lucide-react';

interface SidePanelProps {
  selectedUnit: Unit | null;
  selectedAction: SelectedAction;
  onSelectAction: (action: SelectedAction) => void;
  onWaitUnit: () => void;
  onCancelSelection: () => void;
  isPlayerTurn: boolean;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  selectedUnit,
  selectedAction,
  onSelectAction,
  onWaitUnit,
  onCancelSelection,
  isPlayerTurn,
}) => {
  if (!selectedUnit) {
    return (
      <aside className="w-80 bg-[#1B2030] border-l border-[#343B50] p-4 flex flex-col items-center justify-center text-center text-[#A7B0C4] shadow-xl select-none">
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
  const isSlowed = selectedUnit.statusEffects?.some((e) => e.type === 'slow' && e.duration > 0);
  const isPoisoned = selectedUnit.statusEffects?.some((e) => e.type === 'poison' && e.duration > 0);

  return (
    <aside className="w-80 bg-[#1B2030] border-l border-[#343B50] p-4 flex flex-col justify-between shadow-2xl text-[#F3F4F8] select-none h-full z-10 overflow-y-auto">
      <div className="space-y-4">
        {/* Unit Identity Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#10131C] border border-[#343B50]">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md border-2 border-white/20 relative shrink-0"
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
        {(isPoisoned || isStunned || isSlowed || activeShield || activeBuffAtk) && (
          <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] space-y-1.5">
            <div className="text-[10px] font-bold text-[#D4AD65] uppercase tracking-wider">
              Efeitos de Status Ativos
            </div>
            <div className="flex flex-wrap gap-1.5">
              {isPoisoned && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#A855F7] flex items-center gap-1">
                  ☠️ Veneno
                </span>
              )}
              {isStunned && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FACC15]/20 border border-[#FACC15]/40 text-[#FACC15] flex items-center gap-1">
                  ⚡ Atordoado
                </span>
              )}
              {isSlowed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#60A5FA]/20 border border-[#60A5FA]/40 text-[#60A5FA] flex items-center gap-1">
                  👣 Lentidão (-1 Mov)
                </span>
              )}
              {activeShield && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8] flex items-center gap-1">
                  🛡️ Escudo ({activeShield.value} HP)
                </span>
              )}
              {activeBuffAtk && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F97316]/20 border border-[#F97316]/40 text-[#F97316] flex items-center gap-1">
                  🔥 Fúria (+{activeBuffAtk.value}% Dano)
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
              <div className="font-black text-[#F3F4F8] text-sm">{selectedUnit.mov} casas</div>
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

function getUnitAvatar(key: string, size = 16) {
  switch (key) {
    case 'warrior':
      return <Swords size={size} />;
    case 'archer':
      return <Target size={size} />;
    case 'mage':
    case 'dark_mage':
      return <Flame size={size} />;
    case 'cleric':
      return <HeartPulse size={size} />;
    case 'goblin':
      return <Zap size={size} />;
    case 'orc':
      return <Hammer size={size} />;
    case 'spider':
      return <Skull size={size} />;
    default:
      return <Sparkles size={size} />;
  }
}
