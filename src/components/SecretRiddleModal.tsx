import React from 'react';
import { Scroll, Sparkles, Swords, X } from 'lucide-react';

interface SecretRiddleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecretRiddleModal: React.FC<SecretRiddleModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-fade-in">
      <div className="relative bg-gradient-to-b from-[#1B1528] via-[#150F22] to-[#0D0817] border-2 border-[#9D4EDD] rounded-3xl p-6 sm:p-8 max-w-lg w-full text-[#F3F4F8] shadow-2xl shadow-[#7B2CBF]/40 space-y-6">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#9D4EDD]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-[#7B2CBF]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#221735] hover:bg-[#32204E] text-[#C084FC] hover:text-white transition-colors"
          title="Fechar Bilhete"
        >
          <X size={18} />
        </button>

        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#9D4EDD]/20 border border-[#9D4EDD]/50 text-[#C084FC] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
            <Scroll size={15} /> BILHETE ENCONTRADO NO TRONO
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F8] flex items-center justify-center gap-2">
            O Testamento das Quatro Lâminas
          </h2>
          <p className="text-xs text-[#A7B0C4] italic">
            Um pergaminho antigo repousando em silêncio sobre a pedra fria...
          </p>
        </div>

        {/* Parchment Box with Riddle */}
        <div className="bg-[#0F0A19]/90 border border-[#9D4EDD]/40 rounded-2xl p-6 sm:p-7 space-y-4 shadow-inner relative overflow-hidden">
          <div className="absolute top-2 right-2 text-[#7B2CBF]/15 pointer-events-none">
            <Swords size={110} />
          </div>

          <p className="text-xs sm:text-sm text-[#E0AAFF] font-serif leading-relaxed text-center italic">
            &ldquo;O Vazio despreza os que temem a respiração da morte.<br />
            Aquele que sentencia reis jamais responderá a quem busca o conforto do recuo.
          </p>

          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#9D4EDD] to-transparent mx-auto my-1" />

          <p className="text-xs sm:text-sm text-[#F3F4F8] font-serif leading-relaxed text-center space-y-2">
            Nenhum projétil cantará nos céus deste salão.<br />
            Nenhum encantamento será sussurrado à distância do perigo.<br />
            <br />
            Apenas quatro almas de ferro, partilhando a mesma poeira e o mesmo sangue,<br />
            olhando diretamente nos olhos do abismo.<br />
            <br />
            Façam o Soberano tombar sentindo o peso do aço em sua carne...<br />
            e a lâmina proibida romperá o próprio silêncio.&rdquo;
          </p>
        </div>

        {/* Thematic Flavor Inscription */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[#A7B0C4] italic">
          <Sparkles size={13} className="text-[#9D4EDD]" />
          <span>— Inscrição talhada em cinzas na base do pedestal</span>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7B2CBF] via-[#9D4EDD] to-[#5A189A] hover:from-[#9D4EDD] hover:to-[#7B2CBF] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#7B2CBF]/30 transition-all hover:scale-[1.02] active:scale-95"
        >
          Guardar Bilhete & Voltar ao Combate
        </button>
      </div>
    </div>
  );
};
