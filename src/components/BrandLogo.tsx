import React from 'react';

interface BrandLogoProps {
  variant?: 'horizontal' | 'stacked' | 'emblem';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showBadges?: boolean;
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showTagline = true,
  showBadges = false,
  className = '',
  theme = 'dark'
}) => {
  // Height / scale configs
  const sizeMap = {
    xs: { emblemH: 26, emblemW: 28, textH: 24, fontSize: 'text-sm' },
    sm: { emblemH: 34, emblemW: 36, textH: 30, fontSize: 'text-base' },
    md: { emblemH: 46, emblemW: 48, textH: 40, fontSize: 'text-xl' },
    lg: { emblemH: 64, emblemW: 68, textH: 54, fontSize: 'text-2xl' },
    xl: { emblemH: 84, emblemW: 90, textH: 72, fontSize: 'text-3xl' }
  };

  const currentSize = sizeMap[size];
  const isLight = theme === 'light';

  // The Iconic Dimensional Aegis Shield + Neoclassical Temple + Arc Swoosh Emblem
  const renderEmblem = () => (
    <svg
      width={currentSize.emblemW}
      height={currentSize.emblemH}
      viewBox="0 0 160 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 select-none drop-shadow-md"
    >
      <defs>
        {/* Deep Royal to Electric Blue Gradient for Aegis Emblem */}
        <linearGradient id="aegisBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0066FF" />
          <stop offset="45%" stopColor="#0047AB" />
          <stop offset="85%" stopColor="#002D72" />
          <stop offset="100%" stopColor="#001F4D" />
        </linearGradient>

        <linearGradient id="aegisHighlightGrad" x1="0%" y1="0%" x2="100%" y2="40%">
          <stop offset="0%" stopColor="#4D94FF" />
          <stop offset="100%" stopColor="#0055D4" />
        </linearGradient>

        {/* Silver Chrome Arc Swoosh */}
        <linearGradient id="swooshSilver" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="35%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        {/* Dynamic Electric Blue Swoosh */}
        <linearGradient id="swooshElectric" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#0052CC" />
          <stop offset="50%" stopColor="#0099FF" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>

        {/* Neoclassical Bank Colonnade Gradient */}
        <linearGradient id="templeSilver" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        <linearGradient id="limeAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* Outer Aegis Diamond-Shield Crest */}
      <path
        d="M 80 10 L 138 38 C 138 92, 110 128, 80 148 C 50 128, 22 92, 22 38 Z"
        fill="url(#aegisBlueGrad)"
      />

      {/* Inner Shield Bevel Highlight */}
      <path
        d="M 80 18 L 130 42 C 130 88, 106 120, 80 138 C 54 120, 30 88, 30 42 Z"
        fill="url(#aegisHighlightGrad)"
        opacity="0.9"
      />

      {/* Inner Vault Core */}
      <path
        d="M 80 26 L 122 47 C 122 82, 102 110, 80 126 C 58 110, 38 82, 38 47 Z"
        fill={isLight ? '#FFFFFF' : '#0A192F'}
      />

      {/* NEOCLASSICAL BANK COLONNADE EMBLEM (Nestled inside the Aegis shield) */}
      <g transform="translate(44, 46)">
        {/* Triangular Pediment / Gable */}
        <polygon points="36,4 4,20 68,20" fill="url(#templeSilver)" stroke="#003366" strokeWidth="1" />
        <polygon points="36,8 10,20 62,20" fill="#FFFFFF" opacity="0.4" />

        {/* Architrave / Entablature */}
        <rect x="6" y="20" width="60" height="5" rx="1" fill="url(#templeSilver)" stroke="#003366" strokeWidth="0.8" />

        {/* 4 Classical Columns */}
        <rect x="11" y="27" width="7" height="28" rx="1.5" fill="url(#templeSilver)" />
        <rect x="9" y="25" width="11" height="3" rx="0.5" fill="#FFFFFF" />
        <rect x="9" y="54" width="11" height="3" rx="0.5" fill="url(#templeSilver)" />

        <rect x="25" y="27" width="7" height="28" rx="1.5" fill="url(#templeSilver)" />
        <rect x="23" y="25" width="11" height="3" rx="0.5" fill="#FFFFFF" />
        <rect x="23" y="54" width="11" height="3" rx="0.5" fill="url(#templeSilver)" />

        <rect x="39" y="27" width="7" height="28" rx="1.5" fill="url(#templeSilver)" />
        <rect x="37" y="25" width="11" height="3" rx="0.5" fill="#FFFFFF" />
        <rect x="37" y="54" width="11" height="3" rx="0.5" fill="url(#templeSilver)" />

        <rect x="53" y="27" width="7" height="28" rx="1.5" fill="url(#templeSilver)" />
        <rect x="51" y="25" width="11" height="3" rx="0.5" fill="#FFFFFF" />
        <rect x="51" y="54" width="11" height="3" rx="0.5" fill="url(#templeSilver)" />

        {/* Stylobate / Multi-step Base */}
        <rect x="4" y="57" width="64" height="4" rx="1" fill="url(#templeSilver)" stroke="#003366" strokeWidth="0.8" />
        <rect x="1" y="61" width="70" height="5" rx="1" fill="url(#templeSilver)" />
      </g>

      {/* DYNAMIC SWOOSH 1: Silver Chrome Crescent sweeping around the shield */}
      <path
        d="M 12 102 C 24 134, 52 148, 80 148 C 114 148, 142 122, 150 96 C 132 114, 106 124, 78 122 C 50 120, 28 108, 12 102 Z"
        fill="url(#swooshSilver)"
      />

      {/* DYNAMIC SWOOSH 2: Electric Bright Blue Arc sweeping up over the crest */}
      <path
        d="M 50 96 C 80 88, 122 66, 142 32 C 150 20, 152 12, 152 8 C 150 14, 138 36, 118 56 C 96 76, 68 90, 50 96 Z"
        fill="url(#swooshElectric)"
      />

      {/* Subtle Lime Green Spark Accent at the apex */}
      <circle cx="152" cy="8" r="3.5" fill="url(#limeAccent)" />
    </svg>
  );

  // If emblem only requested
  if (variant === 'emblem') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderEmblem()}
      </div>
    );
  }

  // The Typography for Aegis Online Bank
  const renderTypography = () => (
    <div className="flex flex-col justify-center leading-none">
      {/* Top Line: AEGIS with dynamic cyan crest wing */}
      <div className="relative flex items-center">
        <span
          className={`font-black tracking-tight uppercase select-none ${
            isLight ? 'text-[#0A192F]' : 'text-white'
          }`}
          style={{
            fontSize: size === 'xl' ? '2.4rem' : size === 'lg' ? '1.85rem' : size === 'md' ? '1.45rem' : size === 'sm' ? '1.15rem' : '0.95rem',
            letterSpacing: '0.06em',
            lineHeight: 1
          }}
        >
          AEGIS
        </span>

        {/* Dynamic bright blue swoosh leaping over 'E' and 'G' */}
        <svg
          className="absolute left-[30%] -top-2.5 w-[38%] h-3 pointer-events-none"
          viewBox="0 0 100 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 0 20 C 35 2, 70 2, 100 16 C 75 8, 40 10, 10 22 Z"
            fill="url(#typeSwoosh)"
          />
          <defs>
            <linearGradient id="typeSwoosh" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#00D4FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Second Line: ONLINE BANK in vibrant blue */}
      <span
        className="font-black tracking-wider uppercase select-none text-[#0080FF] mt-1"
        style={{
          fontSize: size === 'xl' ? '1.45rem' : size === 'lg' ? '1.15rem' : size === 'md' ? '0.92rem' : size === 'sm' ? '0.74rem' : '0.62rem',
          letterSpacing: '0.14em',
          lineHeight: 1
        }}
      >
        ONLINE BANK
      </span>

      {/* Third Line: Tagline */}
      {showTagline && (
        <div className="flex items-center gap-1 mt-1 select-none">
          <span className="h-[1px] w-3 bg-[#0066FF]/60" />
          <span
            className={`italic font-serif font-medium ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
            style={{
              fontSize: size === 'xl' ? '0.75rem' : size === 'lg' ? '0.65rem' : size === 'md' ? '0.55rem' : '0.5rem',
              letterSpacing: '0.06em'
            }}
          >
            Bank Smarter. Live Better.
          </span>
          <span className="h-[1px] w-3 bg-[#0066FF]/60" />
        </div>
      )}
    </div>
  );

  // Trust Badges Bar (from approved logo: Secure | Fast | Global | Trusted)
  const renderBadges = () => {
    if (!showBadges) return null;
    return (
      <div className={`mt-3 pt-2 border-t ${isLight ? 'border-slate-200 text-slate-700' : 'border-[#1E3A5F] text-slate-200'} flex items-center justify-between gap-3 text-[11px] font-semibold`}>
        <div className="flex items-center gap-1.5">
          <span className="text-[#0080FF]">🛡️</span>
          <span>Secure</span>
        </div>
        <span className="text-slate-500">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[#00D4FF]">⚡</span>
          <span>Fast</span>
        </div>
        <span className="text-slate-500">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[#0080FF]">🌐</span>
          <span>Global</span>
        </div>
        <span className="text-slate-500">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[#10B981]">🤝</span>
          <span>Trusted</span>
        </div>
      </div>
    );
  };

  // Stacked Layout
  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center text-center gap-2.5 ${className}`}>
        {renderEmblem()}
        {renderTypography()}
        {renderBadges()}
      </div>
    );
  }

  // Horizontal Layout (Default)
  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="inline-flex items-center gap-3.5">
        {renderEmblem()}
        {renderTypography()}
      </div>
      {renderBadges()}
    </div>
  );
};
