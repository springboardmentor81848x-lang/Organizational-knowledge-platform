import AuthHero from "@/components/auth/AuthHero";
import React, { useState } from "react";
import { authService } from "@/services/authService";
import { Link, useNavigate } from "react-router-dom";
import "@/styles/auth.css";
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
  const { login } = useAuth();

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

  try {
    // Login request to backend
    const response = await authService.login({
      email,
      password,
    });

    console.log("LOGIN RESPONSE =", response);

    // Check JWT
    if (!response.token) {
      throw new Error("Token was not received from backend");
    }

    console.log("LOGIN SUCCESS - TOKEN RECEIVED");

    // Store JWT through AuthContext
    login(response.token, rememberMe);

    // Use the role selected on the login screen
    let redirectPath = "/employee";

    switch (role) {
      case "ROLE_ADMIN":
        redirectPath = "/admin";
        break;

      case "ROLE_HR":
        redirectPath = "/hr";
        break;

      case "ROLE_MANAGER":
        redirectPath = "/manager";
        break;

      case "ROLE_EMPLOYEE":
        redirectPath = "/employee";
        break;

      default:
        redirectPath = "/employee";
        break;
    }

    console.log("SELECTED ROLE =", role);
    console.log("REDIRECTING TO =", redirectPath);

    navigate(redirectPath, { replace: true });

  } catch (error: any) {
    console.error("Login failed:", error);

    if (error?.response?.status === 401) {
      setErrorMessage(
        "Invalid email or password. Please check your credentials."
      );
    } else if (error?.response?.status === 403) {
      setErrorMessage(
        "Account pending HR approval or access forbidden."
      );
    } else {
      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please try again."
      );
    }
  } finally {
    setIsLoading(false);
  }
};
  return (
    <div className={`h-screen w-full flex bg-[#0d0922] font-sans antialiased overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      
      {/* LEFT SIDE - Hero & Analytics Display with Background Image */}
    <AuthHero/>

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