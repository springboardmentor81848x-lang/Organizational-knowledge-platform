import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { get, endpoints, getApiErrorMessage } from '../api';
import { currentRole } from '../auth';
import { Card, Stat, Loading, ErrorBox, Badge, Button, Empty } from '../components/ui';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle2,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  UsersRound,
} from 'lucide-react';

const COLORS = ['#5847d6', '#7959ed', '#078b67', '#ab6800', '#bc2948', '#8a849b'];

export default function Dashboard() {
  const role = currentRole();
  const [data, setData] = useState<any>(null);
  const [secondaryData, setSecondaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    const fetchDashboard = async () => {
      try {
        if (role === 'ADMIN') {
          const [empList, skillsMaster, roleList, trainList] = await Promise.all([
            get(`${endpoints.hr}/employees`).catch(() => []),
            get(endpoints.skillMaster).catch(() => []),
            get(endpoints.jobRoles).catch(() => []),
            get(endpoints.trainings).catch(() => []),
          ]);
          setData({ empList, skillsMaster, roleList, trainList });
        } else if (role === 'HR') {
          const [summary, depts] = await Promise.all([
            get(`${endpoints.analytics}/hr/workforce-summary`).catch(() => ({})),
            get(`${endpoints.analytics}/departments`).catch(() => []),
          ]);
          setData(summary);
          setSecondaryData(depts || []);
        } else if (role === 'MANAGER') {
          const [heatmap, highRisk] = await Promise.all([
            get(`${endpoints.analytics}/manager/heatmap`).catch(() => ({})),
            get(`${endpoints.analytics}/manager/high-risk-gaps`).catch(() => []),
          ]);
          setData(heatmap);
          setSecondaryData(highRisk || []);
        } else {
          const [dash, gaps] = await Promise.all([
            get(`${endpoints.analytics}/dashboard/my`).catch(() => ({})),
            get(`${endpoints.analytics}/my/skill-gaps`).catch(() => []),
          ]);
          setData(dash);
          setSecondaryData(gaps || []);
        }
      } catch (err: any) {
        setError(getApiErrorMessage(err, 'Dashboard data could not be loaded.'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [role]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  return (
    <>
      {role === 'EMPLOYEE' ? (
        <EmployeeDash data={data} gaps={secondaryData} />
      ) : role === 'MANAGER' ? (
        <ManagerDash heatmap={data} highRiskGaps={secondaryData} />
      ) : role === 'HR' ? (
        <HrDash data={data} depts={secondaryData} />
      ) : (
        <AdminDash adminData={data} />
      )}
    </>
  );
}

function EmployeeDash({ data, gaps }: { data: any; gaps: any[] }) {
  const navigate = useNavigate();

  const hasJobRole = data?.jobRole && data?.jobRole !== 'No active job role assigned';
  const hasReadiness = data?.readinessPercentage != null;
  const readiness = hasReadiness ? Math.round(data.readinessPercentage) : null;

  const gapCount = data?.openGaps ?? data?.gapSkills ?? gaps?.length ?? 0;
  const masteredCount = data?.skillsMastered ?? data?.completedSkills ?? 0;
  const activeTrainings = data?.enrolledTrainingsCount ?? 0;

  const chartGaps = (gaps || [])
    .map((g: any) => ({
      name: g.skillName || 'Skill',
      gap: Math.round(g.gapPercentage || 0),
    }))
    .slice(0, 8);

  const pieData = hasReadiness
    ? [
        { name: 'Ready', value: readiness },
        { name: 'Gap', value: Math.max(0, 100 - (readiness || 0)) },
      ]
    : [];

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">My Learning & Competency Workspace</p>
          <h2>{data?.employeeName ? `Welcome back, ${data.employeeName}` : 'Welcome back'} 👋</h2>
          <p className="muted">
            Role: <b>{data?.jobRole || 'No active job role assigned'}</b> · Track your readiness score, close skill gaps, and accelerate your growth.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={() => navigate('/ai')}>
            <Sparkles size={16} style={{ marginRight: 6 }} /> AI Roadmap
          </Button>
          <Button onClick={() => navigate('/knowledge-gaps')}>View Skill Gaps</Button>
        </div>
      </div>

      <div className="statsGrid">
        <Stat
          label="Readiness Score"
          value={hasReadiness ? `${readiness}%` : 'N/A'}
          icon={<Target size={20} />}
        />
        <Stat label="Open Knowledge Gaps" value={hasJobRole ? gapCount : 'N/A'} icon={<AlertTriangle size={20} />} />
        <Stat label="Verified Skills" value={masteredCount} icon={<CheckCircle2 size={20} />} />
        <Stat label="Active Learning Courses" value={activeTrainings} icon={<BookOpen size={20} />} />
      </div>

      {!hasJobRole ? (
        <Card style={{ padding: '24px 20px', marginBottom: 20, borderLeft: '4px solid #ab6800', background: '#fffcf7' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <AlertTriangle size={28} style={{ color: '#ab6800', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#ab6800' }}>Readiness — Not Available</h3>
              <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#555' }}>
                No active job role assigned. Target job role benchmark is required to compute role readiness and competency gap analysis.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" onClick={() => navigate('/skills')}>Update My Skills</Button>
                <Button variant="secondary" onClick={() => navigate('/training')}>Explore Training Catalog</Button>
              </div>
            </div>
          </div>
        </Card>
      ) : !hasReadiness ? (
        <Card style={{ padding: '24px 20px', marginBottom: 20, borderLeft: '4px solid #5847d6', background: '#fcfbfe' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <Target size={28} style={{ color: '#5847d6', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#5847d6' }}>Readiness — Not Available</h3>
              <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#555' }}>
                Competency requirements are not configured for your assigned role (<b>{data.jobRole}</b>). Please ask HR or your Manager to configure skill benchmarks for this role.
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid2">
        <Card>
          <div className="sectionHead">
            <div>
              <h3>Priority Skill Gaps</h3>
              <p className="muted">Gap score percentage across required role competencies.</p>
            </div>
          </div>
          {chartGaps.length ? (
            <div className="chart">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartGaps} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eeeaf4" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="gap" fill="#5847d6" radius={[6, 6, 0, 0]} name="Gap %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty text={hasJobRole ? "No open knowledge gaps detected." : "No job role assigned for gap comparison."} />
          )}
        </Card>

        <Card>
          <div className="sectionHead">
            <div>
              <h3>Overall Role Readiness</h3>
              <p className="muted">Calculated against primary job role requirements.</p>
            </div>
          </div>
          {hasReadiness ? (
            <div className="donut">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={70}
                    outerRadius={95}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <Cell fill="#5847d6" />
                    <Cell fill="#e5e0f0" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div>
                <b>{readiness}%</b>
                <span>overall readiness</span>
              </div>
            </div>
          ) : (
            <Empty text="Readiness score not available until role & competency mapping exists." />
          )}
        </Card>
      </div>

      <div className="grid2" style={{ marginTop: 20 }}>
        <Card>
          <div className="sectionHead">
            <div>
              <h3>Quick Actions</h3>
              <p className="muted">Common learning and mentorship shortcuts.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <button className="reportCard" onClick={() => navigate('/assessments')} style={{ cursor: 'pointer', textAlign: 'left' }}>
              <div>
                <b>Self Assessment</b>
                <p>Submit skill evaluation</p>
              </div>
            </button>
            <button className="reportCard" onClick={() => navigate('/mentorship')} style={{ cursor: 'pointer', textAlign: 'left' }}>
              <div>
                <b>Find Mentors</b>
                <p>Complementary skill matching</p>
              </div>
            </button>
            <button className="reportCard" onClick={() => navigate('/learning')} style={{ cursor: 'pointer', textAlign: 'left' }}>
              <div>
                <b>My Learning</b>
                <p>Track course progress</p>
              </div>
            </button>
            <button className="reportCard" onClick={() => navigate('/knowledge-sessions')} style={{ cursor: 'pointer', textAlign: 'left' }}>
              <div>
                <b>Tech Sessions</b>
                <p>Browse upcoming webinars</p>
              </div>
            </button>
          </div>
        </Card>

        <Card>
          <div className="sectionHead">
            <div>
              <h3>Skill Growth Path</h3>
              <p className="muted">Next recommended milestones.</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="learningRow">
              <div>
                <b>Close Missing Competencies</b>
                <p className="muted">Focus on skills where current level is 0 or unverified.</p>
              </div>
              <Button variant="secondary" onClick={() => navigate('/training')}>Explore</Button>
            </div>
            <div className="learningRow">
              <div>
                <b>Peer 360 Feedback</b>
                <p className="muted">Request feedback on your active project skills.</p>
              </div>
              <Button variant="secondary" onClick={() => navigate('/assessments')}>Review</Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

function ManagerDash({ heatmap, highRiskGaps }: { heatmap: any; highRiskGaps: any[] }) {
  const navigate = useNavigate();
  const rows = heatmap?.employeeRows || [];
  const skills = heatmap?.competencySkills || heatmap?.skillHeaders || [];
  const teamReadiness = heatmap?.teamAverageReadiness != null ? `${Math.round(heatmap.teamAverageReadiness)}%` : 'N/A';

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">Manager Intelligence Workspace</p>
          <h2>Team Competency Matrix & Risk Center</h2>
          <p className="muted">
            Monitor department readiness, high-risk knowledge shortages, and review pending team assessments.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={() => navigate('/reports')}>Export Team Reports</Button>
          <Button onClick={() => navigate('/assessments')}>Review Assessments</Button>
        </div>
      </div>

      <div className="statsGrid">
        <Stat label="Team Members" value={rows.length || '—'} icon={<Users size={20} />} />
        <Stat label="Team Avg Readiness" value={teamReadiness} icon={<Target size={20} />} />
        <Stat label="High-Risk Skill Gaps" value={highRiskGaps.length} icon={<AlertTriangle size={20} />} />
        <Stat label="Competency Coverage" value={`${skills.length} Skills`} icon={<Activity size={20} />} />
      </div>

      <Card className="mb-4">
        <div className="sectionHead">
          <div>
            <h3>Team Skill Matrix (Heatmap)</h3>
            <p className="muted">Proficiency levels across team members and core role competencies.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Badge tone="green">EXPERT / ADVANCED</Badge>
            <Badge tone="orange">INTERMEDIATE</Badge>
            <Badge tone="red">MISSING / BEGINNER</Badge>
          </div>
        </div>

        {rows.length ? (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Job Role</th>
                  <th>Readiness</th>
                  {skills.slice(0, 6).map((s: string) => (
                    <th key={s} style={{ textAlign: 'center' }}>{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any, idx: number) => (
                  <tr key={idx}>
                    <td>
                      <b>{r.employeeName}</b>
                      <br />
                      <small className="muted">{r.employeeCode}</small>
                    </td>
                    <td>{r.jobRole || 'Engineer'}</td>
                    <td>
                      <Badge tone={r.readinessPercentage >= 70 ? 'green' : r.readinessPercentage >= 40 ? 'orange' : 'red'}>
                        {r.readinessPercentage != null ? `${Math.round(r.readinessPercentage)}%` : 'N/A'}
                      </Badge>
                    </td>
                    {skills.slice(0, 6).map((s: string) => {
                      const cellInfo = r.skillCells?.[s];
                      const level = cellInfo?.currentProficiency || r.skillLevels?.[s] || 'NONE';
                      const isHigh = level === 'EXPERT' || level === 'ADVANCED';
                      const isMed = level === 'INTERMEDIATE';
                      return (
                        <td key={s} style={{ textAlign: 'center' }}>
                          <Badge tone={isHigh ? 'green' : isMed ? 'orange' : 'red'}>
                            {level}
                          </Badge>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="No team members or matrix data currently assigned." />
        )}
      </Card>

      <Card>
        <div className="sectionHead">
          <div>
            <h3>High-Risk Skill Gaps</h3>
            <p className="muted">Gaps exceeding threshold on mandatory competencies.</p>
          </div>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Skill</th>
                <th>Gap %</th>
                <th>Risk Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {highRiskGaps.slice(0, 8).map((x: any, i: number) => (
                <tr key={i}>
                  <td>
                    <b>{x.employeeName || x.employeeCode}</b>
                  </td>
                  <td>{x.skillName}</td>
                  <td>
                    <b>{Math.round(x.gapPercentage || 0)}%</b>
                  </td>
                  <td>
                    <Badge tone={String(x.riskLevel || '').toLowerCase() === 'critical' ? 'red' : 'orange'}>
                      {x.riskLevel || 'HIGH'}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/mentorship')}
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      Assign Mentor
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!highRiskGaps.length && <Empty text="No critical high-risk gaps found in your team." />}
        </div>
      </Card>
    </>
  );
}

function HrDash({ data, depts }: { data: any; depts: any[] }) {
  const navigate = useNavigate();
  const deptList = data?.departmentSummaries || depts || [];
  const orgReadiness = data?.overallOrgReadiness != null ? `${Math.round(data.overallOrgReadiness)}%` : 'N/A';

  const profData = data?.proficiencyDistribution
    ? Object.entries(data.proficiencyDistribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">HR Executive Workspace</p>
          <h2>Enterprise Workforce Intelligence</h2>
          <p className="muted">
            Department readiness benchmarks, workforce skill distribution, registration governance, and organizational learning.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={() => navigate('/reports')}>Export Workforce Reports</Button>
          <Button onClick={() => navigate('/employees')}>Employee Management</Button>
        </div>
      </div>

      <div className="statsGrid">
        <Stat label="Total Employees" value={data?.totalEmployees ?? '—'} icon={<Users size={20} />} />
        <Stat label="Departments" value={data?.totalDepartments ?? '—'} icon={<Target size={20} />} />
        <Stat label="Org Readiness" value={orgReadiness} icon={<CheckCircle2 size={20} />} />
        <Stat label="Trainings Completed" value={data?.totalTrainingsCompleted ?? '—'} icon={<BookOpen size={20} />} />
      </div>

      <div className="grid2">
        <Card>
          <div className="sectionHead">
            <div>
              <h3>Department Readiness Benchmarks</h3>
              <p className="muted">Average readiness percentage by business unit.</p>
            </div>
          </div>
          {deptList.length ? (
            <div className="chart">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={deptList} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eeeaf4" />
                  <XAxis dataKey="departmentName" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="averageReadinessPercentage" fill="#5847d6" radius={[6, 6, 0, 0]} name="Readiness %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty text="No department data available." />
          )}
        </Card>

        <Card>
          <div className="sectionHead">
            <div>
              <h3>Workforce Proficiency Distribution</h3>
              <p className="muted">Spread across all verified skill competencies.</p>
            </div>
          </div>
          {profData.length ? (
            <div className="chart">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={profData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {profData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty text="No proficiency distribution data available." />
          )}
        </Card>
      </div>
    </>
  );
}

function AdminDash({ adminData }: { adminData: any }) {
  const navigate = useNavigate();
  const empList = adminData?.empList || [];
  const skillsMaster = adminData?.skillsMaster || [];
  const roleList = adminData?.roleList || [];
  const trainList = adminData?.trainList || [];

  const roleCounts: Record<string, number> = {
    EMPLOYEE: 0,
    MANAGER: 0,
    HR: 0,
    ADMIN: 0,
  };

  empList.forEach((e: any) => {
    const r = (e.roleName || 'EMPLOYEE').replace('ROLE_', '');
    if (roleCounts[r] !== undefined) {
      roleCounts[r]++;
    } else {
      roleCounts.EMPLOYEE++;
    }
  });

  const roleChartData = Object.entries(roleCounts).map(([name, value]) => ({ name, value }));

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">System Administrator Workspace</p>
          <h2>System Governance & Master Data Console</h2>
          <p className="muted">
            Global skill taxonomy, system role distribution, job role competencies, and platform governance controls.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={() => navigate('/skills-admin')}>Master Skill Taxonomy</Button>
          <Button onClick={() => navigate('/employees')}>User & Access Management</Button>
        </div>
      </div>

      <div className="statsGrid">
        <Stat label="Platform Users" value={empList.length || '—'} icon={<Users size={20} />} />
        <Stat label="Master Taxonomy Skills" value={skillsMaster.length || '—'} icon={<Brain size={20} />} />
        <Stat label="Configured Job Roles" value={roleList.length || '—'} icon={<ShieldCheck size={20} />} />
        <Stat label="Catalog Courses" value={trainList.length || '—'} icon={<BookOpen size={20} />} />
      </div>

      <div className="grid2">
        <Card>
          <div className="sectionHead">
            <div>
              <h3>System Role Distribution</h3>
              <p className="muted">User account distribution across authentication security roles.</p>
            </div>
          </div>
          {empList.length ? (
            <div className="chart">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={roleChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eeeaf4" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#5847d6" radius={[6, 6, 0, 0]} name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty text="No user accounts registered." />
          )}
        </Card>

        <Card>
          <div className="sectionHead">
            <div>
              <h3>System Governance Shortcuts</h3>
              <p className="muted">Administrative management modules.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <button className="reportCard" onClick={() => navigate('/skills-admin')} style={{ cursor: 'pointer', textAlign: 'left' }}>
              <div>
                <b>Skill Master Taxonomy</b>
                <p>{skillsMaster.length} competencies cataloged</p>
              </div>
            </button>
            <button className="reportCard" onClick={() => navigate('/competencies')} style={{ cursor: 'pointer', textAlign: 'left' }}>
              <div>
                <b>Competency Framework</b>
                <p>{roleList.length} job roles configured</p>
              </div>
            </button>
            <button className="reportCard" onClick={() => navigate('/training-admin')} style={{ cursor: 'pointer', textAlign: 'left' }}>
              <div>
                <b>Training Administration</b>
                <p>{trainList.length} catalog courses</p>
              </div>
            </button>
            <button className="reportCard" onClick={() => navigate('/employees')} style={{ cursor: 'pointer', textAlign: 'left' }}>
              <div>
                <b>User Management</b>
                <p>{empList.length} system accounts</p>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
