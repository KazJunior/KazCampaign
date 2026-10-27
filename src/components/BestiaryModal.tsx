import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Skull,
  Swords,
  Shield,
  Sparkles,
  Footprints,
  Crown,
  Flame,
  Zap,
  Hammer,
  Package,
  HardHat,
  Layers,
  Gem,
  Dice5,
  CheckCircle2,
  Target,
  Sun,
  Crosshair,
  Music,
} from 'lucide-react';
import { MONSTER_DEFINITIONS, STAGE_20_PLUS_BOSS_SKILL_POWERS } from '../data/monsters';
import type { MonsterDefinition } from '../data/monsters';
import { SKILLS } from '../data/skills';
import { getMonsterDropTable, RARITY_INFO, CATEGORY_INFO } from '../data/items';
import type { ItemCategory } from '../types/game';
import { getAoELabel } from '../utils/pathfinding';

interface BestiaryModalProps {
  discoveredMonsterIds: string[];
  discoveredItemIds?: string[];
  onClose: () => void;
}

export const BestiaryModal: React.FC<BestiaryModalProps> = ({
  discoveredMonsterIds,
  discoveredItemIds = [],
  onClose,
}) => {
  // Apenas os monstros já encontrados pelo jogador
  const discoveredMonsters = Object.values(MONSTER_DEFINITIONS).filter((m) =>
    discoveredMonsterIds.includes(m.typeId)
  );

  const [selectedMonster, setSelectedMonster] = useState<MonsterDefinition | null>(
    discoveredMonsters[0] || null
  );
  const [filter, setFilter] = useState<'all' | 'act1' | 'act2' | 'act3' | 'act4' | 'act5' | 'bosses'>('all');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const filteredMonsters = discoveredMonsters.filter((m) => {
    if (filter === 'act1') return m.act === 1;
    if (filter === 'act2') return m.act === 2;
    if (filter === 'act3') return m.act === 3;
    if (filter === 'act4') return m.act === 4;
    if (filter === 'act5') return m.act === 5;
    if (filter === 'bosses') return m.isBoss || m.isMiniBoss;
    return true;
  });

  const isBossMonster = Boolean(selectedMonster?.isBoss || selectedMonster?.isMiniBoss);
  const monsterDrops = selectedMonster
    ? getMonsterDropTable(selectedMonster.typeId, isBossMonster)
    : [];
  const discoveredItemSet = new Set(discoveredItemIds);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#1B2030] border-2 border-[#D4AD65]/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-4 border-b border-[#343B50] bg-gradient-to-r from-[#D4AD65]/20 via-[#1B2030] to-transparent">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#10131C] border border-[#D4AD65]/40 text-[#D4AD65] shrink-0">
              <BookOpen size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-sm sm:text-lg text-[#F3F4F8] flex items-center gap-1.5 truncate">
                <span>Bestiário do Abismo</span>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-[#10131C] text-[#D4AD65] border border-[#D4AD65]/40 shrink-0">
                  {discoveredMonsters.length} / {Object.keys(MONSTER_DEFINITIONS).length}
                </span>
              </h2>
              <p className="text-[10px] sm:text-xs text-[#A7B0C4] truncate hidden sm:block">
                Catálogo de criaturas e abominações já enfrentadas durante suas aventuras.
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

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 bg-[#141824] border-b border-[#343B50] text-xs overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
              filter === 'all'
                ? 'bg-[#D4AD65] text-[#10131C] shadow font-black'
                : 'text-[#A7B0C4] hover:bg-[#1B2030]'
            }`}
          >
            Todos ({discoveredMonsters.length})
          </button>
          <button
            onClick={() => setFilter('act1')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
              filter === 'act1'
                ? 'bg-[#D4AD65] text-[#10131C] shadow font-black'
                : 'text-[#A7B0C4] hover:bg-[#1B2030]'
            }`}
          >
            Ato I ({discoveredMonsters.filter((m) => m.act === 1).length})
          </button>
          <button
            onClick={() => setFilter('act2')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
              filter === 'act2'
                ? 'bg-[#D4AD65] text-[#10131C] shadow font-black'
                : 'text-[#A7B0C4] hover:bg-[#1B2030]'
            }`}
          >
            Ato II ({discoveredMonsters.filter((m) => m.act === 2).length})
          </button>
          <button
            onClick={() => setFilter('act3')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
              filter === 'act3'
                ? 'bg-[#D4AD65] text-[#10131C] shadow font-black'
                : 'text-[#A7B0C4] hover:bg-[#1B2030]'
            }`}
          >
            Ato III ({discoveredMonsters.filter((m) => m.act === 3).length})
          </button>
          <button
            onClick={() => setFilter('act4')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
              filter === 'act4'
                ? 'bg-[#D4AD65] text-[#10131C] shadow font-black'
                : 'text-[#A7B0C4] hover:bg-[#1B2030]'
            }`}
          >
            Ato IV ({discoveredMonsters.filter((m) => m.act === 4).length})
          </button>
          <button
            onClick={() => setFilter('act5')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
              filter === 'act5'
                ? 'bg-[#D4AD65] text-[#10131C] shadow font-black'
                : 'text-[#A7B0C4] hover:bg-[#1B2030]'
            }`}
          >
            Ato V ({discoveredMonsters.filter((m) => m.act === 5).length})
          </button>
          <button
            onClick={() => setFilter('bosses')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
              filter === 'bosses'
                ? 'bg-[#D4AD65] text-[#10131C] shadow font-black'
                : 'text-[#A7B0C4] hover:bg-[#1B2030]'
            }`}
          >
            Chefes ({discoveredMonsters.filter((m) => m.isBoss || m.isMiniBoss).length})
          </button>
        </div>

        {/* Content Body */}
        {discoveredMonsters.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center text-[#A7B0C4]">
            <Skull size={40} className="text-[#343B50] mb-3" />
            <h3 className="font-bold text-sm sm:text-base text-[#F3F4F8]">Nenhum monstro descoberto ainda</h3>
            <p className="text-xs text-[#A7B0C4] max-w-sm mt-1">
              Inicie uma nova aventura! Conforme você enfrentar monstros e chefes pelas 50 fases, seus registros e habilidades serão catalogados aqui.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Monster List */}
            <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-[#343B50] bg-[#141824] overflow-x-auto md:overflow-y-auto no-scrollbar p-2.5 sm:p-3 flex md:flex-col gap-2 shrink-0 max-h-44 md:max-h-none">
              {filteredMonsters.map((monster) => {
                const isSelected = selectedMonster?.typeId === monster.typeId;
                return (
                  <button
                    key={monster.typeId}
                    onClick={() => setSelectedMonster(monster)}
                    className={`w-auto md:w-full shrink-0 p-2 sm:p-2.5 rounded-xl border flex items-center gap-2.5 sm:gap-3 text-left transition-all ${
                      isSelected
                        ? 'bg-[#D4AD65]/20 border-[#D4AD65] text-white shadow-md'
                        : 'bg-[#1B2030] border-[#343B50] hover:border-[#D4AD65]/50 text-[#F3F4F8]'
                    }`}
                  >
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow shrink-0 border border-white/20"
                      style={{ backgroundColor: monster.color }}
                    >
                      {getAvatarIcon(monster.avatarKey, 20)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs truncate">{monster.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {monster.isBoss ? (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            BOSS
                          </span>
                        ) : monster.isMiniBoss ? (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            MINI BOSS
                          </span>
                        ) : null}
                        {monster.role && (
                          <span
                            className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${
                              monster.role === 'support'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : monster.role === 'tank'
                                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {monster.role === 'support' ? '🌿 Suporte' : monster.role === 'tank' ? '🛡️ Tanque' : '⚔️ Atacante'}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Monster Sheet */}
            {selectedMonster && (
              <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#1B2030]">
                {/* Header Profile */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#10131C] border border-[#343B50]">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0 relative"
                    style={{ backgroundColor: selectedMonster.color }}
                  >
                    {getAvatarIcon(selectedMonster.avatarKey, 40)}
                    {selectedMonster.isBoss && (
                      <Crown size={18} className="absolute -top-2 -right-2 text-[#D4AD65] drop-shadow" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-lg text-[#F3F4F8]">{selectedMonster.name}</h3>
                      <div className="flex items-center gap-1.5">
                        {selectedMonster.role && (
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                              selectedMonster.role === 'support'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : selectedMonster.role === 'tank'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {selectedMonster.role === 'support' ? '🌿 Suporte' : selectedMonster.role === 'tank' ? '🛡️ Tanque' : '⚔️ Atacante'}
                          </span>
                        )}
                        {selectedMonster.isBoss ? (
                          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-500/25 text-purple-300 border border-purple-500/50 flex items-center gap-1">
                            <Crown size={12} /> CHEFE
                          </span>
                        ) : selectedMonster.isMiniBoss ? (
                          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/50">
                            MINI BOSS
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-xs text-[#A7B0C4] mt-1.5 leading-relaxed">
                      {selectedMonster.description}
                    </p>
                  </div>
                </div>

                {/* Base Attributes Grid */}
                <div>
                  <h4 className="text-xs font-bold text-[#D4AD65] uppercase tracking-wider mb-2">
                    Atributos Básicos
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                    <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] text-center">
                      <div className="text-[10px] text-[#A7B0C4]">HP Base</div>
                      <div className="font-black text-[#56E59A] text-sm mt-0.5">{selectedMonster.maxHp}</div>
                    </div>
                    <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] text-center">
                      <div className="text-[10px] text-[#A7B0C4]">Ataque</div>
                      <div className="font-black text-[#FF5252] text-sm mt-0.5">{selectedMonster.atk}</div>
                    </div>
                    <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] text-center">
                      <div className="text-[10px] text-[#A7B0C4]">Magia</div>
                      <div className="font-black text-[#B58AFF] text-sm mt-0.5">{selectedMonster.mag}</div>
                    </div>
                    <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] text-center">
                      <div className="text-[10px] text-[#A7B0C4]">Defesa</div>
                      <div className="font-black text-[#43C878] text-sm mt-0.5">{selectedMonster.def}</div>
                    </div>
                    <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] text-center">
                      <div className="text-[10px] text-[#A7B0C4]">Resistência</div>
                      <div className="font-black text-[#F0B44D] text-sm mt-0.5">{selectedMonster.res}</div>
                    </div>
                    <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] text-center">
                      <div className="text-[10px] text-[#A7B0C4]">Mov / Alcance</div>
                      <div className="font-black text-[#4C8DFF] text-sm mt-0.5">
                        {selectedMonster.mov} / {selectedMonster.range}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                <div>
                  <h4 className="text-xs font-bold text-[#D4AD65] uppercase tracking-wider mb-2">
                    Habilidades Catalogadas ({selectedMonster.skillIds.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedMonster.skillIds.map((sId) => {
                      const skill = SKILLS[sId];
                      if (!skill) return null;

                      const bossPower = STAGE_20_PLUS_BOSS_SKILL_POWERS[selectedMonster.typeId]?.[sId];
                      const effectivePower = bossPower ?? skill.power;
                      const effectiveDesc = bossPower
                        ? skill.description.replace(/\d+%/g, `${Math.round(bossPower * 100)}%`)
                        : skill.description;

                      let typeColor = 'bg-[#4C8DFF]/20 text-[#4C8DFF] border-[#4C8DFF]/30';
                      if (skill.damageType === 'magical') typeColor = 'bg-[#B58AFF]/20 text-[#B58AFF] border-[#B58AFF]/30';
                      else if (skill.damageType === 'healing') typeColor = 'bg-[#56E59A]/20 text-[#56E59A] border-[#56E59A]/30';

                      return (
                        <div
                          key={sId}
                          className="p-3 rounded-xl bg-[#10131C] border border-[#343B50] flex flex-col justify-between gap-1.5"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-[#F3F4F8]">{skill.name}</span>
                              <div className="flex items-center gap-1.5">
                                {effectivePower > 0 && (
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#FF5252]/20 text-[#FF5252] border border-[#FF5252]/30">
                                    x{effectivePower} ({Math.round(effectivePower * 100)}%)
                                  </span>
                                )}
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${typeColor}`}>
                                  {skill.damageType.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <p className="text-[11px] text-[#A7B0C4] mt-1 leading-snug">
                              {effectiveDesc}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[9px] text-[#A7B0C4]">
                            <span className="px-1.5 py-0.5 rounded bg-[#1B2030] border border-[#343B50]">
                              Alcance: {skill.rangeMin}-{skill.rangeMax}
                            </span>
                            {skill.aoeRadius > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-[#FF9800]/20 text-[#FF9800] border border-[#FF9800]/40 font-bold">
                                💥 {getAoELabel(skill)}
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded bg-[#1B2030] border border-[#343B50]">
                              Recarga: {skill.cooldownMax}T
                            </span>
                            {skill.statusEffect && (
                              <span className="text-[#F0B44D] font-semibold">
                                Efeito: {skill.statusEffect.type === 'burn' ? '🔥 Queimadura (-2%)' : skill.statusEffect.type === 'poison' ? '☠️ Veneno (-2%)' : skill.statusEffect.type === 'stun' ? '⚡ Atordoamento' : skill.statusEffect.type === 'slow' ? '👣 Lentidão' : skill.statusEffect.type === 'shield' ? '🛡️ Escudo' : skill.statusEffect.type === 'buff_atk' ? '⚔️ Fúria' : skill.statusEffect.type === 'debuff_atk' ? `⚔️ Debuff Dano (-${skill.statusEffect.value}%)` : skill.statusEffect.type} ({skill.statusEffect.duration}T)
                              </span>
                            )}
                            {skill.secondaryStatusEffect && (
                              <span className="text-[#38BDF8] font-semibold">
                                Secundário: {skill.secondaryStatusEffect.type === 'burn' ? '🔥 Queimadura (-2%)' : skill.secondaryStatusEffect.type === 'poison' ? '☠️ Veneno (-2%)' : skill.secondaryStatusEffect.type === 'stun' ? '⚡ Atordoamento' : skill.secondaryStatusEffect.type === 'slow' ? '👣 Lentidão' : skill.secondaryStatusEffect.type === 'debuff_def' ? '🛡️ Quebra de Defesa' : skill.secondaryStatusEffect.type === 'debuff_atk' ? `⚔️ Debuff Dano (-${skill.secondaryStatusEffect.value}%)` : skill.secondaryStatusEffect.type} ({skill.secondaryStatusEffect.duration}T)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Item Drops Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-[#D4AD65] uppercase tracking-wider flex items-center gap-1.5">
                      <Package size={14} /> Possíveis Drops de Itens ({monsterDrops.length})
                    </h4>
                    <span className="text-[10px] text-[#A7B0C4] flex items-center gap-1">
                      <Dice5 size={12} className="text-[#D4AD65]" /> Chance de drop ponderada
                    </span>
                  </div>

                  {monsterDrops.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[#10131C] border border-[#343B50] text-center text-xs text-[#A7B0C4]">
                      Nenhum item catalogado para este monstro.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {monsterDrops.map(({ item, chancePercent }) => {
                        const rarity = RARITY_INFO[item.rarity];
                        const category = CATEGORY_INFO[item.category];
                        const isDiscovered = discoveredItemSet.has(item.id);

                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-all relative overflow-hidden ${rarity.bg} ${rarity.border} hover:border-[#D4AD65]/50 group`}
                          >
                            {/* Header: Categoria e Badge de Chance em % */}
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#10131C]/80 text-[#A7B0C4] border border-[#343B50] flex items-center gap-1">
                                {getCategoryIcon(item.category, 10)}
                                {category.label}
                              </span>

                              <div className="flex items-center gap-1">
                                {isDiscovered && (
                                  <span
                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5"
                                    title="Item já descoberto no Catálogo de Itens"
                                  >
                                    <CheckCircle2 size={10} /> Coletado
                                  </span>
                                )}
                                <span
                                  className="text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1"
                                  style={{
                                    backgroundColor: `${rarity.color}25`,
                                    color: rarity.color,
                                    border: `1px solid ${rarity.color}60`,
                                  }}
                                >
                                  <Dice5 size={10} />
                                  {chancePercent}%
                                </span>
                              </div>
                            </div>

                            {/* Informações do Item */}
                            <div>
                              <h5 className="font-bold text-xs text-[#F3F4F8] leading-tight flex items-center gap-1">
                                {item.name}
                              </h5>
                              <span
                                className="text-[9px] font-black uppercase tracking-wider mt-0.5 inline-block"
                                style={{ color: rarity.color }}
                              >
                                {rarity.label}
                              </span>
                              <p className="text-[10px] text-[#A7B0C4] mt-1 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            {/* Atributos do Item */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-white/5 text-[10px]">
                              {item.stats.hp && <span className="text-[#56E59A] font-bold">+{item.stats.hp} HP</span>}
                              {item.stats.atk && <span className="text-[#FF5252] font-bold">+{item.stats.atk} ATK</span>}
                              {item.stats.mag && <span className="text-[#B58AFF] font-bold">+{item.stats.mag} MAG</span>}
                              {item.stats.def && <span className="text-[#43C878] font-bold">+{item.stats.def} DEF</span>}
                              {item.stats.res && <span className="text-[#F0B44D] font-bold">+{item.stats.res} RES</span>}
                              {item.stats.mov && <span className="text-[#4C8DFF] font-bold">+{item.stats.mov} MOV</span>}
                              {item.stats.range && <span className="text-[#FFB300] font-bold">+{item.stats.range} ALC</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function getCategoryIcon(category: ItemCategory, size = 12) {
  switch (category) {
    case 'helmet':
      return <HardHat size={size} />;
    case 'chestplate':
      return <Shield size={size} />;
    case 'leggings':
      return <Layers size={size} />;
    case 'boots':
      return <Footprints size={size} />;
    case 'weapon':
      return <Swords size={size} />;
    case 'accessory':
      return <Gem size={size} />;
    default:
      return <Package size={size} />;
  }
}

function getAvatarIcon(key: string, size = 20) {
  switch (key) {
    case 'goblin':
    case 'abyssal_tentacle':
      return <Zap size={size} />;
    case 'orc':
    case 'cursed_blacksmith':
    case 'berserker_warrior':
    case 'war_bear':
      return <Hammer size={size} />;
    case 'spider':
    case 'mimic':
    case 'devourer_boss':
    case 'ash_specter':
    case 'lava_worm':
    case 'miasma_aberration':
    case 'living_nightmare':
    case 'doom_inquisitor':
      return <Skull size={size} />;
    case 'dark_mage':
    case 'volcanic_drake':
    case 'pyromancer':
    case 'ember_elemental':
    case 'cataclysm_avatar':
      return <Flame size={size} />;
    case 'spectral_wolf':
    case 'hell_hound':
    case 'thunder_wolf':
    case 'magma_lizard':
    case 'void_crawler':
      return <Footprints size={size} />;
    case 'basalt_golem':
    case 'steam_golem':
    case 'rune_construct':
    case 'iron_gargoyle':
    case 'megalith_guardian':
    case 'void_blob':
    case 'obsidian_colossus':
    case 'chaos_praetorian':
      return <Shield size={size} />;
    case 'thorn_witch':
    case 'storm_shaman':
    case 'cosmic_parasite':
    case 'glyph_weaver':
    case 'fate_scribe':
      return <Sparkles size={size} />;
    case 'fallen_knight':
    case 'rune_blade':
    case 'astral_stalker':
    case 'black_sun_templar':
    case 'twilight_reaper':
    case 'celestial_slayer':
      return <Swords size={size} />;
    case 'kobold_gunner':
    case 'steppe_hunter':
      return <Target size={size} />;
    case 'eclipse_herald':
    case 'madness_eye':
      return <Sun size={size} />;
    case 'dark_valkyrie':
    case 'fallen_seraph':
      return <Crosshair size={size} />;
    case 'abyssal_siren':
      return <Music size={size} />;
    case 'astaroth_boss':
    case 'malakor_final_boss':
      return <Crown size={size} />;
    case 'spectral_harbinger_boss':
    case 'void_leviathan_boss':
      return <Skull size={size} />;
    case 'forge_titan_boss':
      return <Flame size={size} />;
    case 'rune_master_boss':
      return <Sparkles size={size} />;
    case 'valgar_butcher_boss':
      return <Hammer size={size} />;
    case 'venom_chimera_boss':
      return <Zap size={size} />;
    case 'quimera_leao':
      return <Flame size={size} />;
    case 'quimera_serpente':
      return <Zap size={size} />;
    case 'quimera_cabra':
      return <Shield size={size} />;
    case 'eclipse_knight_boss':
      return <Sun size={size} />;
    default:
      return <Skull size={size} />;
  }
}
