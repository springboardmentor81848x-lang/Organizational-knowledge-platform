import { useEffect, useState } from 'react';
import { Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { get, post, put, del, endpoints, getApiErrorMessage } from '../api';
import { Badge, Button, Card, Empty, ErrorBox, Field, Loading, SelectField, Stat } from '../components/ui';

const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

export default function Competencies() {
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    skillId: '',
    requiredProficiency: 'ADVANCED',
    minimumExperience: 2.0,
    mandatory: true,
  });

  async function loadInitial() {
    setLoading(true);
    setError('');
    try {
      const [rolesList, skillsList] = await Promise.all([
        get(endpoints.jobRoles),
        get(endpoints.skillMaster),
      ]);
      setJobRoles(rolesList || []);
      setSkills(skillsList || []);

      if (rolesList && rolesList.length > 0) {
        setSelectedRoleId(String(rolesList[0].jobRoleId));
        fetchRoleCompetencies(rolesList[0].jobRoleId);
      }
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Competency framework data could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }

  async function fetchRoleCompetencies(roleId: number | string) {
    if (!roleId) {
      setCompetencies([]);
      return;
    }
    try {
      const data = await get(`${endpoints.competencies}/job-role/${roleId}`);
      setCompetencies(data || []);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Failed to fetch competencies for selected role.'));
    }
  }

  useEffect(() => {
    loadInitial();
  }, []);

  function handleRoleChange(roleIdStr: string) {
    setSelectedRoleId(roleIdStr);
    setError('');
    setSuccess('');
    fetchRoleCompetencies(roleIdStr);
  }

  async function handleAddCompetency(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoleId || !form.skillId) {
      setError('Please select both a Job Role and a Skill.');
      return;
    }

    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await post(endpoints.competencies, {
        jobRoleId: Number(selectedRoleId),
        skillId: Number(form.skillId),
        requiredProficiency: form.requiredProficiency,
        minimumExperience: Number(form.minimumExperience || 0),
        mandatory: form.mandatory,
      });

      setSuccess('Skill competency benchmark successfully mapped to Job Role!');
      setForm({
        skillId: '',
        requiredProficiency: 'ADVANCED',
        minimumExperience: 2.0,
        mandatory: true,
      });
      fetchRoleCompetencies(selectedRoleId);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Failed to add competency.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteCompetency(competencyId: number) {
    if (!window.confirm('Are you sure you want to remove this competency requirement?')) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await del(`${endpoints.competencies}/${competencyId}`);
      setSuccess('Competency requirement removed.');
      fetchRoleCompetencies(selectedRoleId);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Failed to delete competency.'));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading />;

  const currentRoleObj = jobRoles.find((r) => String(r.jobRoleId) === selectedRoleId);

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">Enterprise Capability Architecture</p>
          <h2>Job Role Competency Framework</h2>
          <p className="muted">
            Define mandatory and optional skill proficiency benchmarks and minimum experience requirements for each organizational job role.
          </p>
        </div>
      </div>

      {error && <ErrorBox message={error} />}
      {success && <div className="successBox">{success}</div>}

      <div className="statsGrid">
        <Stat label="Total Job Roles Defined" value={jobRoles.length} icon={<ShieldCheck size={20} />} />
        <Stat label="Mapped Competencies for Role" value={competencies.length} icon={<ShieldCheck size={20} />} />
        <Stat
          label="Mandatory Requirements"
          value={competencies.filter((c) => c.mandatory).length}
          icon={<ShieldCheck size={20} />}
        />
      </div>

      <Card className="mb-4">
        <div className="sectionHead">
          <div>
            <h3>Select Job Role Target</h3>
            <p className="muted">Choose a role to view or manage its required skill competencies.</p>
          </div>
        </div>

        <SelectField
          label="Active Job Role"
          value={selectedRoleId}
          onChange={(e) => handleRoleChange(e.target.value)}
        >
          <option value="">-- Choose Job Role --</option>
          {jobRoles.map((r) => (
            <option key={r.jobRoleId} value={r.jobRoleId}>
              {r.jobRoleName} — {r.description || 'Standard Role'}
            </option>
          ))}
        </SelectField>
      </Card>

      {selectedRoleId && (
        <Card className="mb-4">
          <form onSubmit={handleAddCompetency}>
            <div className="sectionHead">
              <div>
                <h3>Add Required Skill Competency</h3>
                <p className="muted">
                  Map a skill requirement to <b>{currentRoleObj?.jobRoleName}</b>.
                </p>
              </div>
              <Button type="submit" disabled={busy}>
                <Plus size={16} style={{ marginRight: 6 }} /> {busy ? 'Adding…' : 'Add Competency'}
              </Button>
            </div>

            <div className="formGrid">
              <SelectField
                label="Competency Skill *"
                value={form.skillId}
                onChange={(e) => setForm({ ...form, skillId: e.target.value })}
                required
              >
                <option value="">-- Select Skill --</option>
                {skills.map((s) => (
                  <option key={s.skillId} value={s.skillId}>
                    {s.skillName} ({s.skillCategory})
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Required Proficiency *"
                value={form.requiredProficiency}
                onChange={(e) => setForm({ ...form, requiredProficiency: e.target.value })}
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </SelectField>

              <Field
                label="Minimum Experience (Years) *"
                type="number"
                min="0"
                step="0.5"
                value={form.minimumExperience}
                onChange={(e) => setForm({ ...form, minimumExperience: Number(e.target.value) })}
                required
              />

              <label className="field" style={{ justifyContent: 'center' }}>
                <span>Mandatory Requirement</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <input
                    type="checkbox"
                    checked={form.mandatory}
                    onChange={(e) => setForm({ ...form, mandatory: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: '0.88rem' }}>Enforce as mandatory gap requirement</span>
                </div>
              </label>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="sectionHead">
          <div>
            <h3>
              Required Competencies for {currentRoleObj ? currentRoleObj.jobRoleName : 'Selected Role'}
            </h3>
            <p className="muted">
              {competencies.length} skill requirement(s) configured for this job role.
            </p>
          </div>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Skill Name</th>
                <th>Category</th>
                <th>Required Proficiency</th>
                <th>Minimum Experience</th>
                <th>Mandatory</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {competencies.map((c) => (
                <tr key={c.jobRoleCompetencyId}>
                  <td>
                    <b>{c.skillName}</b>
                  </td>
                  <td>
                    <Badge tone="purple">{c.skillCategory || 'TECHNICAL'}</Badge>
                  </td>
                  <td>
                    <Badge
                      tone={
                        c.requiredProficiency === 'EXPERT'
                          ? 'green'
                          : c.requiredProficiency === 'ADVANCED'
                          ? 'purple'
                          : 'orange'
                      }
                    >
                      {c.requiredProficiency}
                    </Badge>
                  </td>
                  <td>{c.minimumExperience != null ? `${c.minimumExperience} yrs` : '0 yrs'}</td>
                  <td>
                    <Badge tone={c.mandatory ? 'red' : 'green'}>
                      {c.mandatory ? 'Mandatory' : 'Optional'}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="iconBtn"
                      title="Remove Competency Requirement"
                      onClick={() => handleDeleteCompetency(c.jobRoleCompetencyId)}
                      style={{ color: '#bc2948', borderColor: '#f3c7d1' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!competencies.length && (
            <Empty text="No competency requirements configured for this job role yet." />
          )}
        </div>
      </Card>
    </>
  );
}
