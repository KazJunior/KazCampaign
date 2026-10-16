import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Coins, Sparkles, RefreshCw, ChevronRight, Skull, ArrowUpRight } from 'lucide-react';
import type { Unit } from '../types/game';

interface LevelSummary {
  xpGained: number;
  goldGained: number;
  survivingUnits: Unit[];
  levelUps: { unitName: string; oldLevel: number; newLevel: number }[];
}

interface VictoryDefeatModalProps {
  isVictory: boolean;
  levelNumber: number;
  summary: LevelSummary;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRetry: () => void;
  onGoToMenu: () => void;
}

export const VictoryDefeatModal: React.FC<VictoryDefeatModalProps> = ({
  isVictory,
  levelNumber,
  summary,
  hasNextLevel,
  onNextLevel,
  onRetry,
  onGoToMenu,
}) => {
  useEffect(() => {
    if (isVictory) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isVictory]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`bg-[#1B2030] border-2 rounded-2xl p-6 max-w-md w-full shadow-2xl text-[#F3F4F8] select-none text-center ${
          isVictory ? 'border-[#D4AD65]' : 'border-[#E65353]'
        }`}
      >
        <div className="flex justify-center mb-3">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl ${
              isVictory ? 'bg-[#D4AD65]/20 border-[#D4AD65] text-[#D4AD65]' : 'bg-[#E65353]/20 border-[#E65353] text-[#E65353]'
            }`}
          >
            {isVictory ? <Award size={44} /> : <Skull size={44} />}
          </div>
        </div>

        <h1 className="font-extrabold text-2xl uppercase tracking-wider mb-1">
          {isVictory ? 'Vitória Gloriosa!' : 'Derrota na Batalha'}
        </h1>
        <p className="text-xs text-[#A7B0C4] mb-5">
          {isVictory
            ? `Você eliminou todos os inimigos da Fase ${levelNumber}!`
            : `Todas as suas unidades foram derrotadas na Fase ${levelNumber}.`}
        </p>

        {isVictory && (
          <div className="space-y-3 mb-6 text-left">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#10131C] p-3 rounded-xl border border-[#343B50] flex items-center gap-2">
                <Coins className="text-[#F0B44D]" size={20} />
                <div>
                  <div className="text-[10px] text-[#A7B0C4]">Ouro Obtido</div>
                  <div className="font-bold text-sm text-[#F0B44D]">+{summary.goldGained}</div>
                </div>
              </div>

              <div className="bg-[#10131C] p-3 rounded-xl border border-[#343B50] flex items-center gap-2">
                <Sparkles className="text-[#B58AFF]" size={20} />
                <div>
                  <div className="text-[10px] text-[#A7B0C4]">XP por Sobrevivente</div>
                  <div className="font-bold text-sm text-[#B58AFF]">+{summary.xpGained} XP</div>
                </div>
              </div>
            </div>

            {summary.levelUps.length > 0 && (
              <div className="bg-[#10131C] p-3 rounded-xl border border-[#D4AD65]/40 space-y-1">
                <div className="text-[11px] font-bold text-[#D4AD65] uppercase flex items-center gap-1">
                  <ArrowUpRight size={14} /> Subiu de Nível!
                </div>
                {summary.levelUps.map((lu, idx) => (
                  <div key={idx} className="text-xs flex items-center justify-between text-[#F3F4F8]">
                    <span>{lu.unitName}</span>
                    <span className="font-bold text-[#43C878]">
                      Nv.{lu.oldLevel} → Nv.{lu.newLevel} (+HP/ATK/DEF)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          {isVictory ? (
            <>
              {hasNextLevel && (
                <button
                  onClick={onNextLevel}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#B88E43] hover:to-[#96702D] text-[#10131C] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  Próxima Fase <ChevronRight size={18} />
                </button>
              )}
              <button
                onClick={onGoToMenu}
                className="w-full py-2.5 px-4 rounded-xl bg-[#10131C] hover:bg-[#343B50] text-[#A7B0C4] hover:text-white font-bold text-xs uppercase tracking-wider border border-[#343B50] transition-colors"
              >
                Voltar ao Mapa de Fases
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onRetry}
                className="w-full py-3 px-4 rounded-xl bg-[#E65353] hover:bg-[#D33838] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <RefreshCw size={16} /> Tentar Novamente
              </button>
              <button
                onClick={onGoToMenu}
                className="w-full py-2.5 px-4 rounded-xl bg-[#10131C] hover:bg-[#343B50] text-[#A7B0C4] hover:text-white font-bold text-xs uppercase tracking-wider border border-[#343B50] transition-colors"
              >
                Voltar ao Mapa de Fases
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
