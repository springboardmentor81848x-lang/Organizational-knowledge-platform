import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  Users,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Search,
  RefreshCw,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from "lucide-react";

import api from "../services/api";

function HRDashboard() {
  const [dashboard, setDashboard] = useState({
    totalEmployees: 0,
    employeesWithGaps: 0,
    criticalGaps: 0,

    employeesInTraining: 0,
    trainingCompletionRate: 0,
    averageLearningProgress: 0,
    averageSkillImprovement: 0,
    activeMentorships: 0,

    averageGap: 0,
    totalKnowledgeGaps: 0,

    performance: {
      excellent: 0,
      good: 0,
      needsAttention: 0,
      critical: 0,
    },

    gapDistribution: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },

    topSkillGaps: [],
    employees: [],
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const response = await api.get("/hr/dashboard/summary");

      console.log("HR Dashboard Data:", response.data);

      setDashboard({
        totalEmployees: response.data?.totalEmployees ?? 0,
        employeesWithGaps: response.data?.employeesWithGaps ?? 0,
        criticalGaps: response.data?.criticalGaps ?? 0,

        employeesInTraining:
          response.data?.employeesInTraining ?? 0,

        trainingCompletionRate:
          response.data?.trainingCompletionRate ?? 0,

        averageLearningProgress:
          response.data?.averageLearningProgress ?? 0,

        averageSkillImprovement:
          response.data?.averageSkillImprovement ?? 0,

        activeMentorships:
          response.data?.activeMentorships ?? 0,

        averageGap:
          response.data?.averageGap ?? 0,

        totalKnowledgeGaps:
          response.data?.totalKnowledgeGaps ?? 0,

        performance: {
          excellent:
            response.data?.performance?.excellent ?? 0,

          good:
            response.data?.performance?.good ?? 0,

          needsAttention:
            response.data?.performance?.needsAttention ?? 0,

          critical:
            response.data?.performance?.critical ?? 0,
        },

        gapDistribution: {
          low:
            response.data?.gapDistribution?.low ?? 0,

          medium:
            response.data?.gapDistribution?.medium ?? 0,

          high:
            response.data?.gapDistribution?.high ?? 0,

          critical:
            response.data?.gapDistribution?.critical ?? 0,
        },

        topSkillGaps:
          Array.isArray(response.data?.topSkillGaps)
            ? response.data.topSkillGaps
            : [],

        employees:
          Array.isArray(response.data?.employees)
            ? response.data.employees
            : [],
      });
    } catch (error) {
      console.error(
        "Error loading HR dashboard:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FILTER EMPLOYEES
  // =========================================================

  const filteredEmployees = useMemo(() => {
    return dashboard.employees.filter((employee) => {
      const employeeName =
        employee.employee?.toLowerCase() || "";

      const designation =
        employee.designation?.toLowerCase() || "";

      const searchText = search.toLowerCase();

      const matchesSearch =
        employeeName.includes(searchText) ||
        designation.includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        employee.gapStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    dashboard.employees,
    search,
    statusFilter,
  ]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="HR" />

        <div className="flex-1 min-w-0">
          <Navbar title="HR Dashboard" />

          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <RefreshCw
                size={32}
                className="animate-spin mx-auto mb-4 text-indigo-600"
              />

              <p className="text-gray-500">
                Loading HR dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN DASHBOARD
  // =========================================================

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar role="HR" />

      <div className="flex-1 min-w-0">

        <Navbar title="HR Dashboard" />

        <main className="p-5 md:p-8">

          {/* HEADER */}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                HR Dashboard
              </h1>

              <p className="text-slate-500 mt-2">
                Monitor employee performance, skills and
                organizational knowledge gaps.
              </p>
            </div>

            <button
              onClick={loadDashboard}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <RefreshCw size={18} />

              Refresh Data
            </button>

          </div>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <SummaryCard
              title="Total Employees"
              value={dashboard.totalEmployees}
              description="Employees in organization"
              icon={<Users size={24} />}
              iconClass="bg-indigo-100 text-indigo-600"
            />

            <SummaryCard
              title="Employees With Skill Gaps"
              value={dashboard.employeesWithGaps}
              description="Employees requiring attention"
              icon={<UserCheck size={24} />}
              iconClass="bg-orange-100 text-orange-600"
            />

            <SummaryCard
              title="Critical Skill Gaps"
              value={dashboard.criticalGaps}
              description="Critical gaps requiring immediate action"
              icon={<AlertCircle size={24} />}
              iconClass="bg-red-100 text-red-600"
            />

            <SummaryCard
              title="Employees in Training"
              value={dashboard.employeesInTraining}
              description="Employees currently in training"
              icon={<Target size={24} />}
              iconClass="bg-blue-100 text-blue-600"
            />

            <SummaryCard
              title="Training Completion Rate"
              value={`${dashboard.trainingCompletionRate}%`}
              description="Overall training completion"
              icon={<CheckCircle size={24} />}
              iconClass="bg-green-100 text-green-600"
            />

            <SummaryCard
              title="Average Learning Progress"
              value={`${dashboard.averageLearningProgress}%`}
              description="Average employee learning progress"
              icon={<TrendingUp size={24} />}
              iconClass="bg-purple-100 text-purple-600"
            />

            <SummaryCard
              title="Average Skill Improvement"
              value={`${dashboard.averageSkillImprovement}%`}
              description="Average improvement after training"
              icon={<BarChart3 size={24} />}
              iconClass="bg-cyan-100 text-cyan-600"
            />

            <SummaryCard
              title="Active Mentorships"
              value={dashboard.activeMentorships}
              description="Currently active mentorships"
              icon={<Users size={24} />}
              iconClass="bg-pink-100 text-pink-600"
            />

          </div>

          {/* =================================================
              PERFORMANCE + GAP DISTRIBUTION
          ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

            {/* PERFORMANCE */}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

              <div className="flex items-center gap-3 mb-7">

                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-lg">
                  <BarChart3 size={21} />
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

              <PerformanceBar
                label="Excellent"
                value={dashboard.performance.excellent}
                total={dashboard.totalEmployees}
                color="bg-green-500"
              />

              <PerformanceBar
                label="Good"
                value={dashboard.performance.good}
                total={dashboard.totalEmployees}
                color="bg-blue-500"
              />

              <PerformanceBar
                label="Needs Attention"
                value={
                  dashboard.performance.needsAttention
                }
                total={dashboard.totalEmployees}
                color="bg-orange-500"
              />

              <PerformanceBar
                label="Critical"
                value={dashboard.performance.critical}
                total={dashboard.totalEmployees}
                color="bg-red-500"
              />

            </div>

            {/* KNOWLEDGE GAP */}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

              <div className="flex items-center gap-3 mb-7">

                <div className="p-2.5 bg-orange-100 text-orange-600 rounded-lg">
                  <AlertTriangle size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Knowledge Gap Distribution
                  </h2>

                  <p className="text-sm text-slate-500">
                    Severity of identified knowledge gaps
                  </p>
                </div>

              </div>

              <GapBar
                label="Low"
                value={dashboard.gapDistribution.low}
                total={dashboard.totalKnowledgeGaps}
                color="bg-green-500"
              />

              <GapBar
                label="Medium"
                value={dashboard.gapDistribution.medium}
                total={dashboard.totalKnowledgeGaps}
                color="bg-yellow-500"
              />

              <GapBar
                label="High"
                value={dashboard.gapDistribution.high}
                total={dashboard.totalKnowledgeGaps}
                color="bg-orange-500"
              />

              <GapBar
                label="Critical"
                value={dashboard.gapDistribution.critical}
                total={dashboard.totalKnowledgeGaps}
                color="bg-red-500"
              />

            </div>

          </div>

          {/* =================================================
              TOP SKILL GAPS
          ================================================= */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mt-8 p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="p-2.5 bg-purple-100 text-purple-600 rounded-lg">
                <Brain size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Top Skills With Knowledge Gaps
                </h2>

                <p className="text-sm text-slate-500">
                  Skills that require organizational training
                </p>
              </div>

            </div>

            {dashboard.topSkillGaps.length > 0 ? (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>
                    <tr className="border-b border-slate-200">

                      <th className="text-left py-3 px-3 text-sm font-semibold text-slate-500">
                        Skill
                      </th>

                      <th className="text-left py-3 px-3 text-sm font-semibold text-slate-500">
                        Employees Affected
                      </th>

                      <th className="text-left py-3 px-3 text-sm font-semibold text-slate-500">
                        Average Gap
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {dashboard.topSkillGaps.map(
                      (item, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 hover:bg-slate-50 transition"
                        >

                          <td className="py-4 px-3">

                            <div className="flex items-center gap-3">

                              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                                {index + 1}
                              </div>

                              <span className="font-medium text-slate-800">
                                {item.skill}
                              </span>

                            </div>

                          </td>

                          <td className="py-4 px-3 text-slate-600">
                            {item.employeesAffected ?? 0}
                          </td>

                          <td className="py-4 px-3">

                            <span className="font-semibold text-orange-600">
                              {item.averageGap ?? 0}
                            </span>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="text-center py-10 text-slate-500">
                No knowledge gaps found.
              </div>

            )}

          </div>

          {/* =================================================
              EMPLOYEE SKILL OVERVIEW
          ================================================= */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mt-8 p-6">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Employee Skill Overview
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Review employee skill levels and gap status
                </p>
              </div>

              <div className="relative w-full lg:w-72">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search employee..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

            </div>

            {/* FILTERS */}

            <div className="flex flex-wrap gap-2 mb-6">

              {[
                "All",
                "Low",
                "Medium",
                "High",
                "Critical",
              ].map((status) => (

                <button
                  key={status}
                  onClick={() =>
                    setStatusFilter(status)
                  }
                  className={
                    statusFilter === status
                      ? "px-4 py-2 rounded-lg text-sm font-medium transition bg-indigo-600 text-white"
                      : "px-4 py-2 rounded-lg text-sm font-medium transition bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }
                >
                  {status}
                </button>

              ))}

            </div>

            {/* EMPLOYEE TABLE */}

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-slate-200">

                    <th className="text-left py-3 px-3 text-sm font-semibold text-slate-500">
                      Employee
                    </th>

                    <th className="text-left py-3 px-3 text-sm font-semibold text-slate-500">
                      Designation
                    </th>

                    <th className="text-left py-3 px-3 text-sm font-semibold text-slate-500">
                      Average Skill
                    </th>

                    <th className="text-left py-3 px-3 text-sm font-semibold text-slate-500">
                      Gap Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredEmployees.length > 0 ? (

                    filteredEmployees.map(
                      (employee, index) => (

                        <tr
                          key={
                            employee.employeeId ??
                            index
                          }
                          className="border-b border-slate-100 hover:bg-slate-50 transition"
                        >

                          {/* EMPLOYEE */}

                          <td className="py-4 px-3">

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">

                                {employee.employee
                                  ?.charAt(0)
                                  ?.toUpperCase() || "E"}

                              </div>

                              <span className="font-medium text-slate-800">
                                {employee.employee ||
                                  "Unknown Employee"}
                              </span>

                            </div>

                          </td>

                          {/* DESIGNATION */}

                          <td className="py-4 px-3 text-slate-600">

                            {employee.designation ||
                              "Not Assigned"}

                          </td>

                          {/* AVERAGE SKILL */}

                          <td className="py-4 px-3">

                            <div className="flex items-center gap-3">

                              <div className="w-28 bg-slate-200 rounded-full h-2.5 overflow-hidden">

                                <div
                                  className="bg-indigo-600 h-2.5 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(
                                      Number(
                                        employee.averageSkill
                                      ) || 0,
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                              <span className="text-sm font-medium text-slate-700">
                                {employee.averageSkill ??
                                  0}
                                %
                              </span>

                            </div>

                          </td>

                          {/* GAP STATUS */}

                          <td className="py-4 px-3">

                            <GapStatus
                              status={
                                employee.gapStatus
                              }
                            />

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="4"
                        className="text-center py-10 text-slate-500"
                      >
                        No employees found.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* FOOTER */}

          <div className="mt-6 text-sm text-slate-400 text-center">

            Showing {filteredEmployees.length} of{" "}
            {dashboard.employees.length} employees

          </div>

        </main>

      </div>

    </div>
  );
}


// =============================================================
// SUMMARY CARD
// =============================================================

function SummaryCard({
  title,
  value,
  description,
  icon,
  iconClass,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="text-3xl font-bold text-slate-800 mt-3">
            {value}
          </h2>

          <p className="text-xs text-slate-400 mt-2">
            {description}
          </p>

        </div>

        <div
          className={`p-3 rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


// =============================================================
// PERFORMANCE BAR
// =============================================================

function PerformanceBar({
  label,
  value,
  total,
  color,
}) {
  const safeValue = Number(value) || 0;
  const safeTotal = Number(total) || 0;

  const percentage =
    safeTotal > 0
      ? Math.min(
          (safeValue / safeTotal) * 100,
          100
        )
      : 0;

  return (
    <div className="mb-6">

      <div className="flex justify-between mb-2">

        <span className="font-medium text-slate-700">
          {label}
        </span>

        <span className="text-sm text-slate-500">
          {safeValue} ({percentage.toFixed(0)}%)
        </span>

      </div>

      <div className="bg-slate-100 rounded-full h-3 overflow-hidden">

        <div
          className={`${color} h-3 rounded-full transition-all`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}


// =============================================================
// GAP BAR
// =============================================================

function GapBar({
  label,
  value,
  total,
  color,
}) {
  const safeValue = Number(value) || 0;
  const safeTotal = Number(total) || 0;

  const percentage =
    safeTotal > 0
      ? Math.min(
          (safeValue / safeTotal) * 100,
          100
        )
      : 0;

  return (
    <div className="mb-6">

      <div className="flex justify-between mb-2">

        <span className="font-medium text-slate-700">
          {label}
        </span>

        <span className="text-sm text-slate-500">
          {safeValue} ({percentage.toFixed(0)}%)
        </span>

      </div>

      <div className="bg-slate-100 rounded-full h-3 overflow-hidden">

        <div
          className={`${color} h-3 rounded-full transition-all`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}


// =============================================================
// GAP STATUS
// =============================================================

function GapStatus({ status }) {
  let className =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold";

  let icon;

  if (status === "Low") {
    className +=
      " bg-green-100 text-green-700";

    icon = <CheckCircle size={13} />;
  } else if (status === "Medium") {
    className +=
      " bg-yellow-100 text-yellow-700";

    icon = <AlertTriangle size={13} />;
  } else if (status === "High") {
    className +=
      " bg-orange-100 text-orange-700";

    icon = <AlertTriangle size={13} />;
  } else {
    className +=
      " bg-red-100 text-red-700";

    icon = <AlertCircle size={13} />;
  }

  return (
    <span className={className}>
      {icon}

      {status || "Unknown"}
    </span>
  );
}


export default HRDashboard;