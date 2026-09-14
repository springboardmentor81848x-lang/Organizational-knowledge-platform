import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SKILL_COURSES, JOB_ROLES, ROLE_EXAMS } from '../data/examData';
import { buildLearningResources } from '../services/learningResources';
import { buildImprovementPayload, saveEmployeeImprovement } from '../services/employeeImprovement';

// ------- Radial Progress Component -------
const RadialProgress = ({ value, size = 100, strokeWidth = 8, color = '#6366f1', label }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: `rotate(-90deg)`, transformOrigin: `${size / 2}px ${size / 2}px`, transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x={size / 2} y={size / 2 + 6} textAnchor="middle" fill="white" fontSize={size * 0.18} fontWeight="700" fontFamily="Outfit">{value}%</text>
      </svg>
      {label && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: size }}>{label}</span>}
    </div>
  );
};

// ------- Bar Chart Component -------
const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 160, padding: '0 0.5rem' }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '0.7rem', color: d.color || '#6366f1', fontWeight: 700 }}>{d.value}%</div>
            <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: `linear-gradient(180deg, ${d.color || '#6366f1'}, ${d.color || '#6366f1'}66)`, height: `${pct}%`, minHeight: 4, transition: 'height 1s ease' }} />
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2, maxWidth: 60, wordBreak: 'break-word' }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// ------- Radar Chart -------
const RadarChart = ({ skills, size = 260 }) => {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const n = skills.length;
  const getPoint = (idx, val) => {
    const angle = (idx * 2 * Math.PI) / n - Math.PI / 2;
    const rr = r * (val / 100);
    return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)];
  };
  const getOuter = (idx) => {
    const angle = (idx * 2 * Math.PI) / n - Math.PI / 2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const dataPoints = skills.map((s, i) => getPoint(i, s.score));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z';

  // Grid circles
  const gridLevels = [25, 50, 75, 100];

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      {/* Grid */}
      {gridLevels.map(lv => (
        <polygon key={lv}
          points={skills.map((_, i) => { const [x, y] = getOuter(i); const f = lv / 100; return `${(cx + (x - cx) * f).toFixed(1)},${(cy + (y - cy) * f).toFixed(1)}`; }).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"
        />
      ))}
      {/* Axes */}
      {skills.map((_, i) => {
        const [ox, oy] = getOuter(i);
        return <line key={i} x1={cx} y1={cy} x2={ox} y2={oy} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      {/* Data fill */}
      <path d={dataPath} fill="rgba(99,102,241,0.18)" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
      {/* Data points */}
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5" />
      ))}
      {/* Labels */}
      {skills.map((s, i) => {
        const [ox, oy] = getOuter(i);
        const lx = cx + (ox - cx) * 1.22;
        const ly = cy + (oy - cy) * 1.22;
        const c = s.level === 'strong' ? '#10b981' : s.level === 'moderate' ? '#f59e0b' : '#ef4444';
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill={c} fontSize="10" fontWeight="600" fontFamily="Inter">{s.skill}</text>
        );
      })}
    </svg>
  );
};

// ------- Main GapAnalysis Page -------
const GapAnalysis = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const results = user.examResults;
  const examRole = user.examRole;
  const roleInfo = JOB_ROLES.find(r => r.id === examRole);
  const exam = ROLE_EXAMS[examRole];

  const [activeTab, setActiveTab] = useState('overview');
  const [enrolledCourses, setEnrolledCourses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('enrolledCourses') || '[]'); } catch { return []; }
  });

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSkillToUpdate, setSelectedSkillToUpdate] = useState('');
  const [newSkillScore, setNewSkillScore] = useState(80);

  const handleUpdateSkill = () => {
    if (!selectedSkillToUpdate) return;
    const currentResults = user.examResults || {};
    const updatedScore = Number(newSkillScore);
    const updatedLevel = updatedScore >= 80 ? 'strong' : updatedScore >= 50 ? 'moderate' : 'critical';
    
    const newResults = {
      ...currentResults,
      [selectedSkillToUpdate]: {
        score: updatedScore,
        gap: 100 - updatedScore,
        level: updatedLevel
      }
    };
    
    const updatedUser = { ...user, examResults: newResults };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    saveEmployeeImprovement(buildImprovementPayload({ user: updatedUser, examResults: newResults, enrolledCourses }));
    setShowUpdateModal(false);
    window.location.reload();
  };

  const enroll = (courseTitle) => {
    if (!enrolledCourses.includes(courseTitle)) {
      const updated = [...enrolledCourses, courseTitle];
      setEnrolledCourses(updated);
      localStorage.setItem('enrolledCourses', JSON.stringify(updated));
      saveEmployeeImprovement(buildImprovementPayload({ user, examResults: results, enrolledCourses: updated }));
    }
  };

  if (!results) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1.5rem', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem' }}>🎯</div>
        <h2>No Assessment Results Yet</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 420 }}>
          Take a role-based assessment to see your personalized gap analysis, skill radar chart, and learning recommendations.
        </p>
        <button className="btn-primary" style={{ padding: '0.85rem 2rem', borderRadius: 10 }} onClick={() => navigate('/app/exam')}>
          🚀 Take Assessment Now
        </button>
      </div>
    );
  }

  const skillList = Object.entries(results).map(([skill, data]) => ({ skill, ...data }));
  const avgScore = Math.round(skillList.reduce((s, x) => s + x.score, 0) / skillList.length);
  const criticalGaps = skillList.filter(s => s.level === 'critical');
  const moderateGaps = skillList.filter(s => s.level === 'moderate');
  const strengths = skillList.filter(s => s.level === 'strong');

  // Get courses for gap skills
  const recommendedCourses = [];
  skillList.filter(s => s.level !== 'strong').forEach(s => {
    (SKILL_COURSES[s.skill] || []).forEach(c => recommendedCourses.push({ ...c, skill: s.skill, gapLevel: s.level, gap: s.gap }));
  });
  recommendedCourses.sort((a, b) => b.gap - a.gap);

  const resourceGroups = skillList
    .filter(s => s.level !== 'strong')
    .map(s => ({
      skill: s.skill,
      gapLevel: s.level,
      gap: s.gap,
      resources: buildLearningResources(s.skill),
    }))
    .sort((a, b) => b.gap - a.gap);

  const barData = skillList.map(s => ({
    label: s.skill.length > 8 ? s.skill.slice(0, 8) + '…' : s.skill,
    value: s.score,
    color: s.level === 'strong' ? '#10b981' : s.level === 'moderate' ? '#f59e0b' : '#ef4444',
  }));

  const tabs = ['overview', 'radar', 'courses', 'progress'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hero */}
      <div className="gap-hero">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{roleInfo?.icon || '🎯'}</span>
            <span style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{roleInfo?.label || examRole}</span>
          </div>
          <h1 className="gradient-text" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.5rem' }}>Your Gap Analysis Report</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Exam taken on {new Date(user.examDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '0.65rem 1.25rem', borderRadius: 8, fontSize: '0.875rem', background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={() => { setSelectedSkillToUpdate(skillList[0]?.skill || ''); setShowUpdateModal(true); }}>
            ✏️ Update Skill & Recalculate Gaps
          </button>
          <button className="btn-primary" style={{ padding: '0.65rem 1.25rem', borderRadius: 8, fontSize: '0.875rem' }} onClick={() => navigate('/app/exam')}>
            🔄 Retake Assessment
          </button>
          <button style={{ padding: '0.65rem 1.25rem', borderRadius: 8, background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }}
            onClick={() => navigate('/app/trainings')}>
            📚 Browse All Courses
          </button>
        </div>
      </div>

      {/* Modal: Update Skill Level */}
      {showUpdateModal && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Update Skill Level & Recalculate Gaps</h2>
              <button className="modal-close-btn" onClick={() => setShowUpdateModal(false)}>✕</button>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Select Skill to Update</label>
                <select
                  className="form-input no-icon"
                  value={selectedSkillToUpdate}
                  onChange={(e) => setSelectedSkillToUpdate(e.target.value)}
                >
                  {skillList.map(s => (
                    <option key={s.skill} value={s.skill}>{s.skill} (Current: {s.score}%)</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">New Achieved Skill Score (%): {newSkillScore}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newSkillScore}
                  onChange={(e) => setNewSkillScore(e.target.value)}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>

              <button className="btn-submit" style={{ marginTop: '1.25rem' }} onClick={handleUpdateSkill}>
                ⚡ Save & Recalculate Gaps
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="stats-row">
        {[
          { icon: '📊', label: 'Overall Score', value: `${avgScore}%`, color: avgScore >= 70 ? '#10b981' : avgScore >= 50 ? '#f59e0b' : '#ef4444' },
          { icon: '🔴', label: 'Critical Gaps', value: criticalGaps.length, color: '#ef4444' },
          { icon: '🟡', label: 'Moderate Gaps', value: moderateGaps.length, color: '#f59e0b' },
          { icon: '✅', label: 'Strong Skills', value: strengths.length, color: '#10b981' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-top">
              <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}><span style={{ fontSize: '1.35rem' }}>{s.icon}</span></div>
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-title">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0' }}>
        {tabs.map(t => (
          <button key={t}
            onClick={() => setActiveTab(t)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '0.65rem 1.25rem', fontSize: '0.875rem', fontWeight: 600,
              color: activeTab === t ? '#a5b4fc' : 'var(--text-muted)',
              borderBottom: activeTab === t ? '2px solid #6366f1' : '2px solid transparent',
              marginBottom: -1, textTransform: 'capitalize', transition: 'all 0.2s',
            }}>
            {t === 'overview' ? '📊 Overview' : t === 'radar' ? '🕸 Radar' : t === 'courses' ? '📚 Courses' : '📈 Progress'}
          </button>
        ))}
      </div>

      {/* TAB: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Bar Chart */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">📊 Skill Score Chart</div>
            </div>
            <BarChart data={barData} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[['#10b981', 'Strong (≥80%)'], ['#f59e0b', 'Moderate (50-79%)'], ['#ef4444', 'Critical (<50%)']].map(([c, l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
                </span>
              ))}
            </div>
          </div>

          {/* Radial scores */}
          <div className="card">
            <div className="card-header"><div className="card-title">🎯 Skill Radials</div></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', padding: '0.5rem 0' }}>
              {skillList.map(s => {
                const c = s.level === 'strong' ? '#10b981' : s.level === 'moderate' ? '#f59e0b' : '#ef4444';
                return <RadialProgress key={s.skill} value={s.score} size={90} strokeWidth={7} color={c} label={s.skill} />;
              })}
            </div>
          </div>

          {/* Gap table */}
          <div className="card" style={{ gridColumn: '1/-1' }}>
            <div className="card-header">
              <div className="card-title">⚠️ Skill Gap Details</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    {['Skill', 'Score', 'Gap', 'Status', 'Priority Action'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {skillList.sort((a, b) => a.score - b.score).map(s => {
                    const c = s.level === 'strong' ? '#10b981' : s.level === 'moderate' ? '#f59e0b' : '#ef4444';
                    const action = s.level === 'critical' ? 'Enroll immediately' : s.level === 'moderate' ? 'Schedule training' : 'Maintain & grow';
                    return (
                      <tr key={s.skill} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.skill}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', minWidth: 80 }}>
                              <div style={{ height: '100%', width: `${s.score}%`, background: c, borderRadius: 3 }} />
                            </div>
                            <span style={{ color: c, fontWeight: 700, minWidth: 36 }}>{s.score}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: c }}>{s.gap}%</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ background: `${c}20`, color: c, padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600 }}>
                            {s.level === 'strong' ? '✅ Strong' : s.level === 'moderate' ? '🟡 Moderate' : '🔴 Critical'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{action}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Radar */}
      {activeTab === 'radar' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="card-header" style={{ width: '100%' }}>
              <div className="card-title">🕸 Skill Radar Chart</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on your exam performance</span>
            </div>
            <RadarChart skills={skillList} size={300} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[['#ef4444', 'Critical Gap'], ['#f59e0b', 'Moderate'], ['#10b981', 'Strong']].map(([c, l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c }} />{l}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">🏆 Score Breakdown</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              {skillList.map(s => {
                const c = s.level === 'strong' ? '#10b981' : s.level === 'moderate' ? '#f59e0b' : '#ef4444';
                return (
                  <div key={s.skill}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.skill}</span>
                      <span style={{ fontWeight: 700, color: c }}>{s.score}%</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.score}%`, background: `linear-gradient(90deg, ${c}, ${c}99)`, borderRadius: 4, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Heatmap style */}
          <div className="card" style={{ gridColumn: '1/-1' }}>
            <div className="card-header"><div className="card-title">🔥 Competency Heatmap</div></div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {skillList.map(s => {
                const opacity = s.score / 100;
                const baseColor = s.level === 'strong' ? '16,185,129' : s.level === 'moderate' ? '245,158,11' : '239,68,68';
                return (
                  <div key={s.skill} style={{
                    flex: '1 1 120px',
                    minWidth: 120,
                    height: 90,
                    borderRadius: 12,
                    background: `rgba(${baseColor}, ${0.08 + opacity * 0.35})`,
                    border: `1px solid rgba(${baseColor}, 0.3)`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                  }}>
                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: `rgba(${baseColor}, 1)` }}>{s.score}%</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.2 }}>{s.skill}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Courses */}
      {activeTab === 'courses' && (
        <div>
          {criticalGaps.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🔴</span>
              <div>
                <div style={{ fontWeight: 700, color: '#ef4444' }}>Critical gaps detected in {criticalGaps.map(g => g.skill).join(', ')}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>These courses are prioritized to close your most urgent knowledge gaps first.</div>
              </div>
            </div>
          )}

          {resourceGroups.length > 0 && (
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div className="card-header">
                <div className="card-title">🔗 Learning Resources by Weak Skill</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {resourceGroups.map(group => {
                  const resourceColor = group.gapLevel === 'critical' ? '#ef4444' : '#f59e0b';
                  return (
                    <div key={group.skill} style={{ padding: '1rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${resourceColor}22` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.8rem' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{group.skill}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{group.gap}% gap detected</div>
                        </div>
                        <span style={{ background: `${resourceColor}20`, color: resourceColor, padding: '3px 10px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700 }}>
                          {group.gapLevel === 'critical' ? 'Critical' : 'Moderate'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {group.resources.map(resource => (
                          <a
                            key={resource.title}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.75rem',
                              padding: '0.7rem 0.85rem',
                              borderRadius: 10,
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              textDecoration: 'none',
                              color: 'var(--text-primary)',
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                              <span style={{ fontSize: '1.1rem' }}>{resource.emoji}</span>
                              <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                <span style={{ fontSize: '0.84rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resource.title}</span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{resource.provider} • {resource.duration}</span>
                              </span>
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, whiteSpace: 'nowrap' }}>Open</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="trainings-grid">
            {recommendedCourses.map((c, i) => {
              const isEnrolled = enrolledCourses.includes(c.title);
              const gapColor = c.gapLevel === 'critical' ? '#ef4444' : '#f59e0b';
              return (
                <div className="training-card" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="training-thumb" style={{ background: c.gapLevel === 'critical' ? 'linear-gradient(135deg,#1f0a0a,#7f1d1d)' : 'linear-gradient(135deg,#1a1a0a,#78350f)', position: 'relative' }}>
                    <span style={{ fontSize: '2.75rem' }}>{c.emoji}</span>
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderRadius: 50, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700, color: gapColor, border: `1px solid ${gapColor}44` }}>
                      {c.gap}% gap
                    </div>
                  </div>
                  <div className="training-body">
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                      <span style={{ background: `${gapColor}20`, color: gapColor, padding: '2px 8px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700 }}>
                        {c.gapLevel === 'critical' ? '🔴 Critical Gap' : '🟡 Moderate Gap'}
                      </span>
                      <span style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', padding: '2px 8px', borderRadius: 50, fontSize: '0.7rem' }}>{c.skill}</span>
                    </div>
                    <div className="training-title" style={{ fontSize: '0.95rem' }}>{c.title}</div>
                    <div className="training-meta">
                      <span>⏱ {c.duration}</span>
                      <span>📶 {c.level}</span>
                      <span>⭐ {c.matchScore}% match</span>
                    </div>
                    <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>by {c.provider}</div>
                    <div className="training-footer">
                      <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: '#6366f1', textDecoration: 'underline' }}>🔗 Visit Course</a>
                      <button
                        className="btn-enroll"
                        style={isEnrolled ? { background: 'linear-gradient(135deg,#10b981,#059669)' } : {}}
                        onClick={() => enroll(c.title)}
                      >
                        {isEnrolled ? '✓ Enrolled' : 'Enroll Now →'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {recommendedCourses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem' }}>🏆</div>
              <h3 style={{ margin: '1rem 0 0.5rem' }}>Outstanding performance!</h3>
              <p>You have no significant skill gaps. Keep learning to stay ahead.</p>
              <Link to="/app/trainings"><button className="btn-primary" style={{ marginTop: '1.25rem', padding: '0.75rem 2rem', borderRadius: 10 }}>Browse Advanced Courses</button></Link>
            </div>
          )}
        </div>
      )}

      {/* TAB: Progress */}
      {activeTab === 'progress' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="card">
            <div className="card-header"><div className="card-title">📚 Enrolled Courses</div></div>
            {enrolledCourses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                <p>No courses enrolled yet. Go to the Courses tab to start learning.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {enrolledCourses.map((title, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10 }}>
                    <span style={{ fontSize: '1.25rem' }}>📗</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>In progress</div>
                    </div>
                    <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 8px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700 }}>Enrolled ✓</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">🎯 Learning Goals</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {skillList.filter(s => s.level !== 'strong').slice(0, 5).map(s => (
                <div key={s.skill}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 5 }}>
                    <span style={{ fontWeight: 600 }}>{s.skill}</span>
                    <span style={{ color: 'var(--text-muted)' }}>Target: 80% | Current: {s.score}%</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '100%', width: `${s.score}%`, background: '#6366f1', borderRadius: 4 }} />
                    <div style={{ position: 'absolute', top: 0, left: '80%', height: '100%', width: 2, background: 'rgba(255,255,255,0.4)' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>Need {Math.max(0, 80 - s.score)}% more to reach target</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ gridColumn: '1/-1' }}>
            <div className="card-header"><div className="card-title">📋 Learning Plan Summary</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { label: 'Courses Enrolled', value: enrolledCourses.length, icon: '📗', color: '#10b981' },
                { label: 'Skills to Improve', value: skillList.filter(s => s.level !== 'strong').length, icon: '🎯', color: '#6366f1' },
                { label: 'Est. Learning Time', value: `${skillList.filter(s => s.level !== 'strong').length * 6}h`, icon: '⏱', color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '1.25rem', background: `${s.color}0d`, border: `1px solid ${s.color}22`, borderRadius: 12 }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, fontFamily: 'Outfit' }}>{s.value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GapAnalysis;
