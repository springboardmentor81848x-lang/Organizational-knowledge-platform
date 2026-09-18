import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import {
  Activity,
  Users,
  TrendingUp,
  Clock3,
  ShieldAlert,
} from "lucide-react";

function ManagerEmployeeProgress() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const managerEmployeeId =
    localStorage.getItem("employeeId");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        if (!managerEmployeeId) {
          throw new Error(
            "Manager employee ID not found."
          );
        }

        if (!token) {
          throw new Error(
            "Your session has expired. Please login again."
          );
        }

        const response = await api.get(
          `/manager-dashboard/manager/${managerEmployeeId}`
        );

        setDashboard(response.data);
      } catch (err) {
        console.error(
          "Error loading employee progress:",
          err
        );

        if (err.response?.status === 401) {
          setError(
            "Your session has expired. Please login again."
          );
          return;
        }

        if (err.response?.status === 403) {
          setError(
            "You do not have permission to access employee progress."
          );
          return;
        }

        setError(
          err.response?.data?.message ||
            err.response?.data ||
            err.message ||
            "Unable to load employee progress data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [managerEmployeeId, token]);

  const employeeRows = useMemo(() => {
    if (
      !dashboard?.employeeProgress ||
      dashboard.employeeProgress.length === 0
    ) {
      return [];
    }

    return dashboard.employeeProgress.filter(
      (employee) =>
        employee.employeeName
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        employee.employeeId
          ?.toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [dashboard, search]);

  const averageProgress = useMemo(() => {
    const rows =
      dashboard?.employeeProgress || [];

    if (!rows.length) {
      return 0;
    }

    return (
      rows.reduce(
        (total, row) =>
          total +
          Number(
            row.progressPercentage || 0
          ),
        0
      ) / rows.length
    );
  }, [dashboard]);

  const averageSkillCoverage = useMemo(() => {
    const coverage =
      dashboard?.skillCoverage || [];

    if (!coverage.length) {
      return 0;
    }

    return (
      coverage.reduce(
        (sum, item) =>
          sum +
          Number(
            item.coveragePercentage || 0
          ),
        0
      ) / coverage.length
    );
  }, [dashboard]);

  const employeesImproving = useMemo(() => {
    return (
      dashboard?.skillCoverage?.filter(
        (item) =>
          Number(
            item.coveragePercentage || 0
          ) < 100
      ).length || 0
    );
  }, [dashboard]);

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">

        <Sidebar role="MANAGER" />

        <div className="flex-1 min-w-0">

          <Navbar title="Employee Progress" />

          <main className="p-6">

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-slate-700" />

              <p className="mt-4 text-slate-500">
                Loading employee progress...
              </p>

            </div>

          </main>

        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR STATE
  // =========================================================

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50">

        <Sidebar role="MANAGER" />

        <div className="flex-1 min-w-0">

          <Navbar title="Employee Progress" />

          <main className="p-6">

            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">

              <h2 className="text-xl font-bold">
                Unable to load Employee Progress
              </h2>

              <p className="mt-2">
                {error}
              </p>

            </div>

          </main>

        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar role="MANAGER" />

      <div className="flex-1 min-w-0">

        <Navbar title="Employee Progress" />

        <main className="space-y-6 p-6">

          {/* ===================================================
              PAGE HEADER
          =================================================== */}

          <div>

            <h1 className="text-3xl font-bold text-slate-800">
              Employee Progress
            </h1>

            <p className="mt-1 text-slate-500">
              Track learning progress and skill
              development across your team.
            </p>

          </div>

          {/* ===================================================
              SUMMARY CARDS
          =================================================== */}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            <SummaryCard
              icon={
                <Users
                  className="text-blue-600"
                  size={18}
                />
              }
              label="Total Employees"
              value={dashboard?.teamSize || 0}
              helper="Team members"
            />

            <SummaryCard
              icon={
                <Clock3
                  className="text-amber-600"
                  size={18}
                />
              }
              label="Employees In Training"
              value={dashboard?.inTraining || 0}
              helper="Active learning"
            />

            <SummaryCard
              icon={
                <TrendingUp
                  className="text-emerald-600"
                  size={18}
                />
              }
              label="Average Learning Progress"
              value={`${averageProgress.toFixed(0)}%`}
              helper="Across tracked team"
            />

            <SummaryCard
              icon={
                <Activity
                  className="text-violet-600"
                  size={18}
                />
              }
              label="Employees Improving Skills"
              value={employeesImproving}
              helper="Below target"
            />

            <SummaryCard
              icon={
                <ShieldAlert
                  className="text-red-600"
                  size={18}
                />
              }
              label="Employees At Risk"
              value={
                dashboard?.highRiskAlerts
                  ?.length || 0
              }
              helper="High-risk gaps"
            />

            <SummaryCard
              icon={
                <TrendingUp
                  className="text-sky-600"
                  size={18}
                />
              }
              label="Average Skill Coverage"
              value={`${averageSkillCoverage.toFixed(0)}%`}
              helper="Current coverage"
            />

          </div>

          {/* ===================================================
              PROGRESS OVERVIEW
          =================================================== */}

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <h2 className="text-lg font-semibold text-slate-800">
                Progress Overview
              </h2>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search employee"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none md:w-64"
              />

            </div>

            {employeeRows.length === 0 ? (

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">

                No employee progress records are
                available yet for this manager team.

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="min-w-full text-left text-sm">

                  <thead className="bg-slate-50 text-slate-600">

                    <tr>

                      <th className="px-4 py-3 font-semibold">
                        Employee
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Employee ID
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Current Skill Level
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Previous Level
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Improvement
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Progress
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {employeeRows.map(
                      (employee) => {

                        const progressPercentage =
                          Math.min(
                            Math.max(
                              Number(
                                employee.progressPercentage ||
                                  0
                              ),
                              0
                            ),
                            100
                          );

                        return (
                          <tr
                            key={
                              employee.employeeId
                            }
                            className="border-t border-slate-100"
                          >

                            <td className="px-4 py-3 font-medium text-slate-800">
                              {employee.employeeName ||
                                "Unknown"}
                            </td>

                            <td className="px-4 py-3 text-slate-600">
                              {employee.employeeId}
                            </td>

                            <td className="px-4 py-3">
                              {employee.currentSkillLevel ??
                                "-"}
                            </td>

                            <td className="px-4 py-3">
                              {employee.previousSkillLevel ??
                                "-"}
                            </td>

                            <td className="px-4 py-3">
                              {employee.skillImprovement ??
                                "-"}
                            </td>

                            <td className="px-4 py-3">

                              <div className="flex items-center gap-2">

                                <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-100">

                                  <div
                                    className="h-full rounded-full bg-sky-500"
                                    style={{
                                      width: `${progressPercentage}%`,
                                    }}
                                  />

                                </div>

                                <span className="font-semibold text-slate-700">
                                  {progressPercentage.toFixed(
                                    0
                                  )}
                                  %
                                </span>

                              </div>

                            </td>

                            <td className="px-4 py-3">

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                  progressPercentage
                                )}`}
                              >
                                {getStatusText(
                                  progressPercentage
                                )}
                              </span>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}

// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  icon,
  label,
  value,
  helper,
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

      <div className="flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
          {icon}
        </div>

        <div>

          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="text-2xl font-bold text-slate-800">
            {value}
          </p>

          <p className="text-xs text-slate-400">
            {helper}
          </p>

        </div>

      </div>

    </div>
  );
}

// =========================================================
// STATUS TEXT
// =========================================================

function getStatusText(progress) {
  const value = Number(progress || 0);

  if (value >= 90) {
    return "Completed";
  }

  if (value >= 70) {
    return "On Track";
  }

  if (value >= 40) {
    return "In Progress";
  }

  if (value > 0) {
    return "At Risk";
  }

  return "Not Started";
}

// =========================================================
// STATUS CLASSES
// =========================================================

function getStatusClasses(progress) {
  const value = Number(progress || 0);

  if (value >= 90) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (value >= 70) {
    return "bg-sky-100 text-sky-700";
  }

  if (value >= 40) {
    return "bg-amber-100 text-amber-700";
  }

  if (value > 0) {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-200 text-slate-700";
}

export default ManagerEmployeeProgress;