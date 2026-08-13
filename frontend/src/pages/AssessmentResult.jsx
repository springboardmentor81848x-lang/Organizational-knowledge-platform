import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Trophy,
  Target,
  BookOpen,
  BarChart3,
} from "lucide-react";

function AssessmentResult() {
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD RESULT
  // =========================================================

  useEffect(() => {
    loadResult();
  }, []);

  const loadResult = () => {
    try {
      const stored =
        sessionStorage.getItem("assessmentResult");

      if (!stored) {
        setResult(null);
        return;
      }

      const parsedResult = JSON.parse(stored);

      console.log(
        "Assessment result:",
        parsedResult
      );

      setResult(parsedResult);
    } catch (error) {
      console.error(
        "Unable to load assessment result:",
        error
      );

      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // PROFICIENCY LEVEL
  // =========================================================

  const getProficiencyLevel = (score) => {
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
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-center">

          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-500">
            Loading result...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // RESULT NOT FOUND
  // =========================================================

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md w-full">

          <AlertTriangle
            size={42}
            className="text-orange-500 mx-auto mb-4"
          />

          <h2 className="text-xl font-bold text-slate-800">
            Result Not Found
          </h2>

          <p className="text-slate-500 mt-2">
            Complete the skill assessment first to view
            your results.
          </p>

          <div className="flex flex-col gap-3 mt-6">

            <button
              onClick={() =>
                navigate(
                  "/employee/skill-assessment"
                )
              }
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Take Assessment
            </button>

            <button
              onClick={() =>
                navigate("/employee")
              }
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Back to Dashboard
            </button>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // SAFE VALUES
  // =========================================================

  const score =
    Number(result.overallScore) || 0;

  const correctAnswers =
    Number(result.correctAnswers) || 0;

  const totalQuestions =
    Number(result.totalQuestions) ||
    0;

  const skillResults =
    Array.isArray(result.skillResults)
      ? result.skillResults
      : [];

  // =========================================================
  // SCORE COLOR
  // =========================================================

  const getScoreColor = () => {
    if (score >= 85) {
      return "text-green-600";
    }

    if (score >= 70) {
      return "text-blue-600";
    }

    if (score >= 50) {
      return "text-orange-600";
    }

    return "text-red-600";
  };

  // =========================================================
  // GAP STYLE
  // =========================================================

  const getGapStyle = (severity) => {
    switch (
      String(severity || "").toUpperCase()
    ) {
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
  // SUMMARY COUNTS
  // =========================================================

  const skillsWithGaps =
    skillResults.filter(
      (skill) =>
        Number(skill.gap) > 0
    ).length;

  const skillsWithoutGaps =
    skillResults.filter(
      (skill) =>
        Number(skill.gap) <= 0
    ).length;

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-white border-b border-slate-200">

        <div className="max-w-6xl mx-auto px-5 md:px-8 py-5">

          <button
            onClick={() =>
              navigate("/employee")
            }
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft size={18} />

            Back to Dashboard
          </button>

        </div>

      </header>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-8">

        {/* =================================================
            TITLE
        ================================================= */}

        <div className="text-center mb-8">

          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">

            <Trophy size={32} />

          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            Assessment Completed!
          </h1>

          <p className="text-slate-500 mt-2">
            Here is your skill assessment performance.
          </p>

          {result.title && (
            <p className="text-sm text-indigo-600 font-medium mt-2">
              {result.title}
            </p>
          )}

        </div>

        {/* =================================================
            OVERALL SUMMARY
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">

          {/* Score */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">

            <div className="w-11 h-11 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto">

              <BarChart3 size={21} />

            </div>

            <p className="text-sm text-slate-500 mt-4">
              Overall Score
            </p>

            <p
              className={`text-4xl font-bold mt-1 ${getScoreColor()}`}
            >
              {score}%
            </p>

          </div>

          {/* Performance */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">

            <div className="w-11 h-11 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto">

              <Trophy size={21} />

            </div>

            <p className="text-sm text-slate-500 mt-4">
              Performance
            </p>

            <p className="text-xl font-bold text-slate-800 mt-2">
              {result.performanceLevel ||
                "Not Available"}
            </p>

          </div>

          {/* Correct Answers */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">

            <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto">

              <CheckCircle size={21} />

            </div>

            <p className="text-sm text-slate-500 mt-4">
              Correct Answers
            </p>

            <p className="text-3xl font-bold text-slate-800 mt-2">

              {correctAnswers}

              {totalQuestions > 0 && (
                <span className="text-lg text-slate-400">
                  {" "}
                  / {totalQuestions}
                </span>
              )}

            </p>

          </div>

          {/* Skills With Gaps */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">

            <div className="w-11 h-11 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto">

              <Target size={21} />

            </div>

            <p className="text-sm text-slate-500 mt-4">
              Skills With Gaps
            </p>

            <p className="text-3xl font-bold text-orange-600 mt-2">
              {skillsWithGaps}
            </p>

          </div>

        </div>

        {/* =================================================
            PROFICIENCY LEGEND
        ================================================= */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">

          <h3 className="font-semibold text-slate-800 mb-3">
            Proficiency Scale
          </h3>

          <div className="flex flex-wrap gap-3">

            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
              Beginner: 0–39%
            </span>

            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
              Intermediate: 40–59%
            </span>

            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
              Competent: 60–74%
            </span>

            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              Advanced: 75–89%
            </span>

            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              Expert: 90–100%
            </span>

          </div>

        </div>

        {/* =================================================
            PERFORMANCE MESSAGE
        ================================================= */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

          <div className="flex items-start gap-4">

            {score >= 70 ? (
              <CheckCircle
                size={25}
                className="text-green-600 mt-0.5"
              />
            ) : (
              <AlertTriangle
                size={25}
                className="text-orange-500 mt-0.5"
              />
            )}

            <div>

              <h2 className="font-bold text-slate-800">

                {score >= 70
                  ? "Good performance!"
                  : "Improvement opportunities identified"}

              </h2>

              <p className="text-sm text-slate-500 mt-1">

                {score >= 70
                  ? "Your assessment shows a solid level of technical knowledge. Review the skill-wise results below to identify areas for further improvement."
                  : "Your assessment has identified some areas that may require additional learning and practice. Review the skill-wise results below."}

              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            SKILL RESULTS
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-600">

              <Target size={21} />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                Skill-wise Performance
              </h2>

              <p className="text-sm text-slate-500">
                Your current proficiency and knowledge gaps by skill
              </p>

            </div>

          </div>

          {skillResults.length === 0 ? (

            <div className="text-center py-10">

              <p className="text-slate-500">
                No skill-wise results are available.
              </p>

            </div>

          ) : (

            <div className="space-y-5">

              {skillResults.map(
                (skill, index) => {

                  const actual =
                    Number(
                      skill.actualScore
                    ) || 0;

                  const proficiencyLevel =
                    getProficiencyLevel(actual);

                  const required =
                    Number(
                      skill.requiredScore
                    ) || 70;

                  const gap =
                    Number(skill.gap) || 0;

                  const percentage =
                    Math.min(
                      Math.max(actual, 0),
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

                          <h3 className="font-semibold text-lg text-slate-800">
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

                            <span className="text-sm text-slate-500">
                              Required: {required}%
                            </span>

                          </div>

                        </div>

                        <div className="flex items-center gap-3">

                          <span className="text-lg font-bold text-slate-800">
                            {actual}%
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

                      <div className="mt-4">

                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

                          <div
                            className={
                              actual >= required
                                ? "h-full bg-green-500 rounded-full transition-all"
                                : "h-full bg-orange-500 rounded-full transition-all"
                            }
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>

                      {/* Score Details */}

                      <div className="flex justify-between text-xs text-slate-400 mt-2">

                        <span>
                          Current: {actual}%
                        </span>

                        <span>
                          Required: {required}%
                        </span>

                      </div>

                      {/* Gap Information */}

                      {gap > 0 ? (

                        <div className="flex items-center gap-2 mt-3 text-sm text-orange-600">

                          <AlertTriangle size={15} />

                          <span>
                            Knowledge gap:
                          </span>

                          <strong>
                            {gap}%
                          </strong>

                        </div>

                      ) : (

                        <div className="flex items-center gap-2 mt-3 text-sm text-green-600">

                          <CheckCircle size={15} />

                          Required skill level achieved

                        </div>

                      )}

                    </div>

                  );
                }
              )}

            </div>

          )}

        </div>

        {/* =================================================
            GAP SUMMARY
        ================================================= */}

        {skillResults.length > 0 && (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

            {/* Skills With Gaps */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">

                  <AlertTriangle size={20} />

                </div>

                <div>

                  <h3 className="font-semibold text-slate-800">
                    Skills Needing Improvement
                  </h3>

                  <p className="text-sm text-slate-500">
                    {skillsWithGaps} skill
                    {skillsWithGaps !== 1
                      ? "s"
                      : ""}{" "}
                    below the required level
                  </p>

                </div>

              </div>

            </div>

            {/* Skills Without Gaps */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">

                  <CheckCircle size={20} />

                </div>

                <div>

                  <h3 className="font-semibold text-slate-800">
                    Skills Meeting Requirement
                  </h3>

                  <p className="text-sm text-slate-500">
                    {skillsWithoutGaps} skill
                    {skillsWithoutGaps !== 1
                      ? "s"
                      : ""}{" "}
                    meets the required level
                  </p>

                </div>

              </div>

            </div>

          </div>

        )}

        {/* =================================================
            WHAT NEXT
        ================================================= */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2.5 rounded-lg bg-green-100 text-green-600">

              <BookOpen size={21} />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                Recommended Next Steps
              </h2>

              <p className="text-sm text-slate-500">
                Use your assessment results to plan your development.
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Knowledge Gap */}

            <button
              onClick={() =>
                navigate("/knowledge-gap")
              }
              className="text-left p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition"
            >

              <h3 className="font-semibold text-slate-800">
                Review Knowledge Gaps
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                View the skills where your current level
                needs improvement.
              </p>

            </button>

            {/* Learning Path */}

            <button
              onClick={() =>
                navigate("/learning-path")
              }
              className="text-left p-5 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition"
            >

              <h3 className="font-semibold text-slate-800">
                View Learning Path
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                Continue with recommended learning
                resources for your development.
              </p>

            </button>

          </div>

        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">

          <button
            onClick={() =>
              navigate(
                "/employee/skill-assessment"
              )
            }
            className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition"
          >

            <ArrowLeft size={18} />

            Back to Assessment

          </button>

          <button
            onClick={() =>
              navigate("/employee")
            }
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >

            <BookOpen size={18} />
            View My Dashboard

          </button>

        </div>

      </main>

    </div>
  );
}

export default AssessmentResult;