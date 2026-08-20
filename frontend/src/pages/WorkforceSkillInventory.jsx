import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  Users,
  BookOpen,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import axios from "axios";

const WorkforceSkillInventory = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWorkforceSkills();
  }, []);

  const fetchWorkforceSkills = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:8080/api/hr/workforce-skills",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Workforce Skill Inventory:", response.data);

      setData(response.data);
    } catch (err) {
      console.error(
        "Workforce skill inventory error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have HR permission to access workforce skill inventory."
        );
      } else {
        setError(
          "Unable to load workforce skill inventory."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="HR" />

        <div className="flex-1 min-w-0">
          <Navbar title="Workforce Skill Inventory" />

          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <RefreshCw
                size={32}
                className="animate-spin mx-auto mb-4 text-indigo-600"
              />

              <p className="text-slate-500">
                Loading workforce skill inventory...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="HR" />

        <div className="flex-1 min-w-0">
          <Navbar title="Workforce Skill Inventory" />

          <div className="flex items-center justify-center min-h-[80vh] p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md w-full">

              <AlertTriangle
                size={42}
                className="mx-auto text-red-500 mb-4"
              />

              <h1 className="text-2xl font-bold text-red-600">
                Unable to Load
              </h1>

              <p className="text-slate-600 mt-3">
                {error}
              </p>

              <button
                onClick={fetchWorkforceSkills}
                className="mt-6 flex items-center justify-center gap-2 mx-auto px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <RefreshCw size={17} />
                Try Again
              </button>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ======================================================
          HR SIDEBAR
      ====================================================== */}

      <Sidebar role="HR" />

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="flex-1 min-w-0">

        <Navbar title="Workforce Skill Inventory" />

        <main className="p-5 md:p-8">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Workforce Skill Inventory
              </h1>

              <p className="text-slate-500 mt-2">
                Analyze the skills available across the workforce.
              </p>
            </div>

            <button
              onClick={fetchWorkforceSkills}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <RefreshCw size={18} />
              Refresh Data
            </button>

          </div>

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

            {/* Total Employees */}

            <SummaryCard
              title="Total Employees"
              value={data?.totalEmployees ?? 0}
              description="Employees in organization"
              icon={<Users size={24} />}
              iconClass="bg-indigo-100 text-indigo-600"
            />

            {/* Skills Available */}

            <SummaryCard
              title="Skills Available"
              value={data?.totalSkills ?? 0}
              description="Skills in workforce"
              icon={<BookOpen size={24} />}
              iconClass="bg-blue-100 text-blue-600"
            />

            {/* Skills With Gaps */}

            <SummaryCard
              title="Skills With Gaps"
              value={data?.skillsWithGaps ?? 0}
              description="Skills requiring attention"
              icon={<AlertTriangle size={24} />}
              iconClass="bg-red-100 text-red-600"
            />

            {/* Average Skill */}

            <SummaryCard
              title="Average Workforce Skill"
              value={data?.averageWorkforceSkill ?? 0}
              description="Average proficiency out of 5"
              icon={<BookOpen size={24} />}
              iconClass="bg-purple-100 text-purple-600"
            />

          </div>

          {/* ==================================================
              SKILL TABLE
          ================================================== */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-6 border-b border-slate-200">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-lg">
                  <BookOpen size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Workforce Skills
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Skill coverage and proficiency across employees.
                  </p>
                </div>

              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Skill
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Category
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Employees
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Average Level
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Coverage
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Gap Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {data?.skills?.length > 0 ? (

                    data.skills.map((skill, index) => (

                      <tr
                        key={index}
                        className="border-t border-slate-100 hover:bg-slate-50 transition"
                      >

                        {/* Skill */}

                        <td className="px-6 py-4 font-medium text-slate-800">

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                              {index + 1}
                            </div>

                            {skill.skill}

                          </div>

                        </td>

                        {/* Category */}

                        <td className="px-6 py-4 text-slate-600">
                          {skill.category || "—"}
                        </td>

                        {/* Employees */}

                        <td className="px-6 py-4 text-slate-600">
                          {skill.employees ?? 0}
                        </td>

                        {/* Average Level */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <span className="font-medium text-slate-700">
                              {skill.averageLevel ?? 0}
                            </span>

                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">

                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    ((Number(skill.averageLevel) || 0) / 5) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>

                        {/* Coverage */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <span className="text-slate-700">
                              {skill.coverage ?? 0}%
                            </span>

                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">

                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    Number(skill.coverage) || 0,
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>

                        {/* Gap Status */}

                        <td className="px-6 py-4">

                          <GapStatus
                            status={skill.gapStatus}
                          />

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>

                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        No workforce skill data available.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="mt-6 text-sm text-slate-400 text-center">
            Showing {data?.skills?.length ?? 0} skills across{" "}
            {data?.totalEmployees ?? 0} employees
          </div>

        </main>

      </div>

    </div>
  );
};

// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({
  title,
  value,
  description,
  icon,
  iconClass,
}) => {
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

        <div className={`p-3 rounded-xl ${iconClass}`}>
          {icon}
        </div>

      </div>

    </div>
  );
};

// ============================================================
// GAP STATUS
// ============================================================

const GapStatus = ({ status }) => {

  let className =
    "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold";

  if (status === "Low") {

    className +=
      " bg-emerald-100 text-emerald-700";

  } else if (status === "Medium") {

    className +=
      " bg-yellow-100 text-yellow-700";

  } else if (status === "High") {

    className +=
      " bg-orange-100 text-orange-700";

  } else if (status === "Critical") {

    className +=
      " bg-red-100 text-red-700";

  } else {

    className +=
      " bg-slate-100 text-slate-600";
  }

  return (
    <span className={className}>
      {status || "Unknown"}
    </span>
  );
};

export default WorkforceSkillInventory;