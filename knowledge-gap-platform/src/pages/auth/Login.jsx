import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, ShieldCheck, User, Users, ShieldAlert } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('alex.morgan@enterprise.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState('employee');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    login({ email }, selectedRole);
    navigate(`/${selectedRole}/dashboard`);
  };

  const demoRoles = [
    { id: 'employee', label: 'Employee', icon: User, desc: 'Personal skills & learning' },
    { id: 'manager', label: 'Manager', icon: Users, desc: 'Team gaps & oversight' },
    { id: 'admin', label: 'HR / Admin', icon: ShieldCheck, desc: 'Enterprise analytics & users' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sign in to your Organizational Knowledge Intelligence Platform
        </p>
      </div>

      {/* Demo Role Selector Pills */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
          Quick Demo Role Selection
        </label>
        <div className="grid grid-cols-3 gap-2">
          {demoRoles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">{role.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Work Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
              placeholder="name@company.com"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition"
        >
          <span>Sign In to {selectedRole.toUpperCase()} Portal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
