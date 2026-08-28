import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Users,
  BarChart3,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

function TeamCoverage() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    loadTeamCoverage();

  }, []);

  const loadTeamCoverage = async () => {

    try {

      setLoading(true);
      setError("");

      const managerEmployeeId =
        localStorage.getItem("employeeId");

      if (!managerEmployeeId) {
        throw new Error(
          "Manager employee ID not found."
        );
      }

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:8080/api/manager-dashboard/team-skills/${managerEmployeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Team Skill Coverage:",
        response.data
      );

      setData(response.data);

    } catch (error) {

      console.error(
        "Error loading team skill coverage:",
        error
      );

      setError(
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to load team skill coverage."
      );

    } finally {

      setLoading(false);

    }
  };

  if (loading) {

    return (
      <div className="p-6">
        <div className="bg-white rounded-xl p-8 shadow-sm">
          Loading team skill coverage...
        </div>
      </div>
    );
  }

  if (error) {

    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">
          <h2 className="font-semibold">
            Unable to load Team Skill Coverage
          </h2>

          <p className="mt-2 text-sm">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (

    <div className="p-6 space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>

        <h1 className="text-2xl font-bold text-slate-800">
          Team Skill Coverage
        </h1>

        <p className="text-slate-500 mt-1">
          {data.departmentName}
        </p>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-lg bg-blue-50">
              <Users
                size={22}
                className="text-blue-600"
              />
            </div>

            <div>

              <p className="text-sm text-slate-500">
                Team Size
              </p>

              <p className="text-2xl font-bold text-slate-800">
                {data.teamSize}
              </p>

            </div>

          </div>

        </div>


        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-lg bg-green-50">
              <BarChart3
                size={22}
                className="text-green-600"
              />
            </div>

            <div>

              <p className="text-sm text-slate-500">
                Overall Coverage
              </p>

              <p className="text-2xl font-bold text-slate-800">
                {data.overallCoverage}%
              </p>

            </div>

          </div>

        </div>


        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-lg bg-purple-50">
              <CheckCircle
                size={22}
                className="text-purple-600"
              />
            </div>

            <div>

              <p className="text-sm text-slate-500">
                Meeting Requirements
              </p>

              <p className="text-2xl font-bold text-slate-800">
                {data.totalEmployeesMeetingRequirement}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          SKILL COVERAGE TABLE
      ===================================================== */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">

        <div className="p-6 border-b border-slate-200">

          <h2 className="text-lg font-semibold text-slate-800">
            Department Skill Coverage
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Current team skill levels compared with required levels
          </p>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-50">

              <tr>

                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Skill
                </th>

                <th className="text-center px-4 py-4 text-sm font-semibold text-slate-600">
                  Employees
                </th>

                <th className="text-center px-4 py-4 text-sm font-semibold text-slate-600">
                  Current Level
                </th>

                <th className="text-center px-4 py-4 text-sm font-semibold text-slate-600">
                  Required Level
                </th>

                <th className="text-center px-4 py-4 text-sm font-semibold text-slate-600">
                  Coverage
                </th>

                <th className="text-center px-4 py-4 text-sm font-semibold text-slate-600">
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {data.skills?.map((skill) => (

                <tr
                  key={skill.skillName}
                  className="border-t border-slate-100"
                >

                  <td className="px-6 py-4 font-medium text-slate-800">
                    {skill.skillName}
                  </td>

                  <td className="text-center px-4 py-4 text-slate-600">
                    {skill.employeeCount}
                  </td>

                  <td className="text-center px-4 py-4 text-slate-600">
                    {skill.averageCurrentLevel}
                  </td>

                  <td className="text-center px-4 py-4 text-slate-600">
                    {skill.averageRequiredLevel}
                  </td>

                  <td className="px-4 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex-1 bg-slate-100 rounded-full h-2">

                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{
                            width: `${skill.coveragePercentage}%`,
                          }}
                        />

                      </div>

                      <span className="text-sm font-semibold">
                        {skill.coveragePercentage}%
                      </span>

                    </div>

                  </td>

                  <td className="text-center px-4 py-4">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        skill.status === "GOOD"
                          ? "bg-green-100 text-green-700"
                          : skill.status === "MODERATE"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {skill.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default TeamCoverage;