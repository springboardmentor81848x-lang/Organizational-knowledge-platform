import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

import {
  Bell,
  BookOpen,
  CheckCheck,
  UserRound,
  AlertTriangle,
  Filter,
} from "lucide-react";

function ManagerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const employeeId =
    localStorage.getItem("employeeId");

  const token =
    localStorage.getItem("token");

  const getHeaders = () => ({
    headers: {
      Authorization: token
        ? `Bearer ${token}`
        : "",
    },
  });

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      if (!employeeId) {
        throw new Error(
          "Employee ID not found."
        );
      }

      if (!token) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      const response = await api.get(
        `/notifications/employee/${employeeId}`,
        getHeaders()
      );

      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Error loading manager notifications:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to access notifications."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data ||
            err.message ||
            "Unable to load notifications."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [employeeId, token]);

  // =========================================================
  // FILTER NOTIFICATIONS
  // =========================================================

  const filteredNotifications = useMemo(() => {
    if (filter === "ALL") {
      return notifications;
    }

    if (filter === "UNREAD") {
      return notifications.filter(
        (notification) =>
          !notification.readStatus
      );
    }

    if (filter === "READ") {
      return notifications.filter(
        (notification) =>
          notification.readStatus
      );
    }

    return notifications.filter(
      (notification) =>
        (
          notification.category ||
          notification.type ||
          ""
        )
          .toUpperCase()
          .includes(filter)
    );
  }, [notifications, filter]);

  // =========================================================
  // SUMMARY VALUES
  // =========================================================

  const unreadCount = notifications.filter(
    (notification) =>
      !notification.readStatus
  ).length;

  const skillAlerts = notifications.filter(
    (notification) =>
      (
        notification.category ||
        notification.type ||
        ""
      )
        .toLowerCase()
        .includes("skill")
  ).length;

  const trainingAlerts = notifications.filter(
    (notification) =>
      (
        notification.category ||
        notification.type ||
        ""
      )
        .toLowerCase()
        .includes("training")
  ).length;

  // =========================================================
  // MARK SINGLE NOTIFICATION AS READ
  // =========================================================

  const markAsRead = async (id) => {
    try {
      await api.put(
        `/notifications/${id}/read`,
        null,
        getHeaders()
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
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
    }
  };

  // =========================================================
  // MARK ALL NOTIFICATIONS AS READ
  // =========================================================

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(
          (notification) =>
            !notification.readStatus
        )
        .map(
          (notification) =>
            notification.id
        );

      for (const id of unreadIds) {
        await api.put(
          `/notifications/${id}/read`,
          null,
          getHeaders()
        );
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          readStatus: true,
        }))
      );
    } catch (err) {
      console.error(
        "Error marking all notifications as read:",
        err
      );
    }
  };

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">

        <Sidebar role="MANAGER" />

        <div className="flex-1 min-w-0">

          <Navbar title="Notifications" />

          <main className="p-6">

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-slate-700" />

              <p className="mt-4 text-slate-500">
                Loading notifications...
              </p>

            </div>

          </main>

        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR STATE
  // =========================================================

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50">

        <Sidebar role="MANAGER" />

        <div className="flex-1 min-w-0">

          <Navbar title="Notifications" />

          <main className="p-6">

            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">

              <h2 className="text-xl font-bold">
                Unable to load Notifications
              </h2>

              <p className="mt-2">
                {error}
              </p>

              <button
                onClick={loadNotifications}
                className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
              >
                Try Again
              </button>

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

      <Sidebar role="MANAGER" />

      <div className="flex-1 min-w-0">

        <Navbar title="Notifications" />

        <main className="space-y-6 p-6">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div>

            <h1 className="text-3xl font-bold text-slate-800">
              Notifications
            </h1>

            <p className="mt-1 text-slate-500">
              Stay updated on your team’s training,
              skill gaps, assessments and learning
              progress.
            </p>

          </div>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <SummaryCard
              icon={
                <Bell
                  className="text-blue-600"
                  size={18}
                />
              }
              label="Total Notifications"
              value={notifications.length}
              helper="All alerts"
            />

            <SummaryCard
              icon={
                <Filter
                  className="text-amber-600"
                  size={18}
                />
              }
              label="Unread"
              value={unreadCount}
              helper="Requires action"
            />

            <SummaryCard
              icon={
                <AlertTriangle
                  className="text-red-600"
                  size={18}
                />
              }
              label="Skill Gap Alerts"
              value={skillAlerts}
              helper="Risk alerts"
            />

            <SummaryCard
              icon={
                <BookOpen
                  className="text-emerald-600"
                  size={18}
                />
              }
              label="Training Alerts"
              value={trainingAlerts}
              helper="Learning updates"
            />

          </div>

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              {/* FILTER BUTTONS */}

              <div className="flex flex-wrap gap-2">

                {[
                  "ALL",
                  "UNREAD",
                  "READ",
                  "SKILL",
                  "TRAINING",
                  "ASSESSMENT",
                  "EMPLOYEE PROGRESS",
                  "MENTORSHIP",
                ].map((value) => (
                  <button
                    key={value}
                    onClick={() =>
                      setFilter(value)
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      filter === value
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {value}
                  </button>
                ))}

              </div>

              {/* MARK ALL AS READ */}

              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>

            </div>

            {/* EMPTY STATE */}

            {filteredNotifications.length === 0 ? (

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">

                No notifications available for
                the selected filter.

              </div>

            ) : (

              <div className="space-y-3">

                {filteredNotifications.map(
                  (notification) => (

                    <div
                      key={notification.id}
                      className={`rounded-xl border p-4 ${
                        notification.readStatus
                          ? "border-slate-200 bg-white"
                          : "border-blue-200 bg-blue-50"
                      }`}
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-start gap-3">

                          {/* ICON */}

                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              notification.readStatus
                                ? "bg-slate-100 text-slate-600"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {getNotificationIcon(
                              notification
                            )}
                          </div>

                          {/* CONTENT */}

                          <div>

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {(
                                notification.category ||
                                notification.type ||
                                "General"
                              ).replace(
                                /\_/g,
                                " "
                              )}
                            </p>

                            <h3 className="mt-1 text-base font-semibold text-slate-800">
                              {notification.title ||
                                "Team notification"}
                            </h3>

                            <p className="mt-1 text-sm text-slate-600">
                              {notification.message ||
                                notification.description ||
                                "No message available."}
                            </p>

                            <p className="mt-2 text-xs text-slate-400">
                              {formatDate(
                                notification.createdAt ||
                                  notification.createdDate
                              )}
                            </p>

                          </div>

                        </div>

                        {/* MARK AS READ */}

                        <div className="flex items-center gap-2">

                          {!notification.readStatus && (
                            <button
                              onClick={() =>
                                markAsRead(
                                  notification.id
                                )
                              }
                              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                            >
                              Mark read
                            </button>
                          )}

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  );
}

// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  icon,
  label,
  value,
  helper,
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

      <div className="flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
          {icon}
        </div>

        <div>

          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="text-2xl font-bold text-slate-800">
            {value}
          </p>

          <p className="text-xs text-slate-400">
            {helper}
          </p>

        </div>

      </div>

    </div>
  );
}

// =========================================================
// NOTIFICATION ICON
// =========================================================

function getNotificationIcon(notification) {
  const type = (
    notification.category ||
    notification.type ||
    ""
  ).toLowerCase();

  if (type.includes("skill")) {
    return <AlertTriangle size={18} />;
  }

  if (type.includes("training")) {
    return <BookOpen size={18} />;
  }

  if (type.includes("assessment")) {
    return <UserRound size={18} />;
  }

  return <Bell size={18} />;
}

// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(date) {
  if (!date) {
    return "Recently";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default ManagerNotifications;