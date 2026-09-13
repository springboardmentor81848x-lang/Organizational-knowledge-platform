import { NavLink, Outlet } from 'react-router-dom'
import styles from './Admin.module.css'

/**
 * Platform administration.
 *
 * Accounts and the rules that govern them, the record of what has been done, and whether the
 * service is up.
 */

const SECTIONS = [
  { to: '/admin', end: true, label: 'Users' },
  { to: '/admin/roles', label: 'Roles & permissions' },
  { to: '/admin/audit', label: 'Audit log' },
  { to: '/admin/health', label: 'System health' },
]

export function AdminLayout() {
  return (
    <div className={styles.section}>
      <header className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>Platform administration</h1>
        <p className={styles.sectionSubtitle}>
          Accounts, roles and the health of the service.
        </p>
      </header>

      <nav className={styles.tabs} aria-label="Administration views">
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
