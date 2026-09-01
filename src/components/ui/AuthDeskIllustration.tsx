import React from 'react';

interface AuthDeskIllustrationProps {
  className?: string;
}

export const AuthDeskIllustration: React.FC<AuthDeskIllustrationProps> = ({
  className = '',
}) => {
  return (
    <div className={`relative w-full max-w-[480px] mx-auto select-none ${className}`}>
      <svg
        viewBox="0 0 520 380"
        className="w-full h-auto drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Circular Backdrop Glow */}
        <circle cx="260" cy="200" r="160" fill="#E6F7F5" fillOpacity="0.75" />
        <circle cx="360" cy="140" r="90" fill="#CCF2EC" fillOpacity="0.4" />

        {/* Floating UI Card 1: User Profile / Group Icon Card (Left) */}
        <g transform="translate(45, 145)">
          <rect width="68" height="64" rx="16" fill="#FFFFFF" filter="drop-shadow(0px 8px 16px rgba(10, 122, 116, 0.08))" />
          <circle cx="34" cy="26" r="12" fill="#E6F7F5" />
          <path d="M26 44 C26 38 42 38 42 44" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="34" cy="24" r="5" fill="#0D9488" />
          <rect x="20" y="48" width="28" height="3" rx="1.5" fill="#E2E8F0" />
        </g>

        {/* Floating UI Card 2: Analytics Chart Dashboard (Top Center) */}
        <g transform="translate(135, 65)">
          <rect width="170" height="95" rx="14" fill="#FFFFFF" filter="drop-shadow(0px 10px 24px rgba(10, 122, 116, 0.12))" />
          {/* Header bar */}
          <rect x="12" y="12" width="28" height="6" rx="3" fill="#0D9488" />
          <rect x="46" y="12" width="20" height="6" rx="3" fill="#E2E8F0" />
          <circle cx="152" cy="15" r="4" fill="#14B8A6" />

          {/* Line Chart */}
          <path d="M16 65 L45 55 L75 62 L105 38 L125 45" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="105" cy="38" r="4" fill="#14B8A6" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="125" cy="45" r="3" fill="#0D9488" />

          {/* Mini Bar Chart */}
          <rect x="16" y="74" width="8" height="10" rx="2" fill="#E2E8F0" />
          <rect x="28" y="70" width="8" height="14" rx="2" fill="#99F6E4" />
          <rect x="40" y="66" width="8" height="18" rx="2" fill="#0D9488" />

          {/* Donut Chart */}
          <circle cx="140" cy="55" r="16" stroke="#E2E8F0" strokeWidth="6" fill="none" />
          <circle cx="140" cy="55" r="16" stroke="#0D9488" strokeWidth="6" strokeDasharray="60 100" strokeDashoffset="15" fill="none" />
        </g>

        {/* Floating UI Card 3: Lightbulb Idea Badge (Top Right) */}
        <g transform="translate(325, 68)">
          <circle cx="20" cy="20" r="18" fill="#FFFFFF" filter="drop-shadow(0px 6px 14px rgba(10, 122, 116, 0.1))" />
          {/* Lightbulb Icon */}
          <path d="M20 10 C15.5 10 12 13.5 12 18 C12 21 14 23 15 25 L25 25 C26 23 28 21 28 18 C28 13.5 24.5 10 20 10 Z" fill="#FBBF24" />
          <rect x="16" y="26" width="8" height="2" rx="1" fill="#D97706" />
          {/* Glow Rays */}
          <line x1="20" y1="5" x2="20" y2="7" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="12" x2="11" y2="13.5" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <line x1="31" y1="12" x2="29" y2="13.5" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Floating UI Card 4: Checklist Tasks Card (Right) */}
        <g transform="translate(320, 130)">
          <rect width="60" height="70" rx="12" fill="#FFFFFF" filter="drop-shadow(0px 8px 18px rgba(10, 122, 116, 0.08))" />
          {/* Checklist rows */}
          <rect x="10" y="14" width="10" height="10" rx="3" fill="#0D9488" />
          <path d="M13 19 L15 21 L18 16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="25" y="17" width="25" height="3" rx="1.5" fill="#CBD5E1" />

          <rect x="10" y="30" width="10" height="10" rx="3" fill="#0D9488" />
          <path d="M13 35 L15 37 L18 32" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="25" y="33" width="22" height="3" rx="1.5" fill="#CBD5E1" />

          <rect x="10" y="46" width="10" height="10" rx="3" fill="#0D9488" />
          <path d="M13 51 L15 53 L18 48" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="25" y="49" width="18" height="3" rx="1.5" fill="#CBD5E1" />
        </g>

        {/* Desk Table */}
        {/* Table Top Surface */}
        <rect x="95" y="222" width="240" height="8" rx="4" fill="#1E293B" />
        {/* Table Legs */}
        <line x1="110" y1="230" x2="98" y2="305" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
        <line x1="315" y1="230" x2="328" y2="305" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />

        {/* Desk Mini Plant (Right) */}
        <ellipse cx="300" cy="222" rx="7" ry="3" fill="#64748B" />
        <path d="M295 222 L297 212 C297 210 303 210 303 212 L305 222 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
        <path d="M300 212 Q292 202 290 196 Q296 195 300 202 Z" fill="#0D9488" />
        <path d="M300 212 Q308 200 312 195 Q313 200 302 205 Z" fill="#14B8A6" />
        <path d="M300 212 Q300 194 300 188 Q304 190 301 204 Z" fill="#2DD4BF" />

        {/* Desk Coffee Cup */}
        <rect x="270" y="213" width="8" height="9" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
        <path d="M278 215 C281 215 281 219 278 219" stroke="#CBD5E1" strokeWidth="1" fill="none" />

        {/* Modern Office Chair */}
        {/* Chair Backrest */}
        <path d="M125 180 Q120 235 155 240 L160 255" stroke="#0D9488" strokeWidth="14" strokeLinecap="round" fill="none" />
        {/* Chair Seat */}
        <rect x="125" y="240" width="48" height="8" rx="4" fill="#0F766E" />
        {/* Chair Base Legs */}
        <line x1="148" y1="248" x2="148" y2="280" stroke="#334155" strokeWidth="4" />
        <line x1="148" y1="280" x2="128" y2="305" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
        <line x1="148" y1="280" x2="168" y2="305" stroke="#334155" strokeWidth="3" strokeLinecap="round" />

        {/* Professional Character Working on Laptop */}
        {/* Legs / Pants */}
        <path d="M165 242 L185 285 L180 320" stroke="#0F263B" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M185 242 L225 280 L220 320" stroke="#0F263B" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Sneakers / Shoes */}
        <rect x="168" y="318" width="22" height="7" rx="3.5" fill="#0D9488" />
        <rect x="210" y="318" width="22" height="7" rx="3.5" fill="#0D9488" />

        {/* Torso / Teal Sweater */}
        <path d="M160 190 Q170 170 185 170 Q200 170 205 190 L195 245 L155 245 Z" fill="#0D9488" />

        {/* Head & Hair */}
        <circle cx="182" cy="145" r="14" fill="#FCD34D" /> {/* Neck / Head base */}
        {/* Face */}
        <circle cx="184" cy="142" r="12" fill="#FDE68A" />
        {/* Hair */}
        <path d="M172 142 C172 130 185 125 195 130 C198 135 195 142 192 143 C186 138 178 138 174 142 Z" fill="#0F172A" />
        {/* Smile & Eye */}
        <circle cx="190" cy="140" r="1.5" fill="#0F172A" />
        <path d="M188 147 Q192 149 194 146" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" fill="none" />

        {/* Arms typing on laptop */}
        <path d="M175 195 L205 210 L230 218" stroke="#0D9488" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="230" cy="218" r="4" fill="#FDE68A" />

        {/* Laptop on Table */}
        <path d="M225 220 L275 220 L270 223 L220 223 Z" fill="#475569" />
        {/* Laptop Screen Open */}
        <path d="M245 220 L285 178 L290 180 L250 220 Z" fill="#1E293B" />
        <circle cx="268" cy="198" r="2.5" fill="#FFFFFF" opacity="0.9" /> {/* Apple / Device glowing logo */}

        {/* Desk Floor Shadow */}
        <ellipse cx="230" cy="328" rx="140" ry="10" fill="#0D9488" fillOpacity="0.08" />
      </svg>
    </div>
  );
};
