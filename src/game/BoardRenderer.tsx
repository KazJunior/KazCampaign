import React, { useEffect, useRef } from 'react';
import type { BattlePhase, FloatingNumber, ObstacleType, Point, Skill, TerrainType, TileData, Unit } from '../types/game';

interface BoardRendererProps {
  grid: TileData[][];
  units: Unit[];
  selectedUnit: Unit | null;
  reachableTiles: Point[];
  attackableTiles: Point[];
  aoeTiles: Point[];
  deploymentZone: Point[];
  phase: BattlePhase;
  floatingNumbers: FloatingNumber[];
  onTileClick: (x: number, y: number) => void;
  onTileHover: (x: number, y: number | null) => void;
  hoveredTile: Point | null;
  activeSkill?: Skill;
}

export const BoardRenderer: React.FC<BoardRendererProps> = ({
  grid,
  units,
  selectedUnit,
  reachableTiles,
  attackableTiles,
  aoeTiles,
  deploymentZone,
  phase,
  floatingNumbers,
  onTileClick,
  onTileHover,
  hoveredTile,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const gridWidth = grid[0].length;
  const gridHeight = grid.length;
  const tileSize = 64;

  const totalWidth = gridWidth * tileSize;
  const totalHeight = gridHeight * tileSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, totalWidth, totalHeight);

      // 1. Draw Grid Terrains
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const tile = grid[y][x];
          const px = x * tileSize;
          const py = y * tileSize;

          ctx.fillStyle = getTerrainColor(tile.terrain);
          ctx.fillRect(px, py, tileSize, tileSize);

          ctx.strokeStyle = '#272F44';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, tileSize - 1, tileSize - 1);

          drawTerrainDetails(ctx, tile.terrain, px, py);
        }
      }

      // 2. Draw Highlights & Telegraphed Danger Warnings
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const tile = grid[y][x];
          if (tile.isTelegraphedHazard) {
            ctx.fillStyle = 'rgba(230, 83, 83, 0.45)';
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            ctx.strokeStyle = '#E65353';
            ctx.lineWidth = 2;
            ctx.strokeRect(x * tileSize + 2, y * tileSize + 2, tileSize - 4, tileSize - 4);
          }
        }
      }

      if (phase === 'deployment') {
        deploymentZone.forEach((pt) => {
          ctx.fillStyle = 'rgba(212, 173, 101, 0.25)';
          ctx.fillRect(pt.x * tileSize, pt.y * tileSize, tileSize, tileSize);
          ctx.strokeStyle = '#D4AD65';
          ctx.lineWidth = 2;
          ctx.strokeRect(pt.x * tileSize + 2, pt.y * tileSize + 2, tileSize - 4, tileSize - 4);
        });
      }

      reachableTiles.forEach((pt) => {
        ctx.fillStyle = 'rgba(76, 141, 255, 0.35)';
        ctx.fillRect(pt.x * tileSize, pt.y * tileSize, tileSize, tileSize);
        ctx.strokeStyle = '#4C8DFF';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(pt.x * tileSize + 1, pt.y * tileSize + 1, tileSize - 2, tileSize - 2);
      });

      attackableTiles.forEach((pt) => {
        ctx.fillStyle = 'rgba(230, 83, 83, 0.4)';
        ctx.fillRect(pt.x * tileSize, pt.y * tileSize, tileSize, tileSize);
        ctx.strokeStyle = '#E65353';
        ctx.lineWidth = 2;
        ctx.strokeRect(pt.x * tileSize + 1, pt.y * tileSize + 1, tileSize - 2, tileSize - 2);
      });

      aoeTiles.forEach((pt) => {
        ctx.fillStyle = 'rgba(255, 152, 0, 0.5)';
        ctx.fillRect(pt.x * tileSize, pt.y * tileSize, tileSize, tileSize);
        ctx.strokeStyle = '#FF9800';
        ctx.lineWidth = 2;
        ctx.strokeRect(pt.x * tileSize + 2, pt.y * tileSize + 2, tileSize - 4, tileSize - 4);
      });

      if (selectedUnit && !selectedUnit.isDead) {
        const sx = selectedUnit.x * tileSize;
        const sy = selectedUnit.y * tileSize;
        const time = Date.now() / 300;
        const alpha = 0.5 + Math.sin(time) * 0.3;

        ctx.strokeStyle = `rgba(212, 173, 101, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(sx + 3, sy + 3, tileSize - 6, tileSize - 6);
      }

      if (hoveredTile) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.strokeRect(hoveredTile.x * tileSize + 1, hoveredTile.y * tileSize + 1, tileSize - 2, tileSize - 2);
      }

      // 3. Draw Obstacles
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const tile = grid[y][x];
          if (tile.obstacle !== 'none') {
            drawObstacle(ctx, tile.obstacle, x * tileSize, y * tileSize, tileSize);
          }
        }
      }

      // 4. Draw Units & Boss Aura Effects
      units.forEach((unit) => {
        if (unit.isDead) return;
        drawUnit(ctx, unit, tileSize, selectedUnit?.id === unit.id);
      });

      // 5. Draw Floating Damage Numbers
      floatingNumbers.forEach((fn) => {
        ctx.save();
        ctx.font = 'bold 20px "Outfit", sans-serif';
        ctx.fillStyle = fn.color;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.textAlign = 'center';
        ctx.fillText(String(fn.value), fn.x * tileSize + tileSize / 2, fn.y * tileSize + tileSize / 3);
        ctx.restore();
      });

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [
    grid,
    units,
    selectedUnit,
    reachableTiles,
    attackableTiles,
    aoeTiles,
    deploymentZone,
    phase,
    floatingNumbers,
    hoveredTile,
    totalWidth,
    totalHeight,
    gridWidth,
    gridHeight,
  ]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((clientX * scaleX) / tileSize);
    const y = Math.floor((clientY * scaleY) / tileSize);

    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
      onTileClick(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((clientX * scaleX) / tileSize);
    const y = Math.floor((clientY * scaleY) / tileSize);

    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
      onTileHover(x, y);
    } else {
      onTileHover(-1, null);
    }
  };

  return (
    <div className="relative flex items-center justify-center p-2 rounded-xl bg-[#10131C] border border-[#343B50] shadow-2xl overflow-auto max-w-full">
      <canvas
        ref={canvasRef}
        width={totalWidth}
        height={totalHeight}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => onTileHover(-1, null)}
        className="cursor-pointer rounded-lg border border-[#1B2030] shadow-inner"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

function getTerrainColor(terrain: TerrainType): string {
  switch (terrain) {
    case 'grass':
      return '#1A291E';
    case 'stone':
      return '#222836';
    case 'sand':
      return '#332B1E';
    case 'dirt':
      return '#261D18';
    case 'water':
      return '#182C3D';
    case 'swamp':
      return '#1B2C24';
    case 'void':
      return '#120F1D';
  }
}

function drawTerrainDetails(
  ctx: CanvasRenderingContext2D,
  terrain: TerrainType,
  px: number,
  py: number
) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  if (terrain === 'grass') {
    ctx.fillRect(px + 12, py + 16, 2, 6);
    ctx.fillRect(px + 40, py + 36, 2, 8);
  } else if (terrain === 'stone') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(px + 10, py + 10);
    ctx.lineTo(px + 24, py + 20);
    ctx.stroke();
  }
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obstacle: ObstacleType,
  px: number,
  py: number,
  tileSize: number
) {
  const cx = px + tileSize / 2;
  const cy = py + tileSize / 2;

  ctx.save();
  if (obstacle === 'tree') {
    ctx.fillStyle = '#422818';
    ctx.fillRect(cx - 4, cy, 8, 20);
    ctx.fillStyle = '#2D6A4F';
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 18, 0, Math.PI * 2);
    ctx.fill();
  } else if (obstacle === 'rock') {
    ctx.fillStyle = '#4A5568';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (obstacle === 'ruins' || obstacle === 'pillar') {
    ctx.fillStyle = '#2D3748';
    ctx.fillRect(cx - 14, cy - 18, 28, 36);
    ctx.fillStyle = '#A0AEC0';
    ctx.fillRect(cx - 16, cy - 20, 32, 6);
  } else if (obstacle === 'shrine') {
    ctx.fillStyle = '#4C1D95';
    ctx.fillRect(cx - 16, cy - 14, 32, 28);
    ctx.fillStyle = '#A78BFA';
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (obstacle === 'wall') {
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(px + 4, py + 4, tileSize - 8, tileSize - 8);
  } else if (obstacle === 'thorns') {
    ctx.fillStyle = '#15803D';
    ctx.fillRect(cx - 12, cy - 10, 24, 20);
  } else if (obstacle === 'tombstone') {
    ctx.fillStyle = '#64748B';
    ctx.fillRect(cx - 10, cy - 14, 20, 26);
  }
  ctx.restore();
}

function drawUnit(
  ctx: CanvasRenderingContext2D,
  unit: Unit,
  tileSize: number,
  isSelected: boolean
) {
  const px = unit.x * tileSize;
  const py = unit.y * tileSize;
  const cx = px + tileSize / 2;
  const cy = py + tileSize / 2 - 4;

  ctx.save();

  // Boss / Mini Boss Aura Effect
  if (unit.isBoss) {
    const time = Date.now() / 400;
    const radius = 24 + Math.sin(time) * 4;
    ctx.fillStyle = unit.bossPhase === 3 ? 'rgba(230, 83, 83, 0.4)' : 'rgba(147, 51, 234, 0.4)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  } else if (unit.isMiniBoss) {
    const radius = 22;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shadow base
  ctx.fillStyle = unit.faction === 'player' ? 'rgba(76, 141, 255, 0.25)' : 'rgba(230, 83, 83, 0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, py + tileSize - 12, 20, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  const hasActed = unit.hasMoved && unit.hasAttacked;
  if (hasActed) {
    ctx.globalAlpha = 0.55;
  }

  // Base Badge Circle
  ctx.fillStyle = unit.color;
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = isSelected ? '#FFFFFF' : '#10131C';
  ctx.lineWidth = isSelected ? 3 : 2;
  ctx.stroke();

  drawUnitEmblem(ctx, unit.avatarKey, cx, cy);

  ctx.globalAlpha = 1.0;

  // Healthbar Overlay (Mandatory §8 Requirement)
  const barWidth = 52;
  const barHeight = 7;
  const barX = cx - barWidth / 2;
  const barY = py + 3;

  const hpPercent = Math.max(0, Math.min(1, unit.currentHp / unit.maxHp));

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

  let hpColor = '#43C878';
  if (hpPercent <= 0.25) {
    hpColor = '#E94F5F';
  } else if (hpPercent <= 0.5) {
    hpColor = '#F0B44D';
  }

  ctx.fillStyle = hpColor;
  ctx.fillRect(barX, barY, Math.round(barWidth * hpPercent), barHeight);

  ctx.font = 'bold 9px "Inter", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 3;
  ctx.textAlign = 'center';
  ctx.fillText(`${unit.currentHp}/${unit.maxHp}`, cx, barY - 2);

  ctx.font = '9px sans-serif';
  ctx.fillStyle = '#D4AD65';
  ctx.fillText(`Lv.${unit.level}`, cx, py + tileSize - 2);

  ctx.restore();
}

function drawUnitEmblem(
  ctx: CanvasRenderingContext2D,
  avatarKey: string,
  cx: number,
  cy: number
) {
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;

  switch (avatarKey) {
    case 'warrior':
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy + 8);
      ctx.lineTo(cx + 8, cy - 8);
      ctx.stroke();
      break;
    case 'archer':
      ctx.beginPath();
      ctx.arc(cx - 2, cy, 8, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      break;
    case 'mage':
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'cleric':
      ctx.fillRect(cx - 2, cy - 8, 4, 16);
      ctx.fillRect(cx - 8, cy - 2, 16, 4);
      break;
    case 'assassin':
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 6);
      ctx.lineTo(cx + 6, cy + 6);
      ctx.stroke();
      break;
    case 'arcane_knight':
      ctx.fillRect(cx - 4, cy - 6, 8, 12);
      break;
    case 'devourer_boss':
    case 'astaroth_boss':
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      ctx.fillRect(cx - 4, cy - 4, 8, 8);
      break;
  }
}
