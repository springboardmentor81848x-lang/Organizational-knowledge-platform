import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex items-start space-x-3.5 shadow-lg shadow-black/20 hover:border-slate-700/80 transition-all duration-300">
      <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 shrink-0">
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;