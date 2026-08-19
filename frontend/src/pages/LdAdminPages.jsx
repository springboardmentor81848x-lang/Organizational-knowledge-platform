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

  const loadCerts = () => {
    setLoading(true)
    api.getLdCertifications()
      .then(res => setCerts(res || []))
      .catch(err => console.error("Failed to load certs queue:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCerts()
  }, [])

  const handleVerify = async (id, name, employeeName) => {
    try {
      await api.verifyCertification(id)
      setToast(`Verified "${name}" for ${employeeName}! Skill proficiency upgraded to Level 4.`)
      setTimeout(() => setToast(null), 4000)
      loadCerts()
    } catch (err) {
      alert("Verification failed: " + err.message)
    }
  }

  if (loading) {
    return <div className="text-slate-400 text-xs py-8">Loading Credential Queue...</div>
  }

  return (
    <div className="space-y-6">
      <SectionHead
        title="Credential Verification Center"
        desc="Verify certifications submitted by employees to automatically upgrade organizational skill indices and recalculate gap scores."
      />

      {toast && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2"><Icon name="check-circle" className="w-4 h-4" /> {toast}</span>
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <div className="bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5">
              <th className="p-4">Employee</th>
              <th className="p-4">Certificate Title</th>
              <th className="p-4">Issuing Organization</th>
              <th className="p-4">Target Competency</th>
              <th className="p-4">Verification Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
            {certs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">No certifications in the verification queue.</td>
              </tr>
            ) : (
              certs.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 text-slate-900 dark:text-white font-bold">{c.user ? c.user.fullName : '—'}</td>
                  <td className="p-4 text-slate-800 dark:text-slate-300 font-medium">{c.name}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{c.issuingOrganization}</td>
                  <td className="p-4 text-lime-600 dark:text-lime-400 font-semibold">{c.skill ? c.skill.name : 'General'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      c.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {c.status !== 'VERIFIED' ? (
                      <button
                        onClick={() => handleVerify(c.id, c.name, c.user ? c.user.fullName : 'Employee')}
                        className="px-3.5 py-1.5 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] text-xs font-bold rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5"
                      >
                        <Icon name="check" className="w-3.5 h-3.5" /> Verify & Upgrade Skill
                      </button>
                    ) : (
                      <span className="text-emerald-500 dark:text-emerald-400 text-xs font-semibold flex items-center justify-end gap-1">
                        <Icon name="check-circle" className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
