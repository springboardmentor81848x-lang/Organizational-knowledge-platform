import { useEffect, useState } from "react";

import api from "../services/api";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  BookOpen,
  CheckCircle2,
  Clock3,
  CalendarDays,
  TrendingUp,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Award,
  CalendarCheck,
  BarChart3,
  Activity,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// =========================================================
// API
// =========================================================
// Do not define API_BASE_URL here.
// All requests should use the shared api service:
//
// api.get("/endpoint")
// api.post("/endpoint", data)
// api.put("/endpoint", data)
// api.delete("/endpoint")

// =========================================================
// LEARNING PROGRESS
// =========================================================

function LearningProgress() {
  // =========================================================
  // EMPLOYEE INFORMATION
  // =========================================================

  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";

  const employeeIdentifier =
    localStorage.getItem("employeeId");

  const fullName = [firstName, lastName]
    .filter(Boolean)
    .join(" ");

  // =========================================================
  // STATE
  // =========================================================

  const [enrollments, setEnrollments] = useState([]);

  // Used internally only to calculate module counts.
  // Milestone details are NOT displayed.
  const [milestoneProgress, setMilestoneProgress] =
    useState({});

  // Learning history used for analytics chart.
  const [learningHistory, setLearningHistory] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // AUTH HEADERS
  // =========================================================

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: token
          ? `Bearer ${token}`
          : "",
        "Content-Type": "application/json",
      },
    };
  };

  // =========================================================
  // LOAD LEARNING PROGRESS
  // =========================================================

  const loadLearningProgress = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      // -------------------------------------------------------
      // CHECK EMPLOYEE
      // -------------------------------------------------------

      if (!employeeIdentifier) {
        setError(
          "Employee ID not found. Please login again."
        );
        return;
      }

      // =======================================================
      // 1. GET TRAINING ENROLLMENTS
      // =======================================================

      const enrollmentResponse = await axios.get(
        `${API_BASE_URL}/training-enrollments/employee/${employeeIdentifier}`,
        getHeaders()
      );

      const employeeEnrollments =
        Array.isArray(enrollmentResponse.data)
          ? enrollmentResponse.data
          : [];

      console.log(
        "Training Enrollments:",
        employeeEnrollments
      );

      setEnrollments(employeeEnrollments);

      // =======================================================
      // 2. GET MODULE DATA
      // =======================================================
      //
      // Milestone details are NOT shown in the UI.
      // They are only used internally for:
      //
      // Total Modules
      // Completed Modules
      // Remaining Modules
      //
      // =======================================================

      const milestoneData = {};

      await Promise.all(
        employeeEnrollments.map(async (enrollment) => {
          const courseId =
            enrollment?.course?.id;

          if (!courseId) {
            return;
          }

          try {
            const response = await axios.get(
              `${API_BASE_URL}/employee-milestone-progress/employee/${employeeIdentifier}/course/${courseId}`,
              getHeaders()
            );

            milestoneData[courseId] =
              Array.isArray(response.data)
                ? response.data
                : [];
          } catch (milestoneError) {
            console.warn(
              `No module progress available for course ${courseId}`,
              milestoneError
            );

            milestoneData[courseId] = [];
          }
        })
      );

      setMilestoneProgress(milestoneData);

      // =======================================================
      // 3. GET LEARNING PROGRESS HISTORY
      // =======================================================
      //
      // This data is used for Learning Analytics.
      //
      // Expected endpoint:
      //
      // GET
      // /learning-progress-history/employee/{employeeIdentifier}
      //
      // =======================================================

      try {
        const historyResponse = await axios.get(
          `${API_BASE_URL}/learning-progress-history/employee/${employeeIdentifier}`,
          getHeaders()
        );

        const historyData =
          Array.isArray(historyResponse.data)
            ? historyResponse.data
            : [];

        console.log(
          "Learning Progress History:",
          historyData
        );

        setLearningHistory(historyData);
      } catch (historyError) {
        console.warn(
          "Learning progress history could not be loaded:",
          historyError
        );

        // Do not fail the complete page if analytics
        // history is unavailable.
        setLearningHistory([]);
      }
    } catch (err) {
      console.error(
        "Learning progress loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load learning progress."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadLearningProgress();
  }, []);

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = (status) => {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "COMPLETED":
        return "Completed";

      case "IN_PROGRESS":
        return "In Progress";

      case "CERTIFIED":
        return "Certified";

      case "EXPIRED":
      case "EXPIRED_RENEWAL":
        return "Expired / Renewal";

      case "CANCELLED":
        return "Cancelled";

      case "NOT_STARTED":
      default:
        return "Not Started";
    }
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (status) => {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "COMPLETED":
        return {
          badge: "bg-green-100 text-green-700",
          icon: "text-green-600",
        };

      case "IN_PROGRESS":
        return {
          badge: "bg-blue-100 text-blue-700",
          icon: "text-blue-600",
        };

      case "CERTIFIED":
        return {
          badge: "bg-purple-100 text-purple-700",
          icon: "text-purple-600",
        };

      case "EXPIRED":
      case "EXPIRED_RENEWAL":
        return {
          badge: "bg-red-100 text-red-700",
          icon: "text-red-600",
        };

      case "CANCELLED":
        return {
          badge: "bg-gray-100 text-gray-700",
          icon: "text-gray-500",
        };

      default:
        return {
          badge: "bg-yellow-100 text-yellow-700",
          icon: "text-yellow-600",
        };
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  // =========================================================
  // FORMAT HISTORY DATE
  // =========================================================

  const formatHistoryDate = (date) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
        }
      );
    } catch {
      return date;
    }
  };

  // =========================================================
  // COURSE TITLE
  // =========================================================

  const getCourseTitle = (enrollment) => {
    return (
      enrollment?.course?.title ||
      "Untitled Course"
    );
  };

  // =========================================================
  // COURSE DESCRIPTION
  // =========================================================

  const getCourseDescription = (enrollment) => {
    return (
      enrollment?.course?.description ||
      "No course description available."
    );
  };

  // =========================================================
  // COURSE URL
  // =========================================================

  const getCourseUrl = (enrollment) => {
    return (
      enrollment?.course?.courseUrl ||
      ""
    );
  };

  // =========================================================
  // GET COURSE MODULES
  // =========================================================

  const getCourseModules = (enrollment) => {
    const courseId =
      enrollment?.course?.id;

    if (!courseId) {
      return [];
    }

    return (
      milestoneProgress[courseId] ||
      []
    );
  };

  // =========================================================
  // COMPLETED MODULES
  // =========================================================

  const getCompletedModules = (modules) => {
    return modules.filter((module) => {
      const status =
        String(
          module?.status || ""
        ).toUpperCase();

      const progress =
        Number(
          module?.progressPercentage || 0
        );

      return (
        status === "COMPLETED" ||
        progress === 100
      );
    }).length;
  };

  // =========================================================
  // REMAINING MODULES
  // =========================================================

  const getRemainingModules = (
    totalModules,
    completedModules
  ) => {
    return Math.max(
      totalModules - completedModules,
      0
    );
  };

  // =========================================================
  // CERTIFICATION STATUS
  // =========================================================

  const getCertificationStatus = (
    enrollment
  ) => {
    const status =
      String(
        enrollment?.status || ""
      ).toUpperCase();

    if (status === "CERTIFIED") {
      return "Certified";
    }

    if (
      status === "EXPIRED" ||
      status === "EXPIRED_RENEWAL"
    ) {
      return "Expired / Renewal";
    }

    if (status === "COMPLETED") {
      return "Certification Pending";
    }

    return "Not Available";
  };

  // =========================================================
  // CERTIFICATION STYLE
  // =========================================================

  const getCertificationStyle = (
    enrollment
  ) => {
    const status =
      String(
        enrollment?.status || ""
      ).toUpperCase();

    if (status === "CERTIFIED") {
      return {
        container:
          "border-purple-200 bg-purple-50",
        icon:
          "text-purple-600",
        title:
          "text-purple-700",
      };
    }

    if (
      status === "EXPIRED" ||
      status === "EXPIRED_RENEWAL"
    ) {
      return {
        container:
          "border-red-200 bg-red-50",
        icon:
          "text-red-600",
        title:
          "text-red-700",
      };
    }

    if (status === "COMPLETED") {
      return {
        container:
          "border-orange-200 bg-orange-50",
        icon:
          "text-orange-600",
        title:
          "text-orange-700",
      };
    }

    return {
      container:
        "border-gray-200 bg-gray-50",
      icon:
        "text-gray-500",
      title:
        "text-gray-600",
    };
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
  // OPEN CERTIFICATE
  // =========================================================

  const openCertificate = (url) => {
    if (!url) {
      alert(
        "Certificate URL is not available."
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
  // LEARNING ANALYTICS
  // =========================================================

  const totalCourses =
    enrollments.length;

  const completedCourses =
    enrollments.filter((enrollment) => {
      const status =
        String(
          enrollment?.status || ""
        ).toUpperCase();

      return (
        status === "COMPLETED" ||
        status === "CERTIFIED"
      );
    }).length;

  const inProgressCourses =
    enrollments.filter((enrollment) => {
      const status =
        String(
          enrollment?.status || ""
        ).toUpperCase();

      return status === "IN_PROGRESS";
    }).length;

  const averageProgress =
    totalCourses > 0
      ? Math.round(
          enrollments.reduce(
            (total, enrollment) =>
              total +
              Number(
                enrollment?.progressPercentage ?? 0
              ),
            0
          ) / totalCourses
        )
      : 0;

  // =========================================================
  // PREPARE CHART DATA
  // =========================================================

  const analyticsChartData =
    [...learningHistory]
      .sort((a, b) => {
        const dateA = new Date(
          a?.recordedAt || 0
        ).getTime();

        const dateB = new Date(
          b?.recordedAt || 0
        ).getTime();

        return dateA - dateB;
      })
      .map((history) => ({
        date: formatHistoryDate(
          history?.recordedAt
        ),
        progress:
          Number(
            history?.progressPercentage ?? 0
          ),
        event:
          history?.eventType ||
          "Progress Update",
        course:
          history?.course?.title ||
          "Course",
      }));

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="EMPLOYEE" />

        <div className="flex-1 min-w-0">
          <Navbar title="Learning Progress" />

          <main className="p-8">
            <div className="bg-white rounded-2xl shadow p-10 text-center">
              <GraduationCap
                size={48}
                className="text-indigo-500 animate-pulse mx-auto"
              />

              <p className="text-gray-600 text-lg mt-4">
                Loading your learning progress...
              </p>
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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="EMPLOYEE" />

      <div className="flex-1 min-w-0">
        <Navbar title="Learning Progress" />

        <main className="p-8">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Learning Progress
                </h1>

                <p className="text-gray-500 mt-2 text-lg">
                  Track your course completion and learning journey.

                  {fullName && (
                    <>
                      {" "}Welcome,{" "}
                      <span className="font-semibold text-slate-700">
                        {fullName}
                      </span>.
                    </>
                  )}
                </p>
              </div>

              <button
                onClick={() =>
                  loadLearningProgress(true)
                }
                disabled={refreshing}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-300"
              >
                <RefreshCw
                  size={18}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh Progress"}
              </button>
            </div>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle
                size={22}
                className="text-red-600"
              />

              <p className="text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* =================================================
              LEARNING ANALYTICS
          ================================================= */}

          {enrollments.length > 0 && (
            <div className="mb-8">

              <div className="flex items-center gap-3 mb-5">
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <BarChart3
                    size={25}
                    className="text-indigo-600"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Learning Analytics
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Overview of your training progress and learning activity.
                  </p>
                </div>
              </div>

              {/* =================================================
                  ANALYTICS SUMMARY CARDS
              ================================================= */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">

                {/* TOTAL COURSES */}

                <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
                  <div className="flex items-center gap-4">

                    <div className="bg-indigo-100 p-3 rounded-xl">
                      <BookOpen
                        size={25}
                        className="text-indigo-600"
                      />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Total Courses
                      </p>

                      <p className="text-2xl font-bold text-slate-800">
                        {totalCourses}
                      </p>
                    </div>

                  </div>
                </div>

                {/* COMPLETED COURSES */}

                <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
                  <div className="flex items-center gap-4">

                    <div className="bg-green-100 p-3 rounded-xl">
                      <CheckCircle2
                        size={25}
                        className="text-green-600"
                      />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Completed Courses
                      </p>

                      <p className="text-2xl font-bold text-green-700">
                        {completedCourses}
                      </p>
                    </div>

                  </div>
                </div>

                {/* IN PROGRESS */}

                <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
                  <div className="flex items-center gap-4">

                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Activity
                        size={25}
                        className="text-blue-600"
                      />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        In Progress
                      </p>

                      <p className="text-2xl font-bold text-blue-700">
                        {inProgressCourses}
                      </p>
                    </div>

                  </div>
                </div>

                {/* AVERAGE PROGRESS */}

                <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
                  <div className="flex items-center gap-4">

                    <div className="bg-purple-100 p-3 rounded-xl">
                      <TrendingUp
                        size={25}
                        className="text-purple-600"
                      />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Average Progress
                      </p>

                      <p className="text-2xl font-bold text-purple-700">
                        {averageProgress}%
                      </p>
                    </div>

                  </div>
                </div>

              </div>

              {/* =================================================
                  PROGRESS CHART
              ================================================= */}

              <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">

                <div className="flex items-center justify-between mb-6">

                  <div>
                    <h3 className="text-xl font-bold text-slate-800">
                      Progress Over Time
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Your recorded learning progress from training activity.
                    </p>
                  </div>

                  <div className="bg-indigo-100 p-3 rounded-xl">
                    <TrendingUp
                      size={23}
                      className="text-indigo-600"
                    />
                  </div>

                </div>

                {analyticsChartData.length > 0 ? (
                  <div className="w-full h-[350px]">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <LineChart
                        data={analyticsChartData}
                        margin={{
                          top: 10,
                          right: 20,
                          left: 0,
                          bottom: 10,
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          dataKey="date"
                          tick={{
                            fontSize: 12,
                          }}
                        />

                        <YAxis
                          domain={[0, 100]}
                          tickFormatter={(value) =>
                            `${value}%`
                          }
                        />

                        <Tooltip
                          formatter={(value) => [
                            `${value}%`,
                            "Progress",
                          ]}
                          labelFormatter={(
                            label,
                            payload
                          ) => {
                            const item =
                              payload?.[0]?.payload;

                            if (
                              item?.course
                            ) {
                              return `${label} • ${item.course}`;
                            }

                            return label;
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="progress"
                          strokeWidth={3}
                          dot={{
                            r: 5,
                          }}
                          activeDot={{
                            r: 7,
                          }}
                        />

                      </LineChart>
                    </ResponsiveContainer>

                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-center">

                    <TrendingUp
                      size={50}
                      className="text-gray-300 mb-4"
                    />

                    <h4 className="text-lg font-semibold text-slate-700">
                      No Learning History Yet
                    </h4>

                    <p className="text-gray-500 mt-2 max-w-md">
                      Your progress chart will appear here
                      after you start or update a training course.
                    </p>

                  </div>
                )}

              </div>

            </div>
          )}

          {/* =================================================
              NO ENROLLMENTS
          ================================================= */}

          {enrollments.length === 0 ? (

            <div className="bg-white rounded-2xl shadow border border-gray-100 p-12 text-center">

              <BookOpen
                size={64}
                className="mx-auto text-gray-400 mb-5"
              />

              <h2 className="text-2xl font-bold text-slate-800">
                No Training Enrollments
              </h2>

              <p className="text-gray-500 mt-3 text-lg">
                You are not enrolled in any
                training courses yet.
              </p>

              <p className="text-gray-400 mt-2">
                Start a recommended course from
                Training & Learning to begin
                tracking your progress.
              </p>

            </div>

          ) : (

            <div className="space-y-8">

              {enrollments.map(
                (enrollment, index) => {

                  const courseId =
                    enrollment?.course?.id;

                  const courseTitle =
                    getCourseTitle(
                      enrollment
                    );

                  const courseDescription =
                    getCourseDescription(
                      enrollment
                    );

                  const courseUrl =
                    getCourseUrl(
                      enrollment
                    );

                  // =================================================
                  // MODULE COUNTS
                  // =================================================

                  const modules =
                    getCourseModules(
                      enrollment
                    );

                  const totalModules =
                    modules.length;

                  const completedModules =
                    getCompletedModules(
                      modules
                    );

                  const remainingModules =
                    getRemainingModules(
                      totalModules,
                      completedModules
                    );

                  // =================================================
                  // COURSE PROGRESS
                  // =================================================

                  const progress =
                    Math.min(
                      Math.max(
                        Number(
                          enrollment?.progressPercentage ?? 0
                        ),
                        0
                      ),
                      100
                    );

                  const status =
                    enrollment?.status ||
                    "NOT_STARTED";

                  const statusStyle =
                    getStatusStyle(
                      status
                    );

                  // =================================================
                  // CERTIFICATION
                  // =================================================

                  const certificationStatus =
                    getCertificationStatus(
                      enrollment
                    );

                  const certificationStyle =
                    getCertificationStyle(
                      enrollment
                    );

                  return (

                    <div
                      key={
                        enrollment?.id ||
                        courseId ||
                        index
                      }
                      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                    >

                      {/* =================================================
                          COURSE HEADER
                      ================================================= */}

                      <div className="p-6 border-b border-gray-100">

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                          <div className="flex items-start gap-4">

                            <div className="bg-indigo-100 p-4 rounded-xl">
                              <GraduationCap
                                size={32}
                                className="text-indigo-600"
                              />
                            </div>

                            <div>
                              <h2 className="text-2xl font-bold text-slate-800">
                                {courseTitle}
                              </h2>

                              <p className="text-gray-500 mt-2 max-w-3xl">
                                {courseDescription}
                              </p>
                            </div>

                          </div>

                          {/* STATUS */}

                          <div
                            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${statusStyle.badge}`}
                          >
                            {getStatusLabel(
                              status
                            )}
                          </div>

                        </div>

                      </div>

                      {/* =================================================
                          COURSE PROGRESS
                      ================================================= */}

                      <div className="p-6">

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">

                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Overall Course Progress
                            </p>

                            <p className="text-3xl font-bold text-indigo-700 mt-1">
                              {progress}%
                            </p>
                          </div>

                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">

                          <div
                            className={`h-4 rounded-full transition-all duration-500 ${
                              progress === 100
                                ? "bg-green-500"
                                : "bg-indigo-600"
                            }`}
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                        <div className="flex justify-between mt-2 text-xs text-gray-500">

                          <span>
                            0%
                          </span>

                          <span className="font-semibold">
                            {progress === 100
                              ? "Course Completed"
                              : `${progress}% completed`}
                          </span>

                          <span>
                            100%
                          </span>

                        </div>

                      </div>

                      {/* =================================================
                          COURSE INFORMATION
                      ================================================= */}

                      <div className="px-6 pb-6">

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                          {/* START DATE */}

                          <div className="bg-blue-50 rounded-xl p-4">

                            <div className="flex items-center gap-2 text-blue-600">

                              <CalendarDays size={20} />

                              <span className="text-sm font-medium">
                                Start Date
                              </span>

                            </div>

                            <p className="font-semibold text-slate-800 mt-2">
                              {formatDate(
                                enrollment?.startDate
                              )}
                            </p>

                          </div>

                          {/* EXPECTED COMPLETION */}

                          <div className="bg-purple-50 rounded-xl p-4">

                            <div className="flex items-center gap-2 text-purple-600">

                              <Clock3 size={20} />

                              <span className="text-sm font-medium">
                                Expected Completion
                              </span>

                            </div>

                            <p className="font-semibold text-slate-800 mt-2">
                              {formatDate(
                                enrollment?.expectedCompletionDate
                              )}
                            </p>

                          </div>

                          {/* ACTUAL COMPLETION */}

                          <div className="bg-green-50 rounded-xl p-4">

                            <div className="flex items-center gap-2 text-green-600">

                              <CheckCircle2 size={20} />

                              <span className="text-sm font-medium">
                                Actual Completion
                              </span>

                            </div>

                            <p className="font-semibold text-slate-800 mt-2">
                              {formatDate(
                                enrollment?.actualCompletionDate
                              )}
                            </p>

                          </div>

                          {/* CURRENT STATUS */}

                          <div className="bg-orange-50 rounded-xl p-4">

                            <div className="flex items-center gap-2 text-orange-600">

                              <TrendingUp size={20} />

                              <span className="text-sm font-medium">
                                Current Status
                              </span>

                            </div>

                            <p className="font-semibold text-slate-800 mt-2">
                              {getStatusLabel(
                                status
                              )}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* =================================================
                          COURSE ACTION
                      ================================================= */}

                      {courseUrl && (

                        <div className="px-6 pb-6">

                          <button
                            onClick={() =>
                              openCourse(
                                courseUrl
                              )
                            }
                            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                          >

                            <BookOpen
                              size={18}
                            />

                            Continue Course

                            <ExternalLink
                              size={16}
                            />

                          </button>

                        </div>

                      )}

                      {/* =================================================
                          MODULE SUMMARY
                      ================================================= */}

                      <div className="px-6 pb-6">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                          {/* TOTAL MODULES */}

                          <div className="border rounded-xl p-5">

                            <div className="flex items-center gap-3">

                              <BookOpen
                                size={24}
                                className="text-indigo-600"
                              />

                              <div>

                                <p className="text-sm text-gray-500">
                                  Total Modules
                                </p>

                                <p className="text-2xl font-bold text-slate-800">
                                  {totalModules}
                                </p>

                              </div>

                            </div>

                          </div>

                          {/* COMPLETED MODULES */}

                          <div className="border border-green-200 bg-green-50 rounded-xl p-5">

                            <div className="flex items-center gap-3">

                              <CheckCircle2
                                size={24}
                                className="text-green-600"
                              />

                              <div>

                                <p className="text-sm text-green-600">
                                  Completed Modules
                                </p>

                                <p className="text-2xl font-bold text-green-700">
                                  {completedModules}
                                </p>

                              </div>

                            </div>

                          </div>

                          {/* REMAINING MODULES */}

                          <div className="border border-orange-200 bg-orange-50 rounded-xl p-5">

                            <div className="flex items-center gap-3">

                              <Clock3
                                size={24}
                                className="text-orange-600"
                              />

                              <div>

                                <p className="text-sm text-orange-600">
                                  Remaining Modules
                                </p>

                                <p className="text-2xl font-bold text-orange-700">
                                  {remainingModules}
                                </p>

                              </div>

                            </div>

                          </div>

                        </div>

                      </div>

                      {/* =================================================
                          CERTIFICATION
                      ================================================= */}

                      <div className="px-6 pb-6">

                        <div
                          className={`border rounded-2xl p-6 ${certificationStyle.container}`}
                        >

                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                            {/* CERTIFICATION HEADER */}

                            <div className="flex items-start gap-4">

                              <div className="bg-white p-3 rounded-xl shadow-sm">

                                <Award
                                  size={30}
                                  className={
                                    certificationStyle.icon
                                  }
                                />

                              </div>

                              <div>

                                <h3
                                  className={`text-xl font-bold ${certificationStyle.title}`}
                                >
                                  Certification
                                </h3>

                                <p
                                  className={`mt-1 font-semibold ${certificationStyle.title}`}
                                >
                                  {certificationStatus}
                                </p>

                              </div>

                            </div>

                          </div>

                          {/* CERTIFIED DETAILS */}

                          {String(status).toUpperCase() ===
                            "CERTIFIED" && (

                            <div className="mt-6">

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                {/* CERTIFICATION NAME */}

                                <div className="bg-white rounded-xl p-4">

                                  <div className="flex items-center gap-2 text-purple-600">

                                    <Award size={19} />

                                    <span className="text-sm font-medium">
                                      Certification Name
                                    </span>

                                  </div>

                                  <p className="font-semibold text-slate-800 mt-2">
                                    {enrollment?.certificationName ||
                                      "Not available"}
                                  </p>

                                </div>

                                {/* ISSUED DATE */}

                                <div className="bg-white rounded-xl p-4">

                                  <div className="flex items-center gap-2 text-green-600">

                                    <CalendarCheck
                                      size={19}
                                    />

                                    <span className="text-sm font-medium">
                                      Issued Date
                                    </span>

                                  </div>

                                  <p className="font-semibold text-slate-800 mt-2">
                                    {formatDate(
                                      enrollment?.certificationIssuedDate
                                    )}
                                  </p>

                                </div>

                                {/* EXPIRY DATE */}

                                <div className="bg-white rounded-xl p-4">

                                  <div className="flex items-center gap-2 text-orange-600">

                                    <Clock3 size={19} />

                                    <span className="text-sm font-medium">
                                      Expiry Date
                                    </span>

                                  </div>

                                  <p className="font-semibold text-slate-800 mt-2">
                                    {formatDate(
                                      enrollment?.certificationExpiryDate
                                    )}
                                  </p>

                                </div>

                              </div>

                              {/* VIEW CERTIFICATE */}

                              {enrollment?.certificationUrl && (

                                <button
                                  onClick={() =>
                                    openCertificate(
                                      enrollment.certificationUrl
                                    )
                                  }
                                  className="mt-5 flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                                >

                                  <Award
                                    size={18}
                                  />

                                  View Certificate

                                  <ExternalLink
                                    size={16}
                                  />

                                </button>

                              )}

                            </div>

                          )}

                          {/* CERTIFICATION PENDING */}

                          {String(status).toUpperCase() ===
                            "COMPLETED" && (

                            <div className="mt-5 bg-white rounded-xl p-4 border border-orange-100">

                              <div className="flex items-start gap-3">

                                <AlertCircle
                                  size={21}
                                  className="text-orange-500 mt-0.5"
                                />

                                <div>

                                  <p className="font-semibold text-slate-800">
                                    Certification Pending
                                  </p>

                                  <p className="text-sm text-gray-500 mt-1">
                                    You have completed this training.
                                    Certification details will appear
                                    here once the certification is issued.
                                  </p>

                                </div>

                              </div>

                            </div>

                          )}

                          {/* EXPIRED / RENEWAL */}

                          {(
                            String(status).toUpperCase() ===
                              "EXPIRED" ||
                            String(status).toUpperCase() ===
                              "EXPIRED_RENEWAL"
                          ) && (

                            <div className="mt-5 bg-white rounded-xl p-4 border border-red-100">

                              <div className="flex items-start gap-3">

                                <RefreshCw
                                  size={21}
                                  className="text-red-500 mt-0.5"
                                />

                                <div>

                                  <p className="font-semibold text-slate-800">
                                    Certification Expired
                                  </p>

                                  <p className="text-sm text-gray-500 mt-1">
                                    This certification requires
                                    renewal.
                                  </p>

                                </div>

                              </div>

                            </div>

                          )}

                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </main>
      </div>
    </div>
  );
}

export default LearningProgress;