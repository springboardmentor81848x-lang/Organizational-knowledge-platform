import React from "react";
import { Sparkles, Brain, Target, ShieldCheck, Cpu, Layers } from "lucide-react";
import { StatsCard } from "@/components/auth/StatsCard";
import { FeatureCard } from "@/components/auth/FeatureCard";

export const HeroSection: React.FC = () => {
  return (
    <div className="flex flex-col justify-between h-full py-2">
      {/* Top Bar: Brand Logo & AI Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center p-2 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Brain className="w-full h-full text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-tight">
              OKIP
            </span>
            <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
              Knowledge Gap Intelligence
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="text-xs font-semibold text-indigo-300">
            AI-POWERED WORKFORCE INTELLIGENCE
          </span>
        </div>
      </div>

      {/* Hero Typography & Visual Elements */}
      <div className="my-auto py-8 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Bridge the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400">
              Knowledge Gap
            </span>
          </h1>
          <p className="text-slate-400 text-sm xl:text-base leading-relaxed max-w-lg">
            Empowering organizations to identify, analyze, and close workforce competency gaps using modern predictive intelligence.
          </p>
        </div>

        {/* Statistics Cards Row */}
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            icon={<Target className="w-4 h-4 text-indigo-400" />}
            label="ORGANIZATION READINESS"
            value="82%"
            trend="+5.5%"
            isPositive={true}
          />
          <StatsCard
            icon={<Brain className="w-4 h-4 text-violet-400" />}
            label="KNOWLEDGE GAP SCORE"
            value="18%"
            trend="-4.0%"
            isPositive={true}
          />
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-3">
          <FeatureCard
            icon={<Cpu className="w-4 h-4 text-indigo-400" />}
            title="Knowledge Gap Detection"
            description="Real-time competency mapping"
          />
          <FeatureCard
            icon={<Layers className="w-4 h-4 text-violet-400" />}
            title="AI Recommendations"
            description="Personalized learning paths"
          />
          <FeatureCard
            icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
            title="Workforce Intelligence"
            description="Deep organizational readiness"
          />
        </div>
      </div>

      {/* Footer Meta Details */}
      <div className="flex items-center gap-6 pt-4 border-t border-slate-800/60 text-xs font-medium text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300">AI Powered</span>
        </div>
        <span className="text-slate-700">•</span>
        <span>Secure Infrastructure</span>
        <span className="text-slate-700">•</span>
        <span>JWT Authentication</span>
      </div>
    </div>
  );
};

export default HeroSection;