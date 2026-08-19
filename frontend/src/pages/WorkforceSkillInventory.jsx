import React, { useEffect, useState } from "react";
import axios from "axios";

const WorkforceSkillInventory = () => {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchWorkforceSkills = async () => {

      try {

        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:8080/api/hr/workforce-skills",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

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

    fetchWorkforceSkills();

  }, []);

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-slate-600 text-lg">
          Loading workforce skill inventory...
        </div>

      </div>
    );

  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md w-full">

          <h1 className="text-2xl font-bold text-red-600">
            Unable to Load
          </h1>

          <p className="text-slate-600 mt-3">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>

        </div>

      </div>
    );

  }

  // --------------------------------------------------
  // Main Page
  // --------------------------------------------------

  return (

    <div className="min-h-screen bg-slate-50 p-6">

      {/* ================================================
          HEADER
      ================================================= */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-800">
          Workforce Skill Inventory
        </h1>

        <p className="text-slate-500 mt-2">
          Analyze the skills available across the workforce.
        </p>

      </div>


      {/* ================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* Total Employees */}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

          <p className="text-sm text-slate-500">
            Total Employees
          </p>

          <h2 className="text-3xl font-bold text-slate-800 mt-2">
            {data?.totalEmployees ?? 0}
          </h2>

        </div>


        {/* Total Skills */}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

          <p className="text-sm text-slate-500">
            Skills Available
          </p>

          <h2 className="text-3xl font-bold text-slate-800 mt-2">
            {data?.totalSkills ?? 0}
          </h2>

        </div>


        {/* Skills With Gaps */}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

          <p className="text-sm text-slate-500">
            Skills With Gaps
          </p>

          <h2 className="text-3xl font-bold text-red-600 mt-2">
            {data?.skillsWithGaps ?? 0}
          </h2>

        </div>


        {/* Average Skill */}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

          <p className="text-sm text-slate-500">
            Average Workforce Skill
          </p>

          <h2 className="text-3xl font-bold text-indigo-600 mt-2">
            {data?.averageWorkforceSkill ?? 0}
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            out of 5
          </p>

        </div>

      </div>


      {/* ================================================
          SKILL TABLE
      ================================================= */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="p-6 border-b border-slate-200">

          <h2 className="text-xl font-semibold text-slate-800">
            Workforce Skills
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Skill coverage and proficiency across employees.
          </p>

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
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >

                    <td className="px-6 py-4 font-medium text-slate-800">
                      {skill.skill}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {skill.category || "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {skill.employees}
                    </td>

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <span className="font-medium text-slate-700">
                          {skill.averageLevel}
                        </span>

                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">

                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{
                              width: `${Math.min(
                                (skill.averageLevel / 5) * 100,
                                100
                              )}%`
                            }}
                          />

                        </div>

                      </div>

                    </td>


                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <span className="text-slate-700">
                          {skill.coverage}%
                        </span>

                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">

                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${Math.min(
                                skill.coverage,
                                100
                              )}%`
                            }}
                          />

                        </div>

                      </div>

                    </td>


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

    </div>

  );
};


// ==================================================
// GAP STATUS
// ==================================================

const GapStatus = ({ status }) => {

  let className =
    "px-3 py-1 rounded-full text-xs font-medium";

  if (status === "Low") {

    className +=
      " bg-emerald-100 text-emerald-700";

  } else if (status === "Medium") {

    className +=
      " bg-yellow-100 text-yellow-700";

  } else if (status === "High") {

    className +=
      " bg-orange-100 text-orange-700";

  } else {

    className +=
      " bg-red-100 text-red-700";

  }

  return (
    <span className={className}>
      {status}
    </span>
  );

};

export default WorkforceSkillInventory;