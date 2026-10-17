import React, { useState, useEffect } from 'react';
import type { ItemCategory, ItemRarity } from '../types/game';
import {
  CLASS_UPGRADES,
  MAX_CLASS_UPGRADE_LEVEL,
  getClassCumulativeBonus,
  GENERAL_UPGRADES,
  MAX_ITEM_ENHANCEMENT_LEVEL,
  getItemUpgradeCost,
  getItemEffectiveStats,
} from '../data/baseUpgrades';
import { CLASS_DEFINITIONS } from '../data/units';
import { ITEMS, RARITY_INFO, CATEGORY_INFO } from '../data/items';
import { soundManager } from '../utils/audio';
import { ItemIcon } from './ItemIcon';
import {
  X,
  Building2,
  Swords,
  Sparkles,
  Hammer,
  Coins,
  Check,
  Lock,
  Heart,
  Star,
  Search,
  Package,
  ArrowRight,
} from 'lucide-react';

interface BaseUpgradeModalProps {
  gold: number;
  classUpgrades: Record<string, number>;
  generalUpgrades: Record<string, number>;
  itemUpgrades: Record<string, number>;
  discoveredItemIds: string[];
  onUpgradeClass: (className: string) => void;
  onUpgradeGeneral: (upgradeId: string) => void;
  onUpgradeItem: (itemId: string) => void;
  onClose: () => void;
  initialTab?: 'classes' | 'general' | 'forge';
}

export const BaseUpgradeModal: React.FC<BaseUpgradeModalProps> = ({
  gold,
  classUpgrades = {},
  generalUpgrades = {},
  itemUpgrades = {},
  discoveredItemIds = [],
  onUpgradeClass,
  onUpgradeGeneral,
  onUpgradeItem,
  onClose,
  initialTab = 'classes',
}) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'general' | 'forge'>(initialTab);
  const [selectedClass, setSelectedClass] = useState<string>('guerreiro');
  const [forgeCategory, setForgeCategory] = useState<'all' | ItemCategory>('all');
  const [forgeRarity, setForgeRarity] = useState<'all' | ItemRarity>('all');
  const [forgeSearch, setForgeSearch] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const classList = Object.keys(CLASS_UPGRADES);
  const currentClassDef = CLASS_DEFINITIONS[selectedClass];
  const currentClassTiers = CLASS_UPGRADES[selectedClass] || [];
  const currentClassLevel = classUpgrades[selectedClass] || 0;
  const currentClassCumulativeBonus = getClassCumulativeBonus(selectedClass, currentClassLevel);

  // Forja do Catálogo
  const discoveredSet = new Set(discoveredItemIds);
  const catalogDiscoveredItems = Object.values(ITEMS).filter((it) => discoveredSet.has(it.id));

  const filteredForgeItems = catalogDiscoveredItems.filter((item) => {
    if (forgeCategory !== 'all' && item.category !== forgeCategory) return false;
    if (forgeRarity !== 'all' && item.rarity !== forgeRarity) return false;
    if (forgeSearch.trim()) {
      const q = forgeSearch.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleBuyClassUpgrade = (className: string, tierIndex: number, cost: number) => {
    const currentLvl = classUpgrades[className] || 0;
    if (tierIndex !== currentLvl) return; // Only buy the next tier
    if (gold < cost) {
      soundManager.playError();
      return;
    }
    soundManager.playUpgrade();
    onUpgradeClass(className);
  };

  const handleBuyGeneralUpgrade = (upgradeId: string, cost: number) => {
    if (gold < cost) {
      soundManager.playError();
      return;
    }
    soundManager.playUpgrade();
    onUpgradeGeneral(upgradeId);
  };

  const handleBuyItemUpgrade = (itemId: string, cost: number) => {
    if (gold < cost) {
      soundManager.playError();
      return;
    }
    soundManager.playUpgrade();
    onUpgradeItem(itemId);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#1B2030] border-2 border-[#D4AD65]/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-[#343B50] bg-gradient-to-r from-[#D4AD65]/20 via-[#1B2030] to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#10131C] border border-[#D4AD65]/40 text-[#D4AD65] shadow-inner">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="font-black text-lg sm:text-xl text-[#F3F4F8] flex items-center gap-2">
                Base de Operações & Aprimoramentos
              </h2>
              <p className="text-xs text-[#A7B0C4]">
                Melhorias permanentes para classes, bônus globais de expedição e forja de equipamentos do catálogo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Gold Counter */}
            <div className="flex items-center gap-2 bg-[#10131C] border border-[#D4AD65]/60 px-3.5 py-1.5 rounded-xl shadow-md">
              <Coins size={18} className="text-[#FFD700] animate-pulse" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-[#A7B0C4] uppercase tracking-wider font-semibold">Ouro Disponível</span>
                <span className="text-sm font-black text-[#FFD700] tracking-wide">{gold.toLocaleString()} G</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#A7B0C4] hover:text-[#F3F4F8] hover:bg-[#10131C] transition-colors border border-transparent hover:border-[#343B50]"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#343B50] bg-[#141824] px-4 sm:px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playSelect();
              setActiveTab('classes');
            }}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              activeTab === 'classes'
                ? 'bg-[#1B2030] text-[#D4AD65] border-[#D4AD65]/50 shadow-sm'
                : 'bg-transparent text-[#A7B0C4] border-transparent hover:text-white hover:bg-[#1B2030]/50'
            }`}
          >
            <Swords size={16} />
            <span>Upgrades de Classes</span>
            <span className="text-[10px] bg-[#10131C] px-1.5 py-0.5 rounded border border-[#343B50] text-[#D4AD65]">
              5 Níveis
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playSelect();
              setActiveTab('general');
            }}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              activeTab === 'general'
                ? 'bg-[#1B2030] text-[#00E5FF] border-[#00E5FF]/50 shadow-sm'
                : 'bg-transparent text-[#A7B0C4] border-transparent hover:text-white hover:bg-[#1B2030]/50'
            }`}
          >
            <Sparkles size={16} />
            <span>Melhorias Gerais</span>
            <span className="text-[10px] bg-[#10131C] px-1.5 py-0.5 rounded border border-[#343B50] text-[#00E5FF]">
              Meta
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playSelect();
              setActiveTab('forge');
            }}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              activeTab === 'forge'
                ? 'bg-[#1B2030] text-[#B58AFF] border-[#B58AFF]/50 shadow-sm'
                : 'bg-transparent text-[#A7B0C4] border-transparent hover:text-white hover:bg-[#1B2030]/50'
            }`}
          >
            <Hammer size={16} />
            <span>Forja do Catálogo</span>
            <span className="text-[10px] bg-[#10131C] px-1.5 py-0.5 rounded border border-[#343B50] text-[#B58AFF]">
              +5% até 3x
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#171B29]">
          {/* ============================================================= */}
          {/* TAB 1: UPGRADES DE CLASSES */}
          {/* ============================================================= */}
          {activeTab === 'classes' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full">
              {/* Left Column: Class Selector List */}
              <div className="md:col-span-4 flex flex-col gap-2 overflow-y-auto pr-1 max-h-[65vh]">
                <span className="text-xs font-bold text-[#A7B0C4] uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Selecione a Classe</span>
                  <span className="text-[10px] text-[#D4AD65]">{classList.length} Classes</span>
                </span>

                {classList.map((cName) => {
                  const def = CLASS_DEFINITIONS[cName];
                  if (!def) return null;
                  const lvl = classUpgrades[cName] || 0;
                  const isSelected = selectedClass === cName;

                  return (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => {
                        soundManager.playSelect();
                        setSelectedClass(cName);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#10131C] border-[#D4AD65] shadow-lg scale-[1.01]'
                          : 'bg-[#141824]/80 border-[#343B50] hover:bg-[#1B2030] hover:border-[#71788E]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm shrink-0 border"
                          style={{
                            backgroundColor: `${def.color}25`,
                            color: def.color,
                            borderColor: `${def.color}66`,
                          }}
                        >
                          {def.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-xs text-[#F3F4F8] truncate">{def.name}</div>
                          <div className="text-[10px] text-[#A7B0C4]">{def.role}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            lvl >= MAX_CLASS_UPGRADE_LEVEL
                              ? 'bg-[#43C878]/20 text-[#43C878] border-[#43C878]/40'
                              : lvl > 0
                              ? 'bg-[#D4AD65]/20 text-[#D4AD65] border-[#D4AD65]/40'
                              : 'bg-[#343B50]/40 text-[#71788E] border-[#343B50]'
                          }`}
                        >
                          {lvl === 0 ? 'Sem Nível' : lvl >= 5 ? 'MAX (5/5)' : `Nv. ${lvl}/5`}
                        </span>
                        {/* 5 dots indicator */}
                        <div className="flex items-center gap-1 mt-1.5">
                          {[1, 2, 3, 4, 5].map((dot) => (
                            <div
                              key={dot}
                              className={`w-1.5 h-1.5 rounded-full ${
                                dot <= lvl ? 'bg-[#D4AD65]' : 'bg-[#343B50]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Selected Class Progression Path (5 Tiers) */}
              <div className="md:col-span-8 flex flex-col gap-4 overflow-y-auto max-h-[65vh] pr-1">
                {currentClassDef && (
                  <div className="p-4 rounded-xl bg-[#10131C] border border-[#343B50] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border shadow-inner"
                        style={{
                          backgroundColor: `${currentClassDef.color}25`,
                          color: currentClassDef.color,
                          borderColor: `${currentClassDef.color}88`,
                        }}
                      >
                        {currentClassDef.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-base text-[#F3F4F8] flex items-center gap-2">
                          {currentClassDef.name}
                          <span className="text-xs font-normal text-[#A7B0C4]">({currentClassDef.role})</span>
                        </h3>
                        <p className="text-xs text-[#A7B0C4]">{currentClassDef.description}</p>
                      </div>
                    </div>

                    {/* Cumulative bonus summary */}
                    <div className="bg-[#141824] px-3.5 py-2 rounded-xl border border-[#343B50] text-xs">
                      <span className="text-[10px] font-bold text-[#A7B0C4] uppercase block mb-1">
                        Bônus Permanente Acumulado:
                      </span>
                      {currentClassLevel === 0 ? (
                        <span className="text-[#71788E] italic text-xs">Nenhum bônus adquirido ainda</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 font-bold">
                          {currentClassCumulativeBonus.hp > 0 && (
                            <span className="text-[#FF5252] bg-[#FF5252]/15 px-1.5 py-0.5 rounded">
                              +{currentClassCumulativeBonus.hp} HP
                            </span>
                          )}
                          {currentClassCumulativeBonus.atk > 0 && (
                            <span className="text-[#FF8A00] bg-[#FF8A00]/15 px-1.5 py-0.5 rounded">
                              +{currentClassCumulativeBonus.atk} ATK
                            </span>
                          )}
                          {currentClassCumulativeBonus.mag > 0 && (
                            <span className="text-[#B58AFF] bg-[#B58AFF]/15 px-1.5 py-0.5 rounded">
                              +{currentClassCumulativeBonus.mag} MAG
                            </span>
                          )}
                          {currentClassCumulativeBonus.def > 0 && (
                            <span className="text-[#4C8DFF] bg-[#4C8DFF]/15 px-1.5 py-0.5 rounded">
                              +{currentClassCumulativeBonus.def} DEF
                            </span>
                          )}
                          {currentClassCumulativeBonus.res > 0 && (
                            <span className="text-[#00E5FF] bg-[#00E5FF]/15 px-1.5 py-0.5 rounded">
                              +{currentClassCumulativeBonus.res} RES
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5 Upgrade Tiers */}
                <div className="space-y-3">
                  {currentClassTiers.map((tier, index) => {
                    const isPurchased = index < currentClassLevel;
                    const isNextToBuy = index === currentClassLevel;
                    const isLocked = index > currentClassLevel;
                    const canAfford = gold >= tier.cost;

                    return (
                      <div
                        key={tier.level}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isPurchased
                            ? 'bg-[#10131C]/60 border-[#43C878]/40 shadow-sm'
                            : isNextToBuy
                            ? 'bg-[#10131C] border-[#D4AD65] shadow-md shadow-[#D4AD65]/10'
                            : 'bg-[#141824]/40 border-[#343B50]/50 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${
                              isPurchased
                                ? 'bg-[#43C878]/20 border-[#43C878] text-[#43C878]'
                                : isNextToBuy
                                ? 'bg-[#D4AD65]/20 border-[#D4AD65] text-[#D4AD65]'
                                : 'bg-[#1B2030] border-[#343B50] text-[#71788E]'
                            }`}
                          >
                            {isPurchased ? <Check size={18} /> : isLocked ? <Lock size={16} /> : tier.level}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-[#F3F4F8]">
                                Grau {tier.level}: {tier.name}
                              </h4>
                              {isPurchased && (
                                <span className="text-[10px] font-black text-[#43C878] bg-[#43C878]/15 px-2 py-0.5 rounded-full border border-[#43C878]/30">
                                  ATIVADO
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#A7B0C4] mt-0.5">{tier.description}</p>
                          </div>
                        </div>

                        {/* Action or Status */}
                        <div className="flex items-center gap-3 justify-end shrink-0 sm:self-center">
                          {isPurchased ? (
                            <span className="text-xs font-bold text-[#43C878] flex items-center gap-1 bg-[#43C878]/10 px-3 py-1.5 rounded-xl border border-[#43C878]/30">
                              <Check size={14} /> Adquirido
                            </span>
                          ) : isNextToBuy ? (
                            <button
                              type="button"
                              onClick={() => handleBuyClassUpgrade(selectedClass, index, tier.cost)}
                              disabled={!canAfford}
                              className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
                                canAfford
                                  ? 'bg-gradient-to-r from-[#D4AD65] to-[#F0B44D] text-[#10131C] hover:scale-105 active:scale-95 shadow-md shadow-[#D4AD65]/25 cursor-pointer'
                                  : 'bg-[#10131C] border border-[#343B50] text-[#71788E] cursor-not-allowed opacity-80'
                              }`}
                            >
                              <Coins size={14} />
                              <span>{tier.cost.toLocaleString()} G</span>
                              <span className="text-[10px] uppercase tracking-wider font-extrabold ml-1">
                                {canAfford ? 'Comprar' : 'Ouro Insuficiente'}
                              </span>
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-[#71788E] flex items-center gap-1.5 bg-[#10131C] px-3 py-1.5 rounded-xl border border-[#343B50]">
                              <Lock size={12} /> {tier.cost.toLocaleString()} G
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 2: MELHORIAS GERAIS */}
          {/* ============================================================= */}
          {activeTab === 'general' && (
            <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
              <div className="p-3.5 rounded-xl bg-[#10131C] border border-[#343B50] text-xs text-[#A7B0C4] flex items-center gap-3">
                <Sparkles size={20} className="text-[#00E5FF] shrink-0" />
                <span>
                  As Melhorias Gerais afetam <strong className="text-white">todas as suas expedições</strong>. Seus efeitos permanecem ativos para sempre, mesmo após derrotas ou ao iniciar novas aventuras.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(GENERAL_UPGRADES).map((upgrade) => {
                  const currentLvl = generalUpgrades[upgrade.id] || 0;
                  const isMax = currentLvl >= upgrade.maxLevel;
                  const nextTier = !isMax ? upgrade.tiers[currentLvl] : null;
                  const canAfford = nextTier ? gold >= nextTier.cost : false;

                  return (
                    <div
                      key={upgrade.id}
                      className="p-5 rounded-2xl bg-[#10131C] border-2 border-[#343B50] flex flex-col justify-between transition-all hover:border-[#00E5FF]/50 shadow-md"
                    >
                      <div>
                        {/* Title and Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-black border"
                              style={{
                                backgroundColor: `${upgrade.color}20`,
                                color: upgrade.color,
                                borderColor: `${upgrade.color}66`,
                              }}
                            >
                              {upgrade.id === 'starterItem' && <Package size={20} />}
                              {upgrade.id === 'dropRate' && <Sparkles size={20} />}
                              {upgrade.id === 'goldBoost' && <Coins size={20} />}
                              {upgrade.id === 'globalHp' && <Heart size={20} />}
                            </div>
                            <div>
                              <h3 className="font-black text-sm text-[#F3F4F8]">{upgrade.name}</h3>
                              <p className="text-[11px] text-[#A7B0C4]">{upgrade.description}</p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                              isMax
                                ? 'bg-[#43C878]/20 text-[#43C878] border-[#43C878]/40'
                                : currentLvl > 0
                                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/40'
                                : 'bg-[#343B50]/40 text-[#71788E] border-[#343B50]'
                            }`}
                          >
                            {isMax ? 'NÍVEL MÁXIMO' : `Nível ${currentLvl} / ${upgrade.maxLevel}`}
                          </span>
                        </div>

                        {/* Progression bar */}
                        <div className="flex items-center gap-2 mb-4">
                          {upgrade.tiers.map((t, idx) => (
                            <div
                              key={t.level}
                              className={`flex-1 h-2 rounded-full transition-all ${
                                idx < currentLvl
                                  ? 'bg-gradient-to-r from-[#00E5FF] to-[#4C8DFF]'
                                  : 'bg-[#1B2030] border border-[#343B50]'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Current & Next Tier Effects */}
                        <div className="bg-[#141824] p-3 rounded-xl border border-[#343B50] space-y-2 mb-4 text-xs">
                          {currentLvl > 0 ? (
                            <div className="flex items-start gap-2">
                              <span className="text-[#43C878] font-bold shrink-0">Atual (Nv. {currentLvl}):</span>
                              <span className="text-[#F3F4F8]">
                                {upgrade.tiers[currentLvl - 1]?.description}
                              </span>
                            </div>
                          ) : (
                            <div className="text-[#71788E] italic">Nenhum nível adquirido ainda.</div>
                          )}

                          {!isMax && nextTier && (
                            <div className="flex items-start gap-2 pt-2 border-t border-[#343B50]">
                              <span className="text-[#00E5FF] font-bold shrink-0">Próximo (Nv. {nextTier.level}):</span>
                              <span className="text-[#A7B0C4]">{nextTier.description}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Buy Button */}
                      <div>
                        {isMax ? (
                          <div className="w-full py-2.5 rounded-xl bg-[#43C878]/10 border border-[#43C878]/30 text-[#43C878] font-bold text-xs text-center flex items-center justify-center gap-1.5">
                            <Check size={16} /> Aprimoramento Concluído (3/3)
                          </div>
                        ) : nextTier ? (
                          <button
                            type="button"
                            onClick={() => handleBuyGeneralUpgrade(upgrade.id, nextTier.cost)}
                            disabled={!canAfford}
                            className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                              canAfford
                                ? 'bg-gradient-to-r from-[#00E5FF] to-[#4C8DFF] text-[#10131C] hover:scale-[1.02] active:scale-98 shadow-md shadow-[#00E5FF]/25 cursor-pointer'
                                : 'bg-[#10131C] border border-[#343B50] text-[#71788E] cursor-not-allowed opacity-80'
                            }`}
                          >
                            <Coins size={15} />
                            <span>Aprimorar por {nextTier.cost.toLocaleString()} G</span>
                            {!canAfford && (
                              <span className="text-[10px] uppercase font-bold text-[#FF5252]">
                                (Faltam {(nextTier.cost - gold).toLocaleString()} G)
                              </span>
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 3: FORJA DO CATÁLOGO (+5% por nível) */}
          {/* ============================================================= */}
          {activeTab === 'forge' && (
            <div className="flex flex-col h-full space-y-4">
              {/* Info banner */}
              <div className="p-3.5 rounded-xl bg-[#10131C] border border-[#343B50] text-xs text-[#A7B0C4] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Hammer size={18} className="text-[#B58AFF] shrink-0" />
                  <span>
                    Aprimore permanentemente qualquer equipamento catalogado em até <strong className="text-white">3 vezes</strong> (+5% de atributos por nível).
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#B58AFF]/20 text-[#B58AFF] border border-[#B58AFF]/30 shrink-0">
                  {catalogDiscoveredItems.length} Itens Catalogados
                </span>
              </div>

              {/* Filter bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] text-xs">
                {/* Category buttons */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setForgeCategory('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      forgeCategory === 'all'
                        ? 'bg-[#B58AFF] text-[#10131C]'
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
                        onClick={() => setForgeCategory(cat)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          forgeCategory === cat
                            ? 'bg-[#B58AFF] text-[#10131C]'
                            : 'text-[#A7B0C4] hover:bg-[#1B2030]'
                        }`}
                      >
                        {CATEGORY_INFO[cat].label}
                      </button>
                    )
                  )}
                </div>

                {/* Rarity & Search */}
                <div className="flex items-center gap-2">
                  <select
                    value={forgeRarity}
                    onChange={(e) => setForgeRarity(e.target.value as any)}
                    className="bg-[#141824] text-[#F3F4F8] border border-[#343B50] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#B58AFF]"
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
                      value={forgeSearch}
                      onChange={(e) => setForgeSearch(e.target.value)}
                      placeholder="Buscar item..."
                      className="bg-[#141824] text-[#F3F4F8] placeholder-[#71788E] border border-[#343B50] rounded-lg pl-8 pr-3 py-1 text-xs focus:outline-none focus:border-[#B58AFF] w-36 sm:w-44"
                    />
                  </div>
                </div>
              </div>

              {/* Items Grid */}
              <div className="flex-1 overflow-y-auto max-h-[55vh] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-1">
                {filteredForgeItems.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-xs text-[#71788E]">
                    Nenhum item catalogado correspondente aos filtros. Encontre novos itens durante a expedição para forjá-los aqui!
                  </div>
                ) : (
                  filteredForgeItems.map((item) => {
                    const currentLvl = itemUpgrades[item.id] || 0;
                    const isMax = currentLvl >= MAX_ITEM_ENHANCEMENT_LEVEL;
                    const rInfo = RARITY_INFO[item.rarity];
                    const nextCost = getItemUpgradeCost(item.rarity, currentLvl);
                    const canAfford = nextCost !== null && gold >= nextCost;

                    const currentStats = getItemEffectiveStats(item.stats, currentLvl);
                    const nextStats = !isMax ? getItemEffectiveStats(item.stats, currentLvl + 1) : null;

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border-2 bg-[#10131C] flex flex-col justify-between transition-all hover:border-[#B58AFF]/60 shadow-md"
                        style={{
                          borderColor: currentLvl > 0 ? `${rInfo.color}88` : `${rInfo.color}44`,
                        }}
                      >
                        <div>
                          {/* Header of Item Card */}
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

                            {/* Stars level badge */}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3].map((starIdx) => (
                                <Star
                                  key={starIdx}
                                  size={13}
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

                          {/* Item Icon and Name */}
                          <div className="flex items-center gap-3 mb-2.5">
                            <ItemIcon
                              iconName={item.iconName}
                              category={item.category}
                              rarity={item.rarity}
                              color={item.color}
                              badge
                              badgeSize="md"
                            />
                            <div className="min-w-0 flex-1">
                              <h4
                                className="font-bold text-xs truncate"
                                style={{ color: rInfo.color }}
                              >
                                {item.name}
                              </h4>
                              <div className="text-[10px] text-[#A7B0C4]">{CATEGORY_INFO[item.category].label}</div>
                            </div>
                          </div>

                          {/* Stats Comparison */}
                          <div className="bg-[#141824] p-2 rounded-lg border border-[#343B50] mb-3 space-y-1 text-[10px]">
                            <div className="flex items-center justify-between text-[#A7B0C4] font-semibold border-b border-[#343B50]/60 pb-1">
                              <span>Atributos</span>
                              <span>{isMax ? 'Atributo Final (+15%)' : 'Atual ➔ Próximo (+5%)'}</span>
                            </div>

                            {(['hp', 'atk', 'mag', 'def', 'res'] as const).map((statKey) => {
                              const baseVal = item.stats[statKey];
                              if (baseVal === undefined) return null;
                              const curVal = currentStats[statKey] || 0;
                              const nxtVal = nextStats ? nextStats[statKey] || 0 : curVal;

                              return (
                                <div key={statKey} className="flex items-center justify-between">
                                  <span className="uppercase font-bold text-[#A7B0C4]">{statKey}:</span>
                                  <span className="font-bold flex items-center gap-1.5">
                                    <span className={currentLvl > 0 ? 'text-[#FFD700]' : 'text-white'}>
                                      +{curVal}
                                    </span>
                                    {!isMax && (
                                      <>
                                        <ArrowRight size={10} className="text-[#71788E]" />
                                        <span className="text-[#00E5FF]">+{nxtVal}</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Upgrade Button */}
                        <div>
                          {isMax ? (
                            <div className="w-full py-2 rounded-lg bg-[#43C878]/10 border border-[#43C878]/30 text-[#43C878] font-black text-[11px] text-center flex items-center justify-center gap-1">
                              <Check size={14} /> Forja Máxima (★★★)
                            </div>
                          ) : nextCost !== null ? (
                            <button
                              type="button"
                              onClick={() => handleBuyItemUpgrade(item.id, nextCost)}
                              disabled={!canAfford}
                              className={`w-full py-2 rounded-lg font-black text-xs flex items-center justify-center gap-2 transition-all ${
                                canAfford
                                  ? 'bg-gradient-to-r from-[#B58AFF] to-[#9B6BFF] text-[#10131C] hover:scale-[1.02] active:scale-98 shadow-md shadow-[#B58AFF]/20 cursor-pointer'
                                  : 'bg-[#141824] border border-[#343B50] text-[#71788E] cursor-not-allowed opacity-80'
                              }`}
                            >
                              <Coins size={14} />
                              <span>{nextCost.toLocaleString()} G</span>
                              <span className="text-[10px] font-bold">
                                {canAfford ? 'Forjar (+5%)' : 'Insuficiente'}
                              </span>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
