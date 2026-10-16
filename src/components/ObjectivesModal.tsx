import React from 'react';
import { Award, CheckCircle2, Coins, Sparkles, X } from 'lucide-react';
import type { LevelConfig } from '../types/game';

interface ObjectivesModalProps {
  level: LevelConfig;
  onClose: () => void;
}

export const ObjectivesModal: React.FC<ObjectivesModalProps> = ({ level, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1B2030] border border-[#343B50] rounded-2xl p-6 max-w-md w-full shadow-2xl text-[#F3F4F8] select-none">
        <div className="flex items-center justify-between border-b border-[#343B50] pb-3 mb-4">
          <div className="flex items-center gap-2 text-[#D4AD65]">
            <Award size={20} />
            <h2 className="font-bold text-base uppercase tracking-wider">{level.name}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-[#A7B0C4] hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-[#A7B0C4] mb-4 leading-relaxed">{level.description}</p>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-[#D4AD65] uppercase tracking-wider mb-2">Objetivos da Fase</h3>
            <ul className="space-y-2 text-xs">
              {level.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 bg-[#10131C] p-2.5 rounded-lg border border-[#343B50]">
                  <CheckCircle2 size={16} className="text-[#43C878] shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-[#D4AD65] uppercase tracking-wider mb-2">Recompensas ao Concluir</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#10131C] p-2.5 rounded-lg border border-[#343B50] flex items-center gap-2 text-[#F0B44D]">
                <Coins size={18} />
                <div>
                  <div className="text-[10px] text-[#A7B0C4]">Ouro</div>
                  <div className="font-bold">+{level.rewards.gold} Moedas</div>
                </div>
              </div>

              <div className="bg-[#10131C] p-2.5 rounded-lg border border-[#343B50] flex items-center gap-2 text-[#B58AFF]">
                <Sparkles size={18} />
                <div>
                  <div className="text-[10px] text-[#A7B0C4]">Experiência</div>
                  <div className="font-bold">+{level.rewards.xpPerUnit} XP/Unidade</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-[#4C8DFF] hover:bg-[#3B72D9] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
