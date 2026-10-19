import React, { useEffect } from 'react';
import { X, History, Trophy, Skull, Coins, Calendar, ShieldAlert } from 'lucide-react';
import type { AdventureRecord } from '../types/game';
import { CLASS_DEFINITIONS } from '../data/units';

interface AdventureHistoryModalProps {
  history: AdventureRecord[];
  onClose: () => void;
}

export const AdventureHistoryModal: React.FC<AdventureHistoryModalProps> = ({
  history,
  onClose,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#1B2030] border-2 border-[#D4AD65]/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#343B50] bg-gradient-to-r from-[#D4AD65]/20 via-[#1B2030] to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#10131C] border border-[#D4AD65]/40 text-[#D4AD65]">
              <History size={22} />
            </div>
            <div>
              <h2 className="font-black text-lg text-[#F3F4F8] flex items-center gap-2">
                Histórico de Aventuras
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#10131C] text-[#D4AD65] border border-[#D4AD65]/40">
                  Últimas {history.length} / 10
                </span>
              </h2>
              <p className="text-xs text-[#A7B0C4]">
                Registro de suas tentativas, façanhas e marcos alcançados na campanha.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A7B0C4] hover:text-[#F3F4F8] hover:bg-[#10131C] transition-colors border border-transparent hover:border-[#343B50]"
          >
            <X size={20} />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[#A7B0C4]">
              <ShieldAlert size={48} className="text-[#343B50] mb-3" />
              <h3 className="font-bold text-base text-[#F3F4F8]">Nenhuma aventura concluída ainda</h3>
              <p className="text-xs text-[#A7B0C4] max-w-sm mt-1">
                Inicie sua jornada! Quando sua aventura terminar (por derrota ou vitória suprema), o resumo das suas 10 últimas tentativas será arquivado aqui.
              </p>
            </div>
          ) : (
            history.map((record, index) => {
              const isVictory = record.result === 'victory';

              return (
                <div
                  key={record.id || `${record.endedAt}_${index}`}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isVictory
                      ? 'bg-[#10131C] border-[#D4AD65]/60 shadow-lg shadow-[#D4AD65]/5'
                      : 'bg-[#10131C] border-[#343B50] hover:border-[#4A5270]'
                  }`}
                >
                  {/* Left: Index badge, Status, and Stage info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                        isVictory
                          ? 'bg-[#D4AD65]/20 text-[#D4AD65] border-[#D4AD65]/50'
                          : 'bg-[#E65353]/15 text-[#E65353] border-[#E65353]/30'
                      }`}
                    >
                      {isVictory ? <Trophy size={18} /> : <Skull size={18} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            isVictory
                              ? 'bg-gradient-to-r from-[#D4AD65]/30 to-[#B88E43]/30 text-[#D4AD65] border border-[#D4AD65]/50'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {isVictory ? 'Vitória Suprema (Fase 50)' : `Fim na Fase ${record.farthestLevel}`}
                        </span>
                        <span className="text-[11px] text-[#A7B0C4] flex items-center gap-1">
                          <Calendar size={11} /> {formatDate(record.endedAt)}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[#F3F4F8] mt-1 truncate">
                        {record.farthestLevelName || `Fase ${record.farthestLevel}`}
                      </h4>
                    </div>
                  </div>

                  {/* Right: Party composition and Gold */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-[#343B50]/50">
                    {/* Party members avatars */}
                    <div className="flex items-center -space-x-2">
                      {record.partyClasses.map((cKey, idx) => {
                        const def = CLASS_DEFINITIONS[cKey];
                        const color = def?.color || '#4C8DFF';
                        return (
                          <div
                            key={idx}
                            title={def?.name || cKey}
                            className="w-8 h-8 rounded-full border-2 border-[#10131C] flex items-center justify-center shadow-md font-bold text-xs"
                            style={{ backgroundColor: color }}
                          >
                            <span className="text-[10px] text-white uppercase drop-shadow font-black">
                              {cKey.slice(0, 2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Gold reward */}
                    {record.goldEarned > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D4AD65]/10 border border-[#D4AD65]/30 text-[#D4AD65] font-black text-xs shrink-0">
                        <Coins size={14} /> +{record.goldEarned.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
