import React from 'react';
import type { StatType, Unit } from '../types/game';
import { Heart, Swords, Wand2, Shield, ShieldCheck, ArrowUpRight, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface StatChoiceModalProps {
  unit: Unit;
  newLevel: number;
  onChooseStat: (stat: StatType) => void;
}

export const StatChoiceModal: React.FC<StatChoiceModalProps> = ({
  unit,
  newLevel,
  onChooseStat,
}) => {
  const isSkillMilestone = newLevel % 3 === 0;

  const handleSelect = (stat: StatType) => {
    soundManager.playSelect();
    onChooseStat(stat);
  };

  const statOptions: {
    type: StatType;
    label: string;
    gainText: string;
    gainValue: number;
    currentValue: number;
    newValue: number;
    description: string;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
    bgAccent: string;
  }[] = [
    {
      type: 'hp',
      label: 'Vida Máxima (HP)',
      gainText: '+25 HP',
      gainValue: 25,
      currentValue: unit.maxHp,
      newValue: unit.maxHp + 25,
      description: 'Aumenta a sobrevivência e capacidade de aguentar ataques brutais.',
      icon: <Heart size={24} className="text-[#FF5252]" />,
      color: '#FF5252',
      borderColor: 'hover:border-[#FF5252]',
      bgAccent: 'bg-[#FF5252]/10',
    },
    {
      type: 'atk',
      label: 'Ataque Físico (ATK)',
      gainText: '+5 ATK',
      gainValue: 5,
      currentValue: unit.atk,
      newValue: unit.atk + 5,
      description: 'Potencializa o dano de ataques básicos e habilidades físicas.',
      icon: <Swords size={24} className="text-[#FF8A00]" />,
      color: '#FF8A00',
      borderColor: 'hover:border-[#FF8A00]',
      bgAccent: 'bg-[#FF8A00]/10',
    },
    {
      type: 'mag',
      label: 'Poder Mágico (MAG)',
      gainText: '+5 MAG',
      gainValue: 5,
      currentValue: unit.mag,
      newValue: unit.mag + 5,
      description: 'Aumenta o dano de magias, explosões arcanas e feitiços de cura.',
      icon: <Wand2 size={24} className="text-[#B58AFF]" />,
      color: '#B58AFF',
      borderColor: 'hover:border-[#B58AFF]',
      bgAccent: 'bg-[#B58AFF]/10',
    },
    {
      type: 'def',
      label: 'Defesa Física (DEF)',
      gainText: '+4 DEF',
      gainValue: 4,
      currentValue: unit.def,
      newValue: unit.def + 4,
      description: 'Reduz o dano sofrido contra golpes físicos e projéteis inimigos.',
      icon: <Shield size={24} className="text-[#4C8DFF]" />,
      color: '#4C8DFF',
      borderColor: 'hover:border-[#4C8DFF]',
      bgAccent: 'bg-[#4C8DFF]/10',
    },
    {
      type: 'res',
      label: 'Resistência Mágica (RES)',
      gainText: '+4 RES',
      gainValue: 4,
      currentValue: unit.res,
      newValue: unit.res + 4,
      description: 'Atenua o dano de magias das trevas, chamas e venenos.',
      icon: <ShieldCheck size={24} className="text-[#00E5FF]" />,
      color: '#00E5FF',
      borderColor: 'hover:border-[#00E5FF]',
      bgAccent: 'bg-[#00E5FF]/10',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-[#1B2030] border-2 border-[#D4AD65] rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl text-[#F3F4F8] space-y-6 animate-scale-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#D4AD65]/15 border border-[#D4AD65]/40 text-[#D4AD65] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
            <ArrowUpRight size={16} /> EVOLUÇÃO DE STATUS — NÍVEL {newLevel}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F8]">
            Evolua um Atributo de {unit.name}
          </h2>
          <p className="text-xs sm:text-sm text-[#A7B0C4] max-w-xl mx-auto">
            Ao subir de nível, você escolhe qual aspecto do herói fortalecer permanentemente.
          </p>

          {isSkillMilestone && (
            <div className="inline-flex items-center gap-2 bg-[#9333EA]/20 border border-[#9333EA]/50 text-[#C084FC] px-3 py-1 rounded-lg text-xs font-bold animate-bounce mt-1">
              <Sparkles size={14} /> Marco de Habilidade atingido! 1 Nova Habilidade será escolhida a seguir.
            </div>
          )}
        </div>

        {/* 5 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {statOptions.map((stat) => (
            <div
              key={stat.type}
              onClick={() => handleSelect(stat.type)}
              className={`bg-[#10131C] border-2 border-[#343B50] ${stat.borderColor} rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl group space-y-3`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${stat.bgAccent} border border-white/10 shadow`}>
                    {stat.icon}
                  </div>
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
                  >
                    {stat.gainText}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#F3F4F8] leading-tight">{stat.label}</h3>
                  <p className="text-[10px] text-[#A7B0C4] mt-1 line-clamp-2 leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </div>

              {/* Progress Value indicator */}
              <div className="pt-2 border-t border-[#343B50] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A7B0C4] text-[11px]">Atual</span>
                  <span className="font-semibold text-white/70">{stat.currentValue}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#D4AD65] font-bold text-[11px]">Novo</span>
                  <span className="font-extrabold text-sm" style={{ color: stat.color }}>
                    {stat.newValue}
                  </span>
                </div>

                <button
                  type="button"
                  className="w-full mt-2 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow text-[#10131C] group-hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: stat.color }}
                >
                  Evoluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
