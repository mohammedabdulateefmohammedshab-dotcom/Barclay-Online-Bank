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

  // The Iconic Dimensional 'B' + Neoclassical Temple + Arc Swoosh Emblem (From IMG_4070)
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
        {/* Deep Royal to Electric Blue Gradient for Letter B */}
        <linearGradient id="bBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0066FF" />
          <stop offset="45%" stopColor="#0047AB" />
          <stop offset="85%" stopColor="#002D72" />
          <stop offset="100%" stopColor="#001F4D" />
        </linearGradient>

        <linearGradient id="bHighlightGrad" x1="0%" y1="0%" x2="100%" y2="40%">
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

      {/* Outer Lower Spine of 'B' */}
      <path
        d="M 28 15 L 82 15 C 104 15, 122 28, 122 48 C 122 62, 112 72, 98 77 C 118 82, 132 96, 132 114 C 132 136, 110 148, 84 148 L 28 148 Z"
        fill="url(#bBlueGrad)"
      />

      {/* Top Bow Highlight */}
      <path
        d="M 28 15 L 82 15 C 102 15, 118 26, 118 46 C 118 60, 108 70, 94 75 L 28 75 Z"
        fill="url(#bHighlightGrad)"
        opacity="0.95"
      />

      {/* Top Inner Cutout of B */}
      <path
        d="M 52 32 L 80 32 C 90 32, 98 38, 98 48 C 98 58, 90 64, 80 64 L 52 64 Z"
        fill={isLight ? '#FFFFFF' : '#0A192F'}
      />

      {/* Lower Inner Cutout of B */}
      <path
        d="M 52 86 L 82 86 C 94 86, 106 94, 106 108 C 106 122, 94 130, 82 130 L 52 130 Z"
        fill={isLight ? '#FFFFFF' : '#0A192F'}
      />

      {/* NEOCLASSICAL BANK COLONNADE EMBLEM (Nestled inside the 'B' exactly as in approved logo) */}
      <g transform="translate(32, 38)">
        {/* Triangular Pediment / Gable */}
        <polygon points="36,4 4,20 68,20" fill="url(#templeSilver)" stroke="#003366" strokeWidth="1" />
        <polygon points="36,8 10,20 62,20" fill="#FFFFFF" opacity="0.4" />

        {/* Architrave / Entablature */}
        <rect x="6" y="20" width="60" height="5" rx="1" fill="url(#templeSilver)" stroke="#003366" strokeWidth="0.8" />

        {/* 4 Stately Classical Columns */}
        {/* Column 1 */}
        <rect x="11" y="27" width="7" height="28" rx="1.5" fill="url(#templeSilver)" />
        <rect x="9" y="25" width="11" height="3" rx="0.5" fill="#FFFFFF" />
        <rect x="9" y="54" width="11" height="3" rx="0.5" fill="url(#templeSilver)" />

        {/* Column 2 */}
        <rect x="25" y="27" width="7" height="28" rx="1.5" fill="url(#templeSilver)" />
        <rect x="23" y="25" width="11" height="3" rx="0.5" fill="#FFFFFF" />
        <rect x="23" y="54" width="11" height="3" rx="0.5" fill="url(#templeSilver)" />

        {/* Column 3 */}
        <rect x="39" y="27" width="7" height="28" rx="1.5" fill="url(#templeSilver)" />
        <rect x="37" y="25" width="11" height="3" rx="0.5" fill="#FFFFFF" />
        <rect x="37" y="54" width="11" height="3" rx="0.5" fill="url(#templeSilver)" />

        {/* Column 4 */}
        <rect x="53" y="27" width="7" height="28" rx="1.5" fill="url(#templeSilver)" />
        <rect x="51" y="25" width="11" height="3" rx="0.5" fill="#FFFFFF" />
        <rect x="51" y="54" width="11" height="3" rx="0.5" fill="url(#templeSilver)" />

        {/* Stylobate / Multi-step Base */}
        <rect x="4" y="57" width="64" height="4" rx="1" fill="url(#templeSilver)" stroke="#003366" strokeWidth="0.8" />
        <rect x="1" y="61" width="70" height="5" rx="1" fill="url(#templeSilver)" />
      </g>

      {/* DYNAMIC SWOOSH 1: Silver Chrome Crescent sweeping from bottom-left through the waist */}
      <path
        d="M 6 92 C 14 122, 42 144, 76 132 C 104 122, 128 92, 136 70 C 120 86, 96 102, 70 106 C 42 110, 22 98, 6 92 Z"
        fill="url(#swooshSilver)"
      />

      {/* DYNAMIC SWOOSH 2: Electric Bright Blue Arc sweeping up over top right */}
      <path
        d="M 44 94 C 74 86, 112 66, 134 32 C 142 20, 146 12, 146 8 C 144 14, 134 36, 114 56 C 92 76, 62 88, 44 94 Z"
        fill="url(#swooshElectric)"
      />

      {/* Subtle Lime Green Spark Accent at the crest */}
      <circle cx="146" cy="8" r="3.5" fill="url(#limeAccent)" />
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

  // The Typography matching IMG_4070 exactly:
  // "BARCLAY" with dynamic blue crest wing over the 'R' and 'C'
  // "ONLINE BANK" in electric bright blue
  // "— Bank Smarter. Live Better. —"
  const renderTypography = () => (
    <div className="flex flex-col justify-center leading-none">
      {/* Top Line: BARCLAY with dynamic blue swoosh */}
      <div className="relative flex items-center">
        <span
          className={`font-black tracking-tight uppercase select-none ${
            isLight ? 'text-[#0A192F]' : 'text-white'
          }`}
          style={{
            fontSize: size === 'xl' ? '2.4rem' : size === 'lg' ? '1.85rem' : size === 'md' ? '1.45rem' : size === 'sm' ? '1.15rem' : '0.95rem',
            letterSpacing: '0.04em',
            lineHeight: 1
          }}
        >
          BARCLAY
        </span>

        {/* Dynamic bright blue swoosh leaping over 'R' and 'C' */}
        <svg
          className="absolute left-[38%] -top-2.5 w-[35%] h-3 pointer-events-none"
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
