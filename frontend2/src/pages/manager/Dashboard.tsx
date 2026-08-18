import React from "react";
import {
  Activity,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";

import "@/styles/manager-dashboard.css";

const stats = [
  {
    title: "MY TEAM MEMBERS",
    value: "12",
    change: "",
    icon: Users,
    type: "purple",
  },
  {
    title: "TEAM COMPETENCY SCORE",
    value: "82.4",
    change: "↑ 4.2%",
    icon: Target,
    type: "purple",
  },
  {
    title: "TEAM KNOWLEDGE GAP",
    value: "12.5%",
    change: "↓ 5.4%",
    icon: Activity,
    type: "red",
  },
  {
    title: "TRAINING COMPLETION",
    value: "94.2%",
    change: "↑ 12.5%",
    icon: GraduationCap,
    type: "green",
  },
  {
    title: "PENDING ASSESSMENTS",
    value: "8",
    change: "↓ 2.1%",
    icon: ClipboardCheck,
    type: "purple",
  },
  {
    title: "TEAM READINESS SCORE",
    value: "88.6",
    change: "↑ 3.8%",
    icon: ShieldCheck,
    type: "green",
  },
];

const heatmap = [
  {
    name: "FRONTEND",
    values: ["92%", "72%", "65%", "88%", "52%", "76%"],
  },
  {
    name: "BACKEND",
    values: ["86%", "82%", "91%", "74%", "55%", "88%"],
  },
  {
    name: "SERVER",
    values: ["89%", "92%", "85%", "65%", "92%", "85%"],
  },
  {
    name: "DATA ENG",
    values: ["62%", "58%", "74%", "90%", "82%", "79%"],
  },
];

const employees = [
  {
    name: "Sarah Chen",
    initials: "SC",
    role: "Cloud Architect",
    competency: "94%",
    gap: "6%",
    training: "100%",
    cert: "CERTIFIED",
    rating: "4.8",
  },
  {
    name: "Marcus Thorne",
    initials: "MT",
    role: "Senior Security Analyst",
    competency: "88%",
    gap: "12%",
    training: "75%",
    cert: "IN PROGRESS",
    rating: "4.5",
  },
  {
    name: "Elena Rodriguez",
    initials: "ER",
    role: "DevOps Engineer",
    competency: "82%",
    gap: "18%",
    training: "60%",
    cert: "READY",
    rating: "4.2",
  },
  {
    name: "David Kim",
    initials: "DK",
    role: "Infrastructure Lead",
    competency: "91%",
    gap: "9%",
    training: "95%",
    cert: "CERTIFIED",
    rating: "4.7",
  },
  {
    name: "Anya Petrova",
    initials: "AP",
    role: "ML Engineer",
    competency: "76%",
    gap: "24%",
    training: "45%",
    cert: "PLANNED",
    rating: "4.0",
  },
];

const recommendations = [
  {
    label: "PERFORMANCE",
    title: "Projected Upskilling ROI",
    description:
      "Completion of the 'Serverless Security' track by Sarah and David is predicted to reduce.",
  },
  {
    label: "CRITICAL GAP",
    title: "ML Infrastructure Shortage",
    description:
      "Anya Petrova's gap in Kubernetes for ML is becoming a blocking factor for project Orion.",
  },
  {
    label: "READINESS",
    title: "Role Transition Opportunity",
    description:
      "Marcus Thorne shows 92% alignment for a Principal Security role.",
  },
];

const approvals = [
  {
    name: "Elena Rodriguez",
    type: "AWS Certified DevOps Engineer Exam",
    cost: "$300",
    priority: "HIGH",
  },
  {
    name: "Marcus Thorne",
    type: "Advanced Pentesting Workshop",
    cost: "$1,200",
    priority: "MEDIUM",
  },
  {
    name: "Anya Petrova",
    type: "PyTorch for Production Course",
    cost: "$450",
    priority: "STANDARD",
  },
];

const events = [
  {
    title: "React 18 Performance Audit",
    type: "ASSESSMENT",
    date: "Oct 24 • 10:00 AM",
    count: "8 Enrolled",
  },
  {
    title: "Zero Trust Architecture",
    type: "TRAINING",
    date: "Oct 25 • 02:00 PM",
    count: "12 Enrolled",
  },
  {
    title: "GCP Cloud Architect Renewal",
    type: "CERTIFICATION",
    date: "Oct 28 • All Day",
    count: "2 Enrolled",
  },
];

export const ManagerDashboard: React.FC = () => {
  return (
    <div className="manager-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="manager-sidebar">

        <div className="manager-brand">
          <div className="manager-brand-icon">
            <Zap size={18} />
          </div>

          <span>OKGIP</span>
        </div>

        <nav className="manager-nav">

          <ManagerNav
            icon={LayoutDashboard}
            label="Dashboard"
            active
          />

          <ManagerNav
            icon={Users}
            label="Employees"
          />

          <ManagerNav
            icon={BookOpen}
            label="Departments"
          />

          <ManagerNav
            icon={BriefcaseIcon}
            label="Job Roles"
          />

          <ManagerNav
            icon={Target}
            label="Skills"
          />

          <ManagerNav
            icon={BookOpen}
            label="Competency Framework"
          />

          <ManagerNav
            icon={Activity}
            label="Knowledge Gap Analysis"
          />

          <ManagerNav
            icon={Zap}
            label="AI Recommendations"
          />

          <ManagerNav
            icon={GraduationCap}
            label="Training Management"
          />

          <ManagerNav
            icon={ClipboardCheck}
            label="Assessments"
          />

          <ManagerNav
            icon={TrendingUp}
            label="Reports & Analytics"
          />

        </nav>

        <div className="manager-sidebar-bottom">

          <ManagerNav
            icon={Settings}
            label="Settings"
          />

          <ManagerNav
            icon={LogOut}
            label="Logout"
          />

          <div className="manager-collapse">
            <ChevronRight size={13} />
            <span>Collapse Sidebar</span>
          </div>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="manager-main">

        {/* TOP BAR */}

        <header className="manager-topbar">

          <div className="manager-breadcrumb">
            <span>Dashboard</span>
            <span>/</span>
            <strong>Overview</strong>
          </div>

          <div className="manager-top-actions">

            <div className="manager-search">
              <Search size={14} />
              <input
                placeholder="Search insights, employees..."
              />
            </div>

            <button className="manager-top-icon">
              <Bell size={16} />
              <span>3</span>
            </button>

            <button className="manager-top-icon">
              <Moon size={16} />
            </button>

            <div className="manager-profile">
              <div className="manager-profile-avatar">
                AR
              </div>

              <div>
                <strong>Alex Rivera</strong>
                <small>Admin</small>
              </div>

              <ChevronRight size={13} />
            </div>

          </div>

        </header>

        {/* ================= CONTENT ================= */}

        <section className="manager-content">

          {/* HEADER */}

          <div className="manager-page-header">

            <div>

              <div className="manager-labels">
                <span>ENGINEERING OPS</span>
                <span>● Predictive Insights Active</span>
              </div>

              <h1>Manager Dashboard</h1>

              <p>
                Real-time workforce intelligence for Team Engineering.
                Track proficiency, bridge gaps, and optimize team impact.
              </p>

            </div>

            <div className="manager-header-actions">

              <button>
                <GraduationCap size={13} />
                Assign Training
              </button>

              <button>
                <CheckCircle2 size={13} />
                Approve Requests
              </button>

              <button>
                <FileCheck2 size={13} />
                Generate Team Report
              </button>

              <button className="primary-action">
                ↓
                Export Dashboard
              </button>

            </div>

          </div>

          {/* ================= STATS ================= */}

          <div className="manager-stats">

            {stats.map((stat) => {

              const Icon = stat.icon;

              return (
                <div
                  className="manager-stat-card"
                  key={stat.title}
                >

                  <div className="manager-stat-top">

                    <div
                      className={`manager-stat-icon ${stat.type}`}
                    >
                      <Icon size={14} />
                    </div>

                    {stat.change && (
                      <span
                        className={`manager-stat-change ${stat.type}`}
                      >
                        {stat.change}
                      </span>
                    )}

                  </div>

                  <span className="manager-stat-title">
                    {stat.title}
                  </span>

                  <strong className="manager-stat-value">
                    {stat.value}
                  </strong>

                  <div className="manager-stat-line">
                    <span />
                  </div>

                </div>
              );
            })}

          </div>

          {/* ================= HEATMAP + AI ================= */}

          <div className="manager-main-grid">

            {/* HEATMAP */}

            <section className="manager-card heatmap-card">

              <CardTitle
                title="Team Knowledge Gap Heatmap"
                subtitle="Proficiency levels across strategic technology domains."
              />

              <div className="heatmap-legend">
                <span>
                  <i className="expert" />
                  EXPERT
                </span>

                <span>
                  <i className="learning" />
                  LEARNING
                </span>

                <span>
                  <i className="critical" />
                  CRITICAL
                </span>
              </div>

              <div className="heatmap">

                <div className="heatmap-header">
                  <span />
                  <span>CLOUD</span>
                  <span>SECURITY</span>
                  <span>DEVOPS</span>
                  <span>DATA</span>
                  <span>AI/ML</span>
                  <span>ARCHITECTURE</span>
                </div>

                {heatmap.map((row) => (

                  <div
                    className="heatmap-row"
                    key={row.name}
                  >

                    <strong>{row.name}</strong>

                    {row.values.map((value, index) => {

                      const numeric =
                        parseInt(value);

                      let level = "expert";

                      if (numeric < 60) {
                        level = "critical";
                      } else if (numeric < 75) {
                        level = "learning";
                      }

                      return (
                        <div
                          className={`heatmap-cell ${level}`}
                          key={index}
                        >
                          {value}
                        </div>
                      );
                    })}

                  </div>

                ))}

              </div>

            </section>

            {/* AI MANAGER INSIGHTS */}

            <section className="manager-card ai-manager-card">

              <div className="ai-manager-heading">

                <div className="ai-icon">
                  <Zap size={17} />
                </div>

                <div>
                  <h2>AI Manager Insights</h2>
                  <p>Predictive team intelligence feed.</p>
                </div>

              </div>

              <div className="ai-image-placeholder">
                <div>
                  <strong>Intelligence Active</strong>
                  <span>UPDATED: 2M AGO</span>
                </div>

                <i />
              </div>

              <div className="recommendation-list">

                {recommendations.map((item) => (

                  <div
                    className="manager-recommendation"
                    key={item.title}
                  >

                    <span>{item.label}</span>

                    <strong>{item.title}</strong>

                    <p>{item.description}</p>

                    <button>
                      Review
                      <ChevronRight size={11} />
                    </button>

                  </div>

                ))}

              </div>

              <button className="view-recommendations">
                Review All Recommendations
                <ChevronRight size={12} />
              </button>

            </section>

          </div>

          {/* ================= TEAM DIRECTORY ================= */}

          <section className="manager-card team-directory">

            <div className="directory-header">

              <CardTitle
                title="Team Directory & Performance"
                subtitle="Granular metrics for each direct report."
              />

              <div className="directory-search">
                <Search size={12} />
                <input placeholder="Search team..." />
              </div>

            </div>

            <div className="employee-table">

              <div className="employee-table-head">
                <span>Employee</span>
                <span>Role</span>
                <span>Competency</span>
                <span>Gap</span>
                <span>Training</span>
                <span>Cert</span>
                <span>Rating</span>
              </div>

              {employees.map((employee) => (

                <div
                  className="employee-table-row"
                  key={employee.name}
                >

                  <div className="employee-name">

                    <div className="employee-avatar">
                      {employee.initials}
                    </div>

                    <div>
                      <strong>{employee.name}</strong>
                      <small>EMP-{Math.floor(Math.random() * 900 + 100)}</small>
                    </div>

                  </div>

                  <span className="employee-role">
                    {employee.role}
                  </span>

                  <strong className="competency">
                    {employee.competency}
                  </strong>

                  <strong className="gap">
                    {employee.gap}
                  </strong>

                  <div className="training-progress">
                    <div>
                      <span
                        style={{
                          width: employee.training,
                        }}
                      />
                    </div>

                    <small>{employee.training}</small>
                  </div>

                  <span
                    className={`cert-status ${
                      employee.cert === "CERTIFIED"
                        ? "certified"
                        : ""
                    }`}
                  >
                    {employee.cert}
                  </span>

                  <span className="rating">
                    ★ {employee.rating}
                  </span>

                </div>

              ))}

            </div>

            <CardFooter text="View Full Team Analytics" />

          </section>

          {/* ================= CHARTS + EMPLOYEE SPOTLIGHT ================= */}

          <div className="manager-lower-grid">

            {/* TEAM GROWTH */}

            <section className="manager-card chart-card">

              <CardTitle
                title="Team Growth Velocity"
                subtitle="Tracking competency vs knowledge gap reduction."
              />

              <div className="line-chart">

                <div className="chart-y">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>

                <div className="chart-area">

                  <div className="growth-line" />

                  <div className="gap-line" />

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

              <div className="chart-legend">
                <span>
                  <i className="purple-dot" />
                  Competency Index
                </span>

                <span>
                  <i className="red-dot" />
                  Knowledge Gap
                </span>
              </div>

            </section>

            {/* TRAINING COMPLETION */}

            <section className="manager-card chart-card">

              <CardTitle
                title="Training Completion Rate"
                subtitle="Monthly percentage of successfully completed learning paths."
              />

              <div className="bar-chart">

                {[
                  "65%",
                  "70%",
                  "72%",
                  "78%",
                  "88%",
                  "94%",
                ].map((height, index) => (

                  <div
                    className="bar-item"
                    key={index}
                  >
                    <div className="bar-wrapper">
                      <div
                        className="bar"
                        style={{
                          height,
                        }}
                      />
                    </div>

                    <span>
                      {[
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                      ][index]}
                    </span>

                  </div>

                ))}

              </div>

              <div className="chart-legend">
                <span>
                  <i className="green-dot" />
                  Completion %
                </span>
              </div>

            </section>

            {/* EMPLOYEE SPOTLIGHT */}

            <section className="manager-card employee-spotlight">

              <div className="spotlight-code">
                EMP-001
              </div>

              <div className="spotlight-avatar">
                SC
                <i />
              </div>

              <h2>Sarah Chen</h2>

              <span className="spotlight-role">
                Cloud Architect
              </span>

              <div className="spotlight-badges">
                <span>LVL 5</span>
                <span>★ Expert</span>
              </div>

              <div className="spotlight-stats">

                <div>
                  <span>COMPETENCY</span>
                  <strong>94%</strong>
                </div>

                <div>
                  <span>GAP INDEX</span>
                  <strong>6%</strong>
                </div>

              </div>

              <h3>Skill Breakdown</h3>

              <SkillBar
                name="Cloud Strategy"
                value="95%"
              />

              <SkillBar
                name="IaC Frameworks"
                value="88%"
              />

              <SkillBar
                name="Security Compliance"
                value="92%"
              />

              <div className="growth-path">

                <small>AI GROWTH PATHWAY</small>

                <strong>
                  "Recommended: Advanced Distributed Systems
                  certification to unlock Principal Role transition."
                </strong>

                <button>
                  Open Talent Map
                  <ChevronRight size={11} />
                </button>

              </div>

              <h3>Pending Actions</h3>

              <button className="pending-action">
                <GraduationCap size={12} />
                Assign Security Track
              </button>

              <button className="pending-action">
                <CalendarDays size={12} />
                Schedule Annual Review
              </button>

              <CardFooter text="Comprehensive Performance Log" />

            </section>

          </div>

          {/* ================= APPROVALS + EVENTS ================= */}

          <div className="manager-bottom-grid">

            <section className="manager-card approval-card">

              <div className="approval-heading">
                <CardTitle
                  title="Team Approval Queue"
                  subtitle="Training and assessment requests requiring your sign-off."
                />

                <span>3 PENDING ACTIONS</span>
              </div>

              <div className="approval-table">

                <div className="approval-head">
                  <span>REQUESTED BY</span>
                  <span>REQUEST TYPE</span>
                  <span>COST/IMPACT</span>
                  <span>PRIORITY</span>
                  <span>ACTIONS</span>
                </div>

                {approvals.map((item) => (

                  <div
                    className="approval-row"
                    key={item.name}
                  >

                    <strong>{item.name}</strong>

                    <span>{item.type}</span>

                    <strong className="cost">
                      {item.cost}
                    </strong>

                    <span
                      className={`priority ${item.priority.toLowerCase()}`}
                    >
                      {item.priority}
                    </span>

                    <div className="approval-actions">
                      <button>
                        ✓
                      </button>

                      <button>
                        +
                      </button>
                    </div>

                  </div>

                ))}

              </div>

              <CardFooter text="Open All Pending Requests" />

            </section>

            {/* EVENTS */}

            <section className="manager-card events-card">

              <div className="events-title">
                <div>
                  <h2>Upcoming Team Events</h2>
                </div>

                <span>CALENDAR</span>
              </div>

              {events.map((event) => (

                <div
                  className="event-item"
                  key={event.title}
                >

                  <div className="event-icon">
                    <CalendarDays size={14} />
                  </div>

                  <div className="event-info">
                    <strong>{event.title}</strong>
                    <span>{event.date}</span>
                  </div>

                  <div className="event-meta">
                    <b>{event.type}</b>
                    <small>{event.count}</small>
                  </div>

                </div>

              ))}

              <CardFooter text="View Full Schedule" />

            </section>

          </div>

          {/* ================= QUICK ACTIONS ================= */}

          <div className="manager-quick-actions">

            <QuickAction
              icon={Plus}
              title="Assign Training"
              subtitle="Select paths for individuals"
            />

            <QuickAction
              icon={Target}
              title="New Assessment"
              subtitle="Create a skill checkpoint"
            />

            <QuickAction
              icon={Award}
              title="Verify Certificates"
              subtitle="Audit team credentials"
            />

            <QuickAction
              icon={Zap}
              title="AI Strategy Sync"
              subtitle="Re-analyze workforce gaps"
            />

          </div>

        </section>

      </main>

    </div>
  );
};

/* =========================================================
   COMPONENTS
   ========================================================= */

function ManagerNav({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`manager-nav-item ${
        active ? "active" : ""
      }`}
    >
      <Icon size={14} />
      <span>{label}</span>
    </div>
  );
}

function CardTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="manager-card-title">
      <h2>{title}</h2>

      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

function CardFooter({
  text,
}: {
  text: string;
}) {
  return (
    <div className="manager-card-footer">
      <button>
        {text}
        <ChevronRight size={12} />
      </button>
    </div>
  );
}

function SkillBar({
  name,
  value,
}: {
  name: string;
  value: string;
}) {
  return (
    <div className="skill-bar-item">

      <div>
        <span>{name}</span>
        <strong>{value}</strong>
      </div>

      <div className="skill-bar-track">
        <span
          style={{
            width: value,
          }}
        />
      </div>

    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <button className="manager-quick-action">

      <div className="quick-action-icon">
        <Icon size={15} />
      </div>

      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>

    </button>
  );
}

/* Small briefcase icon without another package */
function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </svg>
  );
}

export default ManagerDashboard;