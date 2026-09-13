import type { RiskSeverity } from './api'

/**
 * The person-by-skill matrix.
 *
 * Cells arrive as a flat list rather than a grid: only the pairs that have been analysed exist,
 * so a person with no record of a skill has no cell rather than a zero. The UI pivots them into
 * rows and columns, and an absent pair renders as "not analysed" — which is a different thing
 * from a gap of zero.
 */

export interface HeatmapSkillHeader {
  skillId: number
  skillName: string
  category: string | null
}

export interface HeatmapUserHeader {
  userId: number
  userName: string
  department: string | null
  jobTitle: string | null
}

export interface HeatmapCell {
  userId: number
  userName: string
  department: string | null
  jobTitle: string | null
  skillId: number
  skillName: string
  category: string | null
  currentProficiency: number
  currentProficiencyLabel: string
  targetProficiency: number
  targetProficiencyLabel: string
  gapScore: number
  /** The backend's coarse three-way banding; the UI uses gapSeverity instead. */
  skillLevel: string
  /** The four-level scale the shared colour tokens are keyed on. */
  gapSeverity: RiskSeverity
  /** A hex colour the backend suggests. Deliberately unused — see the heatmap component. */
  colorCode: string
  missingSkill: boolean
}

export interface HeatmapMatrix {
  scope: string
  scopeName: string
  totalUsers?: number
  totalSkills?: number
  users: HeatmapUserHeader[]
  skills: HeatmapSkillHeader[]
  matrix: HeatmapCell[]
  levelCounts?: Record<string, number>
  colorLegend?: Record<string, string>
  generatedAt: string
}
