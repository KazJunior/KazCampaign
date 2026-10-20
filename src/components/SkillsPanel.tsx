import React from 'react';
import type { Unit, Skill } from '../types/game';
import {
  Sparkles,
  Flame,
  Swords,
  Target,
  Zap,
  Hammer,
  Skull,
  HeartPulse,
  Heart,
  Shield,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Footprints,
  Crosshair,
  CloudRain,
  Snowflake,
  Brain,
  Sun,
  Award,
  Eye,
  Wand2,
  X,
  CheckCircle2,
  Music,
} from 'lucide-react';

interface SkillsPanelProps {
  selectedUnit: Unit | null;
  activeSkill: Skill | null;
  onSelectSkill: (skill: Skill) => void;
  onClearSkill: () => void;
  isPlayerTurn: boolean;
}

export const SkillsPanel: React.FC<SkillsPanelProps> = ({
  selectedUnit,
  activeSkill,
  onSelectSkill,
  onClearSkill,
  isPlayerTurn,
}) => {
  if (!selectedUnit) {
    return (
      <aside className="hidden lg:flex w-80 bg-[#1B2030] border-r border-[#343B50] p-4 flex-col items-center justify-center text-center text-[#A7B0C4] shadow-xl select-none">
        <div className="w-14 h-14 rounded-2xl bg-[#10131C] border border-[#343B50] flex items-center justify-center mb-3 shadow-inner">
          <Sparkles className="text-[#D4AD65]/50" size={28} />
        </div>
        <p className="font-bold text-sm text-[#F3F4F8]">Menu de Habilidades</p>
        <p className="text-xs text-[#A7B0C4]/70 mt-1 max-w-[220px] leading-relaxed">
          Selecione uma unidade no tabuleiro para visualizar e utilizar suas habilidades de combate.
        </p>
      </aside>
    );
  }

  const isAlly = selectedUnit.faction === 'player';
  const isStunned = selectedUnit.statusEffects?.some((e) => e.type === 'stun' && e.duration > 0);
  const canAct = isAlly && isPlayerTurn && !selectedUnit.hasAttacked && !isStunned;
  const skills = selectedUnit.skills || [];

  return (
    <aside className="hidden lg:flex w-80 bg-[#1B2030] border-r border-[#343B50] flex-col shadow-2xl text-[#F3F4F8] select-none h-full z-10">
      {/* Sticky Header */}
      <div className="p-3.5 border-b border-[#343B50] bg-[#161A26]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#10131C] border border-[#343B50] text-[#D4AD65]">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="font-black text-sm text-[#F3F4F8] uppercase tracking-wider">
                {isAlly ? 'Habilidades' : 'Poderes Inimigos'}
              </h2>
              <p className="text-[11px] text-[#A7B0C4] truncate">
                {selectedUnit.name} • {selectedUnit.className}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#10131C] border border-[#343B50] text-[#D4AD65]">
            {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
          </span>
        </div>

        {/* Stunned Alert */}
        {isStunned && (
          <div className="mt-2 p-2 rounded-lg bg-[#FACC15]/15 border border-[#FACC15]/50 flex items-center gap-2">
            <Zap size={14} className="text-[#FACC15] shrink-0" />
            <span className="text-xs font-bold text-[#FACC15]">
              ⚡ Unidade Atordoada: Incapaz de conjurar habilidades!
            </span>
          </div>
        )}

        {/* Active Skill Banner */}
        {activeSkill && (
          <div className="mt-2 p-2 rounded-lg bg-[#D4AD65]/15 border border-[#D4AD65]/60 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 size={14} className="text-[#D4AD65] shrink-0" />
              <span className="text-xs font-bold text-[#D4AD65] truncate">
                Ativa: {activeSkill.name}
              </span>
            </div>
            <button
              onClick={onClearSkill}
              className="text-[10px] font-bold uppercase text-[#A7B0C4] hover:text-white bg-[#10131C] px-2 py-0.5 rounded border border-[#343B50] shrink-0 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Skills List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {skills.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#10131C] border border-[#343B50] text-center text-xs text-[#A7B0C4]">
            Esta unidade não possui habilidades especiais ativas.
          </div>
        ) : (
          skills.map((skill, index) => {
            const isSelected = activeSkill?.id === skill.id;
            const isOnCd = skill.currentCooldown > 0;
            const disabled = !isAlly || !canAct || isOnCd;

            // Damage type badge color
            let badgeBg = 'bg-[#4C8DFF]/20 text-[#4C8DFF] border-[#4C8DFF]/30';
            let damageTypeName = 'Físico';
            if (skill.damageType === 'magical') {
              badgeBg = 'bg-[#B58AFF]/20 text-[#B58AFF] border-[#B58AFF]/30';
              damageTypeName = 'Mágico';
            } else if (skill.damageType === 'healing') {
              badgeBg = 'bg-[#56E59A]/20 text-[#56E59A] border-[#56E59A]/30';
              damageTypeName = 'Cura';
            }

            return (
              <button
                key={skill.id}
                disabled={disabled}
                onClick={() => onSelectSkill(skill)}
                className={`w-full p-3 rounded-xl border text-left transition-all relative flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-[#D4AD65]/20 border-[#D4AD65] text-white shadow-lg ring-1 ring-[#D4AD65]'
                    : disabled
                    ? 'bg-[#10131C]/60 border-[#343B50]/60 opacity-65 cursor-not-allowed'
                    : 'bg-[#10131C] border-[#343B50] hover:border-[#D4AD65]/70 hover:bg-[#161B26] text-[#F3F4F8]'
                }`}
              >
                {/* Header row: Icon, Name & Cooldown */}
                <div className="flex items-start gap-2.5">
                  <div
                    className={`p-2 rounded-lg border shrink-0 ${
                      isSelected
                        ? 'bg-[#D4AD65] text-[#10131C] border-[#D4AD65]'
                        : 'bg-[#1B2030] text-[#D4AD65] border-[#343B50]'
                    }`}
                  >
                    {getSkillIcon(skill.iconName, 18)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {index < 9 && (
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                              isSelected
                                ? 'bg-[#D4AD65] text-[#10131C] border-[#D4AD65]'
                                : 'bg-[#161A26] text-[#D4AD65] border-[#343B50]'
                            }`}
                            title={`Atalho: tecla ${index + 1}`}
                          >
                            {index + 1}
                          </span>
                        )}
                        <h4 className="font-bold text-xs truncate text-[#F3F4F8]">
                          {skill.name}
                        </h4>
                        {skill.level && skill.level > 1 && (
                          <span
                            className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#D4AD65]/20 text-[#D4AD65] border border-[#D4AD65]/50 shrink-0"
                            title={`Nível de Evolução: ${skill.level}`}
                          >
                            Nv. {skill.level}
                          </span>
                        )}
                      </div>
                      {isOnCd ? (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#E65353]/20 border border-[#E65353]/40 text-[#E65353] shrink-0">
                          {skill.currentCooldown}T CD
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#43C878]/20 border border-[#43C878]/40 text-[#43C878] shrink-0">
                          Pronto
                        </span>
                      )}
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeBg}`}>
                        {damageTypeName}
                      </span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#1B2030] border border-[#343B50] text-[#A7B0C4]">
                        Alcance {skill.rangeMin}-{skill.rangeMax}
                      </span>
                      {skill.aoeRadius > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FF9800]/20 border border-[#FF9800]/40 text-[#FF9800]">
                          💥 Área 3x3
                        </span>
                      )}
                      {skill.canTargetGround && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981]">
                          🎯 Alvo no Solo
                        </span>
                      )}
                      {skill.id === 'resistencia_suprema' ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#56E59A]/15 border border-[#56E59A]/40 text-[#56E59A]">
                          {Math.round((skill.power || 0.5) * 100)}% Vida Máx
                        </span>
                      ) : skill.power > 0 ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#1B2030] border border-[#343B50] text-[#D4AD65]">
                          {Math.round(skill.power * 100)}% Poder
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-[#A7B0C4] leading-relaxed">
                  {skill.description}
                </p>

                {/* Special effects badges */}
                <div className="flex flex-wrap gap-1 pt-1 border-t border-white/5">
                  {skill.statusEffect && (
                    <span className="text-[10px] font-medium text-[#F3F4F8]/80 flex items-center gap-1">
                      {skill.statusEffect.type === 'burn' && `🔥 Queimadura (-${skill.statusEffect.value} HP)`}
                      {skill.statusEffect.type === 'poison' && `☠️ Veneno (-${skill.statusEffect.value} HP)`}
                      {skill.statusEffect.type === 'stun' && '⚡ Atordoa (1 Turno)'}
                      {skill.statusEffect.type === 'slow' && `👣 Lentidão (-${skill.statusEffect.value || 1} Mov)`}
                      {skill.statusEffect.type === 'shield' && `🛡️ Concede +${skill.statusEffect.value} Escudo`}
                      {skill.statusEffect.type === 'buff_atk' && `⚔️ Aumenta Dano em +${skill.statusEffect.value}%`}
                      <span className="text-[#A7B0C4] text-[9px]">({skill.statusEffect.duration}T)</span>
                    </span>
                  )}
                  {skill.secondaryStatusEffect && (
                    <span className="text-[10px] font-medium text-[#F3F4F8]/80 flex items-center gap-1">
                      {skill.secondaryStatusEffect.type === 'burn' && `🔥 Queimadura (-${skill.secondaryStatusEffect.value} HP)`}
                      {skill.secondaryStatusEffect.type === 'poison' && `☠️ Veneno (-${skill.secondaryStatusEffect.value} HP)`}
                      {skill.secondaryStatusEffect.type === 'stun' && '⚡ Atordoa (1 Turno)'}
                      {skill.secondaryStatusEffect.type === 'slow' && `👣 Lentidão (-${skill.secondaryStatusEffect.value || 1} Mov)`}
                      {skill.secondaryStatusEffect.type === 'debuff_def' && `🛡️ Defesa -${skill.secondaryStatusEffect.value}%`}
                      <span className="text-[#A7B0C4] text-[9px]">({skill.secondaryStatusEffect.duration}T)</span>
                    </span>
                  )}
                  {skill.defenseIgnoreRatio && skill.defenseIgnoreRatio > 0 && (
                    <span className="text-[10px] font-medium text-[#F0B44D]">
                      🎯 Ignora {Math.round(skill.defenseIgnoreRatio * 100)}% Armadura
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Helper */}
      {isAlly && (
        <div className="p-3 border-t border-[#343B50] bg-[#161A26] text-[11px] text-[#A7B0C4]/80 flex items-center justify-between">
          <span>{canAct ? 'Clique em uma skill para mirar' : 'Unidade já realizou ação'}</span>
          {activeSkill && (
            <button
              onClick={onClearSkill}
              className="text-[11px] font-bold text-[#E65353] hover:underline flex items-center gap-1"
            >
              <X size={12} /> Desmarcar
            </button>
          )}
        </div>
      )}
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
    case 'Crosshair':
      return <Crosshair size={size} />;
    case 'CloudRain':
      return <CloudRain size={size} />;
    case 'Flame':
    case 'mage':
    case 'dark_mage':
      return <Flame size={size} />;
    case 'Wand2':
      return <Wand2 size={size} />;
    case 'Snowflake':
      return <Snowflake size={size} />;
    case 'Brain':
      return <Brain size={size} />;
    case 'HeartPulse':
    case 'cleric':
      return <HeartPulse size={size} />;
    case 'Heart':
      return <Heart size={size} />;
    case 'Shield':
      return <Shield size={size} />;
    case 'ShieldCheck':
      return <ShieldCheck size={size} />;
    case 'ShieldAlert':
      return <ShieldAlert size={size} />;
    case 'Zap':
    case 'goblin':
      return <Zap size={size} />;
    case 'Hammer':
    case 'orc':
      return <Hammer size={size} />;
    case 'Skull':
    case 'spider':
      return <Skull size={size} />;
    case 'RotateCcw':
      return <RotateCcw size={size} />;
    case 'Footprints':
      return <Footprints size={size} />;
    case 'Sun':
    case 'SunMedium':
      return <Sun size={size} />;
    case 'Award':
      return <Award size={size} />;
    case 'Eye':
      return <Eye size={size} />;
    case 'Music':
      return <Music size={size} />;
    default:
      return <Sparkles size={size} />;
  }
}
