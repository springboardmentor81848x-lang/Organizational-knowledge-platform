import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardCheck, Clock, Plus, ShieldCheck, XCircle } from 'lucide-react';
import { get, post, put, endpoints, getApiErrorMessage } from '../api';
import { currentRole } from '../auth';
import { Badge, Button, Card, Empty, ErrorBox, Field, Loading, Modal, SelectField, Stat } from '../components/ui';

export default function Assessments() {
  const role = currentRole();
  const isManagerOrAdmin = role === 'MANAGER' || role === 'HR' || role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'my' | 'pending'>('my');
  const [myAssessments, setMyAssessments] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
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

  const [form, setForm] = useState({
    employeeId: '',
    skillId: '',
    assessmentType: 'SELF',
    assessedProficiency: 'INTERMEDIATE',
    score: '85',
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.skillId) {
      setError('Please select a skill to assess.');
      return;
    }

    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const payload: any = {
        skillId: Number(form.skillId),
        assessmentType: form.assessmentType,
        assessedProficiency: form.assessedProficiency,
        score: form.score ? Number(form.score) : 80,
        comments: form.comments.trim(),
      };

      if (form.employeeId && form.assessmentType !== 'SELF') {
        payload.employeeId = Number(form.employeeId);
      }

      const res = await post(endpoints.assessments, payload);
      setShowSubmitModal(false);
      setForm({
        employeeId: '',
        skillId: '',
        assessmentType: 'SELF',
        assessedProficiency: 'INTERMEDIATE',
        score: '85',
        comments: '',
      });
      setSuccess(
        res.status === 'APPROVED'
          ? 'Assessment submitted and approved! Skill level and knowledge gaps have been updated.'
          : 'Assessment submitted successfully! Pending manager review.',
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
              onChange={(e) => setForm({ ...form, assessmentType: e.target.value })}
            >
              <option value="SELF">Self Assessment</option>
              {isManagerOrAdmin && <option value="MANAGER">Manager Assessment</option>}
              <option value="PEER">Peer 360 Assessment</option>
            </SelectField>

            {form.assessmentType !== 'SELF' && (
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
              onChange={(e) => setForm({ ...form, skillId: e.target.value })}
              required
            >
              <option value="">Select Skill</option>
              {skills.map((s) => (
                <option key={s.skillId} value={s.skillId}>
                  {s.skillName}
                </option>
              ))}
            </SelectField>

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
          </div>

          <Field
            label="Evaluation Score (1 - 100)"
            type="number"
            min="1"
            max="100"
            value={form.score}
            onChange={(e) => setForm({ ...form, score: e.target.value })}
          />

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
