import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

import {
  LayoutDashboard,
  User,
  BookOpen,
  ClipboardList,
  BarChart3,
  GraduationCap,
  Users,
  CalendarDays,
  TrendingUp,
  Bell,
  AlertCircle,
  Clock,
  CheckCircle,
  PlayCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";

const API_BASE_URL = "http://localhost:8080/api";

const LearningProgress = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // EMPLOYEE ID
  // =========================================================

  const employeeIdentifier =
    localStorage.getItem("employeeId") ||
    localStorage.getItem("employeeIdentifier");

  // =========================================================
  // FETCH ENROLLMENTS
  // =========================================================

  useEffect(() => {
    if (!employeeIdentifier) {
      setError("Employee information not found.");
      setLoading(false);
      return;
    }

    fetchEnrollments();
  }, [employeeIdentifier]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE_URL}/training-enrollments/employee/${employeeIdentifier}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Training enrollments:", response.data);

      setEnrollments(response.data || []);
    } catch (err) {
      console.error("Error fetching training enrollments:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your training enrollments."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // NAV LINK STYLE
  // =========================================================

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalCourses = enrollments.length;

  const completedCourses = enrollments.filter(
    (enrollment) =>
      enrollment.status === "COMPLETED" ||
      Number(enrollment.progressPercentage) === 100
  ).length;

  const inProgressCourses = enrollments.filter(
    (enrollment) =>
      enrollment.status === "IN_PROGRESS" ||
      (Number(enrollment.progressPercentage) > 0 &&
        Number(enrollment.progressPercentage) < 100)
  ).length;

  const overallProgress =
    totalCourses > 0
      ? Math.round(
          enrollments.reduce(
            (total, enrollment) =>
              total +
              Number(enrollment.progressPercentage || 0),
            0
          ) / totalCourses
        )
      : 0;

  // =========================================================
  // STATUS
  // =========================================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "COMPLETED":
        return "Completed";

      case "IN_PROGRESS":
        return "In Progress";

      case "NOT_STARTED":
        return "Not Started";

      case "EXPIRED":
        return "Expired";

      default:
        return status || "Not Started";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";

      case "EXPIRED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[calc(100vh-64px)]">

          {/* =================================================
              EMPLOYEE SIDEBAR
          ================================================= */}

          <aside className="w-72 bg-slate-950 text-white flex-shrink-0">

            {/* BRAND */}
            <div className="px-6 py-6 border-b border-slate-800">
              <h1 className="text-xl font-bold leading-tight">
                ORGANIZATIONAL
                <br />
                KNOWLEDGE GAP
                <br />
                INTELLIGENCE
                <br />
                PLATFORM
              </h1>
            </div>

            {/* NAVIGATION */}
            <nav className="p-4 space-y-1">

              {/* Dashboard */}
              <NavLink
                to="/employee"
                className={navLinkClass}
              >
                <LayoutDashboard size={20} />
                Dashboard
              </NavLink>

              {/* Profile */}
              <NavLink
                to="/profile"
                className={navLinkClass}
              >
                <User size={20} />
                My Profile
              </NavLink>

              {/* Skill Inventory */}
              <NavLink
                to="/skills"
                className={navLinkClass}
              >
                <BookOpen size={20} />
                Skill Inventory
              </NavLink>

              {/* Skill Assessment */}
              <NavLink
                to="/employee-assessment"
                className={navLinkClass}
              >
                <ClipboardList size={20} />
                Skill Assessment
              </NavLink>

              {/* Knowledge Gap */}
              <NavLink
                to="/knowledge-gap"
                className={navLinkClass}
              >
                <BarChart3 size={20} />
                Knowledge Gap Analysis
              </NavLink>

              {/* AI Learning Path */}
              <NavLink
                to="/learning-path"
                className={navLinkClass}
              >
                <GraduationCap size={20} />
                AI Learning Path
              </NavLink>

              {/* Training & Learning */}
              <NavLink
                to="/training-learning"
                className={navLinkClass}
              >
                <GraduationCap size={20} />
                Training & Learning
              </NavLink>

              {/* Mentorship */}
              <NavLink
                to="/mentorship"
                className={navLinkClass}
              >
                <Users size={20} />
                Mentorship
              </NavLink>

              {/* Knowledge Sessions */}
              <NavLink
                to="/knowledge-sessions"
                className={navLinkClass}
              >
                <CalendarDays size={20} />
                Knowledge Sessions
              </NavLink>

              {/* Learning Progress */}
              <NavLink
                to="/learning-progress"
                className={navLinkClass}
              >
                <TrendingUp size={20} />
                Learning Progress
              </NavLink>

              {/* Expert Directory */}
              <NavLink
                to="/expert-directory"
                className={navLinkClass}
              >
                <Users size={20} />
                Expert Directory
              </NavLink>

              {/* Notifications */}
              <NavLink
                to="/notifications"
                className={navLinkClass}
              >
                <Bell size={20} />
                Notifications
              </NavLink>

            </nav>
          </aside>

          {/* LOADING AREA */}

          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>

              <p className="mt-4 text-slate-500">
                Loading your learning progress...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <div className="flex min-h-[calc(100vh-64px)]">

        {/* =====================================================
            EMPLOYEE SIDEBAR
        ===================================================== */}

        <aside className="w-72 bg-slate-950 text-white flex-shrink-0">

          {/* =================================================
              PLATFORM NAME
          ================================================= */}

          <div className="px-6 py-6 border-b border-slate-800">

            <h1 className="text-xl font-bold leading-tight">
              ORGANIZATIONAL
              <br />
              KNOWLEDGE GAP
              <br />
              INTELLIGENCE
              <br />
              PLATFORM
            </h1>

          </div>

          {/* =================================================
              EMPLOYEE NAVIGATION
          ================================================= */}

          <nav className="p-4 space-y-1">

            {/* Dashboard */}
            <NavLink
              to="/employee"
              className={navLinkClass}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/profile"
              className={navLinkClass}
            >
              <User size={20} />
              My Profile
            </NavLink>

            {/* Skill Inventory */}
            <NavLink
              to="/skills"
              className={navLinkClass}
            >
              <BookOpen size={20} />
              Skill Inventory
            </NavLink>

            {/* Skill Assessment */}
            <NavLink
              to="/employee-assessment"
              className={navLinkClass}
            >
              <ClipboardList size={20} />
              Skill Assessment
            </NavLink>

            {/* Knowledge Gap */}
            <NavLink
              to="/knowledge-gap"
              className={navLinkClass}
            >
              <BarChart3 size={20} />
              Knowledge Gap Analysis
            </NavLink>

            {/* AI Learning Path */}
            <NavLink
              to="/learning-path"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              AI Learning Path
            </NavLink>

            {/* Training & Learning */}
            <NavLink
              to="/training-learning"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              Training & Learning
            </NavLink>

            {/* Mentorship */}
            <NavLink
              to="/mentorship"
              className={navLinkClass}
            >
              <Users size={20} />
              Mentorship
            </NavLink>

            {/* Knowledge Sessions */}
            <NavLink
              to="/knowledge-sessions"
              className={navLinkClass}
            >
              <CalendarDays size={20} />
              Knowledge Sessions
            </NavLink>

            {/* Learning Progress */}
            <NavLink
              to="/learning-progress"
              className={navLinkClass}
            >
              <TrendingUp size={20} />
              Learning Progress
            </NavLink>

            {/* Expert Directory */}
            <NavLink
              to="/expert-directory"
              className={navLinkClass}
            >
              <Users size={20} />
              Expert Directory
            </NavLink>

            {/* Notifications */}
            <NavLink
              to="/notifications"
              className={navLinkClass}
            >
              <Bell size={20} />
              Notifications
            </NavLink>

          </nav>

        </aside>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <main className="flex-1 p-8 overflow-y-auto">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8 flex items-center gap-4">

            <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center">
              <BookOpen
                size={42}
                className="text-blue-600"
              />
            </div>

            <div>

              <h1 className="text-4xl font-bold text-slate-900">
                Learning Progress
              </h1>

              <p className="text-lg text-slate-500 mt-1">
                Track your training, course progress and learning milestones.
              </p>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">

              <AlertCircle
                size={22}
                className="text-red-500"
              />

              <p className="text-red-700">
                {error}
              </p>

            </div>
          )}

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            {/* Overall Progress */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">

              <div className="flex justify-between items-start">

                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                  <TrendingUp
                    size={30}
                    className="text-blue-600"
                  />
                </div>

                <span className="text-3xl font-bold text-slate-900">
                  {overallProgress}%
                </span>

              </div>

              <p className="text-lg text-slate-500 mt-6">
                Overall Progress
              </p>

              <div className="w-full h-3 bg-slate-100 rounded-full mt-4 overflow-hidden">

                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${overallProgress}%`,
                  }}
                />

              </div>

            </div>

            {/* Enrolled Courses */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">

              <div className="flex justify-between items-start">

                <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <BookOpen
                    size={30}
                    className="text-indigo-600"
                  />
                </div>

                <span className="text-3xl font-bold text-slate-900">
                  {totalCourses}
                </span>

              </div>

              <p className="text-lg text-slate-500 mt-6">
                Enrolled Courses
              </p>

            </div>

            {/* In Progress */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">

              <div className="flex justify-between items-start">

                <div className="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Clock
                    size={30}
                    className="text-yellow-600"
                  />
                </div>

                <span className="text-3xl font-bold text-slate-900">
                  {inProgressCourses}
                </span>

              </div>

              <p className="text-lg text-slate-500 mt-6">
                In Progress
              </p>

            </div>

            {/* Completed */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">

              <div className="flex justify-between items-start">

                <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle
                    size={30}
                    className="text-green-600"
                  />
                </div>

                <span className="text-3xl font-bold text-slate-900">
                  {completedCourses}
                </span>

              </div>

              <p className="text-lg text-slate-500 mt-6">
                Completed
              </p>

            </div>

          </div>

          {/* =================================================
              TRAINING LIST
          ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">

            <div className="flex justify-between items-center mb-6">

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  My Training
                </h2>

                <p className="text-slate-500 mt-1">
                  Your enrolled courses and learning progress
                </p>
              </div>

              <button
                onClick={fetchEnrollments}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Refresh
              </button>

            </div>

            {/* =================================================
                NO ENROLLMENTS
            ================================================= */}

            {enrollments.length === 0 ? (

              <div className="py-16 text-center">

                <BookOpen
                  size={60}
                  className="mx-auto text-slate-300"
                />

                <h3 className="text-xl font-semibold text-slate-700 mt-5">
                  No training enrolled yet
                </h3>

                <p className="text-slate-500 mt-2">
                  Enroll in a recommended course to start learning.
                </p>

              </div>

            ) : (

              /* =================================================
                 COURSE CARDS
              ================================================= */

              <div className="space-y-5">

                {enrollments.map((enrollment) => {

                  const progress = Number(
                    enrollment.progressPercentage || 0
                  );

                  const course =
                    enrollment.course || {};

                  return (

                    <div
                      key={enrollment.id}
                      className="border border-slate-200 rounded-2xl p-6 hover:shadow-sm transition"
                    >

                      {/* COURSE HEADER */}

                      <div className="flex justify-between items-start gap-4">

                        <div className="flex gap-4">

                          <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">

                            <BookOpen
                              size={28}
                              className="text-blue-600"
                            />

                          </div>

                          <div>

                            <h3 className="text-xl font-bold text-slate-900">
                              {course.title ||
                                "Training Course"}
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                              {course.description ||
                                "Course description unavailable"}
                            </p>

                          </div>

                        </div>

                        <span
                          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${getStatusClass(
                            enrollment.status
                          )}`}
                        >
                          {getStatusLabel(
                            enrollment.status
                          )}
                        </span>

                      </div>

                      {/* PROGRESS */}

                      <div className="mt-6">

                        <div className="flex justify-between mb-2">

                          <span className="text-sm font-medium text-slate-600">
                            Course Progress
                          </span>

                          <span className="text-sm font-bold text-slate-900">
                            {progress}%
                          </span>

                        </div>

                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                      </div>

                      {/* DATES */}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

                        <div>

                          <p className="text-xs text-slate-400 uppercase">
                            Start Date
                          </p>

                          <p className="text-sm font-medium text-slate-700 mt-1">
                            {enrollment.startDate ||
                              "Not started"}
                          </p>

                        </div>

                        <div>

                          <p className="text-xs text-slate-400 uppercase">
                            Expected Completion
                          </p>

                          <p className="text-sm font-medium text-slate-700 mt-1">
                            {enrollment.expectedCompletionDate ||
                              "Not specified"}
                          </p>

                        </div>

                        <div>

                          <p className="text-xs text-slate-400 uppercase">
                            Completed
                          </p>

                          <p className="text-sm font-medium text-slate-700 mt-1">
                            {enrollment.actualCompletionDate ||
                              "Not completed"}
                          </p>

                        </div>

                      </div>

                      {/* CONTINUE LEARNING */}

                      {enrollment.status !== "COMPLETED" && (

                        <div className="mt-5 pt-5 border-t border-slate-100">

                          <button
                            onClick={() =>
                              (window.location.href =
                                `/training-details/${enrollment.id}`)
                            }
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >

                            <PlayCircle size={18} />

                            Continue Learning

                          </button>

                        </div>

                      )}

                    </div>

                  );
                })}

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  );
};

export default LearningProgress;