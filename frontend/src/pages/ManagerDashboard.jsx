import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BarChart3,
  AlertTriangle,
  Activity,
  ClipboardCheck,
  GraduationCap,
  Bell,
  RefreshCw,
  Users,
  User,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

import axios from "axios";
import Sidebar from "../components/Sidebar";

function ManagerDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOGIN INFORMATION
  // =========================================================

  const employeeId = localStorage.getItem("employeeId");
  const token = localStorage.getItem("token");

  // =========================================================
  // NAVIGATION IS SHARED IN Sidebar COMPONENT
  // =========================================================

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // =========================================================
  // LOAD MANAGER DASHBOARD
  // =========================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // -------------------------------------------------------
      // CHECK LOGIN
      // -------------------------------------------------------

      if (!token) {
        setError("Your session has expired. Please login again.");
        return;
      }

      // -------------------------------------------------------
      // CHECK EMPLOYEE ID
      // -------------------------------------------------------

      if (!employeeId) {
        setError(
          "Manager employee ID not found. Please login again."
        );
        return;
      }

      console.log("====================================");
      console.log("MANAGER DASHBOARD REQUEST");
      console.log("Employee ID:", employeeId);
      console.log("Token exists:", !!token);
      console.log("====================================");

      // -------------------------------------------------------
      // API REQUEST
      // -------------------------------------------------------
      // IMPORTANT:
      // employeeId = business ID such as EMP1001
      //
      // userId = database primary key such as 43
      //
      // Manager Dashboard endpoint expects employeeId.
      // -------------------------------------------------------

      const response = await axios.get(
        `http://localhost:8080/api/manager-dashboard/manager/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Manager Dashboard Response:",
        response.data
      );

      setDashboard(response.data);
    } catch (err) {
      console.error(
        "Error loading manager dashboard:",
        err
      );

      // -------------------------------------------------------
      // UNAUTHORIZED
      // -------------------------------------------------------

      if (err.response?.status === 401) {
        console.error(
          "JWT token is invalid or expired."
        );

        localStorage.clear();

        alert(
          "Your session has expired. Please login again."
        );

        navigate("/login");
        return;
      }

      // -------------------------------------------------------
      // FORBIDDEN
      // -------------------------------------------------------

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to access the Manager Dashboard."
        );
        return;
      }

      // -------------------------------------------------------
      // OTHER SERVER ERROR
      // -------------------------------------------------------

      if (err.response?.data?.message) {
        setError(
          err.response.data.message
        );
      } else if (typeof err.response?.data === "string") {
        setError(
          err.response.data
        );
      } else {
        setError(
          "Unable to load manager dashboard."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD DASHBOARD ON PAGE LOAD
  // =========================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================================================
  // HELPERS
  // =========================================================

  const getSeverityClass = (severity) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-100 text-red-700";

      case "HIGH":
        return "bg-orange-100 text-orange-700";

      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";

      case "LOW":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-green-100 text-green-700";
    }
  };

  const getGapBarClass = (percentage) => {
    if (percentage >= 50) {
      return "bg-red-500";
    }

    if (percentage >= 30) {
      return "bg-orange-500";
    }

    if (percentage >= 15) {
      return "bg-yellow-500";
    }

    return "bg-green-500";
  };

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />

        <main className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={35}
              className="animate-spin mx-auto text-gray-600"
            />

            <p className="mt-4 text-gray-600">
              Loading Manager Dashboard...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // ERROR STATE
  // =========================================================

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />

        <main className="ml-64 flex-1 p-8">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={28} />

              <h2 className="text-xl font-bold">
                Unable to Load Dashboard
              </h2>
            </div>

            <p className="mt-4 text-gray-600">
              {error}
            </p>

            <button
              onClick={loadDashboard}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // SAFE DATA
  // =========================================================

  const teamGapHeatmap =
    dashboard?.teamGapHeatmap || [];

  const skillCoverage =
    dashboard?.skillCoverage || [];

  const highRiskAlerts =
    dashboard?.highRiskAlerts || [];

  const employeeProgress =
    dashboard?.employeeProgress || [];

  const trainingAdoption =
    dashboard?.trainingAdoption || {};

  // =========================================================
  // TRAINING VALUES
  // =========================================================

  const enrolled =
    Number(trainingAdoption.enrolled) || 0;

  const inProgress =
    Number(trainingAdoption.inProgress) || 0;

  const completed =
    Number(trainingAdoption.completed) || 0;

  const completionRate =
    enrolled > 0
      ? Math.min(
          100,
          Math.round(
            (completed / enrolled) * 100
          )
        )
      : 0;

  // =========================================================
  // MAIN DASHBOARD
  // =========================================================

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar role="MANAGER" />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="flex-1 p-8">
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manager Dashboard
            </h1>

            <p className="text-gray-500 mt-1">
              Monitor your team's skills, knowledge gaps
              and learning progress.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* ===================================================
            OVERVIEW CARDS
        =================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {/* TEAM SIZE */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Team Size
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboard?.teamSize ?? 0}
                </h2>

                <p className="text-xs text-gray-500 mt-2">
                  Employees in your department
                </p>
              </div>

              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <Users
                  size={24}
                  className="text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* SKILL GAPS */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Skill Gaps
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboard?.skillGaps ?? 0}
                </h2>

                <p className="text-xs text-gray-500 mt-2">
                  Identified skill gaps
                </p>
              </div>

              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <BarChart3
                  size={24}
                  className="text-orange-600"
                />
              </div>
            </div>
          </div>

          {/* IN TRAINING */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  In Training
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboard?.inTraining ?? 0}
                </h2>

                <p className="text-xs text-gray-500 mt-2">
                  Employees currently learning
                </p>
              </div>

              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <GraduationCap
                  size={24}
                  className="text-blue-600"
                />
              </div>
            </div>
          </div>

          {/* HIGH RISK GAPS */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  High Risk Gaps
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboard?.highRiskGaps ?? 0}
                </h2>

                <p className="text-xs text-gray-500 mt-2">
                  High or critical gaps
                </p>
              </div>

              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle
                  size={24}
                  className="text-red-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            TEAM GAP HEATMAP
        =================================================== */}

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Team Gap Heatmap
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Average knowledge gap by skill across your team
            </p>
          </div>

          {teamGapHeatmap.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No skill gap data available.
            </div>
          ) : (
            <div className="space-y-5">
              {teamGapHeatmap.map((item, index) => {
                const gapPercentage =
                  Number(item.gapPercentage) || 0;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">
                        {item.skillName}
                      </span>

                      <span className="text-sm font-semibold text-gray-700">
                        {gapPercentage}%
                      </span>
                    </div>

                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getGapBarClass(
                          gapPercentage
                        )}`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              gapPercentage
                            )
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      Severity: {item.severity || "LOW"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ===================================================
            SKILL COVERAGE + TRAINING ADOPTION
        =================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* =================================================
              DEPARTMENT SKILL COVERAGE
          ================================================= */}

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Department Skill Coverage
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Average current skill level against required level
              </p>
            </div>

            {skillCoverage.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                No skill coverage data available.
              </div>
            ) : (
              <div className="space-y-5">
                {skillCoverage.map((item, index) => {
                  const coveragePercentage =
                    Number(
                      item.coveragePercentage
                    ) || 0;

                  return (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-800">
                          {item.skillName}
                        </span>

                        <span className="font-semibold text-gray-700">
                          {coveragePercentage}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-800 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                coveragePercentage
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* =================================================
              TRAINING ADOPTION
          ================================================= */}

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Training Adoption
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Training enrollment and completion overview
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* ENROLLED */}

              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <p className="text-sm text-gray-500">
                  Enrolled
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {enrolled}
                </p>
              </div>

              {/* IN PROGRESS */}

              <div className="bg-blue-50 rounded-xl p-5 text-center">
                <p className="text-sm text-blue-600">
                  In Progress
                </p>

                <p className="text-3xl font-bold text-blue-700 mt-2">
                  {inProgress}
                </p>
              </div>

              {/* COMPLETED */}

              <div className="bg-green-50 rounded-xl p-5 text-center">
                <p className="text-sm text-green-600">
                  Completed
                </p>

                <p className="text-3xl font-bold text-green-700 mt-2">
                  {completed}
                </p>
              </div>
            </div>

            {/* COMPLETION RATE */}

            <div className="mt-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">
                  Completion Rate
                </span>

                <span className="font-semibold text-gray-700">
                  {completionRate}%
                </span>
              </div>

              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{
                    width: `${completionRate}%`,
                  }}
                />
              </div>
            </div>
          </section>
        </div>

        {/* ===================================================
            HIGH-RISK SKILL GAP ALERTS
        =================================================== */}

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                High-Risk Skill Gap Alerts
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Employees requiring immediate skill development attention
              </p>
            </div>

            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} />

              <span className="font-semibold">
                {highRiskAlerts.length} Alerts
              </span>
            </div>
          </div>

          {highRiskAlerts.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-600 text-xl">
                  ✓
                </span>
              </div>

              <p className="mt-3 font-medium text-gray-700">
                No high-risk skill gaps detected.
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Your team is currently in a healthy state.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 text-sm font-semibold text-gray-600">
                      Employee
                    </th>

                    <th className="pb-3 text-sm font-semibold text-gray-600">
                      Employee ID
                    </th>

                    <th className="pb-3 text-sm font-semibold text-gray-600">
                      Skill
                    </th>

                    <th className="pb-3 text-sm font-semibold text-gray-600">
                      Gap
                    </th>

                    <th className="pb-3 text-sm font-semibold text-gray-600">
                      Severity
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {highRiskAlerts.map(
                    (alert, index) => {
                      const gapPercentage =
                        Number(
                          alert.gapPercentage
                        ) || 0;

                      return (
                        <tr
                          key={index}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="py-4 font-medium text-gray-800">
                            {alert.employeeName}
                          </td>

                          <td className="py-4 text-gray-500">
                            {alert.employeeId}
                          </td>

                          <td className="py-4 text-gray-700">
                            {alert.skillName}
                          </td>

                          <td className="py-4 font-semibold text-red-600">
                            {gapPercentage}%
                          </td>

                          <td className="py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityClass(
                                alert.severity
                              )}`}
                            >
                              {alert.severity}
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
        </section>

        {/* ===================================================
            EMPLOYEE PROGRESS
        =================================================== */}

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Employee Progress
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Training progress across your team
            </p>
          </div>

          {employeeProgress.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No employee training progress available.
            </div>
          ) : (
            <div className="space-y-5">
              {employeeProgress.map(
                (employee, index) => {
                  const progressPercentage =
                    Number(
                      employee.progressPercentage
                    ) || 0;

                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {employee.employeeName}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {employee.employeeId}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {progressPercentage}%
                          </p>

                          <p className="text-xs text-gray-500">
                            Overall Progress
                          </p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-800 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                progressPercentage
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ManagerDashboard;