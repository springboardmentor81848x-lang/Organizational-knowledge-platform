
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  CheckCircle,
  Star,
  AlertCircle,
  Save,
} from "lucide-react";

import {
  getEmployeeSkillsForManagerAssessment,
  submitManagerAssessment,
} from "../services/platformService";

import Sidebar from "../components/Sidebar";

// =========================================================
// LEVELS
// =========================================================

const LEVELS = [
  {
    value: 1,
    label: "Beginner",
    description: "Needs significant guidance",
  },
  {
    value: 2,
    label: "Intermediate",
    description: "Can perform basic tasks",
  },
  {
    value: 3,
    label: "Competent",
    description: "Can work independently",
  },
  {
    value: 4,
    label: "Advanced",
    description: "Strong independent expertise",
  },
  {
    value: 5,
    label: "Expert",
    description: "Can guide and mentor others",
  },
];

// =========================================================
// ASSESSMENT MAPPING
// =========================================================
//
// Database:
// 2 = Software Developer       -> role 1
// 3 = Software Tester          -> role 2
// 4 = Data Analyst             -> role 3
// 5 = Data Scientist           -> role 4
// 6 = DevOps Engineer          -> role 5
// 7 = UI/UX Designer           -> role 6
// 8 = Cybersecurity Analyst    -> role 7
// 9 = Database Administrator   -> role 8
//
// =========================================================

const ASSESSMENT_BY_ROLE = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 7,
  7: 8,
  8: 9,
};

// =========================================================
// COMPONENT
// =========================================================

function ManagerAssessment() {
  const navigate = useNavigate();

  // =======================================================
  // STATE
  // =======================================================

  const [employeeIdentifier, setEmployeeIdentifier] =
    useState("");

  const [skills, setSkills] = useState([]);

  const [ratings, setRatings] = useState({});

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [result, setResult] = useState(null);

  // =======================================================
  // LOGIN INFORMATION
  // =======================================================

  const managerIdentifier =
    localStorage.getItem("employeeId");

  // =======================================================
  // LOAD EMPLOYEE SKILLS
  // =======================================================

  const loadEmployeeSkills = async () => {
    if (!employeeIdentifier.trim()) {
      setError("Please enter an employee ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      setResult(null);
      setSkills([]);
      setRatings({});

      const response =
        await getEmployeeSkillsForManagerAssessment(
          employeeIdentifier.trim()
        );

      const data =
        response?.data ??
        response ??
        [];

      if (!Array.isArray(data)) {
        setSkills([]);

        setError(
          "Invalid employee skills response received from server."
        );

        return;
      }

      setSkills(data);

      // =====================================================
      // INITIAL RATINGS
      // =====================================================

      const initialRatings = {};

      data.forEach((employeeSkill) => {
        const skillName =
          employeeSkill?.skill?.skillName;

        if (skillName) {
          initialRatings[skillName] =
            Number(
              employeeSkill.currentLevel
            ) || 1;
        }
      });

      setRatings(initialRatings);

      if (data.length === 0) {
        setMessage(
          "No skills found for this employee."
        );
      }
    } catch (err) {
      console.error(
        "Failed to load employee skills:",
        err
      );

      setSkills([]);
      setRatings({});

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Unable to load employee skills."
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // UPDATE RATING
  // =======================================================

  const handleRatingChange = (
    skillName,
    rating
  ) => {
    setRatings((previous) => ({
      ...previous,
      [skillName]: Number(rating),
    }));

    setError("");
    setMessage("");
    setResult(null);
  };

  // =======================================================
  // GET ASSESSMENT ID
  // =======================================================

  const getAssessmentId = () => {
    if (!skills || skills.length === 0) {
      return null;
    }

    const targetRoleId =
      skills[0]?.employee?.targetRoleId ??
      skills[0]?.targetRoleId;

    if (targetRoleId) {
      return (
        ASSESSMENT_BY_ROLE[
          Number(targetRoleId)
        ] || null
      );
    }

    // Fallback
    return 2;
  };

  // =======================================================
  // SUBMIT MANAGER ASSESSMENT
  // =======================================================

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    setResult(null);

    // =====================================================
    // VALIDATE EMPLOYEE
    // =====================================================

    if (!employeeIdentifier.trim()) {
      setError(
        "Please enter an employee ID."
      );

      return;
    }

    // =====================================================
    // VALIDATE SKILLS
    // =====================================================

    if (skills.length === 0) {
      setError(
        "No skills found for this employee."
      );

      return;
    }

    // =====================================================
    // VALIDATE MANAGER
    // =====================================================

    if (!managerIdentifier) {
      setError(
        "Manager information not found. Please login again."
      );

      return;
    }

    // =====================================================
    // CHECK ALL SKILLS ARE RATED
    // =====================================================

    const missingRatings =
      skills.some(
        (employeeSkill) => {
          const skillName =
            employeeSkill?.skill?.skillName;

          if (!skillName) {
            return false;
          }

          return !ratings[skillName];
        }
      );

    if (missingRatings) {
      setError(
        "Please rate every skill before submitting."
      );

      return;
    }

    // =====================================================
    // GET ASSESSMENT ID
    // =====================================================

    const assessmentId =
      getAssessmentId();

    if (!assessmentId) {
      setError(
        "Unable to determine the assessment for this employee."
      );

      return;
    }

    console.log(
      "Selected Assessment ID:",
      assessmentId
    );

    // =====================================================
    // BUILD REQUEST
    // =====================================================

    const request = {
      assessmentId: Number(
        assessmentId
      ),

      employeeIdentifier:
        employeeIdentifier.trim(),

      managerIdentifier:
        managerIdentifier,

      skills:
        skills
          .map(
            (employeeSkill) => {
              const skillName =
                employeeSkill
                  ?.skill
                  ?.skillName;

              return {
                skillName,

                rating:
                  Number(
                    ratings[
                      skillName
                    ]
                  ),
              };
            }
          )
          .filter(
            (skill) =>
              skill.skillName &&
              skill.rating >= 1 &&
              skill.rating <= 5
          ),
    };

    // =====================================================
    // FINAL VALIDATION
    // =====================================================

    if (
      request.skills.length === 0
    ) {
      setError(
        "No valid skill ratings found."
      );

      return;
    }

    // =====================================================
    // SUBMIT
    // =====================================================

    try {
      setSubmitting(true);

      console.log(
        "Submitting Manager Assessment:",
        request
      );

      const response =
        await submitManagerAssessment(
          request
        );

      const responseData =
        response?.data ??
        response;

      console.log(
        "Manager Assessment Result:",
        responseData
      );

      setResult(
        responseData
      );

      setMessage(
        "Manager assessment submitted successfully!"
      );
    } catch (err) {
      console.error(
        "Manager assessment failed:",
        err
      );

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data;

      setError(
        typeof backendMessage ===
          "string"
          ? backendMessage
          : "Failed to submit manager assessment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =======================================================
  // LEVEL NAME
  // =======================================================

  const getLevelName = (level) => {
    const found =
      LEVELS.find(
        (item) =>
          item.value ===
          Number(level)
      );

    return found
      ? found.label
      : "Beginner";
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* =================================================
          SINGLE MANAGER SIDEBAR
      ================================================= */}

      <Sidebar role="MANAGER" />

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="flex-1 p-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Manager Assessment
          </h1>

          <p className="mt-2 text-gray-500">
            Evaluate your team member's current
            skill proficiency.
          </p>

        </div>

        {/* =================================================
            EMPLOYEE SELECTION
        ================================================= */}

        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-gray-200">

          <div className="mb-4 flex items-center gap-2">

            <User
              size={20}
              className="text-gray-700"
            />

            <h2 className="text-lg font-semibold text-gray-900">
              Select Employee
            </h2>

          </div>

          <div className="flex gap-3">

            <input
              type="text"
              value={
                employeeIdentifier
              }
              onChange={(e) =>
                setEmployeeIdentifier(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  loadEmployeeSkills();
                }
              }}
              placeholder="Enter Employee ID e.g. EMP1001"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-600"
            />

            <button
              type="button"
              onClick={
                loadEmployeeSkills
              }
              disabled={loading}
              className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : "Load Employee"}
            </button>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">

            <AlertCircle size={20} />

            <span>
              {error}
            </span>

          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">

            <CheckCircle size={20} />

            <span>
              {message}
            </span>

          </div>
        )}

        {/* =================================================
            SKILLS
        ================================================= */}

        {skills.length > 0 && (
          <div className="rounded-xl bg-white shadow-sm border border-gray-200">

            {/* =================================================
                SKILLS HEADER
            ================================================= */}

            <div className="border-b border-gray-200 p-6">

              <h2 className="text-xl font-semibold text-gray-900">
                Rate Employee Skills
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select the proficiency level that
                best represents the employee's
                current ability.
              </p>

            </div>

            {/* =================================================
                SKILL LIST
            ================================================= */}

            <div className="divide-y divide-gray-100">

              {skills.map(
                (
                  employeeSkill,
                  index
                ) => {

                  const skillName =
                    employeeSkill
                      ?.skill
                      ?.skillName;

                  const currentRating =
                    ratings[
                      skillName
                    ] || 1;

                  return (
                    <div
                      key={
                        employeeSkill?.id ||
                        index
                      }
                      className="p-6"
                    >

                      {/* =================================================
                          SKILL HEADER
                      ================================================= */}

                      <div className="mb-5 flex items-center justify-between">

                        <div>

                          <h3 className="text-lg font-semibold text-gray-900">
                            {skillName ||
                              "Unknown Skill"}
                          </h3>

                          <p className="text-sm text-gray-500">

                            Current level:{" "}

                            <span className="font-medium text-gray-700">

                              {getLevelName(
                                employeeSkill
                                  .currentLevel
                              )}

                            </span>

                          </p>

                        </div>

                        {/* =================================================
                            STARS
                        ================================================= */}

                        <div className="flex items-center gap-1">

                          {[1, 2, 3, 4, 5].map(
                            (star) => (
                              <Star
                                key={
                                  star
                                }
                                size={
                                  20
                                }
                                className={
                                  star <=
                                  currentRating
                                    ? "fill-current text-black"
                                    : "text-gray-300"
                                }
                              />
                            )
                          )}

                        </div>

                      </div>

                      {/* =================================================
                          RATING OPTIONS
                      ================================================= */}

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">

                        {LEVELS.map(
                          (level) => (
                            <button
                              key={
                                level.value
                              }
                              type="button"
                              onClick={() =>
                                handleRatingChange(
                                  skillName,
                                  level.value
                                )
                              }
                              className={`rounded-xl border p-4 text-left transition ${
                                currentRating ===
                                level.value
                                  ? "border-black bg-gray-100"
                                  : "border-gray-200 hover:border-gray-400"
                              }`}
                            >

                              <div className="flex items-center justify-between">

                                <span className="text-lg font-bold text-gray-900">
                                  {
                                    level.value
                                  }
                                </span>

                                {currentRating ===
                                  level.value && (
                                  <CheckCircle
                                    size={
                                      18
                                    }
                                  />
                                )}

                              </div>

                              <p className="mt-2 font-medium text-gray-900">
                                {
                                  level.label
                                }
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {
                                  level.description
                                }
                              </p>

                            </button>
                          )
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {/* =================================================
                SUBMIT
            ================================================= */}

            <div className="border-t border-gray-200 p-6">

              <button
                type="button"
                onClick={
                  handleSubmit
                }
                disabled={
                  submitting
                }
                className="flex items-center justify-center gap-2 rounded-lg bg-black px-8 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >

                <Save size={18} />

                {submitting
                  ? "Submitting..."
                  : "Submit Manager Assessment"}

              </button>

            </div>

          </div>
        )}

        {/* =================================================
            RESULT
        ================================================= */}

        {result && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-gray-200">

            <h2 className="text-xl font-semibold text-gray-900">
              Assessment Completed
            </h2>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">

              <div className="rounded-lg bg-gray-50 p-4">

                <p className="text-sm text-gray-500">
                  Overall Score
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {result.overallScore ??
                    0}
                  %
                </p>

              </div>

              <div className="rounded-lg bg-gray-50 p-4">

                <p className="text-sm text-gray-500">
                  Performance
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {result.performanceLevel ||
                    "N/A"}
                </p>

              </div>

              <div className="rounded-lg bg-gray-50 p-4">

                <p className="text-sm text-gray-500">
                  Skills Evaluated
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {result.skillResults
                    ?.length ||
                    0}
                </p>

              </div>

            </div>

            {/* =================================================
                RESULT TABLE
            ================================================= */}

            {result.skillResults &&
              result.skillResults.length >
                0 && (

                <div className="mt-6 overflow-x-auto">

                  <table className="w-full text-left">

                    <thead>

                      <tr className="border-b border-gray-200">

                        <th className="p-3 text-sm font-semibold text-gray-600">
                          Skill
                        </th>

                        <th className="p-3 text-sm font-semibold text-gray-600">
                          Rating
                        </th>

                        <th className="p-3 text-sm font-semibold text-gray-600">
                          Level
                        </th>

                        <th className="p-3 text-sm font-semibold text-gray-600">
                          Previous
                        </th>

                        <th className="p-3 text-sm font-semibold text-gray-600">
                          Improvement
                        </th>

                        <th className="p-3 text-sm font-semibold text-gray-600">
                          Gap
                        </th>

                        <th className="p-3 text-sm font-semibold text-gray-600">
                          Severity
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {result.skillResults.map(
                        (
                          skill,
                          index
                        ) => (

                          <tr
                            key={
                              skill.skillName ||
                              index
                            }
                            className="border-b border-gray-100"
                          >

                            <td className="p-3 font-medium text-gray-900">
                              {
                                skill.skillName
                              }
                            </td>

                            <td className="p-3 text-gray-700">
                              {
                                skill.rating
                              }
                              /5
                            </td>

                            <td className="p-3 text-gray-700">
                              {
                                skill.level
                              }
                            </td>

                            <td className="p-3 text-gray-700">
                              {
                                skill.previousLevel
                              }
                            </td>

                            <td className="p-3 text-gray-700">

                              {Number(
                                skill.improvement
                              ) > 0
                                ? `+${skill.improvement}`
                                : skill.improvement ??
                                  0}

                            </td>

                            <td className="p-3 text-gray-700">
                              {
                                skill.gap
                              }
                            </td>

                            <td className="p-3">

                              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">

                                {
                                  skill.gapSeverity ||
                                  "N/A"
                                }

                              </span>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

          </div>
        )}

      </main>
    </div>
  );
}

export default ManagerAssessment;