import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Activity,
  Award,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  FileCheck2,
  GraduationCap,
   Briefcase,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react";

import EmployeeSidebar from "@/components/layout/EmployeeSidebar";
import gapAnalysisService, { GapAnalysisResponse } from "@/services/gapAnalysisService";
import analyticsService from "@/services/analyticsService";
import aiService from "@/services/aiServices";
import profileService from "@/services/profileService";
import { getMySkills } from "@/services/skillService";
import { useAuth } from "@/context/AuthContext";

import "@/styles/employee-dashboard.css";

const menuItems = [
  ["Dashboard", "/employee", LayoutDashboard],
  ["My Profile", "/employee/profile", User],
  ["Skill Profile", "/employee/skills", Activity],
  ["Self Assessment", "/employee/self-assessment", FileCheck2],
  ["Peer Assessment", "/employee/peer-assessment", Users],
  ["My Proficiency", "/employee/proficiency", Target],
  ["Skill Gaps", "/employee/skill-gaps", TrendingUp],
  ["Learning Paths", "/employee/learning-paths", BookOpen],
  ["Training", "/employee/training", GraduationCap],
  ["Experience", "/employee/experience", Briefcase],
  ["My Progress", "/employee/progress", Activity],
  ["Achievements", "/employee/achievements", Award],
  ["Certifications", "/employee/certifications", ShieldCheck],
  ["Mentorship", "/employee/mentorship", Users],
  ["Notifications", "/employee/notifications", Bell],
] as const;

interface CertificationRow {
  id?: number | string;
  name: string;
  provider?: string;
  issueDate?: string;
  expiryDate?: string;
  status?: string;
}

const toPercentage = (value: unknown): number | null => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n >= 0 && n <= 1) return n * 100;
  return Math.max(0, Math.min(100, n));
};

const extractRows = (value: any, keys: string[]): any[] => {
  if (Array.isArray(value)) return value;
  for (const key of keys) {
    if (Array.isArray(value?.[key])) return value[key];
  }
  return [];
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

async function fetchCertifications(): Promise<CertificationRow[]> {
  const response = await fetch("http://localhost:8080/api/certification", {
    headers: {
      Accept: "application/json",
      ...(localStorage.getItem("okip_token")
        ? { Authorization: `Bearer ${localStorage.getItem("okip_token")}` }
        : {}),
    },
  });

  if (!response.ok) throw new Error(`Certification API returned ${response.status}`);
  const data = await response.json();
  const rows = extractRows(data, ["certifications", "data"]);

  return rows.map((row: any, index) => ({
    id: row.certificationId || row.id || index,
    name: row.certificationName || row.name || row.title || "Certification",
    provider: row.provider || row.issuer,
    issueDate: row.issueDate || row.issuedDate,
    expiryDate: row.expiryDate || row.expirationDate,
    status: row.status,
  }));
}

const StatCard = ({ title, value, subtitle, icon: Icon, type }: any) => (
  <div className="employee-stat-card">
    <div className="employee-stat-top">
      <div className={`employee-stat-icon ${type}`}><Icon size={15} /></div>
    </div>
    <span className="employee-stat-title">{title}</span>
    <strong className="employee-stat-value">{value}</strong>
    <span className="employee-stat-subtitle">{subtitle}</span>
    <div className="employee-mini-chart"><span /><span /><span /><span /><span /></div>
  </div>
);

const CardHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: string }) => (
  <div className="employee-card-header">
    <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
    {action && <NavLink to="#" onClick={(e) => e.preventDefault()}>{action}</NavLink>}
  </div>
);

const CardFooter = ({ text, to }: { text: string; to: string }) => (
  <div className="employee-card-footer"><NavLink to={to}>{text}<ChevronRight size={13} /></NavLink></div>
);

const EmptyState = ({ text, action, to }: { text: string; action?: string; to?: string }) => (
  <div className="dashboard-empty-state">
    <span>{text}</span>
    {action && to && <NavLink to={to}>{action}<ChevronRight size={13} /></NavLink>}
  </div>
);

const EmployeeDashboard: React.FC = () => {
  const { logout, email } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysisResponse | null>(null);
  const [proficiency, setProficiency] = useState<any>(null);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [certifications, setCertifications] = useState<CertificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionErrors, setSectionErrors] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      const errors: string[] = [];

      const results = await Promise.allSettled([
        profileService.getMyProfile(),
        getMySkills(),
        gapAnalysisService.getMyGapAnalysis(),
        analyticsService.getMyProficiency(),
        aiService.getMyLearningPath(),
        fetchCertifications(),
      ]);

      if (!mounted) return;

      const [profileResult, skillsResult, gapResult, proficiencyResult, learningResult, certificationResult] = results;

      if (profileResult.status === "fulfilled") setProfile(profileResult.value);
      else errors.push("Profile");

      if (skillsResult.status === "fulfilled") setSkills(Array.isArray(skillsResult.value) ? skillsResult.value : []);
      else errors.push("Skills");

      if (gapResult.status === "fulfilled") setGapAnalysis(gapResult.value);
      else errors.push("Skill gaps");

      if (proficiencyResult.status === "fulfilled") setProficiency(proficiencyResult.value);
      else errors.push("Proficiency");

      if (learningResult.status === "fulfilled") setLearningPath(learningResult.value);
      else errors.push("Learning paths");

      if (certificationResult.status === "fulfilled") setCertifications(certificationResult.value);
      else errors.push("Certifications");

      setSectionErrors(errors);
      setLoading(false);
    };

    void loadDashboard();
    return () => { mounted = false; };
  }, []);

  const proficiencyRows = useMemo(
    () => extractRows(proficiency, ["skills", "proficiencies", "data", "items"]),
    [proficiency]
  );

  const overallProficiency = useMemo(() => {
    const values = proficiencyRows
      .map((row) => toPercentage(row.proficiencyPercentage ?? row.percentage ?? row.score ?? row.currentPercentage))
      .filter((value): value is number => value !== null);
    if (!values.length) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }, [proficiencyRows]);

  const topGaps = useMemo(
    () => (gapAnalysis?.knowledgeGaps ?? [])
      .filter((gap) => Number(gap.gapPercentage ?? 0) > 0)
      .sort((a, b) => Number(b.gapPercentage ?? 0) - Number(a.gapPercentage ?? 0))
      .slice(0, 4),
    [gapAnalysis]
  );

  const learningItems = useMemo(
    () => extractRows(learningPath, ["learningPaths", "paths", "recommendations", "steps", "data", "items"]),
    [learningPath]
  );

  const displayName = profile?.employeeName || email?.split("@")[0]?.replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Employee";
  const initials = displayName.split(/\s+/).filter(Boolean).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();
  const jobRole = profile?.jobRoleName || "Employee";

  // Do not show a misleading 100% readiness when the employee has no skills yet.
  const readiness = skills.length > 0 ? toPercentage(gapAnalysis?.readinessPercentage) : null;
  const skillCount = skills.length;
  const gapCount = gapAnalysis?.gapSkills ?? null;

  return (
    <div className="employee-dashboard">
       
       <EmployeeSidebar />

      <main className="employee-main">
        <header className="employee-topbar">
          <div className="employee-breadcrumb"><span>Dashboard</span><span>/</span><strong>Overview</strong></div>
          <div className="employee-top-actions">
            <div className="employee-search"><Search size={15} /><input placeholder="Search skills, training, people..." /></div>
            <button className="employee-top-icon" type="button" aria-label="Notifications"><Bell size={17} /></button>
            <button className="employee-top-icon" type="button" aria-label="Toggle theme"><Moon size={16} /></button>
            <div className="employee-user"><div className="employee-avatar">{initials || "E"}</div><div className="employee-user-text"><strong>{displayName}</strong><small>{jobRole}</small></div><ChevronRight size={14} /></div>
          </div>
        </header>

        <section className="employee-content">
          <div className="employee-welcome-row">
            <div className="employee-welcome">
              <span className="employee-greeting">EMPLOYEE DASHBOARD</span>
              <h1>Welcome back! 👋</h1>
              <p>Continue your learning journey and grow your skills.</p>
            </div>
            <div className="xp-card">
              <div className="xp-icon"><Target size={20} /></div>
              <div className="xp-level"><span>Role Readiness</span><strong>{readiness === null ? "—" : `${readiness.toFixed(1)}%`}</strong></div>
              <div className="xp-progress-text"><span>Source</span><strong>/api/gap-analysis/my</strong></div>
              <div className="xp-progress"><div className="xp-progress-fill" style={{ width: `${readiness ?? 0}%` }} /></div>
              <span className="xp-percent">{readiness === null ? "—" : `${Math.round(readiness)}%`}</span>
            </div>
          </div>

          {sectionErrors.length > 0 && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              Some sections could not be loaded: {sectionErrors.join(", ")}. The dashboard will still show the data that is available.
            </div>
          )}

          <div className="employee-stats">
            <StatCard title="Overall Proficiency" value={overallProficiency === null ? "—" : `${overallProficiency.toFixed(1)}%`} subtitle="From proficiency API" icon={Target} type="purple" />
            <StatCard title="Skills" value={skillCount} subtitle="From /api/skills" icon={BookOpen} type="green" />
            <StatCard title="Skill Gaps" value={gapCount === null ? "—" : gapCount} subtitle="Needs attention" icon={Activity} type="red" />
            <StatCard title="Learning Hours" value="—" subtitle="Training API not connected" icon={GraduationCap} type="purple" />
            <StatCard title="Achievements" value="—" subtitle="Achievements API not connected" icon={Award} type="orange" />
          </div>

          <div className="employee-three-column">
            <section className="employee-card proficiency-card">
              <CardHeader title="Skill Proficiency Overview" subtitle="Live data from /api/analytics/my/proficiency" />
              {loading ? <LoadingText /> : proficiencyRows.length === 0 ? (
                <EmptyState text="No proficiency records yet. Add skills and complete an assessment to see proficiency here." action="Open Skill Profile" to="/employee/skills" />
              ) : (
                <div className="dashboard-list">
                  {proficiencyRows.slice(0, 5).map((row, index) => {
                    const value = toPercentage(row.proficiencyPercentage ?? row.percentage ?? row.score ?? row.currentPercentage);
                    const name = row.skillName || row.name || row.skill || `Skill ${index + 1}`;
                    return <div key={row.employeeSkillId || row.id || index} className="dashboard-progress-row">
                      <div className="dashboard-progress-heading"><strong>{name}</strong><span>{value === null ? (row.proficiencyLevel || row.proficiency || "Not assessed") : `${Math.round(value)}%`}</span></div>
                      <div className="skill-gap-track"><div className="skill-gap-fill green" style={{ width: `${value ?? 0}%` }} /></div>
                    </div>;
                  })}
                </div>
              )}
              <CardFooter text="View All Skills" to="/employee/proficiency" />
            </section>

            <section className="employee-card gaps-card">
              <CardHeader title="Top Skill Gaps" subtitle="Skills that need your attention" />
              {loading ? <LoadingText /> : topGaps.length === 0 ? (
                <EmptyState text={skills.length === 0 ? "Add your skills first to calculate knowledge gaps." : "No skill gaps detected from the returned requirements."} action={skills.length === 0 ? "Add Skills" : undefined} to={skills.length === 0 ? "/employee/skills" : undefined} />
              ) : (
                <div className="skill-gap-list">
                  {topGaps.map((gap) => {
                    const percentage = toPercentage(gap.gapPercentage) ?? 0;
                    const type = percentage >= 60 ? "red" : percentage >= 40 ? "orange" : percentage >= 20 ? "yellow" : "green";
                    return <div className="skill-gap-item" key={gap.knowledgeGapId}>
                      <div className="skill-gap-heading"><strong>{gap.skillName}</strong><span>{gap.currentProficiency || "—"} → {gap.requiredProficiency || "—"}</span><b>{Math.round(percentage)}%</b></div>
                      <div className="skill-gap-track"><div className={`skill-gap-fill ${type}`} style={{ width: `${percentage}%` }} /></div>
                    </div>;
                  })}
                </div>
              )}
              <CardFooter text="View All Gaps" to="/employee/skill-gaps" />
            </section>

            <section className="employee-card recommendations-card">
              <CardHeader title="Recommended for You" subtitle="Based on your goals and gaps" />
              {loading ? <LoadingText /> : learningItems.length === 0 ? (
                <EmptyState text="No learning recommendations were returned by the backend yet." action="View Learning Paths" to="/employee/learning-paths" />
              ) : (
                <div className="recommendation-list">
                  {learningItems.slice(0, 4).map((item: any, index: number) => (
                    <div className="recommendation-item" key={item.id || item.learningPathId || index}>
                      <div className="recommendation-icon"><BookOpen size={15} /></div>
                      <div className="recommendation-content"><strong>{item.title || item.name || item.skillName || `Learning Step ${index + 1}`}</strong><span className="recommendation-type">{item.type || "LEARNING PATH"}</span><small>{item.match || item.matchPercentage ? `${item.match || item.matchPercentage}% Match` : (item.description || item.reason || "Recommended by the backend")}</small></div>
                    </div>
                  ))}
                </div>
              )}
              <CardFooter text="View All Recommendations" to="/employee/learning-paths" />
            </section>
          </div>

          <div className="employee-two-column">
            <section className="employee-card learning-path-card">
              <CardHeader title="My Learning Path" subtitle="Live data from the AI learning-path API" />
              {loading ? <LoadingText /> : learningItems.length === 0 ? (
                <EmptyState text="No learning path has been returned yet. Recommendations will appear here when the backend provides them." action="Open Learning Paths" to="/employee/learning-paths" />
              ) : (
                <>
                  <div className="learning-steps">
                    {learningItems.slice(0, 5).map((item: any, index: number) => (
                      <LearningStep key={item.id || item.learningPathId || index} number={String(index + 1)} title={item.title || item.name || item.skillName || `Step ${index + 1}`} status={item.status || (index === 0 ? "In Progress" : "Upcoming")} done={String(item.status || "").toLowerCase() === "completed"} active={index === 0 && String(item.status || "").toLowerCase() !== "completed"} />
                    ))}
                  </div>
                  <div className="current-step">
                    <div className="current-step-content"><span>Current Step</span><h3>{learningItems[0]?.title || learningItems[0]?.name || learningItems[0]?.skillName || "Learning step"}</h3><p>{learningItems[0]?.description || learningItems[0]?.reason || "Continue with the next recommended learning step."}</p></div>
                    <div className="current-step-actions"><NavLink className="continue-button" to="/employee/learning-paths">Continue Learning</NavLink><NavLink className="details-button" to="/employee/learning-paths">View Path Details</NavLink></div>
                  </div>
                </>
              )}
            </section>

            <section className="employee-card training-card">
              <CardHeader title="Training Progress" subtitle="Training progress API is not connected yet" />
              <EmptyState text="Training progress will appear here when the employee training/progress API is available." action="Open Training" to="/employee/training" />
              <CardFooter text="View All Training" to="/employee/training" />
            </section>
          </div>

          <div className="employee-three-column lower-grid">
            <section className="employee-card"><CardHeader title="Recent Learning Activity" subtitle="Training progress API is not connected yet" /><EmptyState text="No live learning activity data is available yet." action="Open My Progress" to="/employee/progress" /><CardFooter text="View All Activity" to="/employee/progress" /></section>
            <section className="employee-card"><CardHeader title="Achievements" subtitle="Achievements API is not connected yet" /><EmptyState text="Achievements will appear here when the backend API is available." action="Open Achievements" to="/employee/achievements" /></section>
            <section className="employee-card"><CardHeader title="My Certifications" subtitle="Live data from /api/certification" />{loading ? <LoadingText /> : certifications.length === 0 ? <EmptyState text="No certification records were returned by the backend." action="Add Certification" to="/employee/certifications" /> : <div className="certification-list">{certifications.slice(0, 4).map((certificate) => <div className="certification-item" key={certificate.id || certificate.name}><div className="certificate-icon"><ShieldCheck size={15} /></div><div className="certificate-info"><strong>{certificate.name}</strong>{certificate.provider && <span>{certificate.provider}</span>}<small>{certificate.expiryDate ? `Valid until ${formatDate(certificate.expiryDate)}` : "No expiry returned"}</small></div>{certificate.status && <em>{certificate.status}</em>}</div>)}</div>}<CardFooter text="View All Certifications" to="/employee/certifications" /></section>
          </div>

          <div className="employee-three-column lower-grid">
            <section className="employee-card"><CardHeader title="Upcoming Tasks" subtitle="Assessment/task API is not connected yet" /><EmptyState text="Upcoming assessments and tasks will appear here when their APIs are available." action="Open Self Assessment" to="/employee/self-assessment" /></section>
            <section className="employee-card"><CardHeader title="Mentorship & Knowledge Sharing" subtitle="Mentorship API is not connected yet" /><EmptyState text="Mentorship and knowledge-sharing items will appear here when the backend API is available." action="Open Mentorship" to="/employee/mentorship" /></section>
            <section className="employee-card"><CardHeader title="Notifications" subtitle="Notification API is not connected yet" /><EmptyState text="Notifications will appear here when the backend notification API is available." action="Open Notifications" to="/employee/notifications" /></section>
          </div>

          <div className="employee-quick-actions">
            <QuickAction icon={User} title="Update Skill Profile" subtitle="Keep your skills current" to="/employee/skills" />
            <QuickAction icon={FileCheck2} title="Take Self Assessment" subtitle="Assess your skills" to="/employee/self-assessment" />
            <QuickAction icon={BookOpen} title="Browse Training" subtitle="Explore courses" to="/employee/training" />
            <QuickAction icon={Users} title="Join Study Group" subtitle="Learn with peers" to="/employee/mentorship" />
            <QuickAction icon={CircleHelp} title="Ask a Question" subtitle="Get help from experts" to="/employee/mentorship" />
          </div>
        </section>
      </main>
    </div>
  );
};

const LoadingText = () => <div className="p-8 text-center text-xs text-slate-500">Loading live backend data...</div>;

function LearningStep({ number, title, status, done, active }: { number: string; title: string; status: string; done?: boolean; active?: boolean }) {
  return <div className={`learning-step ${active ? "active" : ""}`}><div className={`learning-number ${done ? "done" : active ? "current" : ""}`}>{number}</div><strong>{title}</strong><span className={done ? "done-text" : active ? "active-text" : ""}>{status}</span></div>;
}

function QuickAction({ icon: Icon, title, subtitle, to }: { icon: React.ElementType; title: string; subtitle: string; to: string }) {
  return <NavLink className="employee-quick-action" to={to}><div className="quick-action-icon"><Icon size={16} /></div><div><strong>{title}</strong><span>{subtitle}</span></div></NavLink>;
}

export default EmployeeDashboard;
