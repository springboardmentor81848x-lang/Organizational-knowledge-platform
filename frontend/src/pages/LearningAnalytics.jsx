import React, { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  getMentorAnalytics,
} from "../services/KnowledgeSessionService";

function LearningAnalytics() {

  // =====================================================
  // USER INFORMATION
  // =====================================================

  const role = (
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    "EMPLOYEE"
  )
    .toUpperCase()
    .replace("ROLE_", "")
    .trim();

  // Database Employee primary key
  // Example: 43
  const userId = localStorage.getItem("userId");

  // Business employee identifier
  // Example: MEN001
  const employeeId = localStorage.getItem("employeeId");

  // =====================================================
  // STATE
  // =====================================================

  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD ANALYTICS
  // =====================================================

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {

    try {

      setLoading(true);
      setError("");

      console.log("========== LEARNING ANALYTICS ==========");
      console.log("Role:", role);
      console.log("Database User ID:", userId);
      console.log("Employee ID:", employeeId);
      console.log("========================================");

      // -------------------------------------------------
      // Only Mentor Analytics currently supported
      // -------------------------------------------------

      if (role !== "MENTOR") {
        setError(
          "Learning Analytics is currently available only for mentors."
        );
        return;
      }

      // -------------------------------------------------
      // Validate userId
      // -------------------------------------------------

      if (!userId) {
        setError(
          "Mentor ID not found. Please login again."
        );
        return;
      }

      const mentorId = Number(userId);

      if (Number.isNaN(mentorId)) {
        setError(
          "Invalid mentor ID. Please login again."
        );
        return;
      }

      console.log(
        "Loading analytics for mentor database ID:",
        mentorId
      );

      // -------------------------------------------------
      // API CALL
      // -------------------------------------------------

      const data = await getMentorAnalytics(mentorId);

      console.log(
        "Learning Analytics Response:",
        data
      );

      setAnalytics(data);

    } catch (err) {

      console.error(
        "Learning analytics error:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Response:",
        err.response?.data
      );

      if (err.response?.status === 403) {

        setError(
          "Access denied. Please login again with a Mentor account."
        );

      } else if (err.response?.status === 401) {

        setError(
          "Your session has expired. Please login again."
        );

      } else {

        setError(
          err.response?.data?.message ||
          `Failed to load analytics. Status: ${
            err.response?.status || "Unknown"
          }`
        );
      }

    } finally {

      setLoading(false);

    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="flex bg-gray-100 min-h-screen">

        <Sidebar role={role} />

        <div className="flex-1">

          <Navbar title="Learning Analytics" />

          <div className="p-8 text-center">

            <p className="text-gray-600">
              Loading learning analytics...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (
      <div className="flex bg-gray-100 min-h-screen">

        <Sidebar role={role} />

        <div className="flex-1">

          <Navbar title="Learning Analytics" />

          <div className="p-8">

            <div className="bg-red-100 text-red-700 p-5 rounded-xl">

              {error}

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // NO DATA
  // =====================================================

  if (!analytics) {

    return (
      <div className="flex bg-gray-100 min-h-screen">

        <Sidebar role={role} />

        <div className="flex-1">

          <Navbar title="Learning Analytics" />

          <div className="p-8">

            <div className="bg-white rounded-xl shadow p-8 text-center">

              No learning analytics available.

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar role={role} />

      <div className="flex-1">

        <Navbar title="Learning Analytics" />

        <div className="p-8">

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="mb-8">

            <h1 className="text-3xl font-bold text-gray-800">

              Learning Analytics

            </h1>

            <p className="text-gray-500 mt-2">

              Track your knowledge-sharing session performance,
              attendance and effectiveness.

            </p>

          </div>

          {/* ================================================= */}
          {/* SUMMARY CARDS */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {/* Total Sessions */}

            <div className="bg-white rounded-xl shadow p-6">

              <p className="text-gray-500 text-sm">
                Total Sessions
              </p>

              <h2 className="text-3xl font-bold text-indigo-600 mt-2">

                {analytics.totalSessions || 0}

              </h2>

            </div>

            {/* Completed Sessions */}

            <div className="bg-white rounded-xl shadow p-6">

              <p className="text-gray-500 text-sm">
                Completed Sessions
              </p>

              <h2 className="text-3xl font-bold text-green-600 mt-2">

                {analytics.completedSessions || 0}

              </h2>

            </div>

            {/* Registrations */}

            <div className="bg-white rounded-xl shadow p-6">

              <p className="text-gray-500 text-sm">
                Total Registrations
              </p>

              <h2 className="text-3xl font-bold text-blue-600 mt-2">

                {analytics.totalRegistrations || 0}

              </h2>

            </div>

            {/* Attendance */}

            <div className="bg-white rounded-xl shadow p-6">

              <p className="text-gray-500 text-sm">
                Attendance Rate
              </p>

              <h2 className="text-3xl font-bold text-purple-600 mt-2">

                {analytics.attendanceRate || 0}%

              </h2>

            </div>

          </div>

          {/* ================================================= */}
          {/* SECONDARY SUMMARY */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            {/* Attended */}

            <div className="bg-white rounded-xl shadow p-6">

              <p className="text-gray-500">
                Total Attended
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-2">

                {analytics.totalAttended || 0}

              </h2>

            </div>

            {/* Feedback */}

            <div className="bg-white rounded-xl shadow p-6">

              <p className="text-gray-500">
                Total Feedback
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-2">

                {analytics.totalFeedback || 0}

              </h2>

            </div>

            {/* Effectiveness */}

            <div className="bg-white rounded-xl shadow p-6">

              <p className="text-gray-500">
                Average Effectiveness
              </p>

              <h2 className="text-2xl font-bold text-purple-600 mt-2">

                {analytics.averageEffectiveness || 0}%

              </h2>

            </div>

          </div>

          {/* ================================================= */}
          {/* PERFORMANCE BARS */}
          {/* ================================================= */}

          <div className="bg-white rounded-xl shadow p-6 mb-8">

            <h2 className="text-xl font-bold text-gray-800 mb-6">

              Overall Performance

            </h2>

            {/* Attendance */}

            <div className="mb-6">

              <div className="flex justify-between mb-2">

                <span className="font-medium text-gray-700">
                  Attendance Rate
                </span>

                <span className="font-semibold">
                  {analytics.attendanceRate || 0}%
                </span>

              </div>

              <div className="w-full bg-gray-200 rounded-full h-4">

                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{
                    width: `${Math.min(
                      analytics.attendanceRate || 0,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

            {/* Effectiveness */}

            <div>

              <div className="flex justify-between mb-2">

                <span className="font-medium text-gray-700">
                  Session Effectiveness
                </span>

                <span className="font-semibold">
                  {analytics.averageEffectiveness || 0}%
                </span>

              </div>

              <div className="w-full bg-gray-200 rounded-full h-4">

                <div
                  className="bg-purple-600 h-4 rounded-full"
                  style={{
                    width: `${Math.min(
                      analytics.averageEffectiveness || 0,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* SESSION ANALYTICS TABLE */}
          {/* ================================================= */}

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-bold text-gray-800 mb-6">

              Session-wise Analytics

            </h2>

            {analytics.sessionAnalytics?.length === 0 ? (

              <p className="text-gray-500 text-center py-6">

                No session analytics available.

              </p>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b">

                      <th className="text-left p-3">
                        Session
                      </th>

                      <th className="text-left p-3">
                        Status
                      </th>

                      <th className="text-left p-3">
                        Registrations
                      </th>

                      <th className="text-left p-3">
                        Attended
                      </th>

                      <th className="text-left p-3">
                        Attendance
                      </th>

                      <th className="text-left p-3">
                        Feedback
                      </th>

                      <th className="text-left p-3">
                        Rating
                      </th>

                      <th className="text-left p-3">
                        Effectiveness
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {analytics.sessionAnalytics.map(
                      (session) => (

                        <tr
                          key={session.sessionId}
                          className="border-b hover:bg-gray-50"
                        >

                          <td className="p-3 font-medium">
                            {session.title}
                          </td>

                          <td className="p-3">

                            <span
                              className={`px-3 py-1 rounded-full text-xs ${
                                session.status === "COMPLETED"
                                  ? "bg-green-100 text-green-700"
                                  : session.status === "CANCELLED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {session.status}
                            </span>

                          </td>

                          <td className="p-3">
                            {session.totalRegistrations}
                          </td>

                          <td className="p-3">
                            {session.totalAttended}
                          </td>

                          <td className="p-3">

                            {session.attendanceRate}%

                          </td>

                          <td className="p-3">
                            {session.totalFeedback}
                          </td>

                          <td className="p-3">

                            ⭐ {session.averageRating}

                          </td>

                          <td className="p-3 font-semibold">

                            {session.effectiveness}%

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default LearningAnalytics;