import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import {
  getEmployeeSkills,
  detectGaps,
} from "../services/platformService";

function EmployeeDashboard() {
  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";

  const fullName = [firstName, lastName]
    .filter(Boolean)
    .join(" ");

  const employeeId = localStorage.getItem("employeeId");

  const [skills, setSkills] = useState([]);
  const [gaps, setGaps] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Skill level names
  const levelNames = {
    1: "Beginner",
    2: "Intermediate",
    3: "Competent",
    4: "Advanced",
    5: "Expert",
  };

  // ==============================
  // LOAD DASHBOARD DATA
  // ==============================

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!employeeId) {
        setError(
          "Employee ID not found. Please login again."
        );
        return;
      }

      // Get current employee skills
      const skillResponse =
        await getEmployeeSkills(employeeId);

      console.log(
        "Employee Skills:",
        skillResponse.data
      );

      setSkills(skillResponse.data || []);

      // Detect knowledge gaps
      const gapResponse =
        await detectGaps(employeeId);

      console.log(
        "Knowledge Gaps:",
        gapResponse.data
      );

      setGaps(gapResponse.data || []);

    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        "Unable to load dashboard data."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // CALCULATE AVERAGE LEVEL
  // ==============================

  const calculateAverageLevel = () => {
    if (skills.length === 0) {
      return 0;
    }

    const totalLevel = skills.reduce(
      (total, item) =>
        total + (item.currentLevel || 0),
      0
    );

    return totalLevel / skills.length;
  };

  const averageLevel =
    calculateAverageLevel();

  // Convert average level to percentage
  const skillScore =
    Math.round(
      (averageLevel / 5) * 100
    );

  // ==============================
  // FIND GAP FOR A SKILL
  // ==============================

  const getMatchingGap = (skillName) => {
    return gaps.find((gap) => {
      const gapSkillName =
        gap.skill?.skillName ||
        gap.skillName ||
        gap.skill;

      return (
        gapSkillName?.toLowerCase() ===
        skillName?.toLowerCase()
      );
    });
  };

  // ==============================
  // GET REQUIRED LEVEL
  // ==============================

  const getRequiredLevel = (
    currentLevel,
    matchingGap
  ) => {
    let requiredLevel =
      Number(
        matchingGap?.requiredLevel ||
        matchingGap?.required?.requiredLevel ||
        matchingGap?.competency?.requiredLevel ||
        0
      );

    /*
     * If requiredLevel is not directly
     * available, calculate it from:
     *
     * current level + gap
     */

    if (
      requiredLevel === 0 &&
      matchingGap
    ) {
      const gapValue =
        Number(
          matchingGap.gap || 0
        );

      if (gapValue > 0) {
        requiredLevel =
          currentLevel + gapValue;
      }
    }

    /*
     * If no gap exists, current level
     * satisfies the requirement.
     */

    if (requiredLevel === 0) {
      requiredLevel = currentLevel;
    }

    return Math.min(
      Math.max(requiredLevel, 0),
      5
    );
  };

  // ==============================
  // GET GAP VALUE
  // ==============================

  const getSkillGap = (
    currentLevel,
    requiredLevel,
    matchingGap
  ) => {
    /*
     * Prefer the actual difference
     * between required and current.
     */

    const calculatedGap =
      Math.max(
        requiredLevel - currentLevel,
        0
      );

    /*
     * If requiredLevel is available,
     * calculated difference is safest.
     */

    if (
      matchingGap?.requiredLevel ||
      matchingGap?.competency?.requiredLevel
    ) {
      return calculatedGap;
    }

    /*
     * Otherwise use backend gap.
     */

    const backendGap =
      Number(
        matchingGap?.gap || 0
      );

    if (backendGap > 0) {
      return Math.min(
        backendGap,
        5
      );
    }

    return calculatedGap;
  };

  // ==============================
  // GAP SEVERITY
  // ==============================

  const getGapSeverity = (gap) => {
    if (gap === 0) {
      return {
        label: "No Gap",
        badge:
          "bg-green-100 text-green-700",
        border:
          "border-green-200",
        background:
          "bg-green-50",
        indicator:
          "bg-green-500",
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
        indicator:
          "bg-yellow-500",
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
        indicator:
          "bg-orange-500",
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
      indicator:
        "bg-red-500",
    };
  };

  return (
    <div className="flex min-h-screen">

      {/* ============================= */}
      {/* SIDEBAR */}
      {/* ============================= */}

      <Sidebar role="EMPLOYEE" />

      {/* ============================= */}
      {/* MAIN CONTENT */}
      {/* ============================= */}

      <div className="flex-1">

        <Navbar title="Employee Dashboard" />

        <div className="p-8">

          {/* ============================= */}
          {/* WELCOME */}
          {/* ============================= */}

          {fullName && (
            <div className="mb-6">

              <p className="text-lg text-gray-600">
                Welcome {fullName}
              </p>

            </div>
          )}

          {/* ============================= */}
          {/* ERROR */}
          {/* ============================= */}

          {error && (
            <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* ============================= */}
          {/* LOADING */}
          {/* ============================= */}

          {loading ? (

            <div className="bg-white rounded-xl shadow p-6">

              <p className="text-gray-600">
                Loading dashboard data...
              </p>

            </div>

          ) : (

            <>

              {/* ================================= */}
              {/* DASHBOARD STATISTICS */}
              {/* ================================= */}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Total Skills */}

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


                {/* Average Skill Level */}

                <div className="bg-white rounded-xl shadow p-6">

                  <div className="flex justify-between">

                    <div>

                      <p className="text-gray-500">
                        Average Skill Level
                      </p>

                      <h2 className="text-3xl font-bold mt-3">

                        {averageLevel.toFixed(1)}

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


                {/* Skill Score */}

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


                {/* Knowledge Gaps */}

                <div className="bg-white rounded-xl shadow p-6">

                  <div className="flex justify-between">

                    <div>

                      <p className="text-gray-500">
                        Knowledge Gaps
                      </p>

                      <h2 className="text-3xl font-bold mt-3">
                        {gaps.length}
                      </h2>

                    </div>

                    <AlertTriangle
                      size={45}
                      className="text-red-500"
                    />

                  </div>

                </div>

              </div>


              {/* ================================= */}
              {/* CURRENT SKILL PROFILE + GAP SUMMARY */}
              {/* ================================= */}

              <div className="grid lg:grid-cols-2 gap-6 mt-8">


                {/* ================================= */}
                {/* CURRENT SKILL PROFILE */}
                {/* ================================= */}

                <div className="bg-white rounded-xl shadow p-6">

                  <h2 className="text-xl font-bold mb-6">
                    Current Skill Profile
                  </h2>

                  {skills.length === 0 ? (

                    <p className="text-gray-500">
                      No current skills found.
                    </p>

                  ) : (

                    skills.map(
                      (item, index) => {

                        const skillName =
                          item.skill?.skillName ||
                          "Unknown Skill";

                        const level =
                          item.currentLevel || 0;

                        const percentage =
                          Math.round(
                            (level / 5) * 100
                          );

                        return (

                          <div
                            key={
                              item.id || index
                            }
                            className="mb-6"
                          >

                            <div className="flex justify-between mb-2">

                              <span className="font-medium">
                                {skillName}
                              </span>

                              <span className="text-gray-600">

                                {levelNames[level] ||
                                  `Level ${level}`}

                                {" "}
                                ({percentage}%)

                              </span>

                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-3">

                              <div
                                className="bg-indigo-600 h-3 rounded-full"
                                style={{
                                  width:
                                    `${percentage}%`,
                                }}
                              ></div>

                            </div>

                          </div>

                        );

                      }
                    )

                  )}

                </div>


                {/* ================================= */}
                {/* KNOWLEDGE GAP SUMMARY */}
                {/* ================================= */}

                <div className="bg-white rounded-xl shadow p-6">

                  <h2 className="text-xl font-bold mb-6">
                    Knowledge Gap Summary
                  </h2>

                  {gaps.length === 0 ? (

                    <p className="text-green-600">
                      No knowledge gaps detected.
                    </p>

                  ) : (

                    <div className="space-y-4">

                      {gaps.map(
                        (gap, index) => {

                          const skillName =
                            gap.skill?.skillName ||
                            gap.skill ||
                            gap.skillName ||
                            "Unknown Skill";

                          const currentLevel =
                            Number(
                              gap.currentLevel ||
                              0
                            );

                          const requiredLevel =
                            getRequiredLevel(
                              currentLevel,
                              gap
                            );

                          const gapValue =
                            getSkillGap(
                              currentLevel,
                              requiredLevel,
                              gap
                            );

                          return (

                            <div
                              key={
                                gap.id || index
                              }
                              className="border rounded-lg p-4"
                            >

                              <div className="flex justify-between mb-2">

                                <span className="font-medium">
                                  {skillName}
                                </span>

                                <span className="text-red-600 font-semibold">

                                  Gap: {gapValue}{" "}
                                  level
                                  {gapValue !== 1
                                    ? "s"
                                    : ""}

                                </span>

                              </div>

                              <div className="flex justify-between text-xs text-gray-500 mb-2">

                                <span>
                                  Current: {currentLevel}/5
                                </span>

                                <span>
                                  Required: {requiredLevel}/5
                                </span>

                              </div>

                              <div className="w-full bg-gray-200 rounded-full h-3">

                                <div
                                  className="bg-red-500 h-3 rounded-full"
                                  style={{
                                    width:
                                      `${Math.min(
                                        (gapValue / 5) * 100,
                                        100
                                      )}%`,
                                  }}
                                ></div>

                              </div>

                            </div>

                          );

                        }
                      )}

                    </div>

                  )}

                </div>

              </div>


              {/* ========================================= */}
{/* SKILL GAP HEATMAP */}
{/* ========================================= */}

<div className="bg-white rounded-2xl shadow-lg p-6 mt-8">

  {/* Header */}

  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">

    <div>

      <h2 className="text-2xl font-bold text-slate-800">
        Skill Gap Heatmap
      </h2>

      <p className="text-gray-500 mt-1">
        Comparison between current proficiency and required proficiency.
      </p>

    </div>

    {/* Knowledge Gap Count */}

    <div className="mt-4 md:mt-0 bg-red-50 border border-red-100 rounded-xl px-5 py-3">

      <p className="text-sm text-red-600 font-medium">
        Knowledge Gaps
      </p>

      <p className="text-2xl font-bold text-red-700">
        {gaps.length}
      </p>

    </div>

  </div>


  {/* ================================= */}
  {/* HEATMAP */}
  {/* ================================= */}

  {skills.length === 0 ? (

    <div className="text-center py-10">

      <p className="text-gray-500">
        No skill data available.
      </p>

    </div>

  ) : (

    <div className="space-y-6">

      {skills.map((item, index) => {

        const skillName =
          item.skill?.skillName ||
          "Unknown Skill";

        const currentLevel =
          Number(item.currentLevel || 0);

        /*
         * Find the knowledge gap
         * corresponding to this skill.
         */

        const matchingGap =
          getMatchingGap(skillName);

        /*
         * Get required level.
         */

        const requiredLevel =
          getRequiredLevel(
            currentLevel,
            matchingGap
          );

        /*
         * Calculate skill gap.
         */

        const skillGap =
          getSkillGap(
            currentLevel,
            requiredLevel,
            matchingGap
          );

        /*
         * Determine severity.
         */

        const severity =
          getGapSeverity(skillGap);

        /*
         * Convert levels into percentages.
         */

        const currentPercentage =
          Math.round(
            (currentLevel / 5) * 100
          );

        const requiredPercentage =
          Math.round(
            (requiredLevel / 5) * 100
          );


        /*
         * IMPORTANT:
         *
         * These colors are FIXED.
         *
         * Level 1 = Red
         * Level 2 = Orange
         * Level 3 = Yellow
         * Level 4 = Blue
         * Level 5 = Green
         *
         * The same level will therefore
         * always have the same color for
         * every skill.
         */

        const levelStyles = {

          1: {
            solid: "bg-red-500 text-white",
            faded:
              "bg-red-100 text-red-500 border-2 border-dashed border-red-400",
          },

          2: {
            solid: "bg-orange-500 text-white",
            faded:
              "bg-orange-100 text-orange-600 border-2 border-dashed border-orange-400",
          },

          3: {
            solid: "bg-yellow-400 text-white",
            faded:
              "bg-yellow-100 text-yellow-600 border-2 border-dashed border-yellow-400",
          },

          4: {
            solid: "bg-blue-500 text-white",
            faded:
              "bg-blue-100 text-blue-600 border-2 border-dashed border-blue-400",
          },

          5: {
            solid: "bg-green-500 text-white",
            faded:
              "bg-green-100 text-green-600 border-2 border-dashed border-green-400",
          },

        };


        return (

          <div
            key={item.id || index}
            className={`border ${severity.border} rounded-xl p-5 transition-all duration-300 hover:shadow-md`}
          >

            {/* ================================= */}
            {/* SKILL HEADER */}
            {/* ================================= */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div>

                <h3 className="font-semibold text-lg text-slate-800">
                  {skillName}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Current proficiency compared with role requirement
                </p>

              </div>


              {/* Gap Badge */}

              <div
                className={`px-4 py-2 rounded-full text-sm font-semibold ${severity.badge}`}
              >

                {severity.label}

                {skillGap > 0 &&
                  ` · Gap ${skillGap} level${
                    skillGap !== 1 ? "s" : ""
                  }`}

              </div>

            </div>


            {/* ================================= */}
            {/* CURRENT / REQUIRED / GAP CARDS */}
            {/* ================================= */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">


              {/* CURRENT LEVEL */}

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

                  {levelNames[currentLevel] ||
                    "Not Rated"}

                </p>

              </div>


              {/* REQUIRED LEVEL */}

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

                  {levelNames[requiredLevel] ||
                    "Not Defined"}

                </p>

              </div>


              {/* SKILL GAP */}

              <div
                className={`${severity.background} rounded-xl p-4`}
              >

                <p className="text-sm font-medium">
                  Skill Gap
                </p>

                <p className="text-2xl font-bold mt-1">

                  {skillGap}

                  <span className="text-sm font-normal">
                    {" "}
                    level
                    {skillGap !== 1 ? "s" : ""}
                  </span>

                </p>

                <p className="text-xs mt-1">

                  {skillGap === 0
                    ? "Requirement achieved"
                    : "Needs improvement"}

                </p>

              </div>

            </div>


            {/* ================================= */}
            {/* FIVE LEVEL HEATMAP */}
            {/* ================================= */}

            <div className="mt-6">

              <div className="flex justify-between text-xs text-gray-500 mb-2">

                <span>
                  Current proficiency
                </span>

                <span>
                  Required proficiency
                </span>

              </div>


              <div className="grid grid-cols-5 gap-2">

                {[1, 2, 3, 4, 5].map(
                  (cell) => {

                    /*
                     * Is this level already
                     * achieved by employee?
                     */

                    const isCurrent =
                      cell <= currentLevel;


                    /*
                     * Is this level required
                     * by the role?
                     */

                    const isRequired =
                      cell <= requiredLevel;


                    /*
                     * Is this level part of
                     * the knowledge gap?
                     *
                     * Example:
                     * Current = 3
                     * Required = 5
                     *
                     * Level 4 and 5 = gap
                     */

                    const isGap =
                      !isCurrent &&
                      isRequired;


                    /*
                     * Choose fixed color
                     * based ONLY on level.
                     */

                    const style =
                      levelStyles[cell];


                    let cellClass =
                      "bg-slate-100 text-slate-400 border border-slate-200";


                    /*
                     * Current achieved level
                     */

                    if (isCurrent) {

                      cellClass =
                        `${style.solid} border-2 border-transparent shadow-md`;

                    }


                    /*
                     * Required but not
                     * yet achieved.
                     *
                     * Same level color,
                     * but faded + dashed.
                     */

                    if (isGap) {

                      cellClass =
                        `${style.faded} shadow-inner`;

                    }


                    /*
                     * Level is beyond the
                     * required level.
                     *
                     * Remains neutral.
                     */

                    if (
                      !isCurrent &&
                      !isGap
                    ) {

                      cellClass =
                        "bg-slate-100 text-slate-400 border border-slate-200";

                    }


                    return (

                      <div
                        key={cell}
                        className={`
                          h-16
                          rounded-lg
                          flex
                          flex-col
                          items-center
                          justify-center
                          transition-all
                          duration-300
                          ${cellClass}
                        `}
                      >

                        <span className="font-bold text-lg">
                          {cell}
                        </span>

                        <span className="text-[10px] mt-1">
                          {levelNames[cell]}
                        </span>


                        {/* GAP LABEL */}

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


              {/* ================================= */}
              {/* HEATMAP EXPLANATION */}
              {/* ================================= */}

              <div className="mt-4 flex flex-wrap gap-5 text-sm">

                {/* Current */}

                <div className="flex items-center gap-2">

                  <span className="w-4 h-4 rounded bg-indigo-500"></span>

                  <span className="text-gray-600">
                    Current proficiency
                  </span>

                </div>


                {/* Gap */}

                <div className="flex items-center gap-2">

                  <span className="w-4 h-4 rounded bg-slate-100 border-2 border-dashed border-red-400"></span>

                  <span className="text-gray-600">
                    Required but not achieved
                  </span>

                </div>


                {/* Not required */}

                <div className="flex items-center gap-2">

                  <span className="w-4 h-4 rounded bg-slate-100 border border-slate-200"></span>

                  <span className="text-gray-600">
                    Beyond requirement
                  </span>

                </div>

              </div>

            </div>


            {/* ================================= */}
            {/* SKILL ACHIEVEMENT BAR */}
            {/* ================================= */}

            <div className="mt-6">

              <div className="flex justify-between text-xs text-gray-500 mb-2">

                <span>
                  Skill achievement
                </span>

                <span>
                  Current {currentPercentage}% / Required {requiredPercentage}%
                </span>

              </div>


              <div className="relative w-full bg-gray-200 rounded-full h-3">

                {/* Current proficiency */}

                <div
                  className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width:
                      `${currentPercentage}%`,
                  }}
                ></div>


                {/* Required level marker */}

                <div
                  className="absolute top-0 w-1 h-3 bg-purple-700"
                  style={{
                    left:
                      `calc(${requiredPercentage}% - 2px)`,
                  }}
                  title={`Required: ${requiredPercentage}%`}
                ></div>

              </div>


              {/* Progress bar legend */}

              <div className="flex justify-between mt-2 text-xs">

                <span className="text-indigo-600">
                  ● Current level
                </span>

                <span className="text-purple-700">
                  │ Required level
                </span>

              </div>

            </div>

          </div>

        );

      })}

    </div>

  )}


  {/* ================================= */}
  {/* GAP SEVERITY LEGEND */}
  {/* ================================= */}

  <div className="mt-8 pt-6 border-t">

    <h3 className="text-sm font-semibold text-slate-700 mb-4">
      Gap Severity
    </h3>

    <div className="flex flex-wrap gap-3">

      {/* No Gap */}

      <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">

        <span className="w-3 h-3 rounded-full bg-green-500"></span>

        <span className="text-sm text-green-700">
          No Gap
        </span>

      </div>


      {/* Low Gap */}

      <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">

        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>

        <span className="text-sm text-yellow-700">
          Low Gap
        </span>

      </div>


      {/* Moderate Gap */}

      <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">

        <span className="w-3 h-3 rounded-full bg-orange-500"></span>

        <span className="text-sm text-orange-700">
          Moderate Gap
        </span>

      </div>


      {/* High Gap */}

      <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">

        <span className="w-3 h-3 rounded-full bg-red-500"></span>

        <span className="text-sm text-red-700">
          High Gap
        </span>

      </div>

    </div>

  </div>

</div>

              {/* ================================= */}
              {/* RECOMMENDED LEARNING */}
              {/* ================================= */}

              <div className="bg-white rounded-xl shadow p-6 mt-8">

                <h2 className="text-xl font-bold mb-5">
                  Recommended Learning
                </h2>

                {gaps.length === 0 ? (

                  <p className="text-green-600">
                    You have no major knowledge gaps.
                  </p>

                ) : (

                  <div className="space-y-4">

                    {gaps
                      .slice(0, 4)
                      .map(
                        (gap, index) => {

                          const skillName =
                            gap.skill?.skillName ||
                            gap.skill ||
                            gap.skillName ||
                            "Unknown Skill";

                          return (

                            <div
                              key={
                                gap.id || index
                              }
                              className="border rounded-lg p-4"
                            >

                              <span className="font-medium">
                                Learn {skillName}
                              </span>

                            </div>

                          );

                        }
                      )}

                  </div>

                )}

              </div>


              {/* ================================= */}
              {/* RECENT ACTIVITY */}
              {/* ================================= */}

              <div className="bg-white rounded-xl shadow p-6 mt-8">

                <h2 className="text-xl font-bold mb-5">
                  Recent Activity
                </h2>

                <p className="text-gray-500">
                  Activity tracking will be available
                  when the activity module is implemented.
                </p>

              </div>

            </>

          )}

        </div>

      </div>

    </div>
  );
}

export default EmployeeDashboard;