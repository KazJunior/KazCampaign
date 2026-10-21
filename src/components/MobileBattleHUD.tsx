import React, { useState, useEffect } from 'react';
import type { Unit, SelectedAction, Skill, BattlePhase } from '../types/game';
import { getUnitAvatar } from './SidePanel';
import {
  Footprints,
  Swords,
  Sparkles,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Crown,
  Play,
  Zap,
} from 'lucide-react';

interface MobileBattleHUDProps {
  selectedUnit: Unit | null;
  selectedAction: SelectedAction;
  activeSkill: Skill | null;
  phase: BattlePhase;
  turnNumber?: number;
  onSelectAction: (action: SelectedAction) => void;
  onSelectSkill: (skill: Skill) => void;
  onClearSkill: () => void;
  onWaitUnit: () => void;
  onCancelSelection: () => void;
  onEndTurn: () => void;
}

export const MobileBattleHUD: React.FC<MobileBattleHUDProps> = ({
  selectedUnit,
  selectedAction,
  activeSkill,
  phase,
  turnNumber,
  onSelectAction,
  onSelectSkill,
  onClearSkill,
  onWaitUnit,
  onCancelSelection,
  onEndTurn,
}) => {
  const [activeTab, setActiveTab] = useState<'actions' | 'skills' | 'stats'>('actions');
  const [isExpanded, setIsExpanded] = useState(false);

  // When a unit is selected, switch to 'skills' if activeSkill is set, or reset tab
  useEffect(() => {
    if (activeSkill) {
      setActiveTab('skills');
    }
  }, [activeSkill]);

  useEffect(() => {
    if (!selectedUnit) {
      setIsExpanded(false);
      setActiveTab('actions');
    }
  }, [selectedUnit]);

  const isPlayerTurn = phase === 'player_turn';

  // 1. If NO unit is selected: show non-intrusive floating action pill
  if (!selectedUnit) {
    return (
      <div className="lg:hidden absolute bottom-3 inset-x-3 z-30 pointer-events-none flex flex-col items-center gap-2">
        <div className="pointer-events-auto bg-[#1B2030]/95 backdrop-blur-md border border-[#343B50] px-4 py-2 rounded-2xl shadow-2xl flex items-center justify-between gap-3 max-w-sm w-full">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isPlayerTurn ? 'bg-[#4C8DFF] animate-ping' : 'bg-[#E65353] animate-pulse'
              }`}
            />
            <span className="text-[#F3F4F8] font-bold text-[11px] truncate">
              {phase === 'deployment'
                ? 'Toque em um herói para reposicionar'
                : isPlayerTurn
                ? (turnNumber ? `Turno ${turnNumber}: Toque em um herói` : 'Toque em um herói para comandar')
                : 'Turno do Inimigo aguardando...'}
            </span>
          </div>

          {isPlayerTurn && (
            <button
              onClick={onEndTurn}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#4C8DFF] to-[#2563EB] text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow active:scale-95 shrink-0 border border-[#6BA0FF]/40 cursor-pointer"
            >
              <Play size={12} fill="currentColor" /> Fim de Turno
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. Unit is selected
  const isAlly = selectedUnit.faction === 'player';
  const isStunned = selectedUnit.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0);
  const canAct = isAlly && isPlayerTurn && (!selectedUnit.hasMoved || !selectedUnit.hasAttacked) && !isStunned;
  const skills = selectedUnit.skills || [];

  const hpPercent = Math.max(0, Math.min(100, (selectedUnit.currentHp / selectedUnit.maxHp) * 100));
  let hpBarColor = 'bg-[#43C878]';
  if (hpPercent <= 25) {
    hpBarColor = 'bg-[#E94F5F]';
  } else if (hpPercent <= 50) {
    hpBarColor = 'bg-[#F0B44D]';
  }

  const activeShield = selectedUnit.statusEffects?.find((e) => e.type === 'shield' && e.value > 0);
  const slowEffect = selectedUnit.statusEffects?.find((e) => e.type === 'slow' && e.duration > 0);
  const effectiveMov = isStunned ? 0 : slowEffect ? Math.max(1, selectedUnit.mov - Math.min(1, slowEffect.value ?? 1)) : selectedUnit.mov;

  return (
    <div className="lg:hidden absolute bottom-2 inset-x-2 z-30 flex flex-col font-sans select-none animate-in slide-in-from-bottom-6 duration-200">
      <div className="bg-[#1B2030]/95 backdrop-blur-md border-2 border-[#D4AD65]/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Unit Identity & Mini Status Strip */}
        <div className="p-2.5 bg-[#141824] border-b border-[#343B50] flex items-center justify-between gap-2">
          {/* Avatar & Name & HP */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md border border-white/20 shrink-0 relative"
              style={{ backgroundColor: selectedUnit.color }}
            >
              {getUnitAvatar(selectedUnit.avatarKey, 20)}
              <span className="absolute -bottom-1 -right-1 bg-[#10131C] border border-[#D4AD65] text-[#D4AD65] font-black text-[9px] px-1 rounded-full">
                L{selectedUnit.level}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-[#F3F4F8] truncate max-w-[120px]">
                  {selectedUnit.name}
                </span>
                {selectedUnit.isBoss ? (
                  <span className="text-[8px] font-black px-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center gap-0.5 shrink-0">
                    <Crown size={9} /> BOSS
                  </span>
                ) : (
                  <span
                    className={`text-[8px] font-black px-1 rounded uppercase tracking-wider shrink-0 ${
                      isAlly ? 'bg-[#4C8DFF]/20 text-[#4C8DFF]' : 'bg-[#E65353]/20 text-[#E65353]'
                    }`}
                  >
                    {isAlly ? 'Aliado' : 'Inimigo'}
                  </span>
                )}
              </div>

              {/* HP Bar */}
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 bg-[#10131C] h-2 rounded-full overflow-hidden border border-[#343B50] relative">
                  <div
                    className={`${hpBarColor} h-full transition-all duration-300`}
                    style={{ width: `${hpPercent}%` }}
                  />
                  {activeShield && activeShield.value > 0 && (
                    <div
                      className="absolute top-0 left-0 bg-[#38BDF8] h-full opacity-80"
                      style={{
                        width: `${Math.min(100, (activeShield.value / selectedUnit.maxHp) * 100)}%`,
                      }}
                    />
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#A7B0C4] shrink-0">
                  {selectedUnit.currentHp}/{selectedUnit.maxHp}
                  {activeShield ? ` (+${activeShield.value})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Pass Turn, Expand/Collapse & Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isPlayerTurn && (
              <button
                type="button"
                onClick={onEndTurn}
                className="px-2 py-1 rounded-lg bg-[#4C8DFF]/20 border border-[#4C8DFF]/50 text-[#4C8DFF] hover:bg-[#4C8DFF] hover:text-white text-[10px] font-black uppercase flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                title="Passar Turno"
              >
                <Play size={10} fill="currentColor" />
                <span>Passar</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-[#10131C] border border-[#343B50] text-[#A7B0C4] hover:text-white"
              title={isExpanded ? 'Recolher Painel' : 'Expandir Detalhes'}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>

            <button
              type="button"
              onClick={onCancelSelection}
              className="p-1.5 rounded-lg bg-[#10131C] border border-[#343B50] text-[#A7B0C4] hover:text-[#FF5252]"
              title="Cancelar Seleção"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Action Buttons Row */}
        {isAlly && (
          <div className="p-2 grid grid-cols-4 gap-1.5 bg-[#171B29] border-b border-[#343B50]">
            {/* Move Button */}
            <button
              disabled={selectedUnit.hasMoved || isStunned || !isPlayerTurn}
              onClick={() => {
                onSelectAction('move');
                setIsExpanded(false);
              }}
              className={`py-2 px-1 rounded-xl font-black text-[11px] uppercase flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                selectedAction === 'move'
                  ? 'bg-gradient-to-r from-[#4C8DFF] to-[#2563EB] text-white ring-2 ring-[#4C8DFF]/60'
                  : selectedUnit.hasMoved || isStunned || !isPlayerTurn
                  ? 'bg-[#10131C] text-[#A7B0C4]/30 border border-[#343B50] cursor-not-allowed'
                  : 'bg-[#10131C] text-[#4C8DFF] border border-[#4C8DFF]/40 hover:bg-[#4C8DFF]/15'
              }`}
            >
              <Footprints size={15} />
              <span>Mover</span>
            </button>

            {/* Attack Button */}
            <button
              disabled={selectedUnit.hasAttacked || isStunned || !isPlayerTurn}
              onClick={() => {
                onSelectAction('attack');
                setIsExpanded(false);
              }}
              className={`py-2 px-1 rounded-xl font-black text-[11px] uppercase flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                selectedAction === 'attack'
                  ? 'bg-gradient-to-r from-[#FF5252] to-[#DC2626] text-white ring-2 ring-[#FF5252]/60'
                  : selectedUnit.hasAttacked || isStunned || !isPlayerTurn
                  ? 'bg-[#10131C] text-[#A7B0C4]/30 border border-[#343B50] cursor-not-allowed'
                  : 'bg-[#10131C] text-[#FF5252] border border-[#FF5252]/40 hover:bg-[#FF5252]/15'
              }`}
            >
              <Swords size={15} />
              <span>Atacar</span>
            </button>

            {/* Skills Drawer Toggle */}
            <button
              disabled={skills.length === 0 || isStunned}
              onClick={() => {
                if (activeSkill) {
                  onClearSkill();
                } else {
                  setActiveTab('skills');
                  setIsExpanded(true);
                }
              }}
              className={`py-2 px-1 rounded-xl font-black text-[11px] uppercase flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 relative ${
                activeTab === 'skills' && isExpanded
                  ? 'bg-gradient-to-r from-[#D4AD65] to-[#B88E43] text-[#10131C] ring-2 ring-[#D4AD65]/60'
                  : activeSkill
                  ? 'bg-[#D4AD65]/20 text-[#D4AD65] border border-[#D4AD65]'
                  : 'bg-[#10131C] text-[#D4AD65] border border-[#D4AD65]/40 hover:bg-[#D4AD65]/15'
              }`}
            >
              <Sparkles size={15} />
              <span>Skills ({skills.length})</span>
              {activeSkill && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D4AD65] animate-ping" />
              )}
            </button>

            {/* Wait Unit Button */}
            <button
              disabled={!isPlayerTurn}
              onClick={onWaitUnit}
              className="py-2 px-1 rounded-xl font-black text-[11px] uppercase flex flex-col items-center justify-center gap-0.5 bg-[#10131C] text-[#F0B44D] border border-[#F0B44D]/40 hover:bg-[#F0B44D]/15 active:scale-95 transition-all"
            >
              <Check size={15} />
              <span>Esperar</span>
            </button>
          </div>
        )}

        {/* Stunned Alert */}
        {isStunned && (
          <div className="px-3 py-1.5 bg-[#FACC15]/15 border-b border-[#FACC15]/40 flex items-center gap-2 text-xs text-[#FACC15] font-bold">
            <Zap size={14} className="shrink-0" />
            <span>⚡ Unidade Atordoada: Incapaz de agir ou usar habilidades!</span>
          </div>
        )}

        {/* Expandable Tabs (Skills & Stats) */}
        {isExpanded && (
          <div className="max-h-64 overflow-y-auto p-3 space-y-3 bg-[#121622] animate-in fade-in duration-150">
            {/* Tab Selector Buttons */}
            <div className="flex items-center gap-2 border-b border-[#343B50] pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('actions')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'actions'
                    ? 'bg-[#4C8DFF] text-white shadow'
                    : 'bg-[#10131C] text-[#A7B0C4] hover:text-white'
                }`}
              >
                Atributos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'skills'
                    ? 'bg-[#D4AD65] text-[#10131C] shadow font-black'
                    : 'bg-[#10131C] text-[#A7B0C4] hover:text-white'
                }`}
              >
                <Sparkles size={13} />
                <span>Habilidades ({skills.length})</span>
              </button>
            </div>

            {/* TAB: Skills List */}
            {activeTab === 'skills' && (
              <div className="space-y-2">
                {skills.length === 0 ? (
                  <div className="p-3 text-center text-xs text-[#A7B0C4]">
                    Nenhuma habilidade especial disponível.
                  </div>
                ) : (
                  skills.map((skill) => {
                    const isSelected = activeSkill?.id === skill.id;
                    const isOnCd = skill.currentCooldown > 0;
                    const disabled = !isAlly || !canAct || isOnCd;

                    let badgeColor = 'bg-[#4C8DFF]/20 text-[#4C8DFF] border-[#4C8DFF]/30';
                    let typeName = 'Físico';
                    if (skill.damageType === 'magical') {
                      badgeColor = 'bg-[#B58AFF]/20 text-[#B58AFF] border-[#B58AFF]/30';
                      typeName = 'Mágico';
                    } else if (skill.damageType === 'healing') {
                      badgeColor = 'bg-[#56E59A]/20 text-[#56E59A] border-[#56E59A]/30';
                      typeName = 'Cura';
                    }

                    return (
                      <button
                        key={skill.id}
                        disabled={disabled}
                        type="button"
                        onClick={() => {
                          onSelectSkill(skill);
                          setIsExpanded(false); // Collapse so user can tap board!
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                          isSelected
                            ? 'bg-[#D4AD65]/20 border-[#D4AD65] text-white shadow ring-1 ring-[#D4AD65]'
                            : disabled
                            ? 'bg-[#10131C]/60 border-[#343B50]/60 opacity-60 cursor-not-allowed text-[#A7B0C4]'
                            : 'bg-[#10131C] border-[#343B50] hover:border-[#D4AD65] active:scale-98 text-[#F3F4F8]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs truncate">{skill.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${badgeColor}`}
                            >
                              {typeName}
                            </span>
                            {isOnCd && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#E65353]/20 text-[#E65353] border border-[#E65353]/40">
                                CD: {skill.currentCooldown}T
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-[10px] text-[#A7B0C4] line-clamp-2 leading-relaxed">
                          {skill.description}
                        </p>

                        <div className="flex items-center gap-3 text-[10px] text-[#D4AD65] font-semibold mt-0.5 flex-wrap">
                          <span>Alcance: {skill.rangeMax} casas</span>
                          {skill.aoeRadius && skill.aoeRadius > 0 && (
                            <span>• Raio AoE: {skill.aoeRadius}</span>
                          )}
                          {skill.canTargetGround && (
                            <span className="text-[#10B981] font-bold">• 🎯 Alvo no Solo</span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB: Unit Stats & Attributes */}
            {activeTab === 'actions' && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-[#10131C] p-2 rounded-xl border border-[#343B50]">
                    <span className="text-[10px] text-[#A7B0C4] block">Ataque</span>
                    <strong className="text-sm text-[#FF5252] font-black">{selectedUnit.atk}</strong>
                  </div>
                  <div className="bg-[#10131C] p-2 rounded-xl border border-[#343B50]">
                    <span className="text-[10px] text-[#A7B0C4] block">Magia</span>
                    <strong className="text-sm text-[#B58AFF] font-black">{selectedUnit.mag}</strong>
                  </div>
                  <div className="bg-[#10131C] p-2 rounded-xl border border-[#343B50]">
                    <span className="text-[10px] text-[#A7B0C4] block">Defesa</span>
                    <strong className="text-sm text-[#43C878] font-black">{selectedUnit.def}</strong>
                  </div>
                  <div className="bg-[#10131C] p-2 rounded-xl border border-[#343B50]">
                    <span className="text-[10px] text-[#A7B0C4] block">Resistência</span>
                    <strong className="text-sm text-[#F0B44D] font-black">{selectedUnit.res}</strong>
                  </div>
                  <div className="bg-[#10131C] p-2 rounded-xl border border-[#343B50]">
                    <span className="text-[10px] text-[#A7B0C4] block">Movimento</span>
                    <strong className="text-sm text-[#4C8DFF] font-black">{effectiveMov}</strong>
                  </div>
                  <div className="bg-[#10131C] p-2 rounded-xl border border-[#343B50]">
                    <span className="text-[10px] text-[#A7B0C4] block">Alcance</span>
                    <strong className="text-sm text-[#D4AD65] font-black">{selectedUnit.range}</strong>
                  </div>
                </div>

                {/* Status effects */}
                {selectedUnit.statusEffects && selectedUnit.statusEffects.length > 0 && (
                  <div className="p-2 bg-[#10131C] rounded-xl border border-[#343B50] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#A7B0C4] block">
                      Efeitos Ativos
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedUnit.statusEffects.map((eff, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1B2030] border border-[#343B50] text-[#F3F4F8]"
                        >
                          {eff.type === 'shield' && `🛡️ Escudo +${eff.value}`}
                          {eff.type === 'burn' && `🔥 Queimadura (-${eff.value || 2}%, ${eff.duration}T)`}
                          {eff.type === 'poison' && `☠️ Veneno (-${eff.value || 2}%, ${eff.duration}T)`}
                          {eff.type === 'stun' && `⚡ Atordoado (${eff.duration}T)`}
                          {eff.type === 'slow' && `👣 Lentidão (-${eff.value || 1} Mov)`}
                          {eff.type === 'buff_atk' && `⚔️ Buff ATK +${eff.value}%`}
                          {eff.type === 'invisible' && `👁️ Invisível (${eff.duration}T)`}
                          {eff.type === 'debuff_def' && `🛡️ Defesa -${eff.value}%`}
                          {eff.type === 'taunt' && `📢 Provocação (${eff.duration}T)`}
                          {eff.type === 'excess_heal' && `💔 Cura excessiva (-50%, ${eff.duration}T)`}
                          {eff.type === 'excess_shield' && `🛡️ Escudo excessivo (-50%, ${eff.duration}T)`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
