import React, { useState } from 'react';
import type { ItemDefinition } from '../types/game';
import { RARITY_INFO, CATEGORY_INFO } from '../data/items';
import { ItemIcon } from './ItemIcon';
import { soundManager } from '../utils/audio';
import {
  Sparkles,
  Package,
  Check,
  CheckCircle2,
  HardHat,
  Shield,
  Layers,
  Footprints,
  Swords,
  Gem,
  X,
  ArrowRight,
} from 'lucide-react';

interface DailyItemDraftModalProps {
  draftRounds: ItemDefinition[][];
  onConfirmDraft: (chosenItemIds: string[]) => void;
  onClose: () => void;
}

export const DailyItemDraftModal: React.FC<DailyItemDraftModalProps> = ({
  draftRounds,
  onConfirmDraft,
  onClose,
}) => {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [chosenItems, setChosenItems] = useState<ItemDefinition[]>([]);
  const totalRounds = Math.min(6, draftRounds.length || 6);

  const currentOptions = draftRounds[currentRoundIndex] || [];
  const isDraftCompleted = chosenItems.length >= totalRounds;

  const handleSelectItem = (item: ItemDefinition) => {
    soundManager.playSelect();
    const updated = [...chosenItems, item];
    setChosenItems(updated);

    if (updated.length < totalRounds) {
      setCurrentRoundIndex(updated.length);
    }
  };

  const handleFinalConfirm = () => {
    soundManager.playUpgrade();
    onConfirmDraft(chosenItems.map((it) => it.id));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'helmet':
        return <HardHat size={14} />;
      case 'chestplate':
        return <Shield size={14} />;
      case 'leggings':
        return <Layers size={14} />;
      case 'boots':
        return <Footprints size={14} />;
      case 'weapon':
        return <Swords size={14} />;
      case 'accessory':
      default:
        return <Gem size={14} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans overflow-y-auto">
      <div className="bg-[#151926] border-2 border-[#D4AD65]/70 rounded-3xl max-w-4xl w-full max-h-[94vh] overflow-y-auto shadow-2xl text-[#F3F4F8] p-4 sm:p-6 space-y-4 sm:space-y-5 relative">
        {/* Botão de Fechar / Cancelar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#1B2030] border border-[#343B50] hover:border-red-400 text-[#A7B0C4] hover:text-white transition-all cursor-pointer"
          title="Cancelar"
        >
          <X size={20} />
        </button>

        {/* Cabeçalho */}
        <div className="space-y-1.5 text-center sm:text-left pr-10">
          <div className="inline-flex items-center gap-2 bg-[#D4AD65]/15 border border-[#D4AD65]/40 text-[#D4AD65] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
            <Package size={14} className="text-[#FFD700]" />
            <span>Equipamentos da Fase Diária</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
            <span className="text-white">6 Escolhas Exclusivas</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <span>Selecione seus Equipamentos do Dia</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#10131C] border border-[#D4AD65]/50 text-[#FFD700] font-bold">
              {chosenItems.length} de {totalRounds} Escolhidos
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-[#A7B0C4] leading-relaxed">
            Faça <strong className="text-white">6 escolhas de itens</strong> para equipar seus 4 heróis exclusivamente no Desafio Diário. Estes itens pertencem <strong className="text-[#38BDF8]">apenas a esta expedição</strong> e não alteram o inventário da sua aventura!
          </p>
        </div>

        {/* Indicador de Rodadas / Progresso */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 bg-[#10131C] p-2 sm:p-2.5 rounded-2xl border border-[#343B50]">
          {Array.from({ length: totalRounds }).map((_, rIdx) => {
            const isDone = rIdx < chosenItems.length;
            const isCurrent = rIdx === currentRoundIndex && !isDraftCompleted;
            return (
              <div
                key={rIdx}
                className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl text-center border text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  isDone
                    ? 'bg-[#10B981]/20 border-[#10B981] text-[#34D399]'
                    : isCurrent
                    ? 'bg-[#D4AD65]/20 border-[#FFD700] text-white ring-2 ring-[#FFD700]/30 animate-pulse'
                    : 'bg-[#181D2B] border-[#2A3144] text-[#64748B]'
                }`}
              >
                {isDone ? (
                  <Check size={13} strokeWidth={3} className="text-[#34D399]" />
                ) : (
                  <span>Item {rIdx + 1}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Corpo Principal: Se ainda faltam escolhas, mostra as 3 opções da rodada atual */}
        {!isDraftCompleted ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#CBD5E1] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#D4AD65]" />
                <span>Opções da Escolha {currentRoundIndex + 1} de {totalRounds}</span>
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                Clique no item desejado para selecionar
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-3.5">
              {currentOptions.map((item) => {
                const rInfo = RARITY_INFO[item.rarity] || RARITY_INFO.common;
                const cInfo = CATEGORY_INFO[item.category] || CATEGORY_INFO.accessory;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="p-4 rounded-2xl border-2 transition-all flex flex-col justify-between bg-[#10131C] border-[#343B50] hover:border-[#FFD700] hover:bg-[#181F2F] hover:scale-[1.02] cursor-pointer shadow-lg group relative overflow-hidden"
                    style={{ borderColor: `${item.color}50` }}
                  >
                    <div className="space-y-3">
                      {/* Topo do Card: Ícone, Categoria e Raridade */}
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-inner shrink-0 group-hover:scale-105 transition-transform"
                          style={{
                            backgroundColor: `${item.color}20`,
                            borderColor: item.color,
                          }}
                        >
                          <ItemIcon
                            iconName={item.iconName}
                            category={item.category}
                            rarity={item.rarity}
                            size={24}
                          />
                        </div>

                        <div className="text-right space-y-1">
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm"
                            style={{
                              backgroundColor: `${rInfo.color}20`,
                              borderColor: rInfo.color,
                              color: rInfo.color,
                            }}
                          >
                            {rInfo.label}
                          </span>
                          <div className="text-[10px] text-[#A7B0C4] flex items-center justify-end gap-1 font-bold">
                            {getCategoryIcon(item.category)}
                            <span>{cInfo.label}</span>
                          </div>
                        </div>
                      </div>

                      {/* Nome e Descrição */}
                      <div>
                        <h3 className="font-black text-sm text-white group-hover:text-[#FFD700] transition-colors" style={{ color: item.color }}>
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-[#A7B0C4] mt-1 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Atributos / Stats */}
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#343B50]/60">
                        {item.stats.hp && (
                          <span className="bg-[#1B2030] border border-[#343B50] px-2 py-0.5 rounded text-[10px] font-bold text-[#FF5252]">
                            +{item.stats.hp} HP
                          </span>
                        )}
                        {item.stats.atk && (
                          <span className="bg-[#1B2030] border border-[#343B50] px-2 py-0.5 rounded text-[10px] font-bold text-[#F87171]">
                            +{item.stats.atk} ATK
                          </span>
                        )}
                        {item.stats.mag && (
                          <span className="bg-[#1B2030] border border-[#343B50] px-2 py-0.5 rounded text-[10px] font-bold text-[#60A5FA]">
                            +{item.stats.mag} MAG
                          </span>
                        )}
                        {item.stats.def && (
                          <span className="bg-[#1B2030] border border-[#343B50] px-2 py-0.5 rounded text-[10px] font-bold text-[#FBBF24]">
                            +{item.stats.def} DEF
                          </span>
                        )}
                        {item.stats.res && (
                          <span className="bg-[#1B2030] border border-[#343B50] px-2 py-0.5 rounded text-[10px] font-bold text-[#C084FC]">
                            +{item.stats.res} RES
                          </span>
                        )}
                        {item.stats.mov && (
                          <span className="bg-[#1B2030] border border-[#343B50] px-2 py-0.5 rounded text-[10px] font-bold text-[#34D399]">
                            +{item.stats.mov} MOV
                          </span>
                        )}
                        {item.stats.range && (
                          <span className="bg-[#1B2030] border border-[#343B50] px-2 py-0.5 rounded text-[10px] font-bold text-[#38BDF8]">
                            +{item.stats.range} Alcance
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mt-3 w-full py-2 rounded-xl bg-[#1B2030] group-hover:bg-[#D4AD65] group-hover:text-[#10131C] text-[#A7B0C4] font-black text-xs uppercase tracking-wider transition-all border border-[#343B50] group-hover:border-[#D4AD65] flex items-center justify-center gap-1.5"
                    >
                      <span>Escolher Item</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Conclusão do Draft: Todos os 6 itens selecionados */
          <div className="bg-emerald-950/20 border-2 border-emerald-500/60 rounded-2xl p-4 sm:p-5 text-center space-y-3 animate-in fade-in zoom-in-95">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-sm font-black uppercase tracking-wider">
              <CheckCircle2 size={20} />
              <span>Todos os 6 Itens Foram Escolhidos!</span>
            </div>
            <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-lg mx-auto">
              Seus 6 itens temporários estão prontos para serem distribuídos e equipados nos seus 4 heróis antes de dar início ao combate.
            </p>
            <button
              onClick={handleFinalConfirm}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#FFD700] hover:to-[#D4AD65] text-[#10131C] font-black text-sm uppercase tracking-wider shadow-xl shadow-[#D4AD65]/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Check size={18} strokeWidth={3} />
              <span>Concluir e Ir para Equipamentos</span>
            </button>
          </div>
        )}

        {/* Bandeja Inferior: Lista dos itens já selecionados até agora */}
        <div className="pt-2 border-t border-[#343B50] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#A7B0C4]">
            <span className="font-bold flex items-center gap-1.5">
              <Package size={14} className="text-[#D4AD65]" />
              <span>Itens Escolhidos para esta Expedição ({chosenItems.length}/{totalRounds}):</span>
            </span>
            {chosenItems.length > 0 && !isDraftCompleted && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playSelect();
                  const updated = chosenItems.slice(0, -1);
                  setChosenItems(updated);
                  setCurrentRoundIndex(updated.length);
                }}
                className="text-[11px] text-[#F87171] hover:underline cursor-pointer"
              >
                Desfazer Última Escolha
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {Array.from({ length: totalRounds }).map((_, idx) => {
              const item = chosenItems[idx];
              if (!item) {
                return (
                  <div
                    key={idx}
                    className="h-16 rounded-xl border border-dashed border-[#343B50] bg-[#10131C]/60 flex flex-col items-center justify-center text-[10px] text-[#64748B] gap-1"
                  >
                    <span>Slot {idx + 1}</span>
                    <span className="text-[9px] opacity-75">Vazio</span>
                  </div>
                );
              }

              return (
                <div
                  key={`${item.id}_${idx}`}
                  className="h-16 rounded-xl border p-1.5 bg-[#10131C] flex items-center gap-2 shadow-sm relative overflow-hidden"
                  style={{ borderColor: `${item.color}60` }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center border shrink-0"
                    style={{
                      backgroundColor: `${item.color}20`,
                      borderColor: item.color,
                    }}
                  >
                    <ItemIcon
                      iconName={item.iconName}
                      category={item.category}
                      rarity={item.rarity}
                      size={18}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black truncate text-white" style={{ color: item.color }}>
                      {item.name}
                    </p>
                    <span className="text-[9px] text-[#94A3B8] capitalize block truncate">
                      {CATEGORY_INFO[item.category]?.label || item.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
