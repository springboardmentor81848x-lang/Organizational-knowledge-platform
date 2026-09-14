import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── KPI data (no passwords / tokens / hashes exposed) ────── */
const kpis = [
  { icon: '👥', color: 'indigo',  value: '4,312', title: 'Total Users',    change: '+18', dir: 'up' },
  { icon: '🟢', color: 'green',   value: '3,740', title: 'Active Users',   change: '+30', dir: 'up' },
  { icon: '🔐', color: 'pink',    value: '6',     title: 'Roles',          change: '0',   dir: 'neutral' },
  { icon: '🏢', color: 'purple',  value: '12',    title: 'Departments',    change: '+1',  dir: 'up' },
  { icon: '💚', color: 'green',   value: '99.7%', title: 'System Health',  change: '',    dir: 'neutral' },
  { icon: '🔑', color: 'indigo',  value: '247',   title: 'Recent Logins',  change: '+14', dir: 'up' },
];

/* ─── Seed tables ────────────────────────────────────────────── */
const users = [
  { id: 1, name: 'Ravi Kumar',   email: 'ravi.kumar@infosys.com',   role: 'Employee',            dept: 'Engineering', status: 'Active',   lastLogin: '2026-09-02' },
  { id: 2, name: 'Priya Sharma', email: 'priya.sharma@infosys.com', role: 'Team Lead / Manager', dept: 'Engineering', status: 'Active',   lastLogin: '2026-09-02' },
  { id: 3, name: 'Anjali Singh', email: 'anjali.singh@infosys.com', role: 'HR Specialist',       dept: 'HR',          status: 'Active',   lastLogin: '2026-09-01' },
  { id: 4, name: 'Vikram Nair',  email: 'vikram.nair@infosys.com',  role: 'Department Head',     dept: 'Operations',  status: 'Inactive', lastLogin: '2026-08-28' },
  { id: 5, name: 'Leena Mehta',  email: 'leena.mehta@infosys.com',  role: 'L&D Admin/mentor',   dept: 'L&D',         status: 'Active',   lastLogin: '2026-09-02' },
];

const roles = [
  { name: 'Employee',                    users: 3820, permissions: 'Self-service — profile, skills, trainings, own data only' },
  { name: 'Team Lead / Manager',         users: 284,  permissions: 'Team-level read — direct reports, skill gaps, training adoption' },
  { name: 'HR Specialist',               users: 46,   permissions: 'Org-wide analytics — workforce intelligence, reports' },
  { name: 'Department Head',             users: 32,   permissions: 'Department-scoped — employees, dept gaps, dept training' },
  { name: 'L&D Admin / Mentor',          users: 58,   permissions: 'Catalog & sessions — trainings, paths, mentors, feedback' },
  { name: 'System Administrator',        users: 12,   permissions: 'Platform admin — users, roles, depts, audit logs, config' },
];

const departments = [
  { name: 'Engineering',   head: 'Dinesh Patel',  employees: 920, skillCoverage: 78 },
  { name: 'HR',            head: 'Anjali Singh',  employees: 64,  skillCoverage: 91 },
  { name: 'Operations',    head: 'Vikram Nair',   employees: 480, skillCoverage: 65 },
  { name: 'Finance',       head: 'Suresh Kumar',  employees: 210, skillCoverage: 72 },
  { name: 'L&D',           head: 'Leena Mehta',   employees: 28,  skillCoverage: 95 },
  { name: 'Product',       head: 'Neha Joshi',    employees: 180, skillCoverage: 83 },
];

const auditLogs = [
  { time: '15:08',  user: 'admin@infosys.com',         action: 'Role assigned',          detail: 'Ravi Kumar → Employee',        severity: 'info' },
  { time: '14:52',  user: 'hr@infosys.com',             action: 'User account updated',   detail: 'Anjali Singh profile edit',    severity: 'info' },
  { time: '14:30',  user: 'admin@infosys.com',         action: 'Department created',     detail: 'New dept: Innovation Lab',     severity: 'success' },
  { time: '13:55',  user: 'unknown@external.com',      action: 'Failed login attempt',   detail: 'IP: 103.45.67.89 — blocked',   severity: 'warning' },
  { time: '13:20',  user: 'system',                    action: 'Backup completed',       detail: 'Full DB backup — 4.2 GB',      severity: 'success' },
  { time: '12:41',  user: 'admin@infosys.com',         action: 'User disabled',          detail: 'Vikram Nair — access revoked', severity: 'warning' },
];

const apiMetrics = [
  { endpoint: 'POST /auth/login',           calls: 2140, avgMs: 82,  errors: 3,  status: 'green' },
  { endpoint: 'GET  /dashboard/employee',   calls: 1830, avgMs: 120, errors: 0,  status: 'green' },
  { endpoint: 'GET  /dashboard/manager',    calls: 420,  avgMs: 145, errors: 1,  status: 'green' },
  { endpoint: 'GET  /dashboard/hr',         calls: 88,   avgMs: 310, errors: 0,  status: 'yellow' },
  { endpoint: 'POST /auth/register',        calls: 64,   avgMs: 190, errors: 2,  status: 'green' },
  { endpoint: 'GET  /skills',               calls: 3200, avgMs: 67,  errors: 0,  status: 'green' },
];

const sevColor = { info: '#6366f1', success: '#10b981', warning: '#f59e0b', error: '#ef4444' };
const statusColor = { Active: '#10b981', Inactive: '#ef4444' };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [userSearch, setUserSearch] = useState('');

  const tabs = [
    { id: 'users',    label: '👥 User Management' },
    { id: 'roles',    label: '🔐 Role Management' },
    { id: 'depts',    label: '🏢 Departments' },
    { id: 'audit',    label: '📋 Audit Logs' },
    { id: 'api',      label: '📡 API Monitoring' },
    { id: 'settings', label: '⚙️ System Settings' },
  ];

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>System <span className="gradient-text">Admin Dashboard</span></h1>
          <p>Platform-wide user management, role assignment, audit logs, and system health monitoring.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-hero primary" onClick={() => setActiveTab('users')}>
            + Create User
          </button>
          <button className="btn-hero" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }} onClick={() => setActiveTab('audit')}>
            View Audit Logs
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))' }}>
        {kpis.map((k, i) => (
          <div className={`stat-card ${k.color}`} key={i} style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="stat-top">
              <div className={`stat-icon ${k.color}`}><span style={{ fontSize: '1.35rem' }}>{k.icon}</span></div>
              {k.change && <span className={`stat-change ${k.dir}`}>{k.dir === 'up' ? '↑' : ''} {k.change}</span>}
            </div>
            <div className="stat-value">{k.value}</div>
            <div className="stat-title">{k.title}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1.5rem 0 1rem' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '0.55rem 1rem', borderRadius: 8, border: '1px solid',
            borderColor: activeTab === t.id ? '#6366f1' : 'rgba(255,255,255,0.08)',
            background: activeTab === t.id ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.03)',
            color: activeTab === t.id ? '#a5b4fc' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: User Management ── */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">👥 User Management</div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search users..."
                style={{ padding: '0.45rem 0.85rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.82rem', outline: 'none', width: 200 }}
              />
              <button style={{ padding: '0.45rem 1rem', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                + Add User
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Name', 'Email', 'Role', 'Department', 'Last Login', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{u.dept}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{u.lastLogin}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ color: statusColor[u.status], fontWeight: 700, fontSize: '0.8rem' }}>{u.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button style={{ padding: '0.3rem 0.65rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>Edit</button>
                        <button style={{
                          padding: '0.3rem 0.65rem',
                          background: u.status === 'Active' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                          border: `1px solid ${u.status === 'Active' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                          color: u.status === 'Active' ? '#ef4444' : '#10b981',
                          borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem',
                        }}>
                          {u.status === 'Active' ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            🔒 Passwords, tokens, and security credentials are never exposed in this view.
          </div>
        </div>
      )}

      {/* ── Tab: Role Management ── */}
      {activeTab === 'roles' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🔐 Role Management</div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Roles are system-defined. Contact DevOps to add new roles.</span>
          </div>
          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {roles.map((r, i) => (
              <div key={i} style={{ padding: '1rem 1.25rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{r.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{r.permissions}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Users</div>
                    <div style={{ fontWeight: 700, color: '#a5b4fc' }}>{r.users}</div>
                  </div>
                  <button style={{ padding: '0.4rem 0.85rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}>
                    View Users
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Department Management ── */}
      {activeTab === 'depts' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏢 Department Management</div>
            <button style={{ padding: '0.45rem 1rem', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
              + Add Department
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
            {departments.map((d, i) => (
              <div key={i} style={{ padding: '1.25rem', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏢</div>
                  <span style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 700 }}>{d.employees} staff</span>
                </div>
                <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{d.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Head: {d.head}</div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>Skill Coverage</span><span style={{ color: d.skillCoverage > 80 ? '#10b981' : '#f59e0b' }}>{d.skillCoverage}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
                    <div style={{ width: `${d.skillCoverage}%`, height: '100%', background: d.skillCoverage > 80 ? 'linear-gradient(90deg,#10b981,#059669)' : 'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius: 4 }} />
                  </div>
                </div>
                <button style={{ width: '100%', padding: '0.4rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                  Manage
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Audit Logs ── */}
      {activeTab === 'audit' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 Audit Logs</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ padding: '0.4rem 0.85rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}>Export CSV</button>
              <button style={{ padding: '0.4rem 0.85rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}>Refresh</button>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '0.65rem' }}>
            {auditLogs.map((log, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: sevColor[log.severity], flexShrink: 0 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0, minWidth: 42 }}>{log.time}</span>
                <span style={{ fontSize: '0.82rem', color: '#a5b4fc', flexShrink: 0, minWidth: 180 }}>{log.user}</span>
                <span style={{ fontWeight: 600, flexShrink: 0, minWidth: 160 }}>{log.action}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{log.detail}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            🔒 Authentication tokens and password data are never logged or displayed here.
          </div>
        </div>
      )}

      {/* ── Tab: API Monitoring ── */}
      {activeTab === 'api' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📡 API Monitoring</div>
            <span style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', borderRadius: 6, fontWeight: 700 }}>Live</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Endpoint', 'Calls (24h)', 'Avg Response', 'Errors', 'Health'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apiMetrics.map((a, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.82rem', color: '#a5b4fc' }}>{a.endpoint}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{a.calls.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 1rem', color: a.avgMs > 200 ? '#f59e0b' : 'var(--text-secondary)' }}>{a.avgMs} ms</td>
                    <td style={{ padding: '0.75rem 1rem', color: a.errors > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>{a.errors}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: a.status === 'green' ? '#10b981' : '#f59e0b', boxShadow: `0 0 6px ${a.status === 'green' ? '#10b981' : '#f59e0b'}` }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: System Settings ── */}
      {activeTab === 'settings' && (
        <div className="dash-grid">
          <div className="dash-col">
            <div className="card">
              <div className="card-header"><div className="card-title">⚙️ System Configuration</div></div>
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                {[
                  { label: 'Platform Name',            value: 'KnowledgeIQ',       editable: true },
                  { label: 'Session Timeout (mins)',    value: '30',                editable: true },
                  { label: 'Max Login Attempts',        value: '5',                 editable: true },
                  { label: 'Password Min Length',       value: '8',                 editable: true },
                  { label: 'MFA Enforcement',           value: 'Disabled',         editable: true },
                  { label: 'Database (type only)',      value: 'MySQL 8.0',         editable: false },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontWeight: 700, color: '#a5b4fc' }}>{s.value}</span>
                      {s.editable && <button style={{ padding: '0.25rem 0.6rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', borderRadius: 6, cursor: 'pointer', fontSize: '0.72rem' }}>Edit</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="dash-col">
            <div className="card">
              <div className="card-header"><div className="card-title">🛡️ Security</div></div>
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                <div style={{ padding: '1rem', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div style={{ fontWeight: 700, color: '#fca5a5', marginBottom: '0.35rem' }}>⚠️ Security Notice</div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>JWT secrets, password hashes, and authentication tokens are never visible through this UI. Manage them exclusively via server environment variables.</div>
                </div>
                {[
                  { label: 'JWT Token Expiry',    value: '24 hours' },
                  { label: 'HTTPS Enforced',      value: 'Yes' },
                  { label: 'CORS Whitelist',       value: 'Configured' },
                  { label: 'Rate Limiting',        value: '100 req/min' },
                  { label: 'Last Security Audit',  value: '2026-08-15' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">💾 Backup / Maintenance</div></div>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize:'0.83rem', color:'var(--text-secondary)' }}>Last Full Backup</span>
                  <span style={{ fontWeight:700, color:'#10b981' }}>2026-09-02 13:20</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize:'0.83rem', color:'var(--text-secondary)' }}>Backup Size</span>
                  <span style={{ fontWeight:700, color:'#a5b4fc' }}>4.2 GB</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button style={{ flex:1, padding:'0.55rem', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', color:'#10b981', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:'0.82rem' }}>Run Backup</button>
                  <button style={{ flex:1, padding:'0.55rem', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', color:'#f59e0b', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:'0.82rem' }}>Maintenance Mode</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
