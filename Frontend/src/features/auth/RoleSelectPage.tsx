import { useNavigate } from 'react-router-dom'
import type { Role } from '@/types/api'
import styles from './RoleSelectPage.module.css'

/**
 * The landing screen: six tiles, one per role.
 *
 * This is signposting and nothing more. Picking a tile carries the choice to the sign-in form
 * so the screen can say who is expected, and that is the whole of its effect. The role that
 * decides what somebody sees comes from the token the backend issues, so a person who picks
 * "System Administrator" here and signs in as an employee lands on the employee dashboard.
 */

interface Tile {
  /** The role the tile represents, sent along purely as a hint for the next screen. */
  role: Role
  name: string
  description: string
  accent: string
}

const TILES: Tile[] = [
  {
    role: 'EMPLOYEE',
    name: 'Employee',
    description: 'Track your skills, close your gaps and follow your learning path.',
    accent: 'var(--c-info)',
  },
  {
    role: 'MANAGER',
    name: 'Team Lead',
    description: 'See where your reports are strong, where they are short, and who is improving.',
    accent: 'var(--c-low)',
  },
  {
    role: 'HR_SPECIALIST',
    name: 'HR Specialist',
    description: 'Skill inventory and gap exposure across the whole organisation.',
    accent: 'var(--c-medium)',
  },
  {
    role: 'DEPARTMENT_HEAD',
    name: 'Department Head',
    description: 'Training reach and capability shortfall across your department.',
    accent: 'var(--c-high)',
  },
  {
    role: 'LND_ADMIN',
    name: 'L&D Admin / Mentor',
    description: 'Run the course catalog, host sessions and see whether training works.',
    accent: '#6b4fa8',
  },
  {
    role: 'SYSTEM_ADMIN',
    name: 'System Administrator',
    description: 'Accounts, roles, audit history and the health of the service.',
    accent: 'var(--c-critical)',
  },
]

export function RoleSelectPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandGlyph} aria-hidden="true">
            IN
          </span>
          <span className={styles.brandName}>Infosys Skills Intelligence</span>
        </div>

        <h1 className={styles.heading}>How do you use this platform?</h1>
        <p className={styles.sub}>
          Choose the description that fits you. This only decides where we take you next — your
          actual access comes from your account.
        </p>

        <div className={styles.grid}>
          {TILES.map((tile) => (
            <button
              key={tile.role}
              type="button"
              className={styles.tile}
              // The chosen role travels in navigation state, never in storage: it is a hint for
              // one screen, not a fact about the session.
              onClick={() => navigate('/login', { state: { intendedRole: tile.role } })}
            >
              <span className={styles.stripe} style={{ background: tile.accent }} aria-hidden="true" />
              <span className={styles.tileName}>{tile.name}</span>
              <span className={styles.tileDesc}>{tile.description}</span>
            </button>
          ))}
        </div>

        <p className={styles.footnote}>
          Your permissions are set by your account, not by this choice. If you pick one here and
          your account says otherwise, we will take you to the right place and tell you why.
        </p>
      </div>
    </div>
  )
}
