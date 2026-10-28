import React from 'react';
import {
  Zap,
  Heart,
  RotateCcw,
  LogOut,
  Target,
  BarChart2,
  Sparkles,
} from 'lucide-react';

interface TrainingBattleHUDProps {
  totalDamage: number;
  highestHit: number;
  hitCount: number;
  onResetCooldowns: () => void;
  onHealTeam: () => void;
  onResetDummies: () => void;
  onExitTraining: () => void;
}

export const TrainingBattleHUD: React.FC<TrainingBattleHUDProps> = ({
  totalDamage,
  highestHit,
  hitCount,
  onResetCooldowns,
  onHealTeam,
  onResetDummies,
  onExitTraining,
}) => {
  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-[#121622]/95 border border-[#D4AD65]/50 backdrop-blur-md px-3 sm:px-4 py-2 rounded-2xl shadow-2xl text-[#F3F4F8] select-none max-w-[96vw]">
      {/* Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#D4AD65]/15 border border-[#D4AD65]/30 text-[#D4AD65] font-black text-xs shrink-0">
        <Target size={14} className="animate-spin-slow" />
        <span className="uppercase tracking-wider">Modo Treino</span>
      </div>

      {/* Live DPS Metrics */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 py-1 bg-[#1A2133] rounded-xl border border-[#2B354C] text-[11px] font-bold shrink-0">
        <div className="flex items-center gap-1 text-[#A7B0C4]">
          <BarChart2 size={13} className="text-[#F0B44D]" />
          <span>Dano Total:</span>
          <strong className="text-white font-black">{totalDamage.toLocaleString()}</strong>
        </div>
        <div className="hidden sm:inline-block w-px h-3 bg-[#38435C]" />
        <div className="hidden sm:flex items-center gap-1 text-[#A7B0C4]">
          <Sparkles size={13} className="text-[#38BDF8]" />
          <span>Maior Golpe:</span>
          <strong className="text-white font-black">{highestHit.toLocaleString()}</strong>
        </div>
        <div className="hidden md:inline-block w-px h-3 bg-[#38435C]" />
        <div className="hidden md:flex items-center gap-1 text-[#A7B0C4]">
          <span>Ataques:</span>
          <strong className="text-white font-black">{hitCount}</strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Reset Cooldowns */}
        <button
          onClick={onResetCooldowns}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/40 text-amber-300 hover:text-white font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
          title="Zera o tempo de recarga de todas as habilidades de todos os heróis"
        >
          <Zap size={13} className="text-amber-400 fill-amber-400" />
          <span className="hidden sm:inline">Zerar Recargas</span>
        </button>

        {/* Heal Team */}
        <button
          onClick={onHealTeam}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/40 text-emerald-300 hover:text-white font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
          title="Restaura 100% dos pontos de vida de toda a equipe e purifica debuffs"
        >
          <Heart size={13} className="text-emerald-400 fill-emerald-400" />
          <span className="hidden sm:inline">Curar Equipe</span>
        </button>

        {/* Reset Dummies */}
        <button
          onClick={onResetDummies}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/40 text-sky-300 hover:text-white font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
          title="Restaura a vida e remove status dos bonecos de treino"
        >
          <RotateCcw size={13} className="text-sky-400" />
          <span className="hidden sm:inline">Resetar Bonecos</span>
        </button>

        {/* Exit Training */}
        <button
          onClick={onExitTraining}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/35 border border-red-400/40 text-red-300 hover:text-white font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
          title="Finaliza a sessão de treino e retorna ao menu principal"
        >
          <LogOut size={13} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};
