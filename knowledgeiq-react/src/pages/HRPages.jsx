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
  totalEmployees: 1284,
  criticalGaps: 37,
  avgCompletion: 78,
  roi: '3.4x',
  departments: [
    { name: 'Engineering', headcount: 412, completion: 82, gap: 18 },
    { name: 'Product', headcount: 96, completion: 74, gap: 22 },
    { name: 'Sales', headcount: 210, completion: 65, gap: 35 },
    { name: 'Customer Success', headcount: 158, completion: 71, gap: 28 },
    { name: 'Design', headcount: 64, completion: 88, gap: 12 },
    { name: 'Data & Analytics', headcount: 88, completion: 69, gap: 31 }
  ],
  heatmap: {
    rows: ['Engineering', 'Product', 'Sales', 'Design', 'Data'],
    cols: ['Cloud', 'Security', 'AI / ML', 'Comm.', 'Leadership'],
    values: [
      [82, 60, 55, 70, 48],
      [65, 50, 42, 80, 66],
      [40, 35, 30, 85, 60],
      [70, 55, 45, 75, 58],
      [75, 58, 72, 62, 50]
    ]
  },
  alerts: [
    { title: 'Cloud proficiency critically low in Sales', sev: 'Critical', dept: 'Sales' },
    { title: 'AI/ML gap widening in Data & Analytics', sev: 'High', dept: 'Data & Analytics' },
    { title: 'Leadership readiness below target org-wide', sev: 'Medium', dept: 'All Depts' }
  ],
  certStatus: [
    { name: 'Active', value: 842, color: '#65D46E' },
    { name: 'Expiring', value: 96, color: '#F59E0B' },
    { name: 'Expired', value: 41, color: '#F43F5E' }
  ],
  directory: [
    { name: 'Ava Chen', dept: 'Engineering', role: 'Sr Product Engineer', score: 82, status: 'On Track' },
    { name: 'Liam Harper', dept: 'Engineering', role: 'Software Engineer', score: 68, status: 'At Risk' },
    { name: 'Chloe Adams', dept: 'Engineering', role: 'Junior Developer', score: 45, status: 'Needs Review' },
    { name: 'Sofia Ruiz', dept: 'Design', role: 'Product Designer', score: 91, status: 'On Track' },
    { name: 'Daniel Osei', dept: 'Data & Analytics', role: 'Data Analyst', score: 63, status: 'Needs Review' },
    { name: 'Grace Kim', dept: 'Customer Success', role: 'CS Manager', score: 76, status: 'On Track' },
    { name: 'Ravi Shah', dept: 'Product', role: 'PM II', score: 58, status: 'At Risk' }
  ],
  training: [
    { month: 'Jan', value: 72 },
    { month: 'Feb', value: 75 },
    { month: 'Mar', value: 74 },
    { month: 'Apr', value: 78 },
    { month: 'May', value: 80 },
    { month: 'Jun', value: 78 },
    { month: 'Jul', value: 82 }
  ],
  severityMix: [
    { name: 'Critical', value: 37, color: '#F43F5E' },
    { name: 'High', value: 64, color: '#F59E0B' },
    { name: 'Medium', value: 120, color: '#818CF8' },
    { name: 'Low', value: 210, color: '#65D46E' }
  ]
}

export function HRDashboard({ onNav, user }) {
  const [data, setData] = useState(DEFAULT_HR_DATA)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    api.getHrDashboard()
      .then(res => {
        if (isMounted && res) setData(prev => ({ ...prev, ...res }))
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

  return (
    <div className="stagger space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F1A] via-[#141433] to-[#0B0F1A] p-6 sm:p-8">
        <div className="grad-blob w-64 h-64 bg-indigo-500/25 -top-10 right-10"></div>
        <div className="relative z-10">
          <Pill text={<span className="inline-flex items-center gap-1.5"><Icon name="circle" className="w-2 h-2 fill-current" />Org Pulse: Healthy</span>} className="bg-indigo-400/15 text-indigo-300 mb-4" />
          <h1 className="font-display text-3xl font-bold text-white mb-2">Good morning, {user?.name ? user.name.split(' ')[0] : 'there'} 👋</h1>
          <p className="text-slate-400 text-sm max-w-2xl">{d.criticalGaps} critical skill gaps flagged across the org this week. Sales and Data & Analytics need attention first.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => onNav('gaps')} className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-semibold text-sm rounded-xl px-5 py-2.5 flex items-center gap-2">
              <Icon name="flame" className="w-4 h-4" /> View critical gaps
            </button>
            <button onClick={() => onNav('reports')} className="bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-xl px-5 py-2.5 flex items-center gap-2">
              <Icon name="download" className="w-4 h-4" /> Export report
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="users" label="Total Employees" value={(d.totalEmployees || 1284).toLocaleString()} delta="+24" positive tint="bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-300" />
        <StatCard icon="alert-triangle" label="Critical Gaps" value={d.criticalGaps || 37} delta="+5" positive={false} tint="bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300" />
        <StatCard icon="trending-up" label="Avg Completion" value={`${d.avgCompletion || 78}%`} delta="+3" positive tint="bg-lime-50 text-lime-600 dark:bg-lime-400/10 dark:text-lime-300" />
        <StatCard icon="coins" label="Learning ROI" value={d.roi || '3.4x'} delta="+0.4" positive tint="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Training Completion Rate" sub="Org-wide, last 7 months" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Array.isArray(d.training) ? d.training : DEFAULT_HR_DATA.training}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Certification Status" />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={Array.isArray(d.certStatus) ? d.certStatus : DEFAULT_HR_DATA.certStatus} dataKey="value" innerRadius={55} outerRadius={78} paddingAngle={2}>
                  {(Array.isArray(d.certStatus) ? d.certStatus : DEFAULT_HR_DATA.certStatus).map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            {(Array.isArray(d.certStatus) ? d.certStatus : DEFAULT_HR_DATA.certStatus).map((c, i) => (
              <div key={i}><div className="text-lg font-bold font-display" style={{ color: c.color }}>{c.value}</div><div className="text-[11px] text-slate-400">{c.name}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Department Performance" />
          <div className="space-y-4">
            {(Array.isArray(d.departments) ? d.departments : DEFAULT_HR_DATA.departments).map((dep, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-32 shrink-0 text-sm font-medium text-slate-700 dark:text-slate-300">{dep.name}</div>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${dep.completion}%` }}></div></div>
                <div className="w-12 text-right text-sm text-slate-500 dark:text-slate-400">{dep.completion}%</div>
                <div className="w-20 text-right"><Pill text={`${dep.gap}% gap`} className={dep.gap > 30 ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300'} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Critical Skill Gap Alerts" />
          <div className="space-y-3">
            {(Array.isArray(d.alerts) ? d.alerts : DEFAULT_HR_DATA.alerts).map((a, i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-1.5"><Pill text={a.sev || 'High'} className={sevColor(a.sev || 'High')} /><span className="text-[11px] text-slate-400">{a.dept || 'Engineering'}</span></div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{a.title || a.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function HRDirectory() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
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

  const filteredUsers = users.filter(u => 
    (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.dept || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.roleTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fade-in space-y-5">
      <SectionHead 
        title="Workforce User Management" 
        sub="Search employee profiles, update organizational roles, or suspend/activate accounts"
      />

      {toast && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${toast.type === 'error' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-lime-400/10 text-lime-300 border border-lime-400/20'} fade-in`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 flex-1 min-w-[220px]">
          <Icon name="search" className="w-4 h-4 text-slate-400" />
          <input 
            placeholder="Search directory by name, email, department, or role..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 dark:text-white" 
          />
        </div>
      </div>

      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Icon name="loader-2" className="w-4 h-4 animate-spin text-lime-400" />
            Loading workforce directory...
          </div>
        ) : filteredUsers.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-5 py-3">Employee</th>
                <th className="text-left font-medium px-5 py-3">Department</th>
                <th className="text-left font-medium px-5 py-3">Role / Title</th>
                <th className="text-left font-medium px-5 py-3">System Access</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-right font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredUsers.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                        {(e.fullName || 'E').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">{e.fullName}</div>
                        <div className="text-xs text-slate-400">{e.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{e.dept}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{e.roleTitle}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                    <Pill text={e.systemRole} className="bg-[#818cf8]/10 text-[#818cf8]" />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${e.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${e.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      {e.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenEdit(e)}
                      className="text-xs text-slate-300 hover:text-white bg-white/5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-all border border-white/5"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(e.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all ${e.isActive ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'}`}
                    >
                      {e.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
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

export function HRMatrix() {
  const [heatmap, setHeatmap] = useState(DEFAULT_HR_DATA.heatmap)

  useEffect(() => {
    api.getHrDashboard()
      .then(res => {
        if (res && res.heatmap) setHeatmap(res.heatmap)
      })
      .catch(err => console.log('Using default heatmap:', err))
  }, [])

  const h = heatmap

  return (
    <div className="fade-in space-y-6">
      <SectionHead title="Organization Skill Matrix" sub="Average proficiency by department × skill area" />
      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `140px repeat(${h.cols.length}, 1fr)` }}>
            <div></div>
            {h.cols.map((c, i) => <div key={i} className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center">{c}</div>)}
          </div>
          {h.rows.map((r, ri) => (
            <div key={ri} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `140px repeat(${h.cols.length}, 1fr)` }}>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">{r}</div>
              {h.values[ri].map((v, vi) => (
                <div key={vi} className={`heat ${heatColor(v)} rounded-lg h-12 flex items-center justify-center text-xs font-semibold cursor-default`}>{v}%</div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-slate-400 flex-wrap">
          <span className="flex items-center gap-1.5"><Icon name="square" className="w-3 h-3 fill-rose-500 text-rose-500" /> Critical</span>
          <span className="flex items-center gap-1.5"><Icon name="square" className="w-3 h-3 fill-orange-400 text-orange-400" /> Low</span>
          <span className="flex items-center gap-1.5"><Icon name="square" className="w-3 h-3 fill-amber-300 text-amber-300" /> Moderate</span>
          <span className="flex items-center gap-1.5"><Icon name="square" className="w-3 h-3 fill-lime-400 text-lime-400" /> Strong</span>
        </div>
      </div>
    </div>
  )
}

export function HRReports() {
  const [data, setData] = useState(DEFAULT_HR_DATA)

  useEffect(() => {
    api.getHrDashboard()
      .then(res => {
        if (res) setData(prev => ({ ...prev, ...res }))
      })
      .catch(err => console.log('Using default HR reports:', err))
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
      <SectionHead title="Reports & Analytics" sub="Org-wide analytics, exportable in one click"
        right={
          <div className="flex gap-2">
            <button onClick={handleExportGaps} className="flex items-center gap-1.5 text-xs font-semibold border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-600 dark:text-slate-300"><Icon name="file-text" className="w-3.5 h-3.5" /> Export Gaps CSV</button>
            <button onClick={handleExportTraining} className="flex items-center gap-1.5 text-xs font-semibold bg-[#0B0F1A] text-white rounded-xl px-3.5 py-2.5"><Icon name="file-spreadsheet" className="w-3.5 h-3.5" /> Export Training CSV</button>
          </div>
        } />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Completion by Department" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.departments || []} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(100,116,139,0.15)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip />
                <Bar dataKey="completion" fill="#6366F1" radius={[0, 8, 8, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Gap Severity Mix" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={d.severityMix || []} dataKey="value" outerRadius={90} label={({ name }) => name}>
                  {(d.severityMix || []).map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
        <SectionHead title="Training Trend" />
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={d.training || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.15)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#65D46E" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export function HRForecasting() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  const forecastSkills = data?.forecastSkills || []
  const demandIndex = data?.demandIndex || []
  const velocity = data?.learningVelocity || 72

  return (
    <div className="stagger space-y-6">
      <SectionHead 
        title="Strategic Workforce Skill Forecasting" 
        sub="Forecast resource deficits, demand velocity, and target key L&D capability improvements" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-[#0F1420] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Icon name="trending-up" className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-xs font-semibold text-slate-400">Overall Learning Velocity</span>
          </div>
          <div className="text-3xl font-display font-bold text-white">{velocity}%</div>
          <p className="text-[11px] text-slate-400 mt-2">Percentage of skill gaps being successfully resolved on schedule this quarter.</p>
        </div>

        <div className="card bg-[#0F1420] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Icon name="sparkles" className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-slate-400">Projected Skill Coverage</span>
          </div>
          <div className="text-3xl font-display font-bold text-white">91.4%</div>
          <p className="text-[11px] text-slate-400 mt-2">Estimated workforce competency health score in the next 6 months.</p>
        </div>

        <div className="card bg-[#0F1420] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-lime-400/15 flex items-center justify-center">
              <Icon name="coins" className="w-5 h-5 text-lime-300" />
            </div>
            <span className="text-xs font-semibold text-slate-400">Budget Effectiveness</span>
          </div>
          <div className="text-3xl font-display font-bold text-white">4.2x ROI</div>
          <p className="text-[11px] text-slate-400 mt-2">Projected performance increase multiplier based on strategic skill alignment.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card bg-[#0F1420] border border-white/5 rounded-2xl p-5 sm:p-6 text-left">
          <SectionHead title="Top Projected Skill Deficits" sub="Based on direct gaps vs target organizational benchmarks" />
          <div className="space-y-5 mt-4">
            {forecastSkills.map((s, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-200">{s.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${s.trend.includes('Increasing') ? 'bg-rose-500/15 text-rose-300' : 'bg-white/10 text-slate-400'}`}>
                      {s.trend}
                    </span>
                    <span className="text-slate-400">{s.deficitScore}% Deficit</span>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.deficitScore > 60 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${s.deficitScore}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{s.criticalGaps} Critical shortages</span>
                  <span>Demand score: {s.demandScore}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-[#0F1420] border border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Skill Demand vs. Supply" sub="Quarterly trend forecast" />
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demandIndex}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" name="Demand Index" dataKey="demand" stroke="#F43F5E" strokeWidth={2.5} dot={true} />
                <Line type="monotone" name="Supply Cap" dataKey="supply" stroke="#65D46E" strokeWidth={2.5} dot={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card bg-[#0F1420] border border-white/5 rounded-2xl p-5 sm:p-6 text-left">
        <SectionHead title="HR Strategic Interventions Plan" sub="Automated strategic actions generated by KnowledgeIQ Advisor" />
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Icon name="sparkles" className="w-4 h-4" /> Cloud & Architect Deficit Action
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              We forecast a shortage of <strong>AWS Cloud Architecture</strong> capacity in Engineering. Action required: Auto-assign the <em>"Advanced AWS Cloud Solutions Architect"</em> learning path to 3 junior-to-mid engineering employees this week.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Icon name="graduation-cap" className="w-4 h-4" /> Microservice Security Upskilling
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cybersecurity & OAuth2 has the widest critical deficit. We recommend funding a cohort for the <em>"Enterprise Spring Boot Microservices Security"</em> external learning track to raise compliance metrics to 95%.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HRDepartments() {
  const [depts, setDepts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  
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

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHead 
          title="Organization Department Administration" 
          sub="Overview of workforce size, headcounts, active manager assignments, and critical capability metrics" 
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

      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Icon name="loader-2" className="w-4 h-4 animate-spin text-lime-400" />
            Loading departments metrics...
          </div>
        ) : depts.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-5 py-3">Department Name</th>
                <th className="text-left font-medium px-5 py-3">Assigned Manager</th>
                <th className="text-left font-medium px-5 py-3">Headcount</th>
                <th className="text-left font-medium px-5 py-3">Completion Rate</th>
                <th className="text-left font-medium px-5 py-3">Critical Deficits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {depts.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <div className="font-semibold text-slate-850 dark:text-slate-200 text-left">{d.name}</div>
                      <div className="text-xs text-slate-400 text-left">{d.description || 'No description provided'}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-left">
                    <span className="font-medium text-slate-600 dark:text-slate-300">{d.managerName}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-left">{d.headcount} employees</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${d.completion}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{d.completion}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-left">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${d.gap > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {d.gap} deficits
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            No departments found. Create one to get started!
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

  const scopeName = heatmapData?.scopeName || 'Knowledge Gaps'
  const scope = heatmapData?.scope || 'PERSONAL'
  const rows = heatmapData?.rows || []
  const cols = heatmapData?.cols || []
  const values = heatmapData?.values || []
  const alerts = heatmapData?.alerts || []

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

  // Filter alerts by severity if filter active
  const filteredAlerts = alerts.filter(a => {
    if (filter === 'All') return true
    if (filter === 'Critical Only') return a.sev === 'Critical'
    return a.sev === filter
  })

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHead 
          title="Knowledge Gap Analysis" 
          sub={`Dynamic gap calculations for ${scopeName}`} 
        />
        <div className="flex items-center gap-3.5 self-start sm:self-auto">
          {scope === 'PERSONAL' && (
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-4 py-2.5 transition-all flex items-center gap-2 shadow-md shrink-0 disabled:opacity-75"
            >
              {recalculating ? (
                <>
                  <Icon name="loader-2" className="w-4.5 h-4.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Icon name="refresh-cw" className="w-4 h-4" />
                  <span>Generate Gap Analysis</span>
                </>
              )}
            </button>
          )}
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

      {/* Dynamic Calculated Alerts */}
      <div className="grid md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Icon name="loader-2" className="w-4 h-4 animate-spin text-lime-400" />
            Analyzing real-time skill gaps...
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((a, i) => (
            <div key={i} className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5">
              <Pill text={a.sev} className={sevColor(a.sev)} />
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-3 leading-snug">{a.title}</p>
              <p className="text-xs text-slate-400 mt-1">{a.dept}</p>
              <div className="mt-3 p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs flex gap-2 items-start">
                <Icon name="sparkles" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{a.recommendation || 'AI recommends targeted learning module.'}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 text-center text-slate-400 text-xs">
            No gaps matching the "{filter}" filter criteria.
          </div>
        )}
      </div>

      {/* Dynamic Heatmap Matrix */}
      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <SectionHead title={`Gap Heatmap (${scopeName})`} />
        </div>
        
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Icon name="loader-2" className="w-6 h-6 animate-spin text-lime-400" />
            Calculating database skill benchmarks & gaps...
          </div>
        ) : rows.length === 0 || cols.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Icon name="alert-circle" className="w-8 h-8 text-slate-500 mb-1" />
            <span className="font-semibold text-slate-300">Knowledge gap analysis is not available yet.</span>
            <span className="max-w-md">Complete your skill assessment or add employee skills to generate your team's real-time gap heatmap.</span>
          </div>
        ) : (
          <div className="min-w-[560px]">
            {/* Header Column Titles */}
            <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `160px repeat(${cols.length}, minmax(0, 1fr))` }}>
              <div />
              {cols.map((c, i) => (
                <div key={i} className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center truncate px-1" title={c}>
                  {c}
                </div>
              ))}
            </div>

            {/* Matrix Data Rows */}
            {rows.map((r, ri) => (
              <div key={ri} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `160px repeat(${cols.length}, minmax(0, 1fr))` }}>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center truncate pr-2" title={r}>
                  {r}
                </div>
                {cols.map((_, vi) => {
                  const val = values[ri] && values[ri][vi] !== undefined ? values[ri][vi] : 0
                  return (
                    <div 
                      key={vi} 
                      className={`heat ${heatColor(100 - val)} rounded-lg h-11 flex items-center justify-center text-xs font-bold transition-transform hover:scale-105 cursor-pointer`}
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
