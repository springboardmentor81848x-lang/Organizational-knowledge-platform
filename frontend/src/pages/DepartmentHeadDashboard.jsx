import React, { useState } from 'react';
import { getStoredUser } from '../services/platformApi';

/* ───── MOCK DATA FOR DEPARTMENT HEAD ───── */
const INITIAL_DEPARTMENTS = [
  { id: 'eng', name: 'Software Engineering & Tech', lead: 'Dr. Robert Vance' },
  { id: 'data', name: 'Data Science & AI Intelligence', lead: 'Elena Rostova' },
  { id: 'cloud', name: 'Cloud Infrastructure & DevOps', lead: 'Marcus Brody' },
];

const INITIAL_TEAMS = [
  { id: 1, name: 'Frontend Architecture Team', deptId: 'eng', lead: 'Alice Smith', membersCount: 12, avgGap: 14, trainingProgress: 84, activeProjects: 4, criticalGaps: 1 },
  { id: 2, name: 'Backend Services & APIs', deptId: 'eng', lead: 'Priya Sharma', membersCount: 18, avgGap: 18, trainingProgress: 76, activeProjects: 6, criticalGaps: 2 },
  { id: 3, name: 'Data Analytics & ML Ops', deptId: 'data', lead: 'Bob Chen', membersCount: 15, avgGap: 24, trainingProgress: 68, activeProjects: 5, criticalGaps: 3 },
  { id: 4, name: 'DevOps & Cyber Security', deptId: 'cloud', lead: 'Sarah Lee', membersCount: 10, avgGap: 12, trainingProgress: 91, activeProjects: 3, criticalGaps: 0 },
];

const INITIAL_EMPLOYEES = [
  { id: 101, name: 'Alice Smith', email: 'alice@infosys.com', team: 'Frontend Architecture Team', role: 'Lead Frontend Dev', avatar: 'A', status: 'Active', gap: 10, topSkill: 'React / Next.js', training: 'Advanced Micro-frontends (82%)' },
  { id: 102, name: 'Priya Sharma', email: 'priya@infosys.com', team: 'Backend Services & APIs', role: 'Senior Java Lead', avatar: 'P', status: 'Active', gap: 12, topSkill: 'Spring Boot 3', training: 'Kubernetes CKA Prep (60%)' },
  { id: 103, name: 'Bob Chen', email: 'bob@infosys.com', team: 'Data Analytics & ML Ops', role: 'Staff Data Analyst', avatar: 'B', status: 'Active', gap: 28, topSkill: 'PostgreSQL & PySpark', training: 'Predictive Analytics (45%)' },
  { id: 104, name: 'Sarah Lee', email: 'sarah@infosys.com', team: 'DevOps & Cyber Security', role: 'Principal Architect', avatar: 'S', status: 'Active', gap: 8, topSkill: 'AWS Architecture', training: 'AWS Security Specialty (92%)' },
  { id: 105, name: 'David Kim', email: 'david@infosys.com', team: 'Backend Services & APIs', role: 'QA Automation Lead', avatar: 'D', status: 'On Leave', gap: 22, topSkill: 'Selenium Automation', training: 'GitHub Actions CI/CD (30%)' },
  { id: 106, name: 'Michael Tan', email: 'michael@infosys.com', team: 'Data Analytics & ML Ops', role: 'ML Research Engineer', avatar: 'M', status: 'Active', gap: 32, topSkill: 'Python & PyTorch', training: 'LLM Fine-tuning (20%)' },
  { id: 107, name: 'Jessica Taylor', email: 'jessica@infosys.com', team: 'Frontend Architecture Team', role: 'UI/UX Developer', avatar: 'J', status: 'Active', gap: 15, topSkill: 'Design Systems', training: 'Web Accessibility (75%)' },
];

const INITIAL_KNOWLEDGE_APPROVALS = [
  { id: 201, title: 'Department-Wide Microservices Security Mandate', type: 'Architecture Guidelines', author: 'Priya Sharma', team: 'Backend Services', date: '2026-09-12', status: 'Pending Review', summary: 'Establishes mTLS and OAuth2 Token Exchange requirements for inter-service communication.' },
  { id: 202, title: 'AI & Data Privacy Governance Blueprint', type: 'Compliance Standard', author: 'Bob Chen', team: 'Data Analytics', date: '2026-09-10', status: 'Pending Review', summary: 'Framework for anonymizing customer PII data prior to LLM training pipeline ingest.' },
  { id: 203, title: 'Zero-Trust Infrastructure Deployment Standard', type: 'Infrastructure SOP', author: 'Sarah Lee', team: 'DevOps & Cyber Security', date: '2026-09-08', status: 'Approved', summary: 'Hardened Kubernetes cluster baseline configuration and mandatory IAM policies.' },
  { id: 204, title: 'Design System Component Standards v3', type: 'Frontend Standard', author: 'Alice Smith', team: 'Frontend Architecture', date: '2026-09-04', status: 'Approved', summary: 'Accessibility compliant token system and responsive layout rules.' },
];

const INITIAL_LEARNING_PRIORITIES = [
  { id: 301, skill: 'Generative AI & LLM Engineering', targetTeams: ['Data Analytics', 'Backend Services'], targetLevel: 85, currentAvg: 48, priority: 'Critical', targetDate: '2026-11-30', status: 'In Progress', progress: 56 },
  { id: 302, skill: 'Zero Trust & Cloud Security Governance', targetTeams: ['DevOps & Cyber Security', 'Backend Services'], targetLevel: 90, currentAvg: 72, priority: 'High', targetDate: '2026-10-15', status: 'In Progress', progress: 78 },
  { id: 303, skill: 'Async Messaging (Kafka / Event Streaming)', targetTeams: ['Backend Services', 'Frontend Architecture'], targetLevel: 80, currentAvg: 58, priority: 'Medium', targetDate: '2026-12-15', status: 'Planning', progress: 35 },
];

const INITIAL_TL_REPORTS = [
  { id: 401, team: 'Data Analytics & ML Ops', lead: 'Bob Chen', date: '2026-09-12', highlight: 'Identified 32% gap in PySpark distributed processing. Requesting budget for external certification.', status: 'Action Needed', riskLevel: 'High' },
  { id: 402, team: 'Backend Services & APIs', lead: 'Priya Sharma', date: '2026-09-11', highlight: 'Completed Microservices migration module. Overall team training adoption reached 76%.', status: 'Reviewed', riskLevel: 'Low' },
  { id: 403, team: 'Frontend Architecture Team', lead: 'Alice Smith', date: '2026-09-09', highlight: 'Successfully onboarded 2 new devs. React performance audit complete.', status: 'Reviewed', riskLevel: 'Low' },
];

const CRITICAL_REQUIRED_SKILLS = [
  { name: 'LLM Fine-tuning & Prompt Engineering', required: 90, current: 42, gap: 48, severity: 'Critical', demand: 'High Strategic' },
  { name: 'Kubernetes Multi-Cluster Security', required: 95, current: 65, gap: 30, severity: 'Critical', demand: 'Operational Infrastructure' },
  { name: 'Distributed Cache & Resilience', required: 85, current: 58, gap: 27, severity: 'High', demand: 'Product Stability' },
  { name: 'Data Pipeline Automation (Airflow)', required: 88, current: 64, gap: 24, severity: 'High', demand: 'Data Analytics' },
  { name: 'UI Accessibility & WCAG 2.1 AAA', required: 85, current: 72, gap: 13, severity: 'Medium', demand: 'Frontend Compliance' },
];

const DepartmentHeadDashboard = () => {
  const user = getStoredUser();
  const [selectedDept, setSelectedDept] = useState('eng');
  const [activeTab, setActiveTab] = useState('overview');
  
  /* State handlers */
  const [knowledgeItems, setKnowledgeItems] = useState(INITIAL_KNOWLEDGE_APPROVALS);
  const [priorities, setPriorities] = useState(INITIAL_LEARNING_PRIORITIES);
  const [reports, setReports] = useState(INITIAL_TL_REPORTS);
  const [employees] = useState(INITIAL_EMPLOYEES);
  const [teams] = useState(INITIAL_TEAMS);

  /* Filter states */
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('All');
  
  /* Modal states */
  const [priorityModal, setPriorityModal] = useState(false);
  const [newPriority, setNewPriority] = useState({ skill: '', targetLevel: 85, priority: 'High', targetTeams: 'Backend Services', targetDate: '' });
  
  const [reviewModal, setReviewModal] = useState(null);
  const [reportModal, setReportModal] = useState(null);

  /* Notifications */
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  /* Calculated Metrics */
  const pendingApprovalsCount = knowledgeItems.filter(k => k.status === 'Pending Review').length;
  const criticalSkillsCount = CRITICAL_REQUIRED_SKILLS.filter(s => s.severity === 'Critical').length;
  const avgDeptGap = Math.round(teams.reduce((acc, t) => acc + t.avgGap, 0) / teams.length);
  const avgTrainingProgress = Math.round(teams.reduce((acc, t) => acc + t.trainingProgress, 0) / teams.length);
  const totalEmployeesCount = teams.reduce((acc, t) => acc + t.membersCount, 0);

  const handleApproveKnowledge = (id, status) => {
    setKnowledgeItems(prev => prev.map(k => k.id === id ? { ...k, status } : k));
    showToast(`✅ Knowledge item status updated to "${status}"`);
    setReviewModal(null);
  };

  const handleAddPriority = (e) => {
    e.preventDefault();
    if (!newPriority.skill.trim()) return;
    const item = {
      id: Date.now(),
      skill: newPriority.skill,
      targetTeams: [newPriority.targetTeams],
      targetLevel: Number(newPriority.targetLevel),
      currentAvg: 50,
      priority: newPriority.priority,
      targetDate: newPriority.targetDate || '2026-12-31',
      status: 'In Progress',
      progress: 10,
    };
    setPriorities([item, ...priorities]);
    setPriorityModal(false);
    setNewPriority({ skill: '', targetLevel: 85, priority: 'High', targetTeams: 'Backend Services', targetDate: '' });
    showToast(`🎯 New Learning Priority created: "${item.skill}"`);
  };

  const handleResolveReport = (id) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'Resolved' } : r));
    setReportModal(null);
    showToast(`📋 Team Leader report acknowledged & resolved`);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) || emp.role.toLowerCase().includes(employeeSearch.toLowerCase());
    const matchesTeam = selectedTeamFilter === 'All' || emp.team === selectedTeamFilter;
    return matchesSearch && matchesTeam;
  });

  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, background: 'rgba(16,185,129,0.95)', color: '#fff', padding: '0.85rem 1.5rem', borderRadius: '12px', fontWeight: 700, boxShadow: '0 10px 25px rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
          {toast}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '16px', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ padding: '0.2rem 0.65rem', background: 'rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, uppercase: 'true' }}>Executive Suite</span>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>• Department Head Dashboard</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Department Head <span style={{ background: 'linear-gradient(135deg, #a5b4fc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Strategic Command</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '0.35rem', marginBottom: 0 }}>
            Analyze department gaps, approve knowledge assets, set learning priorities, and oversee team leaders.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} style={{ padding: '0.65rem 1rem', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '10px', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
            {INITIAL_DEPARTMENTS.map(d => (
              <option key={d.id} value={d.id}>🏢 {d.name}</option>
            ))}
          </select>
          <button onClick={() => setPriorityModal(true)} style={{ padding: '0.65rem 1.25rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
            🎯 Set Learning Priority
          </button>
        </div>
      </div>

      {/* KPI Department Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
        {[
          { icon: '👥', label: 'Department Workforce', value: totalEmployeesCount, sub: `${teams.length} Active Teams`, color: '#6366f1' },
          { icon: '⚠️', label: 'Avg Competency Gap', value: `${avgDeptGap}%`, sub: '-3.5% vs Last Month', color: '#f59e0b' },
          { icon: '📈', label: 'Training Velocity', value: `${avgTrainingProgress}%`, sub: 'Target: 80%+', color: '#10b981' },
          { icon: '🚨', label: 'Critical Skill Gaps', value: criticalSkillsCount, sub: 'Immediate Focus', color: '#ef4444' },
          { icon: '✅', label: 'Pending Approvals', value: pendingApprovalsCount, sub: `${knowledgeItems.length} Total Base`, color: '#a855f7' },
        ].map((k, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', borderTop: `3px solid ${k.color}`, padding: '1.25rem 1rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{k.icon}</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{k.label}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Primary Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.04)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: '📊 Overview & Stats' },
          { id: 'employees', label: '👥 Employees & Teams', count: totalEmployeesCount },
          { id: 'gaps', label: '⚠️ Department Knowledge Gaps' },
          { id: 'comparison', label: '⚔️ Team Comparison' },
          { id: 'priorities', label: '🎯 Learning Priorities', count: priorities.length },
          { id: 'training', label: '📈 Training Analytics', count: `${avgTrainingProgress}%` },
          { id: 'approvals', label: '✅ Knowledge Approvals', count: pendingApprovalsCount },
          { id: 'reports', label: '📋 Team Leader Reports', count: reports.filter(r => r.status === 'Action Needed').length },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: '0 0 auto', padding: '0.65rem 1rem', borderRadius: '8px', border: 'none', background: activeTab === tab.id ? '#6366f1' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: activeTab === tab.id ? 700 : 500, fontSize: '0.85rem', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
            {tab.label} {tab.count !== undefined && <span style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)', padding: '1px 7px', borderRadius: 10, fontSize: '0.72rem', marginLeft: '0.35rem' }}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: EXECUTIVE OVERVIEW & STATS ─── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          
          {/* Department Health Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🏢</span> Department Teams & Operational Health Summary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {teams.map(t => (
                <div key={t.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{t.name}</h4>
                    <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: t.criticalGaps > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: t.criticalGaps > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                      {t.criticalGaps > 0 ? `${t.criticalGaps} Critical Gap` : 'Healthy'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>Team Leader: <strong style={{ color: '#a5b4fc' }}>{t.lead}</strong> • {t.membersCount} Members</div>
                  
                  <div style={{ display: 'grid', gap: '0.65rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                        <span style={{ color: '#94a3b8' }}>Competency Gap:</span>
                        <span style={{ fontWeight: 700, color: t.avgGap > 20 ? '#ef4444' : '#10b981' }}>{t.avgGap}%</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${t.avgGap}%`, background: t.avgGap > 20 ? '#ef4444' : '#10b981' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                        <span style={{ color: '#94a3b8' }}>Training Progress:</span>
                        <span style={{ fontWeight: 700, color: '#6366f1' }}>{t.trainingProgress}%</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${t.trainingProgress}%`, background: '#6366f1' }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Summaries */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.85rem' }}>🎯 Active Learning Priorities</h3>
              {priorities.slice(0, 3).map(p => (
                <div key={p.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.88rem' }}>
                    <span>{p.skill}</span>
                    <span style={{ color: p.priority === 'Critical' ? '#ef4444' : '#f59e0b', fontSize: '0.75rem' }}>{p.priority}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 3 }}>Progress: {p.progress}% • Target: {p.targetLevel}%</div>
                </div>
              ))}
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.85rem' }}>✅ Knowledge Asset Review Status</h3>
              {knowledgeItems.slice(0, 3).map(k => (
                <div key={k.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.85rem' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{k.title}</span>
                    <span style={{ color: k.status === 'Approved' ? '#10b981' : '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>{k.status}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 3 }}>By {k.author} ({k.team})</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: EMPLOYEES & TEAMS ─── */}
      {activeTab === 'employees' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>👥 Department Employees & Team Roster</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '3px 0 0' }}>Inspect team members, role assignments, top skills, and progress.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input type="text" placeholder="Search employee or role..." value={employeeSearch} onChange={e => setEmployeeSearch(e.target.value)} style={{ padding: '0.5rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }} />
                <select value={selectedTeamFilter} onChange={e => setSelectedTeamFilter(e.target.value)} style={{ padding: '0.5rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}>
                  <option value="All">All Teams</option>
                  {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Employee', 'Team', 'Role', 'Status', 'Skill Gap', 'Top Skill', 'Active Training'].map(h => (
                      <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>{emp.avatar}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{emp.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#cbd5e1' }}>{emp.team}</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#a5b4fc' }}>{emp.role}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700, background: emp.status === 'Active' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: emp.status === 'Active' ? '#10b981' : '#f59e0b' }}>
                          {emp.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: emp.gap > 20 ? '#ef4444' : '#10b981', fontSize: '0.88rem' }}>{emp.gap}%</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#e2e8f0' }}>{emp.topSkill}</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#94a3b8' }}>{emp.training}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: KNOWLEDGE GAPS ─── */}
      {activeTab === 'gaps' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>⚠️ Department Knowledge Gap Matrix & Risk Map</h3>
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {CRITICAL_REQUIRED_SKILLS.map((s, i) => (
                <div key={i} style={{ padding: '1rem 1.25rem', background: s.severity === 'Critical' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)', border: `1px solid ${s.severity === 'Critical' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{s.severity === 'Critical' ? '🔴' : '🟠'}</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{s.name}</h4>
                      <span style={{ padding: '0.15rem 0.55rem', background: 'rgba(255,255,255,0.08)', borderRadius: 10, fontSize: '0.72rem', color: '#cbd5e1' }}>{s.demand}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                      Current Capability: <strong>{s.current}%</strong> • Department Target: <strong>{s.required}%</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.severity === 'Critical' ? '#ef4444' : '#f59e0b' }}>{s.gap}% Gap</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{s.severity} Deficit</div>
                    </div>
                    <button onClick={() => { setNewPriority({ ...newPriority, skill: s.name }); setPriorityModal(true); }} style={{ padding: '0.5rem 0.85rem', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem' }}>
                      🎯 Set Priority
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: TEAM COMPARISON ─── */}
      {activeTab === 'comparison' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>⚔️ Department Teams Comparative Analysis</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Team Name', 'Lead', 'Size', 'Competency Gap %', 'Training Velocity', 'Critical Gaps', 'Performance Status'].map(h => (
                      <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teams.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#a5b4fc', fontSize: '0.85rem' }}>{t.lead}</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>{t.membersCount}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: t.avgGap > 20 ? '#ef4444' : '#10b981' }}>{t.avgGap}%</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${t.trainingProgress}%`, background: '#6366f1' }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{t.trainingProgress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: t.criticalGaps > 0 ? '#ef4444' : '#10b981' }}>{t.criticalGaps}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.65rem', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700, background: t.trainingProgress >= 80 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: t.trainingProgress >= 80 ? '#10b981' : '#f59e0b' }}>
                          {t.trainingProgress >= 80 ? 'High Performing' : 'Needs Support'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: LEARNING PRIORITIES ─── */}
      {activeTab === 'priorities' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>🎯 Active Department Learning Priorities</h3>
              <button onClick={() => setPriorityModal(true)} style={{ padding: '0.5rem 1rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
                ➕ Create Priority
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {priorities.map(p => (
                <div key={p.id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{p.skill}</h4>
                        <span style={{ padding: '0.15rem 0.55rem', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700, background: p.priority === 'Critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: p.priority === 'Critical' ? '#ef4444' : '#f59e0b' }}>
                          {p.priority} Priority
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                        Target Teams: <strong style={{ color: '#a5b4fc' }}>{Array.isArray(p.targetTeams) ? p.targetTeams.join(', ') : p.targetTeams}</strong> • Target Deadline: {p.targetDate}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366f1' }}>{p.progress}%</span>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Completion Progress</div>
                    </div>
                  </div>

                  <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p.progress}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 6: TRAINING ANALYTICS ─── */}
      {activeTab === 'training' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📈 Department Training Progress & Velocity</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1.25rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Overall Completion</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6366f1', margin: '0.3rem 0' }}>{avgTrainingProgress}%</div>
                <div style={{ fontSize: '0.75rem', color: '#10b981' }}>+12% increase this quarter</div>
              </div>

              <div style={{ padding: '1.25rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Completed Course Modules</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', margin: '0.3rem 0' }}>142</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Across all 4 teams</div>
              </div>

              <div style={{ padding: '1.25rem', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Active Learner Participation</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7', margin: '0.3rem 0' }}>94%</div>
                <div style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>High Engagement</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 7: KNOWLEDGE APPROVALS ─── */}
      {activeTab === 'approvals' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>✅ Department Knowledge Approval Workflow</h3>
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {knowledgeItems.map(item => (
                <div key={item.id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{item.title}</h4>
                        <span style={{ padding: '0.2rem 0.65rem', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700, background: item.status === 'Approved' ? 'rgba(16,185,129,0.15)' : item.status === 'Rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: item.status === 'Approved' ? '#10b981' : item.status === 'Rejected' ? '#ef4444' : '#f59e0b' }}>
                          {item.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                        Author: <strong style={{ color: '#a5b4fc' }}>{item.author}</strong> ({item.team}) • Category: {item.type} • Date: {item.date}
                      </div>
                    </div>

                    {item.status === 'Pending Review' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleApproveKnowledge(item.id, 'Approved')} style={{ padding: '0.45rem 0.85rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem' }}>
                          Approve Asset
                        </button>
                        <button onClick={() => handleApproveKnowledge(item.id, 'Rejected')} style={{ padding: '0.45rem 0.85rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem' }}>
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0.5rem 0 0' }}>{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 8: TEAM LEADER REPORTS ─── */}
      {activeTab === 'reports' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>📋 Team Leader Escalations & Activity Reports</h3>
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {reports.map(r => (
                <div key={r.id} style={{ padding: '1.25rem', background: r.status === 'Action Needed' ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${r.status === 'Action Needed' ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{r.team}</h4>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>Submitted by {r.lead} • {r.date}</div>
                    </div>
                    <span style={{ padding: '0.2rem 0.65rem', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700, background: r.status === 'Action Needed' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: r.status === 'Action Needed' ? '#ef4444' : '#10b981' }}>
                      {r.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: '0.5rem 0 0.75rem' }}>{r.highlight}</p>
                  
                  {r.status === 'Action Needed' && (
                    <button onClick={() => handleResolveReport(r.id)} style={{ padding: '0.45rem 0.85rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem' }}>
                      Acknowledge & Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: SET LEARNING PRIORITY ===== */}
      {priorityModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, background: '#0f172a', border: '1px solid rgba(99,102,241,0.3)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>🎯 Set Department Learning Priority</h2>
            <form onSubmit={handleAddPriority} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 4 }}>Priority Skill Name</label>
                <input type="text" value={newPriority.skill} onChange={e => setNewPriority({ ...newPriority, skill: e.target.value })} placeholder="e.g. LLM Prompt Architecture" required style={{ width: '100%', padding: '0.65rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 4 }}>Target Team</label>
                <select value={newPriority.targetTeams} onChange={e => setNewPriority({ ...newPriority, targetTeams: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                  {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 4 }}>Target Proficiency (%)</label>
                  <input type="number" min={50} max={100} value={newPriority.targetLevel} onChange={e => setNewPriority({ ...newPriority, targetLevel: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 4 }}>Priority Level</label>
                  <select value={newPriority.priority} onChange={e => setNewPriority({ ...newPriority, priority: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                    <option value="Critical">🔴 Critical</option>
                    <option value="High">🟠 High</option>
                    <option value="Medium">🟡 Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 4 }}>Target Completion Date</label>
                <input type="date" value={newPriority.targetDate} onChange={e => setNewPriority({ ...newPriority, targetDate: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setPriorityModal(false)} style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.5rem', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Create Priority</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DepartmentHeadDashboard;
