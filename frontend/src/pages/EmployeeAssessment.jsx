import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function EmployeeAssessment() {
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [timeLeft, setTimeLeft] = useState(30 * 60);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role") || "EMPLOYEE";
  const token = localStorage.getItem("token");

  // ============================================================
  // LOAD ASSESSMENT
  // ============================================================

  useEffect(() => {
    if (!token) {
      setError("You are not logged in. Please login again.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8080/api/employee/assessment/current", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Unable to load assessment. Status: ${response.status}`
          );
        }

        return response.json();
      })
      .then((data) => {
        console.log("Assessment:", data);

        setAssessment(data);

        if (data.durationMinutes) {
          setTimeLeft(data.durationMinutes * 60);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Assessment loading error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  // ============================================================
  // TIMER
  // ============================================================

  useEffect(() => {
    if (!assessment || submitting) {
      return;
    }

    if (timeLeft <= 0) {
      submitAssessment(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, assessment, submitting]);

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // ============================================================
  // SELECT ANSWER
  // ============================================================

  const selectAnswer = (questionId, answer) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  };

  // ============================================================
  // SUBMIT ASSESSMENT
  // ============================================================

  const submitAssessment = async (automaticSubmit = false) => {
    if (submitting) {
      return;
    }

    if (!automaticSubmit) {
      const confirmed = window.confirm(
        "Are you sure you want to submit the assessment?"
      );

      if (!confirmed) {
        return;
      }
    }

    setSubmitting(true);

    const formattedAnswers = Object.entries(answers).map(
      ([questionId, selectedAnswer]) => ({
        questionId: Number(questionId),
        selectedAnswer: selectedAnswer,
      })
    );

    try {
      const response = await fetch(
        "http://localhost:8080/api/employee/assessment/submit",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            assessmentId: assessment.assessmentId,
            answers: formattedAnswers,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || `Submission failed. Status: ${response.status}`
        );
      }

      const result = await response.json();

      console.log("Assessment result:", result);

      // Store latest result
      localStorage.setItem(
        "latestAssessmentResult",
        JSON.stringify(result)
      );

      // Go to result page
      navigate("/employee/assessment-result");
    } catch (err) {
      console.error("Submission error:", err);

      setError(err.message);

      setSubmitting(false);
    }
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar role={role} />

        <div className="flex-1">
          <Navbar title="Skill Assessment" />

          <div className="p-8">
            <div className="bg-white rounded-xl shadow p-10 text-center">
              <div className="text-xl font-semibold text-gray-700">
                Loading assessment...
              </div>

              <p className="text-gray-500 mt-2">
                Please wait while we prepare your assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR SCREEN
  // ============================================================

  if (error) {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar role={role} />

        <div className="flex-1">
          <Navbar title="Skill Assessment" />

          <div className="p-8">
            <div className="bg-white rounded-xl shadow p-8">

              <div className="text-red-600 text-lg font-semibold">
                Something went wrong
              </div>

              <p className="text-gray-600 mt-2">
                {error}
              </p>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={() => window.location.reload()}
                  className="bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700"
                >
                  Try Again
                </button>

                <button
                  onClick={() => navigate("/employee")}
                  className="border border-gray-300 px-5 py-3 rounded-lg hover:bg-gray-50"
                >
                  Back to Dashboard
                </button>

              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // NO ASSESSMENT
  // ============================================================

  if (!assessment || !assessment.questions?.length) {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar role={role} />

        <div className="flex-1">
          <Navbar title="Skill Assessment" />

          <div className="p-8">

            <div className="bg-white rounded-xl shadow p-8 text-center">

              <h2 className="text-xl font-bold text-gray-800">
                No Assessment Available
              </h2>

              <p className="text-gray-500 mt-2">
                There are currently no assessment questions available.
              </p>

              <button
                onClick={() => navigate("/employee")}
                className="mt-5 bg-indigo-600 text-white px-5 py-3 rounded-lg"
              >
                Back to Dashboard
              </button>

            </div>

          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // CURRENT QUESTION
  // ============================================================

  const question = assessment.questions[currentQuestion];

  const totalQuestions = assessment.questions.length;

  const answeredCount = Object.keys(answers).length;

  const progress =
    ((currentQuestion + 1) / totalQuestions) * 100;

  const selectedAnswer = answers[question.id];

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar role={role} />

      <div className="flex-1">

        <Navbar title="Skill Assessment" />

        <div className="p-8">

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="bg-white rounded-xl shadow p-6 mb-6">

            <div className="flex flex-col md:flex-row justify-between gap-5">

              <div>

                <h1 className="text-2xl font-bold text-gray-800">
                  {assessment.title}
                </h1>

                <p className="text-gray-500 mt-2">
                  {assessment.description}
                </p>

              </div>

              {/* TIMER */}

              <div className="text-right">

                <p className="text-sm text-gray-500">
                  Time Remaining
                </p>

                <div
                  className={`text-3xl font-bold ${
                    timeLeft <= 300
                      ? "text-red-600"
                      : "text-indigo-600"
                  }`}
                >
                  {formatTime(timeLeft)}
                </div>

              </div>

            </div>

            {/* PROGRESS */}

            <div className="mt-6">

              <div className="flex justify-between text-sm mb-2">

                <span className="text-gray-600">
                  Question {currentQuestion + 1} of{" "}
                  {totalQuestions}
                </span>

                <span className="text-gray-600">
                  {answeredCount} answered
                </span>

              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">

                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* QUESTION */}
          {/* ================================================= */}

          <div className="bg-white rounded-xl shadow p-8">

            {/* SKILL + DIFFICULTY */}

            <div className="flex justify-between items-center mb-6">

              <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
                {question.skillName}
              </span>

              {question.difficulty && (
                <span className="text-sm text-gray-500">
                  Difficulty:{" "}
                  <span className="font-medium">
                    {question.difficulty}
                  </span>
                </span>
              )}

            </div>

            {/* QUESTION */}

            <h2 className="text-xl font-semibold text-gray-800 leading-relaxed mb-8">
              {question.question}
            </h2>

            {/* OPTIONS */}

            <div className="space-y-4">

              {[
                ["A", question.optionA],
                ["B", question.optionB],
                ["C", question.optionC],
                ["D", question.optionD],
              ].map(([letter, text]) => {

                const selected = selectedAnswer === letter;

                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() =>
                      selectAnswer(question.id, letter)
                    }
                    className={`w-full text-left border-2 rounded-xl p-4 transition-all ${
                      selected
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 bg-white hover:border-indigo-400 hover:bg-gray-50"
                    }`}
                  >

                    <div className="flex items-center gap-4">

                      {/* OPTION LETTER */}

                      <div
                        className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold ${
                          selected
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {letter}
                      </div>

                      {/* OPTION TEXT */}

                      <span className="text-gray-700">
                        {text}
                      </span>

                    </div>

                  </button>
                );
              })}

            </div>

            {/* ================================================= */}
            {/* NAVIGATION */}
            {/* ================================================= */}

            <div className="flex justify-between items-center mt-10">

              {/* PREVIOUS */}

              <button
                type="button"
                disabled={currentQuestion === 0}
                onClick={() =>
                  setCurrentQuestion(
                    currentQuestion - 1
                  )
                }
                className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              {/* NEXT / SUBMIT */}

              {currentQuestion < totalQuestions - 1 ? (

                <button
                  type="button"
                  onClick={() =>
                    setCurrentQuestion(
                      currentQuestion + 1
                    )
                  }
                  className="px-7 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Next →
                </button>

              ) : (

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => submitAssessment(false)}
                  className="px-7 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Assessment"}
                </button>

              )}

            </div>

          </div>

          {/* ================================================= */}
          {/* QUESTION NAVIGATION */}
          {/* ================================================= */}

          <div className="bg-white rounded-xl shadow p-6 mt-6">

            <h3 className="font-semibold text-gray-800 mb-4">
              Questions
            </h3>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">

              {assessment.questions.map(
                (item, index) => {

                  const answered =
                    answers[item.id] !== undefined;

                  const active =
                    index === currentQuestion;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setCurrentQuestion(index)
                      }
                      className={`w-10 h-10 rounded-lg font-semibold text-sm ${
                        active
                          ? "bg-indigo-600 text-white"
                          : answered
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                }
              )}

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default EmployeeAssessment;