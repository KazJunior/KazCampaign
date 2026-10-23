import React from 'react';

interface SvgIconProps {
  size: number;
  className?: string;
}

// ============================================================================
// 41 ICONES PERSONALIZADOS VETORIAIS DE PETS
// ============================================================================

export const PET_CUSTOM_ICONS: Record<string, React.FC<SvgIconProps>> = {
  // --------------------------------------------------------------------------
  // COMUNS (1-15)
  // --------------------------------------------------------------------------
  gosma_verde: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_gosma" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#BEF264" />
          <stop offset="50%" stopColor="#84CC16" />
          <stop offset="100%" stopColor="#3F6212" />
        </radialGradient>
      </defs>
      {/* Little splash droplets */}
      <circle cx="8" cy="20" r="2.5" fill="#84CC16" opacity="0.8" />
      <circle cx="41" cy="22" r="2" fill="#BEF264" opacity="0.9" />
      <circle cx="38" cy="14" r="1.5" fill="#84CC16" />
      {/* Slime Jelly Body */}
      <path
        d="M24 6 C32 6 42 16 42 30 C42 39 34 42 24 42 C14 42 6 39 6 30 C6 16 16 6 24 6 Z"
        fill="url(#grad_gosma)"
        stroke="#4D7C0F"
        strokeWidth="1.5"
      />
      {/* Shine highlight */}
      <ellipse cx="17" cy="16" rx="6" ry="3.5" transform="rotate(-30 17 16)" fill="#FFFFFF" opacity="0.65" />
      <circle cx="27" cy="12" r="1.5" fill="#FFFFFF" opacity="0.8" />
      {/* Eyes */}
      <ellipse cx="18" cy="26" rx="2.5" ry="3.5" fill="#14532D" />
      <circle cx="17" cy="25" r="1" fill="#FFFFFF" />
      <ellipse cx="30" cy="26" rx="2.5" ry="3.5" fill="#14532D" />
      <circle cx="29" cy="25" r="1" fill="#FFFFFF" />
      {/* Happy mouth */}
      <path d="M21 31 Q24 35 27 31" stroke="#14532D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Blush */}
      <ellipse cx="13" cy="29" rx="2" ry="1.2" fill="#F43F5E" opacity="0.45" />
      <ellipse cx="35" cy="29" rx="2" ry="1.2" fill="#F43F5E" opacity="0.45" />
    </svg>
  ),

  pintinho_guerreiro: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_pinto" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#CA8A04" />
        </radialGradient>
        <linearGradient id="grad_helm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>
      {/* Body */}
      <circle cx="24" cy="28" r="14" fill="url(#grad_pinto)" stroke="#B45309" strokeWidth="1.5" />
      {/* Wing */}
      <path d="M12 28 C12 34 16 36 20 34" stroke="#B45309" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Red plume */}
      <path d="M24 4 Q25 9 22 13 Q27 10 24 4" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
      {/* Horned Viking/Gladiator Helmet */}
      <path d="M13 18 C13 12 18 10 24 10 C30 10 35 12 35 18 L36 21 L12 21 Z" fill="url(#grad_helm)" stroke="#1E293B" strokeWidth="1.5" />
      {/* Horns */}
      <path d="M13 16 Q8 14 7 9 Q10 11 14 14" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
      <path d="M35 16 Q40 14 41 9 Q38 11 34 14" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
      <line x1="12" y1="20" x2="36" y2="20" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      {/* Determined Eyes */}
      <ellipse cx="19" cy="26" rx="2" ry="2.5" fill="#1E293B" />
      <circle cx="18.5" cy="25" r="0.8" fill="#FFFFFF" />
      <ellipse cx="29" cy="26" rx="2" ry="2.5" fill="#1E293B" />
      <circle cx="28.5" cy="25" r="0.8" fill="#FFFFFF" />
      {/* Beak */}
      <polygon points="24,28 21,32 27,32" fill="#F97316" stroke="#C2410C" strokeWidth="1" />
      {/* Little feet */}
      <path d="M19 42 L19 44 M17 44 L21 44 M29 42 L29 44 M27 44 L31 44" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  filhote_lobo: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="grad_lobo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
      </defs>
      {/* Ears */}
      <polygon points="12,18 7,5 19,12" fill="#475569" stroke="#334155" strokeWidth="1" />
      <polygon points="11,15 8,7 17,11" fill="#F472B6" opacity="0.6" />
      <polygon points="36,18 41,5 29,12" fill="#475569" stroke="#334155" strokeWidth="1" />
      <polygon points="37,15 40,7 31,11" fill="#F472B6" opacity="0.6" />
      {/* Head */}
      <circle cx="24" cy="26" r="14" fill="url(#grad_lobo)" stroke="#334155" strokeWidth="1.5" />
      {/* Cheek Tufts */}
      <polygon points="10,26 4,28 10,32" fill="#94A3B8" />
      <polygon points="38,26 44,28 38,32" fill="#94A3B8" />
      {/* Muzzle */}
      <ellipse cx="24" cy="31" rx="6" ry="4.5" fill="#F1F5F9" />
      <ellipse cx="24" cy="29" rx="2" ry="1.4" fill="#0F172A" />
      <path d="M24 30.5 L24 33 M22 33 Q24 34.5 26 33" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
      {/* Glowing Celestial Eyes */}
      <ellipse cx="18" cy="23" rx="2.5" ry="3" fill="#0284C7" />
      <circle cx="17.5" cy="22" r="1" fill="#E0F2FE" />
      <ellipse cx="30" cy="23" rx="2.5" ry="3" fill="#0284C7" />
      <circle cx="29.5" cy="22" r="1" fill="#E0F2FE" />
    </svg>
  ),

  coelho_saltador: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="grad_coelho" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      {/* Long Ears */}
      <ellipse cx="18" cy="14" rx="4" ry="11" transform="rotate(-10 18 14)" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
      <ellipse cx="18" cy="14" rx="2" ry="8" transform="rotate(-10 18 14)" fill="#FDA4AF" />
      <ellipse cx="30" cy="14" rx="4" ry="11" transform="rotate(10 30 14)" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
      <ellipse cx="30" cy="14" rx="2" ry="8" transform="rotate(10 30 14)" fill="#FDA4AF" />
      {/* Head */}
      <circle cx="24" cy="30" r="12" fill="url(#grad_coelho)" stroke="#B45309" strokeWidth="1.5" />
      {/* Cheeks & Whiskers */}
      <circle cx="20" cy="34" r="3" fill="#FFFBEB" opacity="0.8" />
      <circle cx="28" cy="34" r="3" fill="#FFFBEB" opacity="0.8" />
      <line x1="14" y1="33" x2="8" y2="31" stroke="#78350F" strokeWidth="1" strokeLinecap="round" />
      <line x1="14" y1="35" x2="8" y2="36" stroke="#78350F" strokeWidth="1" strokeLinecap="round" />
      <line x1="34" y1="33" x2="40" y2="31" stroke="#78350F" strokeWidth="1" strokeLinecap="round" />
      <line x1="34" y1="35" x2="40" y2="36" stroke="#78350F" strokeWidth="1" strokeLinecap="round" />
      {/* Nose */}
      <polygon points="24,32 22.5,30 25.5,30" fill="#F43F5E" />
      {/* Eyes */}
      <circle cx="18" cy="27" r="2.5" fill="#78350F" />
      <circle cx="17" cy="26" r="0.8" fill="#FFFFFF" />
      <circle cx="30" cy="27" r="2.5" fill="#78350F" />
      <circle cx="29" cy="26" r="0.8" fill="#FFFFFF" />
      {/* Golden lucky coin on ear */}
      <circle cx="34" cy="12" r="3" fill="#FACC15" stroke="#B45309" strokeWidth="1" />
      <text x="32.5" y="14" fontSize="4" fontWeight="bold" fill="#78350F">$</text>
    </svg>
  ),

  morceguinho_cavernoso: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_bat" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#3B0764" />
        </radialGradient>
      </defs>
      {/* Sonar waves */}
      <path d="M12 10 A 16 16 0 0 1 36 10" stroke="#C084FC" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" strokeDasharray="3 3" />
      <path d="M16 14 A 10 10 0 0 1 32 14" stroke="#E9D5FF" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* Wings */}
      <path d="M6 30 Q12 18 20 25 Q14 36 6 30 Z" fill="#4C1D95" stroke="#2E1065" strokeWidth="1" />
      <path d="M42 30 Q36 18 28 25 Q34 36 42 30 Z" fill="#4C1D95" stroke="#2E1065" strokeWidth="1" />
      {/* Big Bat Ears */}
      <polygon points="17,24 13,10 22,17" fill="#6D28D9" stroke="#2E1065" strokeWidth="1" />
      <polygon points="16,21 14,13 20,18" fill="#C084FC" opacity="0.7" />
      <polygon points="31,24 35,10 26,17" fill="#6D28D9" stroke="#2E1065" strokeWidth="1" />
      <polygon points="32,21 34,13 28,18" fill="#C084FC" opacity="0.7" />
      {/* Round Body */}
      <circle cx="24" cy="28" r="10" fill="url(#grad_bat)" stroke="#2E1065" strokeWidth="1.5" />
      {/* Glowing Violet Eyes */}
      <ellipse cx="20" cy="26" rx="2" ry="2.5" fill="#F472B6" />
      <circle cx="19.5" cy="25" r="0.8" fill="#FFFFFF" />
      <ellipse cx="28" cy="26" rx="2" ry="2.5" fill="#F472B6" />
      <circle cx="27.5" cy="25" r="0.8" fill="#FFFFFF" />
      {/* Little Fangs */}
      <polygon points="22,32 23,34 24,32" fill="#FFFFFF" />
      <polygon points="24,32 25,34 26,32" fill="#FFFFFF" />
    </svg>
  ),

  mini_tartaruga: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_casco" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="60%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064E3B" />
        </radialGradient>
      </defs>
      {/* Feet */}
      <ellipse cx="14" cy="18" rx="4" ry="3" fill="#10B981" />
      <ellipse cx="34" cy="18" rx="4" ry="3" fill="#10B981" />
      <ellipse cx="14" cy="34" rx="4" ry="3" fill="#10B981" />
      <ellipse cx="34" cy="34" rx="4" ry="3" fill="#10B981" />
      {/* Head */}
      <circle cx="24" cy="12" r="5.5" fill="#10B981" stroke="#047857" strokeWidth="1" />
      <circle cx="22" cy="11" r="1.2" fill="#064E3B" />
      <circle cx="26" cy="11" r="1.2" fill="#064E3B" />
      {/* Stone Carapace Shell */}
      <circle cx="24" cy="27" r="14" fill="url(#grad_casco)" stroke="#047857" strokeWidth="2" />
      {/* Hexagonal Stone plates */}
      <polygon points="24,20 29,23 29,29 24,32 19,29 19,23" fill="#6EE7B7" opacity="0.6" stroke="#065F46" strokeWidth="1.2" />
      <line x1="24" y1="20" x2="24" y2="13" stroke="#065F46" strokeWidth="1.2" />
      <line x1="29" y1="23" x2="36" y2="20" stroke="#065F46" strokeWidth="1.2" />
      <line x1="29" y1="29" x2="36" y2="32" stroke="#065F46" strokeWidth="1.2" />
      <line x1="24" y1="32" x2="24" y2="40" stroke="#065F46" strokeWidth="1.2" />
      <line x1="19" y1="29" x2="12" y2="32" stroke="#065F46" strokeWidth="1.2" />
      <line x1="19" y1="23" x2="12" y2="20" stroke="#065F46" strokeWidth="1.2" />
    </svg>
  ),

  rato_sagaz: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_rato" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>
      </defs>
      {/* Big Round Ears */}
      <circle cx="14" cy="15" r="7" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
      <circle cx="14" cy="15" r="4.5" fill="#FCA5A5" />
      <circle cx="34" cy="15" r="7" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
      <circle cx="34" cy="15" r="4.5" fill="#FCA5A5" />
      {/* Head */}
      <circle cx="24" cy="27" r="11" fill="url(#grad_rato)" stroke="#78350F" strokeWidth="1.5" />
      {/* Bandit eye mask */}
      <path d="M14 24 Q24 21 34 24 Q36 28 34 30 Q24 27 14 30 Z" fill="#1E293B" />
      <ellipse cx="19" cy="26" rx="1.8" ry="1.8" fill="#FACC15" />
      <ellipse cx="29" cy="26" rx="1.8" ry="1.8" fill="#FACC15" />
      {/* Snout */}
      <polygon points="24,35 22,32 26,32" fill="#F43F5E" />
      {/* Whiskers */}
      <line x1="16" y1="33" x2="9" y2="33" stroke="#451A03" strokeWidth="1" strokeLinecap="round" />
      <line x1="16" y1="35" x2="10" y2="37" stroke="#451A03" strokeWidth="1" strokeLinecap="round" />
      <line x1="32" y1="33" x2="39" y2="33" stroke="#451A03" strokeWidth="1" strokeLinecap="round" />
      <line x1="32" y1="35" x2="38" y2="37" stroke="#451A03" strokeWidth="1" strokeLinecap="round" />
      {/* Gold coin clutch */}
      <circle cx="24" cy="40" r="5" fill="#FBBF24" stroke="#92400E" strokeWidth="1" />
      <text x="22" y="42" fontSize="5" fontWeight="black" fill="#92400E">G</text>
    </svg>
  ),

  lagarto_areias: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="grad_calango" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#A16207" />
        </linearGradient>
      </defs>
      {/* Desert Sun glow rays behind */}
      <circle cx="24" cy="24" r="18" fill="#FEF08A" opacity="0.2" />
      {/* Frilled spiky crest */}
      <polygon points="12,18 7,12 14,14" fill="#EA580C" />
      <polygon points="20,12 18,4 23,10" fill="#EA580C" />
      <polygon points="28,12 30,4 25,10" fill="#EA580C" />
      <polygon points="36,18 41,12 34,14" fill="#EA580C" />
      {/* Lizard Head shape */}
      <path d="M12 28 C12 16 36 16 36 28 C36 38 28 42 24 42 C20 42 12 38 12 28 Z" fill="url(#grad_calango)" stroke="#854D0E" strokeWidth="1.5" />
      {/* Reptilian scales dots */}
      <circle cx="24" cy="20" r="1" fill="#CA8A04" />
      <circle cx="21" cy="23" r="1" fill="#CA8A04" />
      <circle cx="27" cy="23" r="1" fill="#CA8A04" />
      {/* Big Chameleon Eyes */}
      <circle cx="17" cy="28" r="4.5" fill="#84CC16" stroke="#4D7C0F" strokeWidth="1" />
      <ellipse cx="17" cy="28" rx="1.2" ry="3" fill="#14532D" />
      <circle cx="31" cy="28" r="4.5" fill="#84CC16" stroke="#4D7C0F" strokeWidth="1" />
      <ellipse cx="31" cy="28" rx="1.2" ry="3" fill="#14532D" />
      {/* Snout nostrils */}
      <circle cx="22" cy="38" r="0.8" fill="#713F12" />
      <circle cx="26" cy="38" r="0.8" fill="#713F12" />
    </svg>
  ),

  besouro_bronze: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="grad_bronze" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>
      {/* Jointed Beetle Legs */}
      <path d="M10 20 L5 16 M10 26 L4 26 M10 32 L5 36" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 20 L43 16 M38 26 L44 26 M38 32 L43 36" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
      {/* Horn */}
      <path d="M24 16 L24 4 M24 4 Q20 2 17 6 M24 4 Q28 2 31 6" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Head */}
      <ellipse cx="24" cy="18" rx="6" ry="4" fill="#92400E" stroke="#451A03" strokeWidth="1" />
      <circle cx="20" cy="18" r="1.5" fill="#FDE047" />
      <circle cx="28" cy="18" r="1.5" fill="#FDE047" />
      {/* Carapace Shell Body */}
      <ellipse cx="24" cy="30" rx="13" ry="14" fill="url(#grad_bronze)" stroke="#451A03" strokeWidth="1.5" />
      <line x1="24" y1="18" x2="24" y2="44" stroke="#451A03" strokeWidth="1.5" />
      {/* Metallic Sheen */}
      <path d="M16 22 Q20 24 18 36" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" fill="none" />
    </svg>
  ),

  caranguejinho_blindado: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_crab" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="60%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#991B1B" />
        </radialGradient>
      </defs>
      {/* Claws */}
      <path d="M8 18 Q6 10 13 8 Q17 14 12 18 Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1" />
      <path d="M11 12 Q8 10 10 7" stroke="#7F1D1D" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 18 Q42 10 35 8 Q31 14 36 18 Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1" />
      <path d="M37 12 Q40 10 38 7" stroke="#7F1D1D" strokeWidth="1.5" strokeLinecap="round" />
      {/* Claw arms */}
      <path d="M12 18 Q14 26 18 26" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M36 18 Q34 26 30 26" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Little legs */}
      <path d="M12 34 L7 37 M13 37 L9 42 M36 34 L41 37 M35 37 L39 42" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" />
      {/* Shell Body */}
      <ellipse cx="24" cy="30" rx="14" ry="10" fill="url(#grad_crab)" stroke="#7F1D1D" strokeWidth="1.5" />
      {/* Stalk Eyes */}
      <circle cx="19" cy="20" r="3.5" fill="#FFFFFF" stroke="#7F1D1D" strokeWidth="1" />
      <circle cx="19" cy="20" r="1.8" fill="#1E293B" />
      <circle cx="29" cy="20" r="3.5" fill="#FFFFFF" stroke="#7F1D1D" strokeWidth="1" />
      <circle cx="29" cy="20" r="1.8" fill="#1E293B" />
      {/* Smile */}
      <path d="M21 32 Q24 35 27 32" stroke="#7F1D1D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Bubbles */}
      <circle cx="34" cy="21" r="1.2" fill="#E0F2FE" opacity="0.8" />
      <circle cx="37" cy="18" r="0.8" fill="#E0F2FE" opacity="0.8" />
    </svg>
  ),

  guaxinim_ladino: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_guaxi" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>
      </defs>
      {/* Ears with white tips */}
      <polygon points="11,18 7,7 18,12" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
      <polygon points="10,14 8,8 14,12" fill="#FFFFFF" />
      <polygon points="37,18 41,7 30,12" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
      <polygon points="38,14 40,8 34,12" fill="#FFFFFF" />
      {/* Face Base */}
      <circle cx="24" cy="26" r="13" fill="url(#grad_guaxi)" stroke="#1E293B" strokeWidth="1.5" />
      {/* Bandit Mask */}
      <path d="M12 24 Q18 20 24 23 Q30 20 36 24 Q36 29 24 29 Q12 29 12 24 Z" fill="#0F172A" />
      <circle cx="18" cy="25" r="2" fill="#FACC15" />
      <circle cx="17.5" cy="24.5" r="0.8" fill="#FFFFFF" />
      <circle cx="30" cy="25" r="2" fill="#FACC15" />
      <circle cx="29.5" cy="24.5" r="0.8" fill="#FFFFFF" />
      {/* White Muzzle */}
      <ellipse cx="24" cy="32" rx="5" ry="3.5" fill="#F8FAFC" />
      <polygon points="24,31 22,29 26,29" fill="#0F172A" />
      {/* Diamond Gem in paws */}
      <polygon points="24,37 27,41 24,44 21,41" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
      <circle cx="24" cy="41" r="1" fill="#FFFFFF" opacity="0.9" />
    </svg>
  ),

  corujinha_vigia: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_coruja" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#312E81" />
        </radialGradient>
      </defs>
      {/* Feather Horns */}
      <polygon points="15,16 9,6 20,12" fill="#4338CA" stroke="#1E1B4B" strokeWidth="1" />
      <polygon points="33,16 39,6 28,12" fill="#4338CA" stroke="#1E1B4B" strokeWidth="1" />
      {/* Round Body */}
      <circle cx="24" cy="27" r="14" fill="url(#grad_coruja)" stroke="#1E1B4B" strokeWidth="1.5" />
      {/* Huge Golden Night Eyes */}
      <circle cx="17" cy="25" r="6" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.2" />
      <circle cx="17" cy="25" r="3.5" fill="#0F172A" />
      <circle cx="15.5" cy="23.5" r="1.2" fill="#FFFFFF" />
      <circle cx="31" cy="25" r="6" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.2" />
      <circle cx="31" cy="25" r="3.5" fill="#0F172A" />
      <circle cx="29.5" cy="23.5" r="1.2" fill="#FFFFFF" />
      {/* Golden Beak */}
      <polygon points="24,28 22,25 26,25" fill="#F97316" stroke="#C2410C" strokeWidth="0.8" />
      {/* Belly feather marks */}
      <path d="M21 34 Q24 37 27 34" stroke="#A5B4FC" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M20 37 Q24 40 28 37" stroke="#A5B4FC" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  ),

  passaro_cantador: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_canario" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#EAB308" />
        </radialGradient>
      </defs>
      {/* Floating Musical Note */}
      <path d="M37 14 L37 8 L42 6 L42 12 M37 10 L42 8" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="35" cy="14" r="2" fill="#EC4899" />
      {/* Tail Feathers */}
      <path d="M12 32 L4 36 L11 38 Z" fill="#CA8A04" />
      {/* Plump Bird Body */}
      <circle cx="23" cy="27" r="12" fill="url(#grad_canario)" stroke="#A16207" strokeWidth="1.5" />
      {/* Wing */}
      <ellipse cx="19" cy="29" rx="6" ry="4" transform="rotate(-15 19 29)" fill="#EAB308" stroke="#CA8A04" strokeWidth="1" />
      {/* Eye */}
      <circle cx="28" cy="23" r="2.2" fill="#451A03" />
      <circle cx="27.5" cy="22.5" r="0.8" fill="#FFFFFF" />
      {/* Singing Beak */}
      <polygon points="34,22 41,24 34,26" fill="#F97316" stroke="#EA580C" strokeWidth="1" />
      <line x1="34" y1="24" x2="39" y2="24" stroke="#C2410C" strokeWidth="1" />
      {/* Cute Blush */}
      <circle cx="27" cy="27" r="2" fill="#F43F5E" opacity="0.4" />
    </svg>
  ),

  texugo_valente: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_texugo" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#1E293B" />
        </radialGradient>
      </defs>
      {/* Badger Ears */}
      <circle cx="13" cy="16" r="5" fill="#0F172A" />
      <circle cx="13" cy="16" r="2.5" fill="#FFFFFF" />
      <circle cx="35" cy="16" r="5" fill="#0F172A" />
      <circle cx="35" cy="16" r="2.5" fill="#FFFFFF" />
      {/* Badger Head */}
      <circle cx="24" cy="28" r="13" fill="url(#grad_texugo)" stroke="#0F172A" strokeWidth="1.5" />
      {/* Iconic Badger Face Stripes: White center stripe, black eye bands */}
      <polygon points="21,15 27,15 26,38 22,38" fill="#FFFFFF" />
      <path d="M14 20 L21 21 L21 30 L15 32 Z" fill="#0F172A" />
      <path d="M34 20 L27 21 L27 30 L33 32 Z" fill="#0F172A" />
      {/* Eyes */}
      <circle cx="18" cy="25" r="1.8" fill="#F59E0B" />
      <circle cx="30" cy="25" r="1.8" fill="#F59E0B" />
      {/* Sturdy Black Nose */}
      <polygon points="24,35 21,33 27,33" fill="#0F172A" />
    </svg>
  ),

  cogumelo_saltarico: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_cogu" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="60%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </radialGradient>
      </defs>
      {/* Mushroom Cap */}
      <path d="M8 26 C8 12 40 12 40 26 C40 28 36 29 24 29 C12 29 8 28 8 26 Z" fill="url(#grad_cogu)" stroke="#7F1D1D" strokeWidth="1.5" />
      {/* Glow Spots */}
      <circle cx="18" cy="18" r="3.5" fill="#FEF08A" opacity="0.9" />
      <circle cx="30" cy="17" r="4" fill="#FEF08A" opacity="0.9" />
      <circle cx="24" cy="23" r="2.5" fill="#FEF08A" opacity="0.9" />
      <circle cx="12" cy="24" r="1.5" fill="#FEF08A" opacity="0.8" />
      <circle cx="36" cy="24" r="1.8" fill="#FEF08A" opacity="0.8" />
      {/* Stem Body */}
      <path d="M17 29 C17 38 18 42 24 42 C30 42 31 38 31 29 Z" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.2" />
      {/* Eyes on Stem */}
      <ellipse cx="21" cy="34" rx="1.5" ry="2" fill="#78350F" />
      <ellipse cx="27" cy="34" rx="1.5" ry="2" fill="#78350F" />
      <path d="M22 38 Q24 40 26 38" stroke="#78350F" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  ),

  // --------------------------------------------------------------------------
  // INCOMUNS (16-25)
  // --------------------------------------------------------------------------
  raposa_chamas: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="grad_fire_fox" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
      </defs>
      {/* Flame Ears */}
      <path d="M13 18 Q8 6 15 4 Q19 12 18 18 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
      <path d="M13 15 Q10 8 14 6 Q17 11 16 16 Z" fill="#FBBF24" />
      <path d="M35 18 Q40 6 33 4 Q29 12 30 18 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
      <path d="M35 15 Q38 8 34 6 Q31 11 32 16 Z" fill="#FBBF24" />
      {/* Fox Head */}
      <polygon points="10,24 24,40 38,24 32,16 16,16" fill="url(#grad_fire_fox)" stroke="#9A3412" strokeWidth="1.5" />
      {/* White cheek tufts */}
      <polygon points="10,24 16,28 17,23" fill="#FFFFFF" />
      <polygon points="38,24 32,28 31,23" fill="#FFFFFF" />
      <polygon points="24,35 20,40 28,40" fill="#FFFFFF" />
      {/* Nose */}
      <circle cx="24" cy="38" r="1.5" fill="#431407" />
      {/* Glowing Ember Eyes */}
      <polygon points="17,23 21,24 18,26" fill="#FEF08A" />
      <polygon points="31,23 27,24 30,26" fill="#FEF08A" />
      {/* Forehead Flame Mark */}
      <path d="M24 16 Q26 21 24 24 Q22 21 24 16" fill="#FACC15" />
    </svg>
  ),

  golem_seixo: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="grad_golem" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="60%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
      </defs>
      {/* Floating stone crystals on sides */}
      <polygon points="6,26 10,22 9,32" fill="#64748B" stroke="#334155" strokeWidth="1" />
      <polygon points="42,26 38,22 39,32" fill="#64748B" stroke="#334155" strokeWidth="1" />
      {/* Moss on head */}
      <ellipse cx="24" cy="14" rx="8" ry="3" fill="#65A30D" />
      {/* Heavy Granite Head */}
      <polygon points="14,16 34,16 38,28 32,40 16,40 10,28" fill="url(#grad_golem)" stroke="#0F172A" strokeWidth="2" />
      {/* Stone fissure lines */}
      <path d="M24 16 L24 24 L21 28" stroke="#0F172A" strokeWidth="1.2" fill="none" />
      {/* Glowing Runic Eyes (Cyan) */}
      <rect x="16" y="24" width="5" height="2.5" rx="1" fill="#06B6D4" stroke="#22D3EE" strokeWidth="1" />
      <rect x="27" y="24" width="5" height="2.5" rx="1" fill="#06B6D4" stroke="#22D3EE" strokeWidth="1" />
      {/* Glowing Rune Core in jaw */}
      <polygon points="24,32 26,35 24,38 22,35" fill="#22D3EE" opacity="0.8" />
    </svg>
  ),

  falcao_ventos: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="grad_falcao" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
      </defs>
      {/* Wind trail swirls */}
      <path d="M8 12 Q20 8 32 10" stroke="#BAE6FD" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M6 38 Q18 42 36 38" stroke="#BAE6FD" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Falcon Head Profile/Front */}
      <path d="M16 14 C24 8 36 12 36 24 C36 34 26 38 18 36 L12 28 Z" fill="url(#grad_falcao)" stroke="#075985" strokeWidth="1.5" />
      {/* Crest Feathers */}
      <polygon points="20,12 26,4 25,12" fill="#0284C7" />
      <polygon points="26,10 34,4 31,12" fill="#0284C7" />
      {/* Sharp Hooked Beak */}
      <path d="M34 22 L44 26 L34 30 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
      {/* Piercing Golden Eye */}
      <circle cx="28" cy="22" r="3.5" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
      <circle cx="28" cy="22" r="1.8" fill="#0F172A" />
      <circle cx="27" cy="21" r="0.8" fill="#FFFFFF" />
    </svg>
  ),

  serpente_nevoa: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_serpente" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="50%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#115E59" />
        </radialGradient>
      </defs>
      {/* Mist cloud rings in background */}
      <path d="M10 36 Q18 32 26 36 Q34 40 40 36" stroke="#99F6E4" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M8 20 Q16 16 24 20 Q32 24 38 20" stroke="#CCFBF1" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* Coiling Body S-Curve */}
      <path d="M24 42 C16 42 14 34 22 30 C30 26 30 18 24 12" stroke="url(#grad_serpente)" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* Cobra Hood & Head */}
      <path d="M16 14 C16 6 32 6 32 14 C32 19 28 22 24 22 C20 22 16 19 16 14 Z" fill="url(#grad_serpente)" stroke="#0F766E" strokeWidth="1.2" />
      {/* Glowing Jade Eyes */}
      <ellipse cx="20" cy="13" rx="1.5" ry="2.5" fill="#FEF08A" />
      <ellipse cx="28" cy="13" rx="1.5" ry="2.5" fill="#FEF08A" />
      {/* Forked Tongue */}
      <path d="M24 22 L24 27 L22 29 M24 27 L26 29" stroke="#F43F5E" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),

  javali_blindado: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="grad_javali" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>
      </defs>
      {/* Boar Ears */}
      <polygon points="12,18 8,10 18,14" fill="#78350F" />
      <polygon points="36,18 40,10 30,14" fill="#78350F" />
      {/* Head */}
      <circle cx="24" cy="27" r="13" fill="url(#grad_javali)" stroke="#451A03" strokeWidth="1.5" />
      {/* Iron Brow Plate */}
      <path d="M14 18 C18 16 30 16 34 18 L33 23 L15 23 Z" fill="#94A3B8" stroke="#334155" strokeWidth="1.2" />
      <circle cx="17" cy="20" r="0.8" fill="#475569" />
      <circle cx="31" cy="20" r="0.8" fill="#475569" />
      {/* Snout */}
      <ellipse cx="24" cy="32" rx="6" ry="4.5" fill="#B45309" stroke="#78350F" strokeWidth="1" />
      <circle cx="22" cy="32" r="1.2" fill="#451A03" />
      <circle cx="26" cy="32" r="1.2" fill="#451A03" />
      {/* Red Eyes */}
      <ellipse cx="18" cy="25" rx="1.8" ry="2" fill="#EF4444" />
      <ellipse cx="30" cy="25" rx="1.8" ry="2" fill="#EF4444" />
      {/* Massive Curved Tusks */}
      <path d="M17 33 Q12 30 11 23 Q15 27 18 31" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
      <path d="M31 33 Q36 30 37 23 Q33 27 30 31" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
    </svg>
  ),

  aranha_tecela: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_spider" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>
      </defs>
      {/* Golden Web Geometry */}
      <line x1="24" y1="4" x2="24" y2="44" stroke="#FDE047" strokeWidth="1" opacity="0.4" />
      <line x1="4" y1="24" x2="44" y2="24" stroke="#FDE047" strokeWidth="1" opacity="0.4" />
      <polygon points="24,10 38,24 24,38 10,24" stroke="#FDE047" strokeWidth="1" fill="none" opacity="0.5" />
      {/* Spidery Curved Legs */}
      <path d="M16 20 Q8 14 6 22 M16 24 Q6 24 5 30 M16 28 Q8 34 7 40" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M32 20 Q40 14 42 22 M32 24 Q42 24 43 30 M32 28 Q40 34 41 40" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Abdomen & Cephalothorax */}
      <circle cx="24" cy="30" r="8" fill="url(#grad_spider)" stroke="#78350F" strokeWidth="1.2" />
      <circle cx="24" cy="19" r="5" fill="#D97706" stroke="#78350F" strokeWidth="1.2" />
      {/* Glowing jewel eyes */}
      <circle cx="22" cy="18" r="1.2" fill="#38BDF8" />
      <circle cx="26" cy="18" r="1.2" fill="#38BDF8" />
      <circle cx="23" cy="20" r="1" fill="#FEF08A" />
      <circle cx="25" cy="20" r="1" fill="#FEF08A" />
    </svg>
  ),

  fada_floresta: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_fada" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>
      </defs>
      {/* Luminous fairy wings */}
      <path d="M24 22 C14 8 4 14 8 26 C12 30 20 26 24 22 Z" fill="#A7F3D0" opacity="0.75" stroke="#34D399" strokeWidth="1" />
      <path d="M24 22 C34 8 44 14 40 26 C36 30 28 26 24 22 Z" fill="#A7F3D0" opacity="0.75" stroke="#34D399" strokeWidth="1" />
      <path d="M24 26 C18 34 10 38 12 42 C16 44 22 36 24 26 Z" fill="#6EE7B7" opacity="0.6" stroke="#34D399" strokeWidth="1" />
      <path d="M24 26 C30 34 38 38 36 42 C32 44 26 36 24 26 Z" fill="#6EE7B7" opacity="0.6" stroke="#34D399" strokeWidth="1" />
      {/* Fairy Head/Body */}
      <circle cx="24" cy="20" r="6" fill="#FEE2E2" stroke="#E11D48" strokeWidth="0.8" />
      <circle cx="24" cy="30" r="5" fill="url(#grad_fada)" />
      {/* Flower Crown */}
      <circle cx="21" cy="15" r="1.5" fill="#EC4899" />
      <circle cx="24" cy="14" r="1.8" fill="#F43F5E" />
      <circle cx="27" cy="15" r="1.5" fill="#EC4899" />
      {/* Sparkles */}
      <circle cx="10" cy="14" r="1" fill="#FDE047" />
      <circle cx="38" cy="14" r="1" fill="#FDE047" />
      <circle cx="24" cy="40" r="1" fill="#FDE047" />
    </svg>
  ),

  salamandra_fogo: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_magma" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="60%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#18181B" />
        </radialGradient>
      </defs>
      {/* Feathery fire gills */}
      <path d="M14 20 Q8 14 7 20 Q12 24 14 22" fill="#F97316" stroke="#EA580C" strokeWidth="1" />
      <path d="M14 24 Q6 24 7 28 Q12 28 14 26" fill="#EF4444" stroke="#DC2626" strokeWidth="1" />
      <path d="M34 20 Q40 14 41 20 Q36 24 34 22" fill="#F97316" stroke="#EA580C" strokeWidth="1" />
      <path d="M34 24 Q42 24 41 28 Q36 28 34 26" fill="#EF4444" stroke="#DC2626" strokeWidth="1" />
      {/* Body & Tail with flame tip */}
      <path d="M24 38 Q22 44 26 46 Q28 42 24 38" fill="#FACC15" />
      <ellipse cx="24" cy="30" rx="9" ry="11" fill="url(#grad_magma)" stroke="#991B1B" strokeWidth="1.5" />
      {/* Lava cracking patterns */}
      <path d="M21 28 Q24 30 23 34 M27 28 Q24 32 26 36" stroke="#FEF08A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Head */}
      <circle cx="24" cy="20" r="8" fill="#18181B" stroke="#991B1B" strokeWidth="1.5" />
      {/* Glowing eyes */}
      <ellipse cx="20" cy="19" rx="2" ry="2.5" fill="#FACC15" />
      <ellipse cx="28" cy="19" rx="2" ry="2.5" fill="#FACC15" />
    </svg>
  ),

  texugo_ferro: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="grad_iron" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="50%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>
      {/* Riveted Steel Ears */}
      <polygon points="12,16 6,8 18,12" fill="#475569" stroke="#1E293B" strokeWidth="1.2" />
      <polygon points="36,16 42,8 30,12" fill="#475569" stroke="#1E293B" strokeWidth="1.2" />
      {/* Iron Plated Head */}
      <polygon points="14,16 34,16 38,28 32,40 16,40 10,28" fill="url(#grad_iron)" stroke="#0F172A" strokeWidth="1.8" />
      {/* Visor Slit (Orange Glow) */}
      <rect x="14" y="24" width="20" height="4" rx="2" fill="#0F172A" stroke="#475569" strokeWidth="1" />
      <line x1="16" y1="26" x2="32" y2="26" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      {/* Iron snout plate */}
      <polygon points="24,32 20,38 28,38" fill="#334155" stroke="#1E293B" strokeWidth="1" />
      <circle cx="22" cy="35" r="0.8" fill="#E2E8F0" />
      <circle cx="26" cy="35" r="0.8" fill="#E2E8F0" />
    </svg>
  ),

  urso_polar_filhote: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_polar" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </radialGradient>
      </defs>
      {/* Round Ears */}
      <circle cx="13" cy="15" r="5.5" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" />
      <circle cx="13" cy="15" r="3" fill="#BAE6FD" />
      <circle cx="35" cy="15" r="5.5" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" />
      <circle cx="35" cy="15" r="3" fill="#BAE6FD" />
      {/* Ice Crystal Crown between ears */}
      <polygon points="24,7 26,14 22,14" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.8" />
      <polygon points="19,10 22,14 17,14" fill="#7DD3FC" />
      <polygon points="29,10 31,14 26,14" fill="#7DD3FC" />
      {/* Head */}
      <circle cx="24" cy="27" r="13" fill="url(#grad_polar)" stroke="#64748B" strokeWidth="1.5" />
      {/* Muzzle */}
      <ellipse cx="24" cy="32" rx="5.5" ry="4" fill="#FFFFFF" />
      <polygon points="24,31 22,29 26,29" fill="#0F172A" />
      {/* Blue flecked eyes */}
      <circle cx="18" cy="24" r="2" fill="#0284C7" />
      <circle cx="17.5" cy="23.5" r="0.8" fill="#FFFFFF" />
      <circle cx="30" cy="24" r="2" fill="#0284C7" />
      <circle cx="29.5" cy="23.5" r="0.8" fill="#FFFFFF" />
      {/* Frost aura */}
      <circle cx="8" cy="28" r="1.2" fill="#BAE6FD" opacity="0.8" />
      <circle cx="40" cy="28" r="1.2" fill="#BAE6FD" opacity="0.8" />
    </svg>
  ),

  // --------------------------------------------------------------------------
  // RAROS (26-33)
  // --------------------------------------------------------------------------
  grifo_celestial: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_grifo" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
      </defs>
      {/* Celestial Halo Rays */}
      <circle cx="24" cy="24" r="20" stroke="#FDE047" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.5" />
      {/* Griffin Eagle/Lion Crest Feathers */}
      <polygon points="20,12 24,2 28,12" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
      <polygon points="14,14 12,6 20,12" fill="#F59E0B" />
      <polygon points="34,14 36,6 28,12" fill="#F59E0B" />
      {/* Head */}
      <circle cx="24" cy="25" r="13" fill="url(#grad_grifo)" stroke="#B45309" strokeWidth="1.5" />
      {/* Golden Hooked Beak */}
      <path d="M24 24 Q32 24 30 34 Q26 31 24 30 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />
      {/* Sapphire Celestial Eye */}
      <circle cx="21" cy="22" r="3.5" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1" />
      <circle cx="21" cy="22" r="1.5" fill="#FFFFFF" />
      {/* Wing tips */}
      <path d="M6 34 Q10 24 16 28" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M42 34 Q38 24 32 28" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  ),

  espirito_rio: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_rio" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0369A1" />
        </radialGradient>
      </defs>
      {/* Hydro Swirl Waves */}
      <path d="M8 38 C14 30 34 30 40 38 C34 46 14 46 8 38 Z" fill="#0284C7" opacity="0.6" />
      {/* Crown Droplet */}
      <path d="M24 4 C27 9 30 13 24 16 C18 13 21 9 24 4 Z" fill="#38BDF8" />
      {/* Fluid Spirit Body */}
      <path d="M14 24 C14 14 34 14 34 24 C34 35 28 40 24 40 C20 40 14 35 14 24 Z" fill="url(#grad_rio)" stroke="#0284C7" strokeWidth="1.5" />
      {/* Floating water spheres */}
      <circle cx="10" cy="18" r="2.5" fill="#BAE6FD" opacity="0.8" />
      <circle cx="38" cy="18" r="2.5" fill="#BAE6FD" opacity="0.8" />
      {/* Luminous Aquamarine Eyes */}
      <ellipse cx="20" cy="23" rx="2" ry="3" fill="#FFFFFF" />
      <ellipse cx="28" cy="23" rx="2" ry="3" fill="#FFFFFF" />
      <circle cx="20" cy="23" r="1.2" fill="#0284C7" />
      <circle cx="28" cy="23" r="1.2" fill="#0284C7" />
    </svg>
  ),

  lobo_trovao: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="grad_trovao" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
      </defs>
      {/* Lightning Bolts behind head */}
      <polygon points="12,6 8,16 13,16 9,24 18,14 13,14" fill="#FACC15" stroke="#CA8A04" strokeWidth="0.8" />
      <polygon points="36,6 40,16 35,16 39,24 30,14 35,14" fill="#FACC15" stroke="#CA8A04" strokeWidth="0.8" />
      {/* Wolf Head */}
      <polygon points="14,18 24,38 34,18 30,12 18,12" fill="url(#grad_trovao)" stroke="#312E81" strokeWidth="1.5" />
      {/* Electrified Mane Spikes */}
      <polygon points="10,24 16,26 14,20" fill="#6366F1" />
      <polygon points="38,24 32,26 34,20" fill="#6366F1" />
      {/* Glowing Yellow Eyes */}
      <polygon points="18,22 22,23 19,25" fill="#FDE047" />
      <polygon points="30,22 26,23 29,25" fill="#FDE047" />
      {/* Thunder Mark on forehead */}
      <polygon points="24,14 22,20 25,20 23,24 26,18 24,18" fill="#FACC15" />
    </svg>
  ),

  pantera_espectral: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_pantera" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#4C1D95" />
          <stop offset="70%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#0B0914" />
        </radialGradient>
      </defs>
      {/* Spectral Mist wisps */}
      <path d="M6 34 Q10 24 14 26" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M42 34 Q38 24 34 26" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* Sleek Panther Ears */}
      <polygon points="14,18 8,8 20,13" fill="#1E1B4B" stroke="#0F0D24" strokeWidth="1" />
      <polygon points="34,18 40,8 28,13" fill="#1E1B4B" stroke="#0F0D24" strokeWidth="1" />
      {/* Panther Face */}
      <circle cx="24" cy="26" r="13" fill="url(#grad_pantera)" stroke="#581C87" strokeWidth="1.5" />
      {/* Glowing Violet Eyes */}
      <ellipse cx="18" cy="24" rx="3" ry="1.8" transform="rotate(-10 18 24)" fill="#C084FC" />
      <ellipse cx="18" cy="24" rx="1" ry="1.8" transform="rotate(-10 18 24)" fill="#FAF5FF" />
      <ellipse cx="30" cy="24" rx="3" ry="1.8" transform="rotate(10 30 24)" fill="#C084FC" />
      <ellipse cx="30" cy="24" rx="1" ry="1.8" transform="rotate(10 30 24)" fill="#FAF5FF" />
      {/* Third Eye Rune */}
      <circle cx="24" cy="18" r="2" fill="#E879F9" opacity="0.8" />
      {/* Fangs */}
      <polygon points="20,33 21,36 22,33" fill="#FAF5FF" />
      <polygon points="28,33 27,36 26,33" fill="#FAF5FF" />
    </svg>
  ),

  fenix_mirim: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_fenix" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#F97316" />
          <stop offset="80%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </radialGradient>
      </defs>
      {/* Triple Flame Crest */}
      <path d="M24 14 Q24 2 28 2 Q26 8 24 14" fill="#FACC15" />
      <path d="M20 16 Q16 4 20 4 Q20 10 20 16" fill="#F97316" />
      <path d="M28 16 Q32 4 28 4 Q28 10 28 16" fill="#F97316" />
      {/* Fiery Bird Body */}
      <circle cx="24" cy="27" r="13" fill="url(#grad_fenix)" stroke="#991B1B" strokeWidth="1.5" />
      {/* Glowing Golden Beak */}
      <polygon points="24,27 21,24 27,24" fill="#FACC15" stroke="#B45309" strokeWidth="1" />
      {/* Ruby Eyes */}
      <circle cx="18" cy="23" r="2.5" fill="#450A0A" />
      <circle cx="18" cy="23" r="1.5" fill="#FEF08A" />
      <circle cx="30" cy="23" r="2.5" fill="#450A0A" />
      <circle cx="30" cy="23" r="1.5" fill="#FEF08A" />
      {/* Embers around */}
      <circle cx="8" cy="20" r="1.2" fill="#FACC15" />
      <circle cx="40" cy="20" r="1.2" fill="#FACC15" />
    </svg>
  ),

  basilisco_jade: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_jade" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#064E3B" />
        </radialGradient>
      </defs>
      {/* Basilisk Horns */}
      <path d="M16 16 Q10 8 7 12 Q12 16 16 18" fill="#047857" stroke="#064E3B" strokeWidth="1" />
      <path d="M32 16 Q38 8 41 12 Q36 16 32 18" fill="#047857" stroke="#064E3B" strokeWidth="1" />
      {/* Serpentine Head */}
      <polygon points="12,24 24,40 36,24 30,14 18,14" fill="url(#grad_jade)" stroke="#064E3B" strokeWidth="1.5" />
      {/* Hypnotic Golden Slit Eyes */}
      <ellipse cx="19" cy="24" rx="3.5" ry="2" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
      <line x1="19" y1="22" x2="19" y2="26" stroke="#064E3B" strokeWidth="1.5" />
      <ellipse cx="29" cy="24" rx="3.5" ry="2" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
      <line x1="29" y1="22" x2="29" y2="26" stroke="#064E3B" strokeWidth="1.5" />
      {/* Jade Crest gem */}
      <polygon points="24,16 26,19 24,22 22,19" fill="#A7F3D0" />
    </svg>
  ),

  gargula_quartzo: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="grad_quartzo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5D0FE" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6B21A8" />
        </linearGradient>
      </defs>
      {/* Faceted Crystal Horns */}
      <polygon points="14,16 8,4 20,12" fill="#E879F9" stroke="#701A75" strokeWidth="1" />
      <polygon points="34,16 40,4 28,12" fill="#E879F9" stroke="#701A75" strokeWidth="1" />
      {/* Stone / Crystal Gargoyle Head */}
      <polygon points="12,18 36,18 38,30 24,42 10,30" fill="url(#grad_quartzo)" stroke="#581C87" strokeWidth="1.5" />
      {/* Facet Light Lines */}
      <line x1="24" y1="18" x2="24" y2="42" stroke="#FDF4FF" strokeWidth="1" opacity="0.6" />
      <line x1="12" y1="18" x2="24" y2="30" stroke="#FDF4FF" strokeWidth="1" opacity="0.6" />
      <line x1="36" y1="18" x2="24" y2="30" stroke="#FDF4FF" strokeWidth="1" opacity="0.6" />
      {/* Glowing Violet Eyes */}
      <polygon points="16,24 20,25 18,27" fill="#FDF4FF" />
      <polygon points="32,24 28,25 30,27" fill="#FDF4FF" />
      {/* Fangs */}
      <polygon points="19,34 21,37 22,34" fill="#FFFFFF" />
      <polygon points="29,34 27,37 26,34" fill="#FFFFFF" />
    </svg>
  ),

  guardiao_bosque: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_brotinho" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#A16207" />
          <stop offset="60%" stopColor="#713F12" />
          <stop offset="100%" stopColor="#3F2E1E" />
        </radialGradient>
      </defs>
      {/* Sprouting Leaves on Head */}
      <path d="M24 16 C20 8 14 10 18 16 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
      <path d="M24 16 C28 8 34 10 30 16 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
      <path d="M24 14 C24 6 26 4 24 4 Z" fill="#4ADE80" />
      {/* Ancient Bark Head */}
      <circle cx="24" cy="28" r="13" fill="url(#grad_brotinho)" stroke="#3F2E1E" strokeWidth="1.5" />
      {/* Gentle Glowing Nature Eyes */}
      <ellipse cx="19" cy="26" rx="2.5" ry="3" fill="#4ADE80" />
      <ellipse cx="29" cy="26" rx="2.5" ry="3" fill="#4ADE80" />
      {/* Cute Wooden Smile */}
      <path d="M21 33 Q24 36 27 33" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Floating Life Orbs */}
      <circle cx="10" cy="24" r="1.5" fill="#86EFAC" />
      <circle cx="38" cy="24" r="1.5" fill="#86EFAC" />
    </svg>
  ),

  // --------------------------------------------------------------------------
  // ÉPICOS (34-38)
  // --------------------------------------------------------------------------
  draco_incandescente: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_draco" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#450A0A" />
        </radialGradient>
      </defs>
      {/* Swept Obsidian Horns */}
      <path d="M16 16 Q8 6 4 10 Q10 16 14 20" fill="#18181B" stroke="#7F1D1D" strokeWidth="1" />
      <path d="M32 16 Q40 6 44 10 Q38 16 34 20" fill="#18181B" stroke="#7F1D1D" strokeWidth="1" />
      {/* Volcanic Drake Head */}
      <polygon points="12,22 24,42 36,22 30,14 18,14" fill="url(#grad_draco)" stroke="#7F1D1D" strokeWidth="2" />
      {/* Magma snout vents */}
      <ellipse cx="21" cy="34" rx="1.5" ry="1" fill="#FACC15" />
      <ellipse cx="27" cy="34" rx="1.5" ry="1" fill="#FACC15" />
      {/* Burning Gold/Orange Dragon Eyes */}
      <polygon points="18,22 22,23 19,25" fill="#FEF08A" />
      <polygon points="30,22 26,23 29,25" fill="#FEF08A" />
      {/* Smoke / Flames rising */}
      <path d="M24 12 Q22 6 24 2 Q26 6 24 12" fill="#F97316" opacity="0.9" />
    </svg>
  ),

  quimera_sombras: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_quimera" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#7E22CE" />
          <stop offset="60%" stopColor="#3B0764" />
          <stop offset="100%" stopColor="#0B0517" />
        </radialGradient>
      </defs>
      {/* Twisted Abyssal Horns (3 horns) */}
      <path d="M12 18 Q6 8 10 4 Q16 10 16 18" fill="#4C1D95" stroke="#2E1065" strokeWidth="1" />
      <path d="M36 18 Q42 8 38 4 Q32 10 32 18" fill="#4C1D95" stroke="#2E1065" strokeWidth="1" />
      <polygon points="24,14 22,2 26,2" fill="#A855F7" />
      {/* Chimera Visage */}
      <circle cx="24" cy="27" r="14" fill="url(#grad_quimera)" stroke="#581C87" strokeWidth="1.8" />
      {/* Four Eerie Magenta Glowing Eyes */}
      <ellipse cx="17" cy="22" rx="2" ry="1.5" fill="#F43F5E" />
      <ellipse cx="31" cy="22" rx="2" ry="1.5" fill="#F43F5E" />
      <ellipse cx="19" cy="28" rx="2.5" ry="1.8" fill="#FB7185" />
      <ellipse cx="29" cy="28" rx="2.5" ry="1.8" fill="#FB7185" />
      {/* Void Aura vortex */}
      <circle cx="24" cy="27" r="18" stroke="#C084FC" strokeWidth="1" strokeDasharray="3 4" fill="none" opacity="0.6" />
    </svg>
  ),

  tita_obsidiana: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="grad_tita" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3F3F46" />
          <stop offset="50%" stopColor="#18181B" />
          <stop offset="100%" stopColor="#09090B" />
        </linearGradient>
      </defs>
      {/* Brutalist Obsidian Mask */}
      <polygon points="12,12 36,12 40,24 34,42 14,42 8,24" fill="url(#grad_tita)" stroke="#EA580C" strokeWidth="1.5" />
      {/* Lava Fissures glowing orange */}
      <path d="M24 12 L24 24 L18 32 M24 24 L30 32" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="24" y1="24" x2="24" y2="42" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      {/* Molten Eyes */}
      <rect x="14" y="20" width="6" height="3" fill="#F59E0B" stroke="#EA580C" strokeWidth="0.8" />
      <rect x="28" y="20" width="6" height="3" fill="#F59E0B" stroke="#EA580C" strokeWidth="0.8" />
    </svg>
  ),

  serpente_vazio: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_void" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#581C87" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </radialGradient>
      </defs>
      {/* Dimensional Portal Rings */}
      <ellipse cx="24" cy="24" rx="20" ry="10" stroke="#C084FC" strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(-25 24 24)" />
      {/* Void Serpent Coil */}
      <path d="M24 6 C36 6 42 18 36 28 C30 38 18 38 12 30 C6 22 12 12 24 12" stroke="url(#grad_void)" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* Serpent Head */}
      <circle cx="24" cy="12" r="7" fill="#3B0764" stroke="#A855F7" strokeWidth="1.5" />
      {/* Starry Void Eye */}
      <circle cx="24" cy="12" r="3" fill="#F43F5E" />
      <circle cx="24" cy="12" r="1" fill="#FFFFFF" />
      {/* Constellation Stars */}
      <circle cx="14" cy="30" r="1" fill="#E9D5FF" />
      <circle cx="34" cy="30" r="1" fill="#E9D5FF" />
    </svg>
  ),

  aguia_cristal: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="grad_astral" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      {/* Astral Starburst behind head */}
      <polygon points="24,2 26,14 38,14 28,20 32,32 24,24 16,32 20,20 10,14 22,14" fill="#38BDF8" opacity="0.25" />
      {/* Faceted Crystal Eagle Head */}
      <polygon points="16,14 28,10 36,18 30,34 16,30" fill="url(#grad_astral)" stroke="#0284C7" strokeWidth="1.5" />
      {/* Facet Cuts */}
      <line x1="28" y1="10" x2="22" y2="22" stroke="#FFFFFF" strokeWidth="1" />
      <line x1="36" y1="18" x2="22" y2="22" stroke="#FFFFFF" strokeWidth="1" />
      <line x1="16" y1="30" x2="22" y2="22" stroke="#FFFFFF" strokeWidth="1" />
      {/* Crystal Beak */}
      <polygon points="36,18 44,22 34,26" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
      {/* Diamond Eye */}
      <circle cx="28" cy="18" r="2.5" fill="#0F172A" />
      <circle cx="27.5" cy="17.5" r="1" fill="#FFFFFF" />
    </svg>
  ),

  // --------------------------------------------------------------------------
  // LENDÁRIOS (39-41)
  // --------------------------------------------------------------------------
  dragao_aurora: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="grad_aurora" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="35%" stopColor="#06B6D4" />
          <stop offset="70%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <radialGradient id="grad_dragon_head" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="60%" stopColor="#0F766E" />
          <stop offset="100%" stopColor="#042F2C" />
        </radialGradient>
      </defs>
      {/* Aurora Waves in background */}
      <path d="M4 14 Q14 6 24 12 Q34 18 44 10" stroke="url(#grad_aurora)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M4 22 Q14 14 24 20 Q34 26 44 18" stroke="url(#grad_aurora)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* Regal Crystal Horns */}
      <path d="M14 18 Q8 4 6 8 Q12 16 16 20" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
      <path d="M34 18 Q40 4 42 8 Q36 16 32 20" fill="#A855F7" stroke="#7E22CE" strokeWidth="1" />
      {/* Majestic Dragon Head */}
      <polygon points="12,22 24,42 36,22 28,14 20,14" fill="url(#grad_dragon_head)" stroke="#2DD4BF" strokeWidth="1.8" />
      {/* Starlight Shimmer Mark */}
      <polygon points="24,18 25,23 30,24 25,25 24,30 23,25 18,24 23,23" fill="#FFFFFF" opacity="0.9" />
      {/* Aurora Eyes */}
      <circle cx="18" cy="24" r="2.5" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.8" />
      <circle cx="18" cy="24" r="1" fill="#FFFFFF" />
      <circle cx="30" cy="24" r="2.5" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.8" />
      <circle cx="30" cy="24" r="1" fill="#FFFFFF" />
    </svg>
  ),

  behemoth_ancestral: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_behemoth" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#A16207" />
          <stop offset="60%" stopColor="#713F12" />
          <stop offset="100%" stopColor="#291809" />
        </radialGradient>
      </defs>
      {/* Massive Mammoth Ivory Tusks with Golden Runic Inscriptions */}
      <path d="M12 34 Q4 28 4 14 Q9 20 15 30" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
      <circle cx="8" cy="20" r="1" fill="#F59E0B" />
      <circle cx="10" cy="24" r="1" fill="#F59E0B" />
      <path d="M36 34 Q44 28 44 14 Q39 20 33 30" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
      <circle cx="40" cy="20" r="1" fill="#F59E0B" />
      <circle cx="38" cy="24" r="1" fill="#F59E0B" />
      {/* Titan Skull / Head */}
      <polygon points="12,18 36,18 38,32 30,42 18,42 10,32" fill="url(#grad_behemoth)" stroke="#78350F" strokeWidth="2" />
      {/* Moss / ancient trees on top */}
      <path d="M16 18 Q20 12 24 18 Q28 12 32 18 Z" fill="#65A30D" stroke="#365314" strokeWidth="1" />
      {/* Primordial Golden Eyes */}
      <rect x="16" y="24" width="5" height="2.5" rx="1" fill="#FBBF24" stroke="#78350F" strokeWidth="0.8" />
      <rect x="27" y="24" width="5" height="2.5" rx="1" fill="#FBBF24" stroke="#78350F" strokeWidth="0.8" />
      {/* Runic Glow on forehead */}
      <polygon points="24,20 26,23 24,26 22,23" fill="#FACC15" />
    </svg>
  ),

  leviata_estelar: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <radialGradient id="grad_leviata" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="40%" stopColor="#6366F1" />
          <stop offset="80%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#030712" />
        </radialGradient>
      </defs>
      {/* Cosmic Constellation Lines & Stars */}
      <line x1="8" y1="12" x2="18" y2="8" stroke="#FDE047" strokeWidth="1" opacity="0.6" />
      <line x1="18" y1="8" x2="30" y2="8" stroke="#FDE047" strokeWidth="1" opacity="0.6" />
      <line x1="30" y1="8" x2="40" y2="12" stroke="#FDE047" strokeWidth="1" opacity="0.6" />
      <circle cx="8" cy="12" r="1.5" fill="#FDE047" />
      <circle cx="18" cy="8" r="1.5" fill="#FDE047" />
      <circle cx="30" cy="8" r="1.5" fill="#FDE047" />
      <circle cx="40" cy="12" r="1.5" fill="#FDE047" />
      {/* Stellar Leviathan Whale/Dragon Body */}
      <path d="M24 10 C36 10 42 20 40 32 C38 40 28 42 24 42 C20 42 10 40 8 32 C6 20 12 10 24 10 Z" fill="url(#grad_leviata)" stroke="#818CF8" strokeWidth="1.8" />
      {/* Celestial Bioluminescent Belly Lines */}
      <path d="M16 28 Q24 32 32 28" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M18 34 Q24 38 30 34" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Starlight Galaxy Eyes */}
      <circle cx="16" cy="22" r="2.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.8" />
      <circle cx="16" cy="22" r="1" fill="#FFFFFF" />
      <circle cx="32" cy="22" r="2.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.8" />
      <circle cx="32" cy="22" r="1" fill="#FFFFFF" />
      {/* Nebula Star Dust Sparkles */}
      <circle cx="24" cy="20" r="1.2" fill="#FFFFFF" />
      <circle cx="21" cy="25" r="0.8" fill="#FDE047" />
      <circle cx="27" cy="25" r="0.8" fill="#FDE047" />
    </svg>
  ),
};

// Fallback map from old Lucide iconName to pet ID if passed directly
export const LUCIDE_NAME_TO_PET_ID: Record<string, string> = {
  Droplet: 'gosma_verde',
  Bird: 'pintinho_guerreiro',
  Dog: 'filhote_lobo',
  Rabbit: 'coelho_saltador',
  Moon: 'morceguinho_cavernoso',
  Shield: 'mini_tartaruga',
  Coins: 'rato_sagaz',
  Sun: 'lagarto_areias',
  Bug: 'besouro_bronze',
  Anchor: 'caranguejinho_blindado',
  Sparkles: 'guaxinim_ladino',
  Eye: 'corujinha_vigia',
  Feather: 'passaro_cantador',
  ShieldAlert: 'texugo_valente',
  Flower2: 'cogumelo_saltarico',
  Flame: 'raposa_chamas',
  Mountain: 'golem_seixo',
  Wind: 'falcao_ventos',
  Waves: 'serpente_nevoa',
  ShieldCheck: 'javali_blindado',
  Crown: 'dragao_aurora',
};
