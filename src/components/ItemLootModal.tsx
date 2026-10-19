import React, { useState } from 'react';
import type { ItemDefinition } from '../types/game';
import { RARITY_INFO, CATEGORY_INFO } from '../data/items';
import { MONSTER_DEFINITIONS } from '../data/monsters';
import { soundManager } from '../utils/audio';
import {
  Sparkles,
  Swords,
  Shield,
  Layers,
  Footprints,
  Gem,
  HardHat,
  ChevronRight,
  Heart,
  Wand2,
  ShieldCheck,
  Compass,
  Check,
} from 'lucide-react';
import { ItemIcon } from './ItemIcon';

interface ItemLootModalProps {
  items: ItemDefinition[];
  onSelectItem: (item: ItemDefinition) => void;
  levelNumber: number;
}

export const ItemLootModal: React.FC<ItemLootModalProps> = ({
  items,
  onSelectItem,
  levelNumber,
}) => {
  const [selectedItem, setSelectedItem] = useState<ItemDefinition | null>(items[0] || null);

  const handleConfirm = () => {
    if (!selectedItem) return;
    soundManager.playSelect();
    onSelectItem(selectedItem);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'helmet':
        return <HardHat size={16} />;
      case 'chestplate':
        return <Shield size={16} />;
      case 'leggings':
        return <Layers size={16} />;
      case 'boots':
        return <Footprints size={16} />;
      case 'weapon':
        return <Swords size={16} />;
      case 'accessory':
        return <Gem size={16} />;
      default:
        return <Gem size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans">
      <div className="w-full max-w-2xl bg-[#1B2030] border-2 border-[#D4AD65]/60 rounded-2xl shadow-2xl p-4 sm:p-6 text-center animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AD65]/20 border border-[#D4AD65]/50 text-[#D4AD65] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} /> Espólios de Batalha — Fase {levelNumber}
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#F3F4F8]">
            Escolha sua Recompensa de Equipamento
          </h2>
          <p className="text-xs text-[#A7B0C4] mt-1">
            Itens dropados pelos monstros derrotados. Escolha 1 item para adicionar ao inventário da aventura.
          </p>
        </div>

        {/* Item Cards (1 to 3 items) */}
        <div className={`grid gap-3 mb-5 sm:mb-6 ${items.length === 1 ? 'grid-cols-1' : items.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
          {items.map((item) => {
            const isSelected = selectedItem?.id === item.id;
            const rInfo = RARITY_INFO[item.rarity];
            const cInfo = CATEGORY_INFO[item.category];

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundManager.playSelect();
                  setSelectedItem(item);
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? `${rInfo.border} bg-[#10131C] shadow-lg shadow-${item.rarity}/20 ring-2 ring-[#D4AD65]`
                    : 'border-[#343B50] bg-[#141824] hover:border-[#A7B0C4]/60 hover:bg-[#1B2030]'
                }`}
                style={{
                  boxShadow: isSelected ? `0 0 20px ${rInfo.color}33` : undefined,
                }}
              >
                {/* Rarity & Category Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border"
                      style={{
                        color: rInfo.color,
                        borderColor: `${rInfo.color}66`,
                        backgroundColor: `${rInfo.color}15`,
                      }}
                    >
                      {rInfo.label}
                    </span>
                    <span className="text-[10px] text-[#A7B0C4] flex items-center gap-1 bg-[#1B2030] px-2 py-0.5 rounded-md border border-[#343B50]">
                      {getCategoryIcon(item.category)}
                      {cInfo.label}
                    </span>
                  </div>

                  {/* Item Icon & Title */}
                  <div className="flex flex-col items-center justify-center my-2 text-center">
                    <ItemIcon
                      iconName={item.iconName}
                      category={item.category}
                      rarity={item.rarity}
                      color={item.color}
                      badge
                      badgeSize="lg"
                      showGlow={isSelected}
                      className="mb-2"
                    />
                    <h3
                      className="font-bold text-sm mb-1 leading-snug"
                      style={{ color: rInfo.color }}
                    >
                      {item.name}
                    </h3>
                  </div>

                  <p className="text-[11px] text-[#A7B0C4] line-clamp-2 mb-3 text-center">
                    {item.description}
                  </p>
                </div>

                {/* Stat Bonuses */}
                <div>
                  <div className="flex flex-wrap gap-1 mb-2 pt-2 border-t border-[#343B50]/60">
                    {item.stats.hp && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FF5252]/15 text-[#FF5252] border border-[#FF5252]/30 flex items-center gap-0.5">
                        <Heart size={10} /> +{item.stats.hp} HP
                      </span>
                    )}
                    {item.stats.atk && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FF8A00]/15 text-[#FF8A00] border border-[#FF8A00]/30 flex items-center gap-0.5">
                        <Swords size={10} /> +{item.stats.atk} ATK
                      </span>
                    )}
                    {item.stats.mag && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#B58AFF]/15 text-[#B58AFF] border border-[#B58AFF]/30 flex items-center gap-0.5">
                        <Wand2 size={10} /> +{item.stats.mag} MAG
                      </span>
                    )}
                    {item.stats.def && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#4C8DFF]/15 text-[#4C8DFF] border border-[#4C8DFF]/30 flex items-center gap-0.5">
                        <Shield size={10} /> +{item.stats.def} DEF
                      </span>
                    )}
                    {item.stats.res && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 flex items-center gap-0.5">
                        <ShieldCheck size={10} /> +{item.stats.res} RES
                      </span>
                    )}
                    {item.stats.mov && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#69F0AE]/15 text-[#69F0AE] border border-[#69F0AE]/30 flex items-center gap-0.5">
                        <Footprints size={10} /> +{item.stats.mov} MOV
                      </span>
                    )}
                    {item.stats.range && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30 flex items-center gap-0.5">
                        <Compass size={10} /> +{item.stats.range} ALCANCE
                      </span>
                    )}
                  </div>

                  {/* Drop Monster Source Tag */}
                  <div className="text-[9px] text-[#71788E] truncate">
                    Drop:{' '}
                    {item.droppedByMonsterTypeIds
                      .map((mId) => MONSTER_DEFINITIONS[mId]?.name || mId)
                      .join(', ')}
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-[#D4AD65] text-[#10131C] p-1 rounded-full shadow-md">
                    <Check size={14} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          disabled={!selectedItem}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#D4AD65] via-[#E5C27E] to-[#B88E43] hover:from-[#E5C27E] hover:to-[#A77E36] disabled:opacity-50 text-[#10131C] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
        >
          Confirmar e Coletar {selectedItem?.name} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
