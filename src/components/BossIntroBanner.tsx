import React, { useEffect } from 'react';
import { Skull, AlertOctagon, Flame } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface BossIntroBannerProps {
  bossName: string;
  subtitle: string;
  phaseNumber?: number;
  onDismiss: () => void;
}

export const BossIntroBanner: React.FC<BossIntroBannerProps> = ({
  bossName,
  subtitle,
  phaseNumber,
  onDismiss,
}) => {
  useEffect(() => {
    soundManager.playDeath(); // Dramatic thud sound effect
    const timer = setTimeout(() => {
      onDismiss();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-pulse">
      <div className="bg-[#1B2030] border-4 border-[#E65353] rounded-3xl p-8 max-w-lg w-full text-center text-[#F3F4F8] shadow-2xl space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#E65353]/20 border-4 border-[#E65353] text-[#E65353] flex items-center justify-center shadow-2xl animate-spin-slow">
            {phaseNumber && phaseNumber > 1 ? <Flame size={48} /> : <Skull size={48} />}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-black text-[#E65353] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <AlertOctagon size={16} />{' '}
            {phaseNumber && phaseNumber > 1
              ? `TRANSFORMAÇÃO — FASE ${phaseNumber} DE COMBATE`
              : 'AMEAÇA SUPREMA DETECTADA'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F3F4F8] tracking-tight">
            {bossName}
          </h1>
          <p className="text-sm text-[#D4AD65] font-semibold">{subtitle}</p>
        </div>

        <div className="pt-2">
          <button
            onClick={onDismiss}
            className="px-6 py-2 rounded-full bg-[#E65353] hover:bg-[#D33838] text-white font-bold text-xs uppercase tracking-wider shadow-lg"
          >
            Preparar para o Combate!
          </button>
        </div>
      </div>
    </div>
  );
};
