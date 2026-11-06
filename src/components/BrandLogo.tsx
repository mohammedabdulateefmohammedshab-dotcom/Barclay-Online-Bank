import React from 'react';

interface BrandLogoProps {
  className?: string;
  variant?: 'horizontal' | 'stacked' | 'emblem';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  theme?: 'dark' | 'light';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'horizontal',
  size = 'md',
  showTagline = false,
  theme = 'dark'
}) => {
  // Height sizing
  const emblemSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl'
  };

  const subTextSizes = {
    sm: 'text-[8px] tracking-[0.2em]',
    md: 'text-[10px] tracking-[0.25em]',
    lg: 'text-xs tracking-[0.3em]',
    xl: 'text-sm tracking-[0.3em]'
  };

  // The Barclay Crest SVG: Regal Eagle + Neoclassical Bank Columns + Crescent Arc
  const renderCrest = (customSize?: string) => (
    <svg
      viewBox="0 0 160 140"
      className={`${customSize || emblemSizes[size]} shrink-0 select-none overflow-visible`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Eagle bright blue gradient */}
        <linearGradient id="eagleGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Arc swoosh metallic bright gradient */}
        <linearGradient id="arcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="40%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Bank columns silver metallic gradient */}
        <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Glow filter for royal vibrancy */}
        <filter id="royalGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3B82F6" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Sweeping Dynamic Crescent Arc */}
      <path
        d="M 12 85 C 18 106, 52 118, 92 112 C 118 108, 142 96, 154 78 C 130 92, 102 96, 74 94 C 44 92, 22 82, 12 85 Z"
        fill="url(#arcGrad)"
      />
      <path
        d="M 18 92 C 34 104, 66 108, 98 102 C 122 96, 142 84, 150 74 C 136 86, 114 94, 88 96 C 58 98, 32 94, 18 92 Z"
        fill="#FFFFFF"
        opacity="0.8"
      />

      {/* The Iconic Regal Barclay Eagle */}
      <g filter="url(#royalGlow)">
        {/* Eagle Body & Torso */}
        <path
          d="M 72 26 C 72 22, 70 16, 64 12 C 60 10, 56 12, 54 14 C 52 16, 50 18, 48 18 C 45 18, 44 16, 45 14 C 47 11, 52 7, 60 6 C 68 5, 75 9, 78 15 C 81 12, 86 10, 92 14 C 90 18, 86 21, 84 25 C 87 27, 93 30, 98 27 C 104 23, 109 17, 115 19 C 118 20, 119 23, 115 27 C 109 33, 100 37, 92 38 C 96 44, 98 52, 98 62 C 98 78, 88 92, 78 100 C 76 96, 75 90, 75 84 C 75 76, 78 68, 80 60 C 78 64, 74 72, 70 78 C 66 72, 63 64, 62 60 C 64 68, 66 76, 66 84 C 66 90, 65 96, 63 100 C 53 92, 44 78, 44 62 C 44 52, 46 44, 50 38 C 42 37, 33 33, 27 27 C 23 23, 24 20, 27 19 C 33 17, 38 23, 44 27 C 49 30, 55 27, 58 25 C 56 21, 52 18, 50 14 Z"
          fill="url(#eagleGrad)"
        />

        {/* Left Wing Feathers (Detailed Layer) */}
        <path
          d="M 44 38 C 36 38, 26 44, 20 54 C 16 61, 15 71, 16 80 C 22 75, 27 68, 30 60 C 30 68, 32 76, 36 84 C 40 76, 42 68, 43 60 C 44 53, 44 45, 44 38 Z"
          fill="url(#eagleGrad)"
          opacity="0.95"
        />

        {/* Right Wing Feathers */}
        <path
          d="M 98 38 C 106 38, 116 44, 122 54 C 126 61, 127 71, 126 80 C 120 75, 115 68, 112 60 C 112 68, 110 76, 106 84 C 102 76, 100 68, 99 60 C 98 53, 98 45, 98 38 Z"
          fill="url(#eagleGrad)"
          opacity="0.95"
        />

        {/* Eagle Eye & Beak Highlights */}
        <circle cx="58" cy="14" r="1.8" fill="#0A192F" />
        <circle cx="57.5" cy="13.5" r="0.6" fill="#FFFFFF" />
      </g>

      {/* Neoclassical Bank Building (Pediment, Columns, Base) */}
      <g transform="translate(102, 42)">
        {/* Pediment Roof */}
        <path d="M 24 0 L 0 14 L 48 14 Z" fill="url(#silverGrad)" />
        {/* Window in Pediment */}
        <rect x="21" y="6" width="6" height="5" fill="#0A192F" rx="0.5" />
        <line x1="24" y1="6" x2="24" y2="11" stroke="#93C5FD" strokeWidth="0.6" />
        <line x1="21" y1="8.5" x2="27" y2="8.5" stroke="#93C5FD" strokeWidth="0.6" />
        
        {/* Architrave / Entablature */}
        <rect x="2" y="14" width="44" height="4" fill="url(#silverGrad)" rx="0.5" />
        
        {/* 4 Ionic Columns */}
        <rect x="5" y="19" width="5.5" height="22" fill="url(#silverGrad)" rx="0.8" />
        <rect x="15.5" y="19" width="5.5" height="22" fill="url(#silverGrad)" rx="0.8" />
        <rect x="26" y="19" width="5.5" height="22" fill="url(#silverGrad)" rx="0.8" />
        <rect x="36.5" y="19" width="5.5" height="22" fill="url(#silverGrad)" rx="0.8" />
        
        {/* Column Inner Shadows for depth */}
        <rect x="7" y="20" width="1.5" height="20" fill="#FFFFFF" opacity="0.6" />
        <rect x="17.5" y="20" width="1.5" height="20" fill="#FFFFFF" opacity="0.6" />
        <rect x="28" y="20" width="1.5" height="20" fill="#FFFFFF" opacity="0.6" />
        <rect x="38.5" y="20" width="1.5" height="20" fill="#FFFFFF" opacity="0.6" />

        {/* Stylobate / Base (Stepped Pedestal) */}
        <rect x="2" y="42" width="44" height="3" fill="url(#silverGrad)" rx="0.5" />
        <rect x="0" y="45" width="48" height="4" fill="url(#silverGrad)" rx="0.8" />
      </g>
    </svg>
  );

  if (variant === 'emblem') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderCrest()}
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {renderCrest(emblemSizes[size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'xl'])}
        
        <div className="mt-2 flex flex-col items-center">
          <span className={`font-black tracking-[0.12em] font-sans leading-none ${textSizes[size]} ${
            theme === 'dark' ? 'text-white' : 'text-[#0A192F]'
          }`}>
            BARCLAY
          </span>
          <div className="flex items-center gap-2 mt-1 w-full justify-center">
            <span className="h-[1.5px] w-6 bg-[#3B82F6]"></span>
            <span className={`font-bold tracking-[0.25em] text-[#3B82F6] uppercase ${subTextSizes[size]}`}>
              ONLINE BANK
            </span>
            <span className="h-[1.5px] w-6 bg-[#3B82F6]"></span>
          </div>

          {showTagline && (
            <p className="text-[11px] text-slate-400 italic tracking-wider mt-1.5 font-serif">
              Bank Smarter. Live Better.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default: variant === 'horizontal'
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {renderCrest()}

      <div className="flex flex-col justify-center">
        <div className="flex items-baseline">
          <span className={`font-black tracking-[0.1em] font-sans leading-none ${textSizes[size]} ${
            theme === 'dark' ? 'text-white' : 'text-[#0A192F]'
          }`}>
            BARCLAY
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
          <span className={`font-extrabold text-[#3B82F6] uppercase leading-none ${subTextSizes[size]}`}>
            ONLINE BANK
          </span>
          <span className="h-[1.5px] w-3 sm:w-5 bg-[#3B82F6]/80 hidden sm:inline-block"></span>
        </div>
        {showTagline && (
          <span className="text-[9px] text-slate-400 italic tracking-wider hidden md:block font-serif mt-0.5">
            Bank Smarter. Live Better.
          </span>
        )}
      </div>
    </div>
  );
};
