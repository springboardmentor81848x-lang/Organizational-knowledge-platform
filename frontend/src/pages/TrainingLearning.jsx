import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  PlayCircle,
  ExternalLink,
  Clock,
  AlertTriangle,
  GraduationCap,
  ArrowLeft,
  Search,
  BookMarked,
  RefreshCw,
  CheckCircle,
  Circle,
  Trophy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import api from "../services/api";
import Sidebar from "../components/Sidebar";

function TrainingLearning() {
  // =========================================================
  // STATE
  // =========================================================

  const [courses, setCourses] = useState([]);
  const [knowledgeGaps, setKnowledgeGaps] = useState([]);

  // courseId -> progress percentage
  const [learningProgress, setLearningProgress] = useState({});

  // courseId -> enrollment object
  const [enrollments, setEnrollments] = useState({});

  // courseId -> milestone progress list
  const [courseMilestones, setCourseMilestones] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);

  const [expandedCourses, setExpandedCourses] = useState({});
  const [error, setError] = useState("");

  // =========================================================
  // LOCAL STORAGE
  // =========================================================

  const employeeId = localStorage.getItem("employeeId");

  // =========================================================
  // LOAD MILESTONES
  // =========================================================

  const loadCourseMilestones = async (courseId) => {
    try {
      const response = await api.get(
        `/employee-milestone-progress/employee/${employeeId}/course/${courseId}`
      );

      return response.data || [];
    } catch (err) {
      console.error(
        `Unable to load milestones for course ${courseId}:`,
        err
      );

      return [];
    }
  };

  // =========================================================
  // CALCULATE MILESTONE PROGRESS
  // =========================================================

  const calculateMilestoneProgress = (milestones) => {
    if (!milestones || milestones.length === 0) {
      return 0;
    }

    const total = milestones.reduce(
      (sum, milestone) =>
        sum +
        Number(
          milestone.progressPercentage ?? 0
        ),
      0
    );

    return Math.round(
      total / milestones.length
    );
  };

  // =========================================================
  // LOAD MILESTONES + SYNC PROGRESS
  // =========================================================

  const loadAndSyncCourseProgress = async (
    courseId,
    enrollment = null
  ) => {
    const milestones =
      await loadCourseMilestones(courseId);

    // ---------------------------------------------------------
    // CALCULATE COURSE PROGRESS FROM MILESTONES
    // ---------------------------------------------------------

    let calculatedProgress =
      calculateMilestoneProgress(milestones);

    // ---------------------------------------------------------
    // IF THERE ARE NO MILESTONES
    // USE ENROLLMENT PROGRESS
    // ---------------------------------------------------------

    if (
      milestones.length === 0 &&
      enrollment
    ) {
      calculatedProgress =
        Number(
          enrollment.progressPercentage ?? 0
        );
    }

    // ---------------------------------------------------------
    // UPDATE MILESTONES
    // ---------------------------------------------------------

    setCourseMilestones(
      (previous) => ({
        ...previous,
        [courseId]: milestones,
      })
    );

    // ---------------------------------------------------------
    // UPDATE LEARNING PROGRESS
    // ---------------------------------------------------------

    setLearningProgress(
      (previous) => ({
        ...previous,
        [courseId]: calculatedProgress,
      })
    );

    // ---------------------------------------------------------
    // UPDATE ENROLLMENT DISPLAY
    // ---------------------------------------------------------

    if (enrollment) {
      setEnrollments(
        (previous) => {
          const existing =
            previous[courseId] || enrollment;

          return {
            ...previous,
            [courseId]: {
              ...existing,
              progressPercentage:
                calculatedProgress,

              status:
                calculatedProgress === 100
                  ? "COMPLETED"
                  : calculatedProgress > 0
                    ? "IN_PROGRESS"
                    : existing.status ||
                      "NOT_STARTED",
            },
          };
        }
      );
    }

    return {
      milestones,
      progress: calculatedProgress,
    };
  };

  // =========================================================
  // LOAD TRAINING DATA
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

      // =====================================================
      // KNOWLEDGE GAPS
      // =====================================================

      const gapsResponse =
        await api.get(
          `/knowledge-gaps/employee/${employeeId}`
        );

      // =====================================================
      // ALL COURSES
      // =====================================================

      const coursesResponse =
        await api.get("/courses");

      // =====================================================
      // ENROLLMENTS
      // =====================================================

      let enrollmentData = [];

      try {
        const enrollmentResponse =
          await api.get(
            `/training-enrollments/employee/${employeeId}`
          );

        enrollmentData =
          enrollmentResponse.data || [];
      } catch (enrollmentError) {
        console.error(
          "Training enrollment API error:",
          enrollmentError
        );

        enrollmentData = [];
      }

      // =====================================================
      // SAVE BASIC DATA
      // =====================================================

      const loadedCourses =
        coursesResponse.data || [];

      setKnowledgeGaps(
        gapsResponse.data || []
      );

      setCourses(
        loadedCourses
      );

      // =====================================================
      // BUILD ENROLLMENT MAP
      // =====================================================

      const enrollmentMap = {};

      enrollmentData.forEach(
        (enrollment) => {
          const courseId =
            enrollment.course?.id ??
            enrollment.courseId;

          if (
            courseId !== undefined &&
            courseId !== null
          ) {
            enrollmentMap[courseId] =
              enrollment;
          }
        }
      );

      setEnrollments(
        enrollmentMap
      );

      // =====================================================
      // LOAD MILESTONES FOR EVERY ENROLLED COURSE
      // =====================================================

      const milestoneMap = {};
      const progressMap = {};

      const enrolledCourseIds =
        Object.keys(enrollmentMap);

      await Promise.all(
        enrolledCourseIds.map(
          async (courseId) => {
            const enrollment =
              enrollmentMap[courseId];

            const result =
              await loadAndSyncCourseProgress(
                courseId,
                enrollment
              );

            milestoneMap[courseId] =
              result.milestones;

            progressMap[courseId] =
              result.progress;
          }
        )
      );

      // =====================================================
      // SET FINAL MAPS
      // =====================================================

      setCourseMilestones(
        milestoneMap
      );

      setLearningProgress(
        progressMap
      );

      // =====================================================
      // AUTO EXPAND ENROLLED COURSES
      // =====================================================

      const expandedMap = {};

      enrolledCourseIds.forEach(
        (courseId) => {
          expandedMap[courseId] = true;
        }
      );

      setExpandedCourses(
        expandedMap
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
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadTrainingData();
  }, []);

  // =========================================================
  // KNOWLEDGE GAP MAP
  // =========================================================

  const gapMap = useMemo(() => {
    const map = {};

    knowledgeGaps.forEach(
      (gap) => {
        if (gap.skill?.id) {
          map[gap.skill.id] =
            gap;
        }
      }
    );

    return map;
  }, [knowledgeGaps]);

  // =========================================================
  // RECOMMENDED COURSES
  // =========================================================

  const recommendedCourses = useMemo(() => {
    return courses
      .filter((course) => {
        if (!course.skill?.id) {
          return false;
        }

        return !!gapMap[
          course.skill.id
        ];
      })
      .map((course) => {
        const gap =
          gapMap[
            course.skill.id
          ];

        const gapValue =
          Number(gap?.gap || 0);

        let priority = "LOW";

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
        };

        return (
          priorityOrder[a.priority] -
          priorityOrder[b.priority]
        );
      });
  }, [courses, gapMap]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredCourses =
    useMemo(() => {
      return recommendedCourses.filter(
        (course) => {
          const title =
            course.title
              ?.toLowerCase() || "";

          const skill =
            course.skill?.skillName
              ?.toLowerCase() || "";

          const platform =
            course.platform
              ?.toLowerCase() || "";

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

  const skillCategories =
    useMemo(() => {
      const skills =
        recommendedCourses
          .map(
            (course) =>
              course.skill?.skillName
          )
          .filter(Boolean);

      return [
        ...new Set(skills),
      ];
    }, [
      recommendedCourses,
    ]);

  // =========================================================
  // GET PROGRESS
  // =========================================================

  const getProgress = (courseId) => {
    return Number(
      learningProgress[courseId] ?? 0
    );
  };

  // =========================================================
  // GET ENROLLMENT
  // =========================================================

  const getEnrollment = (courseId) => {
    return enrollments[courseId];
  };

  // =========================================================
  // GET MILESTONES
  // =========================================================

  const getMilestones = (courseId) => {
    return courseMilestones[courseId] || [];
  };

  // =========================================================
  // COMPLETED MILESTONES
  // =========================================================

  const getCompletedMilestones =
    (courseId) => {
      const milestones =
        getMilestones(courseId);

      return milestones.filter(
        (milestone) =>
          Number(
            milestone.progressPercentage ?? 0
          ) === 100
      ).length;
    };

  // =========================================================
  // TOTAL MILESTONES
  // =========================================================

  const getTotalMilestones =
    (courseId) => {
      return getMilestones(courseId).length;
    };

  // =========================================================
  // CALCULATE COURSE PROGRESS
  // =========================================================

  const calculateCourseProgress =
    (courseId) => {
      const milestones =
        getMilestones(courseId);

      if (!milestones.length) {
        return getProgress(
          courseId
        );
      }

      return calculateMilestoneProgress(
        milestones
      );
    };

  // =========================================================
  // TOGGLE MILESTONES
  // =========================================================

  const toggleMilestones =
    (courseId) => {
      setExpandedCourses(
        (previous) => ({
          ...previous,
          [courseId]:
            !previous[courseId],
        })
      );
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
  // ENROLL COURSE
  // =========================================================

  const enrollCourse = async (course) => {
    try {
      setProgressLoading(true);

      let enrollment =
        getEnrollment(course.id);

      // =====================================================
      // CREATE ENROLLMENT
      // =====================================================

      if (!enrollment) {
        const response =
          await api.post(
            `/training-enrollments/employee/${employeeId}/course/${course.id}`
          );

        enrollment =
          response.data;

        setEnrollments(
          (previous) => ({
            ...previous,
            [course.id]:
              enrollment,
          })
        );

        // ---------------------------------------------------
        // LOAD MILESTONES
        // ---------------------------------------------------

        const result =
          await loadAndSyncCourseProgress(
            course.id,
            enrollment
          );

        setCourseMilestones(
          (previous) => ({
            ...previous,
            [course.id]:
              result.milestones,
          })
        );

        setLearningProgress(
          (previous) => ({
            ...previous,
            [course.id]:
              result.progress,
          })
        );

        setExpandedCourses(
          (previous) => ({
            ...previous,
            [course.id]: true,
          })
        );
      }

      // =====================================================
      // START TRAINING
      // =====================================================

      if (
        enrollment.status ===
        "NOT_STARTED"
      ) {
        const response =
          await api.put(
            `/training-enrollments/${enrollment.id}/start`
          );

        enrollment =
          response.data;

        setEnrollments(
          (previous) => ({
            ...previous,
            [course.id]:
              enrollment,
          })
        );
      }

      // =====================================================
      // ALWAYS RELOAD MILESTONES AFTER START
      // =====================================================

      const result =
        await loadAndSyncCourseProgress(
          course.id,
          enrollment
        );

      // =====================================================
      // FINAL SYNC
      // =====================================================

      setCourseMilestones(
        (previous) => ({
          ...previous,
          [course.id]:
            result.milestones,
        })
      );

      setLearningProgress(
        (previous) => ({
          ...previous,
          [course.id]:
            result.progress,
        })
      );

      setEnrollments(
        (previous) => {
          const current =
            previous[course.id] ||
            enrollment;

          return {
            ...previous,

            [course.id]: {
              ...current,

              progressPercentage:
                result.progress,

              status:
                result.progress === 100
                  ? "COMPLETED"
                  : result.progress > 0
                    ? "IN_PROGRESS"
                    : enrollment.status,
            },
          };
        }
      );

      setExpandedCourses(
        (previous) => ({
          ...previous,
          [course.id]: true,
        })
      );

      return true;
    } catch (err) {
      console.error(
        "Enrollment error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to enroll in this course."
      );

      return false;
    } finally {
      setProgressLoading(false);
    }
  };

  // =========================================================
  // START / CONTINUE LEARNING
  // =========================================================

  const startLearning = async (course) => {
    const success =
      await enrollCourse(course);

    if (!success) {
      return;
    }

    openCourse(
      course.courseUrl
    );
  };

  // =========================================================
  // MARK MILESTONE COMPLETE
  // =========================================================

  const markMilestoneComplete =
    async (
      course,
      milestoneProgress
    ) => {
      if (!milestoneProgress?.id) {
        alert(
          "Milestone progress record not found."
        );

        return;
      }

      if (
        Number(
          milestoneProgress.progressPercentage ?? 0
        ) === 100
      ) {
        return;
      }

      try {
        setProgressLoading(true);

        // ===================================================
        // COMPLETE MILESTONE
        // ===================================================

        const response =
          await api.put(
            `/employee-milestone-progress/${milestoneProgress.id}/complete`
          );

        const updatedMilestone =
          response.data;

        // ===================================================
        // UPDATE MILESTONE LOCALLY
        // ===================================================

        setCourseMilestones(
          (previous) => {
            const existing =
              previous[course.id] || [];

            return {
              ...previous,

              [course.id]:
                existing.map(
                  (milestone) =>
                    milestone.id ===
                    milestoneProgress.id
                      ? updatedMilestone
                      : milestone
                ),
            };
          }
        );

        // ===================================================
        // RELOAD FROM BACKEND
        // Backend recalculates LearningProgress + Enrollment
        // ===================================================

        const result =
          await loadAndSyncCourseProgress(
            course.id,
            getEnrollment(course.id)
          );

        // ===================================================
        // UPDATE FRONTEND FROM BACKEND
        // ===================================================

        setCourseMilestones(
          (previous) => ({
            ...previous,
            [course.id]:
              result.milestones,
          })
        );

        setLearningProgress(
          (previous) => ({
            ...previous,
            [course.id]:
              result.progress,
          })
        );

        // ===================================================
        // UPDATE ENROLLMENT
        // ===================================================

        setEnrollments(
          (previous) => {
            const enrollment =
              previous[course.id];

            if (!enrollment) {
              return previous;
            }

            return {
              ...previous,

              [course.id]: {
                ...enrollment,

                progressPercentage:
                  result.progress,

                status:
                  result.progress === 100
                    ? "COMPLETED"
                    : result.progress > 0
                      ? "IN_PROGRESS"
                      : enrollment.status,
              },
            };
          }
        );

        // ===================================================
        // SUCCESS MESSAGE
        // ===================================================

        const completedMilestones =
          result.milestones.filter(
            (milestone) =>
              Number(
                milestone.progressPercentage ?? 0
              ) === 100
          ).length;

        const totalMilestones =
          result.milestones.length;

        if (
          result.progress === 100
        ) {
          alert(
            "🎉 All milestones completed! Course completed successfully!"
          );
        } else {
          alert(
            `Milestone completed! ${completedMilestones} / ${totalMilestones} milestones completed. Course progress: ${result.progress}%.`
          );
        }
      } catch (err) {
        console.error(
          "Milestone completion error:",
          err
        );

        alert(
          err.response?.data?.message ||
            "Unable to complete milestone."
        );
      } finally {
        setProgressLoading(false);
      }
    };

  // =========================================================
  // PRIORITY STYLE
  // =========================================================

  const getPriorityStyle =
    (priority) => {
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
          return "bg-slate-100 text-slate-700 border-slate-200";
      }
    };

  // =========================================================
  // COUNTS
  // =========================================================

  const highPriorityCourses =
    recommendedCourses.filter(
      (course) =>
        course.priority === "CRITICAL" ||
        course.priority === "HIGH"
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
        getProgress(course.id) === 100
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
      <Sidebar role="EMPLOYEE" />

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

            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Training & Learning
            </h1>

            <p className="text-slate-500 mt-1">
              Personalized training recommendations
              based on your knowledge gaps.
            </p>

          </div>
        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="p-5 md:p-8 max-w-7xl mx-auto">

          {/* ERROR */}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p>{error}</p>

                <button
                  onClick={loadTrainingData}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* =================================================
              OVERVIEW
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-sm text-slate-500">
                Recommended Courses
              </p>

              <p className="text-3xl font-bold text-slate-800 mt-2">
                {recommendedCourses.length}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-sm text-slate-500">
                High Priority
              </p>

              <p className="text-3xl font-bold text-orange-600 mt-2">
                {highPriorityCourses}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-sm text-slate-500">
                In Progress
              </p>

              <p className="text-3xl font-bold text-blue-600 mt-2">
                {inProgressCourses}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-sm text-slate-500">
                Completed
              </p>

              <p className="text-3xl font-bold text-green-600 mt-2">
                {completedCourses}
              </p>
            </div>

          </div>

          {/* =================================================
              SEARCH
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
                className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white"
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
              COURSE GRID
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {filteredCourses.map(
              (course) => {

                const progress =
                  getProgress(course.id);

                const enrollment =
                  getEnrollment(course.id);

                const milestones =
                  getMilestones(course.id);

                const completedMilestones =
                  getCompletedMilestones(
                    course.id
                  );

                const totalMilestones =
                  getTotalMilestones(
                    course.id
                  );

                const milestoneProgress =
                  calculateCourseProgress(
                    course.id
                  );

                const isStarted =
                  !!enrollment;

                const isCompleted =
                  progress === 100;

                const milestonesExpanded =
                  expandedCourses[
                    course.id
                  ];

                return (
                  <div
                    key={course.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition"
                  >

                    {/* COURSE HEADER */}

                    <div className="flex flex-wrap items-center gap-2 mb-2">

                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                        {course.skill?.skillName}
                      </span>

                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getPriorityStyle(
                          course.priority
                        )}`}
                      >
                        {course.priority}
                      </span>

                      {enrollment && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                          {enrollment.status}
                        </span>
                      )}

                    </div>

                    {/* TITLE */}

                    <h3 className="text-lg font-bold text-slate-800">
                      {course.title}
                    </h3>

                    {/* DESCRIPTION */}

                    <p className="text-sm text-slate-500 mt-3 leading-6">
                      {course.description}
                    </p>

                    {/* SKILL GAP */}

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

                    {/* META */}

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

                    {/* PLATFORM */}

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

                    {/* COURSE PROGRESS */}

                    {isStarted && (
                      <div className="mt-5">

                        <div className="flex items-center justify-between mb-2">

                          <div className="flex items-center gap-2">

                            <Trophy
                              size={16}
                              className="text-indigo-600"
                            />

                            <span className="text-sm font-semibold text-slate-700">
                              Course Progress
                            </span>

                          </div>

                          <span className="text-sm font-bold text-indigo-600">
                            {progress}%
                          </span>

                        </div>

                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

                          <div
                            className={`h-full rounded-full transition-all ${
                              progress === 100
                                ? "bg-green-500"
                                : "bg-indigo-600"
                            }`}
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                        <div className="flex justify-between mt-2 text-xs text-slate-500">

                          <span>
                            {completedMilestones}
                            {" / "}
                            {totalMilestones}
                            {" milestones completed"}
                          </span>

                          <span>
                            {milestoneProgress}%
                          </span>

                        </div>

                      </div>
                    )}

                    {/* MILESTONES */}

                    {isStarted &&
                      milestones.length > 0 && (
                        <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden">

                          <button
                            onClick={() =>
                              toggleMilestones(
                                course.id
                              )
                            }
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition"
                          >

                            <div className="flex items-center gap-2">

                              <GraduationCap
                                size={18}
                                className="text-indigo-600"
                              />

                              <span className="font-semibold text-slate-700">
                                Learning Milestones
                              </span>

                              <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                {completedMilestones}
                                /
                                {totalMilestones}
                              </span>

                            </div>

                            {milestonesExpanded ? (
                              <ChevronUp
                                size={18}
                              />
                            ) : (
                              <ChevronDown
                                size={18}
                              />
                            )}

                          </button>

                          {milestonesExpanded && (
                            <div className="p-4 space-y-3">

                              {milestones.map(
                                (
                                  milestone,
                                  index
                                ) => {

                                  const completed =
                                    Number(
                                      milestone.progressPercentage ?? 0
                                    ) === 100;

                                  return (
                                    <div
                                      key={
                                        milestone.id
                                      }
                                      className={`p-4 rounded-xl border ${
                                        completed
                                          ? "bg-green-50 border-green-200"
                                          : "bg-white border-slate-200"
                                      }`}
                                    >

                                      <div className="flex items-start gap-3">

                                        <div className="mt-0.5">

                                          {completed ? (
                                            <CheckCircle
                                              size={21}
                                              className="text-green-600"
                                            />
                                          ) : (
                                            <Circle
                                              size={21}
                                              className="text-slate-400"
                                            />
                                          )}

                                        </div>

                                        <div className="flex-1 min-w-0">

                                          <div className="flex items-center justify-between gap-3">

                                            <div>

                                              <p className="text-xs text-slate-400">
                                                Milestone{" "}
                                                {index + 1}
                                              </p>

                                              <h4 className="font-semibold text-slate-800">
                                                {milestone.milestone?.title ||
                                                  milestone.title ||
                                                  `Milestone ${
                                                    index + 1
                                                  }`}
                                              </h4>

                                            </div>

                                            <span
                                              className={`text-xs font-semibold ${
                                                completed
                                                  ? "text-green-600"
                                                  : "text-slate-500"
                                              }`}
                                            >
                                              {completed
                                                ? "COMPLETED"
                                                : "NOT STARTED"}
                                            </span>

                                          </div>

                                          {(milestone.milestone?.description ||
                                            milestone.description) && (
                                            <p className="text-xs text-slate-500 mt-2 leading-5">
                                              {milestone.milestone?.description ||
                                                milestone.description}
                                            </p>
                                          )}

                                          <div className="mt-3">

                                            {!completed ? (
                                              <button
                                                onClick={() =>
                                                  markMilestoneComplete(
                                                    course,
                                                    milestone
                                                  )
                                                }
                                                disabled={
                                                  progressLoading
                                                }
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:bg-slate-300"
                                              >
                                                <CheckCircle
                                                  size={15}
                                                />

                                                Mark Milestone Complete
                                              </button>
                                            ) : (
                                              <div className="flex items-center gap-2 text-xs font-semibold text-green-600">

                                                <CheckCircle
                                                  size={15}
                                                />

                                                Milestone Completed

                                              </div>
                                            )}

                                          </div>

                                        </div>

                                      </div>

                                    </div>
                                  );
                                }
                              )}

                            </div>
                          )}

                        </div>
                      )}

                    {/* ACTION */}

                    <div className="flex gap-2 mt-5">

                      {!isCompleted && (
                        <button
                          onClick={() =>
                            startLearning(
                              course
                            )
                          }
                          disabled={
                            progressLoading ||
                            !course.courseUrl
                          }
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-slate-300"
                        >

                          <PlayCircle
                            size={18}
                          />

                          {isStarted
                            ? "Continue Learning"
                            : "Start Learning"}

                          <ExternalLink
                            size={15}
                          />

                        </button>
                      )}

                      {isCompleted && (
                        <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-lg font-semibold">

                          <CheckCircle
                            size={18}
                          />

                          Course Completed

                        </div>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

          {/* =================================================
              NO COURSES
          ================================================= */}

          {filteredCourses.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">

              <BookOpen
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="text-lg font-semibold text-slate-700 mt-4">
                No training courses found
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                No courses match your current search
                or knowledge gaps.
              </p>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default TrainingLearning;