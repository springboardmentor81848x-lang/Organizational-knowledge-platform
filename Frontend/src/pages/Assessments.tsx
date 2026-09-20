import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardCheck, Clock, Plus, ShieldCheck, XCircle } from 'lucide-react';
import { get, post, put, endpoints, getApiErrorMessage } from '../api';
import { currentRole } from '../auth';
import { Badge, Button, Card, Empty, ErrorBox, Field, Loading, Modal, SelectField, Stat } from '../components/ui';

const QUIZ_QUESTIONS: Record<string, Array<{ id: number; question: string; options: string[]; correctIndex: number }>> = {
  PROGRAMMING_LANGUAGE: [
    {
      id: 1,
      question: 'Which principle ensures object state encapsulation in object-oriented design?',
      options: ['Inheritance', 'Private fields with controlled getter/setter access', 'Global static variables', 'Polymorphic dispatch'],
      correctIndex: 1,
    },
    {
      id: 2,
      question: 'What is the main benefit of immutable data structures in multi-threaded software?',
      options: ['Faster memory allocation', 'Thread safety without explicit locks', 'Reduced bytecode size', 'Automatic database persistence'],
      correctIndex: 1,
    },
    {
      id: 3,
      question: 'In exception handling, what is the primary purpose of a finally block?',
      options: ['Catch runtime errors', 'Execute resource cleanup code regardless of exception occurrence', 'Rethrow checked exceptions', 'Suppress logging'],
      correctIndex: 1,
    },
  ],
  FRAMEWORK: [
    {
      id: 1,
      question: 'Which Spring annotation marks a class as a component bean managed by the IoC container?',
      options: ['@Component', '@Transient', '@Entity', '@Value'],
      correctIndex: 0,
    },
    {
      id: 2,
      question: 'How does Dependency Injection improve unit testability?',
      options: ['Accelerates compilation speed', 'Allows mocking or replacing dependencies easily', 'Enforces database indexes', 'Generates HTML documentation'],
      correctIndex: 1,
    },
    {
      id: 3,
      question: 'What is the primary purpose of Spring @Transactional annotation?',
      options: ['Format JSON API outputs', 'Manage database transaction boundaries automatically', 'Configure CORS security', 'Cache HTTP responses'],
      correctIndex: 1,
    },
  ],
  DATABASE: [
    {
      id: 1,
      question: 'Which SQL keyword guarantees uniqueness across a table column?',
      options: ['FOREIGN KEY', 'UNIQUE CONSTRAINT', 'INDEX DEFAULT', 'GROUP BY'],
      correctIndex: 1,
    },
    {
      id: 2,
      question: 'What property of ACID transactions prevents dirty reads?',
      options: ['Atomicity', 'Isolation', 'Durability', 'Consistency'],
      correctIndex: 1,
    },
    {
      id: 3,
      question: 'Why are database indexes used on frequently queried foreign key columns?',
      options: ['Reduce disk space', 'Speed up SELECT join lookup performance', 'Encrypt sensitive fields', 'Prevent NULL values'],
      correctIndex: 1,
    },
  ],
  DEFAULT: [
    {
      id: 1,
      question: 'What is the core objective of continuous integration (CI) in software development?',
      options: ['Manual release approval', 'Automated building and testing of code changes', 'Database schema truncation', 'User interface styling'],
      correctIndex: 1,
    },
    {
      id: 2,
      question: 'What distinguishes a RESTful API GET request from a POST request?',
      options: ['GET modifies server data', 'GET is safe and idempotent for retrieving resource state', 'POST cannot take parameters', 'GET requires OAuth headers'],
      correctIndex: 1,
    },
    {
      id: 3,
      question: 'Which git command combines upstream branch commits into your current working branch?',
      options: ['git status', 'git merge / git rebase', 'git clean', 'git init'],
      correctIndex: 1,
    },
  ],
};

function getQuizQuestions(category?: string) {
  if (!category) return QUIZ_QUESTIONS.DEFAULT;
  const key = String(category).toUpperCase();
  return QUIZ_QUESTIONS[key] || QUIZ_QUESTIONS.DEFAULT;
}

export default function Assessments() {
  const role = currentRole();
  const isManagerOrAdmin = role === 'MANAGER' || role === 'HR' || role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'my' | 'pending'>('my');
  const [myAssessments, setMyAssessments] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [peerTargets, setPeerTargets] = useState<any[]>([]);
  const [peerTargetsLoading, setPeerTargetsLoading] = useState(false);
  const [peerTargetsError, setPeerTargetsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [busy, setBusy] = useState(false);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [overrideProficiency, setOverrideProficiency] = useState('');

  const [quizDTO, setQuizDTO] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const [form, setForm] = useState({
    employeeId: '',
    skillId: '',
    assessmentType: 'SELF',
    assessedProficiency: 'INTERMEDIATE',
    score: '50',
    comments: '',
  });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const calls: Promise<any>[] = [
        get(`${endpoints.assessments}/my`),
        get(endpoints.skillMaster),
      ];

      if (isManagerOrAdmin) {
        calls.push(get(`${endpoints.assessments}/pending`));
        calls.push(get(endpoints.analytics + '/team').catch(() => []));
      }

      const [myList, skillList, pendingList, teamList] = await Promise.all(calls);
      setMyAssessments(myList || []);
      setSkills(skillList || []);
      if (pendingList) setPendingReviews(pendingList || []);
      if (teamList) setEmployees(teamList || []);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Unable to load assessments.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [role]);

  async function loadPeerTargets() {
    setPeerTargetsLoading(true);
    setPeerTargetsError('');
    setPeerTargets([]);
    try {
      const data = await get(endpoints.peerTargets);
      setPeerTargets(data || []);
    } catch (err: any) {
      setPeerTargetsError(getApiErrorMessage(err, 'Unable to load eligible peers. Please try again.'));
    } finally {
      setPeerTargetsLoading(false);
    }
  }

  async function loadQuiz(skillIdStr: string) {
    setQuizLoading(true);
    setQuizDTO(null);
    setCurrentQIndex(0);
    try {
      const data = await get(`${endpoints.assessments}/quiz?skillId=${skillIdStr}`);
      setQuizDTO(data);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Unable to load quiz for selected skill.'));
    } finally {
      setQuizLoading(false);
    }
  }

  function handleAssessmentTypeChange(newType: string) {
    setQuizAnswers({});
    setQuizDTO(null);
    setCurrentQIndex(0);
    setForm((prev) => ({ ...prev, assessmentType: newType, employeeId: '' }));
    if (newType === 'PEER') {
      loadPeerTargets();
    } else if (newType === 'SELF' && form.skillId) {
      loadQuiz(form.skillId);
    }
  }

  function handleSkillChange(skillIdStr: string) {
    setQuizAnswers({});
    setQuizDTO(null);
    setCurrentQIndex(0);
    setForm((prev) => ({
      ...prev,
      skillId: skillIdStr,
    }));
    if (skillIdStr && form.assessmentType === 'SELF') {
      loadQuiz(skillIdStr);
    }
  }

  function handleOptionSelect(qId: string, optionIdx: number) {
    setQuizAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.skillId) {
      setError('Please select a skill to assess.');
      return;
    }

    if (form.assessmentType === 'SELF') {
      if (!quizDTO || !quizDTO.questions || !quizDTO.questions.length) {
        setError('Quiz questions could not be loaded for the selected skill.');
        return;
      }
      const totalQ = quizDTO.questions.length;
      const answeredCount = Object.keys(quizAnswers).length;
      if (answeredCount < totalQ) {
        setError(`Please answer all ${totalQ} validation questions before submitting. (${answeredCount}/${totalQ} completed)`);
        return;
      }
    }

    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const payload: any = {
        skillId: Number(form.skillId),
        assessmentType: form.assessmentType,
        comments: form.comments.trim(),
      };

      if (form.assessmentType === 'SELF') {
        payload.quizAnswers = quizAnswers;
      } else {
        payload.assessedProficiency = form.assessedProficiency;
        payload.score = Number(form.score);
        if (form.employeeId) {
          payload.employeeId = Number(form.employeeId);
        }
      }

      const res = await post(endpoints.assessments, payload);
      setShowSubmitModal(false);
      setQuizAnswers({});
      setQuizDTO(null);
      setCurrentQIndex(0);
      setForm({
        employeeId: '',
        skillId: '',
        assessmentType: 'SELF',
        assessedProficiency: 'BEGINNER',
        score: '0',
        comments: '',
      });
      setSuccess(
        res.status === 'APPROVED'
          ? `Assessment submitted and approved! Score: ${res.score}% (${res.assessedProficiency}).`
          : `Assessment submitted successfully! Score: ${res.score}% (${res.assessedProficiency}) - Pending manager review.`,
      );
      load();
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Assessment submission failed.'));
    } finally {
      setBusy(false);
    }
  }

  function openReview(assessment: any) {
    setSelectedAssessment(assessment);
    setOverrideProficiency(assessment.assessedProficiency || 'INTERMEDIATE');
    setReviewComments('');
    setReviewModalOpen(true);
  }

  async function handleReviewDecision(decision: 'APPROVED' | 'REJECTED') {
    if (!selectedAssessment) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await put(`${endpoints.assessments}/${selectedAssessment.assessmentId}/review`, {
        status: decision,
        overrideProficiency: decision === 'APPROVED' ? overrideProficiency : undefined,
        reviewerComments: reviewComments.trim() || `${decision} by reviewer`,
      });
      setReviewModalOpen(false);
      setSelectedAssessment(null);
      setSuccess(
        decision === 'APPROVED'
          ? `Assessment for ${selectedAssessment.employeeName} approved! Skill updated and knowledge gaps recalculated.`
          : `Assessment for ${selectedAssessment.employeeName} rejected.`,
      );
      load();
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Assessment review action failed.'));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading />;

  const approvedCount = myAssessments.filter((a) => a.status === 'APPROVED').length;
  const pendingCount = myAssessments.filter((a) => a.status === 'PENDING_REVIEW').length;

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">Continuous Competency Verification</p>
          <h2>Skill Assessments & Multi-Rater Reviews</h2>
          <p className="muted">
            Submit self, peer, or manager assessments. Approved assessments automatically upgrade skill proficiencies and recalculate knowledge gaps.
          </p>
        </div>
        <Button onClick={() => setShowSubmitModal(true)}>
          <Plus size={16} style={{ marginRight: 6 }} /> New Assessment
        </Button>
      </div>

      {error && <ErrorBox message={error} />}
      {success && <div className="successBox">{success}</div>}

      <div className="statsGrid">
        <Stat label="Total Assessments" value={myAssessments.length} icon={<ClipboardCheck size={20} />} />
        <Stat label="Approved" value={approvedCount} icon={<CheckCircle2 size={20} />} />
        <Stat label="Pending Review" value={pendingCount} icon={<Clock size={20} />} />
        {isManagerOrAdmin && (
          <Stat label="Team Reviews Pending" value={pendingReviews.length} icon={<ShieldCheck size={20} />} />
        )}
      </div>

      {isManagerOrAdmin && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <button
            className={`btn ${activeTab === 'my' ? 'primary' : 'secondary'}`}
            onClick={() => setActiveTab('my')}
          >
            My Assessments ({myAssessments.length})
          </button>
          <button
            className={`btn ${activeTab === 'pending' ? 'primary' : 'secondary'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Reviews ({pendingReviews.length})
          </button>
        </div>
      )}

      {activeTab === 'my' && (
        <Card>
          <div className="sectionHead">
            <div>
              <h3>My Assessment History</h3>
              <p className="muted">Record of your self, peer, and manager skill evaluations.</p>
            </div>
          </div>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Assessment Type</th>
                  <th>Evaluator</th>
                  <th>Assessed Level</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Comments</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {myAssessments.map((a) => (
                  <tr key={a.assessmentId}>
                    <td>
                      <b>{a.skillName}</b>
                    </td>
                    <td>{a.assessmentType}</td>
                    <td>{a.evaluatorName || 'Self'}</td>
                    <td>
                      <Badge tone="purple">{a.assessedProficiency}</Badge>
                    </td>
                    <td>{a.score != null ? `${a.score}/100` : '—'}</td>
                    <td>
                      <Badge
                        tone={
                          a.status === 'APPROVED'
                            ? 'green'
                            : a.status === 'REJECTED'
                            ? 'red'
                            : 'orange'
                        }
                      >
                        {a.status}
                      </Badge>
                    </td>
                    <td>
                      <small className="muted">{a.comments || a.reviewerComments || '—'}</small>
                    </td>
                    <td>
                      <small className="muted">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!myAssessments.length && <Empty text="No skill assessments submitted yet." />}
          </div>
        </Card>
      )}

      {activeTab === 'pending' && isManagerOrAdmin && (
        <Card>
          <div className="sectionHead">
            <div>
              <h3>Pending Assessment Reviews</h3>
              <p className="muted">
                Review submitted assessments. Approving an assessment automatically updates the employee's skill profile and reduces their knowledge gaps.
              </p>
            </div>
          </div>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Skill</th>
                  <th>Type</th>
                  <th>Target Level</th>
                  <th>Score</th>
                  <th>Submission Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingReviews.map((a) => (
                  <tr key={a.assessmentId}>
                    <td>
                      <b>{a.employeeName}</b>
                      <br />
                      <small className="muted">{a.employeeCode}</small>
                    </td>
                    <td>{a.employeeDepartment || 'IT'}</td>
                    <td>{a.skillName}</td>
                    <td>{a.assessmentType}</td>
                    <td>
                      <Badge tone="purple">{a.assessedProficiency}</Badge>
                    </td>
                    <td>{a.score != null ? `${a.score}/100` : '—'}</td>
                    <td>
                      <small className="muted">{a.comments || 'No comments provided'}</small>
                    </td>
                    <td>
                      <Button onClick={() => openReview(a)} style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!pendingReviews.length && <Empty text="No pending assessment reviews awaiting approval." />}
          </div>
        </Card>
      )}

      {/* Submit Assessment Modal */}
      <Modal open={showSubmitModal} title="Submit Skill Assessment" onClose={() => setShowSubmitModal(false)}>
        <form onSubmit={handleSubmit}>
          <div className="formGridAuth">
            <SelectField
              label="Assessment Type *"
              value={form.assessmentType}
              onChange={(e) => handleAssessmentTypeChange(e.target.value)}
            >
              <option value="SELF">Self Assessment</option>
              {isManagerOrAdmin && <option value="MANAGER">Manager Assessment</option>}
              <option value="PEER">Peer 360 Assessment</option>
            </SelectField>

            {/* Peer 360: load from dedicated peer-targets endpoint (available to all roles) */}
            {form.assessmentType === 'PEER' && (
              <div className="field">
                <span>Target Employee *</span>
                {peerTargetsLoading ? (
                  <div style={{ padding: '10px 0', color: 'var(--muted)' }}>Loading eligible peers…</div>
                ) : peerTargetsError ? (
                  <div style={{ padding: '8px 0', color: 'var(--danger, #d32f2f)', fontSize: '0.88rem' }}>
                    {peerTargetsError}
                  </div>
                ) : peerTargets.length === 0 ? (
                  <div style={{ padding: '10px 0', color: 'var(--muted)', fontSize: '0.88rem' }}>
                    No eligible peers available for Peer 360 assessment.
                  </div>
                ) : (
                  <select
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      background: '#f5f5f8',
                      padding: '10px 14px',
                      font: 'inherit',
                      color: 'var(--text)',
                    }}
                  >
                    <option value="">Select Peer</option>
                    {peerTargets.map((emp) => (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.employeeName} ({emp.employeeCode})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Manager Assessment: use team employees list (manager/HR/admin only) */}
            {form.assessmentType === 'MANAGER' && (
              <SelectField
                label="Target Employee *"
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.employeeName || emp.firstName + ' ' + emp.lastName} ({emp.employeeCode || emp.jobRole})
                  </option>
                ))}
              </SelectField>
            )}
          </div>

          <div className="formGridAuth">
            <SelectField
              label="Skill *"
              value={form.skillId}
              onChange={(e) => handleSkillChange(e.target.value)}
              required
            >
              <option value="">Select Skill to Validate</option>
              {skills.map((s) => (
                <option key={s.skillId} value={s.skillId}>
                  {s.skillName} ({s.skillCategory || 'TECHNICAL'})
                </option>
              ))}
            </SelectField>

            {form.assessmentType !== 'SELF' && (
              <SelectField
                label="Assessed Proficiency Level *"
                value={form.assessedProficiency}
                onChange={(e) => setForm({ ...form, assessedProficiency: e.target.value })}
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
                <option value="EXPERT">EXPERT</option>
              </SelectField>
            )}
          </div>

          {/* Interactive 25-Question Skill Validation Quiz for SELF Assessment */}
          {form.assessmentType === 'SELF' && form.skillId && (
            <div style={{ background: '#fcfbfe', border: '1px solid #e5deef', borderRadius: 12, padding: 18, marginBottom: 16 }}>
              {quizLoading ? (
                <Loading />
              ) : quizDTO && quizDTO.questions && quizDTO.questions.length > 0 ? (
                <div>
                  {/* Quiz Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <b style={{ color: '#4331bf', fontSize: '0.95rem' }}>{quizDTO.skillName} Knowledge Quiz</b>
                      <span style={{ marginLeft: 8, fontSize: '0.8rem', color: '#666' }}>
                        Question {currentQIndex + 1} of {quizDTO.questions.length}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <Badge tone={quizDTO.questions[currentQIndex]?.difficulty === 'ADVANCED' ? 'red' : quizDTO.questions[currentQIndex]?.difficulty === 'INTERMEDIATE' ? 'orange' : 'green'}>
                        {quizDTO.questions[currentQIndex]?.difficulty || 'BEGINNER'}
                      </Badge>
                      <Badge tone="purple">
                        {Object.keys(quizAnswers).length} / {quizDTO.questions.length} Answered
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: 6, background: '#e9e4f5', borderRadius: 3, marginBottom: 14, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${(Object.keys(quizAnswers).length / quizDTO.questions.length) * 100}%`,
                        height: '100%',
                        background: '#5847d6',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>

                  {/* Current Question */}
                  {(() => {
                    const currentQ = quizDTO.questions[currentQIndex];
                    if (!currentQ) return null;

                    return (
                      <div style={{ background: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 14 }}>
                        <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '0.92rem', color: '#1e1650' }}>
                          Q{currentQIndex + 1}: {currentQ.question}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {currentQ.options.map((opt: string, optIdx: number) => (
                            <label
                              key={optIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                fontSize: '0.86rem',
                                cursor: 'pointer',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: quizAnswers[currentQ.id] === optIdx ? '1.5px solid #5847d6' : '1px solid var(--border)',
                                background: quizAnswers[currentQ.id] === optIdx ? '#f4f2ff' : '#fafafd',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <input
                                type="radio"
                                name={`q_${currentQ.id}`}
                                checked={quizAnswers[currentQ.id] === optIdx}
                                onChange={() => handleOptionSelect(currentQ.id, optIdx)}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Question Quick-Jump Grid Navigator */}
                  <div style={{ marginBottom: 14 }}>
                    <small className="muted" style={{ display: 'block', marginBottom: 6 }}>
                      Question Navigator (Click number to jump):
                    </small>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {quizDTO.questions.map((q: any, idx: number) => {
                        const answered = quizAnswers[q.id] !== undefined;
                        const isCurrent = idx === currentQIndex;
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setCurrentQIndex(idx)}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              border: isCurrent ? '2px solid #4331bf' : '1px solid var(--border)',
                              background: answered ? '#078b67' : '#f0eef7',
                              color: answered ? '#ffffff' : '#333',
                              fontSize: '0.75rem',
                              fontWeight: isCurrent ? 700 : 500,
                              cursor: 'pointer',
                            }}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prev / Next Navigation Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={currentQIndex === 0}
                      onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                    >
                      ← Previous Question
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={currentQIndex >= quizDTO.questions.length - 1}
                      onClick={() => setCurrentQIndex((prev) => Math.min(quizDTO.questions.length - 1, prev + 1))}
                    >
                      Next Question →
                    </Button>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#999', margin: 0 }}>Select a skill above to load the 25-question validation quiz.</p>
              )}
            </div>
          )}

          {form.assessmentType !== 'SELF' && (
            <Field
              label="Evaluation Score (1 - 100)"
              type="number"
              min="1"
              max="100"
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
            />
          )}

          <div className="field">
            <span>Justification / Project Evidence *</span>
            <textarea
              rows={3}
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              placeholder="Detail practical project experience, courses completed, or demonstration of proficiency..."
              required
              style={{
                width: '100%',
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: '#f5f5f8',
                padding: '10px 14px',
                font: 'inherit',
                color: 'var(--text)',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
            <Button type="button" variant="secondary" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit Assessment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Decision Modal */}
      <Modal open={reviewModalOpen} title="Review Assessment" onClose={() => setReviewModalOpen(false)}>
        {selectedAssessment && (
          <div>
            <div style={{ background: '#f8f7fc', padding: 14, borderRadius: 12, marginBottom: 16 }}>
              <p style={{ margin: '0 0 6px' }}>
                <b>Employee:</b> {selectedAssessment.employeeName} ({selectedAssessment.employeeCode})
              </p>
              <p style={{ margin: '0 0 6px' }}>
                <b>Skill:</b> {selectedAssessment.skillName} | <b>Proposed Level:</b>{' '}
                <Badge tone="purple">{selectedAssessment.assessedProficiency}</Badge>
              </p>
              <p style={{ margin: '0 0 6px' }}>
                <b>Submission Comments:</b> {selectedAssessment.comments || 'None'}
              </p>
            </div>

            <SelectField
              label="Confirmed Proficiency Level"
              value={overrideProficiency}
              onChange={(e) => setOverrideProficiency(e.target.value)}
            >
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
              <option value="EXPERT">EXPERT</option>
            </SelectField>

            <Field
              label="Reviewer Comments"
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder="Add feedback or approval notes..."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
              <Button
                type="button"
                variant="danger"
                disabled={busy}
                onClick={() => handleReviewDecision('REJECTED')}
              >
                <XCircle size={15} style={{ marginRight: 6 }} /> Reject
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={busy}
                onClick={() => handleReviewDecision('APPROVED')}
              >
                <CheckCircle2 size={15} style={{ marginRight: 6 }} /> Approve & Update Skills
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
