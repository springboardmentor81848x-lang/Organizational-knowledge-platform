import React, { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import Icon from '../components/Icon.jsx'
import { Pill, SectionHead, StatCard, heatColor, sevColor } from '../components/Bits.jsx'
import api from '../services/api.js'

export function DeptHeadDashboard({ onNav, user }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.getDeptHeadDashboard()
      .then(res => { if (active) setData(res) })
      .catch(err => console.error("Error loading Dept Head dashboard:", err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Icon name="loader-2" className="w-8 h-8 text-lime-400 animate-spin" />
          <div className="text-sm text-slate-400">Loading Department metrics...</div>
        </div>
      </div>
    )
  }

  const d = data || {
    totalEmployees: 0,
    criticalGaps: 0,
    avgCompletion: 0,
    departmentName: 'Engineering',
    alerts: [],
    heatmap: { rows: [], cols: [], values: [] }
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F1A] via-[#0D1F1C] to-[#0B0F1A] p-6 sm:p-8">
        <div className="grad-blob w-64 h-64 bg-emerald-500/20 -top-10 right-10"></div>
        <div className="relative z-10">
          <Pill text={<span className="inline-flex items-center gap-1.5"><Icon name="circle" className="w-2 h-2 fill-current" />Department Strategy: {d.departmentName}</span>} className="bg-emerald-400/15 text-emerald-300 mb-4" />
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome, {user?.name ? user.name.split(' ')[0] : 'Director'} 👋</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Monitor department competency frameworks, approve role benchmark standards, and allocate learning budgets to close capability deficits.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => onNav('benchmarks')} className="bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-semibold text-sm rounded-xl px-5 py-2.5 flex items-center gap-2">
              <Icon name="check-square" className="w-4 h-4" /> Review Role Benchmarks
            </button>
            <button onClick={() => onNav('allocation')} className="bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-xl px-5 py-2.5 flex items-center gap-2">
              <Icon name="pie-chart" className="w-4 h-4" /> Budget & Resource Allocation
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Department Headcount" value={d.totalEmployees} icon="users" color="lime" />
        <StatCard title="Critical Gaps" value={d.criticalGaps} icon="alert-triangle" color="rose" />
        <StatCard title="Avg Course Completion" value={`${d.avgCompletion}%`} icon="graduation-cap" color="indigo" />
      </div>

      {d.alerts && d.alerts.length > 0 && (
        <div className="bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5">
          <h3 className="font-display font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
            <Icon name="alert-circle" className="w-5 h-5 text-amber-400" /> Department Alerts & Strategic Priorities
          </h3>
          <div className="space-y-2">
            {d.alerts.map((a, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{a.title}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  a.sev === 'Critical' ? 'bg-rose-500/10 text-rose-500 dark:text-rose-300 border border-rose-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20'
                }`}>{a.sev}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heatmap Section */}
      <div className="bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Department Competency Matrix</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Granular view of all employee proficiencies across target competencies.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Level 4-5</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Level 3</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Level 1-2</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {d.heatmap.rows.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-8">No employee skill inventories loaded in this department yet.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5">
                    <th className="p-3">Employee</th>
                    {d.heatmap.cols.map((col, idx) => <th key={idx} className="p-3 text-center">{col}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {d.heatmap.rows.map((rowName, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3 text-slate-900 dark:text-white font-medium text-sm">{rowName}</td>
                      {d.heatmap.values[rIdx]?.map((val, cIdx) => {
                        const lvl = val || 3
                        const heatBg = lvl >= 4 ? '#10B981' : lvl === 3 ? '#6366F1' : lvl === 2 ? '#F59E0B' : '#EF4444'
                        return (
                          <td key={cIdx} className="p-3 text-center">
                            <div className="w-8 h-8 rounded-lg mx-auto flex items-center justify-center font-bold text-xs text-white shadow-xs"
                              style={{ backgroundColor: heatBg }}>
                              {lvl}/5
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DeptHeadBenchmarks() {
  const [benchmarks, setBenchmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState(null)

  // Form State for Adding new benchmark requirement
  const [formRole, setFormRole] = useState('Senior Product Engineer')
  const [formSkill, setFormSkill] = useState('Java Spring Boot')
  const [formLevel, setFormLevel] = useState(4)
  const [formCritical, setFormCritical] = useState(true)
  const [availableSkills, setAvailableSkills] = useState([])

  const loadBenchmarks = () => {
    setLoading(true)
    Promise.all([
      api.getDeptHeadBenchmarks(),
      api.getSkills()
    ])
      .then(([bRes, sRes]) => {
        setBenchmarks(bRes || [])
        setAvailableSkills(sRes || [])
      })
      .catch(err => console.error("Error loading benchmarks:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBenchmarks()
  }, [])

  const handleUpdateLevel = async (bmId, newLevel) => {
    try {
      await api.updateRoleBenchmark(bmId, { requiredLevel: newLevel })
      setBenchmarks(prev => prev.map(b => b.benchmarkId === bmId ? { ...b, requiredLevel: newLevel } : b))
      setToast({ message: 'Target proficiency benchmark level updated.', type: 'success' })
      setTimeout(() => setToast(null), 3500)
    } catch (err) {
      alert("Failed to update benchmark: " + err.message)
    }
  }

  const handleToggleCritical = async (bmId, currentCritical) => {
    try {
      await api.updateRoleBenchmark(bmId, { isCritical: !currentCritical })
      setBenchmarks(prev => prev.map(b => b.benchmarkId === bmId ? { ...b, isCritical: !currentCritical } : b))
      setToast({ message: 'Critical requirement flag updated.', type: 'success' })
      setTimeout(() => setToast(null), 3500)
    } catch (err) {
      alert("Failed to update flag: " + err.message)
    }
  }

  const handleAddBenchmark = async (e) => {
    e.preventDefault()
    try {
      await api.addRoleBenchmark({
        roleTitle: formRole,
        skillName: formSkill,
        requiredLevel: formLevel,
        isCritical: formCritical
      })
      setShowAddModal(false)
      setToast({ message: `Benchmark for "${formSkill}" added to ${formRole}!`, type: 'success' })
      setTimeout(() => setToast(null), 3500)
      loadBenchmarks()
    } catch (err) {
      alert("Failed to create benchmark requirement: " + err.message)
    }
  }

  const rolesList = Array.from(new Set(benchmarks.map(b => b.roleTitle)))

  const filtered = benchmarks.filter(b => selectedRole === 'ALL' || b.roleTitle === selectedRole)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHead
          title="Role Skill Benchmarks Approval & Governance"
          desc="Review and govern required competency levels and critical flags expected for each department role."
        />
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Icon name="plus" className="w-4 h-4" /> Add Benchmark Standard
        </button>
      </div>

      {toast && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2"><Icon name="check-circle" className="w-4 h-4" /> {toast.message}</span>
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/60 dark:border-white/5">
        <button
          onClick={() => setSelectedRole('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            selectedRole === 'ALL' ? 'bg-lime-400 text-[#0B0F1A]' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          All Roles ({benchmarks.length})
        </button>
        {rolesList.map(r => (
          <button
            key={r}
            onClick={() => setSelectedRole(r)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedRole === r ? 'bg-lime-400 text-[#0B0F1A]' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Benchmarks Table */}
      <div className="bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Icon name="loader-2" className="w-5 h-5 animate-spin text-lime-400" />
            Loading benchmark governance standards...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No benchmarks found for selected filter.</div>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5">
                <th className="p-4">Role Title</th>
                <th className="p-4">Target Competency</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">Required Level (1-5)</th>
                <th className="p-4 text-center">Critical Shortage Flag</th>
                <th className="p-4 text-right">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filtered.map((b, idx) => (
                <tr key={b.benchmarkId || idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{b.roleTitle}</td>
                  <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{b.skillName}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{b.categoryName}</td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <select
                        value={b.requiredLevel}
                        onChange={(e) => handleUpdateLevel(b.benchmarkId, parseInt(e.target.value))}
                        className="bg-slate-100 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-lime-600 dark:text-lime-400 focus:outline-none focus:border-lime-400"
                      >
                        <option value="1">1 - Basic</option>
                        <option value="2">2 - Developing</option>
                        <option value="3">3 - Intermediate</option>
                        <option value="4">4 - Advanced</option>
                        <option value="5">5 - Expert</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleCritical(b.benchmarkId, b.isCritical)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        b.isCritical
                          ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/30'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'
                      }`}
                    >
                      {b.isCritical ? '★ Critical Priority' : 'Standard'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-semibold text-[11px] inline-flex items-center gap-1">
                      <Icon name="check" className="w-3 h-3" /> Approved & Synced
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Benchmark Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleAddBenchmark} className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Define New Role Benchmark</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Target Department Role</label>
              <select
                value={formRole}
                onChange={e => setFormRole(e.target.value)}
                className="w-full bg-slate-100 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
              >
                {rolesList.length > 0 ? rolesList.map(r => <option key={r} value={r}>{r}</option>) : (
                  <>
                    <option value="Senior Product Engineer">Senior Product Engineer</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Junior Developer">Junior Developer</option>
                    <option value="DevOps & Security Specialist">DevOps & Security Specialist</option>
                    <option value="Lead UI/UX Engineer">Lead UI/UX Engineer</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Competency Skill</label>
              <select
                value={formSkill}
                onChange={e => setFormSkill(e.target.value)}
                className="w-full bg-slate-100 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
              >
                {availableSkills.map(s => <option key={s.id || s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Required Level</label>
                <select
                  value={formLevel}
                  onChange={e => setFormLevel(parseInt(e.target.value))}
                  className="w-full bg-slate-100 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="1">1 - Basic</option>
                  <option value="2">2 - Developing</option>
                  <option value="3">3 - Intermediate</option>
                  <option value="4">4 - Advanced</option>
                  <option value="5">5 - Expert</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Critical Requirement</label>
                <select
                  value={formCritical ? "true" : "false"}
                  onChange={e => setFormCritical(e.target.value === "true")}
                  className="w-full bg-slate-100 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="true">Yes - Critical Flag</option>
                  <option value="false">No - Standard</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] text-xs font-bold transition-colors"
              >
                Save Benchmark Standard
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export function DeptHeadAllocation() {
  const [allocation, setAllocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    api.getDeptHeadAllocation()
      .then(res => setAllocation(res))
      .catch(err => console.error("Error loading allocation:", err))
      .finally(() => setLoading(false))
  }, [])

  const handleSaveBudget = async () => {
    setSaving(true)
    try {
      await api.updateDeptAllocation(allocation)
      setToast("Budget allocation saved and synchronized with Finance & L&D.")
      setTimeout(() => setToast(null), 4000)
    } catch (err) {
      alert("Failed to save budget: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-slate-400 text-xs py-8">Loading Resource & Budget Allocation Center...</div>
  }

  const a = allocation || {
    totalBudget: 150000,
    spentBudget: 84500,
    remainingBudget: 65500,
    costPerGapClosed: 1250,
    roiForecast: "3.8x",
    teamAllocations: [],
    programs: []
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHead
          title="Resource & Budget Allocation Governance"
          desc="Optimize training program spend, track ROI multipliers, and allocate funding to close high-severity capability gaps."
        />
        <button
          onClick={handleSaveBudget}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 disabled:opacity-75"
        >
          {saving ? <Icon name="loader-2" className="w-4 h-4 animate-spin" /> : <Icon name="save" className="w-4 h-4" />}
          {saving ? 'Syncing...' : 'Save Allocation Plan'}
        </button>
      </div>

      {toast && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2"><Icon name="check-circle" className="w-4 h-4" /> {toast}</span>
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Budget" value={`$${a.totalBudget.toLocaleString()}`} icon="pie-chart" color="lime" />
        <StatCard title="Budget Utilized" value={`$${a.spentBudget.toLocaleString()}`} icon="activity" color="indigo" />
        <StatCard title="Remaining Funding" value={`$${a.remainingBudget.toLocaleString()}`} icon="coins" color="emerald" />
        <StatCard title="Estimated Learning ROI" value={a.roiForecast} icon="trending-up" color="amber" />
      </div>

      {/* Team Allocation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {a.teamAllocations.map((t, idx) => (
          <div key={idx} className="bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-sm">{t.teamName}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-600 dark:text-lime-300 border border-lime-400/20">
                {t.status}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Team Lead: <strong className="text-slate-800 dark:text-slate-200">{t.lead}</strong> ({t.headcount} Engineers)</div>
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Allocated Budget:</span>
                <strong className="font-bold text-slate-900 dark:text-white">${t.allocated.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Spent to Date:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">${t.spent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Active Learning Programs:</span>
                <span>{t.activePrograms} Modules</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Program Cost & ROI Table */}
      <div className="bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Key Funded Learning Initiatives</h3>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5">
              <th className="p-3">Program Title</th>
              <th className="p-3">Investment</th>
              <th className="p-3 text-center">Enrolled</th>
              <th className="p-3 text-center">Timeline</th>
              <th className="p-3 text-right">Projected ROI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {a.programs.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="p-3 font-semibold text-slate-900 dark:text-white">{p.program}</td>
                <td className="p-3 font-medium text-slate-800 dark:text-slate-200">${p.cost.toLocaleString()}</td>
                <td className="p-3 text-center text-slate-600 dark:text-slate-300">{p.enrolled} Members</td>
                <td className="p-3 text-center text-slate-500 dark:text-slate-400">{p.targetQuarter}</td>
                <td className="p-3 text-right font-bold text-emerald-500 dark:text-emerald-400">{p.roi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
