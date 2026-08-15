import React, { useState, useEffect } from 'react'
import Icon from '../components/Icon.jsx'
import GoogleSignInModal from '../components/GoogleSignInModal.jsx'
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

export const ALL_ROLES = [
  {
    key: 'employee',
    label: 'Employee',
    systemRole: 'EMPLOYEE',
    icon: 'user',
    badge: 'Individual Contributor',
    color: 'emerald',
    tagline: 'Skills, AI domain assessments, peer reviews & learning paths',
    scopeText: 'Belongs to a specific Department and Team/Domain with tailored skill benchmarks.',
    capabilities: [
      'Create & update professional skill profile',
      'Select Department, Team / Domain & Job Title specialization',
      'AI domain assessments & adaptive skill quizzes',
      'Personalized learning pathways & course tracking',
      'Earn verifiable achievements & manage certifications',
      'Connect with technical mentors & peers'
    ]
  },
  {
    key: 'manager',
    label: 'Team Lead / Manager',
    systemRole: 'MANAGER',
    icon: 'users',
    badge: 'Department People Lead',
    color: 'indigo',
    tagline: 'Oversees all teams and employees across the entire department',
    scopeText: 'You manage the entire department and all teams/domains within it.',
    capabilities: [
      'Manages the entire department and all teams (Java, Python, Frontend, DevOps, etc.)',
      'Analyze department skill coverage heatmap (Exclusive)',
      'Identify team capability gaps & critical shortage risks',
      'Monitor employee benchmark progress & training adoption',
      'Assign targeted AI learning interventions & recommendations',
      'Review direct reports across all department domains'
    ]
  },
  {
    key: 'depthead',
    label: 'Department Head',
    systemRole: 'DEPARTMENT_HEAD',
    icon: 'building',
    badge: 'Executive Strategy',
    color: 'cyan',
    tagline: 'Department competency frameworks, benchmarks & budgets',
    scopeText: 'You oversee the entire department, role benchmarks, and learning budget allocations.',
    capabilities: [
      'Department-wide competency matrix & capability health',
      'Define & approve standardized role benchmark levels',
      'Allocate learning budgets & prioritize team funding',
      'Monitor department performance & risk distribution',
      'Oversee multiple domain teams & team managers'
    ]
  },
  {
    key: 'hr',
    label: 'HR Specialist',
    systemRole: 'HR_SPECIALIST',
    icon: 'bar-chart-2',
    badge: 'Workforce Intelligence',
    color: 'amber',
    tagline: 'Org-wide gap intelligence, workforce directory & forecasting',
    scopeText: 'HR operates across the entire organization.',
    capabilities: [
      'Organization-wide capability gap intelligence & heatmaps',
      'Manage complete workforce skill inventory & directory',
      'Measure training effectiveness & learning ROI metrics',
      'Run strategic skill forecasting & predictive hiring models',
      'Manage company departments & user role assignments',
      'Generate executive reports & compliance audit exports'
    ]
  },
  {
    key: 'ldadmin',
    label: 'L&D Admin / Mentor',
    systemRole: 'L_AND_D_ADMIN',
    icon: 'graduation-cap',
    badge: 'Learning & Mentorship',
    color: 'purple',
    tagline: 'Personalized learning paths, catalogs & mentor programs',
    scopeText: 'L&D manages learning and development across the organization.',
    capabilities: [
      'Manage internal training catalog & external learning links',
      'Build adaptive, personalized learning path curriculums',
      'Configure AI recommendation scoring algorithms',
      'Monitor training participation & completion rates',
      'Verify employee certifications & renewal processes',
      'Support mentorship programs & expert knowledge sharing'
    ]
  },
  {
    key: 'admin',
    label: 'System Administrator',
    systemRole: 'SYSTEM_ADMIN',
    icon: 'shield',
    badge: 'Platform Security & Access',
    color: 'rose',
    tagline: 'User provisioning, access control, system monitoring & security',
    scopeText: 'System Administration operates at organization/platform level.',
    capabilities: [
      'Manage user accounts, invitations & account activation',
      'Role-based access control (RBAC) & permissions management',
      'Authentication, JWT token security & OAuth integrations',
      'Live system monitoring, uptime tracking & audit logs',
      'Database health, system configuration & global taxonomies'
    ]
  }
]

export const DEPARTMENT_TEAMS_MAP = {
  'Engineering': ['Java', 'Python', 'Frontend', 'DevOps', 'QA'],
  'Finance': ['Accounting', 'Financial Analysis', 'Payroll & Tax', 'Budgeting'],
  'Marketing': ['Digital Marketing', 'Content & Copywriting', 'SEO & Growth', 'Brand Strategy'],
  'Product': ['Product Management', 'UI/UX Design', 'Scrum & Agile'],
  'Data & Analytics': ['Data Engineering', 'Business Intelligence', 'Machine Learning'],
  'Sales': ['Enterprise Sales', 'Business Development', 'Account Management'],
  'Sales & Marketing': ['Digital Marketing', 'Content & Copywriting', 'SEO & Growth', 'Brand Strategy'],
  'HR & Operations': ['People Operations', 'Talent Acquisition', 'Operations'],
  'Customer Success': ['Customer Support', 'Client Onboarding'],
  'Legal': ['Corporate Legal', 'Regulatory Compliance'],
  'Other': ['General Team']
}

export const TEAM_JOB_SUGGESTIONS = {
  'Engineering': {
    'Java': ['Java Developer', 'Spring Boot Developer', 'Backend Developer', 'Full Stack Java Developer'],
    'Python': ['Python Developer', 'Django Developer', 'FastAPI Developer', 'Backend Python Engineer'],
    'Frontend': ['Frontend Developer', 'React Developer', 'UI Engineer', 'Frontend Engineer'],
    'DevOps': ['DevOps Engineer', 'Cloud Solutions Engineer', 'Infrastructure Specialist', 'Site Reliability Engineer'],
    'QA': ['QA Automation Engineer', 'SDET', 'Software Test Engineer']
  },
  'Finance': {
    'Accounting': ['Senior Accountant', 'General Ledger Accountant', 'Audit Specialist'],
    'Financial Analysis': ['Financial Analyst', 'Senior Budget Analyst', 'Valuation Associate'],
    'Payroll & Tax': ['Payroll Specialist', 'Tax Analyst'],
    'Budgeting': ['Budget Coordinator', 'Finance Manager']
  },
  'Marketing': {
    'Digital Marketing': ['Digital Marketing Specialist', 'PPC & Ads Manager', 'Performance Marketer'],
    'Content & Copywriting': ['Content Lead', 'Copywriter', 'Brand Messaging Specialist'],
    'SEO & Growth': ['Growth Specialist', 'SEO Manager', 'Inbound Strategist'],
    'Brand Strategy': ['Brand Manager', 'Marketing Strategist']
  },
  'Product': {
    'Product Management': ['Product Manager', 'Associate Product Manager', 'Product Owner'],
    'UI/UX Design': ['UI/UX Designer', 'Product Designer', 'Design Systems Lead'],
    'Scrum & Agile': ['Scrum Master', 'Agile Coach']
  },
  'Data & Analytics': {
    'Data Engineering': ['Data Engineer', 'ETL Specialist', 'Big Data Developer'],
    'Business Intelligence': ['BI Analyst', 'Tableau / PowerBI Specialist'],
    'Machine Learning': ['ML Engineer', 'AI Research Specialist', 'Data Scientist']
  },
  'Sales': {
    'Enterprise Sales': ['Account Executive', 'Enterprise Sales Director'],
    'Business Development': ['BDR Lead', 'Sales Development Rep'],
    'Account Management': ['Key Account Manager', 'Client Partner']
  },
  'Customer Success': {
    'Customer Support': ['Customer Support Engineer', 'Technical Support Lead'],
    'Client Onboarding': ['Client Onboarding Specialist', 'Implementation Consultant']
  }
}

export const DEPT_OPTIONS = Object.keys(DEPARTMENT_TEAMS_MAP)

export default function SignUp({ onSwitchToLogin, onSwitchToSignUpManager, onLogin, initialRole = 'employee' }) {
  const [selectedRoleKey, setSelectedRoleKey] = useState(initialRole || 'employee')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [company, setCompany] = useState('Northwind Labs')
  const [existingOrgs, setExistingOrgs] = useState([])
  
  // Scoped fields
  const [department, setDepartment] = useState('Engineering')
  const [team, setTeam] = useState('Java')
  const [jobTitle, setJobTitle] = useState('Java Developer')
  const [bio, setBio] = useState('')
  
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const activeRoleObj = ALL_ROLES.find(r => r.key === selectedRoleKey) || ALL_ROLES[0]

  useEffect(() => {
    // Load available organizations for smart autocomplete
    api.getOrganizations()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          setExistingOrgs(res)
        }
      })
      .catch(() => {})
  }, [])

  // Handle role change with clean state sanitization
  function handleRoleSelect(roleKey) {
    setSelectedRoleKey(roleKey)
    setError(null)

    if (roleKey === 'employee') {
      // Employee needs Department, Team, and Job Title
      const defaultDept = 'Engineering'
      const defaultTeam = 'Java'
      const defaultTitle = 'Java Developer'
      setDepartment(defaultDept)
      setTeam(defaultTeam)
      setJobTitle(defaultTitle)
    } else if (roleKey === 'manager' || roleKey === 'depthead') {
      // Manager & Dept Head only need Department
      setDepartment(prev => (prev && DEPT_OPTIONS.includes(prev) ? prev : 'Engineering'))
      setTeam('')
      setJobTitle('')
    } else {
      // HR, L&D Admin, System Admin operate organization-wide (no department, no team, no job title)
      setDepartment('')
      setTeam('')
      setJobTitle('')
    }
  }

  // Handle department change for Employee or Manager/DeptHead
  function handleDepartmentChange(newDept) {
    setDepartment(newDept)
    if (selectedRoleKey === 'employee') {
      const teams = DEPARTMENT_TEAMS_MAP[newDept] || ['General Team']
      const firstTeam = teams[0] || ''
      setTeam(firstTeam)
      const suggestions = TEAM_JOB_SUGGESTIONS[newDept]?.[firstTeam] || []
      setJobTitle(suggestions[0] || `${newDept} Specialist`)
    }
  }

  // Handle team change for Employee
  function handleTeamChange(newTeam) {
    setTeam(newTeam)
    if (selectedRoleKey === 'employee') {
      const suggestions = TEAM_JOB_SUGGESTIONS[department]?.[newTeam] || []
      if (suggestions.length > 0) {
        setJobTitle(suggestions[0])
      }
    }
  }

  const strength = calcStrength(password)
  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const passwordMismatch = confirmPassword && password !== confirmPassword

  // Available teams for current department
  const availableTeams = DEPARTMENT_TEAMS_MAP[department] || ['General Team']
  
  // Available AI job suggestions for current Employee department + team
  const availableJobSuggestions = (selectedRoleKey === 'employee' && department && team)
    ? (TEAM_JOB_SUGGESTIONS[department]?.[team] || [])
    : []

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
    if (!company.trim()) {
      setError('Please provide your Organization / Company name.')
      return
    }

    // Role-specific frontend validation
    if (selectedRoleKey === 'employee') {
      if (!department) {
        setError('Please select a Department for your Employee role.')
        return
      }
      if (!team) {
        setError('Please select a Team / Domain for your Employee role.')
        return
      }
      if (!jobTitle.trim()) {
        setError('Please specify your Job / Domain Title.')
        return
      }
    } else if (selectedRoleKey === 'manager' || selectedRoleKey === 'depthead') {
      if (!department) {
        setError(`Please select a Department for your ${activeRoleObj.label} role.`)
        return
      }
    }

    if (!agreedToTerms) {
      setError('Please accept the terms of service to continue.')
      return
    }

    setLoading(true)

    // Build role-accurate payload
    const isEmployee = selectedRoleKey === 'employee'
    const isDeptScoped = selectedRoleKey === 'employee' || selectedRoleKey === 'manager' || selectedRoleKey === 'depthead'

    const payload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: activeRoleObj.systemRole,
      company: company.trim(),
      departmentName: isDeptScoped ? department : null,
      teamName: isEmployee ? team : null,
      roleTitle: isEmployee ? jobTitle.trim() : null,
      bio: bio.trim() || `${activeRoleObj.label} at ${company.trim()}.`
    }

    try {
      const authData = await api.register(payload)
      setSuccess(true)
      setTimeout(() => {
        onLogin(activeRoleObj.key, authData, isEmployee)
      }, 800)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  // ── Success state ────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 fade-in text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-lime-400 flex items-center justify-center shadow-[0_0_32px_rgba(166,226,46,0.5)]">
            <Icon name="check" className="w-8 h-8 text-[#0B0F1A]" />
          </div>
          <div className="text-white font-display font-bold text-2xl">Account Created!</div>
          <div className="text-slate-300 text-sm">
            Welcome to <span className="text-lime-300 font-semibold">{company}</span> as <span className="text-white font-semibold">{activeRoleObj.label}</span>.
          </div>
          <div className="text-slate-400 text-xs mt-2 animate-pulse">
            Configuring workspace & linking organization...
          </div>
        </div>
      </div>
    )
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-lime-400 flex items-center justify-center animate-pulse shadow-[0_0_24px_rgba(166,226,46,0.4)]">
            <Icon name="brain-circuit" className="w-7 h-7 text-[#0B0F1A]" />
          </div>
          <div className="text-white font-bold text-lg">Provisioning {activeRoleObj.label} Workspace</div>
          <div className="text-slate-400 text-xs">Binding organization benchmarks & intelligence...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex bg-[#0B0F1A] relative overflow-hidden">
      {/* Animated background decorative blobs */}
      <div className="grad-blob w-[450px] h-[450px] bg-lime-400/20 -top-20 -right-20" />
      <div className="grad-blob w-[400px] h-[400px] bg-indigo-500/20 bottom-0 -left-10" style={{ animationDelay: '-4s' }} />
      <div className="grad-blob w-[320px] h-[320px] bg-purple-500/15 top-1/3 left-1/4" style={{ animationDelay: '-8s' }} />

      {/* ── Left: Brand & Live Role Capability Panel (Desktop) ── */}
      <div className="hidden xl:flex flex-col justify-between w-[440px] 2xl:w-[480px] p-10 2xl:p-12 relative z-10 border-r border-white/5 bg-[#0B0F1A]/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center shadow-[0_0_20px_rgba(166,226,46,0.4)]">
            <Icon name="brain-circuit" className="w-5 h-5 text-[#0B0F1A]" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg leading-none">KnowledgeIQ</div>
            <div className="text-slate-400 text-xs mt-0.5">Enterprise Workforce Intelligence</div>
          </div>
        </div>

        <div className="my-auto space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-300">
            <Icon name="sparkles" className="w-3.5 h-3.5" />
            Selected Role Overview
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lime-300">
                <Icon name={activeRoleObj.icon} className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-white leading-tight">
                  {activeRoleObj.label}
                </h2>
                <div className="text-[11px] text-lime-400/90 font-medium">{activeRoleObj.badge}</div>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mt-2">
              {activeRoleObj.tagline}
            </p>
          </div>

          {/* Included Capabilities Checklist */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Role Responsibilities & Scope</span>
              <span className="text-lime-400 text-[10px] lowercase">enterprise RBAC</span>
            </div>
            <div className="space-y-2 mt-2">
              {activeRoleObj.capabilities.map((cap, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-lime-400/15 text-lime-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="check" className="w-2.5 h-2.5 text-lime-400" />
                  </div>
                  <span className="leading-snug">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2.5">
            <Icon name="link-2" className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>All user roles in the same organization collaborate in real time with shared taxonomy & benchmark standards.</span>
          </div>
        </div>

        <div className="text-slate-500 text-xs">© 2026 KnowledgeIQ Platform. All rights reserved.</div>
      </div>

      {/* ── Right: Multi-Role Sign-Up Form ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative z-10 overflow-y-auto max-h-screen">
        <form
          id="signup-form"
          onSubmit={handleSubmit}
          className="w-full max-w-2xl glass rounded-3xl p-6 sm:p-9 fade-in my-auto border border-white/10 shadow-2xl"
        >
          {/* Top Return to Sign In Button */}
          <div className="mb-4">
            <button
              type="button"
              id="signup-top-back"
              onClick={onSwitchToLogin}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all shadow-sm group cursor-pointer"
            >
              <Icon name="arrow-left" className="w-3.5 h-3.5 text-lime-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Sign In</span>
            </button>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Create your account</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Select your organization role and set up your workspace</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <Icon name="shield-check" className="w-3.5 h-3.5 text-lime-400" />
              <span>Enterprise RBAC</span>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <Icon name="alert-circle" className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── 1. Interactive Role Selector ── */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center justify-between">
              <span>Choose your Platform Role:</span>
              <span className="text-[11px] text-lime-400 font-normal">Active: {activeRoleObj.label}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ALL_ROLES.map(r => {
                const isSelected = selectedRoleKey === r.key
                return (
                  <button
                    type="button"
                    key={r.key}
                    id={`signup-role-${r.key}`}
                    onClick={() => handleRoleSelect(r.key)}
                    className={`relative text-left rounded-2xl border p-3 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-lime-400/15 border-lime-400 text-white shadow-[0_0_16px_rgba(166,226,46,0.2)]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-lime-400 rounded-full flex items-center justify-center">
                        <Icon name="check" className="w-2.5 h-2.5 text-[#0B0F1A]" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon name={r.icon} className={`w-4 h-4 ${isSelected ? 'text-lime-300' : 'text-slate-500'}`} />
                      <span className="font-bold text-xs text-white truncate">{r.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight line-clamp-2">{r.tagline}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── 2. Role-Aware Organizational Scope Help Banner ── */}
          <div className="mb-5">
            {selectedRoleKey === 'manager' && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-3.5 text-xs text-indigo-300 flex items-start gap-3">
                <Icon name="shield-check" className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">Department Manager Scope</div>
                  <p className="mt-0.5 text-indigo-200/90 leading-relaxed">
                    You manage the entire department and all teams/domains within it. Direct reports will automatically appear on your management console. (One Manager per Department).
                  </p>
                </div>
              </div>
            )}
            {selectedRoleKey === 'depthead' && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-3.5 text-xs text-cyan-300 flex items-start gap-3">
                <Icon name="building" className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">Department Head Scope</div>
                  <p className="mt-0.5 text-cyan-200/90 leading-relaxed">
                    You oversee the entire department, role benchmarks, competency frameworks, and learning budget allocations.
                  </p>
                </div>
              </div>
            )}
            {selectedRoleKey === 'hr' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-300 flex items-start gap-3">
                <Icon name="globe" className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">Organization-Wide Scope</div>
                  <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                    HR operates across the entire organization with cross-department workforce directory, strategic forecasting, and ROI analytics.
                  </p>
                </div>
              </div>
            )}
            {selectedRoleKey === 'ldadmin' && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-3.5 text-xs text-purple-300 flex items-start gap-3">
                <Icon name="graduation-cap" className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">Organization-Wide Learning Scope</div>
                  <p className="mt-0.5 text-purple-200/90 leading-relaxed">
                    L&D manages learning and development, course catalogs, adaptive pathways, and certifications across the entire organization.
                  </p>
                </div>
              </div>
            )}
            {selectedRoleKey === 'admin' && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 text-xs text-rose-300 flex items-start gap-3">
                <Icon name="shield" className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">Platform Administrator Scope</div>
                  <p className="mt-0.5 text-rose-200/90 leading-relaxed">
                    System Administration operates at the platform and organization level, governing users, roles, audit logs, and skill taxonomy.
                  </p>
                </div>
              </div>
            )}
            {selectedRoleKey === 'employee' && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 text-xs text-emerald-300 flex items-start gap-3">
                <Icon name="user-check" className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">Employee Onboarding Workflow</div>
                  <p className="mt-0.5 text-emerald-200/90 leading-relaxed">
                    Select your Department, Team / Domain specialization, and Job Title to establish your benchmark requirements and customized AI learning path.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── 3. Account & Organization Fields ── */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label htmlFor="signup-fullname" className="text-xs font-medium text-slate-300 mb-1.5 block">
                  Full Name
                </label>
                <div className="relative">
                  <Icon name="user" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-fullname"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    required
                    autoComplete="name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label htmlFor="signup-email" className="text-xs font-medium text-slate-300 mb-1.5 block">
                  Work Email Address
                </label>
                <div className="relative">
                  <Icon name="mail" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    required
                    autoComplete="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Organization / Company (REQUIRED FOR ALL ROLES) */}
            <div>
              <label htmlFor="signup-company" className="text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Organization / Company Name</span>
                <span className="text-[10px] text-slate-500">Connects users within the same organization</span>
              </label>
              <div className="relative">
                <Icon name="building" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-company"
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Northwind Labs or Acme Corp"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all"
                />
              </div>
              {existingOrgs.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-500">Existing organizations:</span>
                  {existingOrgs.slice(0, 4).map(org => {
                    const orgName = typeof org === 'string' ? org : org.name
                    return (
                      <button
                        type="button"
                        key={orgName}
                        onClick={() => setCompany(orgName)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                          company.toLowerCase() === orgName.toLowerCase()
                            ? 'bg-lime-400/20 text-lime-300 border-lime-400/40 font-semibold'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        {orgName}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── 4. Role-Specific Organizational Fields ── */}

            {/* (A) EMPLOYEE: Department → Team/Domain → Job Title + AI suggestions */}
            {selectedRoleKey === 'employee' && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Department */}
                  <div>
                    <label htmlFor="signup-dept" className="text-xs font-medium text-slate-300 mb-1.5 block">
                      Department
                    </label>
                    <div className="relative">
                      <Icon name="briefcase" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        id="signup-dept"
                        value={department}
                        onChange={e => handleDepartmentChange(e.target.value)}
                        required
                        className="w-full bg-[#111625] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all appearance-none"
                      >
                        {DEPT_OPTIONS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <Icon name="chevron-down" className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Team / Domain (Scoped strictly to Department) */}
                  <div>
                    <label htmlFor="signup-team" className="text-xs font-medium text-slate-300 mb-1.5 block">
                      Team / Domain Specialization
                    </label>
                    <div className="relative">
                      <Icon name="layers" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        id="signup-team"
                        value={team}
                        onChange={e => handleTeamChange(e.target.value)}
                        required
                        className="w-full bg-[#111625] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all appearance-none"
                      >
                        {availableTeams.map(t => (
                          <option key={t} value={t}>{t} Team</option>
                        ))}
                      </select>
                      <Icon name="chevron-down" className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Job / Domain Title */}
                <div>
                  <label htmlFor="signup-jobtitle" className="text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Job / Domain Title</span>
                    <span className="text-[10px] text-slate-400">e.g. for {department} → {team}</span>
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
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all"
                    />
                  </div>

                  {/* AI Suggestions strictly for Employee Department + Team */}
                  {availableJobSuggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-slate-400 font-medium mr-1">
                        <Icon name="sparkles" className="w-3 h-3 inline text-lime-400 mr-1" />
                        AI Suggestions for {department} ({team}):
                      </span>
                      {availableJobSuggestions.map(sug => (
                        <button
                          type="button"
                          key={sug}
                          onClick={() => setJobTitle(sug)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
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
              </div>
            )}

            {/* (B) MANAGER or DEPARTMENT HEAD: Department Selector ONLY (No team, no job title, no AI suggestions) */}
            {(selectedRoleKey === 'manager' || selectedRoleKey === 'depthead') && (
              <div>
                <label htmlFor="signup-dept" className="text-xs font-medium text-slate-300 mb-1.5 block">
                  Department
                </label>
                <div className="relative">
                  <Icon name="briefcase" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    id="signup-dept"
                    value={department}
                    onChange={e => handleDepartmentChange(e.target.value)}
                    required
                    className="w-full bg-[#111625] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all appearance-none"
                  >
                    {DEPT_OPTIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <Icon name="chevron-down" className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedRoleKey === 'manager' 
                    ? 'As a Manager, you oversee all teams and direct reports within this department.'
                    : 'As Department Head, you lead strategy and benchmarks for this entire department.'}
                </p>
              </div>
            )}


            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all"
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
                    <div className="text-[10px]" style={{ color: STRENGTH_COLORS[strength] }}>
                      {STRENGTH_LABELS[strength]}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="signup-confirm" className="text-xs font-medium text-slate-300 mb-1.5 block">
                  Confirm Password
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
                    placeholder="Re-enter password"
                    required
                    autoComplete="new-password"
                    className={`w-full bg-white/5 border rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                      passwordMismatch
                        ? 'border-rose-500/50 focus:ring-rose-500/30'
                        : passwordsMatch
                        ? 'border-lime-400/50 focus:ring-lime-400/30'
                        : 'border-white/10 focus:ring-lime-400/50 focus:border-lime-400/50'
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
                {passwordMismatch && (
                  <p className="text-rose-400 text-[11px] mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <label
              htmlFor="signup-terms"
              className="flex items-start gap-3 cursor-pointer group pt-1"
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
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    agreedToTerms
                      ? 'bg-lime-400 border-lime-400'
                      : 'bg-white/5 border-white/20 group-hover:border-lime-400/50'
                  }`}
                >
                  {agreedToTerms && <Icon name="check" className="w-2.5 h-2.5 text-[#0B0F1A]" />}
                </div>
              </div>
              <span className="text-xs text-slate-400 leading-relaxed select-none">
                I agree to the{' '}
                <span className="text-lime-300 hover:text-lime-200 font-medium">Terms of Service</span>{' '}
                and{' '}
                <span className="text-lime-300 hover:text-lime-200 font-medium">Privacy Policy</span>.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              id="signup-submit"
              disabled={loading || passwordMismatch || !agreedToTerms}
              className="w-full bg-lime-400 hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0F1A] font-bold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_-6px_rgba(166,226,46,0.5)] mt-2 cursor-pointer"
            >
              Register as {activeRoleObj.label} <Icon name="arrow-right" className="w-4 h-4" />
            </button>

            {/* Google OAuth */}
            <button
              type="button"
              id="signup-google"
              onClick={() => setShowGoogleModal(true)}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 font-medium rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v3h3.88c2.27-2.09 3.54-5.17 3.54-8.82z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.09C3.26 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.31 14.32A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.58.42-2.32V6.59H1.3A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.3 5.41l4.01-3.09z" />
                <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.94 1.19 15.23 0 12 0 7.31 0 3.26 2.7 1.3 6.59l4.01 3.09C6.25 6.86 8.89 4.77 12 4.77z" />
              </svg>
              Sign up with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Already have an account?</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {/* Sign in link */}
            <button
              type="button"
              id="signup-go-login"
              onClick={onSwitchToLogin}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 font-medium rounded-xl py-2.5 text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Icon name="log-in" className="w-4 h-4" /> Sign In to Existing Account
            </button>
          </div>
        </form>
      </div>

      {/* Google Account Sign-In Modal */}
      <GoogleSignInModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onLoginSuccess={(appRole, authData) => onLogin(appRole, authData, activeRoleObj.key === 'employee')}
      />
    </div>
  )
}

