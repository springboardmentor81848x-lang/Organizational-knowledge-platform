import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  Brain,
  Building2,
  Database,
  FileText,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

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

function SystemAdministratorDashboard() {
  const [employees, setEmployees] = useState([]);
  const [skills, setSkills] = useState([]);
  const [roles, setRoles] = useState([]);
  const [summary, setSummary] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // ROLE
  // =========================================================

  const role = (localStorage.getItem("role") || "SYSTEM ADMINISTRATOR")
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/_/g, " ")
    .trim();

  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Promise.allSettled is used instead of Promise.all.
         *
         * This means if one API is unavailable, the complete
         * System Administrator dashboard will not crash.
         */

        const results = await Promise.allSettled([
          api.get("/employees"),
          api.get("/skills"),
          api.get("/roles"),
          api.get("/hr/dashboard/summary"),
        ]);

        // -----------------------------------------------------
        // Employees
        // -----------------------------------------------------

        if (results[0].status === "fulfilled") {
          const data = results[0].value?.data;

          setEmployees(Array.isArray(data) ? data : []);
        }

        // -----------------------------------------------------
        // Skills
        // -----------------------------------------------------

        if (results[1].status === "fulfilled") {
          const data = results[1].value?.data;

          setSkills(Array.isArray(data) ? data : []);
        }

        // -----------------------------------------------------
        // Roles
        // -----------------------------------------------------

        if (results[2].status === "fulfilled") {
          const data = results[2].value?.data;

          setRoles(Array.isArray(data) ? data : []);
        }

        // -----------------------------------------------------
        // Summary
        // -----------------------------------------------------

        if (results[3].status === "fulfilled") {
          setSummary(results[3].value?.data || {});
        }

        // -----------------------------------------------------
        // Check if all APIs failed
        // -----------------------------------------------------

        const allFailed = results.every(
          (result) => result.status === "rejected"
        );

        if (allFailed) {
          setError("Unable to load platform data right now.");
        }
      } catch (err) {
        console.error(
          "Failed to load System Administrator Dashboard:",
          err
        );

        setError("Unable to load platform data right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // =========================================================
  // STATISTICS
  // =========================================================

  const stats = useMemo(() => {
    // -------------------------------------------------------
    // Department count
    // -------------------------------------------------------

    const departmentCount = new Set(
      employees
        .map((employee) => employee?.department?.departmentName)
        .filter(Boolean)
    ).size;

    // -------------------------------------------------------
    // Active users
    // -------------------------------------------------------

    const activeUsers = employees.filter((employee) => {
      const employeeStatus = String(
        employee?.status ||
          employee?.accountStatus ||
          employee?.userStatus ||
          ""
      ).toUpperCase();

      return (
        employeeStatus !== "INACTIVE" &&
        employeeStatus !== "DISABLED" &&
        employeeStatus !== "DEACTIVATED"
      );
    }).length;

    // -------------------------------------------------------
    // Role distribution
    // -------------------------------------------------------

    const roleDistribution = Object.entries(
      employees.reduce((acc, employee) => {
        const roleName =
          employee?.role?.roleName ||
          employee?.role?.name ||
          "UNASSIGNED";

        const formattedRole = String(roleName).replace(/_/g, " ");

        acc[formattedRole] = (acc[formattedRole] || 0) + 1;

        return acc;
      }, {})
    ).map(([roleName, count]) => ({
      role: roleName,
      count,
      percentage: employees.length
        ? Math.round((count / employees.length) * 100)
        : 0,
    }));

    return {
      totalUsers: employees.length,
      activeUsers,
      inactiveUsers: Math.max(employees.length - activeUsers, 0),
      departments: departmentCount,
      skills: skills.length,
      roles: roles.length,

      trainingCompletionRate: Number(
        summary?.trainingCompletionRate ?? 0
      ),

      employeesInTraining: Number(
        summary?.employeesInTraining ?? 0
      ),

      criticalGaps: Number(summary?.criticalGaps ?? 0),

      roleDistribution,
    };
  }, [employees, skills, roles, summary]);

  // =========================================================
  // PERFORMANCE CHART
  // =========================================================

  const performanceChart = useMemo(() => {
    const source = summary?.performance || {};

    return [
      {
        name: "Excellent",
        value: Number(source.excellent || 0),
      },
      {
        name: "Good",
        value: Number(source.good || 0),
      },
      {
        name: "Needs Attention",
        value: Number(source.needsAttention || 0),
      },
      {
        name: "Critical",
        value: Number(source.critical || 0),
      },
    ];
  }, [summary]);

  // =========================================================
  // TOP SKILL GAPS
  // =========================================================

  const topGaps = useMemo(() => {
    const gaps = Array.isArray(summary?.topSkillGaps)
      ? summary.topSkillGaps
      : [];

    return gaps.slice(0, 5).map((gap) => ({
      name: gap?.skill || "Unknown",
      value: Number(gap?.employeesAffected || 0),
    }));
  }, [summary]);

  // =========================================================
  // RECENT SYSTEM ACTIVITY
  // =========================================================

  const recentActivity = [
    {
      title: "Platform users tracked",
      detail: `${stats.totalUsers} users in the system`,
      icon: Users,
      tone: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Active workforce",
      detail: `${stats.activeUsers} users currently active`,
      icon: UserCheck,
      tone: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Training coverage",
      detail: `${stats.trainingCompletionRate}% completion rate`,
      icon: TrendingUp,
      tone: "bg-amber-100 text-amber-600",
    },
    {
      title: "Critical alerts",
      detail: `${stats.criticalGaps} critical skill gaps`,
      icon: AlertTriangle,
      tone: "bg-rose-100 text-rose-600",
    },
  ];

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role={role} />

        <div className="flex-1 min-w-0">
          <Navbar title="System Administrator Dashboard" />

          <div className="flex min-h-[80vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

              <p className="text-slate-500">
                Loading System Administrator Dashboard...
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
        <Navbar title="System Administrator Dashboard" />

        <main className="p-5 md:p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8 flex items-center gap-4">
            <div className="rounded-xl bg-slate-900 p-3 text-white">
              <ShieldCheck size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                System Administrator Dashboard
              </h1>

              <p className="mt-1 text-slate-500">
                Manage users, roles, departments and monitor the
                overall platform.
              </p>
            </div>
          </div>

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              STATISTICS CARDS
          ================================================= */}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">

            {/* Total Users */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
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

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
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

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
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

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
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

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
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

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
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
              CHARTS
          ================================================= */}

          <div className="mt-8 grid gap-6 xl:grid-cols-2">

            {/* Role Distribution */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    User Role Distribution
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Users across different system roles
                  </p>
                </div>

                <Users
                  className="text-indigo-600"
                  size={24}
                />
              </div>

              <div className="h-72">

                {stats.roleDistribution.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={stats.roleDistribution}
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
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />

                      <YAxis allowDecimals={false} />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        name="Users"
                        radius={[8, 8, 0, 0]}
                        fill="#4f46e5"
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

            {/* Performance */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Performance Snapshot
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Employee skill performance distribution
                  </p>
                </div>

                <Activity
                  className="text-emerald-600"
                  size={24}
                />
              </div>

              <div className="h-72">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>

                    <Pie
                      data={performanceChart}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {performanceChart.map(
                        (entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={
                              COLORS[
                                index % COLORS.length
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

                {performanceChart.map(
                  (item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            COLORS[
                              index % COLORS.length
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
          </div>

          {/* =================================================
              TOP SKILL GAPS + PLATFORM HEALTH
          ================================================= */}

          <div className="mt-8 grid gap-6 xl:grid-cols-2">

            {/* Top Skill Gaps */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Top Skill Gaps
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Highest-impact skills needing intervention
                  </p>
                </div>

                <AlertTriangle
                  className="text-amber-600"
                  size={24}
                />
              </div>

              <div className="space-y-4">

                {topGaps.length > 0 ? (
                  topGaps.map((gap, index) => {

                    const maximum = Math.max(
                      ...topGaps.map(
                        (item) => item.value
                      ),
                      1
                    );

                    const percentage = Math.min(
                      (gap.value / maximum) * 100,
                      100
                    );

                    return (
                      <div key={gap.name}>

                        <div className="mb-1 flex items-center justify-between text-sm">

                          <span className="font-medium text-slate-700">
                            {index + 1}.{" "}
                            {gap.name}
                          </span>

                          <span className="text-slate-500">
                            {gap.value} employees
                          </span>

                        </div>

                        <div className="h-2.5 rounded-full bg-slate-200">

                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">
                    No skill gap data available.
                  </div>
                )}

              </div>
            </div>

            {/* Platform Health */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Platform Overview
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Current platform status
                  </p>
                </div>

                <Database
                  className="text-blue-600"
                  size={24}
                />
              </div>

              <div className="space-y-4">

                {/* System */}

                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">

                  <div className="flex items-center gap-3">

                    <div className="rounded-lg bg-emerald-100 p-2">
                      <Activity
                        size={20}
                        className="text-emerald-600"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        System Status
                      </p>

                      <p className="text-sm text-slate-500">
                        Backend platform available
                      </p>
                    </div>

                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                    Online
                  </span>

                </div>

                {/* Database */}

                <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">

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
                        Knowledge Gap Platform DB
                      </p>
                    </div>

                  </div>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    Connected
                  </span>

                </div>

                {/* Users */}

                <div className="flex items-center justify-between rounded-xl bg-violet-50 p-4">

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
                        {stats.activeUsers} active users
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
          </div>

          {/* =================================================
              RECENT SYSTEM ACTIVITY
          ================================================= */}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Recent System Activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current platform statistics and alerts
                </p>
              </div>

              <Activity
                className="text-slate-600"
                size={24}
              />
            </div>

            <div className="space-y-4">

              {recentActivity.map(
                (item) => {

                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className={`rounded-lg p-2 ${item.tone}`}
                        >
                          <Icon size={18} />
                        </div>

                        <div>

                          <p className="font-semibold text-slate-800">
                            {item.title}
                          </p>

                          <p className="text-sm text-slate-500">
                            {item.detail}
                          </p>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          </div>

          {/* =================================================
              QUICK ADMINISTRATION
          ================================================= */}

          <div className="mt-8">

            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800">
                Quick Administration
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Quickly access common system administration tasks.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

              {/* Manage Users */}

              <NavLink
                to="/users"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <Users
                  className="mb-3 text-indigo-600 transition group-hover:scale-110"
                  size={28}
                />

                <h3 className="font-bold text-slate-800">
                  Manage Users
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  View and manage platform users.
                </p>
              </NavLink>

              {/* Manage Roles */}

              <NavLink
                to="/users"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <ShieldCheck
                  className="mb-3 text-rose-600 transition group-hover:scale-110"
                  size={28}
                />

                <h3 className="font-bold text-slate-800">
                  Manage Roles
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Manage roles and access permissions.
                </p>
              </NavLink>

              {/* Reports */}

              <NavLink
                to="/reports"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <FileText
                  className="mb-3 text-violet-600 transition group-hover:scale-110"
                  size={28}
                />

                <h3 className="font-bold text-slate-800">
                  Reports
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  View system reports and analytics.
                </p>
              </NavLink>

              {/* Skill Management */}

              <NavLink
                to="/skills"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <Brain
                  className="mb-3 text-amber-600 transition group-hover:scale-110"
                  size={28}
                />

                <h3 className="font-bold text-slate-800">
                  Skill Management
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Manage skills and skill categories.
                </p>
              </NavLink>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SystemAdministratorDashboard;