import React from "react";
import {
  Brain,
  Sparkles,
  Target,
  BarChart2,
  GraduationCap,
  ShieldCheck,
  Lock,
  KeyRound,
} from "lucide-react";

import aiBgImage from "@/assets/images/ai-bg.png";

const AuthHero: React.FC = () => {
  return (
    <div
      className="hidden lg:flex flex-col justify-between w-1/2 p-6 xl:p-8 relative overflow-hidden bg-cover bg-center bg-no-repeat h-full"
      style={{ backgroundImage: `url(${aiBgImage})` }}
    >
      {/* Dark Overlay for optimal text readability */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0a061c]/90 via-[#0d0728]/70 to-[#0c0524]/60 pointer-events-none" />

      {/* Ambient Glow Effects */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/15 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Logo */}
      <div className="relative z-10 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/30">
          <Brain className="w-5 h-5" />
        </div>

        <div>
          <span className="text-xl font-black tracking-wider text-white leading-none block">
            OKIP
          </span>

          <p className="text-[8px] font-bold text-slate-300 tracking-widest uppercase leading-tight">
            ORGANIZATIONAL KNOWLEDGE GAP INTELLIGENCE PLATFORM
          </p>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 my-auto py-2 max-w-lg space-y-4 xl:space-y-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 backdrop-blur-md text-purple-300 text-[11px] font-semibold">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>AI-POWERED WORKFORCE INTELLIGENCE</span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-[1.15]">
            Bridge the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-300">
              Knowledge Gap
            </span>
          </h1>

          <p className="text-slate-200 text-xs xl:text-sm leading-relaxed max-w-md drop-shadow-sm">
            Empowering organizations to identify, analyze, and close workforce
            gaps using modern competency intelligence.
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <div className="p-3 rounded-xl bg-[#130d36]/80 border border-purple-500/30 backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-1.5 rounded-lg bg-purple-600/30 text-purple-300">
                <Target className="w-4 h-4" />
              </div>

              <div>
                <p className="text-[9px] font-bold text-slate-300 uppercase">
                  ORGANIZATION READINESS
                </p>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-white">82%</span>
                  <span className="text-[10px] font-semibold text-emerald-400">
                    ↑ 5.5%
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[9px] text-slate-400">
              vs last quarter
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#130d36]/80 border border-purple-500/30 backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-300">
                <BarChart2 className="w-4 h-4" />
              </div>

              <div>
                <p className="text-[9px] font-bold text-slate-300 uppercase">
                  KNOWLEDGE GAP SCORE
                </p>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-white">18%</span>
                  <span className="text-[10px] font-semibold text-rose-400">
                    ↓ 4.0%
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[9px] text-slate-400">
              vs last quarter
            </p>
          </div>
        </div>

        {/* 3 Lower Feature Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-xl bg-[#130d36]/60 border border-purple-500/20 backdrop-blur-md space-y-0.5">
            <div className="p-1 rounded-md bg-purple-600/30 text-purple-300 w-fit mb-1">
              <Brain className="w-3.5 h-3.5" />
            </div>

            <h4 className="text-[11px] font-bold text-white leading-snug">
              Knowledge Gap Detection
            </h4>

            <p className="text-[9px] text-slate-300 leading-tight">
              Real-time competency mapping
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#130d36]/60 border border-purple-500/20 backdrop-blur-md space-y-0.5">
            <div className="p-1 rounded-md bg-purple-600/30 text-purple-300 w-fit mb-1">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>

            <h4 className="text-[11px] font-bold text-white leading-snug">
              AI Learning Recommendations
            </h4>

            <p className="text-[9px] text-slate-300 leading-tight">
              Personalized learning paths
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#130d36]/60 border border-purple-500/20 backdrop-blur-md space-y-0.5">
            <div className="p-1 rounded-md bg-purple-600/30 text-purple-300 w-fit mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>

            <h4 className="text-[11px] font-bold text-white leading-snug">
              Workforce Intelligence
            </h4>

            <p className="text-[9px] text-slate-300 leading-tight">
              Deep organizational readiness
            </p>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="relative z-10 flex items-center gap-3 text-[11px] text-slate-300">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          AI Powered
        </span>

        <span>•</span>

        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Secure
        </span>

        <span>•</span>

        <span className="flex items-center gap-1">
          <KeyRound className="w-3 h-3" />
          JWT Authentication
        </span>
      </div>
    </div>
  );
};

export default AuthHero;