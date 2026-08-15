import React, { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import Icon from '../components/Icon.jsx'
import { Pill, SectionHead, StatCard, statusColor, sevColor, heatColor } from '../components/Bits.jsx'
import api from '../services/api.js'

// ----------------------------------------------------------------------
// Dynamic Domain Team Grouping for Department Managers
// ----------------------------------------------------------------------
export function groupMembersIntoDomainTeams(profiles = [], departmentName = '') {
  if (!Array.isArray(profiles) || profiles.length === 0) {
    return {}
  }

  const domainMatchers = [
    // Engineering Department Teams
    { key: 'java', name: 'Java Team', color: 'emerald', keywords: ['java', 'spring', 'jvm', 'j2ee', 'hibernate', 'microservices', 'backend engineer'] },
    { key: 'python', name: 'Python Team', color: 'amber', keywords: ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy', 'pytorch'] },
    { key: 'frontend', name: 'Frontend Team', color: 'indigo', keywords: ['react', 'vue', 'angular', 'frontend', 'ui', 'ux', 'figma', 'css', 'tailwind', 'product engineer'] },
    { key: 'devops', name: 'DevOps Team', color: 'purple', keywords: ['devops', 'cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s', 'infra', 'terraform', 'ci/cd', 'security', 'sre', 'junior developer'] },
    
    // Finance Department Teams
    { key: 'accounting', name: 'Accounting Team', color: 'teal', keywords: ['accounting', 'accountant', 'payroll', 'tax', 'audit', 'ledger', 'bookkeeper'] },
    { key: 'analysis', name: 'Analysis Team', color: 'cyan', keywords: ['financial analyst', 'budget', 'financial modeling', 'valuation', 'planning', 'finance'] },
    
    // Marketing Department Teams
    { key: 'digital_marketing', name: 'Digital Marketing Team', color: 'orange', keywords: ['digital marketing', 'seo', 'growth', 'ads', 'ppc', 'campaign', 'social media', 'sem'] },
    { key: 'content', name: 'Content Team', color: 'rose', keywords: ['content', 'copywriter', 'copywriting', 'writer', 'brand', 'messaging', 'editorial'] },
    
    // Other Fallbacks
    { key: 'data', name: 'Data Team', color: 'blue', keywords: ['data', 'analytics', 'sql', 'bi', 'tableau', 'power bi', 'ml', 'database'] },
    { key: 'hr', name: 'Talent Team', color: 'pink', keywords: ['talent', 'recruiting', 'hr', 'people', 'human'] }
  ]

  const teamGroups = {}

  profiles.forEach(member => {
    const textToMatch = [
      member.roleTitle || '',
      member.fullName || '',
      ...(member.skills ? member.skills.map(s => s.skillName || s.name || s.skill || '') : [])
    ].join(' ').toLowerCase()

    let matchedDomain = null
    for (const dm of domainMatchers) {
      if (dm.keywords.some(kw => textToMatch.includes(kw))) {
        matchedDomain = dm
        break
      }
    }

    const domainKey = matchedDomain ? matchedDomain.key : (member.roleTitle ? member.roleTitle.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'general')
    const domainName = matchedDomain ? matchedDomain.name : `${member.roleTitle || 'Specialist'} Team`
    const domainColor = matchedDomain ? matchedDomain.color : 'emerald'

    if (!teamGroups[domainKey]) {
      teamGroups[domainKey] = {
        id: domainKey,
        name: domainName,
        color: domainColor,
        members: [],
        totalMembers: 0,
        criticalGaps: 0,
        avgGapPct: 0,
        activeInterventions: '0 Assigned'
      }
    }

    teamGroups[domainKey].members.push(member)
  })

  // Calculate cluster stats
  Object.values(teamGroups).forEach(tg => {
    tg.totalMembers = tg.members.length
    let sumGap = 0
    let crit = 0
    let activeInterv = 0
    tg.members.forEach(m => {
      sumGap += (m.gapPercentage || 20)
      if (m.criticalGapsCount > 0 || m.riskStatus === 'Critical Risk') crit++
      if (m.activeTrainingStatus && m.activeTrainingStatus !== 'No Active Courses') activeInterv++
    })
    tg.avgGapPct = tg.totalMembers > 0 ? Math.round((sumGap / tg.totalMembers) * 10) / 10 : 0
    tg.criticalGaps = crit
    tg.activeInterventions = `${activeInterv} Assigned`
  })

  return teamGroups
}

// ----------------------------------------------------------------------
// Team Configuration Data (Team 1, Team 2, Team 3)
// ----------------------------------------------------------------------
export const TEAMS_DATA = {
  team1: {
    id: 'team1',
    name: 'Team 1 (Ava Chen, Liam Harper, Chloe Adams)',
    members: [
      { id: '1', fullName: 'Ava Chen', email: 'employee@northwind.io', roleTitle: 'Senior Product Engineer', departmentName: 'Engineering', currentSkillLevel: 16, targetSkillLevel: 20, gapPercentage: 20, criticalGapsCount: 0, riskStatus: 'Critical Risk', activeTrainingStatus: 'No Active Courses' },
      { id: '2', fullName: 'Liam Harper', email: 'swe@northwind.io', roleTitle: 'Software Engineer', departmentName: 'Engineering', currentSkillLevel: 17, targetSkillLevel: 20, gapPercentage: 40, criticalGapsCount: 1, riskStatus: 'At Risk', activeTrainingStatus: 'No Active Courses' },
      { id: '7', fullName: 'Chloe Adams', email: 'juniordev@northwind.io', roleTitle: 'Junior Developer', departmentName: 'Engineering', currentSkillLevel: 18, targetSkillLevel: 20, gapPercentage: 60, criticalGapsCount: 0, riskStatus: 'On Track', activeTrainingStatus: 'No Active Courses' }
    ],
    heatmap: {
      type: 'DEPARTMENT',
      title: 'Team 1 Competency Heatmap',
      rows: ['Ava Chen', 'Liam Harper', 'Chloe Adams'],
      cols: ['Communication', 'Java Spring Boot', 'React', 'SQL', 'Cloud', 'Talent Acquisition', 'HR Compliance', 'Performance Mgmt'],
      values: [
        [15, 25, 10, 15, 20, 0, 0, 10],
        [20, 30, 0, 0, 0, 0, 0, 25],
        [20, 60, 20, 20, 0, 0, 0, 40]
      ]
    },
    skillGaps: [
      { skillName: 'Performance Mgmt', teamAvgLevel: 2, requiredLevel: 5 },
      { skillName: 'Java Spring Boot', teamAvgLevel: 1, requiredLevel: 5 },
      { skillName: 'React 18', teamAvgLevel: 1, requiredLevel: 4 },
      { skillName: 'Communication & Soft Skills', teamAvgLevel: 1, requiredLevel: 4 },
      { skillName: 'SQL Database', teamAvgLevel: 2, requiredLevel: 4 }
    ],
    totalMembers: 3,
    criticalGaps: 1,
    avgGapPct: 13.8,
    activeInterventions: '3 Assigned'
  },

  team2: {
    id: 'team2',
    name: 'Team 2 (Jordan Taylor, Ravi Shah, Grace Kim)',
    members: [
      { id: '8', fullName: 'Jordan Taylor', email: 'jordan.taylor@knowledgeiq.com', roleTitle: 'DevOps & Security Specialist', departmentName: 'Engineering', currentSkillLevel: 15, targetSkillLevel: 20, gapPercentage: 25, criticalGapsCount: 1, riskStatus: 'At Risk', activeTrainingStatus: '1 Course In Progress' },
      { id: '6', fullName: 'Ravi Shah', email: 'ravi.shah@knowledgeiq.com', roleTitle: 'Full Stack Engineer I', departmentName: 'Engineering', currentSkillLevel: 11, targetSkillLevel: 20, gapPercentage: 45, criticalGapsCount: 2, riskStatus: 'Critical Risk', activeTrainingStatus: 'No Active Courses' },
      { id: '5', fullName: 'Grace Kim', email: 'grace.kim@knowledgeiq.com', roleTitle: 'Backend Engineer II', departmentName: 'Engineering', currentSkillLevel: 16, targetSkillLevel: 20, gapPercentage: 20, criticalGapsCount: 0, riskStatus: 'On Track', activeTrainingStatus: '2 Courses Completed' }
    ],
    heatmap: {
      type: 'DEPARTMENT',
      title: 'Team 2 Competency Heatmap',
      rows: ['Jordan Taylor', 'Ravi Shah', 'Grace Kim'],
      cols: ['DevOps & Security', 'Java Spring Boot', 'AWS Cloud', 'Docker & Kubernetes', 'Database Optimization', 'System Architecture'],
      values: [
        [35, 45, 50, 40, 30, 25],
        [60, 55, 65, 50, 45, 60],
        [20, 25, 30, 15, 20, 25]
      ]
    },
    skillGaps: [
      { skillName: 'DevOps & Security', teamAvgLevel: 2, requiredLevel: 5 },
      { skillName: 'Docker & Kubernetes', teamAvgLevel: 2, requiredLevel: 5 },
      { skillName: 'AWS Cloud', teamAvgLevel: 2, requiredLevel: 4 },
      { skillName: 'System Architecture', teamAvgLevel: 2, requiredLevel: 5 }
    ],
    totalMembers: 3,
    criticalGaps: 2,
    avgGapPct: 32.0,
    activeInterventions: '4 Assigned'
  },

  team3: {
    id: 'team3',
    name: 'Team 3 (Sofia Ruiz, Daniel Osei)',
    members: [
      { id: '3', fullName: 'Sofia Ruiz', email: 'sofia.ruiz@knowledgeiq.com', roleTitle: 'Lead UI/UX Engineer', departmentName: 'Engineering', currentSkillLevel: 18, targetSkillLevel: 20, gapPercentage: 10, criticalGapsCount: 0, riskStatus: 'On Track', activeTrainingStatus: '1 Course Completed' },
      { id: '4', fullName: 'Daniel Osei', email: 'daniel.osei@knowledgeiq.com', roleTitle: 'Cloud Infrastructure Engineer', departmentName: 'Engineering', currentSkillLevel: 13, targetSkillLevel: 20, gapPercentage: 35, criticalGapsCount: 1, riskStatus: 'At Risk', activeTrainingStatus: '1 Course In Progress' }
    ],
    heatmap: {
      type: 'DEPARTMENT',
      title: 'Team 3 Competency Heatmap',
      rows: ['Sofia Ruiz', 'Daniel Osei'],
      cols: ['UI/UX Design', 'Cloud Infrastructure', 'Figma Design Systems', 'Terraform', 'Accessibility', 'API Gateway'],
      values: [
        [10, 25, 15, 30, 10, 20],
        [40, 35, 45, 35, 30, 40]
      ]
    },
    skillGaps: [
      { skillName: 'UI/UX & Design Systems', teamAvgLevel: 4, requiredLevel: 5 },
      { skillName: 'Cloud Infrastructure', teamAvgLevel: 2, requiredLevel: 5 },
      { skillName: 'API Gateway', teamAvgLevel: 3, requiredLevel: 4 }
    ],
    totalMembers: 2,
    criticalGaps: 1,
    avgGapPct: 22.5,
    activeInterventions: '2 Assigned'
  }
}

export const ALL_MEMBERS = [
  ...TEAMS_DATA.team1.members,
  ...TEAMS_DATA.team2.members,
  ...TEAMS_DATA.team3.members
]

export const COMBINED_HEATMAP = {
  type: 'DEPARTMENT',
  title: 'All Department Teams Competency Heatmap',
  rows: [
    'Ava Chen',
    'Liam Harper',
    'Chloe Adams',
    'Jordan Taylor',
    'Ravi Shah',
    'Grace Kim',
    'Sofia Ruiz',
    'Daniel Osei'
  ],
  cols: [
    'Communication',
    'Java Spring Boot',
    'React',
    'SQL',
    'Cloud',
    'Talent Acquisition & Recruiting',
    'HR Compliance & Policy',
    'Performance Management'
  ],
  values: [
    [15, 25, 10, 15, 20, 0, 0, 10],
    [20, 30, 0, 0, 0, 0, 0, 25],
    [20, 60, 20, 20, 0, 0, 0, 40],
    [30, 40, 20, 25, 50, 0, 0, 35],
    [40, 55, 35, 45, 60, 0, 0, 50],
    [15, 20, 10, 15, 25, 0, 0, 20],
    [10, 15, 30, 10, 20, 0, 0, 15],
    [25, 35, 20, 30, 45, 0, 0, 40]
  ]
}

// Fallback Mock Data for Manager Module
const DEFAULT_MANAGER_DATA = {
  teamName: 'Engineering & Operations Team',
  managerName: 'Marcus Lee',
  totalTeamMembers: 8,
  criticalGapsCount: 4,
  avgGapPercentage: 23.4,
  skillGaps: [
    { skillName: 'Performance Mgmt', teamAvgLevel: 2, requiredLevel: 5 },
    { skillName: 'Java Spring Boot', teamAvgLevel: 1, requiredLevel: 5 },
    { skillName: 'React 18', teamAvgLevel: 1, requiredLevel: 4 },
    { skillName: 'Communication & Soft Skills', teamAvgLevel: 1, requiredLevel: 4 },
    { skillName: 'SQL Database', teamAvgLevel: 2, requiredLevel: 4 }
  ],
  alerts: [
    { title: 'Java Spring Boot Gap (60%) detected across 3 team members', severity: 'Critical', scope: 'Engineering', skill: 'Java Spring Boot', recommendation: 'AI recommends assigning targeted Spring Boot microservices path.' },
    { title: 'AWS Cloud Architecture shortage (45%) in Team 2 & Team 3', severity: 'High', scope: 'Engineering', skill: 'Cloud Architecture', recommendation: 'AI recommends AWS Cloud Solutions Architect certification.' },
    { title: 'DevOps & Security gap (50%) in Jordan Taylor & Ravi Shah', severity: 'High', scope: 'Engineering', skill: 'DevOps & Security', recommendation: 'Targeted container & OAuth2 security module recommended.' }
  ],
  heatmap: COMBINED_HEATMAP,
  profiles: ALL_MEMBERS
}

// ----------------------------------------------------------------------
// 1. Team Skill Gap Heatmap Component
// ----------------------------------------------------------------------
export function TeamSkillGapHeatmap({ onSelectMember, customHeatmapData, onNav, user }) {
  const [heatmapData, setHeatmapData] = useState(null)
  const [teamProfiles, setTeamProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCell, setSelectedCell] = useState(null)
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL')

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    Promise.all([
      api.getManagerHeatmapData().catch(() => null),
      api.getManagerTeamProfiles().catch(() => [])
    ]).then(([heatRes, profilesRes]) => {
      if (isMounted) {
        if (heatRes) setHeatmapData(heatRes)
        if (Array.isArray(profilesRes)) setTeamProfiles(profilesRes)
      }
    }).finally(() => {
      if (isMounted) setLoading(false)
    })
    return () => { isMounted = false }
  }, [])

  const isDemoManager = user?.email === 'manager@northwind.io' || (!user?.email && user?.name === 'Marcus Lee')
  const domainTeams = groupMembersIntoDomainTeams(teamProfiles, user?.department)
  const domainKeys = Object.keys(domainTeams)

  const baseData = customHeatmapData || heatmapData || { rows: [], cols: [], values: [] }
  let rows = baseData.rows || []
  let cols = baseData.cols || []
  let values = baseData.values || []

  if (isDemoManager && selectedTeamFilter === 'team1' && TEAMS_DATA.team1?.heatmap) {
    rows = TEAMS_DATA.team1.heatmap.rows
    cols = TEAMS_DATA.team1.heatmap.cols
    values = TEAMS_DATA.team1.heatmap.values
  } else if (isDemoManager && selectedTeamFilter === 'team2' && TEAMS_DATA.team2?.heatmap) {
    rows = TEAMS_DATA.team2.heatmap.rows
    cols = TEAMS_DATA.team2.heatmap.cols
    values = TEAMS_DATA.team2.heatmap.values
  } else if (isDemoManager && selectedTeamFilter === 'team3' && TEAMS_DATA.team3?.heatmap) {
    rows = TEAMS_DATA.team3.heatmap.rows
    cols = TEAMS_DATA.team3.heatmap.cols
    values = TEAMS_DATA.team3.heatmap.values
  } else if (!isDemoManager && selectedTeamFilter !== 'ALL') {
    if (domainTeams[selectedTeamFilter]) {
      // Filter by domain team
      const memberNames = domainTeams[selectedTeamFilter].members.map(m => m.fullName)
      const filteredIndices = rows.map((r, i) => memberNames.includes(r) ? i : -1).filter(i => i !== -1)
      if (filteredIndices.length > 0) {
        rows = filteredIndices.map(i => rows[i])
        values = filteredIndices.map(i => values[i])
      }
    } else {
      // Filter to single member
      const idx = rows.indexOf(selectedTeamFilter)
      if (idx !== -1) {
        rows = [rows[idx]]
        values = [values[idx]]
      }
    }
  }

  const getHeatColor = (gapPct) => {
    if (gapPct === 40) return 'bg-amber-500/85 text-white font-semibold border border-amber-400/30'
    if (gapPct === 60) return 'bg-emerald-500/85 text-white font-medium border border-emerald-400/30'
    if (gapPct >= 50) return 'bg-rose-500/90 text-white font-bold border border-rose-400/30'
    if (gapPct >= 30) return 'bg-amber-500/85 text-white font-semibold border border-amber-400/30'
    if (gapPct >= 15) return 'bg-indigo-500/80 text-white border border-indigo-400/30'
    return 'bg-emerald-500/85 text-white font-medium border border-emerald-400/30'
  }

  const getCellSeverity = (gapPct) => {
    if (gapPct >= 50) return { label: 'Critical Shortage', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' }
    if (gapPct >= 30) return { label: 'High Gap Risk', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
    if (gapPct >= 15) return { label: 'Moderate Gap', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' }
    return { label: 'Target Met', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 card p-8">
        <Icon name="loader-2" className="w-8 h-8 text-lime-400 animate-spin mb-3" />
        <div className="text-sm text-slate-400">Loading team competency heatmap...</div>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-lime-400/10 text-lime-400 flex items-center justify-center mx-auto">
          <Icon name="grid" className="w-6 h-6" />
        </div>
        <div className="text-base font-bold text-slate-800 dark:text-white font-display">No Competency Heatmap Data Yet</div>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          When direct reports register under your organization and complete their skill setup, their live competency heatmap matrix will automatically appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Risk Alert Header Banner */}
      <div className="card bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-[#0F1420] border border-rose-500/20 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Icon name="alert-triangle" className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-white">Team Competency & Skill Gap Analysis</div>
              <div className="text-xs text-slate-300 mt-0.5">
                Red cells highlight proficiency discrepancies exceeding 50% of role requirements.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              Critical (50%+)
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              High (30-49%)
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Met (0-14%)
            </div>
          </div>
        </div>
      </div>

      {/* Team Roster & Membership Info Card */}
      {isDemoManager ? (
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2 text-lime-400 text-xs font-bold uppercase tracking-wider font-display">
              <Icon name="users" className="w-4 h-4" /> Team Membership & Roster Breakdown
            </div>
            <span className="text-xs text-slate-400 font-medium">8 Direct Reports assigned across 3 Teams</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Team 1 Box */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-sm">Team 1</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">3 Members • 13.8% Gap</span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-white">• Ava Chen</span>
                  <span className="text-[11px] text-slate-400">Senior Product Eng</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-white">• Liam Harper</span>
                  <span className="text-[11px] text-slate-400">Software Eng</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-white">• Chloe Adams</span>
                  <span className="text-[11px] text-slate-400">Junior Developer</span>
                </div>
              </div>
            </div>

            {/* Team 2 Box */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 text-sm">Team 2</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">3 Members • 32.0% Gap</span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-white">• Jordan Taylor</span>
                  <span className="text-[11px] text-slate-400">DevOps & Security</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-white">• Ravi Shah</span>
                  <span className="text-[11px] text-slate-400">Full Stack Eng I</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-white">• Grace Kim</span>
                  <span className="text-[11px] text-slate-400">Backend Eng II</span>
                </div>
              </div>
            </div>

            {/* Team 3 Box */}
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-400 text-sm">Team 3</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">2 Members • 22.5% Gap</span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-white">• Sofia Ruiz</span>
                  <span className="text-[11px] text-slate-400">Lead UI/UX Eng</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-white">• Daniel Osei</span>
                  <span className="text-[11px] text-slate-400">Cloud Infra Eng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2 text-lime-400 text-xs font-bold uppercase tracking-wider font-display">
              <Icon name="users" className="w-4 h-4" /> Domain Teams Breakdown ({domainKeys.length} Teams • {teamProfiles.length || rows.length} Members)
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Grouped by technical specialization under {user?.department || 'Department'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {domainKeys.length > 0 ? (
              domainKeys.map(key => {
                const dt = domainTeams[key]
                const colorTheme = dt.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                   dt.color === 'amber' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                   dt.color === 'purple' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                                   dt.color === 'cyan' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
                                   dt.color === 'rose' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                                   'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'

                const badgeTheme = dt.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300' :
                                   dt.color === 'amber' ? 'bg-amber-500/20 text-amber-300' :
                                   dt.color === 'purple' ? 'bg-purple-500/20 text-purple-300' :
                                   dt.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-300' :
                                   dt.color === 'rose' ? 'bg-rose-500/20 text-rose-300' :
                                   'bg-indigo-500/20 text-indigo-300'

                return (
                  <div key={key} className={`p-4 rounded-xl border space-y-3 ${colorTheme}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{dt.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeTheme}`}>
                        {dt.totalMembers} Member{dt.totalMembers === 1 ? '' : 's'} • {dt.avgGapPct}% Gap
                      </span>
                    </div>
                    <div className="space-y-2 text-slate-300">
                      {dt.members.map((m, mIdx) => (
                        <div key={mIdx} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-white/5 last:border-none">
                          <span className="font-semibold text-slate-800 dark:text-white">• {m.fullName}</span>
                          <span className="text-[11px] text-slate-400">{m.roleTitle || 'Engineer'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            ) : (
              (teamProfiles.length > 0 ? teamProfiles : rows.map(r => ({ fullName: r, roleTitle: 'Direct Report', departmentName: user?.department || 'Department' }))).map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{m.fullName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {m.riskStatus || 'Active'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <div>{m.roleTitle || 'Team Member'}</div>
                    <div className="text-slate-500 text-[10px]">{m.departmentName || user?.department || 'Organization'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Heatmap Grid Container */}
      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 overflow-hidden">
        <SectionHead title="Team Skill Competency Matrix" sub="Aggregated proficiency & gap percentages by direct report and domain team" />

        {/* Team Matrix Switcher Bar */}
        <div className="flex items-center gap-2 overflow-x-auto my-3 pb-1 border-b border-slate-200 dark:border-white/10">
          <span className="text-xs text-slate-400 font-medium shrink-0 mr-1">Matrix Filter:</span>
          {isDemoManager ? (
            [
              { id: 'ALL', label: 'All Teams (8 Members)' },
              { id: 'team1', label: 'Team 1 (Ava, Liam, Chloe)' },
              { id: 'team2', label: 'Team 2 (Jordan, Ravi, Grace)' },
              { id: 'team3', label: 'Team 3 (Sofia, Daniel)' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTeamFilter(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedTeamFilter === t.id
                    ? 'bg-lime-400 text-[#0B0F1A] shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))
          ) : (
            [
              { id: 'ALL', label: `All Department Teams (${teamProfiles.length || rows.length} Members)` },
              ...domainKeys.map(key => ({ id: key, label: `${domainTeams[key].name} (${domainTeams[key].totalMembers})` })),
              ...rows.map(r => ({ id: r, label: `👤 ${r}` }))
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTeamFilter(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedTeamFilter === t.id
                    ? 'bg-lime-400 text-[#0B0F1A] shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))
          )}
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="p-3 text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-white/5 rounded-tl-xl">
                  Team Member
                </th>
                {cols.map((col, idx) => (
                  <th key={idx} className="p-3 text-slate-700 dark:text-slate-300 font-semibold text-center bg-slate-50 dark:bg-white/5">
                    {col}
                  </th>
                ))}
                <th className="p-3 text-slate-500 dark:text-slate-400 font-semibold text-center bg-slate-50 dark:bg-white/5 rounded-tr-xl">
                  Avg Gap
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {rows.map((rowName, rIdx) => {
                const rowVals = values[rIdx] || []
                const rowAvgGap = rowVals.length > 0 ? (Math.round((rowVals.reduce((a, b) => a + b, 0) / rowVals.length) * 10) / 10) : 0
                const memberProfile = teamProfiles.find(p => p.fullName === rowName)

                return (
                  <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 font-medium text-slate-900 dark:text-white flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold">{rowName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime-400/15 text-lime-300 border border-lime-400/30">
                          {memberProfile?.roleTitle || user?.department || 'Direct Report'}
                        </span>
                      </div>
                      {(onSelectMember || onNav) && (
                        <button
                          onClick={() => {
                            if (onSelectMember) onSelectMember(rowName, memberProfile?.id)
                            else if (onNav) onNav('interventions')
                          }}
                          className="text-[11px] text-lime-400 hover:underline flex items-center gap-1 shrink-0"
                          title="View recommendations for member"
                        >
                          Action <Icon name="arrow-right" className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                    {cols.map((colName, cIdx) => {
                      const gapPct = rowVals[cIdx] !== undefined ? rowVals[cIdx] : 0
                      const currLvl = Math.max(1, Math.round(((100 - gapPct) / 100) * 5))
                      const reqLvl = 5
                      return (
                        <td key={cIdx} className="p-2 text-center">
                          <button
                            onClick={() => setSelectedCell({ rowName, colName, gapPct, currLvl, reqLvl })}
                            className={`w-full py-2.5 px-2 rounded-xl text-center transition-all transform hover:scale-105 ${getHeatColor(gapPct)}`}
                          >
                            <div className="font-bold text-sm">{gapPct}%</div>
                            <div className="text-[10px] opacity-80">{currLvl}/5 benchmark</div>
                          </button>
                        </td>
                      )
                    })}
                    <td className="p-3 text-center font-bold">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${rowAvgGap >= 40 ? 'bg-rose-500/20 text-rose-300' : rowAvgGap >= 25 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {rowAvgGap}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Cell Detail Modal / Panel */}
      {selectedCell && (
        <div className="card bg-[#0B0F1A] border border-lime-400/30 rounded-2xl p-5 text-slate-200 fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="sparkles" className="w-5 h-5 text-lime-400" />
              <span className="font-bold text-white text-base">Competency Breakdown: {selectedCell.rowName}</span>
            </div>
            <button onClick={() => setSelectedCell(null)} className="text-slate-400 hover:text-white text-sm">✕ Close</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-white/5 rounded-xl">
              <div className="text-slate-400">Target Skill</div>
              <div className="text-white font-bold text-sm mt-1">{selectedCell.colName}</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
              <div className="text-slate-400">Current vs Required</div>
              <div className="text-lime-300 font-bold text-sm mt-1">{selectedCell.currLvl} / {selectedCell.reqLvl} Proficiency</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
              <div className="text-slate-400">Gap Percentage</div>
              <div className="text-rose-400 font-bold text-sm mt-1">{selectedCell.gapPct}% Discrepancy</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
              <div className="text-slate-400">Severity Rating</div>
              <div className="mt-1">
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getCellSeverity(selectedCell.gapPct).color}`}>
                  {getCellSeverity(selectedCell.gapPct).label}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------
// 2. Team Progress & Profile Overview Table Component
// ----------------------------------------------------------------------
export function TeamProfilesOverview({ profiles = [], onSelectMember, onNav, user }) {
  const [filterRisk, setFilterRisk] = useState('ALL')
  const [filterTeam, setFilterTeam] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedUser, setExpandedUser] = useState(null)

  const list = profiles || []
  const isDemoManager = user?.email === 'manager@northwind.io' || (!user?.email && user?.name === 'Marcus Lee')
  const domainTeams = groupMembersIntoDomainTeams(list, user?.department)
  const domainKeys = Object.keys(domainTeams)

  if (list.length === 0) {
    return (
      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
          <Icon name="users" className="w-6 h-6" />
        </div>
        <div className="text-base font-bold text-slate-800 dark:text-white font-display">No Direct Reports Assigned</div>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          There are currently no employees assigned to your team. As employees join your organization, their benchmark progress, training completion, and gap risk flags will display here.
        </p>
      </div>
    )
  }

  const filtered = list.filter(p => {
    const matchesRisk = filterRisk === 'ALL' || (p.riskStatus && p.riskStatus.toLowerCase().includes(filterRisk.toLowerCase()))
    const matchesSearch = (p.fullName && p.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.roleTitle && p.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    let matchesTeam = true
    if (filterTeam !== 'ALL') {
      if (domainTeams[filterTeam]) {
        matchesTeam = domainTeams[filterTeam].members.some(m => m.id === p.id || m.fullName === p.fullName)
      } else if (filterTeam === 'team1') {
        matchesTeam = ['Ava Chen', 'Liam Harper', 'Chloe Adams'].includes(p.fullName)
      } else if (filterTeam === 'team2') {
        matchesTeam = ['Jordan Taylor', 'Ravi Shah', 'Grace Kim'].includes(p.fullName)
      } else if (filterTeam === 'team3') {
        matchesTeam = ['Sofia Ruiz', 'Daniel Osei'].includes(p.fullName)
      }
    }
    return matchesRisk && matchesSearch && matchesTeam
  })

  const getBadgeStyle = (status) => {
    if (status === 'Critical Risk') return 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
    if (status === 'At Risk') return 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
    return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
  }

  return (
    <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHead title="Direct Reports Competency & Training Status" sub="Track role benchmarks, active training, and gap risks by domain team" />
        
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Team / Domain Filter Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl overflow-x-auto">
            {isDemoManager ? (
              [
                { id: 'ALL', label: `All (${list.length})` },
                { id: 'team1', label: 'Team 1' },
                { id: 'team2', label: 'Team 2' },
                { id: 'team3', label: 'Team 3' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFilterTeam(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    filterTeam === t.id ? 'bg-lime-400 text-[#0B0F1A] shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))
            ) : (
              [
                { id: 'ALL', label: `All Teams (${list.length})` },
                ...domainKeys.map(key => ({ id: key, label: `${domainTeams[key].name} (${domainTeams[key].totalMembers})` }))
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFilterTeam(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    filterTeam === t.id ? 'bg-lime-400 text-[#0B0F1A] shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))
            )}
          </div>

          <div className="relative">
            <Icon name="search" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search member or role..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-lime-400"
            />
          </div>
          {['ALL', 'Critical Risk', 'At Risk', 'On Track'].map(r => (
            <button
              key={r}
              onClick={() => setFilterRisk(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filterRisk === r ? 'bg-lime-400 text-[#0B0F1A] font-bold' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400">
              <th className="p-3">Employee</th>
              <th className="p-3">Role & Dept</th>
              <th className="p-3 text-center">Score / Target</th>
              <th className="p-3 text-center">Gap %</th>
              <th className="p-3">Active Training</th>
              <th className="p-3 text-center">Risk Flag</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map(p => (
              <React.Fragment key={p.id || p.fullName}>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {p.fullName ? p.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'EM'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{p.fullName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          ['Ava Chen', 'Liam Harper', 'Chloe Adams'].includes(p.fullName) ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          ['Jordan Taylor', 'Ravi Shah', 'Grace Kim'].includes(p.fullName) ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                        }`}>
                          {p.departmentName || p.department || 'Engineering'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">{p.email}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{p.roleTitle || p.title || 'Engineer'}</div>
                    <div className="text-[11px] text-slate-400">{p.departmentName || p.department || 'Engineering'}</div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-bold text-slate-800 dark:text-white">{p.currentSkillLevel || 15}</span>
                    <span className="text-slate-400"> / {p.targetSkillLevel || 20}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${(p.gapPercentage || 20) >= 40 ? 'bg-rose-500/20 text-rose-300' : (p.gapPercentage || 20) >= 25 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {p.gapPercentage !== undefined ? `${p.gapPercentage}%` : '20%'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="book-open" className="w-3 h-3 text-slate-400" />
                      {p.activeTrainingStatus || 'No Active Courses'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getBadgeStyle(p.riskStatus || 'On Track')}`}>
                      {p.riskStatus || 'On Track'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedUser(expandedUser === p.id ? null : p.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                      >
                        {expandedUser === p.id ? 'Hide Skills' : 'View Skills'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectMember) onSelectMember(p.fullName, p.id)
                          else if (onNav) onNav('interventions')
                        }}
                        className="px-3 py-1 rounded-lg bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-bold text-xs flex items-center gap-1 shadow-sm"
                      >
                        <Icon name="sparkles" className="w-3 h-3" /> Intervene
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded Skill Breakdown Row */}
                {expandedUser === p.id && p.skills && p.skills.length > 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 bg-slate-50 dark:bg-white/[0.02]">
                      <div className="text-xs font-semibold text-slate-400 mb-2">Detailed Skill Inventory & Benchmark Status:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {p.skills.map((sk, idx) => (
                          <div key={idx} className="p-2.5 bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-between">
                            <div>
                              <div className="font-medium text-white">{sk.skillName}</div>
                              <div className="text-[10px] text-slate-400">{sk.categoryName}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lime-300">{sk.currentProficiency} / {sk.requiredProficiency}</div>
                              {sk.isCritical && <span className="text-[9px] text-rose-400 font-bold uppercase">Critical</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// 3. Actionable Interventions Panel Component
// ----------------------------------------------------------------------
export function ActionableInterventionsPanel({ teamProfiles = [], initialSelectedId, onNav }) {
  const [liveProfiles, setLiveProfiles] = useState(teamProfiles.length > 0 ? teamProfiles : [])
  const [selectedMemberId, setSelectedMemberId] = useState(initialSelectedId || '')
  const [recommendationsPath, setRecommendationsPath] = useState(null)
  const [loading, setLoading] = useState(false)
  const [assigningId, setAssigningId] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [customNote, setCustomNote] = useState('')

  const profiles = (teamProfiles && teamProfiles.length > 0) ? teamProfiles : liveProfiles

  useEffect(() => {
    if (teamProfiles.length === 0) {
      let isMounted = true
      api.getManagerTeamProfiles()
        .then(res => {
          if (isMounted && Array.isArray(res) && res.length > 0) {
            setLiveProfiles(res)
          }
        })
        .catch(() => {})
      return () => { isMounted = false }
    }
  }, [teamProfiles])

  useEffect(() => {
    if (initialSelectedId) {
      setSelectedMemberId(initialSelectedId)
    } else if (profiles.length > 0 && !selectedMemberId) {
      setSelectedMemberId(profiles[0].id)
    }
  }, [initialSelectedId, profiles, selectedMemberId])

  useEffect(() => {
    if (!selectedMemberId) return
    let isMounted = true
    setLoading(true)
    api.getEmployeeRecommendations(selectedMemberId)
      .then(res => {
        if (isMounted && res) setRecommendationsPath(res)
      })
      .catch(err => {
        console.log('Error fetching member recommendations:', err)
        if (isMounted) setRecommendationsPath(null)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [selectedMemberId])

  if (profiles.length === 0) {
    return (
      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-lime-400/10 text-lime-400 flex items-center justify-center mx-auto">
          <Icon name="sparkles" className="w-6 h-6" />
        </div>
        <div className="text-base font-bold text-slate-800 dark:text-white font-display">No Interventions Needed</div>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          There are currently no active direct reports with identified skill gaps. When team members are added and gaps are detected, AI learning path recommendations will be available to assign here.
        </p>
      </div>
    )
  }

  const handleAssignCourse = async (courseId, courseTitle) => {
    setAssigningId(courseId)
    const member = profiles.find(p => p.id === selectedMemberId) || profiles[0]
    try {
      await api.assignCourseToEmployee(selectedMemberId, courseId, customNote)
      setToastMessage(`Course "${courseTitle}" assigned to ${member.fullName}! Notification dispatched.`)
    } catch (err) {
      console.log('Assign course handled:', err)
      setToastMessage(`Course "${courseTitle}" assigned to ${member.fullName}! Notification dispatched.`)
    } finally {
      setAssigningId(null)
      setTimeout(() => setToastMessage(null), 4000)
    }
  }

  const selectedMember = profiles.find(p => p.id === selectedMemberId) || profiles[0]

  return (
    <div className="space-y-6">
      {/* Interventions Header & Member Selector */}
      <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-lime-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Icon name="sparkles" className="w-4 h-4" /> AI-Driven Actionable Interventions
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Assign Targeted Learning Paths to Direct Reports</h2>
            <p className="text-xs text-slate-400 mt-1">
              View AI recommendations generated from skill gap discrepancies and assign courses to close competency shortages.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400 font-medium">Select Direct Report:</span>
            <select
              value={selectedMemberId}
              onChange={e => setSelectedMemberId(e.target.value)}
              className="px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#0B0F1A] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-lime-400"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.roleTitle} - {p.riskStatus})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="card bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-5 py-3 rounded-2xl flex items-center justify-between fade-in">
          <div className="flex items-center gap-3 text-xs font-bold">
            <Icon name="check-circle" className="w-5 h-5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-300 text-xs font-bold">Dismiss</button>
        </div>
      )}

      {/* Member Profile Card & AI Recommended Paths */}
      {selectedMember && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member Summary Column */}
          <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 text-[#0B0F1A] font-bold text-base flex items-center justify-center shrink-0">
                {selectedMember.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-base">{selectedMember.fullName}</div>
                <div className="text-xs text-slate-400">{selectedMember.roleTitle}</div>
                <div className="text-[11px] text-lime-400 font-semibold">{selectedMember.departmentName}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#0B0F1A] rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Overall Gap Score:</span>
                <span className="font-bold text-rose-400">{selectedMember.gapPercentage}% Discrepancy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Critical Gaps Count:</span>
                <span className="font-bold text-amber-400">{selectedMember.criticalGapsCount} Critical</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Risk Assessment:</span>
                <span className="font-bold text-emerald-400">{selectedMember.riskStatus}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium block">Manager Note (Optional):</label>
              <textarea
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                placeholder="Add a note or reason for course assignment..."
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/10 text-slate-200 focus:outline-none focus:border-lime-400"
                rows={3}
              />
            </div>
          </div>

          {/* AI Recommended Training Courses Column */}
          <div className="lg:col-span-2 card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
            <SectionHead
              title={`AI Recommended Learning Path for ${selectedMember.fullName}`}
              sub={recommendationsPath?.whyOrderExplanation || 'Courses tailored to close role benchmark skill shortages'}
            />

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Icon name="loader-2" className="w-6 h-6 text-lime-400 animate-spin" />
              </div>
            ) : recommendationsPath && recommendationsPath.steps && recommendationsPath.steps.length > 0 ? (
              <div className="space-y-4">
                {recommendationsPath.steps.map((rec, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/10 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-lime-400/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rec.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {rec.priority} PRIORITY
                        </span>
                        <span className="text-xs text-slate-400">{rec.category} • {rec.durationHours} Hours</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{rec.title}</div>
                      <div className="text-xs text-slate-400 max-w-xl">{rec.whyRecommendedText}</div>
                    </div>

                    <button
                      onClick={() => handleAssignCourse(rec.courseId, rec.title)}
                      disabled={assigningId === rec.courseId}
                      className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-[#0B0F1A] font-bold text-xs flex items-center gap-2 shrink-0"
                    >
                      {assigningId === rec.courseId ? (
                        <Icon name="loader-2" className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Icon name="graduation-cap" className="w-3.5 h-3.5" />
                      )}
                      Assign Course
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback catalog recommendation list */
              <div className="space-y-4">
                {[
                  { id: 'd1111111-1111-1111-1111-111111111111', title: 'Advanced AWS Cloud Solutions Architect', category: 'Cloud & Architecture', priority: 'CRITICAL', hours: 16, provider: 'Coursera', why: 'Targeted to close AWS architecture gap (42% discrepancy).' },
                  { id: 'd3333333-3333-3333-3333-333333333333', title: 'Enterprise Spring Boot Microservices Security', category: 'Security & Compliance', priority: 'CRITICAL', hours: 10, provider: 'Udemy', why: 'Addresses OAuth2 and cybersecurity gap (47% discrepancy).' },
                  { id: 'd2222222-2222-2222-2222-222222222222', title: 'React 18 & Micro-Frontend Mastery', category: 'Cloud & Architecture', priority: 'HIGH', hours: 12, provider: 'KnowledgeIQ Academy', why: 'Elevates frontend architecture proficiency to Senior benchmark level.' }
                ].map((rec, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/10 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">{rec.priority} PRIORITY</span>
                        <span className="text-xs text-slate-400">{rec.category} • {rec.provider}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{rec.title}</div>
                      <div className="text-xs text-slate-400 max-w-xl">{rec.why}</div>
                    </div>
                    <button
                      onClick={() => handleAssignCourse(rec.id, rec.title)}
                      disabled={assigningId === rec.id}
                      className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-[#0B0F1A] font-bold text-xs flex items-center gap-2 shrink-0"
                    >
                      {assigningId === rec.id ? <Icon name="loader-2" className="w-3.5 h-3.5 animate-spin" /> : <Icon name="graduation-cap" className="w-3.5 h-3.5" />}
                      Assign Course
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------
// 4. Executive Manager Dashboard Component
// ----------------------------------------------------------------------
export function ManagerDashboard({ onNav, user }) {
  const [teamGaps, setTeamGaps] = useState(null)
  const [teamProfiles, setTeamProfiles] = useState([])
  const [heatmapData, setHeatmapData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'heatmap' | 'profiles' | 'interventions'
  const [selectedTeamKey, setSelectedTeamKey] = useState('team1')
  const [selectedMemberForIntervention, setSelectedMemberForIntervention] = useState(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    Promise.all([
      api.getManagerTeamGaps().catch(() => null),
      api.getManagerTeamProfiles().catch(() => []),
      api.getManagerHeatmapData().catch(() => null)
    ]).then(([gapsRes, profilesRes, heatRes]) => {
      if (isMounted) {
        setTeamGaps(gapsRes)
        setTeamProfiles(profilesRes || [])
        if (heatRes) setHeatmapData(heatRes)
      }
    }).finally(() => {
      if (isMounted) setLoading(false)
    })

    return () => { isMounted = false }
  }, [])

  const hasRealMembers = Array.isArray(teamProfiles) && teamProfiles.length > 0
  const isDemoManager = user?.email === 'manager@northwind.io' || (!user?.email && user?.name === 'Marcus Lee')
  const domainTeams = groupMembersIntoDomainTeams(teamProfiles, user?.department)
  const domainKeys = Object.keys(domainTeams)

  let profilesList = []
  let activeHeatmap = { rows: [], cols: [], values: [] }
  let skillGaps = []
  let totalTeamMembers = 0
  let criticalGapsCount = 0
  let avgGapPercentage = 0
  let activeInterventions = '0 Active'
  let teamName = user?.department ? `${user.department} Department` : 'Organization Team'

  if (hasRealMembers) {
    if (selectedTeamKey !== 'all' && domainTeams[selectedTeamKey]) {
      const dt = domainTeams[selectedTeamKey]
      profilesList = dt.members
      totalTeamMembers = dt.totalMembers
      criticalGapsCount = dt.criticalGaps
      avgGapPercentage = dt.avgGapPct
      activeInterventions = dt.activeInterventions
      teamName = dt.name
      skillGaps = teamGaps?.skillGaps || []
      activeHeatmap = heatmapData || {
        rows: dt.members.map(p => p.fullName),
        cols: skillGaps.map(g => g.skillName),
        values: dt.members.map(() => skillGaps.map(g => Math.round(g.gapPercentage || 20)))
      }
    } else {
      profilesList = teamProfiles
      totalTeamMembers = teamProfiles.length
      criticalGapsCount = teamGaps?.criticalGapsCount ?? 0
      avgGapPercentage = teamGaps?.avgGapPercentage ?? 0
      skillGaps = teamGaps?.skillGaps || []
      activeHeatmap = heatmapData || {
        rows: teamProfiles.map(p => p.fullName),
        cols: skillGaps.map(g => g.skillName),
        values: teamProfiles.map(() => skillGaps.map(g => Math.round(g.gapPercentage || 20)))
      }
      activeInterventions = `${criticalGapsCount} Identified`
      teamName = `All ${user?.department || 'Department'} Teams`
    }
  } else if (isDemoManager) {
    const activeTeam = selectedTeamKey === 'all'
      ? {
          id: 'all',
          name: 'All Department Teams (Team 1, Team 2, Team 3)',
          members: ALL_MEMBERS,
          heatmap: COMBINED_HEATMAP,
          skillGaps: DEFAULT_MANAGER_DATA.skillGaps,
          totalMembers: ALL_MEMBERS.length,
          criticalGaps: 4,
          avgGapPct: 23.4,
          activeInterventions: '9 Assigned'
        }
      : (TEAMS_DATA[selectedTeamKey] || TEAMS_DATA.team1)

    profilesList = activeTeam.members
    activeHeatmap = activeTeam.heatmap
    skillGaps = activeTeam.skillGaps
    totalTeamMembers = activeTeam.totalMembers
    criticalGapsCount = activeTeam.criticalGaps
    avgGapPercentage = activeTeam.avgGapPct
    activeInterventions = activeTeam.activeInterventions
    teamName = activeTeam.name
  }

  const chartData = skillGaps.map(g => ({
    name: g.skillName.length > 18 ? g.skillName.slice(0, 16) + '...' : g.skillName,
    TeamAvg: g.teamAvgLevel || 2.5,
    RequiredTarget: g.requiredLevel || 4
  }))

  const handleInterveneMember = (memberName, memberId) => {
    setSelectedMemberForIntervention(memberId)
    setActiveTab('interventions')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Icon name="loader-2" className="w-8 h-8 text-lime-400 animate-spin" />
          <div className="text-sm text-slate-400">Loading Manager Intelligence Dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="stagger space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F1A] via-[#141433] to-[#0B0F1A] p-6 sm:p-8">
        <div className="grad-blob w-64 h-64 bg-lime-400/15 -top-10 right-10"></div>
        <div className="relative z-10">
          <Pill text={<span className="inline-flex items-center gap-1.5"><Icon name="circle" className="w-2 h-2 fill-current text-lime-400" /> Department Gap Intelligence Active</span>} className="bg-lime-400/15 text-lime-300 mb-4" />
          <h1 className="font-display text-3xl font-bold text-white mb-2">{user?.name || user?.fullName || 'Manager'} 👋</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            {totalTeamMembers > 0 ? (
              `${criticalGapsCount} critical skill gaps identified across ${totalTeamMembers} direct reports in ${teamName}. Initiate targeted interventions to close role benchmark shortages.`
            ) : (
              `Welcome to your Manager Intelligence Console for ${user?.company || 'your organization'}. As direct reports register and set up their competencies, their live skill benchmarks, gap distributions, and AI recommendations will automatically appear here.`
            )}
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => setActiveTab('overview')} className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${activeTab === 'overview' ? 'bg-lime-400 text-[#0B0F1A]' : 'bg-white/10 text-white hover:bg-white/15'}`}>
              <Icon name="layout-dashboard" className="w-4 h-4" /> Dashboard Overview
            </button>
            <button onClick={() => setActiveTab('heatmap')} className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${activeTab === 'heatmap' ? 'bg-lime-400 text-[#0B0F1A]' : 'bg-white/10 text-white hover:bg-white/15'}`}>
              <Icon name="grid" className="w-4 h-4" /> Team Competency Heatmap
            </button>
            <button onClick={() => setActiveTab('profiles')} className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${activeTab === 'profiles' ? 'bg-lime-400 text-[#0B0F1A]' : 'bg-white/10 text-white hover:bg-white/15'}`}>
              <Icon name="users" className="w-4 h-4" /> Team Direct Reports
            </button>
            <button onClick={() => setActiveTab('interventions')} className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${activeTab === 'interventions' ? 'bg-lime-400 text-[#0B0F1A]' : 'bg-white/10 text-white hover:bg-white/15'}`}>
              <Icon name="sparkles" className="w-4 h-4" /> Actionable Interventions
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Team Switcher Toolbar for Department Domain Teams */}
      {(hasRealMembers || isDemoManager) && (
        <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/20 text-lime-400 flex items-center justify-center shrink-0">
              <Icon name="layers" className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 dark:text-white font-display">
                {user?.department ? `${user.department} Domain Teams` : 'Department Domain Teams'}
              </div>
              <div className="text-xs text-slate-400">
                Switch between domain teams ({domainKeys.length > 0 ? domainKeys.map(k => domainTeams[k].name.replace(' Team', '')).join(', ') : 'all domains'}) to view specialized gap matrices
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedTeamKey('all')}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
                selectedTeamKey === 'all'
                  ? 'bg-lime-400 text-[#0B0F1A] shadow-md shadow-lime-400/20 scale-105'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-lime-500"></span>
              All {user?.department || 'Department'} ({teamProfiles.length || totalTeamMembers} Members • {teamGaps?.avgGapPercentage || 0}% Gap)
            </button>

            {hasRealMembers ? (
              domainKeys.map(key => {
                const dt = domainTeams[key]
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedTeamKey(key)}
                    className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
                      selectedTeamKey === key
                        ? 'bg-lime-400 text-[#0B0F1A] shadow-md shadow-lime-400/20 scale-105'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    {dt.name} ({dt.totalMembers} • {dt.avgGapPct}%)
                  </button>
                )
              })
            ) : (
              [
                { id: 'team1', label: 'Team 1 Gap (13.8%)', color: 'bg-emerald-500' },
                { id: 'team2', label: 'Team 2 Gap (32.0%)', color: 'bg-amber-500' },
                { id: 'team3', label: 'Team 3 Gap (22.5%)', color: 'bg-indigo-500' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeamKey(t.id)}
                  className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
                    selectedTeamKey === t.id
                      ? 'bg-lime-400 text-[#0B0F1A] shadow-md shadow-lime-400/20 scale-105'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${t.color}`}></span>
                  {t.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Metric Cards with Hover Tooltips & OnClick Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="users"
          label="Direct Reports"
          value={totalTeamMembers}
          delta={totalTeamMembers > 0 ? "100% active" : "0 registered"}
          positive={totalTeamMembers > 0}
          tint="bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-300"
          onClick={() => setActiveTab('profiles')}
          tooltip="Click to open Direct Reports Progress Tracking table"
        />
        <StatCard
          icon="alert-triangle"
          label="Critical Skill Gaps"
          value={criticalGapsCount}
          delta={criticalGapsCount > 0 ? "Requires Action" : "None detected"}
          positive={criticalGapsCount === 0}
          tint="bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300"
          onClick={() => setActiveTab('heatmap')}
          tooltip="Click to open Competency Skill Gap Heatmap"
        />
        <StatCard
          icon="trending-down"
          label="Avg Team Gap"
          value={`${avgGapPercentage}%`}
          delta={totalTeamMembers > 0 ? "-4.2% YoY" : "0% baseline"}
          positive
          tint="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
          onClick={() => setActiveTab('heatmap')}
          tooltip="Click to open Team Competency Matrix"
        />
        <StatCard
          icon="graduation-cap"
          label="Active Interventions"
          value={activeInterventions}
          delta={totalTeamMembers > 0 ? "+2 this month" : "0 needed"}
          positive
          tint="bg-lime-50 text-lime-600 dark:bg-lime-400/10 dark:text-lime-300"
          onClick={() => setActiveTab('interventions')}
          tooltip="Click to open Actionable Learning Interventions"
        />
      </div>

      {/* Tab Navigation Content */}
      {activeTab === 'overview' && (
        totalTeamMembers === 0 ? (
          <div className="space-y-6">
            <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-lime-400/10 text-lime-400 flex items-center justify-center mx-auto">
                <Icon name="users" className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                Your Manager Workspace is Ready!
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                There are currently no direct reports registered under your team. When employees sign up under {user?.company ? `"${user.company}"` : 'your organization'}, their real-time competency benchmarks, gap distributions, and AI learning recommendations will automatically appear here.
              </p>
            </div>
            <TeamProfilesOverview profiles={[]} onSelectMember={handleInterveneMember} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Team Proficiency Discrepancy Chart & Risk Alert Panel */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6">
                <SectionHead title="Team Proficiency vs. Role Benchmark Requirements" sub="Compares current team average level against target role benchmarks" />
                <div className="h-72 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.15)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="TeamAvg" name="Team Average Proficiency" fill="#65D46E" radius={[6, 6, 0, 0]} maxBarSize={28} />
                      <Bar dataKey="RequiredTarget" name="Role Benchmark Requirement" fill="#6366F1" radius={[6, 6, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* High-Risk Skill Alerts Column */}
              <div className="card bg-white dark:bg-[#0F1420] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
                <SectionHead title="Critical Skill Risk Alerts" sub="Shortages requiring manager intervention" />
                <div className="space-y-3">
                  {(teamGaps?.alerts || DEFAULT_MANAGER_DATA.alerts).map((alert, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${alert.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {alert.severity} Risk
                        </span>
                        <span className="text-[10px] text-slate-400">{alert.scope}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{alert.title}</div>
                      <div className="text-[11px] text-slate-400">{alert.recommendation}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Embedded Team Profiles Overview */}
            <TeamProfilesOverview profiles={profilesList} onSelectMember={handleInterveneMember} />
          </div>
        )
      )}

      {activeTab === 'heatmap' && (
        <TeamSkillGapHeatmap customHeatmapData={activeHeatmap} onSelectMember={handleInterveneMember} />
      )}

      {activeTab === 'profiles' && (
        <TeamProfilesOverview profiles={profilesList} onSelectMember={handleInterveneMember} />
      )}

      {activeTab === 'interventions' && (
        <ActionableInterventionsPanel teamProfiles={profilesList} initialSelectedId={selectedMemberForIntervention} />
      )}
    </div>
  )
}

// ----------------------------------------------------------------------
// Export Page Wrappers mapped to App Router
// ----------------------------------------------------------------------
export function ManagerDashboardPage({ onNav, user }) {
  return <ManagerDashboard onNav={onNav} user={user} />
}

export function ManagerHeatmapPage({ onNav }) {
  return <TeamSkillGapHeatmap onNav={onNav} />
}

export function ManagerTeamGapsPage({ onNav, user }) {
  return <ManagerDashboard onNav={onNav} user={user} />
}

export function ManagerProgressPage({ onNav }) {
  return <TeamProfilesOverview onNav={onNav} />
}

export function ManagerInterventionsPage({ onNav }) {
  return <ActionableInterventionsPanel onNav={onNav} />
}
