import React, { useState, useEffect } from 'react';
import type { PetDefinition, PetEgg, PetRarity, PlayerProgress } from '../types/game';
import {
  PETS,
  PET_RARITY_CONFIG,
  INSTANT_HATCH_COST,
  MAX_EGGS_LIMIT,
  getPetById,
  getPetsByRarity,
  rollPetFromEgg,
  getDuplicateGoldReward,
  getHatchDuration,
} from '../data/pets';
import { PetIcon, EggDisplay } from './PetIcon';
import { PetHatchModal } from './PetHatchModal';
import {
  X,
  Sparkles,
  Egg,
  BookOpen,
  Check,
  Coins,
  Shield,
  Zap,
  Clock,
  Trash2,
  AlertTriangle,
  Lock,
  ChevronRight,
  Search,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PetModalProps {
  progress: PlayerProgress;
  onUpdateProgress: (newProgress: PlayerProgress) => void;
  onClose: () => void;
  initialTab?: 'pets' | 'eggs' | 'almanac';
}

export const PetModal: React.FC<PetModalProps> = ({
  progress,
  onUpdateProgress,
  onClose,
  initialTab = 'pets',
}) => {
  const [activeTab, setActiveTab] = useState<'pets' | 'eggs' | 'almanac'>(initialTab);
  const [almanacFilter, setAlmanacFilter] = useState<string>('all');
  const [almanacSearch, setAlmanacSearch] = useState<string>('');
  const [deleteConfirmEggId, setDeleteConfirmEggId] = useState<string | null>(null);

  // Hatched pet animation state
  const [hatchedPetResult, setHatchedPetResult] = useState<{
    pet: PetDefinition;
    isDuplicate: boolean;
    duplicateGold: number;
  } | null>(null);

  // Live timer tick for eggs
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const eggs = progress.eggs || [];
  const unlockedPetIds = progress.unlockedPetIds || [];
  const equippedPet = getPetById(progress.equippedPetId);

  // Start incubation for an egg
  const handleStartIncubation = (eggId: string) => {
    soundManager.playSelect();
    const updatedEggs = eggs.map((egg) => {
      if (egg.id === eggId) {
        return {
          ...egg,
          incubatingStartedAt: Date.now(),
        };
      }
      return egg;
    });

    const newProgress: PlayerProgress = {
      ...progress,
      eggs: updatedEggs,
    };
    onUpdateProgress(newProgress);
  };

  // Hatch an egg (either because 5h passed or paid 10,000 gold)
  const handleHatchEgg = (eggId: string, isInstant: boolean) => {
    const egg = eggs.find((e) => e.id === eggId);
    if (!egg) return;

    if (isInstant) {
      if (progress.gold < INSTANT_HATCH_COST) {
        soundManager.playError();
        return;
      }
    }

    soundManager.playUpgrade();

    // Roll pet of egg rarity
    const pet = rollPetFromEgg(egg.rarity);
    const isDuplicate = unlockedPetIds.includes(pet.id);
    const duplicateGold = isDuplicate ? getDuplicateGoldReward(pet.rarity) : 0;

    let updatedGold = isInstant ? progress.gold - INSTANT_HATCH_COST : progress.gold;
    if (isDuplicate) {
      updatedGold += duplicateGold;
    }

    const updatedUnlocked = isDuplicate ? unlockedPetIds : [...unlockedPetIds, pet.id];
    const updatedEggs = eggs.filter((e) => e.id !== eggId);

    const newProgress: PlayerProgress = {
      ...progress,
      gold: updatedGold,
      unlockedPetIds: updatedUnlocked,
      eggs: updatedEggs,
    };
    onUpdateProgress(newProgress);

    setHatchedPetResult({
      pet,
      isDuplicate,
      duplicateGold,
    });
  };

  // Delete an egg
  const handleDeleteEgg = (eggId: string) => {
    soundManager.playStep();
    const updatedEggs = eggs.filter((e) => e.id !== eggId);
    const newProgress: PlayerProgress = {
      ...progress,
      eggs: updatedEggs,
    };
    onUpdateProgress(newProgress);
    setDeleteConfirmEggId(null);
  };

  // Equip pet
  const handleEquipPet = (petId: string | null) => {
    soundManager.playUpgrade();
    const newProgress: PlayerProgress = {
      ...progress,
      equippedPetId: petId,
    };
    onUpdateProgress(newProgress);
  };

  // Format countdown remaining
  const getRemainingTime = (egg: PetEgg) => {
    if (!egg.incubatingStartedAt) return null;
    const totalDuration = egg.hatchDurationMs || getHatchDuration(egg.rarity);
    const elapsed = Date.now() - egg.incubatingStartedAt;
    const remaining = Math.max(0, totalDuration - elapsed);
    if (remaining <= 0) return { isReady: true, text: 'Pronto para Chocar!', progressPercent: 100 };

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const pad = (n: number) => String(n).padStart(2, '0');

    return {
      isReady: false,
      text: `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`,
      progressPercent,
    };
  };

  // Filtered almanac pets
  const filteredAlmanacPets = PETS.filter((p) => {
    if (almanacFilter === 'collected') {
      if (!unlockedPetIds.includes(p.id)) return false;
    } else if (almanacFilter === 'uncollected') {
      if (unlockedPetIds.includes(p.id)) return false;
    } else if (almanacFilter !== 'all' && p.rarity !== almanacFilter) {
      return false;
    }

    if (almanacSearch.trim()) {
      const q = almanacSearch.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSpecies = p.species.toLowerCase().includes(q);
      return matchName || matchSpecies;
    }

    return true;
  });

  const readyEggsCount = eggs.filter((e) => {
    const time = getRemainingTime(e);
    return time?.isReady;
  }).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-sans">
      <div className="relative max-w-5xl w-full h-[92vh] max-h-[820px] bg-[#161A26] border border-[#343B50] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#F3F4F8]">
        {/* Top Header */}
        <header className="p-4 sm:p-5 border-b border-[#343B50] bg-[#10131C] flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#F3F4F8] tracking-tight">
                  Santuário dos Pets
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  NOVO
                </span>
              </div>
              <p className="text-xs text-[#A7B0C4]">
                Choque ovos, desbloqueie companheiros e equipe efeitos passivos e habilidades em combate.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Player Gold */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1B2030] border border-[#343B50] text-[#F0B44D] text-xs font-black shadow-inner">
              <Coins size={16} />
              <span>{progress.gold.toLocaleString()} Ouro</span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1B2030] hover:bg-[#252C42] border border-[#343B50] hover:border-[#F3F4F8]/40 text-[#A7B0C4] hover:text-[#F3F4F8] transition-all"
              title="Fechar (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-3 bg-[#10131C]/60 border-b border-[#343B50] flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playSelect();
                setActiveTab('pets');
              }}
              className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center gap-2 border-t border-x transition-all ${
                activeTab === 'pets'
                  ? 'bg-[#161A26] border-[#343B50] text-amber-400 border-b-2 border-b-amber-500 -mb-[1px]'
                  : 'border-transparent text-[#A7B0C4] hover:text-[#F3F4F8] hover:bg-[#1B2030]/50'
              }`}
            >
              <Shield size={16} />
              <span>Meus Pets</span>
              <span className="bg-[#1B2030] px-2 py-0.5 rounded-full text-[11px] font-black text-[#A7B0C4] border border-[#343B50]">
                {unlockedPetIds.length}
              </span>
            </button>

            <button
              onClick={() => {
                soundManager.playSelect();
                setActiveTab('eggs');
              }}
              className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center gap-2 border-t border-x transition-all ${
                activeTab === 'eggs'
                  ? 'bg-[#161A26] border-[#343B50] text-amber-400 border-b-2 border-b-amber-500 -mb-[1px]'
                  : 'border-transparent text-[#A7B0C4] hover:text-[#F3F4F8] hover:bg-[#1B2030]/50'
              }`}
            >
              <Egg size={16} />
              <span>Ninho & Incubadora</span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[11px] font-black">
                {eggs.length}/{MAX_EGGS_LIMIT}
              </span>
              {readyEggsCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => {
                soundManager.playSelect();
                setActiveTab('almanac');
              }}
              className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center gap-2 border-t border-x transition-all ${
                activeTab === 'almanac'
                  ? 'bg-[#161A26] border-[#343B50] text-amber-400 border-b-2 border-b-amber-500 -mb-[1px]'
                  : 'border-transparent text-[#A7B0C4] hover:text-[#F3F4F8] hover:bg-[#1B2030]/50'
              }`}
            >
              <BookOpen size={16} />
              <span>Almanaque</span>
              <span className="bg-[#1B2030] px-2 py-0.5 rounded-full text-[11px] font-black text-[#A7B0C4] border border-[#343B50]">
                {unlockedPetIds.length}/{PETS.length}
              </span>
            </button>
          </div>

          {/* Active Pet Pill */}
          {equippedPet && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <span className="text-[10px] uppercase tracking-wider text-amber-400/80">Equipado:</span>
              <PetIcon iconName={equippedPet.iconName} size={14} className="text-amber-400" />
              <span className="truncate max-w-[140px]">{equippedPet.name}</span>
            </div>
          )}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {/* ========================================================================= */}
          {/* TAB 1: MEUS PETS */}
          {/* ========================================================================= */}
          {activeTab === 'pets' && (
            <div className="space-y-6">
              {/* Equipped Pet Hero Showcase */}
              <div className="bg-gradient-to-br from-[#1B2030] to-[#121520] border border-[#343B50] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    {equippedPet ? (
                      <div
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-2 flex items-center justify-center shadow-xl shrink-0"
                        style={{
                          borderColor: PET_RARITY_CONFIG[equippedPet.rarity].color,
                          backgroundColor: '#10131C',
                          color: equippedPet.color,
                        }}
                      >
                        <PetIcon iconName={equippedPet.iconName} size={42} />
                      </div>
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-2 border-dashed border-[#343B50] flex flex-col items-center justify-center text-[#A7B0C4] shrink-0 bg-[#10131C]">
                        <Shield size={28} className="opacity-40" />
                        <span className="text-[10px] mt-1">Nenhum</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Pet Equipado para Expedições
                        </span>
                        {equippedPet && (
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                              PET_RARITY_CONFIG[equippedPet.rarity].badgeBg
                            }`}
                          >
                            {PET_RARITY_CONFIG[equippedPet.rarity].label}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#F3F4F8]">
                        {equippedPet ? equippedPet.name : 'Nenhum Companheiro Equipado'}
                      </h2>
                      <p className="text-xs text-[#A7B0C4] max-w-xl">
                        {equippedPet
                          ? equippedPet.description
                          : 'Selecione um pet da sua coleção abaixo para receber seus bônus de combate e habilidades ativas durante as 50 fases!'}
                      </p>
                    </div>
                  </div>

                  {equippedPet && (
                    <button
                      onClick={() => handleEquipPet(null)}
                      className="px-4 py-2 rounded-xl bg-[#10131C] hover:bg-red-500/20 border border-[#343B50] hover:border-red-500/50 text-red-400 hover:text-red-300 text-xs font-bold transition-all shrink-0"
                    >
                      Desequipar
                    </button>
                  )}
                </div>

                {/* Equipped Pet Detailed Passives and Actives */}
                {equippedPet && (
                  <div className="mt-5 pt-4 border-t border-[#343B50]/60 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-[#10131C] p-3 rounded-2xl border border-[#343B50]/60 space-y-1.5">
                      <div className="text-xs font-bold text-[#F3F4F8] flex items-center gap-1.5">
                        <Shield size={14} className="text-emerald-400" /> Bônus Passivos Ativos:
                      </div>
                      <div className="space-y-1">
                        {equippedPet.passives.map((p) => (
                          <p key={p.id} className="text-xs text-[#A7B0C4] flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>
                              <strong className="text-[#F3F4F8]">{p.name}:</strong> {p.description}
                            </span>
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#10131C] p-3 rounded-2xl border border-[#343B50]/60 space-y-1.5">
                      <div className="text-xs font-bold text-[#F3F4F8] flex items-center gap-1.5">
                        <Zap size={14} className="text-amber-400" /> Habilidades em Combate:
                      </div>
                      {equippedPet.activeSkills.length > 0 ? (
                        <div className="space-y-1">
                          {equippedPet.activeSkills.map((sk) => (
                            <p key={sk.id} className="text-xs text-[#A7B0C4] flex items-center gap-2">
                              <span className="text-amber-400 font-bold">⚡</span>
                              <span>
                                <strong className="text-[#F3F4F8]">{sk.name}:</strong> {sk.description}
                              </span>
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#A7B0C4] italic">
                          Pets comuns e incomuns concedem apenas bônus passivos. Pets Raros, Épicos e Lendários possuem habilidades ativas a partir do Turno 3!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Unlocked Pets Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#F3F4F8] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400" /> Sua Coleção ({unlockedPetIds.length} pets)
                  </h3>
                  <button
                    onClick={() => setActiveTab('eggs')}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>Ir para o Ninho de Ovos</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {unlockedPetIds.length === 0 ? (
                  <div className="p-12 text-center bg-[#1B2030]/50 border border-dashed border-[#343B50] rounded-3xl space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                      <Egg size={32} />
                    </div>
                    <h4 className="font-bold text-base text-[#F3F4F8]">Nenhum Pet Desbloqueado Ainda</h4>
                    <p className="text-xs text-[#A7B0C4] max-w-md mx-auto">
                      Obtenha ovos derrotando monstros em batalha (1% de chance em monstros comuns, 100% de chance em Chefes) e choque-os no Ninho de Ovos!
                    </p>
                    <button
                      onClick={() => setActiveTab('eggs')}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all shadow-lg active:scale-95"
                    >
                      Acessar Ninho de Ovos
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {unlockedPetIds.map((pId) => {
                      const pet = getPetById(pId);
                      if (!pet) return null;
                      const isEquipped = progress.equippedPetId === pet.id;
                      const rarityCfg = PET_RARITY_CONFIG[pet.rarity];

                      return (
                        <div
                          key={pet.id}
                          className={`bg-[#1B2030] border rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all hover:scale-[1.01] ${
                            isEquipped
                              ? 'border-amber-400 shadow-[0_0_20px_rgba(234,179,8,0.15)] bg-gradient-to-br from-[#1E2538] to-[#161B29]'
                              : 'border-[#343B50] hover:border-[#343B50]/80'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-md"
                              style={{
                                borderColor: rarityCfg.color,
                                backgroundColor: '#10131C',
                                color: pet.color,
                              }}
                            >
                              <PetIcon iconName={pet.iconName} size={28} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${rarityCfg.badgeBg}`}
                                >
                                  {rarityCfg.label}
                                </span>
                                <span className="text-[10px] text-[#A7B0C4] truncate">
                                  {pet.species}
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-[#F3F4F8] truncate mt-0.5">
                                {pet.name}
                              </h4>
                            </div>
                          </div>

                          {/* Passives Preview */}
                          <div className="bg-[#10131C] p-2 rounded-xl border border-[#343B50]/50 space-y-1 text-[11px]">
                            {pet.passives.map((p) => (
                              <div key={p.id} className="text-[#A7B0C4] truncate">
                                <span className="text-emerald-400 font-bold">•</span>{' '}
                                <strong className="text-[#F3F4F8]">{p.name}:</strong> {p.description}
                              </div>
                            ))}
                            {pet.activeSkills.length > 0 && (
                              <div className="text-amber-300/90 truncate font-semibold">
                                ⚡ Ativa: {pet.activeSkills[0].name}
                              </div>
                            )}
                          </div>

                          {/* Equip / Unequip Button */}
                          <button
                            onClick={() => handleEquipPet(isEquipped ? null : pet.id)}
                            className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
                              isEquipped
                                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                                : 'bg-[#10131C] hover:bg-[#252C42] border border-[#343B50] hover:border-[#D4AD65] text-[#F3F4F8]'
                            }`}
                          >
                            {isEquipped ? (
                              <>
                                <Check size={14} /> Equipado
                              </>
                            ) : (
                              'Equipar'
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: NINHO & INCUBADORA DE OVOS */}
          {/* ========================================================================= */}
          {activeTab === 'eggs' && (
            <div className="space-y-6">
              {/* Info Header Banner */}
              <div className="bg-gradient-to-r from-[#1B2030] to-[#161A26] border border-[#343B50] rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Egg size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[#F3F4F8]">
                      Incubadora & Ninho de Ovos
                    </h3>
                    <p className="text-xs text-[#A7B0C4] max-w-xl">
                      O tempo de incubação varia conforme a raridade (<strong>1h Comum</strong>, <strong>2h Incomum</strong>, <strong>3h Raro</strong>, <strong>5h Épico</strong>, <strong>8h Lendário</strong>), ou pode ser chocado instantaneamente por <strong>10.000 Ouro</strong>. Limite de 20 ovos.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-3.5 py-1.5 rounded-xl bg-[#10131C] border border-[#343B50] text-xs font-bold text-[#A7B0C4]">
                    Capacidade: <strong className="text-amber-400">{eggs.length}</strong> / {MAX_EGGS_LIMIT}
                  </div>
                </div>
              </div>

              {/* Rarity & Drop Rates Reference Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                {(['common', 'uncommon', 'rare', 'epic', 'legendary'] as PetRarity[]).map((rKey) => {
                  const cfg = PET_RARITY_CONFIG[rKey];
                  return (
                    <div
                      key={rKey}
                      className="bg-[#1B2030] border border-[#343B50] rounded-xl p-2.5 flex flex-col items-center gap-1"
                    >
                      <div className="w-4 h-5 rounded-full" style={{ backgroundColor: cfg.eggColorHex }} />
                      <span className="font-bold text-[11px]" style={{ color: cfg.color }}>
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                        <Clock size={10} /> {cfg.hatchHours}h
                      </span>
                      <span className="text-[10px] text-[#A7B0C4]">Chance: {cfg.dropRatePercent}%</span>
                      <span className="text-[9px] text-[#F0B44D]">Repetido: +{cfg.duplicateGold}g</span>
                    </div>
                  );
                })}
              </div>

              {/* Eggs List */}
              {eggs.length === 0 ? (
                <div className="p-14 text-center bg-[#1B2030]/50 border border-dashed border-[#343B50] rounded-3xl space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                    <Egg size={32} />
                  </div>
                  <h4 className="font-bold text-base text-[#F3F4F8]">O Ninho está Vazio</h4>
                  <p className="text-xs text-[#A7B0C4] max-w-md mx-auto">
                    Você não possui ovos no momento. Derrote monstros nas fases para encontrar novos ovos!
                  </p>
                  <div className="text-xs text-[#A7B0C4] bg-[#10131C] max-w-sm mx-auto p-3 rounded-xl border border-[#343B50]/60 space-y-1 text-left">
                    <p className="font-bold text-[#F3F4F8]">• Monstros comuns: 1% de chance de ovo</p>
                    <p className="font-bold text-[#D4AD65]">• Monstros Chefes: 100% de chance de ovo!</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {eggs.map((egg) => {
                    const rarityCfg = PET_RARITY_CONFIG[egg.rarity];
                    const remaining = getRemainingTime(egg);
                    const isIncubating = Boolean(egg.incubatingStartedAt);
                    const isReady = remaining?.isReady;
                    const canAffordInstant = progress.gold >= INSTANT_HATCH_COST;

                    return (
                      <div
                        key={egg.id}
                        className={`bg-[#1B2030] border rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all relative overflow-hidden ${
                          isReady
                            ? 'border-emerald-500 shadow-[0_0_20px_rgba(34,197,94,0.2)] bg-gradient-to-br from-[#192A24] to-[#141B22]'
                            : isIncubating
                            ? 'border-amber-500/60 shadow-lg'
                            : 'border-[#343B50]'
                        }`}
                      >
                        {/* Delete Confirmation Overlay */}
                        {deleteConfirmEggId === egg.id && (
                          <div className="absolute inset-0 bg-black/90 p-4 rounded-2xl z-20 flex flex-col items-center justify-center text-center gap-3 animate-fadeIn">
                            <AlertTriangle size={24} className="text-red-400" />
                            <p className="text-xs font-bold text-[#F3F4F8]">
                              Deseja excluir este ovo {rarityCfg.label}?
                            </p>
                            <p className="text-[10px] text-[#A7B0C4]">
                              Essa ação é permanente e liberará espaço no ninho.
                            </p>
                            <div className="flex items-center gap-2 w-full pt-1">
                              <button
                                onClick={() => handleDeleteEgg(egg.id)}
                                className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                              >
                                Excluir
                              </button>
                              <button
                                onClick={() => setDeleteConfirmEggId(null)}
                                className="flex-1 py-1.5 rounded-lg bg-[#252C42] text-[#A7B0C4] hover:text-white font-bold text-xs"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <EggDisplay rarity={egg.rarity} size="md" isIncubating={isIncubating && !isReady} />
                            <div>
                              <div
                                className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${rarityCfg.badgeBg}`}
                              >
                                {rarityCfg.label}
                              </div>
                              <h4 className="font-bold text-sm text-[#F3F4F8] mt-1">
                                Ovo {rarityCfg.label}
                              </h4>
                              <p className="text-[10px] text-[#A7B0C4]">
                                Cor: {rarityCfg.label}
                              </p>
                            </div>
                          </div>

                          {/* Delete Egg Icon Button */}
                          <button
                            onClick={() => setDeleteConfirmEggId(egg.id)}
                            className="p-1.5 rounded-lg bg-[#10131C] hover:bg-red-500/20 text-[#A7B0C4] hover:text-red-400 transition-all border border-[#343B50]"
                            title="Descartar / Excluir Ovo"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Incubation Progress Bar / Timer */}
                        {isIncubating && (
                          <div className="space-y-1.5 bg-[#10131C] p-2.5 rounded-xl border border-[#343B50]">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="flex items-center gap-1.5 text-amber-300">
                                <Clock size={12} className={isReady ? 'text-emerald-400' : 'animate-spin'} />
                                <span>{remaining?.text}</span>
                              </span>
                              <span className="text-[10px] text-[#A7B0C4]">
                                {Math.round(remaining?.progressPercent || 0)}%
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[#1B2030] overflow-hidden border border-[#343B50]/60">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  isReady
                                    ? 'bg-emerald-400'
                                    : 'bg-gradient-to-r from-amber-500 to-amber-400'
                                }`}
                                style={{ width: `${remaining?.progressPercent || 0}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-1">
                          {isReady ? (
                            <button
                              onClick={() => handleHatchEgg(egg.id, false)}
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-xs tracking-wide shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5 animate-pulse"
                            >
                              <Sparkles size={16} /> Chocar Ovo Agora!
                            </button>
                          ) : isIncubating ? (
                            <button
                              onClick={() => handleHatchEgg(egg.id, true)}
                              disabled={!canAffordInstant}
                              className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                                canAffordInstant
                                  ? 'bg-[#10131C] hover:bg-amber-500/20 border-amber-500/50 text-amber-300 active:scale-95'
                                  : 'bg-[#10131C] border-[#343B50] text-[#A7B0C4] opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <Coins size={14} className="text-amber-400" />
                              <span>Acelerar: {INSTANT_HATCH_COST.toLocaleString()} Ouro</span>
                            </button>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleStartIncubation(egg.id)}
                                className="py-2 rounded-xl bg-[#10131C] hover:bg-[#252C42] border border-[#343B50] hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
                              >
                                <Clock size={13} /> Incubar ({rarityCfg.hatchHours}h)
                              </button>
                              <button
                                onClick={() => handleHatchEgg(egg.id, true)}
                                disabled={!canAffordInstant}
                                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all border ${
                                  canAffordInstant
                                    ? 'bg-amber-500 hover:bg-amber-400 border-amber-500 text-black font-black active:scale-95 shadow-md'
                                    : 'bg-[#10131C] border-[#343B50] text-[#A7B0C4] opacity-50 cursor-not-allowed'
                                }`}
                                title={canAffordInstant ? 'Chocar Imediatamente' : 'Ouro Insuficiente (10.000 Ouro)'}
                              >
                                <Coins size={13} /> 10k Ouro
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ALMANAQUE DE PETS */}
          {/* ========================================================================= */}
          {activeTab === 'almanac' && (
            <div className="space-y-6">
              {/* Almanac Header & Stats */}
              <div className="bg-gradient-to-br from-[#1B2030] to-[#121520] border border-[#343B50] rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-800/10 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[#F3F4F8]">
                      Almanaque dos Companheiros
                    </h3>
                    <p className="text-xs text-[#A7B0C4]">
                      Consulte todas as 41 espécies catalogadas, suas raridades e habilidades especiais.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-[#A7B0C4]">Progresso da Coleção</div>
                    <div className="text-sm font-black text-amber-400">
                      {unlockedPetIds.length} / {PETS.length} ({Math.round((unlockedPetIds.length / PETS.length) * 100)}%)
                    </div>
                  </div>
                  <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#343B50]"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-amber-400 transition-all duration-700"
                        strokeDasharray={`${(unlockedPetIds.length / PETS.length) * 100}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-black text-[#F3F4F8]">
                      {Math.round((unlockedPetIds.length / PETS.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Filters and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'Todos', count: PETS.length },
                    { id: 'common', label: 'Comuns', count: getPetsByRarity('common').length },
                    { id: 'uncommon', label: 'Incomuns', count: getPetsByRarity('uncommon').length },
                    { id: 'rare', label: 'Raros', count: getPetsByRarity('rare').length },
                    { id: 'epic', label: 'Épicos', count: getPetsByRarity('epic').length },
                    { id: 'legendary', label: 'Lendários', count: getPetsByRarity('legendary').length },
                    { id: 'collected', label: 'Obtidos', count: unlockedPetIds.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        soundManager.playSelect();
                        setAlmanacFilter(tab.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                        almanacFilter === tab.id
                          ? 'bg-amber-500 text-black border-amber-400 shadow-md font-black'
                          : 'bg-[#1B2030] border-[#343B50] text-[#A7B0C4] hover:text-[#F3F4F8] hover:border-[#343B50]/80'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>

                <div className="relative shrink-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A7B0C4]" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou espécie..."
                    value={almanacSearch}
                    onChange={(e) => setAlmanacSearch(e.target.value)}
                    className="w-full sm:w-60 bg-[#1B2030] border border-[#343B50] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#F3F4F8] focus:outline-none focus:border-amber-400 transition-all placeholder:text-[#A7B0C4]/60"
                  />
                </div>
              </div>

              {/* Almanac Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAlmanacPets.map((pet) => {
                  const isUnlocked = unlockedPetIds.includes(pet.id);
                  const isEquipped = progress.equippedPetId === pet.id;
                  const rarityCfg = PET_RARITY_CONFIG[pet.rarity];

                  if (!isUnlocked) {
                    return (
                      <div
                        key={pet.id}
                        className="bg-[#121520]/80 border border-[#343B50]/60 rounded-2xl p-4 flex flex-col justify-between gap-3 text-left relative overflow-hidden group opacity-75 hover:opacity-100 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-14 h-14 rounded-2xl border-2 border-dashed border-[#343B50] bg-[#10131C] flex items-center justify-center text-[#343B50] shrink-0"
                            style={{ borderColor: `${rarityCfg.color}40` }}
                          >
                            <Lock size={22} className="opacity-60" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${rarityCfg.badgeBg}`}
                            >
                              {rarityCfg.label}
                            </span>
                            <h4 className="font-bold text-sm text-[#A7B0C4] mt-1">
                              ??? (Não Descoberto)
                            </h4>
                            <p className="text-[10px] text-[#A7B0C4]/60 truncate">
                              Ovo {rarityCfg.label} ({rarityCfg.dropRatePercent}% de chance)
                            </p>
                          </div>
                        </div>

                        <div className="bg-[#10131C]/60 p-2.5 rounded-xl border border-[#343B50]/40 text-[11px] text-[#A7B0C4]/60 italic">
                          Obtenha e choque um ovo da raridade <strong style={{ color: rarityCfg.color }}>{rarityCfg.label}</strong> para revelar este companheiro lendário.
                        </div>

                        <div className="text-[10px] text-center text-[#A7B0C4]/50 py-1">
                          Bloqueado no Almanaque
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={pet.id}
                      className={`bg-[#1B2030] border rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all hover:scale-[1.01] ${
                        isEquipped
                          ? 'border-amber-400 shadow-[0_0_20px_rgba(234,179,8,0.15)] bg-gradient-to-br from-[#1E2538] to-[#161B29]'
                          : 'border-[#343B50]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-md"
                          style={{
                            borderColor: rarityCfg.color,
                            backgroundColor: '#10131C',
                            color: pet.color,
                          }}
                        >
                          <PetIcon iconName={pet.iconName} size={28} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${rarityCfg.badgeBg}`}
                            >
                              {rarityCfg.label}
                            </span>
                            <span className="text-[10px] text-[#A7B0C4] truncate">
                              {pet.species}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-[#F3F4F8] truncate mt-0.5">
                            {pet.name}
                          </h4>
                        </div>
                      </div>

                      {/* Lore Snippet */}
                      <p className="text-[11px] text-[#A7B0C4] italic line-clamp-2">
                        "{pet.lore}"
                      </p>

                      {/* Passives & Actives */}
                      <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50]/50 space-y-1.5 text-[11px]">
                        <div>
                          <span className="text-emerald-400 font-bold">• Passivas: </span>
                          <span className="text-[#A7B0C4]">
                            {pet.passives.map((p) => p.name).join(', ')}
                          </span>
                        </div>
                        {pet.activeSkills.length > 0 && (
                          <div>
                            <span className="text-amber-400 font-bold">⚡ Ativas ({pet.activeSkills.length}): </span>
                            <span className="text-amber-200/90 font-medium">
                              {pet.activeSkills.map((sk) => sk.name).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => handleEquipPet(isEquipped ? null : pet.id)}
                        className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
                          isEquipped
                            ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                            : 'bg-[#10131C] hover:bg-[#252C42] border border-[#343B50] hover:border-[#D4AD65] text-[#F3F4F8]'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check size={14} /> Equipado
                          </>
                        ) : (
                          'Equipar este Pet'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pet Hatch Celebration Modal */}
      {hatchedPetResult && (
        <PetHatchModal
          pet={hatchedPetResult.pet}
          isDuplicate={hatchedPetResult.isDuplicate}
          duplicateGold={hatchedPetResult.duplicateGold}
          onEquip={(petId) => handleEquipPet(petId)}
          onClose={() => setHatchedPetResult(null)}
        />
      )}
    </div>
  );
};
