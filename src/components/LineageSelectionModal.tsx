import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Shield,
  Target,
  Swords,
  Footprints,
  Skull,
  Sun,
  Flame,
  Zap,
  Info,
  Lock,
  MapPin,
} from 'lucide-react';
import { LINEAGES, getLineageById } from '../data/lineages';
import type { PlayerProgress } from '../types/game';
import {
  getLineageUnlockQuest,
  getLineageQuestProgress,
  INITIAL_UNLOCKED_LINEAGES,
} from '../data/lineageQuests';
import { CLASS_DEFINITIONS } from '../data/units';
import { soundManager } from '../utils/audio';
import { ClassLineageAvatar } from './ClassLineageAvatar';
import { getUnitAvatar } from './SidePanel';

interface LineageSelectionModalProps {
  unlockedLineages?: string[];
  progress?: PlayerProgress;
  classNameKey: string;
  heroName?: string;
  currentLineageId?: string;
  onSelectLineage: (classNameKey: string, lineageId: string) => void;
  onClose: () => void;
}

export const LineageSelectionModal: React.FC<LineageSelectionModalProps> = ({
  classNameKey,
  heroName,
  currentLineageId,
  unlockedLineages,
  progress,
  onSelectLineage,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    currentLineageId || 'humano'
  );

  const classDef = CLASS_DEFINITIONS[classNameKey] || CLASS_DEFINITIONS['guerreiro'];
  const displayName = heroName || classDef.name;

  const handleConfirm = () => {
    soundManager.playUpgrade();
    onSelectLineage(classNameKey, selectedId);
    onClose();
  };

  const getLineageIcon = (iconName: string, size = 22) => {
    switch (iconName) {
      case 'Footprints':
        return <Footprints size={size} />;
      case 'Target':
        return <Target size={size} />;
      case 'Shield':
        return <Shield size={size} />;
      case 'Swords':
        return <Swords size={size} />;
      case 'Skull':
        return <Skull size={size} />;
      case 'Sun':
        return <Sun size={size} />;
      case 'Flame':
        return <Flame size={size} />;
      case 'Sparkles':
      default:
        return <Sparkles size={size} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans overflow-y-auto">
      <div className="bg-[#151926] border-2 border-[#D4AD65]/70 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl text-[#F3F4F8] p-4 sm:p-6 space-y-5 relative">
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#1B2030] border border-[#343B50] hover:border-red-400 text-[#A7B0C4] hover:text-white transition-all cursor-pointer"
          title="Fechar"
        >
          <X size={20} />
        </button>

        {/* Cabeçalho */}
        <div className="space-y-1.5 text-center sm:text-left pr-10">
          <div className="inline-flex items-center gap-2 bg-[#D4AD65]/15 border border-[#D4AD65]/40 text-[#D4AD65] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles size={14} className="text-[#FFD700]" />
            <span>Sistema de Linhagens Ancestrais</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black text-white flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <span>Escolha a Linhagem de</span>
            <span style={{ color: classDef.color }}>{displayName}</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#A7B0C4]">
            Cada linhagem transforma a <strong className="text-[#FFD700]">aparência visual da classe (retrato e miniatura 3D)</strong> e concede um bônus único permanente!
          </p>
        </div>

        {/* Prévia Visual Ao Vivo da Classe com a Linhagem Escolhida e Botão de Confirmação no Começo */}
        {(() => {
          const previewLineage = getLineageById(selectedId);
          return (
            <div
              className="p-3.5 sm:p-4 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#10131C]/90 shadow-lg transition-all"
              style={{ borderColor: `${previewLineage.color}70` }}
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <ClassLineageAvatar
                  lineageId={selectedId}
                  classColor={classDef.color}
                  size="xl"
                >
                  {getUnitAvatar(classDef.avatarKey, 28)}
                </ClassLineageAvatar>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#A7B0C4]">
                    Prévia Visual da Classe + Linhagem
                  </div>
                  <div className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>{displayName}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full border font-black"
                      style={{
                        backgroundColor: `${previewLineage.color}20`,
                        borderColor: previewLineage.color,
                        color: previewLineage.color,
                      }}
                    >
                      🧬 {previewLineage.name}
                    </span>
                  </div>
                  <p className="text-xs text-[#CBD5E1] mt-0.5">
                    {previewLineage.bonusDescription}
                  </p>
                </div>
              </div>

              {/* Botão de confirmação posicionado no começo */}
              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0">
                <button
                  onClick={onClose}
                  className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#1B2030] hover:bg-[#252C42] border border-[#343B50] text-[#A7B0C4] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 md:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#FFD700] hover:to-[#D4AD65] text-[#10131C] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#D4AD65]/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check size={16} strokeWidth={3} />
                  <span>Confirmar Linhagem</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Grid de Linhagens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {LINEAGES.map((lineage) => {
            const unlockedList = unlockedLineages || progress?.unlockedLineages || INITIAL_UNLOCKED_LINEAGES;
            const quest = getLineageUnlockQuest(lineage.id);
            const questStats = quest && progress
              ? getLineageQuestProgress(progress, quest)
              : { current: 0, target: quest?.targetCount || 1, percent: 0, isCompleted: false };
            const isUnlocked =
              INITIAL_UNLOCKED_LINEAGES.includes(lineage.id) ||
              unlockedList.includes(lineage.id) ||
              questStats.isCompleted;
            const isSelected = selectedId === lineage.id;

            return (
              <div
                key={lineage.id}
                onClick={() => {
                  if (!isUnlocked) {
                    soundManager.playError();
                    return;
                  }
                  soundManager.playSelect();
                  setSelectedId(lineage.id);
                }}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between relative shadow-sm ${
                  !isUnlocked
                    ? 'bg-[#0E111A]/90 border-dashed border-[#F59E0B]/40 opacity-85 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#1C2336] border-[#FFD700] shadow-xl shadow-[#FFD700]/15 scale-[1.01] cursor-pointer'
                    : 'bg-[#10131C] border-[#343B50] hover:border-[#D4AD65]/60 hover:bg-[#161B28] cursor-pointer'
                }`}
              >
                <div className="space-y-3">
                  {/* Topo do Card: Ícone, Nome e Check */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ClassLineageAvatar
                        lineageId={lineage.id}
                        classColor={classDef.color}
                        size="md"
                      >
                        {getUnitAvatar(classDef.avatarKey, 20)}
                      </ClassLineageAvatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base text-white flex items-center gap-1.5" style={{ color: lineage.color }}>
                            {getLineageIcon(lineage.iconName, 15)}
                            <span>{lineage.name}</span>
                          </h3>
                          {!isUnlocked ? (
                            <span className="bg-[#EF4444]/20 border border-[#EF4444]/50 text-[#F87171] text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                              <Lock size={11} /> Bloqueada
                            </span>
                          ) : isSelected ? (
                            <span className="bg-[#FFD700] text-[#10131C] text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                              <Check size={12} strokeWidth={3} /> Escolhida
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-[#A7B0C4]">{lineage.title}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quest progress block if locked */}
                  {!isUnlocked && quest && (
                    <div className="p-3 rounded-xl bg-black/70 border border-[#F59E0B]/50 text-left space-y-1.5 shadow-inner">
                      <div className="flex items-center justify-between text-[11px] gap-2">
                        <span className="font-extrabold text-[#FBBF24] flex items-center gap-1 truncate">
                          ⚔️ {quest.title}
                        </span>
                        <span className="font-black text-white bg-black/60 px-1.5 py-0.5 rounded border border-white/10 shrink-0">
                          {questStats.current.toLocaleString('pt-BR')} / {questStats.target.toLocaleString('pt-BR')} ({questStats.percent}%)
                        </span>
                      </div>
                      <p className="text-[11px] text-[#CBD5E1] leading-relaxed">
                        {quest.description}
                      </p>
                      <div className="w-full h-2 rounded-full bg-black/90 overflow-hidden border border-white/10 p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-[#EA580C] via-[#F59E0B] to-[#FACC15] rounded-full transition-all duration-300"
                          style={{ width: `${questStats.percent}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-[#94A3B8] flex items-center gap-1 pt-0.5">
                        <MapPin size={12} className="text-[#D4AD65] shrink-0" />
                        <span>Como cumprir: <strong className="text-white">{quest.hintLevel}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Bônus Único em Destaque */}
                  <div
                    className="p-2.5 rounded-xl border text-xs space-y-1"
                    style={{
                      backgroundColor: `${lineage.color}10`,
                      borderColor: `${lineage.color}40`,
                    }}
                  >
                    <div className="flex items-center gap-1.5 font-black text-[11px] uppercase tracking-wider" style={{ color: lineage.color }}>
                      <Zap size={14} />
                      <span>{lineage.bonusTitle}</span>
                    </div>
                    <p className="text-white text-xs leading-relaxed font-medium">
                      {lineage.bonusDescription}
                    </p>
                  </div>

                  {/* Lore / Descrição */}
                  <p className="text-[11px] text-[#A7B0C4] leading-relaxed line-clamp-2">
                    {lineage.description}
                  </p>

                  {/* Atributos Numéricos Adicionais */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#343B50]/60">
                    {lineage.stats.hp && (
                      <span className="bg-[#1B2030] border border-[#343B50] px-2 py-0.5 rounded text-[10px] font-bold text-[#FF5252]">
                        +{lineage.stats.hp} HP
                      </span>
                    )}
                    {lineage.stats.atk && (
                      <span className="bg-[#1B2030] border border-[#343B50] px-2 py-0.5 rounded text-[10px] font-bold text-[#F87171]">
                        +{lineage.stats.atk} ATK
                      </span>
                    )}
                    {lineage.stats.mag && (
                      <span className="bg-[#1B2030] border border-[#343B50] px-2 py-0.5 rounded text-[10px] font-bold text-[#60A5FA]">
                        +{lineage.stats.mag} MAG
                      </span>
                    )}
                    {lineage.stats.def && (
                      <span className="bg-[#1B2030] border border-[#343B50] px-2 py-0.5 rounded text-[10px] font-bold text-[#FBBF24]">
                        +{lineage.stats.def} DEF
                      </span>
                    )}
                    {lineage.stats.res && (
                      <span className="bg-[#1B2030] border border-[#343B50] px-2 py-0.5 rounded text-[10px] font-bold text-[#C084FC]">
                        +{lineage.stats.res} RES
                      </span>
                    )}
                    {lineage.stats.mov && (
                      <span className="bg-[#1B2030] border border-[#343B50] px-2 py-0.5 rounded text-[10px] font-bold text-[#34D399]">
                        +{lineage.stats.mov} MOV
                      </span>
                    )}
                    {lineage.stats.range && (
                      <span className="bg-[#1B2030] border border-[#343B50] px-2 py-0.5 rounded text-[10px] font-bold text-[#38BDF8]">
                        +{lineage.stats.range} Alcance
                      </span>
                    )}
                    {lineage.equipmentStatsBonusPercent && (
                      <span className="bg-amber-950/40 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-amber-300">
                        +{lineage.equipmentStatsBonusPercent}% Status dos Equipamentos
                      </span>
                    )}
                    {lineage.goldBonusPercent && (
                      <span className="bg-yellow-950/40 border border-yellow-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-yellow-300">
                        +{lineage.goldBonusPercent}% Ouro (Não acumulável)
                      </span>
                    )}
                    {lineage.standStillDamageBonusPercent && (
                      <span className="bg-emerald-950/40 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-300">
                        +{lineage.standStillDamageBonusPercent}% Dano se não mover
                      </span>
                    )}
                    {lineage.halfHpTrigger && (
                      <span className="bg-red-950/40 border border-red-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-red-300">
                        50% HP: Escudo 20% + 15% Dano (2T)
                      </span>
                    )}
                    {lineage.crowdControlImmunity && (
                      <span className="bg-stone-800 border border-stone-500/50 px-2 py-0.5 rounded text-[10px] font-bold text-stone-300">
                        Imunidade CC / Veneno / Sangramento / Queimadura
                      </span>
                    )}
                    {lineage.lifestealPercent && (
                      <span className="bg-purple-950/40 border border-purple-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-purple-300">
                        {lineage.lifestealPercent}% Roubo de Vida Total
                      </span>
                    )}
                    {lineage.healShieldAlliesDamageBuff && (
                      <span className="bg-sky-950/40 border border-sky-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-sky-300">
                        Cura/Escudo dá +{lineage.healShieldAlliesDamageBuff}% Dano a Aliados (2T)
                      </span>
                    )}
                    {lineage.severeBurn && (
                      <span className="bg-orange-950/40 border border-orange-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-orange-300">
                        Queimadura Severa (3%/turno) & Imune a Fogo
                      </span>
                    )}
                    {lineage.shieldReflectRatio && (
                      <span className="bg-pink-950/40 border border-pink-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-pink-300">
                        Escudos Refletem {Math.round(lineage.shieldReflectRatio * 100)}% de Dano
                      </span>
                    )}
                    {lineage.healShieldFlatScalingBonus && (
                      <span className="bg-blue-950/40 border border-blue-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-blue-300">
                        +{Math.round(lineage.healShieldFlatScalingBonus * 100)}% Escalonamento Curas/Escudos
                      </span>
                    )}
                    {lineage.ignoreDefenseExclusive && (
                      <span className="bg-rose-950/40 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-rose-300">
                        Ignora {lineage.ignoreDefenseExclusive}% DEF/RES
                      </span>
                    )}
                    {lineage.phoenixRevive1Hp && (
                      <span className="bg-orange-950/40 border border-orange-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-orange-300">
                        Sobrevive a Dano Letal com 1 HP
                      </span>
                    )}
                    {lineage.extraAttackEveryTurn && (
                      <span className="bg-indigo-950/40 border border-indigo-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-indigo-300">
                        +1 Ataque Adicional por Turno
                      </span>
                    )}
                    {lineage.centaurCharge && (
                      <span className="bg-amber-950/40 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-amber-300">
                        +5% Dano por casa movida no próximo golpe
                      </span>
                    )}
                    {lineage.bleedBonusDamagePercent && (
                      <span className="bg-red-950/40 border border-red-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-red-300">
                        +{lineage.bleedBonusDamagePercent}% Dano contra Alvos Sangrando
                      </span>
                    )}
                    {lineage.extraPushDistance && (
                      <span className="bg-sky-950/40 border border-sky-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-sky-300">
                        +{lineage.extraPushDistance} Casa em Efeitos de Empurrão
                      </span>
                    )}
                    {lineage.eggDropRateMultiplier && (
                      <span className="bg-emerald-950/40 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-300">
                        {lineage.eggDropRateMultiplier}x Chance de Dropar Ovos de Companheiro
                      </span>
                    )}
                    {lineage.kitsuneFreeSkillReset && (
                      <span className="bg-pink-950/40 border border-pink-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-pink-300">
                        1ª Habilidade em Combate tem Cooldown Restaurado
                      </span>
                    )}
                    {lineage.physicalDamageReductionPercent && (
                      <span className="bg-purple-950/40 border border-purple-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-purple-300">
                        -{lineage.physicalDamageReductionPercent}% Dano Físico Recebido
                      </span>
                    )}
                    {lineage.potentPoison && (
                      <span className="bg-lime-950/40 border border-lime-500/40 px-2 py-0.5 rounded text-[10px] font-bold text-lime-300">
                        Veneno Potente (2% HP/T e -15% DEF)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé Informativo */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#343B50]">
          <div className="text-xs text-[#A7B0C4] flex items-center gap-1.5">
            <Info size={14} className="text-[#FFD700]" />
            <span>Linhagem selecionada: <strong className="text-white">{getLineageById(selectedId).name}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1B2030] hover:bg-[#252C42] border border-[#343B50] text-[#A7B0C4] hover:text-white font-medium text-xs transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
