import React, { useEffect, useMemo, useState } from "react";
import EmployeePage, { Card } from "@/components/layout/EmployeePage";
import selfAssessmentService, {
  SelfAssessment,
  AssessmentResult,
  Answer,
} from "@/services/selfAssessmentService";

const SelfAssessmentPage: React.FC = () => {
  const [items, setItems] = useState<SelfAssessment[]>([]);
  const [selected, setSelected] = useState<SelfAssessment | null>(null);
  const [attempt, setAttempt] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // Load available assessments
  // ---------------------------------------------------------
  useEffect(() => {
    const loadAssessments = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await selfAssessmentService.getMyAssessments();
        setItems(data || []);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ||
            e?.response?.data?.error ||
            "Unable to load assessments."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, []);

  // ---------------------------------------------------------
  // Start assessment
  // ---------------------------------------------------------
  const start = async (assessment: SelfAssessment) => {
    try {
      setStarting(true);
      setError("");

      const response = await selfAssessmentService.start(
        assessment.assessmentId
      );

      setSelected(assessment);
      setAttempt(response.attemptId);
      setResult(null);
      setAnswers({});
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Unable to start assessment."
      );
    } finally {
      setStarting(false);
    }
  };

  // ---------------------------------------------------------
  // Answer count
  // ---------------------------------------------------------
  const answeredCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  // ---------------------------------------------------------
  // Submit assessment
  // ---------------------------------------------------------
  const submit = async () => {
    if (!attempt || !selected) return;

    try {
      setSubmitting(true);
      setError("");

      const response = await selfAssessmentService.submit(
        attempt,
        Object.values(answers)
      );

      setResult(response);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Unable to submit assessment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // Back to assessment list
  // ---------------------------------------------------------
  const backToAssessments = () => {
    setSelected(null);
    setAttempt(null);
    setResult(null);
    setAnswers({});
    setError("");
  };

  // =========================================================
  // RESULT SCREEN
  // =========================================================
  if (result) {
    return (
      <EmployeePage
        title="Assessment Result"
        subtitle="Your assessment result has been recorded."
      >
        <Card title={`${result.skillName} Assessment`}>
          <div className="py-10 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-purple-50">
              <span className="text-3xl font-bold text-purple-600">
                {result.percentage}%
              </span>
            </div>

            <p className="mt-5 text-4xl font-bold text-slate-800">
              {result.score}/{result.totalMarks}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Assessment Score
            </p>

            <button
              type="button"
              onClick={backToAssessments}
              className="mt-6 rounded-lg border border-slate-300 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Assessments
            </button>
          </div>
        </Card>
      </EmployeePage>
    );
  }

  // =========================================================
  // ACTIVE ASSESSMENT
  // =========================================================
  if (selected && attempt) {
    return (
      <EmployeePage
        title={`${selected.skillName} Self Assessment`}
        subtitle="Answer the questions. Your score is calculated by the backend."
      >
        <Card
          title={selected.assessmentName}
          subtitle={`${selected.totalMarks} total marks`}
        >
          {/* Assessment information */}
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Questions
              </p>
              <p className="mt-1 text-lg font-bold text-slate-800">
                {selected.questions.length}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Total Marks
              </p>
              <p className="mt-1 text-lg font-bold text-slate-800">
                {selected.totalMarks}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Answered
              </p>
              <p className="mt-1 text-lg font-bold text-purple-600">
                {answeredCount}/{selected.questions.length}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Questions */}
          <div className="space-y-5">
            {selected.questions.map((question, index) => {
              const currentAnswer = answers[question.questionId];

              return (
                <div
                  key={question.questionId}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  {/* Question header */}
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-semibold leading-6 text-slate-800">
                      {index + 1}. {question.questionText}
                    </p>

                    <span className="shrink-0 rounded-md bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-600">
                      {question.difficulty} · {question.marks} marks
                    </span>
                  </div>

                  {/* MCQ */}
                  {question.type === "MCQ" ? (
                    <div className="mt-4 space-y-2">
                      {question.options.map((option) => (
                        <label
                          key={option.optionId}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-xs transition ${
                            currentAnswer?.selectedOptionId ===
                            option.optionId
                              ? "border-purple-400 bg-purple-50"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.questionId}`}
                            checked={
                              currentAnswer?.selectedOptionId ===
                              option.optionId
                            }
                            onChange={() => {
                              setAnswers((previous) => ({
                                ...previous,
                                [question.questionId]: {
                                  questionId: question.questionId,
                                  selectedOptionId: option.optionId,
                                },
                              }));

                              setError("");
                            }}
                          />

                          <span className="text-slate-700">
                            {option.optionText}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    /* Coding question */
                    <div className="mt-4">
                      {question.starterCode && (
                        <div className="mb-3">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Starter Code
                          </p>

                          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
                            {question.starterCode}
                          </pre>
                        </div>
                      )}

                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Your Solution
                      </p>

                      <textarea
                        className="min-h-40 w-full rounded-lg border border-slate-300 p-3 font-mono text-xs outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                        placeholder="Write your solution here..."
                        value={currentAnswer?.codeAnswer || ""}
                        onChange={(event) => {
                          setAnswers((previous) => ({
                            ...previous,
                            [question.questionId]: {
                              questionId: question.questionId,
                              codeAnswer: event.target.value,
                            },
                          }));

                          setError("");
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit */}
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              {answeredCount} of {selected.questions.length} questions
              answered.
            </p>

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="rounded-lg bg-purple-600 px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </button>
          </div>
        </Card>
      </EmployeePage>
    );
  }

  // =========================================================
  // ASSESSMENT LIST
  // =========================================================
  return (
    <EmployeePage
      title="Self Assessment"
      subtitle="Take technical assessments for the skills in your Skill Profile."
    >
      <Card
        title="Available Assessments"
        subtitle="Assessments are automatically available for your selected skills."
      >
        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="py-10 text-center">
            <p className="text-xs text-slate-400">
              Loading assessments...
            </p>
          </div>
        ) : items.length === 0 ? (
          /* Empty */
          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No assessments available
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Add a skill in Skill Profile to get its assessment.
            </p>
          </div>
        ) : (
          /* Assessment cards */
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((assessment) => (
              <div
                key={assessment.assessmentId}
                className="rounded-xl border border-slate-200 p-5 transition hover:border-purple-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {assessment.skillName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {assessment.assessmentName}
                    </p>
                  </div>

                  <span className="rounded-md bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-600">
                    {assessment.totalMarks} marks
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-500">
                    {assessment.questions.length} Questions
                  </span>

                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-500">
                    Backend Evaluated
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => start(assessment)}
                  disabled={starting}
                  className="mt-5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {starting ? "Starting..." : "Take Assessment"}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </EmployeePage>
  );
};

export default SelfAssessmentPage;