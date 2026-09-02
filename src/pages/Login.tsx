import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  X,
  Eye,
  EyeOff,
  KeyRound,
  Users,
  Target,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BotanicalBackground } from '../components/ui/BotanicalBackground';
import { AuthDeskIllustration } from '../components/ui/AuthDeskIllustration';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [generatedDemoCode, setGeneratedDemoCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  // Google / Gmail Auth Modal State
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleStep, setGoogleStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<{
    name: string;
    email: string;
    avatar: string;
    bgColor: string;
    role: string;
  }>({
    name: 'Alex Morgan',
    email: 'alex.morgan@gmail.com',
    avatar: 'A',
    bgColor: 'bg-purple-600',
    role: 'Employee',
  });
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [isUsingCustomAccount, setIsUsingCustomAccount] = useState(false);
  const [googlePassword, setGooglePassword] = useState('Password123!');
  const [showGooglePasswordInput, setShowGooglePasswordInput] = useState(false);
  const [googlePasswordError, setGooglePasswordError] = useState('');

  const googleAccountsList = [
    {
      name: 'Alex Morgan',
      email: 'alex.morgan@gmail.com',
      avatar: 'A',
      bgColor: 'bg-purple-600',
      role: 'Employee',
      designation: 'Senior Full Stack Developer',
    },
    {
      name: 'Harish Kumar',
      email: 'harishkumar636r@gmail.com',
      avatar: 'H',
      bgColor: 'bg-teal-600',
      role: 'Employee',
      designation: 'Staff Software Engineer',
    },
    {
      name: 'Sarah Chen',
      email: 'sarah.chen@okgip.org',
      avatar: 'S',
      bgColor: 'bg-blue-600',
      role: 'Manager',
      designation: 'Lead Data Scientist',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid registered email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      if (res.data.success) {
        setGeneratedDemoCode(res.data.demoCode || '');
        setForgotSuccessMsg(res.data.message || 'Verification code sent.');
        setForgotStep(2);
      }
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Failed to request password reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotCode.trim()) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail,
        code: forgotCode.trim(),
        newPassword,
      });

      if (res.data.success) {
        setForgotStep(3);
      }
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Failed to reset password. Please check the code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCompleteForgotAndLogin = () => {
    setEmail(forgotEmail);
    setPassword(newPassword);
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotCode('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
  };

  const handleSelectGoogleAccount = (acc: typeof googleAccountsList[0]) => {
    setSelectedGoogleAccount(acc);
    setIsUsingCustomAccount(false);
    setGooglePassword('Password123!');
    setGooglePasswordError('');
    setGoogleStep(2);
  };

  const handleSelectCustomAccount = () => {
    if (!customGoogleEmail || !customGoogleEmail.includes('@')) {
      setGooglePasswordError('Please enter a valid email address.');
      return;
    }
    const namePart = customGoogleEmail.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    setSelectedGoogleAccount({
      name: formattedName,
      email: customGoogleEmail,
      avatar: formattedName.charAt(0),
      bgColor: 'bg-emerald-600',
      role: 'Employee',
    });
    setGooglePassword('Password123!');
    setGooglePasswordError('');
    setGoogleStep(2);
  };

  const handleVerifyGooglePassword = () => {
    if (!googlePassword || googlePassword.length < 6) {
      setGooglePasswordError('Enter a valid password (minimum 6 characters).');
      return;
    }
    setGooglePasswordError('');
    setGoogleStep(3);
  };

  const handleAuthorizeGoogleConsent = async () => {
    setGoogleStep(4);
    setGoogleLoading(true);
    setError('');

    try {
      const targetEmail = selectedGoogleAccount.email;
      const emailParts = targetEmail.split('@')[0].split('.');
      const derivedFirst = selectedGoogleAccount.name.split(' ')[0] || (emailParts[0] ? emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1) : 'Google');
      const derivedLast = selectedGoogleAccount.name.split(' ')[1] || (emailParts[1] ? emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1) : 'User');

      const res = await api.post('/auth/google', {
        email: targetEmail,
        role: selectedGoogleAccount.role || 'Employee',
        firstName: derivedFirst,
        lastName: derivedLast,
        designation: (selectedGoogleAccount as any).designation || 'Software Engineer',
        departmentId: 1,
        phone: '+1-800-555-0199',
        photoUrl: '/default-avatar.svg',
        googleId: 'g_' + Date.now(),
      });

      if (res.data.success) {
        setTimeout(() => {
          login(res.data.token, res.data.user);
          setShowGoogleModal(false);
          navigate('/dashboard');
        }, 600);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google OAuth Login failed.');
      setShowGoogleModal(false);
    } finally {
      setGoogleLoading(false);
    }
  };

  const openGoogleOAuthModal = () => {
    setGoogleStep(1);
    setIsUsingCustomAccount(false);
    setCustomGoogleEmail('');
    setGooglePassword('Password123!');
    setGooglePasswordError('');
    setShowGoogleModal(true);
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
              Welcome <span className="text-[#0A7A74]">Back!</span>
            </h2>
            <div className="w-10 h-1 bg-[#0A7A74] rounded-full shadow-2xs" />
            <p className="text-xs text-slate-600 font-medium max-w-md leading-relaxed">
              Continue bridging knowledge gaps, tracking competencies, and empowering workforce growth across intelligent pipelines.
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

        {/* RIGHT COLUMN: Sign In Card */}
        <div className="lg:col-span-6 w-full flex flex-col justify-center">
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_-15px_rgba(4,78,73,0.14),0_8px_20px_-6px_rgba(0,0,0,0.06)] border border-slate-200/90 p-5 sm:p-6 relative z-20 space-y-2.5 max-w-[540px] w-full lg:ml-auto">
            
            {/* Top Row: Title + Toggle Pill */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Sign in to your account
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Access workforce analytics, learning & training insights
                </p>
              </div>

              {/* Mode Toggle Pill */}
              <div className="flex items-center bg-slate-100/90 p-1 rounded-full text-xs font-bold border border-slate-200 shrink-0">
                <span className="px-3 py-1 rounded-full bg-[#0A7A74] text-white shadow-xs text-xs">
                  Sign In
                </span>
                <Link
                  to="/register"
                  className="px-3 py-1 rounded-full text-slate-600 hover:text-[#0A7A74] transition-colors text-xs"
                >
                  Sign Up
                </Link>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span className="truncate">{error}</span>
              </div>
            )}

            {/* Sign In Form with 44px-48px Inputs */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold text-xs">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-11 bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A7A74] focus:bg-white text-xs sm:text-sm font-medium transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-bold text-xs">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email || 'alex.morgan@okgip.org');
                      setForgotStep(1);
                      setForgotError('');
                      setShowForgotModal(true);
                    }}
                    className="text-xs text-[#0A7A74] hover:underline font-bold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full h-11 bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A7A74] focus:bg-white text-xs sm:text-sm font-medium transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#0A7A74] focus:ring-[#0A7A74] cursor-pointer accent-[#0A7A74]"
                  />
                  <span className="text-slate-600 text-xs font-medium">Remember me for 30 days</span>
                </label>
              </div>

              {/* Solid Teal Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#0A7A74] hover:bg-[#086963] text-white font-extrabold px-6 rounded-xl shadow-[0_4px_14px_rgba(10,122,116,0.25)] hover:shadow-[0_6px_18px_rgba(10,122,116,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center py-0.5">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                or continue with
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={openGoogleOAuthModal}
              className="w-full h-11 bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 rounded-xl border border-slate-200 hover:border-[#0A7A74] shadow-2xs flex items-center justify-center gap-2.5 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Bottom Footer */}
            <div className="text-center pt-1">
              <p className="text-xs text-slate-500 font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#0A7A74] hover:text-[#086963] font-bold hover:underline">
                  Sign up for OKGIP
                </Link>
              </p>
            </div>
        </div>
        </div>
      </div>

      {/* Forgot Password Flow Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full p-6 relative overflow-hidden"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0A7A74] flex items-center justify-center border border-teal-100">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Reset OKGIP Password
                  </h3>
                  <p className="text-xs text-slate-500">
                    Step {forgotStep} of 3 • Secure Recovery Workflow
                  </p>
                </div>
              </div>

              {forgotError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {forgotError}
                </div>
              )}

              {/* STEP 1: Enter Email */}
              {forgotStep === 1 && (
                <form onSubmit={handleSendResetCode} className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter your registered company email address. We'll generate a secure 6-digit verification code.
                  </p>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Work Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="alex.morgan@okgip.org"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0A7A74] focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-[#0A7A74] hover:bg-[#086963] text-white font-extrabold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending...' : 'Generate Verification Code'}
                  </button>
                </form>
              )}

              {/* STEP 2: Enter Verification Code + New Password */}
              {forgotStep === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  {forgotSuccessMsg && (
                    <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-[#0A7A74] text-xs font-semibold">
                      {forgotSuccessMsg}
                    </div>
                  )}

                  {generatedDemoCode && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                      <span className="font-extrabold block mb-0.5">Demo System Simulator:</span>
                      Your verification OTP code is: <strong className="text-sm font-black text-amber-700">{generatedDemoCode}</strong>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">6-Digit Verification Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value)}
                      placeholder="e.g. 849201"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm tracking-widest text-center font-black text-slate-900 focus:outline-none focus:border-[#0A7A74] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-9 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0A7A74]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-9 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0A7A74]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-[#0A7A74] hover:bg-[#086963] text-white font-extrabold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50 mt-2"
                  >
                    {forgotLoading ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </form>
              )}

              {/* STEP 3: Success Confirmation */}
              {forgotStep === 3 && (
                <div className="text-center space-y-4 py-2">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0A7A74] flex items-center justify-center mx-auto border border-teal-200">
                    <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Password Updated Successfully!</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Your password has been changed. You can now log into your OKGIP workspace.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCompleteForgotAndLogin}
                    className="w-full bg-[#0A7A74] hover:bg-[#086963] text-white font-extrabold py-2.5 px-4 rounded-xl shadow-sm transition-all cursor-pointer text-xs"
                  >
                    Proceed to Dashboard
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Realistic 4-Step Google OAuth Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-[440px] w-full p-6 sm:p-7 relative overflow-hidden text-slate-800"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowGoogleModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* STEP 1: Account Chooser */}
              {googleStep === 1 && (
                <div className="space-y-4">
                  {/* Google Logo & Title */}
                  <div className="text-center space-y-2 pt-1">
                    <div className="w-10 h-10 mx-auto flex items-center justify-center">
                      <svg className="w-9 h-9" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      Choose an account
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      to continue to <span className="font-bold text-[#0A7A74]">OKGIP Intelligence Platform</span>
                    </p>
                  </div>

                  {/* Account List */}
                  <div className="space-y-1.5 pt-2">
                    {googleAccountsList.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => handleSelectGoogleAccount(acc)}
                        className="w-full p-2.5 rounded-2xl hover:bg-slate-50 border border-slate-200/80 hover:border-[#0A7A74]/50 flex items-center justify-between text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${acc.bgColor} text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0`}>
                            {acc.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-[#0A7A74] transition-colors truncate">
                              {acc.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {acc.email}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full shrink-0">
                          {acc.role}
                        </span>
                      </button>
                    ))}

                    {/* Use Another Account Option */}
                    {!isUsingCustomAccount ? (
                      <button
                        type="button"
                        onClick={() => setIsUsingCustomAccount(true)}
                        className="w-full p-2.5 rounded-2xl hover:bg-slate-50 border border-dashed border-slate-300 hover:border-[#0A7A74] flex items-center gap-3 text-left transition-all cursor-pointer group mt-2"
                      >
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg group-hover:bg-teal-50 group-hover:text-[#0A7A74] transition-colors">
                          +
                        </div>
                        <span className="text-xs font-bold text-slate-700 group-hover:text-[#0A7A74] transition-colors">
                          Use another account
                        </span>
                      </button>
                    ) : (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 mt-2">
                        <label className="block text-xs font-bold text-slate-700">Enter Google Email</label>
                        <input
                          type="email"
                          value={customGoogleEmail}
                          onChange={(e) => setCustomGoogleEmail(e.target.value)}
                          placeholder="your.email@company.com"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0A7A74]"
                        />
                        {googlePasswordError && (
                          <p className="text-[11px] text-rose-600 font-medium">{googlePasswordError}</p>
                        )}
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setIsUsingCustomAccount(false)}
                            className="px-3 py-1.5 text-xs text-slate-500 font-bold hover:text-slate-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSelectCustomAccount}
                            className="px-4 py-1.5 text-xs bg-[#0A7A74] text-white font-bold rounded-xl hover:bg-[#086963]"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 text-center pt-2">
                    To continue, Google will share your name, email address, and profile picture with OKGIP.
                  </p>
                </div>
              )}

              {/* STEP 2: Password / Verification */}
              {googleStep === 2 && (
                <div className="space-y-4">
                  {/* Google Logo */}
                  <div className="text-center space-y-2 pt-1">
                    <div className="w-10 h-10 mx-auto flex items-center justify-center">
                      <svg className="w-9 h-9" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      Enter your password
                    </h3>

                    {/* Account Pill */}
                    <button
                      type="button"
                      onClick={() => setGoogleStep(1)}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition-colors mx-auto"
                    >
                      <span className={`w-4 h-4 rounded-full ${selectedGoogleAccount.bgColor} text-white text-[10px] flex items-center justify-center font-bold`}>
                        {selectedGoogleAccount.avatar}
                      </span>
                      <span>{selectedGoogleAccount.email}</span>
                      <span className="text-[10px] text-slate-400">▼</span>
                    </button>
                  </div>

                  {/* Password Input Form */}
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <div className="relative">
                        <input
                          type={showGooglePasswordInput ? 'text' : 'password'}
                          value={googlePassword}
                          onChange={(e) => setGooglePassword(e.target.value)}
                          placeholder="Password"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0A7A74] focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowGooglePasswordInput(!showGooglePasswordInput)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                          {showGooglePasswordInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {googlePasswordError && (
                        <p className="text-[11px] text-rose-600 font-medium">{googlePasswordError}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showGooglePasswordInput}
                          onChange={(e) => setShowGooglePasswordInput(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-[#0A7A74]"
                        />
                        <span>Show password</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(selectedGoogleAccount.email);
                          setShowGoogleModal(false);
                          setShowForgotModal(true);
                        }}
                        className="text-[#0A7A74] font-bold hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Biometric Passkey simulation note */}
                    <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-100 flex items-center gap-2 text-[11px] text-[#0A7A74]">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Google Passkey / 2-Step Verification enabled for this account.</span>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-3">
                      <button
                        type="button"
                        onClick={() => setGoogleStep(1)}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleVerifyGooglePassword}
                        className="px-6 py-2 text-xs bg-[#0A7A74] hover:bg-[#086963] text-white font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Consent Scope Screen */}
              {googleStep === 3 && (
                <div className="space-y-4">
                  {/* Google Logo & Title */}
                  <div className="text-center space-y-2 pt-1">
                    <div className="w-10 h-10 mx-auto flex items-center justify-center">
                      <svg className="w-9 h-9" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                      OKGIP Intelligence Platform wants to access your Google Account
                    </h3>

                    {/* Account Pill */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 mx-auto">
                      <span className={`w-4 h-4 rounded-full ${selectedGoogleAccount.bgColor} text-white text-[10px] flex items-center justify-center font-bold`}>
                        {selectedGoogleAccount.avatar}
                      </span>
                      <span>{selectedGoogleAccount.email}</span>
                    </div>
                  </div>

                  {/* Scopes List */}
                  <div className="space-y-2.5 pt-1">
                    <p className="text-xs font-bold text-slate-700">
                      This will allow OKGIP Intelligence Platform to:
                    </p>

                    <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div className="flex items-start gap-2.5">
                        <Mail className="w-4 h-4 text-[#0A7A74] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-800">See your primary Google Account email address</p>
                          <p className="text-[11px] text-slate-500">openid / email</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 border-t border-slate-200/60 pt-2">
                        <Users className="w-4 h-4 text-[#0A7A74] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-800">See your personal info</p>
                          <p className="text-[11px] text-slate-500">profile picture, name, and basic organizational details</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 border-t border-slate-200/60 pt-2">
                        <ShieldCheck className="w-4 h-4 text-[#0A7A74] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-800">Associate you with your OKGIP enterprise profile</p>
                          <p className="text-[11px] text-slate-500">Single Sign-On authentication tokens</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Make sure you trust OKGIP. You may be sharing sensitive info with this site or app.
                    </p>
                  </div>

                  {/* Consent Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowGoogleModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAuthorizeGoogleConsent}
                      className="px-6 py-2.5 text-xs bg-[#0A7A74] hover:bg-[#086963] text-white font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Allow
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Success & Redirecting */}
              {googleStep === 4 && (
                <div className="text-center space-y-4 py-6">
                  <div className="w-14 h-14 rounded-full bg-teal-50 text-[#0A7A74] flex items-center justify-center mx-auto border-2 border-teal-200 animate-pulse">
                    <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      Authenticated Successfully!
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Signing you in as <span className="font-bold text-[#0A7A74]">{selectedGoogleAccount.name}</span>...
                    </p>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                    <div className="w-full h-full bg-[#0A7A74] animate-indeterminate" />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
