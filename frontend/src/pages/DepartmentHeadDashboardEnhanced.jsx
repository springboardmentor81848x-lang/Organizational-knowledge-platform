import React, { useState, useEffect } from 'react';
import { getStoredUser } from '../services/platformApi';
import { departmentHeadService } from '../services/departmentHead';

const INITIAL_DEPARTMENTS = [
  { id: 'eng', name: 'Software Engineering & Tech', lead: 'Dr. Robert Vance' },
  { id: 'data', name: 'Data Science & AI Intelligence', lead: 'Elena Rostova' },
  { id: 'cloud', name: 'Cloud Infrastructure & DevOps', lead: 'Marcus Brody' },
];

const DepartmentHeadDashboardEnhanced = () => {
  const user = getStoredUser();
  const [selectedDept, setSelectedDept] = useState('eng');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [statistics, setStatistics] = useState(null);
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [knowledgeGaps, setKnowledgeGaps] = useState([]);
  const [learningPriorities, setLearningPriorities] = useState([]);
  const [knowledgeApprovals, setKnowledgeApprovals] = useState([]);
  const [teamLeaderReports, setTeamLeaderReports] = useState([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('All');
  const [priorityModal, setPriorityModal] = useState(false);
  const [newPriority, setNewPriority] = useState({
    skill: '',
    targetLevel: 85,
    priority: 'High',
    targetTeams: 'Backend Services',
    targetDate: '',
  });
  const [toast, setToast] = useState('');

  // Load data on mount and when user changes
  useEffect(() => {
    if (user && user.email) {
      loadDashboardData(user.email);
    }
  }, [user]);

  const loadDashboardData = async (email) => {
    setLoading(true);
    try {
      // Load all dashboard data in parallel
      const [stats, teamsData, employeesData, gapsData, prioritiesData, approvalsData, reportsData] = 
        await Promise.all([
          departmentHeadService.getDepartmentStatistics(email),
          departmentHeadService.getDepartmentTeams(email),
          departmentHeadService.getDepartmentEmployees(email),
          departmentHeadService.getKnowledgeGaps(email),
          departmentHeadService.getLearningPriorities(email),
          departmentHeadService.getKnowledgeApprovals(email),
          departmentHeadService.getTeamLeaderReports(email),
        ]);

      setStatistics(stats || {});
      setTeams(teamsData || []);
      setEmployees(employeesData || []);
      setKnowledgeGaps(gapsData || []);
      setLearningPriorities(prioritiesData || []);
      setKnowledgeApprovals(approvalsData || []);
      setTeamLeaderReports(reportsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showToast('⚠️ Failed to load some dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleApproveKnowledge = async (id, status) => {
    try {
      const result = await departmentHeadService.reviewKnowledgeApproval(
        user.email,
        id,
        status,
        ''
      );
      if (result) {
        setKnowledgeApprovals(prev =>
          prev.map(k => k.id === id ? { ...k, status } : k)
        );
        showToast(`✅ Knowledge item status updated to "${status}"`);
      }
    } catch (error) {
      showToast('❌ Failed to update approval status');
    }
  };

  const handleAddPriority = async (e) => {
    e.preventDefault();
    if (!newPriority.skill.trim()) return;

    try {
      const result = await departmentHeadService.createLearningPriority(
        user.email,
        newPriority
      );
      if (result) {
        setLearningPriorities(prev => [result, ...prev]);
        setPriorityModal(false);
        setNewPriority({
          skill: '',
          targetLevel: 85,
          priority: 'High',
          targetTeams: 'Backend Services',
          targetDate: '',
        });
        showToast(`🎯 New Learning Priority created: "${result.skill}"`);
      }
    } catch (error) {
      showToast('❌ Failed to create learning priority');
    }
  };

  const handleResolveReport = async (id) => {
    try {
      const result = await departmentHeadService.resolveTeamLeaderReport(
        user.email,
        id,
        ''
      );
      if (result) {
        setTeamLeaderReports(prev =>
          prev.map(r => r.id === id ? { ...r, status: 'Resolved' } : r)
        );
        showToast('📋 Team Leader report acknowledged & resolved');
      }
    } catch (error) {
      showToast('❌ Failed to resolve report');
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.role?.toLowerCase().includes(employeeSearch.toLowerCase());
    const matchesTeam = selectedTeamFilter === 'All' || emp.team === selectedTeamFilter;
    return matchesSearch && matchesTeam;
  });

  // Calculate metrics
  const pendingApprovalsCount = knowledgeApprovals.filter(k => k.status === 'PENDING_REVIEW').length;
  const avgDeptGap = statistics?.avgCompetencyGap ? parseFloat(statistics.avgCompetencyGap) : 0;
  const avgTrainingProgress = statistics?.avgTrainingProgress
    ? parseFloat(statistics.avgTrainingProgress)
    : 0;
  const totalEmployeesCount = statistics?.totalEmployees || 0;

  if (loading && !statistics) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        color: '#fff',
      }}>
        <div>Loading Department Head Dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          background: 'rgba(16,185,129,0.95)',
          color: '#fff',
          padding: '0.85rem 1.5rem',
          borderRadius: '12px',
          fontWeight: 700,
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)',
        }}>
          {toast}
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15))',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '16px',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              padding: '0.2rem 0.65rem',
              background: 'rgba(99,102,241,0.3)',
              color: '#a5b4fc',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>EXECUTIVE SUITE</span>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>• Department Head Dashboard</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Department Head <span style={{
              background: 'linear-gradient(135deg, #a5b4fc, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Strategic Command</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '0.35rem', marginBottom: 0 }}>
            Analyze department gaps, approve knowledge assets, set learning priorities, and oversee team leaders.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} style={{
            padding: '0.65rem 1rem',
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: '10px',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}>
            {INITIAL_DEPARTMENTS.map(d => (
              <option key={d.id} value={d.id}>🏢 {d.name}</option>
            ))}
          </select>
          <button onClick={() => setPriorityModal(true)} style={{
            padding: '0.65rem 1.25rem',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}>
            🎯 Set Learning Priority
          </button>
        </div>
      </div>

      {/* KPI Department Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
        {[
          { icon: '👥', label: 'Department Workforce', value: totalEmployeesCount, sub: `${teams.length} Active Teams`, color: '#6366f1' },
          { icon: '⚠️', label: 'Avg Competency Gap', value: `${avgDeptGap.toFixed(1)}%`, sub: '-3.5% vs Last Month', color: '#f59e0b' },
          { icon: '📈', label: 'Training Velocity', value: `${avgTrainingProgress.toFixed(0)}%`, sub: 'Target: 80%+', color: '#10b981' },
          { icon: '🚨', label: 'Critical Skill Gaps', value: statistics?.criticalSkillGaps || 0, sub: 'Immediate Focus', color: '#ef4444' },
          { icon: '✅', label: 'Pending Approvals', value: pendingApprovalsCount, sub: `${knowledgeApprovals.length} Total Base`, color: '#a855f7' },
        ].map((k, i) => (
          <div key={i} className="card" style={{
            textAlign: 'center',
            borderTop: `3px solid ${k.color}`,
            padding: '1.25rem 1rem',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{k.icon}</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{k.label}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Primary Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        background: 'rgba(255,255,255,0.04)',
        padding: '6px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflowX: 'auto',
      }}>
        {[
          { id: 'overview', label: '📊 Overview & Stats' },
          { id: 'employees', label: '👥 Employees & Teams', count: totalEmployeesCount },
          { id: 'gaps', label: '⚠️ Knowledge Gaps' },
          { id: 'comparison', label: '⚔️ Team Comparison' },
          { id: 'priorities', label: '🎯 Learning Priorities', count: learningPriorities.length },
          { id: 'training', label: '📈 Training Analytics', count: `${avgTrainingProgress.toFixed(0)}%` },
          { id: 'approvals', label: '✅ Knowledge Approvals', count: pendingApprovalsCount },
          { id: 'reports', label: '📋 Team Leader Reports', count: teamLeaderReports.filter(r => r.status === 'Action Needed').length },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: '0 0 auto',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === tab.id ? '#6366f1' : 'transparent',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeTab === tab.id ? 700 : 500,
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
          }}>
            {tab.label} {tab.count !== undefined && (
              <span style={{
                background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                padding: '1px 7px',
                borderRadius: 10,
                fontSize: '0.72rem',
                marginLeft: '0.35rem',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: OVERVIEW & STATS ─── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🏢</span> Department Teams & Operational Health
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {teams.map(t => (
                <div key={t.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{t.name}</h4>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      background: t.criticalGaps > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                      color: t.criticalGaps > 0 ? '#ef4444' : '#10b981',
                      fontWeight: 700,
                    }}>
                      {t.criticalGaps > 0 ? `${t.criticalGaps} Critical Gap` : 'Healthy'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
                    Team Leader: <strong style={{ color: '#a5b4fc' }}>{t.lead}</strong> • {t.membersCount} Members
                  </div>

                  <div style={{ display: 'grid', gap: '0.65rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                        <span style={{ color: '#94a3b8' }}>Competency Gap:</span>
                        <span style={{ fontWeight: 700, color: t.avgGap > 20 ? '#ef4444' : '#10b981' }}>{t.avgGap}%</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${t.avgGap}%`,
                          background: t.avgGap > 20 ? '#ef4444' : '#10b981',
                        }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                        <span style={{ color: '#94a3b8' }}>Training Progress:</span>
                        <span style={{ fontWeight: 700, color: '#6366f1' }}>{t.trainingProgress}%</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${t.trainingProgress}%`,
                          background: '#6366f1',
                        }} />
                      </div>
                    </div>
                  </div>
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>👥 Department Employees & Team Roster</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '3px 0 0' }}>
                  Inspect team members, roles, top skills, and progress.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Search employee or role..."
                  value={employeeSearch}
                  onChange={e => setEmployeeSearch(e.target.value)}
                  style={{
                    padding: '0.5rem 0.85rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}
                />
                <select value={selectedTeamFilter} onChange={e => setSelectedTeamFilter(e.target.value)} style={{
                  padding: '0.5rem 0.85rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: '0.85rem',
                }}>
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
                      <th key={h} style={{
                        padding: '0.85rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: '#fff',
                            fontSize: '0.85rem',
                          }}>
                            {emp.name?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{emp.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#cbd5e1' }}>{emp.team}</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#a5b4fc' }}>{emp.role}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: 12,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: emp.status === 'Active' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                          color: emp.status === 'Active' ? '#10b981' : '#f59e0b',
                        }}>
                          {emp.status}
                        </span>
                      </td>
                      <td style={{
                        padding: '0.85rem 1rem',
                        fontWeight: 700,
                        color: emp.gap > 20 ? '#ef4444' : '#10b981',
                        fontSize: '0.88rem',
                      }}>
                        {emp.gap}%
                      </td>
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
              {knowledgeGaps.length > 0 ? (
                knowledgeGaps.map((s, i) => (
                  <div key={i} style={{
                    padding: '1rem 1.25rem',
                    background: s.severity === 'Critical' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
                    border: `1px solid ${s.severity === 'Critical' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>
                          {s.severity === 'Critical' ? '🔴' : '🟠'}
                        </span>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{s.skillName}</h4>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                        Current: <strong>{s.current}%</strong> • Target: <strong>{s.required}%</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          color: s.severity === 'Critical' ? '#ef4444' : '#f59e0b',
                        }}>
                          {s.gap}% Gap
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{s.severity} Deficit</div>
                      </div>
                      <button onClick={() => {
                        setNewPriority({ ...newPriority, skill: s.skillName });
                        setPriorityModal(true);
                      }} style={{
                        padding: '0.5rem 0.85rem',
                        background: '#6366f1',
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                      }}>
                        🎯 Set Priority
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                  No knowledge gaps identified
                </div>
              )}
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
                      <th key={h} style={{
                        padding: '0.85rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teams.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#a5b4fc', fontSize: '0.85rem' }}>{t.lead}</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>{t.membersCount}</td>
                      <td style={{
                        padding: '0.85rem 1rem',
                        fontWeight: 700,
                        color: t.avgGap > 20 ? '#ef4444' : '#10b981',
                      }}>
                        {t.avgGap}%
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: 80,
                            height: 6,
                            background: 'rgba(255,255,255,0.08)',
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${t.trainingProgress}%`,
                              background: '#6366f1',
                            }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{t.trainingProgress}%</span>
                        </div>
                      </td>
                      <td style={{
                        padding: '0.85rem 1rem',
                        fontWeight: 700,
                        color: t.criticalGaps > 0 ? '#ef4444' : '#10b981',
                      }}>
                        {t.criticalGaps}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.65rem',
                          borderRadius: 12,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: t.trainingProgress >= 80 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                          color: t.trainingProgress >= 80 ? '#10b981' : '#f59e0b',
                        }}>
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>🎯 Active Department Learning Priorities</h3>
              <button onClick={() => setPriorityModal(true)} style={{
                padding: '0.5rem 1rem',
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.82rem',
              }}>
                ➕ Create Priority
              </button>
            </div>

            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {learningPriorities.length > 0 ? (
                learningPriorities.map(p => (
                  <div key={p.id} style={{
                    padding: '1.25rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      marginBottom: '0.75rem',
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{p.skill}</h4>
                          <span style={{
                            padding: '0.15rem 0.55rem',
                            borderRadius: 10,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: p.priority === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                            color: p.priority === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                          }}>
                            {p.priority} Priority
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                          Target Teams: <strong style={{ color: '#a5b4fc' }}>
                            {Array.isArray(p.targetTeams) ? p.targetTeams.join(', ') : p.targetTeams}
                          </strong> • Target: {p.targetDate}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366f1' }}>{p.progress}%</span>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Completion</div>
                      </div>
                    </div>

                    <div style={{
                      height: 8,
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${p.progress}%`,
                        background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                        borderRadius: 4,
                      }} />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                  No active learning priorities
                </div>
              )}
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
              <div style={{
                padding: '1.25rem',
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '12px',
              }}>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Overall Completion</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6366f1', margin: '0.3rem 0' }}>
                  {avgTrainingProgress.toFixed(0)}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10b981' }}>+12% increase this quarter</div>
              </div>

              <div style={{
                padding: '1.25rem',
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '12px',
              }}>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Completed Modules</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', margin: '0.3rem 0' }}>142</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Across all teams</div>
              </div>

              <div style={{
                padding: '1.25rem',
                background: 'rgba(168,85,247,0.08)',
                border: '1px solid rgba(168,85,247,0.2)',
                borderRadius: '12px',
              }}>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Active Learners</div>
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
              {knowledgeApprovals.length > 0 ? (
                knowledgeApprovals.map(item => (
                  <div key={item.id} style={{
                    padding: '1.25rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      marginBottom: '0.5rem',
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{item.title}</h4>
                          <span style={{
                            padding: '0.2rem 0.65rem',
                            borderRadius: 12,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: item.status === 'APPROVED' ? 'rgba(16,185,129,0.15)' : item.status === 'REJECTED' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                            color: item.status === 'APPROVED' ? '#10b981' : item.status === 'REJECTED' ? '#ef4444' : '#f59e0b',
                          }}>
                            {item.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                          Author: <strong style={{ color: '#a5b4fc' }}>{item.author}</strong> ({item.team}) • {item.type} • {item.date}
                        </div>
                      </div>

                      {item.status === 'PENDING_REVIEW' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleApproveKnowledge(item.id, 'APPROVED')} style={{
                            padding: '0.45rem 0.85rem',
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                          }}>
                            Approve
                          </button>
                          <button onClick={() => handleApproveKnowledge(item.id, 'REJECTED')} style={{
                            padding: '0.45rem 0.85rem',
                            background: 'rgba(239,68,68,0.15)',
                            color: '#ef4444',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 8,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                          }}>
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0.5rem 0 0' }}>{item.summary}</p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                  No knowledge approvals
                </div>
              )}
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
              {teamLeaderReports.length > 0 ? (
                teamLeaderReports.map(r => (
                  <div key={r.id} style={{
                    padding: '1.25rem',
                    background: r.status === 'Action Needed' ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${r.status === 'Action Needed' ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '12px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{r.team}</h4>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                          Submitted by {r.lead} • {r.date}
                        </div>
                      </div>
                      <span style={{
                        padding: '0.2rem 0.65rem',
                        borderRadius: 12,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: r.status === 'Action Needed' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        color: r.status === 'Action Needed' ? '#ef4444' : '#10b981',
                      }}>
                        {r.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: '0.5rem 0 0.75rem' }}>
                      {r.highlight}
                    </p>

                    {r.status === 'Action Needed' && (
                      <button onClick={() => handleResolveReport(r.id)} style={{
                        padding: '0.45rem 0.85rem',
                        background: '#6366f1',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                      }}>
                        Acknowledge & Resolve
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                  No team leader reports
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: SET LEARNING PRIORITY ===== */}
      {priorityModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: 500,
            background: '#0f172a',
            border: '1px solid rgba(99,102,241,0.3)',
          }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>🎯 Set Department Learning Priority</h2>
            <form onSubmit={handleAddPriority} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 4 }}>
                  Priority Skill Name
                </label>
                <input
                  type="text"
                  value={newPriority.skill}
                  onChange={e => setNewPriority({ ...newPriority, skill: e.target.value })}
                  placeholder="e.g. LLM Prompt Architecture"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 4 }}>
                  Target Team
                </label>
                <select value={newPriority.targetTeams} onChange={e => setNewPriority({ ...newPriority, targetTeams: e.target.value })} style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }}>
                  {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 4 }}>
                    Target Proficiency (%)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={newPriority.targetLevel}
                    onChange={e => setNewPriority({ ...newPriority, targetLevel: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 4 }}>
                    Priority Level
                  </label>
                  <select value={newPriority.priority} onChange={e => setNewPriority({ ...newPriority, priority: e.target.value })} style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}>
                    <option value="Critical">🔴 Critical</option>
                    <option value="High">🟠 High</option>
                    <option value="Medium">🟡 Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 4 }}>
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={newPriority.targetDate}
                  onChange={e => setNewPriority({ ...newPriority, targetDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPriorityModal(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 8,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.65rem 1.5rem',
                    background: '#6366f1',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Create Priority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentHeadDashboardEnhanced;
