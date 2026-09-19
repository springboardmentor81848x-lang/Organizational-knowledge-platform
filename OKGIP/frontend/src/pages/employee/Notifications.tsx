import React, { useEffect, useState } from "react";
import EmployeePage, {
  Card,
} from "@/components/layout/EmployeePage";
import notificationService, {
  NotificationResponse,
} from "@/services/notificationService";

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<
    NotificationResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await notificationService.getMyNotifications();

      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notificationId === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);

      await notificationService.markAllAsRead();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date;
    }
  };

  return (
    <EmployeePage
      title="Notifications"
      subtitle="Review important platform and learning updates."
    >
      <Card title="Notifications">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount > 1 ? "s" : ""
                  }`
                : "All notifications are read"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {markingAll ? "Marking..." : "Mark all as read"}
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-10 text-center text-sm text-slate-500">
            Loading notifications...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && notifications.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No notifications
            </p>

            <p className="mt-1 text-xs text-slate-500">
              You don't have any notifications yet.
            </p>
          </div>
        )}

        {/* Notifications */}
        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.notificationId}
                className={`rounded-xl border p-4 transition ${
                  notification.read
                    ? "border-slate-200 bg-white"
                    : "border-blue-200 bg-blue-50/40"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}

                      <h3 className="text-sm font-semibold text-slate-800">
                        {notification.title}
                      </h3>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {notification.message}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                        {notification.type}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>

                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() =>
                        handleMarkAsRead(notification.notificationId)
                      }
                      className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </EmployeePage>
  );
};

export default Notifications;