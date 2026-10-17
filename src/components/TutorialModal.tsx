import React, { useState } from 'react';
import { HelpCircle, Footprints, Swords, Wand2, HeartPulse, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: '1. O Tabuleiro Tático & Fases',
      icon: <Footprints className="text-[#4C8DFF]" size={28} />,
      content:
        'Cada batalha ocorre em um tabuleiro quadriculado. Antes de iniciar, reposicione suas 4 unidades na zona amarela destacada na parte inferior.',
    },
    {
      title: '2. Movimentação & Alcance',
      icon: <Footprints className="text-[#43C878]" size={28} />,
      content:
        'Ao selecionar uma unidade no seu turno, pressione [W] ou clique em Mover para destacar em AZUL todas as casas alcançáveis baseadas no valor de MOV. Obstáculos e inimigos bloqueiam a passagem.',
    },
    {
      title: '3. Sistema de Combate & Atalhos',
      icon: <Swords className="text-[#FF5252]" size={28} />,
      content:
        'Pressione [A] para Atacar ou [1 a 9] para Habilidades. Use [T] para Esperar e [Espaço] para Finalizar Turno! Ataques físicos usam DEF do alvo e mágicos usam RES.',
    },
    {
      title: '4. Habilidades Especiais',
      icon: <Wand2 className="text-[#B58AFF]" size={28} />,
      content:
        'Cada classe possui uma habilidade única: o Guerreiro causa dano brutal adjacente, o Arqueiro perfura armaduras, o Mago causa explosões 3x3 em área, e o Curandeiro restaura vida dos aliados!',
    },
    {
      title: '5. Barras de Vida & Vitória',
      icon: <HeartPulse className="text-[#56E59A]" size={28} />,
      content:
        'Todas as unidades exibem a vida permanente acima do sprite (Verde >50%, Laranja 25-50%, Vermelho <25%). Elimine todos os monstros para vencer a fase e desbloquear a próxima!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1B2030] border border-[#343B50] rounded-2xl p-6 max-w-md w-full shadow-2xl text-[#F3F4F8] select-none">
        <div className="flex items-center justify-between border-b border-[#343B50] pb-3 mb-4">
          <div className="flex items-center gap-2 text-[#4C8DFF]">
            <HelpCircle size={20} />
            <h2 className="font-bold text-base uppercase tracking-wider">Como Jogar — Tutorial</h2>
          </div>
          <button onClick={onClose} className="p-1 text-[#A7B0C4] hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="bg-[#10131C] p-5 rounded-xl border border-[#343B50] min-h-[160px] flex flex-col items-center justify-center text-center space-y-3">
          {steps[step].icon}
          <h3 className="font-bold text-sm text-[#D4AD65]">{steps[step].title}</h3>
          <p className="text-xs text-[#A7B0C4] leading-relaxed">{steps[step].content}</p>
        </div>

        <div className="flex items-center justify-between mt-5">
          <button
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="p-2 rounded-xl bg-[#10131C] border border-[#343B50] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#343B50] transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-xs font-bold text-[#A7B0C4]">
            {step + 1} de {steps.length}
          </span>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
              className="py-2 px-4 rounded-xl bg-[#4C8DFF] hover:bg-[#3B72D9] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors shadow-md"
            >
              Próximo <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-[#43C878] hover:bg-[#37B067] text-[#10131C] font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
            >
              Começar Batalha!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
