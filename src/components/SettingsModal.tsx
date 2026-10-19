import React from 'react';
import { Volume2, VolumeX, Settings, RefreshCw, X } from 'lucide-react';
import type { AudioSettings } from '../types/game';

interface SettingsModalProps {
  settings: AudioSettings;
  onUpdateSettings: (newSettings: Partial<AudioSettings>) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#1B2030] border border-[#343B50] rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl text-[#F3F4F8] select-none max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#343B50] pb-3 mb-4">
          <div className="flex items-center gap-2 text-[#4C8DFF]">
            <Settings size={20} />
            <h2 className="font-bold text-base uppercase tracking-wider">Configurações do Jogo</h2>
          </div>
          <button onClick={onClose} className="p-1 text-[#A7B0C4] hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between bg-[#10131C] p-3 rounded-xl border border-[#343B50]">
            <span className="font-bold flex items-center gap-2">
              {settings.muted ? <VolumeX size={18} className="text-[#E65353]" /> : <Volume2 size={18} className="text-[#43C878]" />}
              Sons e Efeitos Sonoros
            </span>
            <button
              onClick={() => onUpdateSettings({ muted: !settings.muted })}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase ${
                settings.muted ? 'bg-[#E65353]/20 text-[#E65353] border border-[#E65353]/40' : 'bg-[#43C878]/20 text-[#43C878] border border-[#43C878]/40'
              }`}
            >
              {settings.muted ? 'Mudo' : 'Ativo'}
            </button>
          </div>

          <div className="bg-[#10131C] p-3 rounded-xl border border-[#343B50] space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span>Volume Geral</span>
              <span className="text-[#D4AD65]">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => onUpdateSettings({ masterVolume: parseFloat(e.target.value) })}
              className="w-full accent-[#4C8DFF] cursor-pointer"
            />
          </div>

          <div className="pt-3 border-t border-[#343B50] space-y-2">
            <h3 className="font-bold text-[#E65353] uppercase text-[11px] tracking-wider">Zona de Perigo</h3>
            <button
              onClick={() => {
                if (confirm('Tem certeza que deseja reiniciar todo o seu progresso e nivelamento das unidades?')) {
                  onResetProgress();
                  onClose();
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#E65353]/10 hover:bg-[#E65353]/20 border border-[#E65353]/40 text-[#E65353] font-bold uppercase flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={14} /> Reiniciar Todo o Progresso
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-[#4C8DFF] hover:bg-[#3B72D9] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
        >
          Salvar & Fechar
        </button>
      </div>
    </div>
  );
};
