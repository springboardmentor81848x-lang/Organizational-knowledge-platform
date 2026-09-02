import React, { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  Bell,
  CheckCircle,
  Clock,
  UserRound,
  RefreshCw,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  UserPlus,
  ClipboardCheck,
  AlertTriangle,
  GraduationCap,
  UserCheck,
  TrendingUp,
  FileWarning,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8080/api";

function Notifications() {
  // =========================================================
  // LOGGED-IN USER
  // =========================================================

  const employeeId = localStorage.getItem("employeeId");

  const role = (
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    "EMPLOYEE"
  )
    .toUpperCase()
    .replace("ROLE_", "")
    .trim();

  // =========================================================
  // STATE
  // =========================================================

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingRead, setMarkingRead] = useState(null);

  // =========================================================
  // HEADERS
  // =========================================================

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  };

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  const loadNotifications = async () => {
    if (!employeeId) {
      setError("Employee ID not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/notifications/employee/${employeeId}`,
        getHeaders()
      );

      console.log("Notifications:", response.data);

      setNotifications(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to load notifications:", err);

      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadNotifications();
  }, []);

  // =========================================================
  // MARK AS READ
  // =========================================================

  const markAsRead = async (notificationId) => {
    try {
      setMarkingRead(notificationId);

      await axios.put(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        null,
        getHeaders()
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                readStatus: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err
      );

      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Unable to mark notification as read."
      );
    } finally {
      setMarkingRead(null);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return date;
    }
  };

  // =========================================================
  // NOTIFICATION TITLE
  // =========================================================

  const getNotificationTitle = (type) => {
    switch (type?.toUpperCase()) {
      // =====================================================
      // EXISTING MENTORSHIP NOTIFICATIONS
      // =====================================================

      case "MENTORSHIP_REQUEST":
        return "Mentorship Request";

      case "MENTORSHIP_ACCEPTED":
        return "Mentorship Accepted";

      // =====================================================
      // EXISTING SESSION NOTIFICATIONS
      // =====================================================

      case "SESSION_REGISTRATION":
        return "Session Registration";

      case "SESSION_REGISTRATION_CANCELLED":
        return "Registration Cancelled";

      case "SESSION_REGISTRATION_CANCELLED_BY_EMPLOYEE":
        return "Employee Registration Cancelled";

      case "SESSION_UPDATED":
        return "Session Updated";

      case "SESSION_CANCELLED":
        return "Session Cancelled";

      // =====================================================
      // HR NOTIFICATIONS
      // =====================================================

      case "NEW_EMPLOYEE":
        return "New Employee Joined";

      case "ASSESSMENT_COMPLETED":
        return "Assessment Completed";

      case "KNOWLEDGE_GAP_DETECTED":
        return "Knowledge Gap Detected";

      case "HIGH_RISK_SKILL_GAP":
        return "High-Risk Skill Gap";

      case "TRAINING_COMPLETED":
        return "Training Completed";

      case "MENTOR_ALLOCATED":
        return "Mentor Allocated";

      case "SKILL_IMPROVED":
        return "Skill Improvement";

      case "ASSESSMENT_OVERDUE":
        return "Assessment Overdue";

      default:
        return "Notification";
    }
  };

  // =========================================================
  // NOTIFICATION ICON
  // =========================================================

  const getNotificationIcon = (type) => {
    switch (type?.toUpperCase()) {
      // =====================================================
      // MENTORSHIP REQUEST
      // =====================================================

      case "MENTORSHIP_REQUEST":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <UserRound
              size={24}
              className="text-blue-600"
            />
          </div>
        );

      // =====================================================
      // MENTORSHIP ACCEPTED
      // =====================================================

      case "MENTORSHIP_ACCEPTED":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle
              size={24}
              className="text-green-600"
            />
          </div>
        );

      // =====================================================
      // SESSION REGISTRATION
      // =====================================================

      case "SESSION_REGISTRATION":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CalendarCheck
              size={24}
              className="text-green-600"
            />
          </div>
        );

      // =====================================================
      // SESSION REGISTRATION CANCELLED
      // =====================================================

      case "SESSION_REGISTRATION_CANCELLED":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <CalendarX
              size={24}
              className="text-red-600"
            />
          </div>
        );

      // =====================================================
      // EMPLOYEE CANCELLED REGISTRATION
      // =====================================================

      case "SESSION_REGISTRATION_CANCELLED_BY_EMPLOYEE":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <CalendarX
              size={24}
              className="text-orange-600"
            />
          </div>
        );

      // =====================================================
      // SESSION UPDATED
      // =====================================================

      case "SESSION_UPDATED":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <CalendarClock
              size={24}
              className="text-yellow-600"
            />
          </div>
        );

      // =====================================================
      // SESSION CANCELLED
      // =====================================================

      case "SESSION_CANCELLED":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <CalendarX
              size={24}
              className="text-red-600"
            />
          </div>
        );

      // =====================================================
      // HR: NEW EMPLOYEE
      // =====================================================

      case "NEW_EMPLOYEE":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <UserPlus
              size={24}
              className="text-blue-600"
            />
          </div>
        );

      // =====================================================
      // HR: ASSESSMENT COMPLETED
      // =====================================================

      case "ASSESSMENT_COMPLETED":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <ClipboardCheck
              size={24}
              className="text-green-600"
            />
          </div>
        );

      // =====================================================
      // HR: KNOWLEDGE GAP DETECTED
      // =====================================================

      case "KNOWLEDGE_GAP_DETECTED":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle
              size={24}
              className="text-yellow-600"
            />
          </div>
        );

      // =====================================================
      // HR: HIGH-RISK SKILL GAP
      // =====================================================

      case "HIGH_RISK_SKILL_GAP":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle
              size={24}
              className="text-red-600"
            />
          </div>
        );

      // =====================================================
      // HR: TRAINING COMPLETED
      // =====================================================

      case "TRAINING_COMPLETED":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <GraduationCap
              size={24}
              className="text-purple-600"
            />
          </div>
        );

      // =====================================================
      // HR: MENTOR ALLOCATED
      // =====================================================

      case "MENTOR_ALLOCATED":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <UserCheck
              size={24}
              className="text-indigo-600"
            />
          </div>
        );

      // =====================================================
      // HR: SKILL IMPROVED
      // =====================================================

      case "SKILL_IMPROVED":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <TrendingUp
              size={24}
              className="text-emerald-600"
            />
          </div>
        );

      // =====================================================
      // HR: ASSESSMENT OVERDUE
      // =====================================================

      case "ASSESSMENT_OVERDUE":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <FileWarning
              size={24}
              className="text-orange-600"
            />
          </div>
        );

      // =====================================================
      // DEFAULT
      // =====================================================

      default:
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <Bell
              size={24}
              className="text-indigo-600"
            />
          </div>
        );
    }
  };

  // =========================================================
  // PAGE DESCRIPTION
  // =========================================================

  const getPageDescription = () => {
    if (role === "HR") {
      return "Monitor workforce updates, assessments, skill gaps, training progress, and mentorship activities.";
    }

    if (role === "MENTOR") {
      return "View mentorship requests, session updates, registrations, and employee activities.";
    }

    return "View your latest notifications, session updates, registration changes, and mentorship activities.";
  };

  // =========================================================
  // UNREAD COUNT
  // =========================================================

  const unreadCount = notifications.filter(
    (notification) => !notification.readStatus
  ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar role={role} />

        <div className="flex-1">
          <Navbar title="Notifications" />

          <main className="p-8">
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <p className="text-gray-500">
                Loading notifications...
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} />

      <div className="flex-1">
        <Navbar title="Notifications" />

        <main className="p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="flex items-center gap-3">

                <Bell
                  size={30}
                  className="text-indigo-600"
                />

                <h1 className="text-3xl font-bold text-gray-800">
                  Notifications
                </h1>

              </div>

              <p className="mt-2 max-w-2xl text-gray-600">
                {getPageDescription()}
              </p>
            </div>

            {/* UNREAD COUNT */}

            <div className="rounded-xl bg-white px-5 py-3 shadow">

              <p className="text-sm text-gray-500">
                Unread Notifications
              </p>

              <p className="text-2xl font-bold text-indigo-600">
                {unreadCount}
              </p>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              REFRESH
          ================================================= */}

          <div className="mb-5 flex justify-end">

            <button
              onClick={loadNotifications}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <RefreshCw size={17} />

              Refresh
            </button>

          </div>

          {/* =================================================
              NO NOTIFICATIONS
          ================================================= */}

          {notifications.length === 0 ? (

            <div className="rounded-xl bg-white p-12 text-center shadow">

              <Bell
                size={50}
                className="mx-auto text-gray-300"
              />

              <h2 className="mt-4 text-xl font-semibold text-gray-700">
                No Notifications
              </h2>

              <p className="mt-2 text-gray-500">
                You don't have any notifications yet.
              </p>

            </div>

          ) : (

            /* =================================================
               NOTIFICATION LIST
            ================================================= */

            <div className="space-y-4">

              {notifications.map((notification) => (

                <div
                  key={notification.id}
                  className={`rounded-xl border p-5 shadow-sm transition ${
                    notification.readStatus
                      ? "border-gray-200 bg-white"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >

                  <div className="flex gap-4">

                    {/* ICON */}

                    {getNotificationIcon(
                      notification.type
                    )}

                    <div className="flex-1">

                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">

                        <div>

                          {/* TITLE */}

                          <div className="flex items-center gap-2">

                            <h3 className="font-semibold text-gray-800">

                              {getNotificationTitle(
                                notification.type
                              )}

                            </h3>

                            {!notification.readStatus && (
                              <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                                NEW
                              </span>
                            )}

                          </div>

                          {/* MESSAGE */}

                          <p className="mt-2 text-gray-700">
                            {notification.message}
                          </p>

                          {/* DATE */}

                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">

                            <Clock size={15} />

                            {formatDate(
                              notification.createdDate
                            )}

                          </div>

                        </div>

                        {/* MARK AS READ */}

                        {!notification.readStatus && (

                          <button
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                            disabled={
                              markingRead ===
                              notification.id
                            }
                            className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm hover:bg-blue-100 disabled:opacity-50"
                          >

                            <CheckCircle
                              size={17}
                            />

                            {markingRead ===
                            notification.id
                              ? "Marking..."
                              : "Mark as Read"}

                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </main>
      </div>
    </div>
  );
}

export default Notifications;