import React, { useState } from 'react'
import Icon from '../components/Icon.jsx'
import api from '../services/api.js'

// Password strength calculator
function calcStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score // 0-5
}

const STRENGTH_LABELS = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']

const ROLE_OPTIONS = [
  { key: 'employee', label: 'Employee', icon: 'user', desc: 'Track skills & learning paths' },
  { key: 'manager', label: 'Team Lead / Manager', icon: 'users', desc: 'Team gap heatmap & coverage' },
  { key: 'hr', label: 'HR Specialist', icon: 'bar-chart-2', desc: 'Manage workforce intelligence' },
  { key: 'depthead', label: 'Department Head', icon: 'building', desc: 'Department strategy & budgets' },
  { key: 'ldadmin', label: 'L&D Admin / Mentor', icon: 'graduation-cap', desc: 'Catalogs & learning paths' },
  { key: 'admin', label: 'System Administrator', icon: 'shield', desc: 'User access & security' },
]

const DEPT_OPTIONS = [
  'Engineering', 'Product', 'HR & Operations', 'Sales & Marketing',
  'Data & Analytics', 'Finance', 'Legal', 'Design', 'Customer Success', 'Other'
]

const ROLE_SUGGESTIONS = {
  'Engineering': ['Java Developer', 'Python Developer', 'React Developer', 'Full Stack Engineer', 'DevOps & Cloud Engineer', 'QA Automation Engineer', 'Software Engineer'],
  'Product': ['Product Manager', 'Associate Product Manager', 'Product Owner', 'Scrum Master', 'Technical Program Manager'],
  'HR & Operations': ['HR Specialist', 'Talent Acquisition Specialist', 'People Operations Lead', 'HR Business Partner'],
  'Sales & Marketing': ['Marketing Strategist', 'Growth Specialist', 'Account Executive', 'Sales Development Rep', 'Content Strategist'],
  'Data & Analytics': ['Data Analyst', 'Data Engineer', 'Business Intelligence Developer', 'Machine Learning Engineer', 'Data Scientist'],
  'Finance': ['Financial Analyst', 'Accountant', 'Finance Operations Manager', 'Billing & Payroll Specialist'],
  'Legal': ['Legal Counsel', 'Compliance Officer', 'Contracts Specialist', 'Privacy Analyst'],
  'Design': ['UI/UX Designer', 'Product Designer', 'Design Systems Lead', 'Visual & Brand Designer'],
  'Customer Success': ['Customer Success Manager', 'Support Engineer', 'Client Onboarding Specialist'],
  'Other': ['Specialist', 'Consultant', 'Operations Analyst']
}

export default function SignUp({ onSwitchToLogin, onSwitchToSignUpManager, onLogin, initialRole = 'employee' }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState(initialRole)
  const [company, setCompany] = useState('')
  const [department, setDepartment] = useState(initialRole === 'hr' ? 'HR & Operations' : 'Engineering')
  const [jobTitle, setJobTitle] = useState(initialRole === 'hr' ? 'HR Specialist' : 'Java Developer')
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
    if (!agreedToTerms) {
      setError('Please accept the terms to continue.')
      return
    }

    setLoading(true)
    const systemRoleMap = {
      employee: 'EMPLOYEE',
      manager: 'MANAGER',
      hr: 'HR_SPECIALIST',
      depthead: 'DEPARTMENT_HEAD',
      ldadmin: 'L_AND_D_ADMIN',
      admin: 'SYSTEM_ADMIN'
    }
    const mappedSystemRole = systemRoleMap[role] || 'EMPLOYEE'

    const payload = {
      fullName,
      email,
      password,
      role: mappedSystemRole,
      company: company.trim(),
      departmentName: department,
      roleTitle: jobTitle
    }

    try {
      const authData = await api.register(payload)
      setSuccess(true)
      setTimeout(() => {
        onLogin(role, authData, true)
      }, 800)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  // ── Success state ────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 fade-in">
          <div className="w-16 h-16 rounded-2xl bg-lime-400 flex items-center justify-center shadow-[0_0_32px_rgba(166,226,46,0.5)]">
            <Icon name="check" className="w-8 h-8 text-[#0B0F1A]" />
          </div>
          <div className="text-white font-display font-bold text-xl">Account created!</div>
          <div className="text-slate-400 text-sm">Signing you in…</div>
        </div>
      </div>
    )
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-400 flex items-center justify-center animate-pulse">
            <Icon name="brain-circuit" className="w-6 h-6 text-[#0B0F1A]" />
          </div>
          <div className="text-slate-400 text-sm">Creating your account…</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex bg-[#0B0F1A] relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="grad-blob w-[420px] h-[420px] bg-lime-400/25 -top-20 -right-20" />
      <div className="grad-blob w-[380px] h-[380px] bg-indigo-500/25 bottom-0 -left-10" style={{ animationDelay: '-4s' }} />
      <div className="grad-blob w-[300px] h-[300px] bg-violet-500/20 top-1/3 left-1/3" style={{ animationDelay: '-8s' }} />

      {/* ── Left: Brand panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center">
            <Icon name="brain-circuit" className="w-5 h-5 text-[#0B0F1A]" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg leading-none">KnowledgeIQ</div>
            <div className="text-slate-400 text-xs mt-0.5">Enterprise Platform</div>
          </div>
        </div>

        {/* Hero copy */}
        <div className="max-w-md fade-in">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-lime-300 bg-lime-400/10 border border-lime-400/20 rounded-full px-3 py-1 mb-6">
            <Icon name="sparkles" className="w-3.5 h-3.5" /> Join 1,284 mapped employees
          </span>
          <h1 className="font-display text-4xl xl:text-[2.75rem] font-bold text-white leading-[1.1] mb-5">
            Start closing your knowledge gaps today.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Get instant access to AI-powered skill mapping, personalized learning paths, and real-time workforce intelligence — all in one platform.
          </p>

          {/* Feature bullets */}
          <div className="mt-10 space-y-4">
            {[
              { icon: 'zap', text: 'AI-generated skill recommendations tailored to your role' },
              { icon: 'bar-chart-2', text: 'Real-time gap analysis against your team benchmarks' },
              { icon: 'graduation-cap', text: 'Curated courses that actually move your proficiency needle' },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-lime-400/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name={icon} className="w-3.5 h-3.5 text-lime-300" />
                </div>
                <span className="text-slate-300 text-sm leading-relaxed">{text}</span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-4">
              <div className="text-lime-300 font-display text-2xl font-bold">1,284</div>
              <div className="text-slate-400 text-xs mt-1">Employees mapped</div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="text-lime-300 font-display text-2xl font-bold">96%</div>
              <div className="text-slate-400 text-xs mt-1">Skill coverage</div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="text-lime-300 font-display text-2xl font-bold">3.4x</div>
              <div className="text-slate-400 text-xs mt-1">Learning ROI</div>
            </div>
          </div>
        </div>

        <div className="text-slate-500 text-xs">© 2026 Northwind Labs. All rights reserved.</div>
      </div>

      {/* ── Right: Sign-up form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 overflow-y-auto py-10">
        <form
          id="signup-form"
          onSubmit={handleSubmit}
          className="w-full max-w-md glass rounded-3xl p-8 sm:p-10 fade-in my-auto"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-lime-400 flex items-center justify-center">
              <Icon name="brain-circuit" className="w-[18px] h-[18px] text-[#0B0F1A]" />
            </div>
            <div className="font-display font-bold text-white">KnowledgeIQ</div>
          </div>

          <h2 className="font-display text-2xl font-bold text-white mb-1">Create your account</h2>
          <p className="text-slate-400 text-sm mb-6">Join the workforce intelligence platform</p>

          {/* Error banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <Icon name="alert-circle" className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="signup-fullname" className="text-xs font-medium text-slate-300 mb-1.5 block">
                Full name
              </label>
              <div className="relative">
                <Icon name="user" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-fullname"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  autoComplete="name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="text-xs font-medium text-slate-300 mb-1.5 block">
                Work email
              </label>
              <div className="relative">
                <Icon name="mail" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@company.io"
                  required
                  autoComplete="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all"
                />
              </div>
            </div>

            {/* Organization / Company Name */}
            {role !== 'admin' && (
              <div>
                <label htmlFor="signup-company" className="text-xs font-medium text-slate-300 mb-1.5 block">
                  Organization / Company name
                </label>
                <div className="relative">
                  <Icon name="building" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-company"
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="Northwind Labs"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Department */}
            {role !== 'admin' && (
              <div>
                <label htmlFor="signup-dept" className="text-xs font-medium text-slate-300 mb-1.5 block">
                  Department
                </label>
                <div className="relative">
                  <Icon name="briefcase" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    id="signup-dept"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    required
                    className="w-full bg-[#111625] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all appearance-none"
                  >
                    <option value="" disabled>Select Department</option>
                    {DEPT_OPTIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <Icon name="chevron-down" className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Job Title */}
            {role !== 'admin' && (
              <div>
                <label htmlFor="signup-jobtitle" className="text-xs font-medium text-slate-300 mb-1.5 block">
                  Job title / Role title
                </label>
                <div className="relative">
                  <Icon name="user-check" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-jobtitle"
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    placeholder="e.g. Java Developer"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all"
                  />
                </div>
                {/* Domain / Role Suggestions */}
                {ROLE_SUGGESTIONS[department] && (
                  <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-slate-500 font-medium mr-1">Suggestions:</span>
                    {ROLE_SUGGESTIONS[department].map(sug => (
                      <button
                        type="button"
                        key={sug}
                        onClick={() => setJobTitle(sug)}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                          jobTitle === sug
                            ? 'bg-lime-400/20 text-lime-300 border-lime-400/40 font-semibold'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="text-xs font-medium text-slate-300 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Icon name="lock" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="new-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all"
                />
                <button
                  type="button"
                  id="signup-toggle-password"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-4 h-4" />
                </button>
              </div>

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="mt-2">
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
                  <div className="text-xs" style={{ color: STRENGTH_COLORS[strength] }}>
                    {STRENGTH_LABELS[strength]}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm" className="text-xs font-medium text-slate-300 mb-1.5 block">
                Confirm password
              </label>
              <div className="relative">
                <Icon
                  name={passwordMismatch ? 'x-circle' : passwordsMatch ? 'check-circle' : 'lock'}
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    passwordMismatch ? 'text-rose-400' : passwordsMatch ? 'text-lime-400' : 'text-slate-500'
                  }`}
                />
                <input
                  id="signup-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  autoComplete="new-password"
                  className={`w-full bg-white/5 border rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    passwordMismatch
                      ? 'border-rose-500/50 focus:ring-rose-500/30'
                      : passwordsMatch
                      ? 'border-lime-400/50 focus:ring-lime-400/30'
                      : 'border-white/10 focus:ring-lime-400/50 focus:border-lime-400/50'
                  }`}
                />
                <button
                  type="button"
                  id="signup-toggle-confirm"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Icon name={showConfirm ? 'eye-off' : 'eye'} className="w-4 h-4" />
                </button>
              </div>
              {passwordMismatch && (
                <p className="text-rose-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Role selection */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-2 block">I am joining as</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map(opt => (
                  <button
                    type="button"
                    key={opt.key}
                    id={`signup-role-${opt.key}`}
                    onClick={() => {
                      if (opt.key === 'manager' && onSwitchToSignUpManager) {
                        onSwitchToSignUpManager()
                      } else {
                        setRole(opt.key)
                        if (opt.key === 'hr') {
                          setDepartment('HR & Operations')
                          setJobTitle('HR Specialist')
                        } else if (opt.key === 'depthead') {
                          setDepartment('Engineering')
                          setJobTitle('Department Head')
                        } else if (opt.key === 'ldadmin') {
                          setDepartment('HR & Operations')
                          setJobTitle('L&D Specialist')
                        } else if (opt.key === 'admin') {
                          setDepartment('Engineering')
                          setJobTitle('Platform Administrator')
                        } else {
                          setDepartment('Engineering')
                          setJobTitle('Software Engineer')
                        }
                      }
                    }}
                    className={`relative text-left rounded-xl border p-3 transition-all ${
                      role === opt.key
                        ? 'bg-lime-400/10 border-lime-400/50 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {role === opt.key && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-lime-400 rounded-full flex items-center justify-center">
                        <Icon name="check" className="w-2.5 h-2.5 text-[#0B0F1A]" />
                      </div>
                    )}
                    <Icon name={opt.icon} className={`w-4 h-4 mb-1.5 ${role === opt.key ? 'text-lime-300' : 'text-slate-500'}`} />
                    <div className="font-medium text-xs">{opt.label}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5 leading-tight">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <label
              htmlFor="signup-terms"
              className="flex items-start gap-3 cursor-pointer group"
            >
              <div className="relative mt-0.5">
                <input
                  id="signup-terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                    agreedToTerms
                      ? 'bg-lime-400 border-lime-400'
                      : 'bg-white/5 border-white/20 group-hover:border-lime-400/50'
                  }`}
                  style={{ width: '18px', height: '18px' }}
                >
                  {agreedToTerms && <Icon name="check" className="w-3 h-3 text-[#0B0F1A]" />}
                </div>
              </div>
              <span className="text-xs text-slate-400 leading-relaxed select-none">
                I agree to the{' '}
                <span className="text-lime-300 hover:text-lime-200 cursor-pointer">Terms of Service</span>{' '}
                and{' '}
                <span className="text-lime-300 hover:text-lime-200 cursor-pointer">Privacy Policy</span>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              id="signup-submit"
              disabled={loading || passwordMismatch || !agreedToTerms}
              className="w-full bg-lime-400 hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0F1A] font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_-6px_rgba(166,226,46,0.5)] mt-2"
            >
              Create account <Icon name="arrow-right" className="w-4 h-4" />
            </button>

            {/* Manager registration link */}
            <div className="text-center text-xs text-slate-400 mt-2">
              Are you a manager?{' '}
              <button
                type="button"
                onClick={onSwitchToSignUpManager}
                className="text-lime-300 hover:text-lime-200 font-semibold focus:outline-none"
              >
                Register your organization here
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-xs text-slate-500">already have an account?</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {/* Sign in link */}
            <button
              type="button"
              id="signup-go-login"
              onClick={onSwitchToLogin}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 font-medium rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2"
            >
              <Icon name="log-in" className="w-4 h-4" /> Sign in instead
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
