
import { useEffect, useMemo, useState } from "react";

import {
  BarChart,
  Bar,
  CartesianGrid,
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
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";


// ============================================================
// SYSTEM ADMINISTRATOR DASHBOARD
// ============================================================

function SystemAdministratorDashboard() {

  const [employees, setEmployees] = useState([]);
  const [skills, setSkills] = useState([]);
  const [roles, setRoles] = useState([]);
  const [summary, setSummary] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==========================================================
  // CURRENT ROLE
  // ==========================================================

  const role = (localStorage.getItem("role") || "SYSTEM ADMINISTRATOR")
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/_/g, " ")
    .trim();


  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  const fetchDashboardData = async () => {

    try {

      setLoading(true);
      setError("");

      const results = await Promise.allSettled([

        api.get("/employees"),

        api.get("/skills"),

        api.get("/roles"),

        api.get("/admin/dashboard/summary"),

      ]);


      // ------------------------------------------------------
      // EMPLOYEES
      // ------------------------------------------------------

      if (results[0].status === "fulfilled") {

        const data = results[0].value?.data;

        setEmployees(
          Array.isArray(data) ? data : []
        );

      } else {

        console.error(
          "Employees API error:",
          results[0].reason
        );

      }


      // ------------------------------------------------------
      // SKILLS
      // ------------------------------------------------------

      if (results[1].status === "fulfilled") {

        const data = results[1].value?.data;

        setSkills(
          Array.isArray(data) ? data : []
        );

      } else {

        console.error(
          "Skills API error:",
          results[1].reason
        );

      }


      // ------------------------------------------------------
      // ROLES
      // ------------------------------------------------------

      if (results[2].status === "fulfilled") {

        const data = results[2].value?.data;

        setRoles(
          Array.isArray(data) ? data : []
        );

      } else {

        console.error(
          "Roles API error:",
          results[2].reason
        );

      }


      // ------------------------------------------------------
      // HR DASHBOARD SUMMARY
      // ------------------------------------------------------

      if (results[3].status === "fulfilled") {

        const data = results[3].value?.data || {};

        console.log(
          "SYSTEM ADMIN SUMMARY:",
          data
        );

        setSummary(data);

      } else {

        console.error(
          "HR Dashboard Summary API error:",
          results[3].reason
        );

      }


      // ------------------------------------------------------
      // CHECK WHETHER EVERYTHING FAILED
      // ------------------------------------------------------

      const allFailed = results.every(
        (result) =>
          result.status === "rejected"
      );


      if (allFailed) {

        setError(
          "Unable to load platform data right now."
        );

      }

    } catch (err) {

      console.error(
        "Failed to load System Administrator Dashboard:",
        err
      );

      setError(
        "Unable to load platform data right now."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // LOAD WHEN PAGE OPENS
  // ==========================================================

  useEffect(() => {

    fetchDashboardData();

  }, []);


  // ==========================================================
  // STATISTICS
  // ==========================================================

  const stats = useMemo(() => {

    const departmentCount = new Set(

      employees
        .map(
          (employee) =>
            employee?.department?.departmentName
        )
        .filter(Boolean)

    ).size;


    const activeUsers = employees.filter(
      (employee) => {

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

    ).map(
      ([roleName, count]) => ({

        role: roleName,

        count,

        percentage: employees.length
          ? Math.round(
              (count / employees.length) * 100
            )
          : 0,

      })
    );


    return {

      totalUsers:
        employees.length,

      activeUsers,

      inactiveUsers:
        Math.max(
          employees.length -
            activeUsers,
          0
        ),

      departments:
        departmentCount,

      skills:
        skills.length,

      roles:
        roles.length,

      trainingCompletionRate:
        Number(
          summary?.trainingCompletionRate ?? 0
        ),

      employeesInTraining:
        Number(
          summary?.employeesInTraining ?? 0
        ),

      criticalGaps:
        Number(
          summary?.criticalGaps ?? 0
        ),

      roleDistribution,

    };

  }, [
    employees,
    skills,
    roles,
    summary,
  ]);


  // ==========================================================
  // EMPLOYEE PERFORMANCE
  // ==========================================================

  const performanceChart = useMemo(() => {

    /*
     * Supports:
     *
     * summary.performance.excellent
     * summary.performance.good
     * summary.performance.needsAttention
     * summary.performance.critical
     *
     * Also supports alternative backend names.
     */

    const performance =
      summary?.performance ||
      summary?.performanceDistribution ||
      summary?.employeePerformance ||
      {};


    const excellent =
      performance?.excellent ??
      performance?.Excellent ??
      performance?.EXCELLENT ??
      performance?.excellentEmployees ??
      0;


    const good =
      performance?.good ??
      performance?.Good ??
      performance?.GOOD ??
      performance?.goodEmployees ??
      0;


    const needsAttention =
      performance?.needsAttention ??
      performance?.NeedsAttention ??
      performance?.NEEDS_ATTENTION ??
      performance?.needs_attention ??
      performance?.needsAttentionEmployees ??
      0;


    const critical =
      performance?.critical ??
      performance?.Critical ??
      performance?.CRITICAL ??
      performance?.criticalEmployees ??
      0;


    const chartData = [

      {
        name: "Excellent",
        value: Number(excellent),
      },

      {
        name: "Good",
        value: Number(good),
      },

      {
        name: "Needs Attention",
        value: Number(needsAttention),
      },

      {
        name: "Critical",
        value: Number(critical),
      },

    ];


    console.log(
      "EMPLOYEE PERFORMANCE CHART DATA:",
      chartData
    );


    return chartData;

  }, [summary]);


  // ==========================================================
  // TOP SKILL GAPS
  // ==========================================================

  const topGaps = useMemo(() => {

    const gaps =
      Array.isArray(
        summary?.topSkillGaps
      )
        ? summary.topSkillGaps
        : [];


    return gaps
      .slice(0, 5)
      .map((gap) => ({

        name:
          gap?.skill ||
          gap?.skillName ||
          "Unknown",

        value:
          Number(
            gap?.employeesAffected ||
            gap?.employeeCount ||
            gap?.count ||
            0
          ),

      }));

  }, [summary]);


  // ==========================================================
  // PERFORMANCE TOTAL
  // ==========================================================

  const performanceTotal = useMemo(() => {

    return performanceChart.reduce(
      (total, item) =>
        total + Number(item.value || 0),
      0
    );

  }, [performanceChart]);


  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {

    return (

      <div className="flex min-h-screen bg-slate-50">

        <Sidebar role={role} />

        <div className="flex-1 min-w-0">

          <Navbar
            title="System Administrator Dashboard"
          />

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


  // ==========================================================
  // MAIN DASHBOARD
  // ==========================================================

  return (

    <div className="flex min-h-screen bg-slate-50">

      <Sidebar role={role} />


      <div className="flex min-w-0 flex-1 flex-col">

        <Navbar
          title="System Administrator Dashboard"
        />


        <main className="p-5 md:p-8">


          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h1 className="text-3xl font-bold text-slate-800">

                System Administrator Dashboard

              </h1>

              <p className="mt-2 text-slate-500">

                Monitor users, system configuration,
                organizational performance and platform health.

              </p>

            </div>


            <button
              onClick={fetchDashboardData}
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-white transition hover:bg-indigo-700"
            >

              <Activity size={18} />

              Refresh Data

            </button>

          </div>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

              <div className="flex items-center gap-2">

                <AlertTriangle size={18} />

                {error}

              </div>

            </div>

          )}


          {/* ==================================================
              STATISTICS
          ================================================== */}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">


            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              description="Users in the system"
              icon={<Users size={24} />}
              iconClass="bg-indigo-100 text-indigo-600"
            />


            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              description="Currently active"
              icon={<UserCheck size={24} />}
              iconClass="bg-emerald-100 text-emerald-600"
            />


            <StatCard
              title="Departments"
              value={stats.departments}
              description="Organization departments"
              icon={<Building2 size={24} />}
              iconClass="bg-blue-100 text-blue-600"
            />


            <StatCard
              title="Skills"
              value={stats.skills}
              description="Skills available"
              icon={<Brain size={24} />}
              iconClass="bg-purple-100 text-purple-600"
            />


            <StatCard
              title="System Roles"
              value={stats.roles}
              description="Configured roles"
              icon={<ShieldCheck size={24} />}
              iconClass="bg-orange-100 text-orange-600"
            />


            <StatCard
              title="Training Completion"
              value={`${stats.trainingCompletionRate}%`}
              description="Overall completion"
              icon={<TrendingUp size={24} />}
              iconClass="bg-cyan-100 text-cyan-600"
            />

          </div>


          {/* ==================================================
              PERFORMANCE + ROLE DISTRIBUTION
          ================================================== */}

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">


            {/* =================================================
                EMPLOYEE PERFORMANCE
            ================================================= */}

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <div className="rounded-lg bg-indigo-100 p-2.5 text-indigo-600">

                  <TrendingUp size={21} />

                </div>


                <div>

                  <h2 className="text-lg font-bold text-slate-800">

                    Employee Performance

                  </h2>

                  <p className="text-sm text-slate-500">

                    Organization performance distribution

                  </p>

                </div>

              </div>


              {/* PERFORMANCE SUMMARY */}

              <div className="mb-6 grid grid-cols-2 gap-3">

                {performanceChart.map(
                  (item) => {

                    const percentage =
                      performanceTotal > 0
                        ? Math.round(
                            (item.value /
                              performanceTotal) *
                              100
                          )
                        : 0;


                    return (

                      <div
                        key={item.name}
                        className="rounded-xl bg-slate-50 p-4"
                      >

                        <p className="text-sm text-slate-500">

                          {item.name}

                        </p>

                        <div className="mt-2 flex items-end justify-between">

                          <span className="text-2xl font-bold text-slate-800">

                            {item.value}

                          </span>

                          <span className="text-sm text-slate-500">

                            {percentage}%

                          </span>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>


              {/* CHART */}

              {performanceTotal > 0 ? (

                <div className="h-[280px] w-full">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={performanceChart}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 10,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 12,
                        }}
                      />

                      <YAxis
                        allowDecimals={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        name="Employees"
                        fill="#2563eb"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              ) : (

                <div className="flex h-[280px] items-center justify-center rounded-xl bg-slate-50">

                  <div className="text-center">

                    <TrendingUp
                      size={36}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="font-medium text-slate-600">

                      No performance data available

                    </p>

                    <p className="mt-1 text-sm text-slate-400">

                      Employee performance data has not been recorded yet.

                    </p>

                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                ROLE DISTRIBUTION
            ================================================= */}

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <div className="rounded-lg bg-purple-100 p-2.5 text-purple-600">

                  <Users size={21} />

                </div>


                <div>

                  <h2 className="text-lg font-bold text-slate-800">

                    User Role Distribution

                  </h2>

                  <p className="text-sm text-slate-500">

                    Distribution of users across system roles

                  </p>

                </div>

              </div>


              {stats.roleDistribution.length > 0 ? (

                <div className="h-[330px] w-full">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={
                        stats.roleDistribution
                      }
                      layout="vertical"
                      margin={{
                        top: 10,
                        right: 20,
                        left: 20,
                        bottom: 10,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                      />

                      <XAxis
                        type="number"
                        allowDecimals={false}
                      />

                      <YAxis
                        type="category"
                        dataKey="role"
                        width={130}
                        tick={{
                          fontSize: 12,
                        }}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        name="Users"
                        fill="#2563eb"
                        radius={[
                          0,
                          6,
                          6,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              ) : (

                <div className="flex h-[330px] items-center justify-center text-slate-400">

                  No role data available.

                </div>

              )}

            </div>

          </div>


          {/* ==================================================
              TOP SKILL GAPS
          ================================================== */}

          <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="rounded-lg bg-orange-100 p-2.5 text-orange-600">

                <Brain size={21} />

              </div>


              <div>

                <h2 className="text-lg font-bold text-slate-800">

                  Top Skill Gaps

                </h2>

                <p className="text-sm text-slate-500">

                  Skills requiring organizational attention

                </p>

              </div>

            </div>


            {topGaps.length > 0 ? (

              <div className="h-[300px] w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={topGaps}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 10,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      name="Employees Affected"
                      fill="#2563eb"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            ) : (

              <div className="py-10 text-center text-slate-500">

                No skill gap data available.

              </div>

            )}

          </div>


          {/* ==================================================
              PLATFORM OVERVIEW
          ================================================== */}

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">


            <InfoCard
              icon={
                <Database size={24} />
              }
              title="Database"
              value="Knowledge Gap Platform DB"
              description="Application database"
              status="Connected"
            />


            <InfoCard
              icon={
                <ShieldCheck size={24} />
              }
              title="System Status"
              value="Online"
              description="Application services"
              status="Operational"
            />


            <InfoCard
              icon={
                <Activity size={24} />
              }
              title="User Activity"
              value={`${stats.activeUsers} active users`}
              description="Current platform activity"
              status={`${stats.totalUsers > 0
                ? Math.round(
                    (stats.activeUsers /
                      stats.totalUsers) *
                      100
                  )
                : 0}% active`}
            />

          </div>


          {/* ==================================================
              RECENT SYSTEM ACTIVITY
          ================================================== */}

          <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="rounded-lg bg-indigo-100 p-2.5 text-indigo-600">

                <Activity size={21} />

              </div>


              <div>

                <h2 className="text-lg font-bold text-slate-800">

                  Recent System Activity

                </h2>

                <p className="text-sm text-slate-500">

                  Current platform statistics

                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">


              <ActivityCard
                title="Platform Users"
                value={`${stats.totalUsers}`}
                description="Users in system"
                icon={
                  <Users size={20} />
                }
              />


              <ActivityCard
                title="Active Workforce"
                value={`${stats.activeUsers}`}
                description="Currently active"
                icon={
                  <UserCheck size={20} />
                }
              />


              <ActivityCard
                title="Training Coverage"
                value={`${stats.trainingCompletionRate}%`}
                description="Completion rate"
                icon={
                  <TrendingUp size={20} />
                }
              />


              <ActivityCard
                title="Critical Alerts"
                value={`${stats.criticalGaps}`}
                description="Critical skill gaps"
                icon={
                  <AlertTriangle size={20} />
                }
              />

            </div>

          </div>


          {/* ==================================================
              QUICK ADMINISTRATION
          ================================================== */}

          <div className="mt-8">

            <div className="mb-5">

              <h2 className="text-xl font-bold text-slate-800">

                Quick Administration

              </h2>

              <p className="mt-1 text-sm text-slate-500">

                Frequently used system administration functions

              </p>

            </div>


            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">


              <AdminCard
                to="/system-administrator/users"
                icon={
                  <Users size={24} />
                }
                title="Manage Users"
                description="View and manage platform users"
              />


              <AdminCard
                to="/system-administrator/users"
                icon={
                  <ShieldCheck size={24} />
                }
                title="Manage Roles"
                description="Manage system role assignments"
              />


              <AdminCard
                to="/system-administrator/reports"
                icon={
                  <FileText size={24} />
                }
                title="Reports"
                description="View system reports and analytics"
              />


              <AdminCard
                to="/system-administrator/users"
                icon={
                  <Settings size={24} />
                }
                title="System Management"
                description="Manage system configuration"
              />

            </div>

          </div>


        </main>

      </div>

    </div>

  );

}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  description,
  icon,
  iconClass,
}) {

  return (

    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">

            {title}

          </p>


          <h2 className="mt-3 text-3xl font-bold text-slate-800">

            {value}

          </h2>


          <p className="mt-2 text-xs text-slate-400">

            {description}

          </p>

        </div>


        <div
          className={`rounded-xl p-3 ${iconClass}`}
        >

          {icon}

        </div>

      </div>

    </div>

  );

}


// ============================================================
// INFO CARD
// ============================================================

function InfoCard({
  icon,
  title,
  value,
  description,
  status,
}) {

  return (

    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-slate-100 p-3 text-slate-600">

            {icon}

          </div>


          <div>

            <p className="text-sm font-medium text-slate-500">

              {title}

            </p>

            <p className="mt-1 font-semibold text-slate-800">

              {value}

            </p>

          </div>

        </div>

      </div>


      <div className="mt-5 flex items-center justify-between">

        <span className="text-xs text-slate-400">

          {description}

        </span>


        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">

          {status}

        </span>

      </div>

    </div>

  );

}


// ============================================================
// ACTIVITY CARD
// ============================================================

function ActivityCard({
  title,
  value,
  description,
  icon,
}) {

  return (

    <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-white p-2.5 text-indigo-600 shadow-sm">

          {icon}

        </div>


        <div>

          <p className="text-sm font-medium text-slate-500">

            {title}

          </p>

          <p className="text-xl font-bold text-slate-800">

            {value}

          </p>

        </div>

      </div>


      <p className="mt-3 text-xs text-slate-400">

        {description}

      </p>

    </div>

  );

}


// ============================================================
// ADMIN CARD
// ============================================================

function AdminCard({
  to,
  icon,
  title,
  description,
}) {

  return (

    <NavLink
      to={to}
      className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >

      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">

        {icon}

      </div>


      <h3 className="font-bold text-slate-800">

        {title}

      </h3>


      <p className="mt-2 text-sm text-slate-500">

        {description}

      </p>

    </NavLink>

  );

}


export default SystemAdministratorDashboard;
