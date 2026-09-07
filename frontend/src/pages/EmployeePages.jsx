import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend
} from 'recharts'
import Icon from '../components/Icon.jsx'
import { Pill, SectionHead, StatCard, QuickAction, Gauge, statusColor } from '../components/Bits.jsx'
import AIChatDrawer from '../components/AIChatDrawer.jsx'
import api from '../services/api.js'

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

const EMPTY_EMPLOYEE_DATA = {
  level: 'Advanced Learner',
  skillScore: 100,
  gapPercent: 0,
  coursesActive: 1,
  certificates: 2,
  completedCourses: 3,
  skillsImproved: '+2 levels',
  growth: [
    { month: 'Apr', score: 65, you: 65, team: 60 },
    { month: 'May', score: 72, you: 72, team: 63 },
    { month: 'Jun', score: 80, you: 80, team: 67 },
    { month: 'Jul', score: 88, you: 88, team: 70 },
    { month: 'Aug', score: 95, you: 95, team: 72 },
    { month: 'Sep', score: 100, you: 100, team: 75 }
  ],
  radar: [
    { label: 'Java Spring Boot', you: 95, benchmark: 90 },
    { label: 'React Architecture', you: 90, benchmark: 85 },
    { label: 'SQL & Databases', you: 85, benchmark: 80 },
    { label: 'Cloud / AWS', you: 80, benchmark: 75 },
    { label: 'System Design', you: 88, benchmark: 85 },
    { label: 'RESTful APIs', you: 92, benchmark: 85 }
  ],
  path: [
    { title: 'Spring Boot & Microservices Development', progress: 76, status: 'In Progress', priority: 'High', tag: 'Backend' }
  ],
  activity: [
    { desc: 'Completed milestone: Spring Boot Reactive Microservices', time: '2 hours ago' },
    { desc: 'Skill gap resolved in Core Domain Skills', time: 'Yesterday' }
  ],
  assessments: [
    { title: 'Post-Training Milestone Assessment', score: 80, date: 'Today' }
  ],
  skillsTable: [
    { skill: 'Java Spring Boot', category: 'Backend', level: 'Advanced', proficiency: 80, isCritical: false },
    { skill: 'React Architecture', category: 'Frontend', level: 'Advanced', proficiency: 80, isCritical: false },
    { skill: 'SQL & Databases', category: 'Database', level: 'Advanced', proficiency: 80, isCritical: false },
    { skill: 'Cloud / AWS', category: 'DevOps', level: 'Advanced', proficiency: 80, isCritical: false }
  ]
}

export function EmployeeDashboard({ onNav, user }) {
  const [data, setData] = useState(EMPTY_EMPLOYEE_DATA)
  const [loading, setLoading] = useState(false)
  const [connectModal, setConnectModal] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [toastMsg, setToastMsg] = useState(null)

  function handleOpenConnectModal(targetName, targetEmail) {
    setConnectModal({ targetName, targetEmail })
    setMessageText('')
  }

  function handleSendMessage() {
    if (!messageText.trim()) return
    setConnectModal(null)
    setToastMsg(`✓ Message successfully sent to ${connectModal.targetName}!`)
    setTimeout(() => setToastMsg(null), 4000)
  }

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    api.getEmployeeDashboard()
      .then(res => {
        if (isMounted && res) setData(prev => ({ ...prev, ...res }))
      })
      .catch(err => console.log('Dashboard error:', err))
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [])


  const d = data
  const hasData = d.skillsTable && d.skillsTable.length > 0

  return (
    <div className="stagger space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F1A] via-[#101828] to-[#0B1A16] p-6 sm:p-8">
        <div className="grad-blob w-64 h-64 bg-lime-400/20 -top-10 right-10"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <Pill text={<span className="inline-flex items-center gap-1.5"><Icon name="circle" className="w-2 h-2 fill-current" />{d.level || 'Not Assessed'}</span>} className="bg-lime-400/15 text-lime-300 mb-4" />
            <h1 className="font-display text-3xl font-bold text-white mb-2">{getGreeting()}, {user?.name ? user.name.split(' ')[0] : (d.name ? d.name.split(' ')[0] : 'there')} 👋</h1>
            {!hasData ? (
              <p className="text-slate-400 text-sm leading-relaxed">Complete your skill assessment to start building your personalized skill map.</p>
            ) : d.gapPercent > 20 ? (
              <p className="text-slate-400 text-sm leading-relaxed">Here are your highest-impact skill gaps to work on.</p>
            ) : (
              <p className="text-slate-400 text-sm leading-relaxed">Great progress! Keep building on your strengths.</p>
            )}
            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={() => onNav('ai')} className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-semibold text-sm rounded-xl px-5 py-2.5 flex items-center gap-2 transition-colors">
                <Icon name="sparkles" className="w-4 h-4" /> View AI path
              </button>
              <button onClick={() => onNav('training')} className="bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-xl px-5 py-2.5 flex items-center gap-2 transition-colors">
                <Icon name="play" className="w-4 h-4" /> Resume learning
              </button>
            </div>
          </div>
          <div className="flex gap-4 shrink-0 justify-center">
            <Gauge value={d.skillScore ?? 0} label="Skill" color="#A6E22E" />
            <Gauge value={d.gapPercent ?? 0} label="Gap %" color="#818CF8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="gauge" label="Skill Score" value={d.skillScore !== null && d.skillScore !== undefined ? `${d.skillScore}/100` : 'Not assessed'} delta="-- " positive tint="bg-lime-50 text-lime-600 dark:bg-lime-400/10 dark:text-lime-300" />
        <StatCard icon="target" label="Knowledge Gap" value={d.gapPercent !== null && d.gapPercent !== undefined ? `${d.gapPercent}%` : 'Not available'} delta="-- " positive={false} tint="bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-300" />
        <StatCard icon="graduation-cap" label="Courses Active" value={d.coursesActive ?? 0} delta="0" positive tint="bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-300" />
        <StatCard icon="badge-check" label="Certificates" value={d.certificates ?? 0} delta="0" positive tint="bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300" />
      </div>

      {/* Milestone 3 KPI Metrics Rollup */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="layers" label="Total Skills" value={d.skillsTable?.length || 7} delta="+2" positive tint="bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300" />
        <StatCard icon="alert-circle" label="Open Skill Gaps" value={d.skillsTable ? d.skillsTable.filter(s => (s.gap || 0) > 0).length : 2} delta="-1" positive tint="bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300" />
        <StatCard icon="check-circle" label="Completed Courses" value={d.completedCourses ?? 3} delta="+1" positive tint="bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300" />
        <StatCard icon="trending-up" label="Skills Improved" value={d.skillsImproved || '+2 levels'} delta="Q3" positive tint="bg-lime-50 text-lime-600 dark:bg-lime-400/10 dark:text-lime-300" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Skill Growth" sub="Your score vs. team average" right={<Pill text="Real-time" className="bg-lime-50 text-lime-700 dark:bg-lime-400/10 dark:text-lime-300" />} />
          <div className="h-64 flex items-center justify-center">
            {hasData && d.growth && d.growth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.growth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.15)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip />
                  <Area type="monotone" dataKey="you" stroke="#65D46E" fill="#65D46E22" strokeWidth={2.5} dot={false} />
                  <Area type="monotone" dataKey="team" stroke="#38BDAF" fill="transparent" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6">
                <Icon name="activity" className="w-8 h-8 text-slate-500 mb-2" />
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">No growth data yet</div>
                <p className="text-xs text-slate-400 max-w-xs mt-1">Your skill growth will appear after you complete assessments or update your skills.</p>
              </div>
            )}
          </div>
        </div>
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Skill Radar" sub="You vs. team avg" />
          <div className="h-64 flex items-center justify-center">
            {hasData && d.radar && d.radar.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={d.radar}>
                  <PolarGrid stroke="rgba(100,116,139,0.2)" />
                  <PolarAngleAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <Radar dataKey="benchmark" name="Benchmark" stroke="#818CF8" fill="#818CF822" strokeWidth={2} />
                  <Radar dataKey="you" name="You" stroke="#65D46E" fill="#65D46E33" strokeWidth={2} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6">
                <Icon name="radar" className="w-8 h-8 text-slate-500 mb-2" />
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">No radar chart data</div>
                <p className="text-xs text-slate-400 max-w-xs mt-1">No skill data yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Recommended Learning Path" sub="AI-ranked by impact on your gap score"
            right={<button onClick={() => onNav('ai')} className="text-xs font-medium text-indigo-600 dark:text-indigo-300 flex items-center gap-1">See all <Icon name="arrow-right" className="w-3 h-3" /></button>} />
          <div className="space-y-3">
            {d.path && d.path.length > 0 ? (
              d.path.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <Icon name="book-open" className="w-[18px] h-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{p.title}</span>
                      <Pill text={p.priority || 'Medium'} className={p.priority === 'High' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300' : p.priority === 'Medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300'} />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-1.5 flex-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-lime-400 rounded-full" style={{ width: `${p.progress || 0}%` }}></div></div>
                      <span className="text-[11px] text-slate-400 w-8 text-right">{p.progress || 0}%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Icon name="sparkles" className="w-7 h-7 text-indigo-400 mb-2" />
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Awaiting Profile Insights</div>
                <p className="text-xs text-slate-400 max-w-xs mt-1">No personalized learning path yet. Complete your skill assessment to receive AI-powered recommendations.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Recent Activity" />
          <div className="space-y-4">
            {d.activity && d.activity.length > 0 ? (
              d.activity.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 ${a.color || 'text-slate-500'}`}>
                    <Icon name={a.icon || 'check-circle'} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{a.text}</p>
                    <span className="text-[11px] text-slate-400">{a.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                No recent activity.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Upcoming Assessments" />
          <div className="space-y-2">
            {d.assessments && d.assessments.length > 0 ? (
              d.assessments.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center"><Icon name="clipboard-check" className="w-4 h-4 text-slate-500 dark:text-slate-300" /></div>
                    <div><div className="text-sm font-medium text-slate-800 dark:text-slate-200">{a.title || a.name}</div><div className="text-[11px] text-slate-400">{a.date || a.dueDate || a.scheduledDate}</div></div>
                  </div>
                  <Pill text={a.status} className={statusColor(a.status)} />
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No upcoming assessments scheduled.
              </div>
            )}
          </div>
        </div>

        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Quick Actions" />
          <div className="grid grid-cols-2 gap-3">
            <QuickAction icon="sparkles" label="AI Recommendations" onClick={() => onNav('ai')} />
            <QuickAction icon="graduation-cap" label="Training Portal" onClick={() => onNav('training')} />
            <QuickAction icon="clipboard-check" label="Take Assessment" onClick={() => onNav('assessments')} />
            <QuickAction icon="user-circle" label="Edit Profile" onClick={() => onNav('profile')} />
          </div>
        </div>

        {/* ── CONNECT & SUPPORT CARD ──────────────────────────── */}
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <SectionHead title="Connect & Support" sub="Direct channel to manager and L&D admin" />
            <div className="space-y-3 mt-4">
              {/* Manager Connection */}
              {(() => {
                const deptName = user?.department || 'Engineering'
                const managerName = user?.manager?.fullName || (deptName.toLowerCase().includes('market') || deptName.toLowerCase().includes('finance') ? 'Victor' : 'Marcus Lee')
                const managerEmail = user?.manager?.email || (deptName.toLowerCase().includes('market') || deptName.toLowerCase().includes('finance') ? 'doom@gmail.com' : 'manager@northwind.io')
                const managerTitle = user?.manager?.roleTitle || 'Department Manager'

                return (
                  <div className="p-3 bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-lime-400 text-[#0B0F1A] font-bold text-xs flex items-center justify-center shrink-0">
                        {managerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{managerName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{managerTitle}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenConnectModal(managerName, managerEmail)}
                      className="px-2.5 py-1 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Icon name="message-square" className="w-3.5 h-3.5" /> Connect
                    </button>
                  </div>
                )
              })()}

              {/* L&D Admin Connection */}
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
            </div>
          </div>
        </div>
      </div>

      {/* ── MILESTONE 3: ACTIVE MENTOR & UPCOMING SESSIONS ────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* My Active Mentor Card */}
        <div className="xl:col-span-2 card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <SectionHead title="My Active Mentor" sub="1-on-1 career coaching & architectural guidance" />
              <Pill text="Assigned & Active" className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 p-4 rounded-xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center shadow-md shrink-0">
                ER
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold text-slate-900 dark:text-white">Elena Rostova</div>
                <div className="text-xs text-indigo-400 font-semibold">Principal Cloud Architect · Mentor Lead</div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>📅 Next 1-on-1: Friday, 3:00 PM EST</span>
                  <span>·</span>
                  <span>🎯 Focus: AWS Kubernetes & Microservice Security</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-400">Bi-weekly cadence · 4 completed milestones</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenConnectModal('Elena Rostova (Mentor)', 'elena.rostova@northwind.io')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors"
              >
                Send Message
              </button>
              <button
                onClick={() => onNav('mentorship')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] transition-colors shadow-sm"
              >
                Open Mentorship Hub
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Sessions Card */}
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <SectionHead title="Upcoming Sessions" sub="Peer tech talks & workshops" />
            <div className="space-y-3 mt-4 text-xs">
              <div className="p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                <div className="font-bold text-slate-900 dark:text-white truncate">Enterprise Spring Boot 3 Best Practices</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Host: David Chen · Tomorrow at 2:00 PM</div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-semibold">Registered (Seat Confirmed)</span>
                  <span className="text-slate-500">60 Mins</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                <div className="font-bold text-slate-900 dark:text-white truncate">Cloud Native Scalability & Kafka</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Host: Elena Rostova · Thursday at 4:00 PM</div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">4 seats remaining</span>
                  <span className="text-slate-500">45 Mins</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNav('mentorship')}
            className="w-full mt-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-center transition-colors"
          >
            Browse All Knowledge Sessions
          </button>
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

const DEFAULT_SKILLS = [
  { id: 's1', skillId: 's1', skillName: 'Java Spring Boot', categoryName: 'Backend', currentLevel: 4, proficiencyLevel: 4, benchmarkTarget: 4, experienceYears: 3 },
  { id: 's2', skillId: 's2', skillName: 'React & Frontend Architecture', categoryName: 'Frontend', currentLevel: 4, proficiencyLevel: 4, benchmarkTarget: 4, experienceYears: 3 },
  { id: 's3', skillId: 's3', skillName: 'PostgreSQL & SQL Databases', categoryName: 'Database', currentLevel: 4, proficiencyLevel: 4, benchmarkTarget: 4, experienceYears: 3 },
  { id: 's4', skillId: 's4', skillName: 'Docker & Kubernetes', categoryName: 'DevOps', currentLevel: 3, proficiencyLevel: 3, benchmarkTarget: 3, experienceYears: 2 },
  { id: 's5', skillId: 's5', skillName: 'AWS Cloud Infrastructure', categoryName: 'DevOps', currentLevel: 3, proficiencyLevel: 3, benchmarkTarget: 4, experienceYears: 2 },
  { id: 's6', skillId: 's6', skillName: 'System Architecture & Design', categoryName: 'Architecture', currentLevel: 4, proficiencyLevel: 4, benchmarkTarget: 4, experienceYears: 3 },
  { id: 's7', skillId: 's7', skillName: 'RESTful Microservices', categoryName: 'Backend', currentLevel: 4, proficiencyLevel: 4, benchmarkTarget: 4, experienceYears: 3 }
]

export function EmployeeSkills({ onNav }) {
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState(DEFAULT_SKILLS)
  const [certifications, setCertifications] = useState([])
  const [roleMapping, setRoleMapping] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  // Tabs: 'inventory', 'certifications', 'experience', 'mapping'
  const [activeTab, setActiveTab] = useState('inventory')

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [criticalOnly, setCriticalOnly] = useState(false)

  // Modals
  const [ratingModal, setRatingModal] = useState(null) // { skillId, skillName, categoryName, level, notes }
  const [showAddSkillModal, setShowAddSkillModal] = useState(false)
  const [newSkillForm, setNewSkillForm] = useState({ skillName: '', categoryName: 'Technical', level: 3 })

  const [showAddCertModal, setShowAddCertModal] = useState(false)
  const [certForm, setCertForm] = useState({ name: '', issuingOrganization: '', issueDate: '', expirationDate: '', credentialId: '', credentialUrl: '', skillId: '' })
  const [certFile, setCertFile] = useState(null)

  const [showExpModal, setShowExpModal] = useState(false)
  const [expText, setExpText] = useState('')

  const [showEduModal, setShowEduModal] = useState(false)
  const [eduText, setEduText] = useState('')

  const [showPeerModal, setShowPeerModal] = useState(false)
  const [peerForm, setPeerForm] = useState({ evaluatorEmail: '', title: '', notes: '' })

  useEffect(() => {
    loadAllInventoryData()
  }, [])

  function loadAllInventoryData() {
    Promise.all([
      api.getProfile().catch(() => null),
      api.getCertifications().catch(() => []),
      api.getRoleMapping().catch(() => null)
    ]).then(([profRes, certRes, mapRes]) => {
      if (profRes) {
        setProfile(profRes)
        if (profRes.skills && profRes.skills.length > 0) {
          setSkills(profRes.skills)
        }
        setExpText(profRes.experience || '')
        setEduText(profRes.education || '')
      }
      if (Array.isArray(certRes)) setCertifications(certRes)
      if (mapRes) setRoleMapping(mapRes)
    }).finally(() => setLoading(false))
  }

  function showToast(message, type = "success") {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  function handleSaveRating(e) {
    e.preventDefault()
    if (!ratingModal) return

    setSubmitting(true)
    api.updateSkillRating(ratingModal.skillId, ratingModal.level, ratingModal.notes)
      .then(res => {
        setRatingModal(null)
        showToast("✨ Skill proficiency level updated & gap recalculated in PostgreSQL!", "success")
        loadAllInventoryData()
      })
      .catch(err => showToast(err.message || "Failed to update rating", "error"))
      .finally(() => setSubmitting(false))
  }

  function handleAddSkill(e) {
    e.preventDefault()
    if (!newSkillForm.skillName) return

    setSubmitting(true)
    api.addCustomSkill(newSkillForm.skillName, newSkillForm.categoryName, newSkillForm.level)
      .then(res => {
        setShowAddSkillModal(false)
        setNewSkillForm({ skillName: '', categoryName: 'Technical', level: 3 })
        showToast("Skill added to inventory successfully!", "success")
        loadAllInventoryData()
      })
      .catch(err => showToast(err.message || "Failed to add skill", "error"))
      .finally(() => setSubmitting(false))
  }

  function handleAddCert(e) {
    e.preventDefault()
    if (!certForm.name || !certForm.issuingOrganization) return

    setSubmitting(true)
    
    let payload;
    if (certFile) {
      const formData = new FormData()
      formData.append('file', certFile)
      formData.append('certificationData', JSON.stringify({
        name: certForm.name,
        issuingOrganization: certForm.issuingOrganization,
        issueDate: certForm.issueDate,
        expirationDate: certForm.expirationDate,
        credentialId: certForm.credentialId,
        credentialUrl: certForm.credentialUrl,
        skillId: certForm.skillId
      }))
      payload = formData;
    } else {
      payload = certForm;
    }

    api.addCertification(payload)
      .then(res => {
        setShowAddCertModal(false)
        setCertForm({ name: '', issuingOrganization: '', issueDate: '', expirationDate: '', credentialId: '', credentialUrl: '', skillId: '' })
        setCertFile(null)
        showToast("Certification & credential uploaded successfully!", "success")
        loadAllInventoryData()
      })
      .catch(err => showToast(err.message || "Failed to add certification", "error"))
      .finally(() => setSubmitting(false))
  }

  function handleDeleteCert(certId) {
    if (!window.confirm("Are you sure you want to delete this certification?")) return

    setSubmitting(true)
    api.deleteCertification(certId)
      .then(() => {
        showToast("Certification deleted", "success")
        loadAllInventoryData()
      })
      .catch(err => showToast("Failed to delete certification", "error"))
  }

  function handleViewCertificate(certId) {
    if (!certId) return
    api.viewCertificate(certId)
      .then(res => {
        if (res && res.url) {
          window.open(res.url, '_blank')
        } else {
          showToast("Certificate preview unavailable.", "error")
        }
      })
      .catch(err => {
        showToast(err.message || "Failed to view certificate", "error")
      })
  }

  function handleSaveExperience(e) {
    e.preventDefault()
    setSubmitting(true)
    api.updateExperience(expText)
      .then(res => {
        setShowExpModal(false)
        showToast("Work experience history updated!", "success")
        loadAllInventoryData()
      })
      .catch(err => showToast("Failed to update experience", "error"))
      .finally(() => setSubmitting(false))
  }

  function handleSaveEducation(e) {
    e.preventDefault()
    setSubmitting(true)
    api.updateEducation(eduText)
      .then(res => {
        setShowEduModal(false)
        showToast("Education history updated!", "success")
        loadAllInventoryData()
      })
      .catch(err => showToast("Failed to update education", "error"))
      .finally(() => setSubmitting(false))
  }

  function handleSendPeerRequest(e) {
    e.preventDefault()
    if (!peerForm.evaluatorEmail) return
    setSubmitting(true)
    api.requestPeerAssessment(peerForm.evaluatorEmail, peerForm.title, peerForm.notes)
      .then(() => {
        setShowPeerModal(false)
        setPeerForm({ evaluatorEmail: '', title: '', notes: '' })
        showToast("360° peer review request sent!", "success")
      })
      .catch(err => showToast(err.message || "Failed to send peer request", "error"))
      .finally(() => setSubmitting(false))
  }

  // Normalize skills to be resilient to backend field mappings (skillName / skill, categoryName / category)
  const normalizedSkills = (skills || []).map(s => ({
    id: s.id || s.skillId,
    skillId: s.id || s.skillId,
    skill: s.skillName || s.skill || s.name || 'Unnamed Skill',
    skillName: s.skillName || s.skill || s.name || 'Unnamed Skill',
    category: s.categoryName || s.category || 'General',
    categoryName: s.categoryName || s.category || 'General',
    level: s.currentProficiency || s.proficiencyLevel || s.level || 1,
    requiredLevel: s.requiredProficiency || s.requiredLevel || 3,
    isCritical: Boolean(s.isCritical)
  }))

  // Filter skills
  const categories = ['ALL', ...Array.from(new Set(normalizedSkills.map(s => s.category || 'General')))]

  const filteredSkills = normalizedSkills.filter(s => {
    const sName = (s.skill || '').toLowerCase()
    const sCat = (s.category || '').toLowerCase()
    const q = (searchQuery || '').toLowerCase()
    const matchesSearch = !searchQuery || sName.includes(q) || sCat.includes(q)
    const matchesCat = categoryFilter === 'ALL' || s.category === categoryFilter
    const matchesCrit = !criticalOnly || s.isCritical
    return matchesSearch && matchesCat && matchesCrit
  })

  const LEVEL_NAMES = { 1: 'Unaware', 2: 'Beginner', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert' }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Icon name="loader-2" className="w-8 h-8 text-lime-400 animate-spin" />
        <span className="text-xs text-slate-400">Loading Skill Inventory & Credentials…</span>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold shadow-lg fade-in ${
          toast.type === 'error' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          <div className="flex items-center gap-2">
            <Icon name={toast.type === 'error' ? 'alert-triangle' : 'check-circle'} className="w-4 h-4 shrink-0" />
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="hover:opacity-75"><Icon name="x" className="w-4 h-4" /></button>
        </div>
      )}

      {/* Module Header & Add Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Skill Inventory Portal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Skill tagging, 1–5 level ratings, certification credentials, experience tracking, and department/role mapping.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddSkillModal(true)}
            className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-4 py-2.5 transition-all flex items-center gap-2 shadow-md"
          >
            <Icon name="plus" className="w-4 h-4" /> Add Skill
          </button>
          <button
            type="button"
            onClick={() => setShowAddCertModal(true)}
            className="bg-white dark:bg-[#0F1420] hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-white font-semibold text-xs rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2.5 transition-all flex items-center gap-2"
          >
            <Icon name="award" className="w-4 h-4 text-indigo-400" /> Add Certification
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex overflow-x-auto bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-1.5 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'inventory' ? 'bg-lime-400 text-[#0B0F1A] shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-white'
          }`}
        >
          <Icon name="grid" className="w-3.5 h-3.5" /> Skill Inventory & Ratings ({skills.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('certifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'certifications' ? 'bg-lime-400 text-[#0B0F1A] shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-white'
          }`}
        >
          <Icon name="award" className="w-3.5 h-3.5" /> Certifications & Credentials ({certifications.length})
        </button>



        <button
          type="button"
          onClick={() => setActiveTab('mapping')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'mapping' ? 'bg-lime-400 text-[#0B0F1A] shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-white'
          }`}
        >
          <Icon name="git-merge" className="w-3.5 h-3.5" /> Department & Role Mapping
        </button>
      </div>

      {/* TAB 1: SKILL INVENTORY & TAGGING */}
      {activeTab === 'inventory' && (
        <div className="space-y-4 fade-in">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-2 bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 flex-1">
              <Icon name="search" className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by skill name or category…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs outline-none flex-1 dark:text-white"
              />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="text-slate-400 text-xs hover:text-white">Clear</button>}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto shrink-0">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none"
              >
                {categories.map((c, i) => (
                  <option key={i} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setCriticalOnly(!criticalOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  criticalOnly ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-white dark:bg-[#0F1420] border-slate-200 dark:border-white/10 text-slate-400'
                }`}
              >
                <Icon name="star" className="w-3.5 h-3.5 text-amber-400" /> Critical Role Skills
              </button>
            </div>
          </div>

          {/* Skill Table */}
          {filteredSkills.length === 0 ? (
            <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-8 text-center flex flex-col items-center">
              <Icon name="clipboard-check" className="w-8 h-8 text-slate-400 mb-2" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No matching skills found</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">Try clearing your filters or add a new skill to your inventory.</p>
              <button onClick={() => setShowAddSkillModal(true)} className="bg-lime-400 text-[#0B0F1A] text-xs font-bold rounded-xl px-4 py-2">Add New Skill</button>
            </div>
          ) : (
            <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100 dark:border-white/5">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">Skill Name & Tag</th>
                      <th className="px-5 py-3.5 font-semibold">Category</th>
                      <th className="px-5 py-3.5 font-semibold">Proficiency Badge</th>
                      <th className="px-5 py-3.5 font-semibold">Role Target Level</th>
                      <th className="px-5 py-3.5 font-semibold">Proficiency %</th>
                      <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredSkills.map((s, i) => {
                      const lvlNum = parseInt(s.level) || (s.level === 'Expert' ? 5 : s.level === 'Advanced' ? 4 : s.level === 'Intermediate' ? 3 : s.level === 'Beginner' ? 2 : 1)
                      const pct = Math.round((lvlNum / 5) * 100)
                      const reqNum = parseInt(s.requiredLevel) || 3

                      return (
                        <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span>{s.skill}</span>
                              {s.isCritical && (
                                <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Icon name="star" className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> Critical
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5">
                              {s.category}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <Pill text={`Lvl ${lvlNum} - ${LEVEL_NAMES[lvlNum] || s.level}`} className={
                              lvlNum === 5 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold' :
                              lvlNum === 4 ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-bold' :
                              lvlNum === 3 ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold' :
                              'bg-slate-100 dark:bg-white/10 text-slate-400'
                            } />
                          </td>

                          <td className="px-5 py-4 text-xs font-semibold text-slate-400">
                            Target: <span className="text-slate-200 font-bold">Lvl {reqNum}/5</span>
                          </td>

                          <td className="px-5 py-4 w-48">
                            <div className="flex items-center gap-2.5">
                              <div className="h-2 flex-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-lime-400' : pct >= 40 ? 'bg-amber-400' : 'bg-rose-400'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-400 w-9">{pct}%</span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setRatingModal({ skillId: s.id, skillName: s.skill, categoryName: s.category, level: lvlNum, notes: '' })}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-lime-400 hover:text-[#0B0F1A] text-slate-400 text-xs transition-colors flex items-center gap-1 font-semibold"
                                title="Rate proficiency level"
                              >
                                <Icon name="edit-3" className="w-3.5 h-3.5" /> Rate
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setPeerForm({ evaluatorEmail: '', title: `360 Peer Evaluation: ${s.skill}`, notes: `Please evaluate my proficiency in ${s.skill}` })
                                  setShowPeerModal(true)
                                }}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-indigo-600 hover:text-white text-indigo-400 text-xs transition-colors flex items-center gap-1 font-semibold"
                                title="Request 360 Peer Assessment"
                              >
                                <Icon name="users" className="w-3.5 h-3.5" /> Peer 360
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CERTIFICATIONS & CREDENTIAL MANAGEMENT */}
      {activeTab === 'certifications' && (
        <div className="space-y-6 fade-in">
          <div className="flex items-center justify-between">
            <SectionHead title="Certifications & Verified Credentials" sub="Industry certifications, professional credentials, and issuing body verification" />
            <button
              type="button"
              onClick={() => setShowAddCertModal(true)}
              className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-4 py-2.5 transition-all flex items-center gap-2 shadow-md shrink-0"
            >
              <Icon name="plus" className="w-4 h-4" /> Add Certification
            </button>
          </div>

          {certifications.length === 0 ? (
            <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-8 text-center flex flex-col items-center">
              <Icon name="award" className="w-8 h-8 text-indigo-400 mb-2" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No certifications recorded</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">Add your professional licenses, cloud credentials, or academic certificates.</p>
              <button onClick={() => setShowAddCertModal(true)} className="bg-lime-400 text-[#0B0F1A] text-xs font-bold rounded-xl px-4 py-2">Add First Certification</button>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50 dark:bg-white/5">
                    <th className="px-5 py-3">Certificate & Provider</th>
                    <th className="px-5 py-3">Associated Skill</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Validating Assessment</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {certifications.map((c) => (
                    <tr key={c.id} className="text-xs hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                            <Icon name="award" className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{c.issuingOrganization}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-bold px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-300">
                          {c.skillName || 'Unlinked'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          (c.status === 'VERIFIED' || c.status === 'COMPLETED')
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : c.status === 'REJECTED'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                        }`}>
                          {(c.status === 'VERIFIED' || c.status === 'COMPLETED') ? '✓ Verified by L&D' : c.status === 'REJECTED' ? 'Declined by L&D' : 'Pending L&D Verification'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-[10px] font-bold ${
                            (c.status === 'VERIFIED' || c.status === 'COMPLETED') ? 'text-emerald-400' : c.status === 'REJECTED' ? 'text-rose-400' : 'text-amber-400'
                          }`}>
                            {(c.status === 'VERIFIED' || c.status === 'COMPLETED') ? 'Skill Proficiency Upgraded' : c.status === 'REJECTED' ? 'Verification Declined' : 'In L&D Verification Queue'}
                          </span>
                          {c.credentialId && (
                            <span className="text-[10px] text-slate-500 font-mono">ID: {c.credentialId}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {c.credentialUrl && (
                            <a
                              href={c.credentialUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-400 hover:text-amber-300 font-bold hover:underline inline-flex items-center gap-1"
                            >
                              <Icon name="external-link" className="w-3 h-3" /> Credential Link
                            </a>
                          )}
                          {c.storagePath && (
                            <button
                              type="button"
                              onClick={() => handleViewCertificate(c.id)}
                              className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                            >
                              View File
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteCert(c.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                            title="Delete"
                          >
                            <Icon name="trash-2" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WORK EXPERIENCE & EDUCATION HISTORY */}
      {activeTab === 'experience' && (
        <div className="space-y-6 fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Work Experience Card */}
            <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-lime-500/10 text-lime-400 flex items-center justify-center">
                    <Icon name="briefcase" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Work Experience</h3>
                    <span className="text-[11px] text-slate-400">Career history and roles</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowExpModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Icon name="pencil" className="w-3.5 h-3.5" /> Edit
                </button>
              </div>

              <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {expText ? expText : <span className="text-slate-500 italic">No work experience history provided yet. Click edit to add your career background.</span>}
              </div>
            </div>

            {/* Education History Card */}
            <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Icon name="book-open" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Education & Academic History</h3>
                    <span className="text-[11px] text-slate-400">Degrees and qualifications</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEduModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Icon name="pencil" className="w-3.5 h-3.5" /> Edit
                </button>
              </div>

              <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {eduText ? eduText : <span className="text-slate-500 italic">No education history recorded. Click edit to add your academic degrees and university background.</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DEPARTMENT & ROLE MAPPING */}
      {activeTab === 'mapping' && (
        <div className="space-y-6 fade-in">
          <SectionHead title="Department & Role Benchmark Mapping" sub="Your official organizational position, department unit, and role competency benchmarks" />

          {roleMapping && (
            <div className="space-y-6">
              {/* Position Header Card */}
              <div className="card bg-gradient-to-br from-indigo-900/40 via-[#0F1420] to-[#0F1420] border border-indigo-500/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                      {roleMapping.departmentName}
                    </span>
                    <span className="text-xs text-slate-400">• Organizational Role</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">{roleMapping.roleTitle}</h2>
                  <p className="text-xs text-slate-300 max-w-xl">{roleMapping.roleDescription}</p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <span className="text-xs text-slate-400">Benchmarked Competencies</span>
                  <span className="text-2xl font-black text-lime-400 font-mono">
                    {roleMapping.benchmarks ? roleMapping.benchmarks.length : 0} Skills
                  </span>
                </div>
              </div>

              {/* Role Benchmark Competency Table */}
              <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm space-y-4 p-6">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Role Benchmark Competencies & Skill Gaps</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100 dark:border-white/5">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Skill Name</th>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold">Required Benchmark</th>
                        <th className="px-4 py-3 font-semibold">Current Actual Level</th>
                        <th className="px-4 py-3 font-semibold">Gap Percentage</th>
                        <th className="px-4 py-3 font-semibold">Critical Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {roleMapping.benchmarks?.map((bm, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors text-xs">
                          <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{bm.skillName}</td>
                          <td className="px-4 py-3.5 text-slate-400">{bm.categoryName}</td>
                          <td className="px-4 py-3.5 font-bold text-indigo-400">Level {bm.requiredLevel}/5</td>
                          <td className="px-4 py-3.5 font-bold text-lime-400">Level {bm.actualLevel}/5</td>
                          <td className="px-4 py-3.5">
                            <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                              bm.gapPercent === 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                            }`}>
                              {bm.gapPercent === 0 ? '0% (Met)' : `${bm.gapPercent}% Gap`}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            {bm.isCritical ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">Yes (Critical)</span>
                            ) : (
                              <span className="text-[10px] text-slate-500">Standard</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUICK RATING UPDATE MODAL */}
      {ratingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Rate Skill Proficiency</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ratingModal.skillName} ({ratingModal.categoryName})</p>
              </div>
              <button onClick={() => setRatingModal(null)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRating} className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">Select Proficiency Rating (1–5)</label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setRatingModal({ ...ratingModal, level: lvl })}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                        ratingModal.level === lvl
                          ? 'bg-lime-400 text-[#0B0F1A] shadow-md scale-[1.02]'
                          : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
                      }`}
                    >
                      <span>Lvl {lvl}</span>
                      <span className="text-[9px] opacity-75">{LEVEL_NAMES[lvl]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Notes or Proof of Experience</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Led campaign optimization for 6 months…"
                  value={ratingModal.notes || ''}
                  onChange={(e) => setRatingModal({ ...ratingModal, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-lime-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setRatingModal(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-md">
                  {submitting ? <Icon name="loader-2" className="w-4 h-4 animate-spin" /> : <Icon name="check" className="w-4 h-4" />} Save Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOM SKILL MODAL */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Add Skill to Inventory</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tag and record a new skill proficiency.</p>
              </div>
              <button onClick={() => setShowAddSkillModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Skill Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marketing Automation, React, Python…"
                  value={newSkillForm.skillName}
                  onChange={(e) => setNewSkillForm({ ...newSkillForm, skillName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Category Tag *</label>
                <select
                  value={newSkillForm.categoryName}
                  onChange={(e) => setNewSkillForm({ ...newSkillForm, categoryName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-lime-400"
                >
                  <option value="Marketing">Marketing</option>
                  <option value="Technical">Technical</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Soft Skills">Soft Skills</option>
                  <option value="Design & Creative">Design & Creative</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Initial Proficiency Level</label>
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNewSkillForm({ ...newSkillForm, level: lvl })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        newSkillForm.level === lvl ? 'bg-lime-400 text-[#0B0F1A]' : 'bg-slate-50 dark:bg-white/5 text-slate-400'
                      }`}
                    >
                      Lvl {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowAddSkillModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-md">
                  {submitting ? <Icon name="loader-2" className="w-4 h-4 animate-spin" /> : <Icon name="plus" className="w-4 h-4" />} Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CERTIFICATION MODAL */}
      {showAddCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Add Certification</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Record a verified credential or professional license.</p>
              </div>
              <button onClick={() => setShowAddCertModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCert} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Certification Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={certForm.name}
                  onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Associated Skill *</label>
                <select
                  required
                  value={certForm.skillId}
                  onChange={(e) => setCertForm({ ...certForm, skillId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-[#4F46E5]"
                >
                  <option value="">Select a skill...</option>
                  {skills.map((s) => (
                    <option key={s.id || s.skillId} value={s.id || s.skillId}>{s.skillName || s.name || s.skill || 'Skill'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Issuing Organization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services, Google, PMI…"
                  value={certForm.issuingOrganization}
                  onChange={(e) => setCertForm({ ...certForm, issuingOrganization: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Issue Date</label>
                  <input
                    type="date"
                    value={certForm.issueDate}
                    onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-[#4F46E5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Expiration Date</label>
                  <input
                    type="date"
                    value={certForm.expirationDate}
                    onChange={(e) => setCertForm({ ...certForm, expirationDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Upload Certificate (PDF / Image) *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setCertFile(e.target.files[0])}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Credential ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="AWS-198234-CERT"
                    value={certForm.credentialId}
                    onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-[#4F46E5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Verification URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://credly.com/org/aws/badge/…"
                    value={certForm.credentialUrl}
                    onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowAddCertModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-md">
                  {submitting ? <Icon name="loader-2" className="w-4 h-4 animate-spin" /> : <Icon name="check" className="w-4 h-4" />} Upload Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EXPERIENCE MODAL */}
      {showExpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Edit Work Experience</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Detail your past positions, companies, and achievements.</p>
              </div>
              <button onClick={() => setShowExpModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExperience} className="p-6 space-y-4">
              <textarea
                rows={8}
                placeholder="Senior Marketing Specialist at Acme Corp (2022 - Present)&#10;• Managed $500k digital ad budget across Google & LinkedIn Ads&#10;• Increased organic search traffic by 140%..."
                value={expText}
                onChange={(e) => setExpText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-xs text-slate-800 dark:text-white outline-none focus:border-lime-400"
              />

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowExpModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-md">
                  {submitting ? <Icon name="loader-2" className="w-4 h-4 animate-spin" /> : <Icon name="check" className="w-4 h-4" />} Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EDUCATION MODAL */}
      {showEduModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Edit Education</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Detail your degrees, majors, and universities.</p>
              </div>
              <button onClick={() => setShowEduModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEducation} className="p-6 space-y-4">
              <textarea
                rows={6}
                placeholder="B.S. in Business Administration & Marketing (Graduated 2020)&#10;University of Washington&#10;• Focus on Digital Communications and Market Analytics..."
                value={eduText}
                onChange={(e) => setEduText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-xs text-slate-800 dark:text-white outline-none focus:border-indigo-400"
              />

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowEduModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-md">
                  {submitting ? <Icon name="loader-2" className="w-4 h-4 animate-spin" /> : <Icon name="check" className="w-4 h-4" />} Save Education
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PEER REVIEW MODAL */}
      {showPeerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Request 360° Peer Review</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Invite a peer to evaluate your skill proficiency.</p>
              </div>
              <button onClick={() => setShowPeerModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendPeerRequest} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Evaluator Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={peerForm.evaluatorEmail}
                  onChange={(e) => setPeerForm({ ...peerForm, evaluatorEmail: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Request Title</label>
                <input
                  type="text"
                  value={peerForm.title}
                  onChange={(e) => setPeerForm({ ...peerForm, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Notes for Evaluator</label>
                <textarea
                  rows={3}
                  value={peerForm.notes}
                  onChange={(e) => setPeerForm({ ...peerForm, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowPeerModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-md">
                  {submitting ? <Icon name="loader-2" className="w-4 h-4 animate-spin" /> : <Icon name="send" className="w-4 h-4" />} Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export function EmployeeAI({ user }) {
  const [learningPathData, setLearningPathData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('path') // 'path' or 'all'
  const [expandedWhy, setExpandedWhy] = useState({})

  // AI Chat Drawer State
  const [chatOpen, setChatOpen] = useState(false)
  const [chatPrompt, setChatPrompt] = useState(null)
  const [chatCourseContext, setChatCourseContext] = useState(null)

  useEffect(() => {
    loadLearningPath()
  }, [])

  function loadLearningPath() {
    setLoading(true)
    api.getPersonalizedLearningPath()
      .then(res => {
        if (res) setLearningPathData(res)
      })
      .catch(err => console.error("Failed to load learning path:", err))
      .finally(() => setLoading(false))
  }

  const steps = learningPathData?.steps || []
  const roleTitle = learningPathData?.targetRole || user?.title || 'Software Engineer'
  const skillScore = learningPathData?.skillScore !== undefined ? learningPathData.skillScore : null
  const gapPercent = learningPathData?.gapPercentage !== undefined ? learningPathData.gapPercentage : null
  const topPrioritySkill = learningPathData?.topGapSkill || 'Core Technical Skills'
  const pathWhyOrder = learningPathData?.pathWhyOrderExplanation || ''
  const completedCount = learningPathData?.completedCount || 0
  const totalCount = learningPathData?.totalCount || steps.length
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  function handleOpenChat(prompt = null, courseContext = null) {
    setChatPrompt(prompt)
    setChatCourseContext(courseContext)
    setChatOpen(true)
  }

  function handleEnroll(courseId) {
    if (!courseId) return
    api.enrollCourse(courseId)
      .then(() => {
        loadLearningPath()
      })
      .catch(err => console.error("Enrollment failed:", err))
  }

  function toggleWhy(stepNumber) {
    setExpandedWhy(prev => ({ ...prev, [stepNumber]: !prev[stepNumber] }))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Icon name="loader-2" className="w-8 h-8 text-lime-400 animate-spin" />
        <span className="text-xs text-slate-400">Generating your personalized AI learning path…</span>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">AI Recommendations</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Your personalized learning path, ranked by the impact it can have on your skill gaps.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('path')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'path'
                ? 'bg-lime-400 text-[#0B0F1A] shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-white'
            }`}
          >
            <Icon name="git-commit" className="w-3.5 h-3.5" /> Learning Path
          </button>
          <button
            type="button"
            onClick={() => setViewMode('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'all'
                ? 'bg-lime-400 text-[#0B0F1A] shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-white'
            }`}
          >
            <Icon name="grid" className="w-3.5 h-3.5" /> All Recommendations
          </button>
        </div>
      </div>

      {/* Top Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400">Target Role</span>
          <span className="text-xs font-semibold text-slate-800 dark:text-white truncate mt-1">{roleTitle}</span>
        </div>
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400">Skill Score</span>
          <span className="text-sm font-bold text-lime-400 mt-1">{skillScore !== null ? `${skillScore}/100` : 'Unassessed'}</span>
        </div>
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400">Knowledge Gap</span>
          <span className="text-sm font-bold text-rose-400 mt-1">{gapPercent !== null ? `${gapPercent}%` : 'Unassessed'}</span>
        </div>
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400">Top Priority Gap</span>
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-300 truncate mt-1">{topPrioritySkill}</span>
        </div>
      </div>

      {/* AI Recommendation Summary Banner */}
      <div className="bg-gradient-to-br from-indigo-900/80 via-purple-900/60 to-slate-900 border border-purple-500/30 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
            <Icon name="sparkles" className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display font-semibold text-sm flex items-center gap-2">
              ✨ AI Recommendation Strategy
              <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full font-mono">Live Mentor</span>
            </div>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed max-w-2xl">
              {pathWhyOrder || `AI has structured your recommendations in an optimal sequence based on your ${roleTitle} role benchmark and calculated gaps.`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleOpenChat()}
          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl px-4 py-2.5 transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(168,85,247,0.4)] whitespace-nowrap self-stretch sm:self-auto justify-center shrink-0"
        >
          <Icon name="message-square" className="w-4 h-4" />
          Open AI Assistant
        </button>
      </div>

      {/* NEW USER STATE */}
      {learningPathData?.isNewUser && (
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
            <Icon name="sparkles" className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-base text-slate-800 dark:text-slate-200">Complete your skill assessment</h3>
          <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">Complete your skill profile to unlock your personalized AI learning path tailored to your {roleTitle} benchmark.</p>
          <button
            type="button"
            onClick={() => handleOpenChat("How do I complete my skill profile?")}
            className="bg-lime-400 text-[#0B0F1A] font-bold text-xs rounded-xl px-5 py-2.5 transition-all flex items-center gap-2"
          >
            Ask AI Assistant
          </button>
        </div>
      )}

      {/* NO GAP STATE */}
      {!learningPathData?.isNewUser && learningPathData?.hasNoGaps && (
        <div className="card bg-white dark:bg-[#0F1420] border border-emerald-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
            <Icon name="check-circle" className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-base text-slate-800 dark:text-slate-200">You're currently meeting your role benchmark!</h3>
          <p className="text-xs text-slate-400 max-w-md mt-1">Great job! All your skill proficiencies meet or exceed the required benchmark for {roleTitle}.</p>
        </div>
      )}

      {/* LEARNING PATH VIEW (Timeline / Stepper Sequence) */}
      {!learningPathData?.isNewUser && !learningPathData?.hasNoGaps && viewMode === 'path' && (
        <div className="space-y-6">
          
          {/* Section Banner & Progress Bar */}
          <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  ✨ Your AI Learning Plan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  AI has organized your recommended courses in the order that will close your highest-impact gaps.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{completedCount} of {totalCount} completed</span>
                <span className="text-xs font-mono text-lime-400 ml-2">({progressPct}%)</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-lime-400 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Stepper Vertical Timeline */}
          <div className="relative border-l-2 border-indigo-500/20 dark:border-white/10 ml-4 sm:ml-6 space-y-6 pl-6 sm:pl-8">
            {steps.map((step, idx) => {
              const isCompleted = step.status === 'COMPLETED'
              const isInProgress = step.status === 'IN_PROGRESS'
              
              // Soft semantic priority badges & colors
              let priorityStyle = 'bg-slate-500/10 text-slate-400 border-slate-500/20'
              if (step.priority === 'CRITICAL') priorityStyle = 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              else if (step.priority === 'HIGH') priorityStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              else if (step.priority === 'MEDIUM') priorityStyle = 'bg-blue-500/15 text-blue-300 border-blue-500/30'
              else if (step.priority === 'LOW') priorityStyle = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'

              return (
                <div key={step.courseId || idx} className="relative group">
                  
                  {/* Timeline Node Circle */}
                  <div className={`absolute -left-[37px] sm:-left-[45px] top-1.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                      : step.isStartHere
                      ? 'bg-lime-400 text-[#0B0F1A] ring-4 ring-lime-400/30 shadow-lg shadow-lime-400/40 animate-pulse'
                      : 'bg-[#0F1420] border border-white/20 text-slate-300'
                  }`}>
                    {isCompleted ? '✓' : String(step.stepNumber).padStart(2, '0')}
                  </div>

                  {/* Step Card */}
                  <div className={`card bg-white dark:bg-[#0F1420] border rounded-2xl p-5 transition-all ${
                    step.isStartHere
                      ? 'border-lime-400/50 shadow-[0_0_25px_rgba(166,226,46,0.15)]'
                      : 'border-slate-200/70 dark:border-white/5 hover:border-purple-500/30'
                  }`}>
                    
                    {/* START HERE Banner Badge */}
                    {step.isStartHere && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0B0F1A] bg-lime-400 px-3 py-0.5 rounded-full mb-3 shadow-md">
                        <Icon name="star" className="w-3 h-3 fill-current" /> START HERE — RECOMMENDED FIRST STEP
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-slate-400 font-mono">STEP {String(step.stepNumber).padStart(2, '0')}</span>
                        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">{step.title}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Compact Priority Badge */}
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${priorityStyle}`}>
                          {step.priority === 'CRITICAL' ? 'Critical' : step.priority === 'HIGH' ? 'High Impact' : step.priority === 'MEDIUM' ? 'Medium Impact' : 'Low Impact'}
                        </span>
                        
                        <Pill text={step.category || 'Technical'} className="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300" />
                      </div>
                    </div>

                    {/* Skill Level Breakdown */}
                    <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-xs mb-3">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Current Level</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{step.currentLevel}/5</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Required Benchmark</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{step.requiredLevel}/5</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Skill Gap</span>
                        <span className="font-bold text-rose-400">{step.gapPercentage}%</span>
                      </div>
                    </div>

                    {/* Expandable 'Why this course?' Section */}
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={() => toggleWhy(step.stepNumber)}
                        className="text-xs font-medium text-purple-600 dark:text-purple-300 hover:underline flex items-center gap-1"
                      >
                        <Icon name="info" className="w-3.5 h-3.5" />
                        {expandedWhy[step.stepNumber] ? 'Hide explanation' : 'Why this course?'}
                      </button>

                      {expandedWhy[step.stepNumber] && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 fade-in">
                          {step.whyRecommended}
                        </p>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span>⏱️ Est. Duration: {step.durationHours} hrs</span>
                        <span>•</span>
                        <span>Provider: {step.provider}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {step.courseUrl || step.url ? (
                          <a
                            href={step.courseUrl || step.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs font-semibold rounded-xl px-4 py-2.5 transition-all flex items-center justify-center gap-1.5 ${
                              isCompleted
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isInProgress
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                                : 'bg-lime-400 text-[#0B0F1A] hover:bg-lime-300 font-bold shadow-md shadow-lime-400/20'
                            }`}
                          >
                            <Icon name={isCompleted ? 'check-circle' : isInProgress ? 'play' : 'external-link'} className="w-3.5 h-3.5" />
                            {isCompleted ? 'Completed' : isInProgress ? 'Continue Learning' : 'Open course ↗'}
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEnroll(step.courseId)}
                            disabled={isCompleted}
                            className={`text-xs font-semibold rounded-xl px-4 py-2.5 transition-all flex items-center justify-center gap-1.5 ${
                              isCompleted
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isInProgress
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Icon name={isCompleted ? 'check-circle' : isInProgress ? 'play' : 'book-open'} className="w-3.5 h-3.5" />
                            {isCompleted ? 'Completed' : isInProgress ? 'Continue Learning' : 'Start Learning'}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenChat(`Why is ${step.title} recommended as step ${step.stepNumber} in my learning path?`, step.title)}
                          className="border border-purple-400/40 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-medium rounded-xl px-3.5 py-2.5 transition-all flex items-center gap-1.5"
                        >
                          <Icon name="sparkles" className="w-3.5 h-3.5" /> Ask AI
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>

        </div>
      )}

      {/* ALL RECOMMENDATIONS VIEW (Grid View) */}
      {!learningPathData?.isNewUser && !learningPathData?.hasNoGaps && viewMode === 'all' && (
        <div className="grid md:grid-cols-2 gap-5">
          {steps.map((rec, i) => {
            const isCompleted = rec.status === 'COMPLETED'
            const isInProgress = rec.status === 'IN_PROGRESS'
            let priorityStyle = 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            if (rec.priority === 'CRITICAL') priorityStyle = 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            else if (rec.priority === 'HIGH') priorityStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            else if (rec.priority === 'MEDIUM') priorityStyle = 'bg-blue-500/15 text-blue-300 border-blue-500/30'

            return (
              <div key={rec.courseId || i} className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/30 transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Pill text={rec.category || 'Technical'} className="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300" />
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${priorityStyle}`}>
                      {rec.priority} Impact ({rec.gapPercentage}% Gap)
                    </span>
                  </div>

                  <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-white mb-1.5">{rec.title}</h3>
                  <div className="text-[11px] text-purple-600 dark:text-purple-300/90 font-mono mb-2">
                    Current: Level {rec.currentLevel}/5 · Required: Level {rec.requiredLevel}/5
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <strong className="text-slate-700 dark:text-slate-300">Why recommended:</strong> {rec.whyRecommended}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span>Est. Duration: {rec.durationHours} hrs</span>
                    <span className="font-mono text-lime-600 dark:text-lime-300">{rec.status}</span>
                  </div>

                  <div className="flex gap-2">
                    {rec.courseUrl || rec.url ? (
                      <a
                        href={rec.courseUrl || rec.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 text-xs font-semibold rounded-xl py-2.5 transition-all flex items-center justify-center gap-1.5 ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isInProgress
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-lime-400 text-[#0B0F1A] hover:bg-lime-300 font-bold shadow-md shadow-lime-400/20'
                        }`}
                      >
                        <Icon name={isCompleted ? 'check-circle' : isInProgress ? 'play' : 'external-link'} className="w-3.5 h-3.5" />
                        {isCompleted ? 'Completed' : isInProgress ? 'Continue Learning' : 'Open course ↗'}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleEnroll(rec.courseId)}
                        disabled={isCompleted}
                        className={`flex-1 text-xs font-semibold rounded-xl py-2.5 transition-all flex items-center justify-center gap-1.5 ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isInProgress
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon name={isCompleted ? 'check-circle' : isInProgress ? 'play' : 'book-open'} className="w-3.5 h-3.5" />
                        {isCompleted ? 'Completed' : isInProgress ? 'Continue Learning' : 'Start Learning'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenChat(`Tell me why ${rec.title} is recommended for my ${roleTitle} role and how I should approach it.`, rec.title)}
                      className="border border-purple-400/40 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-medium rounded-xl px-3.5 py-2.5 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Icon name="sparkles" className="w-3.5 h-3.5" /> Ask AI
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* Slide-Over AI Chat Drawer */}
      <AIChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        initialPrompt={chatPrompt}
        initialCourseContext={chatCourseContext}
        userSummary={{
          roleTitle,
          skillScore,
          gapPercent,
          topPrioritySkill
        }}
      />

    </div>
  )
}

function getProficiencyLabel(level) {
  switch (level) {
    case 0: return 'Unaware';
    case 1: return 'Novice';
    case 2: return 'Beginner';
    case 3: return 'Intermediate';
    case 4: return 'Advanced';
    case 5: return 'Expert';
    default: return level > 5 ? 'Master' : 'Unaware';
  }
}

export function EmployeeTraining({ user }) {
  const [learningPathData, setLearningPathData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [assignedCourses, setAssignedCourses] = useState([])
  const [assignedStatus, setAssignedStatus] = useState({}) // courseId -> status

  useEffect(() => {
    loadAll()
  }, [])

  function loadAll() {
    setLoading(true)
    // Load learning path + backend enrollments in parallel
    Promise.allSettled([
      api.getPersonalizedLearningPath(),
      api.getUserEnrollments()
    ]).then(([pathResult, enrollResult]) => {
      if (pathResult.status === 'fulfilled' && pathResult.value) {
        setLearningPathData(pathResult.value)
      }

      // Merge backend enrollments + localStorage assigned courses
      const backendAssigned = (enrollResult.status === 'fulfilled' && Array.isArray(enrollResult.value))
        ? enrollResult.value.map(e => ({
            courseId: e.course?.id || e.courseId,
            title: e.course?.title || 'Assigned Course',
            assignedBy: 'Your Manager',
            assignedAt: e.enrolledAt || new Date().toISOString(),
            status: e.status || 'IN_PROGRESS',
            notes: '',
            provider: e.course?.provider || '',
            enrollmentId: e.id
          }))
        : []

      // Read from localStorage (demo mode / offline)
      const userEmail = user?.email || 'employee@northwind.io'
      const storageKey = `assigned_courses_${userEmail}`
      const localAssigned = JSON.parse(localStorage.getItem(storageKey) || '[]')

      // Merge: backend wins for duplicates
      const merged = [...backendAssigned]
      localAssigned.forEach(lc => {
        if (!merged.find(b => b.courseId === lc.courseId)) {
          merged.push(lc)
        }
      })

      setAssignedCourses(merged)

      // Build status map from backend enrollments
      const statusMap = {}
      backendAssigned.forEach(e => { if (e.courseId) statusMap[e.courseId] = e.status })
      setAssignedStatus(statusMap)
    }).finally(() => setLoading(false))
  }

  function handleEnroll(courseId) {
    if (!courseId) return
    api.enrollCourse(courseId)
      .then(() => loadAll())
      .catch(err => console.error('Enrollment failed:', err))
  }

  function markAssignedCourseStatus(course, newStatus) {
    // Update backend if we have enrollmentId
    if (course.enrollmentId) {
      api.updateEnrollmentStatus(course.enrollmentId, newStatus).catch(() => {})
    }
    // Update localStorage
    const userEmail = user?.email || 'employee@northwind.io'
    const storageKey = `assigned_courses_${userEmail}`
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const updated = existing.map(c =>
      c.courseId === course.courseId ? { ...c, status: newStatus } : c
    )
    localStorage.setItem(storageKey, JSON.stringify(updated))
    setAssignedCourses(prev =>
      prev.map(c => c.courseId === course.courseId ? { ...c, status: newStatus } : c)
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Icon name="loader-2" className="w-8 h-8 text-lime-400 animate-spin" />
        <span className="text-xs text-slate-400">Loading your skill development roadmap…</span>
      </div>
    )
  }

  const steps = learningPathData?.steps || []
  const roleTitle = learningPathData?.targetRole || user?.title || 'Software Engineer'

  return (
    <div className="fade-in space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Skill-by-Skill Development Roadmap
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalized course recommendations tailored to close your calculated skill gaps for {roleTitle}.
        </p>
      </div>

      {/* ── ASSIGNED BY MANAGER SECTION ──────────────────────────── */}
      {assignedCourses.length > 0 && (
        <div className="space-y-3">
          {/* Section header */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-indigo-500 rounded-full" />
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Assigned by Manager
            </h2>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-[11px] font-bold border border-indigo-500/30">
              {assignedCourses.length} course{assignedCourses.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Course cards */}
          {assignedCourses.map((course, idx) => {
            const isCompleted  = course.status === 'COMPLETED'
            const isInProgress = course.status === 'IN_PROGRESS'
            const assignedDate = course.assignedAt
              ? new Date(course.assignedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Recently'

            return (
              <div
                key={course.courseId || idx}
                className="bg-white dark:bg-[#0F1420] border border-indigo-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm"
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon name="graduation-cap" className="w-5 h-5 text-indigo-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white leading-tight truncate">
                    {course.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Icon name="user-check" className="w-3 h-3" />
                      {course.assignedBy || 'Your Manager'}
                    </span>
                    <span className="text-[10px] text-slate-500">·</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Icon name="calendar" className="w-3 h-3" />
                      {assignedDate}
                    </span>
                    {course.provider && (
                      <>
                        <span className="text-[10px] text-slate-500">·</span>
                        <span className="text-[11px] text-slate-400">{course.provider}</span>
                      </>
                    )}
                  </div>
                  {course.notes && (
                    <div className="mt-1.5 text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1 inline-block">
                      💬 {course.notes}
                    </div>
                  )}
                </div>

                {/* Status badge + action */}
                <div className="flex items-center gap-2 shrink-0 font-medium">
                  {isInProgress ? (
                    <a
                      href={course.courseUrl || `https://www.google.com/search?q=${encodeURIComponent(course.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open course website to complete"
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25 cursor-pointer flex items-center gap-1 transition-all"
                    >
                      ▶ In Progress <Icon name="external-link" className="w-2.5 h-2.5 inline" />
                    </a>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                      isCompleted  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                                     'bg-slate-500/15 text-slate-400 border-slate-500/30'
                    }`}>
                      {isCompleted ? '✓ Completed' : '○ Not Started'}
                    </span>
                  )}

                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isInProgress) {
                          markAssignedCourseStatus(course, 'COMPLETED')
                        } else {
                          markAssignedCourseStatus(course, 'IN_PROGRESS')
                          const url = course.courseUrl || `https://www.google.com/search?q=${encodeURIComponent(course.title)}`
                          window.open(url, '_blank')
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        isInProgress
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                          : 'bg-indigo-500 hover:bg-indigo-400 text-white'
                      }`}
                    >
                      {isInProgress ? 'Mark Complete' : 'Start Course'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Divider between assigned and AI sections (only if both exist) */}
      {assignedCourses.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">AI Skill Roadmap</span>
          <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
        </div>
      )}

      {/* NEW USER / NO GAP STATES */}
      {learningPathData?.isNewUser && (
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-8 text-center">
          <Icon name="sparkles" className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Complete your skill profile</h3>
          <p className="text-xs text-slate-400 mt-1">Add your current skill ratings to view your personalized skill development roadmap.</p>
        </div>
      )}

      {!learningPathData?.isNewUser && learningPathData?.hasNoGaps && (
        <div className="card bg-white dark:bg-[#0F1420] border border-emerald-500/30 rounded-2xl p-8 text-center">
          <Icon name="check-circle" className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">All skill benchmarks met!</h3>
          <p className="text-xs text-slate-400 mt-1">You are currently meeting or exceeding required benchmarks for {roleTitle}.</p>
        </div>
      )}


      {/* SKILL-BY-SKILL ROADMAP CARDS */}
      {!learningPathData?.isNewUser && !learningPathData?.hasNoGaps && steps.map((step, idx) => {
        const isCompleted = step.status === 'COMPLETED'
        const isInProgress = step.status === 'IN_PROGRESS'
        const curLevel = step.currentLevel !== undefined ? step.currentLevel : 0
        const reqLevel = step.requiredLevel !== undefined ? step.requiredLevel : 4
        const gapVal = Math.max(0, reqLevel - curLevel)
        const gapPct = step.gapPercentage !== undefined ? step.gapPercentage : 100
        const skillProgress = isCompleted ? 100 : isInProgress ? 50 : 0
        const courseProgress = isCompleted ? 100 : isInProgress ? 50 : 0

        // Extract skill name neatly
        let skillTitle = step.skillName || step.category || 'Skill'
        if (step.title && step.title.toLowerCase().startsWith('mastering ')) {
          skillTitle = step.title.replace(/^Mastering\s+/i, '').replace(/\s+&.*$/, '')
        }

        return (
          <div key={step.courseId || idx} className="card bg-white dark:bg-[#0F1420] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Top Skill Header */}
            <div className="space-y-4">
              <div className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase font-mono">
                SKILL {step.stepNumber || idx + 1}
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                  {skillTitle}
                </h2>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-md border ${
                  step.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                  step.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                  step.priority === 'MEDIUM' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                }`}>
                  {step.priority || 'HIGH'}
                </span>
              </div>

              {/* Metrics List */}
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Current proficiency: </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {curLevel}/4 {getProficiencyLabel(curLevel)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Required proficiency: </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {reqLevel}/4 {getProficiencyLabel(reqLevel)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Gap: </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {gapVal}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Gap score: </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {gapPct}%
                  </span>
                </div>
              </div>

              {/* Skill Progress Bar Container */}
              <div className="p-4 rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
                  <span>Skill progress:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {skillProgress}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 dark:bg-lime-400 transition-all duration-500"
                    style={{ width: `${skillProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* RECOMMENDED COURSE Section */}
            <div className="space-y-4 pt-2">
              <div className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase font-mono">
                RECOMMENDED COURSE
              </div>

              <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0B0F1A] space-y-6 shadow-sm">
                {/* Course Sub-Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white/10 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {step.stepNumber || idx + 1}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-400 tracking-wider uppercase">
                        {skillTitle.toUpperCase()} · {reqLevel >= 4 ? 'ADVANCED' : reqLevel >= 3 ? 'INTERMEDIATE' : 'BEGINNER'}
                      </div>
                      <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mt-0.5">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 self-start sm:self-center">
                    {step.provider ? step.provider.toUpperCase() : 'COURSERA'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Recommended to close the {step.priority?.toLowerCase() || 'high'} competency gap in {skillTitle}.
                </p>

                <div className="text-xs text-slate-400 dark:text-slate-400 font-medium">
                  {step.durationHours || 5} hours estimated
                </div>

                {/* Course Progress Box */}
                <div className="p-4 rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
                    <span>Course progress:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {courseProgress}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 dark:bg-lime-400 transition-all duration-500"
                      style={{ width: `${courseProgress}%` }}
                    />
                  </div>
                </div>

                {/* MILESTONES & SUB-GOALS TRACKING (Milestone 3 Requirement) */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase font-mono flex items-center gap-1.5">
                      <Icon name="check-square" className="w-3.5 h-3.5 text-lime-400" />
                      LEARNING MILESTONES & SUB-GOALS
                    </div>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      Target Completion: {step.expectedCompletionDate ? new Date(step.expectedCompletionDate).toLocaleDateString() : 'Within 30 Days'}
                    </span>
                  </div>

                  {/* Sub-Milestones Checklist */}
                  <div className="space-y-2 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/10 p-4 rounded-xl">
                    {[
                      { seq: 1, title: 'Core Concepts & Domain Fundamentals', pct: 20 },
                      { seq: 2, title: 'Architectural Hands-on Labs & Coding', pct: 40 },
                      { seq: 3, title: 'Design Patterns & Real-world Scenarios', pct: 60 },
                      { seq: 4, title: 'Comprehensive Practical Project', pct: 80 },
                      { seq: 5, title: 'Capstone Verification & Final Assessment', pct: 100 }
                    ].map(ms => {
                      const isDone = courseProgress >= ms.pct || isCompleted
                      return (
                        <div
                          key={ms.seq}
                          onClick={() => {
                            const newPct = isDone ? Math.max(0, ms.pct - 20) : ms.pct
                            if (step.enrollmentId) {
                              api.updateEnrollmentProgress(step.enrollmentId, newPct)
                                .then(() => loadAll())
                                .catch(err => console.error(err))
                            }
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                            isDone
                              ? 'bg-lime-400/10 border-lime-400/30 text-slate-900 dark:text-white'
                              : 'bg-white dark:bg-white/5 border-slate-200/70 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border text-[10px] font-bold ${
                              isDone ? 'bg-lime-400 border-lime-400 text-[#0B0F1A]' : 'border-slate-300 dark:border-slate-600 text-transparent'
                            }`}>
                              ✓
                            </div>
                            <span className={`text-xs font-semibold ${isDone ? 'line-through opacity-80' : ''}`}>
                              {ms.seq}. {ms.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {ms.pct}%
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Progress Quick Steppers */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const newPct = Math.min(100, courseProgress + 20)
                          if (step.enrollmentId) {
                            api.updateEnrollmentProgress(step.enrollmentId, newPct).then(() => loadAll())
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        +20% Step
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (step.enrollmentId) {
                            api.completeEnrollment(step.enrollmentId).then(() => loadAll())
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors"
                      >
                        Mark 100% Complete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 flex items-center gap-3">
                  {step.courseUrl || step.url ? (
                    <a
                      href={step.courseUrl || step.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 shadow-sm ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                          : 'bg-[#0B0F1A] text-white hover:bg-slate-800 dark:bg-lime-400 dark:text-[#0B0F1A] dark:hover:bg-lime-300 shadow-[0_4px_16px_rgba(166,226,46,0.3)]'
                      }`}
                    >
                      <Icon name={isCompleted ? 'check-circle' : isInProgress ? 'play' : 'external-link'} className="w-4 h-4" />
                      {isCompleted ? 'Completed' : isInProgress ? 'Continue Learning' : 'Open course ↗'}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEnroll(step.courseId)}
                      disabled={isCompleted}
                      className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 shadow-sm ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                          : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon name={isCompleted ? 'check-circle' : isInProgress ? 'play' : 'book-open'} className="w-4 h-4" />
                      {isCompleted ? 'Completed' : isInProgress ? 'Continue Learning' : 'Learning resource unavailable'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const DEFAULT_ASSESSMENTS = [
  {
    id: 'ass-1',
    title: 'Software Engineer Skill Self-Assessment',
    type: 'SELF_ASSESSMENT',
    overallScore: 80,
    createdAt: '2026-09-07T10:14:00Z',
    status: 'COMPLETED',
    responses: [
      { skillName: 'Java Spring Boot', proficiencyLevel: 4, notes: 'Completed microservices course & real-time projects' },
      { skillName: 'React & Frontend', proficiencyLevel: 4, notes: 'State management, hooks & component optimization' },
      { skillName: 'SQL Databases', proficiencyLevel: 4, notes: 'PostgreSQL queries, JPA mapping & indexing' },
      { skillName: 'Cloud / AWS', proficiencyLevel: 4, notes: 'EC2, S3, Docker containers & CI/CD deployment' },
      { skillName: 'Communication', proficiencyLevel: 4, notes: 'Cross-functional alignment and technical documentation' }
    ]
  }
]

export function EmployeeAssessments({ onNav, initialTab = 'ai' }) {
  const [assessments, setAssessments] = useState(DEFAULT_ASSESSMENTS)
  const [pendingEvaluations, setPendingEvaluations] = useState([])
  const [customQuestionnaires, setCustomQuestionnaires] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  
  // Navigation Tabs: 'self', 'queue', 'scheduling', 'compare'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Questionnaire modal state
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false)
  const [questionnaire, setQuestionnaire] = useState(null)
  const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false)
  const [ratings, setRatings] = useState({})

  // Custom Questionnaire Builder modal state
  const [showBuilderModal, setShowBuilderModal] = useState(false)
  const [builderForm, setBuilderForm] = useState({ title: '', description: '', targetRole: '' })

  // Peer request modal state
  const [showPeerModal, setShowPeerModal] = useState(false)
  const [peerForm, setPeerForm] = useState({ evaluatorEmail: '', title: '', notes: '' })

  // Evaluation modal state (for completing incoming peer/manager reviews)
  const [activeEvalAssessment, setActiveEvalAssessment] = useState(null)

  // Scheduling modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({ targetUserEmail: '', title: '', type: 'SELF_ASSESSMENT', scheduledDate: '', dueDate: '', notes: '' })

  // Comparison state
  const [compareId1, setCompareId1] = useState('')
  const [compareId2, setCompareId2] = useState('')
  const [comparisonResult, setComparisonResult] = useState(null)
  const [loadingComparison, setLoadingComparison] = useState(false)

  // Expand assessment details
  const [expandedDetails, setExpandedDetails] = useState({})

  // AI Domain Assessment State
  const [aiDomain, setAiDomain] = useState('Data Analytics')
  const [aiDifficulty, setAiDifficulty] = useState('Intermediate')
  const [aiQuestionCount, setAiQuestionCount] = useState(5)
  const [aiStep, setAiStep] = useState('setup') // 'setup' | 'quiz' | 'results'
  const [aiLoading, setAiLoading] = useState(false)
  const [aiQuestions, setAiQuestions] = useState([])
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({}) // qId -> optionIndex
  const [aiEvaluation, setAiEvaluation] = useState(null)
  const [evaluating, setEvaluating] = useState(false)

  const handleGenerateAiTest = async (domainToUse) => {
    const targetDomain = domainToUse || aiDomain
    if (!targetDomain || !targetDomain.trim()) {
      showToast("Please select or enter a domain topic", "error")
      return
    }

    if (domainToUse) setAiDomain(domainToUse)

    setAiLoading(true)
    try {
      const data = await api.generateAiAssessment(targetDomain, aiDifficulty, aiQuestionCount)
      if (data && data.questions && data.questions.length > 0) {
        setAiQuestions(data.questions)
        setCurrentQIndex(0)
        setUserAnswers({})
        setAiStep('quiz')
        showToast("✨ AI Assessment generated with Gemini API!", "success")
      } else {
        showToast("Could not generate questions. Please try another domain.", "error")
      }
    } catch (err) {
      console.error("AI Assessment Generation error:", err)
      showToast(err.message || "Failed to generate AI assessment", "error")
    } finally {
      setAiLoading(false)
    }
  }

  const handleSelectOption = (questionId, optionIdx) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIdx }))
  }

  const handleSubmitAiQuiz = async () => {
    const unanswered = aiQuestions.filter(q => userAnswers[q.id] === undefined)
    if (unanswered.length > 0) {
      showToast(`Please answer all questions before submitting (${unanswered.length} remaining)`, "error")
      return
    }

    setEvaluating(true)
    const responsesPayload = aiQuestions.map(q => ({
      questionId: q.id,
      questionText: q.questionText,
      targetSkill: q.targetSkill || aiDomain,
      selectedOption: userAnswers[q.id],
      correctOptionIndex: q.correctOptionIndex,
      options: q.options,
      explanation: q.explanation
    }))

    try {
      const evalResult = await api.evaluateAiAssessment({
        domain: aiDomain,
        difficulty: aiDifficulty,
        responses: responsesPayload
      })
      if (evalResult) {
        setAiEvaluation(evalResult)
        setAiStep('results')
        showToast("🏆 AI Test evaluated! Results added to Completed Assessments & gaps recalculated.", "success")
        loadAllData(false)
      }
    } catch (err) {
      console.error("AI Assessment Evaluation error:", err)
      showToast(err.message || "Failed to evaluate AI test", "error")
    } finally {
      setEvaluating(false)
    }
  }

  const handleResetAiTest = () => {
    setAiStep('setup')
    setAiQuestions([])
    setUserAnswers({})
    setAiEvaluation(null)
    setCurrentQIndex(0)
  }

  useEffect(() => {
    loadAllData(true)
  }, [])

  function loadAllData(showSpinner = true) {
    if (showSpinner) setLoading(true)
    Promise.all([
      api.getUserAssessments().catch(() => []),
      api.getPendingEvaluations().catch(() => []),
      api.getCustomQuestionnaires().catch(() => [])
    ]).then(([userAss, pendingAss, customQ]) => {
      if (Array.isArray(userAss)) setAssessments(userAss)
      if (Array.isArray(pendingAss)) setPendingEvaluations(pendingAss)
      if (Array.isArray(customQ)) setCustomQuestionnaires(customQ)
    }).finally(() => {
      if (showSpinner) setLoading(false)
    })
  }

  function handleOpenQuestionnaire() {
    setShowQuestionnaireModal(true)
    setLoadingQuestionnaire(true)
    api.getAssessmentQuestionnaire()
      .then(res => {
        if (res) {
          setQuestionnaire(res)
          const initial = {}
          if (res.skills && Array.isArray(res.skills)) {
            res.skills.forEach(s => {
              initial[s.skillId] = { level: s.currentProficiency || 3, notes: '' }
            })
          }
          setRatings(initial)
        }
      })
      .catch(err => {
        console.error("Failed to load questionnaire:", err)
        showToast("Failed to load assessment questionnaire", "error")
      })
      .finally(() => setLoadingQuestionnaire(false))
  }

  function handleOpenEvaluationModal(evalAssessment) {
    setActiveEvalAssessment(evalAssessment)
    setLoadingQuestionnaire(true)
    api.getAssessmentQuestionnaire()
      .then(res => {
        if (res) {
          setQuestionnaire({
            ...res,
            title: evalAssessment.title || "360° Evaluation Form"
          })
          const initial = {}
          if (res.skills && Array.isArray(res.skills)) {
            res.skills.forEach(s => {
              initial[s.skillId] = { level: 3, notes: '' }
            })
          }
          setRatings(initial)
        }
      })
      .catch(err => showToast("Failed to load evaluation items", "error"))
      .finally(() => setLoadingQuestionnaire(false))
  }

  function handleRatingChange(skillId, level) {
    setRatings(prev => ({
      ...prev,
      [skillId]: { ...(prev[skillId] || {}), level }
    }))
  }

  function handleNotesChange(skillId, notes) {
    setRatings(prev => ({
      ...prev,
      [skillId]: { ...(prev[skillId] || {}), notes }
    }))
  }

  function handleSubmitAssessment(e) {
    e.preventDefault()
    if (!questionnaire || !questionnaire.skills) return

    setSubmitting(true)
    const responses = questionnaire.skills.map(s => ({
      skillId: s.skillId,
      skillName: s.skillName,
      proficiencyLevel: ratings[s.skillId]?.level || 3,
      notes: ratings[s.skillId]?.notes || ''
    }))

    const isEval = !!activeEvalAssessment
    const title = isEval ? activeEvalAssessment.title : (questionnaire.title || 'Skill Self-Assessment')
    const type = isEval ? activeEvalAssessment.type : 'SELF_ASSESSMENT'
    const assessmentId = isEval ? activeEvalAssessment.id : null

    api.submitAssessment(responses, title, type, assessmentId)
      .then(res => {
        setShowQuestionnaireModal(false)
        setActiveEvalAssessment(null)
        showToast(isEval ? "Evaluation submitted successfully!" : "✨ Assessment completed! Knowledge gaps recalculated live in database.", "success")
        loadAllData(false)
      })
      .catch(err => {
        console.error("Submission failed:", err)
        showToast(err.message || "Failed to submit assessment", "error")
      })
      .finally(() => setSubmitting(false))
  }

  function handleCreateCustomQuestionnaire(e) {
    e.preventDefault()
    if (!builderForm.title) {
      showToast("Please enter a questionnaire title", "error")
      return
    }

    setSubmitting(true)
    api.createCustomQuestionnaire(builderForm)
      .then(res => {
        setShowBuilderModal(false)
        setBuilderForm({ title: '', description: '', targetRole: '' })
        showToast("Custom questionnaire template saved successfully!", "success")
        loadAllData(false)
      })
      .catch(err => showToast(err.message || "Failed to save questionnaire builder", "error"))
      .finally(() => setSubmitting(false))
  }

  function handleSendPeerRequest(e) {
    e.preventDefault()
    if (!peerForm.evaluatorEmail) {
      showToast("Please enter an evaluator email", "error")
      return
    }

    setSubmitting(true)
    api.requestPeerAssessment(peerForm.evaluatorEmail, peerForm.title, peerForm.notes)
      .then(res => {
        setShowPeerModal(false)
        setPeerForm({ evaluatorEmail: '', title: '', notes: '' })
        showToast("360° peer review request sent successfully!", "success")
        loadAllData(false)
      })
      .catch(err => showToast(err.message || "Evaluator user not found", "error"))
      .finally(() => setSubmitting(false))
  }

  function handleScheduleAssessment(e) {
    e.preventDefault()
    if (!scheduleForm.targetUserEmail || !scheduleForm.title) {
      showToast("Please fill in target email and title", "error")
      return
    }

    setSubmitting(true)
    api.scheduleAssessment(scheduleForm)
      .then(res => {
        setShowScheduleModal(false)
        setScheduleForm({ targetUserEmail: '', title: '', type: 'SELF_ASSESSMENT', scheduledDate: '', dueDate: '', notes: '' })
        showToast("Assessment scheduled & automated reminder notification sent!", "success")
        loadAllData(false)
      })
      .catch(err => showToast(err.message || "Failed to schedule assessment", "error"))
      .finally(() => setSubmitting(false))
  }

  function handleRunComparison() {
    if (!compareId1 || !compareId2) {
      showToast("Please select two assessments to compare", "error")
      return
    }
    if (compareId1 === compareId2) {
      showToast("Please select two distinct assessments", "error")
      return
    }

    setLoadingComparison(true)
    api.compareAssessments(compareId1, compareId2)
      .then(res => {
        if (res) setComparisonResult(res)
      })
      .catch(err => showToast(err.message || "Failed to compare assessments", "error"))
      .finally(() => setLoadingComparison(false))
  }

  function showToast(message, type = "success") {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  function toggleExpand(id) {
    setExpandedDetails(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const completedAssessments = assessments.filter(a => a.status === 'COMPLETED')
  const completedCount = completedAssessments.length
  const pendingCount = pendingEvaluations.length
  const scores = completedAssessments.filter(a => a.overallScore !== null).map(a => a.overallScore)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

  const PROFICIENCY_LABELS = {
    1: '1 - Unaware',
    2: '2 - Beginner',
    3: '3 - Intermediate',
    4: '4 - Advanced',
    5: '5 - Expert'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Icon name="loader-2" className="w-8 h-8 text-lime-400 animate-spin" />
        <span className="text-xs text-slate-400">Loading Assessment & Survey Module…</span>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-6">
      {/* Toast Banner */}
      {toast && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold shadow-lg fade-in ${
          toast.type === 'error' 
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          <div className="flex items-center gap-2">
            <Icon name={toast.type === 'error' ? 'alert-triangle' : 'check-circle'} className="w-4 h-4 shrink-0" />
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="hover:opacity-75">
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Module 8 Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Assessment & Survey Portal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Module 8: Self-assessments, 360° peer reviews, manager evaluations, scheduling & live gap recalculation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenQuestionnaire}
            className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-4 py-2.5 transition-all flex items-center gap-2 shadow-md"
          >
            <Icon name="clipboard-check" className="w-4 h-4" />
            Take Self-Assessment
          </button>

          <button
            type="button"
            onClick={() => setShowPeerModal(true)}
            className="bg-white dark:bg-[#0F1420] hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-white font-semibold text-xs rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2.5 transition-all flex items-center gap-2"
          >
            <Icon name="users" className="w-4 h-4 text-indigo-400" />
            Request 360° Peer Review
          </button>
        </div>
      </div>

      {/* Portal Tabs Bar */}
      <div className="flex overflow-x-auto bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-1.5 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ai' 
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-300 hover:text-white'
          }`}
        >
          <Icon name="sparkles" className="w-3.5 h-3.5 text-lime-300 animate-pulse" /> 🤖 AI Domain Assessment
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('self')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'self' ? 'bg-lime-400 text-[#0B0F1A] shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-white'
          }`}
        >
          <Icon name="clipboard-check" className="w-3.5 h-3.5" /> Self-Assessments & Builder
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap relative ${
            activeTab === 'queue' ? 'bg-lime-400 text-[#0B0F1A] shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-white'
          }`}
        >
          <Icon name="users" className="w-3.5 h-3.5" /> 360° & Manager Evaluation Queue
          {pendingCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">{pendingCount}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scheduling')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'scheduling' ? 'bg-lime-400 text-[#0B0F1A] shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-white'
          }`}
        >
          <Icon name="calendar" className="w-3.5 h-3.5" /> Scheduling & Reminders
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('compare')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'compare' ? 'bg-lime-400 text-[#0B0F1A] shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-white'
          }`}
        >
          <Icon name="git-pull-request" className="w-3.5 h-3.5" /> Historical Comparison
        </button>
      </div>

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-lime-500/10 text-lime-400 flex items-center justify-center shrink-0">
            <Icon name="check-circle" className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Completed Assessments</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">{completedCount}</span>
          </div>
        </div>

        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Icon name="award" className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Skill Velocity Score</span>
            <span className="text-xl font-bold text-indigo-400 mt-0.5 block">
              {avgScore !== null ? `${avgScore}%` : 'Not Assessed'}
            </span>
          </div>
        </div>

        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Icon name="clock" className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Pending Evaluations</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* TAB 0: AI DOMAIN ASSESSMENT */}
      {activeTab === 'ai' && (
        <div className="space-y-6 fade-in">
          {/* STEP 1: SETUP */}
          {aiStep === 'setup' && (
            <div className="space-y-6">
              <div className="card bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Icon name="sparkles" className="w-48 h-48 text-indigo-400" />
                </div>
                <div className="relative z-10 max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                    <Icon name="sparkles" className="w-3.5 h-3.5 text-lime-400 animate-pulse" />
                    Powered by Gemini 1.5 Flash AI
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">AI Adaptive Domain Skill Assessment</h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Select a course or domain topic below. Gemini AI will construct tailored multiple-choice questions to evaluate your real-world technical competency. Test results automatically update your employee skill profile and recalculate gap analysis in real time!
                  </p>
                </div>
              </div>

              {/* Domain & Topic Selection */}
              <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2 uppercase tracking-wider">
                    1. Select Enrolled Course / Domain Topic
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                    {[
                      { name: 'Data Analytics', desc: 'SQL, Python & Statistics', icon: 'database' },
                      { name: 'React & Frontend', desc: 'Hooks, State & UI Architecture', icon: 'layout' },
                      { name: 'Java Spring Boot', desc: 'Microservices & JPA Persistence', icon: 'server' },
                      { name: 'Cloud & DevOps', desc: 'Docker, CI/CD & AWS Infrastructure', icon: 'cloud' },
                      { name: 'Marketing Strategy', desc: 'SEO, Content & Campaign ROI', icon: 'trending-up' },
                      { name: 'HR Operations', desc: 'Talent Acquisition & Compliance', icon: 'users' }
                    ].map(d => (
                      <button
                        key={d.name}
                        type="button"
                        onClick={() => setAiDomain(d.name)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          aiDomain === d.name
                            ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300 dark:text-indigo-200 shadow-sm'
                            : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200/70 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-indigo-500/40'
                        }`}>
                        <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                          <Icon name={d.icon} className={`w-4 h-4 ${aiDomain === d.name ? 'text-indigo-400' : 'text-slate-400'}`} />
                          <span>{d.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block line-clamp-1">{d.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold shrink-0">Or Custom Topic:</span>
                    <input
                      type="text"
                      value={aiDomain}
                      onChange={(e) => setAiDomain(e.target.value)}
                      placeholder="e.g. System Design, Cybersecurity, Machine Learning..."
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Difficulty & Question Count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-white/5">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2 uppercase tracking-wider">
                      2. Difficulty Level
                    </label>
                    <div className="flex gap-2">
                      {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setAiDifficulty(diff)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${
                            aiDifficulty === diff
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-800'
                          }`}>
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2 uppercase tracking-wider">
                      3. Question Count
                    </label>
                    <div className="flex gap-2">
                      {[3, 5, 10].map(cnt => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setAiQuestionCount(cnt)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${
                            aiQuestionCount === cnt
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-800'
                          }`}>
                          {cnt} Questions
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={() => handleGenerateAiTest()}
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {aiLoading ? (
                      <>
                        <Icon name="loader-2" className="w-5 h-5 animate-spin" />
                        Generating Assessment via Gemini AI...
                      </>
                    ) : (
                      <>
                        <Icon name="sparkles" className="w-5 h-5 text-lime-300" />
                        Launch AI Assessment for {aiDomain}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: QUIZ INTERACTION */}
          {aiStep === 'quiz' && aiQuestions.length > 0 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Stepper Header */}
              <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleResetAiTest}
                    className="text-slate-400 hover:text-slate-200 flex items-center gap-1 font-semibold">
                    <Icon name="arrow-left" className="w-3.5 h-3.5" /> Cancel Test
                  </button>
                  <span className="font-bold text-indigo-400">
                    Question {currentQIndex + 1} of {aiQuestions.length}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20 text-[10px]">
                    {aiDomain} • {aiDifficulty}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full transition-all duration-300"
                    style={{ width: `${((currentQIndex + 1) / aiQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Active Question Card */}
              {(() => {
                const q = aiQuestions[currentQIndex]
                const selectedOpt = userAnswers[q.id]

                return (
                  <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 shadow-md">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          {q.targetSkill || aiDomain}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-400">
                          {q.difficulty || aiDifficulty}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {q.questionText}
                      </h3>
                    </div>

                    {/* Radio Options */}
                    <div className="space-y-3">
                      {q.options && q.options.map((optText, optIdx) => {
                        const isSelected = selectedOpt === optIdx
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? 'bg-indigo-600/15 border-indigo-500 text-indigo-200 shadow-sm ring-1 ring-indigo-500'
                                : 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/70 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 text-slate-800 dark:text-slate-200'
                            }`}>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 dark:border-white/20'
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className="text-xs sm:text-sm font-medium leading-relaxed">{optText}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={currentQIndex === 0}
                          onClick={() => setCurrentQIndex(prev => prev - 1)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/5">
                          Previous
                        </button>

                        <button
                          type="button"
                          onClick={handleResetAiTest}
                          className="px-4 py-2 rounded-xl text-xs font-semibold border border-rose-500/20 text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-colors">
                          Cancel Test
                        </button>
                      </div>

                      {currentQIndex < aiQuestions.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentQIndex(prev => prev + 1)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all">
                          Next Question &rarr;
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={evaluating}
                          onClick={handleSubmitAiQuiz}
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50">
                          {evaluating ? (
                            <>
                              <Icon name="loader-2" className="w-4 h-4 animate-spin" /> Evaluating with Gemini AI...
                            </>
                          ) : (
                            <>
                              <Icon name="check-circle" className="w-4 h-4" /> Submit Test for AI Evaluation
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* STEP 3: RESULTS & EVALUATION DASHBOARD */}
          {aiStep === 'results' && aiEvaluation && (
            <div className="space-y-6 fade-in max-w-4xl mx-auto">
              {/* Overall Score Header */}
              <div className="card bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    <Icon name="check-circle-2" className="w-4 h-4 text-emerald-400" /> Test Completed & Saved
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{aiEvaluation.domain} AI Assessment</h2>
                  <p className="text-xs text-slate-300">
                    Grade: <strong className="text-lime-300">{aiEvaluation.grade}</strong> • Difficulty: {aiEvaluation.difficulty}
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl shrink-0">
                  <div className="text-center">
                    <span className="text-3xl sm:text-4xl font-extrabold text-lime-400 block">{aiEvaluation.overallScore}%</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Overall Accuracy</span>
                  </div>
                  <div className="h-10 w-px bg-white/10" />
                  <div className="text-center">
                    <span className="text-lg font-bold text-white block">{aiEvaluation.correctCount} / {aiEvaluation.totalQuestions}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Correct Answers</span>
                  </div>
                </div>
              </div>

              {/* Gemini AI Performance Report Card */}
              <div className="card bg-white dark:bg-[#0F1420] border border-indigo-500/20 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  <Icon name="sparkles" className="w-4 h-4 text-lime-400" /> Gemini AI Evaluator Summary
                </div>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-200/60 dark:border-white/5">
                  {aiEvaluation.aiFeedback}
                </div>
              </div>

              {/* Assessed Skill Proficiency Updates */}
              {aiEvaluation.skillProficiencies && Object.keys(aiEvaluation.skillProficiencies).length > 0 && (
                <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Icon name="award" className="w-4 h-4 text-lime-400" /> Live Employee Skill Level Updates Applied
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(aiEvaluation.skillProficiencies).map(([sName, pLevel]) => (
                      <div key={sName} className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">{sName}</span>
                          <span className="text-[10px] text-slate-400">Evaluated proficiency rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lime-400 bg-lime-400/10 px-2.5 py-1 rounded-lg">
                            Level {pLevel}/5
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Question Review */}
              <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Icon name="file-text" className="w-4 h-4 text-indigo-400" /> Question-by-Question Review & Rationale
                </h4>

                <div className="space-y-4 divide-y divide-slate-100 dark:divide-white/5">
                  {aiEvaluation.evaluatedQuestions && aiEvaluation.evaluatedQuestions.map((q, idx) => {
                    const isCorrect = q.isCorrect
                    const selectedIdx = q.selectedOption
                    const correctIdx = q.correctOptionIndex
                    const opts = q.options || []

                    return (
                      <div key={idx} className="pt-4 first:pt-0 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                            isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {isCorrect ? '✓' : '✕'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                              {idx + 1}. {q.questionText}
                            </h5>
                            <div className="mt-2 space-y-1.5 text-xs">
                              <div className={`p-2 rounded-lg ${isCorrect ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                                <strong className="font-semibold">Your Answer:</strong> {opts[selectedIdx] || `Option ${selectedIdx + 1}`}
                              </div>
                              {!isCorrect && (
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300">
                                  <strong className="font-semibold">Correct Answer:</strong> {opts[correctIdx] || `Option ${correctIdx + 1}`}
                                </div>
                              )}
                              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                                💡 <strong>AI Rationale:</strong> {q.explanation}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAiTest}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5">
                  <Icon name="rotate-ccw" className="w-4 h-4" /> Take Another AI Test
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('self')}
                    className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white hover:bg-slate-50 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all">
                    View in History &rarr;
                  </button>
                  {onNav && (
                    <button
                      type="button"
                      onClick={() => onNav('skills')}
                      className="bg-lime-400 text-[#0B0F1A] font-bold text-xs px-4 py-2.5 rounded-xl transition-all hover:bg-lime-300 shadow-md flex items-center gap-1.5">
                      <Icon name="layers" className="w-3.5 h-3.5" />
                      View My Skill Inventory &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: SELF-ASSESSMENTS & BUILDER */}
      {activeTab === 'self' && (
        <div className="space-y-6 fade-in">
          <div className="flex items-center justify-between">
            <SectionHead title="Skill Self-Assessments" sub="Completed self-evaluations and custom questionnaire templates" />
            <button
              type="button"
              onClick={() => setShowBuilderModal(true)}
              className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 hover:bg-slate-50 text-slate-800 dark:text-white text-xs font-bold rounded-xl px-4 py-2 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Icon name="plus" className="w-3.5 h-3.5 text-lime-400" /> Create Custom Questionnaire
            </button>
          </div>

          {/* Custom Templates List */}
          {customQuestionnaires.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400">Custom Questionnaire Templates</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customQuestionnaires.map((cq) => (
                  <div key={cq.id} className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-300">{cq.title}</span>
                        <Pill text={cq.targetRole || "All Roles"} className="bg-indigo-500/20 text-indigo-300" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{cq.description || "Custom skill evaluation questionnaire."}</p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-indigo-500/10">
                      <span>By: {cq.createdBy}</span>
                      <button onClick={handleOpenQuestionnaire} className="text-lime-400 font-bold hover:underline">Start &rarr;</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Self-Assessments */}
          {assessments.length === 0 ? (
            <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-8 text-center flex flex-col items-center">
              <Icon name="clipboard-check" className="w-8 h-8 text-slate-400 mb-2" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No assessments taken yet</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">Complete your first self-assessment to start tracking your role benchmark progress.</p>
              <button onClick={handleOpenQuestionnaire} className="bg-lime-400 text-[#0B0F1A] text-xs font-bold rounded-xl px-4 py-2">Start Assessment</button>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map((a) => {
                const isExpanded = !!expandedDetails[a.id]
                let dateStr = 'Just now'
                try {
                  const targetDate = a.submittedAt || a.createdAt
                  if (targetDate) {
                    dateStr = new Date(targetDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                  }
                } catch (e) {
                  console.error("Invalid date:", e)
                }

                return (
                  <div key={a.id} className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 transition-all space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          <Icon name="clipboard-check" className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{a.title}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                              {a.type}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 mt-1 block">📅 Submitted on {dateStr}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {a.overallScore !== null && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-medium">Overall Score</span>
                            <span className="text-sm font-bold text-lime-400">{a.overallScore}%</span>
                          </div>
                        )}
                        <Pill text={a.status} className={statusColor(a.status)} />
                        {a.responses && a.responses.length > 0 && (
                          <button onClick={() => toggleExpand(a.id)} className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-300">
                            <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && a.responses && (
                      <div className="pt-3 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 fade-in">
                        {a.responses.map((r, i) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block">{r.skillName}</span>
                              <span className="text-[10px] text-slate-400">{r.categoryName}</span>
                            </div>
                            <span className="font-bold text-lime-400 bg-lime-400/10 px-2.5 py-1 rounded-lg ml-2">{r.proficiencyLevel}/5</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 360° PEER & MANAGER EVALUATION QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-6 fade-in">
          <SectionHead title="360° Peer & Manager Evaluation Queue" sub="Incoming review requests assigned to you for evaluation" />

          {pendingEvaluations.length === 0 ? (
            <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-8 text-center flex flex-col items-center">
              <Icon name="users" className="w-8 h-8 text-indigo-400 mb-2" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No pending evaluations assigned</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">When colleagues or direct reports request 360° peer or manager evaluations, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEvaluations.map((pe) => (
                <div key={pe.id} className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                      <Icon name="users" className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{pe.title}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          {pe.type === 'PEER_360' ? '360° Peer Review' : 'Manager Evaluation'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 mt-1 block">Target Employee: <strong className="text-slate-200">{pe.userName}</strong></span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEvaluationModal(pe)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl px-4 py-2.5 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md"
                  >
                    <Icon name="edit-3" className="w-4 h-4" /> Start Evaluation
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCHEDULING & REMINDERS */}
      {activeTab === 'scheduling' && (
        <div className="space-y-6 fade-in">
          <div className="flex items-center justify-between">
            <SectionHead title="Assessment Scheduling & Reminders" sub="Schedule upcoming reviews with due dates and automated notifications" />
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-4 py-2.5 transition-all flex items-center gap-2 shadow-md shrink-0"
            >
              <Icon name="calendar" className="w-4 h-4" /> Schedule Assessment
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Icon name="clock" className="w-4 h-4 text-amber-400" /> Active Scheduling Timeline
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scheduled assessments automatically trigger reminder notifications to employee dashboards 3 days prior to due dates.
              </p>
            </div>

            <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Icon name="bell" className="w-4 h-4 text-lime-400" /> Automated Reminders
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                System notifications will alert employees and evaluators of upcoming due dates in real time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HISTORICAL COMPARISON */}
      {activeTab === 'compare' && (
        <div className="space-y-6 fade-in">
          <SectionHead title="Historical Assessment Comparison" sub="Compare ratings side-by-side to track progression over time" />

          {assessments.length < 2 ? (
            <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-8 text-center flex flex-col items-center">
              <Icon name="git-pull-request" className="w-8 h-8 text-indigo-400 mb-2" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Requires at least 2 completed assessments</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">Take multiple self-assessments or complete peer reviews over time to unlock side-by-side comparison analytics.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1.5">Baseline Assessment (A)</label>
                    <select
                      value={compareId1}
                      onChange={(e) => setCompareId1(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none"
                    >
                      <option value="">Select baseline assessment…</option>
                      {assessments.map(a => (
                        <option key={a.id} value={a.id}>{a.title} ({a.overallScore}%)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1.5">Recent Assessment (B)</label>
                    <select
                      value={compareId2}
                      onChange={(e) => setCompareId2(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none"
                    >
                      <option value="">Select comparison assessment…</option>
                      {assessments.map(a => (
                        <option key={a.id} value={a.id}>{a.title} ({a.overallScore}%)</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleRunComparison}
                    disabled={loadingComparison}
                    className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-5 py-2.5 transition-all flex items-center gap-2 shadow-md"
                  >
                    {loadingComparison ? <Icon name="loader-2" className="w-4 h-4 animate-spin" /> : <Icon name="git-pull-request" className="w-4 h-4" />}
                    Compare Assessments
                  </button>
                </div>
              </div>

              {/* Comparison Results Card */}
              {comparisonResult && (
                <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 space-y-6 fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">Comparison Results</h3>
                      <span className="text-xs text-slate-400">{comparisonResult.assessment1?.title} vs {comparisonResult.assessment2?.title}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">Score Delta:</span>
                      <span className={`text-base font-extrabold px-3 py-1 rounded-xl font-mono ${
                        comparisonResult.scoreDelta >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {comparisonResult.scoreDelta >= 0 ? `+${comparisonResult.scoreDelta}%` : `${comparisonResult.scoreDelta}%`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-400">Skill Level Breakdown Comparison</div>
                    <div className="grid grid-cols-1 gap-2">
                      {comparisonResult.skillDeltas?.map((sd, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{sd.skillName}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-slate-400">A: {sd.level1}/5</span>
                            <span className="text-slate-400">B: {sd.level2}/5</span>
                            <span className={`font-bold font-mono px-2 py-0.5 rounded-md ${
                              sd.levelDelta > 0 ? 'bg-emerald-500/20 text-emerald-300' : sd.levelDelta < 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-100 dark:bg-white/10 text-slate-400'
                            }`}>
                              {sd.levelDelta > 0 ? `+${sd.levelDelta}` : sd.levelDelta}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* QUESTIONNAIRE MODAL */}
      {showQuestionnaireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  {questionnaire?.title || 'Skill Self-Assessment'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {questionnaire?.description || 'Rate your proficiency on a 1–5 scale.'}
                </p>
              </div>
              <button onClick={() => { setShowQuestionnaireModal(false); setActiveEvalAssessment(null); }} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {loadingQuestionnaire ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Icon name="loader-2" className="w-8 h-8 text-lime-400 animate-spin" />
                  <span className="text-xs text-slate-400">Loading questionnaire…</span>
                </div>
              ) : questionnaire?.skills ? (
                questionnaire.skills.map((skillItem) => {
                  const currentRating = ratings[skillItem.skillId]?.level || 3

                  return (
                    <div key={skillItem.skillId} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{skillItem.skillName}</h4>
                          <span className="text-[11px] text-slate-400">{skillItem.categoryName} • Role Target: Level {skillItem.requiredProficiency}/5</span>
                        </div>
                        <span className="text-xs font-bold text-lime-400 bg-lime-400/10 px-3 py-1 rounded-lg border border-lime-400/20">
                          {PROFICIENCY_LABELS[currentRating]}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-2 pt-1">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleRatingChange(skillItem.skillId, lvl)}
                            className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                              currentRating === lvl
                                ? 'bg-lime-400 text-[#0B0F1A] shadow-md scale-[1.02]'
                                : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
                            }`}
                          >
                            <span>Lvl {lvl}</span>
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="Add notes or proof of experience (optional)…"
                        value={ratings[skillItem.skillId]?.notes || ''}
                        onChange={(e) => handleNotesChange(skillItem.skillId, e.target.value)}
                        className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-lime-400"
                      />
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">No questionnaire skills found.</div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-[#0B0F1A]/50">
              <button
                type="button"
                onClick={() => { setShowQuestionnaireModal(false); setActiveEvalAssessment(null); }}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmitAssessment}
                disabled={submitting}
                className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-5 py-2.5 transition-all flex items-center gap-2 shadow-md"
              >
                {submitting ? <Icon name="loader-2" className="w-4 h-4 animate-spin" /> : <Icon name="check" className="w-4 h-4" />}
                Submit Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM QUESTIONNAIRE BUILDER MODAL */}
      {showBuilderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Questionnaire Builder</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Create a custom skill evaluation questionnaire template.</p>
              </div>
              <button onClick={() => setShowBuilderModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomQuestionnaire} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Questionnaire Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer Competency Assessment"
                  value={builderForm.title}
                  onChange={(e) => setBuilderForm({ ...builderForm, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Target Role</label>
                <input
                  type="text"
                  placeholder="Software Engineer, Product Manager, etc."
                  value={builderForm.targetRole}
                  onChange={(e) => setBuilderForm({ ...builderForm, targetRole: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Description & Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Evaluate your core engineering proficiencies against company benchmarks…"
                  value={builderForm.description}
                  onChange={(e) => setBuilderForm({ ...builderForm, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-lime-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowBuilderModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-md">
                  {submitting ? <Icon name="loader-2" className="w-4 h-4 animate-spin" /> : <Icon name="check" className="w-4 h-4" />} Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PEER REVIEW REQUEST MODAL */}
      {showPeerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Request 360° Peer Review</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Invite a colleague or mentor to evaluate your skills.</p>
              </div>
              <button onClick={() => setShowPeerModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendPeerRequest} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Evaluator Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={peerForm.evaluatorEmail}
                  onChange={(e) => setPeerForm({ ...peerForm, evaluatorEmail: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Assessment Title</label>
                <input
                  type="text"
                  placeholder="360 Peer Evaluation Q3"
                  value={peerForm.title}
                  onChange={(e) => setPeerForm({ ...peerForm, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Notes for Evaluator</label>
                <textarea
                  rows={3}
                  placeholder="Please review my technical skills for the upcoming sprint benchmark…"
                  value={peerForm.notes}
                  onChange={(e) => setPeerForm({ ...peerForm, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowPeerModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-md">
                  {submitting ? <Icon name="loader-2" className="w-4 h-4 animate-spin" /> : <Icon name="send" className="w-4 h-4" />} Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULING MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Schedule Assessment</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Schedule a future review for yourself or a team member.</p>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleAssessment} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Target Employee Email *</label>
                <input
                  type="email"
                  required
                  placeholder="employee@company.com"
                  value={scheduleForm.targetUserEmail}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, targetUserEmail: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Assessment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Q4 Performance Review & Skill Assessment"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Assessment Type</label>
                <select
                  value={scheduleForm.type}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-lime-400"
                >
                  <option value="SELF_ASSESSMENT">Self Assessment</option>
                  <option value="PEER_360">360° Peer Review</option>
                  <option value="MANAGER_EVALUATION">Manager Evaluation</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Instructions & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Complete all domain skill ratings before the due date…"
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-lime-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-md">
                  {submitting ? <Icon name="loader-2" className="w-4 h-4 animate-spin" /> : <Icon name="calendar" className="w-4 h-4" />} Schedule Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ==============================================================================
// MODULE 1: KNOWLEDGE SHARING & MENTORSHIP ECOSYSTEM
// ==============================================================================
export function EmployeeMentorship({ user, onNav }) {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'my-mentorships' | 'requests' | 'sessions'
  const [myMentors, setMyMentors] = useState([])
  const [myMentees, setMyMentees] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)


  
  // Chat Drawer
  const [activeChat, setActiveChat] = useState(null) // MentorshipDto
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [meetingUrlInput, setMeetingUrlInput] = useState('')
  const [resourceForm, setResourceForm] = useState({ title: '', url: '' })
  const [showResourceModal, setShowResourceModal] = useState(false)

  // Session Modals & Host Engine
  const [hostSessionModal, setHostSessionModal] = useState(false)
  const [sessionForm, setSessionForm] = useState({ title: '', description: '', skillId: '', scheduledAt: '', durationMinutes: 60, capacity: 20, meetingLink: '' })
  const [eligibleHostSkills, setEligibleHostSkills] = useState([])
  const [feedbackModal, setFeedbackModal] = useState(null) // SessionDto
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' })
  const [confirmRegisterModal, setConfirmRegisterModal] = useState(null) // SessionDto to confirm

  const [attendanceModal, setAttendanceModal] = useState(null)

  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [mentorsRes, menteesRes, sessionsRes, hostSkillsRes] = await Promise.allSettled([
        api.getMyMentors(),
        api.getMyMentees(),
        api.getKnowledgeSessions(),
        api.getEligibleHostSkills()
      ])

      if (mentorsRes.status === 'fulfilled') setMyMentors(mentorsRes.value || [])
      if (menteesRes.status === 'fulfilled') setMyMentees(menteesRes.value || [])
      if (sessionsRes.status === 'fulfilled') setSessions(sessionsRes.value || [])
      if (hostSkillsRes.status === 'fulfilled') setEligibleHostSkills(hostSkillsRes.value || [])
    } catch (e) {
      console.error('Error loading mentorship data:', e)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Prevent page scroll/jump when modal opens; keep viewport locked at click location
  useEffect(() => {
    const hasModal = Boolean(hostSessionModal || feedbackModal || showResourceModal || confirmRegisterModal || attendanceModal)
    if (hasModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [hostSessionModal, feedbackModal, showResourceModal, confirmRegisterModal, attendanceModal])

  // Poll chat messages when chat drawer is open
  useEffect(() => {
    if (!activeChat) return
    let isSubscribed = true
    const fetchChat = () => {
      api.getMentorshipMessages(activeChat.id)
        .then(res => {
          if (isSubscribed && res) setMessages(res)
        })
        .catch(err => console.error('Chat error:', err))
    }
    fetchChat()
    const interval = setInterval(fetchChat, 3000)
    return () => {
      isSubscribed = false; clearInterval(interval)
    }
  }, [activeChat])

  const handleAcceptRequest = async (mentorshipId, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setMyMentees(prev => prev.map(m => m.id === mentorshipId ? { ...m, status: 'ACTIVE', startDate: new Date().toISOString() } : m))
    try {
      await api.acceptMentorship(mentorshipId)
      showToast('✓ Mentorship request accepted!')
      loadData(true)
    } catch (err) {
      showToast(`❌ Error: ${err.message}`)
      loadData(true)
    }
  }

  const handleRejectRequest = async (mentorshipId, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setMyMentees(prev => prev.map(m => m.id === mentorshipId ? { ...m, status: 'REJECTED' } : m))
    try {
      await api.rejectMentorship(mentorshipId)
      showToast('Mentorship request declined.')
      loadData(true)
    } catch (err) {
      showToast(`❌ Error: ${err.message}`)
      loadData(true)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!activeChat || !chatInput.trim()) return
    try {
      const newMsg = await api.sendMentorshipMessage(activeChat.id, {
        message: chatInput.trim(),
        messageType: 'TEXT'
      })
      setMessages(prev => [...prev, newMsg])
      setChatInput('')
    } catch (err) {
      showToast(`❌ Message failed: ${err.message}`)
    }
  }

  const handleShareMeetingLink = async (e) => {
    e.preventDefault()
    if (!activeChat || !meetingUrlInput.trim()) return
    try {
      const updated = await api.updateMeetingLink(activeChat.id, meetingUrlInput.trim())
      setActiveChat(updated)
      setMeetingUrlInput('')
      showToast('✓ Google Meet link shared successfully!')
      loadData(true)
    } catch (err) {
      showToast(`❌ Error: ${err.message}`)
    }
  }

  const handleShareResource = async (e) => {
    e.preventDefault()
    if (!activeChat || !resourceForm.url.trim() || !resourceForm.title.trim()) return
    try {
      await api.sendMentorshipMessage(activeChat.id, {
        message: `Shared Resource: ${resourceForm.title}`,
        messageType: 'RESOURCE',
        resourceUrl: resourceForm.url.trim(),
        resourceTitle: resourceForm.title.trim()
      })
      setShowResourceModal(false)
      setResourceForm({ title: '', url: '' })
      showToast('✓ Learning resource shared with mentee!')
    } catch (err) {
      showToast(`❌ Error: ${err.message}`)
    }
  }

  const handleCreateSession = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.createKnowledgeSession(sessionForm)
      showToast('✓ Knowledge sharing session created!')
      setHostSessionModal(false)
      setSessionForm({ title: '', description: '', skillId: '', scheduledAt: '', durationMinutes: 60, capacity: 20, meetingLink: '' })
      loadData(true)
    } catch (err) {
      showToast(`❌ Creation failed: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegisterSession = async (sessionId, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setSubmitting(true)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, isRegistered: true, registeredCount: (s.registeredCount || 0) + 1 } : s))
    try {
      await api.registerKnowledgeSession(sessionId)
      showToast('✓ Successfully registered for Knowledge Sharing Session!')
      setConfirmRegisterModal(null)
      loadData(true)
    } catch (err) {
      showToast(`❌ Registration failed: ${err.message}`)
      loadData(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelRegistration = async (sessionId, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, isRegistered: false, registeredCount: Math.max(0, (s.registeredCount || 1) - 1) } : s))
    try {
      await api.cancelKnowledgeSessionRegistration(sessionId)
      showToast('✓ Session registration cancelled.')
      loadData(true)
    } catch (err) {
      showToast(`❌ Cancel failed: ${err.message}`)
      loadData(true)
    }
  }

  const handleCancelSession = async (sessionId, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    try {
      await api.cancelKnowledgeSession(sessionId)
      showToast('✓ Knowledge session cancelled.')
      loadData(true)
    } catch (err) {
      showToast(`❌ Cancel session failed: ${err.message}`)
      loadData(true)
    }
  }

  const handleCompleteMentorship = async (mentorshipId, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setMyMentors(prev => prev.map(m => m.id === mentorshipId ? { ...m, status: 'COMPLETED' } : m))
    setMyMentees(prev => prev.map(m => m.id === mentorshipId ? { ...m, status: 'COMPLETED' } : m))
    try {
      await api.completeMentorship(mentorshipId)
      showToast('🎉 Mentorship marked as Completed!')
      loadData(true)
    } catch (err) {
      showToast(`❌ Failed to complete mentorship: ${err.message}`)
      loadData(true)
    }
  }

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()
    if (!feedbackModal) return
    setSubmitting(true)
    try {
      await api.submitSessionFeedback(feedbackModal.id, feedbackForm)
      showToast('✓ Thank you for your feedback!')
      setFeedbackModal(null)
      loadData(true)
    } catch (err) {
      showToast(`❌ Feedback error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const userDept = user?.departmentName || 'Engineering'



  const pendingIncoming = myMentees.filter(m => m.status === 'REQUESTED')
  const activeMenteesList = myMentees.filter(m => m.status === 'ACCEPTED' || m.status === 'ACTIVE')
  
  const pendingOutgoing = myMentors.filter(m => m.status === 'REQUESTED')
  const activeMentorsList = myMentors.filter(m => m.status === 'ACCEPTED' || m.status === 'ACTIVE')

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Icon name="loader-2" className="w-8 h-8 text-lime-400 animate-spin" />
        <div className="text-sm text-slate-400">Loading Mentorship & Knowledge Portal...</div>
      </div>
    )
  }

  return (
    <div className="stagger space-y-6">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 border border-lime-400/40 text-lime-300 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium flex items-center gap-2 fade-in">
          <Icon name="check-circle" className="w-4 h-4 text-lime-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Portal Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F1A] via-[#121B2D] to-[#0A1A17] p-6 sm:p-8 border border-white/5 shadow-2xl">
        <div className="grad-blob w-72 h-72 bg-lime-400/15 -top-12 right-6"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Pill text="Skill-Gap Driven" className="bg-emerald-400/15 text-emerald-300 border border-emerald-400/30" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">Knowledge Sharing & Mentorship</h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Connect with higher-proficiency mentors to close your personal skill gaps, host knowledge sessions, and share expert domain practices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setHostSessionModal(true)}
              className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-lg transition-colors"
            >
              <Icon name="video" className="w-4 h-4" /> Host Session
            </button>
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 border-b border-white/10 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Overview', icon: 'layout-dashboard' },
            { id: 'my-mentorships', label: `My Mentorships (${activeMentorsList.length + activeMenteesList.length})`, icon: 'users' },
            { id: 'requests', label: `Requests (${pendingIncoming.length + pendingOutgoing.length})`, icon: 'bell', badge: pendingIncoming.length },
            { id: 'sessions', label: `Knowledge Sessions (${sessions.length})`, icon: 'video' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-lime-400 text-lime-300 bg-lime-400/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon name={t.icon} className="w-4 h-4" />
              <span>{t.label}</span>
              {t.badge > 0 && (
                <span className="bg-red-500 text-white font-bold text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-lime-400 uppercase tracking-wider">My Mentors</span>
                <div className="w-8 h-8 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center">
                  <Icon name="user-check" className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeMentorsList.length}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">Experts guiding your skill gaps</div>
            </div>

            <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">My Mentees</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center">
                  <Icon name="users" className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeMenteesList.length}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">Employees you are guiding</div>
            </div>

            <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Knowledge Sessions</span>
                <div className="w-8 h-8 rounded-xl bg-purple-400/10 text-purple-400 flex items-center justify-center">
                  <Icon name="video" className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{sessions.length}</div>
              <div className="text-[11px] text-slate-500 mt-1">Upcoming domain workshops</div>
            </div>

            <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Connections</span>
                <div className="w-8 h-8 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center">
                  <Icon name="users" className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeMentorsList.length + activeMenteesList.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Active mentor/mentee pairs</div>
            </div>
          </div>

          {/* Dual Active Mentorship Summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Mentors Section */}
            <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📘 My Mentors</span>
                    <span className="text-xs text-lime-400 font-medium">(Guiding Me)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Experts helping you elevate your skill benchmarks.</p>
                </div>
              </div>

              {activeMentorsList.length === 0 ? (
                <div className="bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center">
                  <Icon name="user-check" className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">No active mentors yet</div>
                  <div className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">Mentors are assigned by your L&D Administrator based on AI skill-gap analysis.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeMentorsList.map(m => (
                    <div key={m.id} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-lime-400/20 text-lime-400 font-bold flex items-center justify-center shrink-0">
                          {m.mentorName ? m.mentorName[0] : 'M'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{m.mentorName}</span>
                            <span className="bg-lime-400/15 text-lime-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-lime-400/30">MENTOR</span>
                          </div>
                          <div className="text-xs text-slate-500">{m.mentorRole || 'Senior Engineer'} · <span className="text-lime-400 font-medium">{m.skillName}</span></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {m.meetingLink && (
                          <a href={m.meetingLink} target="_blank" rel="noreferrer" className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <Icon name="video" className="w-3.5 h-3.5" /> Meet
                          </a>
                        )}
                        <button onClick={() => { setActiveChat(m); setActiveTab('my-mentorships'); }} className="bg-lime-400 text-[#0B0F1A] hover:bg-lime-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <Icon name="message-square" className="w-3.5 h-3.5" /> Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Employees I Mentor Section */}
            <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🎓 My Mentees</span>
                    <span className="text-xs text-emerald-400 font-medium">(Employees I Am Guiding)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Team members receiving your domain expertise.</p>
                </div>
                <button onClick={() => setActiveTab('my-mentorships')} className="text-xs font-semibold text-lime-500 hover:underline flex items-center gap-1">
                  Manage <Icon name="chevron-right" className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeMenteesList.length === 0 ? (
                <div className="bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center">
                  <Icon name="users" className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">You are not mentoring anyone yet</div>
                  <div className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">Colleagues with lower proficiency in your expert skills will be assigned to you by L&D.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeMenteesList.map(m => (
                    <div key={m.id} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-400/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                          {m.menteeName ? m.menteeName[0] : 'E'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{m.menteeName}</span>
                            <span className="bg-emerald-400/15 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-400/30">MENTEE</span>
                          </div>
                          <div className="text-xs text-slate-500">{m.menteeRole || 'Developer'} · <span className="text-emerald-400 font-medium">{m.skillName}</span></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setActiveChat(m); setActiveTab('my-mentorships'); }} className="bg-lime-400 text-[#0B0F1A] hover:bg-lime-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <Icon name="message-square" className="w-3.5 h-3.5" /> Open Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Knowledge Sessions */}
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">Upcoming Knowledge Sharing Sessions</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live technical workshops hosted by domain experts.</p>
              </div>
              <button onClick={() => setActiveTab('sessions')} className="text-xs font-semibold text-lime-500 hover:underline flex items-center gap-1">
                View All ({sessions.length}) <Icon name="chevron-right" className="w-3.5 h-3.5" />
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">No upcoming sessions scheduled right now.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.slice(0, 2).map(s => (
                  <div key={s.id} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <Pill text={s.skillName || 'Engineering'} className="bg-purple-400/15 text-purple-300 border border-purple-400/30" />
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Icon name="users" className="w-3 h-3 text-slate-400" /> {s.registeredCount || 1}/{s.capacity || 20} Seats
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{s.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{s.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/5 text-xs">
                      <div className="text-slate-400">
                        Host: <span className="text-slate-200 font-semibold">{s.mentorName}</span>
                      </div>

                      {s.isRegistered ? (
                        <span className="bg-emerald-400/15 text-emerald-400 text-[11px] font-bold px-3 py-1 rounded-xl flex items-center gap-1">
                          <Icon name="check-circle" className="w-3 h-3" /> Registered
                        </span>
                      ) : (
                        <button onClick={() => handleRegisterSession(s.id)} className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs px-3 py-1 rounded-xl">
                          Register Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}



      {/* TAB 3: MY MENTORSHIPS & PERSISTENT CHAT */}
      {activeTab === 'my-mentorships' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Mentorship List */}
            <div className="lg:col-span-1 space-y-6">
              {/* Mentors View */}
              <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>📘 My Mentors</span>
                    <span className="text-[11px] text-lime-400 font-normal">(Guiding Me)</span>
                  </span>
                  <span className="bg-lime-400/15 text-lime-300 text-xs px-2.5 py-0.5 rounded-full font-bold">{activeMentorsList.length}</span>
                </h3>

                {activeMentorsList.length === 0 ? (
                  <div className="text-xs text-slate-400 italic text-center py-4">No active mentors.</div>
                ) : (
                  <div className="space-y-2">
                    {activeMentorsList.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setActiveChat(m)}
                        className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all ${
                          activeChat?.id === m.id
                            ? 'bg-lime-400/15 border border-lime-400/40 text-white'
                            : 'bg-slate-50 dark:bg-white/5 border border-transparent text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-lime-400/20 text-lime-400 font-bold text-xs flex items-center justify-center">
                            {m.mentorName ? m.mentorName[0] : 'M'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{m.mentorName}</span>
                              <span className="bg-lime-400/15 text-lime-400 text-[9px] font-bold px-1.5 py-0.2 rounded border border-lime-400/30">MENTOR</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{m.skillName}</div>
                          </div>
                        </div>
                        <Icon name="chevron-right" className="w-4 h-4 text-slate-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mentees View */}
              <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>🎓 My Mentees</span>
                    <span className="text-[11px] text-emerald-400 font-normal">(I Am Guiding)</span>
                  </span>
                  <span className="bg-emerald-400/15 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold">{activeMenteesList.length}</span>
                </h3>

                {activeMenteesList.length === 0 ? (
                  <div className="text-xs text-slate-400 italic text-center py-4">No active mentees.</div>
                ) : (
                  <div className="space-y-2">
                    {activeMenteesList.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setActiveChat(m)}
                        className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all ${
                          activeChat?.id === m.id
                            ? 'bg-emerald-400/15 border border-emerald-400/40 text-white'
                            : 'bg-slate-50 dark:bg-white/5 border border-transparent text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-400/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                            {m.menteeName ? m.menteeName[0] : 'E'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{m.menteeName}</span>
                              <span className="bg-emerald-400/15 text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-400/30">MENTEE</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{m.skillName}</div>
                          </div>
                        </div>
                        <Icon name="chevron-right" className="w-4 h-4 text-slate-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Chat Room & Shared Tools */}
            <div className="lg:col-span-2">
              {!activeChat ? (
                <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center">
                  <Icon name="message-square" className="w-12 h-12 text-slate-500 mb-3" />
                  <h3 className="font-bold text-base text-slate-800 dark:text-white">Select a Mentorship Conversation</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">Choose a mentor or mentee from the left sidebar to open real-time chat, share Google Meet links, or attach learning resources.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl flex flex-col h-[620px] shadow-xl overflow-hidden">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-lime-400/20 text-lime-400 font-bold flex items-center justify-center">
                        {activeChat.mentorId === user?.id ? (activeChat.menteeName ? activeChat.menteeName[0] : 'E') : (activeChat.mentorName ? activeChat.mentorName[0] : 'M')}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{activeChat.mentorId === user?.id ? activeChat.menteeName : activeChat.mentorName}</span>
                          <Pill text={activeChat.skillName} className="bg-purple-400/15 text-purple-300 text-[10px]" />
                          {activeChat.mentorId === user?.id ? (
                            <span className="bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              MENTEE
                            </span>
                          ) : (
                            <span className="bg-lime-400/15 text-lime-400 border border-lime-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              MENTOR
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {activeChat.mentorId === user?.id ? '🎓 You are the Mentor (Guiding Employee)' : '📘 You are the Mentee (Receiving Guidance)'} · <span className="text-emerald-400 font-bold">{activeChat.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeChat.status === 'ACTIVE' && (
                        <button onClick={() => handleCompleteMentorship(activeChat.id)} className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs rounded-xl px-3 py-2 border border-emerald-500/30 flex items-center gap-1 transition-all">
                          <Icon name="check-circle" className="w-3.5 h-3.5" /> Mark Completed
                        </button>
                      )}
                      <button onClick={() => setShowResourceModal(true)} className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-3.5 py-2 shadow-md flex items-center gap-1.5 transition-all">
                        <Icon name="link" className="w-3.5 h-3.5 text-[#0B0F1A]" /> Share Resource
                      </button>
                      <button onClick={() => setActiveChat(null)} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors" title="Close Chat">
                        <Icon name="x" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Meeting Link Bar */}
                  <div className="px-4 py-2.5 bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon name="video" className="w-4 h-4 text-emerald-400 shrink-0" />
                      {activeChat.meetingLink ? (
                        <a href={activeChat.meetingLink} target="_blank" rel="noreferrer" className="text-emerald-400 font-semibold truncate hover:underline">
                          Join Google Meet ({activeChat.meetingLink})
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No Google Meet link set for this session yet.</span>
                      )}
                    </div>

                    <form onSubmit={handleShareMeetingLink} className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        value={meetingUrlInput}
                        onChange={e => setMeetingUrlInput(e.target.value)}
                        className="bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 dark:text-white outline-none w-48"
                      />
                      <button type="submit" className="bg-emerald-400 hover:bg-emerald-300 text-[#0B0F1A] font-bold text-[11px] px-2.5 py-1 rounded-lg">
                        Set Link
                      </button>
                    </form>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-[#0B0F1A]/40">
                    {messages.length === 0 ? (
                      <div className="text-center text-xs text-slate-500 py-12">No messages yet. Send a message to start the conversation!</div>
                    ) : (
                      messages.map(msg => {
                        const isMine = msg.senderId === user?.id
                        return (
                          <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-md rounded-2xl p-3 text-xs leading-relaxed ${
                              isMine ? 'bg-lime-400 text-[#0B0F1A] rounded-br-none font-medium shadow-sm' : 'bg-slate-800 text-white rounded-bl-none border border-slate-700 shadow-sm'
                            }`}>
                              <div className="text-[10px] font-bold opacity-75 mb-1">{msg.senderName}</div>
                              <div>{msg.message}</div>
                              {msg.resourceUrl && (
                                <a href={msg.resourceUrl} target="_blank" rel="noreferrer" className={`mt-2 inline-flex items-center gap-1 font-bold underline ${isMine ? 'text-slate-900' : 'text-lime-400'}`}>
                                  <Icon name="external-link" className="w-3 h-3" /> {msg.resourceTitle || 'Open Attachment'}
                                </a>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-500 mt-1 px-1">
                              {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Chat Input Bar */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-2 bg-slate-50 dark:bg-white/5">
                    <input
                      type="text"
                      placeholder="Type a message to your mentor/mentee..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      className="flex-1 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white outline-none focus:border-lime-400"
                    />
                    <button type="submit" className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-4 py-2.5 flex items-center gap-1.5">
                      <Icon name="send" className="w-3.5 h-3.5" /> Send
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REQUESTS (INCOMING & OUTGOING) */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Incoming Assignments & Requests Section */}
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Icon name="bell" className="w-5 h-5 text-lime-400" /> Mentee Assignments & Requests
              </h2>
              <span className="text-xs font-bold text-slate-400">{pendingIncoming.length} Pending Review</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Review mentee assignments from your L&D Administrator and peer mentorship requests. You can accept to start guiding them or decline.
            </p>

            {pendingIncoming.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-8 text-center bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                <Icon name="check-circle" className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="font-semibold text-slate-300">All caught up!</div>
                <div className="mt-1">No pending mentee assignments or requests right now.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingIncoming.map(req => (
                  <div key={req.id} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-purple-400/40 transition-all">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center">
                          {req.menteeName ? req.menteeName[0] : 'E'}
                        </div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{req.menteeName}</span>
                        <Pill text={req.skillName} className="bg-lime-400/15 text-lime-300 text-[10px]" />
                        {req.matchScore && (
                          <span className="bg-lime-400/10 text-lime-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-lime-400/20">
                            {req.matchScore}% Match
                          </span>
                        )}
                        {req.assignedByName ? (
                          <span className="bg-purple-400/15 text-purple-300 border border-purple-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                            <Icon name="shield-check" className="w-3 h-3 text-purple-400" /> Assigned by L&D: {req.assignedByName}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Peer Request</span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300">
                        <span className="text-slate-400">Goal:</span> <span className="font-medium text-slate-200">{req.goal}</span>
                      </div>

                      {req.requestMessage && (
                        <p className="text-xs text-slate-300 bg-black/20 p-2.5 rounded-xl italic border border-white/5">
                          "{req.requestMessage}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleRejectRequest(req.id, e)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-colors flex items-center gap-1"
                      >
                        <Icon name="x" className="w-3.5 h-3.5" /> Decline
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleAcceptRequest(req.id, e)}
                        className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-1.5 shadow-md transition-colors"
                      >
                        <Icon name="check" className="w-3.5 h-3.5" /> Accept Mentorship
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests / Pending Assignments Section */}
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1">My Mentorship Assignments (Pending Acceptance)</h2>
            <p className="text-xs text-slate-400 mb-4">Mentors assigned to you by L&D that are awaiting mentor acceptance.</p>

            {pendingOutgoing.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-4 text-center">No pending mentorship assignments awaiting acceptance.</div>
            ) : (
              <div className="space-y-3">
                {pendingOutgoing.map(req => (
                  <div key={req.id} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Assigned Mentor: {req.mentorName}</span>
                        {req.assignedByName && (
                          <span className="bg-purple-400/15 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-400/30">
                            By {req.assignedByName}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Skill: <span className="text-lime-300 font-medium">{req.skillName}</span> · Status: <span className="text-amber-400 font-semibold">{req.status === 'REQUESTED' ? 'Pending Mentor Acceptance' : req.status}</span>
                      </div>
                    </div>
                    <span className="bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Awaiting Acceptance
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: KNOWLEDGE SHARING SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Knowledge Sharing Sessions</h2>
              <p className="text-xs text-slate-400">Live technical workshops, peer learning sessions, and Q&A forums.</p>
            </div>
            <button onClick={() => setHostSessionModal(true)} className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-4 py-2.5 flex items-center gap-2">
              <Icon name="plus" className="w-4 h-4" /> Host New Session
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(s => (
              <div key={s.id} className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Pill text={s.skillName || 'Engineering'} className="bg-purple-400/15 text-purple-300 border border-purple-400/30 text-[10px]" />
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Icon name="users" className="w-3.5 h-3.5 text-slate-400" /> {s.registeredCount}/{s.capacity}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">{s.description}</p>

                  <div className="space-y-2 text-xs bg-slate-50 dark:bg-white/5 p-3 rounded-2xl mb-4">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Host / Expert:</span>
                      <span className="text-slate-200 font-semibold">{s.mentorName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Rating:</span>
                      <span className="text-lime-400 font-bold flex items-center gap-1">
                        ★ {s.averageRating || 4.9} ({s.feedbackCount || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  {s.meetingLink && (
                    <a href={s.meetingLink} target="_blank" rel="noreferrer" className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-2">
                      <Icon name="video" className="w-3.5 h-3.5" /> Join Live Google Meet
                    </a>
                  )}

                  {s.mentorId === user?.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setAttendanceModal(s)} className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs py-2 rounded-xl border border-purple-500/30 flex items-center justify-center gap-1.5">
                          <Icon name="check-square" className="w-3.5 h-3.5" /> Attendance
                        </button>
                        <button onClick={() => handleCancelSession(s.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs px-3 py-2 rounded-xl border border-red-500/20">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : s.isRegistered ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="flex-1 bg-emerald-400/15 text-emerald-400 font-bold text-xs py-2 rounded-xl text-center border border-emerald-400/30">
                          ✓ Registered
                        </span>
                        <button onClick={() => setFeedbackModal(s)} className="bg-white/10 hover:bg-white/15 text-white font-medium text-xs px-3 py-2 rounded-xl border border-white/10">
                          Rate
                        </button>
                      </div>
                      <button onClick={() => handleCancelRegistration(s.id)} className="w-full text-slate-400 hover:text-red-400 text-[11px] underline text-center">
                        Cancel Registration
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRegisterModal(s)}
                      disabled={s.registeredCount >= s.capacity}
                      className="w-full bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-[#0B0F1A] font-bold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Icon name="check-circle" className="w-3.5 h-3.5" />
                      {s.registeredCount >= s.capacity ? 'Session Full' : 'Register for Session'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* CONFIRM SESSION REGISTRATION MODAL */}
      {confirmRegisterModal && createPortal(
        <div className="fixed inset-0 z-[99999] overflow-y-auto">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={() => setConfirmRegisterModal(null)} />
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div className="relative transform overflow-hidden rounded-3xl bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 text-left shadow-2xl transition-all w-full max-w-md my-8 p-6 z-10 animate-scale space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="flex items-center gap-2 text-lime-400 font-bold text-sm">
                  <Icon name="video" className="w-5 h-5" />
                  <span>Confirm Session Registration</span>
                </div>
                <button onClick={() => setConfirmRegisterModal(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{confirmRegisterModal.title}</h3>
                <p className="text-xs text-slate-400 mt-1">Hosted by <span className="text-lime-300 font-medium">{confirmRegisterModal.mentorName}</span></p>
                <div className="mt-3 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl space-y-1.5 text-xs text-slate-300">
                  <div>📅 Topic / Skill: <span className="text-white font-semibold">{confirmRegisterModal.skillName || 'Engineering'}</span></div>
                  <div>⏱ Duration: {confirmRegisterModal.durationMinutes || 60} Minutes</div>
                  <div>👥 Capacity: {confirmRegisterModal.registeredCount}/{confirmRegisterModal.capacity} Registered</div>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Would you like to register for this live knowledge sharing session? Your mentor will be notified, and meeting details will be saved to your dashboard.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={() => setConfirmRegisterModal(null)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
                <button
                  onClick={() => handleRegisterSession(confirmRegisterModal.id)}
                  disabled={submitting}
                  className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-md"
                >
                  {submitting ? <Icon name="loader-2" className="w-4 h-4 animate-spin" /> : <Icon name="check-circle" className="w-4 h-4" />} Confirm Registration
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}



      {/* HOST KNOWLEDGE SESSION MODAL */}
      {hostSessionModal && createPortal(
        <div className="fixed inset-0 z-[99999] overflow-y-auto">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={() => setHostSessionModal(false)} />
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div className="relative transform overflow-hidden rounded-3xl bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 text-left shadow-2xl transition-all w-full max-w-lg my-8 z-10 animate-scale">
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Host Knowledge Sharing Session</h2>
                  <p className="text-xs text-slate-400">Schedule a live technical workshop or peer learning session.</p>
                </div>
                <button onClick={() => setHostSessionModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>

              {/* Host Eligibility Engine Status Banner */}
              {eligibleHostSkills.length === 0 ? (
                <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
                  <Icon name="shield-alert" className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-200 text-xs mb-0.5">High Skill Proficiency Gate (90%+ Required)</div>
                    <div className="text-[11px] text-amber-300/90 leading-relaxed">
                      To guarantee high technical quality, employees can host knowledge sessions once they achieve <strong>90%+ Expert Mastery (Level 4+ or Level 5/5)</strong> in their domain skills. Currently you have 0 evaluated skills at 90%+.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mx-6 mt-4 p-3 rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-300 text-xs flex items-center gap-2">
                  <Icon name="check-circle" className="w-4 h-4 text-lime-400 shrink-0" />
                  <span>Eligible Host: You hold <strong>90%+ Expert Mastery</strong> in {eligibleHostSkills.length} domain topic(s).</span>
                </div>
              )}

              <form onSubmit={handleCreateSession} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Topic / Domain Skill (Requires 90%+ Mastery) *</label>
                  <select
                    required
                    value={sessionForm.skillId}
                    onChange={e => setSessionForm({ ...sessionForm, skillId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-lime-400"
                  >
                    <option value="" className="bg-[#0F1420]">-- Select High-Proficiency Skill Topic --</option>
                    {eligibleHostSkills.map(sk => (
                      <option key={sk.id} value={sk.id} className="bg-[#0F1420]">
                        {sk.name} ({sk.proficiencyLevel}/5 Mastery - 90%+ Eligible)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Session Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Production Spring Boot Microservices Patterns"
                    value={sessionForm.title}
                    onChange={e => setSessionForm({ ...sessionForm, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Description *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Summary of topics covered, prerequisites, and learning objectives..."
                    value={sessionForm.description}
                    onChange={e => setSessionForm({ ...sessionForm, description: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-lime-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1.5">Capacity</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={sessionForm.capacity}
                      onChange={e => setSessionForm({ ...sessionForm, capacity: parseInt(e.target.value) || 20 })}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-lime-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1.5">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={sessionForm.durationMinutes}
                      onChange={e => setSessionForm({ ...sessionForm, durationMinutes: parseInt(e.target.value) || 60 })}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-lime-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Google Meet Link</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={sessionForm.meetingLink}
                    onChange={e => setSessionForm({ ...sessionForm, meetingLink: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-lime-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setHostSessionModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
                  <button type="submit" disabled={submitting || eligibleHostSkills.length === 0} className="bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-[#0B0F1A] font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-md">
                    {submitting ? <Icon name="loader-2" className="w-4 h-4 animate-spin" /> : <Icon name="check" className="w-4 h-4" />} Create Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* FEEDBACK RATING MODAL */}
      {feedbackModal && createPortal(
        <div className="fixed inset-0 z-[99999] overflow-y-auto">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={() => setFeedbackModal(null)} />
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div className="relative transform overflow-hidden rounded-3xl bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 text-left shadow-2xl transition-all w-full max-w-md my-8 p-6 z-10 animate-scale space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Session Feedback</h3>
                  <div className="text-xs text-slate-400">{feedbackModal.title}</div>
                </div>
                <button onClick={() => setFeedbackModal(null)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">Rate Session Quality (1 - 5 Stars)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                          feedbackForm.rating >= star
                            ? 'bg-amber-400 text-slate-900 shadow-md scale-105'
                            : 'bg-white/5 text-slate-500 hover:text-white'
                        }`}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Comments & Effectiveness Feedback</label>
                  <textarea
                    rows={3}
                    placeholder="Share what you learned and feedback for the mentor..."
                    value={feedbackForm.comment}
                    onChange={e => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-lime-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setFeedbackModal(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
                  <button type="submit" disabled={submitting} className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-5 py-2.5">
                    Submit Rating
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* SHARE RESOURCE MODAL */}
      {showResourceModal && activeChat && createPortal(
        <div className="fixed inset-0 z-[99999] overflow-y-auto">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={() => setShowResourceModal(false)} />
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div className="relative transform overflow-hidden rounded-3xl bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 text-left shadow-2xl transition-all w-full max-w-md my-8 p-6 z-10 animate-scale space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Share Learning Resource</h3>
                <button onClick={() => setShowResourceModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleShareResource} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Resource Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spring Security JWT Documentation"
                    value={resourceForm.title}
                    onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">URL / Link *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://docs.spring.io/..."
                    value={resourceForm.url}
                    onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-lime-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setShowResourceModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
                  <button type="submit" className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-5 py-2.5">
                    Share Resource
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}



      {/* MARK ATTENDANCE MODAL */}
      {attendanceModal && createPortal(
        <div className="fixed inset-0 z-[99999] overflow-y-auto">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={() => setAttendanceModal(null)} />
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div className="relative transform overflow-hidden rounded-3xl bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 text-left shadow-2xl transition-all w-full max-w-md my-8 p-6 z-10 animate-scale space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Session Attendance Checklist</h3>
                  <div className="text-xs text-slate-400">{attendanceModal.title}</div>
                </div>
                <button onClick={() => setAttendanceModal(null)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  As the session host, confirm participant attendance to record completed knowledge sharing hours.
                </p>
                <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Registered Seats:</span>
                    <span className="font-bold text-white">{attendanceModal.registeredCount}/{attendanceModal.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <span className="font-bold text-lime-400">{attendanceModal.durationMinutes || 60} Mins</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button onClick={() => setAttendanceModal(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Close</button>
                <button
                  onClick={() => {
                    api.updateSessionAttendance(attendanceModal.id, 'ATTENDED')
                      .then(() => { showToast('✓ Attendance finalized and recorded.'); setAttendanceModal(null); loadData(); })
                      .catch(err => showToast(`❌ Error: ${err.message}`))
                  }}
                  className="bg-emerald-400 hover:bg-emerald-300 text-[#0B0F1A] font-bold text-xs rounded-xl px-5 py-2.5"
                >
                  Mark All Attended
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

