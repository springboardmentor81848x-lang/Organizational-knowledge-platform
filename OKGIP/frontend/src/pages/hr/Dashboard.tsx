import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  BriefcaseBusiness,
  Target,
  BookOpen,
  Brain,
  GraduationCap,
  ClipboardCheck,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  Sun,
  TrendingUp,
  Award,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  XCircle,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "@/styles/hr-dashboard.css";
import { hrService, type HRDashboardData, type PendingEmployee } from "@/services/hrService";
import { useAuth } from "@/context/AuthContext";

const emptyDashboard: HRDashboardData = {
  totalEmployees: 0,
  pendingApprovals: 0,
  employeesWithSkillGaps: 0,
  criticalSkillGaps: 0,
  employeesInTraining: 0,
  trainingCompletionRate: 0,
  averageLearningProgress: 0,
  averageAssessmentScore: 0,
  averageSkillImprovement: 0,
  activeMentorships: 0,
  totalSkills: 0,
  totalSkillAssignments: 0,
  departmentSummaries: [],
  topSkillGaps: [],
  trainingStatus: [],
  assessmentSummary: [],
  employeeGrowth: [],
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { email, logout } = useAuth();

  const [dashboard, setDashboard] = useState<HRDashboardData>(emptyDashboard);
  const [pendingEmployees, setPendingEmployees] = useState<PendingEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [processingEmployeeId, setProcessingEmployeeId] = useState<number | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hrService.getDashboard();
      setDashboard(data ?? emptyDashboard);
    } catch (err: any) {
      console.error("Failed to load HR dashboard:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load HR dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPendingEmployees = useCallback(async () => {
    setPendingLoading(true);
    setPendingError(null);
    try {
      const data = await hrService.getPendingEmployees();
      setPendingEmployees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load pending employees:", err);
      setPendingError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load pending employee approvals."
      );
    } finally {
      setPendingLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadDashboard(), loadPendingEmployees()]);
  }, [loadDashboard, loadPendingEmployees]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleApproval = async (employeeId: number, action: "approve" | "reject") => {
    setProcessingEmployeeId(employeeId);
    setPendingError(null);

    try {
      if (action === "approve") {
        await hrService.approveEmployee(employeeId);
      } else {
        await hrService.rejectEmployee(employeeId);
      }

      await Promise.all([loadDashboard(), loadPendingEmployees()]);
    } catch (err: any) {
      console.error(`Failed to ${action} employee:`, err);
      setPendingError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          `Unable to ${action} employee.`
      );
    } finally {
      setProcessingEmployeeId(null);
    }
  };

  const departmentTotal = useMemo(
    () => dashboard.departmentSummaries.reduce((sum, d) => sum + d.employeeCount, 0),
    [dashboard.departmentSummaries]
  );

  const maxGap = useMemo(
    () => Math.max(...dashboard.topSkillGaps.map((g) => g.averageGapPercentage), 1),
    [dashboard.topSkillGaps]
  );

  const maxGrowth = useMemo(
    () => Math.max(...dashboard.employeeGrowth.map((g) => g.count), 1),
    [dashboard.employeeGrowth]
  );

  const topDepartmentSlices = dashboard.departmentSummaries.slice(0, 5);

  const donutGradient = useMemo(() => {
    if (!departmentTotal) return "conic-gradient(#e8eaf0 0 100%)";

    const stops = ["#7436e8", "#13b981", "#19b7a1", "#ff9d38", "#2785e8"];
    let cursor = 0;

    const parts = topDepartmentSlices.map((d, index) => {
      const percent = (d.employeeCount / departmentTotal) * 100;
      const start = cursor;
      cursor += percent;
      return `${stops[index % stops.length]} ${start}% ${cursor}%`;
    });

    return `conic-gradient(${parts.join(", ")})`;
  }, [departmentTotal, topDepartmentSlices]);

  return (
    <div className="hr-dashboard">
      <aside className="hr-sidebar">
        <div className="hr-logo">
          <div className="hr-logo-icon">
            <Brain size={24} />
          </div>
          <span>OKIP</span>
        </div>

        <nav className="hr-nav">
          <button type="button" className="hr-nav-item active" onClick={() => navigate("/hr")}><LayoutDashboard size={19} /><span>Dashboard</span></button>
          <button type="button" className="hr-nav-item" onClick={() => navigate("/hr/employees")}><Users size={19} /><span>Employees</span></button>
          <button type="button" className="hr-nav-item" onClick={() => navigate("/hr/departments")}><Building2 size={19} /><span>Departments</span></button>
          <button type="button" className="hr-nav-item" onClick={() => navigate("/hr/job-roles")}><BriefcaseBusiness size={19} /><span>Job Roles</span></button>
          <button type="button" className="hr-nav-item" onClick={() => navigate("/hr/workforce-skills")}><Target size={19} /><span>Workforce Skills</span></button>
          <button type="button" className="hr-nav-item" onClick={() => navigate("/hr/competency-framework")}><BookOpen size={19} /><span>Competency Framework</span></button>
          <button type="button" className="hr-nav-item" onClick={() => navigate("/hr/knowledge-gaps")}><BarChart3 size={19} /><span>Organization Skill Gaps</span></button>
          <button type="button" className="hr-nav-item" onClick={() => navigate("/hr/ai-recommendations")}><Brain size={19} /><span>AI Recommendations</span></button>
          <button type="button" className="hr-nav-item" onClick={() => navigate("/hr/training-analytics")}><GraduationCap size={19} /><span>Training Analytics</span></button>
          <button type="button" className="hr-nav-item" onClick={() => navigate("/hr/assessments")}><ClipboardCheck size={19} /><span>Assessments</span></button>
          <button type="button" className="hr-nav-item" onClick={() => navigate("/hr/reports")}><BarChart3 size={19} /><span>Reports & Analytics</span></button>
        </nav>

        <div className="hr-sidebar-bottom">
          <button type="button" className="hr-nav-item" onClick={() => navigate("/hr/settings")}><Settings size={19} /><span>Settings</span></button>
          <button
            className="hr-nav-item"
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut size={19} /><span>Logout</span>
          </button>
          <div className="collapse-sidebar"><span>‹</span><span>Collapse Sidebar</span></div>
        </div>
      </aside>

      <main className="hr-main">
        <header className="hr-topbar">
          <div className="breadcrumb">
            <span>Dashboard</span><span>/</span><strong>Overview</strong>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <Search size={17} />
              <input type="text" placeholder="Search employees, skills..." />
            </div>
            <button className="icon-button" type="button" onClick={refreshAll} title="Refresh dashboard">
              <Bell size={19} />
              {dashboard.pendingApprovals > 0 && (
                <span className="notification-dot">{Math.min(dashboard.pendingApprovals, 99)}</span>
              )}
            </button>
            <button className="icon-button" type="button"><Sun size={19} /></button>
            <div className="hr-profile">
              <div className="profile-avatar"><UserRound size={20} /></div>
              <div>
                <strong>HR Manager</strong>
                <span>{email || "Authenticated HR user"}</span>
              </div>
              <span className="profile-arrow">⌄</span>
            </div>
          </div>
        </header>

        <div className="hr-content">
          <div className="hr-page-header">
            <div>
              <div className="title-badges">
                <span className="executive-badge">HR ORGANIZATION OVERVIEW</span>
                <span className="ai-active-badge">Live Database Data</span>
              </div>
              <h1>HR Dashboard</h1>
              <p>Organization-wide workforce, skill-gap, learning and assessment intelligence.</p>
            </div>

            <div className="page-actions">
              <button className="primary-action" type="button" onClick={refreshAll} disabled={loading || pendingLoading}>
                <RefreshCw size={17} className={loading || pendingLoading ? "spin" : ""} />
                Refresh Data
              </button>
            </div>
          </div>

          {error && <div className="hr-error">{error}</div>}

          <section className="kpi-grid">
            <KpiCard icon={<Users />} title="TOTAL EMPLOYEES" value={dashboard.totalEmployees} />
            <KpiCard icon={<Target />} title="EMPLOYEES WITH SKILL GAPS" value={dashboard.employeesWithSkillGaps} />
            <KpiCard icon={<AlertTriangle />} title="CRITICAL SKILL GAPS" value={dashboard.criticalSkillGaps} />
            <KpiCard icon={<GraduationCap />} title="EMPLOYEES IN TRAINING" value={dashboard.employeesInTraining} />
            <KpiCard icon={<TrendingUp />} title="TRAINING COMPLETION" value={`${dashboard.trainingCompletionRate.toFixed(1)}%`} />
            <KpiCard icon={<Brain />} title="AVG LEARNING PROGRESS" value={`${dashboard.averageLearningProgress.toFixed(1)}%`} />
            <KpiCard icon={<TrendingUp />} title="AVG SKILL IMPROVEMENT" value={`${dashboard.averageSkillImprovement.toFixed(1)}%`} />
          </section>

          <section className="main-grid">
            <div className="dashboard-card department-card">
              <div className="card-header">
                <div>
                  <h2>Workforce Skill Inventory by Department</h2>
                  <p>Approved employees grouped by department.</p>
                </div>
              </div>

              <div className="department-content">
                <div className="donut-chart" style={{ background: donutGradient }}>
                  <div className="donut-inner">
                    <strong>{dashboard.totalEmployees}</strong>
                    <span>Employees</span>
                  </div>
                </div>

                <div className="department-list">
                  {topDepartmentSlices.length === 0 ? (
                    <EmptyState text="No department data available." />
                  ) : (
                    topDepartmentSlices.map((d, index) => (
                      <div className="department-item" key={d.departmentName}>
                        <span className={`department-dot ${["purple", "green", "teal", "orange", "blue"][index % 5]}`} />
                        <span className="department-name">{d.departmentName}</span>
                        <strong>{d.employeeCount}</strong>
                        <span>{departmentTotal ? `${((d.employeeCount / departmentTotal) * 100).toFixed(1)}%` : "0%"}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="department-footer">
                <span>Departments <strong>{dashboard.departmentSummaries.length}</strong></span>
                <span>Skill assignments <strong>{dashboard.totalSkillAssignments}</strong></span>
              </div>
            </div>

            <div className="dashboard-card workforce-card">
              <div className="card-header">
                <div>
                  <h2>Organization Overview</h2>
                  <p>Current database-derived indicators.</p>
                </div>
              </div>
              <WorkforceRow icon={<Users />} title="Pending approvals" value={dashboard.pendingApprovals} />
              <WorkforceRow icon={<Target />} title="Unique skills" value={dashboard.totalSkills} />
              <WorkforceRow icon={<Award />} title="Active mentorships" value={dashboard.activeMentorships} />
              <WorkforceRow icon={<ClipboardCheck />} title="Avg assessment score" value={`${dashboard.averageAssessmentScore.toFixed(1)}%`} />
              <WorkforceRow icon={<AlertTriangle />} title="Employees with gaps" value={dashboard.employeesWithSkillGaps} />
            </div>

            <div className="dashboard-card ai-card">
              <div className="ai-card-header">
                <div className="ai-icon"><Brain size={22} /></div>
                <div>
                  <h2>Workforce Intelligence</h2>
                  <p>Priority signals generated from current skill-gap data.</p>
                </div>
              </div>

              {dashboard.topSkillGaps.slice(0, 3).map((gap) => (
                <div className="ai-insight" key={gap.skillName}>
                  <span className="ai-insight-type">{gap.severity}</span>
                  <div className="ai-insight-title">
                    {gap.skillName}
                    <ChevronRight size={15} />
                  </div>
                  <p>
                    {gap.affectedEmployees} employee(s) affected with an average
                    {` ${gap.averageGapPercentage.toFixed(1)}% `}gap.
                  </p>
                </div>
              ))}

              {dashboard.topSkillGaps.length === 0 && (
                <div className="ai-insight"><p>No open skill-gap signals are available.</p></div>
              )}
            </div>
          </section>

          <section className="three-card-grid">
            <InfoCard
              icon={<GraduationCap />}
              title="Training Analytics"
              rows={[
                ["In Training", dashboard.employeesInTraining],
                ["Completion Rate", `${dashboard.trainingCompletionRate.toFixed(1)}%`],
                ["Average Progress", `${dashboard.averageLearningProgress.toFixed(1)}%`],
              ]}
            />
            <InfoCard
              icon={<ClipboardCheck />}
              title="Assessment Analytics"
              rows={[
                ["Average Score", `${dashboard.averageAssessmentScore.toFixed(1)}%`],
                ...dashboard.assessmentSummary.slice(0, 2).map((a): [string, number] => [
                  `${a.assessmentType} Submitted`,
                  a.attempts,
                ]),
              ]}
            />
            <InfoCard
              icon={<Award />}
              title="Workforce Development"
              rows={[
                ["Active Mentorships", dashboard.activeMentorships],
                ["Unique Skills", dashboard.totalSkills],
                ["Skill Assignments", dashboard.totalSkillAssignments],
              ]}
            />
          </section>

          <section className="bottom-grid">
            <div className="dashboard-card chart-card">
              <div className="card-header">
                <div>
                  <h2>Employee Growth</h2>
                  <p>Approved employees created during the last six months.</p>
                </div>
              </div>
              <div className="growth-chart">
                {dashboard.employeeGrowth.map((point) => (
                  <div className="growth-column" key={point.month}>
                    <span className="growth-value">{point.count}</span>
                    <div className="growth-bar-track">
                      <div className="growth-bar" style={{ height: `${Math.max((point.count / maxGrowth) * 100, point.count ? 8 : 2)}%` }} />
                    </div>
                    <span className="growth-month">{point.month}</span>
                  </div>
                ))}
                {dashboard.employeeGrowth.length === 0 && <EmptyState text="No employee growth data available." />}
              </div>
            </div>

            <div className="dashboard-card chart-card">
              <div className="card-header">
                <div>
                  <h2>Organization Skill-Gap Priorities</h2>
                  <p>Highest average open gap by skill.</p>
                </div>
              </div>
              <div className="bar-chart">
                {dashboard.topSkillGaps.map((gap) => (
                  <div className="bar-group" key={gap.skillName}>
                    <span title={gap.skillName}>{gap.skillName}</span>
                    <div className="bar-container">
                      <div className="bar-current" style={{ width: `${(gap.averageGapPercentage / maxGap) * 100}%` }} />
                    </div>
                    <strong>{gap.averageGapPercentage.toFixed(1)}%</strong>
                  </div>
                ))}
                {dashboard.topSkillGaps.length === 0 && <EmptyState text="No open skill gaps." />}
              </div>
            </div>

            <div className="dashboard-card chart-card">
              <div className="card-header">
                <div>
                  <h2>Training Status</h2>
                  <p>Enrollment records by status.</p>
                </div>
              </div>
              <div className="status-list">
                {dashboard.trainingStatus.map((item) => (
                  <div className="status-row" key={item.status}>
                    <span>{formatStatus(item.status)}</span>
                    <strong>{item.count}</strong>
                    <small>{item.percentage.toFixed(1)}%</small>
                  </div>
                ))}
                {dashboard.trainingStatus.length === 0 && <EmptyState text="No training enrollment data." />}
              </div>
            </div>

            <div className="dashboard-card approvals-card">
              <div className="card-header">
                <div>
                  <h2>Pending HR Approvals</h2>
                  <p>Registration requests waiting for HR action.</p>
                </div>
                <span className="pending-count">{pendingEmployees.length} PENDING</span>
              </div>

              {pendingError && <div className="hr-error compact">{pendingError}</div>}

              {pendingLoading ? (
                <div className="hr-loading">Loading pending employees...</div>
              ) : pendingEmployees.length === 0 ? (
                <div className="hr-loading">No pending employee approvals.</div>
              ) : (
                pendingEmployees.slice(0, 6).map((employee) => (
                  <div className="approval-row" key={employee.employeeId}>
                    <span className="approval-ref">{employee.employeeCode || `EMP-${employee.employeeId}`}</span>
                    <strong title={`${employee.firstName} ${employee.lastName}`}>
                      {`${employee.firstName} ${employee.lastName}`.trim()}
                    </strong>
                    <span className="approval-action" title={employee.officialEmail}>{employee.officialEmail}</span>
                    <span className="priority pending">PENDING</span>
                    <div className="approval-actions">
                      <button
                        type="button"
                        onClick={() => handleApproval(employee.employeeId, "approve")}
                        disabled={processingEmployeeId === employee.employeeId}
                        title="Approve employee"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproval(employee.employeeId, "reject")}
                        disabled={processingEmployeeId === employee.employeeId}
                        title="Reject employee"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}

              <div className="approval-footer">
                {pendingEmployees.length > 6 ? `${pendingEmployees.length - 6} more pending` : "All pending requests shown"}
                <button type="button" onClick={loadPendingEmployees} disabled={pendingLoading}>
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const formatStatus = (status: string) =>
  status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const KpiCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number }> = ({
  icon,
  title,
  value,
}) => (
  <div className="kpi-card">
    <div className="kpi-top">
      <div className="kpi-icon">{icon}</div>
    </div>
    <span className="kpi-title">{title}</span>
    <strong className="kpi-value">{value}</strong>
  </div>
);

const WorkforceRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
}> = ({ icon, title, value }) => (
  <div className="workforce-row">
    <div className="workforce-icon">{icon}</div>
    <span>{title}</span>
    <strong>{value}</strong>
  </div>
);

const InfoCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  rows: Array<[string, string | number]>;
}> = ({ icon, title, rows }) => (
  <div className="dashboard-card info-card">
    <div className="info-header">
      <div className="info-icon">{icon}</div>
      <h2>{title}</h2>
    </div>
    {rows.map(([label, value]) => (
      <div className="info-row" key={label}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    ))}
  </div>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="hr-empty">{text}</div>
);

export default Dashboard;
