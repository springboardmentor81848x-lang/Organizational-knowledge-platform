import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  ChevronRight,
  Briefcase,
  FileCheck2,
  GraduationCap,
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

import API from "@/api/axios";

interface PriorityGap {
  skillName: string;
  gapType: string;
  gapPercentage: number;
  priority: string;
}

interface LearningPath {
  phase: number;
  title: string;
  duration: string;
  reason: string;
}

interface RecommendedCourse {
  trainingId: number;
  trainingName: string;
  provider: string;
  level: string;
  duration: string;
  courseUrl: string;
}

interface AIRecommendation {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  priorityGaps: PriorityGap[];
  learningPath: LearningPath[];
  recommendedCourses: RecommendedCourse[];
}

interface EmployeeProfile {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
}

const LearningPaths: React.FC = () => {
  const [data, setData] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD REAL AI RECOMMENDATION
  // ============================================================

  useEffect(() => {
    const loadAIRecommendation = async () => {
      try {
        setLoading(true);
        setError("");

        // --------------------------------------------------------
        // 1. Get logged-in employee profile
        // --------------------------------------------------------

        const profileResponse =
          await API.get<EmployeeProfile>("/profile");

        const employeeId = profileResponse.data.employeeId;

        console.log(
          "EMPLOYEE PROFILE FOR AI =",
          profileResponse.data
        );

        if (!employeeId) {
          throw new Error(
            "Employee ID was not returned by the profile API."
          );
        }

        // --------------------------------------------------------
        // 2. Ask backend to generate Gemini recommendation
        // --------------------------------------------------------

        const response =
          await API.post<AIRecommendation>(
            `/ai/recommendation/${employeeId}`
          );

        console.log(
          "AI RECOMMENDATION RESPONSE =",
          response.data
        );

        console.log(
          "AI RECOMMENDATION JSON =",
          JSON.stringify(response.data, null, 2)
        );

        setData(response.data);
      } catch (err: any) {
        console.error(
          "AI RECOMMENDATION ERROR =",
          err?.response?.data || err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to generate AI recommendations from the backend."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadAIRecommendation();
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

        <NavLink
          to="/employee/skill-gaps"
          className="employee-nav-item"
        >
          <TrendingDown size={15} />
          <span>Skill Gaps</span>
        </NavLink>

        {/* ACTIVE */}

        <NavLink
          to="/employee/learning-paths"
          className="employee-nav-item active"
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
              Learning Paths
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Personalized learning recommendations generated by AI
              based on your current skills and knowledge gaps.
            </p>
          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
              <div className="flex min-h-[250px] items-center justify-center">
                <div className="text-center">

                  <Loader2
                    size={32}
                    className="mx-auto animate-spin text-purple-600"
                  />

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Generating your AI learning recommendations...
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Gemini is analyzing your skills and knowledge gaps.
                  </p>

                </div>
              </div>
            </div>
          )}

          {/* ==================================================
              ERROR
          ================================================== */}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

              <div className="flex items-start gap-3">

                <AlertCircle
                  size={22}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <div>

                  <p className="text-sm font-bold text-red-700">
                    Unable to generate AI recommendations
                  </p>

                  <p className="mt-2 text-xs leading-5 text-red-600">
                    {error}
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* ==================================================
              AI DATA
          ================================================== */}

          {!loading && !error && data && (

            <>
              {/* EMPLOYEE AI HEADER */}

              <div className="rounded-2xl bg-purple-600 p-6 text-white shadow-sm">

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
                      AI-Powered Recommendation
                    </p>

                    <h2 className="mt-2 text-xl font-bold">
                      Personalized for {data.employeeName}
                    </h2>

                    <p className="mt-1 text-xs text-purple-100">
                      Employee Code: {data.employeeCode}
                    </p>

                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                    <Zap size={28} />
                  </div>

                </div>

              </div>

              {/* ==================================================
                  PRIORITY GAPS
              ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6">

                  <h2 className="text-base font-bold text-slate-900">
                    Priority Skill Gaps
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Skills identified by the AI recommendation engine
                    as requiring attention.
                  </p>

                </div>

                {data.priorityGaps.length === 0 ? (

                  <div className="rounded-xl bg-emerald-50 p-6 text-center">

                    <p className="text-sm font-semibold text-emerald-700">
                      No priority skill gaps were identified.
                    </p>

                    <p className="mt-1 text-xs text-emerald-600">
                      Your current skill profile does not contain
                      any AI-detected priority gaps.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-4">

                    {data.priorityGaps.map(
                      (gap, index) => (

                        <div
                          key={`${gap.skillName}-${index}`}
                          className="rounded-xl border border-slate-200 p-4"
                        >

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                              <div className="flex items-center gap-2">

                                <TrendingDown
                                  size={16}
                                  className="text-red-500"
                                />

                                <h3 className="text-sm font-bold text-slate-800">
                                  {gap.skillName}
                                </h3>

                              </div>

                              <p className="mt-1 text-[10px] uppercase font-semibold text-slate-400">
                                {gap.gapType}
                              </p>

                            </div>

                            <div className="flex items-center gap-2">

                              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                                {gap.priority}
                              </span>

                              <span className="text-xs font-bold text-slate-700">
                                {Math.round(gap.gapPercentage)}%
                              </span>

                            </div>

                          </div>

                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-red-500 transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  Math.max(
                                    gap.gapPercentage,
                                    0
                                  ),
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>

              {/* ==================================================
                  LEARNING PATH
              ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6">

                  <h2 className="text-base font-bold text-slate-900">
                    AI Learning Path
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    A personalized roadmap generated from your
                    knowledge gaps.
                  </p>

                </div>

                {data.learningPath.length === 0 ? (

                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">

                    <BookOpen
                      size={32}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No learning path returned
                    </p>

                  </div>

                ) : (

                  <div className="space-y-5">

                    {data.learningPath.map(
                      (step, index) => (

                        <div
                          key={`${step.phase}-${index}`}
                          className="relative flex gap-4"
                        >

                          {/* TIMELINE */}

                          <div className="flex flex-col items-center">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                              {step.phase || index + 1}
                            </div>

                            {index <
                              data.learningPath.length - 1 && (
                              <div className="mt-2 h-full min-h-8 w-px bg-purple-100" />
                            )}

                          </div>

                          {/* CONTENT */}

                          <div className="flex-1 rounded-xl border border-slate-200 p-4">

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                              <h3 className="text-sm font-bold text-slate-800">
                                {step.title}
                              </h3>

                              {step.duration && (
                                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700">
                                  {step.duration}
                                </span>
                              )}

                            </div>

                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {step.reason}
                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>

              {/* ==================================================
                  RECOMMENDED COURSES
              ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6">

                  <h2 className="text-base font-bold text-slate-900">
                    Recommended Courses
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Training recommendations returned by the AI
                    recommendation service.
                  </p>

                </div>

                {data.recommendedCourses.length === 0 ? (

                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">

                    <GraduationCap
                      size={32}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No recommended courses returned
                    </p>

                  </div>

                ) : (

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                    {data.recommendedCourses.map(
                      (course, index) => (

                        <div
                          key={
                            course.trainingId ||
                            `${course.trainingName}-${index}`
                          }
                          className="rounded-2xl border border-slate-200 p-5 transition hover:border-purple-200 hover:shadow-sm"
                        >

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <GraduationCap size={18} />
                          </div>

                          <h3 className="mt-4 text-sm font-bold text-slate-800">
                            {course.trainingName}
                          </h3>

                          {course.provider && (
                            <p className="mt-1 text-xs text-slate-500">
                              {course.provider}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap gap-2">

                            {course.level && (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">
                                {course.level}
                              </span>
                            )}

                            {course.duration && (
                              <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[9px] font-bold text-purple-700">
                                {course.duration}
                              </span>
                            )}

                          </div>

                          {course.courseUrl && (
                            <a
                              href={course.courseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800"
                            >
                              View Course
                              <ChevronRight size={14} />
                            </a>
                          )}

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>

            </>
          )}

        </div>

      </main>

    </div>
  );
};

export default LearningPaths;