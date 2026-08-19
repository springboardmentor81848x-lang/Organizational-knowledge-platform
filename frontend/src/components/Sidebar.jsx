import React from 'react'
import Icon from './Icon.jsx'
import { NAV } from '../data.js'

export default function Sidebar({ role, page, onNav, onLogout, user }) {
  const sections = NAV[role]
  const [hoveredItemId, setHoveredItemId] = React.useState(null)

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

  const getHoverStats = () => {
    const assignments = getRealAssignments()
    const stats = {}
    assignments.forEach(asg => {
      const title = asg.title
      if (!stats[title]) {
        stats[title] = {
          title,
          employeeCount: 0,
          milestonesCleared: 0,
          employees: []
        }
      }
      stats[title].employeeCount += 1
      let cleared = 0
      if (asg.status === 'COMPLETED') {
        cleared = 3
      } else if (asg.status === 'IN_PROGRESS') {
        cleared = 1
      }
      stats[title].milestonesCleared += cleared
      stats[title].employees.push({
        name: getEmployeeName(asg.employeeEmail),
        status: asg.status,
        cleared
      })
    })
    return Object.values(stats)
  }

  return (
    <aside className="hidden md:flex md:w-64 shrink-0 bg-[#0B0F1A] text-slate-300 flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-9 h-9 rounded-xl bg-lime-400 flex items-center justify-center shrink-0">
          <Icon name="brain-circuit" className="w-[18px] h-[18px] text-[#0B0F1A]" />
        </div>
        <div className="min-w-0">
          <div className="font-display font-bold text-white text-[15px] leading-none truncate">KnowledgeIQ</div>
          <div className="text-slate-500 text-[11px] mt-1 truncate">{user?.company || 'Enterprise'}</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-6">
        {sections.map(sec => (
          <div key={sec.section}>
            <div className="text-[10px] font-semibold tracking-wider text-slate-500 px-3 mb-2">{sec.section.toUpperCase()}</div>
            <div className="space-y-1">
              {sec.items.map(it => (
                <button
                  key={it.id}
                  onClick={() => onNav(it.id)}
                  onMouseEnter={() => setHoveredItemId(it.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                  className={`navlink relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${page === it.id ? 'active text-lime-200' : 'text-slate-300'}`}
                >
                  <span className="nl-bar absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-lime-400 opacity-0"></span>
                  <Icon name={it.icon} className="nl-icon w-4 h-4 shrink-0" />
                  <span className="truncate">{it.label}</span>

                  {it.id === 'paths' && hoveredItemId === 'paths' && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 w-72 bg-[#0F1420] border border-slate-700/60 dark:border-white/10 rounded-2xl p-4 shadow-2xl text-left pointer-events-none fade-in">
                      <div className="font-display font-bold text-white text-xs mb-2 flex items-center gap-1.5 border-b border-white/10 pb-2">
                        <Icon name="info" className="w-3.5 h-3.5 text-lime-400" />
                        Real Assignment Stats
                      </div>
                      {getHoverStats().length === 0 ? (
                        <div className="text-[10px] text-slate-400 py-1">No active employee assignments created yet.</div>
                      ) : (
                        <div className="space-y-2.5 max-h-60 overflow-y-auto">
                          {getHoverStats().map((stat, idx) => (
                            <div key={idx} className="space-y-1 text-[10px]">
                              <div className="font-semibold text-slate-200 truncate">{stat.title}</div>
                              <div className="text-slate-400 flex items-center justify-between text-[9px]">
                                <span>Assigned: <strong className="text-white">{stat.employeeCount}</strong></span>
                                <span>Milestones: <strong className="text-lime-400">{stat.milestonesCleared}</strong></span>
                              </div>
                              <div className="pl-2 border-l border-white/5 space-y-0.5 mt-1">
                                {stat.employees.map((emp, eIdx) => (
                                  <div key={eIdx} className="flex items-center justify-between text-[9px] text-slate-500">
                                    <span>• {emp.name}</span>
                                    <span className={emp.status === 'COMPLETED' ? 'text-emerald-400 font-medium' : emp.status === 'IN_PROGRESS' ? 'text-amber-400 font-medium' : 'text-slate-500'}>
                                      {emp.status} ({emp.cleared}/3 clear)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button onClick={() => onNav('profile')} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center text-[#0B0F1A] font-semibold text-sm shrink-0">{user.initials}</div>
          <div className="min-w-0 text-left flex-1">
            <div className="text-sm font-medium text-white truncate">{user.name}</div>
            <div className="text-[11px] text-slate-500 truncate">{user.title}</div>
          </div>
          <Icon name="chevrons-up-down" className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-slate-400 hover:bg-white/5 hover:text-rose-300 text-xs transition-colors">
          <Icon name="log-out" className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>
    </aside>
  )
}

export function MobileNav({ role, page, onNav, open }) {
  if (!open) return null
  const items = NAV[role].flatMap(s => s.items)
  return (
    <div className="md:hidden bg-[#0B0F1A] text-slate-200 px-4 py-3 space-y-1">
      {items.map(it => (
        <button key={it.id} onClick={() => onNav(it.id)}
          className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${page === it.id ? 'bg-white/10 text-lime-300' : ''}`}>
          {it.label}
        </button>
      ))}
    </div>
  )
}
