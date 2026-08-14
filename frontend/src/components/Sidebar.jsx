import React from 'react'
import Icon from './Icon.jsx'
import { NAV } from '../data.js'

export default function Sidebar({ role, page, onNav, onLogout, user }) {
  const sections = NAV[role]

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
                <button key={it.id} onClick={() => onNav(it.id)}
                  className={`navlink relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${page === it.id ? 'active text-lime-200' : 'text-slate-300'}`}>
                  <span className="nl-bar absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-lime-400 opacity-0"></span>
                  <Icon name={it.icon} className="nl-icon w-4 h-4 shrink-0" />
                  <span className="truncate">{it.label}</span>
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
