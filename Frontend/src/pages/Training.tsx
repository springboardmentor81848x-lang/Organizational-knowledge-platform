import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { get, post, del, endpoints, getApiErrorMessage } from '../api';
import { Badge, Button, Card, Empty, ErrorBox, Field, Loading, Modal, SelectField } from '../components/ui';

export default function Training({ admin = false }: { admin?: boolean }) {
  const [rows, setRows] = useState<any[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const [form, setForm] = useState<any>({
    trainingName: '',
    provider: '',
    duration: '',
    level: 'BEGINNER',
    courseUrl: '',
    description: '',
  });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [trainings, enrollments] = await Promise.all([
        get(admin ? endpoints.adminTrainings : endpoints.trainings),
        get(`${endpoints.enrollments}/my`).catch(() => []),
      ]);
      setRows(trainings || []);
      setMyEnrollments(enrollments || []);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Unable to load trainings.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [admin]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.trainingName.trim() || !form.provider.trim()) {
      setError('Training name and provider are required.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await post(admin ? endpoints.adminTrainings : endpoints.trainings, form);
      setForm({
        trainingName: '',
        provider: '',
        duration: '',
        level: 'BEGINNER',
        courseUrl: '',
        description: '',
      });
      setShowAddModal(false);
      setSuccess('Training created successfully.');
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Save failed.'));
    } finally {
      setBusy(false);
    }
  }

  async function enroll(trainingId: number, trainingName: string) {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await post(endpoints.enrollments, { trainingId });
      setSuccess(`Enrolled in "${trainingName}"! Track your progress in My Learning.`);
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Enrollment failed.'));
    } finally {
      setBusy(false);
    }
  }

  async function deleteTraining(trainingId: number) {
    if (!window.confirm('Are you sure you want to delete this training course?')) return;
    try {
      await del(`${endpoints.adminTrainings}/${trainingId}`);
      setSuccess('Training deleted successfully.');
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Delete failed.'));
    }
  }

  const enrolledTrainingIds = new Set(myEnrollments.map((e) => e.trainingId));

  const filtered = rows.filter((t) => {
    const matchesSearch =
      !search ||
      t.trainingName?.toLowerCase().includes(search.toLowerCase()) ||
      t.provider?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());

    const matchesLevel = !levelFilter || t.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  if (loading) return <Loading />;

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">{admin ? 'Admin Control Center' : 'Curated Learning Path'}</p>
          <h2>{admin ? 'Training Management' : 'Training Catalogue & Courses'}</h2>
          <p className="muted">
            {admin
              ? 'Create, manage, and map organization learning courses to skill gaps.'
              : 'Browse structured training offerings to close your knowledge gaps and earn proficiencies.'}
          </p>
        </div>
        {admin && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={16} style={{ marginRight: 6 }} /> Add Course
          </Button>
        )}
      </div>

      {error && <ErrorBox message={error} />}
      {success && <div className="successBox">{success}</div>}

      <Card className="mb-4">
        <div className="formGrid" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <div className="field">
            <span>Search catalogue</span>
            <input
              type="text"
              placeholder="Search by course name, provider, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <SelectField
            label="Filter by Level"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </SelectField>
        </div>
      </Card>

      <div className="cardGrid">
        {filtered.map((x: any) => {
          const isEnrolled = enrolledTrainingIds.has(x.trainingId);
          return (
            <Card key={x.trainingId} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Badge
                  tone={
                    x.level === 'ADVANCED'
                      ? 'red'
                      : x.level === 'INTERMEDIATE'
                      ? 'orange'
                      : 'purple'
                  }
                >
                  {x.level}
                </Badge>
                {isEnrolled && (
                  <Badge tone="green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={12} /> Enrolled
                  </Badge>
                )}
              </div>

              <h3 style={{ fontSize: '1.15rem', marginBottom: 6, lineHeight: 1.3 }}>{x.trainingName}</h3>
              <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 10 }}>
                {x.provider} · {x.duration || 'Flexible'}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#4e485e', marginBottom: 16, flex: 1 }}>
                {x.description || 'Comprehensive training module designed for enterprise skill growth.'}
              </p>

              <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                {x.courseUrl && (
                  <a
                    className="btn secondary"
                    href={x.courseUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ flex: 1, textAlign: 'center', padding: '8px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                  >
                    View Course ↗ <ExternalLink size={13} />
                  </a>
                )}

                {!admin && (
                  <Button
                    variant={isEnrolled ? 'secondary' : 'primary'}
                    disabled={isEnrolled || busy}
                    onClick={() => enroll(x.trainingId, x.trainingName)}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                  >
                    {isEnrolled ? 'Enrolled' : 'Enroll Now'}
                  </Button>
                )}

                {admin && (
                  <button
                    className="iconBtn"
                    title="Delete training"
                    onClick={() => deleteTraining(x.trainingId)}
                    style={{ color: '#bc2948', borderColor: '#f3c7d1' }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {!filtered.length && <Empty text="No training courses match your search criteria." />}

      {/* Admin Add Training Modal */}
      {admin && (
        <Modal open={showAddModal} title="Create Training Offering" onClose={() => setShowAddModal(false)}>
          <form onSubmit={save}>
            <Field
              label="Training Name *"
              value={form.trainingName}
              onChange={(e) => setForm({ ...form, trainingName: e.target.value })}
              placeholder="e.g. Spring Boot Microservices in Depth"
              required
            />

            <div className="formGridAuth">
              <Field
                label="Provider / Instructor *"
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                placeholder="e.g. Spring Academy"
                required
              />
              <Field
                label="Duration"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 6 Weeks"
              />
            </div>

            <div className="formGridAuth">
              <SelectField
                label="Proficiency Level"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </SelectField>

              <Field
                label="Course URL"
                type="url"
                value={form.courseUrl}
                onChange={(e) => setForm({ ...form, courseUrl: e.target.value })}
                placeholder="https://learn.example.com/course"
              />
            </div>

            <div className="field">
              <span>Course Description</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Summary of topics covered, prerequisites, and learning objectives..."
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
              <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving…' : 'Create Course'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
