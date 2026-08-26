import React from 'react';

export type BotanicalBadgeVariant =
  | 'core'
  | 'ai'
  | 'path'
  | 'milestone'
  | 'mint'
  | 'sage'
  | 'emerald'
  | 'teal'
  | 'high'
  | 'medium'
  | 'low';

interface BotanicalBadgeProps {
  children: React.ReactNode;
  variant?: BotanicalBadgeVariant;
  size?: 'xs' | 'sm' | 'md';
  icon?: boolean | React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const BotanicalBadge: React.FC<BotanicalBadgeProps> = ({
  children,
  variant = 'mint',
  size = 'sm',
  icon,
  dot = false,
  className = '',
}) => {
  // Styles aligned with soft botanical tones: sage green, soft mint (#D1FAE5), emerald borders (#059669), or translucent dark teal (#0F766E)
  let variantStyles = 'bg-[#D1FAE5] text-[#065F46] border-[#059669]/30'; // mint default

  if (variant === 'core') {
    variantStyles = 'bg-teal-50 text-[#086661] border-teal-200/90 shadow-2xs';
  } else if (variant === 'ai') {
    variantStyles = 'bg-[#E6F7F5] text-[#0A7A74] border-teal-300/80 shadow-2xs';
  } else if (variant === 'path') {
    variantStyles = 'bg-[#D1FAE5] text-[#044E49] border-[#059669]/40 shadow-2xs';
  } else if (variant === 'milestone') {
    variantStyles = 'bg-[#E8F8F5] text-[#085E58] border-[#14B8A6]/40 shadow-2xs';
  } else if (variant === 'sage') {
    variantStyles = 'bg-[#E8F3EE] text-[#1D4A38] border-[#2E6B52]/30 shadow-2xs';
  } else if (variant === 'teal') {
    variantStyles = 'bg-teal-900/10 text-[#0F766E] border-teal-700/20 shadow-2xs';
  } else if (variant === 'emerald') {
    variantStyles = 'bg-emerald-50 text-[#065F46] border-[#059669]/40 shadow-2xs';
  } else if (variant === 'high') {
    variantStyles = 'bg-rose-50 text-rose-800 border-rose-200/80 shadow-2xs';
  } else if (variant === 'medium') {
    variantStyles = 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-2xs';
  } else if (variant === 'low') {
    variantStyles = 'bg-[#E8F3EE] text-[#1D4A38] border-[#2E6B52]/30 shadow-2xs';
  }

  const sizeStyles =
    size === 'xs'
      ? 'text-[9px] px-2 py-0.5'
      : size === 'md'
      ? 'text-xs px-3 py-1'
      : 'text-[10px] px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full border backdrop-blur-xs transition-all select-none ${sizeStyles} ${variantStyles} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-[#059669] shrink-0" />}
      {icon === true ? (
        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current opacity-85 shrink-0" aria-hidden="true">
          <path d="M17 8C8 10 5 16 5 21C10 21 16 18 18 9C19 4 19 3 19 3C19 3 18 3 17 8Z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span className="truncate">{children}</span>
    </span>
  );
};
