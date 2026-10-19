import React, { useState } from 'react';
import {
  Shield,
  Target,
  HelpCircle,
  Settings,
  Award,
  Play,
  Gauge,
  BookOpen,
  History,
  Home,
  Package,
  Sparkles,
  Building2,
  Scroll,
  Menu,
  X,
} from 'lucide-react';
import type { BattlePhase, Unit } from '../types/game';

interface TopBarProps {
  levelNumber: number;
  levelName: string;
  turnNumber: number;
  alliesCount: number;
  enemiesCount: number;
  phase: BattlePhase;
  combatSpeed: 'normal' | 'fast';
  bossUnit?: Unit | null;
  onToggleSpeed: () => void;
  onOpenObjectives: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onEndTurn: () => void;
  onOpenBestiary?: () => void;
  onOpenHistory?: () => void;
  onOpenEquipment?: () => void;
  onOpenItemCatalog?: () => void;
  onOpenBaseUpgrades?: () => void;
  onOpenRiddle?: () => void;
  onSaveAndExit?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  levelNumber,
  levelName,
  turnNumber,
  alliesCount,
  enemiesCount,
  phase,
  combatSpeed,
  bossUnit,
  onToggleSpeed,
  onOpenObjectives,
  onOpenSettings,
  onOpenTutorial,
  onEndTurn,
  onOpenBestiary,
  onOpenHistory,
  onOpenEquipment,
  onOpenItemCatalog,
  onOpenBaseUpgrades,
  onOpenRiddle,
  onSaveAndExit,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isPlayerTurn = phase === 'player_turn';
  const isDeployment = phase === 'deployment';

  return (
    <header className="w-full bg-[#1B2030] border-b border-[#343B50] px-3 sm:px-4 py-2 flex flex-col shadow-lg text-[#F3F4F8] select-none z-30 shrink-0">
      {/* ========================================================= */}
      {/* DESKTOP LAYOUT (md:flex) */}
      {/* ========================================================= */}
      <div className="hidden md:flex flex-wrap items-center justify-between gap-3">
        {/* Level & Turn Info */}
        <div className="flex items-center gap-3">
          <div className="bg-[#D4AD65]/10 border border-[#D4AD65]/30 text-[#D4AD65] px-3 py-1 rounded-md font-bold text-sm tracking-wide">
            FASE {levelNumber} / 50
          </div>
          <div>
            <h1 className="font-bold text-base text-[#F3F4F8] leading-tight">{levelName}</h1>
            <div className="text-xs text-[#A7B0C4] flex items-center gap-3 mt-0.5">
              <span>
                Turno <strong className="text-[#F3F4F8]">{turnNumber}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#4C8DFF]">
                <Shield size={12} /> Aliados: <strong>{alliesCount}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#E65353]">
                <Target size={12} /> Inimigos: <strong>{enemiesCount}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Dedicated Boss Healthbar */}
        {bossUnit && !bossUnit.isDead && (
          <div className="flex flex-col items-center min-w-[240px] bg-[#10131C] px-3 py-1 rounded-xl border border-[#E65353]/50">
            <div className="flex items-center justify-between w-full text-[11px] font-bold text-[#E65353]">
              <span>{bossUnit.name}</span>
              <span>
                {bossUnit.currentHp} / {bossUnit.maxHp} HP
              </span>
            </div>
            <div className="w-full bg-[#1B2030] h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-gradient-to-r from-[#E65353] to-[#9333EA] h-full transition-all duration-300"
                style={{ width: `${Math.max(0, (bossUnit.currentHp / bossUnit.maxHp) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Turn Banner & Action */}
        <div className="flex items-center gap-3">
          {isDeployment ? (
            <div className="bg-[#D4AD65]/20 border border-[#D4AD65] text-[#D4AD65] px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AD65]" />
              POSICIONAMENTO
            </div>
          ) : isPlayerTurn ? (
            <div className="bg-[#4C8DFF]/20 border border-[#4C8DFF] text-[#4C8DFF] px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4C8DFF] animate-ping" />
              SEU TURNO
            </div>
          ) : (
            <div className="bg-[#E65353]/20 border border-[#E65353] text-[#E65353] px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E65353] animate-pulse" />
              TURNO DO INIMIGO
            </div>
          )}

          {isPlayerTurn && (
            <button
              onClick={onEndTurn}
              className="bg-gradient-to-r from-[#4C8DFF] to-[#3B72D9] hover:from-[#3B72D9] hover:to-[#2B56A6] text-white px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95 border border-[#6BA0FF]/40 cursor-pointer"
            >
              <Play size={14} fill="currentColor" /> Finalizar Turno (Espaço)
            </button>
          )}
        </div>

        {/* Desktop Controls */}
        <div className="flex items-center gap-1.5">
          {/* Speed Toggle */}
          <button
            onClick={onToggleSpeed}
            className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              combatSpeed === 'fast'
                ? 'bg-[#F0B44D]/20 border-[#F0B44D] text-[#F0B44D]'
                : 'bg-[#10131C] border-[#343B50] text-[#A7B0C4]'
            }`}
            title="Velocidade de Animação do Combate"
          >
            <Gauge size={16} />
            <span className="hidden lg:inline">{combatSpeed === 'fast' ? 'Vel: 2.0x' : 'Vel: 1.0x'}</span>
          </button>

          {onOpenBestiary && (
            <button
              onClick={onOpenBestiary}
              className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#D4AD65] text-[#A7B0C4] hover:text-[#D4AD65] transition-colors cursor-pointer"
              title="Abrir Bestiário"
            >
              <BookOpen size={16} />
            </button>
          )}

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#A7B0C4] hover:text-[#4C8DFF] transition-colors cursor-pointer"
              title="Histórico de Aventuras"
            >
              <History size={16} />
            </button>
          )}

          {onOpenEquipment && (
            <button
              onClick={onOpenEquipment}
              className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#F0B44D] text-[#A7B0C4] hover:text-[#F0B44D] transition-colors cursor-pointer"
              title="Equipamentos da Equipe"
            >
              <Package size={16} />
            </button>
          )}

          {onOpenItemCatalog && (
            <button
              onClick={onOpenItemCatalog}
              className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#B58AFF] text-[#A7B0C4] hover:text-[#B58AFF] transition-colors cursor-pointer"
              title="Catálogo de Itens"
            >
              <Sparkles size={16} />
            </button>
          )}

          {onOpenBaseUpgrades && (
            <button
              onClick={onOpenBaseUpgrades}
              className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#D4AD65] text-[#A7B0C4] hover:text-[#D4AD65] transition-colors cursor-pointer"
              title="Base de Operações & Upgrades"
            >
              <Building2 size={16} />
            </button>
          )}

          {onOpenRiddle && (
            <button
              onClick={onOpenRiddle}
              className="px-2.5 py-1.5 rounded-lg bg-[#240046] border border-[#9D4EDD] text-[#E0AAFF] hover:bg-[#3C096C] hover:border-[#C77DFF] transition-all shadow-md shadow-[#9D4EDD]/20 flex items-center gap-1.5 animate-pulse cursor-pointer"
              title="A Profecia do Vazio (Inscrição do Pedestal)"
            >
              <Scroll size={16} className="text-[#E0AAFF]" />
              <span className="hidden lg:inline text-xs font-bold text-[#E0AAFF]">Profecia</span>
            </button>
          )}

          <button
            onClick={onOpenObjectives}
            className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#D4AD65] text-[#A7B0C4] hover:text-[#D4AD65] transition-colors cursor-pointer"
            title="Objetivos da Fase"
          >
            <Award size={16} />
          </button>

          <button
            onClick={onOpenTutorial}
            className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#A7B0C4] hover:text-[#4C8DFF] transition-colors cursor-pointer"
            title="Tutorial"
          >
            <HelpCircle size={16} />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#A7B0C4] hover:text-[#4C8DFF] transition-colors cursor-pointer"
            title="Configurações de Áudio"
          >
            <Settings size={16} />
          </button>

          {onSaveAndExit && (
            <button
              onClick={onSaveAndExit}
              className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#F0B44D] text-[#A7B0C4] hover:text-[#F0B44D] transition-colors cursor-pointer"
              title="Salvar e Sair ao Menu"
            >
              <Home size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE COMPACT HEADER (md:hidden) */}
      {/* ========================================================= */}
      <div className="flex md:hidden items-center justify-between w-full gap-2">
        {/* Left: Stage & Turn info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-[#D4AD65]/15 border border-[#D4AD65]/40 text-[#D4AD65] px-2 py-0.5 rounded font-black text-xs shrink-0">
            F{levelNumber}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-[#F3F4F8] truncate max-w-[110px] leading-tight">
              {levelName}
            </div>
            <div className="text-[10px] text-[#A7B0C4] flex items-center gap-1.5">
              <span>T{turnNumber}</span>
              <span>•</span>
              <span className="text-[#4C8DFF] font-semibold">{alliesCount}A</span>
              <span>•</span>
              <span className="text-[#E65353] font-semibold">{enemiesCount}I</span>
            </div>
          </div>
        </div>

        {/* Center / Right: Phase badge, End Turn, Speed & Menu */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Phase Badge */}
          {isDeployment ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AD65]/20 text-[#D4AD65] border border-[#D4AD65]/40 animate-pulse">
              Posicionar
            </span>
          ) : isPlayerTurn ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4C8DFF]/20 text-[#4C8DFF] border border-[#4C8DFF]/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4C8DFF] animate-ping" /> Seu Turno
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E65353]/20 text-[#E65353] border border-[#E65353]/40">
              Inimigo
            </span>
          )}

          {/* Quick End Turn on Mobile */}
          {isPlayerTurn && (
            <button
              onClick={onEndTurn}
              className="bg-gradient-to-r from-[#4C8DFF] to-[#2563EB] text-white px-2.5 py-1 rounded-lg font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow transition-all active:scale-95 border border-[#6BA0FF]/40"
              title="Passar Turno"
            >
              <Play size={11} fill="currentColor" /> Fim
            </button>
          )}

          {/* Speed Toggle */}
          <button
            onClick={onToggleSpeed}
            className={`p-1.5 rounded-lg border text-[11px] font-bold transition-colors ${
              combatSpeed === 'fast'
                ? 'bg-[#F0B44D]/20 border-[#F0B44D] text-[#F0B44D]'
                : 'bg-[#10131C] border-[#343B50] text-[#A7B0C4]'
            }`}
            title="Velocidade"
          >
            {combatSpeed === 'fast' ? '2x' : '1x'}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-1.5 rounded-lg border transition-all ${
              mobileMenuOpen
                ? 'bg-[#D4AD65] text-[#10131C] border-[#D4AD65]'
                : 'bg-[#10131C] border-[#343B50] text-[#F3F4F8] hover:border-[#D4AD65]'
            }`}
            title="Menu da Batalha"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Boss Healthbar */}
      {bossUnit && !bossUnit.isDead && (
        <div className="flex md:hidden flex-col w-full bg-[#10131C] px-2.5 py-1 rounded-lg border border-[#E65353]/50 mt-1.5">
          <div className="flex items-center justify-between w-full text-[10px] font-bold text-[#E65353]">
            <span className="truncate">{bossUnit.name}</span>
            <span>
              {bossUnit.currentHp} / {bossUnit.maxHp} HP
            </span>
          </div>
          <div className="w-full bg-[#1B2030] h-1.5 rounded-full overflow-hidden mt-0.5">
            <div
              className="bg-gradient-to-r from-[#E65353] to-[#9333EA] h-full transition-all duration-300"
              style={{ width: `${Math.max(0, (bossUnit.currentHp / bossUnit.maxHp) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MOBILE POPUP MENU DRAWER */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end md:hidden animate-in fade-in duration-150"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-[#1B2030] border-t-2 border-[#D4AD65] rounded-t-3xl p-4 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#343B50]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#D4AD65] uppercase tracking-wider">
                  Menu da Aventura — Fase {levelNumber}
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg bg-[#10131C] border border-[#343B50] text-[#A7B0C4] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              {onOpenEquipment && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenEquipment();
                  }}
                  className="p-3 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#F0B44D] text-[#F0B44D] flex items-center gap-2.5 transition-all active:scale-95"
                >
                  <Package size={18} />
                  <span>Equipamentos</span>
                </button>
              )}

              {onOpenBaseUpgrades && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBaseUpgrades();
                  }}
                  className="p-3 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#D4AD65] text-[#D4AD65] flex items-center gap-2.5 transition-all active:scale-95"
                >
                  <Building2 size={18} />
                  <span>Base & Upgrades</span>
                </button>
              )}

              {onOpenItemCatalog && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenItemCatalog();
                  }}
                  className="p-3 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#B58AFF] text-[#B58AFF] flex items-center gap-2.5 transition-all active:scale-95"
                >
                  <Sparkles size={18} />
                  <span>Catálogo de Itens</span>
                </button>
              )}

              {onOpenBestiary && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBestiary();
                  }}
                  className="p-3 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#4C8DFF] flex items-center gap-2.5 transition-all active:scale-95"
                >
                  <BookOpen size={18} />
                  <span>Bestiário</span>
                </button>
              )}

              {onOpenHistory && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenHistory();
                  }}
                  className="p-3 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#A7B0C4] flex items-center gap-2.5 transition-all active:scale-95"
                >
                  <History size={18} />
                  <span>Histórico</span>
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenObjectives();
                }}
                className="p-3 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#D4AD65] text-[#D4AD65] flex items-center gap-2.5 transition-all active:scale-95"
              >
                <Award size={18} />
                <span>Objetivos</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTutorial();
                }}
                className="p-3 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#A7B0C4] flex items-center gap-2.5 transition-all active:scale-95"
              >
                <HelpCircle size={18} />
                <span>Tutorial</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSettings();
                }}
                className="p-3 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#A7B0C4] flex items-center gap-2.5 transition-all active:scale-95"
              >
                <Settings size={18} />
                <span>Áudio & Ajustes</span>
              </button>
            </div>

            {onOpenRiddle && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRiddle();
                }}
                className="w-full p-3 rounded-xl bg-[#240046] border border-[#9D4EDD] text-[#E0AAFF] font-bold text-xs flex items-center justify-center gap-2 shadow-md animate-pulse"
              >
                <Scroll size={18} /> A Profecia do Vazio (Pedestal)
              </button>
            )}

            {onSaveAndExit && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSaveAndExit();
                }}
                className="w-full py-3 rounded-xl bg-[#10131C] border border-[#E65353]/50 text-[#FF7A7A] hover:bg-[#E65353]/20 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Home size={16} /> Salvar & Voltar ao Menu
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
