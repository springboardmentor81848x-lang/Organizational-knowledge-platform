import React, { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
  LineChart, Line
} from 'recharts'
import Icon from '../components/Icon.jsx'
import { Pill, SectionHead, StatCard } from '../components/Bits.jsx'
import api from '../services/api.js'

export function LdAdminDashboard({ onNav, user }) {
  const [data, setData] = useState(null)
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
    let active = true
    Promise.all([
      api.getLdDashboard(),
      api.getHrUsers().catch(() => [])
    ])
      .then(([res, usersRes]) => {
        if (active) {
          if (res) setData(res)
          if (Array.isArray(usersRes)) {
            const emps = usersRes.filter(u => u.systemRole === 'EMPLOYEE' || u.systemRole === 'User')
            setEmployees(emps)
          }
        }
      })
      .catch(err => console.error("L&D dashboard load error:", err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Icon name="loader-2" className="w-8 h-8 text-lime-400 animate-spin" />
          <div className="text-sm text-slate-400">Loading L&D Admin Center...</div>
        </div>
      </div>
    )
  }

  const d = data || {
    totalCourses: 0,
    pendingCertifications: 0,
    totalEnrollments: 0,
    completedEnrollments: 0,
    completionRate: 0,
    trends: []
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F1A] via-[#161226] to-[#0B0F1A] p-6 sm:p-8">
        <div className="grad-blob w-64 h-64 bg-violet-500/20 -top-10 right-10"></div>
        <div className="relative z-10">
          <Pill text={<span className="inline-flex items-center gap-1.5"><Icon name="circle" className="w-2 h-2 fill-current" />Learning & Development Headquarters</span>} className="bg-violet-400/15 text-violet-300 mb-4" />
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome, {user?.name ? user.name.split(' ')[0] : 'L&D Admin'} 👋</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Oversee training courses, build adaptive learning paths, verify employee credentials, and track organizational learning adoption.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => onNav('catalog')} className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-semibold text-sm rounded-xl px-5 py-2.5 flex items-center gap-2 transition-colors">
              <Icon name="graduation-cap" className="w-4 h-4" /> Course Catalog
            </button>
            <button onClick={() => onNav('paths')} className="bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-xl px-5 py-2.5 flex items-center gap-2 transition-colors">
              <Icon name="map" className="w-4 h-4" /> Path Builder
            </button>
            <button onClick={() => onNav('certs')} className="bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-xl px-5 py-2.5 flex items-center gap-2 transition-colors">
              <Icon name="award" className="w-4 h-4 text-amber-400" /> Verify Credentials ({d.pendingCertifications})
            </button>
            <button onClick={() => onNav('mentors')} className="bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-xl px-5 py-2.5 flex items-center gap-2 transition-colors border border-purple-400/30">
              <Icon name="users" className="w-4 h-4 text-purple-400" /> Mentor Management
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Courses" value={d.totalCourses} icon="graduation-cap" color="lime" onClick={() => onNav('catalog')} />
        <StatCard title="Certifications Pending" value={d.pendingCertifications} icon="award" color="amber" onClick={() => onNav('certs')} />
        <StatCard title="Total Enrollments" value={d.totalEnrollments} icon="users" color="indigo" />
        <StatCard title="Avg. Completion Rate" value={`${d.completionRate}%`} icon="trending-up" color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Enrollment Engagement Trend" sub="Active learning velocity over past quarters" />
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid #334155' }} />
                <Line type="monotone" dataKey="value" stroke="#A3E635" strokeWidth={2.5} dot={{ fill: '#A3E635', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base mb-1">L&D Management Center</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">Direct shortcuts to coordinate capability enablement.</p>
            <div className="space-y-2.5">
              <button onClick={() => onNav('catalog')} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-semibold transition-colors text-left border border-slate-200/60 dark:border-white/5">
                <span className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-lime-400/10 text-lime-600 dark:text-lime-400 flex items-center justify-center">
                    <Icon name="plus" className="w-3.5 h-3.5" />
                  </div>
                  <span>Add / Edit Course Catalog</span>
                </span>
                <Icon name="chevron-right" className="w-4 h-4 text-slate-400" />
              </button>
              <button onClick={() => onNav('paths')} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-semibold transition-colors text-left border border-slate-200/60 dark:border-white/5">
                <span className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Icon name="map" className="w-3.5 h-3.5" />
                  </div>
                  <span>Adaptive Learning Path Builder</span>
                </span>
                <Icon name="chevron-right" className="w-4 h-4 text-slate-400" />
              </button>
              <button onClick={() => onNav('certs')} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-semibold transition-colors text-left border border-slate-200/60 dark:border-white/5">
                <span className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Icon name="award" className="w-3.5 h-3.5" />
                  </div>
                  <span>Verify Uploaded Credentials</span>
                </span>
                <Icon name="chevron-right" className="w-4 h-4 text-slate-400" />
              </button>
              <button onClick={() => onNav('mentors')} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-semibold transition-colors text-left border border-slate-200/60 dark:border-white/5">
                <span className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-400/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Icon name="users" className="w-3.5 h-3.5" />
                  </div>
                  <span>Mentor Management</span>
                </span>
                <Icon name="chevron-right" className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── ESCALATION & WORKFORCE COMMUNICATIONS CARD ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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

        {/* Connect with Support Escalations */}
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 space-y-3">
          <SectionHead title="Support & Management Escalations" sub="Sync with department heads, managers and human resources" />
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

            {/* HR Specialist Vijay */}
            <div className="p-3 bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  VJ
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-display">Vijay</div>
                  <div className="text-[10px] text-slate-400 truncate">HR Specialist</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenConnectModal('Vijay (HR Specialist)', 'hr@northwind.io')}
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
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-display">Krrish</div>
                  <div className="text-[10px] text-slate-400 truncate font-display">Engineering Department Head</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenConnectModal('Krrish (Engineering Department Head)', 'depthead@northwind.io')}
                className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <Icon name="message-square" className="w-3.5 h-3.5" /> Connect
              </button>
            </div>

            {/* Department Head Strange */}
            <div className="p-3 bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  ST
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-display">Stephen Strange</div>
                  <div className="text-[10px] text-slate-400 truncate font-display">Marketing Department Head</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenConnectModal('Stephen Strange (Marketing Department Head)', 'strange@northwind.io')}
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

export function LdAdminCatalog() {
  const [courses, setCourses] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [provider, setProvider] = useState('Internal Academy')
  const [courseUrl, setCourseUrl] = useState('')
  const [durationHours, setDurationHours] = useState(8)
  const [targetSkillId, setTargetSkillId] = useState('')
  const [targetLevel, setTargetLevel] = useState(3)

  const loadData = () => {
    setLoading(true)
    Promise.all([api.getCourses(), api.getSkills()])
      .then(([cRes, sRes]) => {
        setCourses(cRes || [])
        setSkills(sRes || [])
      })
      .catch(err => console.error("Error loading L&D catalog:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { title, description, provider, courseUrl, durationHours, targetSkillId, targetLevel }
    try {
      if (editingCourse) {
        await api.updateCourse(editingCourse.id, payload)
      } else {
        await api.createCourse(payload)
      }
      setShowForm(false)
      setEditingCourse(null)
      setTitle('')
      setDescription('')
      setCourseUrl('')
      setDurationHours(8)
      loadData()
    } catch (err) {
      alert("Failed to save course: " + err.message)
    }
  }

  const handleEdit = (c) => {
    setEditingCourse(c)
    setTitle(c.title || '')
    setDescription(c.description || '')
    setProvider(c.provider || 'Internal Academy')
    setCourseUrl(c.courseUrl || '')
    setDurationHours(c.durationHours || 8)
    setTargetSkillId(c.targetSkill ? c.targetSkill.id : '')
    setTargetLevel(c.targetLevel || 3)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course from the catalog?")) return
    try {
      await api.deleteCourse(id)
      loadData()
    } catch (err) {
      alert("Failed to delete course: " + err.message)
    }
  }

  if (loading) {
    return <div className="text-slate-400 text-sm py-8">Loading Course Catalog...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHead title="Training Catalog Manager" desc="Create, edit, and link courses targeting core organization skill proficiencies." />
        <button onClick={() => { setEditingCourse(null); setShowForm(!showForm) }} className="flex items-center gap-2 px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] rounded-xl text-xs font-bold transition-colors shrink-0 shadow-xs">
          <Icon name={showForm ? 'chevron-left' : 'plus'} className="w-4 h-4" /> {showForm ? 'Back to Catalog' : 'Register New Course'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="max-w-2xl bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/10 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">{editingCourse ? 'Edit Course Details' : 'Register New Course Listing'}</h3>
          
          <div className="space-y-1">
            <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Course Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Advanced React 18 Patterns & State" className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400" />
          </div>

          <div className="space-y-1">
            <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="e.g. Master state management, component architecture, and render optimization techniques." rows={3} className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Provider / Source</label>
              <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Internal Academy / Coursera / Udemy" className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400" />
            </div>
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Estimated Duration (Hours)</label>
              <input type="number" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Target Skill Alignment</label>
              <select value={targetSkillId} onChange={(e) => setTargetSkillId(e.target.value)} required className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400">
                <option value="">Select Target Skill</option>
                {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Target Proficiency Level (1-5)</label>
              <select value={targetLevel} onChange={(e) => setTargetLevel(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400">
                <option value="1">1 - Basic</option>
                <option value="2">2 - Developing</option>
                <option value="3">3 - Intermediate</option>
                <option value="4">4 - Advanced</option>
                <option value="5">5 - Expert</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Course Resource URL</label>
            <input type="text" value={courseUrl} onChange={(e) => setCourseUrl(e.target.value)} placeholder="https://internal.learning.path/course-name" className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400" />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] rounded-xl text-xs font-bold transition-colors">
              {editingCourse ? 'Save Changes' : 'Create Course Listing'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(c => (
            <div key={c.id} className="bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm">{c.title}</h4>
                  <Pill label={c.provider || 'Internal Academy'} color="lime" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 mb-3 leading-relaxed">{c.description}</p>
                
                {c.targetSkill && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 dark:text-slate-400">
                    <Icon name="layers" className="w-3.5 h-3.5 text-lime-500 dark:text-lime-400" />
                    <span>Target: <strong className="text-slate-800 dark:text-slate-200">{c.targetSkill.name}</strong> (Level {c.targetLevel || 3})</span>
                  </div>
                )}
                {c.durationHours && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Icon name="clock" className="w-3.5 h-3.5" />
                    <span>{c.durationHours} Hours Duration</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-white/5 pt-3 mt-4">
                <button onClick={() => handleEdit(c)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5">
                  <Icon name="pencil" className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5">
                  <Icon name="trash" className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function LdAdminPaths() {
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBuilder, setShowBuilder] = useState(false)
  const [toast, setToast] = useState(null)

  // Form builder state
  const [title, setTitle] = useState('')
  const [targetSkill, setTargetSkill] = useState('Java Spring Boot')
  const [targetRole, setTargetRole] = useState('Senior Product Engineer')
  const [difficulty, setDifficulty] = useState('Advanced')
  const [durationHours, setDurationHours] = useState(30)
  const [milestonesStr, setMilestonesStr] = useState('Foundational Principles\nApplied Architectural Design\nProduction Deployment & Security')
  const [availableSkills, setAvailableSkills] = useState([])

  const loadPaths = () => {
    setLoading(true)
    Promise.all([api.getLdPaths(), api.getSkills()])
      .then(([pRes, sRes]) => {
        setPaths(pRes || [])
        setAvailableSkills(sRes || [])
      })
      .catch(err => console.error("Error loading learning paths:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPaths()
  }, [])

  const handleCreatePath = async (e) => {
    e.preventDefault()
    const milestones = milestonesStr.split('\n').map(s => s.trim()).filter(Boolean)
    const payload = {
      title,
      targetSkill,
      targetRole,
      difficulty,
      durationHours: parseInt(durationHours) || 24,
      milestones
    }
    try {
      await api.createLdPath(payload)
      setShowBuilder(false)
      setTitle('')
      setToast(`Learning Path "${title}" published and activated for role gap closure!`)
      setTimeout(() => setToast(null), 3500)
      loadPaths()
    } catch (err) {
      alert("Failed to create learning path: " + err.message)
    }
  }

  const handleDeletePath = async (id) => {
    if (!window.confirm("Are you sure you want to remove this learning path?")) return
    try {
      await api.deleteLdPath(id)
      setPaths(prev => prev.filter(p => p.id !== id))
      setToast("Learning path removed.")
      setTimeout(() => setToast(null), 3500)
    } catch (err) {
      alert("Failed to delete path: " + err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHead
          title="Adaptive Learning Path Builder"
          desc="Construct structured, multi-milestone training paths automatically mapped to close critical capability shortages."
        />
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="flex items-center gap-2 px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] rounded-xl text-xs font-bold transition-colors shrink-0 shadow-xs"
        >
          <Icon name={showBuilder ? 'chevron-left' : 'plus'} className="w-4 h-4" />
          {showBuilder ? 'Back to Path Catalog' : 'Build Learning Path'}
        </button>
      </div>

      {toast && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2"><Icon name="check-circle" className="w-4 h-4" /> {toast}</span>
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {showBuilder ? (
        <form onSubmit={handleCreatePath} className="max-w-2xl bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/10 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Architect New Adaptive Learning Path</h3>

          <div className="space-y-1">
            <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Path Program Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Advanced Spring Boot 3 Security & Resilience Architecture"
              className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Focus Competency Skill</label>
              <select
                value={targetSkill}
                onChange={e => setTargetSkill(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400"
              >
                {availableSkills.map(s => <option key={s.id || s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Target Department Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="Senior Product Engineer"
                className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400"
              >
                <option value="Beginner">Beginner (Levels 1-2)</option>
                <option value="Intermediate">Intermediate (Level 3)</option>
                <option value="Advanced">Advanced (Levels 4-5)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Estimated Total Hours</label>
              <input
                type="number"
                value={durationHours}
                onChange={e => setDurationHours(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Sequenced Milestones (1 per line)</label>
            <textarea
              rows={3}
              value={milestonesStr}
              onChange={e => setMilestonesStr(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setShowBuilder(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Publish Adaptive Path
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paths.map(p => {
            // Helper function to scan localStorage
            const getRealAssignments = () => {
              const assignments = []
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith('assigned_courses_')) {
                  const email = key.replace('assigned_courses_', '')
                  try {
                    const list = JSON.parse(localStorage.getItem(key) || '[]')
                    list.forEach(item => {
                      assignments.push({
                        ...item,
                        employeeEmail: email
                      })
                    })
                  } catch (e) {
                    console.error(e)
                  }
                }
              }
              return assignments
            }

            const getEmployeeName = (email) => {
              const names = {
                'employee@northwind.io': 'Ava Chen',
                'swe@northwind.io': 'Liam Harper',
                'juniordev@northwind.io': 'Chloe Adams',
                'jordan.taylor@knowledgeiq.com': 'Jordan Taylor',
                'ravi.shah@knowledgeiq.com': 'Ravi Shah',
                'grace.kim@knowledgeiq.com': 'Grace Kim',
                'sofia.ruiz@knowledgeiq.com': 'Sofia Ruiz',
                'daniel.osei@knowledgeiq.com': 'Daniel Osei',
                'aliya@gmail.com': 'Aliya'
              }
              return names[email] || email
            }

            const getPathStats = (pathTitle) => {
              const assignments = getRealAssignments()
              const matched = assignments.filter(a =>
                a.title.toLowerCase().trim().replace(/[^a-z0-9]/g, '') === pathTitle.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
              )
              const employeeCount = matched.length
              let milestonesCleared = 0
              const employees = []
              matched.forEach(asg => {
                let cleared = 0
                if (asg.status === 'COMPLETED') {
                  cleared = 3
                } else if (asg.status === 'IN_PROGRESS') {
                  cleared = 1
                }
                milestonesCleared += cleared
                employees.push({
                  name: getEmployeeName(asg.employeeEmail),
                  status: asg.status,
                  cleared
                })
              })
              return { employeeCount, milestonesCleared, employees }
            }

            const stats = getPathStats(p.title)

            return (
              <div key={p.id} className="bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-xs relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      p.difficulty === 'Advanced' ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20' :
                      p.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20'
                    }`}>
                      {p.difficulty}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Icon name="clock" className="w-3 h-3" /> {p.durationHours || 24}h
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm leading-snug">{p.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-lime-600 dark:text-lime-400 font-medium">
                      <Icon name="layers" className="w-3.5 h-3.5" />
                      <span>Skill: <strong>{p.targetSkill}</strong></span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Role: {p.targetRole || 'Engineering'}</div>
                  </div>

                  {p.milestones && p.milestones.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Milestone Sequence</div>
                      {p.milestones.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 text-[10px] font-bold flex items-center justify-center text-slate-500 shrink-0">{i + 1}</span>
                          <span className="truncate">{m}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3 mt-4 text-xs relative group">
                  <span className="text-slate-500 dark:text-slate-400 border-b border-dashed border-slate-300 dark:border-white/20 cursor-help pb-0.5">
                    {stats.employeeCount} active enrollment{stats.employeeCount !== 1 ? 's' : ''}
                  </span>

                  {/* Tooltip Popup on Mouse Over */}
                  <div className="absolute bottom-full mb-2 left-0 hidden group-hover:block z-50 w-64 bg-[#0B0F1A] border border-slate-700/60 dark:border-white/15 rounded-xl p-3.5 shadow-2xl text-left pointer-events-none fade-in">
                    <div className="font-display font-bold text-white text-[11px] mb-2 flex items-center gap-1.5 border-b border-white/10 pb-1.5">
                      <Icon name="info" className="w-3.5 h-3.5 text-lime-400" />
                      Real-Time Assignment Stats
                    </div>
                    <div className="space-y-1.5 text-[10px] text-slate-300">
                      <div>Assigned Employees: <strong className="text-white">{stats.employeeCount}</strong></div>
                      <div>Total Milestones Cleared: <strong className="text-lime-400">{stats.milestonesCleared}</strong></div>
                      {stats.employees.length > 0 && (
                        <div className="mt-2 border-t border-white/5 pt-2 space-y-1">
                          {stats.employees.map((emp, index) => (
                            <div key={index} className="flex justify-between items-center text-[9px] text-slate-400">
                              <span>• {emp.name}</span>
                              <span className={emp.status === 'COMPLETED' ? 'text-emerald-400 font-semibold' : emp.status === 'IN_PROGRESS' ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
                                {emp.status} ({emp.cleared}/3 clear)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeletePath(p.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                    title="Remove path"
                  >
                    <Icon name="trash" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function LdAdminCerts() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const loadCerts = (silent = false) => {
    if (!silent) setLoading(true)
    api.getLdCertifications()
      .then(res => setCerts(res || []))
      .catch(err => {
        console.error("Failed to load certs queue:", err)
        showToast("❌ Failed to load credentials queue")
      })
      .finally(() => {
        if (!silent) setLoading(false)
      })
  }

  useEffect(() => {
    loadCerts()
  }, [])

  const handleVerify = async (id, name, employeeName, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setCerts(prev => prev.map(c => c.id === id ? { ...c, status: 'VERIFIED', assessmentStatus: 'Completed', assessmentScore: 95.0 } : c))
    try {
      await api.verifyCertification(id)
      showToast(`✓ Verified "${name}" for ${employeeName}! Skill proficiency upgraded to Level 4 (Advanced).`)
      loadCerts(true)
    } catch (err) {
      showToast(`❌ Verification failed: ${err.message}`)
      loadCerts(true)
    }
  }

  const handleReject = async (id, name, employeeName, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setCerts(prev => prev.map(c => c.id === id ? { ...c, status: 'REJECTED', assessmentStatus: 'Rejected' } : c))
    try {
      await api.rejectCertification(id)
      showToast(`Declined certification submission "${name}" for ${employeeName}.`)
      loadCerts(true)
    } catch (err) {
      showToast(`❌ Rejection failed: ${err.message}`)
      loadCerts(true)
    }
  }

  const isPending = (status) => {
    return status === 'PENDING_VERIFICATION' || status === 'UPLOADED' || status === 'PENDING' || status === 'ASSESSMENT_PENDING'
  }

  const pendingCount = certs.filter(c => isPending(c.status)).length
  const verifiedCount = certs.filter(c => c.status === 'VERIFIED').length
  const rejectedCount = certs.filter(c => c.status === 'REJECTED').length

  const filteredCerts = certs.filter(c => {
    if (statusFilter === 'PENDING' && !isPending(c.status)) return false
    if (statusFilter === 'VERIFIED' && c.status !== 'VERIFIED') return false
    if (statusFilter === 'REJECTED' && c.status !== 'REJECTED') return false
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const empName = (c.employeeName || (c.user && c.user.fullName) || '').toLowerCase()
      const title = (c.name || c.title || '').toLowerCase()
      const org = (c.issuingOrganization || '').toLowerCase()
      const skill = (c.skillName || (c.skill && c.skill.name) || '').toLowerCase()
      return empName.includes(q) || title.includes(q) || org.includes(q) || skill.includes(q)
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Icon name="loader-2" className="w-8 h-8 text-amber-400 animate-spin" />
          <div className="text-sm text-slate-400">Loading Credential Queue...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 border border-amber-400/40 text-amber-300 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium flex items-center gap-2 fade-in">
          <Icon name="check-circle" className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F1A] via-[#1A1424] to-[#0B0F1A] p-6 sm:p-8 border border-white/5 shadow-2xl">
        <div className="grad-blob w-72 h-72 bg-amber-500/15 -top-12 right-6"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
              <Icon name="award" className="w-3 h-3" /> Credential Verification
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">Credential Verification Center</h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Review and validate professional certifications submitted by employees. Verifying credentials automatically elevates employee proficiency to Level 4 (Advanced) and recalculates organizational gap scores.
          </p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Submissions</span>
            <div className="w-8 h-8 rounded-xl bg-white/5 text-slate-300 flex items-center justify-center"><Icon name="list" className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{certs.length}</div>
        </div>
        <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending Verification</span>
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center"><Icon name="clock" className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{pendingCount}</div>
        </div>
        <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Verified & Elevated</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center"><Icon name="check-circle" className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{verifiedCount}</div>
        </div>
        <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Declined</span>
            <div className="w-8 h-8 rounded-xl bg-rose-400/10 text-rose-400 flex items-center justify-center"><Icon name="x-circle" className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{rejectedCount}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Icon name="search" className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by employee, cert title, skill…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-amber-400"
          />
        </div>
        <div className="flex items-center gap-2">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING', label: `Pending (${pendingCount})` },
            { id: 'VERIFIED', label: `Verified (${verifiedCount})` },
            { id: 'REJECTED', label: `Declined (${rejectedCount})` }
          ].map(tab => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Certifications Table */}
      <div className="bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5">
              <th className="p-4">Employee</th>
              <th className="p-4">Certificate Title</th>
              <th className="p-4">Issuing Body</th>
              <th className="p-4">Associated Skill</th>
              <th className="p-4">Proof & Dates</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
            {filteredCerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">No certifications found matching your filters.</td>
              </tr>
            ) : (
              filteredCerts.map(c => {
                const empName = c.employeeName || (c.user && c.user.fullName) || 'Employee'
                const empRole = c.roleTitle || (c.user && c.user.roleTitle) || 'Software Engineer'
                const empDept = c.departmentName || (c.user && c.user.department && c.user.department.name) || 'Engineering'
                const title = c.name || c.title || 'Certification'
                const skill = c.skillName || (c.skill && c.skill.name) || 'General Competency'
                const pending = isPending(c.status)
                const verified = c.status === 'VERIFIED'
                const rejected = c.status === 'REJECTED'

                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {empName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{empName}</div>
                          <div className="text-[10px] text-slate-400">{empRole} · {empDept}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      <div>{title}</div>
                      {c.credentialId && (
                        <div className="text-[10px] text-slate-400 font-mono">ID: {c.credentialId}</div>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">{c.issuingOrganization}</td>
                    <td className="p-4">
                      <span className="text-lime-600 dark:text-lime-400 font-semibold bg-lime-400/10 px-2 py-0.5 rounded-md border border-lime-400/20 text-[11px]">
                        {skill}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-[11px]">
                      <div>Issued: {c.issueDate || '—'}</div>
                      {c.credentialUrl && (
                        <a
                          href={c.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 mt-0.5 hover:underline"
                        >
                          <Icon name="external-link" className="w-3 h-3" /> View Credential
                        </a>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        verified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        rejected ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      }`}>
                        {verified ? '✓ Verified' : rejected ? 'Declined' : 'Pending Verification'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {pending && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => handleVerify(c.id, title, empName, e)}
                              className="px-3 py-1.5 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] text-xs font-bold rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5"
                            >
                              <Icon name="check" className="w-3.5 h-3.5" /> Verify & Upgrade
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleReject(c.id, title, empName, e)}
                              className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/20 transition-colors inline-flex items-center gap-1"
                            >
                              <Icon name="x" className="w-3.5 h-3.5" /> Decline
                            </button>
                          </>
                        )}
                        {verified && (
                          <span className="text-emerald-400 text-xs font-semibold flex items-center justify-end gap-1">
                            <Icon name="check-circle" className="w-3.5 h-3.5" /> Verified (Level 4)
                          </span>
                        )}
                        {rejected && (
                          <span className="text-rose-400 text-xs font-semibold flex items-center justify-end gap-1">
                            <Icon name="x-circle" className="w-3.5 h-3.5" /> Declined
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==============================================================================
// L&D ADMIN MENTOR MANAGEMENT
// ==============================================================================
export function LdAdminMentorManagement({ onNav, user }) {
  const [activeTab, setActiveTab] = useState('assign') // 'assign' | 'active'
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [allMentorships, setAllMentorships] = useState([])
  const [loading, setLoading] = useState(true)
  const [recsLoading, setRecsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [empsRes, mentorshipsRes] = await Promise.allSettled([
        api.getLdEmployees(),
        api.getLdAllMentorships()
      ])
      if (empsRes.status === 'fulfilled') setEmployees(empsRes.value || [])
      if (mentorshipsRes.status === 'fulfilled') setAllMentorships(mentorshipsRes.value || [])
    } catch (e) {
      console.error('Error loading mentor management data:', e)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadRecommendations = async (empId) => {
    setRecsLoading(true)
    setRecommendations([])
    try {
      const recs = await api.getLdMentorRecommendations(empId)
      setRecommendations(recs || [])
    } catch (e) {
      console.error('Error loading recommendations:', e)
      showToast('❌ Failed to load AI recommendations')
    } finally {
      setRecsLoading(false)
    }
  }

  const handleSelectEmployee = (emp, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setSelectedEmployee(emp)
    loadRecommendations(emp.id)
  }

  const handleAssignMentor = async (rec, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!selectedEmployee || !rec) return
    setSubmitting(true)
    try {
      const assigned = await api.assignMentor({
        menteeId: selectedEmployee.id,
        mentorId: rec.mentorId || rec.id,
        skillId: rec.skillId,
        goal: `Close ${rec.skillName} skill gap (Level ${rec.menteeProficiency ?? rec.menteeProficiencyLevel ?? 1} → Level ${rec.mentorProficiency ?? rec.mentorProficiencyLevel ?? 4})`,
        message: `Assigned by L&D Admin based on AI skill-gap recommendation (${rec.matchScore}% match)`
      })
      showToast(`✓ Mentor ${rec.fullName} assigned to ${selectedEmployee.fullName}! A notification has been sent to the mentor to accept or decline.`)
      if (assigned) {
        setAllMentorships(prev => [assigned, ...prev.filter(m => m.id !== assigned.id)])
      }
      loadRecommendations(selectedEmployee.id)
      loadData(true)
    } catch (err) {
      showToast(`❌ Assignment failed: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelMentorship = async (id, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    // Immediate optimistic update
    setAllMentorships(prev => prev.map(m => m.id === id ? { ...m, status: 'CANCELLED' } : m))
    try {
      await api.ldCancelMentorship(id)
      showToast('✓ Mentorship cancelled.')
      loadData(true)
    } catch (err) {
      showToast(`❌ Cancel failed: ${err.message}`)
      loadData(true)
    }
  }

  const handleCompleteMentorship = async (id, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    // Immediate optimistic update
    setAllMentorships(prev => prev.map(m => m.id === id ? { ...m, status: 'COMPLETED', endDate: new Date().toISOString() } : m))
    try {
      await api.ldCompleteMentorship(id)
      showToast('🎉 Mentorship marked as completed!')
      loadData(true)
    } catch (err) {
      showToast(`❌ Complete failed: ${err.message}`)
      loadData(true)
    }
  }

  const filteredEmployees = employees.filter(e => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (e.fullName && e.fullName.toLowerCase().includes(q)) ||
           (e.email && e.email.toLowerCase().includes(q)) ||
           (e.roleTitle && e.roleTitle.toLowerCase().includes(q))
  })

  const filteredMentorships = allMentorships.filter(m => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false
    if (searchQuery && activeTab === 'active') {
      const q = searchQuery.toLowerCase()
      return (m.menteeName && m.menteeName.toLowerCase().includes(q)) ||
             (m.mentorName && m.mentorName.toLowerCase().includes(q)) ||
             (m.skillName && m.skillName.toLowerCase().includes(q))
    }
    return true
  })

  const activeMentorships = allMentorships.filter(m => m.status === 'ACTIVE' || m.status === 'ACCEPTED')
  const completedMentorships = allMentorships.filter(m => m.status === 'COMPLETED')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Icon name="loader-2" className="w-8 h-8 text-purple-400 animate-spin" />
          <div className="text-sm text-slate-400">Loading Mentor Management Center...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 stagger">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 border border-lime-400/40 text-lime-300 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium flex items-center gap-2 fade-in">
          <Icon name="check-circle" className="w-4 h-4 text-lime-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F1A] via-[#1A0F2E] to-[#0B0F1A] p-6 sm:p-8 border border-white/5 shadow-2xl">
        <div className="grad-blob w-72 h-72 bg-purple-500/20 -top-12 right-6"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-purple-400/15 text-purple-300 border border-purple-400/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
              <Icon name="sparkles" className="w-3 h-3" /> AI-Powered Matching
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">Mentor Management Center</h1>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            Assign mentors to employees using AI skill-gap recommendations. Manage, track, and oversee all active mentorship assignments across the organization.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 border-b border-white/10 overflow-x-auto pb-1 relative z-10">
          {[
            { id: 'assign', label: 'Assign Mentor', icon: 'user-plus' },
            { id: 'active', label: `Active Mentorships (${activeMentorships.length})`, icon: 'users' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setSearchQuery('') }}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-purple-400 text-purple-300 bg-purple-400/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon name={t.icon} className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Total Employees</span>
            <div className="w-8 h-8 rounded-xl bg-purple-400/10 text-purple-400 flex items-center justify-center"><Icon name="users" className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{employees.length}</div>
        </div>
        <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-lime-400 uppercase tracking-wider">Active Mentorships</span>
            <div className="w-8 h-8 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center"><Icon name="user-check" className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeMentorships.length}</div>
        </div>
        <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center"><Icon name="check-circle" className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{completedMentorships.length}</div>
        </div>
        <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">All Mentorships</span>
            <div className="w-8 h-8 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center"><Icon name="list" className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{allMentorships.length}</div>
        </div>
      </div>

      {/* TAB 1: ASSIGN MENTOR */}
      {activeTab === 'assign' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee List Panel */}
          <div className="lg:col-span-1 bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm">
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Icon name="users" className="w-4 h-4 text-purple-400" /> Select Employee
            </h3>

            <div className="relative mb-3">
              <Icon name="search" className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-purple-400"
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">No employees found</div>
              ) : (
                filteredEmployees.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => handleSelectEmployee(emp)}
                    className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all ${
                      selectedEmployee?.id === emp.id
                        ? 'bg-purple-400/15 border border-purple-400/40 text-white'
                        : 'bg-slate-50 dark:bg-white/5 border border-transparent text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {emp.fullName ? emp.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'EM'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{emp.fullName}</div>
                      <div className="text-[10px] text-slate-400 truncate">{emp.roleTitle || 'Employee'} · {emp.departmentName}</div>
                    </div>
                    <Icon name="chevron-right" className="w-4 h-4 text-slate-500 ml-auto shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* AI Recommendations Panel */}
          <div className="lg:col-span-2 space-y-5">
            {!selectedEmployee ? (
              <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl p-10 text-center shadow-sm">
                <Icon name="user-plus" className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="font-display font-bold text-base text-slate-700 dark:text-slate-300 mb-1">Select an Employee</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Choose an employee from the left panel to view their AI-powered skill-gap mentor recommendations.</p>
              </div>
            ) : (
              <>
                {/* Selected Employee Info */}
                <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 font-bold text-sm flex items-center justify-center shrink-0">
                    {selectedEmployee.fullName ? selectedEmployee.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'EM'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{selectedEmployee.fullName}</div>
                    <div className="text-xs text-slate-400">{selectedEmployee.roleTitle} · {selectedEmployee.departmentName} · {selectedEmployee.email}</div>
                  </div>
                  <span className="ml-auto bg-purple-400/15 text-purple-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple-400/30">Selected</span>
                </div>

                {/* Recommendations */}
                <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <Icon name="sparkles" className="w-4 h-4 text-lime-400" /> AI Mentor Recommendations
                      </h2>
                      <p className="text-xs text-slate-400">Mentors matched by skill-gap analysis for {selectedEmployee.fullName}.</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{recommendations.length} matches</span>
                  </div>

                  {recsLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Icon name="loader-2" className="w-6 h-6 text-lime-400 animate-spin" />
                      <span className="ml-2 text-xs text-slate-400">Analyzing skill gaps...</span>
                    </div>
                  ) : recommendations.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      <Icon name="check-circle" className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <div className="font-semibold text-slate-300">No skill gaps detected</div>
                      <div className="mt-1">This employee's skills meet or exceed all role benchmarks, or all gaps already have active mentorships.</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.map((rec, idx) => (
                        <div key={rec.mentorId || idx} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-lime-400/40 transition-all">
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-lime-400/20 text-lime-400 font-bold flex items-center justify-center text-sm shrink-0">
                                {rec.fullName ? rec.fullName[0] : 'M'}
                              </div>
                              <div className="text-right">
                                <span className="bg-lime-400/15 text-lime-400 font-bold text-[10px] px-2 py-0.5 rounded-full border border-lime-400/30">
                                  {rec.matchScore}% Match
                                </span>
                              </div>
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{rec.fullName}</h3>
                            <div className="text-xs text-slate-400 mb-2">{rec.roleTitle} · <span className="text-lime-300 font-medium">{rec.departmentName}</span></div>
                            <div className="bg-white/5 p-2.5 rounded-xl space-y-1 text-xs mb-3">
                              <div className="text-slate-400">Skill: <span className="text-lime-300 font-semibold">{rec.skillName}</span></div>
                              <div className="text-slate-400">Mentor Level: <span className="text-emerald-300 font-semibold">{rec.mentorProficiency ?? rec.mentorProficiencyLevel ?? 4}/5</span> vs Employee: <span className="text-amber-300 font-semibold">{rec.menteeProficiency ?? rec.menteeProficiencyLevel ?? 1}/5</span></div>
                            </div>
                            <p className="text-[11px] text-slate-400 italic line-clamp-2 mb-4">"{rec.reason || rec.matchReason || 'Matched based on higher skill proficiency.'}"</p>
                          </div>
                          <button
                            onClick={() => handleAssignMentor(rec)}
                            disabled={submitting}
                            className="w-full bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 transition-colors"
                          >
                            <Icon name="user-plus" className="w-3.5 h-3.5" /> Assign to {selectedEmployee.fullName?.split(' ')[0]}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE MENTORSHIPS */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Icon name="search" className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by mentee, mentor, or skill..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-purple-400"
              />
            </div>
            <div className="flex items-center gap-2">
              {['ALL', 'ACTIVE', 'REQUESTED', 'COMPLETED', 'CANCELLED'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                    statusFilter === s
                      ? 'bg-purple-400/20 text-purple-300 border border-purple-400/30'
                      : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Mentorships Table */}
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5">
                  <th className="p-4">Mentee</th>
                  <th className="p-4">Mentor</th>
                  <th className="p-4">Skill</th>
                  <th className="p-4">Match</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned By</th>
                  <th className="p-4">Started</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                {filteredMentorships.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">No mentorships found matching your filters.</td>
                  </tr>
                ) : (
                  filteredMentorships.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {m.menteeName ? m.menteeName[0] : 'E'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{m.menteeName}</div>
                            <div className="text-[10px] text-slate-400">{m.menteeRole || 'Employee'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-lime-400/20 text-lime-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {m.mentorName ? m.mentorName[0] : 'M'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{m.mentorName}</div>
                            <div className="text-[10px] text-slate-400">{m.mentorRole || 'Mentor'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-lime-600 dark:text-lime-400 font-semibold">{m.skillName}</td>
                      <td className="p-4">
                        <span className="bg-lime-400/15 text-lime-400 font-bold text-[10px] px-2 py-0.5 rounded-full">{m.matchScore}%</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          m.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          m.status === 'COMPLETED' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                          m.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          m.status === 'CANCELLED' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                          'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        }`}>
                          {m.status === 'REQUESTED' ? 'Pending Mentor Acceptance' :
                           m.status === 'REJECTED' ? 'Declined by Mentor' :
                           m.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {m.assignedByName ? (
                          <span className="flex items-center gap-1"><Icon name="shield-check" className="w-3 h-3 text-purple-400" /> {m.assignedByName}</span>
                        ) : (
                          <span className="text-slate-500 italic">Self-requested</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {m.startDate ? new Date(m.startDate).toLocaleDateString() : m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(m.status === 'ACTIVE' || m.status === 'ACCEPTED' || m.status === 'REQUESTED') && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleCompleteMentorship(m.id, e)}
                                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Icon name="check" className="w-3 h-3" /> Complete
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleCancelMentorship(m.id, e)}
                                className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Icon name="x" className="w-3 h-3" /> Cancel
                              </button>
                            </>
                          )}
                          {(m.status === 'COMPLETED' || m.status === 'CANCELLED' || m.status === 'REJECTED') && (
                            <span className="text-slate-500 text-[10px] italic">No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
