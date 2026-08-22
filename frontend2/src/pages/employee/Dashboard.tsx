import React from "react";
import {
  Activity,
  Award,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Moon,
  PlayCircle,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react";

import "@/styles/employee-dashboard.css";

const stats = [
  {
    title: "Overall Proficiency",
    value: "78.4%",
    subtitle: "Advanced",
    change: "↑ 6.2%",
    icon: Target,
    type: "purple",
  },
  {
    title: "Skills",
    value: "24",
    subtitle: "Total Skills",
    change: "↑ 2",
    icon: BookOpen,
    type: "green",
  },
  {
    title: "Skill Gaps",
    value: "7",
    subtitle: "Needs Attention",
    change: "↓ 1",
    icon: Activity,
    type: "red",
  },
  {
    title: "Learning Hours",
    value: "36.5",
    subtitle: "This Month",
    change: "↑ 12.5%",
    icon: GraduationCap,
    type: "purple",
  },
  {
    title: "Achievements",
    value: "12",
    subtitle: "Badges Earned",
    change: "↑ 1",
    icon: Award,
    type: "orange",
  },
];

const skillGaps = [
  {
    name: "Advanced React",
    level: "Level 3",
    gap: "40%",
    width: "40%",
    type: "red",
  },
  {
    name: "System Design",
    level: "Level 3",
    gap: "45%",
    width: "45%",
    type: "orange",
  },
  {
    name: "Kubernetes",
    level: "Level 2",
    gap: "55%",
    width: "55%",
    type: "yellow",
  },
  {
    name: "AWS Services",
    level: "Level 2",
    gap: "60%",
    width: "60%",
    type: "yellow",
  },
  {
    name: "CI/CD Pipelines",
    level: "Level 2",
    gap: "65%",
    width: "65%",
    type: "green",
  },
];

const recommendations = [
  {
    title: "Advanced React Patterns",
    type: "COURSE",
    match: "95% Match",
    icon: BookOpen,
  },
  {
    title: "System Design Basics",
    type: "LEARNING PATH",
    match: "92% Match",
    icon: Target,
  },
  {
    title: "Kubernetes Essentials",
    type: "COURSE",
    match: "89% Match",
    icon: Zap,
  },
  {
    title: "AWS Solutions Architect",
    type: "CERTIFICATION",
    match: "85% Match",
    icon: ShieldCheck,
  },
];

const activities = [
  {
    title: "Advanced React Concepts",
    subtitle: "Course Progress",
    progress: "65%",
    time: "2 hours ago",
    status: "progress",
  },
  {
    title: "System Design Fundamentals",
    subtitle: "Learning Path",
    progress: "Completed",
    time: "1 day ago",
    status: "completed",
  },
  {
    title: "AWS S3 Deep Dive",
    subtitle: "Course Progress",
    progress: "75%",
    time: "2 days ago",
    status: "progress",
  },
  {
    title: "React Performance Optimization",
    subtitle: "Video Watch",
    progress: "Completed",
    time: "3 days ago",
    status: "completed",
  },
  {
    title: "CI/CD with GitHub Actions",
    subtitle: "Course Progress",
    progress: "40%",
    time: "3 days ago",
    status: "progress",
  },
];

const achievements = [
  {
    title: "Quick Learner",
    description: "Completed 5 courses in 30 days",
    date: "May 12, 2025",
    icon: Zap,
  },
  {
    title: "Consistent Learner",
    description: "7 day learning streak",
    date: "May 10, 2025",
    icon: Target,
  },
  {
    title: "Skill Master",
    description: "Reached Advanced level in React",
    date: "May 8, 2025",
    icon: Award,
  },
  {
    title: "Knowledge Seeker",
    description: "Completed 10 learning paths",
    date: "May 5, 2025",
    icon: BookOpen,
  },
];

const certifications = [
  {
    title: "AWS Solutions Architect",
    subtitle: "Associate",
    valid: "Valid until Dec 15, 2025",
    status: "Active",
    icon: ShieldCheck,
  },
  {
    title: "Google Cloud Professional",
    subtitle: "Cloud Engineer",
    valid: "Valid until Aug 20, 2025",
    status: "Active",
    icon: ShieldCheck,
  },
  {
    title: "Certified Scrum Master",
    subtitle: "CSM",
    valid: "Valid until Feb 10, 2026",
    status: "Active",
    icon: FileCheck2,
  },
];

const tasks = [
  {
    title: "Self Assessment",
    description: "React Advanced Level",
    due: "Due Tomorrow",
    urgent: true,
  },
  {
    title: "Peer Assessment",
    description: "Design Team Assignment",
    due: "Due in 3 days",
  },
  {
    title: "Learning Path Quiz",
    description: "Advanced React Concepts",
    due: "Due in 5 days",
  },
];

const mentorship = [
  {
    name: "John Doe",
    title: "Tech Talk: Microservices",
    action: "Join Live",
  },
  {
    name: "Jane Smith",
    title: "Frontend Best Practices",
    action: "Watch Now",
  },
  {
    name: "Michael Brown",
    title: "Career Growth Session",
    action: "Register",
  },
];

const notifications = [
  {
    text: "Your assessment has been reviewed",
    time: "2 hours ago",
  },
  {
    text: "New course recommended for you",
    time: "1 day ago",
  },
  {
    text: "John Doe accepted your mentorship request",
    time: "2 days ago",
  },
  {
    text: "Your certificate is expiring soon",
    time: "3 days ago",
  },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="employee-dashboard">
      {/* ================= SIDEBAR ================= */}

      <aside className="employee-sidebar">
        <div className="employee-brand">
          <div className="employee-brand-icon">
            <Zap size={19} />
          </div>

          <span>OKGIP</span>
        </div>

        <nav className="employee-nav">
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          <NavItem icon={User} label="My Profile" />
          <NavItem icon={Activity} label="Skill Profile" />
          <NavItem icon={FileCheck2} label="Self Assessment" />
          <NavItem icon={Users} label="Peer Assessment" />
          <NavItem icon={Target} label="My Proficiency" />
          <NavItem icon={TrendingUp} label="Skill Gaps" />
          <NavItem icon={BookOpen} label="Learning Paths" />
          <NavItem icon={GraduationCap} label="Training" />
          <NavItem icon={Activity} label="My Progress" />
          <NavItem icon={Award} label="Achievements" />
          <NavItem icon={ShieldCheck} label="Certifications" />
          <NavItem icon={Users} label="Mentorship" />
          <NavItem icon={Bell} label="Notifications" />
        </nav>

        <div className="employee-sidebar-bottom">
          <NavItem icon={Settings} label="Settings" />
          <NavItem icon={LogOut} label="Logout" />

          <div className="employee-collapse">
            <ChevronRight size={14} />
            <span>Collapse Sidebar</span>
          </div>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="employee-main">
        {/* TOP BAR */}

        <header className="employee-topbar">
          <div className="employee-breadcrumb">
            <span>Dashboard</span>
            <span>/</span>
            <strong>Overview</strong>
          </div>

          <div className="employee-top-actions">
            <div className="employee-search">
              <Search size={15} />
              <input placeholder="Search skills, training, people..." />
            </div>

            <button className="employee-top-icon">
              <Bell size={17} />
              <span className="employee-notification-count">3</span>
            </button>

            <button className="employee-top-icon">
              <Moon size={16} />
            </button>

            <div className="employee-user">
              <div className="employee-avatar">SJ</div>

              <div className="employee-user-text">
                <strong>Sarah Johnson</strong>
                <small>Software Engineer</small>
              </div>

              <ChevronRight size={14} />
            </div>
          </div>
        </header>

        <section className="employee-content">
          {/* ================= WELCOME ================= */}

          <div className="employee-welcome-row">
            <div className="employee-welcome">
              <span className="employee-greeting">
                Good Morning, Sarah! 👋
              </span>

              <h1>Welcome back! 👋</h1>

              <p>
                Continue your learning journey and grow your skills.
              </p>
            </div>

            <div className="xp-card">
              <div className="xp-icon">
                <Star size={20} />
              </div>

              <div className="xp-level">
                <span>Current Level</span>
                <strong>Advanced</strong>
              </div>

              <div className="xp-progress-text">
                <span>XP Progress</span>
                <strong>2,450 / 4,000 XP</strong>
              </div>

              <div className="xp-progress">
                <div className="xp-progress-fill" />
              </div>

              <span className="xp-percent">61%</span>
            </div>
          </div>

          {/* ================= STATS ================= */}

          <div className="employee-stats">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div className="employee-stat-card" key={stat.title}>
                  <div className="employee-stat-top">
                    <div className={`employee-stat-icon ${stat.type}`}>
                      <Icon size={15} />
                    </div>

                    <span
                      className={`employee-stat-change ${stat.type}`}
                    >
                      {stat.change}
                    </span>
                  </div>

                  <span className="employee-stat-title">
                    {stat.title}
                  </span>

                  <strong className="employee-stat-value">
                    {stat.value}
                  </strong>

                  <span className="employee-stat-subtitle">
                    {stat.subtitle}
                  </span>

                  <div className="employee-mini-chart">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= SKILLS / GAPS / RECOMMENDATION ================= */}

          <div className="employee-three-column">
            {/* SKILL PROFICIENCY */}

            <section className="employee-card proficiency-card">
              <CardHeader
                title="Skill Proficiency Overview"
                subtitle=""
              />

              <div className="radar-wrapper">
                <div className="radar-chart">
                  <div className="radar-ring ring-1" />
                  <div className="radar-ring ring-2" />
                  <div className="radar-ring ring-3" />
                  <div className="radar-ring ring-4" />

                  <div className="radar-line line-top" />
                  <div className="radar-line line-right-top" />
                  <div className="radar-line line-right-bottom" />
                  <div className="radar-line line-left-bottom" />
                  <div className="radar-line line-left-top" />

                  <div className="radar-polygon" />

                  <span className="radar-label top">
                    Technical Skills
                    <strong>85%</strong>
                  </span>

                  <span className="radar-label right-top">
                    Problem Solving
                    <strong>80%</strong>
                  </span>

                  <span className="radar-label right-bottom">
                    Communication
                    <strong>75%</strong>
                  </span>

                  <span className="radar-label left-bottom">
                    Leadership
                    <strong>65%</strong>
                  </span>

                  <span className="radar-label left-top">
                    Domain
                    Knowledge
                    <strong>90%</strong>
                  </span>
                </div>
              </div>

              <div className="radar-legend">
                <span>
                  <i className="legend-purple" />
                  Your Level
                </span>

                <span>
                  <i className="legend-gray" />
                  Organization Avg.
                </span>
              </div>

              <CardFooter text="View All Skills" />
            </section>

            {/* SKILL GAPS */}

            <section className="employee-card gaps-card">
              <CardHeader
                title="Top Skill Gaps"
                subtitle="Skills that need your attention"
              />

              <div className="skill-gap-list">
                {skillGaps.map((gap) => (
                  <div className="skill-gap-item" key={gap.name}>
                    <div className="skill-gap-heading">
                      <strong>{gap.name}</strong>

                      <span>{gap.level}</span>

                      <b>{gap.gap}</b>
                    </div>

                    <div className="skill-gap-track">
                      <div
                        className={`skill-gap-fill ${gap.type}`}
                        style={{ width: gap.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <CardFooter text="View All Gaps" />
            </section>

            {/* RECOMMENDATIONS */}

            <section className="employee-card recommendations-card">
              <CardHeader
                title="Recommended for You"
                subtitle="Based on your goals and gaps"
              />

              <div className="recommendation-list">
                {recommendations.map((recommendation) => {
                  const Icon = recommendation.icon;

                  return (
                    <div
                      className="recommendation-item"
                      key={recommendation.title}
                    >
                      <div className="recommendation-icon">
                        <Icon size={15} />
                      </div>

                      <div className="recommendation-content">
                        <strong>{recommendation.title}</strong>

                        <span className="recommendation-type">
                          {recommendation.type}
                        </span>

                        <small>{recommendation.match}</small>
                      </div>
                    </div>
                  );
                })}
              </div>

              <CardFooter text="View All Recommendations" />
            </section>
          </div>

          {/* ================= LEARNING PATH ================= */}

          <div className="employee-two-column">
            <section className="employee-card learning-path-card">
              <div className="learning-path-header">
                <div>
                  <h2>My Learning Path</h2>
                  <p>Full Stack Developer Path</p>
                </div>

                <span className="complete-badge">82% Complete</span>
              </div>

              <div className="learning-steps">
                <LearningStep
                  number="1"
                  title="HTML & CSS"
                  status="Completed"
                  done
                />

                <LearningStep
                  number="2"
                  title="JavaScript"
                  status="Completed"
                  done
                />

                <LearningStep
                  number="3"
                  title="React Basics"
                  status="Completed"
                  done
                />

                <LearningStep
                  number="4"
                  title="Advanced React"
                  status="In Progress"
                  active
                />

                <LearningStep
                  number="5"
                  title="Node.js"
                  status="Upcoming"
                />
              </div>

              <div className="current-step">
                <div className="current-step-content">
                  <span>Current Step</span>

                  <h3>Advanced React Concepts</h3>

                  <p>
                    Learn advanced patterns, hooks, context API, and
                    performance optimization.
                  </p>

                  <div className="current-progress">
                    <div>
                      <span />
                    </div>

                    <strong>65%</strong>
                  </div>
                </div>

                <div className="current-step-actions">
                  <button className="continue-button">
                    Continue Learning
                  </button>

                  <button className="details-button">
                    View Path Details
                  </button>
                </div>
              </div>
            </section>

            {/* TRAINING PROGRESS */}

            <section className="employee-card training-card">
              <CardHeader
                title="Training Progress"
                subtitle="Overview of your training activities"
              />

              <div className="training-content">
                <div className="training-donut">
                  <div>
                    <strong>12</strong>
                    <span>In Progress</span>
                  </div>
                </div>

                <div className="training-legend">
                  <TrainingLegend
                    color="green"
                    label="Completed"
                    value="18"
                    percent="45%"
                  />

                  <TrainingLegend
                    color="purple"
                    label="In Progress"
                    value="12"
                    percent="30%"
                  />

                  <TrainingLegend
                    color="gray"
                    label="Not Started"
                    value="10"
                    percent="25%"
                  />
                </div>
              </div>

              <CardFooter text="View All Training" />
            </section>
          </div>

          {/* ================= THREE CARDS ================= */}

          <div className="employee-three-column lower-grid">
            {/* RECENT ACTIVITY */}

            <section className="employee-card">
              <CardHeader
                title="Recent Learning Activity"
                subtitle="Your latest learning activities"
                action="View All"
              />

              <div className="activity-list">
                {activities.map((activity) => (
                  <div className="activity-item" key={activity.title}>
                    <div className="activity-icon">
                      <BookOpen size={14} />
                    </div>

                    <div className="activity-info">
                      <strong>{activity.title}</strong>
                      <span>{activity.subtitle}</span>
                    </div>

                    <div className="activity-progress">
                      <strong
                        className={
                          activity.status === "completed"
                            ? "completed"
                            : ""
                        }
                      >
                        {activity.progress}
                      </strong>

                      <small>{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>

              <CardFooter text="View All Activity" />
            </section>

            {/* ACHIEVEMENTS */}

            <section className="employee-card">
              <CardHeader
                title="Achievements"
                subtitle="Your recent achievements"
                action="View All"
              />

              <div className="achievement-list">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;

                  return (
                    <div
                      className="achievement-item"
                      key={achievement.title}
                    >
                      <div className="achievement-icon">
                        <Icon size={15} />
                      </div>

                      <div className="achievement-info">
                        <strong>{achievement.title}</strong>
                        <span>{achievement.description}</span>
                      </div>

                      <small>{achievement.date}</small>
                    </div>
                  );
                })}
              </div>

              <div className="achievement-footer">
                <strong>12</strong>
                <span>Badges Earned</span>

                <strong>#4</strong>
                <span>Dept Rank</span>
              </div>
            </section>

            {/* CERTIFICATIONS */}

            <section className="employee-card">
              <CardHeader
                title="My Certifications"
                subtitle="Manage your certifications"
                action="View All"
              />

              <div className="certification-list">
                {certifications.map((certificate) => {
                  const Icon = certificate.icon;

                  return (
                    <div
                      className="certification-item"
                      key={certificate.title}
                    >
                      <div className="certificate-icon">
                        <Icon size={15} />
                      </div>

                      <div className="certificate-info">
                        <strong>{certificate.title}</strong>
                        <span>{certificate.subtitle}</span>
                        <small>{certificate.valid}</small>
                      </div>

                      <em>{certificate.status}</em>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ================= BOTTOM THREE ================= */}

          <div className="employee-three-column lower-grid">
            {/* TASKS */}

            <section className="employee-card">
              <CardHeader
                title="Upcoming Tasks"
                subtitle="Your pending assessments and tasks"
                action="View All"
              />

              <div className="task-list">
                {tasks.map((task) => (
                  <div className="task-item" key={task.title}>
                    <div className="task-icon">
                      <FileCheck2 size={14} />
                    </div>

                    <div className="task-content">
                      <strong>{task.title}</strong>
                      <span>{task.description}</span>
                    </div>

                    <em className={task.urgent ? "urgent" : ""}>
                      {task.due}
                    </em>
                  </div>
                ))}
              </div>
            </section>

            {/* MENTORSHIP */}

            <section className="employee-card">
              <CardHeader
                title="Mentorship & Knowledge Sharing"
                subtitle="Connect and learn from your peers"
                action="View All"
              />

              <div className="mentorship-list">
                {mentorship.map((mentor) => (
                  <div className="mentor-item" key={mentor.name}>
                    <div className="mentor-avatar">
                      {mentor.name
                        .split(" ")
                        .map((x) => x[0])
                        .join("")}
                    </div>

                    <div className="mentor-info">
                      <strong>{mentor.title}</strong>
                      <span>With {mentor.name}</span>
                    </div>

                    <button>{mentor.action}</button>
                  </div>
                ))}
              </div>
            </section>

            {/* NOTIFICATIONS */}

            <section className="employee-card">
              <CardHeader
                title="Notifications"
                subtitle="Stay updated with important alerts"
                action="View All"
              />

              <div className="notification-list">
                {notifications.map((notification) => (
                  <div
                    className="notification-item"
                    key={notification.text}
                  >
                    <div className="notification-icon">
                      <Bell size={13} />
                    </div>

                    <span>{notification.text}</span>

                    <small>{notification.time}</small>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ================= QUICK ACTIONS ================= */}

          <div className="employee-quick-actions">
            <QuickAction
              icon={User}
              title="Update Skill Profile"
              subtitle="Keep your skills current"
            />

            <QuickAction
              icon={FileCheck2}
              title="Take Self Assessment"
              subtitle="Assess your skills"
            />

            <QuickAction
              icon={BookOpen}
              title="Browse Training"
              subtitle="Explore courses"
            />

            <QuickAction
              icon={Users}
              title="Join Study Group"
              subtitle="Learn with peers"
            />

            <QuickAction
              icon={CircleHelp}
              title="Ask a Question"
              subtitle="Get help from experts"
            />
          </div>
        </section>
      </main>
    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */

function NavItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <div className={`employee-nav-item ${active ? "active" : ""}`}>
      <Icon size={15} />
      <span>{label}</span>
    </div>
  );
}

function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: string;
}) {
  return (
    <div className="employee-card-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {action && (
        <button>
          {action}
        </button>
      )}
    </div>
  );
}

function CardFooter({ text }: { text: string }) {
  return (
    <div className="employee-card-footer">
      <button>
        {text}
        <ChevronRight size={13} />
      </button>
    </div>
  );
}

function LearningStep({
  number,
  title,
  status,
  done,
  active,
}: {
  number: string;
  title: string;
  status: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className={`learning-step ${active ? "active" : ""}`}>
      <div
        className={`learning-number ${
          done ? "done" : active ? "current" : ""
        }`}
      >
        {number}
      </div>

      <strong>{title}</strong>

      <span className={done ? "done-text" : active ? "active-text" : ""}>
        {status}
      </span>
    </div>
  );
}

function TrainingLegend({
  color,
  label,
  value,
  percent,
}: {
  color: string;
  label: string;
  value: string;
  percent: string;
}) {
  return (
    <div className="training-legend-row">
      <span className={`training-dot ${color}`} />

      <span>{label}</span>

      <strong>{value}</strong>

      <small>{percent}</small>
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
    <button className="employee-quick-action">
      <div className="quick-action-icon">
        <Icon size={16} />
      </div>

      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </button>
  );
}

export default EmployeeDashboard;