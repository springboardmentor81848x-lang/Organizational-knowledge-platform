import React, { useCallback, useEffect, useState } from "react";
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
  UserRound,
  TrendingUp,
  TrendingDown,
  Award,
  ShieldCheck,
  CalendarDays,
  FileText,
  Download,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  ChevronRight,
  MoreVertical,
} from "lucide-react";

import "@/styles/hr-dashboard.css";
// Use the correct API client – adjust import path if needed
import api from "@/api/axiosConfig";

// Types
interface PendingEmployee {
  employeeId: number;
  firstName: string;
  lastName: string;
  officialEmail: string;
  departmentName?: string;
  department?: string;
  status?: string;
}

// ---------- API Service Functions ----------
// We'll implement them inline to avoid dependency issues.
// You can move them to a separate service file if preferred.
const hrService = {
  getPendingEmployees: async (): Promise<PendingEmployee[]> => {
    const response = await api.get('/hr/pending');
    // Backend returns an array directly
    return response.data;
  },
  approveEmployee: async (employeeId: number): Promise<void> => {
    await api.put(`/hr/approve/${employeeId}`);
  },
  rejectEmployee: async (employeeId: number): Promise<void> => {
    await api.put(`/hr/reject/${employeeId}`);
  },
};

const Dashboard: React.FC = () => {
  const [pendingEmployees, setPendingEmployees] = useState<PendingEmployee[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [processingEmployeeId, setProcessingEmployeeId] = useState<number | null>(null);

  const loadPendingEmployees = useCallback(async () => {
    setIsLoadingPending(true);
    setPendingError(null);

    try {
      const employees = await hrService.getPendingEmployees();
      setPendingEmployees(employees);
    } catch (error: any) {
      console.error("Failed to load pending employees:", error);
      setPendingError(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to load pending employees."
      );
    } finally {
      setIsLoadingPending(false);
    }
  }, []);

  useEffect(() => {
    loadPendingEmployees();
  }, [loadPendingEmployees]);

  const handleApprove = async (employeeId: number) => {
    setProcessingEmployeeId(employeeId);
    setPendingError(null);

    try {
      await hrService.approveEmployee(employeeId);
      // Remove from list locally and refresh
      setPendingEmployees((current) =>
        current.filter((emp) => emp.employeeId !== employeeId)
      );
      await loadPendingEmployees();
    } catch (error: any) {
      console.error("Failed to approve employee:", error);
      setPendingError(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to approve employee."
      );
    } finally {
      setProcessingEmployeeId(null);
    }
  };

  const handleReject = async (employeeId: number) => {
    setProcessingEmployeeId(employeeId);
    setPendingError(null);

    try {
      await hrService.rejectEmployee(employeeId);
      setPendingEmployees((current) =>
        current.filter((emp) => emp.employeeId !== employeeId)
      );
      await loadPendingEmployees();
    } catch (error: any) {
      console.error("Failed to reject employee:", error);
      setPendingError(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to reject employee."
      );
    } finally {
      setProcessingEmployeeId(null);
    }
  };

  return (
    <div className="hr-dashboard">

      {/* ================= SIDEBAR ================= */}
      <aside className="hr-sidebar">

        <div className="hr-logo">
          <div className="hr-logo-icon">
            <Brain size={24} />
          </div>
          <span>OKIP</span>
        </div>

        <nav className="hr-nav">

          <a className="hr-nav-item active">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </a>

          <a className="hr-nav-item">
            <Users size={19} />
            <span>Employees</span>
          </a>

          <a className="hr-nav-item">
            <Building2 size={19} />
            <span>Departments</span>
          </a>

          <a className="hr-nav-item">
            <BriefcaseBusiness size={19} />
            <span>Job Roles</span>
          </a>

          <a className="hr-nav-item">
            <Target size={19} />
            <span>Skills</span>
          </a>

          <a className="hr-nav-item">
            <BookOpen size={19} />
            <span>Competency Framework</span>
          </a>

          <a className="hr-nav-item">
            <BarChart3 size={19} />
            <span>Knowledge Gap Analysis</span>
          </a>

          <a className="hr-nav-item">
            <Brain size={19} />
            <span>AI Recommendations</span>
          </a>

          <a className="hr-nav-item">
            <GraduationCap size={19} />
            <span>Training Management</span>
          </a>

          <a className="hr-nav-item">
            <ClipboardCheck size={19} />
            <span>Assessments</span>
          </a>

          <a className="hr-nav-item">
            <BarChart3 size={19} />
            <span>Reports & Analytics</span>
          </a>

        </nav>

        <div className="hr-sidebar-bottom">

          <a className="hr-nav-item">
            <Settings size={19} />
            <span>Settings</span>
          </a>

          <a className="hr-nav-item">
            <LogOut size={19} />
            <span>Logout</span>
          </a>

          <div className="collapse-sidebar">
            <span>‹</span>
            <span>Collapse Sidebar</span>
          </div>

        </div>

      </aside>

      {/* ================= MAIN AREA ================= */}
      <main className="hr-main">

        {/* TOP HEADER */}
        <header className="hr-topbar">

          <div className="breadcrumb">
            <span>Dashboard</span>
            <span>/</span>
            <strong>Overview</strong>
          </div>

          <div className="topbar-actions">

            <div className="search-box">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search insights, employees..."
              />
            </div>

            <button className="icon-button notification">
              <Bell size={19} />
              <span className="notification-dot">3</span>
            </button>

            <button className="icon-button">
              <Sun size={19} />
            </button>

            <div className="hr-profile">

              <div className="profile-avatar">
                <UserRound size={20} />
              </div>

              <div>
                <strong>Alex Rivera</strong>
                <span>HR Manager</span>
              </div>

              <span className="profile-arrow">⌄</span>

            </div>

          </div>

        </header>

        {/* CONTENT */}
        <div className="hr-content">

          {/* PAGE TITLE */}
          <div className="hr-page-header">

            <div>
              <div className="title-badges">
                <span className="executive-badge">
                  EXECUTIVE DASHBOARD
                </span>

                <span className="ai-active-badge">
                  ✨ AI Engine Active
                </span>
              </div>

              <h1>HR Dashboard</h1>

              <p>
                Strategic overview of organizational human capital,
                competency trends, and learning initiatives.
              </p>
            </div>

            <div className="page-actions">

              <button className="secondary-action">
                <GraduationCap size={17} />
                Assign Training
              </button>

              <button className="secondary-action">
                <CalendarDays size={17} />
                Schedule Assessment
              </button>

              <button className="secondary-action">
                <FileText size={17} />
                Generate HR Report
              </button>

              <button className="primary-action">
                <Download size={17} />
                Export Dashboard
              </button>

            </div>

          </div>

          {/* ================= KPI CARDS ================= */}
          <section className="kpi-grid">

            <KpiCard
              icon={<Users />}
              title="TOTAL EMPLOYEES"
              value="1,284"
              change="+4.2%"
              type="positive"
            />

            <KpiCard
              icon={<GraduationCap />}
              title="EMPLOYEES IN TRAINING"
              value="312"
              change="+12.5%"
              type="positive"
            />

            <KpiCard
              icon={<ClipboardCheck />}
              title="PENDING ASSESSMENTS"
              value="48"
              change="-5.4%"
              type="negative"
            />

            <KpiCard
              icon={<Award />}
              title="CERTIFICATION COMPLETION"
              value="92.4%"
              change="+2.7%"
              type="positive"
            />

            <KpiCard
              icon={<Target />}
              title="AVG COMPETENCY SCORE"
              value="78.2"
              change="+1.8%"
              type="positive"
            />

            <KpiCard
              icon={<BookOpen />}
              title="KNOWLEDGE GAP INDEX"
              value="14.2%"
              change="-8.4%"
              type="negative"
            />

          </section>

          {/* ================= MAIN ROW ================= */}
          <section className="main-grid">

            {/* DEPARTMENT DISTRIBUTION */}
            <div className="dashboard-card department-card">

              <div className="card-header">
                <div>
                  <h2>Employee Distribution by Department</h2>
                </div>

                <MoreVertical size={19} />
              </div>

              <div className="department-content">

                <div className="donut-chart">
                  <div className="donut-inner">
                    <strong>1,284</strong>
                    <span>Employees</span>
                  </div>
                </div>

                <div className="department-list">

                  <DepartmentItem
                    color="purple"
                    name="Engineering"
                    count="512"
                    percentage="39.9%"
                  />

                  <DepartmentItem
                    color="green"
                    name="IT & DevOps"
                    count="298"
                    percentage="23.2%"
                  />

                  <DepartmentItem
                    color="teal"
                    name="Sales & Marketing"
                    count="186"
                    percentage="14.5%"
                  />

                  <DepartmentItem
                    color="orange"
                    name="HR & Admin"
                    count="156"
                    percentage="12.1%"
                  />

                  <DepartmentItem
                    color="blue"
                    name="Finance"
                    count="132"
                    percentage="10.3%"
                  />

                </div>

              </div>

              <div className="department-footer">
                <span>Total Departments <strong>12</strong></span>
                <span>Last Updated: 10:30 AM</span>
              </div>

            </div>

            {/* WORKFORCE OVERVIEW */}
            <div className="dashboard-card workforce-card">

              <div className="card-header">
                <h2>Workforce Overview</h2>
              </div>

              <WorkforceRow
                icon={<Users />}
                title="New Joiners (MTD)"
                value="24"
                change="+12% vs LW"
                positive
              />

              <WorkforceRow
                icon={<Clock3 />}
                title="Probation Period"
                value="42"
                change="+6% vs LW"
                positive
              />

              <WorkforceRow
                icon={<Users />}
                title="Active/Stable"
                value="1,042"
                change="+2% vs LW"
                positive
              />

              <WorkforceRow
                icon={<Award />}
                title="High Performance"
                value="118"
                change="+5% vs LW"
                positive
              />

              <WorkforceRow
                icon={<AlertTriangle />}
                title="Requiring Attention"
                value="15"
                change="-5% vs LW"
                positive={false}
              />

            </div>

            {/* AI INTELLIGENCE */}
            <div className="dashboard-card ai-card">

              <div className="ai-card-header">

                <div className="ai-icon">
                  <Brain size={22} />
                </div>

                <div>
                  <h2>AI Workforce Intelligence</h2>
                  <p>Real-time HR analytics & predictions.</p>
                </div>

              </div>

              <div className="ai-visual">
                <Brain size={55} />
                <span>Intelligence Feed Active</span>
                <small>LAST UPDATE: 2M AGO</small>
              </div>

              <AiInsight
                type="RECOMMENDATION"
                title="Cloud Upskilling Required"
                text="AI identifies a 15% skill gap in Serverless Architecture for Engineering team."
              />

              <AiInsight
                type="TREND"
                title="Rising Competency in Sales"
                text="Sales team proficiency has increased by 12% following recent training."
              />

              <AiInsight
                type="ALERT"
                title="Certification Expiry Wave"
                text="24 certifications are expiring within 60 days."
              />

              <button className="ai-button">
                Open Recommendation Center
                <ChevronRight size={17} />
              </button>

            </div>

          </section>

          {/* ================= THREE INFO CARDS ================= */}
          <section className="three-card-grid">

            <InfoCard
              icon={<GraduationCap />}
              title="Training Pulse"
              rows={[
                ["Completion Rate", "88.4%"],
                ["Assigned (Active)", "312"],
                ["Pending Start", "84"],
                ["Overdue", "12"],
                ["Upcoming", "45"],
              ]}
            />

            <InfoCard
              icon={<ClipboardCheck />}
              title="Assessment Center"
              rows={[
                ["Completed (MTD)", "254"],
                ["Avg Proficiency", "72.8%"],
                ["Awaiting Review", "18"],
                ["Upcoming Slots", "142"],
                ["Skill-wise Performance", "+12%"],
              ]}
            />

            <InfoCard
              icon={<Award />}
              title="Certifications"
              rows={[
                ["Active Records", "842"],
                ["Expiring soon", "24"],
                ["Earned (MTD)", "56"],
                ["Renewal Due", "12"],
                ["Market Indexed", "98%"],
              ]}
            />

          </section>

          {/* ================= BOTTOM GRID ================= */}
          <section className="bottom-grid">

            {/* EMPLOYEE GROWTH */}
            <div className="dashboard-card chart-card">

              <div className="card-header">
                <div>
                  <h2>Employee Growth Trend</h2>
                  <p>Workforce growth over the last 6 months.</p>
                </div>

                <span className="growth-badge">
                  ↗ +8.5%
                </span>
              </div>

              <div className="line-chart">

                <div className="chart-line">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="chart-months">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>

              </div>

            </div>

            {/* COMPETENCY COMPARISON */}
            <div className="dashboard-card chart-card">

              <div className="card-header">
                <div>
                  <h2>Dept Competency Comparison</h2>
                  <p>Current level vs organization target.</p>
                </div>
              </div>

              <div className="bar-chart">

                <BarGroup name="Engineering" target="90%" current="78%" />
                <BarGroup name="Sales" target="80%" current="68%" />
                <BarGroup name="Marketing" target="75%" current="58%" />
                <BarGroup name="Operations" target="82%" current="70%" />
                <BarGroup name="HR" target="88%" current="68%" />
                <BarGroup name="Finance" target="84%" current="75%" />

              </div>

            </div>

            {/* EMPLOYEE SPOTLIGHT */}
            <div className="dashboard-card spotlight-card">

              <div className="spotlight-header">
                <h2>Employee Spotlight</h2>
                <span>TOP TALENT</span>
              </div>

              <div className="spotlight-avatar">
                <UserRound size={45} />
              </div>

              <h3>Anya Petrova</h3>
              <p>Senior Cloud Architect</p>

              <div className="spotlight-tags">
                <span>Lv 5</span>
                <span>Expert</span>
              </div>

              <div className="spotlight-stats">

                <div>
                  <span>SKILL SCORE</span>
                  <strong>94.8</strong>
                </div>

                <div>
                  <span>GAP INDEX</span>
                  <strong>2.4%</strong>
                </div>

              </div>

            </div>

            {/* APPROVALS */}
            <div className="dashboard-card approvals-card">

              <div className="card-header">
                <h2>Pending HR Approvals</h2>
                <span className="pending-count">
                  {pendingEmployees.length} TOTAL PENDING
                </span>
              </div>

              {pendingError && (
                <div
                  style={{
                    margin: "10px 14px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "#fff1f2",
                    color: "#be123c",
                    fontSize: "11px",
                    border: "1px solid #fecdd3",
                  }}
                >
                  {pendingError}
                </div>
              )}

              {isLoadingPending ? (
                <div
                  style={{
                    padding: "24px 16px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  Loading pending employees...
                </div>
              ) : pendingEmployees.length === 0 ? (
                <div
                  style={{
                    padding: "24px 16px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  No pending employee approvals.
                </div>
              ) : (
                pendingEmployees.map((employee) => (
                  <ApprovalRow
                    key={employee.employeeId}
                    refId={`EMP-${employee.employeeId}`}
                    name={`${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() || "Employee"}
                    action={
                      employee.departmentName ||
                      employee.department ||
                      "Employee Registration"
                    }
                    priority="PENDING"
                    isProcessing={processingEmployeeId === employee.employeeId}
                    onApprove={() => handleApprove(employee.employeeId)}
                    onReject={() => handleReject(employee.employeeId)}
                  />
                ))
              )}

              <div className="approval-footer">
                Refresh Pending Employees
                <button
                  type="button"
                  onClick={loadPendingEmployees}
                  disabled={isLoadingPending}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: isLoadingPending ? "not-allowed" : "pointer",
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label="Refresh pending employees"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
};


/* ================= COMPONENTS ================= */

interface KpiProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  type: "positive" | "negative";
}

const KpiCard: React.FC<KpiProps> = ({
  icon,
  title,
  value,
  change,
  type,
}) => (
  <div className="kpi-card">

    <div className="kpi-top">

      <div className="kpi-icon">
        {icon}
      </div>

      <span className={`kpi-change ${type}`}>
        {type === "positive" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {change}
      </span>

    </div>

    <span className="kpi-title">{title}</span>

    <strong className="kpi-value">{value}</strong>

  </div>
);


interface DepartmentProps {
  color: string;
  name: string;
  count: string;
  percentage: string;
}

const DepartmentItem: React.FC<DepartmentProps> = ({
  color,
  name,
  count,
  percentage,
}) => (
  <div className="department-item">

    <span className={`department-dot ${color}`}></span>

    <span className="department-name">{name}</span>

    <strong>{count}</strong>

    <span>{percentage}</span>

  </div>
);


interface WorkforceProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  positive: boolean;
}

const WorkforceRow: React.FC<WorkforceProps> = ({
  icon,
  title,
  value,
  change,
  positive,
}) => (
  <div className="workforce-row">

    <div className="workforce-icon">
      {icon}
    </div>

    <span>{title}</span>

    <strong>{value}</strong>

    <small className={positive ? "positive" : "negative"}>
      {change}
    </small>

  </div>
);


interface AiInsightProps {
  type: string;
  title: string;
  text: string;
}

const AiInsight: React.FC<AiInsightProps> = ({
  type,
  title,
  text,
}) => (
  <div className="ai-insight">

    <span className="ai-insight-type">{type}</span>

    <div className="ai-insight-title">
      {title}
      <ChevronRight size={15} />
    </div>

    <p>{text}</p>

  </div>
);


interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  rows: string[][];
}

const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  rows,
}) => (
  <div className="dashboard-card info-card">

    <div className="info-header">

      <div className="info-icon">
        {icon}
      </div>

      <h2>{title}</h2>

    </div>

    {rows.map(([label, value]) => (
      <div className="info-row" key={label}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    ))}

    <div className="audit-link">
      FULL AUDIT VIEW
      <ChevronRight size={15} />
    </div>

  </div>
);


interface BarGroupProps {
  name: string;
  target: string;
  current: string;
}

const BarGroup: React.FC<BarGroupProps> = ({
  name,
  target,
  current,
}) => (
  <div className="bar-group">

    <span>{name}</span>

    <div className="bar-container">
      <div
        className="bar-target"
        style={{ width: target }}
      />

      <div
        className="bar-current"
        style={{ width: current }}
      />
    </div>

    <strong>{current}</strong>

  </div>
);


interface ApprovalProps {
  refId: string;
  name: string;
  action: string;
  priority: string;
  isProcessing?: boolean;
  onApprove: () => void;
  onReject: () => void;
}

const ApprovalRow: React.FC<ApprovalProps> = ({
  refId,
  name,
  action,
  priority,
  isProcessing = false,
  onApprove,
  onReject,
}) => (
  <div className="approval-row">

    <span className="approval-ref">{refId}</span>

    <strong>{name}</strong>

    <span className="approval-action">{action}</span>

    <span className={`priority ${priority.toLowerCase()}`}>
      {priority}
    </span>

    <div className="approval-actions">
      <button
        type="button"
        onClick={onApprove}
        disabled={isProcessing}
        title="Approve employee"
        aria-label={`Approve ${name}`}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: isProcessing ? "not-allowed" : "pointer",
          opacity: isProcessing ? 0.5 : 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <CheckCircle2 size={17} />
      </button>

      <button
        type="button"
        onClick={onReject}
        disabled={isProcessing}
        title="Reject employee"
        aria-label={`Reject ${name}`}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: isProcessing ? "not-allowed" : "pointer",
          opacity: isProcessing ? 0.5 : 1,
          fontSize: "18px",
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>

  </div>
);


export default Dashboard;