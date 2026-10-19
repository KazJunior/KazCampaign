import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Coins, Sparkles, RefreshCw, ChevronRight, Skull, ArrowUpRight, ShieldCheck, Home } from 'lucide-react';
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
  playerGold?: number;
  unlockedClassesCount?: number;
  onNextLevel: () => void;
  onRetry: () => void;
  onGoToMenu: () => void;
}

export const VictoryDefeatModal: React.FC<VictoryDefeatModalProps> = ({
  isVictory,
  levelNumber,
  summary,
  hasNextLevel,
  playerGold = 0,
  unlockedClassesCount = 4,
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans">
      <div
        className={`bg-[#1B2030] border-2 rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl text-[#F3F4F8] text-center ${
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
          {isVictory
            ? !hasNextLevel
              ? 'Vitória Suprema da Campanha!'
              : 'Fase Concluída!'
            : 'Aventura Encerrada!'}
        </h1>
        <p className="text-xs text-[#A7B0C4] mb-4">
          {isVictory
            ? !hasNextLevel
              ? 'Incrível! Você derrotou o Dragão Malakor e superou todas as 50 fases!'
              : `Você eliminou todos os inimigos da Fase ${levelNumber}!`
            : `Sua equipe foi derrotada na Fase ${levelNumber}. A jornada chegou ao fim.`}
        </p>

        {isVictory ? (
          <div className="space-y-3 mb-5 text-left">
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
                  <div className="text-[10px] text-[#A7B0C4]">XP por Herói</div>
                  <div className="font-bold text-sm text-[#B58AFF]">+{summary.xpGained} XP</div>
                </div>
              </div>
            </div>

            {summary.levelUps.length > 0 && (
              <div className="bg-[#10131C] p-3 rounded-xl border border-[#D4AD65]/40 space-y-1">
                <div className="text-[11px] font-bold text-[#D4AD65] uppercase flex items-center gap-1">
                  <ArrowUpRight size={14} /> Evolução de Nível da Equipe!
                </div>
                {summary.levelUps.map((lu, idx) => (
                  <div key={idx} className="text-xs flex items-center justify-between text-[#F3F4F8]">
                    <span>{lu.unitName}</span>
                    <span className="font-bold text-[#43C878]">
                      Nv.{lu.oldLevel} → Nv.{lu.newLevel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#10131C] p-4 rounded-xl border border-[#E65353]/40 space-y-2 mb-5 text-left">
            <div className="text-xs font-bold text-[#43C878] flex items-center gap-1.5 uppercase">
              <ShieldCheck size={16} /> Recursos Preservados
            </div>
            <p className="text-[11px] text-[#A7B0C4]">
              Na próxima aventura, seus heróis recomeçarão do Nível 1 na Fase 1, mas todo o seu patrimônio foi mantido:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-[#1B2030] p-2.5 rounded-lg border border-[#343B50] flex items-center gap-2">
                <Coins size={16} className="text-[#F0B44D]" />
                <div>
                  <div className="text-[10px] text-[#A7B0C4]">Ouro Seguro</div>
                  <div className="font-black text-white">{playerGold}</div>
                </div>
              </div>
              <div className="bg-[#1B2030] p-2.5 rounded-lg border border-[#343B50] flex items-center gap-2">
                <Award size={16} className="text-[#4C8DFF]" />
                <div>
                  <div className="text-[10px] text-[#A7B0C4]">Classes Liberadas</div>
                  <div className="font-black text-white">{unlockedClassesCount}/10</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {isVictory ? (
            <>
              {hasNextLevel ? (
                <>
                  <button
                    onClick={onNextLevel}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AD65] via-[#E5C27E] to-[#B88E43] hover:from-[#E5C27E] hover:to-[#A77E36] text-[#10131C] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                    Avançar para a Fase {levelNumber + 1} <ChevronRight size={18} />
                  </button>
                  <button
                    onClick={onGoToMenu}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#10131C] hover:bg-[#343B50] text-[#A7B0C4] hover:text-white font-bold text-xs uppercase tracking-wider border border-[#343B50] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Home size={14} /> Salvar e Voltar ao Menu
                  </button>
                </>
              ) : (
                <button
                  onClick={onGoToMenu}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AD65] to-[#B88E43] text-[#10131C] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  Concluir Campanha e Voltar ao Menu
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={onRetry}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E65353] to-[#D33838] hover:from-[#D33838] hover:to-[#B72828] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <RefreshCw size={16} /> Iniciar Nova Aventura (Fase 1)
              </button>
              <button
                onClick={onGoToMenu}
                className="w-full py-2.5 px-4 rounded-xl bg-[#10131C] hover:bg-[#343B50] text-[#A7B0C4] hover:text-white font-bold text-xs uppercase tracking-wider border border-[#343B50] transition-colors flex items-center justify-center gap-1.5"
              >
                <Home size={14} /> Voltar ao Menu
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
