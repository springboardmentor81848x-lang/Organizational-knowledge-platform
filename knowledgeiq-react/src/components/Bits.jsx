import React from 'react'
import Icon from './Icon.jsx'

export function Pill({ text, className }) {
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>{text}</span>
}

export function SectionHead({ title, sub, right }) {
  return (
    <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
      <div>
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        {sub && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

export function StatCard({ icon, label, value, delta, positive, tint, onClick, tooltip }) {
  return (
    <div
      onClick={onClick}
      className={`card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:border-lime-400/60 hover:shadow-lg hover:shadow-lime-400/10 hover:-translate-y-1 group relative' : ''
      }`}
      title={tooltip || (onClick ? `Click to view ${label}` : label)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${tint} flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon name={icon} className="w-5 h-5" />
        </div>
        {delta && (
          <span className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
            <Icon name={positive ? 'trending-up' : 'trending-down'} className="w-3.5 h-3.5" /> {delta}
          </span>
        )}
      </div>
      <div className="text-slate-500 dark:text-slate-400 text-sm mb-1 group-hover:text-lime-400 transition-colors flex items-center justify-between">
        <span>{label}</span>
        {onClick && <Icon name="arrow-up-right" className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-lime-400" />}
      </div>
      <div className="text-2xl font-bold font-display text-slate-900 dark:text-white">{value}</div>

      {/* Hover Point Indicator Tooltip */}
      {onClick && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#0B0F1A] text-lime-300 border border-lime-400/40 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-xl z-20">
          Click to view {label} →
        </div>
      )}
    </div>
  )
}

export function QuickAction({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-100 dark:border-white/5 hover:border-lime-300 dark:hover:border-lime-400/30 hover:bg-lime-50/50 dark:hover:bg-lime-400/5 transition-colors text-center">
      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center">
        <Icon name={icon} className="w-[18px] h-[18px] text-slate-600 dark:text-slate-300" />
      </div>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </button>
  )
}

export function Gauge({ value, label, color }) {
  const r = 42, c = 2 * Math.PI * r, off = c - (value / 100) * c
  return (
    <div className="relative w-28 h-28">
      <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-display font-bold text-xl">{value}</span>
        <span className="text-slate-400 text-[10px]">{label}</span>
      </div>
    </div>
  )
}

export function statusColor(s) {
  const map = {
    'On Track': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    'At Risk': 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    'Needs Review': 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    'Active': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    'Suspended': 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    'Pending': 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    'PENDING': 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    'Scheduled': 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    'Passed': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    'SUBMITTED': 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    'COMPLETED': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
  }
  return map[s] || 'bg-slate-100 text-slate-600'
}

export function sevColor(s) {
  if (s === 'Critical') return 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
  if (s === 'High') return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
  return 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
}

export function heatColor(v) {
  if (v >= 75) return 'bg-lime-400/90 text-[#0B0F1A]'
  if (v >= 60) return 'bg-lime-300/70 text-[#0B0F1A]'
  if (v >= 45) return 'bg-amber-300/70 text-[#0B0F1A]'
  if (v >= 30) return 'bg-orange-400/70 text-white'
  return 'bg-rose-500/80 text-white'
}
