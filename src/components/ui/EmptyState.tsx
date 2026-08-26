import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';
import { BotanicalShapes } from './BotanicalShapes';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionNode?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  actionText,
  onAction,
  actionNode,
}) => {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl p-8 md:p-12 text-center border border-slate-200/80 shadow-xs flex flex-col items-center justify-center min-h-[260px]">
      {/* Decorative Botanical Accents */}
      <BotanicalShapes variant="leaf-top-right" opacity={0.25} />
      <BotanicalShapes variant="leaf-bottom-left" opacity={0.25} />

      <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center mb-4 shadow-2xs relative z-10">
        <Icon className="w-8 h-8 stroke-[1.8]" />
      </div>

      <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1 relative z-10">
        {title}
      </h3>
      <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto mb-6 relative z-10 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="relative z-10 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all duration-150 flex items-center gap-2"
        >
          {actionText}
        </button>
      )}

      {actionNode && <div className="relative z-10">{actionNode}</div>}
    </div>
  );
};
