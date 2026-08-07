import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff,
  Target, 
  BarChart2, 
  Brain, 
  GraduationCap, 
  ShieldCheck, 
  Sun, 
  Moon,
  Shield,
  KeyRound
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SocialLogin from "@/components/auth/SocialLogin";
import RoleSelector from "@/components/auth/RoleSelector";
import LoginButton from "@/components/auth/LoginButton";
import RememberMe from "@/components/auth/RememberMe";
import Divider from "@/components/auth/Divider";

// Imported ai-bg.png image
import aiBgImage from "@/assets/images/ai-bg.png";

// Import Auth Context
import { useAuth } from "@/context/AuthContext";

type RoleType = "ROLE_EMPLOYEE" | "ROLE_HR" | "ROLE_MANAGER" | "ROLE_ADMIN";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, getRoleDashboardPath } = useAuth();

  const [role, setRole] = useState<RoleType>("ROLE_EMPLOYEE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Normalize the selected role card (e.g. "ROLE_HR" -> "HR")
    const normalizedRole = role.replace("ROLE_", "").toLowerCase();

    // Map directly to your project's folder structure routes
    let redirectPath = "/employee";
    if (normalizedRole === "hr") redirectPath = "/hr";
    else if (normalizedRole === "manager") redirectPath = "/manager";
    else if (normalizedRole === "admin") redirectPath = "/admin";

    // Simulate brief smooth transition, then route directly to the dashboard
    setTimeout(() => {
      setIsLoading(false);
      navigate(redirectPath, { replace: true });
    }, 400);
  };
  return (
    <div className={`h-screen w-full flex bg-[#0d0922] font-sans antialiased overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      
      {/* LEFT SIDE - Hero & Analytics Display with Background Image */}
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
            <span className="text-xl font-black tracking-wider text-white leading-none block">OKIP</span>
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
              Empowering organizations to identify, analyze, and close workforce gaps using modern competency intelligence.
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
                  <p className="text-[9px] font-bold text-slate-300 uppercase">ORGANIZATION READINESS</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-white">82%</span>
                    <span className="text-[10px] font-semibold text-emerald-400">↑ 5.5%</span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-400">vs last quarter</p>
            </div>

            <div className="p-3 rounded-xl bg-[#130d36]/80 border border-purple-500/30 backdrop-blur-md">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-300">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase">KNOWLEDGE GAP SCORE</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-white">18%</span>
                    <span className="text-[10px] font-semibold text-rose-400">↓ 4.0%</span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-400">vs last quarter</p>
            </div>
          </div>

          {/* 3 Lower Feature Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#130d36]/60 border border-purple-500/20 backdrop-blur-md space-y-0.5">
              <div className="p-1 rounded-md bg-purple-600/30 text-purple-300 w-fit mb-1">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-[11px] font-bold text-white leading-snug">Knowledge Gap Detection</h4>
              <p className="text-[9px] text-slate-300 leading-tight">Real-time competency mapping</p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#130d36]/60 border border-purple-500/20 backdrop-blur-md space-y-0.5">
              <div className="p-1 rounded-md bg-purple-600/30 text-purple-300 w-fit mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-[11px] font-bold text-white leading-snug">AI Learning Recommendations</h4>
              <p className="text-[9px] text-slate-300 leading-tight">Personalized learning paths</p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#130d36]/60 border border-purple-500/20 backdrop-blur-md space-y-0.5">
              <div className="p-1 rounded-md bg-purple-600/30 text-purple-300 w-fit mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-[11px] font-bold text-white leading-snug">Workforce Intelligence</h4>
              <p className="text-[9px] text-slate-300 leading-tight">Deep organizational readiness</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center gap-3 text-[11px] text-slate-300">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> AI Powered</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Secure</span>
          <span>•</span>
          <span className="flex items-center gap-1"><KeyRound className="w-3 h-3" /> JWT Authentication</span>
        </div>
      </div>

      {/* RIGHT SIDE - Floating Form Container (Fixed Non-Scrollable Layout) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 xl:p-6 bg-[#f3f4f8] dark:bg-slate-950 h-full overflow-hidden">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-5 xl:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative max-h-[96vh] flex flex-col justify-between">
          
          {/* Light/Dark Toggle */}
          <div className="absolute top-4 right-4 flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setIsDarkMode(false)}
              className={`p-1 rounded-full transition-all ${!isDarkMode ? 'bg-white shadow text-amber-500' : 'text-slate-400'}`}
            >
              <Sun className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsDarkMode(true)}
              className={`p-1 rounded-full transition-all ${isDarkMode ? 'bg-slate-700 text-purple-400' : 'text-slate-400'}`}
            >
              <Moon className="w-3 h-3" />
            </button>
          </div>

          {/* Form Header */}
          <div className="space-y-0.5 mb-2">
            <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in to your enterprise intelligence dashboard.
            </p>
          </div>

          {/* Social Logins */}
          <SocialLogin />

          <Divider text="OR CONTINUE WITH EMAIL" />

          {/* Error Message Display */}
          {errorMessage && (
            <div className="mb-2 p-2.5 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Organization Email */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Organization Email
              </Label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9 h-9 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-xs focus-visible:ring-purple-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-medium text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9 pr-9 h-9 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-xs focus-visible:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <RememberMe checked={rememberMe} onCheckedChange={setRememberMe} />

            {/* Role Selection */}
            <RoleSelector value={role} onChange={setRole} />

            {/* Access Platform Button */}
            <LoginButton isLoading={isLoading} />
          </form>

          {/* Footer Demo Link */}
          <div className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            New to OKIP?{" "}
            <a href="#" className="font-semibold text-purple-600 dark:text-purple-400 hover:underline">
              Request an enterprise demo
            </a>
          </div>

          <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <Shield className="w-3 h-3" />
            <span>ENTERPRISE-GRADE SSO ENABLED</span>
          </div>

          {/* Bottom Link to Register */}
          <div className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link 
              to="/register" 
              className="font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;