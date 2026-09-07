import { useEffect, useState } from 'react';
import { Brain, Plus, Trash2 } from 'lucide-react';
import { get, post, del, endpoints, getApiErrorMessage } from '../api';
import { Badge, Button, Card, Empty, ErrorBox, Field, Loading, Modal, SelectField } from '../components/ui';

const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
const categories = [
  'PROGRAMMING_LANGUAGE',
  'FRAMEWORK',
  'DATABASE',
  'CLOUD',
  'DEVOPS',
  'TESTING',
  'AI_ML',
  'TOOL',
  'SOFT_SKILL',
];

export default function Skills({ admin = false }: { admin?: boolean }) {
  const [rows, setRows] = useState<any[]>([]);
  const [masters, setMasters] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    skillId: '',
    proficiencyLevel: 'INTERMEDIATE',
    yearsOfExperience: 1.0,
    skillName: '',
    skillCategory: 'FRAMEWORK',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const a = await get(admin ? endpoints.skillMaster : endpoints.skills);
      setRows(a || []);
      if (!admin) {
        const m = await get(endpoints.skillMaster);
        setMasters(m || []);
      }
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Unable to load skills.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [admin]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      if (admin) {
        if (!form.skillName?.trim()) {
          setError('Skill name is required.');
          setBusy(false);
          return;
        }
        await post(endpoints.skillMaster, {
          skillName: form.skillName.trim(),
          skillCategory: form.skillCategory || 'FRAMEWORK',
          description: form.description?.trim() || '',
        });
        setSuccess(`Skill "${form.skillName}" added to master taxonomy.`);
      } else {
        if (!form.skillId) {
          setError('Please select a skill.');
          setBusy(false);
          return;
        }
        await post(endpoints.skills, {
          skillId: Number(form.skillId),
          proficiencyLevel: form.proficiencyLevel,
          yearsOfExperience: Number(form.yearsOfExperience || 0),
        });
        setSuccess('Skill added to your inventory. Run gap analysis to update your readiness.');
      }
      setForm({
        skillId: '',
        proficiencyLevel: 'INTERMEDIATE',
        yearsOfExperience: 1.0,
        skillName: '',
        skillCategory: 'FRAMEWORK',
        description: '',
      });
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Save failed.'));
    } finally {
      setBusy(false);
    }
  }

  async function removeSkill(id: number) {
    if (!window.confirm('Are you sure you want to remove this skill?')) return;
    try {
      await del(`${admin ? endpoints.skillMaster : endpoints.skills}/${id}`);
      setSuccess('Skill removed successfully.');
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Failed to remove skill.'));
    }
  }

  if (loading) return <Loading />;

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">{admin ? 'Taxonomy Management' : 'Individual Competency'}</p>
          <h2>{admin ? 'Skill Master Taxonomy' : 'My Skill Inventory'}</h2>
          <p className="muted">
            {admin
              ? 'Define and organize the enterprise skill catalog across technical and soft competencies.'
              : 'Keep your skill proficiencies and years of experience accurate to calculate your role gap readiness.'}
          </p>
        </div>
      </div>

      {error && <ErrorBox message={error} />}
      {success && <div className="successBox">{success}</div>}

      <Card className="mb-4">
        <form onSubmit={save}>
          <div className="sectionHead">
            <div>
              <h3>{admin ? 'Add Master Skill' : 'Add Skill to Profile'}</h3>
              <p className="muted">{admin ? 'Register a new standard organizational competency.' : 'Record your current proficiency level.'}</p>
            </div>
            <Button type="submit" disabled={busy}>
              <Plus size={16} style={{ marginRight: 6 }} /> {busy ? 'Saving…' : admin ? 'Add Master Skill' : 'Add to Inventory'}
            </Button>
          </div>

          <div className="formGrid">
            {admin ? (
              <>
                <Field
                  label="Skill Name *"
                  value={form.skillName || ''}
                  onChange={(e) => setForm({ ...form, skillName: e.target.value })}
                  placeholder="e.g. Kotlin, Docker, GraphQL"
                  required
                />
                <SelectField
                  label="Category *"
                  value={form.skillCategory || 'FRAMEWORK'}
                  onChange={(e) => setForm({ ...form, skillCategory: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c.replace('_', ' ')}
                    </option>
                  ))}
                </SelectField>
                <Field
                  label="Description"
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of competency expectations"
                />
              </>
            ) : (
              <>
                <SelectField
                  label="Skill *"
                  value={form.skillId}
                  onChange={(e) => setForm({ ...form, skillId: e.target.value })}
                  required
                >
                  <option value="">Select skill from master catalog</option>
                  {masters.map((x: any) => (
                    <option key={x.skillId} value={x.skillId}>
                      {x.skillName} ({x.skillCategory})
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Proficiency Level *"
                  value={form.proficiencyLevel}
                  onChange={(e) => setForm({ ...form, proficiencyLevel: e.target.value })}
                >
                  {levels.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </SelectField>
                <Field
                  label="Years of Experience *"
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.yearsOfExperience}
                  onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })}
                  required
                />
              </>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <div className="sectionHead">
          <div>
            <h3>{admin ? 'Master Skill Directory' : 'Assigned Skills'}</h3>
            <p className="muted">Total: {rows.length} skill(s) recorded.</p>
          </div>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Skill Name</th>
                <th>Category</th>
                <th>Proficiency</th>
                <th>Experience</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((x: any) => (
                <tr key={x.employeeSkillId || x.skillId}>
                  <td>
                    <b>{x.skillName}</b>
                  </td>
                  <td>
                    <Badge tone="purple">{x.skillCategory || 'TECHNICAL'}</Badge>
                  </td>
                  <td>
                    <Badge
                      tone={
                        x.proficiencyLevel === 'EXPERT'
                          ? 'green'
                          : x.proficiencyLevel === 'ADVANCED'
                          ? 'purple'
                          : x.proficiencyLevel === 'INTERMEDIATE'
                          ? 'orange'
                          : 'purple'
                      }
                    >
                      {x.proficiencyLevel || 'Standard'}
                    </Badge>
                  </td>
                  <td>{x.yearsOfExperience != null ? `${x.yearsOfExperience} yrs` : '—'}</td>
                  <td>
                    <button
                      className="iconBtn"
                      title="Remove"
                      onClick={() => removeSkill(admin ? x.skillId : x.employeeSkillId)}
                      style={{ color: '#bc2948', borderColor: '#f3c7d1' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <Empty text="No skills recorded yet." />}
        </div>
      </Card>
    </>
  );
}
