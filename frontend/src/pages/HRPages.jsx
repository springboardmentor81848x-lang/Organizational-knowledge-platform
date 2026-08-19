import React, { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import Icon from '../components/Icon.jsx'
import { Pill, SectionHead, StatCard, statusColor, sevColor, heatColor } from '../components/Bits.jsx'
import api from '../services/api.js'

const DEPT_OPTIONS = [
  'Engineering', 'Product', 'HR & Operations', 'Sales & Marketing',
  'Data & Analytics', 'Finance', 'Legal', 'Design', 'Customer Success', 'Other'
]

const DEFAULT_HR_DATA = {
  totalEmployees: 12,
  criticalGaps: 18,
  avgCompletion: 74,
  roi: '3.8x',
  departments: [
    { name: 'Engineering', headcount: 9, completion: 78, gap: 8 },
    { name: 'Product', headcount: 3, completion: 82, gap: 3 },
    { name: 'Design', headcount: 2, completion: 88, gap: 1 },
    { name: 'Data & Analytics', headcount: 2, completion: 70, gap: 4 },
    { name: 'HR & Operations', headcount: 2, completion: 85, gap: 1 },
    { name: 'Sales & Marketing', headcount: 2, completion: 65, gap: 3 }
  ],
  heatmap: {
    rows: ['Engineering', 'Product', 'Design', 'Data & Analytics', 'HR & Operations', 'Sales & Marketing'],
    cols: ['Java Spring Boot', 'React', 'SQL / Database', 'Cloud / AWS', 'UI/UX Design', 'System Architecture'],
    values: [
      [82, 75, 80, 68, 55, 78],
      [65, 50, 70, 60, 85, 72],
      [45, 60, 50, 40, 92, 60],
      [70, 58, 88, 75, 50, 65],
      [50, 45, 60, 50, 65, 55],
      [40, 35, 65, 45, 70, 50]
    ]
  },
  alerts: [
    { title: 'Cloud infrastructure proficiency requires reinforcement in Engineering', sev: 'Critical', dept: 'Engineering', recommendation: 'Enroll 3 senior engineers in the AWS Solutions Architect cohort.' },
    { title: 'Data pipeline optimization gap identified in Data & Analytics', sev: 'High', dept: 'Data & Analytics', recommendation: 'Assign Spark & Kafka optimization modules.' },
    { title: 'Enterprise UX design alignment on track org-wide', sev: 'Low', dept: 'Design', recommendation: 'Maintain bi-weekly design review sessions.' }
  ],
  certStatus: [
    { name: 'Active', value: 8, color: '#65D46E' },
    { name: 'Pending', value: 3, color: '#F59E0B' },
    { name: 'Expired', value: 1, color: '#F43F5E' }
  ],
  directory: [
    { name: 'Ava Chen', dept: 'Engineering', role: 'Sr Software Engineer', score: 82, status: 'On Track' },
    { name: 'Marcus Lee', dept: 'Engineering', role: 'Engineering Manager', score: 88, status: 'On Track' },
    { name: 'Liam Harper', dept: 'Engineering', role: 'Java Developer', score: 68, status: 'At Risk' },
    { name: 'Sofia Ruiz', dept: 'Design', role: 'Product Designer', score: 91, status: 'On Track' },
    { name: 'Daniel Osei', dept: 'Data & Analytics', role: 'Data Analyst', score: 63, status: 'Needs Review' }
  ],
  training: [
    { month: 'Mar', value: 65 },
    { month: 'Apr', value: 68 },
    { month: 'May', value: 72 },
    { month: 'Jun', value: 75 },
    { month: 'Jul', value: 78 },
    { month: 'Aug', value: 82 }
  ],
  severityMix: [
    { name: 'Critical', value: 18, color: '#F43F5E' },
    { name: 'High', value: 24, color: '#F59E0B' },
    { name: 'Medium', value: 45, color: '#818CF8' },
    { name: 'Low', value: 80, color: '#65D46E' }
  ]
}

export function HRDashboard({ onNav, user }) {
  const [data, setData] = useState(DEFAULT_HR_DATA)
  const [loading, setLoading] = useState(true)
  const [connectModal, setConnectModal] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [toastMsg, setToastMsg] = useState(null)
  const [employees, setEmployees] = useState([])

  const handleOpenConnectModal = (targetName, targetEmail) => {
    setConnectModal({ targetName, targetEmail })
    setMessageText('')
  }

  const handleSendMessage = () => {
    if (!messageText.trim()) return
    setConnectModal(null)
    setToastMsg(`✓ Message successfully sent to ${connectModal.targetName}!`)
    setTimeout(() => setToastMsg(null), 4000)
  }

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    Promise.all([
      api.getHrDashboard(),
      api.getHrUsers().catch(() => [])
    ])
      .then(([res, usersRes]) => {
        if (isMounted) {
          if (res) {
            setData(prev => {
              const merged = { ...prev, ...res }
              // Ensure array fallbacks
              if (!res.departments || res.departments.length === 0) merged.departments = prev.departments
              if (!res.heatmap || !res.heatmap.rows || res.heatmap.rows.length === 0) merged.heatmap = prev.heatmap
              if (!res.alerts || res.alerts.length === 0) merged.alerts = prev.alerts
              if (!res.certStatus || res.certStatus.length === 0) merged.certStatus = prev.certStatus
              if (!res.training || res.training.length === 0) merged.training = prev.training
              if (!res.severityMix || res.severityMix.length === 0) merged.severityMix = prev.severityMix
              return merged
            })
          }
          if (Array.isArray(usersRes)) {
            const emps = usersRes.filter(u => u.systemRole === 'EMPLOYEE' || u.systemRole === 'User')
            setEmployees(emps)
          }
        }
      })
      .catch(err => console.log('Using default HR state:', err))
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Icon name="loader-2" className="w-8 h-8 text-indigo-400 animate-spin" />
          <div className="text-sm text-slate-400">Loading HR dashboard...</div>
        </div>
      </div>
    )
  }

  const d = data
  const totalCerts = (d.certStatus || []).reduce((acc, c) => acc + (c.value || 0), 0)

  return (
    <div className="stagger space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F1A] via-[#141433] to-[#0B0F1A] p-6 sm:p-8">
        <div className="grad-blob w-64 h-64 bg-indigo-500/25 -top-10 right-10"></div>
        <div className="relative z-10">
          <Pill text={<span className="inline-flex items-center gap-1.5"><Icon name="circle" className="w-2 h-2 fill-current" />Org Pulse: Active</span>} className="bg-indigo-400/15 text-indigo-300 mb-4" />
          <h1 className="font-display text-3xl font-bold text-white mb-2">Good day, {user?.name ? user.name.split(' ')[0] : (d.name ? d.name.split(' ')[0] : 'there')} 👋</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            {d.criticalGaps || 0} critical skill gaps monitored across the organization. Real-time workforce telemetry active for {user?.company || 'Enterprise'}.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => onNav('directory')} className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-semibold text-sm rounded-xl px-5 py-2.5 flex items-center gap-2 transition-all shadow-md">
              <Icon name="users" className="w-4 h-4" /> Manage Workforce Directory
            </button>
            <button onClick={() => onNav('matrix')} className="bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-xl px-5 py-2.5 flex items-center gap-2 transition-all">
              <Icon name="grid" className="w-4 h-4" /> View Skill Matrix
            </button>
            <button onClick={() => onNav('reports')} className="bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-xl px-5 py-2.5 flex items-center gap-2 transition-all">
              <Icon name="download" className="w-4 h-4" /> Export Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="users" label="Total Employees" value={(d.totalEmployees || 12).toLocaleString()} delta="+4" positive tint="bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-300" />
        <StatCard icon="alert-triangle" label="Critical Gaps" value={d.criticalGaps || 18} delta="-2" positive={true} tint="bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300" />
        <StatCard icon="trending-up" label="Avg Completion" value={`${d.avgCompletion || 74}%`} delta="+5%" positive tint="bg-lime-50 text-lime-600 dark:bg-lime-400/10 dark:text-lime-300" />
        <StatCard icon="coins" label="Learning ROI" value={d.roi || '3.8x'} delta="+0.4" positive tint="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Training Completion Rate" sub="Org-wide progress trend over recent months" />
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Array.isArray(d.training) && d.training.length > 0 ? d.training : DEFAULT_HR_DATA.training}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip formatter={(val) => [`${val}%`, 'Completion']} />
                <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Certification Status" sub="Org-wide credentials verification" />
          <div className="h-48 mt-2">
            {totalCerts > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={d.certStatus || DEFAULT_HR_DATA.certStatus} dataKey="value" innerRadius={55} outerRadius={78} paddingAngle={3}>
                    {(d.certStatus || DEFAULT_HR_DATA.certStatus).map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Icon name="award" className="w-10 h-10 text-slate-500 mb-2" />
                <span className="text-xs text-slate-400">All certificates active & up-to-date</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            {(d.certStatus || DEFAULT_HR_DATA.certStatus).map((c, i) => (
              <div key={i} className="p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="text-lg font-bold font-display" style={{ color: c.color }}>{c.value}</div>
                <div className="text-[11px] text-slate-400">{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Department Performance" sub="Headcount, completion rates, and critical deficit indicators" />
          <div className="space-y-4 mt-4">
            {(Array.isArray(d.departments) && d.departments.length > 0 ? d.departments : DEFAULT_HR_DATA.departments).map((dep, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div className="w-44 shrink-0">
                  <div className="text-sm font-semibold text-slate-200">{dep.name}</div>
                  <div className="text-xs text-slate-400">{dep.headcount} employees</div>
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, dep.completion || 75)}%` }}></div>
                  </div>
                  <div className="w-12 text-right text-xs font-semibold text-slate-300">{dep.completion || 75}%</div>
                </div>
                <div className="w-28 text-right">
                  <Pill 
                    text={dep.gap > 0 ? `${dep.gap} critical gaps` : 'Optimized'} 
                    className={dep.gap > 0 ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Critical Skill Gap Alerts" sub="High priority AI action items" />
          <div className="space-y-3 mt-4">
            {(Array.isArray(d.alerts) && d.alerts.length > 0 ? d.alerts : DEFAULT_HR_DATA.alerts).map((a, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-100 dark:border-white/5 bg-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <Pill text={a.sev || 'Critical'} className={sevColor(a.sev || 'Critical')} />
                  <span className="text-[11px] font-medium text-slate-400">{a.dept || 'Engineering'}</span>
                </div>
                <p className="text-xs font-medium text-slate-200 leading-snug">{a.title || a.message}</p>
                {a.recommendation && (
                  <div className="text-[11px] text-indigo-300 flex items-start gap-1.5 pt-1 border-t border-white/5">
                    <Icon name="sparkles" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{a.recommendation}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ESCALATION & WORKFORCE COMMUNICATIONS CARD ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connect with Employees */}
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 space-y-3">
          <SectionHead title="Workforce Communications" sub="Send direct messages or sync with employees" />
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {employees.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">No registered employees in the organization</div>
            ) : (
              employees.map((emp, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {emp.fullName ? emp.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'EM'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{emp.fullName}</div>
                      <div className="text-[10px] text-slate-400 truncate">{emp.roleTitle || 'Employee'}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenConnectModal(emp.fullName, emp.email)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Icon name="message-square" className="w-3.5 h-3.5" /> Connect
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Connect with Managers & Admins */}
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 space-y-3">
          <SectionHead title="Support & Management Escalations" sub="Sync with department heads, managers and administrators" />
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {/* Manager Marcus King */}
            <div className="p-3 bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-lime-400 text-[#0B0F1A] font-bold text-xs flex items-center justify-center shrink-0">
                  MK
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Marcus King</div>
                  <div className="text-[10px] text-slate-400 truncate">Engineering Manager</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenConnectModal('Marcus King (Engineering Manager)', 'manager@northwind.io')}
                className="px-2.5 py-1 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <Icon name="message-square" className="w-3.5 h-3.5" /> Connect
              </button>
            </div>

            {/* Manager Victor */}
            <div className="p-3 bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-lime-400 text-[#0B0F1A] font-bold text-xs flex items-center justify-center shrink-0">
                  VI
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Victor</div>
                  <div className="text-[10px] text-slate-400 truncate">Marketing Manager</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenConnectModal('Victor (Marketing Manager)', 'doom@gmail.com')}
                className="px-2.5 py-1 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <Icon name="message-square" className="w-3.5 h-3.5" /> Connect
              </button>
            </div>

            {/* L&D Admin Nobita */}
            <div className="p-3 bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  NN
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Nobita Nobi</div>
                  <div className="text-[10px] text-slate-400 truncate">L&D Administrator</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenConnectModal('Nobita Nobi (L&D Admin)', 'ldadmin@northwind.io')}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <Icon name="message-square" className="w-3.5 h-3.5" /> Connect
              </button>
            </div>

            {/* Department Head Krrish */}
            <div className="p-3 bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  KR
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Krrish</div>
                  <div className="text-[10px] text-slate-400 truncate">Head of Department</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenConnectModal('Krrish (Department Head)', 'depthead@northwind.io')}
                className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <Icon name="message-square" className="w-3.5 h-3.5" /> Connect
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      {connectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-scale">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Icon name="message-square" className="w-4 h-4 text-lime-400" />
                Message to {connectModal.targetName}
              </h3>
              <button onClick={() => setConnectModal(null)} className="text-slate-400 hover:text-white">
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Your Message</label>
              <textarea
                rows={3}
                placeholder="Type your message here..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConnectModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                className="px-5 py-2 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl p-3.5 shadow-xl text-xs font-bold flex items-center gap-2 animate-slide-in">
          <Icon name="check-circle" className="w-4 h-4" /> {toastMsg}
        </div>
      )}
    </div>
  )
}

export function HRDirectory({ user, onNav }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [toast, setToast] = useState(null)
  
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({ roleTitle: '', departmentName: '', systemRole: '' })

  useEffect(() => {
    loadUsers()
  }, [])

  function loadUsers() {
    setLoading(true)
    api.getHrUsers()
      .then(res => {
        if (Array.isArray(res)) setUsers(res)
      })
      .catch(err => {
        console.error('Failed to load users:', err)
        showToast('Failed to load employee directory', 'error')
      })
      .finally(() => setLoading(false))
  }

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  function handleToggleStatus(userId) {
    api.toggleHrUserStatus(userId)
      .then(res => {
        showToast('User status updated successfully.', 'success')
        loadUsers()
      })
      .catch(err => showToast(err.message || 'Failed to update user status', 'error'))
  }

  function handleOpenEdit(u) {
    setEditingUser(u)
    setEditForm({
      roleTitle: u.roleTitle || '',
      departmentName: u.dept || 'Engineering',
      systemRole: u.systemRole || 'EMPLOYEE'
    })
  }

  function handleSaveEdit(e) {
    e.preventDefault()
    if (!editingUser) return
    api.updateHrUserRole(editingUser.id, editForm)
      .then(() => {
        showToast('User details updated successfully.', 'success')
        setEditingUser(null)
        loadUsers()
      })
      .catch(err => showToast(err.message || 'Failed to update user', 'error'))
  }

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || 
      (u.fullName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.dept || '').toLowerCase().includes(q) ||
      (u.roleTitle || '').toLowerCase().includes(q)

    const matchesDept = deptFilter === 'All' || u.dept === deptFilter
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? u.isActive : !u.isActive)

    return matchesSearch && matchesDept && matchesStatus
  })

  return (
    <div className="fade-in space-y-5">
      <SectionHead 
        title="Workforce User Management" 
        sub="Search employee profiles, update organizational roles, or manage system access"
      />

      {toast && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${toast.type === 'error' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-lime-400/10 text-lime-300 border border-lime-400/20'} fade-in`}>
          {toast.message}
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 flex-1">
          <Icon name="search" className="w-4 h-4 text-slate-400" />
          <input 
            placeholder="Search directory by name, email, department, or role..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 text-white placeholder-slate-500" 
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
              <Icon name="x" className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="bg-[#0F1420] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:ring-2 focus:ring-lime-400/40"
          >
            <option value="All">All Departments</option>
            {DEPT_OPTIONS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#0F1420] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:ring-2 focus:ring-lime-400/40"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Icon name="loader-2" className="w-6 h-6 animate-spin text-lime-400" />
            Loading workforce directory...
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-medium px-5 py-3.5">Employee</th>
                  <th className="text-left font-medium px-5 py-3.5">Department</th>
                  <th className="text-left font-medium px-5 py-3.5">Role / Title</th>
                  <th className="text-left font-medium px-5 py-3.5">System Access</th>
                  <th className="text-left font-medium px-5 py-3.5">Status</th>
                  <th className="text-right font-medium px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredUsers.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {(e.fullName || 'E').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{e.fullName}</div>
                          <div className="text-xs text-slate-400">{e.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 font-medium">{e.dept}</td>
                    <td className="px-5 py-3.5 text-slate-300">{e.roleTitle}</td>
                    <td className="px-5 py-3.5">
                      <Pill text={e.systemRole} className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium" />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${e.isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${e.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {e.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenEdit(e)}
                        className="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all border border-white/5"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(e.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${e.isActive ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'}`}
                      >
                        {e.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs">
            No employees found matching the search criteria.
          </div>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md card bg-[#0F1420] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-lg font-bold text-white font-display">Edit User Profile</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Full Name</label>
                <div className="text-sm font-medium text-white px-3 py-2 bg-white/5 rounded-lg border border-white/5">
                  {editingUser.fullName}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Email</label>
                <div className="text-sm font-medium text-white px-3 py-2 bg-white/5 rounded-lg border border-white/5">
                  {editingUser.email}
                </div>
              </div>
              <div>
                <label htmlFor="edit-dept" className="text-xs font-semibold text-slate-400 mb-1.5 block">Department</label>
                <select
                  id="edit-dept"
                  value={editForm.departmentName}
                  onChange={e => setEditForm(prev => ({ ...prev, departmentName: e.target.value }))}
                  required
                  className="w-full bg-[#111625] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                >
                  {DEPT_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-role" className="text-xs font-semibold text-slate-400 mb-1.5 block">Job Title</label>
                <input
                  id="edit-role"
                  type="text"
                  value={editForm.roleTitle}
                  onChange={e => setEditForm(prev => ({ ...prev, roleTitle: e.target.value }))}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                />
              </div>
              <div>
                <label htmlFor="edit-sysrole" className="text-xs font-semibold text-slate-400 mb-1.5 block">System Access Role</label>
                <select
                  id="edit-sysrole"
                  value={editForm.systemRole}
                  onChange={e => setEditForm(prev => ({ ...prev, systemRole: e.target.value }))}
                  required
                  className="w-full bg-[#111625] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Team Lead / Manager</option>
                  <option value="HR_SPECIALIST">HR Specialist</option>
                  <option value="DEPARTMENT_HEAD">Department Head</option>
                  <option value="L_AND_D_ADMIN">L&D Administrator</option>
                  <option value="SYSTEM_ADMIN">System Administrator</option>
                </select>
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 font-semibold rounded-xl py-2.5 text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold rounded-xl py-2.5 text-sm transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export function HRMatrix({ user }) {
  const [heatmap, setHeatmap] = useState(DEFAULT_HR_DATA.heatmap)
  const [loading, setLoading] = useState(true)
  const [selectedDept, setSelectedDept] = useState('All')

  useEffect(() => {
    setLoading(true)
    api.getHrDashboard()
      .then(res => {
        if (res && res.heatmap && res.heatmap.rows && res.heatmap.rows.length > 0) {
          setHeatmap(res.heatmap)
        }
      })
      .catch(err => console.log('Using default heatmap:', err))
      .finally(() => setLoading(false))
  }, [])

  const h = heatmap || DEFAULT_HR_DATA.heatmap
  const cols = (h.cols && h.cols.length > 0) ? h.cols : DEFAULT_HR_DATA.heatmap.cols
  const allRows = (h.rows && h.rows.length > 0) ? h.rows : DEFAULT_HR_DATA.heatmap.rows
  const allValues = (h.values && h.values.length > 0) ? h.values : DEFAULT_HR_DATA.heatmap.values

  // Department filtering
  const filteredIndices = allRows.map((r, i) => ({ name: r, index: i }))
    .filter(item => selectedDept === 'All' || item.name === selectedDept)

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHead 
          title="Organization Workforce Skill Matrix" 
          sub="Competency proficiency breakdown across departments × strategic capabilities" 
        />
        <div className="flex flex-wrap gap-2">
          {['All', ...allRows].map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                selectedDept === dept
                  ? 'bg-lime-400 text-[#0B0F1A] border-lime-400 font-bold shadow-[0_0_12px_rgba(166,226,46,0.3)]'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
              }`}
            >
              {dept === 'All' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 overflow-x-auto shadow-lg">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Icon name="loader-2" className="w-6 h-6 animate-spin text-lime-400" />
            Loading organization matrix...
          </div>
        ) : (
          <div className="min-w-[640px]">
            {/* Header Columns */}
            <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `160px repeat(${cols.length}, minmax(0, 1fr))` }}>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-2">Department</div>
              {cols.map((c, i) => (
                <div key={i} className="text-xs font-medium text-slate-400 text-center truncate px-1" title={c}>
                  {c}
                </div>
              ))}
            </div>

            {/* Matrix Data Rows */}
            {filteredIndices.map(({ name, index }) => (
              <div key={index} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `160px repeat(${cols.length}, minmax(0, 1fr))` }}>
                <div className="text-xs font-semibold text-slate-200 flex items-center truncate pl-2" title={name}>
                  {name}
                </div>
                {cols.map((_, vi) => {
                  const val = allValues[index]?.[vi] ?? 70
                  return (
                    <div 
                      key={vi} 
                      className={`heat ${heatColor(val)} rounded-lg h-12 flex items-center justify-center text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-sm`}
                      title={`${name} × ${cols[vi]}: ${val}% Proficiency`}
                    >
                      {val}%
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/5 text-xs text-slate-400 flex-wrap">
          <span className="font-semibold text-slate-300">Proficiency Scale:</span>
          <span className="flex items-center gap-1.5"><Icon name="square" className="w-3 h-3 fill-rose-500 text-rose-500" /> Critical Deficit (&lt;40%)</span>
          <span className="flex items-center gap-1.5"><Icon name="square" className="w-3 h-3 fill-orange-400 text-orange-400" /> Low Capability (40–60%)</span>
          <span className="flex items-center gap-1.5"><Icon name="square" className="w-3 h-3 fill-amber-300 text-amber-300" /> Moderate (60–80%)</span>
          <span className="flex items-center gap-1.5"><Icon name="square" className="w-3 h-3 fill-lime-400 text-lime-400" /> Strong / Target (80%+)</span>
        </div>
      </div>
    </div>
  )
}

export function HRReports({ user }) {
  const [data, setData] = useState(DEFAULT_HR_DATA)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getHrDashboard()
      .then(res => {
        if (res) setData(prev => ({ ...prev, ...res }))
      })
      .catch(err => console.log('Using default HR reports:', err))
      .finally(() => setLoading(false))
  }, [])

  function handleExportGaps() {
    const token = localStorage.getItem('token')
    fetch('http://localhost:8080/api/analytics/export/gaps.csv', {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'knowledgeiq_gaps_report.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
    })
    .catch(err => console.error('Failed to export gaps:', err))
  }

  function handleExportTraining() {
    const token = localStorage.getItem('token')
    fetch('http://localhost:8080/api/analytics/export/training.csv', {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'knowledgeiq_training_report.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
    })
    .catch(err => console.error('Failed to export training:', err))
  }

  const d = data

  return (
    <div className="fade-in space-y-6">
      <SectionHead 
        title="Workforce Reports & Analytics" 
        sub="Export comprehensive skill intelligence and training reports"
        right={
          <div className="flex gap-2">
            <button onClick={handleExportGaps} className="flex items-center gap-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 transition-all">
              <Icon name="file-text" className="w-3.5 h-3.5 text-lime-400" /> Export Gaps CSV
            </button>
            <button onClick={handleExportTraining} className="flex items-center gap-1.5 text-xs font-semibold bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] rounded-xl px-3.5 py-2.5 font-bold transition-all shadow-md">
              <Icon name="file-spreadsheet" className="w-3.5 h-3.5" /> Export Training CSV
            </button>
          </div>
        } 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 shadow-lg">
          <SectionHead title="Completion by Department" sub="Average learning modules completion percentage" />
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.departments || DEFAULT_HR_DATA.departments} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(100,116,139,0.15)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip formatter={(val) => [`${val}%`, 'Completion']} />
                <Bar dataKey="completion" fill="#6366F1" radius={[0, 8, 8, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 shadow-lg">
          <SectionHead title="Gap Severity Breakdown" sub="Workforce skill gaps by urgency level" />
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={d.severityMix || DEFAULT_HR_DATA.severityMix} dataKey="value" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {(d.severityMix || DEFAULT_HR_DATA.severityMix).map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 shadow-lg">
        <SectionHead title="Training Trajectory (Last 6 Months)" sub="Org-wide course and certificate completions" />
        <div className="h-56 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={d.training || DEFAULT_HR_DATA.training}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.15)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip formatter={(val) => [`${val}%`, 'Progress Score']} />
              <Line type="monotone" dataKey="value" stroke="#65D46E" strokeWidth={2.5} dot={true} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export function HRForecasting({ user }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getHrForecasting()
      .then(res => {
        if (res) setData(res)
      })
      .catch(err => console.error('Failed to load forecast data:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Icon name="loader-2" className="w-8 h-8 text-lime-400 animate-spin" />
          <div className="text-sm text-slate-400">Loading strategic forecasting data...</div>
        </div>
      </div>
    )
  }

  const forecastSkills = data?.forecastSkills || [
    { skill: 'Java Spring Boot & Microservices', deficitScore: 75, criticalGaps: 6, trend: 'Increasing Deficit', demandScore: 88, learningVelocity: 70 },
    { skill: 'Cloud Architecture & AWS Solutions', deficitScore: 68, criticalGaps: 5, trend: 'Increasing Deficit', demandScore: 82, learningVelocity: 65 },
    { skill: 'React & Frontend State Management', deficitScore: 50, criticalGaps: 3, trend: 'Stable Deficit', demandScore: 74, learningVelocity: 80 },
    { skill: 'OAuth2 & Enterprise Cybersecurity', deficitScore: 60, criticalGaps: 4, trend: 'Increasing Deficit', demandScore: 80, learningVelocity: 60 }
  ]
  const demandIndex = data?.demandIndex || [
    { month: 'Q1', demand: 55, supply: 48 },
    { month: 'Q2', demand: 68, supply: 54 },
    { month: 'Q3', demand: 76, supply: 65 },
    { month: 'Q4', demand: 85, supply: 78 }
  ]
  const velocity = data?.learningVelocity || 74

  return (
    <div className="stagger space-y-6">
      <SectionHead 
        title="Strategic Workforce Skill Forecasting" 
        sub="Forecast resource deficits, demand velocity, and target key capability improvements" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-[#0F1420] border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Icon name="trending-up" className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-xs font-semibold text-slate-400">Learning Velocity</span>
          </div>
          <div className="text-3xl font-display font-bold text-white">{velocity}%</div>
          <p className="text-[11px] text-slate-400 mt-2">Percentage of skill gaps being successfully resolved on schedule this quarter.</p>
        </div>

        <div className="card bg-[#0F1420] border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Icon name="sparkles" className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-slate-400">Projected Skill Coverage</span>
          </div>
          <div className="text-3xl font-display font-bold text-white">92.4%</div>
          <p className="text-[11px] text-slate-400 mt-2">Estimated workforce competency health score across key departments in 6 months.</p>
        </div>

        <div className="card bg-[#0F1420] border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-lime-400/15 flex items-center justify-center">
              <Icon name="coins" className="w-5 h-5 text-lime-300" />
            </div>
            <span className="text-xs font-semibold text-slate-400">Budget ROI Multiplier</span>
          </div>
          <div className="text-3xl font-display font-bold text-white">4.2x ROI</div>
          <p className="text-[11px] text-slate-400 mt-2">Projected performance increase multiplier based on targeted skill alignment.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card bg-[#0F1420] border border-white/5 rounded-2xl p-5 sm:p-6 text-left shadow-lg">
          <SectionHead title="Top Projected Skill Deficits" sub="Based on active workforce gaps vs target organizational benchmarks" />
          <div className="space-y-5 mt-4">
            {forecastSkills.map((s, i) => (
              <div key={i} className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="font-semibold text-slate-200">{s.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${s.trend.includes('Increasing') ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : 'bg-white/10 text-slate-300'}`}>
                      {s.trend}
                    </span>
                    <span className="text-slate-400 font-semibold">{s.deficitScore}% Deficit</span>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.deficitScore > 60 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, s.deficitScore)}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{s.criticalGaps} Critical shortages</span>
                  <span>Demand index: {s.demandScore}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-[#0F1420] border border-white/5 rounded-2xl p-5 sm:p-6 shadow-lg">
          <SectionHead title="Skill Demand vs. Supply" sub="Quarterly trend forecast" />
          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demandIndex}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip />
                <Line type="monotone" name="Demand Index" dataKey="demand" stroke="#F43F5E" strokeWidth={2.5} dot={true} />
                <Line type="monotone" name="Supply Capacity" dataKey="supply" stroke="#65D46E" strokeWidth={2.5} dot={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card bg-[#0F1420] border border-white/5 rounded-2xl p-5 sm:p-6 text-left shadow-lg">
        <SectionHead title="Strategic Interventions Roadmap" sub="Automated strategic recommendations by KnowledgeIQ Advisor" />
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Icon name="sparkles" className="w-4 h-4" /> Cloud & Architect Upskilling
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              We forecast high demand for <strong>AWS Cloud & Microservices Architecture</strong>. Action: Auto-assign the <em>"Advanced AWS Cloud Solutions Architect"</em> learning path to engineering team members.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Icon name="graduation-cap" className="w-4 h-4" /> Security & OAuth2 Cohort
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cybersecurity & API authorization has an emerging capability gap. We recommend enrolling 4 engineers in the <em>"Enterprise Spring Boot Security & OAuth2"</em> track.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HRDepartments({ user }) {
  const [depts, setDepts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [deptForm, setDeptForm] = useState({ name: '', description: '' })
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadDepts()
  }, [])

  function loadDepts() {
    setLoading(true)
    api.getHrDepartments()
      .then(res => {
        if (Array.isArray(res)) setDepts(res)
      })
      .catch(err => {
        console.error('Failed to load departments:', err)
        showToast('Failed to load department metrics', 'error')
      })
      .finally(() => setLoading(false))
  }

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  function handleCreateDept(e) {
    e.preventDefault()
    if (!deptForm.name.trim()) return
    api.createHrDepartment(deptForm)
      .then(() => {
        showToast('Department created successfully.', 'success')
        setDeptForm({ name: '', description: '' })
        setShowAddModal(false)
        loadDepts()
      })
      .catch(err => showToast(err.message || 'Failed to create department', 'error'))
  }

  const filteredDepts = depts.filter(d => 
    (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHead 
          title="Organization Department Administration" 
          sub="Overview of headcounts, assigned managers, and critical capability metrics" 
        />
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-4 py-2.5 transition-all flex items-center gap-2 shadow-md shrink-0 self-start sm:self-auto"
        >
          <Icon name="plus" className="w-4 h-4" /> Create Department
        </button>
      </div>

      {toast && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${toast.type === 'error' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-lime-400/10 text-lime-300 border border-lime-400/20'} fade-in`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center gap-2 bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5">
        <Icon name="search" className="w-4 h-4 text-slate-400" />
        <input 
          placeholder="Filter departments by name or description..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm outline-none flex-1 text-white placeholder-slate-500" 
        />
      </div>

      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Icon name="loader-2" className="w-6 h-6 animate-spin text-lime-400" />
            Loading departments metrics...
          </div>
        ) : filteredDepts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-medium px-5 py-3.5">Department Name</th>
                  <th className="text-left font-medium px-5 py-3.5">Assigned Manager</th>
                  <th className="text-left font-medium px-5 py-3.5">Headcount</th>
                  <th className="text-left font-medium px-5 py-3.5">Completion Rate</th>
                  <th className="text-left font-medium px-5 py-3.5">Critical Deficits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredDepts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <div className="font-semibold text-slate-200 text-left">{d.name}</div>
                        <div className="text-xs text-slate-400 text-left">{d.description || 'Enterprise department'}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 text-left">
                      <span className="font-medium">{d.managerName || 'Unassigned'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 text-left">{d.headcount} employees</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${d.completion}%` }} />
                        </div>
                        <span className="text-xs text-slate-300 font-semibold">{d.completion}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-left">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${d.gap > 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {d.gap} deficits
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs">
            No departments found. Click "Create Department" to add one!
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md card bg-[#0F1420] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-lg font-bold text-white font-display">Create New Department</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDept} className="space-y-4 text-left">
              <div>
                <label htmlFor="dept-name" className="text-xs font-semibold text-slate-400 mb-1.5 block">Department Name</label>
                <input
                  id="dept-name"
                  type="text"
                  value={deptForm.name}
                  onChange={e => setDeptForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g. Sales & Marketing"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                />
              </div>
              <div>
                <label htmlFor="dept-desc" className="text-xs font-semibold text-slate-400 mb-1.5 block">Description</label>
                <textarea
                  id="dept-desc"
                  value={deptForm.description}
                  onChange={e => setDeptForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe department function..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 font-semibold rounded-xl py-2.5 text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold rounded-xl py-2.5 text-sm transition-all shadow-md"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export function GapAnalysis({ role }) {
  const [heatmapData, setHeatmapData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [recalculating, setRecalculating] = useState(false)
  const [updatedMessage, setUpdatedMessage] = useState('')

  useEffect(() => {
    setLoading(true)
    api.getScopedHeatmap()
      .then(res => {
        if (res) setHeatmapData(res)
      })
      .catch(err => console.error('Failed to fetch scoped heatmap:', err))
      .finally(() => setLoading(false))
  }, [])

  const scopeName = heatmapData?.scopeName || 'Organization Knowledge Gaps'
  const scope = heatmapData?.scope || 'ORGANIZATION'
  const rows = (heatmapData?.rows && heatmapData.rows.length > 0) ? heatmapData.rows : DEFAULT_HR_DATA.heatmap.rows
  const cols = (heatmapData?.cols && heatmapData.cols.length > 0) ? heatmapData.cols : DEFAULT_HR_DATA.heatmap.cols
  const values = (heatmapData?.values && heatmapData.values.length > 0) ? heatmapData.values : DEFAULT_HR_DATA.heatmap.values
  const alerts = heatmapData?.alerts || DEFAULT_HR_DATA.alerts

  function handleRecalculate() {
    setRecalculating(true)
    setUpdatedMessage('')
    api.recalculateGaps()
      .then(res => {
        if (res) setHeatmapData(res)
        setUpdatedMessage('✓ Gap analysis updated')
        setTimeout(() => setUpdatedMessage(''), 4000)
      })
      .catch(err => {
        console.error('Recalculation error:', err)
        setUpdatedMessage('✕ Failed to update')
        setTimeout(() => setUpdatedMessage(''), 4000)
      })
      .finally(() => setRecalculating(false))
  }

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'All') return true
    if (filter === 'Critical Only') return a.sev === 'Critical'
    return a.sev === filter
  })

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHead 
          title="Organization Knowledge Gap Intelligence" 
          sub={`Real-time competency analysis for ${scopeName}`} 
        />
        <div className="flex items-center gap-3.5 self-start sm:self-auto">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-4 py-2.5 transition-all flex items-center gap-2 shadow-md shrink-0 disabled:opacity-75"
          >
            {recalculating ? (
              <>
                <Icon name="loader-2" className="w-4 h-4 animate-spin" />
                <span>Recalculating...</span>
              </>
            ) : (
              <>
                <Icon name="refresh-cw" className="w-4 h-4" />
                <span>Refresh Gap Intelligence</span>
              </>
            )}
          </button>
          {updatedMessage && (
            <span className={`text-xs font-bold ${updatedMessage.includes('✓') ? 'text-emerald-400' : 'text-rose-400'} fade-in`}>
              {updatedMessage}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['All', 'Critical Only', 'High', 'Medium', 'Low'].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`text-xs font-medium rounded-full px-3.5 py-1.5 border transition-all ${
              filter === f 
                ? 'bg-lime-400 text-[#0B0F1A] border-lime-400 font-semibold shadow-[0_0_12px_rgba(166,226,46,0.4)]' 
                : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-white/20'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Dynamic Alerts */}
      <div className="grid md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Icon name="loader-2" className="w-4 h-4 animate-spin text-lime-400" />
            Analyzing organization-wide skill gaps...
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((a, i) => (
            <div key={i} className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 shadow-lg">
              <Pill text={a.sev} className={sevColor(a.sev)} />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-3 leading-snug">{a.title}</p>
              <p className="text-xs text-slate-400 mt-1">{a.dept}</p>
              <div className="mt-3 p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs flex gap-2 items-start">
                <Icon name="sparkles" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{a.recommendation || 'AI recommends targeted learning intervention.'}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 text-center text-slate-400 text-xs">
            No gaps matching the "{filter}" filter criteria.
          </div>
        )}
      </div>

      {/* Heatmap Matrix */}
      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 overflow-x-auto shadow-lg">
        <SectionHead title={`Gap Heatmap (${scopeName})`} sub="Discrepancy percentage by department / role" />
        
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Icon name="loader-2" className="w-6 h-6 animate-spin text-lime-400" />
            Calculating benchmark discrepancy scores...
          </div>
        ) : (
          <div className="min-w-[640px] mt-4">
            <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `160px repeat(${cols.length}, minmax(0, 1fr))` }}>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-2">Segment</div>
              {cols.map((c, i) => (
                <div key={i} className="text-xs font-medium text-slate-400 text-center truncate px-1" title={c}>
                  {c}
                </div>
              ))}
            </div>

            {rows.map((r, ri) => (
              <div key={ri} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `160px repeat(${cols.length}, minmax(0, 1fr))` }}>
                <div className="text-xs font-semibold text-slate-200 flex items-center truncate pl-2" title={r}>
                  {r}
                </div>
                {cols.map((_, vi) => {
                  const val = values[ri]?.[vi] ?? 0
                  return (
                    <div 
                      key={vi} 
                      className={`heat ${heatColor(100 - val)} rounded-lg h-11 flex items-center justify-center text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-sm`}
                      title={`${r} × ${cols[vi]}: ${val}% Gap`}
                    >
                      {val}%
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
