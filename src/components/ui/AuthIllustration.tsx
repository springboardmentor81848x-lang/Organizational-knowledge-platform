import React from 'react';

interface IllustrationProps {
  type?: 'learning' | 'analytics' | 'security' | 'team';
  className?: string;
}

export const AuthIllustration: React.FC<IllustrationProps> = ({
  type = 'learning',
  className = 'w-64 h-64 mx-auto',
}) => {
  if (type === 'security') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        {/* Soft Background Layer */}
        <div className="absolute w-44 h-44 rounded-full bg-teal-500/10 blur-xl pointer-events-none" />
        <svg viewBox="0 0 240 240" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Circular Pad */}
          <circle cx="120" cy="120" r="85" fill="#E6F7F5" />
          <circle cx="120" cy="120" r="65" stroke="#0F9D95" strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />
          
          {/* Shield Base */}
          <path
            d="M120 45 C155 45 175 60 175 95 C175 145 120 185 120 185 C120 185 65 145 65 95 C65 60 85 45 120 45 Z"
            fill="url(#shieldGrad)"
            stroke="#087F78"
            strokeWidth="3"
            filter="drop-shadow(0px 8px 16px rgba(15, 157, 149, 0.2))"
          />

          {/* Keyhole / Lock Center */}
          <circle cx="120" cy="105" r="14" fill="#FFFFFF" />
          <path d="M115 112 L125 112 L128 135 L112 135 Z" fill="#FFFFFF" />

          {/* Decorative Sparkles & Leaves */}
          <circle cx="60" cy="70" r="4" fill="#0F9D95" />
          <circle cx="180" cy="160" r="5" fill="#087F78" />
          <path d="M175 70 C185 65 195 75 190 85 C180 85 175 75 175 70 Z" fill="#0F9D95" fillOpacity="0.4" />
          <path d="M45 140 C55 135 65 145 60 155 C50 155 45 145 45 140 Z" fill="#087F78" fillOpacity="0.4" />

          <defs>
            <linearGradient id="shieldGrad" x1="65" y1="45" x2="175" y2="185" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0F9D95" />
              <stop offset="1" stopColor="#087F78" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Default: Learning & Knowledge Analytics Illustration
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Background Soft Pulse */}
      <div className="absolute w-52 h-52 rounded-full bg-teal-400/15 blur-2xl pointer-events-none" />
      <svg viewBox="0 0 280 240" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Organic Background Blobs */}
        <circle cx="140" cy="120" r="90" fill="#E6F7F5" />
        <ellipse cx="140" cy="195" rx="85" ry="12" fill="#0F9D95" fillOpacity="0.08" />

        {/* Floating Analytics Graph Card */}
        <rect x="155" y="45" width="85" height="60" rx="10" fill="#FFFFFF" stroke="#C2EDE8" strokeWidth="2" filter="drop-shadow(0px 6px 12px rgba(15, 157, 149, 0.12))" />
        <path d="M168 85 L182 72 L198 78 L215 58" stroke="#0F9D95" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="215" cy="58" r="3.5" fill="#087F78" />
        <rect x="168" y="93" width="30" height="3" rx="1.5" fill="#64748B" fillOpacity="0.3" />
        <rect x="204" y="93" width="22" height="3" rx="1.5" fill="#0F9D95" fillOpacity="0.5" />

        {/* Central Person / Learner */}
        <ellipse cx="115" cy="180" rx="38" ry="18" fill="#087F78" />
        {/* Torso */}
        <path d="M85 180 C85 140 145 140 145 180 Z" fill="#0F9D95" />
        {/* Collar / Tie accent */}
        <path d="M110 142 L120 142 L115 156 Z" fill="#FFFFFF" />
        
        {/* Head */}
        <circle cx="115" cy="115" r="22" fill="#FFE0BD" />
        {/* Hair */}
        <path d="M96 112 C96 95 134 95 134 112 C134 100 120 92 110 94 C102 96 96 104 96 112 Z" fill="#17324D" />

        {/* Open Book / Knowledge Base on Podium */}
        <path d="M70 145 C85 138 105 140 115 148 C125 140 145 138 160 145 L155 170 C140 163 125 165 115 172 C105 165 90 163 75 170 Z" fill="#FFFFFF" stroke="#0F9D95" strokeWidth="2" />
        <line x1="115" y1="148" x2="115" y2="172" stroke="#0F9D95" strokeWidth="2" />

        {/* Floating Skill Badge / Lightbulb */}
        <g transform="translate(42, 50)">
          <rect width="68" height="52" rx="10" fill="#FFFFFF" stroke="#C2EDE8" strokeWidth="2" filter="drop-shadow(0px 6px 12px rgba(15, 157, 149, 0.12))" />
          <circle cx="34" cy="22" r="12" fill="#E6F7F5" />
          <path d="M30 22 C30 18 38 18 38 22 C38 24 35 25 35 27 L33 27" stroke="#0F9D95" strokeWidth="2" strokeLinecap="round" />
          <rect x="20" y="40" width="28" height="4" rx="2" fill="#0F9D95" fillOpacity="0.4" />
        </g>

        {/* Botanical Plant / Leaves in Pot */}
        <path d="M210 185 L225 185 L222 198 L213 198 Z" fill="#17324D" />
        <path d="M217 185 Q212 165 198 160 Q215 170 217 185" fill="#0F9D95" />
        <path d="M217 185 Q228 160 235 155 Q228 172 217 185" fill="#087F78" />
        <path d="M217 175 Q217 150 220 145 Q222 160 217 175" fill="#4EC2B5" />

        {/* Little Floating Stars */}
        <circle cx="140" cy="35" r="3" fill="#0F9D95" />
        <circle cx="245" cy="130" r="3" fill="#087F78" />
        <circle cx="35" cy="140" r="2.5" fill="#0F9D95" />
      </svg>
    </div>
  );
};
