import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  lightBackground?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  lightBackground = false
}) => {
  // Height presets for responsive scaling
  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16 md:h-20',
    xl: 'h-20 sm:h-24 md:h-28'
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* 
        The attached logo image features the iconic 3D royal blue 'B' with bank pillars,
        the bold navy 'BARCLAY' text with blue swoosh, and 'ONLINE BANK' with tagline.
      */}
      <img
        src="/logo.png"
        alt="Barclay Online Bank - Bank Smarter. Live Better."
        className={`${heightClasses[size]} w-auto object-contain select-none drop-shadow-md transition-transform duration-200`}
        loading="eager"
      />
    </div>
  );
};
