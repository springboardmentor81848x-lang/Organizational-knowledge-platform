import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { NotificationBell } from '@/features/notifications/NotificationBell'
import { useLogout, useSession } from '@/features/auth/useSession'
import { navigation, roleLabel, visibleNavigation } from './navigation'
import styles from './AppShell.module.css'

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** The label for the current route, taken from the same table that builds the rail. */
function currentPageLabel(pathname: string): string {
  const match = navigation
    .flatMap((section) => section.items)
    .find((item) => (item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)))
  return match?.label ?? 'Skills Intelligence'
}

export function AppShell() {
  const { user, role } = useSession()
  const logout = useLogout()
  const location = useLocation()
  const sections = visibleNavigation(role ?? undefined)

  return (
    <div className={styles.shell}>
      <aside className={styles.rail}>
        <div className={styles.brand}>
          <span className={styles.brandGlyph} aria-hidden="true">
            IN
          </span>
          <span className={styles.brandName}>Skills Intelligence</span>
        </div>

        <nav className={styles.nav} aria-label="Main">
          {sections.map((section) => (
            <div className={styles.section} key={section.label}>
              <p className={styles.sectionLabel}>{section.label}</p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {user && (
          <div className={styles.railFooter}>
            <div className={styles.user}>
              <span className={styles.avatar} aria-hidden="true">
                {initials(user.fullName)}
              </span>
              <span className={styles.userText}>
                <span className={styles.userName}>{user.fullName}</span>
                <span className={styles.userRole}>{roleLabel(user.role)}</span>
              </span>
            </div>
          </div>
        )}
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.breadcrumb}>{currentPageLabel(location.pathname)}</span>
          <div className={styles.topbarActions}>
            <NotificationBell />
            <Button variant="ghost" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
