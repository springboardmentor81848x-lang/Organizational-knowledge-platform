import React, { useEffect, useState } from "react";

import api from "../services/api";

import {
  Bell,
  Check,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  UserRound,
  UserPlus,
  ClipboardCheck,
  AlertTriangle,
  GraduationCap,
  UserCheck,
  TrendingUp,
  FileWarning,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DepartmentNotifications() {
  // =========================================================
  // LOGGED-IN DEPARTMENT HEAD
  // =========================================================

  const employeeId = localStorage.getItem("employeeId");

  // =========================================================
  // STATE
  // =========================================================

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState(null);

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  const getNotifications = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    if (!employeeId) {
      setError("Employee ID not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log(
        "Loading notifications for Department Head:",
        employeeId
      );

      const response = await api.get(
        `/notifications/employee/${employeeId}`
      );

      console.log(
        "Department Head notifications:",
        response.data
      );

      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Error loading department head notifications:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Unauthorized. Please login again."
        );
      } else if (err.response?.status === 404) {
        setError(
          "Department Head employee account was not found."
        );
      } else if (err.response?.status === 500) {
        setError(
          "Server error while loading notifications. Please check the backend console."
        );
      } else {
        setError(
          "Unable to load notifications."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    getNotifications();
  }, []);

  // =========================================================
  // MARK NOTIFICATION AS READ
  // =========================================================

  const markAsRead = async (notificationId) => {
    if (!notificationId) {
      return;
    }

    try {
      setMarkingId(notificationId);

      await api.put(
        `/notifications/${notificationId}/read`,
        {}
      );

      // Update UI immediately
      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
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
        "Error marking notification as read:",
        err
      );

      setError(
        err.response?.data ||
          "Unable to mark notification as read."
      );
    } finally {
      setMarkingId(null);
    }
  };

  // =========================================================
  // UNREAD COUNT
  // =========================================================

  const unreadCount = notifications.filter(
    (notification) =>
      notification.readStatus === false
  ).length;

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Unknown date";
    }

    try {
      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return dateValue;
      }

      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateValue;
    }
  };

  // =========================================================
  // NOTIFICATION TITLE
  // =========================================================

  const getNotificationTitle = (type) => {
    switch (type?.toUpperCase()) {
      // -----------------------------------------------------
      // MENTORSHIP
      // -----------------------------------------------------

      case "MENTORSHIP_REQUEST":
        return "Mentorship Request";

      case "MENTORSHIP_ACCEPTED":
        return "Mentorship Accepted";

      // -----------------------------------------------------
      // SESSION
      // -----------------------------------------------------

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

      // -----------------------------------------------------
      // HR / DEPARTMENT UPDATES
      // -----------------------------------------------------

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
      // -----------------------------------------------------
      // MENTORSHIP REQUEST
      // -----------------------------------------------------

      case "MENTORSHIP_REQUEST":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <UserRound
              size={20}
              color="#2563eb"
            />
          </div>
        );

      // -----------------------------------------------------
      // MENTORSHIP ACCEPTED
      // -----------------------------------------------------

      case "MENTORSHIP_ACCEPTED":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CheckCircle
              size={20}
              color="#16a34a"
            />
          </div>
        );

      // -----------------------------------------------------
      // SESSION REGISTRATION
      // -----------------------------------------------------

      case "SESSION_REGISTRATION":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CalendarCheck
              size={20}
              color="#16a34a"
            />
          </div>
        );

      // -----------------------------------------------------
      // SESSION REGISTRATION CANCELLED
      // -----------------------------------------------------

      case "SESSION_REGISTRATION_CANCELLED":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CalendarX
              size={20}
              color="#dc2626"
            />
          </div>
        );

      // -----------------------------------------------------
      // EMPLOYEE CANCELLED REGISTRATION
      // -----------------------------------------------------

      case "SESSION_REGISTRATION_CANCELLED_BY_EMPLOYEE":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#ffedd5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CalendarX
              size={20}
              color="#ea580c"
            />
          </div>
        );

      // -----------------------------------------------------
      // SESSION UPDATED
      // -----------------------------------------------------

      case "SESSION_UPDATED":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CalendarClock
              size={20}
              color="#ca8a04"
            />
          </div>
        );

      // -----------------------------------------------------
      // SESSION CANCELLED
      // -----------------------------------------------------

      case "SESSION_CANCELLED":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CalendarX
              size={20}
              color="#dc2626"
            />
          </div>
        );

      // -----------------------------------------------------
      // NEW EMPLOYEE
      // -----------------------------------------------------

      case "NEW_EMPLOYEE":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <UserPlus
              size={20}
              color="#2563eb"
            />
          </div>
        );

      // -----------------------------------------------------
      // ASSESSMENT COMPLETED
      // -----------------------------------------------------

      case "ASSESSMENT_COMPLETED":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ClipboardCheck
              size={20}
              color="#16a34a"
            />
          </div>
        );

      // -----------------------------------------------------
      // KNOWLEDGE GAP DETECTED
      // -----------------------------------------------------

      case "KNOWLEDGE_GAP_DETECTED":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle
              size={20}
              color="#ca8a04"
            />
          </div>
        );

      // -----------------------------------------------------
      // HIGH RISK SKILL GAP
      // -----------------------------------------------------

      case "HIGH_RISK_SKILL_GAP":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle
              size={20}
              color="#dc2626"
            />
          </div>
        );

      // -----------------------------------------------------
      // TRAINING COMPLETED
      // -----------------------------------------------------

      case "TRAINING_COMPLETED":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#f3e8ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <GraduationCap
              size={20}
              color="#9333ea"
            />
          </div>
        );

      // -----------------------------------------------------
      // MENTOR ALLOCATED
      // -----------------------------------------------------

      case "MENTOR_ALLOCATED":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#e0e7ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <UserCheck
              size={20}
              color="#4f46e5"
            />
          </div>
        );

      // -----------------------------------------------------
      // SKILL IMPROVED
      // -----------------------------------------------------

      case "SKILL_IMPROVED":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#d1fae5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TrendingUp
              size={20}
              color="#059669"
            />
          </div>
        );

      // -----------------------------------------------------
      // ASSESSMENT OVERDUE
      // -----------------------------------------------------

      case "ASSESSMENT_OVERDUE":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#ffedd5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileWarning
              size={20}
              color="#ea580c"
            />
          </div>
        );

      // -----------------------------------------------------
      // DEFAULT
      // -----------------------------------------------------

      default:
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#eef2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Bell
              size={20}
              color="#4f46e5"
            />
          </div>
        );
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#f8fafc",
        }}
      >
        <Sidebar role="DEPARTMENT HEAD" />

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Navbar />

          <main
            style={{
              padding: "28px 32px",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                minHeight: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <RefreshCw
                size={30}
                color="#4f46e5"
                style={{
                  animation:
                    "spin 1s linear infinite",
                }}
              />

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                Loading notifications...
              </p>
            </div>
          </main>
        </div>

        <style>
          {`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      {/* SIDEBAR */}
      <Sidebar role="DEPARTMENT HEAD" />

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* NAVBAR */}
        <Navbar />

        <main
          style={{
            padding: "28px 32px",
          }}
        >
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "28px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "#eef2ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bell
                    size={23}
                    color="#4f46e5"
                  />
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  Notifications
                </h1>
              </div>

              <p
                style={{
                  margin: "8px 0 0 56px",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Stay updated with important
                department notifications.
              </p>
            </div>

            {/* REFRESH */}
            <button
              onClick={getNotifications}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#374151",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              <RefreshCw
                size={16}
                style={{
                  animation: loading
                    ? "spin 1s linear infinite"
                    : "none",
                }}
              />

              Refresh
            </button>
          </div>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          {!error && (
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              {/* TOTAL */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "18px 22px",
                  minWidth: "150px",
                }}
              >
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "13px",
                    marginBottom: "6px",
                  }}
                >
                  Total Notifications
                </div>

                <div
                  style={{
                    color: "#111827",
                    fontSize: "25px",
                    fontWeight: 700,
                  }}
                >
                  {notifications.length}
                </div>
              </div>

              {/* UNREAD */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "18px 22px",
                  minWidth: "150px",
                }}
              >
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "13px",
                    marginBottom: "6px",
                  }}
                >
                  Unread
                </div>

                <div
                  style={{
                    color: "#4f46e5",
                    fontSize: "25px",
                    fontWeight: 700,
                  }}
                >
                  {unreadCount}
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "12px",
                padding: "18px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#b91c1c",
                marginBottom: "20px",
              }}
            >
              <AlertCircle size={20} />

              <div
                style={{
                  flex: 1,
                }}
              >
                {error}
              </div>

              <button
                onClick={getNotifications}
                style={{
                  border: "1px solid #fca5a5",
                  background: "#ffffff",
                  color: "#b91c1c",
                  borderRadius: "7px",
                  padding: "7px 12px",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!error &&
            notifications.length === 0 && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  minHeight: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bell
                    size={28}
                    color="#9ca3af"
                  />
                </div>

                <h3
                  style={{
                    margin: 0,
                    color: "#374151",
                    fontSize: "17px",
                  }}
                >
                  No notifications
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: "#9ca3af",
                    fontSize: "14px",
                  }}
                >
                  You don't have any notifications yet.
                </p>
              </div>
            )}

          {/* =================================================
              NOTIFICATION LIST
          ================================================= */}

          {!error &&
            notifications.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {notifications.map(
                  (notification) => {
                    const isUnread =
                      notification.readStatus === false;

                    return (
                      <div
                        key={notification.id}
                        style={{
                          background: "#ffffff",
                          border: isUnread
                            ? "1px solid #c7d2fe"
                            : "1px solid #e5e7eb",
                          borderRadius: "12px",
                          padding: "20px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "16px",
                          boxShadow: isUnread
                            ? "0 2px 8px rgba(79,70,229,0.08)"
                            : "none",
                        }}
                      >
                        {/* ICON */}
                        {getNotificationIcon(
                          notification.type
                        )}

                        {/* CONTENT */}
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          {/* TITLE */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "7px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#111827",
                              }}
                            >
                              {getNotificationTitle(
                                notification.type
                              )}
                            </span>

                            {isUnread && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  color: "#4338ca",
                                  background: "#e0e7ff",
                                  padding:
                                    "3px 8px",
                                  borderRadius: "20px",
                                }}
                              >
                                NEW
                              </span>
                            )}
                          </div>

                          {/* TYPE */}
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6366f1",
                              marginBottom: "7px",
                            }}
                          >
                            {notification.type ||
                              "NOTIFICATION"}
                          </div>

                          {/* MESSAGE */}
                          <p
                            style={{
                              margin: 0,
                              color: "#1f2937",
                              fontSize: "15px",
                              lineHeight: 1.5,
                              fontWeight: isUnread
                                ? 500
                                : 400,
                            }}
                          >
                            {notification.message}
                          </p>

                          {/* DATE */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginTop: "10px",
                              color: "#9ca3af",
                              fontSize: "12px",
                            }}
                          >
                            <Clock size={14} />

                            {formatDate(
                              notification.createdDate
                            )}
                          </div>
                        </div>

                        {/* MARK AS READ */}
                        {isUnread && (
                          <button
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                            disabled={
                              markingId ===
                              notification.id
                            }
                            title="Mark as read"
                            style={{
                              flexShrink: 0,
                              width: "38px",
                              height: "38px",
                              borderRadius: "8px",
                              border:
                                "1px solid #d1d5db",
                              background: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent:
                                "center",
                              cursor:
                                markingId ===
                                notification.id
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            {markingId ===
                            notification.id ? (
                              <RefreshCw
                                size={17}
                                color="#6b7280"
                                style={{
                                  animation:
                                    "spin 1s linear infinite",
                                }}
                              />
                            ) : (
                              <Check
                                size={17}
                                color="#16a34a"
                              />
                            )}
                          </button>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
        </main>
      </div>

      {/* ANIMATION */}
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

export default DepartmentNotifications;