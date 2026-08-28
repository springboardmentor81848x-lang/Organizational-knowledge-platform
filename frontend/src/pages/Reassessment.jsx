import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Send,
  RotateCcw,
} from "lucide-react";

import api from "../services/api";

function Reassessment() {
  // =========================================================
  // STATE
  // =========================================================

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // =========================================================
  // EMPLOYEE IDENTIFIER
  // =========================================================

  const employeeId =
    localStorage.getItem("employeeId") ||
    localStorage.getItem("employeeIdentifier");

  // =========================================================
  // LOAD REASSESSMENT
  // =========================================================

  useEffect(() => {
    loadReassessment();
  }, []);

  const loadReassessment = async () => {
    try {
      setLoading(true);
      setError("");

      // -------------------------------------------------------
      // VALIDATE EMPLOYEE
      // -------------------------------------------------------

      if (!employeeId) {
        setError(
          "Employee ID was not found. Please login again."
        );
        return;
      }

      // -------------------------------------------------------
      // GET TARGET ROLE
      // -------------------------------------------------------

      const targetRoleId =
        localStorage.getItem("targetRoleId");

      const targetRole =
        localStorage.getItem("targetRole");

      if (!targetRoleId) {
        setError(
          "Target role was not found. Please login again."
        );
        return;
      }

      console.log("=================================");
      console.log("LOADING REASSESSMENT");
      console.log("Employee Identifier:", employeeId);
      console.log("Target Role ID:", targetRoleId);
      console.log("=================================");

      // =======================================================
      // GET ASSESSMENT FOR TARGET ROLE
      // =======================================================

      const assessmentResponse = await api.get(
        `/assessments/role/${targetRoleId}`
      );

      let selectedAssessment = assessmentResponse.data;

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
          `No reassessment is available for ${
            targetRole || "your role"
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

      // -------------------------------------------------------
      // Check assessment active
      // -------------------------------------------------------

      if (selectedAssessment.active === false) {
        setError(
          "This assessment is currently inactive."
        );
        return;
      }

      console.log(
        "Selected Assessment:",
        selectedAssessment
      );

      // =======================================================
      // GET REASSESSMENT QUESTIONS
      // =======================================================
      //
      // IMPORTANT:
      //
      // Use the ReassessmentController endpoint:
      //
      // GET
      // /api/employee/reassessment/{assessmentId}/questions
      //
      // This matches the updated backend controller.
      //
      // =======================================================

      const questionsResponse = await api.get(
        `/employee/reassessment/${selectedAssessment.id}/questions`
      );

      const questions = Array.isArray(
        questionsResponse.data
      )
        ? questionsResponse.data
        : [];

      if (questions.length === 0) {
        setError(
          "No reassessment questions are available."
        );
        return;
      }

      console.log(
        "Reassessment Questions Loaded:",
        questions.length
      );

      // =======================================================
      // STORE ASSESSMENT
      // =======================================================

      const assessmentData = {
        ...selectedAssessment,

        id: selectedAssessment.id,

        assessmentId: selectedAssessment.id,

        targetRoleId: Number(targetRoleId),

        targetRole: targetRole,

        questions: questions,
      };

      setAssessment(assessmentData);

      // =======================================================
      // STORE ASSESSMENT ID
      // =======================================================

      sessionStorage.setItem(
        "reassessmentAssessmentId",
        String(selectedAssessment.id)
      );

      // =======================================================
      // RESET ANSWERS
      // =======================================================

      setAnswers({});
      setCurrentQuestion(0);
      setResult(null);

      // =======================================================
      // TIMER
      // =======================================================

      const duration = Number(
        selectedAssessment.durationMinutes
      );

      if (duration > 0) {
        setTimeLeft(duration * 60);
      } else {
        setTimeLeft(null);
      }

      console.log(
        "Reassessment loaded successfully:",
        assessmentData
      );
    } catch (err) {
      console.error(
        "================================="
      );

      console.error(
        "ERROR LOADING REASSESSMENT"
      );

      console.error("Axios error:", err);

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
          (typeof err.response?.data === "string"
            ? err.response.data
            : null) ||
          `Unable to load reassessment. Status: ${
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
      submitting ||
      result
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
  }, [
    timeLeft,
    submitting,
    result,
  ]);

  // =========================================================
  // AUTO SUBMIT WHEN TIME EXPIRES
  // =========================================================

  useEffect(() => {
    if (
      timeLeft === 0 &&
      assessment &&
      !submitting &&
      !result
    ) {
      handleTimeExpired();
    }
  }, [
    timeLeft,
    assessment,
    submitting,
    result,
  ]);

  // =========================================================
  // TIME EXPIRED
  // =========================================================

  const handleTimeExpired = async () => {
    const unanswered =
      assessment?.questions?.filter(
        (question) =>
          !answers[question.id]
      ) || [];

    if (unanswered.length > 0) {
      setError(
        `Time expired. You still have ${unanswered.length} unanswered question(s). Please answer all questions before submission.`
      );
      return;
    }

    await submitReassessment(true);
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
      assessment.questions[
        currentQuestion
      ];

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
  // SUBMIT REASSESSMENT
  // =========================================================

  const submitReassessment = async (
    autoSubmit = false
  ) => {
    if (submitting) {
      return;
    }

    // -------------------------------------------------------
    // VALIDATE QUESTIONS
    // -------------------------------------------------------

    if (
      !assessment?.questions?.length
    ) {
      setError(
        "Reassessment questions are not available."
      );

      return;
    }

    // -------------------------------------------------------
    // FIND UNANSWERED QUESTIONS
    // -------------------------------------------------------

    const unanswered =
      assessment.questions.filter(
        (question) =>
          !answers[question.id]
      );

    // =======================================================
    // IMPORTANT
    // =======================================================
    //
    // Your backend service explicitly checks that ALL
    // questions are answered.
    //
    // Therefore do not send a partial reassessment.
    //
    // =======================================================

    if (unanswered.length > 0) {
      setError(
        `Please answer all questions before submitting. ${unanswered.length} question(s) remaining.`
      );

      // Go to first unanswered question
      const firstUnansweredIndex =
        assessment.questions.findIndex(
          (question) =>
            !answers[question.id]
        );

      if (
        firstUnansweredIndex >= 0
      ) {
        setCurrentQuestion(
          firstUnansweredIndex
        );

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }

      return;
    }

    // -------------------------------------------------------
    // CONFIRM SUBMISSION
    // -------------------------------------------------------

    if (!autoSubmit) {
      const shouldSubmit =
        window.confirm(
          "Are you sure you want to submit your reassessment?"
        );

      if (!shouldSubmit) {
        return;
      }
    }

    // -------------------------------------------------------
    // VALIDATE EMPLOYEE
    // -------------------------------------------------------

    if (!employeeId) {
      setError(
        "Employee ID was not found. Please login again."
      );

      return;
    }

    // -------------------------------------------------------
    // GET ASSESSMENT ID
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

    try {
      setSubmitting(true);
      setError("");

      // =====================================================
      // PREPARE ANSWERS
      // =====================================================

      const submittedAnswers =
        assessment.questions.map(
          (question) => ({
            questionId: question.id,

            selectedAnswer:
              answers[question.id],
          })
        );

      // =====================================================
      // BACKEND PAYLOAD
      // =====================================================
      //
      // ReassessmentRequest:
      //
      // assessmentId
      // employeeIdentifier
      // answers
      //
      // =====================================================

      const payload = {
        assessmentId: Number(
          assessmentId
        ),

        employeeIdentifier:
          employeeId,

        answers: submittedAnswers,
      };

      // =====================================================
      // SUBMIT URL
      // =====================================================
      //
      // Backend:
      //
      // @PostMapping("/submit/{employeeIdentifier}")
      //
      // =====================================================

      const submitUrl =
        `/employee/reassessment/submit/${encodeURIComponent(
          employeeId
        )}`;

      console.log(
        "================================="
      );

      console.log(
        "SUBMITTING REASSESSMENT"
      );

      console.log(
        "Submit URL:",
        submitUrl
      );

      console.log(
        "Employee Identifier:",
        employeeId
      );

      console.log(
        "Assessment ID:",
        assessmentId
      );

      console.log(
        "Payload:",
        payload
      );

      console.log(
        "Answers:",
        submittedAnswers
      );

      console.log(
        "================================="
      );

      // =====================================================
      // SUBMIT TO BACKEND
      // =====================================================

      const response =
        await api.post(
          submitUrl,
          payload
        );

      // =====================================================
      // SUCCESS
      // =====================================================

      console.log(
        "================================="
      );

      console.log(
        "REASSESSMENT SUBMITTED SUCCESSFULLY"
      );

      console.log(
        "Response:",
        response.data
      );

      console.log(
        "================================="
      );

      // =====================================================
      // STORE RESULT
      // =====================================================

      sessionStorage.setItem(
        "reassessmentResult",
        JSON.stringify(
          response.data
        )
      );

      sessionStorage.removeItem(
        "reassessmentAssessmentId"
      );

      // =====================================================
      // SHOW RESULT
      // =====================================================

      setResult(response.data);

      setTimeLeft(null);
    } catch (err) {
      console.error(
        "================================="
      );

      console.error(
        "REASSESSMENT SUBMISSION FAILED"
      );

      console.error(
        "Axios error:",
        err
      );

      console.error(
        "Request URL:",
        err.config?.url
      );

      console.error(
        "Request method:",
        err.config?.method
      );

      console.error(
        "Request data:",
        err.config?.data
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
          `Unable to submit reassessment. Status: ${
            err.response?.status ||
            "Unknown"
          }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="EMPLOYEE" />

        <div className="flex-1">
          <Navbar title="Reassessment" />

          <div className="flex items-center justify-center p-8 min-h-[80vh]">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

              <p className="text-slate-500">
                Loading your reassessment...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR SCREEN
  // =========================================================

  if (error && !assessment) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="EMPLOYEE" />

        <div className="flex-1">
          <Navbar title="Reassessment" />

          <div className="flex items-center justify-center p-8 min-h-[80vh]">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
              <AlertCircle
                size={45}
                className="text-red-500 mx-auto mb-4"
              />

              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Reassessment Unavailable
              </h2>

              <p className="text-slate-500 mb-6">
                {error}
              </p>

              <button
                onClick={loadReassessment}
                className="flex items-center justify-center gap-2 mx-auto px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <RotateCcw size={18} />

                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RESULT SCREEN
  // =========================================================

  if (result) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="EMPLOYEE" />

        <div className="flex-1">
          <Navbar title="Reassessment Result" />

          <main className="p-8">
            <div className="max-w-5xl mx-auto">

              {/* SUCCESS HEADER */}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center mb-6">
                <CheckCircle
                  size={60}
                  className="text-green-500 mx-auto mb-4"
                />

                <h1 className="text-3xl font-bold text-slate-800">
                  Reassessment Completed
                </h1>

                <p className="text-slate-500 mt-2">
                  Your reassessment has been evaluated successfully.
                </p>
              </div>

              {/* OVERALL SCORE */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-500">
                    Overall Score
                  </p>

                  <p className="text-4xl font-bold text-indigo-600 mt-2">
                    {Number(
                      result.overallScore || 0
                    ).toFixed(1)}
                    %
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-500">
                    Performance Level
                  </p>

                  <p className="text-3xl font-bold text-green-600 mt-3">
                    {result.performanceLevel ||
                      "Calculated"}
                  </p>
                </div>

              </div>

              {/* ANSWER SUMMARY */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-500">
                    Correct Answers
                  </p>

                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {result.correctAnswers || 0}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-500">
                    Total Questions
                  </p>

                  <p className="text-3xl font-bold text-slate-700 mt-2">
                    {result.totalQuestions ||
                      0}
                  </p>
                </div>

              </div>

              {/* SKILL RESULTS */}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

                <h2 className="text-xl font-bold text-slate-800 mb-5">
                  Skill Improvement
                </h2>

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>
                      <tr className="border-b border-slate-200">

                        <th className="text-left py-3 px-3 text-sm font-semibold text-slate-600">
                          Skill
                        </th>

                        <th className="text-center py-3 px-3 text-sm font-semibold text-slate-600">
                          Previous
                        </th>

                        <th className="text-center py-3 px-3 text-sm font-semibold text-slate-600">
                          Current
                        </th>

                        <th className="text-center py-3 px-3 text-sm font-semibold text-slate-600">
                          Improvement
                        </th>

                        <th className="text-center py-3 px-3 text-sm font-semibold text-slate-600">
                          Score
                        </th>

                        <th className="text-center py-3 px-3 text-sm font-semibold text-slate-600">
                          Remaining Gap
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {(result.skillResults || []).map(
                        (skill, index) => {

                          const improvement =
                            Number(
                              skill.improvement || 0
                            );

                          const remainingGap =
                            Number(
                              skill.remainingGap || 0
                            );

                          return (
                            <tr
                              key={
                                skill.skillName ||
                                index
                              }
                              className="border-b border-slate-100"
                            >

                              {/* SKILL */}

                              <td className="py-4 px-3 font-semibold text-slate-800">
                                {skill.skillName}
                              </td>

                              {/* PREVIOUS */}

                              <td className="py-4 px-3 text-center">
                                <span className="font-medium text-slate-700">
                                  {skill.previousLevelName ||
                                    skill.previousLevel}
                                </span>
                              </td>

                              {/* CURRENT */}

                              <td className="py-4 px-3 text-center">
                                <span className="font-semibold text-indigo-600">
                                  {skill.currentLevelName ||
                                    skill.currentLevel}
                                </span>
                              </td>

                              {/* IMPROVEMENT */}

                              <td className="py-4 px-3 text-center">
                                <span
                                  className={
                                    improvement > 0
                                      ? "font-bold text-green-600"
                                      : improvement < 0
                                      ? "font-bold text-red-600"
                                      : "font-medium text-slate-500"
                                  }
                                >
                                  {improvement > 0
                                    ? "+"
                                    : ""}
                                  {improvement}
                                </span>
                              </td>

                              {/* SCORE */}

                              <td className="py-4 px-3 text-center">
                                <span className="font-semibold text-slate-700">
                                  {skill.actualScore ??
                                    0}
                                  %
                                </span>
                              </td>

                              {/* GAP */}

                              <td className="py-4 px-3 text-center">
                                <span
                                  className={
                                    remainingGap ===
                                    0
                                      ? "px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold"
                                      : "px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold"
                                  }
                                >
                                  {remainingGap}{" "}
                                  {remainingGap ===
                                  1
                                    ? "level"
                                    : "levels"}
                                </span>
                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

                {/* NEXT STEP */}

                <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-5">

                  <p className="font-semibold text-indigo-800">
                    Your skill profile has been updated.
                  </p>

                  <p className="text-sm text-indigo-600 mt-1">
                    Your knowledge gaps have been automatically recalculated using your latest reassessment results.
                  </p>

                </div>

              </div>

            </div>
          </main>
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
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="EMPLOYEE" />

        <div className="flex-1">
          <Navbar title="Reassessment" />

          <div className="flex items-center justify-center min-h-[80vh]">

            <div className="text-center">

              <AlertCircle
                size={45}
                className="text-orange-500 mx-auto mb-4"
              />

              <h2 className="text-xl font-bold text-slate-800">
                No Reassessment Available
              </h2>

            </div>

          </div>
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

  const unansweredQuestions =
    totalQuestions -
    answeredQuestions;

  const progress =
    totalQuestions > 0
      ? (answeredQuestions /
          totalQuestions) *
        100
      : 0;

  // =========================================================
  // OPTIONS
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
    <div className="flex min-h-screen bg-slate-50">

      {/* SIDEBAR */}

      <Sidebar role="EMPLOYEE" />

      {/* MAIN */}

      <div className="flex-1 min-w-0">

        <Navbar title="Reassessment" />

        <main className="p-5 md:p-8">

          <div className="max-w-5xl mx-auto">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <div>

                  <div className="flex flex-wrap items-center gap-2 mb-2">

                    <span className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                      REASSESSMENT
                    </span>

                    {assessment.targetRole && (
                      <span className="px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                        {assessment.targetRole}
                      </span>
                    )}

                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                    {assessment.title}
                  </h1>

                  <p className="text-slate-500 mt-2">
                    Reassessment after training completion
                  </p>

                </div>

                {/* TIMER */}

                <div
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-lg ${
                    timeLeft !== null &&
                    timeLeft <= 300
                      ? "bg-red-100 text-red-600"
                      : "bg-indigo-100 text-indigo-600"
                  }`}
                >

                  <Clock size={22} />

                  {formatTime(timeLeft)}

                </div>

              </div>

            </div>

            {/* =================================================
                INSTRUCTIONS
            ================================================= */}

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 mb-6">

              <p className="font-semibold text-purple-800">
                Reassessment Instructions
              </p>

              <ul className="text-sm text-purple-700 mt-2 space-y-1">

                <li>
                  • This reassessment uses the same questions from your original skill assessment.
                </li>

                <li>
                  • Answer every question based on your current knowledge after training.
                </li>

                <li>
                  • Your answers will be evaluated automatically.
                </li>

                <li>
                  • Your skill proficiency will be updated from your reassessment score.
                </li>

                <li>
                  • Knowledge gaps will be automatically recalculated after submission.
                </li>

              </ul>

            </div>

            {/* =================================================
                PROGRESS
            ================================================= */}

            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">

                <span className="font-medium text-slate-700">

                  Question{" "}
                  {currentQuestion + 1}
                  {" "}
                  of{" "}
                  {totalQuestions}

                </span>

                <span className="text-sm text-slate-500">

                  {answeredQuestions} answered

                </span>

              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

              {unansweredQuestions > 0 && (
                <p className="text-xs text-orange-600 mt-2">
                  {unansweredQuestions} question
                  {unansweredQuestions !== 1
                    ? "s"
                    : ""}{" "}
                  remaining
                </p>
              )}

            </div>

            {/* =================================================
                QUESTION CARD
            ================================================= */}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">

              {/* QUESTION INFO */}

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

              {/* OPTIONS */}

              <div className="space-y-4">

                {options.map((option) => {

                  if (
                    option.value === null ||
                    option.value === undefined ||
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
                          ? "w-full flex items-center gap-4 p-4 text-left rounded-xl border-2 border-purple-600 bg-purple-50 transition"
                          : "w-full flex items-center gap-4 p-4 text-left rounded-xl border-2 border-slate-200 hover:border-purple-300 hover:bg-slate-50 transition disabled:opacity-60"
                      }
                    >

                      <div
                        className={
                          selected
                            ? "w-10 h-10 shrink-0 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold"
                            : "w-10 h-10 shrink-0 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold"
                        }
                      >
                        {option.key}
                      </div>

                      <span
                        className={
                          selected
                            ? "font-medium text-purple-900"
                            : "font-medium text-slate-700"
                        }
                      >
                        {option.value}
                      </span>

                      {selected && (
                        <CheckCircle
                          size={22}
                          className="ml-auto text-purple-600"
                        />
                      )}

                    </button>
                  );
                })}

              </div>

              {/* ERROR */}

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
                    currentQuestion === 0 ||
                    submitting
                  }
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >

                  <ChevronLeft size={18} />

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
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
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
                      submitReassessment(
                        false
                      )
                    }
                    disabled={
                      submitting ||
                      unansweredQuestions > 0
                    }
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >

                    {submitting ? (
                      <>
                        <Spinner />

                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />

                        Submit Reassessment
                      </>
                    )}

                  </button>

                )}

              </div>

            </div>

            {/* =================================================
                QUESTION NAVIGATOR
            ================================================= */}

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
                        onClick={() => {
                          setCurrentQuestion(
                            index
                          );

                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }}
                        className={
                          active
                            ? "w-10 h-10 rounded-lg bg-purple-600 text-white font-semibold"
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

                  <span className="w-3 h-3 rounded bg-purple-600" />

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

          </div>

        </main>

      </div>

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

export default Reassessment;