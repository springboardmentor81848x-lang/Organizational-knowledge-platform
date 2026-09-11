import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/api';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await authService.forgotPassword(email);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Forgot Password
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter your work email address to receive password recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
            Recovery Email Dispatched
          </h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            We sent a password reset link to <span className="font-bold">{email}</span>. Please check your inbox.
          </p>
          <Link
            to="/login"
            className="inline-block pt-2 text-xs font-bold text-blue-600 hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                placeholder="alex.morgan@enterprise.ai"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition"
          >
            Send Reset Instructions
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
