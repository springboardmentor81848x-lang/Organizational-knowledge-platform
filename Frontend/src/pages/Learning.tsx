import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Clock, ExternalLink, GraduationCap, Play, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { get, post, put, endpoints, getApiErrorMessage } from '../api';
import { Badge, Button, Card, Empty, ErrorBox, Loading, Stat } from '../components/ui';

export default function Learning() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [enrolled, courses] = await Promise.all([
        get(`${endpoints.enrollments}/my`),
        get(endpoints.trainings),
      ]);
      setEnrollments(enrolled || []);
      setCatalog(courses || []);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Unable to load learning data.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateProgress(enrollmentId: number, currentProgress: number, target: number) {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await put(`${endpoints.enrollments}/${enrollmentId}/progress`, { progress: target });
      setSuccess(
        target >= 100
          ? '🎉 Course 100% completed! Learning milestone achieved.'
          : `Progress updated to ${target}%.`,
      );
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Progress update failed.'));
    } finally {
      setBusy(false);
    }
  }

  async function quickEnroll(trainingId: number, name: string) {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await post(endpoints.enrollments, { trainingId });
      setSuccess(`Enrolled in "${name}". You can now track your learning progress!`);
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Enrollment failed.'));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading />;

  const completed = enrollments.filter((e) => e.status === 'COMPLETED' || e.progress >= 100);
  const inProgress = enrollments.filter((e) => e.status !== 'COMPLETED' && e.progress < 100);
  const enrolledIds = new Set(enrollments.map((e) => e.trainingId));
  const availableRecommendations = catalog.filter((c) => !enrolledIds.has(c.trainingId));

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">Personalized Learning Roadmap</p>
          <h2>My Learning & Course Progress</h2>
          <p className="muted">
            Track your ongoing courses, update completion milestones, and earn verifiable skill competencies.
          </p>
        </div>
        <Button onClick={() => navigate('/training')}>
          <BookOpen size={16} style={{ marginRight: 6 }} /> Browse Full Catalogue
        </Button>
      </div>

      {error && <ErrorBox message={error} />}
      {success && <div className="successBox">{success}</div>}

      <div className="statsGrid">
        <Stat label="Enrolled Courses" value={enrollments.length} icon={<GraduationCap size={20} />} />
        <Stat label="In Progress" value={inProgress.length} icon={<Play size={20} />} />
        <Stat label="Completed" value={completed.length} icon={<Trophy size={20} />} />
        <Stat label="Available Offerings" value={catalog.length} icon={<BookOpen size={20} />} />
      </div>

      <div className="grid2">
        <Card>
          <div className="sectionHead">
            <div>
              <h3>Active Enrollments</h3>
              <p className="muted">{inProgress.length} course(s) currently in progress.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {inProgress.map((x) => (
              <div
                key={x.enrollmentId}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  border: '1px solid var(--border)',
                  background: '#fcfbfe',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <b style={{ fontSize: '1.05rem' }}>{x.trainingName}</b>
                    <p className="muted" style={{ margin: '2px 0 0', fontSize: '0.82rem' }}>
                      {x.provider} · Started {x.startDate || x.enrollmentDate || 'Recently'}
                    </p>
                  </div>
                  <Badge tone="orange">{x.status || 'IN_PROGRESS'}</Badge>
                </div>

                <div style={{ margin: '14px 0 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                    <span className="muted">Overall Progress</span>
                    <b>{x.progress || 0}%</b>
                  </div>
                  <div style={{ width: '100%', height: 8, background: '#eeeaf4', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, x.progress || 0)}%`,
                        background: 'linear-gradient(90deg, #5847d6 0%, #7959ed 100%)',
                        borderRadius: 4,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                <div style={{ margin: '10px 0 14px', background: '#f8f7fc', padding: 10, borderRadius: 8, border: '1px solid #ebe7f7' }}>
                  <small className="muted" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Learning Milestones:
                  </small>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, fontSize: '0.75rem', textAlign: 'center' }}>
                    <div style={{ padding: 4, borderRadius: 6, background: (x.progress || 0) >= 25 ? '#d4f2e5' : '#eee', color: (x.progress || 0) >= 25 ? '#078b67' : '#777', fontWeight: (x.progress || 0) >= 25 ? 700 : 400 }}>
                      M1: Basics (25%)
                    </div>
                    <div style={{ padding: 4, borderRadius: 6, background: (x.progress || 0) >= 50 ? '#d4f2e5' : '#eee', color: (x.progress || 0) >= 50 ? '#078b67' : '#777', fontWeight: (x.progress || 0) >= 50 ? 700 : 400 }}>
                      M2: Core (50%)
                    </div>
                    <div style={{ padding: 4, borderRadius: 6, background: (x.progress || 0) >= 75 ? '#d4f2e5' : '#eee', color: (x.progress || 0) >= 75 ? '#078b67' : '#777', fontWeight: (x.progress || 0) >= 75 ? 700 : 400 }}>
                      M3: Applied (75%)
                    </div>
                    <div style={{ padding: 4, borderRadius: 6, background: (x.progress || 0) >= 100 ? '#d4f2e5' : '#eee', color: (x.progress || 0) >= 100 ? '#078b67' : '#777', fontWeight: (x.progress || 0) >= 100 ? 700 : 400 }}>
                      M4: Mastery (100%)
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
                  {x.courseUrl && (
                    <a
                      className="btn secondary"
                      href={x.courseUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      View Course ↗
                    </a>
                  )}
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => updateProgress(x.enrollmentId, x.progress, Math.min(100, (x.progress || 0) + 25))}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    +25% Progress
                  </Button>
                  <Button
                    variant="primary"
                    disabled={busy}
                    onClick={() => updateProgress(x.enrollmentId, x.progress, 100)}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Mark 100% Completed
                  </Button>
                </div>
              </div>
            ))}

            {!inProgress.length && <Empty text="No active courses in progress. Enroll in a course from the recommendations!" />}
          </div>
        </Card>

        <Card>
          <div className="sectionHead">
            <div>
              <h3>Completed Milestones</h3>
              <p className="muted">{completed.length} course(s) successfully finished.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {completed.map((x) => (
              <div
                key={x.enrollmentId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid #d4f2e5',
                  background: '#f2fcf7',
                }}
              >
                <div>
                  <b style={{ color: '#078b67' }}>{x.trainingName}</b>
                  <p className="muted" style={{ margin: '2px 0 0', fontSize: '0.8rem' }}>
                    {x.provider} · Completed {x.completionDate || '100% Finished'}
                  </p>
                </div>
                <Badge tone="green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} /> 100% Done
                </Badge>
              </div>
            ))}

            {!completed.length && <Empty text="No completed courses yet. Keep learning to achieve your first milestone!" />}
          </div>
        </Card>
      </div>

      <Card style={{ marginTop: 20 }}>
        <div className="sectionHead">
          <div>
            <h3>Recommended Courses for You</h3>
            <p className="muted">Expand your knowledge with courses mapped to priority organizational skills.</p>
          </div>
        </div>

        <div className="cardGrid">
          {availableRecommendations.slice(0, 6).map((x) => (
            <Card key={x.trainingId} style={{ display: 'flex', flexDirection: 'column' }}>
              <Badge tone="purple">{x.level}</Badge>
              <h4 style={{ fontSize: '1.05rem', margin: '8px 0 4px' }}>{x.trainingName}</h4>
              <p className="muted" style={{ fontSize: '0.82rem', margin: '0 0 10px' }}>
                {x.provider} · {x.duration}
              </p>
              <p style={{ fontSize: '0.88rem', color: '#4e485e', marginBottom: 14, flex: 1 }}>
                {x.description || 'Structured course to bridge technical knowledge gaps.'}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {x.courseUrl && (
                  <a
                    className="btn secondary"
                    href={x.courseUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ flex: 1, textAlign: 'center', padding: '8px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                  >
                    View Course ↗
                  </a>
                )}
                <Button
                  variant="primary"
                  disabled={busy}
                  onClick={() => quickEnroll(x.trainingId, x.trainingName)}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  Enroll in Course
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </>
  );
}
