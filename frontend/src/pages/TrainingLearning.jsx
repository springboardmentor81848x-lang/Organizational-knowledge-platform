import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  PlayCircle,
  ExternalLink,
  Clock,
  AlertTriangle,
  GraduationCap,
  ArrowLeft,
  BarChart3,
  Search,
  BookMarked,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

function TrainingLearning() {
  // =========================================================
  // STATE
  // =========================================================

  const [courses, setCourses] = useState([]);
  const [knowledgeGaps, setKnowledgeGaps] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [learningProgress, setLearningProgress] =
    useState({});

  // =========================================================
  // LOCAL STORAGE
  // =========================================================

  const employeeId =
    localStorage.getItem("employeeId");

  const token =
    localStorage.getItem("token");

  // =========================================================
  // AXIOS CONFIG
  // =========================================================

  const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
      Authorization: token
        ? `Bearer ${token}`
        : "",
      "Content-Type": "application/json",
    },
  });

  // =========================================================
  // LOAD COURSES + KNOWLEDGE GAPS
  // =========================================================

  const loadTrainingData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!employeeId) {
        setError(
          "Employee ID not found. Please login again."
        );
        return;
      }

      // -----------------------------------------------
      // GET EMPLOYEE KNOWLEDGE GAPS
      // -----------------------------------------------

      const gapsResponse =
        await api.get(
          `/knowledge-gaps/employee/${employeeId}`
        );

      // -----------------------------------------------
      // GET ALL COURSES
      // -----------------------------------------------

      const coursesResponse =
        await api.get("/courses");

      setKnowledgeGaps(
        gapsResponse.data || []
      );

      setCourses(
        coursesResponse.data || []
      );
    } catch (err) {
      console.error(
        "Training data error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load training data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadTrainingData();
  }, []);

  // =========================================================
  // GAP MAP
  // =========================================================

  const gapMap = useMemo(() => {
    const map = {};

    knowledgeGaps.forEach((gap) => {
      if (gap.skill?.id) {
        map[gap.skill.id] = gap;
      }
    });

    return map;
  }, [knowledgeGaps]);

  // =========================================================
  // RECOMMENDED COURSES
  // =========================================================

  const recommendedCourses = useMemo(() => {
    return courses
      .filter((course) => {
        // Course must have a skill
        if (!course.skill?.id) {
          return false;
        }

        // Course skill must exist in employee gaps
        return gapMap[course.skill.id];
      })
      .map((course) => {
        const gap = gapMap[course.skill.id];

        const gapValue =
          Number(gap?.gap || 0);

        let priority = "NO GAP";

        if (gapValue >= 3) {
          priority = "CRITICAL";
        } else if (gapValue === 2) {
          priority = "HIGH";
        } else if (gapValue === 1) {
          priority = "MEDIUM";
        }

        return {
          ...course,
          gap: gapValue,
          currentLevel:
            gap?.currentLevel ?? 0,
          requiredLevel:
            gap?.requiredLevel ?? 0,
          priority,
        };
      })
      .sort((a, b) => {
        const priorityOrder = {
          CRITICAL: 1,
          HIGH: 2,
          MEDIUM: 3,
          LOW: 4,
          "NO GAP": 5,
        };

        return (
          priorityOrder[a.priority] -
          priorityOrder[b.priority]
        );
      });
  }, [courses, gapMap]);

  // =========================================================
  // FILTER COURSES
  // =========================================================

  const filteredCourses = useMemo(() => {
    return recommendedCourses.filter(
      (course) => {
        const title =
          course.title?.toLowerCase() || "";

        const skill =
          course.skill?.skillName
            ?.toLowerCase() || "";

        const platform =
          course.platform?.toLowerCase() || "";

        const search =
          searchTerm.toLowerCase();

        const matchesSearch =
          title.includes(search) ||
          skill.includes(search) ||
          platform.includes(search);

        const matchesCategory =
          selectedCategory === "All" ||
          course.skill?.skillName ===
            selectedCategory;

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );
  }, [
    recommendedCourses,
    searchTerm,
    selectedCategory,
  ]);

  // =========================================================
  // SKILL CATEGORIES
  // =========================================================

  const skillCategories = useMemo(() => {
    const skills =
      recommendedCourses
        .map(
          (course) =>
            course.skill?.skillName
        )
        .filter(Boolean);

    return [...new Set(skills)];
  }, [recommendedCourses]);

  // =========================================================
  // PRIORITY STYLE
  // =========================================================

  const getPriorityStyle = (
    priority
  ) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-100 text-red-700 border-red-200";

      case "HIGH":
        return "bg-orange-100 text-orange-700 border-orange-200";

      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      case "LOW":
        return "bg-blue-100 text-blue-700 border-blue-200";

      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  // =========================================================
  // OPEN COURSE
  // =========================================================

  const openCourse = (url) => {
    if (!url) {
      alert(
        "Course URL is not available."
      );
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =========================================================
  // UPDATE LOCAL PROGRESS
  // =========================================================

  const updateProgress = (courseId) => {
    setLearningProgress(
      (previous) => ({
        ...previous,
        [courseId]: Math.min(
          (previous[courseId] || 0) +
            10,
          100
        ),
      })
    );
  };

  // =========================================================
  // PROGRESS
  // =========================================================

  const getProgress = (courseId) => {
    return learningProgress[courseId] || 0;
  };

  // =========================================================
  // COUNTS
  // =========================================================

  const criticalCourses =
    recommendedCourses.filter(
      (course) =>
        course.priority ===
          "CRITICAL" ||
        course.priority ===
          "HIGH"
    ).length;

  const inProgressCourses =
    recommendedCourses.filter(
      (course) => {
        const progress =
          getProgress(course.id);

        return (
          progress > 0 &&
          progress < 100
        );
      }
    ).length;

  const completedCourses =
    recommendedCourses.filter(
      (course) =>
        getProgress(course.id) ===
        100
    ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen flex bg-slate-50">

        <Sidebar role="EMPLOYEE" />

        <main className="flex-1 flex items-center justify-center">

          <div className="text-center">

            <RefreshCw
              size={35}
              className="mx-auto text-indigo-600 animate-spin"
            />

            <p className="mt-4 text-slate-600">
              Loading training recommendations...
            </p>

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* =====================================================
          EMPLOYEE SIDEBAR
      ===================================================== */}

      <Sidebar role="EMPLOYEE" />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="flex-1 min-w-0">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="bg-white border-b border-slate-200">

          <div className="px-5 md:px-8 py-5">

            <button
              onClick={() =>
                window.history.back()
              }
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-4"
            >
              <ArrowLeft size={18} />

              Back
            </button>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                Training & Learning
              </h1>

              <p className="text-slate-500 mt-1">
                Personalized training recommendations
                based on your knowledge gaps.
              </p>

            </div>

          </div>

        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="p-5 md:p-8 max-w-7xl mx-auto">

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">

              <div className="flex items-center justify-between gap-4">

                <p>
                  {error}
                </p>

                <button
                  onClick={
                    loadTrainingData
                  }
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Retry
                </button>

              </div>

            </div>
          )}

          {/* =================================================
              OVERVIEW CARDS
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

            {/* Recommended */}

            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Recommended Courses
                  </p>

                  <p className="text-3xl font-bold text-slate-800 mt-2">
                    {
                      recommendedCourses.length
                    }
                  </p>

                </div>

                <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">

                  <BookOpen size={21} />

                </div>

              </div>

            </div>

            {/* High Priority */}

            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    High Priority
                  </p>

                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {criticalCourses}
                  </p>

                </div>

                <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">

                  <AlertTriangle size={21} />

                </div>

              </div>

            </div>

            {/* In Progress */}

            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    In Progress
                  </p>

                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {inProgressCourses}
                  </p>

                </div>

                <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">

                  <BarChart3 size={21} />

                </div>

              </div>

            </div>

            {/* Completed */}

            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Completed
                  </p>

                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {completedCourses}
                  </p>

                </div>

                <div className="w-11 h-11 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">

                  <CheckCircle size={21} />

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              RECOMMENDED TRAINING
          ================================================= */}

          <section className="mb-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Recommended Training
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Courses matched to your identified
                  knowledge gaps.
                </p>

              </div>

              <button
                onClick={() =>
                  window.location.href =
                    "/knowledge-gap"
                }
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                View Knowledge Gaps →
              </button>

            </div>

            {/* =================================================
                SEARCH + FILTER
            ================================================= */}

            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5">

              <div className="flex flex-col md:flex-row gap-3">

                <div className="relative flex-1">

                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Search courses, skills or platforms..."
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                  />

                </div>

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(
                      event.target.value
                    )
                  }
                  className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 outline-none"
                >

                  <option value="All">
                    All Skills
                  </option>

                  {skillCategories.map(
                    (skill) => (
                      <option
                        key={skill}
                        value={skill}
                      >
                        {skill}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* =================================================
                NO COURSES
            ================================================= */}

            {filteredCourses.length ===
              0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">

                <BookOpen
                  size={45}
                  className="mx-auto text-slate-300"
                />

                <h3 className="text-lg font-semibold text-slate-700 mt-4">
                  No recommended courses found
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                  Courses will appear here when
                  they match your identified
                  knowledge gaps.
                </p>

              </div>
            )}

            {/* =================================================
                COURSE GRID
            ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {filteredCourses.map(
                (course) => {

                  const progress =
                    getProgress(
                      course.id
                    );

                  return (
                    <div
                      key={course.id}
                      className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition"
                    >

                      {/* Header */}

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <div className="flex flex-wrap items-center gap-2 mb-2">

                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                              {
                                course.skill
                                  ?.skillName
                              }
                            </span>

                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getPriorityStyle(
                                course.priority
                              )}`}
                            >
                              {course.priority}
                            </span>

                          </div>

                          <h3 className="text-lg font-bold text-slate-800">
                            {course.title}
                          </h3>

                        </div>

                      </div>

                      {/* Description */}

                      <p className="text-sm text-slate-500 mt-3 leading-6">
                        {course.description}
                      </p>

                      {/* Gap Information */}

                      <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">

                        <div className="flex items-center gap-2">

                          <AlertTriangle
                            size={16}
                            className="text-red-600"
                          />

                          <span className="text-sm font-semibold text-red-700">
                            Skill Gap:{" "}
                            {course.gap}
                          </span>

                        </div>

                        <p className="text-xs text-red-600 mt-1">

                          Current Level:{" "}
                          {course.currentLevel}

                          {" → "}

                          Required Level:{" "}
                          {course.requiredLevel}

                        </p>

                      </div>

                      {/* Meta */}

                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500">

                        <div className="flex items-center gap-1.5">

                          <BookMarked size={16} />

                          {course.level}

                        </div>

                        <div className="flex items-center gap-1.5">

                          <Clock size={16} />

                          {course.duration}

                        </div>

                      </div>

                      {/* Platform */}

                      <div className="mt-5 p-3 bg-slate-50 rounded-xl flex items-center justify-between">

                        <div>

                          <p className="text-xs text-slate-400">
                            Learning Platform
                          </p>

                          <p className="text-sm font-semibold text-slate-700 mt-0.5">
                            {course.platform}
                          </p>

                        </div>

                        <ExternalLink
                          size={17}
                          className="text-slate-400"
                        />

                      </div>

                      {/* Progress */}

                      {progress > 0 && (
                        <div className="mt-4">

                          <div className="flex justify-between text-xs text-slate-500 mb-2">

                            <span>
                              Learning Progress
                            </span>

                            <span className="font-semibold">
                              {progress}%
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
                      )}

                      {/* Actions */}

                      <div className="flex gap-2 mt-4">

                        <button
                          onClick={() =>
                            openCourse(
                              course.courseUrl
                            )
                          }
                          disabled={
                            !course.courseUrl
                          }
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >

                          <PlayCircle
                            size={18}
                          />

                          Start Learning

                          <ExternalLink
                            size={15}
                          />

                        </button>

                        <button
                          onClick={() =>
                            updateProgress(
                              course.id
                            )
                          }
                          className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
                        >
                          +10%
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </section>

          {/* =================================================
              AVAILABLE PLATFORMS
          ================================================= */}

          <section className="mb-8">

            <div className="mb-5">

              <h2 className="text-xl font-bold text-slate-800">
                Available Learning Platforms
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Platforms available through your course
                recommendations.
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {[
                ...new Set(
                  recommendedCourses
                    .map(
                      (course) =>
                        course.platform
                    )
                    .filter(Boolean)
                ),
              ].map((platform) => {

                const platformCourse =
                  recommendedCourses.find(
                    (course) =>
                      course.platform ===
                      platform
                  );

                return (
                  <button
                    key={platform}
                    onClick={() =>
                      openCourse(
                        platformCourse?.courseUrl
                      )
                    }
                    className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:shadow-md hover:border-indigo-200 transition"
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">

                          <GraduationCap
                            size={21}
                          />

                        </div>

                        <div>

                          <h3 className="font-semibold text-slate-800">
                            {platform}
                          </h3>

                          <p className="text-xs text-slate-500 mt-1">
                            Open learning resource
                          </p>

                        </div>

                      </div>

                      <ExternalLink
                        size={16}
                        className="text-slate-400"
                      />

                    </div>

                  </button>
                );
              })}

            </div>

          </section>

          {/* =================================================
              LEARNING PATH
          ================================================= */}

          <section className="bg-indigo-600 rounded-2xl p-6 md:p-8 text-white">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>

                <div className="flex items-center gap-3">

                  <GraduationCap
                    size={25}
                  />

                  <h2 className="text-xl font-bold">
                    Follow Your Personalized Learning Path
                  </h2>

                </div>

                <p className="text-indigo-100 mt-2 max-w-2xl">

                  Use your knowledge-gap results
                  and AI-generated recommendations
                  to follow a structured learning
                  roadmap.

                </p>

              </div>

              <button
                onClick={() =>
                  window.location.href =
                    "/learning-path"
                }
                className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-indigo-700 rounded-lg font-semibold hover:bg-indigo-50 transition whitespace-nowrap"
              >

                <BookOpen size={18} />

                View Learning Path

              </button>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default TrainingLearning;