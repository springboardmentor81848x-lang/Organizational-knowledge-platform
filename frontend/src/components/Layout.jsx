import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { getStoredUser, clearSession, roleFamily } from '../services/platformApi';

const Layout = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const family = roleFamily(user.role || user.accountType || 'Employee');
  const roleName = user.role || user.accountType || 'Employee';

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const getRolePrefix = () => {
    if (family === 'manager') return '/manager';
    if (family === 'hr') return '/hr';
    if (family === 'depthead') return '/department-head';
    if (family === 'learning') return '/ld';
    if (family === 'system') return '/admin';
    return '/employee';
  };

  const prefix = getRolePrefix();

  const roleNavigation = {
    employee: [
      { label: 'My Dashboard', icon: '📊', path: `${prefix}/dashboard` },
      { label: 'My Skills', icon: '🎯', path: `${prefix}/skills` },
      { label: 'My Skill Gaps', icon: '⚠️', path: `${prefix}/skill-gaps` },
      { label: 'Learning & Training', icon: '📚', path: `${prefix}/trainings` },
      { label: 'Assessments', icon: '📝', path: `${prefix}/assessments` },
      { label: 'AI Growth Plan', icon: '⚡', path: `${prefix}/ai-plan` },
      { label: 'Knowledge Base', icon: '📖', path: `${prefix}/articles` },
      { label: 'Q&A Community', icon: '💬', path: `${prefix}/qna` },
      { label: 'Find a Mentor', icon: '🤝', path: `${prefix}/mentors` },
    ],
    hr: [
      { label: 'HR Dashboard', icon: '📊', path: `${prefix}/dashboard` },
      { label: 'Workforce Directory', icon: '🧑‍💼', path: `${prefix}/hr-employees` },
      { label: 'Organization Skills', icon: '🎯', path: `${prefix}/skills` },
      { label: 'Workforce Skill Gaps', icon: '⚠️', path: `${prefix}/skill-gaps` },
      { label: 'Training Effectiveness', icon: '📚', path: `${prefix}/trainings` },
      { label: 'Knowledge Governance', icon: '📖', path: `${prefix}/articles` },
      { label: 'HR Reports', icon: '📈', path: `${prefix}/analytics` },
    ],
    manager: [
      { label: 'Team Dashboard', icon: '📊', path: `${prefix}/dashboard` },
      { label: 'Team Members', icon: '👥', path: `${prefix}/hr-employees` },
      { label: 'Team Skill Coverage', icon: '🎯', path: `${prefix}/skills` },
      { label: 'Team Skill Gaps', icon: '⚠️', path: `${prefix}/skill-gaps` },
      { label: 'Team Learning', icon: '📚', path: `${prefix}/trainings` },
      { label: 'Team Mentorship', icon: '🤝', path: `${prefix}/mentors` },
      { label: 'Team Reports', icon: '📈', path: `${prefix}/analytics` },
      { label: 'Knowledge & Q&A', icon: '💬', path: `${prefix}/qna` },
    ],
    depthead: [
      { label: 'Department Dashboard', icon: '📊', path: `${prefix}/dashboard` },
      { label: 'Department Workforce', icon: '👥', path: `${prefix}/hr-employees` },
      { label: 'Critical Skills', icon: '🎯', path: `${prefix}/skills` },
      { label: 'Department Gaps', icon: '⚠️', path: `${prefix}/skill-gaps` },
      { label: 'Learning Priorities', icon: '📚', path: `${prefix}/trainings` },
      { label: 'Knowledge Approvals', icon: '📖', path: `${prefix}/articles` },
      { label: 'Department Reports', icon: '📈', path: `${prefix}/analytics` },
      { label: 'Mentorship Network', icon: '🤝', path: `${prefix}/mentors` },
    ],
    learning: [
      { label: 'L&D Dashboard', icon: '📊', path: `${prefix}/dashboard` },
      { label: 'Training Catalog', icon: '📚', path: `${prefix}/trainings` },
      { label: 'Learning Gaps', icon: '⚠️', path: `${prefix}/skill-gaps` },
      { label: 'Learning Analytics', icon: '📈', path: `${prefix}/analytics` },
      { label: 'Mentorship Programs', icon: '🤝', path: `${prefix}/mentors` },
      { label: 'Knowledge Resources', icon: '📖', path: `${prefix}/articles` },
    ],
    system: [
      { label: 'Admin Dashboard', icon: '📊', path: `${prefix}/dashboard` },
      { label: 'User Management', icon: '👥', path: `${prefix}/users` },
      { label: 'Role Catalog', icon: '🔑', path: `${prefix}/roles` },
      { label: 'Department Setup', icon: '🏢', path: `${prefix}/departments` },
      { label: 'System Reports', icon: '📈', path: `${prefix}/analytics` },
      { label: 'Platform Settings', icon: '⚙️', path: `${prefix}/settings` },
    ],
  };

  const navItems = [
    ...(roleNavigation[family] || roleNavigation.employee),
    { label: 'My Profile', icon: '👤', path: `${prefix}/profile` },
  ];


  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark, #0f172a)', color: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'rgba(15, 23, 42, 0.95)', borderRight: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingLeft: '0.5rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#fff', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}>
            IQ
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', background: 'linear-gradient(135deg, #a5b4fc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              KnowledgeIQ
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform
            </div>
          </div>
        </div>

        {/* User Card */}
        <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: '600', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name || 'User'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: '500' }}>
              {roleName}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) => (isActive ? 'active-nav-item' : 'nav-item')}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.15))' : 'transparent',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: isActive ? '600' : '400',
                transition: 'all 0.2s ease',
              })}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            color: '#f87171',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            width: '100%',
          }}
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <header style={{ height: '64px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            Organizational Knowledge & Competency Gap Intelligence System
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              ● Backend: Spring Boot & SQL
            </span>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
