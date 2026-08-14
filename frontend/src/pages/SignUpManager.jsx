import React, { useState } from 'react'
import Icon from '../components/Icon.jsx'
import api from '../services/api.js'

function calcStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const STRENGTH_LABELS = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']

const DEPT_OPTIONS = [
  'Engineering', 'Product', 'HR & Operations', 'Sales & Marketing',
  'Data & Analytics', 'Finance', 'Legal', 'Design', 'Customer Success', 'Other'
]

export default function SignUpManager({ onSwitchToLogin, onSwitchToSignUp, onLogin }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [company, setCompany] = useState('')
  const [department, setDepartment] = useState('')
  const [jobTitle, setJobTitle] = useState('Engineering Manager')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const strength = calcStrength(password)
  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const passwordMismatch = confirmPassword && password !== confirmPassword

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!department) {
      setError('Please select a department.')
      return
    }
    if (!company.trim()) {
      setError('Please specify your Organization/Company name.')
      return
    }
    if (!agreedToTerms) {
      setError('Please accept the terms to continue.')
      return
    }

    setLoading(true)

    const payload = {
      fullName,
      email,
      password,
      role: 'MANAGER',
      departmentName: department,
      roleTitle: jobTitle || 'Team Lead / Manager',
      company: company.trim(),
      bio: `Manager of the ${department} department at ${company.trim()}.`,
      education: '',
      experience: 'Team management and leadership'
    }

    try {
      const data = await api.register(payload)
      setSuccess(true)
      setTimeout(() => {
        onLogin('manager', data, false) // manager goes directly to dashboard, bypassing skill setup
      }, 800)
    } catch (err) {
      setError(err.message || 'Failed to register organization manager.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 fade-in">
          <div className="w-16 h-16 rounded-2xl bg-lime-400 flex items-center justify-center shadow-[0_0_32px_rgba(166,226,46,0.5)]">
            <Icon name="check" className="w-8 h-8 text-[#0B0F1A]" />
          </div>
          <div className="text-white font-display font-bold text-xl">Organization registered!</div>
          <div className="text-slate-400 text-sm">Logging you into manager workspace…</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-400 flex items-center justify-center animate-pulse">
            <Icon name="brain-circuit" className="w-6 h-6 text-[#0B0F1A]" />
          </div>
          <div className="text-slate-400 text-sm">Registering your workspace…</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex bg-[#0B0F1A] relative overflow-hidden">
      {/* Background blobs */}
      <div className="grad-blob w-[420px] h-[420px] bg-lime-400/25 -top-20 -right-20" />
      <div className="grad-blob w-[380px] h-[380px] bg-indigo-500/25 bottom-0 -left-10" style={{ animationDelay: '-4s' }} />
      <div className="grad-blob w-[300px] h-[300px] bg-violet-500/20 top-1/3 left-1/3" style={{ animationDelay: '-8s' }} />

      {/* Left: Brand info panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center">
            <Icon name="brain-circuit" className="w-5 h-5 text-[#0B0F1A]" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg leading-none">KnowledgeIQ</div>
            <div className="text-slate-400 text-xs mt-0.5">Manager Console</div>
          </div>
        </div>

        <div className="max-w-md fade-in">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-lime-300 bg-lime-400/10 border border-lime-400/20 rounded-full px-3 py-1 mb-6">
            <Icon name="users" className="w-3.5 h-3.5" /> Workspace Intelligence for Leaders
          </span>
          <h1 className="font-display text-4xl xl:text-[2.75rem] font-bold text-white leading-[1.1] mb-5">
            Register your team and map their capabilities.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            As a manager, you can instantly see skill gaps across your department, set expectations, and prescribe learning pathways that resolve risk in real time.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: 'shield', text: 'Map your department to role-specific benchmarks' },
              { icon: 'activity', text: 'Monitor real-time training progress and skill growth' },
              { icon: 'zap', text: 'No personal self-assessment required to get started' },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-lime-400/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name={icon} className="w-3.5 h-3.5 text-lime-300" />
                </div>
                <span className="text-slate-300 text-sm leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-slate-500 text-xs">© 2026 Northwind Labs. All rights reserved.</div>
      </div>

      {/* Right: Sign-up form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 overflow-y-auto py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md glass rounded-3xl p-8 sm:p-10 fade-in my-auto"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-lime-400 flex items-center justify-center">
              <Icon name="brain-circuit" className="w-[18px] h-[18px] text-[#0B0F1A]" />
            </div>
            <div className="font-display font-bold text-white">KnowledgeIQ</div>
          </div>

          <h2 className="font-display text-2xl font-bold text-white mb-1">Sign up as Manager</h2>
          <p className="text-slate-400 text-sm mb-6">Register your team workspace & manage intelligence</p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <Icon name="alert-circle" className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="mgr-fullname" className="text-xs font-medium text-slate-300 mb-1.5 block">
                Your full name
              </label>
              <div className="relative">
                <Icon name="user" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="mgr-fullname"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Arthur Pendragon"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="mgr-email" className="text-xs font-medium text-slate-300 mb-1.5 block">
                Work email
              </label>
              <div className="relative">
                <Icon name="mail" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="mgr-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="leader@organization.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="mgr-password" className="text-xs font-medium text-slate-300 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Icon name="lock" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="mgr-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-4 h-4" />
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-1.5">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: i <= strength ? STRENGTH_COLORS[strength] : 'rgba(255,255,255,0.1)'
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-[10px]" style={{ color: STRENGTH_COLORS[strength] }}>
                    {STRENGTH_LABELS[strength]}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="mgr-confirm" className="text-xs font-medium text-slate-300 mb-1.5 block">
                Confirm password
              </label>
              <div className="relative">
                <Icon
                  name={passwordMismatch ? 'x-circle' : passwordsMatch ? 'check-circle' : 'lock'}
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    passwordMismatch ? 'text-rose-400' : passwordsMatch ? 'text-lime-400' : 'text-slate-500'
                  }`}
                />
                <input
                  id="mgr-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className={`w-full bg-white/5 border rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
                    passwordMismatch
                      ? 'border-rose-500/50 focus:ring-rose-500/30'
                      : passwordsMatch
                      ? 'border-lime-400/50 focus:ring-lime-400/30'
                      : 'border-white/10 focus:ring-lime-400/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Icon name={showConfirm ? 'eye-off' : 'eye'} className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Organization Name */}
            <div>
              <label htmlFor="mgr-company" className="text-xs font-medium text-slate-300 mb-1.5 block">
                Organization / Company Name
              </label>
              <div className="relative">
                <Icon name="briefcase" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="mgr-company"
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                />
              </div>
            </div>

            {/* Department Selection */}
            <div>
              <label htmlFor="mgr-dept" className="text-xs font-medium text-slate-300 mb-1.5 block">
                Department Managed
              </label>
              <div className="relative">
                <Icon name="building-2" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="mgr-dept"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50 appearance-none"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" className="bg-[#0F1420]">Select department</option>
                  {DEPT_OPTIONS.map(d => (
                    <option key={d} value={d} className="bg-[#0F1420]">{d}</option>
                  ))}
                </select>
                <Icon name="chevron-down" className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Job Title */}
            <div>
              <label htmlFor="mgr-title" className="text-xs font-medium text-slate-300 mb-1.5 block">
                Job Title
              </label>
              <input
                id="mgr-title"
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. Engineering Manager"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
              />
            </div>

            {/* Terms Checkbox */}
            <label htmlFor="mgr-terms" className="flex items-start gap-3 cursor-pointer group pt-1">
              <input
                id="mgr-terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={e => setAgreedToTerms(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                agreedToTerms
                  ? 'bg-lime-400 border-lime-400'
                  : 'bg-white/5 border-white/20 group-hover:border-lime-400/50'
              }`} style={{ width: '18px', height: '18px' }}>
                {agreedToTerms && <Icon name="check" className="w-3 h-3 text-[#0B0F1A]" />}
              </div>
              <span className="text-[11px] text-slate-400 leading-normal select-none">
                I agree to register this organization and accept the{' '}
                <span className="text-lime-300 hover:text-lime-200">Terms of Service</span>.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || passwordMismatch || !agreedToTerms}
              className="w-full bg-lime-400 hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0F1A] font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_-6px_rgba(166,226,46,0.5)] mt-2"
            >
              Register Organization <Icon name="arrow-right" className="w-4 h-4" />
            </button>

            {/* Log in Redirect */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[11px] text-slate-500">already have a workspace?</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium rounded-xl py-2.5 text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Icon name="log-in" className="w-3.5 h-3.5" /> Sign In
              </button>
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium rounded-xl py-2.5 text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Icon name="user-plus" className="w-3.5 h-3.5 text-lime-300" /> Join as Employee
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
