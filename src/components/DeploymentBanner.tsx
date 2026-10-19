import React from 'react';
import { Play, Move, Package } from 'lucide-react';

interface DeploymentBannerProps {
  onStartBattle: () => void;
  onOpenEquipment?: () => void;
}

export const DeploymentBanner: React.FC<DeploymentBannerProps> = ({ onStartBattle, onOpenEquipment }) => {
  return (
    <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-40 bg-[#1B2030]/95 border-2 border-[#D4AD65] px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-2xl text-[#F3F4F8] flex flex-col sm:flex-row items-center gap-2 sm:gap-4 select-none backdrop-blur-md w-[calc(100%-1.5rem)] sm:w-auto max-w-lg text-center sm:text-left">
      <div className="flex items-center gap-2 text-[#D4AD65] font-bold text-xs sm:text-sm">
        <Move size={16} className="animate-spin-slow shrink-0" />
        <span className="leading-tight">Reposicione seus heróis nas casas destacadas antes do combate.</span>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
        {onOpenEquipment && (
          <button
            onClick={onOpenEquipment}
            className="flex-1 sm:flex-initial bg-[#10131C] hover:bg-[#343B50] border border-[#F0B44D] text-[#F0B44D] font-bold px-3 sm:px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow transition-all active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Package size={15} /> Equipamentos
          </button>
        )}

        <button
          onClick={onStartBattle}
          className="flex-1 sm:flex-initial bg-gradient-to-r from-[#D4AD65] to-[#B88E43] hover:from-[#B88E43] hover:to-[#96702D] text-[#10131C] font-black px-4 sm:px-5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <Play size={15} fill="currentColor" /> INICIAR
        </button>
      </div>
    </div>
  );
};
