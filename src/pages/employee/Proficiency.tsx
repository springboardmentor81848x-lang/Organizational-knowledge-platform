import React, { useEffect, useState } from "react";

import {
  Activity,
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
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import analyticsService from "@/services/analyticsService";
import gapAnalysisService from "@/services/gapAnalysisService";

const levelValue: Record<string, number> = {
  BEGINNER: 25,
  INTERMEDIATE: 50,
  ADVANCED: 75,
  EXPERT: 100,
};

const Proficiency: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [gap, setGap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ============================================================
  // LOAD REAL BACKEND DATA
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [proficiencyResult, gapResult] =
          await Promise.allSettled([
            analyticsService.getMyProficiency(),
            gapAnalysisService.getMyGapAnalysis(),
          ]);

        if (proficiencyResult.status === "fulfilled") {
          console.log(
            "MY PROFICIENCY API RESPONSE =",
            proficiencyResult.value
          );

          setAnalytics(proficiencyResult.value);
        } else {
          console.error(
            "MY PROFICIENCY API ERROR =",
            proficiencyResult.reason
          );
        }

        if (gapResult.status === "fulfilled") {
          console.log(
  "MY GAP ANALYSIS API RESPONSE =",
  JSON.stringify(gapResult.value, null, 2)
);
          setGap(gapResult.value);
        } else {
          console.error(
            "MY GAP ANALYSIS API ERROR =",
            gapResult.reason
          );
        }

        if (
          proficiencyResult.status === "rejected" &&
          gapResult.status === "rejected"
        ) {
          setError(
            "Unable to load proficiency data from the backend."
          );
        }
      } catch (err) {
        console.error("PROFICIENCY LOAD ERROR:", err);

        setError(
          "Unable to connect to the proficiency API."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  // ============================================================
  // NORMALIZE BACKEND RESPONSE
  // ============================================================

  const rows = Array.isArray(analytics)
    ? analytics
    : analytics?.skills ||
      analytics?.proficiencies ||
      analytics?.data ||
      gap?.knowledgeGaps ||
      [];

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="employee-dashboard">

      {/* ======================================================
          SAME EMPLOYEE SIDEBAR
      ====================================================== */}

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

          {/* ACTIVE PAGE */}

          <NavLink
            to="/employee/proficiency"
            className="employee-nav-item active"
          >
            <Target size={15} />
            <span>My Proficiency</span>
          </NavLink>

          <NavLink
            to="/employee/skill-gaps"
            className="employee-nav-item"
          >
            <TrendingUp size={15} />
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

      {/* ======================================================
          PROFICIENCY CONTENT
      ====================================================== */}

      <main className="employee-main">

        <div className="space-y-6">

          {/* HEADER */}

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              My Proficiency
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              See your current proficiency across your employee skills.
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* ==================================================
              PROFICIENCY CARD
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">

              <h2 className="text-base font-bold text-slate-900">
                Skill Proficiency Overview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Live data from /api/analytics/my/proficiency
              </p>

            </div>

            {/* LOADING */}

            {loading ? (

              <div className="flex min-h-40 items-center justify-center gap-2 text-xs text-slate-500">

                <Loader2
                  size={18}
                  className="animate-spin text-purple-600"
                />

                Loading proficiency...

              </div>

            ) : rows.length === 0 ? (

              /* EMPTY */

              <div className="rounded-xl bg-slate-50 px-5 py-10 text-center">

                <Target
                  size={30}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No proficiency records found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  The backend did not return any proficiency records
                  for your account.
                </p>

              </div>

            ) : (

              /* PROFICIENCY LIST */

              <div className="space-y-6">

                {rows.map(
                  (row: any, index: number) => {

                    const name =
                      row.skillName ||
                      row.name ||
                      row.skill ||
                      `Skill ${index + 1}`;

                    const level =
                      row.currentProficiency ||
                      row.proficiencyLevel ||
                      row.proficiency ||
                      row.level ||
                      "Not assessed";

                    const numeric = Number(
                      row.proficiencyPercentage ??
                        row.percentage ??
                        row.score
                    );

                    const value = Number.isFinite(numeric)
                      ? numeric
                      : levelValue[
                          String(level).toUpperCase()
                        ] ?? 0;

                    return (
                      <div
                        key={
                          row.knowledgeGapId ||
                          row.employeeSkillId ||
                          row.id ||
                          index
                        }
                        className="rounded-xl border border-slate-100 p-4"
                      >

                        {/* NAME + LEVEL */}

                        <div className="mb-3 flex items-center justify-between gap-4">

                          <div>

                            <p className="text-sm font-bold text-slate-800">
                              {name}
                            </p>

                            {row.skillCategory && (
                              <p className="mt-1 text-[10px] text-slate-400">
                                {row.skillCategory}
                              </p>
                            )}

                          </div>

                          <span className="rounded-full bg-purple-50 px-3 py-1 text-[10px] font-bold text-purple-700">
                            {level}
                          </span>

                        </div>

                        {/* PROGRESS */}

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full bg-purple-600 transition-all"
                            style={{
                              width: `${Math.min(
                                Math.max(value, 0),
                                100
                              )}%`,
                            }}
                          />

                        </div>

                        {/* PERCENTAGE */}

                        <div className="mt-2 flex justify-between">

                          <span className="text-[10px] text-slate-400">
                            Current proficiency
                          </span>

                          <span className="text-[10px] font-bold text-slate-600">
                            {Math.round(value)}%
                          </span>

                        </div>

                        {/* REQUIRED PROFICIENCY */}

                        {row.requiredProficiency && (
                          <p className="mt-2 text-[10px] text-slate-400">
                            Required proficiency:{" "}
                            <span className="font-semibold text-slate-500">
                              {row.requiredProficiency}
                            </span>
                          </p>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>

          {/* ==================================================
              BACKEND STATUS
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-base font-bold text-slate-900">
              Backend Data Sources
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              This page uses only APIs available in your backend.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Proficiency
                </p>

                <p className="mt-2 text-xs font-bold text-emerald-600">
                  GET /api/analytics/my/proficiency
                </p>

              </div>

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Gap Analysis
                </p>

                <p className="mt-2 text-xs font-bold text-emerald-600">
                  GET /api/gap-analysis/my
                </p>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Proficiency;