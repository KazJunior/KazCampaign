import React, { useState, useEffect } from 'react';
import type { ItemCategory, ItemRarity } from '../types/game';
import { ITEMS, RARITY_INFO, CATEGORY_INFO } from '../data/items';
import { MONSTER_DEFINITIONS } from '../data/monsters';
import {
  X,
  BookOpen,
  Search,
  Lock,
  Swords,
  Shield,
  Layers,
  Footprints,
  Gem,
  HardHat,
} from 'lucide-react';

interface ItemBestiaryModalProps {
  discoveredItemIds: string[];
  onClose: () => void;
}

export const ItemBestiaryModal: React.FC<ItemBestiaryModalProps> = ({
  discoveredItemIds = [],
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ItemCategory>('all');
  const [selectedRarity, setSelectedRarity] = useState<'all' | ItemRarity>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const allItems = Object.values(ITEMS);
  const discoveredSet = new Set(discoveredItemIds);
  const totalCount = allItems.length;
  const discoveredCount = allItems.filter((it) => discoveredSet.has(it.id)).length;
  const progressPercent = Math.round((discoveredCount / totalCount) * 100);

  const filteredItems = allItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedRarity !== 'all' && item.rarity !== selectedRarity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const isDiscovered = discoveredSet.has(item.id);
      if (isDiscovered && !item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

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
        return <Gem size={14} />;
      default:
        return <Gem size={14} />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#1B2030] border-2 border-[#D4AD65]/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#343B50] bg-gradient-to-r from-[#D4AD65]/20 via-[#1B2030] to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#10131C] border border-[#D4AD65]/40 text-[#D4AD65]">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="font-black text-lg text-[#F3F4F8] flex items-center gap-2">
                Compêndio de Itens
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#10131C] text-[#D4AD65] border border-[#D4AD65]/40">
                  {discoveredCount} / {totalCount} Catalogados ({progressPercent}%)
                </span>
              </h2>
              <p className="text-xs text-[#A7B0C4]">
                Bestiário e catálogo de todos os armamentos, proteções e artefatos já encontrados nas suas campanhas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A7B0C4] hover:text-[#F3F4F8] hover:bg-[#10131C] transition-colors border border-transparent hover:border-[#343B50]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 bg-[#141824] border-b border-[#343B50] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#D4AD65] text-[#10131C]'
                  : 'text-[#A7B0C4] hover:bg-[#1B2030]'
              }`}
            >
              Todos
            </button>
            {(['weapon', 'helmet', 'chestplate', 'leggings', 'boots', 'accessory'] as ItemCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-[#D4AD65] text-[#10131C]'
                      : 'text-[#A7B0C4] hover:bg-[#1B2030]'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  {CATEGORY_INFO[cat].label}
                </button>
              )
            )}
          </div>

          {/* Rarity Tabs & Search */}
          <div className="flex items-center gap-2">
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value as any)}
              className="bg-[#10131C] text-[#F3F4F8] border border-[#343B50] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#D4AD65]"
            >
              <option value="all">Todas as Raridades</option>
              <option value="common">Comum</option>
              <option value="rare">Raro</option>
              <option value="epic">Épico</option>
              <option value="legendary">Lendário</option>
            </select>

            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71788E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar item..."
                className="bg-[#10131C] text-[#F3F4F8] placeholder-[#71788E] border border-[#343B50] rounded-lg pl-8 pr-3 py-1 text-xs focus:outline-none focus:border-[#D4AD65] w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredItems.map((item) => {
            const isDiscovered = discoveredSet.has(item.id);
            const rInfo = RARITY_INFO[item.rarity];
            const cInfo = CATEGORY_INFO[item.category];

            if (!isDiscovered) {
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border-2 border-dashed border-[#343B50] bg-[#141824]/40 flex flex-col items-center justify-center text-center opacity-60 min-h-[140px]"
                >
                  <Lock size={24} className="text-[#71788E] mb-2" />
                  <span className="text-xs font-bold text-[#A7B0C4] mb-1">??? Desconhecido</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1"
                    style={{
                      color: rInfo.color,
                      borderColor: `${rInfo.color}40`,
                    }}
                  >
                    {rInfo.label} • {cInfo.label}
                  </span>
                  <p className="text-[10px] text-[#71788E]">
                    Derrote monstros do abismo para descobrir este item.
                  </p>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border-2 bg-[#10131C] flex flex-col justify-between transition-all hover:scale-[1.02] shadow-md"
                style={{
                  borderColor: `${rInfo.color}66`,
                  boxShadow: `0 4px 14px ${rInfo.color}15`,
                }}
              >
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
                    <span className="text-[10px] text-[#A7B0C4] flex items-center gap-1 bg-[#141824] px-1.5 py-0.5 rounded border border-[#343B50]">
                      {getCategoryIcon(item.category)}
                      {cInfo.label}
                    </span>
                  </div>

                  <h3
                    className="font-bold text-xs mb-1 line-clamp-1"
                    style={{ color: rInfo.color }}
                  >
                    {item.name}
                  </h3>

                  <p className="text-[10px] text-[#A7B0C4] line-clamp-2 mb-3">
                    {item.description}
                  </p>
                </div>

                <div>
                  {/* Stats Tag */}
                  <div className="flex flex-wrap gap-1 mb-2 pt-2 border-t border-[#343B50]">
                    {item.stats.hp && (
                      <span className="text-[9px] font-bold px-1 rounded bg-[#FF5252]/15 text-[#FF5252]">
                        +{item.stats.hp} HP
                      </span>
                    )}
                    {item.stats.atk && (
                      <span className="text-[9px] font-bold px-1 rounded bg-[#FF8A00]/15 text-[#FF8A00]">
                        +{item.stats.atk} ATK
                      </span>
                    )}
                    {item.stats.mag && (
                      <span className="text-[9px] font-bold px-1 rounded bg-[#B58AFF]/15 text-[#B58AFF]">
                        +{item.stats.mag} MAG
                      </span>
                    )}
                    {item.stats.def && (
                      <span className="text-[9px] font-bold px-1 rounded bg-[#4C8DFF]/15 text-[#4C8DFF]">
                        +{item.stats.def} DEF
                      </span>
                    )}
                    {item.stats.res && (
                      <span className="text-[9px] font-bold px-1 rounded bg-[#00E5FF]/15 text-[#00E5FF]">
                        +{item.stats.res} RES
                      </span>
                    )}
                    {item.stats.mov && (
                      <span className="text-[9px] font-bold px-1 rounded bg-[#69F0AE]/15 text-[#69F0AE]">
                        +{item.stats.mov} MOV
                      </span>
                    )}
                    {item.stats.range && (
                      <span className="text-[9px] font-bold px-1 rounded bg-[#FFD700]/15 text-[#FFD700]">
                        +{item.stats.range} ALC
                      </span>
                    )}
                  </div>

                  {/* Monster Source */}
                  <div className="text-[9px] text-[#71788E] truncate">
                    Drop:{' '}
                    {item.droppedByMonsterTypeIds
                      .map((mId) => MONSTER_DEFINITIONS[mId]?.name || mId)
                      .join(', ')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
