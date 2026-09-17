import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import EmployeePage, {
  Card,
  ProgressBar,
} from "@/components/layout/EmployeePage";

import { useNavigate } from "react-router-dom";
import profileService from "@/services/profileService";
import aiService from "@/services/aiServices";

// =====================================================
// TYPES
// =====================================================

interface PriorityGap {
  skillName?: string;
  gapType?: string;
  gapPercentage?: number;
  priority?: string;
}

interface LearningStep {
  phase?: number;
  title?: string;
  duration?: string;
  reason?: string;
}

interface RecommendedCourse {
  trainingId?: number;
  trainingName?: string;
  provider?: string;
  level?: string;
  duration?: string;
  courseUrl?: string;
}

interface LearningPathResponse {
  employeeId?: number;
  employeeCode?: string;
  employeeName?: string;

  priorityGaps?: PriorityGap[];

  learningPath?: LearningStep[];

  recommendedCourses?: RecommendedCourse[];
}

// =====================================================
// COMPONENT
// =====================================================

const LearningPaths: React.FC = () => {
  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================

  const [employeeId, setEmployeeId] =
    useState<number | null>(null);

  const [data, setData] =
    useState<LearningPathResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // ===================================================
  // LOAD PROFILE + AI RECOMMENDATIONS
  // ===================================================

  const loadRecommendations =
    useCallback(async () => {

      try {

        setLoading(true);
        setError(null);

        console.log(
          "========================================"
        );

        console.log(
          "LEARNING PATHS: START"
        );

        console.log(
          "========================================"
        );

        // =================================================
        // STEP 1: GET LOGGED-IN EMPLOYEE PROFILE
        // =================================================

        console.log(
          "LEARNING PATHS: Getting profile..."
        );

        const profile =
          await profileService.getMyProfile();

        console.log(
          "LEARNING PATHS: PROFILE:",
          profile
        );

        // =================================================
        // STEP 2: GET EMPLOYEE ID
        // =================================================

        const id =
          Number(profile.employeeId);

        console.log(
          "LEARNING PATHS: EMPLOYEE ID:",
          id
        );

        if (
          !Number.isFinite(id) ||
          id <= 0
        ) {

          throw new Error(
            "Unable to identify the logged-in employee. Please login again."
          );
        }

        setEmployeeId(id);

        console.log(
          "LEARNING PATHS: VALID EMPLOYEE ID:",
          id
        );

        // =================================================
        // STEP 3: CALL REAL AI BACKEND
        // =================================================

        console.log(
          "LEARNING PATHS: Calling AI API..."
        );

        console.log(
          "LEARNING PATHS: ENDPOINT:",
          `/api/ai/employee/recommendations/${id}`
        );

        const response =
          await aiService.getEmployeeRecommendations(
            id
          );

        console.log(
          "LEARNING PATHS: AI RESPONSE:",
          response
        );

        // =================================================
        // STEP 4: VALIDATE RESPONSE
        // =================================================

        if (
          response === null ||
          response === undefined
        ) {

          throw new Error(
            "AI returned an empty response."
          );
        }

        // =================================================
        // STEP 5: HANDLE RESPONSE
        // =================================================

        let finalData: any =
          response;

        if (
          typeof response === "string"
        ) {

          try {

            finalData =
              JSON.parse(response);

          } catch {

            finalData = {
              message: response,
            };

          }
        }

        console.log(
          "LEARNING PATHS: FINAL DATA:",
          finalData
        );

        setData(finalData);

        console.log(
          "LEARNING PATHS: SUCCESS"
        );

      } catch (err: any) {

        console.error(
          "========================================"
        );

        console.error(
          "LEARNING PATHS: ERROR"
        );

        console.error(
          "========================================"
        );

        console.error(
          "ERROR:",
          err
        );

        console.error(
          "STATUS:",
          err?.response?.status
        );

        console.error(
          "URL:",
          err?.config?.url
        );

        console.error(
          "BACKEND RESPONSE:",
          err?.response?.data
        );

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          (
            typeof err?.response?.data ===
            "string"
              ? err.response.data
              : null
          ) ||
          err?.message ||
          "Unable to generate AI recommendations.";

        setError(message);

      } finally {

        setLoading(false);

        console.log(
          "LEARNING PATHS: END"
        );
      }

    }, []);

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {

    loadRecommendations();

  }, [loadRecommendations]);

  // ===================================================
  // DATA
  // ===================================================

  const skillGaps =
    data?.priorityGaps ?? [];

  const learningSteps =
    data?.learningPath ?? [];

  const trainings =
    data?.recommendedCourses ?? [];

  // ===================================================
  // PRIORITY
  // ===================================================

  const getPriority = (gap: PriorityGap): string => {
  const percentage = Number(gap.gapPercentage ?? 0);

  if (percentage >= 70) {
    return "HIGH";
  }

  if (percentage >= 40) {
    return "MEDIUM";
  }

  return "LOW";
};
  // ===================================================
  // PRIORITY CLASS
  // ===================================================

  const getPriorityClass = (
    priority: string
  ): string => {

    switch (priority) {

      case "HIGH":
        return "text-red-500";

      case "MEDIUM":
        return "text-purple-600";

      default:
        return "text-green-600";
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <EmployeePage
      title="Learning Paths"
      subtitle="Get personalized learning recommendations based on your current skills, knowledge gaps and available training."
    >

      <Card className="overflow-hidden p-0">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex items-start justify-between border-b border-slate-100 p-6">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <span className="text-xs font-bold tracking-wide text-purple-600">
                GEMINI AI RECOMMENDATION
              </span>

              <span className="rounded-full bg-purple-50 px-2 py-1 text-[10px] font-semibold text-purple-600">
                PERSONALIZED
              </span>

            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Personalized Learning
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              AI recommendations are generated from
              your current skills, knowledge gaps and
              available training data.
            </p>

            {employeeId && (
              <p className="mt-2 text-xs text-purple-600">
                Employee ID: {employeeId}
              </p>
            )}

            {data?.employeeName && (
              <p className="mt-1 text-xs font-medium text-purple-600">
                Recommendations for{" "}
                {data.employeeName}
              </p>
            )}

            {data?.employeeCode && (
              <p className="mt-1 text-xs text-slate-400">
                Employee Code:{" "}
                {data.employeeCode}
              </p>
            )}

          </div>

          <button
            type="button"
            onClick={loadRecommendations}
            disabled={loading}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <Sparkles
              size={23}
              className={
                loading
                  ? "animate-pulse"
                  : ""
              }
            />

          </button>

        </div>

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (

          <div className="flex min-h-[360px] flex-col items-center justify-center p-8">

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50">

              <Sparkles
                size={30}
                className="animate-pulse text-purple-500"
              />

            </div>

            <h3 className="text-base font-semibold text-slate-900">
              Generating your learning path...
            </h3>

            <p className="mt-2 max-w-md text-center text-sm text-slate-500">
              We are analyzing your current
              skills and knowledge gaps.
            </p>

          </div>

        )}

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {!loading && error && (

          <div className="p-6">

            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">

                  <AlertTriangle size={21} />

                </div>

                <div>

                  <h3 className="font-semibold text-red-700">
                    Unable to Generate AI Recommendations
                  </h3>

                  <p className="mt-1 text-sm text-red-600">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={loadRecommendations}
                    className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                  >
                    Try Again
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

        {/* ================================================= */}
        {/* SUCCESS */}
        {/* ================================================= */}

        {!loading &&
          !error &&
          data && (

          <div className="p-6">

            {/* ============================================= */}
            {/* SUMMARY */}
            {/* ============================================= */}

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

              <div className="rounded-xl border border-slate-200 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <Target size={19} />
                  </div>

                  <div>

                    <p className="text-xs text-slate-500">
                      Skill Gaps
                    </p>

                    <p className="text-xl font-bold text-slate-900">
                      {skillGaps.length}
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-xl border border-slate-200 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <BookOpen size={19} />
                  </div>

                  <div>

                    <p className="text-xs text-slate-500">
                      Learning Steps
                    </p>

                    <p className="text-xl font-bold text-slate-900">
                      {learningSteps.length}
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-xl border border-slate-200 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                    <CheckCircle2 size={19} />
                  </div>

                  <div>

                    <p className="text-xs text-slate-500">
                      Recommended Courses
                    </p>

                    <p className="text-xl font-bold text-slate-900">
                      {trainings.length}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* ============================================= */}
            {/* PRIORITY GAPS */}
            {/* ============================================= */}

            {skillGaps.length > 0 && (

              <section className="mb-8">

                <div className="mb-4 flex items-center gap-3">

                  <Target
                    size={20}
                    className="text-purple-600"
                  />

                  <div>

                    <h3 className="font-semibold text-slate-900">
                      Priority Skill Gaps
                    </h3>

                    <p className="text-xs text-slate-500">
                      Skills that should be addressed first.
                    </p>

                  </div>

                </div>

                <div className="space-y-3">

                  {skillGaps.map(
                    (gap, index) => {

                      const percentage =
                        Number(
                          gap.gapPercentage ?? 0
                        );

                      const priority =
                        getPriority(gap);

                      return (

                        <div
                          key={`${gap.skillName ?? "skill"}-${index}`}
                          className="rounded-xl border border-slate-200 p-4"
                        >

                          <div className="flex items-center justify-between">

                            <div>

                              <h4 className="font-semibold text-slate-900">
                                {gap.skillName ||
                                  "Skill"}
                              </h4>

                              <p className="mt-1 text-xs uppercase text-slate-400">
                                {gap.gapType ||
                                  "SKILL GAP"}
                              </p>

                            </div>

                            <div className="text-right">

                              <span
                                className={`text-xs font-bold ${getPriorityClass(
                                  priority
                                )}`}
                              >
                                {priority}
                              </span>

                              <p className="text-xs text-slate-500">
  {percentage.toFixed(2)}% gap
</p>
                            </div>

                          </div>

                          <div className="mt-4">

                            <ProgressBar
                              value={percentage}
                              showValue={false}
                            />

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

              </section>

            )}

            {/* ============================================= */}
            {/* LEARNING PATH */}
            {/* ============================================= */}

            {learningSteps.length > 0 && (

              <section className="mb-8 border-t border-slate-100 pt-6">

                <div className="mb-4 flex items-center gap-3">

                  <BookOpen
                    size={20}
                    className="text-purple-600"
                  />

                  <div>

                    <h3 className="font-semibold text-slate-900">
                      Personalized Learning Path
                    </h3>

                    <p className="text-xs text-slate-500">
                      Recommended learning progression.
                    </p>

                  </div>

                </div>

                <div className="space-y-3">

                  {learningSteps.map(
                    (step, index) => (

                      <div
                        key={`${step.phase ?? index}-${step.title ?? "step"}`}
                        className="flex gap-4 rounded-xl border border-slate-200 p-4"
                      >

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                          {step.phase ??
                            index + 1}
                        </div>

                        <div className="flex-1">

                          <h4 className="font-semibold text-slate-900">
                            {step.title ||
                              "Learning Step"}
                          </h4>

                          {step.duration && (

                            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-purple-600">

                              <Clock3 size={13} />

                              {step.duration}

                            </div>

                          )}

                          {step.reason && (

                            <p className="mt-2 text-sm text-slate-500">
                              {step.reason}
                            </p>

                          )}

                        </div>

                      </div>

                    )
                  )}

                </div>

              </section>

            )}

            {/* ============================================= */}
            {/* COURSES */}
            {/* ============================================= */}

            {trainings.length > 0 && (

              <section className="border-t border-slate-100 pt-6">

                <div className="mb-4 flex items-center gap-3">

                  <CheckCircle2
                    size={20}
                    className="text-purple-600"
                  />

                  <div>

                    <h3 className="font-semibold text-slate-900">
                      Recommended Courses
                    </h3>

                    <p className="text-xs text-slate-500">
                      Courses recommended based on your skill gaps.
                    </p>

                  </div>

                </div>

                <div className="space-y-3">

                  {trainings.map(
                    (training, index) => (

                      <div
                        key={
                          training.trainingId ??
                          index
                        }
                        className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                      >

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">

                            <BookOpen size={18} />

                          </div>

                          <div>

                            <h4 className="font-semibold text-slate-900">
                              {training.trainingName ||
                                "Recommended Course"}
                            </h4>

                            <p className="mt-1 text-xs text-slate-500">

                              {[
                                training.provider,
                                training.level,
                                training.duration,
                              ]
                                .filter(Boolean)
                                .join(" • ")}

                            </p>

                          </div>

                        </div>

                        {training.courseUrl && (

                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                training.courseUrl,
                                "_blank",
                                "noopener,noreferrer"
                              )
                            }
                            className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-100"
                          >

                            Open

                            <ExternalLink size={14} />

                          </button>

                        )}

                      </div>

                    )
                  )}

                </div>

              </section>

            )}

            {/* ============================================= */}
            {/* NO DATA */}
            {/* ============================================= */}

            {skillGaps.length === 0 &&
              learningSteps.length === 0 &&
              trainings.length === 0 && (

              <div className="flex min-h-[250px] flex-col items-center justify-center text-center">

                <TrendingUp
                  size={32}
                  className="mb-3 text-purple-500"
                />

                <h3 className="font-semibold text-slate-900">
                  No recommendations available yet
                </h3>

                <p className="mt-1 max-w-md text-sm text-slate-500">
                  Complete your skill profile
                  and assessments so the AI
                  recommendation engine can
                  generate a personalized
                  learning path.
                </p>

              </div>

            )}

          </div>

        )}

      </Card>

    </EmployeePage>
  );
};

export default LearningPaths;