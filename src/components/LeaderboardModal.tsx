import React, { useEffect, useState } from 'react';
import { Trophy, X, Loader2, RefreshCw, Crown } from 'lucide-react';
import { fetchLeaderboard } from '../utils/api';
import type { LeaderboardEntry } from '../utils/api';
import { CLASS_DEFINITIONS } from '../data/units';
import { LEVELS } from '../data/levels';

interface LeaderboardModalProps {
  currentUsername?: string;
  onClose: () => void;
}

const MEDAL_COLORS = ['#F5C542', '#C9D1DC', '#D08B4F'];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ currentUsername, onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setEntries(await fetchLeaderboard());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#1B2030] border border-[#343B50] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#343B50] bg-gradient-to-r from-[#D4AD65]/15 to-transparent">
          <h2 className="font-extrabold text-lg flex items-center gap-2 text-[#F3F4F8]">
            <Trophy className="text-[#D4AD65]" size={22} /> Ranking Global
          </h2>
          <div className="flex items-center gap-2">
            <button id="leaderboard-refresh" onClick={load} title="Atualizar" className="p-2 rounded-lg text-[#A7B0C4] hover:text-[#F3F4F8] hover:bg-[#10131C] transition-colors">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button id="leaderboard-close" onClick={onClose} title="Fechar" className="p-2 rounded-lg text-[#A7B0C4] hover:text-[#F3F4F8] hover:bg-[#10131C] transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && !entries && (
            <div className="flex justify-center py-12 text-[#A7B0C4]"><Loader2 className="animate-spin" /></div>
          )}
          {error && (
            <div className="text-sm text-[#FF7A7A] bg-[#FF5252]/10 border border-[#FF5252]/30 rounded-lg px-4 py-3">{error}</div>
          )}
          {entries && entries.length === 0 && (
            <div className="text-center py-12 text-sm text-[#A7B0C4]">Ninguém no ranking ainda. Vença uma fase para ser o primeiro!</div>
          )}

          {entries && entries.length > 0 && (
            <ol className="space-y-2">
              {entries.map((entry, idx) => {
                const isMe = entry.username === currentUsername;
                const medal = MEDAL_COLORS[idx];
                const levelName = LEVELS.find((l) => l.id === entry.highestLevel)?.name;
                return (
                  <li
                    key={entry.username}
                    className={`flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-xl border transition-colors ${
                      isMe ? 'bg-[#4C8DFF]/10 border-[#4C8DFF]/50' : 'bg-[#10131C] border-[#343B50] hover:border-[#4a5270]'
                    }`}
                  >
                    <div
                      className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center font-extrabold text-sm"
                      style={medal ? { backgroundColor: `${medal}22`, color: medal, border: `1px solid ${medal}66` } : { color: '#7C86A0' }}
                    >
                      {idx === 0 ? <Crown size={18} /> : idx + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm truncate">
                        {entry.username} {isMe && <span className="text-[10px] text-[#4C8DFF] font-semibold">(você)</span>}
                      </div>
                      <div className="text-[11px] text-[#A7B0C4] truncate">
                        Fase {entry.highestLevel}/{LEVELS.length}{levelName ? ` · ${levelName}` : ''}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 w-full sm:w-auto sm:justify-end">
                      {entry.party.map((cKey) => {
                        const def = CLASS_DEFINITIONS[cKey];
                        return (
                          <span
                            key={cKey}
                            className="text-[10px] font-bold px-2 py-1 rounded-md text-white/95"
                            style={{ backgroundColor: def?.color ?? '#343B50' }}
                          >
                            {def?.name ?? cKey}
                          </span>
                        );
                      })}
                    </div>

                    <div className="hidden sm:block w-24 shrink-0">
                      <div className="h-1.5 rounded-full bg-[#343B50] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#D4AD65] to-[#fde68a]"
                          style={{ width: `${(entry.highestLevel / LEVELS.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
};
