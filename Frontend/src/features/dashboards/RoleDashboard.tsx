import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics'
import { queryKeys } from '@/api/queryKeys'
import { Card } from '@/components/ui/Card'
import { ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { ROLE_DEFINITIONS } from '@/app/roleRoutes'
import { useSession } from '@/features/auth/useSession'
import type { Role } from '@/types/api'
import { RoleMismatchNotice } from './RoleMismatchNotice'
import { StatGrid, type Stat } from './StatGrid'
import styles from './RoleDashboard.module.css'

/**
 * Each role lands on its own dashboard, reading the analytics endpoint scoped to it: an employee
 * sees themselves, a manager their team, a department head their department, HR and L&D and
 * administrators the organisation.
 *
 * Every figure comes from that call. Where a role has no headline figures yet the panel says so
 * rather than inventing any, and a failed call shows the failure — a dashboard that renders
 * zeroes when the request did not succeed is indistinguishable from one reporting real zeroes.
 */
export function RoleDashboard() {
  const { user, role } = useSession()
  const location = useLocation()
  const mismatch = (location.state as { roleMismatch?: { expected: Role; actual: Role } } | null)
    ?.roleMismatch

  const definition = role ? ROLE_DEFINITIONS[role] : null

  return (
    <div className={styles.page}>
      {mismatch && <RoleMismatchNotice expected={mismatch.expected} actual={mismatch.actual} />}

      <header className={styles.header}>
        <h1 className={styles.title}>{definition?.dashboardTitle ?? 'Dashboard'}</h1>
        <p className={styles.subtitle}>{definition?.dashboardSubtitle}</p>
      </header>

      {role && user && <DashboardBody role={role} userId={user.id} department={user.department} />}
    </div>
  )
}

function DashboardBody({
  role,
  userId,
  department,
}: {
  role: Role
  userId: number
  department: string | null
}) {
  switch (role) {
    case 'EMPLOYEE':
      return <EmployeeDashboard userId={userId} />
    case 'MANAGER':
      return <TeamDashboard managerId={userId} />
    case 'DEPARTMENT_HEAD':
      return <DepartmentDashboard department={department} />
    default:
      // HR, L&D and administrators all read the organisation, and each gets a heading of its
      // own from the role definition above.
      return <OrganizationDashboard />
  }
}

/** Shared shell so every dashboard treats loading, refusal and failure identically. */
function Panel({
  title,
  description,
  isLoading,
  error,
  onRetry,
  children,
}: {
  title: string
  description?: string
  isLoading: boolean
  error: unknown
  onRetry: () => void
  children: React.ReactNode
}) {
  if (isLoading) {
    return (
      <Card title={title} description={description} flush>
        <LoadingBlock rows={4} label={`Loading ${title}`} />
      </Card>
    )
  }
  if (error) {
    return (
      <Card title={title} description={description} flush>
        {isPermissionDenied(error) ? <PermissionDenied /> : <ErrorBlock error={error} onRetry={onRetry} />}
      </Card>
    )
  }
  return (
    <Card title={title} description={description}>
      {children}
    </Card>
  )
}

function EmployeeDashboard({ userId }: { userId: number }) {
  const query = useQuery({
    queryKey: queryKeys.analytics.employee(userId),
    queryFn: ({ signal }) => analyticsApi.employee(userId, signal),
  })

  const stats: Stat[] = query.data
    ? [
        {
          label: 'Role readiness',
          value: query.data.gapSummary.overallReadinessPercentage,
          suffix: '%',
        },
        { label: 'Open skill gaps', value: query.data.gapSummary.proficiencyGapsCount },
        { label: 'Skills missing', value: query.data.gapSummary.missingSkillsCount },
        { label: 'Learning progress', value: query.data.learningProgressPercent, suffix: '%' },
        { label: 'Courses in progress', value: query.data.activeEnrollments },
        { label: 'Courses completed', value: query.data.completedEnrollments },
      ]
    : []

  return (
    <Panel
      title="Your position"
      description="Measured against what your role requires."
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
    >
      <StatGrid stats={stats} />
    </Panel>
  )
}

function TeamDashboard({ managerId }: { managerId: number }) {
  const query = useQuery({
    queryKey: queryKeys.analytics.team(managerId),
    queryFn: ({ signal }) => analyticsApi.team(managerId, signal),
  })

  const stats: Stat[] = query.data
    ? [
        { label: 'Team size', value: query.data.teamSize },
        { label: 'High-risk gap alerts', value: query.data.highRiskGapAlerts.length },
        {
          label: 'Training adoption',
          value: query.data.trainingAdoption.adoptionRatePercent,
          suffix: '%',
        },
        {
          label: 'Course completion',
          value: query.data.trainingAdoption.completionRatePercent,
          suffix: '%',
        },
        { label: 'Improved after training', value: query.data.improvedAfterTraining.length },
        {
          label: 'Average progress',
          value: query.data.trainingAdoption.avgProgressPercent,
          suffix: '%',
        },
      ]
    : []

  return (
    <Panel
      title="Your team"
      description="Across your direct reports."
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
    >
      <StatGrid stats={stats} />
    </Panel>
  )
}

function DepartmentDashboard({ department }: { department: string | null }) {
  const query = useQuery({
    queryKey: queryKeys.analytics.department(department ?? ''),
    queryFn: ({ signal }) => analyticsApi.department(department!, signal),
    enabled: Boolean(department),
  })

  if (!department) {
    return (
      <Card title="Your department">
        <p className={styles.note}>
          Your account has no department recorded, so there is nothing to report against. An
          administrator can set one on your profile.
        </p>
      </Card>
    )
  }

  const stats: Stat[] = query.data
    ? [
        { label: 'Employees', value: query.data.totalEmployees },
        { label: 'Eligible for development', value: query.data.eligibleEmployees },
        { label: 'Enrolled', value: query.data.employeesEnrolled },
        { label: 'Completed', value: query.data.employeesCompleted },
        {
          label: 'Completion rate',
          value: query.data.trainingCompletionRatePercent,
          suffix: '%',
        },
        { label: 'Critical skill gaps', value: query.data.criticalSkillGapCount },
      ]
    : []

  return (
    <Panel
      title={department}
      description="Training reach and gap exposure."
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
    >
      <StatGrid stats={stats} />
    </Panel>
  )
}

function OrganizationDashboard() {
  const query = useQuery({
    queryKey: queryKeys.analytics.organization(),
    queryFn: ({ signal }) => analyticsApi.organization(signal),
  })

  const stats: Stat[] = query.data
    ? [
        { label: 'Employees', value: query.data.totalEmployees },
        { label: 'Skills tracked', value: query.data.workforceSkillInventory.length },
        {
          label: 'Readiness',
          value: query.data.gapIntelligence.overallReadinessPercentage,
          suffix: '%',
        },
        {
          label: 'Training completion',
          value: query.data.trainingCompletionRatePercent,
          suffix: '%',
        },
        { label: 'Average skill improvement', value: query.data.averageSkillImprovement },
        { label: 'Active mentorships', value: query.data.activeMentorshipCount },
      ]
    : []

  return (
    <Panel
      title="Across the organisation"
      description="Every figure queried live."
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
    >
      <StatGrid stats={stats} />
    </Panel>
  )
}
