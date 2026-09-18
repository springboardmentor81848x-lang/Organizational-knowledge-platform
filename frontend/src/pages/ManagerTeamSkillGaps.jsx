import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

import {
  AlertTriangle,
  BarChart3,
  UserRound,
  ShieldAlert,
  Target,
  Search,
} from "lucide-react";

function ManagerTeamSkillGaps() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] =
    useState("ALL");

  const managerEmployeeId =
    localStorage.getItem("employeeId");

  const token =
    localStorage.getItem("token");

  // =========================================================
  // LOAD MANAGER DASHBOARD
  // =========================================================

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
          "Error loading manager team skill gaps:",
          err
        );

        if (err.response?.status === 401) {
          setError(
            "Your session has expired. Please login again."
          );
        } else if (err.response?.status === 403) {
          setError(
            "You do not have permission to access team skill gaps."
          );
        } else {
          setError(
            err.response?.data?.message ||
              err.response?.data ||
              err.message ||
              "Unable to load team skill gaps."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [managerEmployeeId, token]);

  // =========================================================
  // FILTERED SKILL ROWS
  // =========================================================

  const skillRows = useMemo(() => {
    if (!dashboard?.skillCoverage) {
      return [];
    }

    return dashboard.skillCoverage
      .filter((row) => {
        const matchSearch =
          !search ||
          row.skillName
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchSeverity =
          severityFilter === "ALL" ||
          getSeverityFromCoverage(
            Number(row.coveragePercentage) || 0
          ) === severityFilter;

        return (
          matchSearch &&
          matchSeverity
        );
      })
      .map((row) => ({
        ...row,
        severity:
          getSeverityFromCoverage(
            Number(
              row.coveragePercentage
            ) || 0
          ),
      }));
  }, [
    dashboard,
    search,
    severityFilter,
  ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const summary = useMemo(() => {
    const skillCoverage =
      dashboard?.skillCoverage || [];

    const highRisk =
      dashboard?.highRiskAlerts || [];

    const totalEmployees =
      dashboard?.teamSize || 0;

    const employeesWithGaps =
      skillCoverage.filter(
        (item) =>
          Number(
            item.employeesBelowRequirement
          ) > 0
      ).length;

    const totalSkillGaps =
      skillCoverage.reduce(
        (total, item) =>
          total +
          Number(
            item.employeesBelowRequirement || 0
          ),
        0
      );

    const critical =
      highRisk.filter(
        (item) =>
          String(
            item.severity || ""
          ).toUpperCase() === "CRITICAL"
      ).length;

    const high =
      highRisk.filter(
        (item) =>
          String(
            item.severity || ""
          ).toUpperCase() === "HIGH"
      ).length;

    const averageTeamSkillLevel =
      skillCoverage.length > 0
        ? (
            skillCoverage.reduce(
              (total, item) =>
                total +
                Number(
                  item.averageCurrentLevel || 0
                ),
              0
            ) /
            skillCoverage.length
          ).toFixed(1)
        : "0.0";

    return {
      totalEmployees,
      employeesWithGaps,
      totalSkillGaps,
      highRiskCount:
        high + critical,
      critical,
      averageTeamSkillLevel,
    };
  }, [dashboard]);

  // =========================================================
  // SEVERITY DISTRIBUTION
  // =========================================================

  const severityDistribution = [
    {
      label: "Low",
      count: skillRows.filter(
        (row) => row.severity === "LOW"
      ).length,
    },
    {
      label: "Medium",
      count: skillRows.filter(
        (row) => row.severity === "MEDIUM"
      ).length,
    },
    {
      label: "High",
      count: skillRows.filter(
        (row) => row.severity === "HIGH"
      ).length,
    },
    {
      label: "Critical",
      count: skillRows.filter(
        (row) =>
          row.severity === "CRITICAL"
      ).length,
    },
  ];

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">

        <Sidebar role="MANAGER" />

        <div className="flex-1 min-w-0">

          <Navbar title="Team Skill Gaps" />

          <main className="p-6">

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-slate-700" />

              <p className="mt-4 text-slate-500">
                Loading manager team skill gaps...
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

          <Navbar title="Team Skill Gaps" />

          <main className="p-6">

            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">

              <h2 className="text-xl font-bold">
                Unable to load Team Skill Gaps
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

        <Navbar title="Team Skill Gaps" />

        <main className="space-y-6 p-6">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div>

            <h1 className="text-3xl font-bold text-slate-800">
              Team Skill Gaps
            </h1>

            <p className="mt-1 text-slate-500">
              {dashboard?.departmentName ||
                "Department"}{" "}
              risk overview for your team
            </p>

          </div>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            <SummaryCard
              icon={
                <UserRound
                  className="text-blue-600"
                  size={18}
                />
              }
              label="Total Employees"
              value={summary.totalEmployees}
              helper="Team members"
            />

            <SummaryCard
              icon={
                <AlertTriangle
                  className="text-amber-600"
                  size={18}
                />
              }
              label="Employees With Gaps"
              value={summary.employeesWithGaps}
              helper="Below required level"
            />

            <SummaryCard
              icon={
                <Target
                  className="text-violet-600"
                  size={18}
                />
              }
              label="Total Skill Gaps"
              value={summary.totalSkillGaps}
              helper="Open skill gaps"
            />

            <SummaryCard
              icon={
                <ShieldAlert
                  className="text-red-600"
                  size={18}
                />
              }
              label="High-Risk Gaps"
              value={summary.highRiskCount}
              helper="Critical + high"
            />

            <SummaryCard
              icon={
                <ShieldAlert
                  className="text-rose-600"
                  size={18}
                />
              }
              label="Critical Gaps"
              value={summary.critical}
              helper="Severe skill gaps"
            />

            <SummaryCard
              icon={
                <BarChart3
                  className="text-emerald-600"
                  size={18}
                />
              }
              label="Average Team Skill Level"
              value={`${summary.averageTeamSkillLevel}/5`}
              helper="Current average"
            />

          </div>

          {/* =================================================
              DISTRIBUTION + OVERVIEW
          ================================================= */}

          <div className="grid gap-6 xl:grid-cols-[1.1fr_2fr]">

            {/* =================================================
                GAP DISTRIBUTION
            ================================================= */}

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

              <h2 className="mb-4 text-lg font-semibold text-slate-800">
                Gap Distribution
              </h2>

              <div className="space-y-4">

                {severityDistribution.map(
                  (item) => {

                    const percentage =
                      skillRows.length > 0
                        ? (item.count /
                            skillRows.length) *
                          100
                        : 0;

                    return (
                      <div key={item.label}>

                        <div className="mb-1 flex items-center justify-between text-sm text-slate-600">

                          <span>
                            {item.label}
                          </span>

                          <span>
                            {item.count}
                          </span>

                        </div>

                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">

                          <div
                            className={`h-full rounded-full ${getBarColor(
                              item.label
                            )}`}
                            style={{
                              width: `${Math.max(
                                percentage,
                                item.count
                                  ? 8
                                  : 0
                              )}%`,
                            }}
                          />

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* =================================================
                SKILL GAP OVERVIEW
            ================================================= */}

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                <h2 className="text-lg font-semibold text-slate-800">
                  Skill Gap Overview
                </h2>

                <div className="flex flex-col gap-2 sm:flex-row">

                  <div className="relative">

                    <Search
                      size={16}
                      className="absolute left-3 top-3 text-slate-400"
                    />

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search skill"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-slate-400 focus:outline-none sm:w-52"
                    />

                  </div>

                  <select
                    value={severityFilter}
                    onChange={(e) =>
                      setSeverityFilter(
                        e.target.value
                      )
                    }
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  >

                    <option value="ALL">
                      All severities
                    </option>

                    <option value="LOW">
                      Low
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="HIGH">
                      High
                    </option>

                    <option value="CRITICAL">
                      Critical
                    </option>

                  </select>

                </div>

              </div>

              {/* =================================================
                  TABLE
              ================================================= */}

              <div className="overflow-x-auto">

                <table className="min-w-full text-left text-sm">

                  <thead className="bg-slate-50 text-slate-600">

                    <tr>

                      <th className="px-4 py-3 font-semibold">
                        Skill
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Employees
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Current Avg
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Required Avg
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Coverage
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {skillRows.length === 0 ? (

                      <tr>

                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-slate-500"
                        >
                          No skill gap data matches
                          the current filters.
                        </td>

                      </tr>

                    ) : (

                      skillRows.map(
                        (row) => {

                          const coverage =
                            Number(
                              row.coveragePercentage
                            ) || 0;

                          const currentLevel =
                            Number(
                              row.averageCurrentLevel
                            ) || 0;

                          const requiredLevel =
                            Number(
                              row.averageRequiredLevel
                            ) || 0;

                          return (
                            <tr
                              key={
                                row.skillName
                              }
                              className="border-t border-slate-100"
                            >

                              <td className="px-4 py-3 font-medium text-slate-800">
                                {row.skillName}
                              </td>

                              <td className="px-4 py-3">
                                {row.employeeCount ??
                                  0}
                              </td>

                              <td className="px-4 py-3">
                                {currentLevel.toFixed(
                                  1
                                )}
                              </td>

                              <td className="px-4 py-3">
                                {requiredLevel.toFixed(
                                  1
                                )}
                              </td>

                              <td className="px-4 py-3">

                                <div className="flex items-center gap-2">

                                  <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-100">

                                    <div
                                      className={`h-full rounded-full ${getProgressBarClass(
                                        row.severity
                                      )}`}
                                      style={{
                                        width: `${Math.min(
                                          Math.max(
                                            coverage,
                                            0
                                          ),
                                          100
                                        )}%`,
                                      }}
                                    />

                                  </div>

                                  <span className="text-xs font-semibold text-slate-700">
                                    {coverage.toFixed(
                                      0
                                    )}
                                    %
                                  </span>

                                </div>

                              </td>

                              <td className="px-4 py-3">

                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getChipClasses(
                                    row.severity
                                  )}`}
                                >
                                  {row.severity}
                                </span>

                              </td>

                            </tr>
                          );
                        }
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

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
// SEVERITY FROM COVERAGE
// =========================================================

function getSeverityFromCoverage(value) {
  const coverage = Number(value) || 0;

  if (coverage >= 85) {
    return "LOW";
  }

  if (coverage >= 70) {
    return "MEDIUM";
  }

  if (coverage >= 50) {
    return "HIGH";
  }

  return "CRITICAL";
}

// =========================================================
// CHIP CLASSES
// =========================================================

function getChipClasses(severity) {
  if (severity === "LOW") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (severity === "MEDIUM") {
    return "bg-yellow-100 text-yellow-700";
  }

  if (severity === "HIGH") {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-red-100 text-red-700";
}

// =========================================================
// PROGRESS BAR CLASS
// =========================================================

function getProgressBarClass(severity) {
  if (severity === "LOW") {
    return "bg-emerald-500";
  }

  if (severity === "MEDIUM") {
    return "bg-yellow-500";
  }

  if (severity === "HIGH") {
    return "bg-orange-500";
  }

  return "bg-red-500";
}

// =========================================================
// DISTRIBUTION BAR COLOR
// =========================================================

function getBarColor(label) {
  if (label === "Low") {
    return "bg-emerald-500";
  }

  if (label === "Medium") {
    return "bg-yellow-500";
  }

  if (label === "High") {
    return "bg-orange-500";
  }

  return "bg-red-500";
}

export default ManagerTeamSkillGaps;