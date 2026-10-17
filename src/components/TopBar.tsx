import React from 'react';
import {
  Shield,
  Target,
  HelpCircle,
  Settings,
  RotateCcw,
  Award,
  Play,
  Gauge,
  BookOpen,
  History,
  Home,
  Package,
  Sparkles,
  Building2,
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
  onRestartLevel: () => void;
  onEndTurn: () => void;
  onOpenBestiary?: () => void;
  onOpenHistory?: () => void;
  onOpenEquipment?: () => void;
  onOpenItemCatalog?: () => void;
  onOpenBaseUpgrades?: () => void;
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
  onRestartLevel,
  onEndTurn,
  onOpenBestiary,
  onOpenHistory,
  onOpenEquipment,
  onOpenItemCatalog,
  onOpenBaseUpgrades,
  onSaveAndExit,
}) => {
  const isPlayerTurn = phase === 'player_turn';
  const isDeployment = phase === 'deployment';

  return (
    <header className="w-full bg-[#1B2030] border-b border-[#343B50] px-4 py-2 flex flex-wrap items-center justify-between shadow-lg text-[#F3F4F8] select-none gap-2">
      {/* Level & Turn Info */}
      <div className="flex items-center gap-3">
        <div className="bg-[#D4AD65]/10 border border-[#D4AD65]/30 text-[#D4AD65] px-3 py-1 rounded-md font-bold text-sm tracking-wide">
          FASE {levelNumber} / 50
        </div>
        <div>
          <h1 className="font-bold text-base text-[#F3F4F8] leading-tight">{levelName}</h1>
          <div className="text-xs text-[#A7B0C4] flex items-center gap-3 mt-0.5">
            <span>Turno <strong className="text-[#F3F4F8]">{turnNumber}</strong></span>
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
        <div className="hidden md:flex flex-col items-center min-w-[240px] bg-[#10131C] px-3 py-1 rounded-xl border border-[#E65353]/50">
          <div className="flex items-center justify-between w-full text-[11px] font-bold text-[#E65353]">
            <span>{bossUnit.name}</span>
            <span>{bossUnit.currentHp} / {bossUnit.maxHp} HP</span>
          </div>
          <div className="w-full bg-[#1B2030] h-2 rounded-full overflow-hidden mt-1">
            <div
              className="bg-gradient-to-r from-[#E65353] to-[#9333EA] h-full transition-all duration-300"
              style={{ width: `${Math.max(0, (bossUnit.currentHp / bossUnit.maxHp) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Turn Banner & Combat Speed Toggle */}
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
            className="bg-gradient-to-r from-[#4C8DFF] to-[#3B72D9] hover:from-[#3B72D9] hover:to-[#2B56A6] text-white px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95 border border-[#6BA0FF]/40"
          >
            <Play size={14} fill="currentColor" /> Finalizar Turno (Espaço)
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Speed Toggle */}
        <button
          onClick={onToggleSpeed}
          className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
            combatSpeed === 'fast'
              ? 'bg-[#F0B44D]/20 border-[#F0B44D] text-[#F0B44D]'
              : 'bg-[#10131C] border-[#343B50] text-[#A7B0C4]'
          }`}
          title="Velocidade de Animação do Combate"
        >
          <Gauge size={16} />
          <span className="hidden sm:inline">{combatSpeed === 'fast' ? 'Vel: 2.0x' : 'Vel: 1.0x'}</span>
        </button>

        {/* Bestiary shortcut */}
        {onOpenBestiary && (
          <button
            onClick={onOpenBestiary}
            className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#D4AD65] text-[#A7B0C4] hover:text-[#D4AD65] transition-colors"
            title="Abrir Bestiário"
          >
            <BookOpen size={16} />
          </button>
        )}

        {/* History shortcut */}
        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#A7B0C4] hover:text-[#4C8DFF] transition-colors"
            title="Histórico de Aventuras"
          >
            <History size={16} />
          </button>
        )}

        {/* Equipment shortcut */}
        {onOpenEquipment && (
          <button
            onClick={onOpenEquipment}
            className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#F0B44D] text-[#A7B0C4] hover:text-[#F0B44D] transition-colors"
            title="Equipamentos da Equipe"
          >
            <Package size={16} />
          </button>
        )}

        {/* Item Catalog shortcut */}
        {onOpenItemCatalog && (
          <button
            onClick={onOpenItemCatalog}
            className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#B58AFF] text-[#A7B0C4] hover:text-[#B58AFF] transition-colors"
            title="Catálogo de Itens"
          >
            <Sparkles size={16} />
          </button>
        )}

        {/* Base & Upgrades shortcut */}
        {onOpenBaseUpgrades && (
          <button
            onClick={onOpenBaseUpgrades}
            className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#D4AD65] text-[#A7B0C4] hover:text-[#D4AD65] transition-colors"
            title="Base de Operações & Upgrades"
          >
            <Building2 size={16} />
          </button>
        )}

        <button
          onClick={onOpenObjectives}
          className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#D4AD65] text-[#A7B0C4] hover:text-[#D4AD65] transition-colors"
          title="Objetivos da Fase"
        >
          <Award size={16} />
        </button>

        <button
          onClick={onOpenTutorial}
          className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#A7B0C4] hover:text-[#4C8DFF] transition-colors"
          title="Tutorial"
        >
          <HelpCircle size={16} />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#4C8DFF] text-[#A7B0C4] hover:text-[#4C8DFF] transition-colors"
          title="Configurações de Áudio"
        >
          <Settings size={16} />
        </button>

        <button
          onClick={onRestartLevel}
          className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#E65353] text-[#A7B0C4] hover:text-[#E65353] transition-colors"
          title="Reiniciar Esta Batalha"
        >
          <RotateCcw size={16} />
        </button>

        {/* Save and Exit to Menu */}
        {onSaveAndExit && (
          <button
            onClick={onSaveAndExit}
            className="p-2 rounded-lg bg-[#10131C] border border-[#343B50] hover:border-[#F0B44D] text-[#A7B0C4] hover:text-[#F0B44D] transition-colors"
            title="Salvar e Sair ao Menu"
          >
            <Home size={16} />
          </button>
        )}
      </div>
    </header>
  );
};
