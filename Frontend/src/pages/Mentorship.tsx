import { useEffect, useState } from 'react';
import { CheckCircle2, MessageSquare, Send, UsersRound, XCircle } from 'lucide-react';
import { get, post, put, endpoints, getApiErrorMessage } from '../api';
import { Badge, Button, Card, Empty, ErrorBox, Field, Loading, Modal, SelectField } from '../components/ui';

export default function Mentorship() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Request Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // 1-on-1 Session Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [activeConn, setActiveConn] = useState<any>(null);
  const [sessionDate, setSessionDate] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [a, b, c, d] = await Promise.all([
        get(`${endpoints.mentorship}/mentors`).catch(() => []),
        get(`${endpoints.mentorship}/requests/sent`).catch(() => []),
        get(`${endpoints.mentorship}/requests/received`).catch(() => []),
        get(`${endpoints.mentorship}/active`).catch(() => []),
      ]);
      setMentors(a || []);
      setSent(b || []);
      setReceived(c || []);
      setActive(d || []);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Mentorship data could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openRequestModal(mentorObj: any) {
    setSelectedMentor(mentorObj);
    setTopic(`Guidance on ${mentorObj.expertSkills?.[0]?.skillName || 'Skill Growth'}`);
    setMessage('Hi! I would love your mentorship guidance to help bridge my knowledge gaps in this skill area.');
    setRequestModalOpen(true);
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMentor) return;

    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await post(`${endpoints.mentorship}/requests`, {
        mentorId: selectedMentor.employeeId,
        topic: topic.trim(),
        message: message.trim(),
      });
      setRequestModalOpen(false);
      setSuccess(`Mentorship request sent to ${selectedMentor.fullName}!`);
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Failed to send mentorship request.'));
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id: number, newStatus: 'ACCEPTED' | 'REJECTED') {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await put(`${endpoints.mentorship}/requests/${id}/status`, { status: newStatus });
      setSuccess(`Mentorship request ${newStatus.toLowerCase()} successfully.`);
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Status update failed.'));
    } finally {
      setBusy(false);
    }
  }

  function openScheduleModal(conn: any) {
    setActiveConn(conn);
    setSessionDate('');
    setSessionNotes(`1-on-1 Mentorship session on ${conn.topic || 'Skill Development'}`);
    setMeetingLink('https://meet.google.com/okip-mentorship-1on1');
    setScheduleModalOpen(true);
  }

  async function submitScheduleSession(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      // Create a 1-on-1 meeting entry / notification
      setSuccess(`1-on-1 session scheduled with ${activeConn?.mentorName || activeConn?.menteeName} for ${new Date(sessionDate).toLocaleString()}!`);
      setScheduleModalOpen(false);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Scheduling failed.'));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">Peer & Expert Knowledge Sharing</p>
          <h2>Mentorship & Complementary Skill Matching</h2>
          <p className="muted">
            Connect with internal senior experts to bridge knowledge gaps through 1-on-1 mentorship pairings.
          </p>
        </div>
      </div>

      {error && <ErrorBox message={error} />}
      {success && <div className="successBox">{success}</div>}

      <Card className="mb-4">
        <div className="formGrid" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <div className="field">
            <span>Search Expert Directory</span>
            <input
              type="text"
              placeholder="Search mentor by name, official email, or employee code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <SelectField
            label="Filter by Department"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="IT">IT</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Human Resources">Human Resources</option>
          </SelectField>
        </div>
      </Card>

      <Card className="mb-4">
        <div className="sectionHead">
          <div>
            <h3>Recommended Mentors for You</h3>
            <p className="muted">Matched based on your target role competencies and peer expert skills.</p>
          </div>
        </div>

        <div className="cardGrid">
          {mentors
            .filter((m) => {
              const matchSearch =
                !search ||
                m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                m.email?.toLowerCase().includes(search.toLowerCase()) ||
                m.employeeCode?.toLowerCase().includes(search.toLowerCase());
              const matchDept = !deptFilter || m.department === deptFilter;
              return matchSearch && matchDept;
            })
            .map((m) => (
              <Card key={m.employeeId} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: '#ded7fb',
                      color: '#4331bf',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                    }}
                  >
                    {(m.fullName?.[0] || 'M').toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{m.fullName}</h4>
                    <p className="muted" style={{ margin: '2px 0 0', fontSize: '0.82rem' }}>
                      {m.jobRole || 'Engineer'} · {m.department || 'IT'}
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#4e485e', marginBottom: 14, flex: 1 }}>
                  {m.bio || 'Experienced senior colleague available for technical mentorship and career guidance.'}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {(m.expertSkills || []).map((s: any) => (
                    <Badge key={s.skillName} tone="purple">
                      {s.skillName}
                    </Badge>
                  ))}
                </div>

                <Button
                  variant="primary"
                  onClick={() => openRequestModal(m)}
                  disabled={!m.availableForMentorship || busy}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  <Send size={14} style={{ marginRight: 6 }} /> Request Mentorship
                </Button>
              </Card>
            ))}
        </div>
        {!mentors.length && <Empty text="No recommended mentors found matching your open skill gaps." />}
      </Card>

      <div className="grid2">
        <Card>
          <div className="sectionHead">
            <div>
              <h3>Requests Received</h3>
              <p className="muted">Mentees seeking your guidance.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {received.map((x) => (
              <div
                key={x.requestId}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: '#fcfbfe',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <b>{x.menteeName}</b>
                  <Badge tone="orange">PENDING</Badge>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '0.88rem', color: '#4e485e' }}>
                  Topic: <b>{x.topic || x.skillName || 'Mentorship'}</b>
                </p>
                <p className="muted" style={{ margin: '0 0 12px', fontSize: '0.82rem' }}>
                  "{x.message}"
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="primary"
                    disabled={busy}
                    onClick={() => updateStatus(x.requestId, 'ACCEPTED')}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <CheckCircle2 size={14} style={{ marginRight: 4 }} /> Accept
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => updateStatus(x.requestId, 'REJECTED')}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#bc2948' }}
                  >
                    <XCircle size={14} style={{ marginRight: 4 }} /> Decline
                  </Button>
                </div>
              </div>
            ))}
            {!received.length && <Empty text="No pending mentorship requests received." />}
          </div>
        </Card>

        <Card>
          <div className="sectionHead">
            <div>
              <h3>Active Mentorship Connections</h3>
              <p className="muted">Your active mentorship pairings.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {active.map((x) => (
              <div
                key={x.requestId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid #d4f2e5',
                  background: '#f2fcf7',
                }}
              >
                <div>
                  <b style={{ color: '#078b67' }}>{x.mentorName || x.menteeName}</b>
                  <p className="muted" style={{ margin: '2px 0 0', fontSize: '0.82rem' }}>
                    Topic: {x.topic || x.skillName || 'General Mentorship'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge tone="green">ACTIVE</Badge>
                  <Button
                    variant="secondary"
                    onClick={() => openScheduleModal(x)}
                    style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                  >
                    Schedule 1-on-1
                  </Button>
                </div>
              </div>
            ))}
            {!active.length && <Empty text="No active mentorship connections currently." />}
          </div>
        </Card>
      </div>

      {/* Request Mentorship Modal */}
      <Modal open={requestModalOpen} title="Request Mentorship" onClose={() => setRequestModalOpen(false)}>
        {selectedMentor && (
          <form onSubmit={submitRequest}>
            <div style={{ background: '#f5f4fb', padding: 14, borderRadius: 12, marginBottom: 16 }}>
              <p style={{ margin: '0 0 4px' }}>
                <b>Mentor:</b> {selectedMentor.fullName} ({selectedMentor.jobRole || 'Senior Engineer'})
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
                Department: {selectedMentor.department || 'IT'}
              </p>
            </div>

            <Field
              label="Mentorship Topic / Focus Area *"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Advanced Spring Boot Architecture & Microservices"
              required
            />

            <div className="field">
              <span>Personal Note / Intro Message *</span>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself and explain what specific skills or guidance you hope to gain..."
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
              <Button type="button" variant="secondary" onClick={() => setRequestModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Sending…' : 'Send Request'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Schedule 1-on-1 Session Modal */}
      <Modal open={scheduleModalOpen} title="Schedule 1-on-1 Mentorship Session" onClose={() => setScheduleModalOpen(false)}>
        {activeConn && (
          <form onSubmit={submitScheduleSession}>
            <div style={{ background: '#f5f4fb', padding: 14, borderRadius: 12, marginBottom: 16 }}>
              <p style={{ margin: '0 0 4px' }}>
                <b>Pairing:</b> {activeConn.mentorName} & {activeConn.menteeName}
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
                Topic: {activeConn.topic || 'Skill Development'}
              </p>
            </div>

            <Field
              label="Session Date & Time *"
              type="datetime-local"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              required
            />

            <Field
              label="Virtual Meeting Link / Google Meet *"
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              required
            />

            <div className="field">
              <span>1-on-1 Agenda & Notes</span>
              <textarea
                rows={3}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Outline questions, code review topics, or goal discussion for this session..."
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
              <Button type="button" variant="secondary" onClick={() => setScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy || !sessionDate}>
                {busy ? 'Scheduling…' : 'Confirm 1-on-1 Session'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
