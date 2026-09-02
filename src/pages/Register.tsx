import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  X,
  Users,
  Target,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BotanicalBackground } from '../components/ui/BotanicalBackground';
import { AuthDeskIllustration } from '../components/ui/AuthDeskIllustration';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'Employee',
    designation: '',
    departmentId: '1',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleRole, setGoogleRole] = useState<'Employee' | 'Manager' | 'Department Head' | 'HR Specialist' | 'L&D Admin / Mentor' | 'Admin'>('Employee');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Please agree to the Terms & Conditions to register.');
      return;
    }
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username || formData.email.split('@')[0],
        password: formData.password,
        role: formData.role,
        designation: formData.designation || 'Software Engineer',
        departmentId: formData.departmentId,
      });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async (emailToLogin?: string) => {
    setError('');
    const targetEmail = emailToLogin || googleEmailInput;

    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please enter a valid Gmail address to continue.');
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await api.post('/auth/google', {
        email: targetEmail,
        role: googleRole,
        firstName: targetEmail.split('@')[0].split('.')[0] || 'Google',
        lastName: targetEmail.split('@')[0].split('.')[1] || 'User',
        photoUrl: '/default-avatar.svg',
        googleId: 'g_' + Date.now(),
      });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        setShowGoogleModal(false);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google signup failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-50 text-slate-800 flex items-center justify-center p-4 md:p-6 relative font-sans select-none">
      {/* Decorative Botanical Canvas */}
      <BotanicalBackground showPlants={true} showWaves={true} showGrid={true} />

      {/* Main Responsive Two-Column Container */}
      <div className="max-w-[1240px] w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center relative z-10 my-auto">

        {/* LEFT COLUMN: Brand Hero, Workspace Illustration & Feature Cards */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between py-2 pr-2 gap-3">
          {/* Logo Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 relative flex items-center justify-center shrink-0 drop-shadow-[0_4px_10px_rgba(13,148,136,0.22)]">
              <svg viewBox="0 0 44 44" className="w-9 h-9">
                <circle cx="22" cy="22" r="16" stroke="#E2F5F2" strokeWidth="6" fill="none" />
                <circle cx="22" cy="22" r="16" stroke="#0D9488" strokeWidth="6" strokeDasharray="30 70" strokeDashoffset="10" strokeLinecap="round" fill="none" />
                <circle cx="22" cy="22" r="16" stroke="#14B8A6" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="55" strokeLinecap="round" fill="none" />
                <circle cx="22" cy="22" r="16" stroke="#044E49" strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="90" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-slate-950 text-lg tracking-tight leading-none">
                  OKGIP
                </h1>
                <span className="text-[9px] font-extrabold bg-[#D1FAE5] text-[#065F46] px-1.5 py-0.5 rounded-full border border-[#059669]/30 shadow-2xs">
                  v3.0 Enterprise
                </span>
              </div>
              <p className="text-[10px] text-[#0A7A74] font-bold tracking-tight mt-0.5">
                Intelligence Platform
              </p>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-1.5">
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Join the <span className="text-[#0A7A74]">Workforce!</span>
            </h2>
            <div className="w-10 h-1 bg-[#0A7A74] rounded-full shadow-2xs" />
            <p className="text-xs text-slate-600 font-medium max-w-md leading-relaxed">
              Start diagnosing competence gaps, building personalized training paths, and discovering mentorship across intelligent pathways.
            </p>
          </div>

          {/* Scaled Vector Workspace Illustration */}
          <div className="flex items-center justify-center py-1">
            <div className="w-full max-w-[280px] max-h-[120px] overflow-hidden flex items-center justify-center">
              <AuthDeskIllustration className="scale-[0.75] origin-center" />
            </div>
          </div>

          {/* Bottom 4 Feature Cards */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-slate-200/90 shadow-2xs text-center space-y-0.5 hover:border-teal-400 hover:shadow-xs transition-all">
              <div className="w-6 h-6 rounded-lg bg-teal-50 text-[#0A7A74] flex items-center justify-center mx-auto border border-teal-100/90">
                <Users className="w-3 h-3 stroke-[2.2]" />
              </div>
              <p className="font-bold text-slate-900 text-[10px] leading-tight truncate">Analytics</p>
              <p className="text-[8px] text-slate-500 font-medium leading-tight truncate">Data decisions</p>
            </div>

            <div className="bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-slate-200/90 shadow-2xs text-center space-y-0.5 hover:border-teal-400 hover:shadow-xs transition-all">
              <div className="w-6 h-6 rounded-lg bg-teal-50 text-[#0A7A74] flex items-center justify-center mx-auto border border-teal-100/90">
                <Target className="w-3 h-3 stroke-[2.2]" />
              </div>
              <p className="font-bold text-slate-900 text-[10px] leading-tight truncate">Skills</p>
              <p className="text-[8px] text-slate-500 font-medium leading-tight truncate">Identify gaps</p>
            </div>

            <div className="bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-slate-200/90 shadow-2xs text-center space-y-0.5 hover:border-teal-400 hover:shadow-xs transition-all">
              <div className="w-6 h-6 rounded-lg bg-teal-50 text-[#0A7A74] flex items-center justify-center mx-auto border border-teal-100/90">
                <BookOpen className="w-3 h-3 stroke-[2.2]" />
              </div>
              <p className="font-bold text-slate-900 text-[10px] leading-tight truncate">Learning</p>
              <p className="text-[8px] text-slate-500 font-medium leading-tight truncate">Personalized</p>
            </div>

            <div className="bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-slate-200/90 shadow-2xs text-center space-y-0.5 hover:border-teal-400 hover:shadow-xs transition-all">
              <div className="w-6 h-6 rounded-lg bg-teal-50 text-[#0A7A74] flex items-center justify-center mx-auto border border-teal-100/90">
                <ShieldCheck className="w-3 h-3 stroke-[2.2]" />
              </div>
              <p className="font-bold text-slate-900 text-[10px] leading-tight truncate">Security</p>
              <p className="text-[8px] text-slate-500 font-medium leading-tight truncate">Protected</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Register Card */}
        <div className="lg:col-span-6 w-full flex flex-col justify-center">
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_-15px_rgba(4,78,73,0.14),0_8px_20px_-6px_rgba(0,0,0,0.06)] border border-slate-200/90 p-5 sm:p-6 relative z-20 space-y-2 max-w-[540px] w-full lg:ml-auto">
            
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Create your account
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Start intelligent workforce career progression
                </p>
              </div>

              <div className="flex items-center bg-slate-100/90 p-1 rounded-full text-xs font-bold border border-slate-200 shrink-0">
                <Link
                  to="/login"
                  className="px-3 py-1 rounded-full text-slate-600 hover:text-[#0A7A74] transition-colors text-xs"
                >
                  Sign In
                </Link>
                <span className="px-3 py-1 rounded-full bg-[#0A7A74] text-white shadow-xs text-xs">
                  Sign Up
                </span>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span className="truncate">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold text-xs">First Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Alex"
                      className="w-full h-10 bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A7A74] focus:bg-white text-xs sm:text-sm font-medium transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold text-xs">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Morgan"
                    className="w-full h-10 bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A7A74] focus:bg-white text-xs sm:text-sm font-medium transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold text-xs">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex.morgan@company.com"
                    className="w-full h-10 bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A7A74] focus:bg-white text-xs sm:text-sm font-medium transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold text-xs">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-10 bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-slate-900 focus:outline-none focus:border-[#0A7A74] focus:bg-white text-xs sm:text-sm font-medium transition-all"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Team Lead</option>
                    <option value="Department Head">Dept Head</option>
                    <option value="HR Specialist">HR Specialist</option>
                    <option value="L&D Admin / Mentor">L&D Mentor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold text-xs">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full h-10 bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-slate-900 focus:outline-none focus:border-[#0A7A74] focus:bg-white text-xs sm:text-sm font-medium transition-all"
                  >
                    <option value="1">Engineering</option>
                    <option value="2">Product Design</option>
                    <option value="3">Data Science</option>
                    <option value="4">Human Resources</option>
                    <option value="5">Sales & Growth</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold text-xs">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full h-10 bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-9 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A7A74] focus:bg-white text-xs sm:text-sm font-medium transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold text-xs">Confirm</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full h-10 bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-9 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A7A74] focus:bg-white text-xs sm:text-sm font-medium transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0A7A74] focus:ring-[#0A7A74] cursor-pointer accent-[#0A7A74]"
                />
                <span className="text-slate-600 text-xs">
                  I agree to <span className="text-[#0A7A74] font-bold">Terms of Service</span> & <span className="text-[#0A7A74] font-bold">Privacy Policy</span>
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#0A7A74] hover:bg-[#086963] text-white font-black px-6 rounded-xl shadow-[0_6px_20px_rgba(10,122,116,0.28)] hover:shadow-[0_8px_24px_rgba(10,122,116,0.38)] transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative flex items-center py-0.5">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                or register with
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full h-11 bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 rounded-xl border border-slate-200 hover:border-[#0A7A74] shadow-2xs flex items-center justify-center gap-2.5 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign up with Google</span>
            </button>

            <div className="text-center">
              <p className="text-xs text-slate-500 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-[#0A7A74] hover:text-[#086963] font-bold hover:underline">
                  Sign in to OKGIP
                </Link>
              </p>
        </div>
        </div>
        </div>
      </div>

      {/* Google Sign Up Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full p-6 relative overflow-hidden"
            >
              <button
                onClick={() => setShowGoogleModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Sign up with Google
                  </h3>
                  <p className="text-xs text-slate-500">
                    Seamless corporate onboarding
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Google / Gmail Address</label>
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="alex.morgan@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0A7A74]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Select Role</label>
                  <select
                    value={googleRole}
                    onChange={(e) => setGoogleRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0A7A74]"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Team Lead</option>
                    <option value="Department Head">Dept Head</option>
                    <option value="HR Specialist">HR Specialist</option>
                    <option value="L&D Admin / Mentor">L&D Mentor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleGoogleSignUp()}
                  disabled={googleLoading}
                  className="w-full bg-[#0A7A74] hover:bg-[#086963] text-white font-extrabold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50 mt-3"
                >
                  {googleLoading ? 'Registering...' : 'Register & Enter Platform'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
