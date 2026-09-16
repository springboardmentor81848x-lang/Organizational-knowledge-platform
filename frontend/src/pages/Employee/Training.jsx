import React, { useEffect, useState } from "react";

import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import AIAssistant from "../../components/AIAssistant/AIAssistant";

import {
  FaBookOpen,
  FaFilter,
  FaClock,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaStar,
  FaRobot,
  FaLightbulb,
  FaGraduationCap
} from "react-icons/fa";

import {
  coursesAPI,
  aiAPI,
  learningProgressAPI,
  getCurrentUserId
} from "../../services/apiService";

import "./Training.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const Training = () => {
  const [providerFilter, setProviderFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Relevance");

  const [courses, setCourses] = useState([]);
  const [aiPlan, setAiPlan] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const userId = getCurrentUserId();

  // =========================================================
  // COURSE PROVIDER NORMALIZATION
  // =========================================================

  const normalizeCourse = (course) => {
    const title = String(course.title || "").toLowerCase();
    const skill = String(course.skill_name || "").toLowerCase();

    let provider = course.provider || "";

    if (
      title.includes("microservice") ||
      title.includes("spring boot") ||
      title.includes("system design") ||
      title.includes("java")
    ) {
      provider = "Infosys Springboard";
    } else if (
      title.includes("docker") ||
      title.includes("kubernetes") ||
      title.includes("devops")
    ) {
      provider = "Coursera";
    } else if (
      title.includes("aws") ||
      title.includes("cloud")
    ) {
      provider = "Udemy";
    }

    if (
      !provider ||
      provider === "Internal Training Catalog"
    ) {
      if (
        skill.includes("java") ||
        skill.includes("spring") ||
        skill.includes("microservice") ||
        skill.includes("system")
      ) {
        provider = "Infosys Springboard";
      } else if (
        skill.includes("docker") ||
        skill.includes("kubernetes") ||
        skill.includes("devops")
      ) {
        provider = "Coursera";
      } else {
        provider = "Udemy";
      }
    }

    let url = course.url;

    if (!url) {
      if (provider === "Infosys Springboard") {
        url = "https://infyspringboard.onwings.com/";
      } else if (provider === "Coursera") {
        url = "https://www.coursera.org/";
      } else {
        url = "https://www.udemy.com/";
      }
    }

    return {
      ...course,
      provider,
      url,
      level: course.level || "Intermediate",
      rating: course.rating || 4.5
    };
  };

  // =========================================================
  // LOAD COURSES
  // =========================================================

  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);

      try {
        const response = await coursesAPI.getCourses();

        if (response?.success) {
          const list = (response.data || []).map(
            normalizeCourse
          );

          setCourses(list);
        }
      } catch (error) {
        console.error("Course loading error:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, []);

  // =========================================================
  // LOAD AI RECOMMENDATION USING REAL USER GAPS
  // =========================================================

  useEffect(() => {
    const fetchAiPlan = async () => {
      setLoadingAi(true);

      try {
        const gapResponse = await fetch(
          `${API_URL}/api/gap-analysis/${userId}?role=Software%20Developer`
        );

        const gapResult = await gapResponse.json();

        if (!gapResponse.ok || !gapResult?.success) {
          throw new Error(
            gapResult?.error ||
              "Unable to load skill gaps"
          );
        }

        const gapData = gapResult.data;

        const gaps = (gapData?.gapDetails || []).filter(
          (item) => item.level !== "Met"
        );

        const aiResponse =
          await aiAPI.getRecommendations(
            gaps,
            "Software Developer",
            userId
          );

        if (aiResponse?.success) {
          setAiPlan(aiResponse.data);
        }
      } catch (error) {
        console.error(
          "AI recommendation error:",
          error
        );

        setAiPlan({
          summary:
            "Your learning plan is based on your current skill gaps.",
          priorityActions: [],
          recommendedTrack:
            "Software Developer Upskilling Path",
          estimatedWeeks: 6
        });
      } finally {
        setLoadingAi(false);
      }
    };

    if (userId) {
      fetchAiPlan();
    }
  }, [userId]);

  // =========================================================
  // ENROLL
  // =========================================================

  const handleEnroll = async (courseId) => {
    try {
      if (!userId) {
        alert("User ID not found. Please login again.");
        return;
      }

      const response =
        await learningProgressAPI.enroll(
          userId,
          courseId
        );

      if (response?.success) {
        setEnrolledIds((previous) => [
          ...new Set([...previous, courseId])
        ]);

        alert(
          "Successfully enrolled! Check My Learning for progress."
        );
      } else {
        alert(
          response?.error ||
            response?.message ||
            "Unable to enroll in this course."
        );
      }
    } catch (error) {
      console.error("Enrollment error:", error);

      alert(
        error?.response?.data?.error ||
          error?.message ||
          "Enrollment failed. Please try again."
      );
    }
  };

  // =========================================================
  // FILTER
  // =========================================================

  let filteredCourses = courses.filter(
    (course) => {
      const matchesProvider =
        providerFilter === "All" ||
        String(course.provider)
          .toLowerCase()
          .includes(
            providerFilter.toLowerCase()
          );

      const matchesLevel =
        levelFilter === "All" ||
        String(course.level).toLowerCase() ===
          levelFilter.toLowerCase();

      return (
        matchesProvider &&
        matchesLevel
      );
    }
  );

  // =========================================================
  // SORT
  // =========================================================

  if (sortBy === "Rating") {
    filteredCourses = [
      ...filteredCourses
    ].sort(
      (a, b) =>
        Number(b.rating || 0) -
        Number(a.rating || 0)
    );
  }

  if (sortBy === "Duration") {
    filteredCourses = [
      ...filteredCourses
    ].sort(
      (a, b) =>
        Number(a.duration_hours || 0) -
        Number(b.duration_hours || 0)
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-wrapper">
        <Navbar
          title="Training & External Catalogs"
          role="Employee"
        />

        <div className="page-container">

          {/* HEADER */}

          <div className="page-header">
            <div className="page-header-text">
              <h2>
                <FaBookOpen /> Training &
                External Learning
              </h2>

              <p>
                Personalized learning based on
                your organizational skill gaps.
              </p>
            </div>
          </div>

          {/* AI ASSISTANT */}

          <AIAssistant userId={userId} />

          {/* AI RECOMMENDATION */}

          <div
            className="card-box"
            style={{
              padding: "22px",
              marginBottom: "25px",
              background:
                "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
              color: "white"
            }}
          >
            <h3>
              <FaRobot /> AI Learning Recommendation
            </h3>

            {loadingAi ? (
              <p>
                <FaRobot /> Generating
                personalized learning
                recommendations...
              </p>
            ) : aiPlan ? (
              <div>
                <p>
                  <FaLightbulb />{" "}
                  {aiPlan.summary ||
                    "Personalized learning plan generated from your skill gaps."}
                </p>

                {aiPlan.recommendedTrack && (
                  <p>
                    <strong>
                      Recommended Track:
                    </strong>{" "}
                    {aiPlan.recommendedTrack}
                  </p>
                )}

                {aiPlan.estimatedWeeks && (
                  <p>
                    <strong>
                      Estimated Duration:
                    </strong>{" "}
                    {aiPlan.estimatedWeeks} weeks
                  </p>
                )}

                {aiPlan.priorityActions?.length >
                  0 && (
                  <div>
                    <strong>
                      Priority Actions:
                    </strong>

                    <ul>
                      {aiPlan.priorityActions.map(
                        (action, index) => (
                          <li key={index}>
                            {action}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p>
                Your personalized learning
                recommendations will appear here.
              </p>
            )}
          </div>

          {/* FILTER */}

          <div
            className="card-box"
            style={{
              padding: "20px",
              marginBottom: "25px"
            }}
          >
            <h3>
              <FaFilter /> Filter
              Recommendations
            </h3>

            <div
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
                marginTop: "15px"
              }}
            >
              <div>
                <label>
                  <strong>
                    Platform
                  </strong>
                </label>

                <br />

                <select
                  value={providerFilter}
                  onChange={(e) =>
                    setProviderFilter(
                      e.target.value
                    )
                  }
                  style={{
                    padding: "10px",
                    marginTop: "6px"
                  }}
                >
                  <option value="All">
                    All Platforms
                  </option>

                  <option value="Infosys Springboard">
                    Infosys Springboard
                  </option>

                  <option value="Coursera">
                    Coursera
                  </option>

                  <option value="Udemy">
                    Udemy
                  </option>
                </select>
              </div>

              <div>
                <label>
                  <strong>
                    Proficiency Level
                  </strong>
                </label>

                <br />

                <select
                  value={levelFilter}
                  onChange={(e) =>
                    setLevelFilter(
                      e.target.value
                    )
                  }
                  style={{
                    padding: "10px",
                    marginTop: "6px"
                  }}
                >
                  <option value="All">
                    All Levels
                  </option>

                  <option value="Beginner">
                    Beginner
                  </option>

                  <option value="Intermediate">
                    Intermediate
                  </option>

                  <option value="Advanced">
                    Advanced
                  </option>
                </select>
              </div>

              <div>
                <label>
                  <strong>
                    Sort By
                  </strong>
                </label>

                <br />

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value)
                  }
                  style={{
                    padding: "10px",
                    marginTop: "6px"
                  }}
                >
                  <option value="Relevance">
                    Relevance
                  </option>

                  <option value="Rating">
                    Highest Rating
                  </option>

                  <option value="Duration">
                    Shortest Duration
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* COURSES */}

          <h3
            style={{
              marginBottom: "15px"
            }}
          >
            <FaGraduationCap /> Recommended
            Courses
          </h3>

          {loadingCourses ? (
            <div
              className="card-box"
              style={{
                padding: "30px",
                textAlign: "center"
              }}
            >
              Loading courses...
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px"
              }}
            >
              {filteredCourses.length === 0 ? (
                <div
                  className="card-box"
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    gridColumn: "1 / -1"
                  }}
                >
                  <FaBookOpen size={30} />

                  <h3>
                    No courses found
                  </h3>

                  <p>
                    Try another platform or
                    proficiency level.
                  </p>
                </div>
              ) : (
                filteredCourses.map(
                  (course) => {
                    const enrolled =
                      enrolledIds.includes(
                        course.id
                      );

                    return (
                      <div
                        className="card-box"
                        key={course.id}
                        style={{
                          padding: "22px"
                        }}
                      >
                        <h3>
                          {course.title}
                        </h3>

                        <p>
                          <strong>
                            Platform:
                          </strong>{" "}
                          {course.provider}
                        </p>

                        {course.description && (
                          <p>
                            {course.description}
                          </p>
                        )}

                        <p>
                          <strong>
                            Level:
                          </strong>{" "}
                          {course.level}
                        </p>

                        <p>
                          <FaClock />{" "}
                          {course.duration ||
                            `${course.duration_hours || 0} hrs`}
                        </p>

                        <p>
                          <FaStar />{" "}
                          {course.rating}
                        </p>

                        {course.skill_name && (
                          <p>
                            <strong>
                              Skill:
                            </strong>{" "}
                            {course.skill_name}
                          </p>
                        )}

                        <div
                          style={{
                            marginTop: "15px"
                          }}
                        >
                          {enrolled ? (
                            <button
                              className="btn btn-success btn-sm"
                              disabled
                            >
                              <FaCheckCircle />{" "}
                              Enrolled
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                handleEnroll(
                                  course.id
                                )
                              }
                            >
                              Enroll
                            </button>
                          )}

                          {course.url && (
                            <a
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display:
                                  "inline-block",
                                marginLeft:
                                  "10px"
                              }}
                            >
                              Visit Platform{" "}
                              <FaExternalLinkAlt />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  }
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Training;