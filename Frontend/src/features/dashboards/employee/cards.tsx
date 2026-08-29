import { Link } from 'react-router-dom'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { gapAnalysisApi } from '@/api/gapAnalysis'
import { learningPathsApi } from '@/api/learningPaths'
import { mentorshipApi } from '@/api/mentorship'
import { profileApi } from '@/api/profile'
import { recommendationsApi } from '@/api/recommendations'
import { sessionsApi } from '@/api/sessions'
import { skillsApi } from '@/api/skills'
import { queryKeys } from '@/api/queryKeys'
import { Card } from '@/components/ui/Card'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { ProficiencyScale } from '@/components/ui/ProficiencyScale'
import { StatusPill } from '@/components/ui/StatusPill'
import { PROFICIENCY_SCORE, type ProficiencyLevel, type RiskSeverity } from '@/types/api'
import styles from './EmployeeDashboard.module.css'

/**
 * The dashboard cards.
 *
 * Each one owns its own query against its own endpoint, rather than all of them reading fields
 * off a single aggregate response. That means a card that fails says so while its neighbours
 * carry on, and a card that changes is refetched on its own rather than dragging six other
 * panels with it.
 */

/** Shared shell so every card treats loading, refusal and failure the same way. */
function CardShell<T>({
  title,
  description,
  action,
  query,
  isEmpty,
  emptyTitle,
  emptyMessage,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  query: UseQueryResult<T>
  isEmpty?: (data: T) => boolean
  emptyTitle: string
  emptyMessage?: string
  children: (data: T) => ReactNode
}) {
  if (query.isLoading) {
    return (
      <Card title={title} description={description} flush>
        <LoadingBlock rows={3} label={`Loading ${title}`} />
      </Card>
    )
  }
  if (query.isError) {
    return (
      <Card title={title} description={description} flush>
        {isPermissionDenied(query.error) ? (
          <PermissionDenied />
        ) : (
          <ErrorBlock error={query.error} onRetry={query.refetch} />
        )}
      </Card>
    )
  }
  if (query.data === undefined || isEmpty?.(query.data)) {
    return (
      <Card title={title} description={description} actions={action} flush>
        <EmptyBlock title={emptyTitle} message={emptyMessage} />
      </Card>
    )
  }
  return (
    <Card title={title} description={description} actions={action}>
      {children(query.data)}
    </Card>
  )
}

// ── Skill summary ───────────────────────────────────────────────────────────

export function SkillSummaryCard({ employeeId }: { employeeId: number }) {
  const query = useQuery({
    queryKey: queryKeys.skills.forUser(employeeId),
    queryFn: ({ signal }) => skillsApi.forUser(employeeId, signal),
  })

  return (
    <CardShell
      title="Skill profile"
      description="What you hold, and at what level."
      action={<Link to="/skills">Manage</Link>}
      query={query}
      isEmpty={(skills) => skills.length === 0}
      emptyTitle="No skills recorded yet"
      emptyMessage="Add the skills you work with so your gaps can be measured against your role."
    >
      {(skills) => {
        const strongest = [...skills].sort(
          (a, b) => PROFICIENCY_SCORE[b.proficiencyLevel] - PROFICIENCY_SCORE[a.proficiencyLevel],
        )
        const average =
          skills.reduce((total, s) => total + PROFICIENCY_SCORE[s.proficiencyLevel], 0) / skills.length

        return (
          <>
            <div className={styles.summaryRow}>
              <span className={styles.bigNumber}>{skills.length}</span>
              <span className={styles.summaryLabel}>
                skills on record · average level {Math.round(average * 10) / 10} of 4
              </span>
            </div>
            <ul className={styles.list}>
              {strongest.slice(0, 4).map((skill) => (
                <li className={styles.listRow} key={skill.id}>
                  <span className={styles.rowName}>{skill.skillName}</span>
                  <ProficiencyScale level={skill.proficiencyLevel} compact />
                </li>
              ))}
            </ul>
          </>
        )
      }}
    </CardShell>
  )
}

// ── Gap summary ─────────────────────────────────────────────────────────────

const SEVERITY_ORDER: RiskSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

export function GapSummaryCard({ employeeId }: { employeeId: number }) {
  const query = useQuery({
    queryKey: queryKeys.gaps.summary(employeeId),
    queryFn: ({ signal }) => gapAnalysisApi.summaryForUser(employeeId, signal),
  })

  return (
    <CardShell
      title="Gaps against your role"
      description="Where you sit versus what the role requires."
      action={<Link to="/gaps">Details</Link>}
      query={query}
      emptyTitle="No gap analysis yet"
      emptyMessage="Once your role has a competency profile, your gaps will be measured here."
    >
      {(summary) => (
        <>
          <div className={styles.summaryRow}>
            <span className={styles.bigNumber}>{summary.overallReadinessPercentage}%</span>
            <span className={styles.summaryLabel}>
              ready for {summary.jobTitle ?? 'your role'} · {summary.totalRequiredSkills} skills required
            </span>
          </div>
          <ul className={styles.severityList}>
            {SEVERITY_ORDER.map((severity) => (
              <li className={styles.severityRow} key={severity}>
                <StatusPill value={severity} />
                <span className={`${styles.severityCount} tabular`}>
                  {summary.riskDistribution?.[severity] ?? 0}
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.footnote}>
            {summary.missingSkillsCount} not on record · {summary.proficiencyGapsCount} below the
            required level
          </p>
        </>
      )}
    </CardShell>
  )
}

// ── Recommendations ─────────────────────────────────────────────────────────

export function RecommendationsCard({ employeeId }: { employeeId: number }) {
  const query = useQuery({
    queryKey: queryKeys.recommendations.forUser(employeeId),
    queryFn: ({ signal }) => recommendationsApi.forEmployee(employeeId, signal),
  })

  return (
    <CardShell
      title="Recommended for you"
      description="Generated from your current gaps."
      query={query}
      isEmpty={(items) => items.length === 0}
      emptyTitle="No recommendations yet"
      emptyMessage="These appear once your gaps have been analysed."
    >
      {(items) => (
        <ul className={styles.list}>
          {[...items]
            .sort((a, b) => a.priorityRank - b.priorityRank)
            .slice(0, 3)
            .map((item) => (
              <li className={styles.stacked} key={item.id}>
                <div className={styles.stackedHead}>
                  <span className={styles.rowName}>{item.skillName}</span>
                  <StatusPill value={item.sourceGapSeverity} />
                </div>
                <p className={styles.stackedBody}>{item.recommendationText}</p>
              </li>
            ))}
        </ul>
      )}
    </CardShell>
  )
}

// ── Learning paths ──────────────────────────────────────────────────────────

export function LearningPathCard({ employeeId }: { employeeId: number }) {
  const query = useQuery({
    queryKey: queryKeys.learningPaths.forUser(employeeId),
    queryFn: ({ signal }) => learningPathsApi.forEmployee(employeeId, signal),
  })

  return (
    <CardShell
      title="Learning paths"
      description="Progress through your planned routes."
      action={<Link to="/learning">Open</Link>}
      query={query}
      isEmpty={(paths) => paths.length === 0}
      emptyTitle="No learning path yet"
      emptyMessage="A path is generated from your gaps once they have been analysed."
    >
      {(paths) => (
        <ul className={styles.list}>
          {paths.slice(0, 3).map((path) => (
            <li className={styles.stacked} key={path.id}>
              <div className={styles.stackedHead}>
                <span className={styles.rowName}>{path.title}</span>
                <StatusPill value={path.status} />
              </div>
              <div className={styles.progressTrack} aria-hidden="true">
                <div className={styles.progressFill} style={{ width: `${path.overallProgressPercent}%` }} />
              </div>
              <p className={styles.stackedBody}>
                {path.overallProgressPercent}% complete · {path.totalEstimatedHours}h ·{' '}
                {path.estimatedCalendarTime}
              </p>
            </li>
          ))}
        </ul>
      )}
    </CardShell>
  )
}

// ── Upcoming sessions ───────────────────────────────────────────────────────

export function UpcomingSessionsCard({ employeeId }: { employeeId: number }) {
  const query = useQuery({
    queryKey: queryKeys.sessions.list({ scope: 'mine' }),
    queryFn: ({ signal }) => sessionsApi.list({ status: 'SCHEDULED' }, signal),
    // The session list carries its registrations, so who is attending is decided from the same
    // response rather than a second call per session.
    select: (sessions) => {
      const now = Date.now()
      return sessions
        .filter((session) => new Date(session.sessionDate).getTime() > now)
        .filter((session) =>
          session.registrations.some((registration) => registration.employeeId === employeeId),
        )
        .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())
    },
  })

  return (
    <CardShell
      title="Upcoming sessions"
      description="Knowledge-sharing sessions you are booked on."
      action={<Link to="/sessions">Browse</Link>}
      query={query}
      isEmpty={(sessions) => sessions.length === 0}
      emptyTitle="Nothing booked"
      emptyMessage="Sessions you register for will appear here."
    >
      {(sessions) => (
        <ul className={styles.list}>
          {sessions.slice(0, 3).map((session) => (
            <li className={styles.stacked} key={session.sessionId}>
              <span className={styles.rowName}>{session.title}</span>
              <p className={styles.stackedBody}>
                {formatDateTime(session.sessionDate)} · {session.durationMinutes} min · hosted by{' '}
                {session.mentorName}
              </p>
            </li>
          ))}
        </ul>
      )}
    </CardShell>
  )
}

// ── Active mentor ───────────────────────────────────────────────────────────

export function ActiveMentorCard({ employeeId }: { employeeId: number }) {
  const query = useQuery({
    queryKey: queryKeys.mentorships.forUser(employeeId),
    queryFn: ({ signal }) => mentorshipApi.forEmployee(employeeId, signal),
    select: (mentorships) =>
      mentorships.filter((m) => m.status === 'ACTIVE' && m.menteeId === employeeId),
  })

  return (
    <CardShell
      title="Your mentor"
      description="Active mentoring arrangements."
      action={<Link to="/mentorship">Find a mentor</Link>}
      query={query}
      isEmpty={(list) => list.length === 0}
      emptyTitle="No active mentor"
      emptyMessage="Request a mentor for a skill you are working on."
    >
      {(list) => (
        <ul className={styles.list}>
          {list.map((mentorship) => (
            <li className={styles.mentor} key={mentorship.mentorshipId}>
              <span className={styles.avatar} aria-hidden="true">
                {initials(mentorship.mentorName)}
              </span>
              <span className={styles.mentorText}>
                <span className={styles.rowName}>{mentorship.mentorName}</span>
                <span className={styles.stackedBody}>
                  Mentoring you in {mentorship.skillName}
                  {mentorship.startDate ? ` since ${formatDate(mentorship.startDate)}` : ''}
                </span>
                {mentorship.goal && <span className={styles.goal}>“{mentorship.goal}”</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </CardShell>
  )
}

// ── Achievements ────────────────────────────────────────────────────────────

export function AchievementsCard() {
  const query = useQuery({
    queryKey: ['achievements', 'me'],
    queryFn: ({ signal }) => profileApi.achievements(signal),
  })

  return (
    <CardShell
      title="Recent achievements"
      description="Earned as you complete work."
      query={query}
      isEmpty={(items) => items.length === 0}
      emptyTitle="Nothing earned yet"
      emptyMessage="Completing a course or a mentorship earns your first."
    >
      {(items) => (
        <ul className={styles.list}>
          {items.slice(0, 4).map((achievement) => (
            <li className={styles.stacked} key={achievement.id}>
              <div className={styles.stackedHead}>
                <span className={styles.rowName}>{achievement.title}</span>
                <span className={styles.date}>{formatDate(achievement.earnedAt)}</span>
              </div>
              {achievement.description && (
                <p className={styles.stackedBody}>{achievement.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </CardShell>
  )
}

// ── Formatting ──────────────────────────────────────────────────────────────

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export type { ProficiencyLevel }
