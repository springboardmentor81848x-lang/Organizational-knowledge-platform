import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "@/styles/manager-dashboard.css";
import "@/styles/manager-pages.css";

import managerService from "@/services/managerService";
import ManagerLayout from "./ManagerLayout";
import { TeamAnalytics, SkillGapHeatmap } from "@/services/analyticsService";

type DepartmentRow = {
  departmentName?: string;
  employeeCount?: number;
  averageGapPercentage?: number;
  averageReadinessPercentage?: number;
};

type DepartmentCoverageRow = {
  departmentName?: string;
  employeeCount?: number;
  requiredSkills?: number;
  coveredSkills?: number;
  skillCoveragePercentage?: number;
};

type TrainingProgressRow = {
  employeeId?: number;
  employeeName?: string;
  trainingCount?: number;
  completedTraining?: number;
  averageProgress?: number;
  hoursSpent?: number;
};

type TrainingAnalytics = {
  teamSize?: number;
  enrollments?: number;
  enrolledEmployees?: number;
  adoptionRate?: number;
  notStarted?: number;
  inProgress?: number;
  completed?: number;
  completionRate?: number;
  averageProgress?: number;
  individualProgress?: TrainingProgressRow[];
};

type DashboardResponse = {
  team?: TeamAnalytics[];
  heatmap?: SkillGapHeatmap[];
  departments?: DepartmentRow[];
  departmentSkillCoverage?: DepartmentCoverageRow[];
  training?: TrainingAnalytics;
};

const safeNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const pct = (value: unknown) => `${Math.round(safeNumber(value))}%`;

const initials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "--";
};

const getGapStatus = (gap: number) => {
  if (gap >= 50) return { label: "High Risk", className: "high" };
  if (gap >= 25) return { label: "Needs Attention", className: "medium" };
  return { label: "Healthy", className: "low" };
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [team, setTeam] = useState<TeamAnalytics[]>([]);
  const [heatmapData, setHeatmapData] = useState<SkillGapHeatmap[]>([]);
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [departmentCoverage, setDepartmentCoverage] = useState<DepartmentCoverageRow[]>([]);
  const [training, setTraining] = useState<TrainingAnalytics>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data: DashboardResponse = await managerService.getManagerDashboard();

        console.log("MANAGER DASHBOARD LIVE DATA:", data);

        if (!mounted) return;

        setTeam(Array.isArray(data?.team) ? data.team : []);
        setHeatmapData(Array.isArray(data?.heatmap) ? data.heatmap : []);
        setDepartments(Array.isArray(data?.departments) ? data.departments : []);
        setDepartmentCoverage(
          Array.isArray(data?.departmentSkillCoverage)
            ? data.departmentSkillCoverage
            : []
        );
        setTraining(data?.training || {});
      } catch (err: any) {
        console.error("MANAGER DASHBOARD ERROR:", err);

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message ||
              "Unable to load manager dashboard data."
          );
          setTeam([]);
          setHeatmapData([]);
          setDepartments([]);
          setDepartmentCoverage([]);
          setTraining({});
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const avgGap = useMemo(() => {
    if (!team.length) return 0;
    return team.reduce((sum, member) => sum + safeNumber(member.gapPercentage), 0) / team.length;
  }, [team]);

  const avgReadiness = useMemo(() => {
    if (!team.length) return 0;
    return team.reduce(
      (sum, member) => sum + safeNumber(member.readinessPercentage),
      0
    ) / team.length;
  }, [team]);

  const criticalMembers = useMemo(
    () =>
      [...team]
        .filter((member) => safeNumber(member.gapPercentage) >= 50)
        .sort(
          (a, b) =>
            safeNumber(b.gapPercentage) - safeNumber(a.gapPercentage)
        ),
    [team]
  );

  const filteredTeam = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return team;

    return team.filter((member) =>
      [member.employeeName, member.employeeCode, member.jobRoleName].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      )
    );
  }, [team, search]);

  const adoptionRate = safeNumber(training.adoptionRate);
  const completionRate = safeNumber(training.completionRate);
  const averageTrainingProgress = safeNumber(training.averageProgress);

  const progressByEmployee = useMemo(() => {
    const rows = Array.isArray(training.individualProgress)
      ? training.individualProgress
      : [];

    const map = new Map<number, TrainingProgressRow>();
    rows.forEach((row) => {
      if (row.employeeId != null) map.set(Number(row.employeeId), row);
    });
    return map;
  }, [training.individualProgress]);

  return (
    <ManagerLayout active="Dashboard" breadcrumb="Overview">
      <section className="manager-dashboard-content">
        <header className="manager-dashboard-header">
          <div>
            <div className="manager-dashboard-eyebrow">
              <span className="eyebrow-dot" />
              TEAM INTELLIGENCE
              <span className="eyebrow-live">LIVE DATA</span>
            </div>
            <h1>Manager Dashboard</h1>
            <p>
              Monitor team readiness, skill coverage, training adoption and
              knowledge gaps from live organizational data.
            </p>
          </div>

          <div className="manager-dashboard-actions">
            <button
              type="button"
              className="dashboard-secondary-btn"
              onClick={() => navigate("/manager/employees")}
            >
              <Users size={15} />
              View Team
            </button>
            <button
              type="button"
              className="dashboard-primary-btn"
              onClick={() => navigate("/manager/knowledge-gap-analysis")}
            >
              <Activity size={15} />
              Analyze Gaps
              <ArrowUpRight size={14} />
            </button>
          </div>
        </header>

        {error && (
          <div className="dashboard-error">
            <AlertTriangle size={17} />
            <div>
              <strong>Unable to load manager dashboard</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* REQUIRED MANAGER FUNCTIONALITY - KPI SUMMARY */}
        <div className="dashboard-kpi-grid manager-requirement-kpis">
          <article className="dashboard-kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon purple"><Users size={18} /></div>
              <span className="kpi-caption">TEAM</span>
            </div>
            <div className="kpi-number">{loading ? "—" : team.length}</div>
            <div className="kpi-title">Team Members</div>
            <div className="kpi-description">Employees assigned to this manager.</div>
          </article>

          <article className="dashboard-kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon red"><Activity size={18} /></div>
              <span className="kpi-caption">GAP</span>
            </div>
            <div className="kpi-number">{loading ? "—" : pct(avgGap)}</div>
            <div className="kpi-title">Average Skill Gap</div>
            <div className="kpi-description">Calculated from team knowledge-gap records.</div>
          </article>

          <article className="dashboard-kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon green"><ShieldCheck size={18} /></div>
              <span className="kpi-caption">READINESS</span>
            </div>
            <div className="kpi-number">{loading ? "—" : pct(avgReadiness)}</div>
            <div className="kpi-title">Team Readiness</div>
            <div className="kpi-description">Derived from current team gap data.</div>
          </article>

          <article className="dashboard-kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon blue"><GraduationCap size={18} /></div>
              <span className="kpi-caption">TRAINING</span>
            </div>
            <div className="kpi-number">{loading ? "—" : pct(adoptionRate)}</div>
            <div className="kpi-title">Training Adoption</div>
            <div className="kpi-description">
              {safeNumber(training.enrolledEmployees)} of {safeNumber(training.teamSize)} team members enrolled.
            </div>
          </article>
        </div>

        {/* TEAM READINESS + HIGH-RISK ALERTS */}
        <div className="dashboard-main-grid">
          <section className="dashboard-panel readiness-panel">
            <div className="panel-header">
              <div>
                <div className="panel-overline">INDIVIDUAL PROGRESS</div>
                <h2>Team Readiness</h2>
                <p>Individual readiness and knowledge-gap snapshots.</p>
              </div>
              <button
                type="button"
                className="panel-link"
                onClick={() => navigate("/manager/employees")}
              >
                View all <ChevronRight size={14} />
              </button>
            </div>

            {loading ? (
              <div className="dashboard-loading"><div className="dashboard-spinner" /><span>Loading team data...</span></div>
            ) : filteredTeam.length === 0 ? (
              <div className="dashboard-empty">
                <Users size={25} />
                <strong>No team data available</strong>
                <p>Employees assigned to this manager will appear here.</p>
              </div>
            ) : (
              <div className="readiness-list">
                {filteredTeam.slice(0, 6).map((member) => {
                  const readiness = safeNumber(member.readinessPercentage);
                  const gap = safeNumber(member.gapPercentage);
                  const status = getGapStatus(gap);
                  const progress = progressByEmployee.get(Number(member.employeeId));

                  return (
                    <div className="readiness-item" key={member.employeeId}>
                      <div className="readiness-person">
                        <div className="readiness-avatar">{initials(member.employeeName)}</div>
                        <div>
                          <strong>{member.employeeName || "Employee"}</strong>
                          <span>{member.jobRoleName || member.employeeCode || "Team member"}</span>
                        </div>
                      </div>

                      <div className="readiness-values">
                        <div><span>Readiness</span><strong>{pct(readiness)}</strong></div>
                        <div><span>Training</span><strong>{pct(progress?.averageProgress)}</strong></div>
                      </div>

                      <div className="readiness-bars">
                        <div className="mini-bar"><span style={{ width: `${Math.min(100, Math.max(0, readiness))}%` }} /></div>
                        <div className="mini-bar gap-bar"><span style={{ width: `${Math.min(100, Math.max(0, gap))}%` }} /></div>
                      </div>

                      <div className={`readiness-status ${status.className}`}>{status.label}</div>

                      <button
                        type="button"
                        className="row-arrow"
                        onClick={() => navigate(`/manager/employees?employee=${member.employeeId}`)}
                        aria-label={`View ${member.employeeName || "employee"}`}
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="dashboard-panel risk-panel">
            <div className="panel-header">
              <div>
                <div className="panel-overline risk-overline">HIGH-RISK SKILL GAP ALERTS</div>
                <h2>Risk Watch</h2>
                <p>Team members with a gap of 50% or higher.</p>
              </div>
              <div className="risk-header-icon"><Zap size={17} /></div>
            </div>

            {criticalMembers.length === 0 ? (
              <div className="risk-success">
                <div className="success-icon"><CheckCircle2 size={20} /></div>
                <div>
                  <strong>No high-risk gaps</strong>
                  <p>No current team member is at or above the 50% gap threshold.</p>
                </div>
              </div>
            ) : (
              <div className="risk-list">
                {criticalMembers.slice(0, 5).map((member) => (
                  <button
                    type="button"
                    className="risk-item"
                    key={member.employeeId}
                    onClick={() => navigate(`/manager/knowledge-gap-analysis?employee=${member.employeeId}`)}
                  >
                    <div className="risk-avatar">{initials(member.employeeName)}</div>
                    <div className="risk-person">
                      <strong>{member.employeeName || "Employee"}</strong>
                      <span>{member.jobRoleName || "Team member"}</span>
                    </div>
                    <div className="risk-score">
                      <strong>{pct(member.gapPercentage)}</strong>
                      <span>HIGH GAP</span>
                    </div>
                    <ChevronRight size={15} />
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              className="risk-action"
              onClick={() => navigate("/manager/knowledge-gap-analysis")}
            >
              Open Knowledge Gap Analysis <ChevronRight size={14} />
            </button>
          </section>
        </div>

        {/* REQUIRED #1 - TEAM GAP HEATMAP */}
        <section className="dashboard-panel heatmap-panel">
          <div className="panel-header">
            <div>
              <div className="panel-overline">REQUIRED FUNCTIONALITY</div>
              <h2>Team Gap Heatmap</h2>
              <p>Skill-wise knowledge gap calculated only from this manager's team.</p>
            </div>
            <BarChart3 size={20} />
          </div>

          {heatmapData.length === 0 ? (
            <div className="dashboard-empty">
              <Activity size={25} />
              <strong>No skill-gap records available</strong>
              <p>Run gap analysis for team members to generate the heatmap.</p>
            </div>
          ) : (
            <div className="skill-gap-heatmap">
              {heatmapData.map((item) => {
                const gap = safeNumber(item.averageGapPercentage);
                const level = gap >= 50 ? "critical" : gap >= 25 ? "learning" : "expert";
                return (
                  <div className="skill-gap-row" key={item.skillName}>
                    <div className="skill-gap-name">
                      <strong>{item.skillName}</strong>
                      <small>{item.employeeCount} employee{item.employeeCount !== 1 ? "s" : ""}</small>
                    </div>
                    <div className="skill-gap-track">
                      <div className={`skill-gap-fill ${level}`} style={{ width: `${Math.min(100, Math.max(0, gap))}%` }} />
                    </div>
                    <div className={`skill-gap-value ${level}`}>{gap.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* REQUIRED #2 - DEPARTMENT SKILL COVERAGE */}
        <section className="dashboard-panel manager-functionality-panel">
          <div className="panel-header">
            <div>
              <div className="panel-overline">REQUIRED FUNCTIONALITY</div>
              <h2>Department Skill Coverage</h2>
              <p>Coverage is calculated against active job-role competencies and employee skills.</p>
            </div>
            <Target size={20} />
          </div>

          {departmentCoverage.length === 0 ? (
            <div className="dashboard-empty">
              <Target size={25} />
              <strong>No department competency data available</strong>
              <p>Assign job roles and competencies to calculate skill coverage.</p>
            </div>
          ) : (
            <div className="manager-functionality-table-wrap">
              <div className="manager-functionality-table-head">
                <span>Department</span>
                <span>Employees</span>
                <span>Covered / Required</span>
                <span>Skill Coverage</span>
              </div>
              {departmentCoverage.map((row) => (
                <div className="manager-functionality-table-row" key={row.departmentName}>
                  <strong>{row.departmentName || "Unassigned"}</strong>
                  <span>{safeNumber(row.employeeCount)}</span>
                  <span>{safeNumber(row.coveredSkills)} / {safeNumber(row.requiredSkills)}</span>
                  <div className="manager-coverage-cell">
                    <strong>{pct(row.skillCoveragePercentage)}</strong>
                    <div className="manager-coverage-bar">
                      <span style={{ width: `${Math.min(100, Math.max(0, safeNumber(row.skillCoveragePercentage)))}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* REQUIRED #3 - TRAINING ADOPTION */}
        <section className="dashboard-panel manager-functionality-panel">
          <div className="panel-header">
            <div>
              <div className="panel-overline">REQUIRED FUNCTIONALITY</div>
              <h2>Training Adoption Rates</h2>
              <p>Real enrollment, completion and progress data for this manager's team.</p>
            </div>
            <GraduationCap size={20} />
          </div>

          <div className="training-metrics-grid">
            <div className="training-metric-card">
              <BookOpen size={18} />
              <span>Adoption</span>
              <strong>{pct(adoptionRate)}</strong>
              <small>{safeNumber(training.enrolledEmployees)} enrolled employees</small>
            </div>
            <div className="training-metric-card">
              <CheckCircle2 size={18} />
              <span>Completion</span>
              <strong>{pct(completionRate)}</strong>
              <small>{safeNumber(training.completed)} completed enrollments</small>
            </div>
            <div className="training-metric-card">
              <TrendingUp size={18} />
              <span>Average Progress</span>
              <strong>{pct(averageTrainingProgress)}</strong>
              <small>{safeNumber(training.enrollments)} total enrollments</small>
            </div>
            <div className="training-metric-card">
              <Clock3 size={18} />
              <span>In Progress</span>
              <strong>{safeNumber(training.inProgress)}</strong>
              <small>active training enrollments</small>
            </div>
          </div>
        </section>

        {/* REQUIRED #5 - INDIVIDUAL PROGRESS SNAPSHOTS */}
        <section className="dashboard-panel manager-functionality-panel">
          <div className="panel-header">
            <div>
              <div className="panel-overline">REQUIRED FUNCTIONALITY</div>
              <h2>Individual Progress Snapshots</h2>
              <p>Training progress is read from employee training activity; employees do not enter these values manually.</p>
            </div>
            <TrendingUp size={20} />
          </div>

          {team.length === 0 ? (
            <div className="dashboard-empty">
              <Users size={25} />
              <strong>No employees available</strong>
              <p>Assigned team members will appear here.</p>
            </div>
          ) : (
            <div className="manager-functionality-table-wrap">
              <div className="manager-functionality-table-head progress-head">
                <span>Employee</span>
                <span>Training Count</span>
                <span>Completed</span>
                <span>Average Progress</span>
                <span>Hours</span>
              </div>
              {team.map((member) => {
                const progress = progressByEmployee.get(Number(member.employeeId));
                return (
                  <button
                    type="button"
                    className="manager-functionality-table-row progress-row"
                    key={member.employeeId}
                    onClick={() => navigate(`/manager/employees?employee=${member.employeeId}`)}
                  >
                    <div className="table-employee">
                      <div className="table-avatar">{initials(member.employeeName)}</div>
                      <div>
                        <strong>{member.employeeName || "Employee"}</strong>
                        <span>{member.employeeCode || member.jobRoleName || "—"}</span>
                      </div>
                    </div>
                    <span>{safeNumber(progress?.trainingCount)}</span>
                    <span>{safeNumber(progress?.completedTraining)}</span>
                    <div className="manager-coverage-cell">
                      <strong>{pct(progress?.averageProgress)}</strong>
                      <div className="manager-coverage-bar">
                        <span style={{ width: `${Math.min(100, Math.max(0, safeNumber(progress?.averageProgress)))}%` }} />
                      </div>
                    </div>
                    <span>{safeNumber(progress?.hoursSpent).toFixed(1)} h</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* TEAM DIRECTORY */}
        <section className="dashboard-panel directory-panel">
          <div className="panel-header directory-panel-header">
            <div>
              <div className="panel-overline">PEOPLE</div>
              <h2>Team Directory</h2>
              <p>Search and access employee analytics.</p>
            </div>
            <div className="directory-tools">
              <div className="dashboard-search">
                <Search size={15} />
                <input
                  id="manager-dashboard-search"
                  name="managerDashboardSearch"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search employee, code or role..."
                  aria-label="Search employee, code or role"
                />
              </div>
              <button
                type="button"
                className="directory-view-btn"
                onClick={() => navigate("/manager/employees")}
              >
                View all <ArrowUpRight size={13} />
              </button>
            </div>
          </div>

          {!loading && filteredTeam.length > 0 && (
            <div className="dashboard-table-wrapper">
              <div className="dashboard-table-head">
                <span>Employee</span>
                <span>Role</span>
                <span>Readiness</span>
                <span>Knowledge Gap</span>
                <span>Status</span>
                <span />
              </div>
              {filteredTeam.map((member) => {
                const readiness = safeNumber(member.readinessPercentage);
                const gap = safeNumber(member.gapPercentage);
                const status = getGapStatus(gap);
                return (
                  <div className="dashboard-table-row" key={member.employeeId}>
                    <div className="table-employee">
                      <div className="table-avatar">{initials(member.employeeName)}</div>
                      <div>
                        <strong>{member.employeeName || "Employee"}</strong>
                        <span>{member.employeeCode || "—"}</span>
                      </div>
                    </div>
                    <span className="table-role">{member.jobRoleName || "—"}</span>
                    <div className="table-metric">
                      <strong>{pct(readiness)}</strong>
                      <div className="table-progress"><span style={{ width: `${Math.min(100, Math.max(0, readiness))}%` }} /></div>
                    </div>
                    <div className="table-metric gap-metric">
                      <strong>{pct(gap)}</strong>
                      <div className="table-progress"><span style={{ width: `${Math.min(100, Math.max(0, gap))}%` }} /></div>
                    </div>
                    <span className={`table-status ${status.className}`}>{status.label}</span>
                    <button
                      type="button"
                      className="table-action"
                      onClick={() => navigate(`/manager/employees?employee=${member.employeeId}`)}
                    >
                      View <ChevronRight size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredTeam.length === 0 && (
            <div className="dashboard-empty">
              <Search size={25} />
              <strong>{team.length === 0 ? "No team data available" : "No matching employees"}</strong>
              <p>{team.length === 0 ? "No employees are currently assigned to this manager." : "Try another search term."}</p>
            </div>
          )}
        </section>

        {/* QUICK ACCESS */}
        <section className="quick-access-section">
          <div className="quick-access-heading">
            <div>
              <div className="panel-overline">MANAGER TOOLS</div>
              <h2>Quick Access</h2>
            </div>
          </div>
          <div className="quick-access-grid">
            <button type="button" onClick={() => navigate("/manager/job-roles")}>
              <div className="quick-icon purple"><Target size={18} /></div>
              <div><strong>Job Roles</strong><span>Explore organizational roles</span></div>
              <ArrowUpRight size={16} />
            </button>
            <button type="button" onClick={() => navigate("/manager/skills")}>
              <div className="quick-icon blue"><Activity size={18} /></div>
              <div><strong>Skill Library</strong><span>Browse organizational skills</span></div>
              <ArrowUpRight size={16} />
            </button>
            <button type="button" onClick={() => navigate("/manager/competency-framework")}>
              <div className="quick-icon green"><ShieldCheck size={18} /></div>
              <div><strong>Competency Framework</strong><span>Review role competencies</span></div>
              <ArrowUpRight size={16} />
            </button>
            <button type="button" onClick={() => navigate("/manager/knowledge-gap-analysis")}>
              <div className="quick-icon orange"><Zap size={18} /></div>
              <div><strong>Gap Analysis</strong><span>Identify knowledge gaps</span></div>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </section>
      </section>
    </ManagerLayout>
  );
};

export default Dashboard;
