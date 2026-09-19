import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Clock,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import adminService, {
  AdminNotification,
} from "@/services/adminService";

const NotificationSettings: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "READ" | "UNREAD">("ALL");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await adminService.getAdminNotifications();
      setNotifications(data);
    } catch (err: any) {
      console.error("Failed to load admin notifications:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "READ" && notification.read) ||
        (filter === "UNREAD" && !notification.read);

      const matchesSearch =
        !query ||
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query) ||
        notification.type.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [notifications, search, filter]);

  const totalCount = notifications.length;

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const readCount = notifications.filter(
    (notification) => notification.read
  ).length;

  const formatDate = (value: string) => {
    if (!value) return "Unknown";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getTypeLabel = (type: string) => {
    if (!type) return "GENERAL";

    return type.replaceAll("_", " ");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
              <Bell className="h-6 w-6 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Notification Board
              </h1>

              <p className="text-sm text-slate-500">
                Monitor notifications generated across OKGIP.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadNotifications}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Notifications
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {totalCount}
              </p>
            </div>

            <Bell className="h-7 w-7 text-indigo-500" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Unread
              </p>

              <p className="mt-1 text-2xl font-bold text-amber-600">
                {unreadCount}
              </p>
            </div>

            <XCircle className="h-7 w-7 text-amber-500" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Read
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {readCount}
              </p>
            </div>

            <CheckCheck className="h-7 w-7 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notifications..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex gap-2">
            {(["ALL", "UNREAD", "READ"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filter === item
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-indigo-600" />

          <p className="mt-3 text-sm text-slate-500">
            Loading notifications...
          </p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Bell className="mx-auto h-10 w-10 text-slate-300" />

          <h3 className="mt-4 text-lg font-semibold text-slate-700">
            No notifications found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            There are no notifications matching the current filter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Notification
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Type
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredNotifications.map((notification) => (
                  <tr
                    key={notification.notificationId}
                    className={`transition hover:bg-slate-50 ${
                      !notification.read ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex gap-3">
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                          <Bell className="h-4 w-4 text-indigo-600" />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {notification.title}
                          </p>

                          <p className="mt-1 max-w-xl text-sm text-slate-600">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {getTypeLabel(notification.type)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {notification.read ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <CheckCheck className="h-3.5 w-3.5" />
                          Read
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          <Clock className="h-3.5 w-3.5" />
                          Unread
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                      {formatDate(notification.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-500">
            Showing {filteredNotifications.length} of{" "}
            {notifications.length} notifications
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;