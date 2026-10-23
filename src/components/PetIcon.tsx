import React from 'react';
import type { PetRarity } from '../types/game';
import { PET_RARITY_CONFIG } from '../data/pets';
import {
  Sparkles,
  Droplet,
  Droplets,
  Bird,
  Dog,
  Rabbit,
  Moon,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Coins,
  Sun,
  Bug,
  Anchor,
  Eye,
  EyeOff,
  Feather,
  Flower2,
  Flame,
  Mountain,
  Wind,
  Waves,
  Snowflake,
  Zap,
  Heart,
  HeartPulse,
  Trees,
  Skull,
  RotateCcw,
  Crown,
  HelpCircle,
} from 'lucide-react';

interface PetIconProps {
  iconName: string;
  size?: number;
  className?: string;
}

export const PetIcon: React.FC<PetIconProps> = ({ iconName, size = 20, className = '' }) => {
  switch (iconName) {
    case 'Droplet': return <Droplet size={size} className={className} />;
    case 'Droplets': return <Droplets size={size} className={className} />;
    case 'Bird': return <Bird size={size} className={className} />;
    case 'Dog': return <Dog size={size} className={className} />;
    case 'Rabbit': return <Rabbit size={size} className={className} />;
    case 'Moon': return <Moon size={size} className={className} />;
    case 'Shield': return <Shield size={size} className={className} />;
    case 'ShieldAlert': return <ShieldAlert size={size} className={className} />;
    case 'ShieldCheck': return <ShieldCheck size={size} className={className} />;
    case 'Coins': return <Coins size={size} className={className} />;
    case 'Sun': return <Sun size={size} className={className} />;
    case 'Bug': return <Bug size={size} className={className} />;
    case 'Anchor': return <Anchor size={size} className={className} />;
    case 'Eye': return <Eye size={size} className={className} />;
    case 'EyeOff': return <EyeOff size={size} className={className} />;
    case 'Feather': return <Feather size={size} className={className} />;
    case 'Flower2': return <Flower2 size={size} className={className} />;
    case 'Flame': return <Flame size={size} className={className} />;
    case 'Mountain': return <Mountain size={size} className={className} />;
    case 'Wind': return <Wind size={size} className={className} />;
    case 'Waves': return <Waves size={size} className={className} />;
    case 'Snowflake': return <Snowflake size={size} className={className} />;
    case 'Zap': return <Zap size={size} className={className} />;
    case 'Heart': return <Heart size={size} className={className} />;
    case 'HeartPulse': return <HeartPulse size={size} className={className} />;
    case 'Trees': return <Trees size={size} className={className} />;
    case 'Skull': return <Skull size={size} className={className} />;
    case 'RotateCcw': return <RotateCcw size={size} className={className} />;
    case 'Crown': return <Crown size={size} className={className} />;
    case 'Sparkles': return <Sparkles size={size} className={className} />;
    default: return <HelpCircle size={size} className={className} />;
  }
};

interface EggDisplayProps {
  rarity: PetRarity;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isIncubating?: boolean;
  className?: string;
}

export const EggDisplay: React.FC<EggDisplayProps> = ({
  rarity,
  size = 'md',
  isIncubating = false,
  className = '',
}) => {
  const config = PET_RARITY_CONFIG[rarity];

  const sizeClasses = {
    sm: 'w-10 h-12',
    md: 'w-16 h-20',
    lg: 'w-24 h-30',
    xl: 'w-32 h-40',
  }[size];

  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  }[size];

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}>
      {/* Halo Glow */}
      <div
        className="absolute inset-0 rounded-full blur-md opacity-40 transition-all duration-500"
        style={{ backgroundColor: config.eggColorHex }}
      />

      {/* Egg Shape (Oval with top narrower than bottom) */}
      <div
        className={`relative w-full h-full rounded-[50%_50%_45%_45%/60%_60%_40%_40%] border-2 shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-300 ${
          isIncubating ? 'animate-pulse scale-105' : 'hover:scale-105'
        }`}
        style={{
          borderColor: config.color,
          background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${config.eggColorHex} 55%, #0B0E14 100%)`,
          boxShadow: `0 8px 24px -4px ${config.eggColorHex}66, inset 0 2px 8px rgba(255,255,255,0.7)`,
        }}
      >
        {/* Egg Shell Speckles / Texture */}
        <div
          className={`absolute top-4 left-3 rounded-full opacity-60 ${dotSize}`}
          style={{ backgroundColor: '#ffffff' }}
        />
        <div
          className={`absolute bottom-5 right-3 rounded-full opacity-40 ${dotSize}`}
          style={{ backgroundColor: config.color }}
        />
        <div
          className={`absolute top-8 right-4 rounded-full opacity-50 ${dotSize}`}
          style={{ backgroundColor: '#ffffff' }}
        />

        {/* Incubation Glow Indicator */}
        {isIncubating && (
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-amber-500/40 to-transparent flex items-end justify-center pb-1">
            <Sparkles size={size === 'sm' ? 10 : 16} className="text-amber-300 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};
