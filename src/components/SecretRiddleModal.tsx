import React from 'react';
import { Scroll, Sparkles, Swords, X } from 'lucide-react';

interface SecretRiddleModalProps {
  isOpen: boolean;
  onClose: () => void;
  riddleType?: 'astaroth' | 'omnimago';
}

export const SecretRiddleModal: React.FC<SecretRiddleModalProps> = ({
  isOpen,
  onClose,
  riddleType = 'astaroth',
}) => {
  if (!isOpen) return null;

  const isOmnimago = riddleType === 'omnimago';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans animate-fade-in">
      <div className={`relative bg-gradient-to-b ${
        isOmnimago
          ? 'from-[#23122E] via-[#170B24] to-[#0D0517] border-2 border-[#D946EF] shadow-[#D946EF]/40'
          : 'from-[#1B1528] via-[#150F22] to-[#0D0817] border-2 border-[#9D4EDD] shadow-[#7B2CBF]/40'
      } rounded-3xl p-5 sm:p-8 max-w-lg w-full text-[#F3F4F8] shadow-2xl space-y-4 sm:space-y-6 max-h-[92vh] overflow-y-auto`}>
        
        {/* Glow Effects */}
        <div className={`absolute top-0 right-0 w-44 h-44 ${isOmnimago ? 'bg-[#D946EF]/20' : 'bg-[#9D4EDD]/15'} rounded-full blur-3xl pointer-events-none`} />
        <div className={`absolute bottom-0 left-0 w-44 h-44 ${isOmnimago ? 'bg-[#38BDF8]/15' : 'bg-[#7B2CBF]/15'} rounded-full blur-3xl pointer-events-none`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-xl ${
            isOmnimago ? 'bg-[#2A153A] hover:bg-[#3D1A54] text-[#F0ABFC]' : 'bg-[#221735] hover:bg-[#32204E] text-[#C084FC]'
          } hover:text-white transition-colors`}
          title="Fechar Enigma"
        >
          <X size={18} />
        </button>

        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div className={`inline-flex items-center gap-2 ${
            isOmnimago
              ? 'bg-[#D946EF]/20 border border-[#D946EF]/60 text-[#F0ABFC]'
              : 'bg-[#9D4EDD]/20 border border-[#9D4EDD]/50 text-[#C084FC]'
          } px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest animate-pulse`}>
            <Scroll size={15} /> {isOmnimago ? 'SANTUÁRIO DAS RUNAS PROIBIDAS — CONVERGÊNCIA ELEMENTAL' : 'PEDESTAL DO TRONO DO ABISMO'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F8] flex items-center justify-center gap-2">
            {isOmnimago ? 'O Enigma do Omnimago' : 'A profecia do vazio'}
          </h2>
          <p className="text-xs text-[#A7B0C4] italic">
            {isOmnimago
              ? 'A essência dos quatro cristais elementares ressoa em uníssono...'
              : 'Palavras arcanas reveladas pelo impacto do golpe...'}
          </p>
        </div>

        {/* Parchment Box with Riddle */}
        <div className={`${
          isOmnimago ? 'bg-[#10071C]/90 border border-[#D946EF]/40' : 'bg-[#0F0A19]/90 border border-[#9D4EDD]/40'
        } rounded-2xl p-6 sm:p-7 space-y-4 shadow-inner relative overflow-hidden`}>
          <div className={`absolute top-2 right-2 ${isOmnimago ? 'text-[#D946EF]/10' : 'text-[#7B2CBF]/15'} pointer-events-none`}>
            {isOmnimago ? <Sparkles size={110} /> : <Swords size={110} />}
          </div>

          {isOmnimago ? (
            <>
              <p className="text-xs sm:text-sm text-[#F0ABFC] font-serif leading-relaxed text-center italic">
                &ldquo;Aquele que outrora caminhou entre nós cometeu o mais vil dos sacrilégios: o Mago Rúnico corrompeu os pilares sagrados do arcano, roubando os segredos proibidos da magia pura para desafiar o destino e forjar sua falsa imortalidade.
              </p>

              <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#D946EF] to-transparent mx-auto my-1" />

              <p className="text-xs sm:text-sm text-[#F3F4F8] font-serif leading-relaxed text-center">
                Preso entre as runas roubadas, o traidor zomba da morte terrena. O aço vulgar de espadas e flechas jamais romperá o elo eterno que o sustenta — sua heresia só pode ser expurgada na própria fonte.
              </p>

              <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#D946EF] to-transparent mx-auto my-1" />

              <p className="text-xs sm:text-sm text-[#F3F4F8] font-serif leading-relaxed text-center">
                Para que ele morra de verdade e seus pecados sejam purificados, o traidor deve ser subjugado pela retribuição dos magos originais. Formem uma irmandade tecida apenas pelo arcano e somente assim despertarão o poder supremo do <strong className="text-[#F0ABFC]">Omnimago</strong>.&rdquo;
              </p>
            </>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-[#E0AAFF] font-serif leading-relaxed text-center italic">
                &ldquo;Nas sombras mais profundas do Trono, onde a luz jamais alcançou... O Samurai do Vazio observa os tolos que ousam invadir o domínio de Astaroth.
              </p>

              <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#9D4EDD] to-transparent mx-auto my-1" />

              <p className="text-xs sm:text-sm text-[#F3F4F8] font-serif leading-relaxed text-center">
                Se desejas empunhar a lâmina proibida que rasga o espaço, abandone a covardia do refúgio gerado por métodos fúteis e inferiores de combate.
              </p>

              <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#9D4EDD] to-transparent mx-auto my-1" />

              <p className="text-xs sm:text-sm text-[#F3F4F8] font-serif leading-relaxed text-center">
                Desça ao abismo com coragem e encare Astaroth de frente. Façam o Soberano tombar sentindo o peso do aço em sua carne...&rdquo;
              </p>
            </>
          )}
        </div>

        {/* Thematic Flavor Inscription */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[#A7B0C4] italic">
          <Sparkles size={13} className={isOmnimago ? 'text-[#D946EF]' : 'text-[#9D4EDD]'} />
          <span>{isOmnimago ? '— Mensagem gravada na ressonância dos quatro cristais' : '— Inscrição entalhada na pedra do pedestal'}</span>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className={`w-full py-3 px-4 rounded-2xl ${
            isOmnimago
              ? 'bg-gradient-to-r from-[#A21CAF] via-[#D946EF] to-[#701A75] hover:from-[#D946EF] hover:to-[#A21CAF] shadow-[#D946EF]/30'
              : 'bg-gradient-to-r from-[#7B2CBF] via-[#9D4EDD] to-[#5A189A] hover:from-[#9D4EDD] hover:to-[#7B2CBF] shadow-[#7B2CBF]/30'
          } text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-[1.02] active:scale-95`}
        >
          {isOmnimago ? 'Fechar Enigma & Voltar ao Combate' : 'Fechar Inscrição & Voltar ao Combate'}
        </button>
      </div>
    </div>
  );
};
