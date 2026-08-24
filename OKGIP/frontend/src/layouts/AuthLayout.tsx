import React, { ReactNode } from "react";

interface AuthLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  leftContent,
  rightContent,
}) => {
  return (
    <div className="w-screen h-screen overflow-hidden bg-background text-foreground flex flex-col lg:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* Left Column: Hero & Branding Section */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-[52%] h-full bg-slate-950 flex-col justify-between p-8 xl:p-12 overflow-hidden border-r border-slate-800/60">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.12),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b15_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        
        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full max-w-2xl mx-auto">
          {leftContent}
        </div>
      </div>

      {/* Right Column: Authentication Form Container */}
      <div className="relative flex-1 lg:w-1/2 xl:w-[48%] h-full bg-slate-50 dark:bg-slate-950/80 backdrop-blur-3xl overflow-y-auto lg:overflow-hidden flex flex-col justify-center">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full h-full flex flex-col justify-center items-center">
          {rightContent}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;