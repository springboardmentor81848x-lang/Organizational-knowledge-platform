import React from 'react';

export interface PlantAccentProps {
  className?: string;
  variant?: 'top-leaf' | 'sidebar-climb' | 'corner-sprout' | 'subtle-spray' | 'leaf-duo' | 'floating-tendril' | 'border-sprout';
  opacity?: number;
}

/**
 * Clean, minimal vector plant leaf accents styled in OKGIP emerald/mint/teal tones (#0D9488 / #14B8A6 / #044E49 / #2DD4BF).
 * Designed to provide organic depth to navbars, search boxes, and sidebar panels with layered z-indexes and soft shadows.
 */
export const BotanicalNavAccents: React.FC<PlantAccentProps> = ({
  className = '',
  variant = 'leaf-duo',
  opacity = 1,
}) => {
  if (variant === 'top-leaf') {
    return (
      <div
        className={`pointer-events-none select-none ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 120 50" className="w-full h-full drop-shadow-[0_4px_12px_rgba(13,148,136,0.18)]">
          <defs>
            <linearGradient id="navLeafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="60%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#044E49" />
            </linearGradient>
            <linearGradient id="navLeafGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
            <linearGradient id="navStemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5EEAD4" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
          </defs>

          {/* Delicate arched stem */}
          <path
            d="M 5,45 Q 45,15 110,8"
            stroke="url(#navStemGrad)"
            strokeWidth="1.75"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />

          {/* Leaf 1 (Left downward arch) */}
          <path
            d="M 25,32 C 10,24 8,8 24,14 C 36,18 35,28 25,32 Z"
            fill="url(#navLeafGrad1)"
          />
          <path d="M 25,32 Q 18,20 18,12" stroke="#5EEAD4" strokeWidth="0.8" fill="none" opacity="0.65" />

          {/* Leaf 2 (Center prominent) */}
          <path
            d="M 55,20 C 45,6 60,-2 74,4 C 82,10 70,22 55,20 Z"
            fill="url(#navLeafGrad2)"
          />
          <path d="M 55,20 Q 64,8 68,2" stroke="#A7F3D0" strokeWidth="0.9" fill="none" opacity="0.75" />

          {/* Leaf 3 (Right tip sprout) */}
          <path
            d="M 85,12 C 80,0 95,-5 106,1 C 114,6 102,15 85,12 Z"
            fill="url(#navLeafGrad1)"
          />
          <path d="M 85,12 Q 95,4 100,0" stroke="#5EEAD4" strokeWidth="0.7" fill="none" opacity="0.6" />

          {/* Subtle Dewdrop / Glow accent */}
          <circle cx="70" cy="5" r="1.5" fill="#CCFBF1" opacity="0.9" />
          <circle cx="102" cy="2" r="1" fill="#FFFFFF" opacity="0.8" />
        </svg>
      </div>
    );
  }

  if (variant === 'sidebar-climb') {
    return (
      <div
        className={`pointer-events-none select-none ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 70 240" className="w-full h-full drop-shadow-[0_8px_16px_rgba(13,148,136,0.14)]">
          <defs>
            <linearGradient id="sideStemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0F766E" />
              <stop offset="50%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#5EEAD4" />
            </linearGradient>
            <linearGradient id="sideLeafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>
            <linearGradient id="sideLeafGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5EEAD4" />
              <stop offset="60%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#044E49" />
            </linearGradient>
          </defs>

          {/* Organic Climbing Vine */}
          <path
            d="M 5,235 Q 25,180 15,130 T 22,20"
            stroke="url(#sideStemGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />

          {/* Node 1 Leaf (Bottom Right) */}
          <path
            d="M 16,190 C 35,185 45,195 48,210 C 35,215 22,205 16,190 Z"
            fill="url(#sideLeafGrad1)"
          />
          <path d="M 16,190 Q 34,198 42,206" stroke="#99F6E4" strokeWidth="0.8" fill="none" opacity="0.6" />

          {/* Node 2 Leaf (Middle Left curl) */}
          <path
            d="M 18,145 C 5,135 -2,120 5,108 C 18,114 22,130 18,145 Z"
            fill="url(#sideLeafGrad2)"
          />
          <path d="M 18,145 Q 8,128 4,115" stroke="#CCFBF1" strokeWidth="0.8" fill="none" opacity="0.7" />

          {/* Node 3 Leaf (Upper Right Fan) */}
          <path
            d="M 16,85 C 36,70 52,78 54,95 C 40,105 24,96 16,85 Z"
            fill="url(#sideLeafGrad1)"
          />
          <path d="M 16,85 Q 38,84 48,90" stroke="#99F6E4" strokeWidth="0.8" fill="none" opacity="0.6" />

          {/* Top Tender Sprout */}
          <path
            d="M 21,35 C 15,18 28,8 38,12 C 40,24 30,34 21,35 Z"
            fill="url(#sideLeafGrad2)"
          />
          <path d="M 21,35 Q 27,22 34,14" stroke="#FFFFFF" strokeWidth="0.8" fill="none" opacity="0.75" />

          {/* Small side bud */}
          <circle cx="22" cy="18" r="2.2" fill="#5EEAD4" />
          <circle cx="22" cy="18" r="1.2" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  if (variant === 'border-sprout') {
    return (
      <div
        className={`pointer-events-none select-none ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 60 40" className="w-full h-full drop-shadow-[0_4px_10px_rgba(13,148,136,0.22)]">
          <defs>
            <linearGradient id="sproutGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="50%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#5EEAD4" />
            </linearGradient>
            <linearGradient id="sproutGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#044E49" />
            </linearGradient>
          </defs>

          {/* Arched base stem */}
          <path d="M 2,38 Q 18,22 45,15" stroke="#0D9488" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7" />

          {/* Leaf 1 */}
          <path d="M 20,25 C 12,12 24,2 35,6 C 40,15 30,26 20,25 Z" fill="url(#sproutGrad)" />
          <path d="M 20,25 Q 26,14 31,8" stroke="#CCFBF1" strokeWidth="0.75" fill="none" opacity="0.8" />

          {/* Leaf 2 (Accent) */}
          <path d="M 36,18 C 36,4 48,2 55,10 C 56,20 45,22 36,18 Z" fill="url(#sproutGradDark)" />
          <path d="M 36,18 Q 44,10 50,7" stroke="#99F6E4" strokeWidth="0.7" fill="none" opacity="0.7" />
        </svg>
      </div>
    );
  }

  if (variant === 'corner-sprout') {
    return (
      <div
        className={`pointer-events-none select-none ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 90 90" className="w-full h-full drop-shadow-[0_6px_14px_rgba(13,148,136,0.16)]">
          <defs>
            <linearGradient id="cornerLeafA" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0F766E" />
              <stop offset="50%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#2DD4BF" />
            </linearGradient>
            <linearGradient id="cornerLeafB" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5EEAD4" />
              <stop offset="70%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#044E49" />
            </linearGradient>
          </defs>

          {/* Graceful curving stem from corner */}
          <path d="M 2,88 Q 30,60 75,25" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.75" />

          {/* Big botanical leaf */}
          <path
            d="M 35,55 C 20,30 40,10 65,15 C 75,32 55,60 35,55 Z"
            fill="url(#cornerLeafA)"
          />
          <path d="M 35,55 Q 46,32 58,19" stroke="#E6FFFA" strokeWidth="1" fill="none" opacity="0.7" />

          {/* Secondary side leaf */}
          <path
            d="M 50,42 C 55,20 76,14 84,28 C 82,45 65,48 50,42 Z"
            fill="url(#cornerLeafB)"
          />
          <path d="M 50,42 Q 66,30 76,24" stroke="#99F6E4" strokeWidth="0.85" fill="none" opacity="0.7" />

          {/* Small sprouting leaf */}
          <path
            d="M 22,68 C 8,62 10,45 22,48 C 30,55 28,66 22,68 Z"
            fill="url(#cornerLeafB)"
          />
          <path d="M 22,68 Q 15,56 16,50" stroke="#CCFBF1" strokeWidth="0.75" fill="none" opacity="0.6" />
        </svg>
      </div>
    );
  }

  // Default: leaf-duo
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 50 35" className="w-full h-full drop-shadow-[0_4px_8px_rgba(13,148,136,0.18)]">
        <defs>
          <linearGradient id="duoGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>
          <linearGradient id="duoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#044E49" />
          </linearGradient>
        </defs>
        <path d="M 5,30 Q 20,20 42,8" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
        <path d="M 18,22 C 10,12 20,2 30,6 C 35,14 26,24 18,22 Z" fill="url(#duoGrad1)" />
        <path d="M 18,22 Q 22,12 27,7" stroke="#CCFBF1" strokeWidth="0.7" fill="none" opacity="0.7" />
        <path d="M 28,14 C 28,3 38,1 44,7 C 45,15 36,18 28,14 Z" fill="url(#duoGrad2)" />
      </svg>
    </div>
  );
};
