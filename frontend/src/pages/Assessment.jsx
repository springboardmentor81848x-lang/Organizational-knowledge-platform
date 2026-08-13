import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Send,
} from "lucide-react";

import api from "../services/api";

function Assessment() {
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Stores the actual selected option text.
  // Example:
  // {
  //   1: "extends",
  //   2: "main()"
  // }
  const [answers, setAnswers] = useState({});

  const [timeLeft, setTimeLeft] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD ACTIVE ASSESSMENT
  // =========================================================

  useEffect(() => {
    loadAssessment();
  }, []);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      setError("");

      // Get active assessment
      const assessmentResponse =
        await api.get("/assessments/active");

      console.log(
        "Active assessments:",
        assessmentResponse.data
      );

      const activeAssessments =
        Array.isArray(assessmentResponse.data)
          ? assessmentResponse.data
          : [];

      if (activeAssessments.length === 0) {
        setError(
          "No active assessment is available right now."
        );
        return;
      }

      // Use the first active assessment
      const selectedAssessment =
        activeAssessments[0];

      // Get questions
      const questionsResponse =
        await api.get(
          `/assessments/${selectedAssessment.id}/questions`
        );

      console.log(
        "Assessment questions:",
        questionsResponse.data
      );

      const questions =
        Array.isArray(questionsResponse.data)
          ? questionsResponse.data
          : [];

      if (questions.length === 0) {
        setError(
          "The assessment does not contain any questions."
        );
        return;
      }

      setAssessment({
        ...selectedAssessment,

        // Keep both values for compatibility
        id: selectedAssessment.id,
        assessmentId: selectedAssessment.id,

        questions,
      });

      // Start timer
      if (selectedAssessment.durationMinutes) {
        setTimeLeft(
          Number(
            selectedAssessment.durationMinutes
          ) * 60
        );
      }
    } catch (err) {
      console.error(
        "Error loading assessment:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          `Unable to load assessment. Status: ${
            err.response?.status || "Unknown"
          }`
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // TIMER
  // =========================================================

  useEffect(() => {
    if (
      timeLeft === null ||
      timeLeft <= 0 ||
      submitting
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting]);

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (seconds) => {
    if (seconds === null) {
      return "--:--";
    }

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  // =========================================================
  // SELECT ANSWER
  // =========================================================

  const selectAnswer = (answer) => {
    if (!assessment?.questions) {
      return;
    }

    const question =
      assessment.questions[currentQuestion];

    setAnswers((previous) => ({
      ...previous,

      // IMPORTANT:
      // Save actual option text, not A/B/C/D.
      [question.id]: answer,
    }));

    setError("");
  };

  // =========================================================
  // NEXT QUESTION
  // =========================================================

  const nextQuestion = () => {
    if (
      currentQuestion <
      assessment.questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) => previous + 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =========================================================
  // PREVIOUS QUESTION
  // =========================================================

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        (previous) => previous - 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =========================================================
  // SUBMIT ASSESSMENT
  // =========================================================

  const submitAssessment = async () => {
    if (submitting) {
      return;
    }

    if (!assessment?.questions?.length) {
      return;
    }

    // -------------------------------------------------------
    // Check unanswered questions
    // -------------------------------------------------------

    const unanswered =
      assessment.questions.filter(
        (question) =>
          !answers[question.id]
      );

    if (unanswered.length > 0) {
      const shouldSubmit =
        window.confirm(
          `You have ${unanswered.length} unanswered question(s). Do you want to submit anyway?`
        );

      if (!shouldSubmit) {
        return;
      }
    } else {
      const shouldSubmit =
        window.confirm(
          "Are you sure you want to submit the assessment?"
        );

      if (!shouldSubmit) {
        return;
      }
    }

    // -------------------------------------------------------
    // Get logged-in employee
    // -------------------------------------------------------

    const employeeId =
      localStorage.getItem("employeeId");

    if (!employeeId) {
      setError(
        "Employee ID was not found. Please log in again."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // -----------------------------------------------------
      // Prepare answers
      // -----------------------------------------------------

      const submittedAnswers =
        assessment.questions.map(
          (question) => ({
            questionId: question.id,

            // Send null if unanswered
            selectedAnswer:
              answers[question.id] || null,
          })
        );

      // -----------------------------------------------------
      // Request body
      // -----------------------------------------------------

      const payload = {
        assessmentId:
          assessment.assessmentId ||
          assessment.id,

        answers: submittedAnswers,
      };

      console.log(
        "Submitting assessment:",
        payload
      );

      console.log(
        "Employee ID:",
        employeeId
      );

      // -----------------------------------------------------
      // Send to backend
      // -----------------------------------------------------

      const response =
        await api.post(
          `/employee/assessment/submit/${employeeId}`,
          payload
        );

      console.log(
        "Assessment saved successfully:",
        response.data
      );

      // -----------------------------------------------------
      // Store returned result temporarily
      // -----------------------------------------------------

      sessionStorage.setItem(
        "assessmentResult",
        JSON.stringify(response.data)
      );

      // -----------------------------------------------------
      // Navigate to result
      // -----------------------------------------------------

      navigate(
        "/employee/assessment/result"
      );
    } catch (err) {
      console.error(
        "Error submitting assessment:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to submit assessment. Please try again."
      );

      setSubmitting(false);
    }
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">

        <div className="text-center">

          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-500">
            Loading assessment...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // ERROR SCREEN
  // =========================================================

  if (error && !assessment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">

          <AlertCircle
            size={42}
            className="text-red-500 mx-auto mb-4"
          />

          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Assessment Unavailable
          </h2>

          <p className="text-slate-500 mb-6">
            {error}
          </p>

          <button
            onClick={loadAssessment}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // =========================================================
  // SAFETY CHECK
  // =========================================================

  if (
    !assessment ||
    !assessment.questions ||
    assessment.questions.length === 0
  ) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-center">

          <AlertCircle
            size={40}
            className="text-orange-500 mx-auto mb-4"
          />

          <h2 className="text-xl font-bold text-slate-800">
            No Assessment Available
          </h2>

        </div>

      </div>
    );
  }

  // =========================================================
  // CURRENT QUESTION
  // =========================================================

  const question =
    assessment.questions[currentQuestion];

  const selectedAnswer =
    answers[question.id];

  const totalQuestions =
    assessment.questions.length;

  const answeredQuestions =
    Object.keys(answers).length;

  const progress =
    totalQuestions > 0
      ? (answeredQuestions /
          totalQuestions) *
        100
      : 0;

  // ---------------------------------------------------------
  // Options
  // ---------------------------------------------------------

  const options = [
    {
      key: "A",
      value: question.optionA,
    },
    {
      key: "B",
      value: question.optionB,
    },
    {
      key: "C",
      value: question.optionC,
    },
    {
      key: "D",
      value: question.optionD,
    },
  ];

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">

        <div className="max-w-6xl mx-auto px-5 md:px-8 py-4">

          <div className="flex items-center justify-between gap-4">

            <div>

              <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                {assessment.title}
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Technical Skill Assessment
              </p>

            </div>

            {/* =================================================
                TIMER
            ================================================= */}

            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                timeLeft !== null &&
                timeLeft <= 300
                  ? "bg-red-100 text-red-600"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >

              <Clock size={18} />

              <span>
                {formatTime(timeLeft)}
              </span>

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-5xl mx-auto px-5 md:px-8 py-8">

        {/* ===================================================
            DESCRIPTION
        =================================================== */}

        {assessment.description && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">

            <p className="text-slate-600">
              {assessment.description}
            </p>

          </div>
        )}

        {/* ===================================================
            PROGRESS
        =================================================== */}

        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">

          <div className="flex justify-between items-center mb-3">

            <span className="font-medium text-slate-700">
              Question{" "}
              {currentQuestion + 1}{" "}
              of{" "}
              {totalQuestions}
            </span>

            <span className="text-sm text-slate-500">
              {answeredQuestions} answered
            </span>

          </div>

          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

        {/* ===================================================
            QUESTION CARD
        =================================================== */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">

          {/* Question Information */}

          <div className="flex flex-wrap items-center gap-2 mb-6">

            {question.skillName && (
              <span className="px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                {question.skillName}
              </span>
            )}

            {question.difficulty && (
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                {question.difficulty}
              </span>
            )}

            {question.marks !== null &&
              question.marks !== undefined && (
                <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  {question.marks}{" "}
                  {Number(question.marks) === 1
                    ? "mark"
                    : "marks"}
                </span>
              )}

          </div>

          {/* Question */}

          <h2 className="text-xl md:text-2xl font-semibold text-slate-800 leading-relaxed mb-8">
            {question.question}
          </h2>

          {/* =================================================
              OPTIONS
          ================================================= */}

          <div className="space-y-4">

            {options.map((option) => {

              // Don't show empty options
              if (!option.value) {
                return null;
              }

              const selected =
                selectedAnswer ===
                option.value;

              return (
                <button
                  key={option.key}
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    selectAnswer(
                      option.value
                    )
                  }
                  className={
                    selected
                      ? "w-full flex items-center gap-4 p-4 text-left rounded-xl border-2 border-indigo-600 bg-indigo-50 transition"
                      : "w-full flex items-center gap-4 p-4 text-left rounded-xl border-2 border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition disabled:opacity-60"
                  }
                >

                  {/* Option Letter */}

                  <div
                    className={
                      selected
                        ? "w-10 h-10 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold"
                        : "w-10 h-10 shrink-0 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold"
                    }
                  >
                    {option.key}
                  </div>

                  {/* Option Text */}

                  <span
                    className={
                      selected
                        ? "font-medium text-indigo-900"
                        : "font-medium text-slate-700"
                    }
                  >
                    {option.value}
                  </span>

                  {/* Selected Icon */}

                  {selected && (
                    <CheckCircle
                      size={22}
                      className="ml-auto text-indigo-600"
                    />
                  )}

                </button>
              );
            })}

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* =================================================
              NAVIGATION
          ================================================= */}

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-10">

            {/* Previous */}

            <button
              type="button"
              onClick={previousQuestion}
              disabled={
                currentQuestion === 0 ||
                submitting
              }
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />

              Previous

            </button>

            {/* Next / Submit */}

            {currentQuestion <
            totalQuestions - 1 ? (

              <button
                type="button"
                onClick={nextQuestion}
                disabled={submitting}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Next

                <ChevronRight size={18} />

              </button>

            ) : (

              <button
                type="button"
                onClick={submitAssessment}
                disabled={submitting}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >

                {submitting ? (
                  <>
                    <Spinner />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Assessment
                  </>
                )}

              </button>

            )}

          </div>

        </div>

        {/* ===================================================
            QUESTION NAVIGATOR
        =================================================== */}

        <div className="bg-white rounded-xl border border-slate-200 p-5 mt-6">

          <h3 className="font-semibold text-slate-800 mb-4">
            Questions
          </h3>

          <div className="flex flex-wrap gap-2">

            {assessment.questions.map(
              (item, index) => {

                const answered =
                  Boolean(
                    answers[item.id]
                  );

                const active =
                  currentQuestion ===
                  index;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      setCurrentQuestion(
                        index
                      )
                    }
                    className={
                      active
                        ? "w-10 h-10 rounded-lg bg-indigo-600 text-white font-semibold"
                        : answered
                        ? "w-10 h-10 rounded-lg bg-green-100 text-green-700 font-semibold hover:bg-green-200"
                        : "w-10 h-10 rounded-lg bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200"
                    }
                  >
                    {index + 1}
                  </button>
                );
              }
            )}

          </div>

        </div>

      </main>
    </div>
  );
}

// =============================================================
// SPINNER
// =============================================================

function Spinner() {
  return (
    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
  );
}

export default Assessment;