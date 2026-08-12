import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Trophy,
  Target,
  BookOpen,
} from "lucide-react";

import api from "../services/api";

function AssessmentResult() {
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, []);

  const loadResult = async () => {
    try {
      /*
       * First try the result returned immediately
       * after submission.
       */
      const stored =
        sessionStorage.getItem(
          "assessmentResult"
        );

      if (stored) {
        setResult(JSON.parse(stored));
        setLoading(false);

        /*
         * Clear it so a future visit gets the
         * actual latest backend result.
         */
        sessionStorage.removeItem(
          "assessmentResult"
        );

        return;
      }

      /*
       * Otherwise load latest result from backend.
       */
      const response = await api.get(
        "/employee/assessment/result"
      );

      setResult(response.data);

    } catch (error) {
      console.error(
        "Unable to load assessment result:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

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

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">

        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center max-w-md">

          <AlertTriangle
            size={40}
            className="text-orange-500 mx-auto mb-4"
          />

          <h2 className="text-xl font-bold text-slate-800">
            Result Not Found
          </h2>

          <p className="text-slate-500 mt-2">
            We could not find your assessment result.
          </p>

          <button
            onClick={() =>
              navigate("/employee")
            }
            className="mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-lg"
          >
            Back to Dashboard
          </button>

        </div>

      </div>
    );
  }

  const score =
    Number(result.overallScore) || 0;

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

  const getGapStyle = (severity) => {
    switch (severity) {
      case "NO GAP":
        return "bg-green-100 text-green-700";

      case "LOW":
        return "bg-blue-100 text-blue-700";

      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";

      case "HIGH":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}

      <header className="bg-white border-b border-slate-200">

        <div className="max-w-6xl mx-auto px-5 md:px-8 py-5">

          <button
            onClick={() =>
              navigate("/employee")
            }
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

        </div>

      </header>


      <main className="max-w-6xl mx-auto px-5 md:px-8 py-8">

        {/* Title */}

        <div className="text-center mb-8">

          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">

            <Trophy size={32} />

          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            Assessment Completed!
          </h1>

          <p className="text-slate-500 mt-2">
            Here is your assessment performance.
          </p>

        </div>


        {/* Overall Score */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">

            <div>

              <p className="text-sm text-slate-500">
                Overall Score
              </p>

              <p
                className={`text-4xl font-bold mt-2 ${getScoreColor()}`}
              >
                {score}%
              </p>

            </div>

            <div>

              <p className="text-sm text-slate-500">
                Performance
              </p>

              <p className="text-2xl font-bold text-slate-800 mt-3">
                {result.performanceLevel}
              </p>

            </div>

            <div>

              <p className="text-sm text-slate-500">
                Correct Answers
              </p>

              <p className="text-2xl font-bold text-slate-800 mt-3">
                {result.correctAnswers ?? "-"}
              </p>

            </div>

          </div>

        </div>


        {/* Skill Results */}

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
                Your assessment results by skill
              </p>

            </div>

          </div>


          <div className="space-y-5">

            {result.skillResults?.map(
              (skill, index) => {

                const actual =
                  Number(skill.actualScore) || 0;

                const required =
                  Number(skill.requiredScore) || 70;

                return (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl p-5"
                  >

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                      <div>

                        <h3 className="font-semibold text-slate-800">
                          {skill.skillName}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          Required: {required}%
                        </p>

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
                          {skill.gapSeverity}
                        </span>

                      </div>

                    </div>


                    {/* Progress */}

                    <div className="mt-4">

                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

                        <div
                          className={
                            actual >= required
                              ? "h-full bg-green-500 rounded-full"
                              : "h-full bg-orange-500 rounded-full"
                          }
                          style={{
                            width: `${Math.min(
                              actual,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                    </div>


                    {/* Gap */}

                    {Number(skill.gap) > 0 && (

                      <div className="flex items-center gap-2 mt-3 text-sm text-orange-600">

                        <AlertTriangle size={15} />

                        Knowledge gap:{" "}
                        <strong>
                          {skill.gap}%
                        </strong>

                      </div>

                    )}

                    {Number(skill.gap) <= 0 && (

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

        </div>


        {/* Continue */}

        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">

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