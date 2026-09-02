import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell,
  Check,
  Clock,
  RefreshCw,
  AlertCircle
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const API_BASE_URL = "http://localhost:8080/api";

function DepartmentNotifications() {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState(null);

  const token = localStorage.getItem("token");

  const getNotifications = async () => {

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {

      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/notifications/department-head`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
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
      } else {
        setError(
          "Unable to load notifications."
        );
      }

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    getNotifications();

  }, []);

  const markAsRead = async (notificationId) => {

    if (!token || !notificationId) {
      return;
    }

    try {

      setMarkingId(notificationId);

      await axios.put(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                readStatus: true
              }
            : notification
        )
      );

    } catch (err) {

      console.error(
        "Error marking notification as read:",
        err
      );

    } finally {

      setMarkingId(null);
    }
  };

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.readStatus === false
    ).length;

  const formatDate = (dateValue) => {

    if (!dateValue) {
      return "Unknown date";
    }

    try {

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return dateValue;
      }

      return date.toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }
      );

    } catch {

      return dateValue;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc"
      }}
    >

      {/* SIDEBAR */}
      <Sidebar role="DEPARTMENT HEAD" />

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          minWidth: 0
        }}
      >

        {/* NAVBAR */}
        <Navbar />

        <main
          style={{
            padding: "28px 32px"
          }}
        >

          {/* PAGE HEADER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "28px"
            }}
          >

            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
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
                    justifyContent: "center"
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
                    color: "#111827"
                  }}
                >
                  Notifications
                </h1>

              </div>

              <p
                style={{
                  margin: "8px 0 0 56px",
                  color: "#6b7280",
                  fontSize: "14px"
                }}
              >
                Stay updated with important department
                notifications.
              </p>
            </div>

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
                fontWeight: 500
              }}
            >
              <RefreshCw
                size={16}
                style={{
                  animation: loading
                    ? "spin 1s linear infinite"
                    : "none"
                }}
              />

              Refresh
            </button>

          </div>

          {/* SUMMARY */}
          {!loading && !error && (
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "24px"
              }}
            >

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "18px 22px",
                  minWidth: "150px"
                }}
              >

                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "13px",
                    marginBottom: "6px"
                  }}
                >
                  Total
                </div>

                <div
                  style={{
                    color: "#111827",
                    fontSize: "25px",
                    fontWeight: 700
                  }}
                >
                  {notifications.length}
                </div>

              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "18px 22px",
                  minWidth: "150px"
                }}
              >

                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "13px",
                    marginBottom: "6px"
                  }}
                >
                  Unread
                </div>

                <div
                  style={{
                    color: "#4f46e5",
                    fontSize: "25px",
                    fontWeight: 700
                  }}
                >
                  {unreadCount}
                </div>

              </div>

            </div>
          )}

          {/* ERROR */}
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
                marginBottom: "20px"
              }}
            >

              <AlertCircle size={20} />

              <div style={{ flex: 1 }}>
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
                  cursor: "pointer"
                }}
              >
                Retry
              </button>

            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                minHeight: "260px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "12px"
              }}
            >

              <RefreshCw
                size={28}
                color="#4f46e5"
                style={{
                  animation:
                    "spin 1s linear infinite"
                }}
              />

              <p
                style={{
                  margin: 0,
                  color: "#6b7280"
                }}
              >
                Loading notifications...
              </p>

            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
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
                  gap: "12px"
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
                    justifyContent: "center"
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
                    fontSize: "17px"
                  }}
                >
                  No notifications
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: "#9ca3af",
                    fontSize: "14px"
                  }}
                >
                  You don't have any notifications yet.
                </p>

              </div>
            )}

          {/* NOTIFICATION LIST */}
          {!loading &&
            !error &&
            notifications.length > 0 && (

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
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
                            : "none"
                        }}
                      >

                        {/* ICON */}
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            flexShrink: 0,
                            borderRadius: "10px",
                            background: isUnread
                              ? "#eef2ff"
                              : "#f3f4f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Bell
                            size={20}
                            color={
                              isUnread
                                ? "#4f46e5"
                                : "#9ca3af"
                            }
                          />
                        </div>

                        {/* CONTENT */}
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "7px"
                            }}
                          >

                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#4f46e5"
                              }}
                            >
                              {notification.type ||
                                "Notification"}
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
                                  borderRadius: "20px"
                                }}
                              >
                                NEW
                              </span>
                            )}

                          </div>

                          <p
                            style={{
                              margin: 0,
                              color: "#1f2937",
                              fontSize: "15px",
                              lineHeight: 1.5,
                              fontWeight: isUnread
                                ? 500
                                : 400
                            }}
                          >
                            {notification.message}
                          </p>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginTop: "10px",
                              color: "#9ca3af",
                              fontSize: "12px"
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
                              background:
                                "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent:
                                "center",
                              cursor:
                                markingId ===
                                notification.id
                                  ? "not-allowed"
                                  : "pointer"
                            }}
                          >

                            {markingId ===
                            notification.id ? (
                              <RefreshCw
                                size={17}
                                color="#6b7280"
                                style={{
                                  animation:
                                    "spin 1s linear infinite"
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