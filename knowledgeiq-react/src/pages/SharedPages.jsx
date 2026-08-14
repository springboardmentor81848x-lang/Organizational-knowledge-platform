import React, { useState, useEffect } from 'react'
import Icon from '../components/Icon.jsx'
import { Pill, SectionHead } from '../components/Bits.jsx'
import { ROLE_META } from '../data.js'
import EditProfileModal, { Toast } from '../components/EditProfileModal.jsx'
import api from '../services/api.js'

const API_BASE = ''

// ── ProfilePage ───────────────────────────────────────────────────────────────
export function ProfilePage({ role, user: appUser }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [achievements, setAchievements] = useState([])

  // Fetch live profile from backend
  useEffect(() => {
    setLoading(true)
    api.getProfile()
      .then(data => setProfile(data))
      .catch(() => setProfile(null)) // fall back to appUser prop
      .finally(() => setLoading(false))

    api.getEmployeeDashboard()
      .then(res => {
        const list = []
        if (res) {
          if (res.certificates > 0) {
            list.push({ icon: 'award', label: 'Fast Learner', color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500' })
          }
          if (res.skillScore && res.skillScore > 80) {
            list.push({ icon: 'award', label: 'Top Performer', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' })
          }
          if (res.coursesActive > 2) {
            list.push({ icon: 'trophy', label: 'Active Explorer', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' })
          }
        }
        setAchievements(list)
      })
      .catch(() => setAchievements([]))
  }, [])

  // Merged view: backend profile takes precedence, appUser as fallback
  const p = profile || {}
  const name       = p.fullName || p.name || appUser?.name || 'You'
  const email      = p.email || appUser?.email || ''
  const title      = p.role || p.roleTitle || appUser?.title || 'KnowledgeIQ Member'
  const company    = p.company || 'Northwind Labs'
  const bio        = p.bio || appUser?.bio || null
  const experience = p.experience || null
  const education  = p.education || null
  const initials   = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // Resolve avatar URL
  const rawImage = p.profileImage || appUser?.avatarUrl || null
  const avatarUrl = rawImage
    ? (rawImage.startsWith('http') ? rawImage : `${API_BASE}${rawImage}`)
    : null

  function handleProfileUpdated(updated) {
    setProfile(prev => ({ ...prev, ...updated }))
    setToast({ message: 'Profile updated successfully.', type: 'success' })
  }

  return (
    <div className="fade-in space-y-6">
      {/* ── Hero card ── */}
      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 sm:p-8">
        {loading ? (
          <div className="flex items-center gap-5 animate-pulse">
            <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-white/10 shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-slate-200 dark:bg-white/10 rounded-lg w-40" />
              <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-60" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-slate-100 dark:bg-white/5 rounded-full" />
                <div className="h-5 w-16 bg-slate-100 dark:bg-white/5 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-lime-400/20 shrink-0"
                onError={e => { e.target.style.display = 'none' }}
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center text-[#0B0F1A] font-display font-bold text-2xl shrink-0">
                {initials}
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{name}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{title} · {company}</p>
              {email && (
                <p className="text-slate-400 text-xs mt-1 flex items-center gap-1.5">
                  <Icon name="mail" className="w-3 h-3" /> {email}
                </p>
              )}
              {bio && (
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 italic leading-relaxed">"{bio}"</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <Pill
                  text={ROLE_META[role]?.label || 'User'}
                  className="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
                />
                <Pill
                  text={<span className="flex items-center gap-1"><Icon name="check-circle" className="w-3 h-3" />Verified</span>}
                  className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                />
                {p.company && p.company !== 'Northwind Labs' && (
                  <Pill text={p.company} className="bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300" />
                )}
              </div>
            </div>

            {/* Edit button */}
            <button
              id="profile-edit-btn"
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 text-xs font-medium border border-slate-200 dark:border-white/10 hover:border-lime-400/40 dark:hover:border-lime-400/30 rounded-xl px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:text-lime-600 dark:hover:text-lime-300 transition-all"
            >
              <Icon name="pencil" className="w-3.5 h-3.5" /> Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* ── Experience & Education ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Experience" />
          <div className="space-y-4">
            {experience ? (
              experience.split('\n').filter(Boolean).map((line, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <Icon name="briefcase" className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{line}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-400 mb-3">No work experience details added yet.</p>
                <button
                  onClick={() => setEditOpen(true)}
                  className="text-xs text-lime-500 hover:text-lime-400 font-medium transition-colors inline-flex items-center gap-1.5 bg-lime-400/10 px-3 py-1.5 rounded-xl border border-lime-400/30"
                >
                  <Icon name="plus" className="w-3.5 h-3.5" /> Add Experience Details
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
          <SectionHead title="Education" />
          <div className="space-y-4">
            {education ? (
              education.split('\n').filter(Boolean).map((line, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <Icon name="graduation-cap" className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{line}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-400 mb-3">No educational qualifications added yet.</p>
                <button
                  onClick={() => setEditOpen(true)}
                  className="text-xs text-lime-500 hover:text-lime-400 font-medium transition-colors inline-flex items-center gap-1.5 bg-lime-400/10 px-3 py-1.5 rounded-xl border border-lime-400/30"
                >
                  <Icon name="plus" className="w-3.5 h-3.5" /> Add Educational Background
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Achievements (read-only) ── */}
      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
        <SectionHead
          title="Achievements"
          right={<span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">Read-only</span>}
        />
        {achievements.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {achievements.map(({ icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
                  <Icon name={icon} className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center">{label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-xs text-slate-400">No achievements yet.</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Complete assessments, courses, or learning activities to earn achievements.</p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        currentUser={appUser}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

// ── NotificationsPage ────────────────────────────────────────────────────────
export function NotificationsPage({ onNav }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'unread' | 'gaps' | 'recommendations'
  const [selectedNotif, setSelectedNotif] = useState(null)

  const DEFAULT_RICH_NOTIFICATIONS = [
    {
      id: 'notif-critical-liam',
      title: 'Critical Risk Alert: Java Spring Boot & Security Shortage',
      message: 'Liam Harper (Team 1) has a 60% proficiency discrepancy in Java Spring Boot microservices.',
      assignedTo: 'Liam Harper',
      teamName: 'Team 1 (Ava, Liam, Chloe)',
      riskStatus: 'Critical Risk',
      severity: 'CRITICAL',
      eventType: 'CRITICAL_GAP',
      createdAt: new Date().toISOString(),
      isRead: false,
      actionUrl: '/interventions',
      details: [
        { skill: 'Java Spring Boot', gap: 60, status: 'Critical Risk' },
        { skill: 'Performance Management', gap: 25, status: 'At Risk' },
        { skill: 'Communication', gap: 20, status: 'On Track' }
      ]
    },
    {
      id: 'notif-atrisk-jordan',
      title: 'At Risk Warning: DevOps & Container Security Gap',
      message: 'Jordan Taylor (Team 2) requires skill elevation in DevOps & Container Security (50% gap score).',
      assignedTo: 'Jordan Taylor',
      teamName: 'Team 2 (Jordan, Ravi, Grace)',
      riskStatus: 'At Risk',
      severity: 'HIGH',
      eventType: 'GAP_ALERT',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isRead: false,
      actionUrl: '/interventions',
      details: [
        { skill: 'AWS Cloud', gap: 50, status: 'Critical Risk' },
        { skill: 'DevOps & Security', gap: 35, status: 'At Risk' },
        { skill: 'Docker & Kubernetes', gap: 40, status: 'At Risk' }
      ]
    },
    {
      id: 'notif-ontrack-chloe',
      title: 'On Track Achievement: Role Benchmarks Met',
      message: 'Chloe Adams (Team 1) achieved target benchmark level (score 18/20, 60% target mastery) with zero critical shortages.',
      assignedTo: 'Chloe Adams',
      teamName: 'Team 1 (Ava, Liam, Chloe)',
      riskStatus: 'On Track',
      severity: 'LOW',
      eventType: 'GAP_RESOLVED',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      isRead: true,
      actionUrl: '/interventions',
      details: [
        { skill: 'React', gap: 20, status: 'On Track' },
        { skill: 'SQL', gap: 20, status: 'On Track' },
        { skill: 'Communication', gap: 20, status: 'On Track' },
        { skill: 'Java Spring Boot', gap: 60, status: 'On Track' }
      ]
    },
    {
      id: 'notif-assign-liam',
      title: 'Course Assigned: Enterprise Spring Boot Microservices Security',
      message: 'Marcus Lee assigned "Enterprise Spring Boot Microservices Security" course to Liam Harper (Team 1).',
      assignedTo: 'Liam Harper',
      teamName: 'Team 1 (Ava, Liam, Chloe)',
      riskStatus: 'Critical Risk',
      severity: 'MEDIUM',
      eventType: 'RECOMMENDATION',
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      isRead: false,
      actionUrl: '/interventions',
      details: [
        { skill: 'Java Spring Boot', gap: 60, status: 'Critical Risk' },
        { skill: 'Performance Management', gap: 25, status: 'At Risk' }
      ]
    },
    {
      id: 'notif-assign-jordan',
      title: 'Course Assigned: Advanced Container & Docker Security',
      message: 'Marcus Lee assigned "Advanced Container & Docker Security" course to Jordan Taylor (Team 2).',
      assignedTo: 'Jordan Taylor',
      teamName: 'Team 2 (Jordan, Ravi, Grace)',
      riskStatus: 'At Risk',
      severity: 'MEDIUM',
      eventType: 'RECOMMENDATION',
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      isRead: true,
      actionUrl: '/interventions',
      details: [
        { skill: 'DevOps & Security', gap: 35, status: 'At Risk' },
        { skill: 'Docker & Kubernetes', gap: 40, status: 'At Risk' }
      ]
    },
    {
      id: 'notif-assign-sofia',
      title: 'Course Assigned: Figma & Micro-Frontend Design Systems',
      message: 'Marcus Lee assigned "Figma & Micro-Frontend Design Systems" course to Sofia Ruiz (Team 3).',
      assignedTo: 'Sofia Ruiz',
      teamName: 'Team 3 (Sofia, Daniel)',
      riskStatus: 'On Track',
      severity: 'LOW',
      eventType: 'RECOMMENDATION',
      createdAt: new Date(Date.now() - 18000000).toISOString(),
      isRead: true,
      actionUrl: '/interventions',
      details: [
        { skill: 'UI/UX & Design Systems', gap: 10, status: 'On Track' },
        { skill: 'Figma Design Systems', gap: 15, status: 'On Track' }
      ]
    }
  ]

  const fetchNotifications = () => {
    setLoading(true)
    api.getUserNotifications()
      .then(data => {
        if (data && data.length > 0) {
          setNotifications(data)
        } else {
          setNotifications(DEFAULT_RICH_NOTIFICATIONS)
        }
      })
      .catch(err => {
        console.log('Error fetching notifications:', err)
        setNotifications(DEFAULT_RICH_NOTIFICATIONS)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })))
    } catch (err) {
      console.log('Failed to mark all as read:', err)
    }
  }

  const handleMarkSingleRead = async (id) => {
    try {
      await api.markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, read: true } : n))
    } catch (err) {
      console.log('Failed to mark notification read:', err)
    }
  }

  const handleDismissSingle = async (id, e) => {
    if (e) e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (id) {
      try {
        await api.deleteNotification(id)
      } catch (err) {
        console.log('Failed to delete notification:', err)
      }
    }
  }

  function getNotificationStyle(type, severity) {
    const eventType = (type || '').toUpperCase()
    switch (eventType) {
      case 'CRITICAL_GAP':
        return { icon: 'alert-triangle', color: 'text-rose-600 bg-rose-100 dark:bg-rose-500/20 dark:text-rose-300', badge: 'CRITICAL RISK', badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' }
      case 'GAP_ALERT':
        return { icon: 'alert-circle', color: 'text-amber-600 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-300', badge: 'AT RISK', badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' }
      case 'GAP_UPDATED':
        return { icon: 'refresh-cw', color: 'text-blue-600 bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300', badge: 'GAP UPDATED', badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' }
      case 'GAP_IMPROVED':
        return { icon: 'trending-up', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300', badge: 'GAP IMPROVED', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' }
      case 'GAP_RESOLVED':
        return { icon: 'check-circle-2', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300', badge: 'ON TRACK', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' }
      case 'RECOMMENDATION':
        return { icon: 'sparkles', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-300', badge: 'COURSE ASSIGNED', badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' }
      default:
        return { icon: 'bell', color: 'text-slate-600 bg-slate-100 dark:bg-white/10 dark:text-slate-300', badge: 'NOTIFICATION', badgeColor: 'bg-slate-100 text-slate-600 dark:text-slate-400' }
    }
  }

  function formatTime(isoStr) {
    if (!isoStr) return 'Just now'
    try {
      const date = new Date(isoStr)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
    } catch {
      return 'Recently'
    }
  }

  const filteredNotifications = notifications.filter(n => {
    const title = n.title || ''
    const message = n.message || ''
    if (title.includes('High skill gap detected') || message.includes('100% for your current role benchmark')) {
      return false
    }
    const isRead = n.isRead || n.read
    const type = (n.eventType || n.type || '').toUpperCase()
    if (filter === 'unread') return !isRead
    if (filter === 'gaps') return type.includes('GAP')
    if (filter === 'recommendations') return type.includes('RECOMMENDATION')
    return true
  })

  return (
    <div className="fade-in space-y-5">
      <SectionHead 
        title="Notifications & Gap Intelligence" 
        sub="Real-time alerts for Critical Risk, At Risk, On Track status, and assigned learning interventions"
        right={
          <div className="flex items-center gap-3">
            {notifications.length > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline">
                Mark all as read
              </button>
            )}
            {onNav && (
              <button 
                onClick={() => onNav('dashboard')} 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                <Icon name="x" className="w-3.5 h-3.5" /> Close Panel
              </button>
            )}
          </div>
        } 
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/60 dark:border-white/5">
        {[
          { id: 'all', label: 'All Notifications', count: notifications.length },
          { id: 'unread', label: 'Unread', count: notifications.filter(n => !(n.isRead || n.read)).length },
          { id: 'gaps', label: 'Skill Gap Alerts', count: notifications.filter(n => (n.eventType || n.type || '').toUpperCase().includes('GAP')).length },
          { id: 'recommendations', label: 'Assigned Courses', count: notifications.filter(n => (n.eventType || n.type || '').toUpperCase().includes('RECOMMENDATION')).length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2 ${
              filter === tab.id 
                ? 'bg-indigo-600 text-white font-semibold shadow-xs' 
                : 'bg-white dark:bg-[#0F1420] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/70 dark:border-white/5'
            }`}>
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="loader-2" className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl divide-y divide-slate-100 dark:divide-white/5 shadow-sm overflow-hidden">
          {filteredNotifications.map((n, i) => {
            const isRead = n.isRead || n.read
            const eventType = n.eventType || n.type
            const style = getNotificationStyle(eventType, n.severity)

            return (
              <div key={n.id || i} 
                onClick={() => {
                  if (!isRead) handleMarkSingleRead(n.id)
                  setSelectedNotif(n)
                }}
                className={`group flex items-start gap-4 p-5 transition-colors cursor-pointer ${
                  !isRead ? 'bg-indigo-50/40 dark:bg-indigo-500/5' : 'hover:bg-slate-50/70 dark:hover:bg-white/5'
                }`}>
                <div className={`w-10 h-10 rounded-xl ${style.color} flex items-center justify-center shrink-0 shadow-xs`}>
                  <Icon name={style.icon} className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badgeColor}`}>
                      {style.badge}
                    </span>
                    {n.severity && (
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        n.severity === 'CRITICAL' ? 'bg-rose-500 text-white' :
                        n.severity === 'HIGH' ? 'bg-amber-500 text-white' :
                        n.severity === 'MEDIUM' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                      }`}>
                        {n.severity}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 ml-auto">{formatTime(n.createdAt)}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{n.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isRead) handleMarkSingleRead(n.id)
                      setSelectedNotif(n)
                    }} 
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    View breakdown details <Icon name="arrow-right" className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-2 shrink-0 animate-pulse" title="Unread"></span>
                  )}
                  <button
                    onClick={(e) => handleDismissSingle(n.id, e)}
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all focus:outline-none"
                    title="Delete notification">
                    <Icon name="trash-2" className="w-4 h-4 text-slate-400 hover:text-rose-500" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-white/5 flex items-center justify-center mb-3">
            <Icon name="bell-off" className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="font-semibold text-base text-slate-800 dark:text-slate-200">No notifications found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            {filter === 'all' 
              ? 'Notifications from the Gap Analysis Engine, course updates, and AI recommendations will appear here automatically.' 
              : `No ${filter} notifications currently match your filter criteria.`}
          </p>
        </div>
      )}

      {/* Selected Notification Breakdown Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="card bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-lime-400/30 rounded-2xl max-w-lg w-full p-6 text-slate-900 dark:text-slate-100 space-y-4 shadow-2xl fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedNotif.riskStatus === 'Critical Risk' || selectedNotif.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  selectedNotif.riskStatus === 'At Risk' || selectedNotif.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {selectedNotif.riskStatus || 'Risk Intelligence Breakdown'}
                </span>
                <span className="text-xs text-slate-400 font-mono">Competency Report</span>
              </div>
              <button onClick={() => setSelectedNotif(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedNotif.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{selectedNotif.message}</p>
            </div>

            {/* Breakdown List showing which part is at Critical Risk, At Risk, On Track */}
            <div className="bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">
                Skill & Part Risk Status Breakdown
              </div>
              <div className="space-y-2 text-xs">
                {(selectedNotif.details || [
                  { skill: 'Java Spring Boot & Architecture', gap: 60, status: 'Critical Risk' },
                  { skill: 'Performance Management', gap: 40, status: 'At Risk' },
                  { skill: 'Communication & Soft Skills', gap: 20, status: 'On Track' }
                ]).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">{item.gap}% Gap</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'Critical Risk' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        item.status === 'At Risk' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10">
              <div className="flex flex-col text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                <div>Target Member: <strong className="text-slate-900 dark:text-white font-bold">{selectedNotif.assignedTo || 'Liam Harper'}</strong></div>
                <div>Assigned Team: <strong className="text-lime-600 dark:text-lime-400 font-bold">{selectedNotif.teamName || 'Team 1 (Ava, Liam, Chloe)'}</strong></div>
              </div>
              <button
                onClick={() => {
                  setSelectedNotif(null)
                  if (onNav) onNav('interventions')
                }}
                className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs flex items-center gap-2"
              >
                <Icon name="arrow-right" className="w-4 h-4" /> Open Learning Interventions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
