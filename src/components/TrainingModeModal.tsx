import React, { useState, useMemo } from 'react';
import {
  X,
  Target,
  Swords,
  Sparkles,
  Zap,
  Search,
  Check,
  Crosshair,
  Dumbbell,
  Play,
} from 'lucide-react';
import { CLASS_DEFINITIONS } from '../data/units';
import { SKILLS } from '../data/skills';
import { soundManager } from '../utils/audio';

export interface TrainingModeConfig {
  partyClasses: string[];
  heroLevel: number;
  dummySetup: 'single' | 'trio' | 'aoe';
}

interface TrainingModeModalProps {
  onStartTraining: (config: TrainingModeConfig) => void;
  onClose: () => void;
}

export const TrainingModeModal: React.FC<TrainingModeModalProps> = ({
  onStartTraining,
  onClose,
}) => {
  // All non-secret classes (explicitly exclude any secret classes like carrasco_vazio)
  const availableClasses = useMemo(() => {
    return Object.entries(CLASS_DEFINITIONS)
      .filter(([_, def]) => !def.isSecret)
      .map(([key, def]) => ({ key, ...def }));
  }, []);

  const [selectedClasses, setSelectedClasses] = useState<string[]>(['guerreiro', 'arqueiro', 'mago', 'curandeiro']);
  const [heroLevel, setHeroLevel] = useState<number>(10);
  const [dummySetup, setDummySetup] = useState<'single' | 'trio' | 'aoe'>('single');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'tank' | 'melee' | 'ranged' | 'magic' | 'support'>('all');

  const filteredClasses = useMemo(() => {
    return availableClasses.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (roleFilter === 'all') return true;
      if (roleFilter === 'tank') return c.role.toLowerCase().includes('tanque') || c.role.toLowerCase().includes('controle');
      if (roleFilter === 'melee') return c.range === 1 && !c.role.toLowerCase().includes('suporte');
      if (roleFilter === 'ranged') return c.range > 1 && c.atk >= c.mag;
      if (roleFilter === 'magic') return c.mag > c.atk;
      if (roleFilter === 'support') return c.role.toLowerCase().includes('suporte') || c.role.toLowerCase().includes('cura') || c.role.toLowerCase().includes('bardo');
      return true;
    });
  }, [availableClasses, searchQuery, roleFilter]);

  const handleToggleClass = (key: string) => {
    soundManager.playSelect();
    setSelectedClasses((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      if (prev.length >= 4) {
        // Replace the last one or do nothing
        return [...prev.slice(0, 3), key];
      }
      return [...prev, key];
    });
  };

  const handleStart = () => {
    if (selectedClasses.length === 0) return;
    soundManager.playUpgrade();
    onStartTraining({
      partyClasses: selectedClasses,
      heroLevel,
      dummySetup,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none font-sans overflow-hidden">
      <div className="bg-[#121622] border-2 border-[#D4AD65] rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl text-[#F3F4F8] relative overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AD65] to-transparent" />

        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#2B3245] flex items-center justify-between bg-[#171D2E]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AD65]/15 border border-[#D4AD65]/40 flex items-center justify-center text-[#D4AD65] shadow-inner">
              <Crosshair size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
                  Campo de Treinamento
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  Todas as Classes Liberadas
                </span>
              </div>
              <p className="text-xs text-[#A7B0C4]">
                Teste livremente as 17 classes da campanha em bonecos de treino estáticos sem afetar seu progresso.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playSelect();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-[#232B3E] hover:bg-[#2F3952] text-[#A7B0C4] hover:text-white flex items-center justify-center transition-colors border border-[#343F5B]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 no-scrollbar">
          {/* Selected Party Summary Bar */}
          <div className="bg-[#171D2E] border border-[#2B3245] rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#D4AD65] flex items-center gap-1.5">
                <Swords size={14} /> Equipe de Treino ({selectedClasses.length}/4 Heróis)
              </span>
              <span className="text-[11px] text-[#A7B0C4]">
                Clique nas classes abaixo para adicionar ou remover
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[0, 1, 2, 3].map((slotIdx) => {
                const cKey = selectedClasses[slotIdx];
                const def = cKey ? CLASS_DEFINITIONS[cKey] : null;

                if (!def) {
                  return (
                    <div
                      key={slotIdx}
                      className="border border-dashed border-[#343F5B] rounded-xl p-3 flex flex-col items-center justify-center text-center bg-[#101420]/60 min-h-[72px]"
                    >
                      <span className="text-xs text-[#6B7280] font-bold">Vazio (Slot {slotIdx + 1})</span>
                      <span className="text-[10px] text-[#4B5563]">Selecione uma classe</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={slotIdx}
                    className="border border-[#D4AD65]/50 rounded-xl p-2.5 bg-gradient-to-br from-[#1C2337] to-[#121622] flex items-center justify-between gap-2 shadow-md relative group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: def.color }}
                      >
                        {def.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white truncate">{def.name}</div>
                        <div className="text-[10px] text-[#D4AD65] truncate font-medium">{def.role.split('&')[0]}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleClass(cKey)}
                      className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 flex items-center justify-center text-xs shrink-0 transition-colors"
                      title="Remover da equipe"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Training Configuration: Preset Level + Dummy Scenario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Level Preset */}
            <div className="bg-[#171D2E] border border-[#2B3245] rounded-2xl p-3.5 space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Zap size={14} className="text-[#F0B44D]" /> Nível dos Heróis no Treino
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { lvl: 1, label: 'Nível 1', desc: 'Básico (1 Skill)' },
                  { lvl: 5, label: 'Nível 5', desc: 'Interm. (3 Skills)' },
                  { lvl: 10, label: 'Nível 10', desc: 'Kit Total (5 Skills)', recommended: true },
                  { lvl: 20, label: 'Nível 20', desc: 'Supremo (Max Stats)' },
                ].map((item) => (
                  <button
                    key={item.lvl}
                    type="button"
                    onClick={() => {
                      soundManager.playSelect();
                      setHeroLevel(item.lvl);
                    }}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      heroLevel === item.lvl
                        ? 'bg-[#F0B44D]/20 border-[#F0B44D] text-white shadow-md'
                        : 'bg-[#101420] border-[#2B3245] text-[#A7B0C4] hover:border-[#3D4760]'
                    }`}
                  >
                    <div className="text-xs font-black">{item.label}</div>
                    <div className="text-[10px] text-[#A7B0C4] line-clamp-1">{item.desc}</div>
                    {item.recommended && (
                      <span className="text-[8px] font-black uppercase text-[#10B981] block mt-0.5">
                        Recomendado
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Dummy Scenario */}
            <div className="bg-[#171D2E] border border-[#2B3245] rounded-2xl p-3.5 space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Target size={14} className="text-[#38BDF8]" /> Formação dos Bonecos
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'single' as const,
                    title: 'Alvo Único',
                    sub: '1 Colosso (50k HP)',
                    tip: 'Ideal para rotações & DPS',
                  },
                  {
                    id: 'trio' as const,
                    title: 'Trio Tático',
                    sub: 'Normal, Físico & Mag',
                    tip: 'Testar DEF e RES',
                  },
                  {
                    id: 'aoe' as const,
                    title: 'Batalhão AoE',
                    sub: '5 Bonecos Agrupados',
                    tip: 'Testar magias em área',
                  },
                ].map((scen) => (
                  <button
                    key={scen.id}
                    type="button"
                    onClick={() => {
                      soundManager.playSelect();
                      setDummySetup(scen.id);
                    }}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      dummySetup === scen.id
                        ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-white shadow-md'
                        : 'bg-[#101420] border-[#2B3245] text-[#A7B0C4] hover:border-[#3D4760]'
                    }`}
                  >
                    <div className="text-xs font-black">{scen.title}</div>
                    <div className="text-[10px] text-[#38BDF8] font-bold line-clamp-1">{scen.sub}</div>
                    <div className="text-[9px] text-[#A7B0C4] line-clamp-1 mt-0.5">{scen.tip}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Class Browser Header: Search & Filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Todas as Classes ({availableClasses.length})
                </span>
                <span className="text-[10px] text-[#A7B0C4]">
                  (Classe Oculta oculta como solicitado)
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar classe ou habilidade..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#101420] border border-[#2B3245] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#D4AD65]"
                />
              </div>
            </div>

            {/* Role Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'tank', label: 'Tanques' },
                { id: 'melee', label: 'Corpo a Corpo' },
                { id: 'ranged', label: 'Longo Alcance' },
                { id: 'magic', label: 'Mágicos' },
                { id: 'support', label: 'Suporte / Cura' },
              ].map((rf) => (
                <button
                  key={rf.id}
                  onClick={() => setRoleFilter(rf.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    roleFilter === rf.id
                      ? 'bg-[#D4AD65] text-[#10131C]'
                      : 'bg-[#171D2E] text-[#A7B0C4] hover:text-white border border-[#2B3245]'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[38vh] overflow-y-auto pr-1 no-scrollbar">
              {filteredClasses.map((c) => {
                const isSelected = selectedClasses.includes(c.key);
                const slotIndex = selectedClasses.indexOf(c.key);
                const baseSkill = SKILLS[c.baseSkillId];

                return (
                  <div
                    key={c.key}
                    onClick={() => handleToggleClass(c.key)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#1E263D] to-[#141A29] border-[#D4AD65] shadow-lg shadow-[#D4AD65]/10 scale-[1.01]'
                        : 'bg-[#151A27]/90 border-[#2B3245] hover:border-[#3D4760] hover:bg-[#1A2030]'
                    }`}
                  >
                    <div>
                      {/* Class Header */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm shrink-0"
                            style={{ backgroundColor: c.color }}
                          >
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-black text-white flex items-center gap-1.5">
                              <span>{c.name}</span>
                              {isSelected && (
                                <span className="bg-[#D4AD65] text-black text-[9px] font-black px-1.5 py-0.2 rounded-full">
                                  #{slotIndex + 1}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#A7B0C4] line-clamp-1">{c.role}</div>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs transition-colors shrink-0 ${
                            isSelected
                              ? 'bg-[#D4AD65] border-[#D4AD65] text-[#10131C]'
                              : 'border-[#3D4760] bg-[#101420]'
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>

                      {/* Stat summary pills */}
                      <div className="grid grid-cols-4 gap-1 text-[10px] bg-[#101420]/80 p-1.5 rounded-xl border border-[#22293E] mb-2 text-center font-bold">
                        <div>
                          <span className="text-[#FF7A7A]">HP </span>
                          <span className="text-white">{c.maxHp}</span>
                        </div>
                        <div>
                          <span className="text-[#F0B44D]">ATK </span>
                          <span className="text-white">{c.atk}</span>
                        </div>
                        <div>
                          <span className="text-[#38BDF8]">MAG </span>
                          <span className="text-white">{c.mag}</span>
                        </div>
                        <div>
                          <span className="text-[#43C878]">MOV </span>
                          <span className="text-white">{c.mov}</span>
                        </div>
                      </div>

                      {/* Base Skill Preview */}
                      {baseSkill && (
                        <div className="text-[11px] bg-[#101420]/50 p-2 rounded-xl border border-[#22293E] space-y-0.5">
                          <div className="text-[10px] font-black text-[#D4AD65] flex items-center gap-1">
                            <Sparkles size={11} /> {baseSkill.name} (Básica)
                          </div>
                          <p className="text-[10px] text-[#A7B0C4] line-clamp-2 leading-relaxed">
                            {baseSkill.description}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-[9px] text-[#64748B] text-right font-medium">
                      Alcance: {c.range} casa{c.range > 1 ? 's' : ''} | Def: {c.def} | Res: {c.res}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#2B3245] bg-[#171D2E]/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#A7B0C4]">
            <Dumbbell size={16} className="text-[#D4AD65]" />
            <span>
              {selectedClasses.length === 0
                ? 'Selecione ao menos 1 classe para praticar'
                : `Pronto para testar com ${selectedClasses.length} herói(s) no Nível ${heroLevel}`}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                soundManager.playSelect();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl border border-[#343F5B] text-[#A7B0C4] hover:text-white hover:bg-[#232B3E] font-bold text-xs transition-colors w-full sm:w-auto"
            >
              Cancelar
            </button>

            <button
              onClick={handleStart}
              disabled={selectedClasses.length === 0}
              className={`px-6 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg w-full sm:w-auto cursor-pointer ${
                selectedClasses.length > 0
                  ? 'bg-gradient-to-r from-[#D4AD65] via-[#E5C27E] to-[#D4AD65] text-[#10131C] hover:scale-105 active:scale-95 shadow-[#D4AD65]/20'
                  : 'bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600'
              }`}
            >
              <Play size={15} fill="currentColor" />
              <span>Iniciar Treinamento</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
