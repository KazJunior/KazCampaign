import React from 'react';
import { getLineageById } from '../data/lineages';

interface ClassLineageAvatarProps {
  lineageId?: string;
  classColor: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Renderiza o retrato/ícone de uma classe com modificadores visuais de sua Linhagem Ancestral:
 * Asas (Anjo, Demônio, Nefalim, Fênix, Dragonoide, Vampiro, Feérico),
 * Chifres (Minotauro, Demônio, Dragonoide, Anão),
 * Auréolas/Coroas (Anjo, Celestial, Humano, Fênix),
 * Orelhas Élficas (Elfo) e Presas de Guerra (Orc, Vampiro).
 */
export const ClassLineageAvatar: React.FC<ClassLineageAvatarProps> = ({
  lineageId = 'humano',
  classColor,
  size = 'md',
  children,
  className = '',
  disabled = false,
}) => {
  const lineage = getLineageById(lineageId);
  const linId = lineage.id;

  const dimensions = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-xl',
    xl: 'w-14 h-14 rounded-2xl',
  }[size];

  const wingSpread = {
    sm: '-inset-x-2 -inset-y-1',
    md: '-inset-x-2.5 -inset-y-1.5',
    lg: '-inset-x-3 -inset-y-2',
    xl: '-inset-x-3.5 -inset-y-2',
  }[size];

  if (disabled) {
    return (
      <div
        className={`${dimensions} flex items-center justify-center font-bold text-white shadow border border-white/20 shrink-0 relative ${className}`}
        style={{ backgroundColor: classColor }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}>
      {/* === CAMADA TRASEIRA: ASAS E AURAS DE LINHAGEM === */}
      <svg
        viewBox="0 0 100 100"
        className={`absolute ${wingSpread} pointer-events-none z-0 overflow-visible`}
        style={{ filter: `drop-shadow(0 0 6px ${lineage.color}80)` }}
      >
        {/* ANJO: Asas brancas emplumadas com borda dourada */}
        {linId === 'anjo' && (
          <g>
            {/* Asa Esquerda */}
            <path
              d="M22,52 C4,42 -4,24 4,12 C12,18 18,26 24,34 C12,28 6,36 10,44 C15,44 20,46 24,50 C14,50 10,58 16,64 C20,62 24,58 26,56 Z"
              fill="#FFFBEB"
              stroke="#FDE047"
              strokeWidth="2.5"
            />
            {/* Asa Direita */}
            <path
              d="M78,52 C96,42 104,24 96,12 C88,18 82,26 76,34 C88,28 94,36 90,44 C85,44 80,46 76,50 C86,50 90,58 84,64 C80,62 76,58 74,56 Z"
              fill="#FFFBEB"
              stroke="#FDE047"
              strokeWidth="2.5"
            />
          </g>
        )}

        {/* DEMÔNIO: Asas de morcego abissais carmesim/negras */}
        {linId === 'demonio' && (
          <g>
            <path
              d="M22,50 L0,20 L8,38 L-4,44 L10,54 L6,68 L24,58 Z"
              fill="#7F1D1D"
              stroke="#DC2626"
              strokeWidth="2.2"
            />
            <path
              d="M78,50 L100,20 L92,38 L104,44 L90,54 L94,68 L76,58 Z"
              fill="#7F1D1D"
              stroke="#DC2626"
              strokeWidth="2.2"
            />
          </g>
        )}

        {/* NEFALIM: Híbrido — Asa Esquerda Angelical & Asa Direita Demoníaca */}
        {linId === 'nefalim' && (
          <g>
            {/* Asa Esquerda de Anjo */}
            <path
              d="M22,52 C4,42 -4,24 4,12 C12,18 18,26 24,34 C12,28 6,36 10,44 C15,44 20,46 24,50 C14,50 10,58 16,64 Z"
              fill="#FEF08A"
              stroke="#FACC15"
              strokeWidth="2.2"
            />
            {/* Asa Direita de Demônio */}
            <path
              d="M78,50 L100,20 L92,38 L104,44 L90,54 L94,68 L76,58 Z"
              fill="#581C87"
              stroke="#C084FC"
              strokeWidth="2.2"
            />
          </g>
        )}

        {/* FÊNIX: Asas de fogo solar em chamas */}
        {linId === 'fenix' && (
          <g>
            <path
              d="M22,56 C2,46 -6,22 6,8 C10,20 16,26 22,32 C8,24 2,36 8,46 C14,44 18,46 22,50 C10,52 8,62 16,68 Z"
              fill="#F97316"
              stroke="#FDE047"
              strokeWidth="2.2"
            />
            <path
              d="M78,56 C98,46 106,22 94,8 C90,20 84,26 78,32 C92,24 98,36 92,46 C86,44 82,46 78,50 C90,52 92,62 84,68 Z"
              fill="#F97316"
              stroke="#FDE047"
              strokeWidth="2.2"
            />
          </g>
        )}

        {/* DRAGONOIDE: Asas dracônicas escamosas laranja/rubi */}
        {linId === 'dragonoide' && (
          <g>
            <path
              d="M22,48 L2,18 L12,34 L0,42 L14,50 L10,64 L24,56 Z"
              fill="#9A3412"
              stroke="#FB923C"
              strokeWidth="2.2"
            />
            <path
              d="M78,48 L98,18 L88,34 L100,42 L86,50 L90,64 L76,56 Z"
              fill="#9A3412"
              stroke="#FB923C"
              strokeWidth="2.2"
            />
          </g>
        )}

        {/* VAMPIRO: Asas de morcego noturnas + gola carmesim */}
        {linId === 'vampiro' && (
          <g>
            <path
              d="M22,46 C6,32 0,24 4,38 C-2,44 6,52 10,58 L24,54 Z"
              fill="#450A0A"
              stroke="#EF4444"
              strokeWidth="2"
            />
            <path
              d="M78,46 C94,32 100,24 96,38 C102,44 94,52 90,58 L76,54 Z"
              fill="#450A0A"
              stroke="#EF4444"
              strokeWidth="2"
            />
          </g>
        )}

        {/* FEÉRICO: 4 Asas de borboleta/fada translúcidas */}
        {linId === 'feerico' && (
          <g opacity="0.92">
            <ellipse cx="12" cy="36" rx="12" ry="16" transform="rotate(-25 12 36)" fill="#F472B6" fillOpacity="0.6" stroke="#F9A8D4" strokeWidth="2" />
            <ellipse cx="14" cy="60" rx="9" ry="12" transform="rotate(20 14 60)" fill="#38BDF8" fillOpacity="0.55" stroke="#F9A8D4" strokeWidth="1.8" />
            <ellipse cx="88" cy="36" rx="12" ry="16" transform="rotate(25 88 36)" fill="#F472B6" fillOpacity="0.6" stroke="#F9A8D4" strokeWidth="2" />
            <ellipse cx="86" cy="60" rx="9" ry="12" transform="rotate(-20 86 60)" fill="#38BDF8" fillOpacity="0.55" stroke="#F9A8D4" strokeWidth="1.8" />
          </g>
        )}

        {/* ELFO: Longas orelhas pontiagudas élficas nas laterais */}
        {linId === 'elfo' && (
          <g>
            <polygon points="20,42 -2,30 14,56" fill="#FDE68A" stroke="#10B981" strokeWidth="2" />
            <polygon points="80,42 102,30 86,56" fill="#FDE68A" stroke="#10B981" strokeWidth="2" />
          </g>
        )}
      </svg>

      {/* === CORPO DO AVATAR DA CLASSE COM FUNDO MESCLADO PELA LINHAGEM === */}
      <div
        className={`${dimensions} flex items-center justify-center font-bold text-white shadow-md relative z-10 overflow-visible transition-all`}
        style={{
          background: `linear-gradient(145deg, ${classColor} 45%, ${lineage.color} 100%)`,
          border: `2px solid ${lineage.color}`,
          boxShadow: `0 0 12px ${lineage.color}55, inset 0 0 8px rgba(255,255,255,0.22)`,
        }}
      >
        <div className="relative z-10 flex items-center justify-center">
          {children}
        </div>

        {/* === CAMADA FRONTAL SUPERIOR: CHIFRES, AURÉOLAS, COROAS E PRESAS === */}
        <svg
          viewBox="0 0 100 100"
          className="absolute -inset-2 pointer-events-none z-20 overflow-visible"
        >
          {/* HUMANO: Coroa Imperial Dourada */}
          {linId === 'humano' && (
            <polygon
              points="30,14 36,2 50,11 64,2 70,14"
              fill="#FACC15"
              stroke="#FEF08A"
              strokeWidth="2"
            />
          )}

          {/* ELFO: Tiara Esmeralda Élfica */}
          {linId === 'elfo' && (
            <g>
              <path d="M28,16 Q50,6 72,16" fill="none" stroke="#10B981" strokeWidth="3" />
              <polygon points="50,3 55,12 50,18 45,12" fill="#34D399" stroke="#A7F3D0" strokeWidth="1.5" />
            </g>
          )}

          {/* ANÃO: Chifres de Forja em Bronze + Runa da Montanha */}
          {linId === 'anao' && (
            <g>
              <path d="M22,22 C10,14 10,4 20,2 C18,10 22,16 28,18 Z" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="2" />
              <path d="M78,22 C90,14 90,4 80,2 C82,10 78,16 72,18 Z" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="2" />
              <polygon points="50,82 58,92 50,98 42,92" fill="#F59E0B" stroke="#FFFBEB" strokeWidth="1.5" />
            </g>
          )}

          {/* ORC: Presas Inferiores de Marfim + Espinhos de Guerra */}
          {linId === 'orc' && (
            <g>
              <polygon points="26,88 32,72 38,88" fill="#FEFCE8" stroke="#78350F" strokeWidth="2" />
              <polygon points="62,88 68,72 74,88" fill="#FEFCE8" stroke="#78350F" strokeWidth="2" />
              <polygon points="50,0 56,14 44,14" fill="#EF4444" stroke="#FCA5A5" strokeWidth="1.5" />
            </g>
          )}

          {/* VAMPIRO: Presas Superiores + Joia Sanguínea */}
          {linId === 'vampiro' && (
            <g>
              <polygon points="32,12 37,26 42,12" fill="#FFF1F2" stroke="#DC2626" strokeWidth="1.8" />
              <polygon points="58,12 63,26 68,12" fill="#FFF1F2" stroke="#DC2626" strokeWidth="1.8" />
              <circle cx="50" cy="10" r="5" fill="#DC2626" stroke="#FCA5A5" strokeWidth="1.5" />
            </g>
          )}

          {/* CELESTIAL: Auréola Sagrada Brilhante */}
          {linId === 'celestial' && (
            <ellipse
              cx="50"
              cy="4"
              rx="24"
              ry="6"
              fill="none"
              stroke="#FBBF24"
              strokeWidth="4"
            />
          )}

          {/* ANJO: Auréola Empírea Dupla com Brilho */}
          {linId === 'anjo' && (
            <g>
              <ellipse
                cx="50"
                cy="3"
                rx="26"
                ry="6.5"
                fill="none"
                stroke="#FEF08A"
                strokeWidth="4.5"
              />
              <circle cx="50" cy="3" r="3.5" fill="#FFFFFF" />
            </g>
          )}

          {/* DRAGONOIDE: Chifres Dracônicos Longos */}
          {linId === 'dragonoide' && (
            <g>
              <path d="M26,18 C14,8 8,-2 4,-4 C12,6 16,14 20,22 Z" fill="#FB923C" stroke="#FEF08A" strokeWidth="2" />
              <path d="M74,18 C86,8 92,-2 96,-4 C88,6 84,14 80,22 Z" fill="#FB923C" stroke="#FEF08A" strokeWidth="2" />
            </g>
          )}

          {/* FEÉRICO: Coroa Estelar Feérica */}
          {linId === 'feerico' && (
            <g>
              <circle cx="34" cy="8" r="4" fill="#F472B6" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="50" cy="4" r="5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="66" cy="8" r="4" fill="#F472B6" stroke="#FFFFFF" strokeWidth="1.5" />
            </g>
          )}

          {/* MINOTAURO: Grandes Chifres de Touro + Argola Dourada */}
          {linId === 'minotauro' && (
            <g>
              <path
                d="M24,22 C4,18 -2,4 8,-4 C10,6 16,12 28,14 Z"
                fill="#D97706"
                stroke="#FEF3C7"
                strokeWidth="2.2"
              />
              <path
                d="M76,22 C96,18 102,4 92,-4 C90,6 84,12 72,14 Z"
                fill="#D97706"
                stroke="#FEF3C7"
                strokeWidth="2.2"
              />
              <circle
                cx="50"
                cy="88"
                r="7"
                fill="none"
                stroke="#FACC15"
                strokeWidth="3.2"
              />
            </g>
          )}

          {/* DEMÔNIO: Chifres Abissais Curvos */}
          {linId === 'demonio' && (
            <g>
              <path
                d="M28,18 C16,6 14,-4 24,-6 C22,4 26,10 34,14 Z"
                fill="#1E1B4B"
                stroke="#EF4444"
                strokeWidth="2.2"
              />
              <path
                d="M72,18 C84,6 86,-4 76,-6 C78,4 74,10 66,14 Z"
                fill="#1E1B4B"
                stroke="#EF4444"
                strokeWidth="2.2"
              />
            </g>
          )}

          {/* NEFALIM: Meia Auréola Angelical na Esquerda + Chifre Demoníaco na Direita */}
          {linId === 'nefalim' && (
            <g>
              <path
                d="M22,6 A26,7 0 0,1 52,0"
                fill="none"
                stroke="#FEF08A"
                strokeWidth="4.2"
              />
              <path
                d="M72,18 C84,6 86,-4 76,-6 C78,4 74,10 66,14 Z"
                fill="#3B0764"
                stroke="#C084FC"
                strokeWidth="2.2"
              />
            </g>
          )}

          {/* FÊNIX: Crista de Chamas Solares no Topo */}
          {linId === 'fenix' && (
            <g>
              <path
                d="M34,14 L42,0 L50,10 L50,-4 L58,10 L66,0 L66,14 Z"
                fill="#F97316"
                stroke="#FEF08A"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

