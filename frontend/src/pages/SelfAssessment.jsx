import React, { useEffect, useState } from "react";
import api from "../services/api";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  ClipboardCheck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Save,
  Star,
} from "lucide-react";



const LEVELS = [
  {
    value: 1,
    label: "Beginner",
    description: "I have basic awareness of this skill.",
  },
  {
    value: 2,
    label: "Intermediate",
    description: "I can use this skill with some guidance.",
  },
  {
    value: 3,
    label: "Competent",
    description: "I can use this skill independently.",
  },
  {
    value: 4,
    label: "Advanced",
    description: "I have strong knowledge and experience.",
  },
  {
    value: 5,
    label: "Expert",
    description: "I can handle complex tasks and guide others.",
  },
];

const getLevelName = (level) => {
  const found = LEVELS.find(
    (item) => item.value === Number(level)
  );

  return found ? found.label : "Not Rated";
};

const getLevelDescription = (level) => {
  const found = LEVELS.find(
    (item) => item.value === Number(level)
  );

  return found
    ? found.description
    : "Select your current skill level.";
};

const SelfAssessment = () => {
  const [skills, setSkills] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // GET LOGGED-IN EMPLOYEE INFORMATION
  // =========================================================

  const employeeId = localStorage.getItem("employeeId");
  const token = localStorage.getItem("token");

  // IMPORTANT:
  // Sidebar needs the role prop.
  // Try both keys because your application uses both.
  const role =
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    "EMPLOYEE";

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = async () => {
    if (!employeeId) {
      setError(
        "Employee information not found. Please login again."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      const [skillsResponse, ratingsResponse] =
        await Promise.all([
          axios.get(
            `${API_BASE_URL}/self-assessment/${employeeId}/skills`,
            { headers }
          ),

          axios.get(
            `${API_BASE_URL}/self-assessment/${employeeId}`,
            { headers }
          ),
        ]);

      const employeeSkills = skillsResponse.data || [];
      const savedRatings = ratingsResponse.data || [];

      setSkills(employeeSkills);

      // =====================================================
      // CREATE RATING MAP
      // =====================================================

      const ratingMap = {};

      savedRatings.forEach((item) => {
        if (item.skillName && item.level) {
          ratingMap[item.skillName.toLowerCase()] =
            Number(item.level);
        }
      });

      setRatings(ratingMap);
    } catch (err) {
      console.error(
        "Error loading self assessment:",
        err
      );

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (
        typeof err.response?.data === "string"
      ) {
        setError(err.response.data);
      } else {
        setError(
          "Unable to load Self Assessment. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // CHANGE RATING
  // =========================================================

  const handleRatingChange = (skillName, level) => {
    setRatings((previous) => ({
      ...previous,
      [skillName.toLowerCase()]: Number(level),
    }));

    setSuccess("");
    setError("");
  };

  // =========================================================
  // SUBMIT SELF ASSESSMENT
  // =========================================================

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!employeeId) {
      setError(
        "Employee information not found. Please login again."
      );
      return;
    }

    // =====================================================
    // CHECK ALL SKILLS ARE RATED
    // =====================================================

    const unratedSkills = skills.filter((employeeSkill) => {
      const skillName =
        employeeSkill?.skill?.skillName;

      if (!skillName) {
        return true;
      }

      return !ratings[skillName.toLowerCase()];
    });

    if (unratedSkills.length > 0) {
      setError(
        `Please rate all your skills before submitting. ${unratedSkills.length} skill(s) are still unrated.`
      );
      return;
    }

    try {
      setSaving(true);

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      // =====================================================
      // REQUEST BODY
      // =====================================================

      const requestBody = {
        ratings: skills.map((employeeSkill) => {
          const skillName =
            employeeSkill.skill.skillName;

          return {
            skillName: skillName,
            level: ratings[
              skillName.toLowerCase()
            ],
          };
        }),
      };

      console.log(
        "Submitting Self Assessment:",
        requestBody
      );

      await axios.post(
        `${API_BASE_URL}/self-assessment/submit/${employeeId}`,
        requestBody,
        { headers }
      );

      setSuccess(
        "Your Self Assessment has been saved successfully!"
      );

      // Reload saved ratings
      await loadData();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Error submitting self assessment:",
        err
      );

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (
        typeof err.response?.data === "string"
      ) {
        setError(err.response.data);
      } else {
        setError(
          "Unable to save your Self Assessment. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex">
          {/* FIXED: PASS ROLE TO SIDEBAR */}
          <Sidebar role={role} />

          <main className="flex-1 p-8">
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />

                <p className="mt-3 text-gray-600">
                  Loading Self Assessment...
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        {/* ==================================================
            EMPLOYEE SIDEBAR
        ================================================== */}

        <Sidebar role={role} />

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <main className="flex-1 p-6 lg:p-8 overflow-x-auto">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-8">
            <div className="flex items-center gap-4">

              <div className="p-4 bg-indigo-100 rounded-2xl">
                <ClipboardCheck className="w-8 h-8 text-indigo-600" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Self Assessment
                </h1>

                <p className="text-gray-600 mt-1">
                  Rate your current skill level based on
                  your own knowledge and experience.
                </p>
              </div>

            </div>
          </div>

          {/* ==================================================
              SUCCESS MESSAGE
          ================================================== */}

          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />

              <span>{success}</span>
            </div>
          )}

          {/* ==================================================
              ERROR MESSAGE
          ================================================== */}

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />

              <span>{error}</span>
            </div>
          )}

          {/* ==================================================
              NO SKILLS
          ================================================== */}

          {skills.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">

              <ClipboardCheck className="w-12 h-12 mx-auto text-gray-400" />

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                No Skills Available
              </h2>

              <p className="mt-2 text-gray-500">
                There are currently no skills assigned
                to your skill inventory.
              </p>

              <button
                onClick={loadData}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

            </div>
          ) : (
            <>
              {/* ==================================================
                  INSTRUCTIONS
              ================================================== */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">

                <h2 className="text-lg font-semibold text-gray-900">
                  How to rate yourself
                </h2>

                <p className="text-sm text-gray-600 mt-2">
                  Select the level that best represents
                  your current knowledge and practical
                  experience for each skill. Be honest and
                  realistic with your ratings.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">

                  {LEVELS.map((level) => (
                    <div
                      key={level.value}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex">
                        {Array.from({
                          length: level.value,
                        }).map((_, index) => (
                          <Star
                            key={index}
                            className="w-4 h-4 fill-current text-yellow-500"
                          />
                        ))}
                      </div>

                      <p className="font-medium text-gray-900 mt-3">
                        {level.value}. {level.label}
                      </p>

                      <p className="text-xs text-gray-500 mt-2">
                        {level.description}
                      </p>
                    </div>
                  ))}

                </div>
              </div>

              {/* ==================================================
                  SKILLS
              ================================================== */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="px-6 py-5 border-b border-gray-200">

                  <div className="flex items-center justify-between">

                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Rate Your Skills
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        {skills.length} skill
                        {skills.length !== 1
                          ? "s"
                          : ""}{" "}
                        to assess
                      </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">
                      <ClipboardCheck className="w-4 h-4" />
                      Self Rating
                    </div>

                  </div>
                </div>

                {/* ==================================================
                    SKILL LIST
                ================================================== */}

                <div className="divide-y divide-gray-100">

                  {skills.map(
                    (employeeSkill, index) => {

                      const skill =
                        employeeSkill.skill;

                      const skillName =
                        skill.skillName;

                      const currentRating =
                        ratings[
                          skillName.toLowerCase()
                        ] || 0;

                      return (
                        <div
                          key={
                            employeeSkill.id ||
                            index
                          }
                          className="p-6 hover:bg-gray-50 transition"
                        >

                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                            {/* ==================================================
                                SKILL INFORMATION
                            ================================================== */}

                            <div className="lg:w-1/3">

                              <div className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">

                                  <span className="font-bold text-indigo-600">
                                    {index + 1}
                                  </span>

                                </div>

                                <div>

                                  <h3 className="font-semibold text-gray-900">
                                    {skillName}
                                  </h3>

                                  {skill.category && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {skill.category}
                                    </p>
                                  )}

                                </div>

                              </div>

                              {skill.description && (
                                <p className="text-sm text-gray-500 mt-3">
                                  {skill.description}
                                </p>
                              )}

                            </div>

                            {/* ==================================================
                                RATING BUTTONS
                            ================================================== */}

                            <div className="flex-1">

                              <div className="grid grid-cols-5 gap-2">

                                {LEVELS.map(
                                  (level) => {

                                    const selected =
                                      currentRating ===
                                      level.value;

                                    return (
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
                                        className={`relative rounded-xl border-2 p-3 text-center transition-all ${
                                          selected
                                            ? "border-indigo-600 bg-indigo-50 shadow-sm"
                                            : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
                                        }`}
                                      >

                                        <div className="flex justify-center mb-2">

                                          {Array.from(
                                            {
                                              length:
                                                level.value,
                                            }
                                          ).map(
                                            (
                                              _,
                                              starIndex
                                            ) => (
                                              <Star
                                                key={
                                                  starIndex
                                                }
                                                className={`w-3.5 h-3.5 ${
                                                  selected
                                                    ? "fill-current text-indigo-600"
                                                    : "text-gray-400"
                                                }`}
                                              />
                                            )
                                          )}

                                        </div>

                                        <p
                                          className={`text-xs font-semibold ${
                                            selected
                                              ? "text-indigo-700"
                                              : "text-gray-700"
                                          }`}
                                        >
                                          {
                                            level.label
                                          }
                                        </p>

                                        <p className="text-[10px] text-gray-400 mt-1">
                                          Level{" "}
                                          {
                                            level.value
                                          }
                                        </p>

                                        {selected && (
                                          <CheckCircle className="absolute -top-2 -right-2 w-5 h-5 text-indigo-600 bg-white rounded-full" />
                                        )}

                                      </button>
                                    );
                                  }
                                )}

                              </div>

                              {/* ==================================================
                                  SELECTED LEVEL DESCRIPTION
                              ================================================== */}

                              <div className="mt-3 min-h-[20px]">

                                {currentRating >
                                  0 && (
                                  <p className="text-sm text-indigo-600">
                                    <span className="font-semibold">
                                      {getLevelName(
                                        currentRating
                                      )}
                                    </span>

                                    {" — "}

                                    {getLevelDescription(
                                      currentRating
                                    )}
                                  </p>
                                )}

                              </div>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

                {/* ==================================================
                    SAVE
                ================================================== */}

                <div className="border-t border-gray-200 px-6 py-5 bg-gray-50">

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                    <p className="text-sm text-gray-500">
                      Please make sure you have rated every
                      skill before saving.
                    </p>

                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >

                      {saving ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Self Assessment
                        </>
                      )}

                    </button>

                  </div>

                </div>

              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
};

export default SelfAssessment;