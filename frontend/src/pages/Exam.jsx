import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE_EXAMS, JOB_ROLES } from '../data/examData';
import { buildImprovementPayload, saveEmployeeImprovement } from '../services/employeeImprovement';
import { getStoredUser, roleFamily, apiFetch } from '../services/platformApi';

const QUESTION_TIME = 45; // seconds per question

const Exam = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const userRole = user.role || user.accountType || 'Employee';
  const family = roleFamily(userRole);

  // Default mode based on role family
  const [assessmentMode, setAssessmentMode] = useState(
    family === 'manager' ? 'manager' : 'self'
  );

  const [targetRole, setTargetRole] = useState(user.targetRole || user.examRole || 'backend');
  const exam = ROLE_EXAMS[targetRole] || ROLE_EXAMS['backend'];

  const [phase, setPhase] = useState('intro'); // intro | question | result
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [showFeedback, setShowFeedback] = useState(false);

  // Peer & Manager assessment states
  const [peerEmail, setPeerEmail] = useState('colleague@infosys.com');
  const [peerRatings, setPeerRatings] = useState({ 'Technical Skill': 80, 'Problem Solving': 75, 'Communication': 90, 'Teamwork': 85 });
  const [peerFeedbackSent, setPeerFeedbackSent] = useState(false);

  const [teamUsers, setTeamUsers] = useState([]);
  const [managerEmployee, setManagerEmployee] = useState('employee@infosys.com');
  const [managerRatings, setManagerRatings] = useState({ 'Core Competency': 85, 'Project Delivery': 90, 'Leadership & Initiative': 75, 'Domain Knowledge': 80 });
  const [managerSubmitted, setManagerSubmitted] = useState(false);

  // Fetch real users from backend database for Manager Assessment dropdown
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await apiFetch('/users');
        if (res.ok) {
          const list = await res.json();
          setTeamUsers(list || []);
        }
      } catch (e) {
        console.error('Could not fetch backend users for assessment', e);
      }
    };
    loadUsers();
  }, []);

  const handleAnswer = useCallback((optIdx) => {
    if (showFeedback) return;
    const q = exam.questions[currentQ];
    const isCorrect = optIdx === q.correct;
    setSelected(optIdx);
    setShowFeedback(true);

    const newAnswer = { questionId: q.id, skill: q.skill, correct: isCorrect, selected: optIdx };

    setTimeout(() => {
      const updatedAnswers = [...answers, newAnswer];
      if (currentQ + 1 >= exam.questions.length) {
        // Compute results and save to backend
        const skillScores = {};
        exam.skills.forEach(s => { skillScores[s] = { total: 0, correct: 0 }; });
        updatedAnswers.forEach(a => {
          skillScores[a.skill].total += 1;
          if (a.correct) skillScores[a.skill].correct += 1;
        });
        const gapResults = {};
        Object.entries(skillScores).forEach(([skill, { total, correct }]) => {
          const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
          gapResults[skill] = { score: pct, gap: 100 - pct, level: pct >= 80 ? 'strong' : pct >= 50 ? 'moderate' : 'critical' };
        });
        const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...existingUser, examResults: gapResults, examDate: new Date().toISOString(), examRole: targetRole };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        saveEmployeeImprovement(buildImprovementPayload({ user: updatedUser, examResults: gapResults }));
        setAnswers(updatedAnswers);
        setPhase('result');
      } else {
        setAnswers(updatedAnswers);
        setCurrentQ(c => c + 1);
        setSelected(null);
        setShowFeedback(false);
        setTimeLeft(QUESTION_TIME);
      }
    }, 1000);
  }, [showFeedback, currentQ, answers, exam, targetRole]);

  // Timer
  useEffect(() => {
    if (phase !== 'question') return;
    if (showFeedback) return;
    if (timeLeft <= 0) {
      handleAnswer(-1); // time's up
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, showFeedback, handleAnswer]);

  const startExam = () => {
    if (!targetRole) return;
    setPhase('question');
    setTimeLeft(QUESTION_TIME);
  };

  const handlePeerSubmit = async () => {
    const scoreValues = Object.values(peerRatings);
    const avgScore = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length);
    const payload = {
      employeeEmail: peerEmail,
      employeeName: peerEmail.split('@')[0],
      role: 'Employee',
      targetRole: targetRole || 'frontend',
      overallScore: avgScore,
      gapSummary: `Peer 360 Review: ${Object.entries(peerRatings).map(([k, v]) => `${k} (${v}%)`).join(', ')}`,
      enrolledCourses: 'Peer Assessment Conducted',
      improvementSummary: `Peer assessment submitted by ${user.name || 'Colleague'}.`,
    };
    await saveEmployeeImprovement(payload);
    setPeerFeedbackSent(true);
  };

  const handleManagerSubmit = async () => {
    const scoreValues = Object.values(managerRatings);
    const avgScore = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length);
    const targetUser = teamUsers.find(u => u.email === managerEmployee) || { name: 'John Employee', email: managerEmployee };
    const payload = {
      employeeEmail: targetUser.email,
      employeeName: targetUser.name,
      role: targetUser.role || 'Employee',
      targetRole: targetRole || 'backend',
      overallScore: avgScore,
      gapSummary: `Official Manager Evaluation: ${Object.entries(managerRatings).map(([k, v]) => `${k} (${v}%)`).join(', ')}`,
      enrolledCourses: 'Manager Assessment Completed',
      improvementSummary: `Official Manager Assessment completed by ${user.name || 'Manager'}. Competency scores synced with backend database.`,
    };
    await saveEmployeeImprovement(payload);
    setManagerSubmitted(true);
  };

  // RBAC Guard: If HR tries to take assessment, block and redirect to Analytics
  if (family === 'hr') {
    return (
      <div className="exam-page">
        <div className="exam-intro-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div className="exam-intro-icon">🏢</div>
          <h1>HR Specialist — Governance & Analytics Role</h1>
          <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>
            HR Specialists do not take personal assessments. HR is responsible for viewing organization-wide analytics, skill gap heatmaps, training effectiveness, and exporting reports.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="btn-primary" onClick={() => navigate('/app/analytics')} style={{ padding: '0.75rem 1.75rem', borderRadius: 10 }}>
              📊 Open Workforce Analytics & Reports
            </button>
            <button className="btn-secondary" onClick={() => navigate('/app/admin')} style={{ padding: '0.75rem 1.75rem', borderRadius: 10 }}>
              ⚙️ Admin Control Center
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------- INTRO -------- */
  if (phase === 'intro') {
    const roleInfo = JOB_ROLES.find(r => r.id === targetRole);
    return (
      <div className="exam-page">
        <div className="exam-intro-card">
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
            {family === 'manager' ? (
              <button
                type="button"
                className="filter-chip active"
                style={{ background: 'rgba(16,185,129,0.2)', borderColor: '#10b981', color: '#10b981' }}
              >
                👔 Manager Assessment (Team Member Evaluation)
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setAssessmentMode('self')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 20,
                    border: assessmentMode === 'self' ? '1px solid #6366f1' : '1px solid transparent',
                    background: assessmentMode === 'self' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                    color: assessmentMode === 'self' ? '#a5b4fc' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.82rem'
                  }}
                >
                  👤 Self Assessment
                </button>
                <button
                  type="button"
                  onClick={() => setAssessmentMode('peer')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 20,
                    border: assessmentMode === 'peer' ? '1px solid #6366f1' : '1px solid transparent',
                    background: assessmentMode === 'peer' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                    color: assessmentMode === 'peer' ? '#a5b4fc' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.82rem'
                  }}
                >
                  👥 Peer Assessment
                </button>
              </>
            )}
          </div>

          {assessmentMode === 'peer' ? (
            <div>
              <div className="exam-intro-icon">👥</div>
              <h1>Peer 360° Skill Assessment</h1>
              <p>Evaluate a colleague's technical skills and collaboration to provide balanced 360-degree feedback.</p>

              <div style={{ margin: '1.5rem 0', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Colleague Email / Name</label>
                  <input
                    type="text"
                    value={peerEmail}
                    onChange={(e) => setPeerEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 8, background: '#0f172a', border: '1px solid var(--glass-border)', color: 'white' }}
                  />
                </div>

                {Object.entries(peerRatings).map(([skill, val]) => (
                  <div key={skill} style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                      <span>{skill}</span>
                      <span style={{ color: '#a5b4fc', fontWeight: 700 }}>{val}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={val}
                      onChange={(e) => setPeerRatings({ ...peerRatings, [skill]: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: '#6366f1' }}
                    />
                  </div>
                ))}
              </div>

              {peerFeedbackSent ? (
                <div style={{ color: '#10b981', fontWeight: 700, margin: '1rem 0' }}>✓ Peer assessment submitted and saved to database for {peerEmail}!</div>
              ) : (
                <button className="btn-start-exam" onClick={handlePeerSubmit}>
                  📤 Submit Peer Assessment to DB
                </button>
              )}
            </div>
          ) : assessmentMode === 'manager' || family === 'manager' ? (
            <div>
              <div className="exam-intro-icon">👔</div>
              <h1>Manager Assessment Hub</h1>
              <p>Evaluate team member competencies against benchmark skill requirements.</p>

              <div style={{ margin: '1.5rem 0', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Select Team Member to Evaluate</label>
                  <select
                    value={managerEmployee}
                    onChange={(e) => setManagerEmployee(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 8, background: '#0f172a', border: '1px solid var(--glass-border)', color: 'white' }}
                  >
                    {teamUsers.length > 0 ? (
                      teamUsers.map(u => (
                        <option key={u.id} value={u.email}>{u.name} ({u.email}) — {u.role}</option>
                      ))
                    ) : (
                      <>
                        <option value="employee@infosys.com">John Employee (employee@infosys.com)</option>
                        <option value="alice@infosys.com">Alice Smith (alice@infosys.com)</option>
                        <option value="bob@infosys.com">Bob Chen (bob@infosys.com)</option>
                      </>
                    )}
                  </select>
                </div>

                {Object.entries(managerRatings).map(([skill, val]) => (
                  <div key={skill} style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                      <span>{skill}</span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>{val}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={val}
                      onChange={(e) => setManagerRatings({ ...managerRatings, [skill]: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: '#10b981' }}
                    />
                  </div>
                ))}
              </div>

              {managerSubmitted ? (
                <div style={{ color: '#10b981', fontWeight: 700, margin: '1rem 0' }}>✓ Official Manager rating submitted and synced with backend database!</div>
              ) : (
                <button className="btn-start-exam" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={handleManagerSubmit}>
                  ✅ Save Manager Evaluation to DB
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="exam-intro-icon">{roleInfo?.icon || '📝'}</div>
              <h1>{exam.title} (Self Assessment)</h1>
              <p>Test your knowledge across <strong>{exam.skills.length} skill domains</strong> with <strong>{exam.questions.length} questions</strong>. Your results will identify knowledge gaps and suggest personalized learning paths.</p>

              <div className="role-picker-grid" style={{ margin: '1.25rem 0' }}>
                {JOB_ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    className={`role-picker-card ${targetRole === role.id ? 'selected' : ''}`}
                    onClick={() => {
                      setTargetRole(role.id);
                      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                      localStorage.setItem('user', JSON.stringify({ ...storedUser, targetRole: role.id }));
                    }}
                  >
                    <span style={{ fontSize: '1.6rem' }}>{role.icon}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: targetRole === role.id ? '#a5b4fc' : 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3 }}>{role.label}</span>
                  </button>
                ))}
              </div>

              <div className="exam-skills-preview">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Skills Assessed</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {exam.skills.map(s => (
                    <span key={s} style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 50, padding: '0.3rem 0.85rem', fontSize: '0.82rem', color: '#a5b4fc' }}>{s}</span>
                  ))}
                </div>
              </div>

              <button className="btn-start-exam" onClick={startExam} style={{ marginTop: '1.25rem' }}>
                🚀 Start Self Assessment
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* -------- QUESTION -------- */
  if (phase === 'question') {
    const q = exam.questions[currentQ];
    const progress = ((currentQ) / exam.questions.length) * 100;
    const timerPct = (timeLeft / QUESTION_TIME) * 100;
    const timerColor = timeLeft > 20 ? '#10b981' : timeLeft > 10 ? '#f59e0b' : '#ef4444';

    return (
      <div className="exam-page">
        <div className="exam-q-card">
          <div className="exam-q-header">
            <div className="exam-q-progress-info">
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Question {currentQ + 1} of {exam.questions.length}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a5b4fc' }}>Skill: {q.skill}</span>
            </div>
            <div className="exam-q-timer" style={{ borderColor: timerColor, color: timerColor }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={timerColor} strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {timeLeft}s
            </div>
          </div>

          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: '1.75rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 4, transition: 'width 0.4s ease' }} />
          </div>

          <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 3, marginBottom: '2rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${timerPct}%`, background: timerColor, borderRadius: 3, transition: 'width 1s linear' }} />
          </div>

          <div className="exam-question-text">{q.question}</div>

          <div className="exam-options">
            {q.options.map((opt, idx) => {
              let cls = 'exam-option';
              if (showFeedback) {
                if (idx === q.correct) cls += ' correct';
                else if (idx === selected) cls += ' wrong';
                else cls += ' dim';
              } else if (selected === idx) {
                cls += ' selected';
              }
              return (
                <button key={idx} className={cls} onClick={() => handleAnswer(idx)} disabled={showFeedback}>
                  <span className="exam-option-letter">{String.fromCharCode(65 + idx)}</span>
                  <span>{opt}</span>
                  {showFeedback && idx === q.correct && <span className="exam-option-badge correct">✓</span>}
                  {showFeedback && idx === selected && idx !== q.correct && <span className="exam-option-badge wrong">✗</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* -------- RESULT -------- */
  if (phase === 'result') {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const results = user.examResults || {};
    const totalCorrect = answers.filter(a => a.correct).length;
    const totalScore = Math.round((totalCorrect / exam.questions.length) * 100);
    const gaps = Object.entries(results).filter(([, v]) => v.level !== 'strong').sort((a, b) => a[1].score - b[1].score);
    const strengths = Object.entries(results).filter(([, v]) => v.level === 'strong');

    const getGradeLabel = (score) => {
      if (score >= 80) return { label: 'Excellent', color: '#10b981', emoji: '🏆' };
      if (score >= 60) return { label: 'Good', color: '#6366f1', emoji: '👍' };
      if (score >= 40) return { label: 'Developing', color: '#f59e0b', emoji: '📈' };
      return { label: 'Needs Work', color: '#ef4444', emoji: '🎯' };
    };
    const grade = getGradeLabel(totalScore);

    return (
      <div className="exam-page" style={{ overflowY: 'auto', padding: '2rem 1rem' }}>
        <div className="exam-result-card">
          <div className="exam-score-hero">
            <div className="exam-score-ring" style={{ '--score-color': grade.color }}>
              <svg viewBox="0 0 120 120" width="140" height="140">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={grade.color} strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - totalScore / 100)}`}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 1s ease' }}
                />
                <text x="60" y="58" textAnchor="middle" fill="white" fontSize="20" fontWeight="700" fontFamily="Outfit">{totalScore}%</text>
                <text x="60" y="74" textAnchor="middle" fill={grade.color} fontSize="10" fontFamily="Inter">{grade.emoji} {grade.label}</text>
              </svg>
            </div>
            <h1>{exam.title} — Completed!</h1>
            <p style={{ color: 'var(--text-secondary)' }}>You answered {totalCorrect} of {exam.questions.length} questions correctly. Results synced to Spring Boot database.</p>
          </div>

          <div className="exam-result-section">
            <h3>📊 Skill-by-Skill Breakdown</h3>
            <div className="exam-skill-bars">
              {Object.entries(results).map(([skill, { score, level }]) => {
                const c = level === 'strong' ? '#10b981' : level === 'moderate' ? '#f59e0b' : '#ef4444';
                const lbl = level === 'strong' ? 'Strong' : level === 'moderate' ? 'Moderate' : 'Gap Detected';
                return (
                  <div key={skill} className="exam-skill-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{skill}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', background: `${c}20`, color: c, padding: '2px 8px', borderRadius: 50, fontWeight: 600 }}>{lbl}</span>
                        <span style={{ fontWeight: 700, color: c, fontSize: '0.9rem' }}>{score}%</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${score}%`, background: `linear-gradient(90deg, ${c}, ${c}99)`, borderRadius: 4, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {gaps.length > 0 && (
            <div className="exam-result-section">
              <h3>⚠️ Identified Knowledge Gaps</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {gaps.map(([skill, { gap, level }]) => (
                  <div key={skill} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(239,68,68,0.06)', border: `1px solid ${level === 'critical' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`, borderRadius: 10 }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem' }}>{level === 'critical' ? '🔴' : '🟡'}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{skill}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{level === 'critical' ? 'Critical gap — priority learning needed' : 'Moderate gap — improvement recommended'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: level === 'critical' ? '#ef4444' : '#f59e0b', fontSize: '1.1rem' }}>{gap}%</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>gap</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: 10, fontSize: '1rem' }} onClick={() => navigate('/app/gap-analysis')}>
              📊 View Full Gap Analysis
            </button>
            <button className="btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: 10, fontSize: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={() => navigate('/app/trainings')}>
              📚 Start Learning →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Exam;
