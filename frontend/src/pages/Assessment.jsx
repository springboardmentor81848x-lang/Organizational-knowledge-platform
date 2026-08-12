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
  // Load Assessment
  // =========================================================

  useEffect(() => {
    loadAssessment();
  }, []);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/employee/assessment/current"
      );

      console.log("Assessment:", response.data);

      setAssessment(response.data);

      // durationMinutes comes from your backend
      if (response.data.durationMinutes) {
        setTimeLeft(
          response.data.durationMinutes * 60
        );
      }
    } catch (err) {
      console.error(
        "Error loading assessment:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load assessment."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // Timer
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

          // Automatically submit when time expires
          submitAssessment(true);

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting]);

  // =========================================================
  // Format Time
  // =========================================================

  const formatTime = (seconds) => {
    if (seconds === null) {
      return "--:--";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // =========================================================
  // Select Answer
  // =========================================================

  const selectAnswer = (answer) => {
    const question =
      assessment.questions[currentQuestion];

    setAnswers((previous) => ({
      ...previous,
      [question.id]: answer,
    }));
  };

  // =========================================================
  // Next Question
  // =========================================================

  const nextQuestion = () => {
    if (
      currentQuestion <
      assessment.questions.length - 1
    ) {
      setCurrentQuestion(
        currentQuestion + 1
      );
    }
  };

  // =========================================================
  // Previous Question
  // =========================================================

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        currentQuestion - 1
      );
    }
  };

  // =========================================================
  // Submit Assessment
  // =========================================================

  const submitAssessment = async (
    automatic = false
  ) => {
    if (submitting) {
      return;
    }

    if (!automatic) {
      const unanswered =
        assessment.questions.filter(
          (question) =>
            !answers[question.id]
        );

      if (unanswered.length > 0) {
        const confirmSubmit = window.confirm(
          `You have ${unanswered.length} unanswered question(s). Do you want to submit anyway?`
        );

        if (!confirmSubmit) {
          return;
        }
      } else {
        const confirmSubmit = window.confirm(
          "Are you sure you want to submit the assessment?"
        );

        if (!confirmSubmit) {
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      setError("");

      const submittedAnswers =
        assessment.questions.map(
          (question) => ({
            questionId: question.id,
            selectedAnswer:
              answers[question.id] || null,
          })
        );

      const payload = {
        assessmentId:
          assessment.assessmentId,

        answers: submittedAnswers,
      };

      console.log(
        "Submitting assessment:",
        payload
      );

      const response = await api.post(
        "/employee/assessment/submit",
        payload
      );

      console.log(
        "Assessment Result:",
        response.data
      );

      // Store result temporarily so the result page
      // can display it immediately.
      sessionStorage.setItem(
        "assessmentResult",
        JSON.stringify(response.data)
      );

      navigate("/employee/assessment/result");

    } catch (err) {
      console.error(
        "Error submitting assessment:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to submit assessment. Please try again."
      );

      setSubmitting(false);
    }
  };

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

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
  // Error
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
            onClick={() =>
              navigate("/employee")
            }
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>

        </div>

      </div>
    );
  }

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

          <button
            onClick={() =>
              navigate("/employee")
            }
            className="mt-5 px-5 py-2.5 bg-indigo-600 text-white rounded-lg"
          >
            Back to Dashboard
          </button>

        </div>

      </div>
    );
  }

  // =========================================================
  // Current Question
  // =========================================================

  const question =
    assessment.questions[currentQuestion];

  const selectedAnswer =
    answers[question.id];

  const totalQuestions =
    assessment.questions.length;

  const progress =
    ((currentQuestion + 1) /
      totalQuestions) *
    100;

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
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">

        <div className="max-w-6xl mx-auto px-5 md:px-8 py-4">

          <div className="flex items-center justify-between gap-4">

            <div>

              <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                {assessment.title}
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Skill Assessment
              </p>

            </div>

            {/* Timer */}

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


      {/* Main */}

      <main className="max-w-5xl mx-auto px-5 md:px-8 py-8">

        {/* Assessment Description */}

        {assessment.description && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">

            <p className="text-slate-600">
              {assessment.description}
            </p>

          </div>
        )}


        {/* Progress */}

        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">

          <div className="flex justify-between items-center mb-3">

            <span className="font-medium text-slate-700">
              Question{" "}
              {currentQuestion + 1} of{" "}
              {totalQuestions}
            </span>

            <span className="text-sm text-slate-500">
              {Math.round(progress)}% completed
            </span>

          </div>

          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

            <div
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>


        {/* Question Card */}

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

            {question.marks && (
              <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                {question.marks} mark
                {question.marks > 1
                  ? "s"
                  : ""}
              </span>
            )}

          </div>


          {/* Question */}

          <h2 className="text-xl md:text-2xl font-semibold text-slate-800 leading-relaxed mb-8">
            {question.question}
          </h2>


          {/* Options */}

          <div className="space-y-4">

            {options.map((option) => {

              if (!option.value) {
                return null;
              }

              const selected =
                selectedAnswer ===
                option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() =>
                    selectAnswer(option.key)
                  }
                  className={
                    selected
                      ? "w-full flex items-center gap-4 p-4 text-left rounded-xl border-2 border-indigo-600 bg-indigo-50 transition"
                      : "w-full flex items-center gap-4 p-4 text-left rounded-xl border-2 border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition"
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


          {/* Error */}

          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}


          {/* Navigation */}

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-10">

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
                onClick={() =>
                  submitAssessment(false)
                }
                disabled={submitting}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >

                {submitting ? (
                  <>
                    <RefreshSpinner />
                    Submitting...
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


        {/* Question Navigator */}

        <div className="bg-white rounded-xl border border-slate-200 p-5 mt-6">

          <h3 className="font-semibold text-slate-800 mb-4">
            Questions
          </h3>

          <div className="flex flex-wrap gap-2">

            {assessment.questions.map(
              (item, index) => {

                const answered =
                  answers[item.id];

                const active =
                  currentQuestion === index;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setCurrentQuestion(
                        index
                      )
                    }
                    className={
                      active
                        ? "w-10 h-10 rounded-lg bg-indigo-600 text-white font-semibold"
                        : answered
                        ? "w-10 h-10 rounded-lg bg-green-100 text-green-700 font-semibold"
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
// Spinner
// =============================================================

function RefreshSpinner() {
  return (
    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
  );
}

export default Assessment;