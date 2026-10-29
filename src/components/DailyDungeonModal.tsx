import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Coins,
  Sparkles,
  ShieldAlert,
  Swords,
  CheckCircle2,
  Flame,
  Zap,
} from 'lucide-react';
import type { DailyDungeonConfig, DailyDungeonState } from '../types/game';
import { CLASS_DEFINITIONS } from '../data/units';
import { SKILLS } from '../data/skills';
import { MONSTER_DEFINITIONS } from '../data/monsters';
import { useMidnightCountdown, getTodayDateString } from '../utils/dailyDungeon';
import { soundManager } from '../utils/audio';

interface DailyDungeonModalProps {
  config: DailyDungeonConfig;
  dailyState?: DailyDungeonState;
  onStartDailyDungeon: () => void;
  onClose: () => void;
}

export const DailyDungeonModal: React.FC<DailyDungeonModalProps> = ({
  config,
  dailyState,
  onStartDailyDungeon,
  onClose,
}) => {
  const { formatted } = useMidnightCountdown();
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);

  const todayKey = getTodayDateString();
  const isCompletedToday = dailyState?.lastCompletedDate === todayKey;

  const handleStart = () => {
    if (isCompletedToday) return;
    soundManager.playTurnStart(true);
    onStartDailyDungeon();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans overflow-y-auto">
      <div className="bg-[#151926] border-2 border-[#D4AD65]/60 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl text-[#F3F4F8] p-4 sm:p-6 space-y-5 relative">
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#1B2030] border border-[#343B50] hover:border-red-400 text-[#A7B0C4] hover:text-white transition-all cursor-pointer"
          title="Fechar"
        >
          <X size={20} />
        </button>

        {/* Cabeçalho */}
        <div className="space-y-2 text-center sm:text-left pr-10">
          <div className="inline-flex items-center gap-2 bg-[#D4AD65]/15 border border-[#D4AD65]/40 text-[#D4AD65] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
            <Flame size={15} className="text-[#FFD700] animate-pulse" />
            <span>Modo de Desafio Diário</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
            <span className="text-white">Reseta a cada 24 Horas</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 justify-center sm:justify-start">
                <Calendar size={28} className="text-[#D4AD65]" />
                <span>Fase Diária</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#A7B0C4] capitalize">
                {config.formattedDate}
              </p>
            </div>

            {/* Timer regressivo até a meia-noite */}
            <div className="bg-[#10131C] border border-[#343B50] rounded-2xl px-4 py-2.5 flex items-center gap-3 self-center sm:self-auto">
              <Clock size={20} className="text-[#4C8DFF] animate-spin" style={{ animationDuration: '8s' }} />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-[#A7B0C4] tracking-wider">
                  Reset à Meia-Noite
                </div>
                <div className="text-sm font-mono font-black text-[#F3F4F8]">
                  {formatted}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Recompensa & Status */}
        <div
          className={`rounded-2xl p-4 sm:p-5 border-2 transition-all ${
            isCompletedToday
              ? 'bg-emerald-950/30 border-emerald-500/60'
              : 'bg-gradient-to-r from-[#D4AD65]/15 via-[#F0B44D]/10 to-amber-500/15 border-[#D4AD65]'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-lg shrink-0 ${
                  isCompletedToday
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                    : 'bg-[#D4AD65]/20 border-[#D4AD65] text-[#FFD700]'
                }`}
              >
                {isCompletedToday ? <CheckCircle2 size={32} /> : <Coins size={32} />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {isCompletedToday ? 'Desafio de Hoje Concluído!' : 'Recompensa do Desafio'}
                  </h3>
                  {isCompletedToday ? (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                      Concluído
                    </span>
                  ) : (
                    <span className="bg-[#D4AD65]/20 text-[#FFD700] border border-[#D4AD65]/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                      Disponível
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#A7B0C4] max-w-xl">
                  {isCompletedToday
                    ? 'Você já superou o desafio do dia e garantiu seus 20.000 de ouro! O próximo desafio aleatório será liberado exatamente à meia-noite.'
                    : 'Complete a fase para receber a recompensa. Você pode tentar quantas vezes quiser até passar! Derrotas não consomem o desafio.'}
                </p>
              </div>
            </div>

            {/* Caixa com o valor em Ouro */}
            <div className="bg-[#10131C] border border-[#D4AD65]/40 rounded-xl px-5 py-3 text-center shrink-0 shadow-md">
              <div className="text-[10px] uppercase font-bold text-[#A7B0C4] tracking-wider">
                Recompensa
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#FFD700] flex items-center justify-center gap-1.5">
                <Coins size={22} className="text-[#FFD700]" />
                <span>+20.000</span>
              </div>
              <div className="text-[10px] font-bold text-[#A7B0C4]">Ouro para sua Conta</div>
            </div>
          </div>
        </div>

        {/* Informações das Regras */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#1B2030] border border-[#343B50] rounded-xl p-3 flex items-start gap-2.5">
            <Zap size={18} className="text-[#FFD700] shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-white block font-bold">Tentativas Ilimitadas</strong>
              <span className="text-[#A7B0C4] text-[11px]">
                Jogue quantas vezes quiser até passar. Derrotas não impedem novas tentativas.
              </span>
            </div>
          </div>

          <div className="bg-[#1B2030] border border-[#343B50] rounded-xl p-3 flex items-start gap-2.5">
            <Sparkles size={18} className="text-[#B58AFF] shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-white block font-bold">Tudo Aleatório</strong>
              <span className="text-[#A7B0C4] text-[11px]">
                Heróis, habilidades sorteadas, monstros e chefe mudam a cada 24 horas.
              </span>
            </div>
          </div>

          <div className="bg-[#1B2030] border border-[#343B50] rounded-xl p-3 flex items-start gap-2.5">
            <Clock size={18} className="text-[#4C8DFF] shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-white block font-bold">Reset à Meia-Noite</strong>
              <span className="text-[#A7B0C4] text-[11px]">
                Exatamente às 00:00:00 o desafio reinicia com novas combinações!
              </span>
            </div>
          </div>
        </div>

        {/* Equipe Sorteada do Dia */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#343B50] pb-2">
            <div className="flex items-center gap-2">
              <Swords size={18} className="text-[#4C8DFF]" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Equipe Sorteada do Dia (Nv. {config.heroLevel})
              </h3>
            </div>
            <span className="text-xs text-[#A7B0C4]">4 Heróis com Habilidades Sorteadas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {config.partyClasses.map((className, idx) => {
              const def = CLASS_DEFINITIONS[className] || CLASS_DEFINITIONS['guerreiro'];
              const baseSkill = SKILLS[def.baseSkillId];
              const extraSkillIds = config.heroSkills[className] || [];
              const allSkills = [baseSkill, ...extraSkillIds.map((id) => SKILLS[id])].filter(Boolean);

              return (
                <div
                  key={idx}
                  className="bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF]/60 rounded-2xl p-3.5 space-y-3 transition-all flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: `${def.color}25`, color: def.color }}
                      >
                        Vaga #{idx + 1}
                      </span>
                      <span className="text-[11px] font-bold text-[#A7B0C4]">Nv. {config.heroLevel}</span>
                    </div>

                    <h4 className="font-black text-base text-white" style={{ color: def.color }}>
                      {def.name}
                    </h4>
                    <p className="text-[11px] text-[#A7B0C4] line-clamp-1">{def.role}</p>
                  </div>

                  {/* Habilidades Sorteadas */}
                  <div className="space-y-1.5 pt-2 border-t border-[#343B50]/60">
                    <div className="text-[10px] uppercase font-bold text-[#A7B0C4] tracking-wider">
                      Habilidades Sorteadas ({allSkills.length}):
                    </div>

                    <div className="space-y-1">
                      {allSkills.map((sk, sIdx) => {
                        const isBase = sk.id === def.baseSkillId;
                        const isHovered = hoveredSkillId === sk.id;

                        return (
                          <div
                            key={sIdx}
                            onMouseEnter={() => setHoveredSkillId(sk.id)}
                            onMouseLeave={() => setHoveredSkillId(null)}
                            className="group relative bg-[#1B2030] hover:bg-[#252C42] border border-[#343B50] hover:border-[#D4AD65] rounded-lg px-2 py-1 flex items-center justify-between transition-all cursor-help"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isBase ? 'bg-[#FFD700]' : 'bg-[#4C8DFF]'
                                }`}
                              />
                              <span className="text-[11px] font-bold text-white truncate max-w-[120px]">
                                {sk.name}
                              </span>
                            </div>

                            <span className="text-[9px] text-[#A7B0C4] shrink-0 font-mono">
                              CD: {sk.cooldownMax}t
                            </span>

                            {/* Tooltip da habilidade */}
                            {isHovered && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-[#0C0E14] border-2 border-[#D4AD65] rounded-xl text-left z-30 shadow-2xl pointer-events-none">
                                <div className="text-xs font-black text-[#FFD700] mb-0.5">{sk.name}</div>
                                <div className="text-[10px] text-white/90 leading-tight mb-1">
                                  {sk.description}
                                </div>
                                <div className="flex items-center justify-between text-[9px] text-[#A7B0C4] pt-1 border-t border-[#343B50]">
                                  <span>Alcance: {sk.rangeMax === 0 ? 'Próprio' : `${sk.rangeMin}-${sk.rangeMax}`}</span>
                                  <span>Recarga: {sk.cooldownMax} turnos</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inimigos Sorteados */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#343B50] pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-[#E65353]" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Ameaças do Desafio
              </h3>
            </div>
            <span className="text-xs text-[#A7B0C4]">Chefe e Comitiva Sorteados</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
            {config.levelConfig.enemySpawns.map((spawn, idx) => {
              const def = MONSTER_DEFINITIONS[spawn.monsterTypeId];
              if (!def) return null;
              const isBoss = spawn.isBoss;

              return (
                <div
                  key={idx}
                  className={`rounded-xl p-3 border flex flex-col justify-between transition-all ${
                    isBoss
                      ? 'bg-red-950/30 border-red-500/60 shadow-md shadow-red-950/40 md:col-span-1'
                      : 'bg-[#10131C] border-[#343B50]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                          isBoss ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {isBoss ? 'Líder / Chefe' : 'Inimigo'}
                      </span>
                      <span className="text-[10px] font-bold text-[#A7B0C4]">
                        {def.role === 'tank' ? 'Tanque' : def.role === 'support' ? 'Suporte' : 'Ataque'}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-white truncate" title={def.name}>
                      {def.name}
                    </div>
                    <div className="text-[10px] text-[#A7B0C4] line-clamp-1">
                      {def.description}
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-400 pt-2 border-t border-[#343B50]/40 flex justify-between">
                    <span>Vida: {def.maxHp}</span>
                    <span>Alcance: {def.range}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé / Botões de Ação */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-[#343B50]">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1B2030] hover:bg-[#252C42] border border-[#343B50] text-[#A7B0C4] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Voltar ao Menu
          </button>

          {isCompletedToday ? (
            <div className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed">
              <CheckCircle2 size={16} />
              <span>Concluído Hoje! (Reset em {formatted})</span>
            </div>
          ) : (
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AD65] via-[#F0B44D] to-[#D4AD65] hover:from-[#FFD700] hover:to-[#F0B44D] text-[#10131C] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-[#D4AD65]/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Swords size={20} />
              <span>Iniciar Fase Diária (+20.000 Ouro)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
