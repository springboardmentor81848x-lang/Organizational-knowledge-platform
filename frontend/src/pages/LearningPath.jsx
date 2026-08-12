import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  getEmployeeSkills,
  detectGaps,
  getAIRecommendation,
  askAIQuestion,
} from "../services/platformService";

function LearningPath() {
  const [currentSkills, setCurrentSkills] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [recommendation, setRecommendation] = useState("");

  // Ask AI states
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  // Logged-in employee details
  const employeeId = localStorage.getItem("employeeId");
  const role = localStorage.getItem("role");

  const designation =
    localStorage.getItem("designation") || "Software Engineer";

  // Skill level names
  const levelNames = {
    1: "Beginner",
    2: "Intermediate",
    3: "Competent",
    4: "Advanced",
    5: "Expert",
  };

  useEffect(() => {
    loadData();
  }, []);

  // Load employee skills and knowledge gaps
  const loadData = async () => {
    try {
      setDataLoading(true);
      setError("");

      if (!employeeId) {
        setError("Employee ID not found. Please login again.");
        return;
      }

      // Get current employee skills
      const skillResponse = await getEmployeeSkills(employeeId);

      setCurrentSkills(skillResponse.data || []);

      // Detect knowledge gaps
      const gapResponse = await detectGaps(employeeId);

      setGaps(gapResponse.data || []);

    } catch (err) {
      console.error("Error loading learning data:", err);

      setError(
        "Unable to load your skills and knowledge gaps."
      );
    } finally {
      setDataLoading(false);
    }
  };

  // Generate AI Learning Path
  const generateLearningPath = async () => {
    try {
      setLoading(true);
      setError("");
      setRecommendation("");

      // Get current skill names
      const currentSkillNames = currentSkills
        .map((item) => item.skill?.skillName)
        .filter(Boolean);

      // Get missing skill names
      const missingSkillNames = gaps
        .map(
          (gap) =>
            gap.skill?.skillName ||
            gap.skill ||
            gap.skillName
        )
        .filter(Boolean);

      // Calculate skill score
      let score = 0;

      if (currentSkills.length > 0) {
        const totalLevel = currentSkills.reduce(
          (total, item) =>
            total + (item.currentLevel || 0),
          0
        );

        const averageLevel =
          totalLevel / currentSkills.length;

        // Convert level 1-5 to percentage
        score = Math.round((averageLevel / 5) * 100);
      }

      console.log("AI Request:", {
        role: designation,
        currentSkills: currentSkillNames,
        missingSkills: missingSkillNames,
        score,
      });

      // Call AI backend
      const response = await getAIRecommendation(
        designation,
        currentSkillNames,
        missingSkillNames,
        score
      );

      setRecommendation(response.data);

    } catch (err) {
      console.error("AI Recommendation Error:", err);

      setError(
        "Unable to generate learning path. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Ask AI Question
  const handleAskQuestion = async () => {
    if (!question.trim()) {
      return;
    }

    try {
      setQuestionLoading(true);
      setAnswer("");
      setError("");

      const response = await askAIQuestion(
        question,
        recommendation
      );

      setAnswer(response.data);

    } catch (err) {
      console.error("AI Question Error:", err);

      setError(
        "Unable to get an answer from AI. Please try again."
      );
    } finally {
      setQuestionLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">

      {/* IMPORTANT: Pass logged-in user's role */}
      <Sidebar role={role} />

      <div className="flex-1">

        <Navbar title="AI Learning Path" />

        <main className="p-8">

          {/* Header */}
          <div className="bg-white rounded-xl shadow p-6">

            <h1 className="text-3xl font-bold text-slate-800">
              AI Learning Path
            </h1>

            <p className="mt-2 text-slate-600">
              Get a personalized learning path based on
              your skills and knowledge gaps.
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Designation:{" "}
              <span className="font-semibold">
                {designation}
              </span>
            </p>

            <button
              onClick={generateLearningPath}
              disabled={
                loading ||
                dataLoading ||
                currentSkills.length === 0
              }
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Generating..."
                : "Generate Learning Path"}
            </button>

          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 bg-red-100 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading */}
          {dataLoading && (
            <div className="mt-6 bg-white rounded-xl shadow p-6">
              <p className="text-gray-600">
                Loading your skills and knowledge gaps...
              </p>
            </div>
          )}

          {/* Skills and Gaps */}
          {!dataLoading && (
            <div className="grid md:grid-cols-2 gap-6 mt-8">

              {/* Current Skills */}
              <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-xl font-semibold mb-4">
                  Current Skills
                </h2>

                {currentSkills.length === 0 ? (
                  <p className="text-gray-500">
                    No skills found.
                  </p>
                ) : (
                  <div className="space-y-3">

                    {currentSkills.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="border rounded-lg p-3"
                      >

                        <div className="flex justify-between">

                          <span className="font-medium">
                            {item.skill?.skillName ||
                              "Unknown Skill"}
                          </span>

                          <span className="text-sm text-gray-500">
                            {levelNames[item.currentLevel] ||
                              `Level ${item.currentLevel}`}
                          </span>

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </div>

              {/* Knowledge Gaps */}
              <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-xl font-semibold mb-4">
                  Knowledge Gaps
                </h2>

                {gaps.length === 0 ? (
                  <p className="text-green-600">
                    No knowledge gaps detected.
                  </p>
                ) : (
                  <div className="space-y-3">

                    {gaps.map((gap, index) => {

                      const skillName =
                        gap.skill?.skillName ||
                        gap.skill ||
                        gap.skillName ||
                        "Unknown Skill";

                      return (
                        <div
                          key={gap.id || index}
                          className="border border-red-200 bg-red-50 rounded-lg p-3"
                        >

                          <div className="flex justify-between">

                            <span className="font-medium">
                              {skillName}
                            </span>

                            <span className="text-red-600">
                              Gap: {gap.gap || 0}%
                            </span>

                          </div>

                        </div>
                      );
                    })}

                  </div>
                )}

              </div>

            </div>
          )}

          {/* AI Recommendation */}
          {recommendation && (
            <div className="mt-8 bg-white rounded-xl shadow p-6">

              <div className="flex justify-between items-center mb-5">

                <h2 className="text-2xl font-bold text-slate-800">
                  Your AI Learning Path
                </h2>

                <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm">
                  AI Generated
                </span>

              </div>

              <div className="bg-slate-50 border rounded-xl p-6">

                <div className="whitespace-pre-line text-slate-700 leading-7">
                  {recommendation}
                </div>

              </div>

            </div>
          )}

          {/* Ask AI */}
          <div className="mt-8 bg-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold text-slate-800">
              Ask AI
            </h2>

            <p className="mt-2 text-slate-600">
              Ask questions about programming,
              technologies, skills, or your learning path.
            </p>

            <div className="flex gap-3 mt-5">

              <input
                type="text"
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAskQuestion();
                  }
                }}
                placeholder="Ask something like: Explain Spring Boot Dependency Injection"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleAskQuestion}
                disabled={
                  questionLoading ||
                  !question.trim()
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
              >
                {questionLoading
                  ? "Asking..."
                  : "Ask AI"}
              </button>

            </div>

            {/* AI Answer */}
            {answer && (
              <div className="mt-6 border rounded-xl p-6 bg-slate-50">

                <h3 className="font-semibold text-lg text-slate-800 mb-3">
                  AI Answer
                </h3>

                <div className="whitespace-pre-line text-slate-700 leading-7">
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