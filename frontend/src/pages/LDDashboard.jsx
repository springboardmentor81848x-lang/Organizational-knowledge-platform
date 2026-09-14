import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/platformApi';

/* ─── static seed data ─────────────────────────────────────── */
const kpis = [
  { icon: '📚', color: 'indigo',  value: '142',   title: 'Total Trainings',     change: '+12', dir: 'up' },
  { icon: '🚀', color: 'green',   value: '84',    title: 'Active Trainings',    change: '+8',  dir: 'up' },
  { icon: '🎓', color: 'pink',    value: '3,450', title: 'Employees Enrolled',  change: '+250',dir: 'up' },
  { icon: '📅', color: 'purple',  value: '42',    title: 'Sessions Scheduled',  change: '+6',  dir: 'up' },
  { icon: '🤝', color: 'indigo',  value: '45',    title: 'Active Mentors',      change: '+5',  dir: 'up' },
  { icon: '🗺️', color: 'pink',   value: '18',    title: 'Learning Paths',      change: '+2',  dir: 'up' },
  { icon: '✅', color: 'green',   value: '89%',   title: 'Training Completion', change: '+4%', dir: 'up' },
  { icon: '📦', color: 'purple',  value: '894',   title: 'Content Items',       change: '+45', dir: 'up' },
];

const trainings = [
  { title: 'React & Modern JavaScript', category: 'Frontend', enrolled: 214, completion: 78, status: 'Active' },
  { title: 'Spring Boot Microservices',  category: 'Backend',  enrolled: 189, completion: 65, status: 'Active' },
  { title: 'Leadership Foundations',     category: 'Soft Skills', enrolled: 341, completion: 91, status: 'Active' },
  { title: 'Data Engineering with Spark',category: 'Data',     enrolled: 127, completion: 44, status: 'Draft' },
];

const sessions = [
  { title: 'Clean Code Workshop',        mentor: 'Ravi Kumar',   date: '2026-09-05', slots: 30, registered: 24, status: 'Upcoming' },
  { title: 'System Design Deep Dive',    mentor: 'Priya Sharma', date: '2026-09-08', slots: 25, registered: 25, status: 'Full' },
  { title: 'AI/ML for Non-Engineers',    mentor: 'Amit Jain',    date: '2026-09-12', slots: 40, registered: 17, status: 'Upcoming' },
  { title: 'Agile Ceremonies Playbook',  mentor: 'Sneha Patel',  date: '2026-09-15', slots: 20, registered: 8,  status: 'Upcoming' },
];

const mentors = [
  { name: 'Ravi Kumar',    specialization: 'Java & Cloud',      mentees: 6, rating: 4.8, status: 'Active' },
  { name: 'Priya Sharma',  specialization: 'System Design',     mentees: 4, rating: 4.9, status: 'Active' },
  { name: 'Amit Jain',     specialization: 'AI / ML',           mentees: 5, rating: 4.7, status: 'Active' },
  { name: 'Sneha Patel',   specialization: 'Agile & Scrum',     mentees: 3, rating: 4.6, status: 'On Leave' },
];

const learningPaths = [
  { title: 'Full-Stack Engineer Path',  courses: 8, enrolled: 320, progress: 62 },
  { title: 'Data Analyst Accelerator',  courses: 6, enrolled: 190, progress: 45 },
  { title: 'Tech Lead Readiness',       courses: 10,enrolled: 88,  progress: 38 },
  { title: 'Cloud & DevOps Journey',    courses: 7, enrolled: 145, progress: 55 },
];

const feedbacks = [
  { session: 'Clean Code Workshop',     rating: 4.8, comment: 'Excellent – very practical examples!' },
  { session: 'System Design Deep Dive', rating: 4.9, comment: 'Best session of the quarter.' },
  { session: 'AI/ML for Non-Engineers', rating: 4.5, comment: 'Needs more hands-on exercises.' },
];

const statusColor = { Active: '#10b981', Draft: '#f59e0b', Full: '#ef4444', Upcoming: '#6366f1', 'On Leave': '#f59e0b' };

/* ─── Component ────────────────────────────────────────────── */
export default function LDDashboard() {
  const user = getStoredUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trainings');

  const tabs = [
    { id: 'trainings',  label: '📚 Training Management' },
    { id: 'sessions',   label: '📅 Knowledge Sessions' },
    { id: 'mentors',    label: '🤝 Mentor Management' },
    { id: 'paths',      label: '🗺️ Learning Paths' },
    { id: 'analytics',  label: '📊 Learning Analytics' },
    { id: 'feedback',   label: '💬 Session Feedback' },
  ];

  return (
    <div className="dashboard-page">
      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>L&D <span className="gradient-text">Admin Dashboard</span></h1>
          <p>Manage trainings, learning paths, knowledge sessions, and mentor assignments for the organisation.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-hero primary" onClick={() => navigate('/ld/trainings')}>
            + New Training
          </button>
          <button className="btn-hero" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }} onClick={() => navigate('/ld/sessions')}>
            + Schedule Session
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px,1fr))' }}>
        {kpis.map((k, i) => (
          <div className={`stat-card ${k.color}`} key={i} style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="stat-top">
              <div className={`stat-icon ${k.color}`}><span style={{ fontSize: '1.35rem' }}>{k.icon}</span></div>
              <span className={`stat-change ${k.dir}`}>{k.dir === 'up' ? '↑' : '↓'} {k.change}</span>
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

      {/* ── Tab: Training Management ── */}
      {activeTab === 'trainings' && (
        <div className="dash-grid">
          <div className="dash-col" style={{ gridColumn: '1 / -1' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">📚 Training Management & Course Catalog</div>
                <button className="card-action" onClick={() => navigate('/ld/trainings')}>Manage All →</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Title', 'Category', 'Enrolled', 'Completion', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trainings.map((t, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{t.title}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}>{t.category}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{t.enrolled}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
                              <div style={{ width: `${t.completion}%`, height: '100%', background: t.completion > 70 ? '#10b981' : '#f59e0b', borderRadius: 4 }} />
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.completion}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ color: statusColor[t.status] || '#6366f1', fontWeight: 700, fontSize: '0.8rem' }}>{t.status}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button style={{ padding: '0.3rem 0.65rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>Edit</button>
                            <button style={{ padding: '0.3rem 0.65rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Knowledge Sessions ── */}
      {activeTab === 'sessions' && (
        <div className="dash-grid">
          <div className="dash-col" style={{ gridColumn: '1 / -1' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">📅 Knowledge Sessions & Registrations</div>
                <button className="card-action" onClick={() => navigate('/ld/sessions')}>Schedule New →</button>
              </div>
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                {sessions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{s.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Mentor: {s.mentor} · {s.date}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Registered</div>
                        <div style={{ fontWeight: 700, color: s.registered >= s.slots ? '#ef4444' : '#10b981' }}>{s.registered}/{s.slots}</div>
                      </div>
                      <span style={{ color: statusColor[s.status], fontWeight: 700, fontSize: '0.8rem' }}>{s.status}</span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button style={{ padding: '0.35rem 0.7rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>Edit</button>
                        <button style={{ padding: '0.35rem 0.7rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>Cancel</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Mentor Management ── */}
      {activeTab === 'mentors' && (
        <div className="dash-grid">
          <div className="dash-col" style={{ gridColumn: '1 / -1' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">🤝 Mentor Management</div>
                <button className="card-action" onClick={() => navigate('/ld/mentors')}>View All Mentors →</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
                {mentors.map((m, i) => (
                  <div key={i} style={{ padding: '1.25rem', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        {m.name.charAt(0)}
                      </div>
                      <span style={{ color: statusColor[m.status], fontWeight: 700, fontSize: '0.78rem' }}>{m.status}</span>
                    </div>
                    <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{m.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{m.specialization}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Mentees: <strong>{m.mentees}</strong></span>
                      <span style={{ color: '#f59e0b' }}>⭐ {m.rating}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
                      <button style={{ flex: 1, padding: '0.4rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}>View</button>
                      <button style={{ flex: 1, padding: '0.4rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}>Assign</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Learning Paths ── */}
      {activeTab === 'paths' && (
        <div className="dash-grid">
          <div className="dash-col" style={{ gridColumn: '1 / -1' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">🗺️ Learning Paths & Milestones</div>
                <button className="card-action">+ Create Path</button>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {learningPaths.map((p, i) => (
                  <div key={i} style={{ padding: '1rem 1.25rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{p.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.courses} Courses · {p.enrolled} Enrolled</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 140 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                          <span>Avg Progress</span><span style={{ color: '#a5b4fc' }}>{p.progress}%</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
                          <div style={{ width: `${p.progress}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: 4 }} />
                        </div>
                      </div>
                      <button style={{ padding: '0.4rem 0.8rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}>Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Analytics ── */}
      {activeTab === 'analytics' && (
        <div className="dash-grid">
          <div className="dash-col">
            <div className="card">
              <div className="card-header">
                <div className="card-title">📊 Training Effectiveness</div>
              </div>
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                {trainings.map((t, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{t.title}</span>
                      <span style={{ color: t.completion > 70 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>{t.completion}%</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
                      <div style={{ width: `${t.completion}%`, height: '100%', background: t.completion > 70 ? 'linear-gradient(90deg,#10b981,#059669)' : 'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="dash-col">
            <div className="card">
              <div className="card-header">
                <div className="card-title">📈 Learning Analytics</div>
              </div>
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                {[
                  { label: 'Avg Time to Complete a Training', value: '4.2 weeks' },
                  { label: 'Employees Completed All Assigned Paths', value: '62%' },
                  { label: 'Most Popular Category', value: 'Frontend' },
                  { label: 'Sessions with Feedback Submitted', value: '87%' },
                  { label: 'Mentor Satisfaction Score', value: '4.75 / 5' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: '#a5b4fc' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Session Feedback ── */}
      {activeTab === 'feedback' && (
        <div className="dash-grid">
          <div className="dash-col" style={{ gridColumn: '1 / -1' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">💬 Session Feedback Reports</div>
                <button className="card-action">Export CSV</button>
              </div>
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                {feedbacks.map((f, i) => (
                  <div key={i} style={{ padding: '1rem 1.25rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700 }}>{f.session}</span>
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>⭐ {f.rating}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{f.comment}"</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
