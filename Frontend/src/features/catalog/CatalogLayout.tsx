import { NavLink, Outlet } from 'react-router-dom'
import styles from './Catalog.module.css'

/**
 * Learning operations.
 *
 * What is on offer, how it got there, who is taking it, and what is about to lapse — each on its
 * own URL so a course under review can be linked to rather than described.
 */

const SECTIONS = [
  { to: '/catalog', end: true, label: 'Courses' },
  { to: '/catalog/import', label: 'Import' },
  { to: '/catalog/paths', label: 'Learning paths' },
  { to: '/catalog/certifications', label: 'Certification renewals' },
]

export function CatalogLayout() {
  return (
    <div className={styles.section}>
      <header className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>Learning operations</h1>
        <p className={styles.sectionSubtitle}>
          The course catalogue and the learning built on it, across the organisation.
        </p>
      </header>

      <nav className={styles.tabs} aria-label="Catalogue views">
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
