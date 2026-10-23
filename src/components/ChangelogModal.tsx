import React, { useEffect, useState } from 'react';
import { X, Sparkles, Calendar, ChevronDown, ChevronRight, CheckCircle2, Zap, Bug } from 'lucide-react';
import { GAME_CHANGELOG } from '../data/changelog';

interface ChangelogModalProps {
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ onClose }) => {
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>(() => ({
    [GAME_CHANGELOG[0]?.version || 'v1.4']: true,
  }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggleVersion = (ver: string) => {
    setExpandedVersions((prev) => ({ ...prev, [ver]: !prev[ver] }));
  };

  const getTypeBadge = (type?: string) => {
    switch (type) {
      case 'new':
        return (
          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1 shrink-0">
            <Sparkles size={10} /> Novo
          </span>
        );
      case 'buff':
        return (
          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-[#4C8DFF]/15 text-[#4C8DFF] border border-[#4C8DFF]/30 flex items-center gap-1 shrink-0">
            <Zap size={10} /> Ajuste
          </span>
        );
      case 'fix':
        return (
          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-[#D4AD65]/15 text-[#D4AD65] border border-[#D4AD65]/30 flex items-center gap-1 shrink-0">
            <Bug size={10} /> Correção
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#1B2030] border-2 border-[#D4AD65]/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#343B50] bg-gradient-to-r from-[#D4AD65]/20 via-[#1B2030] to-[#10131C]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#10131C] border border-[#D4AD65]/40 text-[#D4AD65] shadow-sm">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="font-black text-lg text-[#F3F4F8] flex items-center gap-2">
                Log de Atualizações
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  {GAME_CHANGELOG[0]?.version}
                </span>
              </h2>
              <p className="text-xs text-[#A7B0C4]">
                Acompanhe as melhorias, balanceamentos e novidades recentes da campanha.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A7B0C4] hover:text-[#F3F4F8] hover:bg-[#10131C] transition-colors border border-transparent hover:border-[#343B50]"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Entries */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
          {GAME_CHANGELOG.map((entry) => {
            const isExpanded = expandedVersions[entry.version] ?? false;

            return (
              <div
                key={entry.version}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  entry.isLatest
                    ? 'bg-[#10131C] border-[#D4AD65]/60 shadow-lg shadow-[#D4AD65]/5'
                    : 'bg-[#10131C]/60 border-[#343B50] hover:border-[#343B50]/90'
                }`}
              >
                {/* Entry Header */}
                <button
                  onClick={() => toggleVersion(entry.version)}
                  className="w-full px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between text-left hover:bg-[#1B2030]/50 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                        entry.isLatest
                          ? 'bg-[#D4AD65] text-[#10131C] border-[#F0B44D]'
                          : 'bg-[#1B2030] text-[#A7B0C4] border-[#343B50]'
                      }`}
                    >
                      {entry.version}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-[#F3F4F8]">
                      {entry.title}
                    </h3>
                    <span className="text-[10px] text-[#A7B0C4] bg-[#1B2030] border border-[#343B50] px-2 py-0.5 rounded-md hidden sm:inline-block">
                      {entry.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-[#A7B0C4] hidden md:flex items-center gap-1">
                      <Calendar size={12} /> {entry.date}
                    </span>
                    <div className="text-[#A7B0C4]">
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                  </div>
                </button>

                {/* Entry Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-[#343B50]/40 space-y-2.5">
                    <div className="text-[11px] text-[#A7B0C4] md:hidden flex items-center gap-1 pb-1">
                      <Calendar size={12} /> {entry.date} • {entry.tag}
                    </div>

                    <ul className="space-y-2">
                      {entry.changes.map((change, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 bg-[#1B2030]/60 border border-[#343B50]/50 rounded-xl p-2.5 sm:p-3 text-xs leading-relaxed"
                        >
                          <div className="mt-0.5">{getTypeBadge(change.type)}</div>
                          <div className="flex-1">
                            <strong className="text-white block font-bold mb-0.5">
                              {change.highlight}
                            </strong>
                            <p className="text-[#A7B0C4]">{change.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 bg-[#10131C] border-t border-[#343B50] flex items-center justify-between text-xs text-[#A7B0C4]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-[#10B981]" />
            Versão Atual: <strong className="text-[#F3F4F8]">{GAME_CHANGELOG[0]?.version}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#D4AD65] hover:bg-[#E5C27E] text-[#10131C] font-black uppercase text-xs tracking-wider transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
