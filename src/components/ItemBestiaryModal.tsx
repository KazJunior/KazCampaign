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
  Star,
  Coins,
  Check,
} from 'lucide-react';
import { ItemIcon } from './ItemIcon';
import { getItemEffectiveStats, getItemUpgradeCost, MAX_ITEM_ENHANCEMENT_LEVEL } from '../data/baseUpgrades';
import { soundManager } from '../utils/audio';

interface ItemBestiaryModalProps {
  discoveredItemIds: string[];
  itemUpgrades?: Record<string, number>;
  gold?: number;
  onUpgradeItem?: (itemId: string) => void;
  onClose: () => void;
}

export const ItemBestiaryModal: React.FC<ItemBestiaryModalProps> = ({
  discoveredItemIds = [],
  itemUpgrades = {},
  gold = 0,
  onUpgradeItem,
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
                Catálogo de Itens
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#10131C] text-[#D4AD65] border border-[#D4AD65]/40">
                  {discoveredCount} / {totalCount} Catalogados ({progressPercent}%)
                </span>
              </h2>
              <p className="text-xs text-[#A7B0C4]">
                Catálogo permanente de todos os armamentos, proteções e artefatos já encontrados nas suas aventuras.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {gold !== undefined && (
              <div className="flex items-center gap-2 bg-[#10131C] border border-[#D4AD65]/60 px-3 py-1.5 rounded-xl shadow-md">
                <Coins size={16} className="text-[#FFD700]" />
                <span className="text-xs font-black text-[#FFD700]">{gold.toLocaleString()} G</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#A7B0C4] hover:text-[#F3F4F8] hover:bg-[#10131C] transition-colors border border-transparent hover:border-[#343B50]"
            >
              <X size={20} />
            </button>
          </div>
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
                    Derrote monstros do abismo para catalogar este item.
                  </p>
                </div>
              );
            }

            const currentLvl = itemUpgrades[item.id] || 0;
            const effectiveStats = getItemEffectiveStats(item.stats, currentLvl);
            const isMax = currentLvl >= MAX_ITEM_ENHANCEMENT_LEVEL;
            const nextCost = getItemUpgradeCost(item.rarity, currentLvl);
            const canAfford = nextCost !== null && gold >= nextCost;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border-2 bg-[#10131C] flex flex-col justify-between transition-all hover:scale-[1.01] shadow-md"
                style={{
                  borderColor: currentLvl > 0 ? `${rInfo.color}` : `${rInfo.color}66`,
                  boxShadow: currentLvl > 0 ? `0 4px 16px ${rInfo.color}30` : `0 4px 14px ${rInfo.color}15`,
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

                    {/* Star Level Badge */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          size={12}
                          className={
                            starIdx <= currentLvl
                              ? 'text-[#FFD700] fill-[#FFD700]'
                              : 'text-[#343B50]'
                          }
                        />
                      ))}
                      <span
                        className={`text-[10px] font-black ml-1 ${
                          currentLvl > 0 ? 'text-[#FFD700]' : 'text-[#71788E]'
                        }`}
                      >
                        {currentLvl === 0 ? '+0%' : `+${currentLvl * 5}%`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-2.5">
                    <ItemIcon
                      iconName={item.iconName}
                      category={item.category}
                      rarity={item.rarity}
                      color={item.color}
                      badge
                      badgeSize="md"
                      showGlow
                    />
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-bold text-xs line-clamp-1"
                        style={{ color: rInfo.color }}
                      >
                        {item.name}
                      </h3>
                      <div className="text-[10px] text-[#A7B0C4] truncate">
                        {cInfo.label}
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#A7B0C4] line-clamp-2 mb-3">
                    {item.description}
                  </p>
                </div>

                <div>
                  {/* Effective Stats Tag */}
                  <div className="flex flex-wrap gap-1 mb-2 pt-2 border-t border-[#343B50]">
                    {effectiveStats.hp && (
                      <span className={`text-[9px] font-bold px-1 rounded ${currentLvl > 0 ? 'bg-[#FF5252]/25 text-[#FF8585] ring-1 ring-[#FF5252]/40' : 'bg-[#FF5252]/15 text-[#FF5252]'}`}>
                        +{effectiveStats.hp} HP
                      </span>
                    )}
                    {effectiveStats.atk && (
                      <span className={`text-[9px] font-bold px-1 rounded ${currentLvl > 0 ? 'bg-[#FF8A00]/25 text-[#FFA84D] ring-1 ring-[#FF8A00]/40' : 'bg-[#FF8A00]/15 text-[#FF8A00]'}`}>
                        +{effectiveStats.atk} ATK
                      </span>
                    )}
                    {effectiveStats.mag && (
                      <span className={`text-[9px] font-bold px-1 rounded ${currentLvl > 0 ? 'bg-[#B58AFF]/25 text-[#D0B8FF] ring-1 ring-[#B58AFF]/40' : 'bg-[#B58AFF]/15 text-[#B58AFF]'}`}>
                        +{effectiveStats.mag} MAG
                      </span>
                    )}
                    {effectiveStats.def && (
                      <span className={`text-[9px] font-bold px-1 rounded ${currentLvl > 0 ? 'bg-[#4C8DFF]/25 text-[#85B0FF] ring-1 ring-[#4C8DFF]/40' : 'bg-[#4C8DFF]/15 text-[#4C8DFF]'}`}>
                        +{effectiveStats.def} DEF
                      </span>
                    )}
                    {effectiveStats.res && (
                      <span className={`text-[9px] font-bold px-1 rounded ${currentLvl > 0 ? 'bg-[#00E5FF]/25 text-[#6BEEFF] ring-1 ring-[#00E5FF]/40' : 'bg-[#00E5FF]/15 text-[#00E5FF]'}`}>
                        +{effectiveStats.res} RES
                      </span>
                    )}
                    {effectiveStats.mov && (
                      <span className="text-[9px] font-bold px-1 rounded bg-[#69F0AE]/15 text-[#69F0AE]">
                        +{effectiveStats.mov} MOV
                      </span>
                    )}
                    {effectiveStats.range && (
                      <span className="text-[9px] font-bold px-1 rounded bg-[#FFD700]/15 text-[#FFD700]">
                        +{effectiveStats.range} ALC
                      </span>
                    )}
                  </div>

                  {/* Enhancement Button */}
                  {onUpgradeItem && (
                    <div className="mb-2">
                      {isMax ? (
                        <div className="w-full py-1.5 rounded-lg bg-[#43C878]/10 border border-[#43C878]/30 text-[#43C878] font-bold text-[10px] text-center flex items-center justify-center gap-1">
                          <Check size={12} /> Aprimoramento Máximo (★★★)
                        </div>
                      ) : nextCost !== null ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!canAfford) {
                              soundManager.playError();
                              return;
                            }
                            soundManager.playUpgrade();
                            onUpgradeItem(item.id);
                          }}
                          disabled={!canAfford}
                          className={`w-full py-1.5 rounded-lg font-black text-[11px] flex items-center justify-center gap-1.5 transition-all ${
                            canAfford
                              ? 'bg-gradient-to-r from-[#D4AD65] to-[#F0B44D] text-[#10131C] hover:scale-105 active:scale-95 shadow-sm shadow-[#D4AD65]/20 cursor-pointer'
                              : 'bg-[#141824] border border-[#343B50] text-[#71788E] cursor-not-allowed opacity-80'
                          }`}
                        >
                          <Coins size={12} />
                          <span>{nextCost.toLocaleString()} G</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider ml-0.5">
                            {canAfford ? 'Melhorar (+5%)' : 'Insuficiente'}
                          </span>
                        </button>
                      ) : null}
                    </div>
                  )}

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

export const ItemCatalogModal = ItemBestiaryModal;
export type ItemCatalogModalProps = ItemBestiaryModalProps;
