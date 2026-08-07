import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Building, 
  ArrowRight,
  Sun,
  Moon
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#0b0c1e]/80 backdrop-blur-xl rounded-2xl p-6 xl:p-8 border border-slate-800/80 shadow-2xl relative flex flex-col justify-between">
      
      {/* Theme Switcher Toggle */}
      <div className="absolute top-6 right-6 flex items-center p-1 rounded-full bg-slate-800/60 border border-slate-700/50">
        <button type="button" className="p-1 rounded-full text-slate-400 hover:text-white transition-colors">
          <Sun className="w-3.5 h-3.5" />
        </button>
        <button type="button" className="p-1 rounded-full bg-slate-700/80 text-purple-400">
          <Moon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Role Sub-badge */}
      <div className="inline-flex items-center gap-1.5 text-purple-400 font-semibold text-[11px] tracking-wider uppercase mb-2">
        <User className="w-3.5 h-3.5" />
        <span>EMPLOYEE REGISTRATION</span>
      </div>

      {/* Header */}
      <div className="space-y-1 mb-3">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Create your account
        </h2>
        <p className="text-xs text-slate-400">
          Register for OKIP. Your account will be reviewed by HR before you can sign in.
        </p>
      </div>

      {/* Divider */}
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800/80" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
          <span className="bg-[#0b0c1e] px-2 text-slate-500 font-semibold">YOUR DETAILS</span>
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-300">First Name</Label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <Input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="pl-9 h-9 bg-[#050611] border-slate-800 text-white placeholder:text-slate-600 rounded-xl text-xs focus-visible:ring-purple-500 focus-visible:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-300">Last Name</Label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <Input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="pl-9 h-9 bg-[#050611] border-slate-800 text-white placeholder:text-slate-600 rounded-xl text-xs focus-visible:ring-purple-500 focus-visible:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Organization Email */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-300">Organization Email</Label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <Input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-9 h-9 bg-[#050611] border-slate-800 text-white placeholder:text-slate-600 rounded-xl text-xs focus-visible:ring-purple-500 focus-visible:border-purple-500"
            />
          </div>
        </div>

        {/* Department ID */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-300">Department ID</Label>
          <div className="relative">
            <Building className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <Input
              type="text"
              placeholder="e.g. 1"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              required
              className="pl-9 h-9 bg-[#050611] border-slate-800 text-white placeholder:text-slate-600 rounded-xl text-xs focus-visible:ring-purple-500 focus-visible:border-purple-500"
            />
          </div>
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-300">Password</Label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9 pr-8 h-9 bg-[#050611] border-slate-800 text-white placeholder:text-slate-600 rounded-xl text-xs focus-visible:ring-purple-500 focus-visible:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-300">Confirm Password</Label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-9 pr-8 h-9 bg-[#050611] border-slate-800 text-white placeholder:text-slate-600 rounded-xl text-xs focus-visible:ring-purple-500 focus-visible:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 mt-1">
          Use at least 8 characters. Your password is encrypted before it is stored.
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 cursor-pointer"
        >
          <span>{isLoading ? "Creating Account..." : "Register Account"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Footer link */}
      <div className="mt-3 text-center text-xs text-slate-400">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-purple-400 hover:underline">
          Sign in here
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;