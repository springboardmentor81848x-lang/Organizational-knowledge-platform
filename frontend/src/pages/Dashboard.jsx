import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch, getStoredUser, roleFamily } from '../services/platformApi';
import { fetchEnrollments } from '../services/enrollments';

const fallbackStatData = [
  { icon: '👥', color: 'indigo',  value: '3,450', title: 'Total Workforce',     change: '+124',  dir: 'up' },
  { icon: '⚠️',  color: 'pink',   value: '142',   title: 'Skills Monitored',    change: '+18',   dir: 'up' },
  { icon: '📉', color: 'green',   value: '18%',   title: 'Avg. Competency Gap', change: '-4%',   dir: 'up' },
  { icon: '🎓', color: 'purple',  value: '1,894', title: 'Active Learners',     change: '54%',   dir: 'neutral' },
];

const fallbackGapAlerts = [
  { sev: 'crit', icon: '🔴', title: 'Cloud Infrastructure Security', dept: 'Engineering • Impacts Q3', pct: '42%', color: 'var(--danger)' },
  { sev: 'high', icon: '🟠', title: 'Predictive Data Modeling (Python)', dept: 'Data Science • Emerging Need', pct: '28%', color: 'var(--warning)' },
  { sev: 'med',  icon: '🟢', title: 'Advanced SEO & Performance', dept: 'Marketing • Routine Optimization', pct: '15%', color: 'var(--success)' },
];

const fallbackRecs = [
  { score: 98, title: 'Advanced Cloud Architectures', provider: 'Internal Engineering', tag: 'urgent', tagLabel: 'High Priority', duration: '12h' },
  { score: 92, title: 'Generative AI for Professionals', provider: 'Coursera Enterprise', tag: 'hot', tagLabel: 'Trending', duration: '4h' },
  { score: 85, title: 'Real-time Event Streaming', provider: 'Udemy Business', tag: 'new', tagLabel: 'New', duration: '8h' },
];

const fallbackActivities = [
  { bg: 'rgba(99,102,241,0.12)', color: '#6366f1', emoji: '⭐', text: <span><strong>Alice Smith</strong> achieved Level 5 in <em>React.js</em></span>, time: 'Just now • Engineering' },
  { bg: 'rgba(236,72,153,0.12)', color: '#ec4899', emoji: '📋', text: <span>Training path <em>"Security Compliance 2026"</em> assigned to 450 employees</span>, time: '2 hours ago • HR Dept' },
  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', emoji: '✅', text: <span>Department-wide assessment completed with <em>94% participation</em></span>, time: 'Yesterday • Marketing' },
  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', emoji: '🔗', text: <span><strong>Bob Chen</strong> connected with mentor <em>Sarah D.</em> for AI coaching</span>, time: '2 days ago • R&D' },
];

const fallbackNotifications = [
  { title: 'Complete assessment', message: 'Finish your role assessment to unlock tailored learning paths.', priority: 'high' },
  { title: 'Enroll in training', message: 'New course recommendations are available based on your skill gaps.', priority: 'medium' },
  { title: 'Profile update', message: 'Set your target role to get a more accurate AI development plan.', priority: 'low' },
];

const fallbackAchievements = [
  { title: 'Assessment completed', label: 'Active' },
  { title: 'Learning path created', label: 'Ready' },
  { title: 'Dashboard access', label: 'Unlocked' },
];

const fallbackGapHeatmap = [
  { department: 'Engineering', React: 4, Spring: 2, AWS: 1, Kafka: 3 },
  { department: 'Marketing', SEO: 2, Analytics: 4, Copywriting: 1, Design: 2 },
  { department: 'Sales', Negotiation: 1, CRM: 2, LeadGen: 3, Outreach: 1 },
];

const fallbackCertifications = [
  { title: 'AWS Foundations', status: 'In progress' },
  { title: 'Internal Security Basics', status: 'Planned' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const user = getStoredUser();
  const { rolePath } = useParams();
  const activeFamily = roleFamily(rolePath || user.role || user.accountType || 'Employee');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const family = activeFamily;
        let endpointPath = 'employee';
        if (family === 'manager') endpointPath = 'manager';
        else if (family === 'hr') endpointPath = 'hr';
        else if (family === 'depthead') endpointPath = 'department-head';
        else if (family === 'learning') endpointPath = 'ld';
        else if (family === 'system') endpointPath = 'admin';

        const res = await apiFetch(`/dashboard/${endpointPath}?email=${encodeURIComponent(user.email || '')}`);
        if (!res.ok) {
          setDashboardData(null);
          return;
        }

        const data = await res.json();
        setDashboardData(data);
      } catch {
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [activeFamily, user.email]);

  useEffect(() => {
    const loadEnrollments = async () => {
      if (!user?.email) return;
      const list = await fetchEnrollments(user.email);
      setEnrollments(list || []);
    };

    loadEnrollments();
  }, [user.email]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const statData = dashboardData?.stats || fallbackStatData;
  const gapAlerts = (dashboardData?.highRiskGaps || fallbackGapAlerts).map((item) => ({
    sev: item.severity === 'Critical' ? 'crit' : item.severity === 'High' ? 'high' : 'med',
    icon: item.severity === 'Critical' ? '🔴' : item.severity === 'High' ? '🟠' : '🟢',
    title: item.title || item.skill || item.domain,
    dept: item.impact || item.department || 'Organization',
    pct: `${item.gap || item.value || 0}%`,
    color: item.severity === 'Critical' ? 'var(--danger)' : item.severity === 'High' ? 'var(--warning)' : 'var(--success)',
  }));
  const recs = (dashboardData?.trainingRecommendations || fallbackRecs).map((item) => ({
    score: item.matchScore || item.score || 80,
    title: item.title,
    provider: item.provider,
    tag: item.source === 'Internal Catalog' ? 'urgent' : 'new',
    tagLabel: item.reason || item.source || 'Recommended',
    duration: item.duration || `${item.durationHours || 0}h`,
  }));
  const notifications = dashboardData?.notifications || fallbackNotifications;
  const achievements = dashboardData?.achievements || fallbackAchievements;
  const certifications = dashboardData?.certifications || fallbackCertifications;
  const gapHeatmap = dashboardData?.gapHeatmap || fallbackGapHeatmap;
  const activities = (dashboardData?.recentActivities || fallbackActivities).map((item) => ({
    bg: 'rgba(99,102,241,0.12)',
    color: '#6366f1',
    emoji: '✨',
    text: <span>{item.message || item.title || 'Activity update'}</span>,
    time: item.time || 'Just now',
  }));
  const departmentRows = dashboardData?.departmentSkillCoverage || [
    { dept: 'Engineering', pct: 78, color: '#6366f1' },
    { dept: 'Marketing', pct: 65, color: '#ec4899' },
    { dept: 'Data Science', pct: 55, color: '#f59e0b' },
    { dept: 'HR & Ops', pct: 88, color: '#10b981' },
  ];
  const roleLabel = dashboardData?.roleProfile?.displayName || user.role || user.accountType || activeFamily;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader" />
        <p>Synthesizing organizational intelligence...</p>
      </div>
    );
  }

  const isEmployee = activeFamily === 'employee';
  const isManager = activeFamily === 'manager';
  const isHr = activeFamily === 'hr';
  const isDeptHead = activeFamily === 'depthead';
  const isLearning = activeFamily === 'learning';

  return (
    <div className="dashboard-page">
      {/* Page Hero */}
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>Organizational <span className="gradient-text">Intelligence Hub</span></h1>
          <p>Real-time skill gap analysis, personalized learning paths & workforce readiness metrics for {roleLabel}</p>
        </div>
        <button className="btn-hero primary" style={{ animation:'pulseGlow 2.5s ease-in-out infinite' }} onClick={() => navigate('/app/ai-plan')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Generate AI Action Plan
        </button>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        {statData.map((s, i) => (
          <div className={`stat-card ${s.color}`} key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="stat-top">
              <div className={`stat-icon ${s.color}`}>
                <span style={{ fontSize: '1.35rem' }}>{s.icon}</span>
              </div>
              <span className={`stat-change ${s.dir}`}>
                {s.dir === 'up' ? '↑' : ''} {s.change}
              </span>
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-title">{s.title}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="dash-grid">
        <div className="dash-col">

          {/* Gap Alerts */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {isEmployee ? 'My Skill Gaps' : (isManager ? 'Employees At Risk' : (isHr ? 'Organization Skill Gaps' : (isDeptHead ? 'Department Skill Gaps' : (isLearning ? 'Session Registrations & Feedback' : 'Critical Gap Alerts'))))}
              </div>
              <Link to="/app/analytics">
                <button className="card-action">View Full Analysis →</button>
              </Link>
            </div>
            {gapAlerts.map((g, i) => (
              <div className={`gap-alert ${g.sev}`} key={i}>
                <div className={`alert-icon ${g.sev}`}>{g.icon}</div>
                <div className="alert-body">
                  <h4>{g.title}</h4>
                  <p>{g.dept}</p>
                </div>
                <div className="alert-pct">
                  <strong style={{ color: g.color }}>{g.pct}</strong>
                  <span>Deficit</span>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Feed */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isEmployee ? 'Learning Milestones & Mentoring' : (isManager ? 'Team & Mentorship Activity' : (isHr ? 'Workforce Planning Insights' : (isDeptHead ? 'Department Reports & Mentorship' : (isLearning ? 'Mentor Management Activity' : 'Organizational Activity'))))}
              </div>
              <button className="card-action">See All</button>
            </div>
            {activities.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-dot" style={{ background: a.bg, color: a.color }}>
                  <span style={{ fontSize: '0.9rem' }}>{a.emoji}</span>
                </div>
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Notifications */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🔔 Notifications</div>
              <button className="card-action">Refresh</button>
            </div>
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {notifications.map((note, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', padding: '0.9rem 1rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{note.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{note.message}</div>
                  </div>
                  <span style={{ color: note.priority === 'high' ? '#ef4444' : note.priority === 'medium' ? '#f59e0b' : '#10b981', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>{note.priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-col">
          {/* Training Recommendations */}
          <div className="card" style={{ background: 'linear-gradient(160deg, rgba(29,20,41,0.7) 0%, rgba(15,17,26,0.9) 100%)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="card-header">
              <div className="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isManager ? 'Team Training Adoption' : (isHr ? 'Training Analytics' : (isDeptHead ? 'Training Adoption' : (isLearning ? 'Training Management & Course Catalog' : 'Top Recommendations')))}
              </div>
              <Link to="/app/trainings">
                <button className="card-action">Browse →</button>
              </Link>
            </div>
            {recs.map((r, i) => (
              <div className="rec-card" key={i}>
                <div className="rec-score">{r.score}%</div>
                <div className="rec-info">
                  <h4>{r.title}</h4>
                  <p>
                    {r.provider}
                    <span className={`tag ${r.tag}`}>{r.tagLabel}</span>
                    <span>⏱ {r.duration}</span>
                  </p>
                </div>
                <div className="icon-btn" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {!isEmployee && (
            <>
          {/* Department Progress */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#10b981" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" stroke="#10b981" strokeWidth="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#10b981" strokeWidth="2"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#10b981" strokeWidth="2"/>
                </svg>
                {isManager ? 'Individual Employee Progress' : (isHr ? 'Department Skill Comparison' : (isDeptHead ? 'Employee Progress Overview' : (isLearning ? 'Learning Paths & Milestones' : 'Department Readiness')))}
              </div>
            </div>
            {departmentRows.map((d, i) => (
              <div className="department-row" key={i}>
                <span className="dept-name">{d.department || d.dept}</span>
                <div className="dept-bar">
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Readiness</span>
                    <span style={{ fontSize:'0.72rem', fontWeight:700, color: d.color }}>{d.coverage || d.pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${d.coverage || d.pct}%`, background:`linear-gradient(90deg, ${d.color}, ${d.color}aa)` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skill Gap Heatmap */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">{isHr ? 'Workforce Skill Analytics' : (isDeptHead ? 'Department Skill Coverage' : (isLearning ? 'Knowledge Sessions' : '🔥 Skill Gap Heatmap'))}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Critical gaps by department and skill</span>
            </div>
            <div style={{ overflowX: 'auto', padding: '0 0.5rem 0.75rem' }}>
              <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', marginTop: 12 }}>
                <thead>
                  <tr>
                    {Object.keys(gapHeatmap[0] || {}).map((key) => (
                      <th key={key} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {key === 'department' ? 'Department' : key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gapHeatmap.map((row, ri) => (
                    <tr key={ri}>
                      {Object.entries(row).map(([key, value]) => {
                        const isDept = key === 'department';
                        const display = isDept ? value : `${value}`;
                        const heat = Number(value);
                        const heatColor = heat >= 4 ? 'rgba(239,68,68,0.18)' : heat >= 2 ? 'rgba(245,158,11,0.18)' : 'rgba(16,185,129,0.18)';
                        const textColor = heat >= 4 ? '#dc2626' : heat >= 2 ? '#d97706' : '#059669';
                        return (
                          <td key={key} style={{ padding: '0.45rem 0.5rem' }}>
                            {isDept ? (
                              <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{display}</span>
                            ) : (
                              <div style={{ background: heatColor, color: textColor, minWidth: 42, minHeight: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontWeight: 700 }}>
                                {display}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}

          {/* Achievements */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">{isHr ? 'Training Effectiveness' : (isManager ? 'Team Skill Improvement' : (isDeptHead ? 'Skill Improvement' : (isLearning ? 'Training Effectiveness' : '🏅 Achievements')))}</div>
              <button className="card-action">View All</button>
            </div>
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {achievements.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', padding: '0.9rem 1rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{item.title}</div>
                    {item.description && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.description}</div>}
                  </div>
                  <span style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '0.8rem' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">{isHr ? 'Learning Analytics' : (isManager ? 'Team Assessment Performance' : (isDeptHead ? 'Department Assessments' : (isLearning ? 'Learning Analytics & Reports' : '🎓 Certifications')))}</div>
              <button className="card-action">Track</button>
            </div>
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {certifications.map((cert, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', padding: '0.9rem 1rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{cert.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{cert.provider || 'Internal program'}</div>
                  </div>
                  <span style={{ color: cert.status === 'In progress' ? '#10b981' : cert.status === 'Planned' ? '#f59e0b' : '#6366f1', fontWeight: 700, fontSize: '0.8rem' }}>{cert.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
