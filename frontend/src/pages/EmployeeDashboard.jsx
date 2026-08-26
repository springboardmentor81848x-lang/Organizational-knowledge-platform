import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import {
  getEmployeeSkills,
  getKnowledgeGapsByEmployee,
} from "../services/platformService";

function EmployeeDashboard() {
  // =========================================================
  // EMPLOYEE INFORMATION
  // =========================================================

  const firstName =
    localStorage.getItem("firstName") || "";

  const lastName =
    localStorage.getItem("lastName") || "";

  const employeeId =
    localStorage.getItem("employeeId");

  const fullName = [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ");

  // =========================================================
  // STATE
  // =========================================================

  const [skills, setSkills] = useState([]);
  const [gaps, setGaps] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================================================
  // SKILL LEVEL NAMES
  // =========================================================

  const levelNames = {
    1: "Beginner",
    2: "Intermediate",
    3: "Competent",
    4: "Advanced",
    5: "Expert",
  };

  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "Employee ID:",
        employeeId
      );

      if (!employeeId) {
        setError(
          "Employee ID not found. Please login again."
        );

        return;
      }

      // =====================================================
      // 1. CURRENT SKILL INVENTORY
      // =====================================================

      try {
        const skillResponse =
          await getEmployeeSkills(
            employeeId
          );

        console.log(
          "Current Skill Inventory:",
          skillResponse.data
        );

        const currentSkills =
          Array.isArray(skillResponse.data)
            ? skillResponse.data
            : [];

        setSkills(currentSkills);
      } catch (skillError) {
        console.error(
          "Skill API error:",
          skillError
        );

        console.error(
          "Skill API URL:",
          skillError.config?.url
        );

        console.error(
          "Skill API response:",
          skillError.response?.data
        );

        setSkills([]);
      }

      // =====================================================
      // 2. STORED KNOWLEDGE GAPS
      // =====================================================

      try {
        const gapResponse =
          await getKnowledgeGapsByEmployee(
            employeeId
          );

        console.log(
          "Stored Knowledge Gaps:",
          gapResponse.data
        );

        const storedGaps =
          Array.isArray(gapResponse.data)
            ? gapResponse.data
            : [];

        setGaps(storedGaps);
      } catch (gapError) {
        console.error(
          "Knowledge Gap API error:",
          gapError
        );

        console.error(
          "Knowledge Gap API URL:",
          gapError.config?.url
        );

        console.error(
          "Knowledge Gap API response:",
          gapError.response?.data
        );

        setGaps([]);
      }
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // AVERAGE SKILL LEVEL
  // =========================================================

  const calculateAverageLevel = () => {
    if (skills.length === 0) {
      return 0;
    }

    const totalLevel =
      skills.reduce(
        (total, item) =>
          total +
          Number(
            item.currentLevel || 0
          ),
        0
      );

    return totalLevel / skills.length;
  };

  const averageLevel =
    calculateAverageLevel();

  // =========================================================
  // SKILL SCORE
  // =========================================================

  const skillScore =
    Math.round(
      (averageLevel / 5) * 100
    );

  // =========================================================
  // GET SKILL NAME
  // =========================================================

  const getSkillName = (item) => {
    return (
      item?.skill?.skillName ||
      item?.skillName ||
      item?.skill ||
      ""
    );
  };

  // =========================================================
  // FIND MATCHING KNOWLEDGE GAP
  // =========================================================

  const getMatchingGap = (
    skillName
  ) => {
    if (!skillName) {
      return null;
    }

    return gaps.find((gap) => {
      const gapSkillName =
        gap?.skill?.skillName ||
        gap?.skillName ||
        gap?.skill ||
        "";

      return (
        gapSkillName &&
        gapSkillName
          .toLowerCase() ===
          skillName.toLowerCase()
      );
    });
  };

  // =========================================================
  // GET REQUIRED LEVEL
  // =========================================================

  const getRequiredLevel = (
    currentLevel,
    matchingGap
  ) => {
    if (!matchingGap) {
      return currentLevel;
    }

    const backendRequiredLevel =
      Number(
        matchingGap.requiredLevel || 0
      );

    if (
      backendRequiredLevel > 0
    ) {
      return Math.min(
        Math.max(
          backendRequiredLevel,
          1
        ),
        5
      );
    }

    const backendGap =
      Number(
        matchingGap.gap || 0
      );

    if (backendGap > 0) {
      return Math.min(
        currentLevel +
          backendGap,
        5
      );
    }

    return currentLevel;
  };

  // =========================================================
  // GET SKILL GAP
  // =========================================================

  const getSkillGap = (
    currentLevel,
    requiredLevel
  ) => {
    return Math.max(
      requiredLevel -
        currentLevel,
      0
    );
  };

  // =========================================================
  // ACTUAL CURRENT KNOWLEDGE GAPS
  // =========================================================

  const getActualKnowledgeGaps =
    () => {
      if (
        !skills ||
        skills.length === 0
      ) {
        return [];
      }

      const actualGaps = [];

      skills.forEach((skill) => {
        const skillName =
          getSkillName(skill);

        if (!skillName) {
          return;
        }

        const currentLevel =
          Number(
            skill.currentLevel || 0
          );

        const matchingGap =
          getMatchingGap(
            skillName
          );

        const requiredLevel =
          getRequiredLevel(
            currentLevel,
            matchingGap
          );

        const actualGap =
          getSkillGap(
            currentLevel,
            requiredLevel
          );

        if (actualGap > 0) {
          actualGaps.push({
            ...(matchingGap || {}),
            skillName,
            currentLevel,
            requiredLevel,
            gap: actualGap,
          });
        }
      });

      return actualGaps;
    };

  const actualKnowledgeGaps =
    getActualKnowledgeGaps();

  const knowledgeGapCount =
    actualKnowledgeGaps.length;

  // =========================================================
  // GAP SEVERITY
  // =========================================================

  const getGapSeverity = (
    gap
  ) => {
    if (gap === 0) {
      return {
        label: "No Gap",
        badge:
          "bg-green-100 text-green-700",
        border:
          "border-green-200",
        background:
          "bg-green-50",
      };
    }

    if (gap === 1) {
      return {
        label: "Low Gap",
        badge:
          "bg-yellow-100 text-yellow-700",
        border:
          "border-yellow-200",
        background:
          "bg-yellow-50",
      };
    }

    if (gap === 2) {
      return {
        label: "Moderate Gap",
        badge:
          "bg-orange-100 text-orange-700",
        border:
          "border-orange-200",
        background:
          "bg-orange-50",
      };
    }

    return {
      label: "High Gap",
      badge:
        "bg-red-100 text-red-700",
      border:
        "border-red-200",
      background:
        "bg-red-50",
    };
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex-1">

        <Navbar
          title="Employee Dashboard"
        />

        <div className="p-8">

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-600">
              Loading your skills and
              knowledge gaps...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="flex-1">

      <Navbar
        title="Employee Dashboard"
      />

      <main className="p-8">

        {/* =================================================
            WELCOME
        ================================================= */}

        {fullName && (
          <div className="mb-6">

            <p className="text-lg text-gray-600">

              Welcome{" "}

              <span className="font-semibold text-slate-800">
                {fullName}
              </span>

            </p>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* TOTAL SKILLS */}

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex justify-between">

              <div>

                <p className="text-gray-500">
                  Total Skills
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  {skills.length}
                </h2>

              </div>

              <BookOpen
                size={45}
                className="text-indigo-600"
              />

            </div>

          </div>

          {/* AVERAGE LEVEL */}

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex justify-between">

              <div>

                <p className="text-gray-500">
                  Average Skill Level
                </p>

                <h2 className="text-3xl font-bold mt-3">

                  {averageLevel.toFixed(
                    1
                  )}

                  <span className="text-lg text-gray-500">
                    {" "}/ 5
                  </span>

                </h2>

              </div>

              <GraduationCap
                size={45}
                className="text-green-600"
              />

            </div>

          </div>

          {/* SKILL SCORE */}

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex justify-between">

              <div>

                <p className="text-gray-500">
                  Skill Score
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  {skillScore}%
                </h2>

              </div>

              <TrendingUp
                size={45}
                className="text-orange-500"
              />

            </div>

          </div>

          {/* KNOWLEDGE GAPS */}

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex justify-between">

              <div>

                <p className="text-gray-500">
                  Knowledge Gaps
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  {knowledgeGapCount}
                </h2>

              </div>

              <AlertTriangle
                size={45}
                className="text-red-500"
              />

            </div>

          </div>

        </div>

        {/* =================================================
            SKILL GAP HEATMAP
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">

            <div>

              <h2 className="text-2xl font-bold text-slate-800">
                Skill Gap Heatmap
              </h2>

              <p className="text-gray-500 mt-1">
                Current skill proficiency
                compared with the required
                proficiency.
              </p>

            </div>

            <div className="mt-4 md:mt-0 bg-red-50 border border-red-100 rounded-xl px-5 py-3">

              <p className="text-sm text-red-600 font-medium">
                Knowledge Gaps
              </p>

              <p className="text-2xl font-bold text-red-700">
                {knowledgeGapCount}
              </p>

            </div>

          </div>

          {skills.length === 0 ? (
            <div className="text-center py-10">

              <p className="text-gray-500">
                No skill data available.
              </p>

            </div>
          ) : (
            <div className="space-y-6">

              {skills.map(
                (item, index) => {

                  const skillName =
                    getSkillName(
                      item
                    ) ||
                    "Unknown Skill";

                  const currentLevel =
                    Number(
                      item.currentLevel ||
                        0
                    );

                  const matchingGap =
                    getMatchingGap(
                      skillName
                    );

                  const requiredLevel =
                    getRequiredLevel(
                      currentLevel,
                      matchingGap
                    );

                  const skillGap =
                    getSkillGap(
                      currentLevel,
                      requiredLevel
                    );

                  const severity =
                    getGapSeverity(
                      skillGap
                    );

                  const currentPercentage =
                    Math.round(
                      (currentLevel /
                        5) *
                        100
                    );

                  const requiredPercentage =
                    Math.round(
                      (requiredLevel /
                        5) *
                        100
                    );

                  const levelStyles = {
                    1: {
                      solid:
                        "bg-red-500 text-white",
                      faded:
                        "bg-red-100 text-red-500 border-2 border-dashed border-red-400",
                    },

                    2: {
                      solid:
                        "bg-orange-500 text-white",
                      faded:
                        "bg-orange-100 text-orange-600 border-2 border-dashed border-orange-400",
                    },

                    3: {
                      solid:
                        "bg-yellow-400 text-white",
                      faded:
                        "bg-yellow-100 text-yellow-600 border-2 border-dashed border-yellow-400",
                    },

                    4: {
                      solid:
                        "bg-blue-500 text-white",
                      faded:
                        "bg-blue-100 text-blue-600 border-2 border-dashed border-blue-400",
                    },

                    5: {
                      solid:
                        "bg-green-500 text-white",
                      faded:
                        "bg-green-100 text-green-600 border-2 border-dashed border-green-400",
                    },
                  };

                  return (
                    <div
                      key={
                        item.id ||
                        index
                      }
                      className={`border ${severity.border} rounded-xl p-5`}
                    >

                      {/* SKILL HEADER */}

                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                        <div>

                          <h3 className="font-semibold text-lg text-slate-800">
                            {skillName}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            Current proficiency
                            vs required
                            proficiency
                          </p>

                        </div>

                        <div
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${severity.badge}`}
                        >
                          {severity.label}

                          {skillGap > 0 &&
                            ` · Gap ${skillGap} level${
                              skillGap !== 1
                                ? "s"
                                : ""
                            }`}
                        </div>

                      </div>

                      {/* THREE CARDS */}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

                        {/* CURRENT */}

                        <div className="bg-indigo-50 rounded-xl p-4">

                          <p className="text-sm text-indigo-600 font-medium">
                            Current Level
                          </p>

                          <p className="text-2xl font-bold text-indigo-700 mt-1">

                            {currentLevel}

                            <span className="text-sm font-normal">
                              {" "}/ 5
                            </span>

                          </p>

                          <p className="text-xs text-indigo-500 mt-1">
                            {levelNames[
                              currentLevel
                            ] ||
                              "Not Rated"}
                          </p>

                        </div>

                        {/* REQUIRED */}

                        <div className="bg-purple-50 rounded-xl p-4">

                          <p className="text-sm text-purple-600 font-medium">
                            Required Level
                          </p>

                          <p className="text-2xl font-bold text-purple-700 mt-1">

                            {requiredLevel}

                            <span className="text-sm font-normal">
                              {" "}/ 5
                            </span>

                          </p>

                          <p className="text-xs text-purple-500 mt-1">
                            {levelNames[
                              requiredLevel
                            ] ||
                              "Not Defined"}
                          </p>

                        </div>

                        {/* GAP */}

                        <div
                          className={`${severity.background} rounded-xl p-4`}
                        >

                          <p className="text-sm font-medium">
                            Skill Gap
                          </p>

                          <p className="text-2xl font-bold mt-1">

                            {skillGap}

                            <span className="text-sm font-normal">
                              {" "}level
                              {skillGap !== 1
                                ? "s"
                                : ""}
                            </span>

                          </p>

                          <p className="text-xs mt-1">

                            {skillGap ===
                            0
                              ? "Requirement achieved"
                              : "Needs improvement"}

                          </p>

                        </div>

                      </div>

                      {/* FIVE LEVEL HEATMAP */}

                      <div className="mt-6">

                        <div className="grid grid-cols-5 gap-2">

                          {[1, 2, 3, 4, 5].map(
                            (cell) => {

                              const isCurrent =
                                cell <=
                                currentLevel;

                              const isRequired =
                                cell <=
                                requiredLevel;

                              const isGap =
                                !isCurrent &&
                                isRequired;

                              const style =
                                levelStyles[
                                  cell
                                ];

                              let cellClass =
                                "bg-slate-100 text-slate-400 border border-slate-200";

                              if (
                                isCurrent
                              ) {
                                cellClass =
                                  `${style.solid} border-2 border-transparent shadow-md`;
                              }

                              if (isGap) {
                                cellClass =
                                  `${style.faded} shadow-inner`;
                              }

                              return (
                                <div
                                  key={
                                    cell
                                  }
                                  className={`
                                    h-16
                                    rounded-lg
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    ${cellClass}
                                  `}
                                >

                                  <span className="font-bold text-lg">
                                    {cell}
                                  </span>

                                  <span className="text-[10px] mt-1">
                                    {
                                      levelNames[
                                        cell
                                      ]
                                    }
                                  </span>

                                  {isGap && (
                                    <span className="text-[9px] font-bold mt-1">
                                      GAP
                                    </span>
                                  )}

                                </div>
                              );
                            }
                          )}

                        </div>

                        {/* LEGEND */}

                        <div className="mt-4 flex flex-wrap gap-5 text-sm">

                          <div className="flex items-center gap-2">

                            <span className="w-4 h-4 rounded bg-indigo-500"></span>

                            <span className="text-gray-600">
                              Current
                              proficiency
                            </span>

                          </div>

                          <div className="flex items-center gap-2">

                            <span className="w-4 h-4 rounded bg-slate-100 border-2 border-dashed border-red-400"></span>

                            <span className="text-gray-600">
                              Required but
                              not achieved
                            </span>

                          </div>

                          <div className="flex items-center gap-2">

                            <span className="w-4 h-4 rounded bg-slate-100 border border-slate-200"></span>

                            <span className="text-gray-600">
                              Not required
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* ACHIEVEMENT BAR */}

                      <div className="mt-6">

                        <div className="flex justify-between text-xs text-gray-500 mb-2">

                          <span>
                            Skill achievement
                          </span>

                          <span>
                            Current{" "}
                            {
                              currentPercentage
                            }
                            %
                            {" / "}
                            Required{" "}
                            {
                              requiredPercentage
                            }
                            %
                          </span>

                        </div>

                        <div className="relative w-full bg-gray-200 rounded-full h-3">

                          <div
                            className="bg-indigo-500 h-3 rounded-full"
                            style={{
                              width: `${currentPercentage}%`,
                            }}
                          />

                          <div
                            className="absolute top-0 w-1 h-3 bg-purple-700"
                            style={{
                              left: `calc(${requiredPercentage}% - 2px)`,
                            }}
                          />

                        </div>

                        <div className="flex justify-between mt-2 text-xs">

                          <span className="text-indigo-600">
                            ● Current
                            level
                          </span>

                          <span className="text-purple-700">
                            │ Required
                            level
                          </span>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

          {/* GAP SEVERITY LEGEND */}

          <div className="mt-8 pt-6 border-t">

            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Gap Severity
            </h3>

            <div className="flex flex-wrap gap-3">

              <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">

                <span className="w-3 h-3 rounded-full bg-green-500" />

                <span className="text-sm text-green-700">
                  No Gap
                </span>

              </div>

              <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">

                <span className="w-3 h-3 rounded-full bg-yellow-500" />

                <span className="text-sm text-yellow-700">
                  Low Gap
                </span>

              </div>

              <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">

                <span className="w-3 h-3 rounded-full bg-orange-500" />

                <span className="text-sm text-orange-700">
                  Moderate Gap
                </span>

              </div>

              <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">

                <span className="w-3 h-3 rounded-full bg-red-500" />

                <span className="text-sm text-red-700">
                  High Gap
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            RECOMMENDED LEARNING
        ================================================= */}

        <div className="bg-white rounded-xl shadow p-6 mt-8">

          <h2 className="text-xl font-bold mb-5">
            Recommended Learning
          </h2>

          {knowledgeGapCount ===
          0 ? (
            <p className="text-green-600">
              You have no major
              knowledge gaps.
            </p>
          ) : (
            <div className="space-y-4">

              {actualKnowledgeGaps
                .slice(0, 4)
                .map(
                  (
                    gap,
                    index
                  ) => {

                    const skillName =
                      gap.skillName ||
                      "Unknown Skill";

                    return (
                      <div
                        key={
                          gap.id ||
                          index
                        }
                        className="border rounded-lg p-4"
                      >
                        <span className="font-medium">
                          Learn{" "}
                          {skillName}
                        </span>
                      </div>
                    );
                  }
                )}

            </div>
          )}

        </div>

        {/* =================================================
            RECENT ACTIVITY
        ================================================= */}

        <div className="bg-white rounded-xl shadow p-6 mt-8">

          <h2 className="text-xl font-bold mb-5">
            Recent Activity
          </h2>

          <p className="text-gray-500">
            Activity tracking will be
            available when the activity
            module is implemented.
          </p>

        </div>

      </main>

    </div>
  );
}

export default EmployeeDashboard;