import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Plus, RefreshCw, UserCheck, Users } from 'lucide-react';
import { get, post, put, del, endpoints, getApiErrorMessage } from '../api';
import { Badge, Button, Card, Empty, ErrorBox, Field, Loading, Modal, SelectField, Stat } from '../components/ui';

export default function Employees() {
  const [activeTab, setActiveTab] = useState<'directory' | 'pending' | 'create'>('directory');
  const [employees, setEmployees] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  // Job Role Assignment Modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [assignJobRoleId, setAssignJobRoleId] = useState('');
  const [assignType, setAssignType] = useState<'PRIMARY' | 'SECONDARY'>('PRIMARY');
  const [existingAssignmentId, setExistingAssignmentId] = useState<number | null>(null);

  // Gap Analysis Drilldown Modal state
  const [gapModalOpen, setGapModalOpen] = useState(false);
  const [empGapsData, setEmpGapsData] = useState<any>(null);

  // User creation form
  const [createForm, setCreateForm] = useState<any>({
    firstName: '',
    lastName: '',
    officialEmail: '',
    password: '',
    departmentId: 1,
    role: 'ROLE_EMPLOYEE',
  });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [empList, pendingList, roleList] = await Promise.all([
        get(`${endpoints.hr}/employees`).catch(() => []),
        get(`${endpoints.hr}/pending`).catch(() => []),
        get(endpoints.jobRoles).catch(() => []),
      ]);
      setEmployees(empList || []);
      setPending(pendingList || []);
      setJobRoles(roleList || []);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Employee management data could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await post(`${endpoints.admin}/users`, {
        ...createForm,
        departmentId: Number(createForm.departmentId),
      });
      setSuccess(`Employee "${createForm.firstName} ${createForm.lastName}" created successfully.`);
      setCreateForm({
        firstName: '',
        lastName: '',
        officialEmail: '',
        password: '',
        departmentId: 1,
        role: 'ROLE_EMPLOYEE',
      });
      setActiveTab('directory');
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Failed to create user.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleApproval(employeeId: number, action: 'approve' | 'reject') {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await put(`${endpoints.hr}/${action}/${employeeId}`);
      setSuccess(`Registration ${action}d successfully.`);
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, `Failed to ${action} employee.`));
    } finally {
      setBusy(false);
    }
  }

  function openAssignModal(emp: any) {
    setSelectedEmp(emp);
    setAssignJobRoleId(emp.jobRoleId ? String(emp.jobRoleId) : '');
    setAssignType('PRIMARY');
    setExistingAssignmentId(null);
    setAssignModalOpen(true);

    // Fetch existing assigned roles for this employee
    get(`${endpoints.assignments}/employee/${emp.employeeId}`)
      .then((assignedList: any[]) => {
        if (assignedList && assignedList.length > 0) {
          const primary = assignedList.find((a) => a.assignmentType === 'PRIMARY') || assignedList[0];
          setAssignJobRoleId(String(primary.jobRoleId));
          setAssignType(primary.assignmentType || 'PRIMARY');
          setExistingAssignmentId(primary.employeeJobRoleId);
        }
      })
      .catch(() => {});
  }

  async function handleSaveAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEmp || !assignJobRoleId) {
      setError('Please select a valid Job Role.');
      return;
    }

    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        employeeId: selectedEmp.employeeId,
        jobRoleId: Number(assignJobRoleId),
        assignmentType: assignType,
      };

      if (existingAssignmentId) {
        await put(`${endpoints.assignments}/${existingAssignmentId}`, payload);
      } else {
        await post(endpoints.assignments, payload);
      }

      // Automatically trigger gap analysis after assigning job role
      try {
        await post(`${endpoints.gaps}/run/${selectedEmp.employeeId}`);
      } catch {
        // Gap analysis trigger safe fallback
      }

      setAssignModalOpen(false);
      setSuccess(`Job role assigned and gap analysis updated for ${selectedEmp.firstName} ${selectedEmp.lastName}!`);
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Job role assignment failed.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleRunGapAnalysis(employeeId: number, name: string) {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await post(`${endpoints.gaps}/run/${employeeId}`);
      const gapRes = await get(`${endpoints.gaps}/employee/${employeeId}`);
      setEmpGapsData({ name, gaps: gapRes || [] });
      setGapModalOpen(true);
      setSuccess(`Knowledge gap analysis calculated for ${name}!`);
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Gap analysis run failed. Make sure employee has an active job role.'));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">Workforce Management & Governance</p>
          <h2>Employee Directory & Job Role Assignments</h2>
          <p className="muted">
            Manage organization employees, assign target primary/secondary job roles, trigger gap analysis, and review pending registrations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={() => setActiveTab('create')}>
            <Plus size={16} style={{ marginRight: 6 }} /> Add Employee
          </Button>
        </div>
      </div>

      {error && <ErrorBox message={error} />}
      {success && <div className="successBox">{success}</div>}

      <div className="statsGrid">
        <Stat label="Total Employees" value={employees.length} icon={<Users size={20} />} />
        <Stat label="Pending Registrations" value={pending.length} icon={<AlertTriangle size={20} />} />
        <Stat
          label="Active Job Roles Assigned"
          value={employees.filter((e) => e.jobRoleName && e.jobRoleName !== 'No active job role assigned').length}
          icon={<CheckCircle2 size={20} />}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <button
          className={`btn ${activeTab === 'directory' ? 'primary' : 'secondary'}`}
          onClick={() => setActiveTab('directory')}
        >
          Employee Directory ({employees.length})
        </button>
        <button
          className={`btn ${activeTab === 'pending' ? 'primary' : 'secondary'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Registrations ({pending.length})
        </button>
        <button
          className={`btn ${activeTab === 'create' ? 'primary' : 'secondary'}`}
          onClick={() => setActiveTab('create')}
        >
          Create New User
        </button>
      </div>

      {activeTab === 'directory' && (
        <Card>
          <div className="sectionHead">
            <div>
              <h3>Approved Employee Roster</h3>
              <p className="muted">View profiles, assigned job roles, and manage competency gap calculations.</p>
            </div>
          </div>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Security Role</th>
                  <th>Current Job Role</th>
                  <th>Status</th>
                  <th>Management Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const hasRole = emp.jobRoleName && emp.jobRoleName !== 'No active job role assigned';
                  return (
                    <tr key={emp.employeeId}>
                      <td>
                        <b>{emp.firstName} {emp.lastName}</b>
                        <br />
                        <small className="muted">{emp.employeeCode} · {emp.officialEmail}</small>
                      </td>
                      <td>{emp.departmentName || 'IT'}</td>
                      <td>
                        <Badge tone="purple">{emp.roleName ? emp.roleName.replace('ROLE_', '') : 'EMPLOYEE'}</Badge>
                      </td>
                      <td>
                        <Badge tone={hasRole ? 'green' : 'orange'}>
                          {emp.jobRoleName || 'No active job role assigned'}
                        </Badge>
                      </td>
                      <td>
                        <Badge tone={emp.status === 'APPROVED' ? 'green' : 'red'}>
                          {emp.status || 'APPROVED'}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button
                            variant="secondary"
                            onClick={() => openAssignModal(emp)}
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                          >
                            Assign Role
                          </Button>
                          <Button
                            variant="primary"
                            disabled={busy || !hasRole}
                            onClick={() => handleRunGapAnalysis(emp.employeeId, `${emp.firstName} ${emp.lastName}`)}
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                            title={hasRole ? 'Calculate gap readiness score' : 'Assign a job role first'}
                          >
                            <RefreshCw size={12} style={{ marginRight: 4 }} /> Analyze Gaps
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!employees.length && <Empty text="No approved employees in directory." />}
          </div>
        </Card>
      )}

      {activeTab === 'pending' && (
        <Card>
          <div className="sectionHead">
            <div>
              <h3>Pending Registration Requests</h3>
              <p className="muted">Review self-registered employees awaiting HR authorization.</p>
            </div>
          </div>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Official Email</th>
                  <th>Employee Code</th>
                  <th>Approval Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.employeeId}>
                    <td>
                      <b>{p.firstName} {p.lastName}</b>
                    </td>
                    <td>{p.officialEmail}</td>
                    <td><code>{p.employeeCode}</code></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                          variant="primary"
                          disabled={busy}
                          onClick={() => handleApproval(p.employeeId, 'approve')}
                          style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                        >
                          <UserCheck size={14} style={{ marginRight: 4 }} /> Approve
                        </Button>
                        <Button
                          variant="secondary"
                          disabled={busy}
                          onClick={() => handleApproval(p.employeeId, 'reject')}
                          style={{ padding: '4px 12px', fontSize: '0.8rem', color: '#bc2948' }}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!pending.length && <Empty text="No pending employee registration requests." />}
          </div>
        </Card>
      )}

      {activeTab === 'create' && (
        <Card>
          <div className="sectionHead">
            <div>
              <h3>Create New Employee</h3>
              <p className="muted">Register an authorized user directly with pre-approved account status.</p>
            </div>
          </div>

          <form onSubmit={handleCreateUser}>
            <div className="formGrid">
              <Field
                label="First Name *"
                value={createForm.firstName}
                onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                required
              />
              <Field
                label="Last Name *"
                value={createForm.lastName}
                onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                required
              />
              <Field
                label="Official Email *"
                type="email"
                value={createForm.officialEmail}
                onChange={(e) => setCreateForm({ ...createForm, officialEmail: e.target.value })}
                placeholder="name@company.com"
                required
              />
              <Field
                label="Initial Password *"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                required
              />
              <SelectField
                label="Department *"
                value={createForm.departmentId}
                onChange={(e) => setCreateForm({ ...createForm, departmentId: e.target.value })}
              >
                <option value="1">IT / Engineering (ID: 1)</option>
                <option value="2">Human Resources (ID: 2)</option>
                <option value="3">Finance & Operations (ID: 3)</option>
                <option value="4">Sales & Marketing (ID: 4)</option>
              </SelectField>
              <SelectField
                label="System Role *"
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              >
                <option value="ROLE_EMPLOYEE">ROLE_EMPLOYEE</option>
                <option value="ROLE_MANAGER">ROLE_MANAGER</option>
                <option value="ROLE_HR">ROLE_HR</option>
                <option value="ROLE_ADMIN">ROLE_ADMIN</option>
              </SelectField>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
              <Button type="button" variant="secondary" onClick={() => setActiveTab('directory')}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Creating…' : 'Create Account'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Job Role Assignment Modal */}
      <Modal open={assignModalOpen} title="Assign Job Role to Employee" onClose={() => setAssignModalOpen(false)}>
        {selectedEmp && (
          <form onSubmit={handleSaveAssignment}>
            <div style={{ background: '#f5f4fb', padding: 14, borderRadius: 12, marginBottom: 16 }}>
              <p style={{ margin: '0 0 4px' }}>
                <b>Employee:</b> {selectedEmp.firstName} {selectedEmp.lastName} ({selectedEmp.employeeCode})
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
                Department: {selectedEmp.departmentName || 'IT'} | Current Role: {selectedEmp.jobRoleName || 'None'}
              </p>
            </div>

            <SelectField
              label="Select Target Job Role *"
              value={assignJobRoleId}
              onChange={(e) => setAssignJobRoleId(e.target.value)}
              required
            >
              <option value="">-- Choose Job Role --</option>
              {jobRoles.map((jr) => (
                <option key={jr.jobRoleId} value={jr.jobRoleId}>
                  {jr.jobRoleName} ({jr.description || 'Standard Role'})
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Assignment Type *"
              value={assignType}
              onChange={(e) => setAssignType(e.target.value as any)}
            >
              <option value="PRIMARY">PRIMARY (Main Job Position)</option>
              <option value="SECONDARY">SECONDARY (Cross-functional Project Role)</option>
            </SelectField>

            <p className="muted" style={{ fontSize: '0.82rem', marginTop: 8 }}>
              Assigning a primary job role replaces any previous primary assignment and immediately maps required competency benchmarks for knowledge gap analysis.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
              <Button type="button" variant="secondary" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving…' : 'Save Assignment & Recalculate Gaps'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Gap Analysis Drilldown Modal */}
      <Modal open={gapModalOpen} title={`Competency Gap Breakdown: ${empGapsData?.name || 'Employee'}`} onClose={() => setGapModalOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(empGapsData?.gaps || []).map((g: any) => (
            <div
              key={g.gapId || g.skillName}
              style={{
                padding: 14,
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: '#fcfbfe',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <b>{g.skillName}</b>
                <Badge tone={g.gapPercentage > 50 ? 'red' : g.gapPercentage > 0 ? 'orange' : 'green'}>
                  {g.gapPercentage > 0 ? `${g.gapPercentage}% Gap` : '100% Ready'}
                </Badge>
              </div>
              <p className="muted" style={{ margin: '2px 0 8px', fontSize: '0.83rem' }}>
                Required: <b>{g.requiredLevel}</b> | Current: <b>{g.currentLevel}</b>
              </p>
              <div style={{ width: '100%', height: 6, background: '#eeeaf4', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.max(0, 100 - (g.gapPercentage || 0))}%`,
                    background: g.gapPercentage > 50 ? '#e03151' : g.gapPercentage > 0 ? '#e08a31' : '#078b67',
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          ))}

          {!empGapsData?.gaps?.length && (
            <Empty text="No knowledge gap records found. Ensure this employee has an active job role and mapped competencies." />
          )}
        </div>
      </Modal>
    </>
  );
}
