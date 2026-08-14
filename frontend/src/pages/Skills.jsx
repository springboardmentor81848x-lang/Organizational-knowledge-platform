import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  Target,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  RefreshCw,
} from "lucide-react";

function Skills() {
  const [skills, setSkills] = useState([]);
  const [overallScore, setOverallScore] = useState(0);
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // =========================================================
  // PROFICIENCY LEVEL
  // =========================================================

  const getProficiencyLevel = (score) => {
    score = Number(score) || 0;

    if (score >= 90) {
      return "Expert";
    }

    if (score >= 75) {
      return "Advanced";
    }

    if (score >= 60) {
      return "Competent";
    }

    if (score >= 40) {
      return "Intermediate";
    }

    return "Beginner";
  };

  // =========================================================
  // PROFICIENCY STYLE
  // =========================================================

  const getProficiencyStyle = (level) => {
    switch (level) {
      case "Expert":
        return "bg-green-100 text-green-700";

      case "Advanced":
        return "bg-blue-100 text-blue-700";

      case "Competent":
        return "bg-indigo-100 text-indigo-700";

      case "Intermediate":
        return "bg-yellow-100 text-yellow-700";

      case "Beginner":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // =========================================================
  // GAP STYLE
  // =========================================================

  const getGapStyle = (severity) => {
    switch (String(severity || "").toUpperCase()) {
      case "NO GAP":
        return "bg-green-100 text-green-700";

      case "LOW":
        return "bg-blue-100 text-blue-700";

      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";

      case "HIGH":
        return "bg-orange-100 text-orange-700";

      case "CRITICAL":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // =========================================================
  // LOAD SKILLS FROM ASSESSMENT RESULT
  // =========================================================

  useEffect(() => {
    loadAssessmentSkills();
  }, []);

  const loadAssessmentSkills = () => {
    try {
      setLoading(true);

      const storedResult =
        sessionStorage.getItem("assessmentResult");

      if (!storedResult) {
        setSkills([]);
        return;
      }

      const result = JSON.parse(storedResult);

      console.log(
        "Skill Inventory - Assessment Result:",
        result
      );

      const skillResults = Array.isArray(result.skillResults)
        ? result.skillResults
        : [];

      setSkills(skillResults);

      setOverallScore(
        Number(result.overallScore) || 0
      );

      setAssessmentTitle(
        result.title || ""
      );

    } catch (error) {
      console.error(
        "Unable to load assessment skills:",
        error
      );

      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const refreshSkills = () => {
    loadAssessmentSkills();
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">

        <Sidebar
          role={
            localStorage.getItem("role") ||
            "EMPLOYEE"
          }
        />

        <div className="flex-1">

          <Navbar title="Skill Inventory" />

          <div className="flex items-center justify-center min-h-[80vh]">

            <div className="text-center">

              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

              <p className="text-slate-500">
                Loading your skills...
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar
        role={
          localStorage.getItem("role") ||
          "EMPLOYEE"
        }
      />

      <div className="flex-1 min-w-0">

        <Navbar title="Skill Inventory" />

        <main className="p-5 md:p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

            <div>

              <div className="flex items-center gap-3 mb-2">

                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">

                  <Target
                    size={25}
                    className="text-indigo-600"
                  />

                </div>

                <div>

                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                    Skill Inventory
                  </h1>

                  <p className="text-slate-500">
                    Your current skills based on your latest assessment.
                  </p>

                </div>

              </div>

              {assessmentTitle && (
                <p className="text-sm text-indigo-600 font-medium mt-3">
                  Based on: {assessmentTitle}
                </p>
              )}

            </div>

            <button
              onClick={refreshSkills}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-white transition"
            >
              <RefreshCw size={17} />

              Refresh
            </button>

          </div>

          {/* =================================================
              NO ASSESSMENT RESULT
          ================================================= */}

          {skills.length === 0 ? (

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">

              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-5">

                <BarChart3
                  size={30}
                  className="text-indigo-600"
                />

              </div>

              <h2 className="text-xl font-bold text-slate-800">
                No Assessment Skills Available
              </h2>

              <p className="text-slate-500 mt-2 max-w-md mx-auto">
                Complete a skill assessment to see your current
                skills and proficiency levels here.
              </p>

            </div>

          ) : (

            <>

              {/* =================================================
                  OVERALL SCORE
              ================================================= */}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                  <div>

                    <p className="text-sm text-slate-500">
                      Overall Assessment Score
                    </p>

                    <p className="text-4xl font-bold text-indigo-600 mt-1">
                      {overallScore}%
                    </p>

                  </div>

                  <div className="w-full md:w-2/3">

                    <div className="flex justify-between text-sm mb-2">

                      <span className="text-slate-500">
                        Overall Proficiency
                      </span>

                      <span className="font-semibold text-slate-700">
                        {getProficiencyLevel(
                          overallScore
                        )}
                      </span>

                    </div>

                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              overallScore,
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  CURRENT SKILLS
              ================================================= */}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                <div className="flex items-center gap-3 mb-6">

                  <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-600">

                    <Target size={21} />

                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-slate-800">
                      Current Skills
                    </h2>

                    <p className="text-sm text-slate-500">
                      Skills and proficiency levels determined from your assessment.
                    </p>

                  </div>

                </div>

                <div className="space-y-5">

                  {skills.map((skill, index) => {

                    const actualScore =
                      Number(
                        skill.actualScore
                      ) || 0;

                    const requiredScore =
                      Number(
                        skill.requiredScore
                      ) || 70;

                    const gap =
                      Number(skill.gap) || 0;

                    const proficiencyLevel =
                      getProficiencyLevel(
                        actualScore
                      );

                    const percentage =
                      Math.min(
                        Math.max(
                          actualScore,
                          0
                        ),
                        100
                      );

                    return (

                      <div
                        key={
                          skill.skillName ||
                          index
                        }
                        className="border border-slate-200 rounded-xl p-5"
                      >

                        {/* Skill Header */}

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                          <div>

                            <h3 className="text-lg font-semibold text-slate-800">
                              {skill.skillName ||
                                "Unknown Skill"}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 mt-2">

                              <span className="text-sm text-slate-500">
                                Current Level:
                              </span>

                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getProficiencyStyle(
                                  proficiencyLevel
                                )}`}
                              >
                                {proficiencyLevel}
                              </span>

                            </div>

                          </div>

                          <div className="flex items-center gap-3">

                            <span className="text-xl font-bold text-slate-800">
                              {actualScore}%
                            </span>

                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getGapStyle(
                                skill.gapSeverity
                              )}`}
                            >
                              {skill.gapSeverity ||
                                "UNKNOWN"}
                            </span>

                          </div>

                        </div>

                        {/* Progress */}

                        <div className="mt-5">

                          <div className="flex justify-between text-xs text-slate-500 mb-2">

                            <span>
                              Current: {actualScore}%
                            </span>

                            <span>
                              Required: {requiredScore}%
                            </span>

                          </div>

                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

                            <div
                              className={
                                actualScore >=
                                requiredScore
                                  ? "h-full bg-green-500 rounded-full transition-all"
                                  : "h-full bg-orange-500 rounded-full transition-all"
                              }
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                        </div>

                        {/* Gap Status */}

                        {gap > 0 ? (

                          <div className="flex items-center gap-2 mt-4 text-sm text-orange-600">

                            <AlertTriangle
                              size={16}
                            />

                            <span>
                              Knowledge gap:
                            </span>

                            <strong>
                              {gap}%
                            </strong>

                          </div>

                        ) : (

                          <div className="flex items-center gap-2 mt-4 text-sm text-green-600">

                            <CheckCircle
                              size={16}
                            />

                            <span>
                              Required skill level achieved
                            </span>

                          </div>

                        )}

                      </div>

                    );
                  })}

                </div>

              </div>

            </>

          )}

        </main>

      </div>

    </div>
  );
}

export default Skills;