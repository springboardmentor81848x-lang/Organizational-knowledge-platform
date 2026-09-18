import { type ReactNode, useEffect, useState } from 'react';
import { Bell, Brain, HelpCircle, LogOut, Menu, UserRound, X } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { endpoints, get } from '../api';
import { currentEmail, currentRole, logout } from '../auth';
import { appNavigation } from '../routes/navigation';
import { PlatformTour } from './PlatformTour';

export default function Layout({ children }: { children: ReactNode }) {
  const role = currentRole();
  const email = currentEmail();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [unread, setUnread] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    get(`${endpoints.notifications}/unread-count`)
      .then((response: any) => {
        setUnread(Number(response?.count ?? response?.unreadCount ?? 0));
      })
      .catch(() => {
        setUnread(0);
      });
  }, [location.pathname]);

  const items = appNavigation.filter((item) => !item.roles || item.roles.includes(role as 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE' | 'UNASSIGNED'));

  return (
    <div className="appShell">
      <aside className={open ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <div className="brandMark">OK</div>
          <div>
            <b>OKGIP</b>
            <small>Knowledge Intelligence</small>
          </div>
          <button className="mobileClose" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <nav>
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={17} />
              <span>{label}</span>
              {label === 'Notifications' && unread > 0 && <i className="navCount">{unread}</i>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebarFoot">
          <small>{role}</small>
          <button onClick={logout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="mobileMenu" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu />
          </button>

          <div>
            <span className="crumb">Organizational Knowledge Gap Intelligence Platform</span>
            <h1>{pageTitle(location.pathname)}</h1>
          </div>

          <div className="topActions" style={{ position: 'relative' }}>
            <span className="rolePill">{role}</span>
            <button className="iconBtn" onClick={() => setShowTour((v) => !v)} aria-label="Platform Guide & Tour" title="Platform Guide & Tour">
              <HelpCircle size={19} />
            </button>

            <button className="iconBtn" onClick={() => navigate('/notifications')} aria-label="Open notifications">
              <Bell size={19} />
              {unread > 0 && <i>{unread}</i>}
            </button>

            <button
              className="avatar"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="User Account Menu"
              title="User Account Menu"
              style={{ cursor: 'pointer', border: '2px solid var(--border)', background: '#5847d6', color: '#fff' }}
            >
              {(email[0] || 'U').toUpperCase()}
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 50,
                  right: 0,
                  width: 220,
                  background: '#ffffff',
                  borderRadius: 12,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  border: '1px solid var(--border)',
                  zIndex: 100,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: '#fcfbfe' }}>
                  <strong style={{ display: 'block', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email || 'Logged User'}</strong>
                  <small style={{ color: 'var(--muted)', fontSize: '0.76rem' }}>Role: {role}</small>
                </div>

                <button
                  onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text)' }}
                >
                  <UserRound size={16} /> My Profile
                </button>

                {role === 'EMPLOYEE' && (
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/skills'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text)' }}
                  >
                    <Brain size={16} /> My Skills
                  </button>
                )}

                <button
                  onClick={() => { setMenuOpen(false); navigate('/notifications'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text)' }}
                >
                  <Bell size={16} /> Notifications
                </button>

                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={logout}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.88rem', color: '#bc2948', fontWeight: 600 }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="content">{children}</div>
      </main>

      {showTour && <PlatformTour onClose={() => setShowTour(false)} />}
    </div>
  );
}

function pageTitle(pathname: string) {
  const map: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/profile': 'My Profile',
    '/skills': 'My Skills',
    '/knowledge-gaps': 'Knowledge Gap Analysis',
    '/gaps': 'Knowledge Gap Analysis',
    '/learning': 'My Learning',
    '/ai': 'AI Recommendation Center',
    '/assessments': 'Assessments',
    '/certifications': 'Certifications',
    '/mentorship': 'Mentorship',
    '/knowledge-sessions': 'Knowledge Sessions',
    '/sessions': 'Knowledge Sessions',
    '/knowledge-resources': 'Knowledge Resources',
    '/notifications': 'Notifications',
    '/reports': 'Reports & Analytics',
    '/employees': 'Employee Management',
    '/competencies': 'Competency Framework',
    '/training': 'Training Catalog',
    '/training-admin': 'Training Management',
    '/skills-admin': 'Skill Management',
  };

  return map[pathname] || 'Dashboard';
}
