import React from 'react';

interface BotanicalBackgroundProps {
  showPlants?: boolean;
  showWaves?: boolean;
  showGrid?: boolean;
  className?: string;
}

export const BotanicalBackground: React.FC<BotanicalBackgroundProps> = ({
  showPlants = true,
  showWaves = true,
  showGrid = true,
  className = '',
}) => {
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none ${className}`}>
      {/* Background Soft Fluid Gradient */}
      <div className="absolute inset-0 bg-[#F4FBFB]" />

      {/* Organic Soft Waves */}
      {showWaves && (
        <>
          {/* Top-Right Soft Mint Wave */}
          <svg
            className="absolute top-0 right-0 w-[60vw] max-w-[800px] h-[55vh] text-[#E3F6F3]/70 fill-current"
            viewBox="0 0 600 400"
            preserveAspectRatio="none"
          >
            <path d="M150,0 C300,120 420,80 600,220 L600,0 Z" />
          </svg>

          {/* Center Ripple Circles */}
          <div className="absolute top-[20%] right-[38%] w-72 h-72 rounded-full border border-teal-500/10 pointer-events-none" />
          <div className="absolute top-[18%] right-[36%] w-96 h-96 rounded-full border border-teal-500/5 pointer-events-none" />
          <div className="absolute top-[25%] left-[28%] w-64 h-64 rounded-full border border-teal-500/10 pointer-events-none" />

          {/* Bottom-Left & Bottom Fluid Teal Waves */}
          <svg
            className="absolute bottom-0 left-0 w-full h-[32vh] max-h-[360px] text-[#DCF3EF]/60 fill-current"
            viewBox="0 0 1200 300"
            preserveAspectRatio="none"
          >
            <path d="M0,150 C250,50 450,220 750,140 C950,80 1100,200 1200,160 L1200,300 L0,300 Z" />
          </svg>
          <svg
            className="absolute bottom-0 left-0 w-full h-[22vh] max-h-[240px] text-[#0A7A74]/[0.06] fill-current"
            viewBox="0 0 1200 200"
            preserveAspectRatio="none"
          >
            <path d="M0,120 C350,180 600,60 900,110 C1050,140 1150,90 1200,100 L1200,200 L0,200 Z" />
          </svg>
        </>
      )}

      {/* Dotted Grid Patterns in Corners (Exact Match to Image) */}
      {showGrid && (
        <>
          {/* Top-Left Dotted Grid */}
          <div className="absolute top-8 left-8 grid grid-cols-4 gap-3 opacity-35">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={`dot-tl-${i}`} className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            ))}
          </div>

          {/* Bottom-Left Dotted Grid */}
          <div className="absolute bottom-10 left-10 grid grid-cols-5 gap-3 opacity-30">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={`dot-bl-${i}`} className="w-1.5 h-1.5 rounded-full bg-teal-700" />
            ))}
          </div>

          {/* Right Mid-Height Dotted Grid */}
          <div className="absolute top-1/3 right-8 grid grid-cols-3 gap-3 opacity-30 hidden lg:grid">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={`dot-tr-${i}`} className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            ))}
          </div>
        </>
      )}

      {/* Decorative Potted Houseplants (Scaled cleanly for single-viewport fit) */}
      {showPlants && (
        <>
          {/* Left Bottom Potted Plant */}
          <div className="absolute bottom-0 left-0 md:left-4 w-52 md:w-[280px] lg:w-[340px] h-72 md:h-[360px] lg:h-[420px] z-0 opacity-90 hidden sm:block pointer-events-none drop-shadow-[0_15px_25px_rgba(13,148,136,0.18)]">
            <svg viewBox="0 0 200 280" className="w-full h-full">
              {/* Pot Base & Rim */}
              <ellipse cx="100" cy="240" rx="38" ry="13" fill="#E8EFF2" />
              <path d="M66 240 L74 272 C74 278 126 278 126 272 L134 240 Z" fill="#F8FAFC" stroke="#D3DFE4" strokeWidth="2" />
              <ellipse cx="100" cy="240" rx="34" ry="7.5" fill="#CBD5E1" />

              {/* Plant Stems & Layered Teal Leaves */}
              {/* Left Leaf 1 */}
              <path d="M100 240 Q60 190 35 170 Q30 140 60 155 Q85 170 100 240 Z" fill="url(#plantTealGrad1)" />
              <path d="M100 240 Q45 185 45 160" stroke="#086963" strokeWidth="2" fill="none" opacity="0.6" />

              {/* Left Leaf 2 (Upper) */}
              <path d="M100 235 Q50 140 40 80 Q65 70 85 105 Q105 145 100 235 Z" fill="url(#plantTealGrad2)" />
              <path d="M100 235 Q60 120 52 85" stroke="#086963" strokeWidth="2" fill="none" opacity="0.6" />

              {/* Center Main Tall Leaf */}
              <path d="M100 230 Q90 100 95 30 Q115 35 120 90 Q115 170 100 230 Z" fill="url(#plantTealGrad3)" />
              <path d="M100 230 Q105 100 105 40" stroke="#086963" strokeWidth="2.5" fill="none" opacity="0.6" />

              {/* Right Leaf 1 */}
              <path d="M100 235 Q140 150 160 90 Q175 110 155 150 Q130 195 100 235 Z" fill="url(#plantTealGrad2)" />
              <path d="M100 235 Q145 145 160 100" stroke="#086963" strokeWidth="2" fill="none" opacity="0.6" />

              {/* Right Leaf 2 (Lower) */}
              <path d="M100 240 Q150 200 175 180 Q170 210 140 220 Q115 230 100 240 Z" fill="url(#plantTealGrad1)" />
              <path d="M100 240 Q150 205 165 190" stroke="#086963" strokeWidth="2" fill="none" opacity="0.6" />

              <defs>
                <linearGradient id="plantTealGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14B8A6" />
                  <stop offset="100%" stopColor="#0B6B66" />
                </linearGradient>
                <linearGradient id="plantTealGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2DD4BF" />
                  <stop offset="100%" stopColor="#0F766E" />
                </linearGradient>
                <linearGradient id="plantTealGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0D9488" />
                  <stop offset="100%" stopColor="#044E49" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Right Bottom Big Potted Plant */}
          <div className="absolute -bottom-4 -right-6 md:right-0 w-64 md:w-[380px] lg:w-[440px] h-[380px] md:h-[460px] lg:h-[520px] z-0 opacity-90 hidden lg:block pointer-events-none drop-shadow-[0_20px_35px_rgba(13,148,136,0.20)]">
            <svg viewBox="0 0 240 340" className="w-full h-full">
              {/* Ceramic Pot */}
              <ellipse cx="140" cy="285" rx="46" ry="15" fill="#E2E8F0" />
              <path d="M98 285 L108 332 C108 338 172 338 172 332 L182 285 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
              <ellipse cx="140" cy="285" rx="42" ry="8.5" fill="#94A3B8" />

              {/* Large Exotic Botanical Leaves */}
              <path d="M140 280 Q80 220 50 150 Q75 130 110 170 Q130 220 140 280 Z" fill="url(#plantRightGrad1)" />
              <path d="M140 280 Q70 140 90 60 Q120 50 135 110 Q140 200 140 280 Z" fill="url(#plantRightGrad2)" />
              <path d="M140 275 Q150 120 170 20 Q195 30 190 100 Q175 190 140 275 Z" fill="url(#plantRightGrad3)" />
              <path d="M140 280 Q200 180 230 110 Q240 140 210 190 Q175 240 140 280 Z" fill="url(#plantRightGrad1)" />
              <path d="M140 285 Q190 235 220 220 Q205 250 175 265 Z" fill="url(#plantRightGrad2)" />

              <defs>
                <linearGradient id="plantRightGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2DD4BF" />
                  <stop offset="100%" stopColor="#0F766E" />
                </linearGradient>
                <linearGradient id="plantRightGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14B8A6" />
                  <stop offset="100%" stopColor="#0B5E59" />
                </linearGradient>
                <linearGradient id="plantRightGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0D9488" />
                  <stop offset="100%" stopColor="#04433F" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </>
      )}
    </div>
  );
};
