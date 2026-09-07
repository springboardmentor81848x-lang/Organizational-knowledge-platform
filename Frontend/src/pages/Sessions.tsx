import { useEffect, useState } from 'react';
import { BookOpen, Calendar, Clock, ExternalLink, MapPin, Plus, User, Users } from 'lucide-react';
import { get, post, put, del, endpoints, getApiErrorMessage } from '../api';
import { currentRole } from '../auth';
import { Badge, Button, Card, Empty, ErrorBox, Field, Loading, Modal } from '../components/ui';

export default function Sessions() {
  const role = currentRole();
  const isHostOrAdmin = role === 'ADMIN' || role === 'HR' || role === 'MANAGER';

  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [rosterSession, setRosterSession] = useState<any>(null);
  const [rosterList, setRosterList] = useState<any[]>([]);

  const [form, setForm] = useState<any>({
    title: '',
    description: '',
    sessionDate: '',
    durationMinutes: 60,
    meetingLink: '',
    location: 'Virtual (Google Meet)',
    maxParticipants: 50,
  });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [upList, myRegs] = await Promise.all([
        get(`${endpoints.sessions}/upcoming`).catch(() => []),
        get(`${endpoints.sessions}/my-registrations`).catch(() => []),
      ]);
      setUpcoming(upList || []);
      setMyRegistrations(myRegs || []);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Knowledge sessions could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.sessionDate) {
      setError('Title and Session Date & Time are required.');
      return;
    }

    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await post(endpoints.sessions, {
        ...form,
        durationMinutes: Number(form.durationMinutes || 60),
        maxParticipants: Number(form.maxParticipants || 50),
        sessionDate: new Date(form.sessionDate).toISOString(),
      });
      setSuccess(`Knowledge Session "${form.title}" hosted successfully!`);
      setShowCreateModal(false);
      setForm({
        title: '',
        description: '',
        sessionDate: '',
        durationMinutes: 60,
        meetingLink: '',
        location: 'Virtual (Google Meet)',
        maxParticipants: 50,
      });
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Session creation failed.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(sessionId: number, title: string) {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await post(`${endpoints.sessions}/${sessionId}/register`);
      setSuccess(`Registered for "${title}"! View session link in your registrations.`);
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Registration failed.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleCancelRegistration(sessionId: number) {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await del(`${endpoints.sessions}/${sessionId}/register`);
      setSuccess('Session registration cancelled.');
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Cancellation failed.'));
    } finally {
      setBusy(false);
    }
  }

  async function openRoster(session: any) {
    setRosterSession(session);
    setError('');
    try {
      const list = await get(`${endpoints.sessions}/${session.sessionId}/registrations`);
      setRosterList(list || []);
      setShowRosterModal(true);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Failed to load attendee roster.'));
    }
  }

  async function toggleAttendance(registrationId: number, currentStatus: string) {
    if (!rosterSession) return;
    const newStatus = currentStatus === 'ATTENDED' ? 'REGISTERED' : 'ATTENDED';
    try {
      await put(`${endpoints.sessions}/${rosterSession.sessionId}/registrations/${registrationId}/attendance?status=${newStatus}`, {});
      const list = await get(`${endpoints.sessions}/${rosterSession.sessionId}/registrations`);
      setRosterList(list || []);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Failed to update attendance status.'));
    }
  }

  if (loading) return <Loading />;

  const registeredSessionIds = new Set(myRegistrations.map((r) => r.sessionId || r.session?.sessionId));

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">Organization Technical Exchange</p>
          <h2>Live Knowledge Sessions & Tech Talks</h2>
          <p className="muted">
            Attend live interactive webinars, technical deep dives, and architecture sharing sessions hosted by internal subject matter experts.
          </p>
        </div>
        {isHostOrAdmin && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={16} style={{ marginRight: 6 }} /> Host Tech Session
          </Button>
        )}
      </div>

      {error && <ErrorBox message={error} />}
      {success && <div className="successBox">{success}</div>}

      <Card className="mb-4">
        <div className="sectionHead">
          <div>
            <h3>Upcoming Sessions & Webinars</h3>
            <p className="muted">{upcoming.length} session(s) scheduled across the organization.</p>
          </div>
        </div>

        <div className="cardGrid">
          {upcoming.map((x) => {
            const isRegistered = registeredSessionIds.has(x.sessionId);
            return (
              <Card key={x.sessionId} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Badge tone="purple">{x.skillName || 'Technical'}</Badge>
                  <Badge tone={x.status === 'UPCOMING' ? 'orange' : 'green'}>{x.status}</Badge>
                </div>

                <h3 style={{ fontSize: '1.15rem', marginBottom: 6, lineHeight: 1.3 }}>{x.title}</h3>
                <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
                  {x.description || 'Deep dive technical knowledge sharing session.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: '#555', marginBottom: 16 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} /> {new Date(x.sessionDate).toLocaleString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} /> {x.durationMinutes} Minutes
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={14} /> Speaker: <b>{x.speakerName || 'Internal Expert'}</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} /> {x.location || 'Virtual'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  {x.meetingLink && isRegistered && (
                    <a
                      className="btn secondary"
                      href={x.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ flex: 1, textAlign: 'center', padding: '8px 10px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                    >
                      Join Meeting <ExternalLink size={12} />
                    </a>
                  )}

                  <Button
                    variant={isRegistered ? 'secondary' : 'primary'}
                    disabled={busy}
                    onClick={() => (isRegistered ? handleCancelRegistration(x.sessionId) : handleRegister(x.sessionId, x.title))}
                    style={{ flex: 1, padding: '8px 10px', fontSize: '0.82rem' }}
                  >
                    {isRegistered ? 'Cancel RSVP' : 'Register / RSVP'}
                  </Button>

                  {isHostOrAdmin && (
                    <Button
                      variant="secondary"
                      onClick={() => openRoster(x)}
                      style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                    >
                      <Users size={14} /> Roster
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
        {!upcoming.length && <Empty text="No upcoming knowledge sessions currently scheduled." />}
      </Card>

      {/* Communities of Practice Section */}
      <Card className="mb-4">
        <div className="sectionHead">
          <div>
            <h3>Communities of Practice (CoP)</h3>
            <p className="muted">Domain-specific knowledge exchange channels and interest groups.</p>
          </div>
        </div>

        <div className="cardGrid">
          <Card style={{ background: '#fcfbfe', border: '1px solid #e5deef' }}>
            <Badge tone="purple">148 Members</Badge>
            <h4 style={{ margin: '10px 0 4px', fontSize: '1.1rem' }}>Java & Spring Boot Architecture CoP</h4>
            <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
              Best practices, design patterns, reactive microservices, and performance tuning.
            </p>
            <Badge tone="green">Active Weekly Standup</Badge>
          </Card>

          <Card style={{ background: '#fcfbfe', border: '1px solid #e5deef' }}>
            <Badge tone="purple">112 Members</Badge>
            <h4 style={{ margin: '10px 0 4px', fontSize: '1.1rem' }}>Cloud, DevOps & Kubernetes CoP</h4>
            <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
              Docker containerization, CI/CD pipelines, AWS/GCP infrastructure as code.
            </p>
            <Badge tone="orange">Bi-weekly Tech Talks</Badge>
          </Card>

          <Card style={{ background: '#fcfbfe', border: '1px solid #e5deef' }}>
            <Badge tone="purple">96 Members</Badge>
            <h4 style={{ margin: '10px 0 4px', fontSize: '1.1rem' }}>AI, ML & Enterprise Intelligence CoP</h4>
            <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
              LLM integrations, machine learning models, analytics pipelines, and data governance.
            </p>
            <Badge tone="green">Active Hackathon Group</Badge>
          </Card>

          <Card style={{ background: '#fcfbfe', border: '1px solid #e5deef' }}>
            <Badge tone="purple">84 Members</Badge>
            <h4 style={{ margin: '10px 0 4px', fontSize: '1.1rem' }}>Frontend Engineering & React 19 CoP</h4>
            <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
              TypeScript UI component design systems, state management, and modern Web APIs.
            </p>
            <Badge tone="orange">Monthly Showcase</Badge>
          </Card>
        </div>
      </Card>

      {/* Host Session Modal */}
      {isHostOrAdmin && (
        <Modal open={showCreateModal} title="Host Knowledge Session" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateSession}>
            <Field
              label="Session Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Masterclass: Spring Security & Microservices In Depth"
              required
            />

            <div className="formGridAuth">
              <Field
                label="Date & Time *"
                type="datetime-local"
                value={form.sessionDate}
                onChange={(e) => setForm({ ...form, sessionDate: e.target.value })}
                required
              />
              <Field
                label="Duration (Minutes) *"
                type="number"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                required
              />
            </div>

            <div className="formGridAuth">
              <Field
                label="Meeting Link / Virtual Room *"
                type="url"
                value={form.meetingLink}
                onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/..."
                required
                />
              <Field
                label="Max Participants"
                type="number"
                value={form.maxParticipants}
                onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
              />
            </div>

            <div className="field">
              <span>Session Agenda / Outline</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Outline what attendees will learn in this session..."
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
              <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Publishing…' : 'Schedule Session'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Attendance Roster Modal */}
      <Modal open={showRosterModal} title={`Attendance Roster: ${rosterSession?.title || 'Session'}`} onClose={() => setShowRosterModal(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rosterList.map((r) => (
            <div
              key={r.registrationId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: '#fcfbfe',
              }}
            >
              <div>
                <b>{r.employeeName}</b>
                <p className="muted" style={{ margin: '2px 0 0', fontSize: '0.8rem' }}>
                  Registered {new Date(r.registeredAt).toLocaleDateString()}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Badge tone={r.attendanceStatus === 'ATTENDED' ? 'green' : 'orange'}>
                  {r.attendanceStatus}
                </Badge>
                <Button
                  variant="secondary"
                  onClick={() => toggleAttendance(r.registrationId, r.attendanceStatus)}
                  style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                >
                  Toggle Attendance
                </Button>
              </div>
            </div>
          ))}

          {!rosterList.length && <Empty text="No employees have registered for this session yet." />}
        </div>
      </Modal>
    </>
  );
}
