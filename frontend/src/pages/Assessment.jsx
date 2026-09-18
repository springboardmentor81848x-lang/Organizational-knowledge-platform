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

  const [answers, setAnswers] = useState({});

  const [timeLeft, setTimeLeft] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD ROLE-SPECIFIC ASSESSMENT
  // =========================================================

  useEffect(() => {
    loadAssessment();
  }, []);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      setError("");

      // -------------------------------------------------------
      // Get target role selected during signup
      // -------------------------------------------------------

      const targetRoleId =
        localStorage.getItem("targetRoleId");

      const targetRole =
        localStorage.getItem("targetRole");

      console.log(
        "Assessment - Target Role ID:",
        targetRoleId
      );

      console.log(
        "Assessment - Target Role:",
        targetRole
      );

      if (!targetRoleId) {
        setError(
          "Target role was not selected. Please select a role first."
        );

        return;
      }

      // -------------------------------------------------------
      // Get role-specific assessment
      // -------------------------------------------------------

      const assessmentResponse = await api.get(
        `/assessments/role/${targetRoleId}`
      );

      console.log(
        "Role-specific assessment response:",
        assessmentResponse.data
      );

      let selectedAssessment =
        assessmentResponse.data;

      // -------------------------------------------------------
      // Handle array response
      // -------------------------------------------------------

      if (Array.isArray(selectedAssessment)) {
        selectedAssessment =
          selectedAssessment.length > 0
            ? selectedAssessment[0]
            : null;
      }

      if (!selectedAssessment) {
        setError(
          `No assessment is available for ${
            targetRole || "this role"
          }.`
        );

        return;
      }

      if (!selectedAssessment.id) {
        setError(
          "Assessment ID was not returned by the server."
        );

        return;
      }

      console.log(
        "Selected assessment:",
        selectedAssessment
      );

      // -------------------------------------------------------
      // Get questions for selected assessment
      // -------------------------------------------------------

      const questionsResponse = await api.get(
        `/assessments/${selectedAssessment.id}/questions`
      );

      console.log(
        "Assessment questions:",
        questionsResponse.data
      );

      const questions = Array.isArray(
        questionsResponse.data
      )
        ? questionsResponse.data
        : [];

      if (questions.length === 0) {
        setError(
          `No questions are available for ${
            targetRole || "the selected role"
          } assessment.`
        );

        return;
      }

      // -------------------------------------------------------
      // Store assessment
      // -------------------------------------------------------

      const assessmentData = {
        ...selectedAssessment,

        id: selectedAssessment.id,

        assessmentId: selectedAssessment.id,

        targetRoleId: Number(targetRoleId),

        targetRole: targetRole,

        // -----------------------------------------------------
        // This assessment is taken by the employee themselves.
        // Therefore the assessment type is SELF.
        // -----------------------------------------------------

        assessmentType: "SELF",

        questions: questions,
      };

      setAssessment(assessmentData);

      // -------------------------------------------------------
      // Store assessment ID temporarily
      // -------------------------------------------------------

      sessionStorage.setItem(
        "selectedAssessmentId",
        String(selectedAssessment.id)
      );

      // -------------------------------------------------------
      // Store assessment type temporarily
      // -------------------------------------------------------

      sessionStorage.setItem(
        "assessmentType",
        "SELF"
      );

      // -------------------------------------------------------
      // Start assessment timer
      // -------------------------------------------------------

      const duration =
        Number(
          selectedAssessment.durationMinutes
        );

      if (duration > 0) {
        setTimeLeft(duration * 60);
      } else {
        setTimeLeft(null);
      }
    } catch (err) {
      console.error(
        "Error loading assessment:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : null) ||
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
  // AUTO SUBMIT WHEN TIMER ENDS
  // =========================================================

  useEffect(() => {
    if (
      timeLeft === 0 &&
      assessment &&
      !submitting
    ) {
      handleTimeExpired();
    }
  }, [timeLeft, assessment, submitting]);

  const handleTimeExpired = async () => {
    const shouldSubmit = window.confirm(
      "Time is over. Your assessment will be submitted now."
    );

    if (!shouldSubmit) {
      return;
    }

    await submitAssessment(true);
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (seconds) => {
    if (seconds === null) {
      return "--:--";
    }

    const safeSeconds = Math.max(
      Number(seconds) || 0,
      0
    );

    const minutes = Math.floor(
      safeSeconds / 60
    );

    const remainingSeconds =
      safeSeconds % 60;

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
    if (
      !assessment?.questions ||
      submitting
    ) {
      return;
    }

    const question =
      assessment.questions[currentQuestion];

    if (!question?.id) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [question.id]: answer,
    }));

    setError("");
  };

  // =========================================================
  // NEXT QUESTION
  // =========================================================

  const nextQuestion = () => {
    if (!assessment?.questions) {
      return;
    }

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

  const submitAssessment = async (
    autoSubmit = false
  ) => {
    if (submitting) {
      return;
    }

    if (
      !assessment?.questions?.length
    ) {
      setError(
        "Assessment questions are not available."
      );

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

    // -------------------------------------------------------
    // Confirmation
    // -------------------------------------------------------

    if (!autoSubmit) {
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
    }

    // -------------------------------------------------------
    // Get employee ID
    // -------------------------------------------------------

    const employeeId =
      localStorage.getItem("employeeId");

    if (!employeeId) {
      setError(
        "Employee ID was not found. Please log in again."
      );

      return;
    }

    // -------------------------------------------------------
    // Get assessment ID
    // -------------------------------------------------------

    const assessmentId =
      assessment.assessmentId ||
      assessment.id;

    if (!assessmentId) {
      setError(
        "Assessment ID was not found."
      );

      return;
    }

    // -------------------------------------------------------
    // Assessment type
    //
    // This is an employee's own assessment.
    // Backend accepts:
    // SELF, PEER, MANAGER
    //
    // Therefore we MUST send SELF.
    // -------------------------------------------------------

    const assessmentType =
      assessment.assessmentType ||
      sessionStorage.getItem(
        "assessmentType"
      ) ||
      "SELF";

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

            selectedAnswer:
              answers[question.id] ||
              null,
          })
        );

      // -----------------------------------------------------
      // Request payload
      // -----------------------------------------------------

      const payload = {
        assessmentId: Number(
          assessmentId
        ),

        // IMPORTANT:
        // Backend requires this field.
        assessmentType:
          assessmentType.toUpperCase(),

        answers: submittedAnswers,
      };

      console.log(
        "================================="
      );

      console.log(
        "SUBMITTING ASSESSMENT"
      );

      console.log(
        "Employee ID:",
        employeeId
      );

      console.log(
        "Target Role ID:",
        assessment.targetRoleId
      );

      console.log(
        "Target Role:",
        assessment.targetRole
      );

      console.log(
        "Assessment ID:",
        assessmentId
      );

      console.log(
        "Assessment Type:",
        assessmentType
      );

      console.log(
        "Answered:",
        submittedAnswers.filter(
          (answer) =>
            answer.selectedAnswer
        ).length
      );

      console.log(
        "Total Questions:",
        assessment.questions.length
      );

      console.log(
        "Payload:",
        payload
      );

      console.log(
        "================================="
      );

      // -----------------------------------------------------
      // Submit to backend
      // -----------------------------------------------------

      const response =
        await api.post(
          `/employee/assessment/submit/${employeeId}`,
          payload
        );

      console.log(
        "Assessment submission response:",
        response.data
      );

      // -----------------------------------------------------
      // Store result
      // -----------------------------------------------------

      sessionStorage.setItem(
        "assessmentResult",
        JSON.stringify(
          response.data
        )
      );

      // -----------------------------------------------------
      // Clear temporary assessment data
      // -----------------------------------------------------

      sessionStorage.removeItem(
        "selectedAssessmentId"
      );

      sessionStorage.removeItem(
        "assessmentType"
      );

      // -----------------------------------------------------
      // Navigate to result page
      // -----------------------------------------------------

      navigate(
        "/employee/assessment/result"
      );
    } catch (err) {
      console.error(
        "================================="
      );

      console.error(
        "ASSESSMENT SUBMISSION FAILED"
      );

      console.error(
        "Error:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      console.error(
        "================================="
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          (typeof err.response?.data ===
          "string"
            ? err.response.data
            : null) ||
          `Unable to submit assessment. Status: ${
            err.response?.status ||
            "Unknown"
          }`
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
    assessment.questions[
      currentQuestion
    ];

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

  // =========================================================
  // QUESTION OPTIONS
  // =========================================================

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

            {/* ASSESSMENT INFO */}

            <div>

              <div className="flex items-center gap-2 mb-1">

                {assessment.targetRole && (
                  <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                    {assessment.targetRole}
                  </span>
                )}

                {/* SELF ASSESSMENT LABEL */}

                <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  Self Assessment
                </span>

              </div>

              <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                {assessment.title}
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Role-Specific Technical Skill Assessment
              </p>

            </div>

            {/* TIMER */}

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

          {/* QUESTION INFORMATION */}

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

                  {Number(
                    question.marks
                  ) === 1
                    ? "mark"
                    : "marks"}

                </span>
              )}

          </div>

          {/* QUESTION */}

          <h2 className="text-xl md:text-2xl font-semibold text-slate-800 leading-relaxed mb-8">
            {question.question}
          </h2>

          {/* =================================================
              OPTIONS
          ================================================= */}

          <div className="space-y-4">

            {options.map((option) => {

              if (
                option.value ===
                  null ||
                option.value ===
                  undefined ||
                option.value === ""
              ) {
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

                  {/* OPTION LETTER */}

                  <div
                    className={
                      selected
                        ? "w-10 h-10 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold"
                        : "w-10 h-10 shrink-0 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold"
                    }
                  >
                    {option.key}
                  </div>

                  {/* OPTION TEXT */}

                  <span
                    className={
                      selected
                        ? "font-medium text-indigo-900"
                        : "font-medium text-slate-700"
                    }
                  >
                    {option.value}
                  </span>

                  {/* SELECTED ICON */}

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

            {/* PREVIOUS */}

            <button
              type="button"
              onClick={
                previousQuestion
              }
              disabled={
                currentQuestion ===
                  0 ||
                submitting
              }
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >

              <ChevronLeft
                size={18}
              />

              Previous

            </button>

            {/* NEXT / SUBMIT */}

            {currentQuestion <
            totalQuestions - 1 ? (

              <button
                type="button"
                onClick={
                  nextQuestion
                }
                disabled={
                  submitting
                }
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >

                Next

                <ChevronRight
                  size={18}
                />

              </button>

            ) : (

              <button
                type="button"
                onClick={() =>
                  submitAssessment(
                    false
                  )
                }
                disabled={
                  submitting
                }
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >

                {submitting ? (
                  <>
                    <Spinner />

                    Submitting...
                  </>
                ) : (
                  <>
                    <Send
                      size={18}
                    />

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
                    disabled={
                      submitting
                    }
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

          {/* LEGEND */}

          <div className="flex flex-wrap gap-4 mt-5 text-xs text-slate-500">

            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded bg-indigo-600" />

              Current

            </div>

            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded bg-green-100 border border-green-200" />

              Answered

            </div>

            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />

              Not Answered

            </div>

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