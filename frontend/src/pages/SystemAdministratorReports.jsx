
import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Building2,
  CheckCircle2,
  Database,
  FileText,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const COLORS = [
  "#4f46e5",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

function SystemAdministratorReports() {
  const [employees, setEmployees] = useState([]);
  const [skills, setSkills] = useState([]);
  const [roles, setRoles] = useState([]);
  const [summary, setSummary] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // ROLE
  // =========================================================

  const role = (
    localStorage.getItem("role") ||
    "SYSTEM ADMINISTRATOR"
  )
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/_/g, " ")
    .trim();

  // =========================================================
  // LOAD REPORT DATA
  // =========================================================

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled([
          api.get("/employees"),
          api.get("/skills"),
          api.get("/roles"),
          api.get("/admin/dashboard/summary"),
        ]);

        // Employees
        if (results[0].status === "fulfilled") {
          const data = results[0].value?.data;

          setEmployees(
            Array.isArray(data) ? data : []
          );
        }

        // Skills
        if (results[1].status === "fulfilled") {
          const data = results[1].value?.data;

          setSkills(
            Array.isArray(data) ? data : []
          );
        }

        // Roles
        if (results[2].status === "fulfilled") {
          const data = results[2].value?.data;

          setRoles(
            Array.isArray(data) ? data : []
          );
        }

        // HR summary
        if (results[3].status === "fulfilled") {
          setSummary(
            results[3].value?.data || {}
          );
        }

        const allFailed = results.every(
          (result) =>
            result.status === "rejected"
        );

        if (allFailed) {
          setError(
            "Unable to load system reports right now."
          );
        }
      } catch (err) {
        console.error(
          "Failed to load System Administrator Reports:",
          err
        );

        setError(
          "Unable to load system reports right now."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // =========================================================
  // ORGANIZATION STATISTICS
  // =========================================================

  const stats = useMemo(() => {
    const departments = new Set(
      employees
        .map(
          (employee) =>
            employee?.department?.departmentName
        )
        .filter(Boolean)
    );

    const activeUsers = employees.filter(
      (employee) => {
        const status = String(
          employee?.status ||
            employee?.accountStatus ||
            employee?.userStatus ||
            ""
        ).toUpperCase();

        return (
          status !== "INACTIVE" &&
          status !== "DISABLED" &&
          status !== "DEACTIVATED"
        );
      }
    ).length;

    const roleDistribution = Object.entries(
      employees.reduce(
        (acc, employee) => {
          const roleName =
            employee?.role?.roleName ||
            employee?.role?.name ||
            "UNASSIGNED";

          const formattedRole =
            String(roleName).replace(
              /_/g,
              " "
            );

          acc[formattedRole] =
            (acc[formattedRole] || 0) + 1;

          return acc;
        },
        {}
      )
    ).map(([role, count]) => ({
      role,
      count,
    }));

    return {
      totalUsers: employees.length,

      activeUsers,

      inactiveUsers: Math.max(
        employees.length - activeUsers,
        0
      ),

      departments: departments.size,

      skills: skills.length,

      roles: roles.length,

      trainingCompletionRate: Number(
        summary?.trainingCompletionRate ?? 0
      ),

      employeesInTraining: Number(
        summary?.employeesInTraining ?? 0
      ),

      criticalGaps: Number(
        summary?.criticalGaps ?? 0
      ),

      totalKnowledgeGaps: Number(
        summary?.totalKnowledgeGaps ??
          summary?.knowledgeGaps ??
          0
      ),

      employeesWithGaps: Number(
        summary?.employeesWithGaps ?? 0
      ),

      averageGap: Number(
        summary?.averageGap ?? 0
      ),

      roleDistribution,
    };
  }, [
    employees,
    skills,
    roles,
    summary,
  ]);

  // =========================================================
  // PERFORMANCE DATA
  // =========================================================

  const performanceData = useMemo(() => {
    const performance =
      summary?.performance || {};

    return [
      {
        name: "Excellent",
        value: Number(
          performance.excellent || 0
        ),
      },
      {
        name: "Good",
        value: Number(
          performance.good || 0
        ),
      },
      {
        name: "Needs Attention",
        value: Number(
          performance.needsAttention || 0
        ),
      },
      {
        name: "Critical",
        value: Number(
          performance.critical || 0
        ),
      },
    ];
  }, [summary]);

  // =========================================================
  // TOP SKILL GAPS
  // =========================================================

  const topSkillGaps = useMemo(() => {
    const gaps = Array.isArray(
      summary?.topSkillGaps
    )
      ? summary.topSkillGaps
      : [];

    return gaps
      .slice(0, 6)
      .map((gap) => ({
        name:
          gap?.skill || "Unknown",

        employeesAffected: Number(
          gap?.employeesAffected || 0
        ),
      }));
  }, [summary]);

  // =========================================================
  // DEPARTMENT DISTRIBUTION
  // =========================================================

  const departmentDistribution =
    useMemo(() => {
      const distribution =
        employees.reduce(
          (acc, employee) => {
            const department =
              employee?.department
                ?.departmentName ||
              "Unassigned";

            acc[department] =
              (acc[department] || 0) + 1;

            return acc;
          },
          {}
        );

      return Object.entries(
        distribution
      )
        .map(
          ([department, count]) => ({
            department,
            count,
          })
        )
        .sort(
          (a, b) =>
            b.count - a.count
        )
        .slice(0, 8);
    }, [employees]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">

        <Sidebar role={role} />

        <div className="flex min-w-0 flex-1 flex-col">

          <Navbar title="System Administrator Reports" />

          <div className="flex min-h-[80vh] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

              <p className="text-slate-500">
                Loading System Administrator Reports...
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar role={role} />

      <div className="flex min-w-0 flex-1 flex-col">

        <Navbar title="System Administrator Reports" />

        <main className="p-5 md:p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8 flex items-center gap-4">

            <div className="rounded-xl bg-slate-900 p-3 text-white">
              <FileText size={28} />
            </div>

            <div>

              <h1 className="text-3xl font-bold text-slate-800">
                System Administrator Reports
              </h1>

              <p className="mt-1 text-slate-500">
                Organization-wide reports and
                platform analytics.
              </p>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              OVERVIEW CARDS
          ================================================= */}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">

            {/* Total Users */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Total Users
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-slate-800">
                    {stats.totalUsers}
                  </h3>

                </div>

                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                  <Users size={24} />
                </div>

              </div>

            </div>

            {/* Active Users */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Active Users
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-slate-800">
                    {stats.activeUsers}
                  </h3>

                </div>

                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <UserCheck size={24} />
                </div>

              </div>

            </div>

            {/* Departments */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Departments
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-slate-800">
                    {stats.departments}
                  </h3>

                </div>

                <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
                  <Building2 size={24} />
                </div>

              </div>

            </div>

            {/* Skills */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Skills
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-slate-800">
                    {stats.skills}
                  </h3>

                </div>

                <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <Brain size={24} />
                </div>

              </div>

            </div>

            {/* Roles */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    System Roles
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-slate-800">
                    {stats.roles}
                  </h3>

                </div>

                <div className="rounded-xl bg-rose-100 p-3 text-rose-600">
                  <ShieldCheck size={24} />
                </div>

              </div>

            </div>

            {/* Training */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Training Completion
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-slate-800">
                    {stats.trainingCompletionRate}%
                  </h3>

                </div>

                <div className="rounded-xl bg-cyan-100 p-3 text-cyan-600">
                  <TrendingUp size={24} />
                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              ORGANIZATION REPORTS
          ================================================= */}

          <div className="mt-8 grid gap-6 xl:grid-cols-2">

            {/* ROLE DISTRIBUTION */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold text-slate-800">
                    User Role Distribution
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Distribution of users across
                    system roles.
                  </p>

                </div>

                <Users
                  size={24}
                  className="text-indigo-600"
                />

              </div>

              <div className="h-72">

                {stats.roleDistribution.length >
                0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={
                        stats.roleDistribution
                      }
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 30,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                      />

                      <XAxis
                        dataKey="role"
                        tick={{
                          fontSize: 12,
                        }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />

                      <YAxis
                        allowDecimals={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        name="Users"
                        fill="#4f46e5"
                        radius={[
                          8,
                          8,
                          0,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    No role data available.
                  </div>
                )}

              </div>

            </div>

            {/* DEPARTMENT DISTRIBUTION */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold text-slate-800">
                    Department Distribution
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Users distributed across
                    departments.
                  </p>

                </div>

                <Building2
                  size={24}
                  className="text-violet-600"
                />

              </div>

              <div className="h-72">

                {departmentDistribution.length >
                0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={
                        departmentDistribution
                      }
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 20,
                        left: 30,
                        bottom: 5,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                      />

                      <XAxis
                        type="number"
                        allowDecimals={false}
                      />

                      <YAxis
                        type="category"
                        dataKey="department"
                        width={100}
                        tick={{
                          fontSize: 12,
                        }}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        name="Users"
                        fill="#8b5cf6"
                        radius={[
                          0,
                          8,
                          8,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    No department data available.
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* =================================================
              KNOWLEDGE GAP REPORT
          ================================================= */}

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Knowledge Gap Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Organization-wide skill gap
                  indicators.
                </p>

              </div>

              <AlertTriangle
                size={24}
                className="text-amber-600"
              />

            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-xl bg-slate-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                    <AlertTriangle size={20} />
                  </div>

                  <div>

                    <p className="text-sm text-slate-500">
                      Critical Gaps
                    </p>

                    <p className="text-2xl font-bold text-slate-800">
                      {stats.criticalGaps}
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-xl bg-slate-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-rose-100 p-2 text-rose-600">
                    <Users size={20} />
                  </div>

                  <div>

                    <p className="text-sm text-slate-500">
                      Employees With Gaps
                    </p>

                    <p className="text-2xl font-bold text-slate-800">
                      {stats.employeesWithGaps}
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-xl bg-slate-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                    <BarChart3 size={20} />
                  </div>

                  <div>

                    <p className="text-sm text-slate-500">
                      Total Knowledge Gaps
                    </p>

                    <p className="text-2xl font-bold text-slate-800">
                      {stats.totalKnowledgeGaps}
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-xl bg-slate-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-violet-100 p-2 text-violet-600">
                    <Brain size={20} />
                  </div>

                  <div>

                    <p className="text-sm text-slate-500">
                      Average Gap
                    </p>

                    <p className="text-2xl font-bold text-slate-800">
                      {stats.averageGap}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              TOP SKILL GAPS
          ================================================= */}

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Top Skill Gaps
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Skills with the highest number
                  of affected employees.
                </p>

              </div>

              <Brain
                size={24}
                className="text-amber-600"
              />

            </div>

            {topSkillGaps.length > 0 ? (
              <div className="space-y-5">

                {topSkillGaps.map(
                  (gap, index) => {

                    const maximum =
                      Math.max(
                        ...topSkillGaps.map(
                          (item) =>
                            item.employeesAffected
                        ),
                        1
                      );

                    const percentage =
                      Math.min(
                        (gap.employeesAffected /
                          maximum) *
                          100,
                        100
                      );

                    return (
                      <div
                        key={`${gap.name}-${index}`}
                      >

                        <div className="mb-2 flex items-center justify-between">

                          <span className="font-medium text-slate-700">
                            {index + 1}.{" "}
                            {gap.name}
                          </span>

                          <span className="text-sm text-slate-500">
                            {
                              gap.employeesAffected
                            }{" "}
                            employees
                          </span>

                        </div>

                        <div className="h-3 rounded-full bg-slate-200">

                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-8 text-center text-slate-500">
                No skill gap data available.
              </div>
            )}

          </div>

          {/* =================================================
              PERFORMANCE + TRAINING
          ================================================= */}

          <div className="mt-8 grid gap-6 xl:grid-cols-2">

            {/* PERFORMANCE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold text-slate-800">
                    Employee Performance
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Organization-wide performance
                    distribution.
                  </p>

                </div>

                <Activity
                  size={24}
                  className="text-emerald-600"
                />

              </div>

              <div className="h-72">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={performanceData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                    >

                      {performanceData.map(
                        (entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={
                              COLORS[
                                index %
                                  COLORS.length
                              ]
                            }
                          />
                        )
                      )}

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">

                {performanceData.map(
                  (item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >

                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            COLORS[
                              index %
                                COLORS.length
                            ],
                        }}
                      />

                      <span>
                        {item.name}:{" "}
                        <strong>
                          {item.value}
                        </strong>
                      </span>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* TRAINING */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold text-slate-800">
                    Training & Learning
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Organization-wide training
                    indicators.
                  </p>

                </div>

                <TrendingUp
                  size={24}
                  className="text-cyan-600"
                />

              </div>

              <div className="space-y-5">

                <div className="rounded-xl bg-cyan-50 p-5">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="rounded-lg bg-cyan-100 p-2 text-cyan-600">
                        <TrendingUp size={20} />
                      </div>

                      <div>

                        <p className="font-semibold text-slate-800">
                          Training Completion
                        </p>

                        <p className="text-sm text-slate-500">
                          Overall completion rate
                        </p>

                      </div>

                    </div>

                    <span className="text-2xl font-bold text-cyan-700">
                      {
                        stats.trainingCompletionRate
                      }%
                    </span>

                  </div>

                  <div className="mt-4 h-3 rounded-full bg-cyan-100">

                    <div
                      className="h-3 rounded-full bg-cyan-500"
                      style={{
                        width: `${Math.min(
                          stats.trainingCompletionRate,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

                <div className="rounded-xl bg-violet-50 p-5">

                  <div className="flex items-center gap-3">

                    <div className="rounded-lg bg-violet-100 p-2 text-violet-600">
                      <Users size={20} />
                    </div>

                    <div>

                      <p className="font-semibold text-slate-800">
                        Employees In Training
                      </p>

                      <p className="text-sm text-slate-500">
                        Employees currently
                        participating in training.
                      </p>

                    </div>

                  </div>

                  <p className="mt-4 text-3xl font-bold text-violet-700">
                    {
                      stats.employeesInTraining
                    }
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              PLATFORM STATUS
          ================================================= */}

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Platform Status Report
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current status of major platform
                  components.
                </p>

              </div>

              <Database
                size={24}
                className="text-blue-600"
              />

            </div>

            <div className="grid gap-4 md:grid-cols-3">

              {/* BACKEND */}

              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-emerald-100 p-2">
                    <CheckCircle2
                      size={20}
                      className="text-emerald-600"
                    />
                  </div>

                  <div>

                    <p className="font-semibold text-slate-800">
                      Backend
                    </p>

                    <p className="text-sm text-slate-500">
                      Platform services
                    </p>

                  </div>

                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                  Online
                </span>

              </div>

              {/* DATABASE */}

              <div className="flex items-center justify-between rounded-xl bg-blue-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-blue-100 p-2">
                    <Database
                      size={20}
                      className="text-blue-600"
                    />
                  </div>

                  <div>

                    <p className="font-semibold text-slate-800">
                      Database
                    </p>

                    <p className="text-sm text-slate-500">
                      Platform database
                    </p>

                  </div>

                </div>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  Connected
                </span>

              </div>

              {/* USER ACTIVITY */}

              <div className="flex items-center justify-between rounded-xl bg-violet-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-violet-100 p-2">
                    <UserCheck
                      size={20}
                      className="text-violet-600"
                    />
                  </div>

                  <div>

                    <p className="font-semibold text-slate-800">
                      User Activity
                    </p>

                    <p className="text-sm text-slate-500">
                      Active platform users
                    </p>

                  </div>

                </div>

                <span className="font-bold text-violet-700">
                  {stats.totalUsers > 0
                    ? Math.round(
                        (stats.activeUsers /
                          stats.totalUsers) *
                          100
                      )
                    : 0}
                  %
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              REPORT SUMMARY
          ================================================= */}

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                <FileText size={22} />
              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Report Summary
                </h2>

                <p className="text-sm text-slate-500">
                  Key observations from current
                  platform data.
                </p>

              </div>

            </div>

            <div className="grid gap-4 md:grid-cols-2">

              <div className="rounded-xl border border-slate-200 p-5">

                <div className="flex items-start gap-3">

                  <CheckCircle2
                    className="mt-0.5 text-emerald-600"
                    size={20}
                  />

                  <div>

                    <h3 className="font-semibold text-slate-800">
                      Workforce
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      The platform currently
                      contains{" "}
                      <strong>
                        {stats.totalUsers}
                      </strong>{" "}
                      users, with{" "}
                      <strong>
                        {stats.activeUsers}
                      </strong>{" "}
                      active users.
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-xl border border-slate-200 p-5">

                <div className="flex items-start gap-3">

                  <Building2
                    className="mt-0.5 text-violet-600"
                    size={20}
                  />

                  <div>

                    <h3 className="font-semibold text-slate-800">
                      Organization
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      The organization has{" "}
                      <strong>
                        {stats.departments}
                      </strong>{" "}
                      departments and{" "}
                      <strong>
                        {stats.roles}
                      </strong>{" "}
                      configured system roles.
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-xl border border-slate-200 p-5">

                <div className="flex items-start gap-3">

                  <AlertTriangle
                    className="mt-0.5 text-amber-600"
                    size={20}
                  />

                  <div>

                    <h3 className="font-semibold text-slate-800">
                      Skill Gaps
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      There are{" "}
                      <strong>
                        {stats.criticalGaps}
                      </strong>{" "}
                      critical skill gaps
                      requiring attention.
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-xl border border-slate-200 p-5">

                <div className="flex items-start gap-3">

                  <TrendingUp
                    className="mt-0.5 text-cyan-600"
                    size={20}
                  />

                  <div>

                    <h3 className="font-semibold text-slate-800">
                      Training
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Current training
                      completion is{" "}
                      <strong>
                        {
                          stats.trainingCompletionRate
                        }%
                      </strong>
                      .
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default SystemAdministratorReports;
