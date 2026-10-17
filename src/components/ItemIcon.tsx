import React from 'react';
import type { ItemCategory, ItemRarity } from '../types/game';
import { RARITY_INFO } from '../data/items';
import {
  Sword,
  Swords,
  PocketKnife,
  Axe,
  Hammer,
  Anvil,
  Wand,
  Wand2,
  WandSparkles,
  Flame,
  Zap,
  BowArrow,
  Crosshair,
  Target,
  Skull,
  Crown,
  HardHat,
  VenetianMask,
  ChefHat,
  GraduationCap,
  Moon,
  Sun,
  Eye,
  ScanEye,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldHalf,
  Shirt,
  Layers,
  Coins,
  Footprints,
  Compass,
  Gem,
  Sparkle,
  Sparkles,
  Hourglass,
  Orbit,
  Heart,
  HeartPulse,
  Bone,
  Feather,
  Trophy,
  Medal,
  CircleDot,
  BookOpen,
  Scroll,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  // Weapons & Blades
  Sword,
  Swords,
  PocketKnife,
  Axe,
  Hammer,
  Anvil,
  Wand,
  Wand2,
  WandSparkles,
  Flame,
  Zap,
  BowArrow,
  Crosshair,
  Target,
  Skull,

  // Helmets & Headwear
  Crown,
  HardHat,
  VenetianMask,
  ChefHat,
  GraduationCap,
  Moon,
  Sun,
  Eye,
  ScanEye,

  // Chestplates & Armor
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldHalf,
  Shirt,

  // Leggings
  Layers,
  Coins,

  // Boots & Footwear
  Footprints,
  Compass,

  // Accessories & Relics
  Gem,
  Sparkle,
  Sparkles,
  Hourglass,
  Orbit,
  Heart,
  HeartPulse,
  Bone,
  Feather,
  Trophy,
  Medal,
  CircleDot,
  BookOpen,
  Scroll,
};

const CATEGORY_FALLBACK: Record<ItemCategory, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  weapon: Swords,
  helmet: HardHat,
  chestplate: Shield,
  leggings: Layers,
  boots: Footprints,
  accessory: Gem,
};

export interface ItemIconProps {
  iconName?: string;
  category?: ItemCategory;
  rarity?: ItemRarity;
  color?: string;
  size?: number;
  className?: string;
  badge?: boolean;
  badgeSize?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  style?: React.CSSProperties;
}

export const ItemIcon: React.FC<ItemIconProps> = ({
  iconName,
  category = 'accessory',
  rarity = 'common',
  color,
  size,
  className = '',
  badge = false,
  badgeSize = 'md',
  showGlow = false,
  style,
}) => {
  const IconComponent =
    (iconName && ICON_MAP[iconName]) ||
    (category && CATEGORY_FALLBACK[category]) ||
    Gem;

  const rarityColor = RARITY_INFO[rarity]?.color || '#A7B0C4';
  const effectiveColor = color || rarityColor;

  if (!badge) {
    return (
      <IconComponent
        size={size || 18}
        className={className}
        style={{ color: effectiveColor, ...style }}
      />
    );
  }

  // Sizing tokens for badge presentation
  const badgeConfig = {
    sm: { container: 'w-7 h-7 rounded-lg', defaultIconSize: 14 },
    md: { container: 'w-10 h-10 rounded-xl', defaultIconSize: 20 },
    lg: { container: 'w-13 h-13 rounded-xl p-2.5', defaultIconSize: 26 },
    xl: { container: 'w-16 h-16 rounded-2xl p-3', defaultIconSize: 34 },
  }[badgeSize];

  const iconDimension = size || badgeConfig.defaultIconSize;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 border transition-all ${badgeConfig.container} ${className}`}
      style={{
        backgroundColor: '#10131C',
        borderColor: `${effectiveColor}4D`,
        boxShadow: showGlow
          ? `0 0 16px ${effectiveColor}33, inset 0 0 12px ${effectiveColor}15`
          : `inset 0 0 8px ${effectiveColor}10`,
        ...style,
      }}
    >
      {/* Radial backdrop tint */}
      <div
        className="absolute inset-0 rounded-inherit opacity-25 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${effectiveColor} 0%, transparent 75%)`,
        }}
      />
      
      {/* Icon Graphic */}
      <IconComponent
        size={iconDimension}
        className="relative z-10 drop-shadow-sm transition-transform duration-200"
        style={{ color: effectiveColor }}
      />
    </div>
  );
};
