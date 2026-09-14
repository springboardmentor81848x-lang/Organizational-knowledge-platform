import React, { useEffect, useState } from 'react';
import { apiFetch, getStoredUser } from '../services/platformApi';

/* ───── mock data ───── */
const TEAM_MEMBERS = [
  { id: 1, name: 'Alice Smith', email: 'alice@infosys.com', role: 'Frontend Developer', avatar: 'A', status: 'Active', joined: '2025-03-15',
    skills: [ { name: 'React.js', current: 80, required: 90 }, { name: 'TypeScript', current: 55, required: 80 }, { name: 'Node.js', current: 40, required: 70 }, { name: 'CSS/Design Systems', current: 85, required: 85 } ],
    trainings: [ { title: 'Advanced React Patterns', progress: 82, status: 'In Progress' }, { title: 'TypeScript Deep Dive', progress: 30, status: 'In Progress' } ],
    contributions: [ { title: 'React Performance Best Practices', type: 'Article', date: '2026-09-08', status: 'Published' } ] },

  { id: 2, name: 'Bob Chen', email: 'bob@infosys.com', role: 'Data Analyst', avatar: 'B', status: 'Active', joined: '2025-06-01',
    skills: [ { name: 'Python', current: 65, required: 90 }, { name: 'Machine Learning', current: 30, required: 80 }, { name: 'SQL & PostgreSQL', current: 75, required: 90 }, { name: 'Power BI', current: 20, required: 70 } ],
    trainings: [ { title: 'Predictive Analytics with Python', progress: 45, status: 'In Progress' }, { title: 'ML Fundamentals', progress: 10, status: 'Not Started' } ],
    contributions: [ { title: 'SQL Query Optimization Guide', type: 'Guide', date: '2026-09-05', status: 'Pending Review' } ] },

  { id: 3, name: 'Priya Sharma', email: 'priya@infosys.com', role: 'Backend Engineer', avatar: 'P', status: 'Active', joined: '2024-11-10',
    skills: [ { name: 'Java Spring Boot', current: 85, required: 95 }, { name: 'Microservices', current: 70, required: 90 }, { name: 'Docker & Kubernetes', current: 50, required: 80 }, { name: 'REST APIs', current: 90, required: 95 } ],
    trainings: [ { title: 'Kubernetes CKA Prep', progress: 60, status: 'In Progress' }, { title: 'Microservices Design Patterns', progress: 100, status: 'Completed' } ],
    contributions: [ { title: 'Microservices Circuit Breaker Pattern', type: 'Tutorial', date: '2026-09-10', status: 'Published' }, { title: 'Spring Boot 3 Migration Guide', type: 'Guide', date: '2026-09-12', status: 'Pending Review' } ] },

  { id: 4, name: 'David Kim', email: 'david@infosys.com', role: 'QA Engineer', avatar: 'D', status: 'On Leave', joined: '2025-01-20',
    skills: [ { name: 'Selenium', current: 72, required: 85 }, { name: 'API Testing', current: 60, required: 80 }, { name: 'CI/CD Pipelines', current: 35, required: 70 }, { name: 'Performance Testing', current: 40, required: 75 } ],
    trainings: [ { title: 'CI/CD with GitHub Actions', progress: 20, status: 'In Progress' } ],
    contributions: [] },

  { id: 5, name: 'Sarah Lee', email: 'sarah@infosys.com', role: 'Cloud Architect', avatar: 'S', status: 'Active', joined: '2023-08-14',
    skills: [ { name: 'AWS Cloud', current: 92, required: 95 }, { name: 'Cybersecurity', current: 78, required: 90 }, { name: 'Docker & Kubernetes', current: 88, required: 95 }, { name: 'Terraform', current: 70, required: 85 } ],
    trainings: [ { title: 'AWS Solutions Architect Pro', progress: 90, status: 'In Progress' }, { title: 'Cybersecurity Governance', progress: 100, status: 'Completed' } ],
    contributions: [ { title: 'AWS Multi-Account Strategy', type: 'Best Practice', date: '2026-09-11', status: 'Published' } ] },
];

const ESCALATION_LOG = [
  { id: 1, gap: 'Machine Learning capability below threshold', dept: 'Data Science', severity: 'Critical', date: '2026-09-12', status: 'Escalated' },
  { id: 2, gap: 'CI/CD pipeline knowledge deficit across QA team', dept: 'Engineering', severity: 'High', date: '2026-09-10', status: 'Acknowledged' },
];

/* ───── helpers ───── */
const gapColor = (gap) => gap <= 10 ? '#10b981' : gap <= 25 ? '#f59e0b' : '#ef4444';
const gapLabel = (gap) => gap <= 10 ? 'Minor' : gap <= 25 ? 'Moderate' : 'Critical';
const statusBadge = (s) => {
  const map = { Active: { bg: 'rgba(16,185,129,0.15)', c: '#10b981' }, 'On Leave': { bg: 'rgba(245,158,11,0.15)', c: '#f59e0b' }, Inactive: { bg: 'rgba(239,68,68,0.15)', c: '#ef4444' } };
  const st = map[s] || map.Active;
  return { background: st.bg, color: st.c, border: `1px solid ${st.c}33` };
};

const TeamLeaderDashboard = () => {
  const user = getStoredUser();
  const [teamMembers, setTeamMembers] = useState(TEAM_MEMBERS);
  const [activeTab, setActiveTab] = useState('members');
  const [selectedMember, setSelectedMember] = useState(null);
  const [assignModal, setAssignModal] = useState(null); // member id for assign modal
  const [assignCourse, setAssignCourse] = useState('');
  const [assignDue, setAssignDue] = useState('');
  const [assignedNotice, setAssignedNotice] = useState('');
  const [escalateModal, setEscalateModal] = useState(false);
  const [escalateGap, setEscalateGap] = useState('');
  const [escalateSeverity, setEscalateSeverity] = useState('High');
  const [escalations, setEscalations] = useState(ESCALATION_LOG);
  const [escalateNotice, setEscalateNotice] = useState('');
  const [teamKnowledge, setTeamKnowledge] = useState([
    { id: Date.now(), title: 'Team Git Branching Strategy', type: 'Team Knowledge', author: user.name || 'Team Leader', date: '2026-09-13' },
  ]);
  const [newKnowledgeTitle, setNewKnowledgeTitle] = useState('');
  const [showKnowledgeForm, setShowKnowledgeForm] = useState(false);

  useEffect(() => {
    const loadRegisteredTeam = async () => {
      try {
        const response = await apiFetch('/users');
        if (!response.ok) return;
        const users = await response.json();
        if (!users.length) return;
        setTeamMembers(users.map((member, index) => ({
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role || 'Employee',
          avatar: (member.name || 'U').charAt(0).toUpperCase(),
          status: 'Active',
          joined: 'Registered',
          department: member.department || 'Unassigned',
          skills: [],
          trainings: [],
          contributions: [],
          index,
        })));
      } catch (error) {
        console.error('Unable to load registered team members:', error);
      }
    };

    loadRegisteredTeam();
  }, []);

  /* computed stats */
  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter(m => m.status === 'Active').length;
  const allSkills = teamMembers.flatMap(m => m.skills);
  const avgGap = allSkills.length
    ? Math.round(allSkills.reduce((a, s) => a + (s.required - s.current), 0) / allSkills.length)
    : 0;
  const criticalGaps = allSkills.filter(s => (s.required - s.current) > 25).length;
  const allTrainings = teamMembers.flatMap(m => m.trainings);
  const avgTraining = Math.round(allTrainings.reduce((a, t) => a + t.progress, 0) / (allTrainings.length || 1));
  const completedTrainings = allTrainings.filter(t => t.status === 'Completed').length;
  const allContribs = teamMembers.flatMap(m => m.contributions);
  const pendingReviews = allContribs.filter(c => c.status === 'Pending Review');
  const publishedContribs = allContribs.filter(c => c.status === 'Published').length;

  const handleAssignTraining = (memberId) => {
    if (!assignCourse.trim()) return;
    setAssignedNotice(`✅ "${assignCourse}" assigned to ${teamMembers.find(m => m.id === memberId)?.name} (due ${assignDue || 'TBD'})`);
    setAssignCourse('');
    setAssignDue('');
    setAssignModal(null);
    setTimeout(() => setAssignedNotice(''), 4000);
  };

  const handleEscalate = () => {
    if (!escalateGap.trim()) return;
    const newEsc = { id: Date.now(), gap: escalateGap, dept: 'Engineering', severity: escalateSeverity, date: new Date().toISOString().split('T')[0], status: 'Escalated' };
    setEscalations([newEsc, ...escalations]);
    setEscalateNotice(`⬆️ Gap "${escalateGap}" escalated to Department Head`);
    setEscalateGap('');
    setEscalateModal(false);
    setTimeout(() => setEscalateNotice(''), 4000);
  };

  const handleCreateTeamKnowledge = () => {
    if (!newKnowledgeTitle.trim()) return;
    setTeamKnowledge([{ id: Date.now(), title: newKnowledgeTitle, type: 'Team Knowledge', author: user.name || 'Team Leader', date: new Date().toISOString().split('T')[0] }, ...teamKnowledge]);
    setNewKnowledgeTitle('');
    setShowKnowledgeForm(false);
  };

  const [reviewState, setReviewState] = useState({});
  const handleApprove = (title) => setReviewState(p => ({ ...p, [title]: 'Approved' }));
  const handleReject = (title) => setReviewState(p => ({ ...p, [title]: 'Rejected' }));

  const tabs = [
    { id: 'members', label: '👥 Team Members', count: totalMembers },
    { id: 'gaps', label: '⚠️ Knowledge Gaps', count: criticalGaps },
    { id: 'training', label: '📚 Training Progress', count: `${avgTraining}%` },
    { id: 'contributions', label: '📝 Contributions', count: allContribs.length },
    { id: 'reviews', label: '🔍 Pending Reviews', count: pendingReviews.length },
  ];

  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '16px', padding: '2rem 2.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Team Leader <span style={{ background: 'linear-gradient(135deg, #a5b4fc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Command Center</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Monitor team skills, assign training, review contributions, and escalate critical gaps.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button onClick={() => setEscalateModal(true)} style={{ padding: '0.65rem 1.25rem', background: '#ef4444', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
            ⬆️ Escalate Gap
          </button>
          <button onClick={() => setShowKnowledgeForm(true)} style={{ padding: '0.65rem 1.25rem', background: '#6366f1', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
            ➕ Create Team Knowledge
          </button>
        </div>
      </div>

      {/* Notices */}
      {assignedNotice && <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '0.75rem 1.25rem', color: '#10b981', fontWeight: 600 }}>{assignedNotice}</div>}
      {escalateNotice && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem 1.25rem', color: '#ef4444', fontWeight: 600 }}>{escalateNotice}</div>}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: '1rem' }}>
        {[
          { icon: '👥', label: 'Team Members', value: totalMembers, sub: `${activeMembers} Active`, color: '#6366f1' },
          { icon: '⚠️', label: 'Avg Skill Gap', value: `${avgGap}%`, sub: `${criticalGaps} critical`, color: '#ef4444' },
          { icon: '📈', label: 'Training Progress', value: `${avgTraining}%`, sub: `${completedTrainings} completed`, color: '#10b981' },
          { icon: '📝', label: 'Contributions', value: allContribs.length, sub: `${publishedContribs} published`, color: '#8b5cf6' },
          { icon: '🔍', label: 'Pending Reviews', value: pendingReviews.length, sub: 'Needs approval', color: '#f59e0b' },
        ].map((k, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', borderTop: `3px solid ${k.color}`, padding: '1.25rem 1rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{k.icon}</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{k.label}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255,255,255,0.04)', padding: '5px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setSelectedMember(null); }}
            style={{ flex: 1, padding: '0.6rem 0.85rem', borderRadius: '8px', border: 'none', background: activeTab === t.id ? '#6366f1' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: activeTab === t.id ? 700 : 400, fontSize: '0.85rem', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
            {t.label} <span style={{ background: activeTab === t.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)', padding: '1px 8px', borderRadius: '10px', fontSize: '0.72rem', marginLeft: '0.3rem' }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ─── TAB: TEAM MEMBERS ─── */}
      {activeTab === 'members' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedMember ? '1fr 380px' : '1fr', gap: '1.25rem', alignItems: 'start' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Member', 'Role', 'Status', 'Avg Gap', 'Training', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teamMembers.map(m => {
                  const mGap = Math.round(m.skills.reduce((a, s) => a + (s.required - s.current), 0) / m.skills.length);
                  const mTrain = m.trainings.length ? Math.round(m.trainings.reduce((a, t) => a + t.progress, 0) / m.trainings.length) : 0;
                  const sel = selectedMember?.id === m.id;
                  return (
                    <tr key={m.id} onClick={() => setSelectedMember(sel ? null : m)} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: sel ? 'rgba(99,102,241,0.08)' : 'transparent', transition: 'background 0.15s' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{m.avatar}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>{m.role}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.65rem', borderRadius: 20, fontSize: '0.73rem', fontWeight: 700, ...statusBadge(m.status) }}>{m.status}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontWeight: 700, color: gapColor(mGap) }}>{mGap}%</span>
                        <div style={{ fontSize: '0.68rem', color: gapColor(mGap) }}>{gapLabel(mGap)}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${mTrain}%`, background: mTrain >= 80 ? '#10b981' : mTrain >= 50 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1' }}>{mTrain}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <button onClick={e => { e.stopPropagation(); setAssignModal(m.id); }} style={{ padding: '0.3rem 0.7rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.73rem' }}>
                          📚 Assign
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Member Detail Sidebar */}
          {selectedMember && (
            <div className="card" style={{ position: 'sticky', top: 80, border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 0 30px rgba(99,102,241,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{selectedMember.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{selectedMember.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#a5b4fc' }}>{selectedMember.role}</div>
                </div>
              </div>
              <h4 style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Skill Profile</h4>
              {selectedMember.skills.map((s, i) => {
                const gap = s.required - s.current;
                return (
                  <div key={i} style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                      <span style={{ color: gapColor(gap), fontWeight: 700 }}>{s.current}% / {s.required}%</span>
                    </div>
                    <div style={{ position: 'relative', height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
                      <div style={{ position: 'absolute', height: '100%', width: `${s.required}%`, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
                      <div style={{ position: 'absolute', height: '100%', width: `${s.current}%`, background: gapColor(gap), borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
              <h4 style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '1rem 0 0.5rem' }}>Active Trainings</h4>
              {selectedMember.trainings.length === 0 ? <p style={{ fontSize: '0.82rem', color: '#64748b' }}>No training assigned yet.</p> : selectedMember.trainings.map((t, i) => (
                <div key={i} style={{ padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{t.title}</span>
                    <span style={{ color: t.status === 'Completed' ? '#10b981' : '#f59e0b', fontWeight: 600, fontSize: '0.72rem' }}>{t.status}</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${t.progress}%`, background: t.status === 'Completed' ? '#10b981' : '#6366f1', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: KNOWLEDGE GAPS ─── */}
      {activeTab === 'gaps' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {/* Team Skill Gap Heatmap */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>🗺️ Team Skill Gap Heatmap</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.78rem', color: '#94a3b8' }}>Member</th>
                    {[...new Set(teamMembers.flatMap(m => m.skills.map(s => s.name)))].map(skill => (
                      <th key={skill} style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{skill}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600, fontSize: '0.85rem' }}>{m.name}</td>
                      {[...new Set(teamMembers.flatMap(m2 => m2.skills.map(s => s.name)))].map(skill => {
                        const sk = m.skills.find(s => s.name === skill);
                        if (!sk) return <td key={skill} style={{ padding: '0.75rem', textAlign: 'center' }}><span style={{ color: '#334155' }}>—</span></td>;
                        const gap = sk.required - sk.current;
                        return (
                          <td key={skill} style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <div style={{ display: 'inline-block', padding: '0.25rem 0.65rem', borderRadius: 6, background: `${gapColor(gap)}18`, color: gapColor(gap), fontWeight: 700, fontSize: '0.78rem', minWidth: 40 }}>
                              {gap}%
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Critical Gaps List */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>🔴 Critical Gaps ({'>'} 25%)</h3>
              <button onClick={() => setEscalateModal(true)} style={{ padding: '0.45rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>⬆️ Escalate to Dept Head</button>
            </div>
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              {teamMembers.flatMap(m => m.skills.filter(s => (s.required - s.current) > 25).map(s => ({ member: m.name, role: m.role, skill: s.name, gap: s.required - s.current, current: s.current, required: s.required }))).sort((a, b) => b.gap - a.gap).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem' }}>{item.gap >= 40 ? '🔴' : '🟠'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.skill}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.member} • {item.role} • {item.current}% → {item.required}%</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '1.1rem' }}>{item.gap}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Escalation History */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📨 Escalation History to Department Head</h3>
            {escalations.length === 0 ? <p style={{ color: '#64748b' }}>No escalations yet.</p> : (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {escalations.map(e => (
                  <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{e.gap}</div>
                      <div style={{ fontSize: '0.73rem', color: '#64748b' }}>{e.date} • {e.severity}</div>
                    </div>
                    <span style={{ padding: '0.2rem 0.65rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: e.status === 'Escalated' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: e.status === 'Escalated' ? '#ef4444' : '#10b981' }}>{e.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB: TRAINING PROGRESS ─── */}
      {activeTab === 'training' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {teamMembers.map(m => {
            const mTrain = m.trainings.length ? Math.round(m.trainings.reduce((a, t) => a + t.progress, 0) / m.trainings.length) : 0;
            return (
              <div key={m.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>{m.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{m.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{m.role}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.3rem', color: mTrain >= 80 ? '#10b981' : mTrain >= 50 ? '#f59e0b' : '#ef4444' }}>{mTrain}%</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Overall Progress</div>
                  </div>
                </div>
                {m.trainings.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: '0.85rem' }}>No training assigned — <button onClick={() => setAssignModal(m.id)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>Assign now →</button></div>
                ) : (
                  <div style={{ display: 'grid', gap: '0.65rem' }}>
                    {m.trainings.map((t, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 8, background: t.status === 'Completed' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                          {t.status === 'Completed' ? '✅' : t.status === 'In Progress' ? '📖' : '📋'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 4 }}>{t.title}</div>
                          <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${t.progress}%`, background: t.status === 'Completed' ? '#10b981' : '#6366f1', borderRadius: 3 }} />
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: 55 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: t.status === 'Completed' ? '#10b981' : '#a5b4fc' }}>{t.progress}%</div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{t.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                  <button onClick={() => setAssignModal(m.id)} style={{ padding: '0.4rem 0.85rem', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' }}>📚 Assign Training</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── TAB: CONTRIBUTIONS ─── */}
      {activeTab === 'contributions' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {/* Team-created knowledge */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>🏷️ Team-Specific Knowledge</h3>
              <button onClick={() => setShowKnowledgeForm(true)} style={{ padding: '0.4rem 0.85rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' }}>➕ Create New</button>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {teamKnowledge.map(k => (
                <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 1rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{k.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>By {k.author} • {k.date}</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '0.15rem 0.5rem', borderRadius: 10, fontWeight: 600 }}>{k.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Member contributions */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📝 Member Knowledge Contributions</h3>
            {teamMembers.map(m => m.contributions.length === 0 ? null : (
              <div key={m.id} style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '0.75rem' }}>{m.avatar}</div>
                  {m.name}
                </div>
                <div style={{ display: 'grid', gap: '0.4rem', paddingLeft: '2.25rem' }}>
                  {m.contributions.map((c, ci) => (
                    <div key={ci} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.type} • {c.date}</div>
                      </div>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: c.status === 'Published' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: c.status === 'Published' ? '#10b981' : '#f59e0b' }}>{c.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB: PENDING REVIEWS ─── */}
      {activeTab === 'reviews' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>🔍 Content Pending Your Review</h3>
          {pendingReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
              <p style={{ fontSize: '1rem' }}>All caught up! No pending reviews.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {teamMembers.flatMap(m => m.contributions.filter(c => c.status === 'Pending Review').map(c => ({ ...c, memberName: m.name, memberRole: m.role, avatar: m.avatar }))).map((item, i) => {
                const state = reviewState[item.title];
                return (
                  <div key={i} style={{ padding: '1.25rem', background: state ? 'rgba(255,255,255,0.03)' : 'rgba(245,158,11,0.06)', border: state ? '1px solid rgba(255,255,255,0.08)' : '1px dashed rgba(245,158,11,0.3)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>{item.title}</h4>
                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                          By <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{item.memberName}</span> ({item.memberRole}) • {item.date} • {item.type}
                        </div>
                      </div>
                      {state && (
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, background: state === 'Approved' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: state === 'Approved' ? '#10b981' : '#ef4444' }}>
                          {state === 'Approved' ? '✅ Approved' : '❌ Rejected'}
                        </span>
                      )}
                    </div>
                    {!state && (
                      <div style={{ display: 'flex', gap: '0.65rem' }}>
                        <button onClick={() => handleApprove(item.title)} style={{ padding: '0.5rem 1.25rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>✅ Approve & Publish</button>
                        <button onClick={() => handleReject(item.title)} style={{ padding: '0.5rem 1.25rem', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>❌ Reject</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== MODALS ===== */}

      {/* Assign Training Modal */}
      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, background: '#0f172a', border: '1px solid rgba(99,102,241,0.3)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📚 Assign Training to {teamMembers.find(m => m.id === assignModal)?.name}</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 4 }}>Course / Resource</label>
                <select value={assignCourse} onChange={e => setAssignCourse(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                  <option value="">Select a course...</option>
                  <option value="Advanced React Patterns & Performance">Advanced React Patterns & Performance</option>
                  <option value="Predictive Analytics with Python">Predictive Analytics with Python</option>
                  <option value="Kubernetes CKA Certification Prep">Kubernetes CKA Certification Prep</option>
                  <option value="CI/CD Pipeline with GitHub Actions">CI/CD Pipeline with GitHub Actions</option>
                  <option value="AWS Solutions Architect Professional">AWS Solutions Architect Professional</option>
                  <option value="Cybersecurity Governance & Compliance">Cybersecurity Governance & Compliance</option>
                  <option value="Machine Learning Fundamentals">Machine Learning Fundamentals</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 4 }}>Due Date</label>
                <input type="date" value={assignDue} onChange={e => setAssignDue(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setAssignModal(null)} style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => handleAssignTraining(assignModal)} style={{ padding: '0.65rem 1.5rem', background: '#10b981', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Assign Training</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Gap Modal */}
      {escalateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, background: '#0f172a', border: '1px solid rgba(239,68,68,0.3)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>⬆️ Escalate Knowledge Gap to Department Head</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 4 }}>Gap Description</label>
                <textarea rows={3} value={escalateGap} onChange={e => setEscalateGap(e.target.value)} placeholder="e.g. Critical Machine Learning capability deficit in Data Science team..." style={{ width: '100%', padding: '0.65rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 4 }}>Severity</label>
                <select value={escalateSeverity} onChange={e => setEscalateSeverity(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                  <option value="Critical">🔴 Critical</option>
                  <option value="High">🟠 High</option>
                  <option value="Medium">🟡 Medium</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setEscalateModal(false)} style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleEscalate} style={{ padding: '0.65rem 1.5rem', background: '#ef4444', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>⬆️ Escalate Now</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Knowledge Modal */}
      {showKnowledgeForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, background: '#0f172a', border: '1px solid rgba(99,102,241,0.3)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📝 Create Team-Specific Knowledge</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 4 }}>Knowledge Title</label>
                <input type="text" value={newKnowledgeTitle} onChange={e => setNewKnowledgeTitle(e.target.value)} placeholder="e.g. Team Code Review Standards" style={{ width: '100%', padding: '0.65rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowKnowledgeForm(false)} style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleCreateTeamKnowledge} style={{ padding: '0.65rem 1.5rem', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Create Knowledge</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamLeaderDashboard;
