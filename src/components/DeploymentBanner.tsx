import React from 'react';
import { Play, Move, Package } from 'lucide-react';

interface DeploymentBannerProps {
  onStartBattle: () => void;
  onOpenEquipment?: () => void;
}

export const DeploymentBanner: React.FC<DeploymentBannerProps> = ({ onStartBattle, onOpenEquipment }) => {
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-[#1B2030]/95 border-2 border-[#D4AD65] px-6 py-3 rounded-2xl shadow-2xl text-[#F3F4F8] flex items-center gap-4 select-none backdrop-blur-md">
      <div className="flex items-center gap-2 text-[#D4AD65] font-bold text-xs sm:text-sm">
        <Move size={18} className="animate-spin-slow" />
        <span>Reposicione seus heróis nas casas destacadas antes do combate.</span>
      </div>

      <div className="flex items-center gap-2">
        {onOpenEquipment && (
          <button
            onClick={onOpenEquipment}
            className="bg-[#10131C] hover:bg-[#343B50] border border-[#F0B44D] text-[#F0B44D] font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Package size={16} /> Equipamentos
          </button>
        )}

        <button
          onClick={onStartBattle}
          className="bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#B88E43] hover:to-[#96702D] text-[#10131C] font-black px-5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
        >
          <Play size={16} fill="currentColor" /> INICIAR BATALHA
        </button>
      </div>
    </div>
  );
};
