import { useLocation } from 'react-router-dom'
import { useSession } from '@/features/auth/useSession'
import { RoleMismatchNotice } from '../RoleMismatchNotice'
import type { Role } from '@/types/api'
import {
  AchievementsCard,
  ActiveMentorCard,
  GapSummaryCard,
  LearningPathCard,
  RecommendationsCard,
  SkillSummaryCard,
  UpcomingSessionsCard,
} from './cards'
import styles from './EmployeeDashboard.module.css'

/**
 * The employee's own view.
 *
 * Seven cards, seven separate calls. Composing the page this way rather than from a single
 * aggregate response means the panels degrade independently: if recommendations are slow or
 * refused, the gap summary beside them still renders.
 */
export function EmployeeDashboard() {
  const { user } = useSession()
  const location = useLocation()
  const mismatch = (location.state as { roleMismatch?: { expected: Role; actual: Role } } | null)
    ?.roleMismatch

  if (!user) return null

  const firstName = user.fullName.trim().split(/\s+/)[0]

  return (
    <div className={styles.page}>
      {mismatch && <RoleMismatchNotice expected={mismatch.expected} actual={mismatch.actual} />}

      <header className={styles.header}>
        <h1 className={styles.title}>Good to see you, {firstName}</h1>
        <p className={styles.subtitle}>
          {user.targetJobTitle
            ? 'Where your skills stand against the role you are working towards, and what is closing the distance.'
            : `Where your skills stand against ${user.jobTitle ?? 'your role'}${
                user.department ? ` in ${user.department}` : ''
              }, and what is closing the distance.`}
        </p>

        {/*
          The target role is stated up front because it is the yardstick for everything below
          it: the assessment questions, the gap scores and the heatmap are all measured against
          this role rather than the one held today. Leaving it implicit would make the numbers
          on this page hard to interpret.
        */}
        {user.targetJobTitle ? (
          <div className={styles.targetRole}>
            <span className={styles.targetRoleLabel}>Working towards</span>
            <span className={styles.targetRoleValue}>
              {user.targetJobTitle}
              {user.targetDepartment ? ` · ${user.targetDepartment}` : ''}
            </span>
            {user.jobTitle && (
              <span className={styles.targetRoleFrom}>
                Currently {user.jobTitle}
                {user.department ? ` · ${user.department}` : ''}
              </span>
            )}
          </div>
        ) : (
          <div className={styles.targetRoleMissing}>
            No target role is set, so your gaps are measured against your current role. Choose one
            from your profile to be assessed against where you are heading.
          </div>
        )}
      </header>

      <div className={styles.grid}>
        <GapSummaryCard employeeId={user.id} />
        <SkillSummaryCard employeeId={user.id} />
        <RecommendationsCard employeeId={user.id} />
        <LearningPathCard employeeId={user.id} />
        <UpcomingSessionsCard employeeId={user.id} />
        <ActiveMentorCard employeeId={user.id} />
        <AchievementsCard />
      </div>
    </div>
  )
}
