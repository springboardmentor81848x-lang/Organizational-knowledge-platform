import React, { useEffect, useMemo, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

// ============================================================
// SEVERITY COLORS
// ============================================================

const SEVERITY_COLORS = {
  Critical: "#ef4444",
  Moderate: "#f59e0b",
  Low: "#22c55e",
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getSeverity = (gap) => {
  if (gap >= 3) return "Critical";
  if (gap === 2) return "Moderate";
  return "Low";
};

const getEmployeeName = (employee) => {
  if (!employee) return "Unknown Employee";

  const fullName = `${employee.firstName || ""} ${
    employee.lastName || ""
  }`.trim();

  return fullName || employee.employeeId || "Unknown Employee";
};

const getDepartmentName = (employee) => {
  return (
    employee?.department?.departmentName ||
    employee?.department?.name ||
    "Unknown Department"
  );
};

const getDesignation = (employee) => {
  return employee?.designation || "Unknown Designation";
};

const getSkillName = (skill) => {
  return skill?.skillName || "Unknown Skill";
};

// ============================================================
// GAP INTELLIGENCE
// ============================================================

export default function GapIntelligence() {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [departmentFilter, setDepartmentFilter] =
    useState("All Departments");

  const [designationFilter, setDesignationFilter] =
    useState("All Designations");

  const [skillFilter, setSkillFilter] =
    useState("All Skills");

  const [severityFilter, setSeverityFilter] =
    useState("All Severities");

  // ==========================================================
  // LOAD KNOWLEDGE GAPS
  // ==========================================================

  const loadGaps = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/knowledge-gaps");

      console.log("Knowledge Gap Data:", response.data);

      setGaps(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Error loading knowledge gaps:",
        err
      );

      setError(
        "Unable to load knowledge gap data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGaps();
  }, []);

  // ==========================================================
  // FILTER OPTIONS
  // ==========================================================

  const departments = useMemo(() => {
    const values = gaps.map((gap) =>
      getDepartmentName(gap.employee)
    );

    return [
      "All Departments",
      ...new Set(values),
    ];
  }, [gaps]);

  const designations = useMemo(() => {
    const values = gaps.map((gap) =>
      getDesignation(gap.employee)
    );

    return [
      "All Designations",
      ...new Set(values),
    ];
  }, [gaps]);

  const skills = useMemo(() => {
    const values = gaps.map((gap) =>
      getSkillName(gap.skill)
    );

    return [
      "All Skills",
      ...new Set(values),
    ];
  }, [gaps]);

  // ==========================================================
  // FILTERED DATA
  // ==========================================================

  const filteredGaps = useMemo(() => {
    return gaps.filter((gap) => {
      const department =
        getDepartmentName(gap.employee);

      const designation =
        getDesignation(gap.employee);

      const skill =
        getSkillName(gap.skill);

      const severity =
        getSeverity(
          Number(gap.gap || 0)
        );

      const departmentMatch =
        departmentFilter === "All Departments" ||
        department === departmentFilter;

      const designationMatch =
        designationFilter === "All Designations" ||
        designation === designationFilter;

      const skillMatch =
        skillFilter === "All Skills" ||
        skill === skillFilter;

      const severityMatch =
        severityFilter === "All Severities" ||
        severity === severityFilter;

      return (
        departmentMatch &&
        designationMatch &&
        skillMatch &&
        severityMatch
      );
    });
  }, [
    gaps,
    departmentFilter,
    designationFilter,
    skillFilter,
    severityFilter,
  ]);

  // ==========================================================
  // GAP SEVERITY BY SKILL
  // ==========================================================

  const skillGapData = useMemo(() => {
    const skillMap = {};

    filteredGaps.forEach((gap) => {
      const skill =
        getSkillName(gap.skill);

      if (!skillMap[skill]) {
        skillMap[skill] = 0;
      }

      skillMap[skill] += 1;
    });

    return Object.entries(skillMap)
      .map(([skill, employees]) => ({
        skill,
        employees,
      }))
      .sort(
        (a, b) =>
          b.employees - a.employees
      )
      .slice(0, 8);
  }, [filteredGaps]);

  // ==========================================================
  // GAP DISTRIBUTION
  // ==========================================================

  const gapDistributionData = useMemo(() => {
    const counts = {
      Critical: 0,
      Moderate: 0,
      Low: 0,
    };

    filteredGaps.forEach((gap) => {
      const severity =
        getSeverity(
          Number(gap.gap || 0)
        );

      counts[severity]++;
    });

    return [
      {
        name: "Critical",
        value: counts.Critical,
        color: SEVERITY_COLORS.Critical,
      },
      {
        name: "Moderate",
        value: counts.Moderate,
        color: SEVERITY_COLORS.Moderate,
      },
      {
        name: "Low",
        value: counts.Low,
        color: SEVERITY_COLORS.Low,
      },
    ];
  }, [filteredGaps]);

  // ==========================================================
  // HEATMAP SKILLS
  // ==========================================================

  const heatmapSkills = useMemo(() => {
    return [
      ...new Set(
        filteredGaps.map((gap) =>
          getSkillName(gap.skill)
        )
      ),
    ].slice(0, 8);
  }, [filteredGaps]);

  // ==========================================================
  // HEATMAP EMPLOYEES
  // ==========================================================

  const heatmapEmployees = useMemo(() => {
    const employeeMap = {};

    filteredGaps.forEach((gap) => {
      const employee =
        gap.employee;

      const employeeId =
        employee?.id ||
        employee?.employeeId;

      if (!employeeId) return;

      if (!employeeMap[employeeId]) {
        employeeMap[employeeId] = {
          id: employeeId,
          name: getEmployeeName(employee),
          skills: {},
        };
      }

      employeeMap[employeeId].skills[
        getSkillName(gap.skill)
      ] = Number(
        gap.gap || 0
      );
    });

    return Object.values(
      employeeMap
    ).slice(0, 10);
  }, [filteredGaps]);

  // ==========================================================
  // TOP GAP SKILLS
  // ==========================================================

  const topGapSkills = useMemo(() => {
    const skillMap = {};

    filteredGaps.forEach((gap) => {
      const skill =
        getSkillName(gap.skill);

      if (!skillMap[skill]) {
        skillMap[skill] = {
          skill,
          totalGap: 0,
          employees: 0,
        };
      }

      skillMap[skill].totalGap +=
        Number(gap.gap || 0);

      skillMap[skill].employees += 1;
    });

    return Object.values(skillMap)
      .sort(
        (a, b) =>
          b.totalGap - a.totalGap
      )
      .slice(0, 6);
  }, [filteredGaps]);

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const resetFilters = () => {
    setDepartmentFilter(
      "All Departments"
    );

    setDesignationFilter(
      "All Designations"
    );

    setSkillFilter(
      "All Skills"
    );

    setSeverityFilter(
      "All Severities"
    );
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* =====================================================
          HR SIDEBAR
      ====================================================== */}

      <Sidebar role="HR" />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="flex-1 min-w-0">

        {/* NAVBAR */}

        <Navbar title="Gap Intelligence" />

        <main className="p-5 md:p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Gap Intelligence
              </h1>

              <p className="text-slate-500 mt-2 text-base">
                Analyze competency gaps across
                employees, skills and departments.
              </p>
            </div>

            <button
              onClick={loadGaps}
              className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
            >
              ↻ Refresh Data
            </button>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

              {/* Department */}

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Department
                </label>

                <select
                  value={departmentFilter}
                  onChange={(e) =>
                    setDepartmentFilter(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {departments.map(
                    (department) => (
                      <option
                        key={department}
                      >
                        {department}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Designation */}

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Designation
                </label>

                <select
                  value={designationFilter}
                  onChange={(e) =>
                    setDesignationFilter(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {designations.map(
                    (designation) => (
                      <option
                        key={designation}
                      >
                        {designation}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Skill */}

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Skill
                </label>

                <select
                  value={skillFilter}
                  onChange={(e) =>
                    setSkillFilter(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {skills.map((skill) => (
                    <option key={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity */}

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Gap Severity
                </label>

                <select
                  value={severityFilter}
                  onChange={(e) =>
                    setSeverityFilter(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>
                    All Severities
                  </option>

                  <option>
                    Critical
                  </option>

                  <option>
                    Moderate
                  </option>

                  <option>
                    Low
                  </option>
                </select>
              </div>

            </div>

            <div className="flex justify-end mt-4">

              <button
                onClick={resetFilters}
                className="text-sm text-indigo-600 font-semibold hover:text-indigo-800"
              >
                Reset Filters
              </button>

            </div>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (

            <div className="bg-white rounded-2xl p-12 text-center">

              <div className="text-slate-500">
                Loading gap intelligence...
              </div>

            </div>

          ) : (

            <>

              {/* =================================================
                  SIDE-BY-SIDE CHARTS
              ================================================= */}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

                {/* =================================================
                    GAP SEVERITY
                ================================================= */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

                  <div className="mb-3">

                    <h2 className="text-xl font-bold text-slate-800">
                      Gap Severity by Skill
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Employees affected by each
                      skill gap
                    </p>

                  </div>

                  <div className="h-[320px]">

                    {skillGapData.length === 0 ? (

                      <div className="h-full flex items-center justify-center text-slate-400">
                        No gap data available
                      </div>

                    ) : (

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <BarChart
                          data={skillGapData}
                          layout="vertical"
                          margin={{
                            top: 5,
                            right: 20,
                            left: 10,
                            bottom: 5,
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
                            dataKey="skill"
                            width={105}
                            tick={{
                              fontSize: 11,
                            }}
                          />

                          <Tooltip />

                          <Bar
                            dataKey="employees"
                            fill="#4f46e5"
                            radius={[
                              0,
                              6,
                              6,
                              0,
                            ]}
                            barSize={24}
                          />

                        </BarChart>

                      </ResponsiveContainer>

                    )}

                  </div>

                </div>

                {/* =================================================
                    GAP DISTRIBUTION
                ================================================= */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

                  <div className="mb-3">

                    <h2 className="text-xl font-bold text-slate-800">
                      Gap Distribution
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Identified gaps grouped by
                      severity
                    </p>

                  </div>

                  <div className="h-[320px]">

                    {filteredGaps.length === 0 ? (

                      <div className="h-full flex items-center justify-center text-slate-400">
                        No gap data available
                      </div>

                    ) : (

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <PieChart>

                          <Pie
                            data={
                              gapDistributionData
                            }
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="45%"
                            innerRadius={55}
                            outerRadius={95}
                            paddingAngle={3}
                          >

                            {gapDistributionData.map(
                              (
                                entry,
                                index
                              ) => (

                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    entry.color
                                  }
                                />

                              )
                            )}

                          </Pie>

                          <Tooltip />

                          <Legend
                            verticalAlign="bottom"
                            height={40}
                          />

                        </PieChart>

                      </ResponsiveContainer>

                    )}

                  </div>

                </div>

              </div>

              {/* =================================================
                  EMPLOYEE × SKILL HEATMAP
              ================================================= */}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">

                <div className="mb-5">

                  <h2 className="text-xl font-bold text-slate-800">
                    Employee × Skill Gap Heatmap
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Identify employees and skills
                    requiring the most attention
                  </p>

                </div>

                {heatmapEmployees.length === 0 ? (

                  <div className="py-12 text-center text-slate-400">
                    No employee gap data available
                  </div>

                ) : (

                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[800px] border-collapse">

                      <thead>

                        <tr>

                          <th className="text-left p-3 text-sm font-semibold text-slate-600 border-b">
                            Employee
                          </th>

                          {heatmapSkills.map(
                            (skill) => (

                              <th
                                key={skill}
                                className="p-3 text-xs font-semibold text-slate-600 border-b text-center"
                              >
                                {skill}
                              </th>

                            )
                          )}

                        </tr>

                      </thead>

                      <tbody>

                        {heatmapEmployees.map(
                          (employee) => (

                            <tr
                              key={
                                employee.id
                              }
                            >

                              <td className="p-3 border-b font-medium text-slate-700">
                                {employee.name}
                              </td>

                              {heatmapSkills.map(
                                (skill) => {

                                  const gap =
                                    employee
                                      .skills[
                                      skill
                                    ] || 0;

                                  let bgClass =
                                    "bg-slate-100 text-slate-400";

                                  if (gap >= 3) {

                                    bgClass =
                                      "bg-red-500 text-white";

                                  } else if (
                                    gap === 2
                                  ) {

                                    bgClass =
                                      "bg-amber-400 text-white";

                                  } else if (
                                    gap === 1
                                  ) {

                                    bgClass =
                                      "bg-yellow-200 text-yellow-800";

                                  }

                                  return (

                                    <td
                                      key={
                                        skill
                                      }
                                      className="p-2 border-b text-center"
                                    >

                                      <div
                                        className={`w-12 h-10 mx-auto rounded-lg flex items-center justify-center font-semibold ${bgClass}`}
                                      >
                                        {gap > 0
                                          ? gap
                                          : "—"}
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

                {/* Heatmap Legend */}

                <div className="flex flex-wrap items-center gap-5 mt-5 text-sm">

                  <div className="flex items-center gap-2">

                    <span className="w-4 h-4 rounded bg-red-500"></span>

                    <span>
                      Critical (3+)
                    </span>

                  </div>

                  <div className="flex items-center gap-2">

                    <span className="w-4 h-4 rounded bg-amber-400"></span>

                    <span>
                      Moderate (2)
                    </span>

                  </div>

                  <div className="flex items-center gap-2">

                    <span className="w-4 h-4 rounded bg-yellow-200"></span>

                    <span>
                      Low (1)
                    </span>

                  </div>

                  <div className="flex items-center gap-2">

                    <span className="w-4 h-4 rounded bg-slate-100"></span>

                    <span>
                      No Gap
                    </span>

                  </div>

                </div>

              </div>

              {/* =================================================
                  SKILLS REQUIRING ATTENTION
              ================================================= */}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

                <div className="mb-5">

                  <h2 className="text-xl font-bold text-slate-800">
                    Skills Requiring Attention
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Skills with the highest combined
                    competency gaps
                  </p>

                </div>

                {topGapSkills.length === 0 ? (

                  <div className="py-8 text-center text-slate-400">
                    No skills requiring attention
                  </div>

                ) : (

                  <div className="overflow-x-auto">

                    <table className="w-full">

                      <thead>

                        <tr className="border-b">

                          <th className="text-left p-3 text-sm font-semibold text-slate-600">
                            Skill
                          </th>

                          <th className="text-center p-3 text-sm font-semibold text-slate-600">
                            Employees Affected
                          </th>

                          <th className="text-center p-3 text-sm font-semibold text-slate-600">
                            Combined Gap
                          </th>

                          <th className="text-center p-3 text-sm font-semibold text-slate-600">
                            Priority
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {topGapSkills.map(
                          (item) => {

                            const averageGap =
                              item.totalGap /
                              item.employees;

                            let priority =
                              "Low";

                            let priorityClass =
                              "bg-green-100 text-green-700";

                            if (
                              averageGap >=
                              3
                            ) {

                              priority =
                                "Critical";

                              priorityClass =
                                "bg-red-100 text-red-700";

                            } else if (
                              averageGap >=
                              2
                            ) {

                              priority =
                                "Moderate";

                              priorityClass =
                                "bg-amber-100 text-amber-700";

                            }

                            return (

                              <tr
                                key={
                                  item.skill
                                }
                                className="border-b last:border-b-0 hover:bg-slate-50"
                              >

                                <td className="p-3 font-medium text-slate-700">
                                  {item.skill}
                                </td>

                                <td className="p-3 text-center text-slate-600">
                                  {
                                    item.employees
                                  }
                                </td>

                                <td className="p-3 text-center font-semibold text-slate-700">
                                  {
                                    item.totalGap
                                  }
                                </td>

                                <td className="p-3 text-center">

                                  <span
                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${priorityClass}`}
                                  >
                                    {priority}
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

            </>

          )}

        </main>

      </div>

    </div>
  );
}