import React, { useEffect, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell
} from 'recharts'
import Icon from '../components/Icon.jsx'
import { Pill, SectionHead, StatCard, statusColor } from '../components/Bits.jsx'
import api from '../services/api.js'

const DEFAULT_ADMIN_DATA = {
  totalUsers: 1312,
  activeSessions: 214,
  uptime: '99.98%',
  pendingApprovals: 9,
  roleDist: [
    { name: 'Employee', value: 1148, color: '#65D46E' },
    { name: 'Manager', value: 112, color: '#818CF8' },
    { name: 'HR', value: 44, color: '#F59E0B' },
    { name: 'Admin', value: 8, color: '#3B82F6' }
  ],
  usage: [
    { month: 'Jan', value: 420 },
    { month: 'Feb', value: 460 },
    { month: 'Mar', value: 505 },
    { month: 'Apr', value: 540 },
    { month: 'May', value: 610 },
    { month: 'Jun', value: 650 },
    { month: 'Jul', value: 690 }
  ],
  users: [
    { name: 'Ava Chen', email: 'ava.chen@northwind.io', role: 'Senior Product Engineer', status: 'Active', last: '2h ago' },
    { name: 'Marcus Lee', email: 'marcus.lee@northwind.io', role: 'Manager', status: 'Active', last: '1d ago' },
    { name: 'Liam Harper', email: 'liam.harper@northwind.io', role: 'Software Engineer', status: 'Active', last: '3h ago' },
    { name: 'Chloe Adams', email: 'chloe.adams@northwind.io', role: 'Junior Developer', status: 'Active', last: '5h ago' },
    { name: 'Priya Nair', email: 'priya.nair@northwind.io', role: 'HR Operations Lead', status: 'Active', last: '40m ago' },
    { name: 'Noah Bennett', email: 'noah.b@northwind.io', role: 'Platform Administrator', status: 'Active', last: 'Just now' }
  ],
  roles: [
    { name: 'Admin', users: 8, perms: 'Full system access' },
    { name: 'HR', users: 44, perms: 'People, reports, org data' },
    { name: 'Manager', users: 112, perms: 'Team dashboards, approvals' },
    { name: 'Employee', users: 1148, perms: 'Self-service learning' }
  ],
  audit: [
    { actor: 'N. Bennett', action: 'Updated role permissions for "HR"', time: '10:42 AM' },
    { actor: 'System', action: 'Nightly skill-score recalculation completed', time: '03:00 AM' },
    { actor: 'P. Nair', action: 'Exported Q3 department report', time: 'Yesterday' },
    { actor: 'System', action: 'Flagged 3 accounts for inactivity', time: 'Yesterday' },
    { actor: 'N. Bennett', action: 'Suspended account ethan.reed@northwind.io', time: '2 days ago' }
  ]
}

export function AdminDashboard({ onNav, user }) {
  const [data, setData] = useState(DEFAULT_ADMIN_DATA)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    api.getAdminDashboard()
      .then(res => {
        if (isMounted && res) setData(prev => ({ ...prev, ...res }))
      })
      .catch(err => console.log('Using default Admin state:', err))
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Icon name="loader-2" className="w-8 h-8 text-blue-400 animate-spin" />
          <div className="text-sm text-slate-400">Loading Admin dashboard...</div>
        </div>
      </div>
    )
  }

  const d = data

  return (
    <div className="stagger space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F1A] via-[#0C1730] to-[#0B0F1A] p-6 sm:p-8">
        <div className="grad-blob w-64 h-64 bg-blue-500/25 -top-10 right-10"></div>
        <div className="relative z-10">
          <Pill text={<span className="inline-flex items-center gap-1.5"><Icon name="circle" className="w-2 h-2 fill-current" />All systems operational</span>} className="bg-blue-400/15 text-blue-300 mb-4" />
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back, {user?.name ? user.name.split(' ')[0] : 'there'} 👋</h1>
          <p className="text-slate-400 text-sm max-w-2xl">Platform uptime is {d.uptime} this month. {d.pendingApprovals} account approvals are waiting for your review.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => onNav('users')} className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-semibold text-sm rounded-xl px-5 py-2.5 flex items-center gap-2">
              <Icon name="user-check" className="w-4 h-4" /> Review approvals
            </button>
            <button onClick={() => onNav('audit')} className="bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-xl px-5 py-2.5 flex items-center gap-2">
              <Icon name="scroll-text" className="w-4 h-4" /> View audit log
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="users" label="Total Users" value={(d.totalUsers || 1312).toLocaleString()} delta="+18" positive tint="bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-300" />
        <StatCard icon="activity" label="Active Sessions" value={d.activeSessions || 214} delta="+12" positive tint="bg-lime-50 text-lime-600 dark:bg-lime-400/10 dark:text-lime-300" />
        <StatCard icon="server" label="System Uptime" value={d.uptime || '99.98%'} tint="bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300" />
        <StatCard icon="user-check" label="Pending Approvals" value={d.pendingApprovals || 9} delta="+3" positive={false} tint="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Platform Usage" sub="Daily active users, last 7 months" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={Array.isArray(d.usage) ? d.usage : DEFAULT_ADMIN_DATA.usage}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F622" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Role Distribution" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={Array.isArray(d.roleDist) ? d.roleDist : DEFAULT_ADMIN_DATA.roleDist} dataKey="value" innerRadius={55} outerRadius={78} paddingAngle={2}>
                  {(Array.isArray(d.roleDist) ? d.roleDist : DEFAULT_ADMIN_DATA.roleDist).map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {(Array.isArray(d.roleDist) ? d.roleDist : DEFAULT_ADMIN_DATA.roleDist).map((c, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ background: c.color }}></span>{c.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Recent Users" right={<button onClick={() => onNav('users')} className="text-xs font-medium text-indigo-600 dark:text-indigo-300 flex items-center gap-1">Manage all <Icon name="arrow-right" className="w-3 h-3" /></button>} />
          <div className="space-y-1">
            {(Array.isArray(d.users) ? d.users : DEFAULT_ADMIN_DATA.users).slice(0, 5).map((u, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-white/5 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">{(u.name || u.email || 'U').split(' ').map(n => n[0]).join('')}</div>
                  <div className="min-w-0"><div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{u.name}</div><div className="text-[11px] text-slate-400 truncate">{u.email}</div></div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Pill text={u.role} className="bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300" />
                  <Pill text={u.status} className={statusColor(u.status)} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Latest Audit Events" />
          <div className="space-y-4">
            {(Array.isArray(d.audit) ? d.audit : DEFAULT_ADMIN_DATA.audit).slice(0, 4).map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0"><Icon name="history" className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" /></div>
                <div className="min-w-0"><p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{a.action}</p><span className="text-[11px] text-slate-400">{a.actor} · {a.time}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadUsers = () => {
    setLoading(true)
    api.getAdminUsers()
      .then(res => {
        setUsers(res || [])
      })
      .catch(err => console.error("Error loading admin users:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleToggleStatus = async (id) => {
    try {
      await api.toggleUserStatus(id)
      loadUsers()
    } catch (err) {
      alert("Failed to update status: " + err.message)
    }
  }

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.updateUserRole(id, newRole)
      loadUsers()
    } catch (err) {
      alert("Failed to update role: " + err.message)
    }
  }

  if (loading) {
    return <div className="text-slate-400 text-sm">Loading users list...</div>
  }

  return (
    <div className="fade-in space-y-5">
      <SectionHead title="User Management" sub="Provision, edit, and deactivate platform accounts" />
      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-5 py-3">User</th>
              <th className="text-left font-medium px-5 py-3">Role</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
              <th className="text-left font-medium px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {users.map((u, i) => (
              <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">{(u.fullName || u.email || 'U').split(' ').map(n => n[0]).join('')}</div>
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200">{u.fullName}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <select value={u.systemRole} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-transparent border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 bg-[#0B0F1A]">
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="HR_SPECIALIST">HR SPECIALIST</option>
                    <option value="DEPARTMENT_HEAD">DEPARTMENT HEAD</option>
                    <option value="L_AND_D_ADMIN">L&D ADMIN</option>
                    <option value="SYSTEM_ADMIN">SYSTEM ADMIN</option>
                  </select>
                </td>
                <td className="px-5 py-3.5">
                  <Pill text={u.isActive ? "Active" : "Suspended"} className={u.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"} />
                </td>
                <td className="px-5 py-3.5">
                  <button onClick={() => handleToggleStatus(u.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      u.isActive ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
                    }`}>
                    {u.isActive ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminRoles() {
  const [roles, setRoles] = useState(DEFAULT_ADMIN_DATA.roles)

  useEffect(() => {
    api.getAdminDashboard()
      .then(res => {
        if (res && res.roles) setRoles(res.roles)
      })
      .catch(err => console.log('Using default admin roles:', err))
  }, [])

  const checksFor = (name) => name === 'Admin' ? 4 : name === 'HR' ? 3 : name === 'Manager' ? 2 : 1

  return (
    <div className="fade-in space-y-6">
      <SectionHead title="Roles & Permissions" sub="Manage what each role can see and do" />
      <div className="grid md:grid-cols-2 gap-5">
        {roles.map((r, ri) => (
          <div key={ri} className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-300 flex items-center justify-center"><Icon name="shield-check" className="w-5 h-5" /></div>
                <div><div className="font-display font-semibold text-slate-900 dark:text-white">{r.name}</div><div className="text-xs text-slate-400">{r.users} users</div></div>
              </div>
              <button className="text-xs font-medium border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-slate-600 dark:text-slate-300">Edit</button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{r.perms}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Read', 'Write', 'Export', 'Manage Users'].map((p, pi) => (
                <label key={pi} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <input type="checkbox" className="switch" defaultChecked={pi < checksFor(r.name)} readOnly /> {p}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdminAudit() {
  const [audit, setAudit] = useState(DEFAULT_ADMIN_DATA.audit)

  useEffect(() => {
    api.getAdminDashboard()
      .then(res => {
        if (res && res.audit) setAudit(res.audit)
      })
      .catch(err => console.log('Using default admin audit:', err))
  }, [])

  return (
    <div className="fade-in space-y-6">
      <SectionHead title="Audit Log" sub="Full trail of platform and admin activity" />
      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
        <div className="space-y-0">
          {audit.map((a, i) => (
            <div key={i} className={`flex gap-4 pb-5 relative ${i < audit.length - 1 ? 'border-l border-slate-200 dark:border-white/10 ml-3.5' : ''}`}>
              <div className="absolute -left-[7px] top-0 w-3.5 h-3.5 rounded-full bg-white dark:bg-[#0F1420] border-2 border-indigo-500"></div>
              <div className="pl-6">
                <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-medium text-slate-900 dark:text-white">{a.actor}</span> — {a.action}</p>
                <span className="text-[11px] text-slate-400">{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AdminSettings() {
  const initial = [
    { label: 'Two-factor authentication', desc: 'Require 2FA for all admin and HR accounts', on: true },
    { label: 'AI recommendation engine', desc: 'Enable AI-generated learning path suggestions', on: true },
    { label: 'Weekly digest emails', desc: 'Send workforce skill-gap summaries every Monday', on: true },
    { label: 'Public API access', desc: 'Allow third-party integrations via API keys', on: false },
    { label: 'Data retention (24 months)', desc: 'Auto-archive inactive account data', on: true }
  ]
  const [rows, setRows] = useState(initial)
  const [toast, setToast] = useState(null)

  function toggle(i) {
    const updated = rows.map((r, ri) => ri === i ? { ...r, on: !r.on } : r)
    setRows(updated)
    setToast(`Setting "${rows[i].label}" updated.`)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="fade-in space-y-6">
      <SectionHead title="System Settings" sub="Platform-wide configuration and security policies" />
      {toast && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2"><Icon name="check-circle" className="w-4 h-4" /> {toast}</span>
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}
      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl divide-y divide-slate-100 dark:divide-white/5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between p-5">
            <div><div className="text-sm font-medium text-slate-800 dark:text-slate-200">{r.label}</div><div className="text-xs text-slate-400 mt-0.5">{r.desc}</div></div>
            <input type="checkbox" className="switch" checked={r.on} onChange={() => toggle(i)} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdminSkills() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState('ALL')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState(null)

  // Form State
  const [name, setName] = useState('')
  const [categoryName, setCategoryName] = useState('Technical')
  const [description, setDescription] = useState('')

  const loadSkills = () => {
    setLoading(true)
    api.getSkills()
      .then(res => setSkills(res || []))
      .catch(err => console.error("Error loading skills:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSkills()
  }, [])

  const handleAddSkill = async (e) => {
    e.preventDefault()
    try {
      await api.createSkill({ name, categoryName, description })
      setShowAdd(false)
      setName('')
      setDescription('')
      setToast(`Skill "${name}" registered into organizational taxonomy!`)
      setTimeout(() => setToast(null), 3500)
      loadSkills()
    } catch (err) {
      alert("Failed to add skill: " + err.message)
    }
  }

  const handleDeleteSkill = async (id, skillName) => {
    if (!window.confirm(`Are you sure you want to remove "${skillName}" from the platform taxonomy?`)) return
    try {
      await api.deleteSkill(id)
      setSkills(prev => prev.filter(s => s.id !== id))
      setToast(`Skill "${skillName}" removed.`)
      setTimeout(() => setToast(null), 3500)
    } catch (err) {
      alert("Failed to delete skill: " + err.message)
    }
  }

  const categories = Array.from(new Set(skills.map(s => s.category ? s.category.name : 'General')))

  const filtered = skills.filter(s => {
    const cat = s.category ? s.category.name : 'General'
    const matchesCat = filterCat === 'ALL' || cat === filterCat
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
    return matchesCat && matchesSearch
  })

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHead
          title="Organization Skill Taxonomy Management"
          desc="Maintain global skill libraries, categories, and competency standards utilized across all departments."
        />
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] rounded-xl text-xs font-bold transition-colors shrink-0 shadow-xs"
        >
          <Icon name="plus" className="w-4 h-4" /> Add New Skill
        </button>
      </div>

      {toast && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2"><Icon name="check-circle" className="w-4 h-4" /> {toast}</span>
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCat('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterCat === 'ALL' ? 'bg-lime-400 text-[#0B0F1A]' : 'bg-white dark:bg-[#0F1420] text-slate-400 hover:text-white border border-slate-200/60 dark:border-white/5'
            }`}
          >
            All Categories ({skills.length})
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterCat === c ? 'bg-lime-400 text-[#0B0F1A]' : 'bg-white dark:bg-[#0F1420] text-slate-400 hover:text-white border border-slate-200/60 dark:border-white/5'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Icon name="search" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search skill catalog..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-lime-400"
          />
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Icon name="loader-2" className="w-5 h-5 animate-spin text-lime-400" />
            Loading organizational skill catalog...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">No skills match the current search filter.</div>
        ) : (
          filtered.map(s => (
            <div key={s.id} className="bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {s.category ? s.category.name : 'General'}
                  </span>
                  <button
                    onClick={() => handleDeleteSkill(s.id, s.name)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete skill"
                  >
                    <Icon name="trash" className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm">{s.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {s.description || 'Organizational core competency.'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Skill Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleAddSkill} className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Register New Platform Skill</h3>
              <button type="button" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Skill Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Kubernetes Cluster Orchestration"
                className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Category</label>
              <select
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400"
              >
                <option value="Technical">Technical</option>
                <option value="Marketing">Marketing</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Soft Skills">Soft Skills</option>
                <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                <option value="Security & Compliance">Security & Compliance</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description of required competency level..."
                className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Save Skill Standard
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
