import React from 'react';
import type { Unit, SelectedAction, Skill } from '../types/game';
import { Footprints, Swords, Shield, Wand2, HeartPulse, Sparkles, X, Check, Flame, Target, Zap, Skull, Hammer } from 'lucide-react';

interface SidePanelProps {
  selectedUnit: Unit | null;
  selectedAction: SelectedAction;
  activeSkill: Skill | null;
  onSelectAction: (action: SelectedAction) => void;
  onSelectSkill: (skill: Skill) => void;
  onWaitUnit: () => void;
  onCancelSelection: () => void;
  isPlayerTurn: boolean;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  selectedUnit,
  selectedAction,
  activeSkill,
  onSelectAction,
  onSelectSkill,
  onWaitUnit,
  onCancelSelection,
  isPlayerTurn,
}) => {
  if (!selectedUnit) {
    return (
      <aside className="w-80 bg-[#1B2030] border-l border-[#343B50] p-4 flex flex-col items-center justify-center text-center text-[#A7B0C4] shadow-xl">
        <div className="w-16 h-16 rounded-full bg-[#10131C] border border-[#343B50] flex items-center justify-center mb-3">
          <Footprints className="text-[#343B50]" size={32} />
        </div>
        <p className="font-semibold text-sm">Nenhuma unidade selecionada</p>
        <p className="text-xs text-[#A7B0C4]/70 mt-1 max-w-[200px]">
          Clique em qualquer aliada ou inimiga no tabuleiro para ver seus atributos.
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

  return (
    <aside className="w-80 bg-[#1B2030] border-l border-[#343B50] p-4 flex flex-col justify-between shadow-xl text-[#F3F4F8] select-none">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#10131C] border border-[#343B50]">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md border-2 border-white/20 relative"
            style={{ backgroundColor: selectedUnit.color }}
          >
            {getSkillIcon(selectedUnit.avatarKey, 28)}
            <span className="absolute -bottom-1 -right-1 bg-[#10131C] border border-[#D4AD65] text-[#D4AD65] font-bold text-[10px] px-1.5 py-0.5 rounded-full">
              Nv.{selectedUnit.level}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-[#F3F4F8] truncate">{selectedUnit.name}</h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  isAlly ? 'bg-[#4C8DFF]/20 text-[#4C8DFF]' : 'bg-[#E65353]/20 text-[#E65353]'
                }`}
              >
                {isAlly ? 'Aliado' : 'Inimigo'}
              </span>
            </div>
            <p className="text-xs text-[#A7B0C4] truncate">{selectedUnit.className}</p>
          </div>
        </div>

        <div className="bg-[#10131C] p-3 rounded-xl border border-[#343B50] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#A7B0C4] flex items-center gap-1">
              <HeartPulse size={14} className="text-[#E94F5F]" /> Pontos de Vida
            </span>
            <span className="text-[#F3F4F8]">
              {selectedUnit.currentHp} / {selectedUnit.maxHp}
            </span>
          </div>
          <div className="w-full bg-[#1B2030] h-2.5 rounded-full overflow-hidden border border-[#343B50]">
            <div
              className={`h-full ${hpBarColor} transition-all duration-300 rounded-full`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#10131C] p-2 rounded-lg border border-[#343B50] flex items-center gap-2">
            <Swords size={16} className="text-[#FF5252]" />
            <div>
              <div className="text-[10px] text-[#A7B0C4]">Ataque Físico</div>
              <div className="font-bold text-[#F3F4F8]">{selectedUnit.atk}</div>
            </div>
          </div>

          <div className="bg-[#10131C] p-2 rounded-lg border border-[#343B50] flex items-center gap-2">
            <Wand2 size={16} className="text-[#B58AFF]" />
            <div>
              <div className="text-[10px] text-[#A7B0C4]">Poder Mágico</div>
              <div className="font-bold text-[#F3F4F8]">{selectedUnit.mag}</div>
            </div>
          </div>

          <div className="bg-[#10131C] p-2 rounded-lg border border-[#343B50] flex items-center gap-2">
            <Shield size={16} className="text-[#43C878]" />
            <div>
              <div className="text-[10px] text-[#A7B0C4]">Defesa Física</div>
              <div className="font-bold text-[#F3F4F8]">{selectedUnit.def}</div>
            </div>
          </div>

          <div className="bg-[#10131C] p-2 rounded-lg border border-[#343B50] flex items-center gap-2">
            <Sparkles size={16} className="text-[#F0B44D]" />
            <div>
              <div className="text-[10px] text-[#A7B0C4]">Resistência Mag.</div>
              <div className="font-bold text-[#F3F4F8]">{selectedUnit.res}</div>
            </div>
          </div>

          <div className="bg-[#10131C] p-2 rounded-lg border border-[#343B50] flex items-center gap-2">
            <Footprints size={16} className="text-[#4C8DFF]" />
            <div>
              <div className="text-[10px] text-[#A7B0C4]">Movimento</div>
              <div className="font-bold text-[#F3F4F8]">{selectedUnit.mov} casas</div>
            </div>
          </div>

          <div className="bg-[#10131C] p-2 rounded-lg border border-[#343B50] flex items-center gap-2">
            <Target size={16} className="text-[#D4AD65]" />
            <div>
              <div className="text-[10px] text-[#A7B0C4]">Alcance Base</div>
              <div className="font-bold text-[#F3F4F8]">{selectedUnit.range} casas</div>
            </div>
          </div>
        </div>

        {isAlly && (
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`flex-1 py-1 px-2 rounded-md text-center border flex items-center justify-center gap-1 font-semibold ${
                selectedUnit.hasMoved
                  ? 'bg-[#10131C] border-[#343B50] text-[#A7B0C4]/50'
                  : 'bg-[#4C8DFF]/10 border-[#4C8DFF]/30 text-[#4C8DFF]'
              }`}
            >
              {selectedUnit.hasMoved ? <Check size={12} /> : null} Movimento
            </span>
            <span
              className={`flex-1 py-1 px-2 rounded-md text-center border flex items-center justify-center gap-1 font-semibold ${
                selectedUnit.hasAttacked
                  ? 'bg-[#10131C] border-[#343B50] text-[#A7B0C4]/50'
                  : 'bg-[#FF5252]/10 border-[#FF5252]/30 text-[#FF5252]'
              }`}
            >
              {selectedUnit.hasAttacked ? <Check size={12} /> : null} Ataque
            </span>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#D4AD65] uppercase tracking-wider">Habilidades Disponíveis</h3>
          {selectedUnit.skills.length === 0 ? (
            <p className="text-xs text-[#A7B0C4]">Nenhuma habilidade especial.</p>
          ) : (
            selectedUnit.skills.map((skill) => {
              const isSelected = activeSkill?.id === skill.id;
              const isOnCd = skill.currentCooldown > 0;
              const disabled = !isAlly || !canAct || selectedUnit.hasAttacked || isOnCd;

              return (
                <button
                  key={skill.id}
                  disabled={disabled}
                  onClick={() => onSelectSkill(skill)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-[#D4AD65]/20 border-[#D4AD65] text-white shadow-lg'
                      : disabled
                      ? 'bg-[#10131C]/60 border-[#343B50]/60 opacity-60 cursor-not-allowed'
                      : 'bg-[#10131C] border-[#343B50] hover:border-[#D4AD65]/60 text-[#F3F4F8]'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-[#1B2030] text-[#D4AD65] border border-[#343B50]">
                    {getSkillIcon(skill.iconName, 18)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{skill.name}</span>
                      {isOnCd ? (
                        <span className="text-[10px] text-[#E65353] font-bold">Recarga: {skill.currentCooldown}T</span>
                      ) : (
                        <span className="text-[10px] text-[#43C878] font-bold">Pronto</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#A7B0C4] mt-0.5 leading-snug line-clamp-2">{skill.description}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#343B50] space-y-2">
        {isAlly && canAct ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={selectedUnit.hasMoved}
              onClick={() => onSelectAction('move')}
              className={`py-2 px-3 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all ${
                selectedAction === 'move'
                  ? 'bg-[#4C8DFF] text-white shadow-md'
                  : selectedUnit.hasMoved
                  ? 'bg-[#10131C] text-[#A7B0C4]/40 border border-[#343B50] cursor-not-allowed'
                  : 'bg-[#10131C] hover:bg-[#4C8DFF]/20 text-[#4C8DFF] border border-[#4C8DFF]/40'
              }`}
            >
              <Footprints size={14} /> Mover (M)
            </button>

            <button
              disabled={selectedUnit.hasAttacked}
              onClick={() => onSelectAction('attack')}
              className={`py-2 px-3 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all ${
                selectedAction === 'attack'
                  ? 'bg-[#FF5252] text-white shadow-md'
                  : selectedUnit.hasAttacked
                  ? 'bg-[#10131C] text-[#A7B0C4]/40 border border-[#343B50] cursor-not-allowed'
                  : 'bg-[#10131C] hover:bg-[#FF5252]/20 text-[#FF5252] border border-[#FF5252]/40'
              }`}
            >
              <Swords size={14} /> Atacar (A)
            </button>

            <button
              onClick={onWaitUnit}
              className="py-2 px-3 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-1.5 bg-[#10131C] hover:bg-[#F0B44D]/20 text-[#F0B44D] border border-[#F0B44D]/40 transition-all"
            >
              <Check size={14} /> Esperar (W)
            </button>

            <button
              onClick={onCancelSelection}
              className="py-2 px-3 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-1.5 bg-[#10131C] hover:bg-[#A7B0C4]/20 text-[#A7B0C4] border border-[#343B50] transition-all"
            >
              <X size={14} /> Cancelar (Esc)
            </button>
          </div>
        ) : (
          <button
            onClick={onCancelSelection}
            className="w-full py-2 px-3 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-1.5 bg-[#10131C] hover:bg-[#A7B0C4]/20 text-[#A7B0C4] border border-[#343B50] transition-all"
          >
            <X size={14} /> Fechar Painel (Esc)
          </button>
        )}
      </div>
    </aside>
  );
};

function getSkillIcon(iconName: string, size = 16) {
  switch (iconName) {
    case 'Sword':
    case 'warrior':
      return <Swords size={size} />;
    case 'Target':
    case 'archer':
      return <Target size={size} />;
    case 'Flame':
    case 'mage':
    case 'dark_mage':
      return <Flame size={size} />;
    case 'HeartPulse':
    case 'cleric':
      return <HeartPulse size={size} />;
    case 'Zap':
    case 'goblin':
      return <Zap size={size} />;
    case 'Hammer':
    case 'orc':
      return <Hammer size={size} />;
    case 'Skull':
    case 'spider':
      return <Skull size={size} />;
    default:
      return <Sparkles size={size} />;
  }
}
