import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Brain, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  Briefcase, 
  Building2, 
  ArrowRight,
  Target,
  BarChart2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    employeeId: "",
    department: "Engineering",
    role: "Employee",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const targetRoute = "/" + formData.role.toLowerCase();

    setTimeout(() => {
      setIsLoading(false);
      navigate(targetRoute, { replace: true });
    }, 400);
  };

  return (
    <div className="h-screen w-full flex bg-[#0d0922] font-sans antialiased overflow-hidden">
      
      {/* Left Promotional Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-8 xl:p-12 overflow-hidden border-r border-purple-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#120b34] via-[#0d0922] to-[#060411] z-0" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider text-white">OKIP</h1>
            <p className="text-[9px] text-purple-300 font-medium tracking-tight">ORGANIZATIONAL KNOWLEDGE GAP INTELLIGENCE PLATFORM</p>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-4 max-w-lg my-auto">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3 h-3" /> AI-Powered Workforce Intelligence
          </div>
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Bridge the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-200">Knowledge Gap</span>
          </h2>
          <p className="text-slate-300 text-xs xl:text-sm leading-relaxed">
            Empowering organizations to identify, analyze, and close workforce gaps using modern competency intelligence.
          </p>

          {/* Mini Cards */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-md space-y-1">
              <div className="text-purple-400 mb-1"><Target className="w-4 h-4" /></div>
              <p className="text-[9px] uppercase font-bold text-slate-400">Organization Readiness</p>
              <div className="text-lg font-extrabold text-white">82% <span className="text-[11px] text-emerald-400 font-semibold">+5.5%</span></div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-md space-y-1">
              <div className="text-indigo-400 mb-1"><BarChart2 className="w-4 h-4" /></div>
              <p className="text-[9px] uppercase font-bold text-slate-400">Knowledge Gap Score</p>
              <div className="text-lg font-extrabold text-white">18% <span className="text-[11px] text-rose-400 font-semibold">-4.0%</span></div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center gap-6 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> AI Powered</span>
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-purple-400" /> Secure</span>
          <span>JWT Authentication</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg bg-slate-900/90 border border-purple-500/20 rounded-3xl p-6 xl:p-7 shadow-2xl backdrop-blur-xl space-y-4">
          
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-white tracking-tight">Create Your Account</h2>
            <p className="text-[11px] text-slate-400">Join the Organizational Knowledge Intelligence Platform.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            
            {/* Full Name */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-300">Full Name</Label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                  className="pl-9 h-8.5 bg-slate-950 border-slate-800 rounded-xl text-xs text-white focus-visible:ring-purple-500"
                />
              </div>
            </div>

            {/* Organization Email */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-300">Organization Email</Label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="pl-9 h-8.5 bg-slate-950 border-slate-800 rounded-xl text-xs text-white focus-visible:ring-purple-500"
                />
              </div>
            </div>

            {/* Employee ID and Department Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-300">Employee ID (Optional)</Label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="Enter employee ID"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    className="pl-9 h-8.5 bg-slate-950 border-slate-800 rounded-xl text-xs text-white focus-visible:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-300">Department</Label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full pl-9 pr-3 h-8.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="HR">Human Resources</option>
                    <option value="Product">Product Management</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Select Role Cards */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-300">Select Your Role</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "Employee", label: "Employee", desc: "Personal dashboard" },
                  { id: "HR", label: "HR", desc: "Manage workforce" },
                  { id: "Manager", label: "Manager", desc: "Oversee teams" },
                  { id: "Admin", label: "Admin", desc: "System control" },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setFormData({...formData, role: item.id})}
                    className={`cursor-pointer p-2.5 rounded-xl border text-left transition-all ${
                      formData.role === item.id 
                        ? "bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/20" 
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-[11px] font-bold text-white">{item.label}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Passwords Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    className="pl-9 pr-9 h-8.5 bg-slate-950 border-slate-800 rounded-xl text-xs text-white focus-visible:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-300">Confirm Password</Label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                    className="pl-9 pr-9 h-8.5 bg-slate-950 border-slate-800 rounded-xl text-xs text-white focus-visible:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-center gap-2 pt-0.5">
              <input type="checkbox" required className="rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-purple-500 w-3.5 h-3.5" />
              <span className="text-[11px] text-slate-400">
                I agree to the <span className="text-purple-400 underline cursor-pointer">Terms of Service</span> and <span className="text-purple-400 underline cursor-pointer">Privacy Policy</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2 mt-1"
            >
              {isLoading ? "Creating Account..." : <><span>Create Account</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Footer Sign in Link */}
          <div className="text-center text-[11px] text-slate-400 pt-1">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-purple-400 hover:underline">
              Sign In
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Register;