import { NavLink, Outlet } from 'react-router-dom'
import styles from './Workforce.module.css'

/**
 * The workforce section.
 *
 * Five views over the organisation, each on its own URL so a finding can be linked to rather
 * than described. They are tabs rather than one long page because they answer different
 * questions and are read at different moments: exposure now, capability held, whether training
 * worked, where the numbers are heading, and who sits where.
 */

const SECTIONS = [
  { to: '/workforce', end: true, label: 'Gap intelligence' },
  { to: '/workforce/inventory', label: 'Skill inventory' },
  { to: '/workforce/effectiveness', label: 'Training effectiveness' },
  { to: '/workforce/trends', label: 'Forecasting' },
  { to: '/workforce/people', label: 'People & departments' },
]

export function WorkforceLayout() {
  return (
    <div className={styles.section}>
      <header className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>Workforce intelligence</h1>
        <p className={styles.sectionSubtitle}>
          Capability and shortfall across the whole organisation, not one team within it.
        </p>
      </header>

      <nav className={styles.tabs} aria-label="Workforce views">
        {SECTIONS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => [styles.tab, isActive ? styles.tabActive : ''].join(' ')}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
