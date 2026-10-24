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
import { ItemIcon } from './ItemIcon';
import { getItemEffectiveStats } from '../data/baseUpgrades';

interface EquipmentModalProps {
  partyClasses: string[];
  unitsState: Record<string, UnitProgression>;
  inventory: string[]; // List of item IDs held in the current run
  equipment: Record<string, EquipmentSlots>;
  itemUpgrades?: Record<string, number>;
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
  itemUpgrades = {},
  onEquipItem,
  onUnequipItem,
  onClose,
}) => {
  const [activeClass, setActiveClass] = useState<string>(partyClasses[0] || 'guerreiro');
  const [selectedInventoryIndex, setSelectedInventoryIndex] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | ItemCategory>('all');
  const [mobileSection, setMobileSection] = useState<'slots' | 'inventory'>('slots');

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

  // Calculate total stats from equipped items for current hero (with item upgrades applied)
  const equippedItemsForCurrentHero = slotsList
    .map((slot) => {
      const itemId = currentHeroEquipment[slot.category];
      return itemId ? getItemById(itemId) : null;
    })
    .filter((it): it is ItemDefinition => Boolean(it));

  const gearStats = equippedItemsForCurrentHero.reduce(
    (acc, it) => {
      const eff = getItemEffectiveStats(it.stats, itemUpgrades[it.id] || 0);
      acc.hp += eff.hp || 0;
      acc.atk += eff.atk || 0;
      acc.mag += eff.mag || 0;
      acc.def += eff.def || 0;
      acc.res += eff.res || 0;
      acc.mov += eff.mov || 0;
      acc.range += eff.range || 0;
      return acc;
    },
    { hp: 0, atk: 0, mag: 0, def: 0, res: 0, mov: 0, range: 0 }
  );

  const handleEquip = (item: ItemDefinition, inventoryIndex: number) => {
    soundManager.playSelect();
    onEquipItem(activeClass, item.id, inventoryIndex);
    setSelectedInventoryIndex(null);
    setMobileSection('slots');
  };

  const handleUnequip = (category: ItemCategory) => {
    soundManager.playSelect();
    onUnequipItem(activeClass, category);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#1B2030] border-2 border-[#D4AD65]/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-4 border-b border-[#343B50] bg-gradient-to-r from-[#D4AD65]/20 via-[#1B2030] to-transparent">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#10131C] border border-[#D4AD65]/40 text-[#D4AD65] shrink-0">
              <Package size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-sm sm:text-lg text-[#F3F4F8] flex items-center gap-1.5 truncate">
                <span>Arsenal & Equipamentos</span>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-[#10131C] text-[#D4AD65] border border-[#D4AD65]/40 shrink-0">
                  {inventory.length} Itens
                </span>
              </h2>
              <p className="text-[10px] sm:text-xs text-[#A7B0C4] truncate">
                Equipe até 1 item por categoria em cada herói.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-[#A7B0C4] hover:text-[#F3F4F8] hover:bg-[#10131C] transition-colors border border-transparent hover:border-[#343B50] shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hero Selector Tabs */}
        <div className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-[#141824] border-b border-[#343B50] overflow-x-auto no-scrollbar shrink-0">
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
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 transition-all shrink-0 ${
                  isSelected
                    ? 'border-[#D4AD65] bg-[#1B2030] shadow-lg shadow-[#D4AD65]/10 text-white'
                    : 'border-[#343B50] bg-[#10131C] text-[#A7B0C4] hover:border-[#A7B0C4]/40 hover:text-white'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
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

        {/* Mobile Section Switcher */}
        <div className="flex md:hidden border-b border-[#343B50] bg-[#10131C] p-1.5 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileSection('slots')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileSection === 'slots'
                ? 'bg-[#D4AD65] text-[#10131C] shadow font-black'
                : 'text-[#A7B0C4] hover:text-white'
            }`}
          >
            <Shield size={14} />
            <span>Equipados ({equippedItemsForCurrentHero.length}/6)</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileSection('inventory')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileSection === 'inventory'
                ? 'bg-[#D4AD65] text-[#10131C] shadow font-black'
                : 'text-[#A7B0C4] hover:text-white'
            }`}
          >
            <Package size={14} />
            <span>Mochila ({unequippedItems.length})</span>
          </button>
        </div>

        {/* Content Body: Left = Hero Equipment Slots & Stats, Right = Inventory */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left: Hero Equipment Slots (7 cols) */}
          <div className={`md:col-span-7 p-3.5 sm:p-6 border-b md:border-b-0 md:border-r border-[#343B50] overflow-y-auto space-y-3 sm:space-y-4 ${
            mobileSection === 'slots' ? 'flex flex-col flex-1' : 'hidden md:flex md:flex-col'
          }`}>
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
                      {item && rInfo ? (() => {
                        const upgradeLvl = itemUpgrades[item.id] || 0;
                        const effStats = getItemEffectiveStats(item.stats, upgradeLvl);
                        return (
                          <div>
                            <div className="flex items-start gap-2 mb-1.5">
                              <ItemIcon
                                iconName={item.iconName}
                                category={item.category}
                                rarity={item.rarity}
                                color={item.color}
                                badge
                                badgeSize="sm"
                                showGlow
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className="font-bold text-xs truncate"
                                    style={{ color: rInfo.color }}
                                  >
                                    {item.name}
                                  </span>
                                  {upgradeLvl > 0 && (
                                    <span className="text-[9px] font-black text-[#FFD700] bg-[#FFD700]/15 px-1 rounded border border-[#FFD700]/30">
                                      ★ +{upgradeLvl * 5}%
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-[#A7B0C4] line-clamp-1">
                                  {item.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {effStats.hp && (
                                <span className={`text-[9px] font-bold px-1 rounded ${upgradeLvl > 0 ? 'bg-[#FF5252]/25 text-[#FF8585]' : 'bg-[#FF5252]/15 text-[#FF5252]'}`}>
                                  +{effStats.hp} HP
                                </span>
                              )}
                              {effStats.atk && (
                                <span className={`text-[9px] font-bold px-1 rounded ${upgradeLvl > 0 ? 'bg-[#FF8A00]/25 text-[#FFA84D]' : 'bg-[#FF8A00]/15 text-[#FF8A00]'}`}>
                                  +{effStats.atk} ATK
                                </span>
                              )}
                              {effStats.mag && (
                                <span className={`text-[9px] font-bold px-1 rounded ${upgradeLvl > 0 ? 'bg-[#B58AFF]/25 text-[#D0B8FF]' : 'bg-[#B58AFF]/15 text-[#B58AFF]'}`}>
                                  +{effStats.mag} MAG
                                </span>
                              )}
                              {effStats.def && (
                                <span className={`text-[9px] font-bold px-1 rounded ${upgradeLvl > 0 ? 'bg-[#4C8DFF]/25 text-[#85B0FF]' : 'bg-[#4C8DFF]/15 text-[#4C8DFF]'}`}>
                                  +{effStats.def} DEF
                                </span>
                              )}
                              {effStats.res && (
                                <span className={`text-[9px] font-bold px-1 rounded ${upgradeLvl > 0 ? 'bg-[#00E5FF]/25 text-[#6BEEFF]' : 'bg-[#00E5FF]/15 text-[#00E5FF]'}`}>
                                  +{effStats.res} RES
                                </span>
                              )}
                              {effStats.mov && (
                                <span className="text-[9px] font-bold px-1 rounded bg-[#69F0AE]/15 text-[#69F0AE]">
                                  +{effStats.mov} MOV
                                </span>
                              )}
                              {effStats.range && (
                                <span className="text-[9px] font-bold px-1 rounded bg-[#FFD700]/15 text-[#FFD700]">
                                  +{effStats.range} ALC
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })() : (
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
          <div className={`md:col-span-5 p-3.5 sm:p-6 flex flex-col bg-[#141824] overflow-hidden ${
            mobileSection === 'inventory' ? 'flex flex-1' : 'hidden md:flex'
          }`}>
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
                  const upgradeLvl = itemUpgrades[item.id] || 0;
                  const effStats = getItemEffectiveStats(item.stats, upgradeLvl);

                  return (
                    <div
                      key={`${item.id}_${inventoryIndex}`}
                      onClick={() => setSelectedInventoryIndex(inventoryIndex)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-start ${
                        isSelected
                          ? `${rInfo.border} bg-[#1B2030] shadow-md`
                          : 'border-[#343B50] bg-[#10131C] hover:border-[#A7B0C4]/40'
                      }`}
                    >
                      <ItemIcon
                        iconName={item.iconName}
                        category={item.category}
                        rarity={item.rarity}
                        color={item.color}
                        badge
                        badgeSize="md"
                        showGlow={isSelected}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="font-bold text-xs truncate"
                              style={{ color: rInfo.color }}
                            >
                              {item.name}
                            </span>
                            {upgradeLvl > 0 && (
                              <span className="text-[9px] font-black text-[#FFD700] bg-[#FFD700]/15 px-1 rounded border border-[#FFD700]/30">
                                ★ +{upgradeLvl * 5}%
                              </span>
                            )}
                            {isReplacing && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                Substitui {cInfo.label}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#A7B0C4] bg-[#141824] px-1.5 py-0.5 rounded border border-[#343B50] shrink-0">
                            {cInfo.label}
                          </span>
                        </div>

                        <p className="text-[10px] text-[#A7B0C4] mb-2 line-clamp-1">{item.description}</p>

                        <div className="flex items-center justify-between pt-1 border-t border-[#343B50]/60 gap-2">
                          {/* Stats */}
                          <div className="flex flex-wrap gap-1 text-[9px] font-bold">
                            {effStats.hp && <span className={upgradeLvl > 0 ? 'text-[#FF8585]' : 'text-[#FF5252]'}>+{effStats.hp} HP</span>}
                            {effStats.atk && <span className={upgradeLvl > 0 ? 'text-[#FFA84D]' : 'text-[#FF8A00]'}>+{effStats.atk} ATK</span>}
                            {effStats.mag && <span className={upgradeLvl > 0 ? 'text-[#D0B8FF]' : 'text-[#B58AFF]'}>+{effStats.mag} MAG</span>}
                            {effStats.def && <span className={upgradeLvl > 0 ? 'text-[#85B0FF]' : 'text-[#4C8DFF]'}>+{effStats.def} DEF</span>}
                            {effStats.res && <span className={upgradeLvl > 0 ? 'text-[#6BEEFF]' : 'text-[#00E5FF]'}>+{effStats.res} RES</span>}
                            {effStats.mov && <span className="text-[#69F0AE]">+{effStats.mov} MOV</span>}
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
