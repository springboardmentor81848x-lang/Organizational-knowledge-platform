import React, { useEffect, useState } from "react";

import {
  Activity,
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  ChevronRight,
  FileCheck2,
  GraduationCap,
  Briefcase,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
  ShieldCheck,
  Target,
  TrendingDown,
  User,
  Users,
  Zap,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import gapAnalysisService, {
  GapAnalysisResponse,
} from "@/services/gapAnalysisService";

const SkillGapsPage: React.FC = () => {
  const [data, setData] =
    useState<GapAnalysisResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD REAL BACKEND DATA
  // ============================================================

  useEffect(() => {
    const loadGapAnalysis = async () => {
      try {
        setLoading(true);
        setError("");

        const result =
          await gapAnalysisService.getMyGapAnalysis();

        console.log(
          "MY GAP ANALYSIS RESPONSE =",
          result
        );

        setData(result);
      } catch (err: any) {
        console.error(
          "GAP ANALYSIS ERROR =",
          err
        );

        setError(
          "Unable to load skill gap analysis from /api/gap-analysis/my."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadGapAnalysis();
  }, []);

  // ============================================================
  // SAME EMPLOYEE SIDEBAR
  // ============================================================

  const Sidebar = () => (
    <aside className="employee-sidebar">

      {/* BRAND */}

      <div className="employee-brand">
        <div className="employee-brand-icon">
          <Zap size={19} />
        </div>

        <span>OKGIP</span>
      </div>

      {/* NAVIGATION */}

      <nav className="employee-nav">

        <NavLink
          to="/employee"
          className="employee-nav-item"
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/employee/profile"
          className="employee-nav-item"
        >
          <User size={15} />
          <span>My Profile</span>
        </NavLink>

        <NavLink
          to="/employee/skills"
          className="employee-nav-item"
        >
          <Activity size={15} />
          <span>Skill Profile</span>
        </NavLink>

        <NavLink
          to="/employee/self-assessment"
          className="employee-nav-item"
        >
          <FileCheck2 size={15} />
          <span>Self Assessment</span>
        </NavLink>

        <NavLink
          to="/employee/peer-assessment"
          className="employee-nav-item"
        >
          <Users size={15} />
          <span>Peer Assessment</span>
        </NavLink>

        <NavLink
          to="/employee/proficiency"
          className="employee-nav-item"
        >
          <Target size={15} />
          <span>My Proficiency</span>
        </NavLink>

        {/* ACTIVE */}

        <NavLink
          to="/employee/skill-gaps"
          className="employee-nav-item active"
        >
          <TrendingDown size={15} />
          <span>Skill Gaps</span>
        </NavLink>

        <NavLink
          to="/employee/learning-paths"
          className="employee-nav-item"
        >
          <BookOpen size={15} />
          <span>Learning Paths</span>
        </NavLink>

        <NavLink
          to="/employee/training"
          className="employee-nav-item"
        >
          <GraduationCap size={15} />
          <span>Training</span>
        </NavLink>

        {/* EXPERIENCE */}
<NavLink
  to="/employee/experience"
  className="employee-nav-item"
>
  <Briefcase size={15} />
  <span>Experience</span>
</NavLink>


        <NavLink
          to="/employee/progress"
          className="employee-nav-item"
        >
          <Activity size={15} />
          <span>My Progress</span>
        </NavLink>

        <NavLink
          to="/employee/achievements"
          className="employee-nav-item"
        >
          <Award size={15} />
          <span>Achievements</span>
        </NavLink>

        <NavLink
          to="/employee/certifications"
          className="employee-nav-item"
        >
          <ShieldCheck size={15} />
          <span>Certifications</span>
        </NavLink>

        <NavLink
          to="/employee/mentorship"
          className="employee-nav-item"
        >
          <Users size={15} />
          <span>Mentorship</span>
        </NavLink>

        <NavLink
          to="/employee/notifications"
          className="employee-nav-item"
        >
          <Bell size={15} />
          <span>Notifications</span>
        </NavLink>

      </nav>

      {/* SIDEBAR BOTTOM */}

      <div className="employee-sidebar-bottom">

        <NavLink
          to="/employee/settings"
          className="employee-nav-item"
        >
          <Settings size={15} />
          <span>Settings</span>
        </NavLink>

        <div className="employee-nav-item">
          <LogOut size={15} />
          <span>Logout</span>
        </div>

        <div className="employee-collapse">
          <ChevronRight size={14} />
          <span>Collapse Sidebar</span>
        </div>

      </div>

    </aside>
  );

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="employee-dashboard">

        <Sidebar />

        <main className="employee-main">

          <div className="space-y-6">

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Skill Gaps
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Identify the skills that need your attention.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex min-h-40 items-center justify-center gap-2 text-xs text-slate-500">

                <Loader2
                  className="animate-spin text-purple-600"
                  size={20}
                />

                Analyzing your skills...

              </div>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="employee-dashboard">

        <Sidebar />

        <main className="employee-main">

          <div className="space-y-6">

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Skill Gaps
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Identify the skills that need your attention.
              </p>
            </div>

            <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">

              <AlertTriangle
                className="mb-2"
                size={20}
              />

              {error}

            </div>

          </div>

        </main>

      </div>
    );
  }

  // ============================================================
  // REAL BACKEND DATA
  // ============================================================

  const gaps = data?.knowledgeGaps ?? [];

  const sortedGaps = [...gaps].sort(
    (a, b) =>
      (b.gapPercentage ?? 0) -
      (a.gapPercentage ?? 0)
  );

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="employee-dashboard">

      <Sidebar />

      <main className="employee-main">

        <div className="space-y-6">

          {/* HEADER */}

          <div>

            <h1 className="text-2xl font-bold text-slate-900">
              Skill Gaps
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Identify the skills that need your attention.
            </p>

          </div>

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="grid gap-4 md:grid-cols-3">

            {/* OVERALL GAP */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-xs font-semibold text-slate-500">
                Overall Gap
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {(data?.overallGapPercentage ?? 0).toFixed(1)}%
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Current knowledge gap
              </p>

            </div>

            {/* READINESS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-xs font-semibold text-slate-500">
                Readiness
              </p>

              <p className="mt-2 text-3xl font-bold text-purple-600">
                {(data?.readinessPercentage ?? 0).toFixed(1)}%
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Role readiness
              </p>

            </div>

            {/* GAP SKILLS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-xs font-semibold text-slate-500">
                Skills Needing Attention
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {data?.gapSkills ?? gaps.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Detected by backend
              </p>

            </div>

          </div>

          {/* ==================================================
              EMPLOYEE / ROLE SUMMARY
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="grid gap-4 sm:grid-cols-4">

              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Employee
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {data?.employeeName || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Employee Code
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {data?.employeeCode || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Job Role
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {data?.jobRoleName || "Not assigned"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Total Skills
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {data?.totalSkills ?? 0}
                </p>
              </div>

            </div>

          </div>

          {/* ==================================================
              TOP SKILL GAPS
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">

              <h2 className="text-base font-bold text-slate-900">
                Top Skill Gaps
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Live gap-analysis results
              </p>

            </div>

            {sortedGaps.length === 0 ? (

              <div className="rounded-xl bg-emerald-50 p-6 text-center">

                <Target
                  size={28}
                  className="mx-auto text-emerald-600"
                />

                <p className="mt-3 text-xs font-semibold text-emerald-700">
                  No current skill gaps require attention.
                </p>

                <p className="mt-1 text-[10px] text-emerald-600">
                  The backend returned no knowledge gaps for this employee.
                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {sortedGaps.map((gap) => (

                  <div
                    key={gap.knowledgeGapId}
                    className="rounded-xl border border-slate-100 p-4"
                  >

                    <div className="mb-3 flex items-center justify-between gap-3 text-xs">

                      <div className="flex items-center gap-2">

                        <TrendingDown
                          size={15}
                          className="text-red-500"
                        />

                        <b className="text-slate-800">
                          {gap.skillName}
                        </b>

                      </div>

                      <span className="font-semibold text-red-500">
                        {Math.round(
                          gap.gapPercentage ?? 0
                        )}
                        % gap
                      </span>

                    </div>

                    {/* PROGRESS */}

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-red-400"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              gap.gapPercentage ?? 0,
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                    {/* CURRENT / REQUIRED */}

                    <div className="mt-2 flex justify-between text-[10px] text-slate-400">

                      <span>
                        Current:{" "}
                        {gap.currentProficiency ||
                          "Not assessed"}
                      </span>

                      <span>
                        Required:{" "}
                        {gap.requiredProficiency ||
                          "—"}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

          {/* ==================================================
              NEXT ACTION
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-base font-bold text-slate-900">
              Next Action
            </h2>

            <div className="mt-4 flex items-center gap-3 rounded-xl bg-purple-50 p-4">

              <Target
                size={22}
                className="text-purple-600"
              />

              <div>

                <b className="text-xs text-slate-800">
                  Continue to Learning Paths
                </b>

                <p className="mt-1 text-[11px] text-slate-500">
                  Learning recommendations can be based on
                  the skill gaps detected by the backend.
                </p>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default SkillGapsPage;