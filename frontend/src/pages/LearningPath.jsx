import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  getAIRecommendation,
  askAIQuestion,
} from "../services/platformService";

function LearningPath() {

  const [recommendation, setRecommendation] = useState("");

  // Ask AI states
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");

  // Logged-in employee details
  const employeeId =
    localStorage.getItem("employeeId");

  const role =
    localStorage.getItem("role");

  const designation =
    localStorage.getItem("designation") ||
    "Software Engineer";


  // =========================================================
  // LOAD PAGE
  // =========================================================

  useEffect(() => {

    if (!employeeId) {

      setError(
        "Employee ID not found. Please login again."
      );

    }

  }, [employeeId]);


  // =========================================================
  // GENERATE AI LEARNING PATH
  // =========================================================

  const generateLearningPath = async () => {

    try {

      setLoading(true);
      setError("");
      setRecommendation("");

      /*
       * IMPORTANT
       *
       * Knowledge Gap and Skill Inventory are no longer
       * loaded on this page.
       *
       * The AI recommendation should use the persisted
       * assessment results from the backend.
       *
       * Until the backend AI endpoint is changed to directly
       * retrieve the employee's assessment results, we pass
       * empty arrays here.
       */

      const currentSkills = [];

      const missingSkills = [];

      /*
       * Score should eventually come from the latest
       * AssessmentAttempt stored in the database.
       *
       * For now, the backend should preferably calculate
       * this using the employee's latest assessment.
       */

      const score = 0;


      console.log(
        "Generating AI Learning Path:",
        {
          employeeId,
          role: designation,
        }
      );


      const response =
        await getAIRecommendation(
          designation,
          currentSkills,
          missingSkills,
          score
        );


      setRecommendation(
        response.data
      );


    } catch (err) {

      console.error(
        "AI Recommendation Error:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );


      setError(
        "Unable to generate learning path. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // ASK AI QUESTION
  // =========================================================

  const handleAskQuestion = async () => {

    if (!question.trim()) {
      return;
    }

    try {

      setQuestionLoading(true);
      setAnswer("");
      setError("");


      const response =
        await askAIQuestion(
          question,
          recommendation
        );


      setAnswer(
        response.data
      );


    } catch (err) {

      console.error(
        "AI Question Error:",
        err
      );


      setError(
        "Unable to get an answer from AI. Please try again."
      );


    } finally {

      setQuestionLoading(false);

    }

  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="flex min-h-screen">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role={role}
      />


      <div className="flex-1">

        <Navbar
          title="AI Learning Path"
        />


        <main className="p-8">


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="bg-white rounded-xl shadow p-6">

            <h1 className="text-3xl font-bold text-slate-800">

              AI Learning Path

            </h1>


            <p className="mt-2 text-slate-600">

              Get a personalized learning path based on
              your latest skill assessment results.

            </p>


            <p className="mt-4 text-sm text-gray-500">

              Target Role:{" "}

              <span className="font-semibold">

                {designation}

              </span>

            </p>


            <button
              onClick={generateLearningPath}
              disabled={
                loading ||
                dataLoading ||
                !employeeId
              }
              className="
                mt-6
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-6
                py-3
                rounded-lg
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >

              {loading
                ? "Generating..."
                : "Generate Learning Path"}

            </button>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div
              className="
                mt-6
                bg-red-100
                text-red-700
                p-4
                rounded-lg
              "
            >

              {error}

            </div>

          )}


          {/* =================================================
              LOADING
          ================================================= */}

          {dataLoading && (

            <div
              className="
                mt-6
                bg-white
                rounded-xl
                shadow
                p-6
              "
            >

              <p className="text-gray-600">

                Loading your assessment data...

              </p>

            </div>

          )}


          {/* =================================================
              ASSESSMENT INFORMATION
          ================================================= */}

          {!dataLoading && (

            <div
              className="
                mt-8
                bg-white
                rounded-xl
                shadow
                p-6
              "
            >

              <h2
                className="
                  text-xl
                  font-semibold
                  text-slate-800
                "
              >

                Personalized Learning

              </h2>


              <p
                className="
                  mt-2
                  text-gray-600
                "
              >

                Your learning path will be generated
                according to your latest assessment
                performance and identified skill gaps.

              </p>


              <div
                className="
                  mt-5
                  border
                  rounded-lg
                  p-4
                  bg-slate-50
                "
              >

                <p className="text-sm text-gray-500">

                  Target Role

                </p>


                <p
                  className="
                    mt-1
                    font-semibold
                    text-slate-800
                  "
                >

                  {designation}

                </p>

              </div>

            </div>

          )}


          {/* =================================================
              AI RECOMMENDATION
          ================================================= */}

          {recommendation && (

            <div
              className="
                mt-8
                bg-white
                rounded-xl
                shadow
                p-6
              "
            >

              <div
                className="
                  flex
                  justify-between
                  items-center
                  mb-5
                "
              >

                <h2
                  className="
                    text-2xl
                    font-bold
                    text-slate-800
                  "
                >

                  Your AI Learning Path

                </h2>


                <span
                  className="
                    bg-indigo-100
                    text-indigo-700
                    px-4
                    py-2
                    rounded-full
                    text-sm
                  "
                >

                  AI Generated

                </span>

              </div>


              <div
                className="
                  bg-slate-50
                  border
                  rounded-xl
                  p-6
                "
              >

                <div
                  className="
                    whitespace-pre-line
                    text-slate-700
                    leading-7
                  "
                >

                  {recommendation}

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              ASK AI
          ================================================= */}

          <div
            className="
              mt-8
              bg-white
              rounded-xl
              shadow
              p-6
            "
          >

            <h2
              className="
                text-2xl
                font-bold
                text-slate-800
              "
            >

              Ask AI

            </h2>


            <p
              className="
                mt-2
                text-slate-600
              "
            >

              Ask questions about your learning path,
              skills, technologies, or recommended topics.

            </p>


            <div
              className="
                flex
                gap-3
                mt-5
              "
            >

              <input
                type="text"
                value={question}
                onChange={(e) =>
                  setQuestion(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (e.key === "Enter") {

                    handleAskQuestion();

                  }

                }}
                placeholder="
                  Ask something like:
                  Which skill should I focus on first?
                "
                className="
                  flex-1
                  border
                  border-gray-300
                  rounded-lg
                  px-4
                  py-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />


              <button
                onClick={
                  handleAskQuestion
                }
                disabled={
                  questionLoading ||
                  !question.trim()
                }
                className="
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  px-6
                  py-3
                  rounded-lg
                  disabled:opacity-50
                "
              >

                {questionLoading
                  ? "Asking..."
                  : "Ask AI"}

              </button>

            </div>


            {/* =================================================
                AI ANSWER
            ================================================= */}

            {answer && (

              <div
                className="
                  mt-6
                  border
                  rounded-xl
                  p-6
                  bg-slate-50
                "
              >

                <h3
                  className="
                    font-semibold
                    text-lg
                    text-slate-800
                    mb-3
                  "
                >

                  AI Answer

                </h3>


                <div
                  className="
                    whitespace-pre-line
                    text-slate-700
                    leading-7
                  "
                >

                  {answer}

                </div>

              </div>

            )}

          </div>

        </main>

      </div>

    </div>

  );

}

export default LearningPath;