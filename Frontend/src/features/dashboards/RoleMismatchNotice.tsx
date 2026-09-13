import { ROLE_DEFINITIONS } from '@/app/roleRoutes'
import type { Role } from '@/types/api'
import styles from './RoleDashboard.module.css'

/**
 * Shown when somebody picked one role on the landing screen and their account turned out to be
 * another. It explains rather than silently redirecting, so the difference between what they
 * expected and what they have is visible instead of feeling like a bug.
 */
export function RoleMismatchNotice({ expected, actual }: { expected: Role; actual: Role }) {
  return (
    <div className={styles.notice} role="status">
      <span className={styles.noticeGlyph} aria-hidden="true">
        i
      </span>
      <span>
        You chose <strong>{ROLE_DEFINITIONS[expected].label}</strong>, but your account is set up as{' '}
        <strong>{ROLE_DEFINITIONS[actual].label}</strong>, so we have brought you here instead. If
        that looks wrong, your administrator can change your role.
      </span>
    </div>
  )
}
