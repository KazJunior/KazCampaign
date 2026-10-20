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
    <>
      {/* ========================================================= */}
      {/* DESKTOP LAYOUT (md:flex) */}
      {/* ========================================================= */}
      <header className="hidden md:flex w-full bg-[#1B2030] border-b border-[#343B50] px-3 sm:px-4 py-2 flex-col shadow-lg text-[#F3F4F8] select-none z-30 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
    </header>

      {/* ========================================================= */}
      {/* MOBILE FLOATING HUD & LATERAL MENU (md:hidden) */}
      {/* ========================================================= */}
      {/* 1. Mobile Stage & Turn Floating Badge (Top-Left) */}
      <div className="md:hidden fixed top-2 left-2 z-30 pointer-events-none flex flex-col gap-1 max-w-[calc(100vw-110px)]">
        <div className="bg-[#1B2030]/95 backdrop-blur-md border border-[#343B50] px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-2 pointer-events-auto">
          <span className="bg-[#D4AD65]/20 text-[#D4AD65] border border-[#D4AD65]/40 text-[10px] font-black px-1.5 py-0.5 rounded shrink-0">
            F{levelNumber}
          </span>
          <span className="text-xs font-bold text-[#F3F4F8] truncate leading-tight">
            {levelName}
          </span>
          <span className="text-[10px] text-[#A7B0C4] shrink-0 font-semibold">
            T{turnNumber}
          </span>
        </div>

        {/* Mobile Boss Healthbar floating if boss alive */}
        {bossUnit && !bossUnit.isDead && (
          <div className="bg-[#10131C]/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-[#E65353]/50 shadow-lg pointer-events-auto">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#E65353] gap-2">
              <span className="truncate max-w-[120px]">{bossUnit.name}</span>
              <span>
                {bossUnit.currentHp}/{bossUnit.maxHp} HP
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
      </div>

      {/* 2. Mobile Floating Lateral Dock (Top-Right / Lateral Edge) */}
      <div className="md:hidden fixed top-2 right-2 z-30 flex flex-col items-end gap-1.5 pointer-events-auto">
        {/* Main Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center gap-1.5 bg-[#1B2030]/95 backdrop-blur-md border border-[#D4AD65]/70 text-[#D4AD65] px-2.5 py-1.5 rounded-xl shadow-xl active:scale-95 transition-all text-xs font-black cursor-pointer"
          title="Abrir Menu Lateral"
        >
          <Menu size={16} />
          <span>Menu</span>
        </button>

        {/* Speed Toggle Shortcut */}
        <button
          onClick={onToggleSpeed}
          className={`px-2 py-1 rounded-lg border text-[11px] font-black backdrop-blur-md shadow-md active:scale-95 transition-all cursor-pointer ${
            combatSpeed === 'fast'
              ? 'bg-[#F0B44D]/25 border-[#F0B44D] text-[#F0B44D]'
              : 'bg-[#10131C]/95 border-[#343B50] text-[#A7B0C4]'
          }`}
          title="Velocidade"
        >
          {combatSpeed === 'fast' ? '⚡ 2x' : '1x'}
        </button>

        {/* Quick Equipment Shortcut */}
        {onOpenEquipment && (
          <button
            onClick={onOpenEquipment}
            className="p-1.5 rounded-lg bg-[#10131C]/95 backdrop-blur-md border border-[#343B50] hover:border-[#F0B44D] text-[#F0B44D] shadow-md active:scale-95 transition-all cursor-pointer"
            title="Equipamentos"
          >
            <Package size={16} />
          </button>
        )}

        {/* Quick Objectives Shortcut */}
        <button
          onClick={onOpenObjectives}
          className="p-1.5 rounded-lg bg-[#10131C]/95 backdrop-blur-md border border-[#343B50] hover:border-[#D4AD65] text-[#D4AD65] shadow-md active:scale-95 transition-all cursor-pointer"
          title="Objetivos"
        >
          <Award size={16} />
        </button>
      </div>

      {/* 3. Mobile Lateral Drawer (Slide-in from Right) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end md:hidden animate-in fade-in duration-150"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 sm:w-80 h-full bg-[#1B2030] border-l-2 border-[#D4AD65] p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 overflow-y-auto select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Header with Title and Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-[#343B50] mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AD65]/15 border border-[#D4AD65]/40 flex items-center justify-center text-[#D4AD65]">
                    <Shield size={16} />
                  </div>
                  <div>
                    <h3 className="font-black text-xs text-[#F3F4F8] uppercase tracking-wider">
                      Menu Lateral
                    </h3>
                    <p className="text-[10px] text-[#A7B0C4]">
                      Fase {levelNumber} • Turno {turnNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-[#10131C] border border-[#343B50] text-[#A7B0C4] hover:text-white active:scale-95 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Pill: Phase & Units */}
              <div className="bg-[#10131C] p-2.5 rounded-xl border border-[#343B50] mb-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A7B0C4]">Status da Batalha:</span>
                  {isDeployment ? (
                    <span className="text-[#D4AD65] font-black text-[11px] animate-pulse">
                      POSICIONAMENTO
                    </span>
                  ) : isPlayerTurn ? (
                    <span className="text-[#4C8DFF] font-black text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4C8DFF] animate-ping" /> SEU TURNO
                    </span>
                  ) : (
                    <span className="text-[#E65353] font-black text-[11px]">TURNO DO INIMIGO</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#343B50]/60">
                  <span className="text-[#4C8DFF] font-bold flex items-center gap-1">
                    <Shield size={12} /> {alliesCount} Aliados
                  </span>
                  <span className="text-[#E65353] font-bold flex items-center gap-1">
                    <Target size={12} /> {enemiesCount} Inimigos
                  </span>
                </div>
              </div>

              {/* Action Button: End Turn or Confirm Deployment */}
              {isPlayerTurn && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onEndTurn();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#4C8DFF] to-[#2563EB] hover:from-[#3B82F6] hover:to-[#1D4ED8] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all border border-[#6BA0FF]/40 mb-3 cursor-pointer"
                >
                  <Play size={14} fill="currentColor" /> Passar Turno
                </button>
              )}

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {onOpenEquipment && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenEquipment();
                    }}
                    className="p-2.5 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#F0B44D] text-[#F0B44D] flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Package size={17} />
                    <span>Equipamentos</span>
                  </button>
                )}

                {onOpenBaseUpgrades && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenBaseUpgrades();
                    }}
                    className="p-2.5 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#D4AD65] text-[#D4AD65] flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Building2 size={17} />
                    <span>Base & Melhorias</span>
                  </button>
                )}

                {onOpenItemCatalog && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenItemCatalog();
                    }}
                    className="p-2.5 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#B58AFF] text-[#B58AFF] flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Sparkles size={17} />
                    <span>Catálogo Itens</span>
                  </button>
                )}

                {onOpenBestiary && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenBestiary();
                    }}
                    className="p-2.5 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#4C8DFF] flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <BookOpen size={17} />
                    <span>Bestiário</span>
                  </button>
                )}

                {onOpenHistory && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenHistory();
                    }}
                    className="p-2.5 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#A7B0C4] flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <History size={17} />
                    <span>Histórico</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenObjectives();
                  }}
                  className="p-2.5 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#D4AD65] text-[#D4AD65] flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Award size={17} />
                  <span>Objetivos</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTutorial();
                  }}
                  className="p-2.5 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#A7B0C4] flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <HelpCircle size={17} />
                  <span>Tutorial</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="p-2.5 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#A7B0C4] flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Settings size={17} />
                  <span>Áudio & Ajustes</span>
                </button>
              </div>

              {onOpenRiddle && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenRiddle();
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#240046] border border-[#9D4EDD] text-[#E0AAFF] font-bold text-xs flex items-center justify-center gap-2 shadow-md animate-pulse mt-2 cursor-pointer"
                >
                  <Scroll size={17} /> A Profecia do Vazio (Pedestal)
                </button>
              )}
            </div>

            {/* Footer with Save & Exit */}
            <div className="pt-3 border-t border-[#343B50] mt-3">
              {onSaveAndExit && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSaveAndExit();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#10131C] border border-[#E65353]/50 text-[#FF7A7A] hover:bg-[#E65353]/20 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Home size={16} /> Salvar & Voltar ao Menu
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
