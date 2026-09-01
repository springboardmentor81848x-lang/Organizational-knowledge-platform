import React, { useEffect, useState } from "react";

import {
  Bell,
  CheckCircle,
  AlertTriangle,
  GraduationCap,
  BarChart3,
  Users,
  XCircle,
  Info,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import axios from "axios";


// ==================================================
// DEPARTMENT NOTIFICATIONS
// ==================================================

function DepartmentNotifications() {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==================================================
  // GET DEPARTMENT HEAD IDENTIFIER
  // ==================================================

  const getEmployeeIdentifier = () => {

    return (
      localStorage.getItem("employeeId") ||
      localStorage.getItem("userId") ||
      ""
    );
  };


  // ==================================================
  // LOAD NOTIFICATIONS
  // ==================================================

  const loadNotifications = async () => {

    try {

      setLoading(true);
      setError("");

      const employeeIdentifier =
        getEmployeeIdentifier();

      if (!employeeIdentifier) {

        setError(
          "Department Head information not found."
        );

        setLoading(false);

        return;
      }


      const token =
        localStorage.getItem("token");


      const response = await axios.get(
        `http://localhost:8080/api/notifications/employee/${employeeIdentifier}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Error loading department notifications:",
        err
      );

      setError(
        "Unable to load notifications."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // LOAD ON PAGE OPEN
  // ==================================================

  useEffect(() => {

    loadNotifications();

  }, []);


  // ==================================================
  // MARK AS READ
  // ==================================================

  const markAsRead = async (notificationId) => {

    try {

      const token =
        localStorage.getItem("token");

      await axios.put(
        `http://localhost:8080/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
        "Error marking notification as read:",
        err
      );

    }
  };


  // ==================================================
  // MARK ALL AS READ
  // ==================================================

  const markAllAsRead = async () => {

    const unreadNotifications =
      notifications.filter(
        (notification) =>
          !notification.readStatus
      );


    for (const notification of unreadNotifications) {

      await markAsRead(notification.id);

    }
  };


  // ==================================================
  // NOTIFICATION ICON
  // ==================================================

  const getNotificationIcon = (type) => {

    const normalizedType =
      String(type || "").toUpperCase();


    if (
      normalizedType.includes("SKILL") ||
      normalizedType.includes("GAP")
    ) {
      return (
        <BarChart3
          size={22}
          className="text-orange-500"
        />
      );
    }


    if (
      normalizedType.includes("TRAINING") ||
      normalizedType.includes("COURSE")
    ) {
      return (
        <GraduationCap
          size={22}
          className="text-blue-500"
        />
      );
    }


    if (
      normalizedType.includes("EMPLOYEE") ||
      normalizedType.includes("TEAM")
    ) {
      return (
        <Users
          size={22}
          className="text-purple-500"
        />
      );
    }


    if (
      normalizedType.includes("WARNING") ||
      normalizedType.includes("ALERT")
    ) {
      return (
        <AlertTriangle
          size={22}
          className="text-yellow-500"
        />
      );
    }


    if (
      normalizedType.includes("SUCCESS") ||
      normalizedType.includes("COMPLETED")
    ) {
      return (
        <CheckCircle
          size={22}
          className="text-green-500"
        />
      );
    }


    if (
      normalizedType.includes("ERROR") ||
      normalizedType.includes("FAILED")
    ) {
      return (
        <XCircle
          size={22}
          className="text-red-500"
        />
      );
    }


    return (
      <Info
        size={22}
        className="text-indigo-500"
      />
    );
  };


  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (date) => {

    if (!date) {
      return "";
    }

    try {

      return new Date(date).toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );

    } catch {

      return date;

    }
  };


  // ==================================================
  // COUNTS
  // ==================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.readStatus
    ).length;


  // ==================================================
  // UI
  // ==================================================

  return (

    <div className="min-h-screen bg-slate-50 flex">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <Sidebar role="DEPARTMENT HEAD" />


      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div className="flex-1 flex flex-col min-w-0">

        <Navbar />


        <main className="p-6 lg:p-8">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

            <div>

              <div className="flex items-center gap-3">

                <div className="p-3 bg-indigo-100 rounded-xl">

                  <Bell
                    size={26}
                    className="text-indigo-600"
                  />

                </div>

                <div>

                  <h1 className="text-3xl font-bold text-slate-800">
                    Department Notifications
                  </h1>

                  <p className="text-slate-500 mt-1">
                    Stay updated with department activities,
                    employee progress, training and skill gaps.
                  </p>

                </div>

              </div>

            </div>


            {/* ==================================================
                MARK ALL READ
            ================================================== */}

            {unreadCount > 0 && (

              <button
                onClick={markAllAsRead}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Mark All as Read
              </button>

            )}

          </div>


          {/* ==================================================
              SUMMARY
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Total Notifications
                  </p>

                  <p className="text-3xl font-bold text-slate-800 mt-1">
                    {notifications.length}
                  </p>

                </div>

                <div className="p-3 bg-indigo-100 rounded-xl">

                  <Bell
                    size={24}
                    className="text-indigo-600"
                  />

                </div>

              </div>

            </div>


            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Unread Notifications
                  </p>

                  <p className="text-3xl font-bold text-orange-600 mt-1">
                    {unreadCount}
                  </p>

                </div>

                <div className="p-3 bg-orange-100 rounded-xl">

                  <AlertTriangle
                    size={24}
                    className="text-orange-600"
                  />

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (

            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">

              <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>

              <p className="text-slate-500">
                Loading department notifications...
              </p>

            </div>

          )}


          {/* ==================================================
              ERROR
          ================================================== */}

          {!loading && error && (

            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">

              {error}

            </div>

          )}


          {/* ==================================================
              EMPTY
          ================================================== */}

          {!loading &&
            !error &&
            notifications.length === 0 && (

              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">

                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">

                  <Bell
                    size={30}
                    className="text-slate-400"
                  />

                </div>

                <h2 className="text-xl font-semibold text-slate-700">
                  No Notifications
                </h2>

                <p className="text-slate-500 mt-2">
                  There are currently no department notifications.
                </p>

              </div>

            )}


          {/* ==================================================
              NOTIFICATION LIST
          ================================================== */}

          {!loading &&
            !error &&
            notifications.length > 0 && (

              <div className="space-y-4">

                {notifications.map(
                  (notification) => (

                    <div
                      key={notification.id}
                      className={`bg-white border rounded-xl p-5 transition hover:shadow-md ${
                        notification.readStatus
                          ? "border-slate-200"
                          : "border-indigo-300 bg-indigo-50/40"
                      }`}
                    >

                      <div className="flex gap-4">

                        {/* ICON */}

                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">

                          {getNotificationIcon(
                            notification.type
                          )}

                        </div>


                        {/* CONTENT */}

                        <div className="flex-1 min-w-0">

                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                            <div>

                              <h3 className="font-semibold text-slate-800">

                                {notification.type ||
                                  "Department Notification"}

                              </h3>

                              <p className="text-slate-600 mt-1 leading-relaxed">

                                {notification.message ||
                                  "No message available."}

                              </p>

                            </div>


                            {/* UNREAD */}

                            {!notification.readStatus && (

                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full whitespace-nowrap">

                                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>

                                Unread

                              </span>

                            )}

                          </div>


                          {/* DATE + ACTION */}

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">

                            <span className="text-sm text-slate-400">

                              {formatDate(
                                notification.createdDate
                              )}

                            </span>


                            {!notification.readStatus && (

                              <button
                                onClick={() =>
                                  markAsRead(
                                    notification.id
                                  )
                                }
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                              >

                                <CheckCircle
                                  size={16}
                                />

                                Mark as read

                              </button>

                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

        </main>

      </div>

    </div>

  );
}

export default DepartmentNotifications;