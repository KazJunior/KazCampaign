import React from 'react';
import { Play, Move } from 'lucide-react';

interface DeploymentBannerProps {
  onStartBattle: () => void;
}

export const DeploymentBanner: React.FC<DeploymentBannerProps> = ({ onStartBattle }) => {
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-[#1B2030]/95 border-2 border-[#D4AD65] px-6 py-3 rounded-2xl shadow-2xl text-[#F3F4F8] flex items-center gap-4 select-none backdrop-blur-md">
      <div className="flex items-center gap-2 text-[#D4AD65] font-bold text-xs sm:text-sm">
        <Move size={18} className="animate-spin-slow" />
        <span>Clique em uma unidade aliada e depois em uma casa destacada para reposicioná-la.</span>
      </div>

      <button
        onClick={onStartBattle}
        className="bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#B88E43] hover:to-[#96702D] text-[#10131C] font-black px-5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
      >
        <Play size={16} fill="currentColor" /> INICIAR BATALHA
      </button>
    </div>
  );
};
