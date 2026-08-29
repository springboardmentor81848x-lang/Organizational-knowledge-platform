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
          Where your skills stand against {user.jobTitle ?? 'your role'}
          {user.department ? ` in ${user.department}` : ''}, and what is closing the distance.
        </p>
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
