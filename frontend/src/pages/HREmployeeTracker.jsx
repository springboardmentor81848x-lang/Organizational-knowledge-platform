import React, { useState } from 'react';
import { useEffect } from 'react';
import { apiFetch } from '../services/platformApi';

// Mock employee data with full skill gap & mentor info
const MENTOR_POOL = [
  { name: 'Dr. Sarah Donovan', expertise: ['Cloud Infrastructure', 'AWS', 'Cybersecurity'], dept: 'Engineering' },
  { name: 'Mark Chen', expertise: ['React.js', 'TypeScript', 'UX Research'], dept: 'Product' },
  { name: 'Priya Kapoor', expertise: ['Python', 'Machine Learning', 'Data Analysis'], dept: 'Data Science' },
  { name: 'James Liu', expertise: ['Java Spring Boot', 'Microservices', 'SQL'], dept: 'Engineering' },
  { name: 'Ananya Sharma', expertise: ['Project Management', 'Agile', 'Leadership'], dept: 'HR & Ops' },
];

const INITIAL_EMPLOYEES = [
  {
    id: 1, name: 'Alice Smith', email: 'alice@infosys.com', department: 'Engineering', role: 'Frontend Developer',
    status: 'Active', joinDate: '2025-03-15', trainingProgress: 72,
    skills: [
      { name: 'React.js', current: 80, required: 90, gap: 10 },
      { name: 'TypeScript', current: 55, required: 80, gap: 25 },
      { name: 'Node.js', current: 40, required: 70, gap: 30 },
      { name: 'AWS Cloud', current: 20, required: 60, gap: 40 },
    ],
    suggestions: [
      'Enroll in Advanced React Patterns & Performance course',
      'Complete TypeScript Deep Dive (LinkedIn Learning)',
      'Join AWS Fundamentals certification path',
    ],
    mentor: 'Mark Chen',
  },
  {
    id: 2, name: 'Bob Chen', email: 'bob@infosys.com', department: 'Data Science', role: 'Data Analyst',
    status: 'Active', joinDate: '2025-06-01', trainingProgress: 45,
    skills: [
      { name: 'Python', current: 65, required: 90, gap: 25 },
      { name: 'Machine Learning', current: 30, required: 80, gap: 50 },
      { name: 'SQL & PostgreSQL', current: 75, required: 90, gap: 15 },
      { name: 'Power BI', current: 20, required: 70, gap: 50 },
    ],
    suggestions: [
      'Enroll in Predictive Analytics with Python & Scikit-learn',
      'Complete Machine Learning Fundamentals (Coursera)',
      'Attend internal Power BI data visualization workshop',
    ],
    mentor: 'Priya Kapoor',
  },
  {
    id: 3, name: 'Priya Sharma', email: 'priya@infosys.com', department: 'Engineering', role: 'Backend Engineer',
    status: 'Active', joinDate: '2024-11-10', trainingProgress: 88,
    skills: [
      { name: 'Java Spring Boot', current: 85, required: 95, gap: 10 },
      { name: 'Microservices', current: 70, required: 90, gap: 20 },
      { name: 'Docker & Kubernetes', current: 50, required: 80, gap: 30 },
      { name: 'REST APIs', current: 90, required: 95, gap: 5 },
    ],
    suggestions: [
      'Complete Kubernetes certification (CKA)',
      'Join Microservices Design Patterns workshop',
      'Take Advanced Spring Boot Security module',
    ],
    mentor: 'James Liu',
  },
  {
    id: 4, name: 'David Kim', email: 'david@infosys.com', department: 'HR & Ops', role: 'HR Specialist',
    status: 'On Leave', joinDate: '2024-05-22', trainingProgress: 30,
    skills: [
      { name: 'HR Compliance', current: 85, required: 90, gap: 5 },
      { name: 'Data-Driven HR', current: 30, required: 70, gap: 40 },
      { name: 'Workforce Analytics', current: 25, required: 75, gap: 50 },
      { name: 'Talent Management', current: 60, required: 85, gap: 25 },
    ],
    suggestions: [
      'Enroll in Workforce Analytics & Data-Driven HR course',
      'Complete HR Technology Platform training',
      'Schedule Talent Management certification exam',
    ],
    mentor: 'Ananya Sharma',
  },
  {
    id: 5, name: 'Sarah Lee', email: 'sarah@infosys.com', department: 'Engineering', role: 'Cloud Architect',
    status: 'Active', joinDate: '2023-08-14', trainingProgress: 95,
    skills: [
      { name: 'AWS Cloud', current: 92, required: 95, gap: 3 },
      { name: 'Cybersecurity', current: 78, required: 90, gap: 12 },
      { name: 'Docker & Kubernetes', current: 88, required: 95, gap: 7 },
      { name: 'Python', current: 70, required: 80, gap: 10 },
    ],
    suggestions: [
      'Pursue AWS Solutions Architect Professional certification',
      'Complete Cybersecurity Governance & Compliance module',
    ],
    mentor: 'Dr. Sarah Donovan',
  },
];

const getGapColor = (gap) => {
  if (gap <= 10) return '#10b981';
  if (gap <= 25) return '#f59e0b';
  return '#ef4444';
};

const getGapLabel = (gap) => {
  if (gap <= 10) return 'Minor';
  if (gap <= 25) return 'Moderate';
  return 'Critical';
};

const STATUS_COLORS = {
  'Active': { bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
  'On Leave': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
  'Inactive': { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
};

const HREmployeeTracker = () => {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeDetailTab, setActiveDetailTab] = useState('gaps');

  useEffect(() => {
    const loadRegisteredEmployees = async () => {
      try {
        const response = await apiFetch('/users');
        if (!response.ok) return;
        const users = await response.json();
        if (!users.length) return;
        setEmployees(users.map((employee) => ({
          id: employee.id,
          name: employee.name,
          email: employee.email,
          department: employee.department || 'Unassigned',
          role: employee.role || 'Employee',
          status: 'Active',
          joinDate: 'Registered',
          trainingProgress: employee.trainingProgress || 0,
          skills: employee.skillProgress ? [{ name: 'Overall capability', current: employee.skillProgress, required: 100, gap: employee.skillGap || 0 }] : [],
          suggestions: ['Complete the initial skills assessment to generate recommendations'],
          mentor: 'Not assigned',
        })));
      } catch (error) {
        console.error('Unable to load registered employees:', error);
      }
    };

    loadRegisteredEmployees();
  }, []);

  const departments = ['All', ...new Set(employees.map((e) => e.department))];

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'All' || e.department === filterDept;
    const matchStatus = filterStatus === 'All' || e.status === filterStatus;
    return matchSearch && matchDept && matchStatus;
  });

  const totalActive = employees.filter((e) => e.status === 'Active').length;
  const allSkills = employees.flatMap((e) => e.skills);
  const avgGap = allSkills.length
    ? Math.round(allSkills.reduce((a, s) => a + s.gap, 0) / allSkills.length)
    : 0;
  const criticalGapEmployees = employees.filter((e) =>
    e.skills.some((s) => s.gap > 25)
  ).length;
  const avgTrainingProgress = Math.round(
    employees.reduce((a, e) => a + e.trainingProgress, 0) / employees.length
  );

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Header */}
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>HR <span className="gradient-text">Employee Skill Tracker</span></h1>
          <p>Track every employee's skill gaps, training progress, mentor assignments, and personalized recommendations.</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { icon: '👥', label: 'Total Employees', value: employees.length, sub: `${totalActive} Active`, color: '#6366f1' },
          { icon: '⚠️', label: 'Avg. Skill Gap', value: `${avgGap}%`, sub: 'Across all skills', color: '#ef4444' },
          { icon: '🔴', label: 'Critical Gap Employees', value: criticalGapEmployees, sub: 'Need urgent intervention', color: '#f59e0b' },
          { icon: '📈', label: 'Avg. Training Progress', value: `${avgTrainingProgress}%`, sub: 'Completion rate', color: '#10b981' },
        ].map((kpi, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', borderTop: `3px solid ${kpi.color}` }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{kpi.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '0.2rem' }}>{kpi.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Search employees by name, role, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '240px', padding: '0.65rem 1rem', borderRadius: '10px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.9rem' }}
        />
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
          style={{ padding: '0.65rem 1rem', borderRadius: '10px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '0.65rem 1rem', borderRadius: '10px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedEmployee ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Employee Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Employee', 'Department / Role', 'Status', 'Training Progress', 'Avg. Gap', 'Mentor', ''].map((h) => (
                  <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const avgEmpGap = Math.round(emp.skills.reduce((a, s) => a + s.gap, 0) / emp.skills.length);
                const isSelected = selectedEmployee?.id === emp.id;
                return (
                  <tr key={emp.id}
                    onClick={() => setSelectedEmployee(isSelected ? null : emp)}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: isSelected ? 'rgba(99,102,241,0.1)' : 'transparent', transition: 'background 0.15s' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f1f5f9' }}>{emp.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#f1f5f9' }}>{emp.department}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.role}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, ...STATUS_COLORS[emp.status] }}>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', minWidth: '130px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${emp.trainingProgress}%`, background: emp.trainingProgress >= 80 ? '#10b981' : emp.trainingProgress >= 50 ? '#f59e0b' : '#ef4444', borderRadius: '4px' }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, minWidth: '32px' }}>{emp.trainingProgress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: getGapColor(avgEmpGap) }}>
                        {avgEmpGap}%
                      </span>
                      <div style={{ fontSize: '0.72rem', color: getGapColor(avgEmpGap) }}>{getGapLabel(avgEmpGap)}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 600 }}>🎓 {emp.mentor}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedEmployee(isSelected ? null : emp); setActiveDetailTab('gaps'); }}
                        style={{ padding: '0.3rem 0.75rem', background: isSelected ? '#6366f1' : 'rgba(99,102,241,0.15)', color: isSelected ? '#fff' : '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                        {isSelected ? '✕ Close' : 'View →'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👥</div>
              <p>No employees match your search criteria.</p>
            </div>
          )}
        </div>

        {/* Employee Detail Panel */}
        {selectedEmployee && (
          <div className="card" style={{ position: 'sticky', top: '80px', background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 0 40px rgba(99,102,241,0.15)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                {selectedEmployee.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{selectedEmployee.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#a5b4fc' }}>{selectedEmployee.role} • {selectedEmployee.department}</div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px' }}>
              {[
                { id: 'gaps', label: '⚠️ Skill Gaps' },
                { id: 'suggestions', label: '💡 Suggestions' },
                { id: 'mentor', label: '🎓 Mentor' },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveDetailTab(tab.id)}
                  style={{ flex: 1, padding: '0.45rem 0.5rem', borderRadius: '7px', border: 'none', background: activeDetailTab === tab.id ? '#6366f1' : 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: activeDetailTab === tab.id ? 700 : 400 }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Gaps Tab */}
            {activeDetailTab === 'gaps' && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Skill Gap Analysis</h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {selectedEmployee.skills.map((skill, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600 }}>{skill.name}</span>
                        <span style={{ color: getGapColor(skill.gap), fontWeight: 700 }}>Gap: {skill.gap}% <span style={{ fontSize: '0.7rem', background: `${getGapColor(skill.gap)}22`, color: getGapColor(skill.gap), padding: '1px 6px', borderRadius: '10px' }}>{getGapLabel(skill.gap)}</span></span>
                      </div>
                      <div style={{ position: 'relative', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                        {/* Required level bar (ghost) */}
                        <div style={{ position: 'absolute', height: '100%', width: `${skill.required}%`, background: 'rgba(255,255,255,0.08)', borderRadius: '5px' }} />
                        {/* Current level bar */}
                        <div style={{ position: 'absolute', height: '100%', width: `${skill.current}%`, background: `linear-gradient(90deg, ${getGapColor(skill.gap)}, ${getGapColor(skill.gap)}99)`, borderRadius: '5px', transition: 'width 0.6s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        <span>Current: {skill.current}%</span>
                        <span>Required: {skill.required}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions Tab */}
            {activeDetailTab === 'suggestions' && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Personalized Learning Recommendations</h4>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {selectedEmployee.suggestions.map((sug, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.85rem 1rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px' }}>
                      <span style={{ fontSize: '1.1rem', marginTop: '2px' }}>{idx === 0 ? '🔴' : idx === 1 ? '🟡' : '🟢'}</span>
                      <div>
                        <div style={{ fontSize: '0.87rem', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.5 }}>{sug}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Priority {idx === 0 ? '1 — Urgent' : idx === 1 ? '2 — Important' : '3 — Recommended'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700, marginBottom: '0.25rem' }}>✅ Training Progress</div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.35rem' }}>
                    <div style={{ height: '100%', width: `${selectedEmployee.trainingProgress}%`, background: '#10b981', borderRadius: '4px' }} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedEmployee.trainingProgress}% of assigned training completed</div>
                </div>
              </div>
            )}

            {/* Mentor Tab */}
            {activeDetailTab === 'mentor' && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Assigned & Recommended Mentors</h4>

                {/* Current Assigned Mentor */}
                {(() => {
                  const mentor = MENTOR_POOL.find((m) => m.name === selectedEmployee.mentor);
                  return mentor ? (
                    <div style={{ padding: '1rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Current Assigned Mentor</div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #818cf8, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                          {mentor.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{mentor.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{mentor.dept}</div>
                          <div style={{ fontSize: '0.72rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                            {mentor.expertise.map((ex, i) => (
                              <span key={i} style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '1px 7px', borderRadius: '10px' }}>{ex}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Other Recommended Mentors */}
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.75rem' }}>Other recommended mentors based on skill gaps:</div>
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  {MENTOR_POOL.filter((m) => m.name !== selectedEmployee.mentor).map((mentor, idx) => {
                    const skillGapNames = selectedEmployee.skills.filter((s) => s.gap > 15).map((s) => s.name);
                    const overlap = mentor.expertise.filter((ex) => skillGapNames.some((sg) => ex.toLowerCase().includes(sg.toLowerCase().split(' ')[0])));
                    const matchScore = Math.round((overlap.length / Math.max(skillGapNames.length, 1)) * 100);

                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#fff', flexShrink: 0 }}>
                          {mentor.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{mentor.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{mentor.dept}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: matchScore > 50 ? '#10b981' : '#f59e0b' }}>{matchScore}% match</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HREmployeeTracker;
