import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { departmentHeadApi, managerApi } from '@/api/team'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { StatusPill } from '@/components/ui/StatusPill'
import { Table, type Column } from '@/components/ui/Table'
import type { GapAnalysis } from '@/types/api'
import type { TeamMemberSummary } from '@/types/analytics'
import { useSession } from '@/features/auth/useSession'
import { SkillGapHeatmap } from './SkillGapHeatmap'
import { MemberDrilldown } from './MemberDrilldown'
import { AssignDialog } from './AssignDialog'
import styles from './TeamDashboardPage.module.css'

/**
 * The management view, in two scopes.
 *
 * A manager and a department head see the same shapes over genuinely different endpoints:
 * /api/manager/* is answered from the caller's direct reports, /api/department-head/* from the
 * caller's department. Scope is decided by which endpoint is called and by who is calling it,
 * never by a parameter — so one manager cannot obtain another's team by changing a value.
 */

export type Scope = 'manager' | 'department'

function apiFor(scope: Scope) {
  return scope === 'manager' ? managerApi : departmentHeadApi
}

export function TeamDashboardPage({ scope }: { scope: Scope }) {
  const { user } = useSession()
  const [drilldown, setDrilldown] = useState<TeamMemberSummary | null>(null)
  const [assigning, setAssigning] = useState<TeamMemberSummary | null>(null)
  const api = apiFor(scope)

  const members = useQuery({
    queryKey: queryKeys.team.members(scope),
    queryFn: ({ signal }) =>
      scope === 'manager' ? managerApi.team(signal) : departmentHeadApi.department(signal),
  })

  const matrix = useQuery({
    queryKey: queryKeys.team.gapMatrix(scope),
    queryFn: ({ signal }) =>
      scope === 'manager' ? managerApi.gapMatrix(signal) : departmentHeadApi.gapMatrix(signal),
  })

  const highRisk = useQuery({
    queryKey: queryKeys.team.highRiskGaps(scope),
    queryFn: ({ signal }) => api.highRiskGaps(signal),
  })

  const adoption = useQuery({
    queryKey: queryKeys.team.adoption(scope),
    queryFn: ({ signal }) => api.trainingAdoption(signal),
  })

  const heading = scope === 'manager' ? 'My team' : user?.department ?? 'My department'
  const subheading =
    scope === 'manager'
      ? 'Your direct reports: where they are short, and what is being done about it.'
      : 'Everyone in your department, and how capability is distributed across it.'

  const memberColumns: Column<TeamMemberSummary>[] = [
    {
      key: 'name',
      header: 'Employee',
      render: (member) => (
        <div className={styles.memberCell}>
          <span className={styles.memberName}>{member.fullName}</span>
          <span className={styles.memberRole}>{member.jobTitle ?? member.email}</span>
        </div>
      ),
    },
    {
      key: 'skill',
      header: 'Avg level',
      numeric: true,
      width: '110px',
      render: (member) => <span>{member.avgSkillScore} / 4</span>,
    },
    { key: 'gaps', header: 'Gaps', numeric: true, width: '90px', render: (m) => String(m.gapCount) },
    {
      key: 'training',
      header: 'Training',
      numeric: true,
      width: '110px',
      render: (member) => <span>{member.trainingProgressPercent}%</span>,
    },
    {
      key: 'assessed',
      header: 'Last assessed',
      width: '150px',
      render: (member) =>
        member.lastAssessmentDate ? (
          formatDate(member.lastAssessmentDate)
        ) : (
          <span className={styles.never}>Never</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      width: '190px',
      render: (member) => (
        <div className={styles.rowActions}>
          <Button size="sm" variant="ghost" onClick={() => setDrilldown(member)}>
            Open
          </Button>
          <Button size="sm" onClick={() => setAssigning(member)}>
            Assign
          </Button>
        </div>
      ),
    },
  ]

  const gapColumns: Column<GapAnalysis>[] = [
    { key: 'person', header: 'Employee', render: (gap) => gap.userName },
    { key: 'skill', header: 'Skill', render: (gap) => gap.skillName },
    { key: 'required', header: 'Required', width: '120px', render: (gap) => gap.targetProficiency },
    {
      key: 'current',
      header: 'Holds',
      width: '130px',
      render: (gap) =>
        gap.isMissingSkill ? <span className={styles.never}>Not on record</span> : gap.currentProficiency,
    },
    { key: 'gap', header: 'Gap', numeric: true, width: '80px', render: (gap) => String(gap.gapScore) },
    {
      key: 'severity',
      header: 'Severity',
      width: '110px',
      render: (gap) => <StatusPill value={gap.riskSeverity} />,
    },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{heading}</h1>
        <p className={styles.subtitle}>{subheading}</p>
      </header>

      <AdoptionStrip query={adoption} />

      <Card
        title="Skill gap heatmap"
        description={
          scope === 'manager'
            ? 'Every direct report against every analysed skill.'
            : 'Everyone in the department against every analysed skill.'
        }
        flush={matrix.isLoading || Boolean(matrix.error)}
      >
        {matrix.isLoading ? (
          <LoadingBlock rows={5} label="Loading the heatmap" />
        ) : matrix.isError ? (
          isPermissionDenied(matrix.error) ? (
            <PermissionDenied />
          ) : (
            <ErrorBlock error={matrix.error} onRetry={matrix.refetch} />
          )
        ) : matrix.data ? (
          <SkillGapHeatmap matrix={matrix.data} />
        ) : null}
      </Card>

      <Card
        title="High-risk gap alerts"
        description="Gaps at HIGH severity within your scope."
        flush
      >
        <Table
          columns={gapColumns}
          rows={highRisk.data}
          rowKey={(gap) => gap.id}
          isLoading={highRisk.isLoading}
          error={highRisk.error}
          onRetry={highRisk.refetch}
          caption="High-risk skill gaps"
          emptyTitle="No high-risk gaps"
          emptyMessage="Nobody in your scope currently has a gap at HIGH severity."
        />
      </Card>

      <Card
        title={scope === 'manager' ? 'Your reports' : 'Department members'}
        description="Open somebody to see their skills, gaps, training and assessment history."
        flush
      >
        <Table
          columns={memberColumns}
          rows={members.data}
          rowKey={(member) => member.id}
          isLoading={members.isLoading}
          error={members.error}
          onRetry={members.refetch}
          caption="People in your scope"
          emptyTitle={scope === 'manager' ? 'No direct reports' : 'Nobody in this department'}
          emptyMessage="People appear here once they report to you or share your department."
        />
      </Card>

      {drilldown && (
        <MemberDrilldown
          member={drilldown}
          scope={scope}
          onClose={() => setDrilldown(null)}
          onAssign={() => {
            setAssigning(drilldown)
            setDrilldown(null)
          }}
        />
      )}

      {assigning && (
        <AssignDialog member={assigning} scope={scope} onClose={() => setAssigning(null)} />
      )}
    </div>
  )
}

/** Training adoption, as its own strip because it is the one figure read at a glance. */
function AdoptionStrip({
  query,
}: {
  query: ReturnType<typeof useQuery<import('@/types/analytics').TrainingAdoption>>
}) {
  if (query.isLoading) {
    return (
      <Card flush>
        <LoadingBlock rows={2} label="Loading training adoption" />
      </Card>
    )
  }
  if (query.isError) {
    return (
      <Card flush>
        {isPermissionDenied(query.error) ? (
          <PermissionDenied />
        ) : (
          <ErrorBlock error={query.error} onRetry={query.refetch} />
        )}
      </Card>
    )
  }
  if (!query.data) return null

  const adoption = query.data
  if (adoption.totalMembers === 0) {
    return (
      <Card flush>
        <EmptyBlock title="Nobody in scope yet" message="Training figures appear once you have people." />
      </Card>
    )
  }

  return (
    <Card title="Training adoption" description="Across everyone in your scope.">
      <dl className={styles.stats}>
        <Stat label="People" value={adoption.totalMembers} />
        <Stat label="Enrolled" value={adoption.activeEnrolledMembers} />
        <Stat label="Completed something" value={adoption.completedMembers} />
        <Stat label="Adoption" value={adoption.adoptionRatePercent} suffix="%" />
        <Stat label="Completion" value={adoption.completionRatePercent} suffix="%" />
        <Stat label="Average progress" value={adoption.avgProgressPercent} suffix="%" />
      </dl>
    </Card>
  )
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div>
      <dt className={styles.statLabel}>{label}</dt>
      <dd className={styles.statValue}>
        <span className="tabular">{value}</span>
        {suffix && <span className={styles.statSuffix}>{suffix}</span>}
      </dd>
    </div>
  )
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
