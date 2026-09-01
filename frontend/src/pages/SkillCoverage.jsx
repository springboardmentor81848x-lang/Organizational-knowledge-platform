import React, { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  Grid3X3,
  Building2,
  TrendingUp,
  AlertTriangle,
  Users,
  RefreshCw,
} from "lucide-react";

import axios from "axios";

function SkillCoverage() {
  // =========================================================
  // STATE
  // =========================================================

  const [coverageData, setCoverageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // GET SKILL COVERAGE
  // =========================================================

  const loadSkillCoverage = async () => {
    try {
      setLoading(true);
      setError("");

      const employeeId = localStorage.getItem("employeeId");

      if (!employeeId) {
        setError("Department Head employee ID not found.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:8080/api/department-head/skill-coverage/${employeeId}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      setCoverageData(response.data);
    } catch (err) {
      console.error("Error loading skill coverage:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Failed to load department skill coverage."
        );
      } else {
        setError(
          "Unable to connect to the server. Please check whether the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadSkillCoverage();
  }, []);

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const skills = coverageData?.skills || [];

  const totalSkills = coverageData?.totalSkills || 0;

  const averageCoverage =
    skills.length > 0
      ? skills.reduce(
          (sum, skill) => sum + (skill.coveragePercentage || 0),
          0
        ) / skills.length
      : 0;

  const skillsRequiringAttention =
    (coverageData?.partiallyCoveredSkills || 0) +
    (coverageData?.criticalCoverageSkills || 0);

  // =========================================================
  // FORMAT STATUS
  // =========================================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "WELL_COVERED":
        return "Well Covered";

      case "PARTIALLY_COVERED":
        return "Partially Covered";

      case "CRITICAL":
        return "Critical";

      default:
        return status || "Unknown";
    }
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "WELL_COVERED":
        return "bg-green-100 text-green-700";

      case "PARTIALLY_COVERED":
        return "bg-yellow-100 text-yellow-700";

      case "CRITICAL":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="DEPARTMENT HEAD" />

        <div className="flex-1 min-w-0">
          <Navbar title="Skill Coverage" />

          <main className="p-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <RefreshCw
                size={40}
                className="mx-auto text-blue-600 animate-spin"
              />

              <h2 className="mt-4 text-lg font-semibold text-gray-700">
                Loading skill coverage...
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Please wait while department skill data is retrieved.
              </p>
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
          <Navbar title="Skill Coverage" />

          <main className="p-8">
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
              <AlertTriangle
                size={48}
                className="mx-auto text-red-500"
              />

              <h2 className="mt-4 text-xl font-bold text-gray-800">
                Unable to Load Skill Coverage
              </h2>

              <p className="mt-2 text-gray-500">
                {error}
              </p>

              <button
                onClick={loadSkillCoverage}
                className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
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
    <div className="flex min-h-screen bg-gray-50">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar role="DEPARTMENT HEAD" />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex-1 min-w-0">

        {/* ===================================================
            NAVBAR
        =================================================== */}

        <Navbar title="Skill Coverage" />

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main className="p-8">

          

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
                  Skill Coverage Analysis
                </h2>

                <p className="text-gray-500 mt-1">
                  View the skill coverage and workforce capability
                  across your department.
                </p>
              </div>

            </div>

          </div>

          {/* =================================================
              COVERAGE OVERVIEW
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

            {/* TOTAL SKILLS */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Skills Tracked
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {totalSkills}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Department skills
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl">
                  <Grid3X3
                    size={25}
                    className="text-blue-600"
                  />
                </div>

              </div>

            </div>

            {/* AVERAGE COVERAGE */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Average Coverage
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {averageCoverage.toFixed(1)}%
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Overall department coverage
                  </p>
                </div>

                <div className="p-3 bg-green-50 rounded-xl">
                  <TrendingUp
                    size={25}
                    className="text-green-600"
                  />
                </div>

              </div>

            </div>

            {/* SKILLS REQUIRING ATTENTION */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Skills Requiring Attention
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {skillsRequiringAttention}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Insufficient coverage
                  </p>
                </div>

                <div className="p-3 bg-orange-50 rounded-xl">
                  <AlertTriangle
                    size={25}
                    className="text-orange-600"
                  />
                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              STATUS SUMMARY
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp
                    size={20}
                    className="text-green-600"
                  />
                </div>

                <div>
                  <p className="text-sm text-green-700">
                    Well Covered
                  </p>

                  <p className="text-2xl font-bold text-green-800">
                    {coverageData?.wellCoveredSkills || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle
                    size={20}
                    className="text-yellow-600"
                  />
                </div>

                <div>
                  <p className="text-sm text-yellow-700">
                    Partially Covered
                  </p>

                  <p className="text-2xl font-bold text-yellow-800">
                    {coverageData?.partiallyCoveredSkills || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle
                    size={20}
                    className="text-red-600"
                  />
                </div>

                <div>
                  <p className="text-sm text-red-700">
                    Critical
                  </p>

                  <p className="text-2xl font-bold text-red-800">
                    {coverageData?.criticalCoverageSkills || 0}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* =================================================
              SKILL COVERAGE TABLE
          ================================================= */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Grid3X3
                  size={22}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Department Skill Coverage
                </h2>

                <p className="text-sm text-gray-500">
                  Skill availability across employees in your
                  department.
                </p>
              </div>

            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {skills.length === 0 ? (

              <div className="py-14 text-center">

                <Grid3X3
                  size={48}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-4 text-lg font-semibold text-gray-700">
                  No skill coverage data
                </h3>

                <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
                  No employee skill data is currently available
                  for this department.
                </p>

              </div>

            ) : (

              /* =================================================
                 TABLE
              ================================================= */

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>
                    <tr className="border-b border-gray-200">

                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                        Skill
                      </th>

                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                        Category
                      </th>

                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-600">
                        Employees
                      </th>

                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-600">
                        Avg. Level
                      </th>

                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-600">
                        Required Level
                      </th>

                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-600">
                        Coverage
                      </th>

                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-600">
                        Status
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {skills.map((skill) => (

                      <tr
                        key={skill.skillId}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >

                        {/* SKILL */}

                        <td className="py-4 px-4">

                          <div className="flex items-center gap-3">

                            <div className="p-2 bg-blue-50 rounded-lg">
                              <Grid3X3
                                size={18}
                                className="text-blue-600"
                              />
                            </div>

                            <span className="font-semibold text-gray-800">
                              {skill.skillName}
                            </span>

                          </div>

                        </td>

                        {/* CATEGORY */}

                        <td className="py-4 px-4 text-gray-600">
                          {skill.category || "—"}
                        </td>

                        {/* EMPLOYEE COUNT */}

                        <td className="py-4 px-4 text-center">

                          <div className="flex items-center justify-center gap-2">

                            <Users
                              size={17}
                              className="text-gray-400"
                            />

                            <span className="font-medium">
                              {skill.employeeCount}
                            </span>

                          </div>

                        </td>

                        {/* AVERAGE LEVEL */}

                        <td className="py-4 px-4 text-center">

                          <span className="font-semibold text-gray-800">
                            {skill.averageLevel?.toFixed(2) || "0.00"}
                          </span>

                          <span className="text-gray-400">
                            {" "}
                            / 5
                          </span>

                        </td>

                        {/* REQUIRED LEVEL */}

                        <td className="py-4 px-4 text-center">

                          <span className="font-semibold text-gray-800">
                            {skill.requiredLevel}
                          </span>

                          <span className="text-gray-400">
                            {" "}
                            / 5
                          </span>

                        </td>

                        {/* COVERAGE */}

                        <td className="py-4 px-4">

                          <div className="flex items-center gap-3">

                            <div className="w-24 bg-gray-200 rounded-full h-2">

                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    skill.coveragePercentage || 0,
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                            <span className="text-sm font-semibold text-gray-700 min-w-[50px]">
                              {skill.coveragePercentage?.toFixed(1) || "0.0"}%
                            </span>

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="py-4 px-4 text-center">

                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusClass(
                              skill.status
                            )}`}
                          >
                            {getStatusLabel(skill.status)}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

          {/* =================================================
              INFORMATION NOTE
          ================================================= */}

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">

            <div className="flex gap-3">

              <TrendingUp
                size={20}
                className="text-blue-600 mt-0.5"
              />

              <p className="text-sm text-blue-800">
                Skill Coverage provides a department-level view
                of workforce capabilities and helps identify
                areas where additional training or skill
                development may be required.
              </p>

            </div>

          </div>

        </main>

      </div>
    </div>
  );
}

export default SkillCoverage;