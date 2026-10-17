import React, { useState, useEffect } from 'react';
import type { EquipmentSlots, ItemCategory, ItemDefinition, UnitProgression } from '../types/game';
import { CLASS_DEFINITIONS } from '../data/units';
import { getItemById, RARITY_INFO, CATEGORY_INFO } from '../data/items';
import { soundManager } from '../utils/audio';
import {
  X,
  Shield,
  Swords,
  HardHat,
  Layers,
  Footprints,
  Gem,
  CheckCircle2,
  Trash2,
  Package,
} from 'lucide-react';

interface EquipmentModalProps {
  partyClasses: string[];
  unitsState: Record<string, UnitProgression>;
  inventory: string[]; // List of item IDs held in the current run
  equipment: Record<string, EquipmentSlots>;
  onEquipItem: (className: string, itemId: string, inventoryIndex?: number) => void;
  onUnequipItem: (className: string, category: ItemCategory) => void;
  onClose: () => void;
}

interface InventoryEntry {
  item: ItemDefinition;
  inventoryIndex: number;
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  partyClasses,
  unitsState,
  inventory,
  equipment,
  onEquipItem,
  onUnequipItem,
  onClose,
}) => {
  const [activeClass, setActiveClass] = useState<string>(partyClasses[0] || 'guerreiro');
  const [selectedInventoryIndex, setSelectedInventoryIndex] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | ItemCategory>('all');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const currentHeroDef = CLASS_DEFINITIONS[activeClass];
  const currentHeroProgression = unitsState[activeClass] || {
    className: activeClass,
    level: 1,
    xp: 0,
    bonusAtk: 0,
    bonusDef: 0,
    bonusHp: 0,
    bonusMag: 0,
    bonusRes: 0,
    learnedSkillIds: [],
  };

  const currentHeroEquipment = equipment[activeClass] || {};

  // Itens desequipados no inventário da aventura (suporta múltiplos itens idênticos)
  const unequippedItems: InventoryEntry[] = inventory
    .map((id, index) => {
      const item = getItemById(id);
      return item ? { item, inventoryIndex: index } : null;
    })
    .filter((entry): entry is InventoryEntry => Boolean(entry));

  const filteredInventory = unequippedItems.filter(({ item }) => {
    if (categoryFilter === 'all') return true;
    return item.category === categoryFilter;
  });

  const slotsList: { category: ItemCategory; label: string; icon: React.ReactNode }[] = [
    { category: 'helmet', label: 'Capacete', icon: <HardHat size={18} /> },
    { category: 'chestplate', label: 'Peitoral', icon: <Shield size={18} /> },
    { category: 'leggings', label: 'Calça', icon: <Layers size={18} /> },
    { category: 'boots', label: 'Bota', icon: <Footprints size={18} /> },
    { category: 'weapon', label: 'Arma', icon: <Swords size={18} /> },
    { category: 'accessory', label: 'Acessório', icon: <Gem size={18} /> },
  ];

  // Calculate total stats from equipped items for current hero
  const equippedItemsForCurrentHero = slotsList
    .map((slot) => {
      const itemId = currentHeroEquipment[slot.category];
      return itemId ? getItemById(itemId) : null;
    })
    .filter((it): it is ItemDefinition => Boolean(it));

  const gearStats = equippedItemsForCurrentHero.reduce(
    (acc, it) => {
      acc.hp += it.stats.hp || 0;
      acc.atk += it.stats.atk || 0;
      acc.mag += it.stats.mag || 0;
      acc.def += it.stats.def || 0;
      acc.res += it.stats.res || 0;
      acc.mov += it.stats.mov || 0;
      acc.range += it.stats.range || 0;
      return acc;
    },
    { hp: 0, atk: 0, mag: 0, def: 0, res: 0, mov: 0, range: 0 }
  );

  const handleEquip = (item: ItemDefinition, inventoryIndex: number) => {
    soundManager.playSelect();
    onEquipItem(activeClass, item.id, inventoryIndex);
    setSelectedInventoryIndex(null);
  };

  const handleUnequip = (category: ItemCategory) => {
    soundManager.playSelect();
    onUnequipItem(activeClass, category);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans"
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
              <Package size={22} />
            </div>
            <div>
              <h2 className="font-black text-lg text-[#F3F4F8] flex items-center gap-2">
                Arsenal & Equipamentos da Equipe
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#10131C] text-[#D4AD65] border border-[#D4AD65]/40">
                  {inventory.length} Itens na Aventura
                </span>
              </h2>
              <p className="text-xs text-[#A7B0C4]">
                Equipe até 1 item por categoria em cada herói. Os itens são temporários desta aventura e somem ao final.
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

        {/* Hero Selector Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-[#141824] border-b border-[#343B50] overflow-x-auto">
          {partyClasses.map((cKey) => {
            const cDef = CLASS_DEFINITIONS[cKey];
            if (!cDef) return null;
            const isSelected = activeClass === cKey;
            const heroGearCount = Object.values(equipment[cKey] || {}).filter(Boolean).length;

            return (
              <button
                key={cKey}
                type="button"
                onClick={() => {
                  soundManager.playSelect();
                  setActiveClass(cKey);
                  setSelectedInventoryIndex(null);
                }}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border-2 transition-all shrink-0 ${
                  isSelected
                    ? 'border-[#D4AD65] bg-[#1B2030] shadow-lg shadow-[#D4AD65]/10 text-white'
                    : 'border-[#343B50] bg-[#10131C] text-[#A7B0C4] hover:border-[#A7B0C4]/40 hover:text-white'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cDef.color }}
                />
                <span className="font-bold text-xs">{cDef.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#10131C] border border-[#343B50] text-[#D4AD65]">
                  {heroGearCount}/6
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Body: Left = Hero Equipment Slots & Stats, Right = Inventory */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left: Hero Equipment Slots (7 cols) */}
          <div className="md:col-span-7 p-6 border-b md:border-b-0 md:border-r border-[#343B50] overflow-y-auto space-y-4">
            {/* Hero Quick Stats Banner */}
            <div className="bg-[#10131C] p-4 rounded-xl border border-[#343B50] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#F3F4F8] flex items-center gap-2">
                  <span style={{ color: currentHeroDef.color }}>{currentHeroDef.name}</span>
                  <span className="text-xs text-[#A7B0C4]">Nv.{currentHeroProgression.level}</span>
                </h3>
                <div className="text-[11px] text-[#A7B0C4] mt-0.5">{currentHeroDef.role}</div>
              </div>

              {/* Bonus stats sum */}
              <div className="flex items-center gap-2 text-xs">
                {gearStats.hp > 0 && (
                  <span className="text-[#FF5252] font-bold">+{gearStats.hp} HP</span>
                )}
                {gearStats.atk > 0 && (
                  <span className="text-[#FF8A00] font-bold">+{gearStats.atk} ATK</span>
                )}
                {gearStats.mag > 0 && (
                  <span className="text-[#B58AFF] font-bold">+{gearStats.mag} MAG</span>
                )}
                {gearStats.def > 0 && (
                  <span className="text-[#4C8DFF] font-bold">+{gearStats.def} DEF</span>
                )}
                {gearStats.res > 0 && (
                  <span className="text-[#00E5FF] font-bold">+{gearStats.res} RES</span>
                )}
                {gearStats.mov > 0 && (
                  <span className="text-[#69F0AE] font-bold">+{gearStats.mov} MOV</span>
                )}
              </div>
            </div>

            {/* 6 Category Slots */}
            <div className="grid grid-cols-2 gap-3">
              {slotsList.map((slot) => {
                const itemId = currentHeroEquipment[slot.category];
                const item = itemId ? getItemById(itemId) : null;
                const rInfo = item ? RARITY_INFO[item.rarity] : null;

                return (
                  <div
                    key={slot.category}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col justify-between ${
                      item && rInfo
                        ? `${rInfo.border} bg-[#10131C]`
                        : 'border-dashed border-[#343B50] bg-[#141824]/60'
                    }`}
                  >
                    <div>
                      {/* Slot Header */}
                      <div className="flex items-center justify-between text-xs text-[#A7B0C4] mb-2">
                        <span className="flex items-center gap-1.5 font-bold text-[11px]">
                          {slot.icon}
                          {slot.label}
                        </span>
                        {item && (
                          <button
                            type="button"
                            onClick={() => handleUnequip(slot.category)}
                            className="p-1 rounded text-[#E65353] hover:bg-[#E65353]/15 transition-colors"
                            title="Desequipar este item"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      {/* Slot Content */}
                      {item && rInfo ? (
                        <div>
                          <div
                            className="font-bold text-xs mb-1"
                            style={{ color: rInfo.color }}
                          >
                            {item.name}
                          </div>
                          <p className="text-[10px] text-[#A7B0C4] line-clamp-1 mb-2">
                            {item.description}
                          </p>

                          <div className="flex flex-wrap gap-1">
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
                        </div>
                      ) : (
                        <div className="py-4 text-center text-[#71788E] text-[11px]">
                          Vazio
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Adventure Inventory (5 cols) */}
          <div className="md:col-span-5 p-6 flex flex-col bg-[#141824] overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#F3F4F8] flex items-center gap-1.5">
                <Package size={16} className="text-[#D4AD65]" />
                Itens Disponíveis ({unequippedItems.length})
              </h3>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 text-[11px]">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 ${
                  categoryFilter === 'all'
                    ? 'bg-[#D4AD65] text-[#10131C]'
                    : 'bg-[#1B2030] text-[#A7B0C4] hover:text-white'
                }`}
              >
                Todos
              </button>
              {slotsList.map((s) => (
                <button
                  key={s.category}
                  type="button"
                  onClick={() => setCategoryFilter(s.category)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 flex items-center gap-1 ${
                    categoryFilter === s.category
                      ? 'bg-[#D4AD65] text-[#10131C]'
                      : 'bg-[#1B2030] text-[#A7B0C4] hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Inventory Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredInventory.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-[#71788E] text-xs">
                  <Package size={32} className="mb-2 opacity-40" />
                  Nenhum item desequipado nesta categoria. Vença fases para encontrar novos drops!
                </div>
              ) : (
                filteredInventory.map(({ item, inventoryIndex }) => {
                  const isSelected = selectedInventoryIndex === inventoryIndex;
                  const rInfo = RARITY_INFO[item.rarity];
                  const cInfo = CATEGORY_INFO[item.category];
                  const currentlyEquippedId = currentHeroEquipment[item.category];
                  const currentlyEquippedItem = currentlyEquippedId ? getItemById(currentlyEquippedId) : null;
                  const isReplacing = Boolean(currentlyEquippedItem);

                  return (
                    <div
                      key={`${item.id}_${inventoryIndex}`}
                      onClick={() => setSelectedInventoryIndex(inventoryIndex)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? `${rInfo.border} bg-[#1B2030] shadow-md`
                          : 'border-[#343B50] bg-[#10131C] hover:border-[#A7B0C4]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="font-bold text-xs"
                            style={{ color: rInfo.color }}
                          >
                            {item.name}
                          </span>
                          {isReplacing && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Substitui {cInfo.label}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#A7B0C4] bg-[#141824] px-1.5 py-0.5 rounded border border-[#343B50]">
                          {cInfo.label}
                        </span>
                      </div>

                      <p className="text-[10px] text-[#A7B0C4] mb-2">{item.description}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-[#343B50]/60 gap-2">
                        {/* Stats */}
                        <div className="flex flex-wrap gap-1 text-[9px] font-bold">
                          {item.stats.hp && <span className="text-[#FF5252]">+{item.stats.hp} HP</span>}
                          {item.stats.atk && <span className="text-[#FF8A00]">+{item.stats.atk} ATK</span>}
                          {item.stats.mag && <span className="text-[#B58AFF]">+{item.stats.mag} MAG</span>}
                          {item.stats.def && <span className="text-[#4C8DFF]">+{item.stats.def} DEF</span>}
                          {item.stats.res && <span className="text-[#00E5FF]">+{item.stats.res} RES</span>}
                          {item.stats.mov && <span className="text-[#69F0AE]">+{item.stats.mov} MOV</span>}
                        </div>

                        {/* Equip Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquip(item, inventoryIndex);
                          }}
                          className="py-1 px-3 rounded-lg bg-[#D4AD65] hover:bg-[#E5C27E] text-[#10131C] font-black text-[11px] uppercase tracking-wider flex items-center gap-1 transition-transform active:scale-95 shadow shrink-0"
                          title={isReplacing ? `Substituir ${currentlyEquippedItem?.name} e equipar ${item.name}` : `Equipar em ${currentHeroDef.name}`}
                        >
                          <CheckCircle2 size={12} />
                          {isReplacing
                            ? `Substituir ${cInfo.label}`
                            : `Equipar em ${currentHeroDef.name}`}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
