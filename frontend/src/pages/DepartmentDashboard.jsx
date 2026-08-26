import React, { useEffect, useState } from "react";

import axios from "axios";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  Users,
  GraduationCap,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Target,
  Building2,
  RefreshCw,
  AlertCircle,
  Grid3X3,
} from "lucide-react";

const DepartmentDashboard = () => {

  // =========================================================
  // LOGGED-IN EMPLOYEE
  // =========================================================

  const employeeIdentifier =
    localStorage.getItem("employeeId");

  // =========================================================
  // STATE
  // =========================================================

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================================================
  // FETCH DASHBOARD
  // =========================================================

  const fetchDashboard = async () => {

    try {

      setLoading(true);
      setError("");

      if (!employeeIdentifier) {

        throw new Error(
          "Employee ID not found. Please login again."
        );
      }

      const token =
        localStorage.getItem("token");

      const response =
        await axios.get(
          `http://localhost:8080/api/department-head/dashboard/${employeeIdentifier}`,
          {
            headers: token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {},
          }
        );

      console.log(
        "Department Dashboard:",
        response.data
      );

      setDashboard(response.data);

    } catch (err) {

      console.error(
        "Error loading department dashboard:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Failed to load department dashboard."
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  useEffect(() => {

    fetchDashboard();

  }, []);

  // =========================================================
  // GAP DISPLAY HELPERS
  // =========================================================

  const getGapLabel = (gap) => {

    const value = Number(gap || 0);

    if (value === 0) return "No Gap";
    if (value === 1) return "Low";
    if (value === 2) return "Moderate";
    if (value === 3) return "High";

    return "Critical";
  };

  const getGapClass = (gap) => {

    const value = Number(gap || 0);

    if (value === 0) {
      return "bg-gray-100 text-gray-500";
    }

    if (value === 1) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (value === 2) {
      return "bg-orange-200 text-orange-800";
    }

    if (value === 3) {
      return "bg-red-200 text-red-800";
    }

    return "bg-red-600 text-white";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="flex min-h-screen bg-gray-50">

        <Sidebar role="DEPARTMENT HEAD" />

        <div className="flex-1 min-w-0">

          <Navbar title="Department Dashboard" />

          <main className="p-8">

            <div className="bg-white rounded-xl shadow-sm p-6">

              <div className="flex items-center gap-3">

                <RefreshCw
                  size={24}
                  className="animate-spin text-blue-600"
                />

                <p className="text-gray-600">
                  Loading department dashboard...
                </p>

              </div>

            </div>

          </main>

        </div>

      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (

      <div className="flex min-h-screen bg-gray-50">

        <Sidebar role="DEPARTMENT HEAD" />

        <div className="flex-1 min-w-0">

          <Navbar title="Department Dashboard" />

          <main className="p-8">

            <div className="max-w-4xl">

              <div className="bg-red-50 border border-red-200 rounded-xl p-6">

                <div className="flex items-start gap-3">

                  <AlertCircle
                    className="text-red-600 mt-1"
                    size={24}
                  />

                  <div>

                    <h2 className="font-semibold text-red-800">
                      Unable to load department dashboard
                    </h2>

                    <p className="text-red-700 mt-1">
                      {error}
                    </p>

                    <button
                      onClick={fetchDashboard}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Try Again
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </main>

        </div>

      </div>
    );
  }

  // =========================================================
  // NO DATA
  // =========================================================

  if (!dashboard) {

    return (

      <div className="flex min-h-screen bg-gray-50">

        <Sidebar role="DEPARTMENT HEAD" />

        <div className="flex-1 min-w-0">

          <Navbar title="Department Dashboard" />

          <main className="p-8">

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">

              <Building2
                size={48}
                className="mx-auto text-gray-400"
              />

              <h2 className="mt-4 text-xl font-semibold text-gray-800">
                No department data available
              </h2>

              <p className="text-gray-500 mt-2">
                Please make sure the Department Head
                is assigned to a department.
              </p>

            </div>

          </main>

        </div>

      </div>
    );
  }

  // =========================================================
  // DASHBOARD DATA
  // =========================================================

  const {
    departmentName,
    departmentDescription,
    totalEmployees,
    trainingEnrolled,
    trainingCompleted,
    averageLearningProgress,
    criticalSkillGaps,
    topGap,
    topGapCount,
    teamSkillGapMap = [],
  } = dashboard;

  // =========================================================
  // SAFE VALUES
  // =========================================================

  const employees =
    Number(totalEmployees || 0);

  const enrolled =
    Number(trainingEnrolled || 0);

  const completed =
    Number(trainingCompleted || 0);

  const learningProgress =
    Number(averageLearningProgress || 0);

  const criticalGaps =
    Number(criticalSkillGaps || 0);

  const affectedEmployees =
    Number(topGapCount || 0);

  // =========================================================
  // TRAINING COMPLETION RATE
  // =========================================================

  const trainingCompletionRate =
    enrolled > 0
      ? Math.round(
          (completed / enrolled) * 100
        )
      : 0;

  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <div className="flex min-h-screen bg-gray-50">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar role="DEPARTMENT HEAD" />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex-1 min-w-0">

        <Navbar title="Department Dashboard" />

        <main className="p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

            <div>

              <div className="flex items-center gap-3">

                <div className="p-3 bg-blue-100 rounded-xl">

                  <Building2
                    size={28}
                    className="text-blue-600"
                  />

                </div>

                <div>

                  <h1 className="text-3xl font-bold text-slate-800">
                    Department Dashboard
                  </h1>

                  <p className="text-gray-500 mt-1">
                    Department-level learning, training
                    and skill gap overview
                  </p>

                </div>

              </div>

            </div>

            <button
              onClick={fetchDashboard}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm"
            >

              <RefreshCw size={17} />

              Refresh

            </button>

          </div>

          {/* =================================================
              DEPARTMENT INFORMATION
          ================================================= */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">

            <div className="flex items-start gap-4">

              <div className="p-3 bg-blue-50 rounded-xl">

                <Building2
                  size={24}
                  className="text-blue-600"
                />

              </div>

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  {departmentName || "Department"}
                </h2>

                <p className="text-gray-500 mt-1">
                  {departmentDescription ||
                    "Department overview"}
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">

            {/* TOTAL EMPLOYEES */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Total Employees
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {employees}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Employees in department
                  </p>

                </div>

                <div className="p-3 bg-blue-50 rounded-xl">

                  <Users
                    size={25}
                    className="text-blue-600"
                  />

                </div>

              </div>

            </div>

            {/* TRAINING ENROLLED */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Training Enrolled
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {enrolled}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Active training enrollments
                  </p>

                </div>

                <div className="p-3 bg-purple-50 rounded-xl">

                  <GraduationCap
                    size={25}
                    className="text-purple-600"
                  />

                </div>

              </div>

            </div>

            {/* TRAINING COMPLETED */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Training Completed
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {completed}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    {trainingCompletionRate}%
                    completion rate
                  </p>

                </div>

                <div className="p-3 bg-green-50 rounded-xl">

                  <CheckCircle
                    size={25}
                    className="text-green-600"
                  />

                </div>

              </div>

            </div>

            {/* AVERAGE LEARNING PROGRESS */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div className="flex-1">

                  <p className="text-sm font-medium text-gray-500">
                    Average Learning Progress
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {learningProgress}%
                  </p>

                  <div className="mt-3">

                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">

                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{
                          width:
                            `${Math.min(
                              learningProgress,
                              100
                            )}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

                <div className="p-3 bg-blue-50 rounded-xl ml-4">

                  <TrendingUp
                    size={25}
                    className="text-blue-600"
                  />

                </div>

              </div>

            </div>

            {/* CRITICAL SKILL GAPS */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Critical Skill Gaps
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {criticalGaps}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    High-priority gaps
                  </p>

                </div>

                <div className="p-3 bg-red-50 rounded-xl">

                  <AlertTriangle
                    size={25}
                    className="text-red-600"
                  />

                </div>

              </div>

            </div>

            {/* TOP SKILL GAP */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div className="min-w-0">

                  <p className="text-sm font-medium text-gray-500">
                    Top Skill Gap
                  </p>

                  <p className="text-xl font-bold text-gray-900 mt-3 truncate">
                    {topGap || "No major gap"}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">

                    {affectedEmployees} employee
                    {affectedEmployees !== 1
                      ? "s"
                      : ""} affected

                  </p>

                </div>

                <div className="p-3 bg-orange-50 rounded-xl ml-4">

                  <Target
                    size={25}
                    className="text-orange-600"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              TEAM SKILL GAP HEATMAP
          ================================================= */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">

            {/* HEADER */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-red-50 rounded-lg">

                  <Grid3X3
                    size={22}
                    className="text-red-600"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-gray-900">
                    Team Skill Gap Map
                  </h2>

                  <p className="text-sm text-gray-500">
                    Skill gaps across employees in your department
                  </p>

                </div>

              </div>

            </div>

            {/* LEGEND */}

            <div className="flex flex-wrap items-center gap-4 mb-5">

              <span className="text-sm font-medium text-gray-600">
                Gap Level:
              </span>

              <div className="flex items-center gap-1.5">

                <span className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></span>

                <span className="text-xs text-gray-600">
                  0 - No Gap
                </span>

              </div>

              <div className="flex items-center gap-1.5">

                <span className="w-4 h-4 rounded bg-yellow-100"></span>

                <span className="text-xs text-gray-600">
                  1 - Low
                </span>

              </div>

              <div className="flex items-center gap-1.5">

                <span className="w-4 h-4 rounded bg-orange-200"></span>

                <span className="text-xs text-gray-600">
                  2 - Moderate
                </span>

              </div>

              <div className="flex items-center gap-1.5">

                <span className="w-4 h-4 rounded bg-red-200"></span>

                <span className="text-xs text-gray-600">
                  3 - High
                </span>

              </div>

              <div className="flex items-center gap-1.5">

                <span className="w-4 h-4 rounded bg-red-600"></span>

                <span className="text-xs text-gray-600">
                  4+ - Critical
                </span>

              </div>

            </div>

            {/* NO DATA */}

            {teamSkillGapMap.length === 0 ? (

              <div className="py-12 text-center">

                <Grid3X3
                  size={42}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-gray-500 font-medium">
                  No team skill-gap data available
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Skill gaps will appear here once they are detected.
                </p>

              </div>

            ) : (

              /* =================================================
                 HEATMAP TABLE
              ================================================= */

              <div className="overflow-x-auto border border-gray-200 rounded-xl">

                <table className="w-full border-collapse">

                  <thead>

                    <tr className="bg-gray-50">

                      {/* SKILL HEADER */}

                      <th className="sticky left-0 z-10 bg-gray-50 border-b border-r border-gray-200 px-5 py-4 text-left text-sm font-semibold text-gray-700 min-w-[180px]">

                        Skill

                      </th>

                      {/* EMPLOYEE HEADERS */}

                      {teamSkillGapMap[0]?.employees?.map(
                        (employee) => (

                          <th
                            key={employee.employeeId}
                            className="border-b border-gray-200 px-4 py-4 text-center min-w-[130px]"
                          >

                            <div className="text-sm font-semibold text-gray-800 whitespace-nowrap">

                              {employee.employeeName}

                            </div>

                            <div className="text-xs text-gray-400 mt-1">

                              {employee.employeeId}

                            </div>

                          </th>

                        )
                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {teamSkillGapMap.map(
                      (skillRow, skillIndex) => (

                        <tr
                          key={skillRow.skillName}
                          className={
                            skillIndex % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50/50"
                          }
                        >

                          {/* SKILL NAME */}

                          <td className="sticky left-0 z-10 bg-inherit border-r border-b border-gray-200 px-5 py-4">

                            <div className="font-semibold text-gray-800">

                              {skillRow.skillName}

                            </div>

                          </td>

                          {/* GAP CELLS */}

                          {skillRow.employees?.map(
                            (employee) => {

                              const gap =
                                Number(
                                  employee.gap || 0
                                );

                              return (

                                <td
                                  key={employee.employeeId}
                                  className="border-b border-gray-200 p-2 text-center"
                                >

                                  <div
                                    title={`${employee.employeeName} - ${skillRow.skillName}: ${getGapLabel(gap)}`}
                                    className={`mx-auto w-16 h-12 rounded-lg flex flex-col items-center justify-center font-semibold transition-transform hover:scale-105 cursor-default ${getGapClass(gap)}`}
                                  >

                                    <span className="text-lg">

                                      {gap}

                                    </span>

                                    <span className="text-[9px] font-medium">

                                      {getGapLabel(gap)}

                                    </span>

                                  </div>

                                </td>

                              );
                            }
                          )}

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

          {/* =================================================
              ANALYTICS SECTION
          ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* TRAINING OVERVIEW */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center gap-3 mb-6">

                <div className="p-2.5 bg-purple-50 rounded-lg">

                  <GraduationCap
                    size={22}
                    className="text-purple-600"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-gray-900">
                    Training Overview
                  </h2>

                  <p className="text-sm text-gray-500">
                    Department training adoption
                  </p>

                </div>

              </div>

              <div className="space-y-5">

                {/* ENROLLED */}

                <div>

                  <div className="flex justify-between mb-2">

                    <span className="text-sm text-gray-600">
                      Enrolled
                    </span>

                    <span className="text-sm font-semibold text-gray-900">
                      {enrolled}
                    </span>

                  </div>

                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{
                        width:
                          enrolled > 0
                            ? "100%"
                            : "0%",
                      }}
                    />

                  </div>

                </div>

                {/* COMPLETED */}

                <div>

                  <div className="flex justify-between mb-2">

                    <span className="text-sm text-gray-600">
                      Completed
                    </span>

                    <span className="text-sm font-semibold text-gray-900">
                      {completed}
                    </span>

                  </div>

                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width:
                          `${trainingCompletionRate}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* SKILL GAP OVERVIEW */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center gap-3 mb-6">

                <div className="p-2.5 bg-red-50 rounded-lg">

                  <AlertTriangle
                    size={22}
                    className="text-red-600"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-gray-900">
                    Skill Gap Overview
                  </h2>

                  <p className="text-sm text-gray-500">
                    Department's highest priority gap
                  </p>

                </div>

              </div>

              <div className="bg-gray-50 rounded-xl p-5">

                <p className="text-sm text-gray-500">
                  Most Common Skill Gap
                </p>

                <div className="flex items-center justify-between mt-3">

                  <div>

                    <h3 className="text-xl font-bold text-gray-900">
                      {topGap || "No major gap"}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">

                      Reported across{" "}
                      {affectedEmployees} employee
                      {affectedEmployees !== 1
                        ? "s"
                        : ""}

                    </p>

                  </div>

                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">

                    <AlertTriangle
                      size={23}
                      className="text-red-600"
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              FOOTER NOTE
          ================================================= */}

          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">

            <div className="flex gap-3">

              <TrendingUp
                size={20}
                className="text-blue-600 mt-0.5"
              />

              <p className="text-sm text-blue-800">

                This dashboard reflects training enrollment,
                completion, learning progress and
                team skill-gap data recorded for your
                department.

              </p>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default DepartmentDashboard;